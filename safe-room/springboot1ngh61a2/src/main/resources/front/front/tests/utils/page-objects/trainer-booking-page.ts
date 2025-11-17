import { Page, expect } from '@playwright/test'
import { waitForPageLoad, waitForElement, fillFormField, clickElement, logTestStep } from '../shared-helpers'

/**
 * Trainer Booking Page Object Model
 */
export class TrainerBookingPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    logTestStep('导航到私教预约页面')
    await this.page.goto('/#/index/sijiaoyuyue')
    await waitForPageLoad(this.page, { expectedText: '私教' })
  }

  async expectLoaded(): Promise<void> {
    // Wait for page to load with multiple fallback checks
    await waitForPageLoad(this.page, { expectedText: '私教' })

    // Check for various possible container selectors
    const containerSelectors = [
      '.trainer-booking-page',
      '.private-coach-booking',
      '.trainer-list',
      '[class*="trainer"][class*="booking"]',
      '[class*="coach"][class*="list"]'
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
      // At least check if we have some trainer-related content
      await expect(this.page.locator('text=私教, text=教练')).toBeVisible({ timeout: 5000 })
    }

    logTestStep('私教预约页面加载完成')
  }

  async selectTrainer(index: number = 0): Promise<void> {
    // Try multiple selectors for trainer cards
    const trainerSelectors = [
      '.trainer-card',
      '.coach-card',
      '.trainer-item',
      '[class*="trainer-card"]',
      '[class*="coach-card"]'
    ]

    let trainerClicked = false
    for (const selector of trainerSelectors) {
      try {
        const trainers = this.page.locator(selector)
        const count = await trainers.count()
        if (count > index) {
          await trainers.nth(index).click()
          trainerClicked = true
          logTestStep(`选择第 ${index + 1} 个教练 (使用选择器: ${selector})`)
          break
        }
      } catch (error) {
        // Try next selector
      }
    }

    if (!trainerClicked) {
      throw new Error(`无法找到第 ${index + 1} 个教练`)
    }
  }

  async selectTimeSlot(timeSlot: string): Promise<void> {
    const slotSuccess = await clickElement(
      this.page,
      [`text=${timeSlot}`, `.time-slot:has-text("${timeSlot}")`, `[data-time="${timeSlot}"]`, `.calendar-slot:has-text("${timeSlot}")`]
    )

    if (slotSuccess) {
      logTestStep(`选择时间段: ${timeSlot}`)
    }
  }

  async fillBookingForm(data: {
    name?: string,
    phone?: string,
    notes?: string,
    duration?: string
  }): Promise<void> {
    if (data.name) {
      await fillFormField(this.page, ['input[name*="name"]', 'input[placeholder*="姓名"]'], data.name)
    }

    if (data.phone) {
      await fillFormField(this.page, ['input[name*="phone"]', 'input[placeholder*="手机号"]'], data.phone)
    }

    if (data.notes) {
      await fillFormField(this.page, ['textarea[name*="notes"]', 'textarea[placeholder*="备注"]'], data.notes)
    }

    if (data.duration) {
      await fillFormField(this.page, ['select[name*="duration"]', 'input[name*="duration"]'], data.duration)
    }

    logTestStep('填写私教预约表单')
  }

  async submitBooking(): Promise<void> {
    const submitSuccess = await clickElement(
      this.page,
      ['button[type="submit"]', 'button:has-text("提交预约")', 'button:has-text("确认预约")', 'button:has-text("立即预约")']
    )

    if (submitSuccess) {
      logTestStep('提交私教预约')
    }
  }

  async getTrainerCount(): Promise<number> {
    // Try multiple selectors for trainer cards
    const trainerSelectors = [
      '.trainer-card',
      '.coach-card',
      '.trainer-item',
      '[class*="trainer-card"]',
      '[class*="coach-card"]'
    ]

    for (const selector of trainerSelectors) {
      try {
        const count = await this.page.locator(selector).count()
        if (count > 0) {
          return count
        }
      } catch (error) {
        // Try next selector
      }
    }

    return 0
  }

  async getTrainerPrice(index: number = 0): Promise<string> {
    const trainerSelectors = [
      '.trainer-card',
      '.coach-card',
      '.trainer-item'
    ]

    for (const selector of trainerSelectors) {
      try {
        const trainers = this.page.locator(selector)
        const count = await trainers.count()
        if (count > index) {
          const priceElement = trainers.nth(index).locator('.price, .trainer-price, [class*="price"]')
          return await priceElement.textContent() || ''
        }
      } catch (error) {
        // Try next selector
      }
    }

    return ''
  }
}

