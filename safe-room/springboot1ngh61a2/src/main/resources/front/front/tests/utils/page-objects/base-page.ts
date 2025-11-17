import { expect, Page } from '@playwright/test'

export abstract class BasePage {
  protected constructor(protected readonly page: Page) {
    // Base page constructor
  }

  async waitForHeading(text: string | RegExp) {
    await expect(this.page.getByRole('heading', { name: text })).toBeVisible()
  }

  async expectUrlContains(text: string | RegExp) {
    await expect(this.page).toHaveURL(text)
  }
}


