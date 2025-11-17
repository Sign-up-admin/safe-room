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

  async selectTrainer(index = 0): Promise<void> {
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

  async getTrainerPrice(index = 0): Promise<string> {
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

  async searchTrainers(searchTerm: string): Promise<void> {
    const searchInput = this.page.locator('input[placeholder*="搜索"], input[name="search"], .search-input')

    if (await searchInput.count() > 0) {
      await searchInput.clear()
      await searchInput.fill(searchTerm)
      await this.page.keyboard.press('Enter')
      await this.page.waitForTimeout(1000) // Wait for search results

      logTestStep(`搜索教练: ${searchTerm}`)
    } else {
      logTestStep('无教练搜索功能')
    }
  }

  async applyTrainerFilter(filterType: 'specialty' | 'price' | 'rating' | 'experience', value: string): Promise<void> {
    const filterMap = {
      specialty: ['select[name*="specialty"]', '.specialty-filter', '[name*="zhuan"]'],
      price: ['select[name*="price"]', '.price-filter', '[name*="jiage"]'],
      rating: ['select[name*="rating"]', '.rating-filter', '[name*="pingfen"]'],
      experience: ['select[name*="experience"]', '.experience-filter', '[name*="jingyan"]']
    }

    const selectors = filterMap[filterType]

    for (const selector of selectors) {
      try {
        const filterElement = this.page.locator(selector)
        if (await filterElement.count() > 0) {
          if (selector.includes('select')) {
            await filterElement.selectOption(value)
          } else {
            await this.page.locator(`${selector}:has-text("${value}")`).click()
          }

          await this.page.waitForTimeout(500) // Wait for filter to apply
          logTestStep(`应用教练${filterType}筛选: ${value}`)
          return
        }
      } catch (error) {
        // Try next selector
      }
    }

    logTestStep(`教练${filterType}筛选器不可用`)
  }

  async selectTrainerPackage(index = 0): Promise<void> {
    const packageSelectors = [
      '.package-card',
      '.plan-card',
      '.pricing-card',
      '[class*="package"]'
    ]

    for (const selector of packageSelectors) {
      try {
        const packages = this.page.locator(selector)
        const count = await packages.count()
        if (count > index) {
          await packages.nth(index).click()
          logTestStep(`选择教练套餐 ${index + 1}`)
          return
        }
      } catch (error) {
        // Try next selector
      }
    }

    logTestStep('无教练套餐选择')
  }

  async selectTrainerGoal(goal: string): Promise<void> {
    const goalSelectors = [
      `button:has-text("${goal}")`,
      `.goal-item:has-text("${goal}")`,
      `.target:has-text("${goal}")`,
      `[data-goal="${goal}"]`
    ]

    for (const selector of goalSelectors) {
      try {
        const goalElement = this.page.locator(selector)
        if (await goalElement.count() > 0) {
          await goalElement.click()
          logTestStep(`选择训练目标: ${goal}`)
          return
        }
      } catch (error) {
        // Try next selector
      }
    }

    logTestStep(`训练目标 ${goal} 不可用`)
  }

  async getTrainerInfo(index = 0): Promise<{
    name: string,
    specialty: string,
    rating: string,
    experience: string,
    price: string
  }> {
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
          const trainer = trainers.nth(index)

          const name = await trainer.locator('.trainer-name, .coach-name, .name').textContent() || ''
          const specialty = await trainer.locator('.specialty, .zhuan, [class*="special"]').textContent() || ''
          const rating = await trainer.locator('.rating, .score, [class*="rating"]').textContent() || ''
          const experience = await trainer.locator('.experience, .years, [class*="exp"]').textContent() || ''
          const price = await trainer.locator('.price, .trainer-price, [class*="price"]').textContent() || ''

          return { name, specialty, rating, experience, price }
        }
      } catch (error) {
        // Try next selector
      }
    }

    return { name: '', specialty: '', rating: '', experience: '', price: '' }
  }

  async checkTimeConflict(): Promise<boolean> {
    const conflictSelectors = [
      '.time-conflict',
      '.conflict-message',
      '.time-unavailable',
      'text=时间冲突',
      'text=已被预约'
    ]

    for (const selector of conflictSelectors) {
      try {
        const conflictElement = this.page.locator(selector)
        if (await conflictElement.isVisible()) {
          return true
        }
      } catch (error) {
        // Try next selector
      }
    }

    return false
  }

  async selectAvailableTimeSlot(): Promise<boolean> {
    const availableSelectors = [
      '.time-slot:not([disabled]):not(.booked):not(.conflict)',
      '.calendar-slot:not([disabled]):not(.booked)',
      '[class*="available"]:not([disabled])'
    ]

    for (const selector of availableSelectors) {
      try {
        const availableSlots = this.page.locator(selector)
        const count = await availableSlots.count()
        if (count > 0) {
          await availableSlots.first().click()
          logTestStep('选择可用时间段')
          return true
        }
      } catch (error) {
        // Try next selector
      }
    }

    return false
  }
}

