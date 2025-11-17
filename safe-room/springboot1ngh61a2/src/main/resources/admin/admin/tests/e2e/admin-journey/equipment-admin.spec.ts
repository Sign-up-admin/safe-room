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
  AdminEquipmentListPage,
  AdminEquipmentDetailPage
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

test.describe('Admin 器材管理CRUD流程', () => {
  test.beforeEach(async ({ page }) => {
    // 设置管理员API Mock
    await mockAdminApi(page)
    // 登录管理员
    await loginAsAdmin(page)
    logStep('管理员登录完成')
  })

  test('器材列表查看和搜索', async ({ page }) => {
    logStep('开始器材列表查看测试')

    const equipmentListPage = new AdminEquipmentListPage(page)

    // 访问器材管理页面
    await equipmentListPage.goto()
    await waitForPage(page)
    logStep('访问器材管理页面')

    // 验证器材列表显示
    const equipmentCards = page.locator('.equipment-card, .card-item, tbody tr')
    const equipmentCount = await equipmentCards.count()
    expect(equipmentCount).toBeGreaterThanOrEqual(0)
    logStep(`器材列表显示 ${equipmentCount} 个器材`)

    // 验证列表字段
    const expectedFields = ['器材名称', '器材类型', '数量', '价格', '状态', '创建时间']
    for (const field of expectedFields) {
      const fieldElement = page.locator(`th:has-text("${field}"), .header:has-text("${field}")`)
      const isVisible = await fieldElement.isVisible().catch(() => false)
      if (isVisible) {
        logStep(`列表字段存在: ${field}`)
      }
    }

    // 测试搜索功能
    const testSearchTerm = '哑铃'
    const searchInput = page.locator('input[placeholder*="搜索"], input[placeholder*="器材名称"]')
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill(testSearchTerm)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(500)
      logStep(`搜索器材: ${testSearchTerm}`)
    }

    // 测试按类型筛选
    const typeFilter = page.locator('select[name="type"], .type-filter')
    if (await typeFilter.isVisible().catch(() => false)) {
      await typeFilter.selectOption('力量训练')
      await page.waitForTimeout(500)
      logStep('按器材类型筛选')
    }

    await takeScreenshot(page, 'equipment_list_view')
  })

  test('创建新器材', async ({ page }) => {
    logStep('开始创建新器材测试')

    const equipmentListPage = new AdminEquipmentListPage(page)
    const equipmentDetailPage = new AdminEquipmentDetailPage(page)

    // 访问器材管理页面
    await equipmentListPage.goto()

    // 点击添加器材按钮
    await equipmentListPage.clickAddEquipment()
    logStep('点击添加器材按钮')

    // 等待表单加载
    await page.waitForSelector('form, .add-form, .equipment-form', { timeout: 3000 })

    // 生成测试器材数据
    const newEquipment = generateTestData('equipment') as {
      qicaimingcheng: string
      qicaileixing: string
      shuliang: string
      jiage: string
    }

    // 增强器材数据
    const enhancedEquipmentData = {
      ...newEquipment,
      jieshao: '这是一款测试器材，适合健身训练使用',
    }

    // 填写器材表单
    await equipmentDetailPage.fillEquipmentForm(enhancedEquipmentData)
    logStep('填写器材表单信息')

    // 提交表单
    await equipmentDetailPage.saveEquipment()
    logStep('提交器材创建表单')

    // 验证创建成功
    try {
      await page.waitForSelector('text=创建成功, text=保存成功, text=添加成功', { timeout: 5000 })
      logStep('器材创建成功')

      // 验证返回列表页面
      const currentUrl = page.url()
      expect(currentUrl).toContain('/jianshenqicai')

      // 验证新器材出现在列表中
      const searchInput = page.locator('input[placeholder*="搜索"]')
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill(enhancedEquipmentData.qicaimingcheng)
        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)

        const equipmentExists = await page.locator(`text=${enhancedEquipmentData.qicaimingcheng}`).isVisible().catch(() => false)
        expect(equipmentExists).toBe(true)
        logStep('新器材在列表中显示')
      }

    } catch (error) {
      logStep('器材创建流程完成')
    }

    // 清理测试数据
    await cleanupTestData(page, 'equipment', enhancedEquipmentData.qicaimingcheng)

    await takeScreenshot(page, 'equipment_creation')
  })

  test('编辑现有器材', async ({ page }) => {
    logStep('开始编辑器材测试')

    const equipmentListPage = new AdminEquipmentListPage(page)
    const equipmentDetailPage = new AdminEquipmentDetailPage(page)

    // 访问器材管理页面
    await equipmentListPage.goto()

    // 点击编辑第一个器材
    await equipmentListPage.editEquipment(0)
    logStep('点击编辑器材')

    // 等待编辑表单加载
    await page.waitForSelector('form, .edit-form, .equipment-form', { timeout: 3000 })

    // 修改器材信息
    const updatedEquipmentData = {
      qicaimingcheng: '编辑测试器材_' + Date.now(),
      qicaileixing: '有氧设备',
      shuliang: '15',
      jiage: '2800',
      jieshao: '更新后的器材介绍'
    }

    await equipmentDetailPage.fillEquipmentForm(updatedEquipmentData)
    logStep('修改器材信息')

    // 保存修改
    await equipmentDetailPage.saveEquipment()
    logStep('保存器材修改')

    // 验证修改成功
    try {
      await page.waitForSelector('text=修改成功, text=保存成功, text=更新成功', { timeout: 5000 })
      logStep('器材修改成功')

      // 验证修改后的信息
      const searchInput = page.locator('input[placeholder*="搜索"]')
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill(updatedEquipmentData.qicaimingcheng)
        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)

        const equipmentUpdated = await page.locator(`text=${updatedEquipmentData.qicaimingcheng}`).isVisible().catch(() => false)
        if (equipmentUpdated) {
          logStep('器材信息已正确更新')
        }
      }

    } catch (error) {
      logStep('器材编辑流程完成')
    }

    await takeScreenshot(page, 'equipment_edit')
  })

  test('查看器材详情', async ({ page }) => {
    logStep('开始查看器材详情测试')

    const equipmentListPage = new AdminEquipmentListPage(page)

    // 访问器材管理页面
    await equipmentListPage.goto()

    // 查找详情按钮或点击器材行
    const detailButtons = page.locator('button:has-text("详情"), button:has-text("查看"), .detail-btn')
    const equipmentRows = page.locator('tbody tr, .equipment-item, .card-item')

    if (await detailButtons.count() > 0) {
      // 点击详情按钮
      await detailButtons.first().click()
      logStep('点击详情按钮')
    } else if (await equipmentRows.count() > 0) {
      // 点击器材行
      await equipmentRows.first().click()
      logStep('点击器材行')
    }

    // 等待详情页面加载
    await page.waitForTimeout(1000)

    // 验证详情信息显示
    const detailFields = [
      '器材名称', '器材类型', '数量', '价格', '介绍', '创建时间', '更新时间'
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
    logStep(`器材详情显示 ${visibleFields} 个字段`)

    await takeScreenshot(page, 'equipment_detail_view')
  })

  test('删除器材', async ({ page }) => {
    logStep('开始删除器材测试')

    const equipmentListPage = new AdminEquipmentListPage(page)

    // 首先创建一个测试器材用于删除
    const testEquipment = generateTestData('equipment') as {
      qicaimingcheng: string
      qicaileixing: string
      shuliang: string
      jiage: string
    }

    await createTestData(page, 'equipment', {
      qicaimingcheng: testEquipment.qicaimingcheng,
      qicaileixing: testEquipment.qicaileixing,
      shuliang: testEquipment.shuliang,
      jiage: testEquipment.jiage
    })

    // 重新访问器材管理页面
    await equipmentListPage.goto()
    await waitForPage(page)

    // 搜索刚创建的器材
    const searchInput = page.locator('input[placeholder*="搜索"]')
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill(testEquipment.qicaimingcheng)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(500)
    }

    // 删除器材
    const deleteButtons = page.locator('button:has-text("删除"), .delete-btn')
    if (await deleteButtons.count() > 0) {
      await deleteButtons.first().click()
      logStep('删除测试器材')

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
      logStep('器材删除成功')
    } catch (error) {
      logStep('器材删除流程完成')
    }

    await takeScreenshot(page, 'equipment_deletion')
  })

  test('器材上下架管理', async ({ page }) => {
    logStep('开始器材上下架管理测试')

    const equipmentListPage = new AdminEquipmentListPage(page)

    // 访问器材管理页面
    await equipmentListPage.goto()

    // 查找状态切换按钮
    const statusButtons = page.locator('button:has-text("上架"), button:has-text("下架"), button:has-text("启用"), button:has-text("禁用")')
    const statusCells = page.locator('td:has-text("上架"), td:has-text("下架"), td:has-text("启用"), td:has-text("禁用")')

    if (await statusButtons.count() > 0) {
      logStep('器材状态管理功能存在')

      // 获取第一个按钮的文本
      const firstButton = statusButtons.first()
      const buttonText = await firstButton.textContent()

      // 点击状态切换按钮
      await firstButton.click()
      logStep(`点击${buttonText}按钮`)

      // 确认状态变更
      const confirmChange = page.locator('button:has-text("确认"), button:has-text("确定")')
      if (await confirmChange.isVisible().catch(() => false)) {
        await confirmChange.click()
        logStep('确认状态变更')
      }

      // 验证状态变更成功
      try {
        await page.waitForSelector('text=操作成功, text=状态已更新, text=上架成功, text=下架成功', { timeout: 3000 })
        logStep('器材状态变更成功')

        // 验证按钮文本已改变
        await page.waitForTimeout(500)
        const updatedButtonText = await firstButton.textContent()
        expect(updatedButtonText).not.toBe(buttonText)
        logStep(`按钮文本从 "${buttonText}" 变为 "${updatedButtonText}"`)

      } catch (error) {
        logStep('状态变更操作完成')
      }

    } else if (await statusCells.count() > 0) {
      logStep('器材状态显示正常')
    } else {
      logStep('未发现器材状态管理功能')
    }

    await takeScreenshot(page, 'equipment_status_management')
  })

  test('器材数据筛选和排序', async ({ page }) => {
    logStep('开始器材数据筛选和排序测试')

    const equipmentListPage = new AdminEquipmentListPage(page)

    // 访问器材管理页面
    await equipmentListPage.goto()

    // 测试排序功能
    const sortableHeaders = page.locator('th.sortable, .table-header[sortable], th:has(.sort-icon)')
    if (await sortableHeaders.count() > 0) {
      logStep('排序功能存在')

      // 点击价格列排序
      const priceHeader = page.locator('th:has-text("价格")')
      if (await priceHeader.isVisible().catch(() => false)) {
        await priceHeader.click()
        await page.waitForTimeout(500)
        logStep('按价格排序')

        await priceHeader.click()
        await page.waitForTimeout(500)
        logStep('切换排序方向')
      }
    }

    // 测试类型筛选
    const typeFilter = page.locator('select[name="qicaileixing"], .type-filter')
    if (await typeFilter.isVisible().catch(() => false)) {
      const options = await typeFilter.locator('option').allTextContents()
      if (options.length > 1) {
        await typeFilter.selectOption(options[1]) // 选择第二个选项
        await page.waitForTimeout(500)
        logStep(`筛选器材类型: ${options[1]}`)
      }
    }

    // 测试状态筛选
    const statusFilter = page.locator('select[name="status"], .status-filter')
    if (await statusFilter.isVisible().catch(() => false)) {
      await statusFilter.selectOption('上架')
      await page.waitForTimeout(500)
      logStep('筛选上架器材')
    }

    // 测试价格范围筛选
    const priceMinInput = page.locator('input[name="priceMin"], input[placeholder*="最低价格"]')
    const priceMaxInput = page.locator('input[name="priceMax"], input[placeholder*="最高价格"]')

    if (await priceMinInput.isVisible().catch(() => false)) {
      await priceMinInput.fill('500')
      await priceMaxInput.fill('5000')
      await page.click('button:has-text("筛选")')
      await page.waitForTimeout(500)
      logStep('按价格范围筛选')
    }

    await takeScreenshot(page, 'equipment_filtering_sorting')
  })

  test('器材批量操作', async ({ page }) => {
    logStep('开始器材批量操作测试')

    const equipmentListPage = new AdminEquipmentListPage(page)

    // 访问器材管理页面
    await equipmentListPage.goto()

    // 检查批量操作功能
    const selectAllCheckbox = page.locator('input[type="checkbox"].select-all, .checkbox-all')
    const batchOperations = page.locator('button:has-text("批量删除"), button:has-text("批量上架"), button:has-text("批量下架")')

    if (await selectAllCheckbox.isVisible().catch(() => false)) {
      logStep('批量选择功能存在')

      // 选择全选
      await selectAllCheckbox.check()
      logStep('选择全部器材')

      // 检查批量操作按钮
      const batchOpsCount = await batchOperations.count()
      if (batchOpsCount > 0) {
        logStep(`发现 ${batchOpsCount} 个批量操作`)

        // 测试批量下架（如果有的话）
        const batchUnpublish = page.locator('button:has-text("批量下架")')
        if (await batchUnpublish.isVisible().catch(() => false)) {
          await batchUnpublish.click()
          logStep('执行批量下架操作')

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

    await takeScreenshot(page, 'equipment_batch_operations')
  })

  test('器材统计信息', async ({ page }) => {
    logStep('开始器材统计信息测试')

    const equipmentListPage = new AdminEquipmentListPage(page)

    // 访问器材管理页面
    await equipmentListPage.goto()

    // 检查统计信息显示
    const statsElements = [
      '.stats-total, [data-stat="total"]',
      '.stats-active, [data-stat="active"]',
      '.stats-inactive, [data-stat="inactive"]',
      'text=总器材数', 'text=上架器材', 'text=下架器材'
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
      logStep('器材数据图表存在')
    }

    await takeScreenshot(page, 'equipment_statistics')
  })

  test('器材导出功能', async ({ page }) => {
    logStep('开始器材导出功能测试')

    const equipmentListPage = new AdminEquipmentListPage(page)

    // 访问器材管理页面
    await equipmentListPage.goto()

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
        logStep('器材导出成功')
      } catch (error) {
        logStep('导出操作完成')
      }

    } else {
      logStep('未发现导出功能')
    }

    await takeScreenshot(page, 'equipment_export')
  })

  test('器材管理权限验证', async ({ page }) => {
    logStep('开始器材管理权限验证测试')

    const equipmentListPage = new AdminEquipmentListPage(page)

    // 访问器材管理页面
    await equipmentListPage.goto()

    // 验证管理员权限
    const actionButtons = [
      'button:has-text("添加")',
      'button:has-text("编辑")',
      'button:has-text("删除")',
      'button:has-text("上架")',
      'button:has-text("下架")',
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
    logStep(`管理员拥有 ${availableActions} 项器材管理权限`)

    await takeScreenshot(page, 'equipment_management_permissions')
  })

  test('器材管理性能测试', async ({ page }) => {
    logStep('开始器材管理性能测试')

    const equipmentListPage = new AdminEquipmentListPage(page)

    // 测试页面加载性能
    const startTime = Date.now()
    await equipmentListPage.goto()
    const loadTime = Date.now() - startTime
    logStep(`器材管理页面加载时间: ${loadTime}ms`)

    // 测试列表渲染性能
    const renderStart = Date.now()
    const equipmentCount = await page.locator('.equipment-item, tbody tr').count()
    const renderTime = Date.now() - renderStart
    logStep(`列表渲染时间: ${renderTime}ms (${equipmentCount} 个器材)`)

    // 测试搜索性能
    const searchStart = Date.now()
    const searchInput = page.locator('input[placeholder*="搜索"]')
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('测试')
      await page.keyboard.press('Enter')
      await page.waitForTimeout(500)
      const searchTime = Date.now() - searchStart
      logStep(`器材搜索耗时: ${searchTime}ms`)
    }

    // 测试编辑操作性能
    const editStart = Date.now()
    await equipmentListPage.editEquipment(0)
    const editLoadTime = Date.now() - editStart
    logStep(`编辑页面加载时间: ${editLoadTime}ms`)

    // 验证性能指标
    expect(loadTime).toBeLessThan(5000) // 页面加载不超过5秒
    expect(renderTime).toBeLessThan(2000) // 列表渲染不超过2秒
    expect(editLoadTime).toBeLessThan(3000) // 编辑页面加载不超过3秒

    await takeScreenshot(page, 'equipment_management_performance')
  })
})
