import { test, expect } from '@playwright/test'
import { setupCompleteFrontMock, logTestStep, takeScreenshotWithTimestamp } from '../utils/shared-helpers'

test.describe('Complete Business Workflow Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Setup comprehensive mocks for all business scenarios
    await setupCompleteFrontMock(page)
    logTestStep('设置完整的业务流程测试环境'用户注册到会员购买的完整流程', () => {
    test('应完成从注册到会员购买的完整用户旅程', async ({ page }) => {
      // 1. 用户注册
      await page.goto('/#/register')
      await page.waitForLoadState('networkidle')

      const timestamp = Date.now()
      const username = `testuser_${timestamp}`
      const email = `${username}@example.com`
      const password = 'Test123456'

      // 填写注册表单
      await page.fill('input[name="yonghuzhanghao"]', username)
      await page.fill('input[name="mima"]', password)
      await page.fill('input[name="confirmPassword"]', password)
      await page.fill('input[name="shoujihaoma"]', `138${timestamp.toString().slice(-8)}`)
      await page.fill('input[name="yonghuxingming"]', `测试用户${timestamp}`)

      // 提交注册
      await page.click('button:has-text("注册"), button[type="submit"]')

      // 验证注册成功
      await expect(page.locator('text=注册成功')).toBeVisible({ timeout: 5000 })
      logTestStep('用户注册成功')

      // 2. 自动登录或手动登�?      if (page.url().includes('/login')) {
        await page.fill('input[name="yonghuzhanghao"]', username)
        await page.fill('input[type="password"]', password)
        await page.click('button:has-text("登录")')
      }

      // 验证登录成功
      await expect(page.locator('[data-testid*="user-info"], .user-info, text=欢迎')).toBeVisible()
      logTestStep('用户登录成功')

      // 3. 浏览课程
      await page.goto('/#/courses')
      await page.waitForLoadState('networkidle')

      // 选择第一个课�?      const firstCourse = page.locator('.course-card, [data-testid*="course-card"]').first()
      await expect(firstCourse).toBeVisible()
      await firstCourse.click()

      // 查看课程详情
      await expect(page.locator('.course-detail, [data-testid*="course-detail"]')).toBeVisible()
      logTestStep('课程详情查看成功')

      // 4. 预约课程
      const bookButton = page.locator('button:has-text("预约"), [data-testid*="book-course"]').first()
      if (await bookButton.isVisible()) {
        await bookButton.click()

        // 选择时间
        const timeSlot = page.locator('.time-slot, [data-testid*="time-slot"]').first()
        if (await timeSlot.isVisible()) {
          await timeSlot.click()
        }

        // 提交预约
        await page.click('button:has-text("确认预约"), [data-testid*="confirm-booking"]')

        // 验证预约成功
        await expect(page.locator('text=预约成功')).toBeVisible()
        logTestStep('课程预约成功')
      }

      // 5. 浏览会员�?      await page.goto('/#/membership')
      await page.waitForLoadState('networkidle')

      // 选择会员�?      const membershipCard = page.locator('.membership-card, [data-testid*="membership-card"]').first()
      await expect(membershipCard).toBeVisible()
      await membershipCard.click()

      // 购买会员�?      const buyButton = page.locator('button:has-text("购买"), [data-testid*="purchase-button"]').first()
      if (await buyButton.isVisible()) {
        await buyButton.click()

        // 进入支付流程
        await expect(page.locator('.payment-form, [data-testid*="payment-form"]')).toBeVisible()

        // 选择支付方式
        await page.click('button:has-text("支付�?), [data-testid*="payment-alipay"]')

        // 确认支付
        await page.click('button:has-text("确认支付"), [data-testid*="confirm-payment"]')

        // 验证支付成功
        await expect(page.locator('text=支付成功')).toBeVisible()
        logTestStep('会员卡购买成�?)
      }

      // 6. 查看个人中心
      await page.goto('/#/profile')
      await page.waitForLoadState('networkidle')

      // 验证会员状�?      await expect(page.locator('text=会员, .membership-status')).toBeVisible()
      logTestStep('个人中心验证成功')

      // 截图记录完整流程
      await takeScreenshotWithTimestamp(page, 'complete_business_workflow')
    })
  })

  test.describe('教练预约和沟通流�?, () => {
    test('应完成教练预约到沟通的完整流程', async ({ page }) => {
      // 登录用户
      await page.goto('/#/login')
      await page.fill('input[name="yonghuzhanghao"]', 'testuser')
      await page.fill('input[type="password"]', 'password123')
      await page.click('button:has-text("登录")')

      await expect(page.locator('[data-testid*="user-info"]')).toBeVisible()

      // 1. 浏览教练列表
      await page.goto('/#/coaches')
      await page.waitForLoadState('networkidle')

      // 选择教练
      const firstCoach = page.locator('.coach-card, [data-testid*="coach-card"]').first()
      await expect(firstCoach).toBeVisible()
      await firstCoach.click()

      // 查看教练详情
      await expect(page.locator('.coach-detail, [data-testid*="coach-detail"]')).toBeVisible()
      logTestStep('教练详情查看成功')

      // 2. 预约私教课程
      const bookCoachButton = page.locator('button:has-text("预约教练"), [data-testid*="book-coach"]').first()
      if (await bookCoachButton.isVisible()) {
        await bookCoachButton.click()

        // 选择预约时间
        const coachTimeSlot = page.locator('.time-slot, [data-testid*="coach-time-slot"]').first()
        if (await coachTimeSlot.isVisible()) {
          await coachTimeSlot.click()
        }

        // 提交预约
        await page.click('button:has-text("确认预约"), [data-testid*="confirm-coach-booking"]')

        // 验证预约成功
        await expect(page.locator('text=预约成功')).toBeVisible()
        logTestStep('教练预约成功')
      }

      // 3. 发起聊天
      const chatButton = page.locator('button:has-text("联系教练"), [data-testid*="start-chat"]').first()
      if (await chatButton.isVisible()) {
        await chatButton.click()

        // 验证聊天界面打开
        await expect(page.locator('.chat-interface, [data-testid*="chat-interface"]')).toBeVisible()

        // 发送消�?        await page.fill('[data-testid*="chat-input"], .chat-input', '您好，我想咨询一下训练计�?)
        await page.click('[data-testid*="send-button"], button:has-text("发�?)')

        // 验证消息发送成�?        await expect(page.locator('.message.sent, [data-testid*="sent-message"]')).toBeVisible()
        logTestStep('教练沟通成�?)
      }
    })
  })

  test.describe('设备预约和管理流�?, () => {
    test('应完成设备预约到归还的完整流�?, async ({ page }) => {
      // 登录用户
      await page.goto('/#/login')
      await page.fill('input[name="yonghuzhanghao"]', 'testuser')
      await page.fill('input[type="password"]', 'password123')
      await page.click('button:has-text("登录")')

      await expect(page.locator('[data-testid*="user-info"]')).toBeVisible()

      // 1. 浏览设备列表
      await page.goto('/#/equipment')
      await page.waitForLoadState('networkidle')

      // 选择可用设备
      const availableEquipment = page.locator('.equipment-item.available, [data-testid*="equipment-available"]').first()
      await expect(availableEquipment).toBeVisible()
      await availableEquipment.click()

      // 查看设备详情
      await expect(page.locator('.equipment-detail, [data-testid*="equipment-detail"]')).toBeVisible()
      logTestStep('设备详情查看成功')

      // 2. 预约设备
      const bookEquipmentButton = page.locator('button:has-text("预约设备"), [data-testid*="book-equipment"]').first()
      if (await bookEquipmentButton.isVisible()) {
        await bookEquipmentButton.click()

        // 选择使用时间
        const equipmentTimeSlot = page.locator('.time-slot, [data-testid*="equipment-time-slot"]').first()
        if (await equipmentTimeSlot.isVisible()) {
          await equipmentTimeSlot.click()
        }

        // 提交预约
        await page.click('button:has-text("确认预约"), [data-testid*="confirm-equipment-booking"]')

        // 验证预约成功
        await expect(page.locator('text=预约成功')).toBeVisible()
        logTestStep('设备预约成功')
      }

      // 3. 查看我的预约
      await page.goto('/#/my-bookings')
      await page.waitForLoadState('networkidle')

      // 验证设备预约显示
      await expect(page.locator('text=设备预约, .equipment-booking')).toBeVisible()
      logTestStep('预约记录查看成功')

      // 4. 模拟设备归还（如果有归还功能�?      const returnButton = page.locator('button:has-text("归还"), [data-testid*="return-equipment"]').first()
      if (await returnButton.isVisible()) {
        await returnButton.click()
        await page.click('button:has-text("确认归还"), [data-testid*="confirm-return"]')

        // 验证归还成功
        await expect(page.locator('text=归还成功')).toBeVisible()
        logTestStep('设备归还成功')
      }
    })
  })

  test.describe('内容消费和互动流�?, () => {
    test('应完成内容浏览、收藏和分享的完整流�?, async ({ page }) => {
      // 登录用户
      await page.goto('/#/login')
      await page.fill('input[name="yonghuzhanghao"]', 'testuser')
      await page.fill('input[type="password"]', 'password123')
      await page.click('button:has-text("登录")')

      await expect(page.locator('[data-testid*="user-info"]')).toBeVisible()

      // 1. 浏览资讯内容
      await page.goto('/#/news')
      await page.waitForLoadState('networkidle')

      // 选择一篇资�?      const firstNews = page.locator('.news-item, [data-testid*="news-article"]').first()
      await expect(firstNews).toBeVisible()
      await firstNews.click()

      // 查看内容详情
      await expect(page.locator('.news-detail, [data-testid*="news-content"]')).toBeVisible()

      // 点赞内容
      const likeButton = page.locator('button:has-text("点赞"), [data-testid*="like-button"]').first()
      if (await likeButton.isVisible()) {
        await likeButton.click()
        await expect(likeButton).toHaveClass(/active/)
        logTestStep('内容点赞成功')
      }

      // 收藏内容
      const favoriteButton = page.locator('button:has-text("收藏"), [data-testid*="favorite-button"]').first()
      if (await favoriteButton.isVisible()) {
        await favoriteButton.click()
        await expect(favoriteButton).toHaveClass(/active/)
        logTestStep('内容收藏成功')
      }

      // 2. 查看收藏列表
      await page.goto('/#/favorites')
      await page.waitForLoadState('networkidle')

      // 验证收藏内容显示
      await expect(page.locator('.favorite-item, [data-testid*="favorite-item"]')).toBeVisible()
      logTestStep('收藏列表查看成功')

      // 3. 分享内容（如果有分享功能�?      const shareButton = page.locator('button:has-text("分享"), [data-testid*="share-button"]').first()
      if (await shareButton.isVisible()) {
        await shareButton.click()

        // 选择分享方式
        const wechatShare = page.locator('button:has-text("微信分享"), [data-testid*="share-wechat"]').first()
        if (await wechatShare.isVisible()) {
          await wechatShare.click()
          logTestStep('内容分享成功')
        }
      }
    })
  })

  test.describe('会员续费和升级流�?, () => {
    test('应完成会员续费和升级的完整流�?, async ({ page }) => {
      // 登录用户
      await page.goto('/#/login')
      await page.fill('input[name="yonghuzhanghao"]', 'testuser')
      await page.fill('input[type="password"]', 'password123')
      await page.click('button:has-text("登录")')

      await expect(page.locator('[data-testid*="user-info"]')).toBeVisible()

      // 1. 查看当前会员状�?      await page.goto('/#/profile')
      await page.waitForLoadState('networkidle')

      // 验证会员信息显示
      await expect(page.locator('.membership-info, [data-testid*="membership-info"]')).toBeVisible()

      // 2. 续费会员
      const renewButton = page.locator('button:has-text("续费"), [data-testid*="renew-membership"]').first()
      if (await renewButton.isVisible()) {
        await renewButton.click()

        // 选择续费时长
        const renewOption = page.locator('.renew-option, [data-testid*="renew-option"]').first()
        if (await renewOption.isVisible()) {
          await renewOption.click()
        }

        // 进入支付流程
        await page.click('button:has-text("确认续费"), [data-testid*="confirm-renewal"]')

        // 完成支付
        await page.click('button:has-text("支付宝支�?), [data-testid*="payment-alipay"]')
        await page.click('button:has-text("确认支付"), [data-testid*="confirm-payment"]')

        // 验证续费成功
        await expect(page.locator('text=续费成功')).toBeVisible()
        logTestStep('会员续费成功')
      }

      // 3. 升级会员
      const upgradeButton = page.locator('button:has-text("升级"), [data-testid*="upgrade-membership"]').first()
      if (await upgradeButton.isVisible()) {
        await upgradeButton.click()

        // 选择更高等级的会员卡
        const premiumCard = page.locator('.membership-card.premium, [data-testid*="membership-premium"]').first()
        if (await premiumCard.isVisible()) {
          await premiumCard.click()
        }

        // 完成升级支付
        await page.click('button:has-text("确认升级"), [data-testid*="confirm-upgrade"]')
        await page.click('button:has-text("支付宝支�?), [data-testid*="payment-alipay"]')
        await page.click('button:has-text("确认支付"), [data-testid*="confirm-payment"]')

        // 验证升级成功
        await expect(page.locator('text=升级成功')).toBeVisible()
        logTestStep('会员升级成功')
      }
    })
  })

  test.describe('投诉和反馈流�?, () => {
    test('应完成投诉提交和处理反馈的完整流�?, async ({ page }) => {
      // 登录用户
      await page.goto('/#/login')
      await page.fill('input[name="yonghuzhanghao"]', 'testuser')
      await page.fill('input[type="password"]', 'password123')
      await page.click('button:has-text("登录")')

      await expect(page.locator('[data-testid*="user-info"]')).toBeVisible()

      // 1. 提交投诉
      await page.goto('/#/complaints')
      await page.waitForLoadState('networkidle')

      // 点击提交投诉按钮
      await page.click('button:has-text("提交投诉"), [data-testid*="submit-complaint"]')

      // 填写投诉表单
      await page.selectOption('select[name="complaintType"], [data-testid*="complaint-type"]', 'service')
      await page.fill('textarea[name="complaintContent"], [data-testid*="complaint-content"]',
        '服务态度不够友好，希望得到改�?)
      await page.fill('input[name="contactPhone"], [data-testid*="contact-phone"]', '13800138000')

      // 上传图片（如果有�?      const uploadInput = page.locator('input[type="file"], [data-testid*="complaint-upload"]')
      if (await uploadInput.isVisible()) {
        // 这里可以上传测试图片
        // await uploadInput.setInputFiles('path/to/test/image.jpg')
      }

      // 提交投诉
      await page.click('button:has-text("提交"), [data-testid*="submit-complaint-form"]')

      // 验证提交成功
      await expect(page.locator('text=投诉提交成功')).toBeVisible()
      logTestStep('投诉提交成功')

      // 2. 查看投诉进度
      await page.goto('/#/my-complaints')
      await page.waitForLoadState('networkidle')

      // 验证投诉记录显示
      await expect(page.locator('.complaint-item, [data-testid*="complaint-item"]')).toBeVisible()

      // 查看投诉详情
      const firstComplaint = page.locator('.complaint-item, [data-testid*="complaint-item"]').first()
      await firstComplaint.click()

      // 验证投诉详情显示
      await expect(page.locator('.complaint-detail, [data-testid*="complaint-detail"]')).toBeVisible()
      logTestStep('投诉进度查看成功')

      // 3. 提交反馈评价
      const feedbackButton = page.locator('button:has-text("评价"), [data-testid*="submit-feedback"]').first()
      if (await feedbackButton.isVisible()) {
        await feedbackButton.click()

        // 填写反馈
        await page.selectOption('select[name="satisfaction"], [data-testid*="satisfaction-rating"]', 'satisfied')
        await page.fill('textarea[name="feedbackContent"], [data-testid*="feedback-content"]',
          '处理及时，服务质量有所改善')

        // 提交反馈
        await page.click('button:has-text("提交评价"), [data-testid*="submit-feedback-form"]')

        // 验证反馈提交成功
        await expect(page.locator('text=评价提交成功')).toBeVisible()
        logTestStep('反馈评价提交成功')
      }
    })
  })
})
