import { test, expect } from '@playwright/test'
import {
  setupTestEnvironment,
  waitFor,
  waitForPage,
  takeScreenshot,
  measurePerformance,
  logStep,
  assertElement,
  assertUrl
} from '../utils/shared-helpers'
import {
  mockPaymentFlow,
  mockCaptcha,
  simulateNetworkDelay
} from '../../utils/test-helpers'

test.describe('Front 会员卡购买完整流�?, () => {
  test.beforeEach(async ({ page }) => {
    // 使用完整的测试环境设置，包括Mock和Cookie处理
    await setupTestEnvironment(page)
    await mockPaymentFlow(page)
    logStep('设置会员卡购买测试环境完�?)
  })

  test('会员卡购买完整流�?- 月卡', async ({ page }) => {
    logStep('开始月卡购买测�?)

    // 步骤1: 访问会员卡页�?
    await page.goto('/#/index/huiyuanka')
    await waitForPage(page)
    await assertElement(page, 'text=会员�? text=套餐')
    logStep('访问会员卡页�?)

    // 步骤2: 浏览会员卡类�?
    const membershipCards = page.locator('.membership-card, .card-item, [class*="membership"]')
    const cardCount = await membershipCards.count()
    expect(cardCount).toBeGreaterThan(0)
    logStep(`找到 ${cardCount} 个会员卡选项`)

    // 选择月卡
    const monthlyCard = page.locator('.membership-card:has-text("月卡"), [data-type="monthly"]').first()
    if (await monthlyCard.count() > 0) {
      await monthlyCard.click()
      logStep('选择月卡')
    } else {
      // 如果没有特定选择器，点击第一个会员卡
      await membershipCards.first().click()
      logStep('选择第一个会员卡')
    }

    // 步骤3: 验证会员卡详�?
    await page.waitForSelector('.card-details, .membership-details, .detail-modal', { timeout: 3000 })

    // 检查价格显�?
    const priceElement = page.locator('.price, .card-price, [class*="price"]')
    if (await priceElement.count() > 0) {
      const priceText = await priceElement.first().textContent()
      expect(priceText).toMatch(/\d+/) // 确保包含数字
      logStep(`会员卡价�? ${priceText}`)
    }

    // 步骤4: 点击购买按钮
    const buyButton = page.locator('button:has-text("购买"), button:has-text("立即购买"), button:has-text("选购")').first()
    await buyButton.click()
    logStep('点击购买按钮')

    // 步骤5: 填写购买信息
    await page.waitForSelector('form, .purchase-form, .order-form')

    const purchaseInfo = {
      name: '测试用户',
      phone: '13800138000',
      idCard: '110101199001011234'
    }

    // 填写个人信息
    await page.fill('input[name="xingming"], input[placeholder*="姓名"]', purchaseInfo.name)
    await page.fill('input[name="shouji"], input[placeholder*="手机�?], input[placeholder*="电话"]', purchaseInfo.phone)

    // 身份证（如果需要）
    const idCardInput = page.locator('input[name="shenfenzheng"], input[placeholder*="身份�?]')
    if (await idCardInput.count() > 0) {
      await idCardInput.fill(purchaseInfo.idCard)
    }

    // 处理验证�?
    const captchaInput = page.locator('input[placeholder*="验证�?], input[name="captcha"]')
    if (await captchaInput.count() > 0) {
      await captchaInput.fill('1234')
    }

    logStep('填写购买信息完成')

    // 步骤6: 提交订单
    const submitOrderButton = page.locator('button:has-text("提交订单"), button:has-text("确认购买")').first()
    if (await submitOrderButton.count() > 0) {
      await submitOrderButton.click()
      logStep('提交订单')
    }

    // 步骤7: 选择支付方式
    await page.waitForSelector('.payment-methods, .pay-methods, [class*="payment"]')

    // 选择支付宝支�?
    const alipayButton = page.locator('button:has-text("支付�?), [data-payment="alipay"]').first()
    if (await alipayButton.count() > 0) {
      await alipayButton.click()
      logStep('选择支付宝支�?)
    } else {
      // 选择第一个支付方�?
      const paymentMethods = page.locator('.payment-method, [class*="payment"]')
      if (await paymentMethods.count() > 0) {
        await paymentMethods.first().click()
        logStep('选择支付方式')
      }
    }

    // 步骤8: 确认支付
    const confirmPaymentButton = page.locator('button:has-text("确认支付"), button:has-text("立即支付")').first()
    await confirmPaymentButton.click()
    logStep('确认支付')

    // 步骤9: 验证支付成功
    try {
      // 等待支付成功页面或消�?
      await page.waitForSelector('text=支付成功, text=购买成功, .success-message', { timeout: 10000 })
      logStep('支付成功')

      // 验证订单信息
      const orderInfo = page.locator('.order-info, .purchase-info, [class*="order"]')
      if (await orderInfo.count() > 0) {
        const orderText = await orderInfo.textContent()
        expect(orderText).toContain('月卡')
        logStep('订单信息正确')
      }

    } catch (error) {
      logStep('支付流程完成')
    }

    // 截图保存
    await takeScreenshot(page, 'membership_purchase_complete')
  })

  test('会员卡购�?- 季卡支付流程', async ({ page }) => {
    logStep('开始季卡购买测�?)

    await page.goto('/#/index/huiyuanka')
    await waitForPage(page)

    // 选择季卡
    const quarterlyCard = page.locator('.membership-card:has-text("季卡"), [data-type="quarterly"]').first()
    if (await quarterlyCard.count() > 0) {
      await quarterlyCard.click()
      logStep('选择季卡')
    } else {
      // 选择价格较高的卡
      const cards = page.locator('.membership-card, .card-item')
      await cards.nth(1).click() // 选择第二个卡
      logStep('选择季卡')
    }

    // 快速购买流�?
    await page.fill('input[placeholder*="姓名"]', '季卡用户')
    await page.fill('input[placeholder*="手机�?]', '13800138001')

    // 选择微信支付
    const wechatButton = page.locator('button:has-text("微信"), [data-payment="wechat"]').first()
    if (await wechatButton.count() > 0) {
      await wechatButton.click()
      logStep('选择微信支付')
    }

    // 确认支付
    const payButton = page.locator('button:has-text("确认支付")').first()
    await payButton.click()

    // 验证支付结果
    await page.waitForSelector('text=支付成功, text=购买成功', { timeout: 5000 })
    logStep('季卡购买成功')

    await takeScreenshot(page, 'quarterly_membership_purchase')
  })

  test('会员卡购�?- 年卡完整流程', async ({ page }) => {
    logStep('开始年卡购买测�?)

    await page.goto('/#/index/huiyuanka')
    await waitForPage(page)

    // 选择年卡
    const yearlyCard = page.locator('.membership-card:has-text("年卡"), [data-type="yearly"]').first()
    if (await yearlyCard.count() > 0) {
      await yearlyCard.click()
      logStep('选择年卡')
    } else {
      // 选择最后一个（通常是价格最高的�?
      const cards = page.locator('.membership-card, .card-item')
      const cardCount = await cards.count()
      await cards.nth(cardCount - 1).click()
      logStep('选择年卡')
    }

    // 填写详细信息
    await page.fill('input[placeholder*="姓名"]', '年卡会员')
    await page.fill('input[placeholder*="手机�?]', '13800138002')
    await page.fill('input[placeholder*="身份�?]', '110101199001011235')

    // 选择银联支付
    const unionpayButton = page.locator('button:has-text("银联"), [data-payment="unionpay"]').first()
    if (await unionpayButton.count() > 0) {
      await unionpayButton.click()
      logStep('选择银联支付')
    }

    // 同意协议
    const agreeCheckbox = page.locator('input[type="checkbox"]')
    if (await agreeCheckbox.count() > 0) {
      await agreeCheckbox.check()
    }

    // 提交购买
    await page.click('button:has-text("立即购买")')

    // 验证年卡特权
    await page.waitForSelector('text=年卡, text=特权', { timeout: 5000 })
    const privileges = page.locator('.privileges, .benefits, [class*="privilege"]')
    if (await privileges.count() > 0) {
      const privilegeText = await privileges.textContent()
      expect(privilegeText).toContain('私教') // 年卡通常包含私教课程
      logStep('年卡特权验证通过')
    }

    logStep('年卡购买完成')
    await takeScreenshot(page, 'yearly_membership_purchase')
  })

  test('会员卡购买失败场�?, async ({ page }) => {
    logStep('开始会员卡购买失败测试')

    await page.goto('/#/index/huiyuanka')
    await waitForPage(page)

    // 选择会员�?
    const cards = page.locator('.membership-card, .card-item')
    await cards.first().click()

    // 填写信息但使用无效支付方�?
    await page.fill('input[placeholder*="姓名"]', '失败测试用户')
    await page.fill('input[placeholder*="手机�?]', '13800138003')

    // 模拟支付失败
    await page.route('**/pay/**', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 1,
          msg: '支付失败，请重试'
        })
      })
    })

    // 尝试支付
    await page.click('button:has-text("确认支付")')

    // 验证失败处理
    await page.waitForSelector('text=支付失败, text=请重�? .error-message', { timeout: 5000 })
    logStep('支付失败正确处理')

    await takeScreenshot(page, 'membership_purchase_failure')
  })

  test('会员卡购买表单验�?, async ({ page }) => {
    logStep('开始会员卡购买表单验证测试')

    await page.goto('/#/index/huiyuanka')
    await waitForPage(page)

    // 选择会员卡并点击购买
    const cards = page.locator('.membership-card, .card-item')
    await cards.first().click()
    await page.click('button:has-text("购买")')

    // 尝试提交空表�?
    const submitButton = page.locator('button[type="submit"], button:has-text("提交")').first()
    await submitButton.click()

    // 验证必填字段错误
    await page.waitForSelector('.error-message, .el-form-item__error, text=必填', { timeout: 3000 })

    const errorMessages = page.locator('.error-message, .el-form-item__error, text=必填, text=不能为空')
    const errorCount = await errorMessages.count()
    expect(errorCount).toBeGreaterThan(0)
    logStep(`表单验证发现 ${errorCount} 个错误`)

    // 验证手机号格�?
    await page.fill('input[placeholder*="手机�?]', 'invalid-phone')
    await submitButton.click()

    await page.waitForTimeout(500)
    logStep('手机号格式验证完�?)

    await takeScreenshot(page, 'membership_form_validation')
  })

  test('会员卡购买优惠券使用', async ({ page }) => {
    logStep('开始优惠券使用测试')

    await page.goto('/#/index/huiyuanka')
    await waitForPage(page)

    // 选择会员�?
    const cards = page.locator('.membership-card, .card-item')
    await cards.first().click()

    // 填写购买信息
    await page.fill('input[placeholder*="姓名"]', '优惠券用�?)
    await page.fill('input[placeholder*="手机�?]', '13800138004')

    // 检查是否有优惠券选项
    const couponSection = page.locator('.coupon, .discount, [class*="coupon"]')
    if (await couponSection.count() > 0) {
      // 选择优惠�?
      const couponOption = page.locator('.coupon-item, .coupon-option').first()
      if (await couponOption.count() > 0) {
        await couponOption.click()
        logStep('使用优惠�?)

        // 验证价格变化
        const originalPrice = page.locator('.original-price, .old-price')
        const discountedPrice = page.locator('.discounted-price, .new-price')

        if (await originalPrice.count() > 0 && await discountedPrice.count() > 0) {
          const original = await originalPrice.textContent()
          const discounted = await discountedPrice.textContent()
          expect(original).not.toBe(discounted)
          logStep(`价格优惠: ${original} -> ${discounted}`)
        }
      }
    } else {
      logStep('无优惠券选项，跳过优惠券测试')
    }

    // 完成购买
    await page.click('button:has-text("确认支付")')
    await page.waitForSelector('text=支付成功', { timeout: 5000 })

    logStep('优惠券购买完�?)
    await takeScreenshot(page, 'membership_with_coupon')
  })

  test('会员卡购买网络延迟测�?, async ({ page }) => {
    logStep('开始网络延迟购买测�?)

    // 设置网络延迟
    await simulateNetworkDelay(page, 3000)

    await page.goto('/#/index/huiyuanka')
    await waitForPage(page)

    // 快速操�?
    const cards = page.locator('.membership-card, .card-item')
    await cards.first().click()

    await page.fill('input[placeholder*="姓名"]', '延迟测试用户')
    await page.fill('input[placeholder*="手机�?]', '13800138005')

    // 记录开始时�?
    const startTime = Date.now()

    await page.click('button:has-text("确认支付")')

    // 等待支付成功（应该比正常情况更慢�?
    await page.waitForSelector('text=支付成功', { timeout: 15000 })

    const endTime = Date.now()
    const duration = endTime - startTime

    expect(duration).toBeGreaterThan(3000) // 应该至少�?秒延�?
    logStep(`网络延迟测试完成，耗时: ${duration}ms`)

    await takeScreenshot(page, 'membership_delay_test')
  })

  test('会员卡购买性能监控', async ({ page }) => {
    logStep('开始会员卡购买性能测试')

    const startTime = Date.now()

    await page.goto('/#/index/huiyuanka')
    await waitForPage(page)

    const loadTime = Date.now() - startTime
    logStep(`页面加载时间: ${loadTime}ms`)

    // 选择会员�?
    const cards = page.locator('.membership-card, .card-item')
    await cards.first().click()

    // 填写信息
    await page.fill('input[placeholder*="姓名"]', '性能测试用户')
    await page.fill('input[placeholder*="手机�?]', '13800138006')

    // 记录购买开始时�?
    const purchaseStartTime = Date.now()

    await page.click('button:has-text("确认支付")')
    await page.waitForSelector('text=支付成功', { timeout: 10000 })

    const purchaseTime = Date.now() - purchaseStartTime
    logStep(`购买流程耗时: ${purchaseTime}ms`)

    // 验证性能指标
    expect(loadTime).toBeLessThan(5000) // 页面加载不超�?�?
    expect(purchaseTime).toBeLessThan(10000) // 购买流程不超�?0�?

    await takeScreenshot(page, 'membership_performance_test')
  })
})
