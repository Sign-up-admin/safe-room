import { test } from '@playwright/test'
import { setupTestEnvironment } from '../utils/shared-helpers'
import { FrontLoginPage } from '../utils/page-objects/front-pages'

test.describe('Front login page', () => {
  test.beforeEach(async ({ page }) => {
    // 使用完整的测试环境设置，包括Mock和Cookie处理
    await setupTestEnvironment(page)
  })

  test('renders login scaffold', async ({ page }) => {
    const loginPage = new FrontLoginPage(page)
    await loginPage.goto()
    await loginPage.expectScaffold()
  })
})


