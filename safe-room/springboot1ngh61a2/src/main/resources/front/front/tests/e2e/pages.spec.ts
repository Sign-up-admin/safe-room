import { test, expect } from '@playwright/test'
import { mockFrontApi, seedFrontSession } from '../utils/test-helpers'
import { setupPerformanceMonitoring } from '../utils/shared-helpers'

test.describe('Front primary pages', () => {
  let performanceMonitor: any

  test.beforeEach(async ({ page }) => {
    await seedFrontSession(page)
    await mockFrontApi(page)

    // 设置性能监控
    const perfSetup = await setupPerformanceMonitoring(page, { title: 'pages-test' })
    performanceMonitor = perfSetup
    await perfSetup.startMonitoring()
  })

  test.afterEach(async ({ page }) => {
    // 停止性能监控并生成报�?
    if (performanceMonitor) {
      const report = await performanceMonitor.stopMonitoring()
      console.log(`📊 页面性能报告: ${report.testName}`)
      console.log(`   页面加载时间: ${report.metrics.pageLoad.load}ms`)
      console.log(`   DOM内容加载: ${report.metrics.pageLoad.domContentLoaded}ms`)
      console.log(`   网络请求�? ${report.metrics.network.totalRequests}`)
      if (report.violations.length > 0) {
        console.warn(`⚠️ 性能违规: ${report.violations.length} 项`)
      }
    }
  })

  test('renders home dashboard content', async ({ page }) => {
    await performanceMonitor.markCheckpoint('start_home_page')
    await page.goto('/#/index/home')
    await expect(page.getByText(/健身/)).toBeVisible()
    await performanceMonitor.markCheckpoint('home_page_loaded')
  })

  test('loads personal center layout', async ({ page }) => {
    await performanceMonitor.markCheckpoint('start_center_page')
    await page.goto('/#/index/center')
    await expect(page.locator('.form')).toBeVisible()
    await performanceMonitor.markCheckpoint('center_page_loaded')
  })

  test('displays payment page scaffold', async ({ page }) => {
    await performanceMonitor.markCheckpoint('start_payment_page')
    await page.goto('/#/index/pay')
    await expect(page.getByText(/订单/)).toBeVisible()
    await performanceMonitor.markCheckpoint('payment_page_loaded')
  })

  test('opens favorites page', async ({ page }) => {
    await performanceMonitor.markCheckpoint('start_favorites_page')
    await page.goto('/#/index/storeup')
    await expect(page.getByText(/收藏/)).toBeVisible()
    await performanceMonitor.markCheckpoint('favorites_page_loaded')
  })

  test('shows news list', async ({ page }) => {
    await performanceMonitor.markCheckpoint('start_news_page')
    await page.goto('/#/index/news')
    await expect(page.getByRole('heading', { name: /公告|新闻/ })).toBeVisible()
    await performanceMonitor.markCheckpoint('news_page_loaded')
  })
})
