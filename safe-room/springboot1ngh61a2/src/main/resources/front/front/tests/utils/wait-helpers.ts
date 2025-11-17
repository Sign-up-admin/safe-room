/**
 * 智能等待工具类
 *
 * 提供智能等待功能，替换硬编码的waitForTimeout，提高测试稳定性
 */

import { Page, Locator } from '@playwright/test'

export interface WaitOptions {
  timeout?: number
  interval?: number
  message?: string
  retries?: number
  retryDelay?: number
  exponentialBackoff?: boolean
}

export interface RetryConfig {
  maxRetries: number
  initialDelay: number
  maxDelay: number
  backoffMultiplier: number
  retryCondition?: (error: any) => boolean
}

/**
 * 等待元素稳定（位置和大小不再变化）
 */
export async function waitForElementStable(
  locator: Locator,
  options: WaitOptions & { stabilityThreshold?: number } = {}
): Promise<void> {
  const { timeout = 5000, interval = 100, stabilityThreshold = 2, message = '等待元素稳定' } = options

  let stableCount = 0
  let lastRect: DOMRect | null = null

  await locator.waitFor({ state: 'visible', timeout })

  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    try {
      const rect = await locator.boundingBox()
      if (!rect) {
        stableCount = 0
        await new Promise(resolve => setTimeout(resolve, interval))
        continue
      }

      if (!lastRect) {
        lastRect = rect
        stableCount = 1
      } else if (
        Math.abs(lastRect.x - rect.x) < 1 &&
        Math.abs(lastRect.y - rect.y) < 1 &&
        Math.abs(lastRect.width - rect.width) < 1 &&
        Math.abs(lastRect.height - rect.height) < 1
      ) {
        stableCount++
        if (stableCount >= stabilityThreshold) {
          return // 元素已稳定
        }
      } else {
        stableCount = 0
        lastRect = rect
      }

      await new Promise(resolve => setTimeout(resolve, interval))
    } catch (error) {
      // 元素可能暂时不可见，重置计数
      stableCount = 0
      lastRect = null
      await new Promise(resolve => setTimeout(resolve, interval))
    }
  }

  throw new Error(`${message} - 超时 (${timeout}ms)`)
}

/**
 * 等待网络空闲
 */
export async function waitForNetworkIdle(
  page: Page,
  options: WaitOptions & { concurrentRequests?: number } = {}
): Promise<void> {
  const { timeout = 10000, interval = 500, concurrentRequests = 0, message = '等待网络空闲' } = options

  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    const pendingRequests = new Set<string>()

    const checkIdle = () => {
      if (pendingRequests.size <= concurrentRequests) {
        resolve()
        return
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error(`${message} - 超时 (${timeout}ms)，仍有 ${pendingRequests.size} 个请求进行中`))
        return
      }

      setTimeout(checkIdle, interval)
    }

    page.on('request', (request) => {
      const url = request.url()
      // 忽略静态资源请求
      if (!url.includes('/api/') && !url.includes('/yonghu/') && !url.includes('/kecheng')) {
        return
      }
      pendingRequests.add(url)
    })

    page.on('response', (response) => {
      const url = response.url()
      pendingRequests.delete(url)
    })

    // 开始检查
    checkIdle()
  })
}

/**
 * 等待动画完成
 */
export async function waitForAnimationComplete(
  locator: Locator,
  options: WaitOptions = {}
): Promise<void> {
  const { timeout = 3000, interval = 100, message = '等待动画完成' } = options

  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    const isAnimating = await locator.evaluate((element) => {
      const computedStyle = window.getComputedStyle(element)
      const transform = computedStyle.transform
      const transition = computedStyle.transition
      const animation = computedStyle.animation

      // 检查是否有变换、过渡或动画
      return transform !== 'none' ||
             (transition && transition !== 'all 0s ease 0s') ||
             (animation && animation !== 'none')
    })

    if (!isAnimating) {
      // 等待一个额外的间隔确保动画真的完成了
      await new Promise(resolve => setTimeout(resolve, interval))
      return
    }

    await new Promise(resolve => setTimeout(resolve, interval))
  }

  throw new Error(`${message} - 超时 (${timeout}ms)`)
}

/**
 * 等待自定义条件
 */
export async function waitForCondition(
  condition: () => Promise<boolean> | boolean,
  options: WaitOptions = {}
): Promise<void> {
  const { timeout = 5000, interval = 100, message = '等待条件满足' } = options

  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    try {
      const result = await condition()
      if (result) {
        return
      }
    } catch (error) {
      // 条件检查可能失败，继续等待
    }

    await new Promise(resolve => setTimeout(resolve, interval))
  }

  throw new Error(`${message} - 超时 (${timeout}ms)`)
}

/**
 * 等待页面加载完成（包括动态内容）
 */
export async function waitForPageFullyLoaded(
  page: Page,
  options: WaitOptions = {}
): Promise<void> {
  const { timeout = 15000, message = '等待页面完全加载' } = options

  // 等待基础的页面加载
  await page.waitForLoadState('domcontentloaded', { timeout })

  // 等待网络空闲
  await waitForNetworkIdle(page, { timeout: timeout * 0.8, message: '等待网络请求完成' })

  // 等待可能的动态内容加载
  await page.waitForTimeout(500)

  // 检查是否有加载指示器
  try {
    const loadingSelectors = [
      '[class*="loading"]',
      '[class*="spinner"]',
      '.el-loading-mask',
      '[v-loading]',
    ]

    for (const selector of loadingSelectors) {
      const loadingElement = page.locator(selector).first()
      if (await loadingElement.isVisible({ timeout: 1000 }).catch(() => false)) {
        await loadingElement.waitFor({ state: 'hidden', timeout: 5000 })
      }
    }
  } catch (error) {
    // 忽略加载指示器检查失败
  }
}

/**
 * 等待表单提交完成
 */
export async function waitForFormSubmission(
  page: Page,
  options: WaitOptions & { successSelectors?: string[]; errorSelectors?: string[] } = {}
): Promise<{ success: boolean; message?: string }> {
  const {
    timeout = 10000,
    successSelectors = ['text=成功', 'text=提交成功', '.success-message'],
    errorSelectors = ['text=失败', 'text=错误', '.error-message']
  } = options

  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    let resolved = false

    const checkResult = async () => {
      if (resolved) return

      // 检查成功状态
      for (const selector of successSelectors) {
        try {
          const element = page.locator(selector)
          if (await element.isVisible({ timeout: 500 }).catch(() => false)) {
            resolved = true
            resolve({ success: true })
            return
          }
        } catch (error) {
          // 继续检查
        }
      }

      // 检查错误状态
      for (const selector of errorSelectors) {
        try {
          const element = page.locator(selector)
          if (await element.isVisible({ timeout: 500 }).catch(() => false)) {
            const errorText = await element.textContent().catch(() => '未知错误')
            resolved = true
            resolve({ success: false, message: errorText })
            return
          }
        } catch (error) {
          // 继续检查
        }
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error(`${message} - 超时 (${timeout}ms)`))
        return
      }

      setTimeout(checkResult, 200)
    }

    checkResult()
  })
}

/**
 * 等待元素文本稳定（不再变化）
 */
export async function waitForTextStable(
  locator: Locator,
  options: WaitOptions = {}
): Promise<string> {
  const { timeout = 3000, interval = 200 } = options

  let lastText = ''
  let stableCount = 0
  const stabilityThreshold = 3

  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    const currentText = await locator.textContent().catch(() => '')

    if (currentText === lastText) {
      stableCount++
      if (stableCount >= stabilityThreshold) {
        return currentText
      }
    } else {
      stableCount = 0
      lastText = currentText
    }

    await new Promise(resolve => setTimeout(resolve, interval))
  }

  throw new Error(`${message} - 超时 (${timeout}ms)`)
}

/**
 * 组合等待工具 - 等待元素可见且稳定
 */
export async function waitForElementReady(
  locator: Locator,
  options: WaitOptions = {}
): Promise<void> {
  const { timeout = 10000, message = '等待元素准备就绪' } = options

  // 先等待元素可见
  await locator.waitFor({ state: 'visible', timeout })

  // 然后等待元素稳定
  await waitForElementStable(locator, {
    timeout: timeout * 0.6,
    message: `${message} - 等待稳定`
  })
}

/**
 * 智能重试执行器
 */
export async function withSmartRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig,
  context?: string
): Promise<T> {
  const { maxRetries, initialDelay, maxDelay, backoffMultiplier, retryCondition } = config

  let lastError: any
  let delay = initialDelay

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      // 如果是最后一次尝试，直接抛出错误
      if (attempt === maxRetries) {
        break
      }

      // 检查是否应该重试
      if (retryCondition && !retryCondition(error)) {
        break
      }

      if (context) {
        console.log(`${context}: 第 ${attempt + 1} 次尝试失败，将在 ${delay}ms 后重试`)
      }

      // 等待重试延迟
      await new Promise(resolve => setTimeout(resolve, delay))

      // 计算下一次延迟（指数退避）
      delay = Math.min(delay * backoffMultiplier, maxDelay)
    }
  }

  throw lastError
}

/**
 * 带重试的元素等待
 */
export async function waitForElementWithRetry(
  locator: Locator,
  options: WaitOptions = {}
): Promise<void> {
  const {
    timeout = 10000,
    retries = 2,
    retryDelay = 1000,
    exponentialBackoff = true,
    message = '等待元素'
  } = options

  await withSmartRetry(
    () => waitForElementReady(locator, { timeout, message }),
    {
      maxRetries: retries,
      initialDelay: retryDelay,
      maxDelay: exponentialBackoff ? timeout * 0.5 : retryDelay,
      backoffMultiplier: exponentialBackoff ? 2 : 1,
      retryCondition: (error) => 
        // 只在超时或元素不可见时重试
         error.message.includes('超时') ||
               error.message.includes('not visible') ||
               error.message.includes('not found')
      
    },
    `${message} (带重试)`
  )
}

/**
 * 智能页面加载等待
 */
export async function waitForPageSmartLoad(
  page: Page,
  options: WaitOptions & {
    waitForNetwork?: boolean
    waitForAnimations?: boolean
    waitForDynamicContent?: boolean
  } = {}
): Promise<void> {
  const {
    timeout = 20000,
    waitForNetwork = true,
    waitForAnimations = true,
    waitForDynamicContent = true,
    message = '等待页面智能加载'
  } = options

  const startTime = Date.now()

  // 1. 基础页面加载
  await page.waitForLoadState('domcontentloaded', { timeout: timeout * 0.3 })

  // 2. 等待网络空闲（如果启用）
  if (waitForNetwork) {
    await waitForNetworkIdle(page, {
      timeout: timeout * 0.4,
      message: `${message} - 网络请求`
    })
  }

  // 3. 等待动态内容（如果启用）
  if (waitForDynamicContent) {
    await waitForDynamicContentLoad(page, {
      timeout: timeout * 0.2,
      message: `${message} - 动态内容`
    })
  }

  // 4. 等待动画完成（如果启用）
  if (waitForAnimations) {
    try {
      // 查找可能的动画元素并等待它们完成
      const animatedElements = page.locator('[style*="transition"], [style*="animation"], .animated, .fade-in')
      const count = await animatedElements.count()

      if (count > 0) {
        await waitForAnimationComplete(animatedElements.first(), {
          timeout: timeout * 0.1,
          message: `${message} - 动画`
        })
      }
    } catch (error) {
      // 忽略动画等待失败
    }
  }

  // 5. 最终稳定性检查
  const elapsed = Date.now() - startTime
  const remainingTimeout = Math.max(1000, timeout - elapsed)

  await page.waitForTimeout(Math.min(1000, remainingTimeout))
}

/**
 * 等待动态内容加载完成
 */
export async function waitForDynamicContentLoad(
  page: Page,
  options: WaitOptions = {}
): Promise<void> {
  const { timeout = 5000, interval = 200, message = '等待动态内容加载' } = options

  let lastHtmlLength = 0
  let stableCount = 0
  const stabilityThreshold = 3

  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    try {
      const htmlLength = await page.evaluate(() => document.body.innerHTML.length)

      if (htmlLength === lastHtmlLength) {
        stableCount++
        if (stableCount >= stabilityThreshold) {
          return // 内容已稳定
        }
      } else {
        stableCount = 0
        lastHtmlLength = htmlLength
      }

      await new Promise(resolve => setTimeout(resolve, interval))
    } catch (error) {
      // 如果页面不可用，抛出错误
      throw new Error(`${message} - 页面不可用: ${error.message}`)
    }
  }

  throw new Error(`${message} - 超时 (${timeout}ms)`)
}

/**
 * 自适应超时配置
 */
export class AdaptiveTimeout {
  private baseTimeout: number
  private minTimeout: number
  private maxTimeout: number
  private successRate: number
  private recentAttempts: number[]

  constructor(baseTimeout = 10000, minTimeout = 3000, maxTimeout = 30000) {
    this.baseTimeout = baseTimeout
    this.minTimeout = minTimeout
    this.maxTimeout = maxTimeout
    this.successRate = 1.0
    this.recentAttempts = []
  }

  /**
   * 记录操作结果
   */
  recordResult(success: boolean, actualTimeout: number): void {
    this.recentAttempts.push(success ? 1 : 0)

    // 只保留最近10次尝试
    if (this.recentAttempts.length > 10) {
      this.recentAttempts.shift()
    }

    // 更新成功率
    this.successRate = this.recentAttempts.reduce((sum, result) => sum + result, 0) / this.recentAttempts.length
  }

  /**
   * 获取自适应超时时间
   */
  getAdaptiveTimeout(): number {
    // 基于成功率调整超时时间
    let multiplier = 1.0

    if (this.successRate < 0.5) {
      // 成功率低，增加超时时间
      multiplier = 1.5
    } else if (this.successRate > 0.8) {
      // 成功率高，可以稍微减少超时时间
      multiplier = 0.8
    }

    const adaptiveTimeout = Math.round(this.baseTimeout * multiplier)
    return Math.max(this.minTimeout, Math.min(this.maxTimeout, adaptiveTimeout))
  }

  /**
   * 重置统计数据
   */
  reset(): void {
    this.successRate = 1.0
    this.recentAttempts = []
  }
}

/**
 * 全局自适应超时实例
 */
export const globalAdaptiveTimeout = new AdaptiveTimeout()

/**
 * 带自适应超时的等待函数
 */
export async function waitForElementAdaptive(
  locator: Locator,
  options: WaitOptions = {}
): Promise<void> {
  const adaptiveTimeout = globalAdaptiveTimeout.getAdaptiveTimeout()
  const timeout = options.timeout || adaptiveTimeout

  try {
    await waitForElementReady(locator, { ...options, timeout })
    globalAdaptiveTimeout.recordResult(true, timeout)
  } catch (error) {
    globalAdaptiveTimeout.recordResult(false, timeout)
    throw error
  }
}

/**
 * 性能监控等待器
 */
export class PerformanceWaitMonitor {
  private waitTimes: number[] = []
  private slowThreshold: number

  constructor(slowThreshold = 5000) {
    this.slowThreshold = slowThreshold
  }

  /**
   * 执行带性能监控的等待
   */
  async monitoredWait<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    const startTime = Date.now()

    try {
      const result = await operation()
      const duration = Date.now() - startTime

      this.waitTimes.push(duration)

      if (duration > this.slowThreshold) {
        console.warn(`慢等待操作: ${operationName} 耗时 ${duration}ms`)
      }

      return result
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`等待操作失败: ${operationName} 耗时 ${duration}ms - ${error.message}`)
      throw error
    }
  }

  /**
   * 获取性能统计
   */
  getStats() {
    if (this.waitTimes.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0, slowCount: 0 }
    }

    const avg = this.waitTimes.reduce((sum, time) => sum + time, 0) / this.waitTimes.length
    const min = Math.min(...this.waitTimes)
    const max = Math.max(...this.waitTimes)
    const slowCount = this.waitTimes.filter(time => time > this.slowThreshold).length

    return {
      count: this.waitTimes.length,
      avg: Math.round(avg),
      min,
      max,
      slowCount
    }
  }

  /**
   * 重置统计数据
   */
  reset(): void {
    this.waitTimes = []
  }
}

/**
 * 全局性能监控实例
 */
export const globalPerformanceMonitor = new PerformanceWaitMonitor()
