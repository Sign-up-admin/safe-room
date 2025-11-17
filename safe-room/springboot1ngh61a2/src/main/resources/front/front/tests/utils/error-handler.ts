/**
 * 错误处理和重试机制工具
 * 提供智能的错误处理、重试策略和恢复机制
 */

import { Page, Locator } from '@playwright/test'

export interface RetryOptions {
  maxRetries?: number
  initialDelay?: number
  maxDelay?: number
  backoffMultiplier?: number
  retryCondition?: (error: Error) => boolean
  onRetry?: (attempt: number, error: Error) => void
}

export interface ErrorContext {
  testName: string
  action: string
  timestamp: Date
  error: Error
  screenshot?: string
  pageState?: any
}

/**
 * 智能重试装饰器
 */
export function withRetry(options: RetryOptions = {}) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function(...args: any[]) {
      const retryHandler = new RetryHandler(options)
      return await retryHandler.execute(async () => {
        return await method.apply(this, args)
      }, `${target.constructor.name}.${propertyName}`)
    }
  }
}

/**
 * 重试处理器类
 */
export class RetryHandler {
  private options: Required<RetryOptions>

  constructor(options: RetryOptions = {}) {
    this.options = {
      maxRetries: options.maxRetries ?? 3,
      initialDelay: options.initialDelay ?? 1000,
      maxDelay: options.maxDelay ?? 10000,
      backoffMultiplier: options.backoffMultiplier ?? 2,
      retryCondition: options.retryCondition ?? this.defaultRetryCondition,
      onRetry: options.onRetry ?? this.defaultOnRetry
    }
  }

  /**
   * 执行带重试的函数
   */
  async execute<T>(fn: () => Promise<T>, operationName: string = 'operation'): Promise<T> {
    let lastError: Error

    for (let attempt = 0; attempt <= this.options.maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error

        if (attempt === this.options.maxRetries) {
          break // 最后一次尝试失败，跳出循环
        }

        // 检查是否应该重试
        if (!this.options.retryCondition(lastError)) {
          break
        }

        // 调用重试回调
        this.options.onRetry(attempt + 1, lastError)

        // 计算延迟时间
        const delay = Math.min(
          this.options.initialDelay * Math.pow(this.options.backoffMultiplier, attempt),
          this.options.maxDelay
        )

        // 等待延迟
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw new Error(`${operationName} failed after ${this.options.maxRetries + 1} attempts: ${lastError.message}`)
  }

  /**
   * 默认重试条件
   */
  private defaultRetryCondition(error: Error): boolean {
    const retryableErrors = [
      'net::ERR_NETWORK_CHANGED',
      'net::ERR_CONNECTION_REFUSED',
      'net::ERR_CONNECTION_RESET',
      'TimeoutError',
      'Element is not attached to the DOM',
      'Element is not visible',
      'Element is not stable',
      'Target closed',
      'Navigation timeout'
    ]

    return retryableErrors.some(retryableError =>
      error.message.includes(retryableError)
    )
  }

  /**
   * 默认重试回调
   */
  private defaultOnRetry(attempt: number, error: Error): void {
    console.warn(`重试第 ${attempt} 次，错误: ${error.message}`)
  }
}

/**
 * 页面操作错误处理器
 */
export class PageErrorHandler {
  private page: Page
  private errorContext: ErrorContext[] = []
  private retryHandler: RetryHandler

  constructor(page: Page, retryOptions: RetryOptions = {}) {
    this.page = page
    this.retryHandler = new RetryHandler(retryOptions)

    // 监听页面错误
    this.setupPageErrorListeners()
  }

  /**
   * 带重试的点击操作
   */
  async clickWithRetry(
    selector: string | Locator,
    options: { timeout?: number } = {}
  ): Promise<void> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector

    await this.retryHandler.execute(async () => {
      await locator.click({
        timeout: options.timeout ?? 10000
      })
    }, 'click')
  }

  /**
   * 带重试的填写操作
   */
  async fillWithRetry(
    selector: string | Locator,
    value: string,
    options: { timeout?: number } = {}
  ): Promise<void> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector

    await this.retryHandler.execute(async () => {
      await locator.clear()
      await locator.fill(value, {
        timeout: options.timeout ?? 10000
      })
    }, 'fill')
  }

  /**
   * 带重试的等待元素操作
   */
  async waitForElementWithRetry(
    selector: string | Locator,
    options: { state?: 'visible' | 'hidden' | 'attached' | 'detached', timeout?: number } = {}
  ): Promise<void> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector

    await this.retryHandler.execute(async () => {
      await locator.waitFor({
        state: options.state ?? 'visible',
        timeout: options.timeout ?? 10000
      })
    }, 'waitForElement')
  }

  /**
   * 带重试的导航操作
   */
  async gotoWithRetry(url: string, options: { timeout?: number } = {}): Promise<void> {
    await this.retryHandler.execute(async () => {
      await this.page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: options.timeout ?? 30000
      })
    }, 'goto')
  }

  /**
   * 带重试的表单提交
   */
  async submitFormWithRetry(
    formSelector: string,
    data: Record<string, string>,
    options: { timeout?: number } = {}
  ): Promise<void> {
    await this.retryHandler.execute(async () => {
      // 填写表单字段
      for (const [field, value] of Object.entries(data)) {
        const fieldLocator = this.page.locator(`${formSelector} [name="${field}"], ${formSelector} input[placeholder*="${field}"]`).first()
        await fieldLocator.clear()
        await fieldLocator.fill(value)
      }

      // 提交表单
      const submitButton = this.page.locator(`${formSelector} button[type="submit"], ${formSelector} button:has-text("提交")`).first()
      await submitButton.click()

      // 等待提交完成
      await this.page.waitForLoadState('networkidle', { timeout: options.timeout ?? 10000 })
    }, 'submitForm')
  }

  /**
   * 智能等待页面加载完成
   */
  async waitForPageLoadWithRetry(options: {
    timeout?: number
    expectedText?: string
    expectedSelector?: string
  } = {}): Promise<void> {
    const { timeout = 30000, expectedText, expectedSelector } = options

    await this.retryHandler.execute(async () => {
      // 等待页面基本加载
      await this.page.waitForLoadState('domcontentloaded', { timeout })

      // 等待网络空闲
      await this.page.waitForLoadState('networkidle', { timeout: timeout / 2 })

      // 如果指定了期望文本，等待文本出现
      if (expectedText) {
        await this.page.waitForSelector(`text=${expectedText}`, { timeout: timeout / 2 })
      }

      // 如果指定了期望选择器，等待元素出现
      if (expectedSelector) {
        await this.page.waitForSelector(expectedSelector, { timeout: timeout / 2 })
      }

      // 额外等待以确保动态内容加载完成
      await this.page.waitForTimeout(500)
    }, 'waitForPageLoad')
  }

  /**
   * 处理和记录错误
   */
  async handleError(error: Error, context: Omit<ErrorContext, 'timestamp' | 'error'>): Promise<void> {
    const errorContext: ErrorContext = {
      ...context,
      timestamp: new Date(),
      error
    }

    // 截图
    try {
      const screenshotPath = `test-results/screenshots/error_${Date.now()}.png`
      await this.page.screenshot({ path: screenshotPath, fullPage: true })
      errorContext.screenshot = screenshotPath
    } catch (screenshotError) {
      console.warn('无法截取错误截图:', screenshotError)
    }

    // 记录页面状态
    try {
      errorContext.pageState = {
        url: this.page.url(),
        title: await this.page.title(),
        viewport: this.page.viewportSize()
      }
    } catch (stateError) {
      console.warn('无法获取页面状态:', stateError)
    }

    // 存储错误上下文
    this.errorContext.push(errorContext)

    // 记录错误
    console.error(`测试错误 [${context.testName}]:`, {
      action: context.action,
      error: error.message,
      url: errorContext.pageState?.url,
      screenshot: errorContext.screenshot
    })
  }

  /**
   * 获取错误统计
   */
  getErrorStats(): {
    totalErrors: number
    errorsByAction: Record<string, number>
    recentErrors: ErrorContext[]
  } {
    const errorsByAction: Record<string, number> = {}
    const recentErrors = this.errorContext.slice(-10) // 最近10个错误

    for (const error of this.errorContext) {
      errorsByAction[error.action] = (errorsByAction[error.action] || 0) + 1
    }

    return {
      totalErrors: this.errorContext.length,
      errorsByAction,
      recentErrors
    }
  }

  /**
   * 清除错误记录
   */
  clearErrors(): void {
    this.errorContext = []
  }

  /**
   * 设置页面错误监听器
   */
  private setupPageErrorListeners(): void {
    // 监听页面错误
    this.page.on('pageerror', (error) => {
      console.warn('页面JavaScript错误:', error.message)
      this.handleError(error, {
        testName: 'page_error_listener',
        action: 'page_error'
      }).catch(err => console.error('处理页面错误失败:', err))
    })

    // 监听控制台错误
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.warn('控制台错误:', msg.text())
      }
    })

    // 监听请求失败
    this.page.on('requestfailed', (request) => {
      console.warn(`请求失败: ${request.url()} - ${request.failure()?.errorText}`)
    })
  }
}

/**
 * 网络错误恢复器
 */
export class NetworkErrorRecovery {
  private page: Page
  private recoveryStrategies: Map<string, () => Promise<void>> = new Map()

  constructor(page: Page) {
    this.page = page
    this.setupDefaultStrategies()
  }

  /**
   * 添加恢复策略
   */
  addRecoveryStrategy(errorType: string, strategy: () => Promise<void>): void {
    this.recoveryStrategies.set(errorType, strategy)
  }

  /**
   * 执行错误恢复
   */
  async recoverFromError(error: Error): Promise<boolean> {
    const errorType = this.classifyError(error)

    if (this.recoveryStrategies.has(errorType)) {
      try {
        console.log(`尝试恢复错误类型: ${errorType}`)
        await this.recoveryStrategies.get(errorType)!()
        return true
      } catch (recoveryError) {
        console.warn(`错误恢复失败: ${recoveryError}`)
        return false
      }
    }

    return false
  }

  /**
   * 分类错误类型
   */
  private classifyError(error: Error): string {
    const message = error.message.toLowerCase()

    if (message.includes('network') || message.includes('connection')) {
      return 'network'
    } else if (message.includes('timeout')) {
      return 'timeout'
    } else if (message.includes('element') && message.includes('not')) {
      return 'element_not_found'
    } else if (message.includes('navigation')) {
      return 'navigation'
    } else {
      return 'unknown'
    }
  }

  /**
   * 设置默认恢复策略
   */
  private setupDefaultStrategies(): void {
    // 网络错误恢复
    this.addRecoveryStrategy('network', async () => {
      // 等待网络恢复
      await this.page.waitForLoadState('networkidle', { timeout: 10000 })
    })

    // 超时错误恢复
    this.addRecoveryStrategy('timeout', async () => {
      // 增加超时时间并重试
      await this.page.waitForTimeout(2000)
    })

    // 元素未找到错误恢复
    this.addRecoveryStrategy('element_not_found', async () => {
      // 等待页面重新加载
      await this.page.reload({ waitUntil: 'domcontentloaded' })
      await this.page.waitForTimeout(1000)
    })

    // 导航错误恢复
    this.addRecoveryStrategy('navigation', async () => {
      // 刷新页面
      await this.page.reload({ waitUntil: 'domcontentloaded' })
    })
  }
}

/**
 * 测试稳定性增强器
 */
export class TestStabilityEnhancer {
  private page: Page
  private errorHandler: PageErrorHandler
  private networkRecovery: NetworkErrorRecovery

  constructor(page: Page) {
    this.page = page
    this.errorHandler = new PageErrorHandler(page)
    this.networkRecovery = new NetworkErrorRecovery(page)
  }

  /**
   * 执行稳定的页面操作
   */
  async executeStableAction<T>(
    action: () => Promise<T>,
    actionName: string,
    testName: string,
    options: {
      maxRetries?: number
      recoveryEnabled?: boolean
    } = {}
  ): Promise<T> {
    const { maxRetries = 2, recoveryEnabled = true } = options

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await action()
      } catch (error) {
        const err = error as Error

        // 记录错误
        await this.errorHandler.handleError(err, {
          testName,
          action: actionName
        })

        // 如果不是最后一次尝试，尝试恢复
        if (attempt < maxRetries && recoveryEnabled) {
          const recovered = await this.networkRecovery.recoverFromError(err)
          if (recovered) {
            console.log(`错误恢复成功，重试操作: ${actionName}`)
            continue
          }
        }

        // 无法恢复或最后一次尝试，抛出错误
        throw err
      }
    }

    throw new Error(`操作 ${actionName} 在 ${maxRetries + 1} 次尝试后仍然失败`)
  }

  /**
   * 获取稳定性统计
   */
  getStabilityStats() {
    return {
      errorStats: this.errorHandler.getErrorStats(),
      recoveryStrategies: Array.from(this.networkRecovery['recoveryStrategies'].keys())
    }
  }

  /**
   * 重置稳定性状态
   */
  reset(): void {
    this.errorHandler.clearErrors()
  }
}

/**
 * 便捷的重试装饰器
 */
export function retryOnFailure(options: RetryOptions = {}) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function(...args: any[]) {
      const retryHandler = new RetryHandler(options)
      return await retryHandler.execute(() => method.apply(this, args), propertyName)
    }
  }
}

/**
 * 创建页面错误处理器实例
 */
export function createPageErrorHandler(page: Page, options: RetryOptions = {}): PageErrorHandler {
  return new PageErrorHandler(page, options)
}

/**
 * 创建测试稳定性增强器实例
 */
export function createTestStabilityEnhancer(page: Page): TestStabilityEnhancer {
  return new TestStabilityEnhancer(page)
}
