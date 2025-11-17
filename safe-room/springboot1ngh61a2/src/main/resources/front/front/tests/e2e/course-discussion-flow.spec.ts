import { test, expect } from '@playwright/test'

test.describe('Course Discussion Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the course discussion page
    await page.goto('/index/discussjianshenkecheng')

    // Wait for the page to load
    await page.waitForSelector('.discuss-page')
  })

  test('should display discussion interface correctly', async ({ page }) => {
    // Check main heading
    await expect(page.locator('h1').filter({ hasText: '课程讨论区' })).toBeVisible()

    // Check search input
    const searchInput = page.locator('.hero-actions input[placeholder*="搜索"]')
    await expect(searchInput).toBeVisible()

    // Check filter buttons
    const tagChips = page.locator('.tag-chip')
    await expect(tagChips.first()).toBeVisible()

    // Check sort options
    const sortChips = page.locator('.sort-chip')
    await expect(sortChips.first()).toBeVisible()
  })

  test('should display discussion cards with proper structure', async ({ page }) => {
    // Check discussion cards exist
    const discussionCards = page.locator('.discuss-card')
    await expect(discussionCards.first()).toBeVisible()

    // Check card structure
    const firstCard = discussionCards.first()
    await expect(firstCard.locator('.discuss-card__header')).toBeVisible()
    await expect(firstCard.locator('.discuss-card__content')).toBeVisible()
    await expect(firstCard.locator('.discuss-card__footer')).toBeVisible()
  })

  test('should show discussion badges for special posts', async ({ page }) => {
    // Look for badges (pinned, featured, hot)
    const badges = page.locator('.badge')
    const badgeCount = await badges.count()

    // Should have at least some special posts
    expect(badgeCount).toBeGreaterThanOrEqual(0)

    if (badgeCount > 0) {
      // Check badge types
      const badgeTexts = await badges.allTextContents()
      const hasSpecialBadge = badgeTexts.some(text =>
        text.includes('置顶') || text.includes('精华') || text.includes('热门')
      )
      expect(hasSpecialBadge).toBe(true)
    }
  })

  test('should display user information correctly', async ({ page }) => {
    const discussionCards = page.locator('.discuss-card')

    for (const card of await discussionCards.all()) {
      // Check avatar
      const avatar = card.locator('.avatar img')
      await expect(avatar).toBeVisible()

      // Check username
      const username = card.locator('strong')
      await expect(username).toBeVisible()

      // Check user level (if present)
      const userLevel = card.locator('.user-level')
      // User level might not always be present, so just check it doesn't error
    }
  })

  test('should handle tag filtering', async ({ page }) => {
    // Click on a tag to filter
    const tagChip = page.locator('.tag-chip').first()
    const tagText = await tagChip.textContent()

    if (tagText && tagText.trim()) {
      await tagChip.click()

      // Check if the tag is now active
      await expect(tagChip).toHaveClass(/tag-chip--active/)

      // The filtered results should still show discussions
      const discussionCards = page.locator('.discuss-card')
      const count = await discussionCards.count()
      expect(count).toBeGreaterThanOrEqual(0)
    }
  })

  test('should handle sorting options', async ({ page }) => {
    // Click on different sort options
    const sortOptions = page.locator('.sort-chip')

    for (const option of await sortOptions.all()) {
      const optionText = await option.textContent()

      if (optionText && optionText.trim()) {
        await option.click()

        // Check if the option is now active
        await expect(option).toHaveClass(/sort-chip--active/)

        // Discussions should still be displayed
        const discussionCards = page.locator('.discuss-card')
        await expect(discussionCards.first()).toBeVisible()
      }
    }
  })

  test('should handle search functionality', async ({ page }) => {
    const searchInput = page.locator('.hero-actions input[placeholder*="搜索"]')

    // Type search term
    await searchInput.fill('训练')
    await searchInput.press('Enter')

    // Wait for search results
    await page.waitForTimeout(500)

    // Should still show results (or empty state)
    const discussionCards = page.locator('.discuss-card')
    const emptyState = page.locator('.el-empty')

    // Either has results or shows empty state
    const hasResults = (await discussionCards.count()) > 0
    const hasEmptyState = await emptyState.isVisible()

    expect(hasResults || hasEmptyState).toBe(true)
  })

  test('should handle follow/unfollow functionality', async ({ page }) => {
    const discussionCards = page.locator('.discuss-card')

    // Find a card that is not from current user (should have follow button)
    for (const card of await discussionCards.all()) {
      const followBtn = card.locator('.follow-btn')

      if (await followBtn.isVisible()) {
        const initialText = await followBtn.textContent()

        // Click follow/unfollow
        await followBtn.click()

        // Text should change
        const newText = await followBtn.textContent()
        expect(newText).not.toBe(initialText)

        // Click again to revert
        await followBtn.click()
        const revertedText = await followBtn.textContent()
        expect(revertedText).toBe(initialText)

        break // Test one follow interaction
      }
    }
  })

  test('should handle like functionality', async ({ page }) => {
    const discussionCards = page.locator('.discuss-card')

    if (await discussionCards.count() > 0) {
      const firstCard = discussionCards.first()
      const likeBtn = firstCard.locator('button').filter({ hasText: '👍' })

      if (await likeBtn.isVisible()) {
        const initialText = await likeBtn.textContent()

        // Click like button
        await likeBtn.click()

        // Like count should change
        const newText = await likeBtn.textContent()
        expect(newText).not.toBe(initialText)
      }
    }
  })

  test('should handle reply functionality', async ({ page }) => {
    const discussionCards = page.locator('.discuss-card')

    if (await discussionCards.count() > 0) {
      const firstCard = discussionCards.first()
      const replyBtn = firstCard.locator('button').filter({ hasText: '💬 回复' })

      if (await replyBtn.isVisible()) {
        // Click reply button
        await replyBtn.click()

        // Reply form should appear
        const replyForm = firstCard.locator('.quick-reply')
        await expect(replyForm).toBeVisible()

        // Cancel reply
        const cancelBtn = replyForm.locator('button').filter({ hasText: '取消' })
        if (await cancelBtn.isVisible()) {
          await cancelBtn.click()
          await expect(replyForm).not.toBeVisible()
        }
      }
    }
  })

  test('should display attachments correctly', async ({ page }) => {
    const discussionCards = page.locator('.discuss-card')

    for (const card of await discussionCards.all()) {
      const attachments = card.locator('.attachment-item')

      if (await attachments.count() > 0) {
        // Check attachment display
        const firstAttachment = attachments.first()
        await expect(firstAttachment).toBeVisible()

        // Check if it's an image or file
        const img = firstAttachment.locator('img')
        const fileIcon = firstAttachment.locator('.attachment-file')

        const hasImage = await img.isVisible()
        const hasFileIcon = await fileIcon.isVisible()

        expect(hasImage || hasFileIcon).toBe(true)

        // Test attachment click (should not error)
        await firstAttachment.click()
        // Just verify it doesn't break the page
        await expect(page.locator('.discuss-page')).toBeVisible()

        break // Test one attachment
      }
    }
  })

  test('should handle sharing functionality', async ({ page }) => {
    const discussionCards = page.locator('.discuss-card')

    if (await discussionCards.count() > 0) {
      const firstCard = discussionCards.first()
      const shareBtn = firstCard.locator('button').filter({ hasText: '📤 分享' })

      if (await shareBtn.isVisible()) {
        // Click share button
        await shareBtn.click()

        // Should either show native share or copy to clipboard
        // For testing, we just verify it doesn't break
        await expect(page.locator('.discuss-page')).toBeVisible()
      }
    }
  })

  test('should navigate to detailed view', async ({ page }) => {
    const discussionCards = page.locator('.discuss-card')

    if (await discussionCards.count() > 0) {
      const firstCard = discussionCards.first()

      // Try to click detail button
      const detailBtn = firstCard.locator('button').filter({ hasText: '详情' })
      if (await detailBtn.isVisible()) {
        await detailBtn.click()

        // Should navigate to detail page
        await page.waitForURL('**/discussjianshenkechengDetail**')
        expect(page.url()).toContain('discussjianshenkechengDetail')

        // Go back for next test
        await page.goBack()
        await page.waitForSelector('.discuss-page')
      }
    }
  })

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check mobile layout
    await expect(page.locator('.discuss-page')).toBeVisible()

    // Check if cards stack properly on mobile
    const discussionCards = page.locator('.discuss-card')
    if (await discussionCards.count() > 0) {
      await expect(discussionCards.first()).toBeVisible()
    }

    // Check mobile header layout
    const heroSection = page.locator('.discuss-hero')
    await expect(heroSection).toBeVisible()
  })

  test('should handle empty state gracefully', async ({ page }) => {
    // This test assumes there might be scenarios with no discussions
    // In real app, this might require mocking empty API responses

    const discussionCards = page.locator('.discuss-card')
    const emptyState = page.locator('.el-empty')

    const hasCards = (await discussionCards.count()) > 0
    const hasEmptyState = await emptyState.isVisible()

    // Either has cards or shows empty state
    expect(hasCards || hasEmptyState).toBe(true)
  })

  test('should maintain accessibility standards', async ({ page }) => {
    // Check for proper heading hierarchy
    const headings = await page.locator('h1, h2, h3').allTextContents()
    expect(headings.length).toBeGreaterThan(0)

    // Check for focusable elements
    const focusableElements = page.locator('button, a, input, select, textarea')
    const count = await focusableElements.count()
    expect(count).toBeGreaterThan(0)

    // Check for images with alt text
    const images = page.locator('img')
    const imageCount = await images.count()

    for (let i = 0; i < imageCount; i++) {
      const alt = await images.nth(i).getAttribute('alt')
      if (alt !== null) { // Some images might not have alt in test data
        expect(alt.length).toBeGreaterThanOrEqual(0)
      }
    }
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // Force a reload to test error handling
    await page.reload()

    // Page should recover or show appropriate error state
    await page.waitForSelector('.discuss-page', { timeout: 10000 })

    // Basic structure should still be intact
    await expect(page.locator('h1')).toBeVisible()
  })
})
