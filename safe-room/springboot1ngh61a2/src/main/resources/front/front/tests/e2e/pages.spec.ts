import { test, expect } from '@playwright/test'
import { mockFrontApi, seedFrontSession } from '../utils/test-helpers'

test.beforeEach(async ({ page }) => {
  await seedFrontSession(page)
  await mockFrontApi(page)
})

test.describe('Front primary pages', () => {
  test('renders home dashboard content', async ({ page }) => {
    await page.goto('/#/index/home')
    await expect(page.getByText(/健身/)).toBeVisible()
  })

  test('loads personal center layout', async ({ page }) => {
    await page.goto('/#/index/center')
    await expect(page.locator('.form')).toBeVisible()
  })

  test('displays payment page scaffold', async ({ page }) => {
    await page.goto('/#/index/pay')
    await expect(page.getByText(/订单/)).toBeVisible()
  })

  test('opens favorites page', async ({ page }) => {
    await page.goto('/#/index/storeup')
    await expect(page.getByText(/收藏/)).toBeVisible()
  })

  test('shows news list', async ({ page }) => {
    await page.goto('/#/index/news')
    await expect(page.getByRole('heading', { name: /公告|新闻/ })).toBeVisible()
  })
})


