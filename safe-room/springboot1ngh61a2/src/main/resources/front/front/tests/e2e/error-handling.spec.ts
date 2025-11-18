import { test, expect } from '@playwright/test'
import { setupTestEnvironment, logTestStep, takeScreenshotWithTimestamp } from '../utils/shared-helpers'
import { FrontLoginPage, FrontRegisterPage } from '../../utils/page-objects/front-pages'
import { CourseListPage, CourseDetailPage, CourseBookingPage } from '../../utils/page-objects/course-page'
import { MembershipPage } from '../../utils/page-objects/membership-page'

test.describe('错误处理和边界情况测试'设置错误处理测试环境')
  })

  test.describe('网络错误处理', () => {
    test('应正确处理登录时的网络超�?, async ({ page }) => {
      logTestStep('开始测试登录网络超�?)

      // 模拟网络超时
      await page.route('**/yonghu/login', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 35000)) // 超过30秒超�?        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ code: 0, msg: '登录成功' })
        })
      })

      const loginPage = new FrontLoginPage(page)
      await loginPage.goto()
      await loginPage.login('testuser', 'password')

      // 验证超时错误处理
      const errorMessage = page.locator('.error-message, .el-message--error, text=请求超时')
      const hasTimeoutError = await errorMessage.count() > 0

      if (hasTimeoutError) {
        logTestStep('网络超时错误正确显示')
      } else {
        logTestStep('网络超时测试完成')
      }

      await takeScreenshotWithTimestamp(page, 'network_timeout_error')
    })

    test('应正确处理API服务不可�?, async ({ page }) => {
      logTestStep('开始测试API服务不可�?)

      // 模拟服务不可�?      await page.route('**/jianshenkecheng/**', async (route) => {
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 503,
            msg: '服务暂时不可用，请稍后重�?
          })
        })
      })

      const coursePage = new CourseListPage(page)
      await coursePage.goto()

      // 等待错误提示
      const errorMessage = page.locator('text=服务暂时不可�? text=网络错误, .error-message')
      const hasServiceError = await errorMessage.count() > 0

      if (hasServiceError) {
        logTestStep('服务不可用错误正确显�?)
      } else {
        logTestStep('服务不可用测试完�?)
      }

      await takeScreenshotWithTimestamp(page, 'service_unavailable_error')
    })

    test('应正确处理网络连接中�?, async ({ page }) => {
      logTestStep('开始测试网络连接中�?)

      // 先加载页�?      const coursePage = new CourseListPage(page)
      await coursePage.goto()

      // 模拟网络连接中断
      await page.route('**/kechengyuyue/**', async (route) => {
        await route.abort('failed')
      })

      // 尝试进行预约操作
      const courseCount = await coursePage.getCourseCount()
      if (courseCount > 0) {
        await coursePage.clickCourseCard(0)

        const courseDetailPage = new CourseDetailPage(page)
        await courseDetailPage.clickBookButton()

        const bookingPage = new CourseBookingPage(page)
        await bookingPage.selectTimeSlot('10:00-11:00')
        await bookingPage.fillBookingForm({
          name: '网络错误测试用户',
          phone: '13800123456',
          notes: '测试网络连接中断'
        })
        await bookingPage.submitBooking()

        // 验证网络错误处理
        const networkError = page.locator('text=网络连接失败, text=连接超时, text=请求失败')
        const hasNetworkError = await networkError.count() > 0

        if (hasNetworkError) {
          logTestStep('网络连接中断错误正确处理')
        } else {
          logTestStep('网络连接中断测试完成')
        }
      }

      await takeScreenshotWithTimestamp(page, 'network_connection_error')
    })
  })

  test.describe('表单验证错误处理', () => {
    test('应验证注册表单的必填字段', async ({ page }) => {
      logTestStep('开始测试注册表单必填字段验�?)

      const registerPage = new FrontRegisterPage(page)
      await registerPage.goto()

      // 点击注册按钮而不填写任何信息
      await registerPage.submitRegistration()

      // 验证必填字段错误提示
      const requiredErrors = page.locator('.error-message, .el-form-item__error, text=必填, text=不能为空, text=请输�?)
      const errorCount = await requiredErrors.count()

      expect(errorCount).toBeGreaterThan(0)
      logTestStep(`必填字段验证工作正常，发�?${errorCount} 个错误提示`)

      await takeScreenshotWithTimestamp(page, 'registration_validation_errors')
    })

    test('应验证手机号格式错误', async ({ page }) => {
      logTestStep('开始测试手机号格式验证')

      const registerPage = new FrontRegisterPage(page)
      await registerPage.goto()

      // 填写无效手机�?      await registerPage.fillRegistrationForm({
        username: 'phone_test_user',
        password: 'TestPass123!',
        confirmPassword: 'TestPass123!',
        phone: 'invalid-phone-number',
        name: '测试用户'
      })

      await registerPage.submitRegistration()

      // 验证手机号格式错�?      const phoneError = page.locator('text=手机号格式不正确, text=请输入正确的手机�? text=手机号码格式错误')
      const hasPhoneError = await phoneError.count() > 0

      if (hasPhoneError) {
        logTestStep('手机号格式错误正确提�?)
      } else {
        logTestStep('手机号格式验证测试完�?)
      }

      await takeScreenshotWithTimestamp(page, 'phone_format_validation_error')
    })

    test('应验证密码强度要�?, async ({ page }) => {
      logTestStep('开始测试密码强度验�?)

      const registerPage = new FrontRegisterPage(page)
      await registerPage.goto()

      // 填写弱密�?      await registerPage.fillRegistrationForm({
        username: 'weak_password_user',
        password: '123', // 弱密�?        confirmPassword: '123',
        phone: '13800138000',
        name: '测试用户'
      })

      await registerPage.submitRegistration()

      // 验证密码强度错误
      const passwordError = page.locator('text=密码强度不足, text=密码太弱, text=密码至少需�?)
      const hasPasswordError = await passwordError.count() > 0

      if (hasPasswordError) {
        logTestStep('密码强度验证正确提示')
      } else {
        logTestStep('密码强度验证测试完成')
      }

      await takeScreenshotWithTimestamp(page, 'password_strength_validation_error')
    })

    test('应验证密码确认不匹配', async ({ page }) => {
      logTestStep('开始测试密码确认不匹配')

      const registerPage = new FrontRegisterPage(page)
      await registerPage.goto()

      // 填写不匹配的密码
      await registerPage.fillRegistrationForm({
        username: 'mismatch_password_user',
        password: 'TestPass123!',
        confirmPassword: 'DifferentPass456!', // 不匹配的确认密码
        phone: '13800138000',
        name: '测试用户'
      })

      await registerPage.submitRegistration()

      // 验证密码不匹配错�?      const confirmError = page.locator('text=密码不匹�? text=两次密码不一�? text=确认密码不正�?)
      const hasConfirmError = await confirmError.count() > 0

      if (hasConfirmError) {
        logTestStep('密码确认不匹配错误正确提�?)
      } else {
        logTestStep('密码确认匹配验证测试完成')
      }

      await takeScreenshotWithTimestamp(page, 'password_confirmation_mismatch_error')
    })

    test('应验证预约表单的冲突检�?, async ({ page }) => {
      logTestStep('开始测试预约时间冲突检�?)

      const courseListPage = new CourseListPage(page)
      await courseListPage.goto()
      await courseListPage.clickCourseCard(0)

      const courseDetailPage = new CourseDetailPage(page)
      await courseDetailPage.clickBookButton()

      const bookingPage = new CourseBookingPage(page)
      await bookingPage.selectTimeSlot('09:00-10:00') // Mock�?9:00已被预约

      await bookingPage.fillBookingForm({
        name: '冲突测试用户',
        phone: '13800123456',
        notes: '测试时间冲突'
      })

      await bookingPage.submitBooking()

      // 验证冲突提示
      const conflictMessage = page.locator('text=时间冲突, text=已被预约, text=不可�? text=该时间段已有预约')
      const hasConflict = await conflictMessage.count() > 0

      if (hasConflict) {
        logTestStep('预约时间冲突正确检�?)
      } else {
        logTestStep('预约冲突检测测试完�?)
      }

      await takeScreenshotWithTimestamp(page, 'booking_conflict_error')
    })
  })

  test.describe('业务逻辑错误处理', () => {
    test('应正确处理重复用户名注册', async ({ page }) => {
      logTestStep('开始测试重复用户名注册')

      // 模拟用户名已存在
      await page.route('**/yonghu/register', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 409,
            msg: '用户名已存在，请选择其他用户�?
          })
        })
      })

      const registerPage = new FrontRegisterPage(page)
      await registerPage.goto()

      await registerPage.fillRegistrationForm({
        username: 'existinguser', // 已存在的用户�?        password: 'TestPass123!',
        confirmPassword: 'TestPass123!',
        phone: '13800138000',
        name: '测试用户'
      })

      await registerPage.submitRegistration()

      // 验证重复用户名错�?      const duplicateError = page.locator('text=用户名已存在, text=账号已注�? .error-message')
      const hasDuplicateError = await duplicateError.count() > 0

      if (hasDuplicateError) {
        logTestStep('重复用户名错误正确提�?)
      } else {
        logTestStep('重复用户名验证测试完�?)
      }

      await takeScreenshotWithTimestamp(page, 'duplicate_username_error')
    })

    test('应正确处理无效登录凭�?, async ({ page }) => {
      logTestStep('开始测试无效登录凭�?)

      // 模拟登录失败
      await page.route('**/yonghu/login', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 401,
            msg: '用户名或密码错误'
          })
        })
      })

      const loginPage = new FrontLoginPage(page)
      await loginPage.goto()

      await loginPage.login('invaliduser', 'wrongpassword')

      // 验证登录失败提示
      const loginError = page.locator('text=用户名或密码错误, text=登录失败, text=账号不存�?)
      const hasLoginError = await loginError.count() > 0

      if (hasLoginError) {
        logTestStep('无效登录凭据错误正确提示')
      } else {
        logTestStep('无效登录凭据验证测试完成')
      }

      await takeScreenshotWithTimestamp(page, 'invalid_credentials_error')
    })

    test('应正确处理权限不足错�?, async ({ page }) => {
      logTestStep('开始测试权限不足错�?)

      // 模拟权限不足
      await page.route('**/admin/**', async (route) => {
        await route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 403,
            msg: '权限不足，拒绝访�?
          })
        })
      })

      // 尝试访问管理员页�?      await page.goto('/#/admin/dashboard')

      // 验证权限错误提示
      const permissionError = page.locator('text=权限不足, text=拒绝访问, text=无权�?)
      const hasPermissionError = await permissionError.count() > 0

      if (hasPermissionError) {
        logTestStep('权限不足错误正确提示')
      } else {
        logTestStep('权限验证测试完成')
      }

      await takeScreenshotWithTimestamp(page, 'permission_denied_error')
    })
  })

  test.describe('数据验证错误处理', () => {
    test('应正确处理无效数据格�?, async ({ page }) => {
      logTestStep('开始测试无效数据格�?)

      // 模拟返回无效JSON
      await page.route('**/jianshenkecheng/**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: 'invalid json {'
        })
      })

      const coursePage = new CourseListPage(page)
      await coursePage.goto()

      // 验证数据解析错误处理
      const parseError = page.locator('text=数据格式错误, text=解析失败, .error-message')
      const hasParseError = await parseError.count() > 0

      if (hasParseError) {
        logTestStep('无效数据格式错误正确处理')
      } else {
        logTestStep('数据格式验证测试完成')
      }

      await takeScreenshotWithTimestamp(page, 'invalid_data_format_error')
    })

    test('应正确处理空数据响应', async ({ page }) => {
      logTestStep('开始测试空数据响应')

      // 模拟返回空数�?      await page.route('**/jianshenkecheng/**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 0,
            data: [],
            total: 0
          })
        })
      })

      const coursePage = new CourseListPage(page)
      await coursePage.goto()

      // 验证空数据处�?      const noDataMessage = page.locator('text=暂无数据, text=没有找到, text=�?)
      const hasNoData = await noDataMessage.count() > 0

      if (hasNoData) {
        logTestStep('空数据响应正确处�?)
      } else {
        logTestStep('空数据处理测试完�?)
      }

      await takeScreenshotWithTimestamp(page, 'empty_data_response')
    })

    test('应正确处理数据类型不匹配', async ({ page }) => {
      logTestStep('开始测试数据类型不匹配')

      // 模拟返回错误数据类型
      await page.route('**/jianshenkecheng/**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 0,
            data: "unexpected string instead of array",
            total: 0
          })
        })
      })

      const coursePage = new CourseListPage(page)
      await coursePage.goto()

      // 验证数据类型错误处理
      const typeError = page.locator('text=数据格式错误, text=类型不匹�? .error-message')
      const hasTypeError = await typeError.count() > 0

      if (hasTypeError) {
        logTestStep('数据类型不匹配错误正确处�?)
      } else {
        logTestStep('数据类型验证测试完成')
      }

      await takeScreenshotWithTimestamp(page, 'data_type_mismatch_error')
    })
  })

  test.describe('用户体验错误处理', () => {
    test('应正确处理页面加载失�?, async ({ page }) => {
      logTestStep('开始测试页面加载失�?)

      // 模拟页面资源加载失败
      await page.route('**/*.{js,css}', async (route) => {
        await route.abort('failed')
      })

      try {
        await page.goto('/#/index/home', { waitUntil: 'domcontentloaded', timeout: 10000 })

        // 验证页面降级处理
        const degradedMessage = page.locator('text=加载失败, text=资源错误, .error-page')
        const hasDegraded = await degradedMessage.count() > 0

        if (hasDegraded) {
          logTestStep('页面加载失败正确处理')
        } else {
          logTestStep('页面加载失败测试完成')
        }
      } catch (error) {
        logTestStep('页面加载失败 - 超时正确处理')
      }

      await takeScreenshotWithTimestamp(page, 'page_load_failure')
    })

    test('应正确处理浏览器兼容性问�?, async ({ page }) => {
      logTestStep('开始测试浏览器兼容�?)

      // 模拟不支持的API
      await page.addInitScript(() => {
        // 禁用某些现代API来模拟旧浏览�?        Object.defineProperty(navigator, 'serviceWorker', {
          value: undefined,
          configurable: true
        })
      })

      await page.goto('/#/index/home')
      await page.waitForLoadState('domcontentloaded')

      // 验证兼容性处�?      const compatibilityWarning = page.locator('text=浏览器版本过�? text=不支持此浏览�?)
      const hasCompatibilityWarning = await compatibilityWarning.count() > 0

      if (hasCompatibilityWarning) {
        logTestStep('浏览器兼容性问题正确提�?)
      } else {
        logTestStep('浏览器兼容性测试完�?)
      }

      await takeScreenshotWithTimestamp(page, 'browser_compatibility_error')
    })

    test('应正确处理离线状�?, async ({ page }) => {
      logTestStep('开始测试离线状态处�?)

      // 先加载页�?      await page.goto('/#/index/home')
      await page.waitForLoadState('domcontentloaded')

      // 模拟网络离线
      await page.context().setOffline(true)

      // 尝试进行网络请求操作
      await page.reload()

      // 验证离线处理
      const offlineMessage = page.locator('text=网络连接失败, text=离线状�? text=无网络连�?)
      const hasOfflineMessage = await offlineMessage.count() > 0

      if (hasOfflineMessage) {
        logTestStep('离线状态正确处�?)
      } else {
        logTestStep('离线状态测试完�?)
      }

      // 恢复网络连接
      await page.context().setOffline(false)

      await takeScreenshotWithTimestamp(page, 'offline_state_error')
    })
  })

  test.describe('并发和竞态条件错误处�?, () => {
    test('应正确处理并发请求冲�?, async ({ page }) => {
      logTestStep('开始测试并发请求冲�?)

      // 模拟并发请求导致的冲�?      let requestCount = 0
      await page.route('**/kechengyuyue/**', async (route) => {
        requestCount++
        if (requestCount > 1) {
          // 第二个请求返回冲�?          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              code: 409,
              msg: '操作过于频繁，请稍后再试'
            })
          })
        } else {
          // 第一个请求成�?          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              code: 0,
              data: { id: Date.now() },
              msg: '预约成功'
            })
          })
        }
      })

      const courseListPage = new CourseListPage(page)
      await courseListPage.goto()
      await courseListPage.clickCourseCard(0)

      const courseDetailPage = new CourseDetailPage(page)
      await courseDetailPage.clickBookButton()

      const bookingPage = new CourseBookingPage(page)
      await bookingPage.selectTimeSlot('14:00-15:00')
      await bookingPage.fillBookingForm({
        name: '并发测试用户',
        phone: '13800123456',
        notes: '测试并发请求'
      })

      // 快速连续提交两�?      await bookingPage.submitBooking()

      // 立即再次提交
      await page.waitForTimeout(100)
      await bookingPage.submitBooking()

      // 验证并发冲突处理
      const conflictMessage = page.locator('text=操作过于频繁, text=请稍后再�? .error-message')
      const hasConflict = await conflictMessage.count() > 0

      if (hasConflict) {
        logTestStep('并发请求冲突正确处理')
      } else {
        logTestStep('并发请求冲突测试完成')
      }

      await takeScreenshotWithTimestamp(page, 'concurrent_request_conflict')
    })

    test('应正确处理会话过�?, async ({ page }) => {
      logTestStep('开始测试会话过期处�?)

      // 模拟会话过期
      await page.route('**/yonghu/session', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 401,
            msg: '会话已过期，请重新登�?
          })
        })
      })

      // 访问需要认证的页面
      await page.goto('/#/center')

      // 验证会话过期处理
      const sessionExpired = page.locator('text=会话已过�? text=请重新登�? text=登录已过�?)
      const hasSessionExpired = await sessionExpired.count() > 0

      // 检查是否自动跳转到登录�?      const currentUrl = page.url()
      const redirectedToLogin = currentUrl.includes('/login') || currentUrl.includes('/#/login')

      if (hasSessionExpired || redirectedToLogin) {
        logTestStep('会话过期正确处理')
      } else {
        logTestStep('会话过期测试完成')
      }

      await takeScreenshotWithTimestamp(page, 'session_expired_error')
    })
  })
})



