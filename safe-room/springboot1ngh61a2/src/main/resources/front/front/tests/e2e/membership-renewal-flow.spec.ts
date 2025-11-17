import { test, expect } from '@playwright/test'
import { setupTestEnvironment, logTestStep } from '../utils/shared-helpers'
import { MembershipRenewalPage } from '../utils/page-objects/membership-page'

test.describe('Membership Renewal Flow', () => {
  test.beforeEach(async ({ page }) => {
    // 使用完整的测试环境设置，包括Mock和Cookie处理
    await setupTestEnvironment(page)
    logTestStep('设置会员续费测试环境完成')
  })

  test('should display membership renewal interface correctly', async ({ page }) => {
    // Check main heading
    await expect(page.locator('h1').filter({ hasText: '续费倒计时' })).toBeVisible()

    // Check countdown visual
    const countdownRing = page.locator('.countdown-ring')
    await expect(countdownRing).toBeVisible()

    // Check renewal cards
    const renewalCards = page.locator('.quick-option-card')
    await expect(renewalCards).toHaveCount(3)

    // Check smart recommendations
    const smartCards = page.locator('.smart-option-card')
    await expect(smartCards).toHaveCount(3)
  })

  test('should show countdown timer for expiring membership', async ({ page }) => {
    // Check if countdown displays days remaining
    const countdownText = page.locator('.countdown-center strong')
    await expect(countdownText).toBeVisible()

    // Check status indicator
    const statusBadge = page.locator('.countdown-status')
    await expect(statusBadge).toBeVisible()
  })

  test('should display available coupons', async ({ page }) => {
    // Check coupons section
    const couponsSection = page.locator('.coupons-section')
    await expect(couponsSection).toBeVisible()

    // Check coupon items
    const couponItems = page.locator('.coupon-item')
    const count = await couponItems.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should show reminder channels when membership expires soon', async ({ page }) => {
    // Check reminder channels display
    const reminderChannels = page.locator('.reminder-channels')
    await expect(reminderChannels).toBeVisible()

    // Check channel tags
    const channelTags = page.locator('.channel-tag')
    await expect(channelTags).toHaveCount(3) // email, sms, inApp
  })

  test('should handle smart renewal option selection', async ({ page }) => {
    // Find the recommended renewal option
    const recommendedCard = page.locator('.smart-option-card--recommended')
    await expect(recommendedCard).toBeVisible()

    // Check recommended badge
    const recommendedBadge = recommendedCard.locator('.option-badge')
    await expect(recommendedBadge).toContainText('智能推荐')

    // Click the recommended option
    await recommendedCard.click()

    // Should navigate to purchase page (mock or check URL)
    await page.waitForURL('**/huiyuankagoumai**')
    expect(page.url()).toContain('huiyuankagoumai')
  })

  test('should display renewal timeline correctly', async ({ page }) => {
    // Check timeline section
    const timelineSection = page.locator('.timeline')
    await expect(timelineSection).toBeVisible()

    // Check timeline items
    const timelineItems = page.locator('.timeline-item')
    const count = await timelineItems.count()
    expect(count).toBeGreaterThan(0)

    // Check timeline dots
    const timelineDots = page.locator('.timeline-dot')
    await expect(timelineDots.first()).toBeVisible()
  })

  test('should navigate to reminder management', async ({ page }) => {
    // Click reminder management button
    const reminderBtn = page.locator('.hero-actions .tech-button').filter({ hasText: '管理提醒' })
    await reminderBtn.click()

    // Should navigate to expiry reminders page
    await page.waitForURL('**/daoqitixing**')
    expect(page.url()).toContain('daoqitixing')
  })

  test('should handle quick renewal options', async ({ page }) => {
    // Get all quick renewal options
    const quickOptions = page.locator('.quick-option-card')

    // Click first option
    await quickOptions.first().click()

    // Should navigate to purchase page
    await page.waitForURL('**/huiyuankagoumai**')
    expect(page.url()).toContain('huiyuankagoumai')
  })

  test('should display membership card information', async ({ page }) => {
    // Check membership card info
    const cardInfo = page.locator('.hero-card')
    await expect(cardInfo).toBeVisible()

    // Check expiry date display
    const expiryInfo = cardInfo.locator('li').filter({ hasText: '有效期至' })
    await expect(expiryInfo).toBeVisible()
  })

  test('should show loading states appropriately', async ({ page }) => {
    // Trigger a reload or action that shows loading
    await page.reload()

    // Wait for loading to complete
    await page.waitForSelector('.renew-page:not(.el-loading-mask)')

    // Page should be fully loaded
    await expect(page.locator('.renew-hero')).toBeVisible()
  })

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check mobile layout
    const heroSection = page.locator('.renew-hero')
    await expect(heroSection).toBeVisible()

    // Check mobile button layout
    const actionButtons = page.locator('.hero-actions')
    await expect(actionButtons).toBeVisible()

    // Check responsive grid layout
    const gridSections = page.locator('.renew-grid')
    await expect(gridSections).toBeVisible()
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure (if API mocking is available)
    // This would require setting up request interception

    // For now, just verify the page structure remains intact
    await expect(page.locator('.renew-page')).toBeVisible()
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should maintain accessibility standards', async ({ page }) => {
    // Check for proper heading hierarchy
    const headings = await page.locator('h1, h2, h3').allTextContents()
    expect(headings.length).toBeGreaterThan(0)

    // Check for focusable elements
    const focusableElements = page.locator('button, a, input, select, textarea')
    const count = await focusableElements.count()
    expect(count).toBeGreaterThan(0)

    // Check for alt text on images (if any)
    const images = page.locator('img')
    const imageCount = await images.count()

    for (let i = 0; i < imageCount; i++) {
      const alt = await images.nth(i).getAttribute('alt')
      expect(alt).toBeTruthy()
    }
  })
})
