import { test, expect } from '@playwright/test'

test('basic test', async ({ page }) => {
  await page.goto('/')
  expect(await page.textContent('h1')).toContain('httpbin')
})

