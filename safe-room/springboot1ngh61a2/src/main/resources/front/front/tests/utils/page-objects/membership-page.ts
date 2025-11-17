import { Page, expect } from '@playwright/test'
import { waitForPageLoad, waitForElement, fillFormField, clickElement, logTestStep } from '../shared-helpers'

/**
 * Membership Card List Page Object Model
 */
export class MembershipListPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    logTestStep('导航到会员卡列表页面')
    await this.page.goto('/#/index/huiyuanka')
    await waitForPageLoad(this.page, { expectedText: '会员卡' })
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page.locator('.membership-cards, .card-list')).toBeVisible({ timeout: 10000 })
    logTestStep('会员卡列表页面加载完成')
  }

  async clickMembershipCard(index = 0): Promise<void> {
    const cards = this.page.locator('.membership-card, .card-item')
    await cards.nth(index).click()
    logTestStep(`点击第 ${index + 1} 个会员卡`)
  }

  async getCardCount(): Promise<number> {
    const cards = this.page.locator('.membership-card, .card-item')
    return await cards.count()
  }

  async getCardPrice(index = 0): Promise<string> {
    const cards = this.page.locator('.membership-card, .card-item')
    const priceElement = cards.nth(index).locator('.price, .card-price')
    return await priceElement.textContent() || ''
  }
}

/**
 * Membership Purchase Page Object Model
 */
export class MembershipPurchasePage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    logTestStep('导航到会员卡购买页面')
    await this.page.goto('/#/index/huiyuankagoumai')
    await waitForPageLoad(this.page, { expectedText: '购买' })
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page.locator('.purchase-form, .buy-form')).toBeVisible({ timeout: 10000 })
    logTestStep('会员卡购买页面加载完成')
  }

  async selectMembershipCard(cardName: string): Promise<void> {
    const cardSuccess = await clickElement(
      this.page,
      [`text=${cardName}`, `.membership-card:has-text("${cardName}")`]
    )

    if (cardSuccess) {
      logTestStep(`选择会员卡: ${cardName}`)
    }
  }

  async fillPurchaseForm(data: {
    name: string,
    phone: string,
    email?: string,
    idCard?: string
  }): Promise<void> {
    await fillFormField(this.page, ['input[name="yonghuxingming"]', 'input[placeholder*="姓名"]'], data.name)
    await fillFormField(this.page, ['input[name="shoujihaoma"]', 'input[placeholder*="手机号"]'], data.phone)

    if (data.email) {
      await fillFormField(this.page, ['input[name="email"]', 'input[placeholder*="邮箱"]'], data.email)
    }

    if (data.idCard) {
      await fillFormField(this.page, ['input[name="shenfenzheng"]', 'input[placeholder*="身份证"]'], data.idCard)
    }

    logTestStep('填写购买表单')
  }

  async submitPurchase(): Promise<void> {
    const submitSuccess = await clickElement(
      this.page,
      ['button[type="submit"]', 'button:has-text("立即购买")', 'button:has-text("提交订单")']
    )

    if (submitSuccess) {
      logTestStep('提交购买订单')
    }
  }
}

/**
 * Membership Renewal Page Object Model
 */
export class MembershipRenewalPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    logTestStep('导航到会员续费页面')
    await this.page.goto('/#/index/huiyuanxufei')
    await waitForPageLoad(this.page, { expectedText: '续费' })
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page.locator('.renewal-form, .renew-form')).toBeVisible({ timeout: 10000 })
    logTestStep('会员续费页面加载完成')
  }

  async selectRenewalPlan(planName: string): Promise<void> {
    const planSuccess = await clickElement(
      this.page,
      [`text=${planName}`, `.renewal-plan:has-text("${planName}")`, `[data-plan="${planName}"]`]
    )

    if (planSuccess) {
      logTestStep(`选择续费方案: ${planName}`)
    }
  }

  async submitRenewal(): Promise<void> {
    const submitSuccess = await clickElement(
      this.page,
      ['button[type="submit"]', 'button:has-text("立即续费")', 'button:has-text("确认续费")']
    )

    if (submitSuccess) {
      logTestStep('提交续费申请')
    }
  }

  async getExpiryDate(): Promise<string> {
    const expiryElement = this.page.locator('.expiry-date, .expire-date').first()
    return await expiryElement.textContent() || ''
  }
}
