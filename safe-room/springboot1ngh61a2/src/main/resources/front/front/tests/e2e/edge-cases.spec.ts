import { test, expect } from '@playwright/test'

test('redirects unauthenticated user to login', async ({ page }) => {
  await page.goto('/#/index/center')
  await expect(page).toHaveURL(/#\/login/)
})

test('shows error notification on network failure', async ({ page }) => {
  await page.route('**/login**', async (route) => {
    await route.abort('failed')
  })

  await page.goto('/#/login')
  await page.getByLabel('账号').fill('user01')
  await page.getByLabel('密码', { exact: false }).fill('123456')
  await page.getByRole('button', { name: '登录' }).click()

  await expect(page.getByText(/登录失败/)).toBeVisible()
})


