import { test, expect } from '@playwright/test'
import { setupTestEnvironment, logTestStep, takeScreenshotWithTimestamp } from '../utils/shared-helpers'
import { FrontHomePage, FrontLoginPage, FrontRegisterPage } from '../../utils/page-objects/front-pages'
import { CourseListPage, CourseDetailPage, CourseBookingPage } from '../../utils/page-objects/course-page'
import { MembershipPage } from '../../utils/page-objects/membership-page'
import { UserCenterPage } from '../../utils/page-objects/user-center-page'

test.describe('完整用户游程测试 - 从注册到业务操作', () => {
  let testUser: {
    username: string
    password: string
    phone: string
    name: string
  }

  test.beforeEach(async ({ page }) => {
    // 设置完整的测试环�?    await setupTestEnvironment(page)

    // 生成唯一的测试用户数�?    const timestamp = Date.now()
    const randomNum = Math.floor(Math.random() * 1000)
    testUser = {
      username: `journey_user_${timestamp}_${randomNum}`,
      password: 'TestPass123!',
      phone: `13800${randomNum.toString().padStart(6, '1').slice(0, 6)}`,
      name: `测试用户${randomNum}`
    }

    logTestStep('设置完整用户游程测试环境')
  })

  test('完整用户注册登录游程', async ({ page }) => {
    logTestStep('开始完整用户注册登录游�?)

    // === 阶段1: 用户注册 ===

    // 步骤1: 访问登录页面
    const loginPage = new FrontLoginPage(page)
    await loginPage.goto()
    await loginPage.expectScaffold()
    logTestStep('访问登录页面')

    // 步骤2: 导航到注册页�?    const registerLink = page.locator('a:has-text("注册"), a:has-text("立即注册"), text=注册').first()
    await expect(registerLink).toBeVisible()
    await registerLink.click()

    // 验证跳转到注册页�?    await expect(page).toHaveURL(/.*\/register/)
    logTestStep('导航到注册页�?)

    // 步骤3: 填写注册信息
    const registerPage = new FrontRegisterPage(page)
    await registerPage.fillRegistrationForm({
      username: testUser.username,
      password: testUser.password,
      confirmPassword: testUser.password,
      phone: testUser.phone,
      name: testUser.name,
      gender: '�?
    })
    await registerPage.agreeToTerms()
    logTestStep('填写注册信息')

    // 步骤4: 提交注册
    await registerPage.submitRegistration()

    // 验证注册成功并跳转到登录页面
    await page.waitForURL('**/login**', { timeout: 10000 })
    await expect(page).toHaveURL(/.*\/login/)

    // 检查成功消�?    const successMessage = page.locator('text=注册成功, .success-message')
    if (await successMessage.count() > 0) {
      logTestStep('注册成功提示显示')
    }
    logTestStep('注册完成，跳转到登录页面')

    // === 阶段2: 用户登录 ===

    // 步骤5: 填写登录信息
    await loginPage.login(testUser.username, testUser.password)

    // 验证登录成功
    await page.waitForURL('**/index/home**', { timeout: 15000 })
    await expect(page).toHaveURL(/.*\/index\/home/)
    logTestStep('登录成功，进入首�?)

    // 验证用户状态显�?    const userInfo = page.locator('.user-info, .user-name, .navbar .user')
    if (await userInfo.count() > 0) {
      const userText = await userInfo.textContent()
      expect(userText).toMatch(new RegExp(testUser.username, 'i'))
      logTestStep('用户信息正确显示')
    }

    // === 阶段3: 浏览首页 ===

    // 步骤6: 浏览首页内容
    const homePage = new FrontHomePage(page)
    await homePage.expectHero()

    // 检查热门课程展�?    const hotCourses = page.locator('.hot-courses, .course-list, text=HOT COURSES')
    if (await hotCourses.count() > 0) {
      logTestStep('热门课程区域正确显示')
    }

    // 检查推荐内�?    const recommendations = page.locator('.recommendations, .featured, .banners')
    if (await recommendations.count() > 0) {
      logTestStep('推荐内容区域正确显示')
    }

    logTestStep('首页浏览完成')

    await takeScreenshotWithTimestamp(page, 'complete_registration_login_journey')
  })

  test('完整课程预约游程', async ({ page }) => {
    logTestStep('开始完整课程预约游�?)

    // === 前提: 用户已登�?===

    // 使用已注册用户登�?    const loginPage = new FrontLoginPage(page)
    await loginPage.goto()
    await loginPage.login('testuser', '123456')

    await page.waitForURL('**/index/home**', { timeout: 10000 })
    logTestStep('用户登录完成')

    // === 阶段1: 浏览课程列表 ===

    // 步骤1: 访问课程列表页面
    const courseListPage = new CourseListPage(page)
    await courseListPage.goto()
    await courseListPage.expectLoaded()

    const courseCount = await courseListPage.getCourseCount()
    expect(courseCount).toBeGreaterThan(0)
    logTestStep(`课程列表加载完成，共 ${courseCount} 个课程`)

    // === 阶段2: 查看课程详情 ===

    // 步骤2: 点击第一个课程查看详�?    await courseListPage.clickCourseCard(0)

    const courseDetailPage = new CourseDetailPage(page)
    await courseDetailPage.expectLoaded()

    // 获取课程信息
    const courseTitle = await courseDetailPage.getCourseTitle()
    const coursePrice = await courseDetailPage.getCoursePrice()

    expect(courseTitle).toBeTruthy()
    expect(coursePrice).toBeTruthy()
    logTestStep(`查看课程详情: ${courseTitle} - 价格: ${coursePrice}`)

    // === 阶段3: 预约课程 ===

    // 步骤3: 点击预约按钮
    await courseDetailPage.clickBookButton()

    const bookingPage = new CourseBookingPage(page)
    await bookingPage.expectLoaded()
    logTestStep('进入课程预约页面')

    // 步骤4: 选择预约时间（避免冲突时间）
    await bookingPage.selectTimeSlot('14:00-15:00')

    // 步骤5: 填写预约信息
    await bookingPage.fillBookingForm({
      name: testUser.name,
      phone: testUser.phone,
      notes: '通过完整游程测试预约课程'
    })

    // 步骤6: 提交预约
    await bookingPage.submitBooking()

    // 验证预约成功
    await page.waitForSelector('text=预约成功, text=提交成功, .success-message', { timeout: 5000 })
    logTestStep('课程预约成功')

    // === 阶段4: 验证预约状�?===

    // 步骤7: 返回课程列表或个人中心验证预�?    await page.goto('/#/center')
    await page.waitForLoadState('networkidle')

    // 检查预约记�?    const bookingRecords = page.locator('text=已预�? .booking-record, .my-bookings')
    if (await bookingRecords.count() > 0) {
      logTestStep('预约记录在个人中心正确显�?)
    }

    await takeScreenshotWithTimestamp(page, 'complete_course_booking_journey')
  })

  test('完整会员购买游程', async ({ page }) => {
    logTestStep('开始完整会员购买游�?)

    // === 前提: 用户已登�?===

    const loginPage = new FrontLoginPage(page)
    await loginPage.goto()
    await loginPage.login('testuser', '123456')
    await page.waitForURL('**/index/home**', { timeout: 10000 })

    // === 阶段1: 浏览会员�?===

    // 步骤1: 访问会员页面
    const membershipPage = new MembershipPage(page)
    await membershipPage.goto()
    await membershipPage.expectLoaded()

    const cardCount = await membershipPage.getCardCount()
    expect(cardCount).toBeGreaterThan(0)
    logTestStep(`会员卡列表加载完成，�?${cardCount} 个会员卡`)

    // === 阶段2: 选择会员�?===

    // 步骤2: 选择季卡（中等价格选项�?    await membershipPage.selectCard(1) // 索引1通常是季�?
    const cardName = await membershipPage.getSelectedCardName()
    const cardPrice = await membershipPage.getSelectedCardPrice()

    expect(cardName).toBeTruthy()
    expect(cardPrice).toBeTruthy()
    logTestStep(`选择会员�? ${cardName} - 价格: ${cardPrice}`)

    // === 阶段3: 购买会员�?===

    // 步骤3: 点击购买按钮
    await membershipPage.clickPurchaseButton()

    // 步骤4: 填写购买信息
    await membershipPage.fillPurchaseForm({
      name: testUser.name,
      phone: testUser.phone,
      email: `${testUser.username}@example.com`
    })

    // 步骤5: 提交购买
    await membershipPage.submitPurchase()

    // 验证购买成功
    await page.waitForSelector('text=购买成功, text=订单创建成功, .success-message', { timeout: 5000 })
    logTestStep('会员卡购买成�?)

    // === 阶段4: 验证会员状�?===

    // 步骤6: 检查会员状态更�?    await page.goto('/#/center')
    await page.waitForLoadState('networkidle')

    const membershipStatus = page.locator('text=会员, text=VIP, .membership-status, .vip-badge')
    if (await membershipStatus.count() > 0) {
      logTestStep('会员状态正确更�?)
    }

    await takeScreenshotWithTimestamp(page, 'complete_membership_purchase_journey')
  })

  test('跨模块业务流�?- 会员购买后预约课�?, async ({ page }) => {
    logTestStep('开始跨模块业务流程测试')

    // === 前提: 用户已登�?===

    const loginPage = new FrontLoginPage(page)
    await loginPage.goto()
    await loginPage.login('testuser', '123456')
    await page.waitForURL('**/index/home**', { timeout: 10000 })

    // === 阶段1: 购买会员�?===

    // 快速购买月�?    const membershipPage = new MembershipPage(page)
    await membershipPage.goto()
    await membershipPage.selectCard(0) // 月卡
    await membershipPage.clickPurchaseButton()
    await membershipPage.fillPurchaseForm({
      name: testUser.name,
      phone: testUser.phone,
      email: `${testUser.username}@example.com`
    })
    await membershipPage.submitPurchase()

    await page.waitForSelector('text=购买成功, .success-message', { timeout: 5000 })
    logTestStep('会员卡购买完�?)

    // === 阶段2: 使用会员折扣预约课程 ===

    // 访问课程列表
    const courseListPage = new CourseListPage(page)
    await courseListPage.goto()
    await courseListPage.clickCourseCard(0)

    // 查看是否有会员折扣显�?    const discountBadge = page.locator('text=会员折扣, text=会员�? .discount, .vip-price')
    if (await discountBadge.count() > 0) {
      logTestStep('会员折扣正确显示')
    }

    // 预约课程
    const courseDetailPage = new CourseDetailPage(page)
    await courseDetailPage.clickBookButton()

    const bookingPage = new CourseBookingPage(page)
    await bookingPage.selectTimeSlot('16:00-17:00')
    await bookingPage.fillBookingForm({
      name: testUser.name,
      phone: testUser.phone,
      notes: '会员用户预约课程测试'
    })
    await bookingPage.submitBooking()

    await page.waitForSelector('text=预约成功', { timeout: 5000 })
    logTestStep('会员用户成功预约课程')

    // === 阶段3: 验证完整流程 ===

    // 检查个人中心的所有状�?    await page.goto('/#/center')
    await page.waitForLoadState('networkidle')

    const userCenterPage = new UserCenterPage(page)

    // 验证会员状�?    const hasMembership = await userCenterPage.hasMembershipStatus()
    expect(hasMembership).toBe(true)

    // 验证预约记录
    const bookingCount = await userCenterPage.getBookingCount()
    expect(bookingCount).toBeGreaterThan(0)

    logTestStep('跨模块业务流程验证完�?)
    await takeScreenshotWithTimestamp(page, 'cross_module_business_flow')
  })

  test('数据一致性验证游�?, async ({ page }) => {
    logTestStep('开始数据一致性验证游�?)

    // === 前提: 用户已登录并有数�?===

    const loginPage = new FrontLoginPage(page)
    await loginPage.goto()
    await loginPage.login('testuser', '123456')
    await page.waitForURL('**/index/home**', { timeout: 10000 })

    // === 阶段1: 创建预约数据 ===

    // 创建一个课程预�?    const courseListPage = new CourseListPage(page)
    await courseListPage.goto()
    await courseListPage.clickCourseCard(0)

    const courseDetailPage = new CourseDetailPage(page)
    const courseTitle = await courseDetailPage.getCourseTitle()
    await courseDetailPage.clickBookButton()

    const bookingPage = new CourseBookingPage(page)
    await bookingPage.selectTimeSlot('10:00-11:00')
    await bookingPage.fillBookingForm({
      name: '一致性测试用�?,
      phone: '13800123456',
      notes: '数据一致性验证测�?
    })
    await bookingPage.submitBooking()

    await page.waitForSelector('text=预约成功', { timeout: 5000 })
    logTestStep('创建预约数据完成')

    // === 阶段2: 跨页面数据验�?===

    // 访问个人中心验证数据
    await page.goto('/#/center')
    await page.waitForLoadState('networkidle')

    const userCenterPage = new UserCenterPage(page)

    // 验证预约信息一致�?    const bookings = await userCenterPage.getBookingList()
    expect(bookings.length).toBeGreaterThan(0)

    // 检查最新预约是否包含正确的课程信息
    const latestBooking = bookings[0]
    expect(latestBooking.courseName).toContain(courseTitle.split(' ')[0]) // 部分匹配
    expect(latestBooking.status).toMatch(/预约|确认/)

    logTestStep('预约数据在个人中心正确显�?)

    // === 阶段3: 页面刷新后数据持久�?===

    // 刷新页面
    await page.reload()
    await page.waitForLoadState('networkidle')

    // 重新验证数据
    const refreshedBookings = await userCenterPage.getBookingList()
    expect(refreshedBookings.length).toBe(bookings.length)
    expect(refreshedBookings[0].courseName).toBe(latestBooking.courseName)

    logTestStep('页面刷新后数据保持一�?)

    // === 阶段4: 多标签页数据同步 ===

    // 打开新标签页访问同一数据
    const newPage = await page.context().newPage()
    await newPage.goto(page.url())
    await setupTestEnvironment(newPage) // 设置相同的测试环�?
    // 在新标签页中验证数据一致�?    const newPageBookings = await userCenterPage.getBookingListFromPage(newPage)
    expect(newPageBookings.length).toBe(bookings.length)

    await newPage.close()
    logTestStep('多标签页数据保持同步')

    await takeScreenshotWithTimestamp(page, 'data_consistency_validation')
  })

  test('性能监控游程', async ({ page }) => {
    logTestStep('开始性能监控游程')

    // === 阶段1: 页面加载性能 ===

    const startTime = Date.now()

    // 访问首页
    await page.goto('/#/index/home')
    await page.waitForLoadState('domcontentloaded')

    const domContentLoaded = Date.now() - startTime
    logTestStep(`首页DOM加载时间: ${domContentLoaded}ms`)

    await page.waitForLoadState('networkidle')
    const fullyLoaded = Date.now() - startTime
    logTestStep(`首页完全加载时间: ${fullyLoaded}ms`)

    // 验证性能指标
    expect(domContentLoaded).toBeLessThan(3000) // DOM加载应小�?�?    expect(fullyLoaded).toBeLessThan(5000) // 完全加载应小�?�?
    // === 阶段2: 操作响应性能 ===

    // 测试登录操作性能
    const loginStart = Date.now()

    const loginPage = new FrontLoginPage(page)
    await loginPage.goto()
    await loginPage.login('testuser', '123456')

    await page.waitForURL('**/index/home**', { timeout: 10000 })
    const loginTime = Date.now() - loginStart
    logTestStep(`登录操作耗时: ${loginTime}ms`)

    expect(loginTime).toBeLessThan(8000) // 登录应小�?�?
    // === 阶段3: 业务操作性能 ===

    // 测试课程预约性能
    const bookingStart = Date.now()

    const courseListPage = new CourseListPage(page)
    await courseListPage.goto()
    await courseListPage.clickCourseCard(0)

    const courseDetailPage = new CourseDetailPage(page)
    await courseDetailPage.clickBookButton()

    const bookingPage = new CourseBookingPage(page)
    await bookingPage.selectTimeSlot('18:00-19:00')
    await bookingPage.fillBookingForm({
      name: '性能测试用户',
      phone: '13800987654',
      notes: '性能监控测试'
    })
    await bookingPage.submitBooking()

    await page.waitForSelector('text=预约成功', { timeout: 5000 })
    const bookingTime = Date.now() - bookingStart
    logTestStep(`完整预约流程耗时: ${bookingTime}ms`)

    expect(bookingTime).toBeLessThan(15000) // 完整预约应小�?5�?
    // === 阶段4: 内存使用监控 ===

    // 获取页面性能指标
    const performanceMetrics = await page.evaluate(() => {
      const perfEntries = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        domContentLoaded: perfEntries.domContentLoadedEventEnd - perfEntries.navigationStart,
        loadComplete: perfEntries.loadEventEnd - perfEntries.navigationStart,
        dnsLookup: perfEntries.domainLookupEnd - perfEntries.domainLookupStart,
        tcpConnect: perfEntries.connectEnd - perfEntries.connectStart,
        serverResponse: perfEntries.responseEnd - perfEntries.requestStart
      }
    })

    logTestStep(`DNS查询: ${performanceMetrics.dnsLookup}ms`)
    logTestStep(`TCP连接: ${performanceMetrics.tcpConnect}ms`)
    logTestStep(`服务器响�? ${performanceMetrics.serverResponse}ms`)

    await takeScreenshotWithTimestamp(page, 'performance_monitoring_journey')
  })
})



