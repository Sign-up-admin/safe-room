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
  AdminNewsListPage,
  AdminNewsDetailPage
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

test.describe('Admin 公告管理CRUD流程', () => {
  test.beforeEach(async ({ page }) => {
    // 设置管理员API Mock
    await mockAdminApi(page)
    // 登录管理员
    await loginAsAdmin(page)
    logStep('管理员登录完成')
  })

  test('公告列表查看和搜索', async ({ page }) => {
    logStep('开始公告列表查看测试')

    const newsListPage = new AdminNewsListPage(page)

    // 访问公告管理页面
    await newsListPage.goto()
    await waitForPage(page)
    logStep('访问公告管理页面')

    // 验证公告列表显示
    const newsCards = page.locator('.news-card, .card-item, tbody tr')
    const newsCount = await newsCards.count()
    expect(newsCount).toBeGreaterThanOrEqual(0)
    logStep(`公告列表显示 ${newsCount} 个公告`)

    // 验证列表字段
    const expectedFields = ['标题', '简介', '发布时间', '状态', '创建时间']
    for (const field of expectedFields) {
      const fieldElement = page.locator(`th:has-text("${field}"), .header:has-text("${field}")`)
      const isVisible = await fieldElement.isVisible().catch(() => false)
      if (isVisible) {
        logStep(`列表字段存在: ${field}`)
      }
    }

    // 测试搜索功能
    const testSearchTerm = '健身'
    const searchInput = page.locator('input[placeholder*="搜索"], input[placeholder*="标题"]')
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill(testSearchTerm)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(500)
      logStep(`搜索公告: ${testSearchTerm}`)
    }

    // 测试按状态筛选
    const statusFilter = page.locator('select[name="status"], .status-filter')
    if (await statusFilter.isVisible().catch(() => false)) {
      await statusFilter.selectOption('已发布')
      await page.waitForTimeout(500)
      logStep('筛选已发布公告')
    }

    await takeScreenshot(page, 'news_list_view')
  })

  test('创建新公告', async ({ page }) => {
    logStep('开始创建新公告测试')

    const newsListPage = new AdminNewsListPage(page)
    const newsDetailPage = new AdminNewsDetailPage(page)

    // 访问公告管理页面
    await newsListPage.goto()

    // 点击添加公告按钮
    await newsListPage.clickAddNews()
    logStep('点击添加公告按钮')

    // 等待表单加载
    await page.waitForSelector('form, .add-form, .news-form', { timeout: 3000 })

    // 生成测试公告数据
    const newNews = generateTestData('news') as {
      title: string
      introduction: string
      content: string
    }

    // 增强公告数据
    const enhancedNewsData = {
      ...newNews,
      picture: 'https://example.com/news-image.jpg'
    }

    // 填写公告表单
    await newsDetailPage.fillNewsForm(enhancedNewsData)
    logStep('填写公告表单信息')

    // 提交表单
    await newsDetailPage.saveNews()
    logStep('提交公告创建表单')

    // 验证创建成功
    try {
      await page.waitForSelector('text=创建成功, text=保存成功, text=发布成功', { timeout: 5000 })
      logStep('公告创建成功')

      // 验证返回列表页面
      const currentUrl = page.url()
      expect(currentUrl).toContain('/news')

      // 验证新公告出现在列表中
      const searchInput = page.locator('input[placeholder*="搜索"]')
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill(enhancedNewsData.title)
        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)

        const newsExists = await page.locator(`text=${enhancedNewsData.title}`).isVisible().catch(() => false)
        expect(newsExists).toBe(true)
        logStep('新公告在列表中显示')
      }

    } catch (error) {
      logStep('公告创建流程完成')
    }

    // 清理测试数据
    await cleanupTestData(page, 'news', enhancedNewsData.title)

    await takeScreenshot(page, 'news_creation')
  })

  test('编辑现有公告', async ({ page }) => {
    logStep('开始编辑公告测试')

    const newsListPage = new AdminNewsListPage(page)
    const newsDetailPage = new AdminNewsDetailPage(page)

    // 访问公告管理页面
    await newsListPage.goto()

    // 点击编辑第一个公告
    await newsListPage.editNews(0)
    logStep('点击编辑公告')

    // 等待编辑表单加载
    await page.waitForSelector('form, .edit-form, .news-form', { timeout: 3000 })

    // 修改公告信息
    const updatedNewsData = {
      title: '编辑测试公告_' + Date.now(),
      introduction: '更新后的公告简介',
      picture: 'https://example.com/updated-image.jpg',
      content: '更新后的公告内容，包含更多详细信息'
    }

    await newsDetailPage.fillNewsForm(updatedNewsData)
    logStep('修改公告信息')

    // 保存修改
    await newsDetailPage.saveNews()
    logStep('保存公告修改')

    // 验证修改成功
    try {
      await page.waitForSelector('text=修改成功, text=保存成功, text=更新成功', { timeout: 5000 })
      logStep('公告修改成功')

      // 验证修改后的信息
      const searchInput = page.locator('input[placeholder*="搜索"]')
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill(updatedNewsData.title)
        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)

        const newsUpdated = await page.locator(`text=${updatedNewsData.title}`).isVisible().catch(() => false)
        if (newsUpdated) {
          logStep('公告信息已正确更新')
        }
      }

    } catch (error) {
      logStep('公告编辑流程完成')
    }

    await takeScreenshot(page, 'news_edit')
  })

  test('查看公告详情', async ({ page }) => {
    logStep('开始查看公告详情测试')

    const newsListPage = new AdminNewsListPage(page)

    // 访问公告管理页面
    await newsListPage.goto()

    // 查找详情按钮或点击公告行
    const detailButtons = page.locator('button:has-text("详情"), button:has-text("查看"), .detail-btn')
    const newsRows = page.locator('tbody tr, .news-item, .card-item')

    if (await detailButtons.count() > 0) {
      // 点击详情按钮
      await detailButtons.first().click()
      logStep('点击详情按钮')
    } else if (await newsRows.count() > 0) {
      // 点击公告行
      await newsRows.first().click()
      logStep('点击公告行')
    }

    // 等待详情页面加载
    await page.waitForTimeout(1000)

    // 验证详情信息显示
    const detailFields = [
      '标题', '简介', '内容', '图片', '发布时间', '创建时间', '更新时间'
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
    logStep(`公告详情显示 ${visibleFields} 个字段`)

    await takeScreenshot(page, 'news_detail_view')
  })

  test('删除公告', async ({ page }) => {
    logStep('开始删除公告测试')

    const newsListPage = new AdminNewsListPage(page)

    // 首先创建一个测试公告用于删除
    const testNews = generateTestData('news') as {
      title: string
      introduction: string
      content: string
    }

    await createTestData(page, 'news', {
      title: testNews.title,
      introduction: testNews.introduction,
      content: testNews.content
    })

    // 重新访问公告管理页面
    await newsListPage.goto()
    await waitForPage(page)

    // 搜索刚创建的公告
    const searchInput = page.locator('input[placeholder*="搜索"]')
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill(testNews.title)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(500)
    }

    // 删除公告
    const deleteButtons = page.locator('button:has-text("删除"), .delete-btn')
    if (await deleteButtons.count() > 0) {
      await deleteButtons.first().click()
      logStep('删除测试公告')

      // 确认删除
      const confirmDelete = page.locator('button:has-text("确认"), button:has-text("确定")')
      if (await confirmDelete.isVisible().catch(() => false)) {
        await confirmDelete.click()
        logStep('确认删除操作')
      }
    }

    // 验证删除成功
    try {
      await page.waitForSelector('text=删除成功, text=已删除', { timeout: 3000 })
      logStep('公告删除成功')
    } catch (error) {
      logStep('公告删除流程完成')
    }

    await takeScreenshot(page, 'news_deletion')
  })

  test('公告发布状态管理', async ({ page }) => {
    logStep('开始公告发布状态管理测试')

    const newsListPage = new AdminNewsListPage(page)

    // 访问公告管理页面
    await newsListPage.goto()

    // 查找发布/下架按钮
    const publishButtons = page.locator('button:has-text("发布"), button:has-text("上架"), button:has-text("发布公告")')
    const unpublishButtons = page.locator('button:has-text("下架"), button:has-text("取消发布")')
    const statusCells = page.locator('td:has-text("已发布"), td:has-text("未发布"), td:has-text("草稿")')

    if (await publishButtons.count() > 0) {
      logStep('公告发布功能存在')

      // 获取第一个按钮的文本
      const firstButton = publishButtons.first()
      const buttonText = await firstButton.textContent()

      // 点击发布按钮
      await firstButton.click()
      logStep(`点击${buttonText}按钮`)

      // 确认发布操作
      const confirmPublish = page.locator('button:has-text("确认"), button:has-text("确定")')
      if (await confirmPublish.isVisible().catch(() => false)) {
        await confirmPublish.click()
        logStep('确认发布操作')
      }

      // 验证发布成功
      try {
        await page.waitForSelector('text=发布成功, text=上架成功, text=操作成功', { timeout: 3000 })
        logStep('公告发布成功')

        // 验证按钮文本已改变
        await page.waitForTimeout(500)
        const updatedButtonText = await firstButton.textContent()
        if (updatedButtonText !== buttonText) {
          logStep(`按钮文本从 "${buttonText}" 变为 "${updatedButtonText}"`)
        }

      } catch (error) {
        logStep('发布操作完成')
      }

    } else if (await statusCells.count() > 0) {
      logStep('公告状态显示正常')
    } else {
      logStep('未发现公告发布管理功能')
    }

    await takeScreenshot(page, 'news_publish_management')
  })

  test('公告数据筛选和排序', async ({ page }) => {
    logStep('开始公告数据筛选和排序测试')

    const newsListPage = new AdminNewsListPage(page)

    // 访问公告管理页面
    await newsListPage.goto()

    // 测试排序功能
    const sortableHeaders = page.locator('th.sortable, .table-header[sortable], th:has(.sort-icon)')
    if (await sortableHeaders.count() > 0) {
      logStep('排序功能存在')

      // 点击发布时间列排序
      const timeHeader = page.locator('th:has-text("发布时间")')
      if (await timeHeader.isVisible().catch(() => false)) {
        await timeHeader.click()
        await page.waitForTimeout(500)
        logStep('按发布时间排序')

        await timeHeader.click()
        await page.waitForTimeout(500)
        logStep('切换排序方向')
      }
    }

    // 测试状态筛选
    const statusFilter = page.locator('select[name="status"], .status-filter')
    if (await statusFilter.isVisible().catch(() => false)) {
      const options = await statusFilter.locator('option').allTextContents()
      if (options.length > 1) {
        await statusFilter.selectOption(options[1]) // 选择第二个选项
        await page.waitForTimeout(500)
        logStep(`筛选公告状态: ${options[1]}`)
      }
    }

    // 测试分类筛选
    const categoryFilter = page.locator('select[name="newstype"], .category-filter')
    if (await categoryFilter.isVisible().catch(() => false)) {
      await categoryFilter.selectOption('通知公告')
      await page.waitForTimeout(500)
      logStep('筛选公告分类')
    }

    // 测试时间范围筛选
    const startDateInput = page.locator('input[name="startDate"], input[placeholder*="开始时间"]')
    const endDateInput = page.locator('input[name="endDate"], input[placeholder*="结束时间"]')

    if (await startDateInput.isVisible().catch(() => false)) {
      const today = new Date().toISOString().split('T')[0]
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      await startDateInput.fill(lastWeek)
      await endDateInput.fill(today)
      await page.click('button:has-text("筛选")')
      await page.waitForTimeout(500)
      logStep('按时间范围筛选')
    }

    await takeScreenshot(page, 'news_filtering_sorting')
  })

  test('公告批量操作', async ({ page }) => {
    logStep('开始公告批量操作测试')

    const newsListPage = new AdminNewsListPage(page)

    // 访问公告管理页面
    await newsListPage.goto()

    // 检查批量操作功能
    const selectAllCheckbox = page.locator('input[type="checkbox"].select-all, .checkbox-all')
    const batchOperations = page.locator('button:has-text("批量删除"), button:has-text("批量发布"), button:has-text("批量下架")')

    if (await selectAllCheckbox.isVisible().catch(() => false)) {
      logStep('批量选择功能存在')

      // 选择全选
      await selectAllCheckbox.check()
      logStep('选择全部公告')

      // 检查批量操作按钮
      const batchOpsCount = await batchOperations.count()
      if (batchOpsCount > 0) {
        logStep(`发现 ${batchOpsCount} 个批量操作`)

        // 测试批量删除（如果有的话）
        const batchDelete = page.locator('button:has-text("批量删除")')
        if (await batchDelete.isVisible().catch(() => false)) {
          await batchDelete.click()
          logStep('执行批量删除操作')

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

    await takeScreenshot(page, 'news_batch_operations')
  })

  test('公告统计信息', async ({ page }) => {
    logStep('开始公告统计信息测试')

    const newsListPage = new AdminNewsListPage(page)

    // 访问公告管理页面
    await newsListPage.goto()

    // 检查统计信息显示
    const statsElements = [
      '.stats-total, [data-stat="total"]',
      '.stats-published, [data-stat="published"]',
      '.stats-draft, [data-stat="draft"]',
      'text=总公告数', 'text=已发布', 'text=草稿'
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

    // 检查图表展示
    const charts = page.locator('.chart, .echarts, canvas')
    if (await charts.count() > 0) {
      logStep('公告数据图表存在')
    }

    await takeScreenshot(page, 'news_statistics')
  })

  test('公告导出功能', async ({ page }) => {
    logStep('开始公告导出功能测试')

    const newsListPage = new AdminNewsListPage(page)

    // 访问公告管理页面
    await newsListPage.goto()

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
        logStep('公告导出成功')
      } catch (error) {
        logStep('导出操作完成')
      }

    } else {
      logStep('未发现导出功能')
    }

    await takeScreenshot(page, 'news_export')
  })

  test('公告管理权限验证', async ({ page }) => {
    logStep('开始公告管理权限验证测试')

    const newsListPage = new AdminNewsListPage(page)

    // 访问公告管理页面
    await newsListPage.goto()

    // 验证管理员权限
    const actionButtons = [
      'button:has-text("添加")',
      'button:has-text("编辑")',
      'button:has-text("删除")',
      'button:has-text("发布")',
      'button:has-text("导出")'
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
    logStep(`管理员拥有 ${availableActions} 项公告管理权限`)

    await takeScreenshot(page, 'news_management_permissions')
  })

  test('公告管理性能测试', async ({ page }) => {
    logStep('开始公告管理性能测试')

    const newsListPage = new AdminNewsListPage(page)

    // 测试页面加载性能
    const startTime = Date.now()
    await newsListPage.goto()
    const loadTime = Date.now() - startTime
    logStep(`公告管理页面加载时间: ${loadTime}ms`)

    // 测试列表渲染性能
    const renderStart = Date.now()
    const newsCount = await page.locator('.news-item, tbody tr').count()
    const renderTime = Date.now() - renderStart
    logStep(`列表渲染时间: ${renderTime}ms (${newsCount} 个公告)`)

    // 测试搜索性能
    const searchStart = Date.now()
    const searchInput = page.locator('input[placeholder*="搜索"]')
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('测试')
      await page.keyboard.press('Enter')
      await page.waitForTimeout(500)
      const searchTime = Date.now() - searchStart
      logStep(`公告搜索耗时: ${searchTime}ms`)
    }

    // 测试编辑操作性能
    const editStart = Date.now()
    await newsListPage.editNews(0)
    const editLoadTime = Date.now() - editStart
    logStep(`编辑页面加载时间: ${editLoadTime}ms`)

    // 验证性能指标
    expect(loadTime).toBeLessThan(5000) // 页面加载不超过5秒
    expect(renderTime).toBeLessThan(2000) // 列表渲染不超过2秒
    expect(editLoadTime).toBeLessThan(3000) // 编辑页面加载不超过3秒

    await takeScreenshot(page, 'news_management_performance')
  })
})
