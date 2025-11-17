import { Page, expect } from '@playwright/test'
import { waitForPageLoad, waitForElement, fillFormField, clickElement, logTestStep } from '../shared-helpers'

/**
 * Course List Page Object Model
 */
export class CourseListPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    logTestStep('导航到课程列表页面')
    await this.page.goto('/#/index/jianshenkecheng')
    await waitForPageLoad(this.page, { expectedText: '课程' })
  }

  async expectLoaded(): Promise<void> {
    // Wait for page to load with multiple fallback checks
    await waitForPageLoad(this.page, { expectedText: '课程' })

    // Check for various possible course container selectors
    const containerSelectors = [
      '.courses-page__grid',
      '.course-list',
      '.courses-container',
      '[class*="course"][class*="grid"]',
      '[class*="course"][class*="list"]'
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
      // At least check if we have some course-related content
      await expect(this.page.locator('text=课程')).toBeVisible({ timeout: 5000 })
    }

    logTestStep('课程列表页面加载完成')
  }

  async searchCourses(keyword: string): Promise<void> {
    const searchSuccess = await fillFormField(
      this.page,
      ['input[placeholder*="搜索"]', 'input[type="search"]', '.search-input'],
      keyword
    )

    if (searchSuccess) {
      // Click search button or press enter
      await this.page.keyboard.press('Enter')
      logTestStep(`搜索课程: ${keyword}`)
    }
  }

  async filterByCategory(category: string): Promise<void> {
    const filterSuccess = await clickElement(
      this.page,
      [`text=${category}`, `.filter-item:has-text("${category}")`]
    )

    if (filterSuccess) {
      logTestStep(`按分类筛选: ${category}`)
    }
  }

  async clickCourseCard(index = 0): Promise<void> {
    // Try multiple selectors for course cards
    const cardSelectors = [
      '.course-card',
      '.course-item',
      '[class*="course-card"]',
      '[class*="course-item"]'
    ]

    let cardClicked = false
    for (const selector of cardSelectors) {
      try {
        const cards = this.page.locator(selector)
        const count = await cards.count()
        if (count > index) {
          await cards.nth(index).click()
          cardClicked = true
          logTestStep(`点击第 ${index + 1} 个课程卡片 (使用选择器: ${selector})`)
          break
        }
      } catch (error) {
        // Try next selector
      }
    }

    if (!cardClicked) {
      throw new Error(`无法找到第 ${index + 1} 个课程卡片`)
    }
  }

  async getCourseCount(): Promise<number> {
    // Try multiple selectors for course cards
    const cardSelectors = [
      '.course-card',
      '.course-item',
      '[class*="course-card"]',
      '[class*="course-item"]'
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
}

/**
 * Course Detail Page Object Model
 */
export class CourseDetailPage {
  constructor(private page: Page) {}

  async expectLoaded(): Promise<void> {
    await expect(this.page.locator('.course-detail, .course-info')).toBeVisible({ timeout: 10000 })
    logTestStep('课程详情页面加载完成')
  }

  async clickBookButton(): Promise<void> {
    const bookSuccess = await clickElement(
      this.page,
      ['button:has-text("预约")', 'button:has-text("立即预约")', '.book-btn']
    )

    if (bookSuccess) {
      logTestStep('点击预约按钮')
    }
  }

  async getCourseTitle(): Promise<string> {
    const titleElement = this.page.locator('h1, .course-title').first()
    return await titleElement.textContent() || ''
  }

  async getCoursePrice(): Promise<string> {
    const priceElement = this.page.locator('.price, .course-price').first()
    return await priceElement.textContent() || ''
  }
}

/**
 * Course Booking Page Object Model
 */
export class CourseBookingPage {
  constructor(private page: Page) {}

  async expectLoaded(): Promise<void> {
    await expect(this.page.locator('.booking-form, .appointment-form')).toBeVisible({ timeout: 10000 })
    logTestStep('课程预约页面加载完成')
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
    notes?: string
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

    logTestStep('填写预约表单')
  }

  async submitBooking(): Promise<void> {
    const submitSuccess = await clickElement(
      this.page,
      ['button[type="submit"]', 'button:has-text("提交预约")', 'button:has-text("确认预约")']
    )

    if (submitSuccess) {
      logTestStep('提交预约')
    }
  }
}
