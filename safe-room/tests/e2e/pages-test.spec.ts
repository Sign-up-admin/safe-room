import { test, expect } from '@playwright/test'

test('renders home dashboard content', async ({ page }) => {
  await page.goto('/#/index/home')
  await expect(page.getByText(/健身/)).toBeVisible()
})
