import { Page, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

/**
 * 通用等待工具
 */
export class WaitUtils {
  /**
   * 等待元素出现并可交互
   */
  static async waitForInteractable(page: Page, selector: string, timeout = 10000): Promise<void> {
    await page.waitForSelector(selector, { state: 'visible', timeout })
    await page.waitForSelector(selector, { state: 'attached', timeout })

    const element = page.locator(selector)
    await element.waitFor({ state: 'visible', timeout })
    await expect(element).toBeEnabled()
  }

  /**
   * 等待页面完全加载
   */
  static async waitForPageStable(page: Page, timeout = 30000): Promise<void> {
    await page.waitForLoadState('networkidle', { timeout })
    await page.waitForLoadState('domcontentloaded', { timeout })

    // 等待可能的异步操作完成
    await page.waitForTimeout(500)
  }

  /**
   * 等待文本出现
   */
  static async waitForText(page: Page, text: string, timeout = 10000): Promise<void> {
    await page.waitForSelector(`text=${text}`, { timeout })
  }

  /**
   * 等待URL变化
   */
  static async waitForUrlChange(page: Page, expectedUrl: string | RegExp, timeout = 10000): Promise<void> {
    await page.waitForURL(expectedUrl, { timeout })
  }
}

/**
 * 截图工具
 */
export class ScreenshotUtils {
  private static screenshotsDir = 'test-results/screenshots'

  /**
   * 确保截图目录存在
   */
  private static ensureScreenshotDir(): void {
    if (!fs.existsSync(this.screenshotsDir)) {
      fs.mkdirSync(this.screenshotsDir, { recursive: true })
    }
  }

  /**
   * 全页截图
   */
  static async takeFullPageScreenshot(page: Page, name: string): Promise<string> {
    this.ensureScreenshotDir()
    const fileName = `${name}_${Date.now()}.png`
    const filePath = path.join(this.screenshotsDir, fileName)

    await page.screenshot({ path: filePath, fullPage: true })
    return filePath
  }

  /**
   * 元素截图
   */
  static async takeElementScreenshot(page: Page, selector: string, name: string): Promise<string> {
    this.ensureScreenshotDir()
    const fileName = `${name}_element_${Date.now()}.png`
    const filePath = path.join(this.screenshotsDir, fileName)

    const element = page.locator(selector)
    await element.screenshot({ path: filePath })
    return filePath
  }

  /**
   * 视口截图
   */
  static async takeViewportScreenshot(page: Page, name: string): Promise<string> {
    this.ensureScreenshotDir()
    const fileName = `${name}_viewport_${Date.now()}.png`
    const filePath = path.join(this.screenshotsDir, fileName)

    await page.screenshot({ path: filePath })
    return filePath
  }
}

/**
 * 性能监控工具
 */
export class PerformanceUtils {
  /**
   * 测量页面加载时间
   */
  static async measurePageLoadTime(page: Page): Promise<{
    domContentLoaded: number
    load: number
    total: number
  }> {
    const navigationTiming = await page.evaluate(() => {
      const timing = performance.getEntriesByType('navigation')[0] as any
      return {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        load: timing.loadEventEnd - timing.navigationStart,
        total: timing.loadEventEnd - timing.navigationStart
      }
    })

    return navigationTiming
  }

  /**
   * 测量API响应时间
   */
  static async measureApiResponseTime(page: Page, apiPattern: string): Promise<number[]> {
    const responseTimes: number[] = []

    page.on('response', (response) => {
      const url = response.url()
      if (url.includes(apiPattern)) {
        const timing = (response as any).timing()
        if (timing.receiveHeadersEnd > 0) {
          const responseTime = timing.receiveHeadersEnd - timing.sendStart
          responseTimes.push(responseTime)
        }
      }
    })

    // 等待一段时间收集响应时间
    await page.waitForTimeout(2000)

    return responseTimes
  }

  /**
   * 获取性能指标
   */
  static async getPerformanceMetrics(page: Page): Promise<{
    firstContentfulPaint: number
    largestContentfulPaint: number
    firstInputDelay?: number
    cumulativeLayoutShift: number
  }> {
    return await page.evaluate(() => {
      const paintEntries = performance.getEntriesByType('paint')
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')
      const lcp = performance.getEntriesByType('largest-contentful-paint')[0]

      const fidEntry = performance.getEntriesByType('first-input')[0] as any
      const clsEntry = performance.getEntriesByType('layout-shift').reduce((sum, entry: any) => sum + (entry.hadRecentInput ? 0 : entry.value), 0)

      return {
        firstContentfulPaint: fcp ? fcp.startTime : 0,
        largestContentfulPaint: lcp ? lcp.startTime : 0,
        firstInputDelay: fidEntry ? fidEntry.processingStart - fidEntry.startTime : undefined,
        cumulativeLayoutShift: clsEntry
      }
    })
  }
}

/**
 * 测试数据工具
 */
export class TestDataUtils {
  /**
   * 生成随机测试数据
   */
  static generateRandomData(type: 'user' | 'coach' | 'course' | 'booking' | 'equipment' | 'news' | 'chat' | 'membership'): any {
    const timestamp = Date.now()
    const randomNum = Math.floor(Math.random() * 1000)

    switch (type) {
      case 'user':
        return {
          yonghuming: `测试用户${randomNum}`,
          shouji: `138001${randomNum.toString().padStart(5, '0')}`,
          shenfenzheng: `11010119900101${randomNum.toString().padStart(4, '0')}`
        }
      case 'coach':
        return {
          jiaolianxingming: `教练${randomNum}`,
          nianling: 25 + (randomNum % 20),
          zhuanye: ['力量训练', '瑜伽', '有氧健身', '搏击'][randomNum % 4],
          jingyan: `${3 + (randomNum % 10)}年`
        }
      case 'course':
        return {
          kechengmingcheng: `测试课程${randomNum}`,
          kechengleixing: ['有氧', '力量', '瑜伽', '搏击'][randomNum % 4],
          shichang: `${60 + (randomNum % 60)}分钟`,
          jiage: `${100 + (randomNum % 200)}`
        }
      case 'booking':
        return {
          yonghuming: `测试用户${randomNum}`,
          kechengmingcheng: `测试课程${randomNum}`,
          yuyueshijian: new Date(timestamp + randomNum * 3600000).toISOString().slice(0, 16).replace('T', ' '),
          zhuangtai: ['已预约', '已确认', '已完成', '已取消'][randomNum % 4]
        }
      case 'equipment':
        return {
          qicaimingcheng: `测试器材${randomNum}`,
          qicaileixing: ['力量器械', '有氧器械', '瑜伽辅助', '健身配件'][randomNum % 4],
          shuliang: `${5 + (randomNum % 20)}`,
          jiage: `${500 + (randomNum % 2000)}`
        }
      case 'news':
        return {
          title: `测试公告${randomNum}`,
          introduction: `这是测试公告${randomNum}的简介内容`,
          content: `这是测试公告${randomNum}的详细内容，包含了丰富的资讯和重要通知信息。`
        }
      case 'chat':
        return {
          content: `这是测试反馈内容${randomNum}，用户提出了使用建议或问题反馈`,
          reply: `感谢您的反馈，我们会尽快处理您的问题。`
        }
      case 'membership':
        return {
          huiyuankamingcheng: `测试会员卡${randomNum}`,
          jiage: `${500 + (randomNum % 2000)}`,
          youxiaoqi: `${30 + (randomNum % 365)}天`,
          fuwuneirong: `包含健身房所有课程无限次使用，私人教练指导等全方位服务`
        }
      default:
        return {}
    }
  }

  /**
   * 生成随机手机号
   */
  static generateRandomPhone(): string {
    const prefix = ['138', '139', '150', '151', '152', '157', '158', '159'][Math.floor(Math.random() * 8)]
    const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0')
    return prefix + suffix
  }

  /**
   * 生成随机日期时间
   */
  static generateRandomDateTime(daysFromNow = 0): string {
    const date = new Date()
    date.setDate(date.getDate() + daysFromNow)
    date.setHours(9 + Math.floor(Math.random() * 10)) // 9 AM to 7 PM
    date.setMinutes(Math.floor(Math.random() * 60))
    return date.toISOString().slice(0, 16).replace('T', ' ')
  }
}

/**
 * 断言工具
 */
export class AssertionUtils {
  /**
   * 断言页面标题
   */
  static async assertPageTitle(page: Page, expectedTitle: string | RegExp): Promise<void> {
    const title = await page.title()
    if (typeof expectedTitle === 'string') {
      expect(title).toBe(expectedTitle)
    } else {
      expect(title).toMatch(expectedTitle)
    }
  }

  /**
   * 断言URL
   */
  static async assertUrl(page: Page, expectedUrl: string | RegExp): Promise<void> {
    const url = page.url()
    if (typeof expectedUrl === 'string') {
      expect(url).toBe(expectedUrl)
    } else {
      expect(url).toMatch(expectedUrl)
    }
  }

  /**
   * 断言元素文本
   */
  static async assertElementText(page: Page, selector: string, expectedText: string | RegExp): Promise<void> {
    const element = page.locator(selector)
    const text = await element.textContent()
    if (typeof expectedText === 'string') {
      expect(text).toContain(expectedText)
    } else {
      expect(text).toMatch(expectedText)
    }
  }

  /**
   * 断言元素存在
   */
  static async assertElementExists(page: Page, selector: string): Promise<void> {
    const element = page.locator(selector)
    await expect(element).toBeVisible()
  }

  /**
   * 断言元素不存在
   */
  static async assertElementNotExists(page: Page, selector: string): Promise<void> {
    const element = page.locator(selector)
    await expect(element).not.toBeVisible()
  }

  /**
   * 断言表单字段值
   */
  static async assertFormFieldValue(page: Page, selector: string, expectedValue: string): Promise<void> {
    const element = page.locator(selector)
    await expect(element).toHaveValue(expectedValue)
  }
}

/**
 * 测试报告工具
 */
export class ReportUtils {
  private static testResults: any[] = []

  /**
   * 记录测试步骤
   */
  static logTestStep(stepName: string, details?: any): void {
    const step = {
      name: stepName,
      timestamp: new Date().toISOString(),
      details
    }
    console.log(`[TEST STEP] ${stepName}`, details || '')
    this.testResults.push(step)
  }

  /**
   * 记录性能指标
   */
  static logPerformanceMetrics(metrics: any): void {
    console.log('[PERFORMANCE]', metrics)
    this.testResults.push({
      type: 'performance',
      metrics,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * 导出测试结果
   */
  static exportTestResults(): any[] {
    return [...this.testResults]
  }

  /**
   * 清除测试结果
   */
  static clearTestResults(): void {
    this.testResults = []
  }
}

/**
 * 创建测试数据
 */
export async function createTestData(page: Page, type: string, data: any): Promise<void> {
  // 在实际测试中，这里会通过API创建测试数据
  // 目前先用Mock的方式处理
  logStep(`创建测试数据: ${type}`)
  await page.waitForTimeout(100) // 模拟API调用
}

/**
 * 清理测试数据
 */
export async function cleanupTestData(page: Page, type: string, identifier: string): Promise<void> {
  // 在实际测试中，这里会通过API删除测试数据
  // 目前先用Mock的方式处理
  logStep(`清理测试数据: ${type} - ${identifier}`)
  await page.waitForTimeout(100) // 模拟API调用
}

// 导出便捷函数
export const waitFor = WaitUtils.waitForInteractable
export const waitForPage = WaitUtils.waitForPageStable
export const takeScreenshot = ScreenshotUtils.takeFullPageScreenshot
export const measurePerformance = PerformanceUtils.measurePageLoadTime
export const generateTestData = TestDataUtils.generateRandomData
export const assertElement = AssertionUtils.assertElementExists
export const assertUrl = AssertionUtils.assertUrl
export const logStep = ReportUtils.logTestStep
