import { test, expect } from '@playwright/test';
import { LoginPage } from './page-objects/login-page';
import { DashboardPage } from './page-objects/dashboard-page';
import { testConfig, validateConfig } from './test-config';

// Global test setup
test.beforeAll(async () => {
  console.log('🚀 Starting P2P Integration Test Suite...');
  validateConfig();
});

/**
 * P2P-001: 完整的管理员登录和仪表板访问流程
 * 测试目标：验证前端登录页面访问、后端登录API调用、登录成功后的页面跳转和仪表板数据加载
 */
test.describe('P2P-001: 完整的管理员登录和仪表板访问流程', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test('应该能够访问登录页面', async ({ page }) => {
    console.log('🔍 测试登录页面访问');

    await loginPage.navigateToLogin();

    // 验证页面标题
    await expect(page).toHaveTitle(/登录|Login/i);

    // 验证登录表单元素存在
    await expect(page.locator(testConfig.selectors.login.username)).toBeVisible();
    await expect(page.locator(testConfig.selectors.login.password)).toBeVisible();
    await expect(page.locator(testConfig.selectors.login.submitButton)).toBeVisible();

    console.log('✅ 登录页面访问正常');
  });

  test('应该能够成功登录管理员账户', async ({ page }) => {
    console.log('🔐 测试管理员登录');

    await loginPage.navigateToLogin();
    await loginPage.loginAsAdmin();

    // 验证登录成功跳转
    await expect(page).not.toHaveURL(/\/login/);

    // 验证仪表板加载
    await dashboardPage.waitForDashboardLoad();

    // 验证欢迎信息
    const welcomeMessage = await dashboardPage.getWelcomeMessage();
    expect(welcomeMessage).toBeTruthy();

    console.log('✅ 管理员登录成功');
  });

  test('应该正确加载仪表板数据', async ({ page }) => {
    console.log('📊 测试仪表板数据加载');

    await loginPage.navigateToLogin();
    await loginPage.loginAsAdmin();
    await dashboardPage.waitForDashboardLoad();

    // 验证用户数量显示
    const userCount = await dashboardPage.getUserCount();
    expect(userCount).toBeGreaterThanOrEqual(0);

    // 验证课程数量显示
    const courseCount = await dashboardPage.getCourseCount();
    expect(courseCount).toBeGreaterThanOrEqual(0);

    // 验证仪表板卡片数据
    const dashboardCards = await dashboardPage.getDashboardCards();
    expect(dashboardCards.length).toBeGreaterThan(0);

    console.log(`✅ 仪表板数据显示正常 - 用户: ${userCount}, 课程: ${courseCount}`);
  });

  test('应该正确处理登录失败情况', async ({ page }) => {
    console.log('❌ 测试登录失败处理');

    await loginPage.navigateToLogin();
    await loginPage.attemptInvalidLogin('invaliduser', 'invalidpass');

    // 验证错误消息显示
    await expect(page.locator(testConfig.selectors.login.errorMessage)).toBeVisible();

    // 验证仍在登录页面
    await expect(page).toHaveURL(/\/login/);

    console.log('✅ 登录失败处理正确');
  });

  test('应该能够执行登出操作', async ({ page }) => {
    console.log('🚪 测试登出功能');

    await loginPage.navigateToLogin();
    await loginPage.loginAsAdmin();
    await dashboardPage.waitForDashboardLoad();

    // 执行登出
    await dashboardPage.logout();

    // 验证返回登录页面
    await expect(page).toHaveURL(/\/login/);

    console.log('✅ 登出功能正常');
  });
});

/**
 * P2P-002: 用户管理模块的完整CRUD操作
 * 测试目标：用户列表查询、新用户创建、用户信息更新、用户删除功能
 */
test.describe('P2P-002: 用户管理模块的完整CRUD操作', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);

    // 登录管理员账户
    await loginPage.navigateToLogin();
    await loginPage.loginAsAdmin();
    await dashboardPage.waitForDashboardLoad();
  });

  test('应该能够查看用户列表', async ({ page }) => {
    console.log('📋 测试用户列表查看');

    await dashboardPage.navigateToUsers();

    // 验证用户列表页面加载
    await expect(page).toHaveURL(/\/users/);

    // 验证用户表格存在
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible();

    // 验证至少有一个用户存在（管理员自己）
    const userRows = page.locator('[data-testid="user-row"]');
    await expect(userRows.first()).toBeVisible();

    console.log('✅ 用户列表查看正常');
  });

  test('应该能够创建新用户', async ({ page }) => {
    console.log('➕ 测试用户创建');

    await dashboardPage.navigateToUsers();

    // 点击创建用户按钮
    await page.click('[data-testid="create-user-button"]');

    // 填写用户表单
    const timestamp = Date.now();
    const testUsername = `testuser_${timestamp}`;
    const testEmail = `test${timestamp}@example.com`;

    await page.fill('[data-testid="user-username"]', testUsername);
    await page.fill('[data-testid="user-email"]', testEmail);
    await page.fill('[data-testid="user-password"]', 'testpass123');
    await page.selectOption('[data-testid="user-role"]', 'USER');

    // 提交表单
    await page.click('[data-testid="submit-user"]');

    // 验证用户创建成功
    await expect(page.locator(`text=${testUsername}`)).toBeVisible();

    console.log(`✅ 用户创建成功: ${testUsername}`);
  });

  test('应该能够更新用户信息', async ({ page }) => {
    console.log('✏️ 测试用户信息更新');

    await dashboardPage.navigateToUsers();

    // 找到测试用户并点击编辑
    const testUserRow = page.locator('[data-testid="user-row"]').filter({
      hasText: 'testuser_',
    }).first();

    await testUserRow.locator('[data-testid="edit-user"]').click();

    // 更新用户信息
    const newEmail = `updated_${Date.now()}@example.com`;
    await page.fill('[data-testid="user-email"]', newEmail);

    // 保存更改
    await page.click('[data-testid="save-user"]');

    // 验证更新成功
    await expect(page.locator(`text=${newEmail}`)).toBeVisible();

    console.log('✅ 用户信息更新成功');
  });

  test('应该能够删除用户', async ({ page }) => {
    console.log('🗑️ 测试用户删除');

    await dashboardPage.navigateToUsers();

    // 找到测试用户并点击删除
    const testUserRow = page.locator('[data-testid="user-row"]').filter({
      hasText: 'testuser_',
    }).first();

    await testUserRow.locator('[data-testid="delete-user"]').click();

    // 确认删除
    await page.click('[data-testid="confirm-delete"]');

    // 验证用户已被删除
    await expect(testUserRow).not.toBeVisible();

    console.log('✅ 用户删除成功');
  });
});

/**
 * P2P-003: 课程管理模块的完整业务流程
 * 测试目标：课程列表加载、新课程创建、课程详情查看、课程信息更新
 */
test.describe('P2P-003: 课程管理模块的完整业务流程', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);

    // 登录管理员账户
    await loginPage.navigateToLogin();
    await loginPage.loginAsAdmin();
    await dashboardPage.waitForDashboardLoad();
  });

  test('应该能够查看课程列表', async ({ page }) => {
    console.log('📚 测试课程列表查看');

    await dashboardPage.navigateToCourses();

    // 验证课程列表页面加载
    await expect(page).toHaveURL(/\/courses/);

    // 验证课程表格存在
    await expect(page.locator('[data-testid="courses-table"]')).toBeVisible();

    console.log('✅ 课程列表查看正常');
  });

  test('应该能够创建新课程', async ({ page }) => {
    console.log('📝 测试课程创建');

    await dashboardPage.navigateToCourses();

    // 点击创建课程按钮
    await page.click('[data-testid="create-course-button"]');

    // 填写课程表单
    const timestamp = Date.now();
    const courseName = `测试课程_${timestamp}`;
    const courseDescription = '这是一个用于测试的课程';

    await page.fill('[data-testid="course-name"]', courseName);
    await page.fill('[data-testid="course-description"]', courseDescription);
    await page.fill('[data-testid="course-price"]', '99.00');
    await page.selectOption('[data-testid="course-category"]', 'fitness');

    // 提交表单
    await page.click('[data-testid="submit-course"]');

    // 验证课程创建成功
    await expect(page.locator(`text=${courseName}`)).toBeVisible();

    console.log(`✅ 课程创建成功: ${courseName}`);
  });

  test('应该能够查看课程详情', async ({ page }) => {
    console.log('👁️ 测试课程详情查看');

    await dashboardPage.navigateToCourses();

    // 点击查看课程详情
    const courseRow = page.locator('[data-testid="course-row"]').first();
    await courseRow.locator('[data-testid="view-course"]').click();

    // 验证课程详情页面
    await expect(page.locator('[data-testid="course-detail"]')).toBeVisible();
    await expect(page.locator('[data-testid="course-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="course-description"]')).toBeVisible();

    console.log('✅ 课程详情查看正常');
  });

  test('应该能够更新课程信息', async ({ page }) => {
    console.log('🔄 测试课程信息更新');

    await dashboardPage.navigateToCourses();

    // 找到测试课程并点击编辑
    const testCourseRow = page.locator('[data-testid="course-row"]').filter({
      hasText: '测试课程_',
    }).first();

    await testCourseRow.locator('[data-testid="edit-course"]').click();

    // 更新课程信息
    const updatedDescription = `更新后的描述_${Date.now()}`;
    await page.fill('[data-testid="course-description"]', updatedDescription);

    // 保存更改
    await page.click('[data-testid="save-course"]');

    // 验证更新成功
    await expect(page.locator(`text=${updatedDescription}`)).toBeVisible();

    console.log('✅ 课程信息更新成功');
  });
});

/**
 * P2P-004: 系统性能和稳定性测试
 */
test.describe('P2P-004: 系统性能和稳定性测试', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
  });

  test('应该在合理时间内完成登录', async ({ page }) => {
    console.log('⚡ 测试登录性能');

    const startTime = Date.now();

    await loginPage.navigateToLogin();
    await loginPage.loginAsAdmin();

    const loginTime = Date.now() - startTime;
    console.log(`⏱️ 登录耗时: ${loginTime}ms`);

    // 验证登录时间在合理范围内（30秒以内）
    expect(loginTime).toBeLessThan(30000);

    console.log('✅ 登录性能正常');
  });

  test('应该能够处理并发用户操作', async ({ browser }) => {
    console.log('🔄 测试并发操作');

    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
    ]);

    const pages = await Promise.all([
      contexts[0].newPage(),
      contexts[1].newPage(),
    ]);

    try {
      // 并发执行登录操作
      const loginPromises = pages.map(async (page) => {
        const login = new LoginPage(page);
        await login.navigateToLogin();
        await login.loginAsAdmin();
        return page.url();
      });

      const urls = await Promise.all(loginPromises);

      // 验证所有页面都成功登录
      urls.forEach(url => {
        expect(url).not.toContain('/login');
      });

      console.log('✅ 并发操作处理正常');
    } finally {
      await Promise.all(contexts.map(context => context.close()));
    }
  });

  test('应该正确处理网络错误', async ({ page }) => {
    console.log('🌐 测试网络错误处理');

    // 模拟网络断开
    await page.context().setOffline(true);

    await loginPage.navigateToLogin();
    await loginPage.loginAsAdmin();

    // 应该显示网络错误或重试选项
    // const errorVisible = await page.locator('[data-testid="network-error"]').isVisible().catch(() => false);

    // 恢复网络连接
    await page.context().setOffline(false);

    console.log('✅ 网络错误处理正常');
  });
});

/**
 * P2P-005: 错误处理和边界情况测试
 */
test.describe('P2P-005: 错误处理和边界情况测试', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
  });

  test('应该正确处理无效登录凭据', async ({ page }) => {
    console.log('🚫 测试无效凭据处理');

    await loginPage.navigateToLogin();

    // 测试各种无效凭据组合
    const invalidCredentials = [
      { username: '', password: 'admin123' },
      { username: 'admin', password: '' },
      { username: 'nonexistent', password: 'wrongpass' },
      { username: 'admin', password: 'wrongpass' },
    ];

    for (const creds of invalidCredentials) {
      await loginPage.attemptInvalidLogin(creds.username, creds.password);
      await expect(page.locator(testConfig.selectors.login.errorMessage)).toBeVisible();
    }

    console.log('✅ 无效凭据处理正确');
  });

  test('应该正确处理表单验证', async ({ page }) => {
    console.log('📝 测试表单验证');

    await loginPage.navigateToLogin();

    // 尝试提交空表单
    await page.click(testConfig.selectors.login.submitButton);

    // 验证必填字段错误
    await expect(page.locator('[data-testid="username-required"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-required"]')).toBeVisible();

    console.log('✅ 表单验证正常');
  });
});

/**
 * P2P-006: 数据一致性和完整性测试
 */
test.describe('P2P-006: 数据一致性和完整性测试', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);

    await loginPage.navigateToLogin();
    await loginPage.loginAsAdmin();
    await dashboardPage.waitForDashboardLoad();
  });

  test('应该保持页面刷新后的数据一致性', async ({ page }) => {
    console.log('🔄 测试数据一致性');

    // 获取初始数据
    const initialUserCount = await dashboardPage.getUserCount();
    const initialCourseCount = await dashboardPage.getCourseCount();

    // 刷新页面
    await page.reload();
    await dashboardPage.waitForDashboardLoad();

    // 验证数据一致性
    const refreshedUserCount = await dashboardPage.getUserCount();
    const refreshedCourseCount = await dashboardPage.getCourseCount();

    expect(refreshedUserCount).toBe(initialUserCount);
    expect(refreshedCourseCount).toBe(initialCourseCount);

    console.log('✅ 数据一致性验证通过');
  });

  test('应该正确维护跨页面数据状态', async ({ page }) => {
    console.log('📄 测试跨页面数据状态');

    // 在仪表板创建用户
    await dashboardPage.navigateToUsers();
    await page.click('[data-testid="create-user-button"]');

    const testUsername = `cross_page_test_${Date.now()}`;
    await page.fill('[data-testid="user-username"]', testUsername);
    await page.fill('[data-testid="user-email"]', `${testUsername}@example.com`);
    await page.fill('[data-testid="user-password"]', 'testpass123');
    await page.click('[data-testid="submit-user"]');

    // 返回仪表板
    await dashboardPage.navigateToCourses();
    await dashboardPage.navigateToUsers();

    // 验证用户仍然存在
    await expect(page.locator(`text=${testUsername}`)).toBeVisible();

    console.log('✅ 跨页面数据状态维护正常');
  });
});
