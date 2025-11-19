import { Page, Route, expect, TestInfo } from '@playwright/test'
import fs from 'fs'
import path from 'path'

/**
 * 模态对话框处理工具
 */
export class ModalHandler {
  /**
   * 处理常见的模态对话框
   */
  static async handleCommonModals(page: Page): Promise<void> {
    try {
      // 查找常见的模态对话框关闭按钮
      const closeSelectors = [
        '[class*="close"]',
        '[class*="dialog"] [aria-label*="关闭"]',
        '[class*="modal"] [aria-label*="关闭"]',
        'button:has-text("关闭")',
        'button:has-text("取消")',
        '.el-dialog__headerbtn',
        '.el-message-box__btns button'
      ];

      for (const selector of closeSelectors) {
        try {
          const closeButton = page.locator(selector).first();
          const isVisible = await closeButton.isVisible().catch(() => false);
          if (isVisible) {
            await closeButton.click({ timeout: 2000 });
            console.log(`✅ 关闭了模态对话框: ${selector}`);
            await page.waitForTimeout(500);
            break;
          }
        } catch (e) {
          // 继续尝试下一个选择器
        }
      }

      // 处理遮罩层
      const overlaySelectors = [
        '.el-overlay',
        '.el-modal__mask',
        '.v-modal',
        '[class*="overlay"]'
      ];

      for (const selector of overlaySelectors) {
        try {
          const overlay = page.locator(selector).first();
          const isVisible = await overlay.isVisible().catch(() => false);
          if (isVisible) {
            // 点击遮罩层外部关闭模态框
            await overlay.click({ position: { x: 1, y: 1 }, timeout: 2000 });
            console.log(`✅ 点击遮罩层关闭模态框`);
            await page.waitForTimeout(500);
            break;
          }
        } catch (e) {
          // 继续
        }
      }
    } catch (error) {
      console.warn('⚠️ 处理模态对话框时出现问题:', error.message);
    }
  }

  /**
   * 等待模态对话框消失
   */
  static async waitForModalToDisappear(page: Page, timeout = 10000): Promise<void> {
    try {
      await page.waitForFunction(() => {
        const modals = document.querySelectorAll('.el-dialog, .el-message-box, [role="dialog"]');
        return modals.length === 0;
      }, { timeout });
    } catch (error) {
      console.warn('⚠️ 等待模态对话框消失超时');
    }
  }
}

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
      const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
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
        const timing = response.timing()
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

      interface FirstInputEntry extends PerformanceEntry {
        processingStart: number
        startTime: number
      }

      interface LayoutShiftEntry extends PerformanceEntry {
        value: number
        hadRecentInput: boolean
      }

      const fidEntry = performance.getEntriesByType('first-input')[0] as FirstInputEntry | undefined
      const clsEntry = performance.getEntriesByType('layout-shift').reduce((sum, entry) => {
        const shiftEntry = entry as LayoutShiftEntry
        return sum + (shiftEntry.hadRecentInput ? 0 : shiftEntry.value)
      }, 0)

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
 * 网络请求拦截工具
 */
export class NetworkUtils {
  /**
   * 拦截的请求数据接口
   */
  interface InterceptedRequest {
    url: string
    method: string
    headers: Record<string, string>
    postData: string | null
    timestamp: number
  }

  /**
   * 拦截的响应数据接口
   */
  interface InterceptedResponse {
    url: string
    status: number
    headers: Record<string, string>
    timestamp: number
  }

  private static interceptedRequests: Map<string, InterceptedRequest[]> = new Map()
  private static interceptedResponses: Map<string, InterceptedResponse[]> = new Map()

  /**
   * 拦截并记录请求
   */
  static async interceptRequests(page: Page, pattern: string | RegExp = '**'): Promise<void> {
    const requestKey = pattern.toString()
    this.interceptedRequests.set(requestKey, [])

    page.on('request', (request) => {
      const url = request.url()
      if (typeof pattern === 'string' ? url.includes(pattern) : pattern.test(url)) {
        this.interceptedRequests.get(requestKey)?.push({
          url,
          method: request.method(),
          headers: request.headers(),
          postData: request.postData(),
          timestamp: Date.now()
        })
      }
    })
  }

  /**
   * 拦截并记录响应
   */
  static async interceptResponses(page: Page, pattern: string | RegExp = '**'): Promise<void> {
    const responseKey = pattern.toString()
    this.interceptedResponses.set(responseKey, [])

    page.on('response', (response) => {
      const url = response.url()
      if (typeof pattern === 'string' ? url.includes(pattern) : pattern.test(url)) {
        this.interceptedResponses.get(responseKey)?.push({
          url,
          status: response.status(),
          headers: response.headers(),
          timestamp: Date.now()
        })
      }
    })
  }

  /**
   * 获取拦截的请求
   */
  static getInterceptedRequests(pattern: string | RegExp = '**'): InterceptedRequest[] {
    return this.interceptedRequests.get(pattern.toString()) || []
  }

  /**
   * 获取拦截的响应
   */
  static getInterceptedResponses(pattern: string | RegExp = '**'): InterceptedResponse[] {
    return this.interceptedResponses.get(pattern.toString()) || []
  }

  /**
   * 清除拦截记录
   */
  static clearInterceptions(): void {
    this.interceptedRequests.clear()
    this.interceptedResponses.clear()
  }

  /**
   * Mock网络延迟
   */
  static async mockNetworkDelay(page: Page, pattern: string | RegExp, delayMs: number): Promise<void> {
    await page.route(pattern, async (route) => {
      await new Promise(resolve => setTimeout(resolve, delayMs))
      await route.continue()
    })
  }

  /**
   * Mock网络错误
   */
  static async mockNetworkError(page: Page, pattern: string | RegExp, statusCode = 500): Promise<void> {
    await page.route(pattern, async (route) => {
      await route.fulfill({
        status: statusCode,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Network error', code: statusCode })
      })
    })
  }
}

/**
 * 测试数据工具
 */
export class TestDataUtils {
  /**
   * 测试数据类型接口
   */
  interface TestData {
    user?: {
      yonghuming: string
      shouji: string
      shenfenzheng: string
    }
    coach?: {
      jiaolianxingming: string
      nianling: number
      zhuanye: string
      jingyan: string
    }
    course?: {
      kechengmingcheng: string
      kechengleixing: string
      shichang: string
      jiage: string
    }
    booking?: {
      yonghuming: string
      kechengmingcheng: string
      yuyueshijian: string
      zhuangtai: string
    }
  }

  /**
   * 生成随机测试数据（兼容性方法，已废弃，建议使用TestDataManager）
   * @deprecated 使用 TestDataManager.generateIsolatedUser() 等方法
   */
  static generateRandomData(type: 'user' | 'coach' | 'course' | 'booking'): TestData {
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
  /**
   * 测试步骤接口
   */
  interface TestStep {
    name: string
    timestamp: string
    details?: unknown
    type?: string
    metrics?: Record<string, unknown>
  }

  private static testResults: TestStep[] = []

  /**
   * 记录测试步骤
   */
  static logTestStep(stepName: string, details?: unknown): void {
    const step: TestStep = {
      name: stepName,
      timestamp: new Date().toISOString(),
      details
    }
    console.log(`[TEST STEP] ${stepName}`, details || '')
    ReportUtils.testResults.push(step)
  }

  /**
   * 记录性能指标
   */
  static logPerformanceMetrics(metrics: Record<string, unknown>): void {
    const step: TestStep = {
      name: 'performance_metrics',
      type: 'performance',
      metrics,
      timestamp: new Date().toISOString()
    }
    console.log('[PERFORMANCE]', metrics)
    ReportUtils.testResults.push(step)
  }

  /**
   * 导出测试结果
   */
  static exportTestResults(): TestStep[] {
    return [...ReportUtils.testResults]
  }

  /**
   * 清除测试结果
   */
  static clearTestResults(): void {
    ReportUtils.testResults = []
  }
}

// 导出便捷函数
export const waitFor = WaitUtils.waitForInteractable
export const waitForPage = WaitUtils.waitForPageStable
export const takeScreenshot = ScreenshotUtils.takeFullPageScreenshot
export const measurePerformance = PerformanceUtils.measurePageLoadTime
export const interceptNetwork = NetworkUtils.interceptRequests
export const generateTestData = TestDataUtils.generateRandomData
export const assertElement = AssertionUtils.assertElementExists
export const assertUrl = AssertionUtils.assertUrl
export const logStep = ReportUtils.logTestStep

/**
 * Enhanced page waiting utility with better error handling
 */
export async function waitForPageLoad(page: Page, options: {
  timeout?: number,
  waitForNetwork?: boolean,
  expectedText?: string
} = {}): Promise<void> {
  const { timeout = 10000, waitForNetwork = true, expectedText } = options

  try {
    // Wait for DOM to be ready
    await page.waitForLoadState('domcontentloaded', { timeout })

    // Wait for network to be idle if requested
    if (waitForNetwork) {
      await page.waitForLoadState('networkidle', { timeout })
    }

    // Wait for expected text if provided
    if (expectedText) {
      await page.waitForSelector(`text=${expectedText}`, { timeout: timeout / 2 })
    }

    // Additional wait for any dynamic content
    await page.waitForTimeout(500)
  } catch (error) {
    console.warn(`Page load wait failed: ${error.message}`)
    // Don't throw, just warn - some tests might still work
  }
}

/**
 * Robust element waiting with multiple fallback strategies
 */
export async function waitForElement(page: Page, selectors: string | string[], options: {
  timeout?: number,
  visible?: boolean,
  multiple?: boolean
} = {}): Promise<boolean> {
  const { timeout = 5000, visible = true, multiple = false } = options
  const selectorArray = Array.isArray(selectors) ? selectors : [selectors]

  for (const selector of selectorArray) {
    try {
      const locator = page.locator(selector)
      if (multiple) {
        await locator.first().waitFor({ state: visible ? 'visible' : 'attached', timeout })
      } else {
        await locator.waitFor({ state: visible ? 'visible' : 'attached', timeout })
      }
      return true
    } catch (error) {
      // Try next selector
      continue
    }
  }

  return false
}

/**
 * Fill form field with multiple fallback strategies
 */
export async function fillFormField(page: Page, selectors: string | string[], value: string, options: {
  clear?: boolean,
  timeout?: number
} = {}): Promise<boolean> {
  const { clear = true, timeout = 5000 } = options
  const selectorArray = Array.isArray(selectors) ? selectors : [selectors]

  for (const selector of selectorArray) {
    try {
      const locator = page.locator(selector).first()
      if (clear) {
        await locator.clear()
      }
      await locator.fill(value)
      return true
    } catch (error) {
      // Try next selector
      continue
    }
  }

  return false
}

/**
 * Click element with multiple fallback strategies
 */
export async function clickElement(page: Page, selectors: string | string[], options: {
  timeout?: number,
  force?: boolean
} = {}): Promise<boolean> {
  const { timeout = 5000, force = false } = options
  const selectorArray = Array.isArray(selectors) ? selectors : [selectors]

  for (const selector of selectorArray) {
    try {
      const locator = page.locator(selector).first()
      await locator.click({ timeout, force })
      return true
    } catch (error) {
      // Try next selector
      continue
    }
  }

  return false
}

/**
 * Setup complete front-end mock environment for E2E tests
 */
export async function setupCompleteFrontMock(page: Page): Promise<void> {
  // Mock login API
  await page.route('**/yonghu/login', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        msg: '登录成功',
        token: 'mock-jwt-token-for-testing'
      })
    })
  })

  // Mock registration API
  await page.route('**/yonghu/register', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        msg: '注册成功'
      })
    })
  })

  // Mock user session API
  await page.route('**/yonghu/session', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        data: {
          id: 1,
          yonghuzhanghao: 'testuser',
          yonghuxingming: '测试用户',
          shoujihaoma: '13800138000'
        }
      })
    })
  })

  // Mock course APIs with more comprehensive data
  await page.route('**/jianshenkecheng/**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        data: [
          {
            id: 1,
            kechengmingcheng: '燃脂瑜伽课程',
            kechengjianjie: '通过瑜伽体式和呼吸法，有效燃烧脂肪，提升身体柔韧性',
            kechengleixing: '瑜伽',
            jiage: '128',
            shichang: '60分钟',
            shangkeshijian: '2024-12-01 10:00:00',
            shangkedidian: '瑜伽馆A区',
            jiaolianxingming: '张教练',
            clicknum: 156,
            tupian: '/uploads/yoga.jpg'
          },
          {
            id: 2,
            kechengmingcheng: '力量训练入门',
            kechengjianjie: '适合初学者的力量训练课程，掌握基本动作和技术',
            kechengleixing: '力量训练',
            jiage: '98',
            shichang: '45分钟',
            shangkeshijian: '2024-12-02 14:00:00',
            shangkedidian: '力量区B室',
            jiaolianxingming: '李教练',
            clicknum: 89,
            tupian: '/uploads/strength.jpg'
          },
          {
            id: 3,
            kechengmingcheng: 'HIIT高强度间歇训练',
            kechengjianjie: '高强度间歇训练，短时间内达到最佳燃脂效果',
            kechengleixing: 'HIIT',
            jiage: '158',
            shichang: '30分钟',
            shangkeshijian: '2024-12-03 16:00:00',
            shangkedidian: '有氧区C室',
            jiaolianxingming: '王教练',
            clicknum: 203,
            tupian: '/uploads/hiit.jpg'
          }
        ],
        total: 3
      })
    })
  })

  // Mock booking APIs with conflict detection support
  await page.route('**/kechengyuyue/**', async (route: Route) => {
    const url = route.request().url()
    const method = route.request().method()

    // Handle GET requests for booking list
    if (method === 'GET' && url.includes('/list')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 0,
          data: [
            {
              id: 1,
              kechengid: 1,
              kechengmingcheng: '燃脂瑜伽课程',
              yuyueshijian: '2024-12-10 09:00:00',
              yonghuzhanghao: 'testuser',
              yonghuxingming: '测试用户',
              shoujihaoma: '13800138000',
              zhuangtai: '已预约'
            }
          ],
          total: 1
        })
      })
      return
    }

    // Handle POST requests for creating bookings
    if (method === 'POST') {
      const postData = route.request().postDataJSON()
      
      // Simulate conflict detection - if booking time is 09:00, return conflict
      if (postData?.yuyueshijian?.includes('09:00')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 409,
            msg: '该时间段已有预约，请选择其他时间'
          })
        })
        return
      }

      // Successful booking
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 0,
          data: {
            id: Date.now(),
            ...postData
          },
          msg: '预约成功'
        })
      })
      return
    }

    // Default response
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        msg: '操作成功'
      })
    })
  })

  // Mock membership card APIs
  await page.route('**/huiyuanka/**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        data: [
          {
            id: 1,
            huiyuankamingcheng: '月卡',
            jiage: '299',
            youxiaoqi: '30',
            huiyuankaxiangqing: '月卡会员，享受所有课程8折优惠',
            tupian: '/uploads/monthly.jpg'
          },
          {
            id: 2,
            huiyuankamingcheng: '季卡',
            jiage: '799',
            youxiaoqi: '90',
            huiyuankaxiangqing: '季卡会员，享受所有课程7折优惠',
            tupian: '/uploads/quarterly.jpg'
          },
          {
            id: 3,
            huiyuankamingcheng: '年卡',
            jiage: '2499',
            youxiaoqi: '365',
            huiyuankaxiangqing: '年卡会员，享受所有课程6折优惠，赠送私教课程',
            tupian: '/uploads/yearly.jpg'
          }
        ],
        total: 3
      })
    })
  })

  // Mock membership purchase APIs
  await page.route('**/huiyuankagoumai/**', async (route: Route) => {
    const method = route.request().method()
    
    if (method === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 0,
          data: {
            id: Date.now(),
            dingdanhao: `ORD${Date.now()}`,
            zhuangtai: '待支付'
          },
          msg: '订单创建成功'
        })
      })
      return
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        msg: '操作成功'
      })
    })
  })

  // Mock private coach APIs
  await page.route('**/jianshenjiaolian/**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        data: [
          {
            id: 1,
            jiaolianxingming: '张教练',
            jiaoliangonghao: 'COACH001',
            shanchanglingyu: '增肌力量',
            jiage: '600',
            pingfen: '4.8',
            tupian: '/uploads/coach1.jpg',
            jianjie: '专业力量训练教练，10年经验'
          },
          {
            id: 2,
            jiaolianxingming: '李教练',
            jiaoliangonghao: 'COACH002',
            shanchanglingyu: '燃脂塑形',
            jiage: '500',
            pingfen: '4.9',
            tupian: '/uploads/coach2.jpg',
            jianjie: 'HIIT训练专家，帮助数百人成功减脂'
          },
          {
            id: 3,
            jiaolianxingming: '王教练',
            jiaoliangonghao: 'COACH003',
            shanchanglingyu: '体态修复',
            jiage: '700',
            pingfen: '4.7',
            tupian: '/uploads/coach3.jpg',
            jianjie: '康复训练专家，专注体态矫正'
          }
        ],
        total: 3
      })
    })
  })

  // Mock private coach booking APIs
  await page.route('**/sijiaoyuyue/**', async (route: Route) => {
    const method = route.request().method()
    const url = route.request().url()
    
    if (method === 'GET' && url.includes('/list')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 0,
          data: [
            {
              id: 1,
              jiaoliangonghao: 'COACH001',
              jiaolianxingming: '张教练',
              yuyueshijian: '2024-12-10 14:00:00',
              yonghuzhanghao: 'testuser',
              yonghuxingming: '测试用户',
              shoujihaoma: '13800138000',
              zhuangtai: '已预约'
            }
          ],
          total: 1
        })
      })
      return
    }

    if (method === 'POST') {
      const postData = route.request().postDataJSON()
      
      // Simulate conflict detection
      if (postData?.yuyueshijian?.includes('14:00')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 409,
            msg: '该时间段已有预约，请选择其他时间'
          })
        })
        return
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 0,
          data: {
            id: Date.now(),
            ...postData
          },
          msg: '私教预约成功'
        })
      })
      return
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        msg: '操作成功'
      })
    })
  })

  // Mock payment APIs
  await page.route('**/payment/**', async (route: Route) => {
    const method = route.request().method()
    
    if (method === 'POST') {
      const postData = route.request().postDataJSON()
      
      // Simulate payment success
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 0,
          data: {
            orderId: `PAY${Date.now()}`,
            paymentId: `PAYMENT${Date.now()}`,
            status: 'success',
            amount: postData?.amount || 0
          },
          msg: '支付成功'
        })
      })
      return
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        msg: '操作成功'
      })
    })
  })

  // Mock user center APIs
  await page.route('**/yonghu/info**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        data: {
          id: 1,
          yonghuzhanghao: 'testuser',
          yonghuxingming: '测试用户',
          shoujihaoma: '13800138000',
          xingbie: '男',
          youxiang: 'test@example.com',
          tupian: '/uploads/avatar.jpg'
        }
      })
    })
  })

  // Mock user favorites APIs
  await page.route('**/shoucang/**', async (route: Route) => {
    const method = route.request().method()
    
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 0,
          data: [
            {
              id: 1,
              biaoti: '燃脂瑜伽课程',
              biao: 'jianshenkecheng',
              biaoid: 1
            }
          ],
          total: 1
        })
      })
      return
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        msg: '操作成功'
      })
    })
  })

  // Mock user messages APIs
  await page.route('**/xiaoxi/**', async (route: Route) => {
    const method = route.request().method()

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 0,
          data: [
            {
              id: 1,
              biaoti: '系统通知',
              neirong: '您的预约已确认',
              shijian: '2024-12-01 10:00:00',
              zhuangtai: '未读'
            }
          ],
          total: 1
        })
      })
      return
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        msg: '操作成功'
      })
    })
  })

  // Mock equipment management APIs (器材管理)
  await page.route('**/jianshenqicai/**', async (route: Route) => {
    const method = route.request().method()
    const url = route.request().url()

    // Handle GET requests for equipment list
    if (method === 'GET' && url.includes('/list')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 0,
          data: [
            {
              id: 1,
              qicaimingcheng: '跑步机',
              qicaileixing: '有氧器材',
              zhuangtai: '可用',
              weizhi: '一楼有氧区',
              jiage: '免费',
              shuliang: '5',
              tupian: '/uploads/treadmill.jpg'
            },
            {
              id: 2,
              qicaimingcheng: '哑铃组',
              qicaileixing: '力量器材',
              zhuangtai: '部分可用',
              weizhi: '二楼力量区',
              jiage: '免费',
              shuliang: '12',
              tupian: '/uploads/dumbbells.jpg'
            },
            {
              id: 3,
              qicaimingcheng: '瑜伽垫',
              qicaileixing: '辅助器材',
              zhuangtai: '可用',
              weizhi: '瑜伽馆',
              jiage: '免费',
              shuliang: '20',
              tupian: '/uploads/yoga-mat.jpg'
            }
          ],
          total: 3
        })
      })
      return
    }

    // Handle POST requests for equipment booking
    if (method === 'POST') {
      const postData = route.request().postDataJSON()

      // Simulate booking conflict
      if (postData?.shijian?.includes('09:00')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 409,
            msg: '该时间段器材已被预约'
          })
        })
        return
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 0,
          data: {
            id: Date.now(),
            ...postData
          },
          msg: '器材预约成功'
        })
      })
      return
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        msg: '操作成功'
      })
    })
  })

  // Mock news APIs (新闻资讯)
  await page.route('**/news/**', async (route: Route) => {
    const method = route.request().method()
    const url = route.request().url()

    // Handle GET requests for news list
    if (method === 'GET' && url.includes('/list')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 0,
          data: [
            {
              id: 1,
              title: '健身新趋势：HIIT训练大揭秘',
              content: 'HIIT（高强度间歇训练）已成为现代健身的重要方式...',
              author: '健身专家',
              addtime: '2024-12-01 10:00:00',
              clicknum: 156,
              tupian: '/uploads/hiit-news.jpg',
              thumbsupnum: 23,
              crazilynum: 5
            },
            {
              id: 2,
              title: '冬季健身注意事项',
              content: '冬季健身需要特别注意保暖和热身...',
              author: '营养师',
              addtime: '2024-12-02 14:00:00',
              clicknum: 89,
              tupian: '/uploads/winter-fitness.jpg',
              thumbsupnum: 15,
              crazilynum: 2
            },
            {
              id: 3,
              title: '瑜伽初学者指南',
              content: '瑜伽不仅能塑造身材，更能带来心灵的宁静...',
              author: '瑜伽教练',
              addtime: '2024-12-03 16:00:00',
              clicknum: 203,
              tupian: '/uploads/yoga-guide.jpg',
              thumbsupnum: 45,
              crazilynum: 8
            }
          ],
          total: 3
        })
      })
      return
    }

    // Handle POST requests for likes/comments
    if (method === 'POST') {
      const postData = route.request().postDataJSON()

      if (postData?.thumbsup) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 0,
            msg: '点赞成功'
          })
        })
        return
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 0,
          data: {
            id: Date.now(),
            ...postData
          },
          msg: '评论成功'
        })
      })
      return
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        msg: '操作成功'
      })
    })
  })

  // Mock chat/communication APIs (聊天交流)
  await page.route('**/liaotian/**', async (route: Route) => {
    const method = route.request().method()
    const url = route.request().url()

    // Handle GET requests for chat messages
    if (method === 'GET' && url.includes('/list')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 0,
          data: [
            {
              id: 1,
              sender: '教练张',
              receiver: 'testuser',
              content: '您好，欢迎来到健身房！',
              sendtime: '2024-12-01 09:00:00',
              isread: 1
            },
            {
              id: 2,
              sender: 'testuser',
              receiver: '教练张',
              content: '谢谢教练，我想了解一下健身计划',
              sendtime: '2024-12-01 09:05:00',
              isread: 0
            },
            {
              id: 3,
              sender: '教练张',
              receiver: 'testuser',
              content: '好的，我建议您从基础训练开始',
              sendtime: '2024-12-01 09:10:00',
              isread: 0
            }
          ],
          total: 3
        })
      })
      return
    }

    // Handle POST requests for sending messages
    if (method === 'POST') {
      const postData = route.request().postDataJSON()

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 0,
          data: {
            id: Date.now(),
            ...postData,
            sendtime: new Date().toISOString().slice(0, 19).replace('T', ' ')
          },
          msg: '消息发送成功'
        })
      })
      return
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        msg: '操作成功'
      })
    })
  })

  // Alternative chat API endpoints
  await page.route('**/chat/**', async (route: Route) => {
    const method = route.request().method()

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 0,
          data: [
            {
              id: 1,
              sender: '系统',
              message: '欢迎使用在线客服系统',
              timestamp: '2024-12-01 10:00:00'
            }
          ],
          total: 1
        })
      })
      return
    }

    if (method === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 0,
          msg: '消息已发送'
        })
      })
      return
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        msg: '操作成功'
      })
    })
  })

  // Mock file upload API
  await page.route('**/file/upload', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        data: '/uploads/avatar.jpg'
      })
    })
  })
}

/**
 * Handle Cookie consent dialog that blocks tests
 */
export async function handleCookieConsent(page: Page): Promise<void> {
  try {
    // First, try to set localStorage to prevent dialog from showing
    await page.addInitScript(() => {
      localStorage.setItem('cookie_consent', 'accepted')
      localStorage.setItem('cookie_settings', JSON.stringify({
        necessary: true,
        analytics: false,
        marketing: false
      }))
    })

    // Wait a bit for dialog to potentially appear
    await page.waitForTimeout(1000)

    // Look for common cookie consent selectors (Element Plus dialog)
    const cookieSelectors = [
      '.accept-btn', // Element Plus button class
      'button.accept-btn',
      'button:has-text("接受")',
      'button:has-text("Accept")',
      'button:has-text("同意")',
      'button:has-text("Agree")',
      'button:has-text("允许")',
      'button:has-text("Allow")',
      '[data-testid*="cookie-accept"]',
      '[data-testid*="cookie-agree"]',
      '.cookie-accept',
      '.cookie-agree',
      '#cookie-accept',
      '#cookie-agree',
      // Element Plus dialog footer buttons
      '.el-dialog__footer button:has-text("接受")',
      '.el-dialog__footer button:has-text("Accept")',
      '.cookie-footer button:has-text("接受")',
      '.cookie-footer .accept-btn'
    ]

    for (const selector of cookieSelectors) {
      try {
        const button = page.locator(selector).first()
        if (await button.isVisible({ timeout: 2000 })) {
          await button.click()
          console.log(`Accepted cookies using selector: ${selector}`)
          await page.waitForTimeout(500) // Wait for dialog to close
          // Ensure localStorage is set after clicking
          await page.evaluate(() => {
            localStorage.setItem('cookie_consent', 'accepted')
          })
          break
        }
      } catch (error) {
        // Continue to next selector
      }
    }

    // Also check if dialog is still visible and try to close it
    const dialog = page.locator('.el-dialog, .cookie-consent-dialog')
    if (await dialog.isVisible({ timeout: 1000 }).catch(() => false)) {
      // Try clicking outside or pressing Escape
      await page.keyboard.press('Escape')
      await page.waitForTimeout(300)
    }
  } catch (error) {
    console.warn(`Cookie consent handling failed: ${error.message}`)
  }
}

/**
 * Enhanced mock setup with better error handling
 */
export async function setupEnhancedMock(page: Page): Promise<void> {
  try {
    // Basic API mocks
    await setupCompleteFrontMock(page)

    // Additional common mocks
    await page.route('**/favicon.ico', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'image/x-icon',
        body: Buffer.from('')
      })
    })

    // Mock static assets with shorter timeout
    await page.route('**/*.{png,jpg,jpeg,gif,svg}', async (route) => {
      try {
        await route.continue({ timeout: 2000 })
      } catch (error) {
        // Provide empty image response for failed assets
        await route.fulfill({
          status: 200,
          contentType: 'image/png',
          body: Buffer.from('')
        })
      }
    })

  } catch (error) {
    console.warn(`Mock setup failed: ${error.message}`)
  }
}

/**
 * 测试数据隔离设置
 */
export async function setupTestDataIsolation(page: Page, testInfo: TestInfo): Promise<{
  testId: string
  dataManager: TestDataManager
  cleanup: () => Promise<void>
}> {
  const { TestDataManager } = await import('./test-data-manager')
  const dataManager = TestDataManager.getInstance()
  const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // 创建测试数据上下文
  const context = dataManager.createTestContext(testId, testInfo.title || 'unknown_test')

  // 设置页面上下文用于数据清理
  const cleanup = async () => {
    await dataManager.cleanupTestContext(testId, page)
  }

  return { testId, dataManager, cleanup }
}

/**
 * 性能监控设置
 */
export async function setupPerformanceMonitoring(page: Page, testInfo: TestInfo): Promise<{
  monitor: PerformanceMonitor
  startMonitoring: () => Promise<void>
  stopMonitoring: () => Promise<unknown>
  markCheckpoint: (name: string) => Promise<number>
}> {
  const { PerformanceMonitor } = await import('./performance-monitor')
  const testId = `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const monitor = new PerformanceMonitor(page, testId, testInfo.title || 'unknown_test')

  return {
    monitor,
    startMonitoring: () => monitor.startMonitoring(),
    stopMonitoring: () => monitor.stopMonitoring(),
    markCheckpoint: (name: string) => monitor.markCheckpoint(name)
  }
}

/**
 * Complete test setup including mocks and common page preparations
 */
export async function setupTestEnvironment(page: Page): Promise<void> {
  // Setup mocks first
  await setupEnhancedMock(page)

  // Pre-set localStorage to prevent cookie dialog
  await page.addInitScript(() => {
    localStorage.setItem('cookie_consent', 'accepted')
    localStorage.setItem('cookie_settings', JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false
    }))
  })

  // Add cookie consent handler for cases where dialog still appears
  await page.addLocatorHandler(
    page.locator('text=Cookie 使用提示, text=Cookies, .cookie-consent-dialog, .el-dialog:has-text("Cookie")'),
    async () => {
      await handleCookieConsent(page)
    }
  )

  // Add modal dialog handler
  await page.addLocatorHandler(
    page.locator('.el-dialog, .el-message-box, [role="dialog"]'),
    async () => {
      console.log('🎯 检测到模态对话框，尝试处理...')
      await ModalHandler.handleCommonModals(page)
      await ModalHandler.waitForModalToDisappear(page, 3000)
    }
  )

  // Handle any cookie dialogs that appear
  page.on('dialog', async (dialog) => {
    console.log(`Dialog detected: ${dialog.message()}`)
    await dialog.accept()
  })

  // Wait for page to be ready
  await page.waitForLoadState('domcontentloaded')

  // Final modal cleanup after page load
  try {
    await ModalHandler.handleCommonModals(page)
  } catch (error) {
    console.warn('⚠️ 页面加载后的模态对话框清理失败:', error.message)
  }
}

/**
 * Take screenshot with automatic naming
 */
export async function takeScreenshotWithTimestamp(page: Page, name: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const filename = `${name}_${timestamp}.png`
  await page.screenshot({ path: `test-results/screenshots/${filename}`, fullPage: true })
  return filename
}

/**
 * Log test step with consistent formatting
 */
export function logTestStep(step: string, details?: unknown): void {
  const timestamp = new Date().toISOString().substring(11, 23)
  console.log(`[${timestamp}] ${step}`)
  if (details) {
    console.log(`  └─ ${JSON.stringify(details)}`)
  }
}

/**
 * Enhanced assertion with better error messages
 */
export async function assertWithDetails(
  condition: boolean | Promise<boolean>,
  message: string,
  details?: unknown
): Promise<void> {
  const result = await condition
  if (!result) {
    const errorDetails = details ? `\nDetails: ${JSON.stringify(details, null, 2)}` : ''
    throw new Error(`${message}${errorDetails}`)
  }
}
