/**
 * 性能监控工具
 * 跟踪页面响应时间、系统资源使用和性能指标
 */

import { Page } from '@playwright/test'
import fs from 'fs'
import path from 'path'

export interface PerformanceMetrics {
  // 页面加载指标
  pageLoad: {
    domContentLoaded: number
    load: number
    total: number
    firstContentfulPaint?: number
    largestContentfulPaint?: number
    firstInputDelay?: number
    cumulativeLayoutShift: number
  }

  // 网络请求指标
  network: {
    totalRequests: number
    failedRequests: number
    averageResponseTime: number
    slowestRequest: {
      url: string
      duration: number
    }
    requestBreakdown: {
      html: number
      css: number
      js: number
      image: number
      api: number
      other: number
    }
  }

  // 内存和CPU指标
  resources: {
    heapUsed: number
    heapTotal: number
    external: number
    cpuUsage?: number
    memoryUsage: NodeJS.MemoryUsage
  }

  // 自定义指标
  custom: Record<string, any>
}

export interface PerformanceReport {
  testId: string
  testName: string
  timestamp: Date
  duration: number
  metrics: PerformanceMetrics
  thresholds: PerformanceThresholds
  violations: PerformanceViolation[]
  recommendations: string[]
}

export interface PerformanceThresholds {
  pageLoad: {
    domContentLoaded: number // ms
    load: number // ms
    firstContentfulPaint: number // ms
    largestContentfulPaint: number // ms
  }
  network: {
    maxResponseTime: number // ms
    maxFailedRequests: number // 请求数
  }
  resources: {
    maxHeapUsed: number // MB
    maxMemoryUsage: number // MB
  }
}

export interface PerformanceViolation {
  type: 'warning' | 'error'
  category: 'pageLoad' | 'network' | 'resources'
  metric: string
  actual: number
  threshold: number
  message: string
}

/**
 * 性能监控器类
 */
export class PerformanceMonitor {
  private page: Page
  private testId: string
  private testName: string
  private startTime: number
  private networkRequests: any[] = []
  private customMetrics: Record<string, any> = {}
  private thresholds: PerformanceThresholds
  private isMonitoring = false

  constructor(page: Page, testId: string, testName: string, thresholds?: Partial<PerformanceThresholds>) {
    this.page = page
    this.testId = testId
    this.testName = testName
    this.startTime = Date.now()

    // 默认性能阈值
    this.thresholds = {
      pageLoad: {
        domContentLoaded: 2000,
        load: 5000,
        firstContentfulPaint: 2000,
        largestContentfulPaint: 3000,
        ...thresholds?.pageLoad
      },
      network: {
        maxResponseTime: 2000,
        maxFailedRequests: 5,
        ...thresholds?.network
      },
      resources: {
        maxHeapUsed: 100,
        maxMemoryUsage: 150,
        ...thresholds?.resources
      }
    }
  }

  /**
   * 开始性能监控
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.startTime = Date.now()

    // 监听网络请求
    this.setupNetworkMonitoring()

    // 注入性能监控脚本
    await this.injectPerformanceScript()

    console.log(`🔍 开始性能监控: ${this.testName}`)
  }

  /**
   * 停止性能监控并生成报告
   */
  async stopMonitoring(): Promise<PerformanceReport> {
    if (!this.isMonitoring) {
      throw new Error('性能监控未启动')
    }

    this.isMonitoring = false
    const endTime = Date.now()
    const duration = endTime - this.startTime

    // 收集所有性能指标
    const metrics = await this.collectMetrics()

    // 检查阈值违规
    const violations = this.checkThresholds(metrics)

    // 生成建议
    const recommendations = this.generateRecommendations(violations, metrics)

    const report: PerformanceReport = {
      testId: this.testId,
      testName: this.testName,
      timestamp: new Date(),
      duration,
      metrics,
      thresholds: this.thresholds,
      violations,
      recommendations
    }

    // 保存报告
    this.saveReport(report)

    console.log(`📊 性能监控完成: ${this.testName} (${duration}ms)`)

    return report
  }

  /**
   * 记录自定义性能指标
   */
  recordCustomMetric(key: string, value: any): void {
    this.customMetrics[key] = value
  }

  /**
   * 标记性能检查点
   */
  async markCheckpoint(name: string): Promise<number> {
    const timestamp = Date.now()
    const elapsed = timestamp - this.startTime

    this.recordCustomMetric(`checkpoint_${name}`, {
      timestamp,
      elapsed,
      name
    })

    console.log(`📍 性能检查点: ${name} (${elapsed}ms)`)
    return elapsed
  }

  /**
   * 设置网络监控
   */
  private setupNetworkMonitoring(): void {
    this.page.on('request', (request) => {
      const requestData = {
        url: request.url(),
        method: request.method(),
        timestamp: Date.now(),
        type: this.classifyRequestType(request.url())
      }
      this.networkRequests.push(requestData)
    })

    this.page.on('response', (response) => {
      const request = this.networkRequests.find(req => req.url === response.url())
      if (request) {
        request.responseTime = Date.now() - request.timestamp
        request.status = response.status()
        request.failed = response.status() >= 400
      }
    })
  }

  /**
   * 注入性能监控脚本
   */
  private async injectPerformanceScript(): Promise<void> {
    await this.page.addInitScript(() => {
      // 监听性能指标
      if (typeof window !== 'undefined' && window.performance) {
        // 扩展性能观察器
        if ('PerformanceObserver' in window) {
          // 监听LCP
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const lastEntry = entries[entries.length - 1]
            ;(window as any).__lcp = lastEntry.startTime
          })
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

          // 监听FID
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const lastEntry = entries[entries.length - 1]
            ;(window as any).__fid = lastEntry.processingStart - lastEntry.startTime
          })
          fidObserver.observe({ entryTypes: ['first-input'] })

          // 监听CLS
          const clsObserver = new PerformanceObserver((list) => {
            let clsValue = 0
            for (const entry of list.getEntries() as any[]) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value
              }
            }
            ;(window as any).__cls = clsValue
          })
          clsObserver.observe({ entryTypes: ['layout-shift'] })
        }
      }
    })
  }

  /**
   * 收集性能指标
   */
  private async collectMetrics(): Promise<PerformanceMetrics> {
    // 页面加载指标
    const pageLoadMetrics = await this.collectPageLoadMetrics()

    // 网络指标
    const networkMetrics = this.collectNetworkMetrics()

    // 资源指标
    const resourceMetrics = await this.collectResourceMetrics()

    return {
      pageLoad: pageLoadMetrics,
      network: networkMetrics,
      resources: resourceMetrics,
      custom: this.customMetrics
    }
  }

  /**
   * 收集页面加载指标
   */
  private async collectPageLoadMetrics() {
    const navigationTiming = await this.page.evaluate(() => {
      const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        load: timing.loadEventEnd - timing.navigationStart,
        total: timing.loadEventEnd - timing.navigationStart
      }
    })

    const paintMetrics = await this.page.evaluate(() => {
      const paintEntries = performance.getEntriesByType('paint')
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')

      return {
        firstContentfulPaint: fcp ? fcp.startTime : undefined,
        largestContentfulPaint: (window as any).__lcp,
        firstInputDelay: (window as any).__fid,
        cumulativeLayoutShift: (window as any).__cls || 0
      }
    })

    return {
      ...navigationTiming,
      ...paintMetrics
    }
  }

  /**
   * 收集网络指标
   */
  private collectNetworkMetrics() {
    const completedRequests = this.networkRequests.filter(req => req.responseTime)
    const failedRequests = completedRequests.filter(req => req.failed)
    const responseTimes = completedRequests.map(req => req.responseTime)

    const requestBreakdown = {
      html: 0,
      css: 0,
      js: 0,
      image: 0,
      api: 0,
      other: 0
    }

    completedRequests.forEach(req => {
      requestBreakdown[req.type]++
    })

    const slowestRequest = completedRequests.reduce((slowest, req) => req.responseTime > (slowest?.responseTime || 0) ? req : slowest, null as any)

    return {
      totalRequests: completedRequests.length,
      failedRequests: failedRequests.length,
      averageResponseTime: responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
        : 0,
      slowestRequest: slowestRequest ? {
        url: slowestRequest.url,
        duration: slowestRequest.responseTime
      } : { url: '', duration: 0 },
      requestBreakdown
    }
  }

  /**
   * 收集资源指标
   */
  private async collectResourceMetrics() {
    const memoryUsage = process.memoryUsage()

    const heapMetrics = await this.page.evaluate(() => {
      if (typeof performance !== 'undefined' && (performance as any).memory) {
        const mem = (performance as any).memory
        return {
          heapUsed: mem.usedJSHeapSize,
          heapTotal: mem.totalJSHeapSize,
          heapLimit: mem.jsHeapSizeLimit
        }
      }
      return null
    })

    return {
      heapUsed: heapMetrics ? heapMetrics.heapUsed / 1024 / 1024 : 0, // MB
      heapTotal: heapMetrics ? heapMetrics.heapTotal / 1024 / 1024 : 0, // MB
      external: memoryUsage.external / 1024 / 1024, // MB
      memoryUsage,
      cpuUsage: process.cpuUsage ? process.cpuUsage().user / 1000 : undefined // ms
    }
  }

  /**
   * 检查阈值违规
   */
  private checkThresholds(metrics: PerformanceMetrics): PerformanceViolation[] {
    const violations: PerformanceViolation[] = []

    // 页面加载阈值检查
    if (metrics.pageLoad.domContentLoaded > this.thresholds.pageLoad.domContentLoaded) {
      violations.push({
        type: 'warning',
        category: 'pageLoad',
        metric: 'domContentLoaded',
        actual: metrics.pageLoad.domContentLoaded,
        threshold: this.thresholds.pageLoad.domContentLoaded,
        message: `DOM内容加载时间过长: ${metrics.pageLoad.domContentLoaded}ms > ${this.thresholds.pageLoad.domContentLoaded}ms`
      })
    }

    if (metrics.pageLoad.load > this.thresholds.pageLoad.load) {
      violations.push({
        type: 'error',
        category: 'pageLoad',
        metric: 'load',
        actual: metrics.pageLoad.load,
        threshold: this.thresholds.pageLoad.load,
        message: `页面加载时间过长: ${metrics.pageLoad.load}ms > ${this.thresholds.pageLoad.load}ms`
      })
    }

    if (metrics.pageLoad.firstContentfulPaint && metrics.pageLoad.firstContentfulPaint > this.thresholds.pageLoad.firstContentfulPaint) {
      violations.push({
        type: 'warning',
        category: 'pageLoad',
        metric: 'firstContentfulPaint',
        actual: metrics.pageLoad.firstContentfulPaint,
        threshold: this.thresholds.pageLoad.firstContentfulPaint,
        message: `首次内容绘制时间过长: ${metrics.pageLoad.firstContentfulPaint}ms > ${this.thresholds.pageLoad.firstContentfulPaint}ms`
      })
    }

    // 网络阈值检查
    if (metrics.network.failedRequests > this.thresholds.network.maxFailedRequests) {
      violations.push({
        type: 'error',
        category: 'network',
        metric: 'failedRequests',
        actual: metrics.network.failedRequests,
        threshold: this.thresholds.network.maxFailedRequests,
        message: `失败请求数量过多: ${metrics.network.failedRequests} > ${this.thresholds.network.maxFailedRequests}`
      })
    }

    if (metrics.network.slowestRequest.duration > this.thresholds.network.maxResponseTime) {
      violations.push({
        type: 'warning',
        category: 'network',
        metric: 'slowestRequest',
        actual: metrics.network.slowestRequest.duration,
        threshold: this.thresholds.network.maxResponseTime,
        message: `最慢请求响应时间过长: ${metrics.network.slowestRequest.duration}ms > ${this.thresholds.network.maxResponseTime}ms`
      })
    }

    // 资源阈值检查
    if (metrics.resources.heapUsed > this.thresholds.resources.maxHeapUsed) {
      violations.push({
        type: 'warning',
        category: 'resources',
        metric: 'heapUsed',
        actual: metrics.resources.heapUsed,
        threshold: this.thresholds.resources.maxHeapUsed,
        message: `堆内存使用过高: ${metrics.resources.heapUsed}MB > ${this.thresholds.resources.maxHeapUsed}MB`
      })
    }

    return violations
  }

  /**
   * 生成性能建议
   */
  private generateRecommendations(violations: PerformanceViolation[], metrics: PerformanceMetrics): string[] {
    const recommendations: string[] = []

    // 基于违规情况生成建议
    violations.forEach(violation => {
      switch (violation.category) {
        case 'pageLoad':
          if (violation.metric === 'load') {
            recommendations.push('考虑优化资源加载，压缩图片，启用CDN')
          } else if (violation.metric === 'firstContentfulPaint') {
            recommendations.push('优化关键渲染路径，减少阻塞资源')
          }
          break
        case 'network':
          if (violation.metric === 'failedRequests') {
            recommendations.push('检查API端点稳定性，修复失败的网络请求')
          } else if (violation.metric === 'slowestRequest') {
            recommendations.push('优化慢请求，考虑缓存或异步加载')
          }
          break
        case 'resources':
          if (violation.metric === 'heapUsed') {
            recommendations.push('检查内存泄漏，优化组件生命周期')
          }
          break
      }
    })

    // 基于指标生成通用建议
    if (metrics.network.totalRequests > 50) {
      recommendations.push('考虑减少HTTP请求数量，合并资源文件')
    }

    if (metrics.pageLoad.cumulativeLayoutShift > 0.1) {
      recommendations.push('修复布局偏移问题，确保视觉稳定性')
    }

    return [...new Set(recommendations)] // 去重
  }

  /**
   * 保存性能报告
   */
  private saveReport(report: PerformanceReport): void {
    const reportDir = 'test-results/performance'
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }

    const reportPath = path.join(reportDir, `performance-${this.testId}-${Date.now()}.json`)
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

    console.log(`💾 性能报告已保存: ${reportPath}`)
  }

  /**
   * 分类请求类型
   */
  private classifyRequestType(url: string): keyof PerformanceMetrics['network']['requestBreakdown'] {
    const lowerUrl = url.toLowerCase()

    if (lowerUrl.includes('/api/') || lowerUrl.includes('/common/')) {
      return 'api'
    } else if (lowerUrl.endsWith('.css')) {
      return 'css'
    } else if (lowerUrl.endsWith('.js')) {
      return 'js'
    } else if (/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(lowerUrl)) {
      return 'image'
    } else if (lowerUrl.includes('.html') || !lowerUrl.includes('.')) {
      return 'html'
    } else {
      return 'other'
    }
  }

  /**
   * 获取当前监控状态
   */
  getMonitoringStatus(): { isMonitoring: boolean; duration: number } {
    return {
      isMonitoring: this.isMonitoring,
      duration: this.isMonitoring ? Date.now() - this.startTime : 0
    }
  }
}

/**
 * 性能监控装饰器
 */
export function withPerformanceMonitoring(thresholds?: Partial<PerformanceThresholds>) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function(...args: any[]) {
      const page = args[0] // 假设第一个参数是page
      const testInfo = args.find(arg => arg?.title) // 查找testInfo

      const testId = `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const monitor = new PerformanceMonitor(page, testId, propertyName, thresholds)

      await monitor.startMonitoring()

      try {
        const result = await method.apply(this, args)
        const report = await monitor.stopMonitoring()

        // 在测试上下文中存储报告
        if (testInfo) {
          testInfo.performanceReport = report
        }

        return result
      } catch (error) {
        await monitor.stopMonitoring()
        throw error
      }
    }
  }
}

/**
 * 便捷的性能监控函数
 */
export const performance = {
  /**
   * 创建性能监控器
   */
  createMonitor: (page: Page, testId: string, testName: string, thresholds?: Partial<PerformanceThresholds>) => new PerformanceMonitor(page, testId, testName, thresholds),

  /**
   * 生成性能摘要报告
   */
  generateSummaryReport: (reports: PerformanceReport[]) => {
    if (reports.length === 0) return null

    const summary = {
      totalTests: reports.length,
      averageDuration: reports.reduce((sum, r) => sum + r.duration, 0) / reports.length,
      totalViolations: reports.reduce((sum, r) => sum + r.violations.length, 0),
      violationsByCategory: {} as Record<string, number>,
      slowestTests: reports
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5)
        .map(r => ({ name: r.testName, duration: r.duration })),
      recommendations: [] as string[]
    }

    // 统计违规类型
    reports.forEach(report => {
      report.violations.forEach(violation => {
        summary.violationsByCategory[violation.category] =
          (summary.violationsByCategory[violation.category] || 0) + 1
      })
      summary.recommendations.push(...report.recommendations)
    })

    summary.recommendations = [...new Set(summary.recommendations)]

    return summary
  }
}

export default PerformanceMonitor