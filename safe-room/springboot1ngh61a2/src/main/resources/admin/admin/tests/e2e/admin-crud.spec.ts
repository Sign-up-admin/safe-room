import { test, expect } from '@playwright/test'

test.describe('Admin CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    // 登录管理员
    await page.goto('/#/login')
    await page.fill('input[data-testid*="username"]', 'admin')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[data-testid*="login-submit"]')

    // 验证登录成功
    await expect(page).toHaveURL(/\/dashboard|\/admin/)
  })

  test('should manage users (CRUD)', async ({ page }) => {
    // 导航到用户管理页面
    await page.goto('/#/admin/users')
    await expect(page.locator('[data-testid*="user-list"]')).toBeVisible()

    // 创建新用户
    await page.click('[data-testid*="add-user"]')
    await expect(page.locator('[data-testid*="user-form"]')).toBeVisible()

    const testUsername = `testuser_${Date.now()}`
    const testEmail = `${testUsername}@example.com`

    await page.fill('input[data-testid*="user-username"]', testUsername)
    await page.fill('input[data-testid*="user-email"]', testEmail)
    await page.fill('input[data-testid*="user-password"]', 'Test123456')
    await page.selectOption('select[data-testid*="user-role"]', 'user')

    await page.click('[data-testid*="save-user"]')
    await expect(page.locator('[data-testid*="save-success"]')).toBeVisible()

    // 验证用户已创建
    await expect(page.locator(`[data-testid*="user-item"]`).filter({ hasText: testUsername })).toBeVisible()

    // 编辑用户
    const userRow = page.locator(`[data-testid*="user-item"]`).filter({ hasText: testUsername })
    await userRow.locator('[data-testid*="edit-user"]').click()

    await page.fill('input[data-testid*="user-nickname"]', '测试用户')
    await page.click('[data-testid*="save-user"]')
    await expect(page.locator('[data-testid*="update-success"]')).toBeVisible()

    // 删除用户
    await userRow.locator('[data-testid*="delete-user"]').click()
    await page.click('[data-testid*="confirm-delete"]')
    await expect(page.locator('[data-testid*="delete-success"]')).toBeVisible()

    // 验证用户已删除
    await expect(page.locator(`[data-testid*="user-item"]`).filter({ hasText: testUsername })).not.toBeVisible()
  })

  test('should manage courses (CRUD)', async ({ page }) => {
    // 导航到课程管理页面
    await page.goto('/#/admin/courses')
    await expect(page.locator('[data-testid*="course-list"]')).toBeVisible()

    // 创建新课程
    await page.click('[data-testid*="add-course"]')
    await expect(page.locator('[data-testid*="course-form"]')).toBeVisible()

    const courseName = `测试课程_${Date.now()}`

    await page.fill('input[data-testid*="course-name"]', courseName)
    await page.fill('textarea[data-testid*="course-description"]', '这是一个测试课程描述')
    await page.fill('input[data-testid*="course-price"]', '99')
    await page.selectOption('select[data-testid*="course-category"]', 'fitness')
    await page.fill('input[data-testid*="course-instructor"]', '测试教练')

    await page.click('[data-testid*="save-course"]')
    await expect(page.locator('[data-testid*="save-success"]')).toBeVisible()

    // 验证课程已创建
    await expect(page.locator(`[data-testid*="course-item"]`).filter({ hasText: courseName })).toBeVisible()

    // 编辑课程
    const courseRow = page.locator(`[data-testid*="course-item"]`).filter({ hasText: courseName })
    await courseRow.locator('[data-testid*="edit-course"]').click()

    await page.fill('input[data-testid*="course-price"]', '129')
    await page.click('[data-testid*="save-course"]')
    await expect(page.locator('[data-testid*="update-success"]')).toBeVisible()

    // 删除课程
    await courseRow.locator('[data-testid*="delete-course"]').click()
    await page.click('[data-testid*="confirm-delete"]')
    await expect(page.locator('[data-testid*="delete-success"]')).toBeVisible()

    // 验证课程已删除
    await expect(page.locator(`[data-testid*="course-item"]`).filter({ hasText: courseName })).not.toBeVisible()
  })

  test('should manage bookings (Read and Update)', async ({ page }) => {
    // 导航到预约管理页面
    await page.goto('/#/admin/bookings')
    await expect(page.locator('[data-testid*="booking-list"]')).toBeVisible()

    // 查看预约详情
    const firstBooking = page.locator('[data-testid*="booking-item"]').first()
    await expect(firstBooking).toBeVisible()
    await firstBooking.locator('[data-testid*="view-booking"]').click()

    await expect(page.locator('[data-testid*="booking-detail"]')).toBeVisible()

    // 验证预约信息显示
    await expect(page.locator('[data-testid*="booking-user"]')).toBeVisible()
    await expect(page.locator('[data-testid*="booking-course"]')).toBeVisible()
    await expect(page.locator('[data-testid*="booking-time"]')).toBeVisible()

    // 更新预约状态
    await page.selectOption('select[data-testid*="booking-status"]', 'confirmed')
    await page.click('[data-testid*="update-booking"]')
    await expect(page.locator('[data-testid*="update-success"]')).toBeVisible()

    // 返回列表页面
    await page.click('[data-testid*="back-to-list"]')
    await expect(page.locator('[data-testid*="booking-list"]')).toBeVisible()
  })

  test('should manage membership cards (CRUD)', async ({ page }) => {
    // 导航到会员卡管理页面
    await page.goto('/#/admin/memberships')
    await expect(page.locator('[data-testid*="membership-list"]')).toBeVisible()

    // 创建新会员卡
    await page.click('[data-testid*="add-membership"]')
    await expect(page.locator('[data-testid*="membership-form"]')).toBeVisible()

    const cardName = `测试会员卡_${Date.now()}`

    await page.fill('input[data-testid*="membership-name"]', cardName)
    await page.fill('textarea[data-testid*="membership-description"]', '这是一个测试会员卡')
    await page.fill('input[data-testid*="membership-price"]', '199')
    await page.fill('input[data-testid*="membership-duration"]', '30') // 30天
    await page.selectOption('select[data-testid*="membership-type"]', 'monthly')

    await page.click('[data-testid*="save-membership"]')
    await expect(page.locator('[data-testid*="save-success"]')).toBeVisible()

    // 验证会员卡已创建
    await expect(page.locator(`[data-testid*="membership-item"]`).filter({ hasText: cardName })).toBeVisible()

    // 编辑会员卡
    const membershipRow = page.locator(`[data-testid*="membership-item"]`).filter({ hasText: cardName })
    await membershipRow.locator('[data-testid*="edit-membership"]').click()

    await page.fill('input[data-testid*="membership-price"]', '299')
    await page.click('[data-testid*="save-membership"]')
    await expect(page.locator('[data-testid*="update-success"]')).toBeVisible()

    // 删除会员卡
    await membershipRow.locator('[data-testid*="delete-membership"]').click()
    await page.click('[data-testid*="confirm-delete"]')
    await expect(page.locator('[data-testid*="delete-success"]')).toBeVisible()

    // 验证会员卡已删除
    await expect(page.locator(`[data-testid*="membership-item"]`).filter({ hasText: cardName })).not.toBeVisible()
  })

  test('should view dashboard statistics', async ({ page }) => {
    // 导航到仪表板
    await page.goto('/#/admin/dashboard')
    await expect(page.locator('[data-testid*="dashboard-stats"]')).toBeVisible()

    // 验证统计数据显示
    await expect(page.locator('[data-testid*="total-users"]')).toBeVisible()
    await expect(page.locator('[data-testid*="total-courses"]')).toBeVisible()
    await expect(page.locator('[data-testid*="total-bookings"]')).toBeVisible()
    await expect(page.locator('[data-testid*="total-revenue"]')).toBeVisible()

    // 验证图表显示
    await expect(page.locator('[data-testid*="revenue-chart"]')).toBeVisible()
    await expect(page.locator('[data-testid*="booking-chart"]')).toBeVisible()
    await expect(page.locator('[data-testid*="user-growth-chart"]')).toBeVisible()

    // 验证最近活动
    await expect(page.locator('[data-testid*="recent-activities"]')).toBeVisible()
    await expect(page.locator('[data-testid*="activity-item"]')).toHaveCount(await page.locator('[data-testid*="activity-item"]').count())
  })

  test('should handle bulk operations', async ({ page }) => {
    // 导航到用户管理页面
    await page.goto('/#/admin/users')

    // 选择多个用户
    const userCheckboxes = page.locator('[data-testid*="user-checkbox"]').all()
    if ((await userCheckboxes).length >= 2) {
      await (await userCheckboxes)[0].check()
      await (await userCheckboxes)[1].check()

      // 执行批量操作
      await page.click('[data-testid*="bulk-actions"]')
      await page.click('[data-testid*="bulk-export"]')

      // 验证导出成功
      await expect(page.locator('[data-testid*="export-success"]')).toBeVisible()
    }

    // 导航到课程管理页面
    await page.goto('/#/admin/courses')

    // 选择多个课程
    const courseCheckboxes = page.locator('[data-testid*="course-checkbox"]').all()
    if ((await courseCheckboxes).length >= 2) {
      await (await courseCheckboxes)[0].check()
      await (await courseCheckboxes)[1].check()

      // 执行批量状态更新
      await page.click('[data-testid*="bulk-actions"]')
      await page.click('[data-testid*="bulk-status-update"]')
      await page.selectOption('select[data-testid*="status-select"]', 'active')
      await page.click('[data-testid*="confirm-bulk-update"]')

      // 验证批量更新成功
      await expect(page.locator('[data-testid*="bulk-update-success"]')).toBeVisible()
    }
  })
})
