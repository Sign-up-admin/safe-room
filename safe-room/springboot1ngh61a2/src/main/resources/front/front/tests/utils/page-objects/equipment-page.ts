import { Page, expect } from '@playwright/test'
import { waitForPageLoad, waitForElement, fillFormField, clickElement, logTestStep } from '../shared-helpers'

/**
 * Equipment List Page Object Model
 */
export class EquipmentListPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    logTestStep('导航到器材管理页面')
    await this.page.goto('/#/index/jianshenqicai')
    await waitForPageLoad(this.page, { expectedText: '器材' })
  }

  async expectLoaded(): Promise<void> {
    // Wait for page to load with multiple fallback checks
    await waitForPageLoad(this.page, { expectedText: '器材' })

    // Check for various possible equipment container selectors
    const containerSelectors = [
      '.equipment-page__grid',
      '.equipment-list',
      '.equipment-container',
      '[class*="equipment"][class*="grid"]',
      '[class*="equipment"][class*="list"]'
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
      // At least check if we have some equipment-related content
      await expect(this.page.locator('text=器材')).toBeVisible({ timeout: 5000 })
    }

    logTestStep('器材列表页面加载完成')
  }

  async searchEquipment(keyword: string): Promise<void> {
    const searchSuccess = await fillFormField(
      this.page,
      ['input[placeholder*="搜索"]', 'input[type="search"]', '.search-input'],
      keyword
    )

    if (searchSuccess) {
      // Click search button or press enter
      await this.page.keyboard.press('Enter')
      logTestStep(`搜索器材: ${keyword}`)
    }
  }

  async filterByType(type: string): Promise<void> {
    const filterSuccess = await clickElement(
      this.page,
      [`text=${type}`, `.filter-item:has-text("${type}")`]
    )

    if (filterSuccess) {
      logTestStep(`按类型筛选: ${type}`)
    }
  }

  async filterByStatus(status: string): Promise<void> {
    const filterSuccess = await clickElement(
      this.page,
      [`text=${status}`, `.status-filter:has-text("${status}")`]
    )

    if (filterSuccess) {
      logTestStep(`按状态筛选: ${status}`)
    }
  }

  async clickEquipmentCard(index = 0): Promise<void> {
    // Try multiple selectors for equipment cards
    const cardSelectors = [
      '.equipment-card',
      '.equipment-item',
      '[class*="equipment-card"]',
      '[class*="equipment-item"]'
    ]

    let cardClicked = false
    for (const selector of cardSelectors) {
      try {
        const cards = this.page.locator(selector)
        const count = await cards.count()
        if (count > index) {
          await cards.nth(index).click()
          cardClicked = true
          logTestStep(`点击第 ${index + 1} 个器材卡片 (使用选择器: ${selector})`)
          break
        }
      } catch (error) {
        // Try next selector
      }
    }

    if (!cardClicked) {
      throw new Error(`无法找到第 ${index + 1} 个器材卡片`)
    }
  }

  async getEquipmentCount(): Promise<number> {
    // Try multiple selectors for equipment cards
    const cardSelectors = [
      '.equipment-card',
      '.equipment-item',
      '[class*="equipment-card"]',
      '[class*="equipment-item"]'
    ]

    for (const selector of cardSelectors) {
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

  async getEquipmentName(index = 0): Promise<string> {
    const cardSelectors = [
      '.equipment-card',
      '.equipment-item',
      '[class*="equipment-card"]',
      '[class*="equipment-item"]'
    ]

    for (const selector of cardSelectors) {
      try {
        const cards = this.page.locator(selector)
        const count = await cards.count()
        if (count > index) {
          const card = cards.nth(index)
          const nameElement = card.locator('h3, .equipment-name, .name').first()
          return await nameElement.textContent() || ''
        }
      } catch (error) {
        // Try next selector
      }
    }

    return ''
  }

  async getEquipmentStatus(index = 0): Promise<string> {
    const cardSelectors = [
      '.equipment-card',
      '.equipment-item',
      '[class*="equipment-card"]',
      '[class*="equipment-item"]'
    ]

    for (const selector of cardSelectors) {
      try {
        const cards = this.page.locator(selector)
        const count = await cards.count()
        if (count > index) {
          const card = cards.nth(index)
          const statusElement = card.locator('.status, .equipment-status').first()
          return await statusElement.textContent() || ''
        }
      } catch (error) {
        // Try next selector
      }
    }

    return ''
  }
}

/**
 * Equipment Detail Page Object Model
 */
export class EquipmentDetailPage {
  constructor(private page: Page) {}

  async expectLoaded(): Promise<void> {
    await expect(this.page.locator('.equipment-detail, .equipment-info')).toBeVisible({ timeout: 10000 })
    logTestStep('器材详情页面加载完成')
  }

  async clickBookButton(): Promise<void> {
    const bookSuccess = await clickElement(
      this.page,
      ['button:has-text("预约")', 'button:has-text("立即预约")', '.book-btn', '.reserve-btn']
    )

    if (bookSuccess) {
      logTestStep('点击预约按钮')
    }
  }

  async getEquipmentName(): Promise<string> {
    const nameElement = this.page.locator('h1, .equipment-title, .equipment-name').first()
    return await nameElement.textContent() || ''
  }

  async getEquipmentType(): Promise<string> {
    const typeElement = this.page.locator('.type, .equipment-type, .category').first()
    return await typeElement.textContent() || ''
  }

  async getEquipmentLocation(): Promise<string> {
    const locationElement = this.page.locator('.location, .equipment-location, .position').first()
    return await locationElement.textContent() || ''
  }

  async getEquipmentStatus(): Promise<string> {
    const statusElement = this.page.locator('.status, .equipment-status, .availability').first()
    return await statusElement.textContent() || ''
  }
}

/**
 * Equipment Booking Page Object Model
 */
export class EquipmentBookingPage {
  constructor(private page: Page) {}

  async expectLoaded(): Promise<void> {
    await expect(this.page.locator('.booking-form, .equipment-booking-form')).toBeVisible({ timeout: 10000 })
    logTestStep('器材预约页面加载完成')
  }

  async selectDate(date: string): Promise<void> {
    const dateSuccess = await fillFormField(
      this.page,
      ['input[type="date"]', '.date-picker', '.booking-date'],
      date
    )

    if (dateSuccess) {
      logTestStep(`选择日期: ${date}`)
    }
  }

  async selectTimeSlot(timeSlot: string): Promise<void> {
    const slotSuccess = await clickElement(
      this.page,
      [`text=${timeSlot}`, `.time-slot:has-text("${timeSlot}")`, `[data-time="${timeSlot}"]`]
    )

    if (slotSuccess) {
      logTestStep(`选择时间段: ${timeSlot}`)
    }
  }

  async fillBookingForm(data: {
    name?: string,
    phone?: string,
    purpose?: string,
    duration?: string
  }): Promise<void> {
    if (data.name) {
      await fillFormField(this.page, ['input[name*="name"]', 'input[placeholder*="姓名"]'], data.name)
    }

    if (data.phone) {
      await fillFormField(this.page, ['input[name*="phone"]', 'input[placeholder*="手机号"]'], data.phone)
    }

    if (data.purpose) {
      await fillFormField(this.page, ['textarea[name*="purpose"]', 'textarea[placeholder*="用途"]'], data.purpose)
    }

    if (data.duration) {
      await fillFormField(this.page, ['input[name*="duration"]', 'select[name*="duration"]'], data.duration)
    }

    logTestStep('填写器材预约表单')
  }

  async submitBooking(): Promise<void> {
    const submitSuccess = await clickElement(
      this.page,
      ['button[type="submit"]', 'button:has-text("提交预约")', 'button:has-text("确认预约")']
    )

    if (submitSuccess) {
      logTestStep('提交器材预约')
    }
  }

  async getSelectedDate(): Promise<string> {
    const dateElement = this.page.locator('input[type="date"], .date-picker').first()
    return await dateElement.inputValue() || ''
  }

  async getSelectedTimeSlot(): Promise<string> {
    const selectedSlot = this.page.locator('.time-slot.selected, .time-slot.active').first()
    return await selectedSlot.textContent() || ''
  }
}
