import { Page, BrowserContext } from '@playwright/test'
import path from 'path'
import fs from 'fs'

/**
 * Performance Optimization Utilities - 测试性能优化工具
 * 提供测试执行速度优化、资源管理、并行执行等功能
 */

export interface TestOptimizationConfig {
  // 并行执行设置
  parallel: {
    enabled: boolean
    workers: number
    shard?: {
      current: number
      total: number
    }
  }

  // 资源预加载设置
  preloading: {
    enabled: boolean
    resources: string[]
  }

  // 缓存设置
  caching: {
    enabled: boolean
    browserContext: boolean
    apiResponses: boolean
    staticAssets: boolean
  }

  // 懒加载和按需加载
  lazyLoading: {
    enabled: boolean
    testGroups: string[]
  }

  // 资源池设置
  resourcePooling: {
    enabled: boolean
    maxContexts: number
    reuseContexts: boolean
  }
}

export class TestPerformanceOptimizer {
  private config: TestOptimizationConfig
  private contextPool: BrowserContext[] = []
  private preloadCache = new Map<string, any>()

  constructor(config: Partial<TestOptimizationConfig> = {}) {
    this.config = {
      parallel: {
        enabled: true,
        workers: 4,
        ...config.parallel
      },
      preloading: {
        enabled: true,
        resources: ['**/favicon.ico', '**/*.{png,jpg,jpeg,gif,svg}'],
        ...config.preloading
      },
      caching: {
        enabled: true,
        browserContext: true,
        apiResponses: true,
        staticAssets: true,
        ...config.caching
      },
      lazyLoading: {
        enabled: true,
        testGroups: ['slow', 'integration', 'api'],
        ...config.lazyLoading
      },
      resourcePooling: {
        enabled: true,
        maxContexts: 3,
        reuseContexts: true,
        ...config.resourcePooling
      }
    }
  }

  /**
   * 优化页面加载性能
   */
  async optimizePageLoad(page: Page): Promise<void> {
    // 禁用不必要的资源加载
    await page.route('**/*', (route) => {
      const request = route.request()
      const resourceType = request.resourceType()

      // 允许的资源类型
      const allowedTypes = ['document', 'script', 'xhr', 'fetch']

      if (this.config.caching.staticAssets) {
        // 缓存静态资源
        if (['image', 'stylesheet', 'font'].includes(resourceType)) {
          if (this.preloadCache.has(request.url())) {
            route.fulfill({
              status: 200,
              body: this.preloadCache.get(request.url())
            })
            return
          }
        }
      }

      // 跳过不必要的资源
      if (!allowedTypes.includes(resourceType) &&
          !this.config.preloading.resources.some(pattern => request.url().includes(pattern))) {
        route.abort()
        return
      }

      route.continue()
    })

    // 预加载关键资源
    if (this.config.preloading.enabled) {
      await this.preloadCriticalResources(page)
    }

    // 设置页面超时优化
    await page.route('**/*', (route) => {
      route.continue({
        timeout: 10000 // 10秒超时
      })
    })
  }

  /**
   * 预加载关键资源
   */
  private async preloadCriticalResources(page: Page): Promise<void> {
    const criticalResources = [
      '/favicon.ico',
      '/manifest.json',
      '/robots.txt'
    ]

    for (const resource of criticalResources) {
      try {
        const response = await page.request.get(page.url() + resource)
        if (response.ok()) {
          this.preloadCache.set(page.url() + resource, await response.body())
        }
      } catch (error) {
        // 忽略预加载失败
      }
    }
  }

  /**
   * 优化测试执行顺序
   */
  optimizeTestExecutionOrder(tests: any[]): any[] {
    if (!this.config.lazyLoading.enabled) return tests

    // 将测试分为快速、中等、慢速三组
    const fastTests = tests.filter(test => !this.isSlowTest(test))
    const slowTests = tests.filter(test => this.isSlowTest(test))

    // 快速测试优先执行
    return [...fastTests, ...slowTests]
  }

  /**
   * 判断是否为慢速测试
   */
  private isSlowTest(test: any): boolean {
    const slowTestPatterns = [
      /integration/i,
      /e2e/i,
      /workflow/i,
      /journey/i,
      /performance/i,
      /load/i
    ]

    const testName = test.title || test.name || ''
    return slowTestPatterns.some(pattern => pattern.test(testName)) ||
           this.config.lazyLoading.testGroups.some(group =>
             testName.toLowerCase().includes(group.toLowerCase())
           )
  }

  /**
   * 管理浏览器上下文池
   */
  async getOptimizedContext(browser: any): Promise<BrowserContext> {
    if (!this.config.resourcePooling.enabled) {
      return await browser.newContext()
    }

    // 尝试复用现有上下文
    if (this.contextPool.length > 0 && this.config.resourcePooling.reuseContexts) {
      const context = this.contextPool.pop()!
      // 重置上下文状态
      await this.resetContext(context)
      return context
    }

    // 创建新上下文
    if (this.contextPool.length < this.config.resourcePooling.maxContexts) {
      const context = await browser.newContext({
        // 优化上下文配置
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
        bypassCSP: true,
      })

      // 应用性能优化
      const page = await context.newPage()
      await this.optimizePageLoad(page)
      await page.close()

      return context
    }

    // 等待可用上下文
    return new Promise((resolve) => {
      const checkPool = () => {
        if (this.contextPool.length > 0) {
          resolve(this.contextPool.pop()!)
        } else {
          setTimeout(checkPool, 100)
        }
      }
      checkPool()
    })
  }

  /**
   * 重置上下文状态
   */
  private async resetContext(context: BrowserContext): Promise<void> {
    // 关闭所有页面
    const pages = context.pages()
    for (const page of pages.slice(1)) { // 保留第一个页面
      await page.close()
    }

    // 清除存储
    if (pages.length > 0) {
      await pages[0].evaluate(() => {
        localStorage.clear()
        sessionStorage.clear()
      })
    }
  }

  /**
   * 返回上下文到池中
   */
  async returnContextToPool(context: BrowserContext): Promise<void> {
    if (this.config.resourcePooling.enabled &&
        this.contextPool.length < this.config.resourcePooling.maxContexts) {
      this.contextPool.push(context)
    } else {
      await context.close()
    }
  }

  /**
   * 智能等待策略
   */
  async smartWait(page: Page, selector: string, options: {
    timeout?: number
    visible?: boolean
    stable?: boolean
  } = {}): Promise<void> {
    const { timeout = 10000, visible = true, stable = true } = options

    // 使用MutationObserver检测DOM变化
    await page.evaluate(({ selector, visible, stable }) => {
      return new Promise((resolve) => {
        const element = document.querySelector(selector)
        if (element && (!visible || element.offsetParent !== null)) {
          resolve(true)
          return
        }

        const observer = new MutationObserver(() => {
          const element = document.querySelector(selector)
          if (element && (!visible || element.offsetParent !== null)) {
            if (stable) {
              // 等待一小段时间确保元素稳定
              setTimeout(() => resolve(true), 100)
            } else {
              resolve(true)
            }
            observer.disconnect()
          }
        })

        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true
        })

        // 设置超时
        setTimeout(() => {
          observer.disconnect()
          resolve(false)
        }, 10000)
      })
    }, { selector, visible, stable })
  }

  /**
   * 批量操作优化
   */
  async batchOperations<T>(
    operations: (() => Promise<T>)[],
    options: {
      concurrency?: number
      delay?: number
    } = {}
  ): Promise<T[]> {
    const { concurrency = 3, delay = 0 } = options
    const results: T[] = []

    for (let i = 0; i < operations.length; i += concurrency) {
      const batch = operations.slice(i, i + concurrency)
      const batchResults = await Promise.all(
        batch.map(op => op())
      )
      results.push(...batchResults)

      // 添加延迟避免过载
      if (delay > 0 && i + concurrency < operations.length) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    return results
  }

  /**
   * 内存使用优化
   */
  async optimizeMemoryUsage(page: Page): Promise<void> {
    // 定期清理不需要的元素
    await page.evaluate(() => {
      // 移除隐藏的元素
      const hiddenElements = document.querySelectorAll('[style*="display: none"], [hidden]')
      hiddenElements.forEach(el => {
        if (el.parentNode && !el.hasAttribute('data-keep-hidden')) {
          el.parentNode.removeChild(el)
        }
      })

      // 清理事件监听器
      const elements = document.querySelectorAll('*')
      elements.forEach(el => {
        // 移除可能的事件监听器引用
        ;(el as any)._eventListeners?.clear?.()
      })

      // 强制垃圾回收（如果可用）
      if (window.gc) {
        window.gc()
      }
    })
  }

  /**
   * 生成性能优化报告
   */
  async generateOptimizationReport(testResults: any[]): Promise<string> {
    const totalTests = testResults.length
    const passedTests = testResults.filter(t => t.status === 'passed').length
    const failedTests = testResults.filter(t => t.status === 'failed').length
    const skippedTests = testResults.filter(t => t.status === 'skipped').length

    const averageDuration = testResults.reduce((sum, t) => sum + (t.duration || 0), 0) / totalTests
    const totalDuration = testResults.reduce((sum, t) => sum + (t.duration || 0), 0)

    const slowTests = testResults.filter(t => (t.duration || 0) > 30000) // 30秒以上
    const fastTests = testResults.filter(t => (t.duration || 0) < 5000)  // 5秒以内

    const report = `
# 测试性能优化报告

## 执行统计
- 总测试数: ${totalTests}
- 通过测试: ${passedTests}
- 失败测试: ${failedTests}
- 跳过测试: ${skippedTests}
- 通过率: ${((passedTests / totalTests) * 100).toFixed(2)}%

## 性能指标
- 总执行时间: ${(totalDuration / 1000).toFixed(2)}秒
- 平均测试时间: ${(averageDuration / 1000).toFixed(2)}秒
- 最慢测试: ${Math.max(...testResults.map(t => t.duration || 0)) / 1000}秒
- 最快测试: ${Math.min(...testResults.map(t => t.duration || 0)) / 1000}秒

## 性能分布
- 快速测试 (< 5秒): ${fastTests.length}
- 慢速测试 (> 30秒): ${slowTests.length}
- 正常测试: ${totalTests - fastTests.length - slowTests.length}

## 优化配置
- 并行执行: ${this.config.parallel.enabled ? '启用' : '禁用'}
- 工作进程数: ${this.config.parallel.workers}
- 资源预加载: ${this.config.preloading.enabled ? '启用' : '禁用'}
- 缓存策略: ${this.config.caching.enabled ? '启用' : '禁用'}
- 资源池: ${this.config.resourcePooling.enabled ? '启用' : '禁用'}

## 性能建议
${this.generatePerformanceRecommendations(testResults)}

生成时间: ${new Date().toISOString()}
    `

    return report.trim()
  }

  /**
   * 生成性能优化建议
   */
  private generatePerformanceRecommendations(testResults: any[]): string {
    const recommendations: string[] = []

    const averageDuration = testResults.reduce((sum, t) => sum + (t.duration || 0), 0) / testResults.length
    const slowTests = testResults.filter(t => (t.duration || 0) > 30000)

    if (averageDuration > 20000) {
      recommendations.push('- 平均测试时间较长，考虑优化页面加载和等待策略')
    }

    if (slowTests.length > testResults.length * 0.2) {
      recommendations.push('- 大量测试运行缓慢，建议将慢速测试分离到独立执行')
    }

    if (!this.config.parallel.enabled) {
      recommendations.push('- 建议启用并行执行以提高整体测试速度')
    }

    if (!this.config.caching.enabled) {
      recommendations.push('- 启用缓存策略可以显著提升重复测试的性能')
    }

    if (!this.config.resourcePooling.enabled) {
      recommendations.push('- 启用资源池可以减少上下文创建开销')
    }

    return recommendations.length > 0 ? recommendations.join('\n') : '- 当前性能表现良好'
  }

  /**
   * 应用所有优化策略
   */
  async applyAllOptimizations(page: Page): Promise<void> {
    await this.optimizePageLoad(page)
    await this.optimizeMemoryUsage(page)
  }
}

/**
 * 便捷函数和配置预设
 */
export const PerformancePresets = {
  // 快速CI配置
  FAST_CI: {
    parallel: { enabled: true, workers: 8 },
    preloading: { enabled: false },
    caching: { enabled: true, browserContext: true },
    lazyLoading: { enabled: false },
    resourcePooling: { enabled: true, maxContexts: 5 }
  } as TestOptimizationConfig,

  // 本地开发配置
  LOCAL_DEV: {
    parallel: { enabled: false, workers: 1 },
    preloading: { enabled: true },
    caching: { enabled: true },
    lazyLoading: { enabled: true },
    resourcePooling: { enabled: false }
  } as TestOptimizationConfig,

  // 负载测试配置
  LOAD_TEST: {
    parallel: { enabled: true, workers: 12 },
    preloading: { enabled: false },
    caching: { enabled: false },
    lazyLoading: { enabled: false },
    resourcePooling: { enabled: true, maxContexts: 10 }
  } as TestOptimizationConfig,

  // 调试配置
  DEBUG: {
    parallel: { enabled: false, workers: 1 },
    preloading: { enabled: false },
    caching: { enabled: false },
    lazyLoading: { enabled: false },
    resourcePooling: { enabled: false }
  } as TestOptimizationConfig
}

/**
 * 根据环境自动选择配置
 */
export function getAutoConfig(): TestOptimizationConfig {
  const isCI = process.env.CI === 'true'
  const isDebug = process.env.DEBUG === 'true'
  const isLoadTest = process.env.LOAD_TEST === 'true'

  if (isDebug) return PerformancePresets.DEBUG
  if (isLoadTest) return PerformancePresets.LOAD_TEST
  if (isCI) return PerformancePresets.FAST_CI

  return PerformancePresets.LOCAL_DEV
}

/**
 * 创建优化器实例
 */
export function createPerformanceOptimizer(config?: Partial<TestOptimizationConfig>): TestPerformanceOptimizer {
  return new TestPerformanceOptimizer(config || getAutoConfig())
}
