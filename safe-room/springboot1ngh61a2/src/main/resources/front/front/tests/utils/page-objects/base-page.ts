import { expect, Page, Locator } from '@playwright/test'
import { selectors } from '../selectors'
import { waitForPageFullyLoaded, waitForElementReady } from '../wait-helpers'

/**
 * Enhanced Base Page Object Class
 * Provides common functionality for all page objects
 */
export abstract class BasePage {
  protected constructor(protected readonly page: Page) {
    // Base page constructor
  }

  /**
   * Navigate to a specific path
   */
  async goto(path: string, options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' }) {
    await this.page.goto(path, { waitUntil: options?.waitUntil || 'networkidle' })
    await waitForPageFullyLoaded(this.page)
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad() {
    await waitForPageFullyLoaded(this.page)
  }

  /**
   * Wait for heading to be visible
   */
  async waitForHeading(text: string | RegExp) {
    await expect(this.page.getByRole('heading', { name: text })).toBeVisible()
  }

  /**
   * Expect URL to contain specific text/pattern
   */
  async expectUrlContains(text: string | RegExp) {
    await expect(this.page).toHaveURL(text)
  }

  /**
   * Get current page URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url()
  }

  /**
   * Wait for element to be ready and return locator
   */
  async waitForElement(selector: string, options?: { timeout?: number; visible?: boolean }): Promise<Locator> {
    const element = this.page.locator(selector)
    await waitForElementReady(element, options)
    return element
  }

  /**
   * Click element safely with retry logic
   */
  async clickElement(selector: string, options?: { timeout?: number; force?: boolean }) {
    const element = await this.waitForElement(selector, { timeout: options?.timeout })
    await element.click({ force: options?.force })
  }

  /**
   * Fill input field
   */
  async fillInput(selector: string, value: string, options?: { clear?: boolean }) {
    const element = await this.waitForElement(selector)
    if (options?.clear !== false) {
      await element.clear()
    }
    await element.fill(value)
  }

  /**
   * Get element text content
   */
  async getText(selector: string): Promise<string> {
    const element = await this.waitForElement(selector)
    return await element.textContent() || ''
  }

  /**
   * Check if element is visible
   */
  async isVisible(selector: string): Promise<boolean> {
    try {
      const element = this.page.locator(selector)
      return await element.isVisible()
    } catch {
      return false
    }
  }

  /**
   * Wait for element to disappear
   */
  async waitForElementToDisappear(selector: string, timeout = 5000) {
    const element = this.page.locator(selector)
    await expect(element).not.toBeVisible({ timeout })
  }

  /**
   * Take screenshot for debugging
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true
    })
  }

  /**
   * Handle common modal dialogs
   */
  async handleModal(action: 'accept' | 'dismiss' = 'accept') {
    this.page.on('dialog', async (dialog) => {
      if (action === 'accept') {
        await dialog.accept()
      } else {
        await dialog.dismiss()
      }
    })
  }

  /**
   * Scroll element into view
   */
  async scrollIntoView(selector: string) {
    const element = await this.waitForElement(selector)
    await element.scrollIntoViewIfNeeded()
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title()
  }

  /**
   * Wait for network requests to complete
   */
  async waitForNetworkIdle(timeout = 10000) {
    await this.page.waitForLoadState('networkidle', { timeout })
  }

  /**
   * Wait for specific API response
   */
  async waitForApiResponse(urlPattern: string | RegExp, statusCode = 200, timeout = 10000) {
    const response = await this.page.waitForResponse(
      response => {
        const matchesUrl = typeof urlPattern === 'string'
          ? response.url().includes(urlPattern)
          : urlPattern.test(response.url())
        return matchesUrl && response.status() === statusCode
      },
      { timeout }
    )
    return response
  }

  /**
   * Common navigation methods using test IDs
   */
  async navigateToHome() {
    await this.clickElement(selectors.navigation.homeLink())
  }

  async navigateToCourses() {
    await this.clickElement(selectors.navigation.coursesLink())
  }

  async navigateToProfile() {
    await this.clickElement(selectors.navigation.profileLink())
  }

  async logout() {
    await this.clickElement(selectors.navigation.logoutButton())
  }

  /**
   * Common form interaction methods
   */
  async submitForm(formSelector: string) {
    const submitButton = this.page.locator(`${formSelector} button[type="submit"], ${formSelector} .submit-btn`)
    await submitButton.click()
  }

  async cancelForm(formSelector: string) {
    const cancelButton = this.page.locator(`${formSelector} button[type="button"], ${formSelector} .cancel-btn`)
    await cancelButton.click()
  }

  /**
   * Common validation methods
   */
  async expectSuccessMessage(message?: string) {
    const successElement = this.page.locator(selectors.common.successMessage())
    await expect(successElement).toBeVisible()

    if (message) {
      await expect(successElement).toContainText(message)
    }
  }

  async expectErrorMessage(message?: string) {
    const errorElement = this.page.locator(selectors.common.errorMessage())
    await expect(errorElement).toBeVisible()

    if (message) {
      await expect(errorElement).toContainText(message)
    }
  }

  async expectLoadingSpinner() {
    const spinner = this.page.locator(selectors.common.loadingSpinner())
    await expect(spinner).toBeVisible()
  }

  async expectLoadingSpinnerToDisappear() {
    const spinner = this.page.locator(selectors.common.loadingSpinner())
    await expect(spinner).not.toBeVisible({ timeout: 10000 })
  }

  /**
   * Common modal interaction methods
   */
  async expectModalVisible() {
    const modal = this.page.locator(selectors.modal.container())
    await expect(modal).toBeVisible()
  }

  async closeModal() {
    await this.clickElement(selectors.modal.closeButton())
  }

  async confirmModal() {
    await this.clickElement(selectors.modal.confirmButton())
  }

  async cancelModal() {
    await this.clickElement(selectors.modal.cancelButton())
  }

  /**
   * Common search functionality
   */
  async performSearch(query: string) {
    await this.fillInput(selectors.common.searchInput(), query)
    // Assuming search is triggered by Enter key or search button
    await this.page.keyboard.press('Enter')
  }

  /**
   * Common pagination methods
   */
  async goToNextPage() {
    const nextButton = this.page.locator(`${selectors.common.pagination()} .next, .pagination .next`)
    if (await nextButton.isVisible()) {
      await nextButton.click()
    }
  }

  async goToPreviousPage() {
    const prevButton = this.page.locator(`${selectors.common.pagination()} .prev, .pagination .prev`)
    if (await prevButton.isVisible()) {
      await prevButton.click()
    }
  }

  /**
   * Accessibility helper methods
   */
  async checkAccessibility() {
    // Basic accessibility checks
    const images = this.page.locator('img')
    const imageCount = await images.count()

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      expect(alt).toBeTruthy() // Images should have alt text
    }

    // Check for proper heading hierarchy
    const h1Count = await this.page.locator('h1').count()
    expect(h1Count).toBeGreaterThan(0) // Should have at least one h1

    // Check for focusable elements
    const focusableElements = this.page.locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])')
    const focusableCount = await focusableElements.count()
    expect(focusableCount).toBeGreaterThan(0) // Should have focusable elements
  }

  /**
   * Performance monitoring
   */
  async measurePageLoadTime(): Promise<number> {
    const navigationTiming = await this.page.evaluate(() => {
      const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return timing.loadEventEnd - timing.navigationStart
    })
    return navigationTiming
  }

  /**
   * Visual regression testing helper
   */
  async takeVisualSnapshot(name: string) {
    await expect(this.page).toHaveScreenshot(`${name}.png`, {
      fullPage: true,
      threshold: 0.1
    })
  }
}


