import { test, expect } from '@playwright/test'

test.describe('Front homepage - Basic', () => {
  test('loads homepage and displays gym title', async ({ page }) => {
    await page.goto('/#/index/home')
    await expect(page.getByText('智能健身房')).toBeVisible()
  })

  test('shows navigation menu', async ({ page }) => {
    await page.goto('/#/index/home')
    await expect(page.getByText('健身教练')).toBeVisible()
    await expect(page.getByText('健身课程')).toBeVisible()
  })

  test('displays hero section', async ({ page }) => {
    await page.goto('/#/index/home')
    await expect(page.getByText('觉醒更强的自己')).toBeVisible()
  })

  test('shows course sections', async ({ page }) => {
    await page.goto('/#/index/home')
    await expect(page.getByText('HOT COURSES')).toBeVisible()
    await expect(page.getByText('热门课程')).toBeVisible()
  })
})
