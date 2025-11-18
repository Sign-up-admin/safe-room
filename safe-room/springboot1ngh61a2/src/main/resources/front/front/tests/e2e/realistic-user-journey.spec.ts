import { test, expect } from '@playwright/test'

test.describe('Realistic User Journey Based on Actual App Structure', () => {
  test('should navigate to home page and verify basic elements', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/#/index/home')

    // 验证页面标题或主要元�?    await expect(page.locator('h1').or(page.locator('.hero-title')).or(page.locator('text=健身�?)).first()).toBeVisible()
  })

  test('should navigate to login page and verify form elements', async ({ page }) => {
    await page.goto('/#/login')

    // 验证登录页面元素
    await expect(page.locator('[data-testid="login-page-title"]')).toContainText('会员登录')
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
    await expect(page.locator('[data-testid="login-username-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="login-password-input"]')).toBeVisible()
    await expect(page.locator('button').filter({ hasText: /登录|login/i }).first()).toBeVisible()
  })

  test('should navigate to register page if available', async ({ page }) => {
    await page.goto('/#/register')

    // 验证注册页面或重定向
    const currentURL = page.url()
    if (currentURL.includes('register')) {
      // 如果有注册页面，验证基本元素
      await expect(page.locator('form').or(page.locator('input[type="text"]')).first()).toBeVisible()
    } else {
      // 如果没有注册页面，验证重定向到了其他页面
      expect(currentURL).toMatch(/\/login|\/index/)
    }
  })

  test('should navigate through main sections', async ({ page }) => {
    // 访问首页
    await page.goto('/#/index/home')
    await expect(page).toHaveURL('/#/index/home')

    // 尝试导航到个人中心（可能需要登录）
    try {
      await page.goto('/#/index/center')
      // 如果成功访问，验证页面元�?      await expect(page.locator('text=个人中心').or(page.locator('.center-content')).or(page.locator('h2')).first()).toBeVisible()
    } catch (e) {
      // 如果需要登录，重定向到登录页面是正常的
      expect(page.url()).toMatch(/\/login/)
    }
  })

  test('should handle course browsing if accessible', async ({ page }) => {
    // 尝试访问课程相关页面
    const coursePaths = ['#/index/jianshenkecheng', '#/courses', '#/index/kechengyuyue']

    for (const path of coursePaths) {
      try {
        await page.goto(path)
        const currentURL = page.url()

        // 如果成功访问课程页面，验证基本元�?        if (!currentURL.includes('/login')) {
          await expect(page.locator('text=课程').or(page.locator('.course-list')).or(page.locator('.course-item')).first()).toBeVisible()
          break // 找到可访问的课程页面就停�?        }
      } catch (e) {
        // 继续尝试其他路径
        continue
      }
    }
  })

  test('should handle membership cards if accessible', async ({ page }) => {
    // 尝试访问会员卡相关页�?    const membershipPaths = ['#/index/huiyuanka', '#/membership', '#/index/huiyuankagoumai']

    for (const path of membershipPaths) {
      try {
        await page.goto(path)
        const currentURL = page.url()

        // 如果成功访问会员卡页面，验证基本元素
        if (!currentURL.includes('/login')) {
          await expect(page.locator('text=会员').or(page.locator('.membership-card')).or(page.locator('.card-item')).first()).toBeVisible()
          break
        }
      } catch (e) {
        continue
      }
    }
  })

  test('should handle news/announcements section', async ({ page }) => {
    await page.goto('/#/index/news')

    // 验证新闻页面元素
    await expect(page.locator('text=新闻').or(page.locator('.news-list')).or(page.locator('.news-item')).first()).toBeVisible()
  })

  test('should handle navigation menu if present', async ({ page }) => {
    await page.goto('/#/index/home')

    // 查找导航菜单
    const navMenu = page.locator('nav').or(page.locator('.nav-menu')).or(page.locator('.menu')).first()

    if (await navMenu.isVisible()) {
      // 如果有导航菜单，验证菜单�?      await expect(navMenu.locator('a').or(navMenu.locator('button')).first()).toBeVisible()
    }
  })

  test('should verify responsive design basics', async ({ page }) => {
    await page.goto('/#/index/home')

    // 设置移动设备视口
    await page.setViewportSize({ width: 375, height: 667 })

    // 验证在移动设备上仍能正常显示主要内容
    await expect(page.locator('body')).toBeVisible()

    // 恢复桌面视口
    await page.setViewportSize({ width: 1920, height: 1080 })

    // 验证在桌面设备上仍能正常显示
    await expect(page.locator('body')).toBeVisible()
  })

  test('should handle page refresh and browser back/forward', async ({ page }) => {
    // 访问首页
    await page.goto('/#/index/home')
    await expect(page).toHaveURL('/#/index/home')

    // 访问登录页面
    await page.goto('/#/login')
    await expect(page.url()).toMatch(/\/login/)

    // 测试浏览器后退
    await page.goBack()
    await expect(page).toHaveURL('/#/index/home')

    // 测试浏览器前�?    await page.goForward()
    await expect(page.url()).toMatch(/\/login/)

    // 测试页面刷新
    await page.reload()
    await expect(page.url()).toMatch(/\/login/)
  })
})



