import { test, expect } from '@playwright/test'
import { mockFrontApi, seedFrontSession } from '../utils/test-helpers'

test.beforeEach(async ({ page }) => {
  await seedFrontSession(page)
  await mockFrontApi(page)
})

test.describe('Front CRUD modules', () => {
  test('renders user management list', async ({ page }) => {
    await page.goto('/#/index/yonghu')
    await expect(page.getByText('测试用户')).toBeVisible()
  })

  test('renders coach management list', async ({ page }) => {
    await page.goto('/#/index/jianshenjiaolian')
    await expect(page.getByText('教练A')).toBeVisible()
  })

  test('renders private class booking list', async ({ page }) => {
    await page.goto('/#/index/sijiaoyuyue')
    await expect(page.getByText('燃脂私教课')).toBeVisible()
  })
})


