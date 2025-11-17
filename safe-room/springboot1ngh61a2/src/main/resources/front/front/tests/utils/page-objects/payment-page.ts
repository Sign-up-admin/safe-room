import { Page, expect } from '@playwright/test'
import { waitForPageLoad, waitForElement, fillFormField, clickElement, logTestStep } from '../shared-helpers'

/**
 * Payment Page Object Model
 */
export class PaymentPage {
  constructor(private page: Page) {}

  async expectLoaded(): Promise<void> {
    // Wait for payment page to load
    await waitForPageLoad(this.page, { expectedText: '支付' })

    // Check for payment form or payment container
    const containerSelectors = [
      '.payment-page',
      '.payment-form',
      '.checkout-page',
      '[class*="payment"]',
      '[class*="checkout"]'
    ]

    let containerFound = false
    for (const selector of containerSelectors) {
      try {
        await expect(this.page.locator(selector)).toBeVisible({ timeout: 3000 })
        containerFound = true
        break
      } catch (error) {
        // Try next selector
      }
    }

    if (!containerFound) {
      // At least check if we have payment-related content
      await expect(this.page.locator('text=支付, text=付款, text=订单')).toBeVisible({ timeout: 5000 })
    }

    logTestStep('支付页面加载完成')
  }

  async selectPaymentMethod(method: 'alipay' | 'wechat' | 'card' | 'balance'): Promise<void> {
    const methodMap = {
      alipay: ['支付宝', 'Alipay', 'alipay'],
      wechat: ['微信支付', 'WeChat', 'wechat'],
      card: ['银行卡', 'Card', 'card'],
      balance: ['余额', 'Balance', 'balance']
    }

    const methodNames = methodMap[method]
    const methodSuccess = await clickElement(
      this.page,
      methodNames.map(name => `text=${name}`).concat([
        `.payment-method[data-method="${method}"]`,
        `[data-payment="${method}"]`,
        `.payment-option:has-text("${methodNames[0]}")`
      ])
    )

    if (methodSuccess) {
      logTestStep(`选择支付方式: ${methodNames[0]}`)
    }
  }

  async fillPaymentForm(data: {
    cardNumber?: string,
    cardHolder?: string,
    expiryDate?: string,
    cvv?: string
  }): Promise<void> {
    if (data.cardNumber) {
      await fillFormField(this.page, ['input[name*="card"]', 'input[placeholder*="卡号"]'], data.cardNumber)
    }

    if (data.cardHolder) {
      await fillFormField(this.page, ['input[name*="holder"]', 'input[placeholder*="持卡人"]'], data.cardHolder)
    }

    if (data.expiryDate) {
      await fillFormField(this.page, ['input[name*="expiry"]', 'input[placeholder*="有效期"]'], data.expiryDate)
    }

    if (data.cvv) {
      await fillFormField(this.page, ['input[name*="cvv"]', 'input[placeholder*="CVV"]'], data.cvv)
    }

    logTestStep('填写支付表单')
  }

  async confirmPayment(): Promise<void> {
    const confirmSuccess = await clickElement(
      this.page,
      ['button:has-text("确认支付")', 'button:has-text("立即支付")', 'button:has-text("支付")', 'button[type="submit"]']
    )

    if (confirmSuccess) {
      logTestStep('确认支付')
    }
  }

  async getOrderAmount(): Promise<string> {
    const amountElement = this.page.locator('.order-amount, .total-amount, [class*="amount"]').first()
    return await amountElement.textContent() || ''
  }

  async getOrderNumber(): Promise<string> {
    const orderElement = this.page.locator('.order-number, .order-id, [class*="order-number"]').first()
    return await orderElement.textContent() || ''
  }

  async waitForPaymentSuccess(): Promise<void> {
    await this.page.waitForSelector('text=支付成功, text=付款成功, .success-message, .payment-success', { timeout: 10000 })
    logTestStep('支付成功')
  }

  async waitForPaymentFailure(): Promise<void> {
    await this.page.waitForSelector('text=支付失败, text=付款失败, .error-message, .payment-error', { timeout: 5000 })
    logTestStep('支付失败')
  }
}

