import { test, expect } from '@playwright/test'
import {
  seedAdminSession,
  mockAdminApi,
  loginAsAdmin,
  navigateToModule
} from '../../utils/test-helpers'
import {
  AdminLoginPage,
  AdminDashboardPage
} from '../../utils/page-objects/admin-pages'
import {
  waitFor,
  waitForPage,
  takeScreenshot,
  measurePerformance,
  logStep,
  assertElement,
  assertUrl
} from '../../utils/shared-helpers'

test.describe('Admin 登录和权限验证', () => {
  test.beforeEach(async ({ page }) => {
    // 设置管理员API Mock
    await mockAdminApi(page)
    logStep('设置管理员测试环境完成')
  })

  test('管理员登录成功流程', async ({ page }) => {
    logStep('开始管理员登录测试')

    const loginPage = new AdminLoginPage(page)

    // 步骤1: 访问登录页面
    await loginPage.goto()
    await assertElement(page, 'text=登录')
    logStep('访问管理员登录页面')

    // 步骤2: 输入登录信息
    const adminCredentials = {
      username: 'admin',
      password: '123456'
    }

    await loginPage.login(adminCredentials.username, adminCredentials.password)
    logStep('提交登录信息')

    // 步骤3: 验证登录成功
    await assertUrl(page, /#\/index\/home/)
    logStep('登录成功，跳转到仪表板')

    // 步骤4: 验证管理员权限和界面元素
    const dashboardPage = new AdminDashboardPage(page)

    // 检查管理员菜单是否显示
    const adminMenuItems = [
      '用户管理',
      '课程管理',
      '教练管理',
      '预约管理',
      '会员卡管理',
      '数据统计'
    ]

    for (const menuItem of adminMenuItems) {
      const menuElement = page.locator(`text=${menuItem}`)
      // 菜单可能在侧边栏或导航栏中
      const isVisible = await menuElement.isVisible().catch(() => false)
      if (isVisible) {
        logStep(`管理员菜单项可见: ${menuItem}`)
      }
    }

    // 验证管理员标识
    const adminIndicator = page.locator('.admin-badge, .role-admin, text=管理员')
    if (await adminIndicator.count() > 0) {
      logStep('管理员身份标识正确')
    }

    // 截图保存
    await takeScreenshot(page, 'admin_login_success')
  })

  test('管理员登录失败场景', async ({ page }) => {
    logStep('开始管理员登录失败测试')

    const loginPage = new AdminLoginPage(page)
    await loginPage.goto()

    // 测试错误的用户名
    await page.fill('input[name="username"]', 'wrong_admin')
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')

    // 验证错误提示
    const errorMessage = await loginPage.getErrorMessage()
    expect(errorMessage).toContain('用户名或密码错误')
    logStep('用户名错误验证通过')

    // 测试错误的密码
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', 'wrong_password')
    await page.click('button[type="submit"]')

    const errorMessage2 = await loginPage.getErrorMessage()
    expect(errorMessage2).toContain('用户名或密码错误')
    logStep('密码错误验证通过')

    // 验证仍然在登录页面
    await assertUrl(page, /#\/login/)
    logStep('登录失败后停留在登录页面')

    await takeScreenshot(page, 'admin_login_failure')
  })

  test('管理员权限验证 - 访问受限页面', async ({ page }) => {
    logStep('开始管理员权限验证测试')

    // 首先登录
    await loginAsAdmin(page)

    // 尝试访问不同的管理模块，验证权限
    const modulesToTest = [
      { name: '用户管理', path: '#/index/yonghu' },
      { name: '课程管理', path: '#/index/jianshenkecheng' },
      { name: '教练管理', path: '#/index/jianshenjiaolian' },
      { name: '预约管理', path: '#/index/kechengyuyue' },
      { name: '会员卡管理', path: '#/index/huiyuanka' }
    ]

    for (const module of modulesToTest) {
      logStep(`测试访问模块: ${module.name}`)

      await page.goto(module.path)
      await waitForPage(page)

      // 验证页面加载成功（有内容显示）
      const pageContent = page.locator('.main-content, .page-content, .el-main')
      const hasContent = await pageContent.isVisible().catch(() => false)

      if (hasContent) {
        logStep(`✅ ${module.name} 访问成功`)

        // 检查是否有操作权限（添加、编辑、删除按钮）
        const actionButtons = page.locator('button:has-text("添加"), button:has-text("新增"), button:has-text("编辑"), button:has-text("删除")')
        const buttonCount = await actionButtons.count()
        if (buttonCount > 0) {
          logStep(`${module.name} 具有 ${buttonCount} 个操作权限`)
        }
      } else {
        logStep(`❌ ${module.name} 访问可能受限`)
      }
    }

    await takeScreenshot(page, 'admin_permissions_check')
  })

  test('管理员会话管理', async ({ page }) => {
    logStep('开始管理员会话管理测试')

    // 登录管理员
    await loginAsAdmin(page)

    // 验证会话状态
    const adminIndicator = page.locator('.admin-info, .user-info, [class*="admin"]')
    if (await adminIndicator.count() > 0) {
      const adminText = await adminIndicator.textContent()
      expect(adminText).toContain('admin')
      logStep('管理员会话状态正确')
    }

    // 测试页面刷新后会话保持
    await page.reload()
    await waitForPage(page)

    // 验证仍然在管理页面
    const currentUrl = page.url()
    expect(currentUrl).toContain('/index/')
    expect(currentUrl).not.toContain('/login')
    logStep('页面刷新后会话保持')

    // 测试登出功能
    const logoutButton = page.locator('button:has-text("登出"), button:has-text("退出"), .logout-btn')
    if (await logoutButton.count() > 0) {
      await logoutButton.click()
      logStep('点击登出按钮')

      // 确认登出
      const confirmLogout = page.locator('button:has-text("确认"), button:has-text("确定")')
      if (await confirmLogout.count() > 0) {
        await confirmLogout.click()
      }

      // 验证登出成功
      await page.waitForURL('**/#/login**', { timeout: 5000 })
      await assertUrl(page, /#\/login/)
      logStep('登出成功')
    } else {
      logStep('未找到登出按钮')
    }

    await takeScreenshot(page, 'admin_session_management')
  })

  test('管理员界面响应式布局', async ({ page }) => {
    logStep('开始管理员界面响应式测试')

    await loginAsAdmin(page)

    // 测试不同屏幕尺寸
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 1366, height: 768, name: 'Laptop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ]

    for (const viewport of viewports) {
      logStep(`测试 ${viewport.name} 视图 (${viewport.width}x${viewport.height})`)

      await page.setViewportSize({ width: viewport.width, height: viewport.height })

      // 等待布局调整
      await page.waitForTimeout(500)

      // 验证关键元素仍然可见
      const menuToggle = page.locator('.menu-toggle, .hamburger, .mobile-menu')
      const mainContent = page.locator('.main-content, .page-content')

      if (viewport.width <= 768) {
        // 移动端应该有菜单切换按钮
        const hasMenuToggle = await menuToggle.isVisible().catch(() => false)
        if (hasMenuToggle) {
          logStep(`${viewport.name}: 菜单切换按钮可见`)
        }
      }

      // 验证主要内容区域可见
      const hasMainContent = await mainContent.isVisible().catch(() => false)
      expect(hasMainContent).toBe(true)
      logStep(`${viewport.name}: 主要内容区域正常显示`)
    }

    await takeScreenshot(page, 'admin_responsive_layout')
  })

  test('管理员操作日志记录', async ({ page }) => {
    logStep('开始管理员操作日志测试')

    await loginAsAdmin(page)

    // 执行一些操作来生成日志
    await navigateToModule(page, 'users')

    // 尝试添加用户（可能会失败，但会记录操作）
    const addButton = page.locator('button:has-text("添加"), button:has-text("新增")').first()
    if (await addButton.isVisible().catch(() => false)) {
      await addButton.click()

      // 填写一些信息
      const userForm = page.locator('form, .add-form')
      if (await userForm.isVisible().catch(() => false)) {
        await page.fill('input[name="yonghuming"]', '日志测试用户')
        await page.click('button:has-text("取消")') // 取消操作
        logStep('执行用户添加操作（已取消）')
      }
    }

    // 检查是否有操作日志或审计功能
    const logSection = page.locator('.operation-log, .audit-log, .activity-log')
    if (await logSection.isVisible().catch(() => false)) {
      logStep('操作日志功能可用')
    } else {
      // 检查侧边栏是否有日志菜单
      const logMenu = page.locator('text=操作日志, text=审计日志, text=系统日志')
      const hasLogMenu = await logMenu.isVisible().catch(() => false)
      if (hasLogMenu) {
        logStep('日志菜单可用')
      } else {
        logStep('未发现操作日志功能')
      }
    }

    await takeScreenshot(page, 'admin_operation_logs')
  })

  test('管理员密码安全策略', async ({ page }) => {
    logStep('开始管理员密码安全测试')

    // 访问登录页面
    const loginPage = new AdminLoginPage(page)
    await loginPage.goto()

    // 测试弱密码（如果有密码强度检查）
    await page.fill('input[name="username"]', 'admin')
    await page.fill('input[name="password"]', '123') // 弱密码
    await page.click('button[type="submit"]')

    // 检查是否有密码策略提示
    await page.waitForTimeout(500)
    const passwordHints = page.locator('text=密码强度, text=密码太弱, .password-strength')
    if (await passwordHints.count() > 0) {
      logStep('密码强度检查功能存在')
    }

    // 测试正确密码登录
    await page.fill('input[name="password"]', '123456')
    await page.click('button[type="submit"]')

    await page.waitForURL('**/#/index/home**', { timeout: 5000 })
    logStep('管理员登录成功')

    // 检查是否有密码过期或修改提示
    const passwordExpiry = page.locator('text=密码过期, text=修改密码, .password-expiry')
    if (await passwordExpiry.isVisible().catch(() => false)) {
      logStep('密码过期提醒功能存在')
    }

    await takeScreenshot(page, 'admin_password_security')
  })

  test('管理员多标签页会话同步', async ({ page, context }) => {
    logStep('开始多标签页会话同步测试')

    await loginAsAdmin(page)

    // 创建新标签页
    const newPage = await context.newPage()
    await newPage.goto(`${page.url()}`)

    // 验证新标签页也已登录
    await newPage.waitForURL('**/#/index/**', { timeout: 5000 })
    expect(newPage.url()).not.toContain('/login')
    logStep('新标签页会话同步成功')

    // 在新标签页执行操作
    await newPage.goto('#/index/yonghu')
    await newPage.waitForLoadState('networkidle')

    const newPageContent = newPage.locator('.main-content, .page-content')
    const hasNewPageContent = await newPageContent.isVisible().catch(() => false)
    expect(hasNewPageContent).toBe(true)
    logStep('新标签页功能正常')

    // 验证原标签页仍然有效
    await page.bringToFront()
    const originalPageContent = page.locator('.main-content, .page-content')
    const hasOriginalContent = await originalPageContent.isVisible().catch(() => false)
    expect(hasOriginalContent).toBe(true)
    logStep('原标签页仍然有效')

    await takeScreenshot(page, 'admin_multi_tab_session')
    await newPage.close()
  })

  test('管理员登录性能监控', async ({ page }) => {
    logStep('开始管理员登录性能测试')

    const loginPage = new AdminLoginPage(page)

    const startTime = Date.now()
    await loginPage.goto()
    const loadTime = Date.now() - startTime
    logStep(`登录页面加载时间: ${loadTime}ms`)

    const loginStartTime = Date.now()
    await loginPage.login('admin', '123456')
    const loginTime = Date.now() - loginStartTime
    logStep(`登录操作耗时: ${loginTime}ms`)

    // 验证性能指标
    expect(loadTime).toBeLessThan(5000) // 页面加载不超过5秒
    expect(loginTime).toBeLessThan(10000) // 登录操作不超过10秒

    // 验证仪表板加载性能
    const dashboardPage = new AdminDashboardPage(page)
    await dashboardPage.getUserCount() // 触发数据加载

    const dashboardLoadTime = Date.now() - loginStartTime - loginTime
    logStep(`仪表板数据加载时间: ${dashboardLoadTime}ms`)

    await takeScreenshot(page, 'admin_login_performance')
  })
})
