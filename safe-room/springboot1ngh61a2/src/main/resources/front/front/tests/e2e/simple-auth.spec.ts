import { test, expect } from '@playwright/test'

test.describe('Simple Authentication Tests', () => {
  test('should load login page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/健身房|Gym/i)
  })

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/#/login')
    // 检查是否包含登录相关的元素
    await expect(page.locator('form[data-testid="login-form"]')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('input[type="password"]')).toBeVisible({ timeout: 10000 })
  })
})
