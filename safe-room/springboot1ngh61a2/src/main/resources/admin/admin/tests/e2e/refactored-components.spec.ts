import { test, expect } from '@playwright/test'

test.describe('Refactored Admin Components E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin home page
    await page.goto('/')

    // Wait for the page to load completely
    await page.waitForLoadState('networkidle')
  })

  test('should render HomeLayout with proper structure', async ({ page }) => {
    // Check main app container exists
    const appContainer = page.locator('#app')
    await expect(appContainer).toBeVisible()

    // Check layout has proper flex structure
    const layoutContainer = page.locator('.flex.h-full.overflow-hidden')
    await expect(layoutContainer).toBeVisible()

    // Check sidebar area exists
    const sidebarArea = page.locator('[role="navigation"]')
    await expect(sidebarArea).toBeVisible()

    // Check main content area exists
    const mainContent = page.locator('main')
    await expect(mainContent).toBeVisible()
  })

  test('should render SidebarNavigation correctly', async ({ page }) => {
    // Check navigation buttons are present
    const discoverButton = page.locator('button[aria-label="Discover"]')
    const imagineButton = page.locator('button[aria-label="Imagine"]')
    const libraryButton = page.locator('button[aria-label="Library"]')
    const labsButton = page.locator('button[aria-label="Labs"]')

    await expect(discoverButton).toBeVisible()
    await expect(imagineButton).toBeVisible()
    await expect(libraryButton).toBeVisible()
    await expect(labsButton).toBeVisible()

    // Check Imagine button has "New" badge
    const newBadge = imagineButton.locator('.bg-accent-350\\/30')
    await expect(newBadge).toContainText('New')
  })

  test('should handle sidebar navigation interactions', async ({ page }) => {
    // Click on Imagine button
    const imagineButton = page.locator('button[aria-label="Imagine"]')
    await imagineButton.click()

    // Verify button state (aria-selected should be true)
    await expect(imagineButton).toHaveAttribute('aria-selected', 'true')

    // Check other buttons are not selected
    const discoverButton = page.locator('button[aria-label="Discover"]')
    await expect(discoverButton).toHaveAttribute('aria-selected', 'false')
  })

  test('should render Composer component correctly', async ({ page }) => {
    // Check composer container exists
    const composer = page.locator('[data-testid="composer"]')
    await expect(composer).toBeVisible()

    // Check composer has proper accessibility attributes
    await expect(composer).toHaveAttribute('role', 'region')
    await expect(composer).toHaveAttribute('aria-label', 'Message composer')

    // Check textarea exists
    const textarea = page.locator('#userInput')
    await expect(textarea).toBeVisible()

    // Check file input is hidden
    const fileInput = page.locator('input[type="file"]')
    await expect(fileInput).not.toBeVisible()
  })

  test('should handle Composer input interactions', async ({ page }) => {
    const textarea = page.locator('#userInput')

    // Type some text
    await textarea.fill('Test message for Composer')

    // Verify text was entered
    await expect(textarea).toHaveValue('Test message for Composer')

    // Test Enter key submission
    await textarea.press('Enter')

    // Note: Actual submission behavior depends on component implementation
    // This test verifies the input handling works
  })

  test('should render HomeHeader component', async ({ page }) => {
    // Check header exists with proper styling
    const header = page.locator('[data-testid="sticky-header"]')
    await expect(header).toBeVisible()

    // Check header has backdrop blur effect
    const backdropElement = header.locator('.backdrop-blur-2xl')
    await expect(backdropElement).toBeVisible()
  })

  test('should handle responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Check mobile-specific classes are applied
    const mobileElements = page.locator('[class*="max-md:"]')
    await expect(mobileElements.first()).toBeVisible()

    // Test desktop viewport
    await page.setViewportSize({ width: 1024, height: 768 })

    // Check desktop-specific classes are applied
    const desktopElements = page.locator('[class*="md:"]')
    await expect(desktopElements.first()).toBeVisible()
  })

  test('should maintain accessibility standards', async ({ page }) => {
    // Check for proper ARIA labels
    const ariaLabels = page.locator('[aria-label]')
    await expect(ariaLabels.first()).toBeVisible()

    // Check for screen reader only content
    const srOnly = page.locator('.sr-only')
    await expect(srOnly.first()).toBeVisible()

    // Check semantic HTML structure
    const semanticElements = page.locator('main, nav, section, header')
    await expect(semanticElements.first()).toBeVisible()
  })

  test('should handle keyboard navigation', async ({ page }) => {
    // Focus on first navigation button
    const discoverButton = page.locator('button[aria-label="Discover"]')
    await discoverButton.focus()

    // Verify focus is on the button
    await expect(discoverButton).toBeFocused()

    // Test Tab navigation
    await page.keyboard.press('Tab')
    const nextElement = page.locator('button[aria-label="Imagine"]')
    await expect(nextElement).toBeFocused()
  })

  test('should support dark mode', async ({ page }) => {
    // Check for dark mode classes
    const darkModeElements = page.locator('[class*="dark:"]')
    await expect(darkModeElements.first()).toBeVisible()

    // Note: Actual dark mode testing would require theme switching functionality
  })

  test('should handle file upload in Composer', async ({ page }) => {
    // Create a test file
    const fileInput = page.locator('input[type="file"]')

    // Upload a test file
    await fileInput.setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Test file content')
    })

    // Verify file input accepted the file
    // Note: Actual file handling depends on component implementation
    await expect(fileInput).toHaveValue(/test\.txt/)
  })

  test('should maintain performance standards', async ({ page }) => {
    // Measure page load performance
    const navigationTiming = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        loadTime: navigation.loadEventEnd - navigation.fetchStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart
      }
    })

    // Assert reasonable load times (less than 5 seconds)
    expect(navigationTiming.loadTime).toBeLessThan(5000)
    expect(navigationTiming.domContentLoaded).toBeLessThan(3000)
  })
})
