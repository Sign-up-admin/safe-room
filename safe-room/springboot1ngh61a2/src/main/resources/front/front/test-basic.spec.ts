import { test, expect } from '@playwright/test'

test('basic test', async ({ page }) => {
  await page.goto('http://localhost:8082/')
  const title = await page.title()
  console.log('Page title:', title)
  console.log('Current URL:', page.url())
  expect(title).toBeTruthy()
})
