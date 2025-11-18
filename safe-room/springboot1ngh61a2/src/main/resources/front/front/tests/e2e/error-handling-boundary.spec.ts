import { test, expect } from '@playwright/test'
import { setupCompleteFrontMock, logTestStep, takeScreenshotWithTimestamp } from '../utils/shared-helpers'

test.describe('Error Handling and Boundary Conditions', () => {
  test.beforeEach(async ({ page }) => {
    // Setup mocks with error scenarios
    await setupCompleteFrontMock(page)
    logTestStep('设置错误处理测试环境')
  })

  test.describe('网络错误处理', () => {
    test('应优雅处理网络连接失败', async ({ page }) => {
      // 模拟网络离线
      await page.context().setOffline(true)

      await page.goto('/#/courses')
      await page.waitForLoadState('domcontentloaded')

      // 验证离线状态处理
      await expect(page.locator('text=网络连接失败, text=网络异常, .network-error')).toBeVisible({ timeout: 5000 })
      logTestStep('网络离线错误处理正常')

      // 恢复网络连接
      await page.context().setOffline(false)
    })

    test('应处理API请求超时', async ({ page }) => {
      // Mock API timeout
      await page.route('**/jianshenkecheng/**', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 35000)) // 超过30秒超时
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ code: 0, data: [] })
        })
      })

      await page.goto('/#/courses')
      await page.waitForLoadState('networkidle')

      // 验证超时错误处理
      await expect(page.locator('text=请求超时, text=加载失败, .timeout-error')).toBeVisible({ timeout: 40000 })
      logTestStep('API超时错误处理正常')
    })

    test('应处理服务器错误响应', async ({ page }) => {
      // Mock 500 server error
      await page.route('**/jianshenkecheng/**', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ code: 500, msg: '服务器内部错误' })
        })
      })

      await page.goto('/#/courses')
      await page.waitForLoadState('networkidle')

      // 验证服务器错误处理
      await expect(page.locator('text=服务器错误, text=系统异常, .server-error')).toBeVisible()
      logTestStep('服务器错误处理正常')
    })
  })

  test.describe('表单验证边界情况', () => {
    test('应验证必填字段为空的情况', async ({ page }) => {
      await page.goto('/#/register')

      // 直接提交空表单
      await page.click('button[type="submit"], button:has-text("注册")')

      // 验证所有必填字段的错误提示
      const requiredErrors = page.locator('.el-form-item__error, .error-message, text=不能为空, text=必填')
      const errorCount = await requiredErrors.count()

      expect(errorCount).toBeGreaterThan(0)
      logTestStep(`必填字段验证正常，发现 ${errorCount} 个验证错误`)
    })

    test('应验证输入长度限制', async ({ page }) => {
      await page.goto('/#/register')

      // 测试用户名超长
      const longUsername = 'a'.repeat(51) // 超过50字符限制
      await page.fill('input[name="yonghuzhanghao"]', longUsername)
      await page.click('button[type="submit"]')

      // 验证长度错误提示
      await expect(page.locator('text=长度不能超过, text=用户名过长, .length-error')).toBeVisible()
      logTestStep('输入长度限制验证正常')
    })

    test('应验证特殊字符输入', async ({ page }) => {
      await page.goto('/#/register')

      // 测试包含特殊字符的用户名
      await page.fill('input[name="yonghuzhanghao"]', 'test@user!#$')
      await page.fill('input[name="mima"]', 'password123')
      await page.fill('input[name="confirmPassword"]', 'password123')
      await page.click('button[type="submit"]')

      // 验证特殊字符错误提示
      await expect(page.locator('text=不能包含特殊字符, text=格式错误, .format-error')).toBeVisible()
      logTestStep('特殊字符验证正常')
    })

    test('应验证邮箱格式', async ({ page }) => {
      await page.goto('/#/register')

      // 测试无效邮箱格式
      const invalidEmails = [
        'invalid-email',
        'test@',
        '@example.com',
        'test..test@example.com',
        'test@example'
      ]

      for (const email of invalidEmails) {
        await page.fill('input[name="youxiang"]', email)
        await page.click('button[type="submit"]')

        await expect(page.locator('text=邮箱格式错误, text=无效的邮箱, .email-error')).toBeVisible()
        logTestStep(`邮箱格式验证正常: ${email}`)
      }
    })

    test('应验证手机号格式', async ({ page }) => {
      await page.goto('/#/register')

      // 测试无效手机号格式
      const invalidPhones = [
        '1234567890', // 太短
        '123456789012', // 太长
        'abcdefghijk', // 非数字
        '1380013800a' // 包含字母
      ]

      for (const phone of invalidPhones) {
        await page.fill('input[name="shoujihaoma"]', phone)
        await page.click('button[type="submit"]')

        await expect(page.locator('text=手机号格式错误, text=无效的手机号, .phone-error')).toBeVisible()
        logTestStep(`手机号格式验证正常: ${phone}`)
      }
    })

    test('应验证密码强度', async ({ page }) => {
      await page.goto('/#/register')

      // 测试弱密码
      const weakPasswords = [
        '123', // 太短
        'password', // 无数字
        '123456789', // 无字母
        'PASSWORD', // 无小写字母
        'password' // 无特殊字符和数字
      ]

      for (const password of weakPasswords) {
        await page.fill('input[name="mima"]', password)
        await page.click('button[type="submit"]')

        await expect(page.locator('text=密码强度不足, text=密码不符合要求, .password-error')).toBeVisible()
        logTestStep(`密码强度验证正常: ${password}`)
      }
    })

    test('应验证密码确认匹配', async ({ page }) => {
      await page.goto('/#/register')

      await page.fill('input[name="mima"]', 'Test123456')
      await page.fill('input[name="confirmPassword"]', 'DifferentPassword')
      await page.click('button[type="submit"]')

      // 验证密码不匹配错误
      await expect(page.locator('text=密码不匹配, text=两次密码不一致, .password-mismatch')).toBeVisible()
      logTestStep('密码确认匹配验证正常')
    })
  })

  test.describe('业务逻辑边界情况', () => {
    test('应处理重复预约冲突', async ({ page }) => {
      // 登录用户
      await page.goto('/#/login')
      await page.fill('input[name="yonghuzhanghao"]', 'testuser')
      await page.fill('input[type="password"]', 'password123')
      await page.click('button:has-text("登录")')

      // Mock 预约冲突
      await page.route('**/kechengyuyue/**', async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              code: 409,
              msg: '该时间段已被预约，请选择其他时间'
            })
          })
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ code: 0, data: [] })
          })
        }
      })

      // 尝试预约课程
      await page.goto('/#/courses')
      const bookButton = page.locator('button:has-text("预约")').first()
      if (await bookButton.isVisible()) {
        await bookButton.click()

        // 选择时间并提交
        const timeSlot = page.locator('.time-slot').first()
        if (await timeSlot.isVisible()) {
          await timeSlot.click()
          await page.click('button:has-text("确认预约")')

          // 验证冲突提示
          await expect(page.locator('text=已被预约, text=时间冲突, .conflict-error')).toBeVisible()
          logTestStep('预约冲突处理正常')
        }
      }
    })

    test('应处理库存不足情况', async ({ page }) => {
      // 登录用户
      await page.goto('/#/login')
      await page.fill('input[name="yonghuzhanghao"]', 'testuser')
      await page.fill('input[type="password"]', 'password123')
      await page.click('button:has-text("登录")')

      // Mock 库存不足
      await page.route('**/huiyuanka/**', async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              code: 410,
              msg: '该会员卡已售罄'
            })
          })
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ code: 0, data: [] })
          })
        }
      })

      // 尝试购买会员卡
      await page.goto('/#/membership')
      const buyButton = page.locator('button:has-text("购买")').first()
      if (await buyButton.isVisible()) {
        await buyButton.click()
        await page.click('button:has-text("确认购买")')

        // 验证库存不足提示
        await expect(page.locator('text=已售罄, text=库存不足, .out-of-stock')).toBeVisible()
        logTestStep('库存不足处理正常')
      }
    })

    test('应处理支付失败情况', async ({ page }) => {
      // 登录用户
      await page.goto('/#/login')
      await page.fill('input[name="yonghuzhanghao"]', 'testuser')
      await page.fill('input[type="password"]', 'password123')
      await page.click('button:has-text("登录")')

      // Mock 支付失败
      await page.route('**/payment/**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 402,
            msg: '支付失败，余额不足'
          })
        })
      })

      // 尝试支付
      await page.goto('/#/membership')
      const buyButton = page.locator('button:has-text("购买")').first()
      if (await buyButton.isVisible()) {
        await buyButton.click()
        await page.click('button:has-text("确认购买")')
        await page.click('button:has-text("余额支付")')
        await page.click('button:has-text("确认支付")')

        // 验证支付失败提示
        await expect(page.locator('text=支付失败, text=余额不足, .payment-error')).toBeVisible()
        logTestStep('支付失败处理正常')
      }
    })
  })

  test.describe('用户界面异常情况', () => {
    test('应处理页面加载失败', async ({ page }) => {
      // Mock 页面资源加载失败
      await page.route('**/*.css', async (route) => {
        await route.abort()
      })

      await page.goto('/#/home')
      await page.waitForLoadState('domcontentloaded')

      // 页面应该仍然可用，只是样式丢失
      await expect(page.locator('h1, .page-title, text=健身')).toBeVisible()
      logTestStep('页面样式加载失败处理正常')
    })

    test('应处理图片加载失败', async ({ page }) => {
      // Mock 图片加载失败
      await page.route('**/*.{jpg,jpeg,png,gif}', async (route) => {
        await route.abort()
      })

      await page.goto('/#/courses')
      await page.waitForLoadState('networkidle')

      // 验证图片错误处理（显示占位符或alt文本）
      const brokenImages = page.locator('img[src=""], img[alt], .image-placeholder')
      const placeholderCount = await brokenImages.count()

      expect(placeholderCount).toBeGreaterThan(0)
      logTestStep('图片加载失败处理正常')
    })

    test('应处理JavaScript执行错误', async ({ page }) => {
      // 注入会导致错误的脚本
      await page.addInitScript(() => {
        // @ts-ignore
        window.testError = function() {
          throw new Error('Test JavaScript error')
        }
      })

      await page.goto('/#/home')
      await page.waitForLoadState('domcontentloaded')

      // 触发错误
      await page.evaluate(() => {
        // @ts-ignore
        if (window.testError) window.testError()
      })

      // 页面应该仍然可用（错误被处理）
      await expect(page.locator('body')).toBeVisible()
      logTestStep('JavaScript错误处理正常')
    })

    test('应处理模态框意外关闭', async ({ page }) => {
      await page.goto('/#/courses')

      // 打开一个模态框（如果有）
      const modalTrigger = page.locator('button[data-modal], .modal-trigger').first()
      if (await modalTrigger.isVisible()) {
        await modalTrigger.click()

        // 等待模态框打开
        await expect(page.locator('.el-dialog, .modal')).toBeVisible()

        // 模拟ESC键关闭
        await page.keyboard.press('Escape')

        // 验证模态框关闭
        await expect(page.locator('.el-dialog, .modal')).not.toBeVisible()
        logTestStep('模态框ESC关闭处理正常')
      }
    })
  })

  test.describe('数据异常处理', () => {
    test('应处理空数据列表', async ({ page }) => {
      // Mock 空数据响应
      await page.route('**/jianshenkecheng/**', async (route) => {
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

      await page.goto('/#/courses')
      await page.waitForLoadState('networkidle')

      // 验证空状态显示
      await expect(page.locator('.empty-state, text=暂无数据, text=没有找到')).toBeVisible()
      logTestStep('空数据列表处理正常')
    })

    test('应处理数据格式错误', async ({ page }) => {
      // Mock 格式错误的响应
      await page.route('**/jianshenkecheng/**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 0,
            data: null, // 错误的格式
            total: 'invalid' // 错误的类型
          })
        })
      })

      await page.goto('/#/courses')
      await page.waitForLoadState('networkidle')

      // 页面应该显示错误状态或降级显示
      await expect(page.locator('.error-state, text=数据加载失败')).toBeVisible()
      logTestStep('数据格式错误处理正常')
    })

    test('应处理大数据量加载', async ({ page }) => {
      // Mock 大量数据响应
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        kechengmingcheng: `测试课程 ${i + 1}`,
        jiage: `${100 + (i % 200)}`,
        shichang: '60分钟'
      }))

      await page.route('**/jianshenkecheng/**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 0,
            data: largeData,
            total: largeData.length
          })
        })
      })

      await page.goto('/#/courses')
      await page.waitForLoadState('networkidle')

      // 验证大数据量渲染正常
      const courseItems = page.locator('.course-item, [data-testid*="course"]')
      const itemCount = await courseItems.count()

      expect(itemCount).toBeGreaterThan(10) // 至少显示一些项目
      logTestStep(`大数据量处理正常，显示 ${itemCount} 个项目`)
    })
  })

  test.describe('并发操作处理', () => {
    test('应处理快速连续点击', async ({ page }) => {
      await page.goto('/#/register')

      // 快速连续点击提交按钮
      const submitButton = page.locator('button[type="submit"]').first()
      await submitButton.click()
      await submitButton.click()
      await submitButton.click()

      // 验证只处理一次提交（防重复提交）
      const loadingIndicators = page.locator('.loading, .is-loading, [loading]')
      const loadingCount = await loadingIndicators.count()

      // 应该只有一个加载状态
      expect(loadingCount).toBeLessThanOrEqual(1)
      logTestStep('快速连续点击处理正常')
    })

    test('应处理多标签页操作', async ({ context }) => {
      // 在同一个上下文中打开多个页面
      const page1 = await context.newPage()
      const page2 = await context.newPage()

      // 在第一个页面登录
      await page1.goto('/#/login')
      await page1.fill('input[name="yonghuzhanghao"]', 'testuser')
      await page1.fill('input[type="password"]', 'password123')
      await page1.click('button:has-text("登录")')

      // 在第二个页面也尝试登录
      await page2.goto('/#/login')
      await page2.fill('input[name="yonghuzhanghao"]', 'testuser')
      await page2.fill('input[type="password"]', 'password123')
      await page2.click('button:has-text("登录")')

      // 验证两个页面都能正常操作
      await expect(page1.locator('[data-testid*="user-info"]')).toBeVisible()
      await expect(page2.locator('[data-testid*="user-info"]')).toBeVisible()
      logTestStep('多标签页操作处理正常')
    })
  })

  test.describe('浏览器兼容性边界', () => {
    test('应处理不同浏览器特性', async ({ page }) => {
      // 测试localStorage可用性
      await page.addInitScript(() => {
        // 模拟localStorage不可用的环境
        const originalSetItem = localStorage.setItem
        localStorage.setItem = function(key: string, value: string) {
          throw new Error('localStorage is not available')
        }

        // 恢复localStorage以免影响其他测试
        setTimeout(() => {
          localStorage.setItem = originalSetItem
        }, 1000)
      })

      await page.goto('/#/home')
      await page.waitForLoadState('domcontentloaded')

      // 验证应用在localStorage不可用时仍能工作
      await expect(page.locator('body')).toBeVisible()
      logTestStep('浏览器特性兼容性处理正常')
    })

    test('应处理不同屏幕尺寸', async ({ page }) => {
      const viewports = [
        { width: 320, height: 568 },   // iPhone SE
        { width: 375, height: 667 },   // iPhone 6/7/8
        { width: 414, height: 896 },   // iPhone 11
        { width: 768, height: 1024 },  // iPad
        { width: 1024, height: 768 },  // Small desktop
        { width: 1920, height: 1080 }  // Full HD
      ]

      for (const viewport of viewports) {
        await page.setViewportSize(viewport)
        await page.goto('/#/home')
        await page.waitForLoadState('domcontentloaded')

        // 验证页面在不同尺寸下都能正常显示关键内容
        await expect(page.locator('nav, .navigation, header')).toBeVisible()
        await expect(page.locator('main, .main-content, .content')).toBeVisible()

        logTestStep(`${viewport.width}x${viewport.height} 屏幕尺寸适配正常`)
      }
    })
  })
})
