import { test, expect } from '@playwright/test'
import { setupTestEnvironment, logTestStep } from '../utils/shared-helpers'
import { mockFrontApi, seedFrontSession } from '../utils/test-helpers'

test.describe('预约流程E2E测试', () => {
  test.beforeEach(async ({ page }) => {
    // 使用完整的测试环境设置，包括Mock和Cookie处理
    await setupTestEnvironment(page)
    await seedFrontSession(page)
    await mockFrontApi(page)
    logTestStep('设置预约流程测试环境完成')
  })

  test('课程预约完整流程', async ({ page }) => {
    // 步骤1: 选择课程
    await expect(page.locator('text=选择课程')).toBeVisible()
    const courseCards = page.locator('.coach-card, [class*="course-card"]')
    const firstCourse = courseCards.first()
    if (await firstCourse.count() > 0) {
      await firstCourse.click()
      await page.waitForTimeout(500)
    }

    // 点击下一步
    const nextButton = page.locator('button:has-text("下一步")').first()
    if (await nextButton.isEnabled()) {
      await nextButton.click()
      await page.waitForTimeout(500)
    }

    // 步骤2: 选择时间
    await expect(page.locator('text=选择日期')).toBeVisible({ timeout: 5000 })
    const timeSlots = page.locator('.calendar-slot:not([disabled])').first()
    if (await timeSlots.count() > 0) {
      await timeSlots.click()
      await page.waitForTimeout(500)
    }

    // 点击下一步
    const nextButton2 = page.locator('button:has-text("下一步")').nth(1)
    if (await nextButton2.isEnabled()) {
      await nextButton2.click()
      await page.waitForTimeout(500)
    }

    // 步骤3: 填写信息
    await expect(page.locator('text=确认信息')).toBeVisible({ timeout: 5000 })
    await page.fill('input[placeholder*="姓名"], input[placeholder*="联系人"]', '测试用户')
    await page.fill('input[placeholder*="手机"], input[placeholder*="电话"]', '13800138000')
    await page.check('input[type="checkbox"]')

    // 提交预约
    const submitButton = page.locator('button:has-text("提交预约")')
    if (await submitButton.isEnabled()) {
      await submitButton.click()
      await page.waitForTimeout(1000)
    }

    // 验证成功提示
    await expect(page.locator('text=预约成功')).toBeVisible({ timeout: 5000 })
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
      await page.waitForTimeout(500)

      // 验证冲突提示
      const conflictMessage = page.locator('text=冲突, text=时间冲突')
      await expect(conflictMessage.first()).toBeVisible({ timeout: 3000 })
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
      await page.waitForTimeout(500)
    }

    // 步骤2: 选择目标和套餐
    const nextButton = page.locator('button:has-text("下一步")').first()
    if (await nextButton.isEnabled()) {
      await nextButton.click()
      await page.waitForTimeout(500)
    }

    await expect(page.locator('text=设定目标')).toBeVisible({ timeout: 5000 })
    const packageCards = page.locator('.package-card')
    if (await packageCards.count() > 0) {
      await packageCards.first().click()
      await page.waitForTimeout(500)
    }

    // 步骤3: 选择时间
    const nextButton2 = page.locator('button:has-text("下一步")').nth(1)
    if (await nextButton2.isEnabled()) {
      await nextButton2.click()
      await page.waitForTimeout(500)
    }

    await expect(page.locator('text=安排私教时间')).toBeVisible({ timeout: 5000 })
    const timeSlots = page.locator('.calendar-slot:not([disabled])').first()
    if (await timeSlots.count() > 0) {
      await timeSlots.click()
      await page.waitForTimeout(500)
    }

    // 步骤4: 确认支付
    const nextButton3 = page.locator('button:has-text("下一步")').nth(2)
    if (await nextButton3.isEnabled()) {
      await nextButton3.click()
      await page.waitForTimeout(500)
    }

    await expect(page.locator('text=确认预约')).toBeVisible({ timeout: 5000 })
    await page.fill('input[placeholder*="姓名"], input[placeholder*="联系人"]', '测试用户')
    await page.fill('input[placeholder*="手机"], input[placeholder*="电话"]', '13800138000')
    await page.check('input[type="checkbox"]')

    const submitButton = page.locator('button:has-text("提交预约")')
    if (await submitButton.isEnabled()) {
      await submitButton.click()
      await page.waitForTimeout(1000)
    }

    // 验证成功提示
    await expect(page.locator('text=预约成功')).toBeVisible({ timeout: 5000 })
  })

  test('支付流程测试', async ({ page }) => {
    await page.goto('/#/index/pay?amount=100&tableName=kechengyuyue&recordId=1&title=测试订单')
    await page.waitForLoadState('networkidle')

    // 验证订单信息显示
    await expect(page.locator('text=¥100')).toBeVisible()
    await expect(page.locator('text=测试订单')).toBeVisible()

    // 选择支付方式
    const paymentMethods = page.locator('.payment-method')
    if (await paymentMethods.count() > 0) {
      await paymentMethods.first().click()
      await page.waitForTimeout(500)
    }

    // 确认支付
    const payButton = page.locator('button:has-text("确认支付")')
    if (await payButton.isEnabled()) {
      await payButton.click()
      await page.waitForTimeout(1000)
    }

    // 验证支付状态显示
    await expect(page.locator('text=等待支付结果, text=支付中')).toBeVisible({ timeout: 5000 })
  })
})

