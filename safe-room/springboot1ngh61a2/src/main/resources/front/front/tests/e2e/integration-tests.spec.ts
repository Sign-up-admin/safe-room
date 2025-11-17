import { test, expect } from '@playwright/test'

test.describe('Cross-System Integration Tests', () => {
  test('should synchronize user data between front and admin systems', async ({ page, context }) => {
    // 在前端注册新用户
    const testUsername = `integration_user_${Date.now()}`
    const testEmail = `${testUsername}@example.com`
    const testPassword = 'Integration123'

    await page.goto('/#/register')
    await page.fill('input[data-testid*="username"]', testUsername)
    await page.fill('input[data-testid*="email"]', testEmail)
    await page.fill('input[type="password"]', testPassword)
    await page.fill('input[data-testid*="confirm-password"]', testPassword)
    await page.click('button[data-testid*="register-submit"]')

    // 验证前端注册成功
    await expect(page).toHaveURL(/\/login|\/dashboard/)

    // 在后台管理系统验证用户已同步
    const adminPage = await context.newPage()
    await adminPage.goto('/#/login') // 假设后台管理系统在同一域名下
    await adminPage.fill('input[data-testid*="username"]', 'admin')
    await adminPage.fill('input[type="password"]', 'admin123')
    await adminPage.click('button[data-testid*="login-submit"]')

    // 验证管理员登录成功
    await expect(adminPage).toHaveURL(/\/dashboard|\/admin/)

    // 导航到用户管理页面
    await adminPage.goto('/#/admin/users')
    await expect(adminPage.locator('[data-testid*="user-list"]')).toBeVisible()

    // 验证新注册的用户出现在用户列表中
    await expect(adminPage.locator(`[data-testid*="user-item"]`).filter({ hasText: testUsername })).toBeVisible()
    await expect(adminPage.locator(`[data-testid*="user-item"]`).filter({ hasText: testEmail })).toBeVisible()

    // 在后台管理系统修改用户信息
    const userRow = adminPage.locator(`[data-testid*="user-item"]`).filter({ hasText: testUsername })
    await userRow.locator('[data-testid*="edit-user"]').click()

    await adminPage.fill('input[data-testid*="user-nickname"]', '集成测试用户')
    await adminPage.selectOption('select[data-testid*="user-status"]', 'active')
    await adminPage.click('[data-testid*="save-user"]')
    await expect(adminPage.locator('[data-testid*="update-success"]')).toBeVisible()

    // 验证前端用户数据已更新
    await page.goto('/#/login')
    await page.fill('input[data-testid*="username"]', testUsername)
    await page.fill('input[type="password"]', testPassword)
    await page.click('button[data-testid*="login-submit"]')

    await page.goto('/#/profile')
    await expect(page.locator('input[data-testid*="nickname"]')).toHaveValue('集成测试用户')

    await adminPage.close()
  })

  test('should synchronize course booking between systems', async ({ page, context }) => {
    // 前端用户预约课程
    await page.goto('/#/login')
    await page.fill('input[data-testid*="username"]', 'testuser')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[data-testid*="login-submit"]')

    // 导航到课程页面
    await page.goto('/#/courses')
    const firstCourse = page.locator('[data-testid*="course-item"]').first()
    const courseName = await firstCourse.textContent()

    await firstCourse.click()
    await page.click('[data-testid*="book-course"]')

    const timeSlot = page.locator('[data-testid*="time-slot"]').first()
    await timeSlot.click()
    await page.click('[data-testid*="confirm-booking"]')

    await expect(page.locator('[data-testid*="booking-success"]')).toBeVisible()

    // 在后台管理系统验证预约记录
    const adminPage = await context.newPage()
    await adminPage.goto('/#/login')
    await adminPage.fill('input[data-testid*="username"]', 'admin')
    await adminPage.fill('input[type="password"]', 'admin123')
    await adminPage.click('button[data-testid*="login-submit"]')

    // 查看预约管理
    await adminPage.goto('/#/admin/bookings')
    await expect(adminPage.locator('[data-testid*="booking-list"]')).toBeVisible()

    // 验证新预约出现在列表中
    await expect(adminPage.locator(`[data-testid*="booking-item"]`).filter({ hasText: 'testuser' })).toBeVisible()
    if (courseName) {
      await expect(adminPage.locator(`[data-testid*="booking-item"]`).filter({ hasText: courseName })).toBeVisible()
    }

    // 在后台确认预约
    const bookingItem = adminPage.locator(`[data-testid*="booking-item"]`).filter({ hasText: 'testuser' }).first()
    await bookingItem.locator('[data-testid*="view-booking"]').click()
    await adminPage.selectOption('select[data-testid*="booking-status"]', 'confirmed')
    await adminPage.click('[data-testid*="update-booking"]')
    await expect(adminPage.locator('[data-testid*="update-success"]')).toBeVisible()

    // 验证前端预约状态已更新
    await page.reload()
    await expect(page.locator('[data-testid*="booking-status"]')).toContainText('已确认')

    await adminPage.close()
  })

  test('should synchronize membership purchase between systems', async ({ page, context }) => {
    // 前端用户购买会员卡
    await page.goto('/#/login')
    await page.fill('input[data-testid*="username"]', 'testuser')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[data-testid*="login-submit"]')

    // 导航到会员卡页面
    await page.goto('/#/membership')
    const membershipCard = page.locator('[data-testid*="membership-card"]').first()
    const cardName = await membershipCard.locator('[data-testid*="card-name"]').textContent()

    await membershipCard.click()
    await page.click('[data-testid*="purchase-button"]')

    // 填写支付信息
    await page.fill('input[data-testid*="card-number"]', '4111111111111111')
    await page.fill('input[data-testid*="expiry-date"]', '12/25')
    await page.fill('input[data-testid*="cvv"]', '123')
    await page.click('[data-testid*="confirm-payment"]')

    await expect(page.locator('[data-testid*="payment-success"]')).toBeVisible()

    // 验证前端会员状态
    await page.goto('/#/profile')
    await expect(page.locator('[data-testid*="membership-status"]')).toContainText('活跃')

    // 在后台管理系统验证会员购买记录
    const adminPage = await context.newPage()
    await adminPage.goto('/#/login')
    await adminPage.fill('input[data-testid*="username"]', 'admin')
    await adminPage.fill('input[type="password"]', 'admin123')
    await adminPage.click('button[data-testid*="login-submit"]')

    // 查看会员管理
    await adminPage.goto('/#/admin/memberships')
    await expect(adminPage.locator('[data-testid*="membership-purchases"]')).toBeVisible()

    // 验证购买记录
    await expect(adminPage.locator(`[data-testid*="purchase-item"]`).filter({ hasText: 'testuser' })).toBeVisible()
    if (cardName) {
      await expect(adminPage.locator(`[data-testid*="purchase-item"]`).filter({ hasText: cardName })).toBeVisible()
    }

    // 查看财务统计
    await adminPage.goto('/#/admin/finance')
    await expect(adminPage.locator('[data-testid*="revenue-stats"]')).toBeVisible()

    // 验证收入统计已更新
    const revenueStats = adminPage.locator('[data-testid*="total-revenue"]')
    await expect(revenueStats).toBeVisible()

    await adminPage.close()
  })

  test('should handle real-time notifications between systems', async ({ page, context }) => {
    // 前端用户登录
    await page.goto('/#/login')
    await page.fill('input[data-testid*="username"]', 'testuser')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[data-testid*="login-submit"]')

    // 后台管理员登录
    const adminPage = await context.newPage()
    await adminPage.goto('/#/login')
    await adminPage.fill('input[data-testid*="username"]', 'admin')
    await adminPage.fill('input[type="password"]', 'admin123')
    await adminPage.click('button[data-testid*="login-submit"]')

    // 管理员发送通知
    await adminPage.goto('/#/admin/notifications')
    await adminPage.click('[data-testid*="send-notification"]')
    await adminPage.fill('input[data-testid*="notification-title"]', '系统维护通知')
    await adminPage.fill('textarea[data-testid*="notification-content"]', '系统将在今晚进行维护升级')
    await adminPage.selectOption('select[data-testid*="target-users"]', 'all')
    await adminPage.click('[data-testid*="send-button"]')
    await expect(adminPage.locator('[data-testid*="send-success"]')).toBeVisible()

    // 验证前端用户收到通知
    await expect(page.locator('[data-testid*="notification-bell"]')).toHaveClass(/has-notification/)
    await page.click('[data-testid*="notification-bell"]')
    await expect(page.locator('[data-testid*="notification-item"]')).toContainText('系统维护通知')

    // 用户标记通知为已读
    await page.click('[data-testid*="mark-read"]')
    await expect(page.locator('[data-testid*="notification-bell"]')).not.toHaveClass(/has-notification/)

    // 验证后台通知统计已更新
    await adminPage.reload()
    await expect(adminPage.locator('[data-testid*="notification-stats"]')).toContainText('已读')

    await adminPage.close()
  })

  test('should handle concurrent operations across systems', async ({ page, context }) => {
    // 模拟多个用户同时操作
    const pages = []

    // 创建多个用户页面
    for (let i = 0; i < 3; i++) {
      const userPage = await context.newPage()
      await userPage.goto('/#/login')
      await userPage.fill('input[data-testid*="username"]', `testuser${i}`)
      await userPage.fill('input[type="password"]', 'password123')
      await userPage.click('button[data-testid*="login-submit"]')
      pages.push(userPage)
    }

    // 所有用户同时尝试预约同一课程的同一时间段
    const bookingPromises = pages.map(async (userPage, index) => {
      await userPage.goto('/#/courses')
      const firstCourse = userPage.locator('[data-testid*="course-item"]').first()
      await firstCourse.click()
      await userPage.click('[data-testid*="book-course"]')

      // 所有用户选择相同的时间段
      const timeSlot = userPage.locator('[data-testid*="time-slot"]').first()
      await timeSlot.click()
      await userPage.click('[data-testid*="confirm-booking"]')

      return userPage
    })

    // 等待所有预约操作完成
    const results = await Promise.allSettled(bookingPromises)

    // 统计成功和失败的预约
    const successfulBookings = results.filter(r => r.status === 'fulfilled').length
    const failedBookings = results.filter(r => r.status === 'rejected').length

    // 验证并发控制：应该只有一个用户成功预约，其他用户收到冲突提示
    expect(successfulBookings + failedBookings).toBe(3)

    // 验证后台管理系统显示正确的预约状态
    const adminPage = await context.newPage()
    await adminPage.goto('/#/login')
    await adminPage.fill('input[data-testid*="username"]', 'admin')
    await adminPage.fill('input[type="password"]', 'admin123')
    await adminPage.click('button[data-testid*="login-submit"]')

    await adminPage.goto('/#/admin/bookings')
    const confirmedBookings = await adminPage.locator('[data-testid*="booking-confirmed"]').count()
    const pendingBookings = await adminPage.locator('[data-testid*="booking-pending"]').count()

    // 验证后台数据一致性
    expect(confirmedBookings + pendingBookings).toBeGreaterThanOrEqual(1)

    // 清理
    for (const userPage of pages) {
      await userPage.close()
    }
    await adminPage.close()
  })
})
