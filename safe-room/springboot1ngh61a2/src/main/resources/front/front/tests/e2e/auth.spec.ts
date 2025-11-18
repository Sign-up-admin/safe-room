import { test, expect } from '@playwright/test'
import { setupTestEnvironment, setupTestDataIsolation } from '../utils/shared-helpers'
import { waitForPageFullyLoaded, waitForFormSubmission } from '../utils/wait-helpers'
import { selectors } from '../utils/selectors'
import { applyCommonMock } from '../utils/mock-manager'
import { SCENARIO_NAMES } from '../utils/mock-presets'
import { createTestStabilityEnhancer, retryOnFailure } from '../utils/error-handler'
import { testData } from '../utils/test-data-manager'

test.describe('Front authentication', () => {
  let testId: string
  let cleanupData: () => Promise<void>
  let stabilityEnhancer: any

  test.beforeEach(async ({ page }) => {
    // 设置测试数据隔离
    const isolation = await setupTestDataIsolation(page, { title: 'auth-test' })
    testId = isolation.testId
    cleanupData = isolation.cleanup

    // 创建稳定性增强器
    stabilityEnhancer = createTestStabilityEnhancer(page)

    // 使用完整的测试环境设置，包括Mock和Cookie处理
    await setupTestEnvironment(page)
  })

  test.afterEach(async ({ page }) => {
    // 清理测试数据
    if (cleanupData) {
      await cleanupData()
    }
  })

  test('logs in successfully with valid credentials', async ({ page }) => {
    await stabilityEnhancer.executeStableAction(async () => {
      // 使用预设的登录成功场�?
      await applyCommonMock(page, SCENARIO_NAMES.LOGIN_SUCCESS)

      // 使用隔离的测试用户数�?
      const testUser = testData.createUser(testId, {
        username: 'login_test_user',
        password: '123456'
      })

      await stabilityEnhancer.errorHandler.gotoWithRetry('/#/login')
      await stabilityEnhancer.errorHandler.waitForPageLoadWithRetry()

      // 使用稳定的data-testid选择器，带重试的填写操作
      await stabilityEnhancer.errorHandler.fillWithRetry(
        page.getByTestId(selectors.login.usernameInput()),
        testUser.username
      )
      await stabilityEnhancer.errorHandler.fillWithRetry(
        page.getByTestId(selectors.login.passwordInput()),
        testUser.password!
      )
      await stabilityEnhancer.errorHandler.clickWithRetry(
        page.getByTestId(selectors.login.submitButton())
      )

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
    }, 'login_success', 'logs in successfully with valid credentials')
  })

  test('shows error message when credentials are invalid', async ({ page }) => {
    // 使用预设的登录失败场�?
    await applyCommonMock(page, SCENARIO_NAMES.LOGIN_FAILURE)

    await page.goto('/#/login')
    await waitForPageFullyLoaded(page)

    // 使用稳定的data-testid选择�?
    await page.getByTestId(selectors.login.usernameInput()).fill('wrong-user')
    await page.getByTestId(selectors.login.passwordInput()).fill('wrong-pass')
    await page.getByTestId(selectors.login.submitButton()).click()

    // 等待错误消息出现
    await expect(page.getByTestId(selectors.login.errorMessage)).toBeVisible()
    await expect(page.getByTestId(selectors.login.errorMessage)).toContainText('账号或密码错误'navigates to register page', async ({ page }) => {
    await page.goto('/#/login')
    await waitForPageFullyLoaded(page)

    // 使用稳定的data-testid选择�?
    await page.getByTestId(selectors.login.registerLink).click()
    await expect(page).toHaveURL(/#\/register/)
  })
})


