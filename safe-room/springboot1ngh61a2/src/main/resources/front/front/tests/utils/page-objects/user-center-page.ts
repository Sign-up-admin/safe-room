import { Page, expect } from '@playwright/test'
import { waitForPageLoad, waitForElement, fillFormField, clickElement, logTestStep } from '../shared-helpers'

/**
 * User Center Page Object Model
 */
export class UserCenterPage {
  constructor(private page: Page) {}

  async goto(): Promise<void> {
    logTestStep('导航到用户中心页面')
    await this.page.goto('/#/index/center')
    await waitForPageLoad(this.page, { expectedText: '个人中心' })
  }

  async expectLoaded(): Promise<void> {
    // Wait for page to load with multiple fallback checks
    await waitForPageLoad(this.page, { expectedText: '个人中心' })

    // Check for various possible container selectors
    const containerSelectors = [
      '.user-center',
      '.profile-page',
      '.center-page',
      '[class*="user-center"]',
      '[class*="profile"]'
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
      // At least check if we have user center-related content
      await expect(this.page.locator('text=个人中心, text=我的, text=用户中心')).toBeVisible({ timeout: 5000 })
    }

    logTestStep('用户中心页面加载完成')
  }

  async navigateToTab(tabName: 'profile' | 'bookings' | 'membership' | 'favorites' | 'messages'): Promise<void> {
    const tabMap = {
      profile: ['个人信息', '个人资料', 'Profile'],
      bookings: ['我的预约', '预约记录', 'Bookings'],
      membership: ['会员卡', '会员信息', 'Membership'],
      favorites: ['收藏', '我的收藏', 'Favorites'],
      messages: ['消息', '消息中心', 'Messages']
    }

    const tabNames = tabMap[tabName]
    const tabSuccess = await clickElement(
      this.page,
      tabNames.map(name => `text=${name}`).concat([
        `.tab:has-text("${tabNames[0]}")`,
        `[data-tab="${tabName}"]`,
        `.nav-item:has-text("${tabNames[0]}")`
      ])
    )

    if (tabSuccess) {
      logTestStep(`导航到${tabNames[0]}标签`)
    }
  }

  async editProfile(data: {
    name?: string,
    phone?: string,
    email?: string,
    avatar?: string
  }): Promise<void> {
    // Click edit button first
    await clickElement(this.page, ['button:has-text("编辑")', '.edit-btn', '[data-action="edit"]'])

    if (data.name) {
      await fillFormField(this.page, ['input[name*="name"]', 'input[placeholder*="姓名"]'], data.name)
    }

    if (data.phone) {
      await fillFormField(this.page, ['input[name*="phone"]', 'input[placeholder*="手机号"]'], data.phone)
    }

    if (data.email) {
      await fillFormField(this.page, ['input[name*="email"]', 'input[placeholder*="邮箱"]'], data.email)
    }

    // Save changes
    await clickElement(this.page, ['button:has-text("保存")', 'button:has-text("确认")', 'button[type="submit"]'])
    logTestStep('编辑个人信息')
  }

  async getBookingCount(): Promise<number> {
    const bookingSelectors = [
      '.booking-item',
      '.reservation-item',
      '[class*="booking-item"]'
    ]

    for (const selector of bookingSelectors) {
      try {
        const count = await this.page.locator(selector).count()
        if (count >= 0) {
          return count
        }
      } catch (error) {
        // Try next selector
      }
    }

    return 0
  }

  async cancelBooking(index: number = 0): Promise<void> {
    const bookingSelectors = [
      '.booking-item',
      '.reservation-item'
    ]

    for (const selector of bookingSelectors) {
      try {
        const bookings = this.page.locator(selector)
        const count = await bookings.count()
        if (count > index) {
          const cancelButton = bookings.nth(index).locator('button:has-text("取消"), .cancel-btn')
          await cancelButton.click()
          
          // Confirm cancellation
          await clickElement(this.page, ['button:has-text("确认")', 'button:has-text("确定")'])
          logTestStep(`取消第 ${index + 1} 个预约`)
          break
        }
      } catch (error) {
        // Try next selector
      }
    }
  }

  async getMembershipInfo(): Promise<{
    type: string,
    expiryDate: string,
    status: string
  } | null> {
    try {
      const typeElement = this.page.locator('.membership-type, [class*="membership-type"]').first()
      const expiryElement = this.page.locator('.expiry-date, [class*="expiry"]').first()
      const statusElement = this.page.locator('.membership-status, [class*="status"]').first()

      const type = await typeElement.textContent() || ''
      const expiryDate = await expiryElement.textContent() || ''
      const status = await statusElement.textContent() || ''

      return { type, expiryDate, status }
    } catch (error) {
      return null
    }
  }

  async getFavoriteCount(): Promise<number> {
    const favoriteSelectors = [
      '.favorite-item',
      '.fav-item',
      '[class*="favorite"]'
    ]

    for (const selector of favoriteSelectors) {
      try {
        const count = await this.page.locator(selector).count()
        if (count >= 0) {
          return count
        }
      } catch (error) {
        // Try next selector
      }
    }

    return 0
  }

  async getMessageCount(): Promise<number> {
    const messageSelectors = [
      '.message-item',
      '.msg-item',
      '[class*="message"]'
    ]

    for (const selector of messageSelectors) {
      try {
        const count = await this.page.locator(selector).count()
        if (count >= 0) {
          return count
        }
      } catch (error) {
        // Try next selector
      }
    }

    return 0
  }
}

