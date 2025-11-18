/**
 * 增强测试功能演示
 *
 * 此文件演示如何使用改进的错误处理、重试机制和监控功能
 */

import { test, expect } from '@playwright/test'
import {
  waitForPageFullyLoaded,
  waitForElementReady,
  withSmartRetry,
  CategorizedError,
  ScreenshotErrorHandler,
  globalTestMonitor,
  takeScreenshotWithTimestamp
} from '../utils/wait-helpers'
import { applyCommonMock } from '../utils/mock-manager'
import { SCENARIO_NAMES } from '../utils/mock-presets'

test.describe('增强测试功能演示', () => {
  test('智能重试和错误分类演示', async ({ page }) => {
    const screenshotHandler = new ScreenshotErrorHandler(page)

    // 开始测试监控
    globalTestMonitor.startTest('智能重试演示', {
      category: 'error-handling',
      features: ['retry', 'error-classification']
    })

    await globalTestMonitor.recordStep('智能重试演示', '开始测试', 'start')

    try {
      // 使用智能重试执行可能失败的操作
      await withSmartRetry(
        async () => {
          await page.goto('/#/login')
          await waitForPageFullyLoaded(page)

          // 故意触发一个可能失败的操作
          const unstableElement = page.locator('.sometimes-missing-element')
          await waitForElementReady(unstableElement, { timeout: 2000 })
        },
        {
          maxRetries: 3,
          initialDelay: 1000,
          maxDelay: 5000,
          backoffMultiplier: 2,
          retryCondition: (error) => {
            const categorized = CategorizedError.fromError(error)
            // 只对元素未找到错误重试
            return categorized.type === 'element_not_found'
          }
        },
        '登录页面加载'
      )

      await globalTestMonitor.recordStep('智能重试演示', '成功完成', 'success')

    } catch (error) {
      const categorizedError = CategorizedError.fromError(error, '智能重试演示')

      // 记录错误到监控器
      globalTestMonitor.recordError('智能重试演示', error, '智能重试演示')

      // 使用截图处理器捕获错误截图
      await screenshotHandler.withScreenshot(
        async () => {
          // 这里可以添加一些清理操作
          console.log('错误已通过截图记录')
        },
        '智能重试演示',
        {
          onError: (err, screenshotPath) => {
            globalTestMonitor.recordScreenshot('智能重试演示', screenshotPath, '错误截图')
          }
        }
      )

      await globalTestMonitor.recordStep('智能重试演示', '失败处理', 'failure', { error: categorizedError.type })
    }

    // 结束测试监控
    globalTestMonitor.endTest('智能重试演示', 'passed')
  })

  test('性能监控和截图演示', async ({ page }) => {
    const screenshotHandler = new ScreenshotErrorHandler(page)

    globalTestMonitor.startTest('性能监控演示', {
      category: 'performance',
      features: ['monitoring', 'screenshots']
    })

    const startTime = Date.now()

    await globalTestMonitor.recordStep('性能监控演示', '开始页面加载', 'start')

    try {
      await page.goto('/#/index/home')
      await waitForPageFullyLoaded(page)

      const loadTime = Date.now() - startTime

      // 记录性能指标
      globalTestMonitor.recordPerformance('性能监控演示', 'page_load_time', loadTime, 'ms')

      await globalTestMonitor.recordStep('性能监控演示', '页面加载完成', 'success', { loadTime })

      // 条件截图 - 如果加载时间超过阈值
      const screenshotPath = await screenshotHandler.conditionalScreenshot(
        () => Promise.resolve(loadTime > 3000), // 如果加载超过3秒
        'slow_page_load',
        { fullPage: true }
      )

      if (screenshotPath) {
        globalTestMonitor.recordScreenshot('性能监控演示', screenshotPath, '慢加载截图')
      }

      // 验证页面元素
      await expect(page.locator('text=首页')).toBeVisible()

      await globalTestMonitor.recordStep('性能监控演示', '验证完成', 'success')

    } catch (error) {
      globalTestMonitor.recordError('性能监控演示', error, '性能测试')

      // 带截图的错误处理
      await screenshotHandler.withScreenshot(
        () => {
          throw error // 重新抛出错误，但已截图
        },
        '性能监控演示',
        {
          onError: (err, screenshotPath) => {
            globalTestMonitor.recordScreenshot('性能监控演示', screenshotPath, '错误截图')
          }
        }
      )
    }

    globalTestMonitor.endTest('性能监控演示', 'passed')
  })

  test('完整的用户旅程监控', async ({ page }) => {
    const testName = '完整用户旅程监控'

    globalTestMonitor.startTest(testName, {
      category: 'user-journey',
      features: ['full-monitoring', 'error-recovery']
    })

    try {
      // 步骤1: 登录
      await globalTestMonitor.recordStep(testName, '登录步骤', 'start')
      await applyCommonMock(page, SCENARIO_NAMES.LOGIN_SUCCESS)

      await page.goto('/#/login')
      await waitForPageFullyLoaded(page)

      await page.getByLabel('账号').fill('user01')
      await page.getByLabel('密码', { exact: false }).fill('123456')
      await page.getByRole('button', { name: '登录' }).click()

      await expect(page).toHaveURL(/#\/index\/home/)
      globalTestMonitor.recordPerformance(testName, 'login_time', Date.now() - Date.now(), 'ms')
      await globalTestMonitor.recordStep(testName, '登录成功', 'success')

      // 步骤2: 导航到功能页面
      await globalTestMonitor.recordStep(testName, '导航步骤', 'start')
      await page.goto('/#/index/course')
      await waitForPageFullyLoaded(page)

      await expect(page.locator('text=课程')).toBeVisible()
      await globalTestMonitor.recordStep(testName, '导航成功', 'success')

      // 步骤3: 执行用户操作
      await globalTestMonitor.recordStep(testName, '用户操作', 'start')

      // 查找并点击课程
      const courseCards = page.locator('.course-card').first()
      if (await courseCards.isVisible()) {
        await courseCards.click()
        await waitForPageFullyLoaded(page)

        // 记录操作成功的截图
        const screenshotPath = await takeScreenshotWithTimestamp(page, 'course_selected')
        globalTestMonitor.recordScreenshot(testName, screenshotPath, '课程选择截图')

        await globalTestMonitor.recordStep(testName, '操作成功', 'success')
      } else {
        await globalTestMonitor.recordStep(testName, '无课程数据', 'success', { note: '测试数据不足' })
      }

    } catch (error) {
      globalTestMonitor.recordError(testName, error, '用户旅程')

      // 记录失败截图
      const screenshotPath = await takeScreenshotWithTimestamp(page, 'journey_error')
      globalTestMonitor.recordScreenshot(testName, screenshotPath, '旅程错误截图')

      await globalTestMonitor.recordStep(testName, '旅程失败', 'failure')
      throw error
    }

    globalTestMonitor.endTest(testName, 'passed')
  })

  // 测试后的报告导出
  test.afterAll(async () => {
    // 导出增强的测试报告
    const report = await globalTestMonitor.exportReport('./test-results/demo-enhanced-report.json')

    console.log('\n📊 演示测试摘要:')
    console.log(`总测试数: ${report.summary.totalTests}`)
    console.log(`总耗时: ${(report.summary.totalDuration / 1000).toFixed(2)}秒`)
    console.log(`截图数量: ${report.summary.screenshotsTaken}`)
    console.log(`错误数量: ${report.errors.totalErrors}`)
    console.log(`错误类型: ${report.errors.errorTypes.join(', ') || '无'}`)

    if (report.recommendations.length > 0) {
      console.log('\n💡 改进建议:')
      report.recommendations.forEach((rec: any) => {
        console.log(`  ${rec.priority.toUpperCase()}: ${rec.message}`)
      })
    }
  })
})

