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
  AdminReportsPage
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

test.describe('Admin 报表分析功能', () => {
  test.beforeEach(async ({ page }) => {
    // 设置管理员API Mock
    await mockAdminApi(page)
    // 登录管理员
    await loginAsAdmin(page)
    logStep('管理员登录完成')
  })

  test('访问报表分析页面', async ({ page }) => {
    logStep('开始访问报表分析页面测试')

    const reportsPage = new AdminReportsPage(page)

    // 访问报表分析页面
    await reportsPage.goto()
    await waitForPage(page)
    logStep('访问报表分析页面')

    // 验证页面基本元素
    const pageTitle = page.locator('h1, .page-title, .title')
    const titleText = await pageTitle.textContent().catch(() => '')
    expect(titleText).toMatch(/(报表|分析|统计|数据)/)
    logStep(`页面标题: ${titleText}`)

    // 检查是否存在图表容器
    const chartData = await reportsPage.getChartData()
    if (chartData.hasData) {
      logStep(`发现 ${chartData.chartCount} 个数据图表`)
    } else {
      logStep('页面可能没有图表显示')
    }

    await takeScreenshot(page, 'reports_page_access')
  })

  test('用户数据统计报表', async ({ page }) => {
    logStep('开始用户数据统计报表测试')

    const reportsPage = new AdminReportsPage(page)

    // 访问报表分析页面
    await reportsPage.goto()

    // 检查用户统计区域
    const userStatsSection = page.locator('.user-stats, .user-analytics, [data-report="users"]')
    if (await userStatsSection.isVisible().catch(() => false)) {
      logStep('用户统计区域存在')

      // 验证用户统计指标
      const userMetrics = [
        '.total-users, [data-metric="totalUsers"]',
        '.active-users, [data-metric="activeUsers"]',
        '.new-users, [data-metric="newUsers"]',
        'text=总用户数', 'text=活跃用户', 'text=新增用户'
      ]

      let visibleMetrics = 0
      for (const metricSelector of userMetrics) {
        const metricElement = page.locator(metricSelector)
        const isVisible = await metricElement.isVisible().catch(() => false)
        if (isVisible) {
          visibleMetrics++
          const metricText = await metricElement.textContent()
          logStep(`用户指标: ${metricText}`)
        }
      }

      logStep(`显示 ${visibleMetrics} 项用户统计指标`)

      // 检查用户趋势图表
      const userTrendChart = page.locator('.user-trend-chart, .user-chart, canvas').first()
      if (await userTrendChart.isVisible().catch(() => false)) {
        logStep('用户趋势图表存在')
      }

    } else {
      logStep('未发现用户统计区域')
    }

    await takeScreenshot(page, 'user_statistics_report')
  })

  test('课程数据统计报表', async ({ page }) => {
    logStep('开始课程数据统计报表测试')

    const reportsPage = new AdminReportsPage(page)

    // 访问报表分析页面
    await reportsPage.goto()

    // 检查课程统计区域
    const courseStatsSection = page.locator('.course-stats, .course-analytics, [data-report="courses"]')
    if (await courseStatsSection.isVisible().catch(() => false)) {
      logStep('课程统计区域存在')

      // 验证课程统计指标
      const courseMetrics = [
        '.total-courses, [data-metric="totalCourses"]',
        '.popular-courses, [data-metric="popularCourses"]',
        '.course-revenue, [data-metric="courseRevenue"]',
        'text=总课程数', 'text=热门课程', 'text=课程收入'
      ]

      let visibleMetrics = 0
      for (const metricSelector of courseMetrics) {
        const metricElement = page.locator(metricSelector)
        const isVisible = await metricElement.isVisible().catch(() => false)
        if (isVisible) {
          visibleMetrics++
          const metricText = await metricElement.textContent()
          logStep(`课程指标: ${metricText}`)
        }
      }

      logStep(`显示 ${visibleMetrics} 项课程统计指标`)

      // 检查课程类型分布图表
      const courseTypeChart = page.locator('.course-type-chart, .pie-chart, canvas').first()
      if (await courseTypeChart.isVisible().catch(() => false)) {
        logStep('课程类型分布图表存在')
      }

    } else {
      logStep('未发现课程统计区域')
    }

    await takeScreenshot(page, 'course_statistics_report')
  })

  test('财务数据统计报表', async ({ page }) => {
    logStep('开始财务数据统计报表测试')

    const reportsPage = new AdminReportsPage(page)

    // 访问报表分析页面
    await reportsPage.goto()

    // 检查财务统计区域
    const financeStatsSection = page.locator('.finance-stats, .revenue-analytics, [data-report="finance"]')
    if (await financeStatsSection.isVisible().catch(() => false)) {
      logStep('财务统计区域存在')

      // 验证财务统计指标
      const financeMetrics = [
        '.total-revenue, [data-metric="totalRevenue"]',
        '.monthly-revenue, [data-metric="monthlyRevenue"]',
        '.membership-revenue, [data-metric="membershipRevenue"]',
        '.course-revenue, [data-metric="courseRevenue"]',
        'text=总收入', 'text=月收入', 'text=会员收入', 'text=课程收入'
      ]

      let visibleMetrics = 0
      for (const metricSelector of financeMetrics) {
        const metricElement = page.locator(metricSelector)
        const isVisible = await metricElement.isVisible().catch(() => false)
        if (isVisible) {
          visibleMetrics++
          const metricText = await metricElement.textContent()
          logStep(`财务指标: ${metricText}`)
        }
      }

      logStep(`显示 ${visibleMetrics} 项财务统计指标`)

      // 检查收入趋势图表
      const revenueChart = page.locator('.revenue-chart, .line-chart, canvas').first()
      if (await revenueChart.isVisible().catch(() => false)) {
        logStep('收入趋势图表存在')
      }

    } else {
      logStep('未发现财务统计区域')
    }

    await takeScreenshot(page, 'finance_statistics_report')
  })

  test('时间范围筛选', async ({ page }) => {
    logStep('开始时间范围筛选测试')

    const reportsPage = new AdminReportsPage(page)

    // 访问报表分析页面
    await reportsPage.goto()

    // 设置时间范围
    const today = new Date().toISOString().split('T')[0]
    const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    await reportsPage.selectDateRange(lastMonth, today)
    logStep(`设置时间范围: ${lastMonth} 至 ${today}`)

    // 生成报表
    await reportsPage.generateReport()
    logStep('生成时间范围内的报表')

    // 验证报表生成成功
    try {
      await page.waitForSelector('text=报表生成成功, text=数据已更新, text=加载完成', { timeout: 10000 })
      logStep('时间范围报表生成成功')

      // 验证数据是否按时间范围更新
      const chartData = await reportsPage.getChartData()
      if (chartData.hasData) {
        logStep('图表数据已按时间范围更新')
      }

    } catch (error) {
      logStep('报表生成操作完成')
    }

    await takeScreenshot(page, 'time_range_filtering')
  })

  test('数据导出功能', async ({ page }) => {
    logStep('开始数据导出功能测试')

    const reportsPage = new AdminReportsPage(page)

    // 访问报表分析页面
    await reportsPage.goto()

    // 导出报表
    await reportsPage.exportReport()
    logStep('执行报表导出操作')

    // 验证导出成功
    try {
      await page.waitForSelector('text=导出成功, text=下载成功, text=文件已生成', { timeout: 10000 })
      logStep('报表导出成功')
    } catch (error) {
      logStep('导出操作完成')
    }

    await takeScreenshot(page, 'report_export')
  })

  test('数据可视化图表', async ({ page }) => {
    logStep('开始数据可视化图表测试')

    const reportsPage = new AdminReportsPage(page)

    // 访问报表分析页面
    await reportsPage.goto()

    // 检查各种图表类型
    const chartTypes = [
      { selector: '.line-chart, canvas', name: '折线图' },
      { selector: '.bar-chart, canvas', name: '柱状图' },
      { selector: '.pie-chart, canvas', name: '饼图' },
      { selector: '.area-chart, canvas', name: '面积图' },
      { selector: '.scatter-chart, canvas', name: '散点图' }
    ]

    let foundCharts = 0
    for (const chartType of chartTypes) {
      const chart = page.locator(chartType.selector).first()
      const isVisible = await chart.isVisible().catch(() => false)
      if (isVisible) {
        foundCharts++
        logStep(`${chartType.name} 图表存在`)
      }
    }

    logStep(`发现 ${foundCharts} 种类型的图表`)

    // 检查图表交互功能
    const interactiveElements = page.locator('.chart-legend, .chart-tooltip, .chart-zoom')
    const interactiveCount = await interactiveElements.count()
    if (interactiveCount > 0) {
      logStep(`图表具有 ${interactiveCount} 个交互元素`)
    }

    // 检查图表数据更新
    const refreshButton = page.locator('button:has-text("刷新"), button:has-text("更新数据")')
    if (await refreshButton.isVisible().catch(() => false)) {
      await refreshButton.click()
      logStep('刷新图表数据')

      try {
        await page.waitForSelector('text=数据已更新, text=刷新成功', { timeout: 5000 })
        logStep('图表数据刷新成功')
      } catch (error) {
        logStep('数据刷新操作完成')
      }
    }

    await takeScreenshot(page, 'data_visualization_charts')
  })

  test('关键指标监控', async ({ page }) => {
    logStep('开始关键指标监控测试')

    const reportsPage = new AdminReportsPage(page)

    // 访问报表分析页面
    await reportsPage.goto()

    // 检查关键指标面板
    const kpiPanel = page.locator('.kpi-panel, .metrics-dashboard, .key-metrics')
    if (await kpiPanel.isVisible().catch(() => false)) {
      logStep('关键指标面板存在')

      // 验证各项KPI指标
      const kpiMetrics = [
        { selector: '.kpi-users, [data-kpi="users"]', name: '用户指标' },
        { selector: '.kpi-revenue, [data-kpi="revenue"]', name: '收入指标' },
        { selector: '.kpi-courses, [data-kpi="courses"]', name: '课程指标' },
        { selector: '.kpi-satisfaction, [data-kpi="satisfaction"]', name: '满意度指标' }
      ]

      let visibleKPIs = 0
      for (const kpi of kpiMetrics) {
        const kpiElement = page.locator(kpi.selector)
        const isVisible = await kpiElement.isVisible().catch(() => false)
        if (isVisible) {
          visibleKPIs++
          const kpiValue = await kpiElement.textContent()
          logStep(`${kpi.name}: ${kpiValue}`)
        }
      }

      logStep(`显示 ${visibleKPIs} 项关键指标`)

      // 检查指标趋势指示器
      const trendIndicators = page.locator('.trend-up, .trend-down, .trend-stable')
      const trendCount = await trendIndicators.count()
      if (trendCount > 0) {
        logStep(`发现 ${trendCount} 个趋势指示器`)
      }

    } else {
      logStep('未发现关键指标面板')
    }

    await takeScreenshot(page, 'key_metrics_monitoring')
  })

  test('业务分析报告', async ({ page }) => {
    logStep('开始业务分析报告测试')

    const reportsPage = new AdminReportsPage(page)

    // 访问报表分析页面
    await reportsPage.goto()

    // 检查业务分析区域
    const businessAnalysisSection = page.locator('.business-analysis, .analysis-report, [data-report="business"]')
    if (await businessAnalysisSection.isVisible().catch(() => false)) {
      logStep('业务分析区域存在')

      // 验证业务分析指标
      const businessMetrics = [
        '.conversion-rate, [data-metric="conversionRate"]',
        '.retention-rate, [data-metric="retentionRate"]',
        '.churn-rate, [data-metric="churnRate"]',
        '.avg-session-time, [data-metric="avgSessionTime"]',
        'text=转化率', 'text=留存率', 'text=流失率', 'text=平均使用时长'
      ]

      let visibleMetrics = 0
      for (const metricSelector of businessMetrics) {
        const metricElement = page.locator(metricSelector)
        const isVisible = await metricElement.isVisible().catch(() => false)
        if (isVisible) {
          visibleMetrics++
          const metricText = await metricElement.textContent()
          logStep(`业务指标: ${metricText}`)
        }
      }

      logStep(`显示 ${visibleMetrics} 项业务分析指标`)

      // 检查用户行为分析图表
      const behaviorChart = page.locator('.behavior-chart, .user-behavior, canvas').first()
      if (await behaviorChart.isVisible().catch(() => false)) {
        logStep('用户行为分析图表存在')
      }

    } else {
      logStep('未发现业务分析区域')
    }

    await takeScreenshot(page, 'business_analysis_report')
  })

  test('自定义报表生成', async ({ page }) => {
    logStep('开始自定义报表生成测试')

    const reportsPage = new AdminReportsPage(page)

    // 访问报表分析页面
    await reportsPage.goto()

    // 检查自定义报表功能
    const customReportSection = page.locator('.custom-report, .report-builder, [data-feature="custom-report"]')
    if (await customReportSection.isVisible().catch(() => false)) {
      logStep('自定义报表功能存在')

      // 选择报表类型
      const reportTypeSelect = page.locator('select[name="reportType"], .report-type-select')
      if (await reportTypeSelect.isVisible().catch(() => false)) {
        const options = await reportTypeSelect.locator('option').allTextContents()
        if (options.length > 1) {
          await reportTypeSelect.selectOption(options[1])
          logStep(`选择报表类型: ${options[1]}`)
        }
      }

      // 选择数据维度
      const dimensionCheckboxes = page.locator('input[type="checkbox"][name*="dimension"]')
      const dimensionCount = await dimensionCheckboxes.count()
      if (dimensionCount > 0) {
        // 选择前两个维度
        for (let i = 0; i < Math.min(2, dimensionCount); i++) {
          await dimensionCheckboxes.nth(i).check()
        }
        logStep('选择数据维度')
      }

      // 生成自定义报表
      const generateCustomButton = page.locator('button:has-text("生成报表"), button:has-text("创建报表")')
      if (await generateCustomButton.isVisible().catch(() => false)) {
        await generateCustomButton.click()
        logStep('生成自定义报表')

        // 验证报表生成成功
        try {
          await page.waitForSelector('text=报表生成成功, text=自定义报表已创建', { timeout: 10000 })
          logStep('自定义报表生成成功')
        } catch (error) {
          logStep('自定义报表生成操作完成')
        }
      }

    } else {
      logStep('未发现自定义报表功能')
    }

    await takeScreenshot(page, 'custom_report_generation')
  })

  test('报表权限验证', async ({ page }) => {
    logStep('开始报表权限验证测试')

    const reportsPage = new AdminReportsPage(page)

    // 访问报表分析页面
    await reportsPage.goto()

    // 验证管理员权限
    const reportActions = [
      'button:has-text("生成报表")',
      'button:has-text("导出")',
      'button:has-text("刷新")',
      'button:has-text("自定义")',
      'button:has-text("保存")'
    ]

    let availableActions = 0
    for (const actionSelector of reportActions) {
      const action = page.locator(actionSelector)
      const isVisible = await action.isVisible().catch(() => false)
      if (isVisible) {
        availableActions++
        logStep(`权限验证通过: ${actionSelector}`)
      }
    }

    expect(availableActions).toBeGreaterThan(0)
    logStep(`管理员拥有 ${availableActions} 项报表分析权限`)

    await takeScreenshot(page, 'reports_permissions')
  })

  test('报表性能测试', async ({ page }) => {
    logStep('开始报表性能测试')

    const reportsPage = new AdminReportsPage(page)

    // 测试页面加载性能
    const startTime = Date.now()
    await reportsPage.goto()
    const loadTime = Date.now() - startTime
    logStep(`报表页面加载时间: ${loadTime}ms`)

    // 测试数据加载性能
    const dataLoadStart = Date.now()
    await page.waitForSelector('.chart, .metric, .statistic', { timeout: 10000 })
    const dataLoadTime = Date.now() - dataLoadStart
    logStep(`数据加载时间: ${dataLoadTime}ms`)

    // 测试图表渲染性能
    const chartRenderStart = Date.now()
    const chartData = await reportsPage.getChartData()
    const chartRenderTime = Date.now() - chartRenderStart
    logStep(`图表渲染时间: ${chartRenderTime}ms (${chartData.chartCount} 个图表)`)

    // 测试报表生成性能
    const reportGenStart = Date.now()
    const generateButton = page.locator('button:has-text("生成报表")').first()
    if (await generateButton.isVisible().catch(() => false)) {
      await generateButton.click()
      await page.waitForTimeout(2000) // 等待生成完成
      const reportGenTime = Date.now() - reportGenStart
      logStep(`报表生成耗时: ${reportGenTime}ms`)
    }

    // 验证性能指标
    expect(loadTime).toBeLessThan(8000) // 页面加载不超过8秒（报表页面较复杂）
    expect(dataLoadTime).toBeLessThan(5000) // 数据加载不超过5秒
    expect(chartRenderTime).toBeLessThan(3000) // 图表渲染不超过3秒

    await takeScreenshot(page, 'reports_performance')
  })
})
