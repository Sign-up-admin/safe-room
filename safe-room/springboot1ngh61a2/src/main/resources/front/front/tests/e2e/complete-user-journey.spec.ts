import { test, expect } from '@playwright/test'

test.describe('Complete User Journey', () => {
  test('should complete full user registration and login flow', async ({ page }) => {
    // 1. 访问首页
    await page.goto('/')
    await expect(page).toHaveTitle(/健身房|Gym/i)

    // 2. 导航到注册页�?    await page.goto('/#/register')
    await expect(page.locator('form[data-testid*="register"]')).toBeVisible()

    // 3. 填写注册表单
    const username = `testuser_${Date.now()}`
    const email = `${username}@example.com`
    const password = 'Test123456'

    await page.fill('input[data-testid*="username"]', username)
    await page.fill('input[data-testid*="email"]', email)
    await page.fill('input[type="password"]', password)
    await page.fill('input[data-testid*="confirm-password"]', password)

    // 4. 提交注册
    await page.click('button[data-testid*="register-submit"]')

    // 5. 验证注册成功（可能跳转到登录页面或显示成功消息）
    await expect(page).toHaveURL(/\/login|\/dashboard/)

    // 6. 如果在登录页面，执行登录
    if (page.url().includes('/login')) {
      await page.fill('input[data-testid*="username"]', username)
      await page.fill('input[type="password"]', password)
      await page.click('button[data-testid*="login-submit"]')
    }

    // 7. 验证登录成功
    await expect(page).toHaveURL(/\/dashboard|\/home/)
    await expect(page.locator('[data-testid*="user-info"]')).toBeVisible()
  })

  test('should complete course booking flow', async ({ page }) => {
    // 1. 登录用户（假设已有测试用户）
    await page.goto('/#/login')
    await page.fill('input[data-testid*="username"]', 'testuser')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[data-testid*="login-submit"]')

    // 2. 验证登录成功
    await expect(page).toHaveURL(/\/dashboard|\/home/)

    // 3. 导航到课程列�?    await page.goto('/#/courses')
    await expect(page.locator('[data-testid*="course-list"]')).toBeVisible()

    // 4. 选择一个课�?    const firstCourse = page.locator('[data-testid*="course-item"]').first()
    await expect(firstCourse).toBeVisible()
    await firstCourse.click()

    // 5. 查看课程详情
    await expect(page.locator('[data-testid*="course-detail"]')).toBeVisible()

    // 6. 点击预约按钮
    await page.click('[data-testid*="book-course"]')

    // 7. 选择预约时间
    const timeSlot = page.locator('[data-testid*="time-slot"]').first()
    await expect(timeSlot).toBeVisible()
    await timeSlot.click()

    // 8. 确认预约
    await page.click('[data-testid*="confirm-booking"]')

    // 9. 验证预约成功
    await expect(page.locator('[data-testid*="booking-success"]')).toBeVisible()

    // 10. 检查个人预约记�?    await page.goto('/#/profile')
    await expect(page.locator('[data-testid*="my-bookings"]')).toContainText('预约成功')
  })

  test('should handle membership purchase flow', async ({ page }) => {
    // 1. 登录用户
    await page.goto('/#/login')
    await page.fill('input[data-testid*="username"]', 'testuser')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[data-testid*="login-submit"]')

    // 2. 导航到会员卡页面
    await page.goto('/#/membership')
    await expect(page.locator('[data-testid*="membership-cards"]')).toBeVisible()

    // 3. 选择会员�?    const membershipCard = page.locator('[data-testid*="membership-card"]').first()
    await membershipCard.click()

    // 4. 选择会员卡类�?时长
    await page.click('[data-testid*="select-plan"]')

    // 5. 进入支付流程
    await page.click('[data-testid*="purchase-button"]')

    // 6. 填写支付信息（模拟）
    await page.fill('input[data-testid*="card-number"]', '4111111111111111')
    await page.fill('input[data-testid*="expiry-date"]', '12/25')
    await page.fill('input[data-testid*="cvv"]', '123')

    // 7. 确认支付
    await page.click('[data-testid*="confirm-payment"]')

    // 8. 验证支付成功
    await expect(page.locator('[data-testid*="payment-success"]')).toBeVisible()

    // 9. 检查会员状态更�?    await page.goto('/#/profile')
    await expect(page.locator('[data-testid*="membership-status"]')).toContainText('活跃')
  })

  test('should handle favorites and search functionality', async ({ page }) => {
    // 1. 登录用户
    await page.goto('/#/login')
    await page.fill('input[data-testid*="username"]', 'testuser')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[data-testid*="login-submit"]')

    // 2. 搜索课程
    await page.fill('input[data-testid*="search-input"]', '瑜伽')
    await page.click('button[data-testid*="search-button"]')

    // 3. 验证搜索结果
    await expect(page.locator('[data-testid*="search-results"]')).toBeVisible()
    await expect(page.locator('[data-testid*="course-item"]')).toHaveCount(await page.locator('[data-testid*="course-item"]').count())

    // 4. 添加收藏
    const firstCourse = page.locator('[data-testid*="course-item"]').first()
    const favoriteButton = firstCourse.locator('[data-testid*="favorite-button"]')
    await favoriteButton.click()

    // 5. 验证收藏成功
    await expect(favoriteButton).toHaveClass(/active/)

    // 6. 查看收藏列表
    await page.goto('/#/favorites')
    await expect(page.locator('[data-testid*="favorites-list"]')).toBeVisible()
    await expect(page.locator('[data-testid*="favorite-item"]')).toHaveCount(await page.locator('[data-testid*="favorite-item"]').count())
  })

  test('should handle profile management', async ({ page }) => {
    // 1. 登录用户
    await page.goto('/#/login')
    await page.fill('input[data-testid*="username"]', 'testuser')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[data-testid*="login-submit"]')

    // 2. 进入个人资料页面
    await page.goto('/#/profile')
    await expect(page.locator('[data-testid*="profile-form"]')).toBeVisible()

    // 3. 更新个人信息
    await page.fill('input[data-testid*="nickname"]', '测试用户')
    await page.fill('input[data-testid*="phone"]', '13800138000')
    await page.selectOption('select[data-testid*="gender"]', 'male')

    // 4. 保存更改
    await page.click('button[data-testid*="save-profile"]')

    // 5. 验证更新成功
    await expect(page.locator('[data-testid*="update-success"]')).toBeVisible()

    // 6. 验证信息已更�?    await expect(page.locator('input[data-testid*="nickname"]')).toHaveValue('测试用户')
    await expect(page.locator('input[data-testid*="phone"]')).toHaveValue('13800138000')
  })
})



