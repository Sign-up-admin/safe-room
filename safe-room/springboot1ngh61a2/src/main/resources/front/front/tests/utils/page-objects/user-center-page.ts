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

  async cancelBooking(index = 0): Promise<void> {
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

  async addFavoriteFromCurrentPage(): Promise<void> {
    const favoriteBtn = this.page.locator('button:has-text("收藏"), .favorite-btn, .heart-icon')

    if (await favoriteBtn.count() > 0) {
      await favoriteBtn.click()

      // Wait for success message
      await this.page.waitForSelector('text=收藏成功, .success-message', { timeout: 3000 }).catch(() => {})
      logTestStep('从当前页面添加收藏')
    } else {
      logTestStep('当前页面无收藏按钮')
    }
  }

  async removeFavorite(index = 0): Promise<void> {
    const favoriteItems = this.page.locator('.favorite-item, .fav-item')

    if (await favoriteItems.count() > index) {
      const item = favoriteItems.nth(index)

      // Try to find remove/unfavorite button
      const removeBtn = item.locator('button:has-text("取消收藏"), .unfavorite-btn, .remove-btn')

      if (await removeBtn.count() > 0) {
        await removeBtn.click()

        // Confirm removal if needed
        const confirmBtn = this.page.locator('button:has-text("确认"), button:has-text("确定")')
        if (await confirmBtn.count() > 0) {
          await confirmBtn.click()
        }

        await this.page.waitForSelector('text=已取消收藏, .success-message', { timeout: 3000 }).catch(() => {})
        logTestStep(`取消第 ${index + 1} 个收藏`)
      } else {
        logTestStep('无取消收藏按钮')
      }
    } else {
      logTestStep('无收藏项可取消')
    }
  }

  async batchRemoveFavorites(indices: number[]): Promise<void> {
    // Check for batch operation button
    const batchBtn = this.page.locator('button:has-text("批量操作"), .batch-btn, .select-all')

    if (await batchBtn.count() > 0) {
      await batchBtn.click()

      // Select specified favorites
      for (const index of indices) {
        const checkbox = this.page.locator('input[type="checkbox"]').nth(index)
        if (await checkbox.count() > 0) {
          await checkbox.check()
        }
      }

      // Execute batch removal
      const batchRemoveBtn = this.page.locator('button:has-text("批量删除"), .batch-delete')
      if (await batchRemoveBtn.count() > 0) {
        await batchRemoveBtn.click()

        // Confirm batch removal
        const confirmBtn = this.page.locator('button:has-text("确认"), button:has-text("确定")')
        if (await confirmBtn.count() > 0) {
          await confirmBtn.click()
        }

        await this.page.waitForSelector('text=删除成功, .success-message', { timeout: 3000 }).catch(() => {})
        logTestStep(`批量删除 ${indices.length} 个收藏`)
      } else {
        logTestStep('无批量删除功能')
      }
    } else {
      logTestStep('无批量操作功能')
    }
  }

  async filterFavoritesByCategory(category: string): Promise<void> {
    const categoryTabs = this.page.locator('.category-tab, .fav-category, [data-category]')

    if (await categoryTabs.count() > 0) {
      const categoryTab = this.page.locator(`.category-tab:has-text("${category}"), [data-category="${category}"]`)

      if (await categoryTab.count() > 0) {
        await categoryTab.click()
        await this.page.waitForTimeout(500) // Wait for filter to apply
        logTestStep(`按分类筛选收藏: ${category}`)
      } else {
        logTestStep(`分类 ${category} 不存在`)
      }
    } else {
      logTestStep('无分类筛选功能')
    }
  }

  async searchFavorites(searchTerm: string): Promise<void> {
    const searchInput = this.page.locator('input[placeholder*="搜索收藏"], input[name="fav-search"], .fav-search')

    if (await searchInput.count() > 0) {
      await searchInput.clear()
      await searchInput.fill(searchTerm)
      await this.page.keyboard.press('Enter')
      await this.page.waitForTimeout(500) // Wait for search results

      logTestStep(`搜索收藏: ${searchTerm}`)
    } else {
      logTestStep('无收藏搜索功能')
    }
  }

  async shareFavorite(index = 0): Promise<void> {
    const favoriteItems = this.page.locator('.favorite-item, .fav-item')

    if (await favoriteItems.count() > index) {
      const item = favoriteItems.nth(index)
      const shareBtn = item.locator('button:has-text("分享"), .share-btn')

      if (await shareBtn.count() > 0) {
        await shareBtn.click()

        // Check for share options
        const shareOptions = this.page.locator('.share-options, .share-modal')
        if (await shareOptions.count() > 0) {
          // Try to copy link
          const copyBtn = this.page.locator('button:has-text("复制链接"), .copy-link')
          if (await copyBtn.count() > 0) {
            await copyBtn.click()
            logTestStep(`分享收藏项目 ${index + 1}`)
          }
        } else {
          logTestStep('无分享选项')
        }
      } else {
        logTestStep('无分享按钮')
      }
    }
  }

  async exportFavorites(): Promise<void> {
    const exportBtn = this.page.locator('button:has-text("导出"), .export-btn, .download-fav')

    if (await exportBtn.count() > 0) {
      await exportBtn.click()

      // Check for export options
      const exportOptions = this.page.locator('.export-options, .download-options')
      if (await exportOptions.count() > 0) {
        // Select format if available
        const formatSelect = this.page.locator('select[name*="format"]')
        if (await formatSelect.count() > 0) {
          await formatSelect.selectOption('excel')
        }

        // Confirm export
        const confirmBtn = this.page.locator('button:has-text("确认导出")')
        if (await confirmBtn.count() > 0) {
          await confirmBtn.click()
          logTestStep('导出收藏列表')
        }
      } else {
        logTestStep('无导出选项')
      }
    } else {
      logTestStep('无导出功能')
    }
  }

  async bookFromFavorite(index = 0): Promise<void> {
    const favoriteItems = this.page.locator('.favorite-item, .fav-item')

    if (await favoriteItems.count() > index) {
      const item = favoriteItems.nth(index)

      // Try different booking buttons
      const bookSelectors = [
        'button:has-text("预约")',
        'button:has-text("立即预约")',
        '.book-btn',
        'button:has-text("购买")'
      ]

      for (const selector of bookSelectors) {
        try {
          const bookBtn = item.locator(selector)
          if (await bookBtn.count() > 0) {
            await bookBtn.click()
            logTestStep(`从收藏预约项目 ${index + 1}`)
            return
          }
        } catch (error) {
          // Try next selector
        }
      }

      // If no direct booking button, click the item to go to detail page
      await item.click()
      await this.page.waitForURL(/.*/, { timeout: 3000 })

      // Try booking from detail page
      const detailBookBtn = this.page.locator('button:has-text("预约"), button:has-text("立即预约"), button:has-text("购买")')
      if (await detailBookBtn.count() > 0) {
        await detailBookBtn.click()
        logTestStep(`从收藏详情预约项目 ${index + 1}`)
      }
    } else {
      logTestStep('无收藏项可预约')
    }
  }

  async getFavoriteDetails(index = 0): Promise<{
    title: string,
    type: string,
    date: string,
    status: string
  }> {
    const favoriteItems = this.page.locator('.favorite-item, .fav-item')

    if (await favoriteItems.count() > index) {
      const item = favoriteItems.nth(index)

      const title = await item.locator('.title, .name, .favorite-title').textContent() || ''
      const type = await item.locator('.type, .category, [class*="type"]').textContent() || ''
      const date = await item.locator('.date, .add-time, [class*="date"]').textContent() || ''
      const status = await item.locator('.status, [class*="status"]').textContent() || ''

      return { title, type, date, status }
    }

    return { title: '', type: '', date: '', status: '' }
  }

  async markMessageAsRead(index = 0): Promise<void> {
    const messageItems = this.page.locator('.message-item, .msg-item')

    if (await messageItems.count() > index) {
      const message = messageItems.nth(index)
      const unreadClass = await message.getAttribute('class')

      if (unreadClass && unreadClass.includes('unread')) {
        await message.click()
        logTestStep(`标记消息 ${index + 1} 为已读`)
      } else {
        logTestStep(`消息 ${index + 1} 已是已读状态`)
      }
    } else {
      logTestStep('无消息可标记')
    }
  }

  async getBookingList(): Promise<Array<{
    courseName: string
    status: string
    date: string
    type: string
  }>> {
    const bookings: Array<{
      courseName: string
      status: string
      date: string
      type: string
    }> = []

    const bookingSelectors = [
      '.booking-item',
      '.reservation-item',
      '[class*="booking"]',
      '.appointment-item'
    ]

    for (const selector of bookingSelectors) {
      try {
        const items = this.page.locator(selector)
        const count = await items.count()

        if (count > 0) {
          for (let i = 0; i < count; i++) {
            const item = items.nth(i)
            const courseName = await item.locator('.course-name, .title, .name').textContent() || ''
            const status = await item.locator('.status, [class*="status"]').textContent() || ''
            const date = await item.locator('.date, .time, [class*="date"]').textContent() || ''
            const type = await item.locator('.type, .category, [class*="type"]').textContent() || ''

            bookings.push({ courseName, status, date, type })
          }
          break // Found the correct selector, no need to try others
        }
      } catch (error) {
        // Try next selector
        continue
      }
    }

    return bookings
  }

  async getBookingListFromPage(page: Page): Promise<Array<{
    courseName: string
    status: string
    date: string
    type: string
  }>> {
    const bookings: Array<{
      courseName: string
      status: string
      date: string
      type: string
    }> = []

    const bookingSelectors = [
      '.booking-item',
      '.reservation-item',
      '[class*="booking"]',
      '.appointment-item'
    ]

    for (const selector of bookingSelectors) {
      try {
        const items = page.locator(selector)
        const count = await items.count()

        if (count > 0) {
          for (let i = 0; i < count; i++) {
            const item = items.nth(i)
            const courseName = await item.locator('.course-name, .title, .name').textContent() || ''
            const status = await item.locator('.status, [class*="status"]').textContent() || ''
            const date = await item.locator('.date, .time, [class*="date"]').textContent() || ''
            const type = await item.locator('.type, .category, [class*="type"]').textContent() || ''

            bookings.push({ courseName, status, date, type })
          }
          break // Found the correct selector, no need to try others
        }
      } catch (error) {
        // Try next selector
        continue
      }
    }

    return bookings
  }

  async hasMembershipStatus(): Promise<boolean> {
    const membershipSelectors = [
      'text=会员',
      'text=VIP',
      '.membership-status',
      '.vip-badge',
      '[class*="membership"]',
      '[class*="vip"]'
    ]

    for (const selector of membershipSelectors) {
      try {
        const element = this.page.locator(selector)
        if (await element.count() > 0) {
          return true
        }
      } catch (error) {
        // Try next selector
        continue
      }
    }

    return false
  }
}

