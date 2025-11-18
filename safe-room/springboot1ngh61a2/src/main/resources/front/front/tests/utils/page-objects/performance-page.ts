import { Page } from '@playwright/test'
import { BasePage } from './base-page'

interface PerformanceMetrics {
  // Navigation Timing
  navigationStart: number
  domContentLoaded: number
  loadComplete: number
  totalLoadTime: number

  // Core Web Vitals
  firstContentfulPaint?: number
  largestContentfulPaint?: number
  firstInputDelay?: number
  cumulativeLayoutShift: number

  // Resource metrics
  totalResources: number
  totalResourceSize: number
  cssResources: number
  jsResources: number
  imageResources: number

  // Network requests
  totalRequests: number
  failedRequests: number
  slowRequests: number // > 1 second
}

interface PerformanceBudget {
  maxLoadTime: number
  maxResourceSize: number
  maxRequests: number
  maxLCP: number
  maxCLS: number
  maxFID: number
}

/**
 * Performance Testing Page Object
 * Provides methods for measuring and analyzing web performance
 */
export class PerformancePage extends BasePage {
  private metrics: PerformanceMetrics | null = null
  private startTime: number = 0

  constructor(page: Page) {
    super(page)
  }

  /**
   * Start performance monitoring
   */
  async startMonitoring(): Promise<void> {
    this.startTime = Date.now()

    // Clear any existing performance entries
    await this.page.evaluate(() => {
      if (performance.clearResourceTimings) {
        performance.clearResourceTimings()
      }
    })
  }

  /**
   * Stop monitoring and collect metrics
   */
  async stopMonitoring(): Promise<PerformanceMetrics> {
    const endTime = Date.now()

    this.metrics = await this.page.evaluate((startTime) => {
      // Navigation timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType('paint')
      const lcp = performance.getEntriesByType('largest-contentful-paint')[0] as any
      const fid = performance.getEntriesByType('first-input')[0] as any
      const cls = performance.getEntriesByType('layout-shift').reduce((sum: number, entry: any) =>
        sum + (entry.hadRecentInput ? 0 : entry.value), 0)

      // Resource timing
      const resources = performance.getEntriesByType('resource')
      const resourceStats = {
        total: resources.length,
        totalSize: resources.reduce((sum, resource: any) => sum + (resource.transferSize || 0), 0),
        css: resources.filter(r => r.name.endsWith('.css')).length,
        js: resources.filter(r => r.name.includes('.js')).length,
        images: resources.filter(r => /\.(jpg|jpeg|png|gif|webp|svg)/.test(r.name)).length
      }

      return {
        navigationStart: navigation.startTime,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.startTime,
        loadComplete: navigation.loadEventEnd - navigation.startTime,
        totalLoadTime: endTime - startTime,

        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
        largestContentfulPaint: lcp?.startTime,
        firstInputDelay: fid ? fid.processingStart - fid.startTime : undefined,
        cumulativeLayoutShift: cls,

        totalResources: resourceStats.total,
        totalResourceSize: resourceStats.totalSize,
        cssResources: resourceStats.css,
        jsResources: resourceStats.js,
        imageResources: resourceStats.images,

        totalRequests: resourceStats.total,
        failedRequests: 0, // Would need to track failed requests separately
        slowRequests: resources.filter((r: any) => (r.responseEnd - r.requestStart) > 1000).length
      }
    }, this.startTime)

    return this.metrics
  }

  /**
   * Measure time to interactive
   */
  async measureTimeToInteractive(): Promise<number> {
    return await this.page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          resolve(lastEntry.startTime)
        })

        observer.observe({ entryTypes: ['measure'] })

        // Mark time to interactive
        if (document.readyState === 'complete') {
          performance.mark('tti')
          performance.measure('Time to Interactive', 'navigationStart', 'tti')
        } else {
          window.addEventListener('load', () => {
            setTimeout(() => {
              performance.mark('tti')
              performance.measure('Time to Interactive', 'navigationStart', 'tti')
            }, 0)
          })
        }
      })
    })
  }

  /**
   * Measure Core Web Vitals
   */
  async measureCoreWebVitals(): Promise<{
    lcp: number | null
    fid: number | null
    cls: number
  }> {
    return await this.page.evaluate(() => {
      const lcp = performance.getEntriesByType('largest-contentful-paint')[0] as any
      const fid = performance.getEntriesByType('first-input')[0] as any
      const cls = performance.getEntriesByType('layout-shift').reduce((sum: number, entry: any) =>
        sum + (entry.hadRecentInput ? 0 : entry.value), 0)

      return {
        lcp: lcp ? lcp.startTime : null,
        fid: fid ? fid.processingStart - fid.startTime : null,
        cls: cls
      }
    })
  }

  /**
   * Check performance budget
   */
  async checkPerformanceBudget(budget: PerformanceBudget): Promise<{
    passed: boolean
    violations: string[]
  }> {
    const metrics = this.metrics || await this.stopMonitoring()
    const violations: string[] = []

    if (metrics.totalLoadTime > budget.maxLoadTime) {
      violations.push(`Load time ${metrics.totalLoadTime}ms exceeds budget ${budget.maxLoadTime}ms`)
    }

    if (metrics.totalResourceSize > budget.maxResourceSize) {
      violations.push(`Resource size ${metrics.totalResourceSize} bytes exceeds budget ${budget.maxResourceSize} bytes`)
    }

    if (metrics.totalRequests > budget.maxRequests) {
      violations.push(`Request count ${metrics.totalRequests} exceeds budget ${budget.maxRequests}`)
    }

    if (metrics.largestContentfulPaint && metrics.largestContentfulPaint > budget.maxLCP) {
      violations.push(`LCP ${metrics.largestContentfulPaint}ms exceeds budget ${budget.maxLCP}ms`)
    }

    if (metrics.cumulativeLayoutShift > budget.maxCLS) {
      violations.push(`CLS ${metrics.cumulativeLayoutShift} exceeds budget ${budget.maxCLS}`)
    }

    if (metrics.firstInputDelay && metrics.firstInputDelay > budget.maxFID) {
      violations.push(`FID ${metrics.firstInputDelay}ms exceeds budget ${budget.maxFID}ms`)
    }

    return {
      passed: violations.length === 0,
      violations
    }
  }

  /**
   * Simulate network conditions
   */
  async simulateNetworkConditions(type: 'fast' | 'slow' | 'offline'): Promise<void> {
    switch (type) {
      case 'fast':
        await this.page.route('**/*', (route) => route.continue())
        break

      case 'slow':
        await this.page.route('**/*', async (route) => {
          // Simulate 3G speeds
          await new Promise(resolve => setTimeout(resolve, 100))
          await route.continue()
        })
        break

      case 'offline':
        await this.page.route('**/*', (route) => {
          route.abort()
        })
        break
    }
  }

  /**
   * Measure memory usage
   */
  async measureMemoryUsage(): Promise<{
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  }> {
    return await this.page.evaluate(() => {
      const mem = (performance as any).memory
      return {
        usedJSHeapSize: mem.usedJSHeapSize,
        totalJSHeapSize: mem.totalJSHeapSize,
        jsHeapSizeLimit: mem.jsHeapSizeLimit
      }
    })
  }

  /**
   * Generate performance report
   */
  async generatePerformanceReport(budget?: PerformanceBudget): Promise<string> {
    const metrics = this.metrics || await this.stopMonitoring()
    const coreWebVitals = await this.measureCoreWebVitals()
    const memoryUsage = await this.measureMemoryUsage()

    let budgetCheck = null
    if (budget) {
      budgetCheck = await this.checkPerformanceBudget(budget)
    }

    const report = `
# Performance Test Report

## Navigation Timing
- DOM Content Loaded: ${metrics.domContentLoaded}ms
- Load Complete: ${metrics.loadComplete}ms
- Total Load Time: ${metrics.totalLoadTime}ms

## Core Web Vitals
- First Contentful Paint: ${metrics.firstContentfulPaint || 'N/A'}ms
- Largest Contentful Paint: ${coreWebVitals.lcp || 'N/A'}ms
- First Input Delay: ${coreWebVitals.fid || 'N/A'}ms
- Cumulative Layout Shift: ${coreWebVitals.cls}

## Resource Metrics
- Total Resources: ${metrics.totalResources}
- Total Size: ${(metrics.totalResourceSize / 1024).toFixed(2)} KB
- CSS Resources: ${metrics.cssResources}
- JS Resources: ${metrics.jsResources}
- Image Resources: ${metrics.imageResources}

## Network Requests
- Total Requests: ${metrics.totalRequests}
- Failed Requests: ${metrics.failedRequests}
- Slow Requests (>1s): ${metrics.slowRequests}

## Memory Usage
- Used JS Heap: ${(memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB
- Total JS Heap: ${(memoryUsage.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB
- Heap Limit: ${(memoryUsage.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB

${budgetCheck ? `
## Performance Budget
Status: ${budgetCheck.passed ? '✅ PASSED' : '❌ FAILED'}
${budgetCheck.violations.map(v => `- ${v}`).join('\n')}
` : ''}

Generated at: ${new Date().toISOString()}
    `

    return report.trim()
  }

  /**
   * Compare performance metrics with baseline
   */
  async compareWithBaseline(baseline: Partial<PerformanceMetrics>): Promise<{
    regressions: string[]
    improvements: string[]
  }> {
    const current = this.metrics || await this.stopMonitoring()
    const regressions: string[] = []
    const improvements: string[] = []

    // Compare key metrics
    const comparisons = [
      { key: 'totalLoadTime', name: 'Total Load Time', threshold: 100 },
      { key: 'largestContentfulPaint', name: 'Largest Contentful Paint', threshold: 100 },
      { key: 'firstInputDelay', name: 'First Input Delay', threshold: 50 },
      { key: 'cumulativeLayoutShift', name: 'Cumulative Layout Shift', threshold: 0.1 }
    ]

    for (const comp of comparisons) {
      const currentValue = (current as any)[comp.key]
      const baselineValue = (baseline as any)[comp.key]

      if (currentValue && baselineValue) {
        const diff = currentValue - baselineValue
        if (diff > comp.threshold) {
          regressions.push(`${comp.name}: +${diff.toFixed(2)} (${baselineValue.toFixed(2)} → ${currentValue.toFixed(2)})`)
        } else if (diff < -comp.threshold) {
          improvements.push(`${comp.name}: ${diff.toFixed(2)} (${baselineValue.toFixed(2)} → ${currentValue.toFixed(2)})`)
        }
      }
    }

    return { regressions, improvements }
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics | null {
    return this.metrics
  }
}
