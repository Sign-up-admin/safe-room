import { test, expect } from '@playwright/test'
import { setupTestEnvironment } from '../utils/shared-helpers'
import { waitForPageFullyLoaded, waitForFormSubmission } from '../utils/wait-helpers'
import { selectors } from '../utils/selectors'
import { applyCommonMock } from '../utils/mock-manager'
import { SCENARIO_NAMES } from '../utils/mock-presets'

test.describe('Front authentication', () => {
  test.beforeEach(async ({ page }) => {
    // 使用完整的测试环境设置，包括Mock和Cookie处理
    await setupTestEnvironment(page)
  })

  test('logs in successfully with valid credentials', async ({ page }) => {
    // 使用预设的登录成功场景
    await applyCommonMock(page, SCENARIO_NAMES.LOGIN_SUCCESS)

    await page.goto('/#/login')
    await waitForPageFullyLoaded(page)

    // 使用稳定的data-testid选择器
    await page.getByTestId(selectors.login.usernameInput()).fill('user01')
    await page.getByTestId(selectors.login.passwordInput()).fill('123456')
    await page.getByTestId(selectors.login.submitButton()).click()

    // 等待表单提交完成
    const result = await waitForFormSubmission(page, {
      successSelectors: ['text=登录成功'],
      errorSelectors: [selectors.login.errorMessage]
    })

    if (result.success) {
      await expect(page).toHaveURL(/#\/index\/home/)
    } else {
      throw new Error(`登录失败: ${result.message}`)
    }
  })

  test('shows error message when credentials are invalid', async ({ page }) => {
    // 使用预设的登录失败场景
    await applyCommonMock(page, SCENARIO_NAMES.LOGIN_FAILURE)

    await page.goto('/#/login')
    await waitForPageFullyLoaded(page)

    // 使用稳定的data-testid选择器
    await page.getByTestId(selectors.login.usernameInput()).fill('wrong-user')
    await page.getByTestId(selectors.login.passwordInput()).fill('wrong-pass')
    await page.getByTestId(selectors.login.submitButton()).click()

    // 等待错误消息出现
    await expect(page.getByTestId(selectors.login.errorMessage)).toBeVisible()
    await expect(page.getByTestId(selectors.login.errorMessage)).toContainText('账号或密码错误')
  })

  test('navigates to register page', async ({ page }) => {
    await page.goto('/#/login')
    await waitForPageFullyLoaded(page)

    // 使用稳定的data-testid选择器
    await page.getByTestId(selectors.login.registerLink).click()
    await expect(page).toHaveURL(/#\/register/)
  })
})


