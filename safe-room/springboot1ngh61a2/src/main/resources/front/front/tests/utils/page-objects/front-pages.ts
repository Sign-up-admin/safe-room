import { Page, expect } from '@playwright/test'
import { BasePage } from './base-page'

export class FrontHomePage extends BasePage {
  constructor(page: Page) {
    super(page)
  }

  async goto() {
    await this.page.goto('/#/index/home')
    await this.page.waitForLoadState('networkidle')
  }

  async expectHero() {
    // Wait for page to load and check for main content
    await this.page.waitForSelector('.home', { timeout: 10000 })
    // Check for main sections that indicate the page loaded correctly
    await expect(this.page.getByText('HOT COURSES')).toBeVisible({ timeout: 5000 })
  }
}

export class FrontLoginPage extends BasePage {
  constructor(page: Page) {
    super(page)
  }

  async goto() {
    await this.page.goto('/#/login')
    await this.page.waitForLoadState('domcontentloaded')
  }

  async expectScaffold() {
    await expect(this.page.getByRole('heading', { name: '会员登录' })).toBeVisible()
  }

  async login(username: string, password: string) {
    // Use more specific selector to avoid ambiguity with checkbox
    await this.page.getByPlaceholder('请输入会员账号').fill(username)
    await this.page.getByLabel('密码', { exact: false }).fill(password)
    await this.page.getByRole('button', { name: '登录' }).click()
  }
}


