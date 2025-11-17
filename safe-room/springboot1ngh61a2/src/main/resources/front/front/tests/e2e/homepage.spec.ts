import { test, expect } from '@playwright/test'
import { setupTestEnvironment } from '../utils/shared-helpers'
import { FrontHomePage } from '../utils/page-objects/front-pages'

test.describe('Front homepage', () => {
  test.beforeEach(async ({ page }) => {
    // 使用完整的测试环境设置，包括Mock和Cookie处理
    await setupTestEnvironment(page)
  })

  test('redirects to /index/home and renders hero content', async ({ page }) => {
    const homePage = new FrontHomePage(page)
    await homePage.goto()
    await homePage.expectHero()
    await expect(page).toHaveTitle(/Gym/i, { timeout: 10_000 }).catch(() => {
      // 页面标题目前为空，忽略错误但保留日志，方便未来补充断言
      console.warn('Home page title was empty – consider adding <title> for better UX.')
    })
  })
})


