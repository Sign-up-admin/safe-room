import { Page, expect } from '@playwright/test'
import { BasePage } from './base-page'
import { selectors } from '../selectors'
import { waitForPageFullyLoaded, waitForElementReady, waitForFormSubmission } from '../wait-helpers'

export class FrontHomePage extends BasePage {
  constructor(page: Page) {
    super(page)
    // Front home page constructor
  }

  async goto() {
    await this.page.goto('/#/index/home')
    await waitForPageFullyLoaded(this.page)
  }

  async expectHero() {
    // 等待页面主要内容加载
    await waitForElementReady(this.page.locator('.home'))

    // 检查主要区域是否正确加载
    await expect(this.page.getByText('HOT COURSES')).toBeVisible({ timeout: 5000 })
  }
}

export class FrontLoginPage extends BasePage {
  constructor(page: Page) {
    super(page)
    // Front login page constructor
  }

  async goto() {
    await this.page.goto('/#/login')
    await waitForPageFullyLoaded(this.page)
  }

  async expectScaffold() {
    // 使用稳定的data-testid选择器
    await expect(this.page.getByTestId(selectors.login.pageTitle)).toBeVisible()
  }

  async login(username: string, password: string) {
    // 使用稳定的data-testid选择器
    await waitForElementReady(this.page.getByTestId(selectors.login.usernameInput))
    await this.page.getByTestId(selectors.login.usernameInput).fill(username)

    await waitForElementReady(this.page.getByTestId(selectors.login.passwordInput))
    await this.page.getByTestId(selectors.login.passwordInput).fill(password)

    await waitForElementReady(this.page.getByTestId(selectors.login.submitButton))
    await this.page.getByTestId(selectors.login.submitButton).click()
  }

  async expectErrorMessage(message?: string) {
    const errorElement = this.page.getByTestId(selectors.login.errorMessage)
    await expect(errorElement).toBeVisible()

    if (message) {
      await expect(errorElement).toContainText(message)
    }
  }

  async expectSuccess() {
    // 等待成功状态或页面跳转
    const result = await waitForFormSubmission(this.page, {
      successSelectors: ['text=登录成功'],
      errorSelectors: [selectors.login.errorMessage]
    })

    if (!result.success) {
      throw new Error(`登录失败: ${result.message}`)
    }
  }
}


