import { Page, Locator } from '@playwright/test';
import { testConfig } from '../test-config';

/**
 * Base Page Object class providing common functionality for all pages
 */
export abstract class BasePage {
  protected page: Page;
  protected config = testConfig;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   */
  async navigateTo(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'networkidle' });
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle', {
      timeout: this.config.timeouts.pageLoad,
    });
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(selector: string, timeout?: number): Promise<Locator> {
    const element = this.page.locator(selector);
    await element.waitFor({
      state: 'visible',
      timeout: timeout || this.config.timeouts.elementWait,
    });
    return element;
  }

  /**
   * Click element safely with retry logic
   */
  async clickElement(selector: string, options?: { timeout?: number; force?: boolean }): Promise<void> {
    const element = await this.waitForElement(selector, options?.timeout);
    await element.click({ force: options?.force });
  }

  /**
   * Fill input field
   */
  async fillInput(selector: string, value: string): Promise<void> {
    const element = await this.waitForElement(selector);
    await element.fill(value);
  }

  /**
   * Get element text content
   */
  async getText(selector: string): Promise<string> {
    const element = await this.waitForElement(selector);
    return element.textContent() || '';
  }

  /**
   * Check if element is visible
   */
  async isVisible(selector: string): Promise<boolean> {
    try {
      const element = this.page.locator(selector);
      return await element.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Take screenshot for debugging
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }

  /**
   * Wait for API response
   */
  async waitForResponse(urlPattern: string | RegExp, options?: { timeout?: number }): Promise<void> {
    await this.page.waitForResponse(urlPattern, {
      timeout: options?.timeout || this.config.timeouts.apiCall,
    });
  }

  /**
   * Handle common dialog types (alert, confirm, prompt)
   */
  async handleDialog(action: 'accept' | 'dismiss' = 'accept'): Promise<void> {
    this.page.on('dialog', async (dialog) => {
      if (action === 'accept') {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });
  }

  /**
   * Scroll element into view
   */
  async scrollIntoView(selector: string): Promise<void> {
    const element = await this.waitForElement(selector);
    await element.scrollIntoViewIfNeeded();
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Get current URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }
}
