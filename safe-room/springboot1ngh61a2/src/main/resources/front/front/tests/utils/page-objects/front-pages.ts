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

export class FrontRegisterPage extends BasePage {
  constructor(page: Page) {
    super(page)
    // Front register page constructor
  }

  async goto() {
    await this.page.goto('/#/register')
    await waitForPageFullyLoaded(this.page)
  }

  async expectScaffold() {
    // 等待注册页面主要元素加载
    await waitForElementReady(this.page.locator('form, .register-form'))
    await expect(this.page.locator('h1, h2, .page-title')).toContainText(/注册|register/i)
  }

  async fillRegistrationForm(data: {
    username: string
    password: string
    confirmPassword: string
    phone: string
    name: string
    gender?: string
  }) {
    // 填写用户名
    const usernameInput = this.page.locator('input[name="yonghuzhanghao"], input[placeholder*="用户名"], input[placeholder*="账号"]')
    await waitForElementReady(usernameInput)
    await usernameInput.fill(data.username)

    // 填写密码
    const passwordInput = this.page.locator('input[name="mima"], input[type="password"]:nth-of-type(1), input[placeholder*="密码"]')
    await waitForElementReady(passwordInput)
    await passwordInput.fill(data.password)

    // 填写确认密码
    const confirmPasswordInput = this.page.locator('input[name="confirmPassword"], input[placeholder*="确认密码"]')
    await waitForElementReady(confirmPasswordInput)
    await confirmPasswordInput.fill(data.confirmPassword)

    // 填写手机号
    const phoneInput = this.page.locator('input[name="shoujihaoma"], input[placeholder*="手机号"]')
    await waitForElementReady(phoneInput)
    await phoneInput.fill(data.phone)

    // 填写姓名
    const nameInput = this.page.locator('input[name="yonghuxingming"], input[placeholder*="姓名"]')
    if (await nameInput.count() > 0) {
      await waitForElementReady(nameInput)
      await nameInput.fill(data.name)
    }

    // 选择性别
    if (data.gender) {
      const genderSelect = this.page.locator('select[name="xingbie"], input[name="xingbie"]')
      if (await genderSelect.count() > 0) {
        if (await genderSelect.locator('option, [value]').count() > 0) {
          await genderSelect.selectOption(data.gender)
        } else {
          await genderSelect.fill(data.gender)
        }
      }
    }
  }

  async agreeToTerms() {
    // 勾选协议同意复选框
    const agreeCheckbox = this.page.locator('input[type="checkbox"][required], input[name="agreedToTerms"], input[name="agree"]')
    await waitForElementReady(agreeCheckbox)
    await agreeCheckbox.check()
  }

  async submitRegistration() {
    // 点击注册按钮
    const submitButton = this.page.locator('button[type="submit"], button:has-text("注册"), button:has-text("提交")').first()
    await waitForElementReady(submitButton)
    await submitButton.click()
  }

  async expectSuccess() {
    // 等待注册成功提示或跳转
    const result = await waitForFormSubmission(this.page, {
      successSelectors: ['text=注册成功', 'text=注册完成', '.success-message'],
      errorSelectors: ['.error-message', '.el-message--error']
    })

    if (!result.success) {
      throw new Error(`注册失败: ${result.message}`)
    }
  }

  async expectErrorMessage(message?: string) {
    const errorElement = this.page.locator('.error-message, .el-form-item__error, .el-message--error')
    await expect(errorElement).toBeVisible()

    if (message) {
      await expect(errorElement).toContainText(message)
    }
  }
}


