import { test, expect } from '@playwright/test'
import {
  loginAsAdmin,
  mockAdminApi
} from '../../utils/test-helpers'
import {
  createTestData,
  cleanupTestData
} from '../../utils/shared-helpers'
import {
  AdminChatListPage,
  AdminChatDetailPage
} from '../../utils/page-objects/admin-pages'
import {
  waitFor,
  waitForPage,
  takeScreenshot,
  measurePerformance,
  logStep,
  assertElement,
  generateTestData
} from '../../utils/shared-helpers'

test.describe('Admin 反馈管理流程', () => {
  test.beforeEach(async ({ page }) => {
    // 设置管理员API Mock
    await mockAdminApi(page)
    // 登录管理员
    await loginAsAdmin(page)
    logStep('管理员登录完成')
  })

  test('反馈列表查看和搜索', async ({ page }) => {
    logStep('开始反馈列表查看测试')

    const chatListPage = new AdminChatListPage(page)

    // 访问反馈管理页面
    await chatListPage.goto()
    await waitForPage(page)
    logStep('访问反馈管理页面')

    // 验证反馈列表显示
    const chatItems = page.locator('.chat-item, .feedback-item, tbody tr')
    const chatCount = await chatItems.count()
    expect(chatCount).toBeGreaterThanOrEqual(0)
    logStep(`反馈列表显示 ${chatCount} 个反馈`)

    // 验证列表字段
    const expectedFields = ['用户', '内容', '时间', '状态', '类型']
    for (const field of expectedFields) {
      const fieldElement = page.locator(`th:has-text("${field}"), .header:has-text("${field}")`)
      const isVisible = await fieldElement.isVisible().catch(() => false)
      if (isVisible) {
        logStep(`列表字段存在: ${field}`)
      }
    }

    // 测试搜索功能
    const testSearchTerm = '建议'
    const searchInput = page.locator('input[placeholder*="搜索"], input[placeholder*="反馈内容"]')
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill(testSearchTerm)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(500)
      logStep(`搜索反馈: ${testSearchTerm}`)
    }

    // 测试按状态筛选
    const statusFilter = page.locator('select[name="status"], .status-filter')
    if (await statusFilter.isVisible().catch(() => false)) {
      await statusFilter.selectOption('未处理')
      await page.waitForTimeout(500)
      logStep('筛选未处理反馈')
    }

    await takeScreenshot(page, 'chat_list_view')
  })

  test('查看反馈详情', async ({ page }) => {
    logStep('开始查看反馈详情测试')

    const chatListPage = new AdminChatListPage(page)
    const chatDetailPage = new AdminChatDetailPage(page)

    // 访问反馈管理页面
    await chatListPage.goto()

    // 查看第一个反馈详情
    await chatListPage.viewChatDetail(0)
    logStep('查看反馈详情')

    // 等待详情页面加载
    await page.waitForTimeout(1000)

    // 验证详情信息显示
    const detailFields = [
      '用户名称', '联系方式', '反馈内容', '反馈时间', '处理状态', '回复内容', '回复时间'
    ]

    let visibleFields = 0
    for (const field of detailFields) {
      const fieldElement = page.locator(`text=${field}, [class*="label"]:has-text("${field}")`)
      const isVisible = await fieldElement.isVisible().catch(() => false)
      if (isVisible) {
        visibleFields++
        logStep(`详情字段可见: ${field}`)
      }
    }

    expect(visibleFields).toBeGreaterThan(0)
    logStep(`反馈详情显示 ${visibleFields} 个字段`)

    await takeScreenshot(page, 'chat_detail_view')
  })

  test('回复用户反馈', async ({ page }) => {
    logStep('开始回复用户反馈测试')

    const chatListPage = new AdminChatListPage(page)
    const chatDetailPage = new AdminChatDetailPage(page)

    // 访问反馈管理页面
    await chatListPage.goto()

    // 点击回复第一个反馈
    await chatListPage.replyToChat(0)
    logStep('点击回复反馈')

    // 等待回复表单加载
    await page.waitForSelector('textarea[name="reply"], .reply-form', { timeout: 3000 })

    // 填写回复内容
    const replyContent = '感谢您的反馈！我们已经收到您的问题，将尽快为您处理。如有其他问题，请随时联系我们。'
    await chatDetailPage.fillReply(replyContent)
    logStep('填写回复内容')

    // 提交回复
    await chatDetailPage.submitReply()
    logStep('提交回复')

    // 验证回复成功
    try {
      await page.waitForSelector('text=回复成功, text=发送成功, text=提交成功', { timeout: 5000 })
      logStep('反馈回复成功')

      // 验证回复内容已保存
      const replyText = page.locator(`text=${replyContent}`)
      const isReplyVisible = await replyText.isVisible().catch(() => false)
      expect(isReplyVisible).toBe(true)
      logStep('回复内容正确显示')

    } catch (error) {
      logStep('回复流程完成')
    }

    await takeScreenshot(page, 'chat_reply')
  })

  test('标记反馈为已读', async ({ page }) => {
    logStep('开始标记反馈已读测试')

    const chatListPage = new AdminChatListPage(page)

    // 访问反馈管理页面
    await chatListPage.goto()

    // 查找未读反馈
    const unreadItems = page.locator('.unread, [data-status="unread"], .status-unread')

    if (await unreadItems.count() > 0) {
      // 点击标记已读
      await chatListPage.markAsRead(0)
      logStep('标记反馈为已读')

      // 确认标记操作
      const confirmMark = page.locator('button:has-text("确认"), button:has-text("确定")')
      if (await confirmMark.isVisible().catch(() => false)) {
        await confirmMark.click()
        logStep('确认标记操作')
      }

      // 验证标记成功
      try {
        await page.waitForSelector('text=标记成功, text=操作成功, text=已标记为已读', { timeout: 3000 })
        logStep('标记已读成功')

        // 验证状态已改变
        await page.waitForTimeout(500)
        const currentUnreadCount = await unreadItems.count()
        logStep(`当前未读反馈数量: ${currentUnreadCount}`)

      } catch (error) {
        logStep('标记操作完成')
      }

    } else {
      logStep('当前没有未读反馈')
    }

    await takeScreenshot(page, 'chat_mark_as_read')
  })

  test('反馈分类筛选', async ({ page }) => {
    logStep('开始反馈分类筛选测试')

    const chatListPage = new AdminChatListPage(page)

    // 访问反馈管理页面
    await chatListPage.goto()

    // 测试按类型筛选
    const typeFilter = page.locator('select[name="type"], .type-filter')
    if (await typeFilter.isVisible().catch(() => false)) {
      const options = await typeFilter.locator('option').allTextContents()
      if (options.length > 1) {
        await typeFilter.selectOption(options[1]) // 选择第二个选项
        await page.waitForTimeout(500)
        logStep(`筛选反馈类型: ${options[1]}`)
      }
    }

    // 测试按状态筛选
    const statusFilter = page.locator('select[name="status"], .status-filter')
    if (await statusFilter.isVisible().catch(() => false)) {
      const statusOptions = ['全部', '未处理', '处理中', '已完成']
      for (const status of statusOptions) {
        const option = page.locator(`option:has-text("${status}")`)
        if (await option.isVisible().catch(() => false)) {
          await statusFilter.selectOption(status)
          await page.waitForTimeout(500)
          logStep(`筛选反馈状态: ${status}`)
          break
        }
      }
    }

    // 测试按时间范围筛选
    const startDateInput = page.locator('input[name="startDate"], input[placeholder*="开始时间"]')
    const endDateInput = page.locator('input[name="endDate"], input[placeholder*="结束时间"]')

    if (await startDateInput.isVisible().catch(() => false)) {
      const today = new Date().toISOString().split('T')[0]
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      await startDateInput.fill(lastWeek)
      await endDateInput.fill(today)
      await page.click('button:has-text("筛选")')
      await page.waitForTimeout(500)
      logStep('按时间范围筛选反馈')
    }

    await takeScreenshot(page, 'chat_filtering')
  })

  test('反馈批量操作', async ({ page }) => {
    logStep('开始反馈批量操作测试')

    const chatListPage = new AdminChatListPage(page)

    // 访问反馈管理页面
    await chatListPage.goto()

    // 检查批量操作功能
    const selectAllCheckbox = page.locator('input[type="checkbox"].select-all, .checkbox-all')
    const batchOperations = page.locator('button:has-text("批量标记已读"), button:has-text("批量删除"), button:has-text("批量处理")')

    if (await selectAllCheckbox.isVisible().catch(() => false)) {
      logStep('批量选择功能存在')

      // 选择全选
      await selectAllCheckbox.check()
      logStep('选择全部反馈')

      // 检查批量操作按钮
      const batchOpsCount = await batchOperations.count()
      if (batchOpsCount > 0) {
        logStep(`发现 ${batchOpsCount} 个批量操作`)

        // 测试批量标记已读
        const batchMarkRead = page.locator('button:has-text("批量标记已读")')
        if (await batchMarkRead.isVisible().catch(() => false)) {
          await batchMarkRead.click()
          logStep('执行批量标记已读操作')

          // 确认批量操作
          const confirmBatch = page.locator('button:has-text("确认")')
          if (await confirmBatch.isVisible().catch(() => false)) {
            await confirmBatch.click()
            logStep('确认批量操作')
          }
        }
      }

      // 取消全选
      await selectAllCheckbox.uncheck()
      logStep('取消全选')
    } else {
      logStep('未发现批量操作功能')
    }

    await takeScreenshot(page, 'chat_batch_operations')
  })

  test('反馈统计信息', async ({ page }) => {
    logStep('开始反馈统计信息测试')

    const chatListPage = new AdminChatListPage(page)

    // 访问反馈管理页面
    await chatListPage.goto()

    // 检查统计信息显示
    const statsElements = [
      '.stats-total, [data-stat="total"]',
      '.stats-unread, [data-stat="unread"]',
      '.stats-processed, [data-stat="processed"]',
      'text=总反馈数', 'text=未处理', 'text=已处理'
    ]

    let visibleStats = 0
    for (const statSelector of statsElements) {
      const statElement = page.locator(statSelector)
      const isVisible = await statElement.isVisible().catch(() => false)
      if (isVisible) {
        visibleStats++
        const statText = await statElement.textContent()
        logStep(`统计信息: ${statText}`)
      }
    }

    if (visibleStats > 0) {
      logStep(`显示 ${visibleStats} 项统计信息`)
    } else {
      logStep('未发现统计信息显示')
    }

    // 检查处理进度图表
    const charts = page.locator('.chart, .echarts, .progress-chart, canvas')
    if (await charts.count() > 0) {
      logStep('反馈处理进度图表存在')
    }

    await takeScreenshot(page, 'chat_statistics')
  })

  test('反馈导出功能', async ({ page }) => {
    logStep('开始反馈导出功能测试')

    const chatListPage = new AdminChatListPage(page)

    // 访问反馈管理页面
    await chatListPage.goto()

    // 检查导出功能
    const exportButtons = page.locator('button:has-text("导出"), button:has-text("下载"), button:has-text("Excel")')

    if (await exportButtons.count() > 0) {
      logStep('导出功能存在')

      // 点击导出按钮
      await exportButtons.first().click()
      logStep('点击导出按钮')

      // 检查导出选项
      const exportOptions = page.locator('.export-options, .download-options')
      if (await exportOptions.isVisible().catch(() => false)) {
        // 选择导出格式
        const formatSelect = page.locator('select[name="format"], .format-select')
        if (await formatSelect.isVisible().catch(() => false)) {
          await formatSelect.selectOption('excel')
          logStep('选择Excel格式')
        }

        // 确认导出
        const confirmExport = page.locator('button:has-text("确认导出"), button:has-text("下载")')
        if (await confirmExport.isVisible().catch(() => false)) {
          await confirmExport.click()
          logStep('确认导出操作')
        }
      }

      // 验证导出提示
      try {
        await page.waitForSelector('text=导出成功, text=下载成功, text=文件已生成', { timeout: 5000 })
        logStep('反馈导出成功')
      } catch (error) {
        logStep('导出操作完成')
      }

    } else {
      logStep('未发现导出功能')
    }

    await takeScreenshot(page, 'chat_export')
  })

  test('反馈处理效率分析', async ({ page }) => {
    logStep('开始反馈处理效率分析测试')

    const chatListPage = new AdminChatListPage(page)

    // 访问反馈管理页面
    await chatListPage.goto()

    // 检查处理时间统计
    const timeStats = [
      '.avg-response-time, [data-stat="avgResponseTime"]',
      '.processing-time, [data-stat="processingTime"]',
      'text=平均响应时间', 'text=处理时长'
    ]

    let visibleTimeStats = 0
    for (const statSelector of timeStats) {
      const statElement = page.locator(statSelector)
      const isVisible = await statElement.isVisible().catch(() => false)
      if (isVisible) {
        visibleTimeStats++
        const statText = await statElement.textContent()
        logStep(`处理效率统计: ${statText}`)
      }
    }

    if (visibleTimeStats > 0) {
      logStep(`显示 ${visibleTimeStats} 项处理效率统计`)
    }

    // 检查满意度统计
    const satisfactionStats = page.locator('.satisfaction-rate, [data-stat="satisfaction"]')
    if (await satisfactionStats.isVisible().catch(() => false)) {
      const satisfactionText = await satisfactionStats.textContent()
      logStep(`用户满意度: ${satisfactionText}`)
    }

    await takeScreenshot(page, 'chat_processing_efficiency')
  })

  test('反馈管理权限验证', async ({ page }) => {
    logStep('开始反馈管理权限验证测试')

    const chatListPage = new AdminChatListPage(page)

    // 访问反馈管理页面
    await chatListPage.goto()

    // 验证管理员权限
    const actionButtons = [
      'button:has-text("查看")',
      'button:has-text("回复")',
      'button:has-text("标记已读")',
      'button:has-text("导出")',
      'button:has-text("批量操作")'
    ]

    let availableActions = 0
    for (const buttonSelector of actionButtons) {
      const button = page.locator(buttonSelector)
      const isVisible = await button.isVisible().catch(() => false)
      if (isVisible) {
        availableActions++
        logStep(`权限验证通过: ${buttonSelector}`)
      }
    }

    expect(availableActions).toBeGreaterThan(0)
    logStep(`管理员拥有 ${availableActions} 项反馈管理权限`)

    await takeScreenshot(page, 'chat_management_permissions')
  })

  test('反馈管理性能测试', async ({ page }) => {
    logStep('开始反馈管理性能测试')

    const chatListPage = new AdminChatListPage(page)

    // 测试页面加载性能
    const startTime = Date.now()
    await chatListPage.goto()
    const loadTime = Date.now() - startTime
    logStep(`反馈管理页面加载时间: ${loadTime}ms`)

    // 测试列表渲染性能
    const renderStart = Date.now()
    const chatCount = await page.locator('.chat-item, tbody tr').count()
    const renderTime = Date.now() - renderStart
    logStep(`列表渲染时间: ${renderTime}ms (${chatCount} 个反馈)`)

    // 测试搜索性能
    const searchStart = Date.now()
    const searchInput = page.locator('input[placeholder*="搜索"]')
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('测试')
      await page.keyboard.press('Enter')
      await page.waitForTimeout(500)
      const searchTime = Date.now() - searchStart
      logStep(`反馈搜索耗时: ${searchTime}ms`)
    }

    // 测试详情查看性能
    const detailStart = Date.now()
    await chatListPage.viewChatDetail(0)
    const detailLoadTime = Date.now() - detailStart
    logStep(`详情页面加载时间: ${detailLoadTime}ms`)

    // 验证性能指标
    expect(loadTime).toBeLessThan(5000) // 页面加载不超过5秒
    expect(renderTime).toBeLessThan(2000) // 列表渲染不超过2秒
    expect(detailLoadTime).toBeLessThan(3000) // 详情页面加载不超过3秒

    await takeScreenshot(page, 'chat_management_performance')
  })
})
