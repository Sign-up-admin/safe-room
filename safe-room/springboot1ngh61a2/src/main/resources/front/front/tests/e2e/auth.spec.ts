import { test, expect } from '@playwright/test'
import { setupTestEnvironment } from '../utils/shared-helpers'

test.describe('Front authentication', () => {
  test.beforeEach(async ({ page }) => {
    // 使用完整的测试环境设置，包括Mock和Cookie处理
    await setupTestEnvironment(page)
  })

  test('logs in successfully with valid credentials', async ({ page }) => {
    await page.route('**/yonghu/login**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ code: 0, token: 'token-123' }),
      })
    })
    await page.route('**/yonghu/session**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ code: 0, data: { id: 1, username: 'user01' } }),
      })
    })

    await page.goto('/#/login')
    // Use more specific selector to avoid ambiguity with checkbox
    await page.getByPlaceholder('请输入会员账号').fill('user01')
    await page.getByLabel('密码', { exact: false }).fill('123456')
    await page.getByRole('button', { name: '登录' }).click()

    await expect(page).toHaveURL(/#\/index\/home/)
  })

  test('shows error message when credentials are invalid', async ({ page }) => {
    await page.route('**/yonghu/login**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ code: 1, msg: '账号或密码错误' }),
      })
    })

    await page.goto('/#/login')
    // Use more specific selector to avoid ambiguity with checkbox
    await page.getByPlaceholder('请输入会员账号').fill('wrong-user')
    await page.getByLabel('密码', { exact: false }).fill('wrong-pass')
    await page.getByRole('button', { name: '登录' }).click()

    await expect(page.getByText('账号或密码错误')).toBeVisible()
  })

  test('navigates to register page', async ({ page }) => {
    await page.goto('/#/login')
    // The "立即注册" text is not a link, but a clickable element
    await page.getByText('立即注册').click()
    await expect(page).toHaveURL(/#\/register/)
  })
})


