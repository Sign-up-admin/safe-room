/**
 * 预约流程E2E测试
 *
 * 测试完整的课程预约用户旅程，包括课程选择、时间选择、预约确认等步骤
 * 验证预约流程的完整性和稳定性
 */

import { test, expect } from '@playwright/test'
import { logTestStep, setupTestDataIsolation } from '../utils/shared-helpers'
import { setupBookingScenario } from '../utils/e2e-test-setup'
import {
  waitForPageFullyLoaded,
  waitForElementStable,
  waitForFormSubmission,
  waitForElementReady
} from '../utils/wait-helpers'
import { selectors } from '../utils/selectors'
import { testData } from '../utils/test-data-manager'

test.describe('预约流程E2E测试', () => {
  let testId: string
  let cleanupData: () => Promise<void>

  test.beforeEach(async ({ page }) => {
    // 设置测试数据隔离
    const isolation = await setupTestDataIsolation(page, { title: 'booking-flow-test' })
    testId = isolation.testId
    cleanupData = isolation.cleanup

    // 使用预设的预约场景设置，包含完整的Mock和会话配置
    await setupBookingScenario(page)
  })

  test.afterEach(async ({ page }) => {
    // 清理测试数据
    if (cleanupData) {
      await cleanupData()
    }
  })

  test('课程预约完整流程', async ({ page }) => {
    await logTestStep('开始课程预约完整流程测试')

    try {
      // 步骤1: 选择课程
      await logTestStep('步骤1: 选择课程')
      await expect(page.locator('text=选择课程')).toBeVisible({ timeout: 10000 })

      // 使用稳定的data-testid选择器
      const courseList = page.getByTestId(selectors.courses.listContainer)
      await waitForElementReady(courseList)

      const courseCards = page.getByTestId(/course-card-\d+/)
      const courseCount = await courseCards.count()

      if (courseCount > 0) {
        const firstCourseCard = courseCards.first()
        await waitForElementStable(firstCourseCard)
        await firstCourseCard.click()
        await logTestStep('成功选择课程')
      } else {
        // 如果没有找到课程，尝试导航到课程页面
        await page.goto('/#/index/course')
        await waitForPageFullyLoaded(page)
        const courseCardsAlt = page.locator('.course-card, .coach-card').first()
        await waitForElementReady(courseCardsAlt)
        await courseCardsAlt.click()
        await logTestStep('导航到课程页面并选择课程')
      }

      // 点击下一步 - 使用稳定的data-testid选择器
      const nextButton = page.getByTestId(selectors.booking.nextButton)
      await waitForElementReady(nextButton)
      await nextButton.click()
      await logTestStep('点击下一步按钮')

      // 步骤2: 选择时间
      await logTestStep('步骤2: 选择时间')
      await expect(page.locator('text=选择日期')).toBeVisible({ timeout: 10000 })

      // 等待日历加载
      const timeCalendar = page.getByTestId(selectors.booking.timeCalendar)
      await waitForElementReady(timeCalendar)

      // 使用稳定的时间选择器
      const timeSlots = page.getByTestId(/^time-slot-/)
      const availableSlots = timeSlots.filter({ hasNot: page.locator('[disabled]') })
      const slotCount = await availableSlots.count()

      if (slotCount > 0) {
        const firstSlot = availableSlots.first()
        await waitForElementStable(firstSlot)
        await firstSlot.click()
        await logTestStep('成功选择时间')
      } else {
        throw new Error('无法选择预约时间')
      }

      // 点击下一步
      const nextButton2 = page.getByTestId(selectors.booking.nextButton)
      await waitForElementReady(nextButton2)
      await nextButton2.click()
      await logTestStep('点击第二个下一步按钮')

      // 步骤3: 填写信息
      await logTestStep('步骤3: 填写信息')
      await expect(page.locator('text=确认信息')).toBeVisible({ timeout: 10000 })

      // 等待表单加载
      const bookingForm = page.getByTestId(selectors.booking.infoForm)
      await waitForElementReady(bookingForm)

      // 使用隔离的测试用户数据
      const testUser = testData.createUser(testId, {
        username: `booking_test_user_${Date.now()}`,
        phone: `138001${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`
      })

      // 使用稳定的data-testid选择器填写表单
      const nameInput = page.getByTestId(selectors.booking.nameInput)
      await waitForElementReady(nameInput)
      await nameInput.fill(testUser.username)
      await logTestStep('填写姓名')

      const phoneInput = page.getByTestId(selectors.booking.phoneInput)
      await waitForElementReady(phoneInput)
      await phoneInput.fill(testUser.phone!)
      await logTestStep('填写手机号')

      // 勾选协议复选框
      const agreementCheckbox = page.getByTestId(selectors.booking.agreementCheckbox)
      await waitForElementReady(agreementCheckbox)
      await agreementCheckbox.check()
      await logTestStep('勾选协议复选框')

      // 提交预约
      const submitButton = page.getByTestId(selectors.booking.submitButton)
      await waitForElementReady(submitButton)
      await submitButton.click()
      await logTestStep('提交预约')

      // 验证成功提示
      const result = await waitForFormSubmission(page, {
        successSelectors: [
          'text=预约成功',
          'text=提交成功',
          selectors.booking.successMessage
        ],
        errorSelectors: [
          'text=失败',
          'text=错误',
          selectors.booking.errorMessage
        ]
      })

      if (!result.success) {
        throw new Error(`预约失败: ${result.message}`)
      }

      await logTestStep('课程预约完整流程测试通过')

    } catch (error) {
      await logTestStep(`课程预约测试失败: ${error.message}`)
      await takeScreenshotWithTimestamp(page, 'booking-flow-error')
      throw error
    }
  })

  test('冲突检测功能', async ({ page }) => {
    // 选择课程
    const courseCards = page.locator('.coach-card, [class*="course-card"]')
    if (await courseCards.count() > 0) {
      await courseCards.first().click()
      await page.waitForTimeout(500)
    }

    // 进入时间选择步骤
    const nextButton = page.locator('button:has-text("下一步")').first()
    if (await nextButton.isEnabled()) {
      await nextButton.click()
      await page.waitForTimeout(500)
    }

    // 查找冲突时间段
    const conflictSlots = page.locator('.calendar-slot--conflict')
    if (await conflictSlots.count() > 0) {
      await conflictSlots.first().click()

      // 使用智能等待验证冲突提示
      const conflictMessage = page.locator('text=冲突, text=时间冲突')
      await waitForElementReady(conflictMessage.first())
      await expect(conflictMessage.first()).toBeVisible()
    }
  })

  test('私教预约完整流程', async ({ page }) => {
    await page.goto('/#/index/sijiaoyuyue')
    await page.waitForLoadState('networkidle')

    // 步骤1: 选择教练
    await expect(page.locator('text=选择教练')).toBeVisible()
    const coachCards = page.locator('.coach-card')
    if (await coachCards.count() > 0) {
      await coachCards.first().click()
      await waitForElementStable(coachCards.first())
    }

    // 步骤2: 选择目标和套餐
    const nextButton = page.locator('button:has-text("下一步")').first()
    if (await nextButton.isEnabled()) {
      await nextButton.click()
      await waitForPageFullyLoaded(page)
    }

    await expect(page.locator('text=设定目标')).toBeVisible()
    const packageCards = page.locator('.package-card')
    if (await packageCards.count() > 0) {
      await packageCards.first().click()
      await waitForElementStable(packageCards.first())
    }

    // 步骤3: 选择时间
    const nextButton2 = page.locator('button:has-text("下一步")').nth(1)
    if (await nextButton2.isEnabled()) {
      await nextButton2.click()
      await waitForPageFullyLoaded(page)
    }

    await expect(page.locator('text=安排私教时间')).toBeVisible()
    const timeSlots = page.locator('.calendar-slot:not([disabled])').first()
    if (await timeSlots.count() > 0) {
      await timeSlots.click()
      await waitForElementStable(timeSlots)
    }

    // 步骤4: 确认支付
    const nextButton3 = page.locator('button:has-text("下一步")').nth(2)
    if (await nextButton3.isEnabled()) {
      await nextButton3.click()
      await waitForPageFullyLoaded(page)
    }

    await expect(page.locator('text=确认预约')).toBeVisible()
    await page.fill('input[placeholder*="姓名"], input[placeholder*="联系人"]', '测试用户')
    await page.fill('input[placeholder*="手机"], input[placeholder*="电话"]', '13800138000')
    await page.check('input[type="checkbox"]')

    const submitButton = page.locator('button:has-text("提交预约")')
    if (await submitButton.isEnabled()) {
      await submitButton.click()
      await waitForFormSubmission(page, {
        successSelectors: ['text=预约成功'],
        errorSelectors: ['text=失败', 'text=错误']
      })
    }

    // 验证成功提示
    await expect(page.locator('text=预约成功')).toBeVisible({ timeout: 5000 })
  })

  test('支付流程测试', async ({ page }) => {
    await page.goto('/#/index/pay?amount=100&tableName=kechengyuyue&recordId=1&title=测试订单')
    await waitForPageFullyLoaded(page)

    // 验证订单信息显示
    await expect(page.locator('text=¥100')).toBeVisible()
    await expect(page.locator('text=测试订单')).toBeVisible()

    // 选择支付方式
    const paymentMethods = page.locator('.payment-method')
    if (await paymentMethods.count() > 0) {
      await paymentMethods.first().click()
      await waitForElementStable(paymentMethods.first())
    }

    // 确认支付
    const payButton = page.locator('button:has-text("确认支付")')
    if (await payButton.isEnabled()) {
      await payButton.click()
      await waitForFormSubmission(page, {
        successSelectors: ['text=支付成功', 'text=支付完成'],
        errorSelectors: ['text=支付失败', 'text=支付错误']
      })
    }

    // 验证支付状态显示
    await expect(page.locator('text=等待支付结果, text=支付中')).toBeVisible()
  })
})

