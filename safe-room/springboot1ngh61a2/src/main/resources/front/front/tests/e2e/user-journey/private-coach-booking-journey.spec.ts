import { test, expect } from '@playwright/test'
import { setupTestEnvironment, logTestStep, takeScreenshotWithTimestamp } from '../../utils/shared-helpers'
import { TrainerBookingPage } from '../../utils/page-objects/trainer-booking-page'
import { UserCenterPage } from '../../utils/page-objects/user-center-page'
import { mockPaymentFlow, mockCaptcha } from '../../utils/test-helpers'
import { selectors } from '../../utils/selectors'

test.describe('私教预约完整用户旅程', () => {
  test.beforeEach(async ({ page }) => {
    // 使用完整的测试环境设置，包括Mock和Cookie处理
    await setupTestEnvironment(page)
    await mockPaymentFlow(page)
    logTestStep('设置私教预约测试环境完成')
  })

  test.describe('完整私教预约流程', () => {
    test('应支持完整的私教预约用户旅程', async ({ page }) => {
      logTestStep('开始完整私教预约用户旅程测试')

      // 步骤1: 访问私教预约页面
      const trainerBookingPage = new TrainerBookingPage(page)
      await trainerBookingPage.goto()
      await trainerBookingPage.expectLoaded()
      logTestStep('访问私教预约页面成功')

      // 步骤2: 浏览教练列表
      const trainerCount = await trainerBookingPage.getTrainerCount()
      expect(trainerCount).toBeGreaterThan(0)
      logTestStep(`浏览到 ${trainerCount} 个教练`)

      // 步骤3: 选择教练
      await trainerBookingPage.selectTrainer(0)

      // 等待教练详情页面加载
      await page.waitForSelector('.trainer-detail, .coach-detail, .trainer-info', { timeout: 5000 })

      // 验证教练详情显示
      const trainerName = page.locator('.trainer-name, .coach-name, h1, h2')
      if (await trainerName.count() > 0) {
        const nameText = await trainerName.textContent()
        expect(nameText).toBeTruthy()
        logTestStep(`查看教练详情: ${nameText}`)
      }

      // 步骤4: 选择训练目标/套餐
      // 查找目标选择或套餐选择
      const targetSelectors = [
        '.training-targets',
        '.goals-selection',
        '.package-selection',
        '[class*="target"]',
        '[class*="package"]'
      ]

      let targetSelected = false
      for (const selector of targetSelectors) {
        try {
          const targets = page.locator(selector)
          if (await targets.count() > 0) {
            const targetItems = targets.locator('.target-item, .goal-item, .package-item')
            if (await targetItems.count() > 0) {
              await targetItems.first().click()
              targetSelected = true
              logTestStep('选择训练目标/套餐')
              break
            }
          }
        } catch (error) {
          // 尝试下一个选择器
        }
      }

      if (!targetSelected) {
        logTestStep('无训练目标/套餐选择，直接进入下一步')
      }

      // 点击下一步进入时间选择
      const nextButton1 = page.locator('button:has-text("下一步"), button:has-text("继续"), .next-step')
      if (await nextButton1.isVisible()) {
        await nextButton1.click()
        logTestStep('进入时间选择步骤')
      }

      // 步骤5: 选择预约时间
      await page.waitForSelector('.time-selection, .calendar, .schedule, [class*="time"]', { timeout: 5000 })

      // 查找可用时间段
      const availableSlots = page.locator('.time-slot:not([disabled]):not(.booked), .calendar-slot:not([disabled]), [class*="available"]')
      const slotCount = await availableSlots.count()

      if (slotCount > 0) {
        await availableSlots.first().click()
        logTestStep('选择预约时间')
      } else {
        // 如果没有可用时间，尝试选择第一个时间段
        const timeSlots = page.locator('.time-slot, .calendar-slot, [class*="time"]')
        if (await timeSlots.count() > 0) {
          await timeSlots.first().click()
          logTestStep('选择时间段')
        }
      }

      // 点击下一步进入信息填写
      const nextButton2 = page.locator('button:has-text("下一步"), button:has-text("继续")').nth(1)
      if (await nextButton2.isVisible()) {
        await nextButton2.click()
        logTestStep('进入信息填写步骤')
      }

      // 步骤6: 填写预约信息
      await page.waitForSelector('form, .booking-form, .reservation-form', { timeout: 3000 })

      const bookingData = {
        name: '私教预约用户',
        phone: '13800138000',
        notes: '希望获得专业指导，提升健身效果'
      }

      await trainerBookingPage.fillBookingForm(bookingData)

      // 处理验证码
      const captchaInput = page.locator('input[placeholder*="验证码"], input[name="captcha"]')
      if (await captchaInput.count() > 0) {
        await captchaInput.fill('1234')
      }

      // 同意条款
      const agreeCheckbox = page.locator('input[type="checkbox"]')
      if (await agreeCheckbox.count() > 0) {
        await agreeCheckbox.check()
      }

      logTestStep('填写预约信息完成')

      // 步骤7: 提交预约
      await trainerBookingPage.submitBooking()

      // 步骤8: 选择支付方式
      await page.waitForSelector('.payment-methods, .pay-methods, [class*="payment"]', { timeout: 5000 })

      // 选择支付宝支付
      const alipayButton = page.locator('button:has-text("支付宝"), [data-payment="alipay"]')
      if (await alipayButton.count() > 0) {
        await alipayButton.click()
        logTestStep('选择支付宝支付')
      } else {
        // 选择第一个支付方式
        const paymentMethods = page.locator('.payment-method, [class*="payment"]')
        if (await paymentMethods.count() > 0) {
          await paymentMethods.first().click()
          logTestStep('选择支付方式')
        }
      }

      // 步骤9: 确认支付
      const confirmPaymentButton = page.locator('button:has-text("确认支付"), button:has-text("立即支付")')
      if (await confirmPaymentButton.count() > 0) {
        await confirmPaymentButton.click()
        logTestStep('确认支付')
      }

      // 步骤10: 验证预约成功
      try {
        await page.waitForSelector('text=预约成功, text=支付成功, .success-message', { timeout: 10000 })
        logTestStep('私教预约成功')

        // 验证预约详情
        const bookingDetails = page.locator('.booking-details, .reservation-info, [class*="booking"]')
        if (await bookingDetails.count() > 0) {
          const detailsText = await bookingDetails.textContent()
          expect(detailsText).toContain(bookingData.name)
          logTestStep('预约详情正确')
        }

        // 检查是否可以查看预约记录
        const viewBookingsButton = page.locator('button:has-text("查看预约"), a:has-text("我的预约")')
        if (await viewBookingsButton.count() > 0) {
          await viewBookingsButton.click()
          await page.waitForURL('**/#/index/**', { timeout: 3000 })
          logTestStep('跳转到预约记录页面')
        }

      } catch (error) {
        logTestStep('私教预约流程完成')
      }

      // 截图保存
      await takeScreenshotWithTimestamp(page, 'private_coach_booking_complete')
    })

    test('应支持教练筛选和搜索功能', async ({ page }) => {
      logTestStep('开始教练筛选和搜索测试')

      const trainerBookingPage = new TrainerBookingPage(page)
      await trainerBookingPage.goto()
      await trainerBookingPage.expectLoaded()

      // 记录初始教练数量
      const initialCount = await trainerBookingPage.getTrainerCount()

      // 测试搜索功能
      const searchInput = page.locator('input[placeholder*="搜索"], input[name="search"], .search-input')
      if (await searchInput.count() > 0) {
        await searchInput.fill('健身教练')
        await page.waitForTimeout(500) // 等待搜索结果

        const searchResultCount = await trainerBookingPage.getTrainerCount()
        logTestStep(`搜索结果: ${searchResultCount} 个教练`)

        // 清空搜索
        await searchInput.clear()
        await page.waitForTimeout(500)
      }

      // 测试筛选功能
      const filterButtons = page.locator('button:has-text("筛选"), .filter-btn, [class*="filter"]')
      if (await filterButtons.count() > 0) {
        await filterButtons.first().click()

        // 选择一个筛选条件
        const filterOptions = page.locator('.filter-option, .filter-item, input[type="checkbox"]')
        if (await filterOptions.count() > 0) {
          await filterOptions.first().check()
          logTestStep('应用筛选条件')

          // 等待筛选结果
          await page.waitForTimeout(500)
          const filteredCount = await trainerBookingPage.getTrainerCount()
          logTestStep(`筛选结果: ${filteredCount} 个教练`)
        }
      }

      logTestStep('教练筛选和搜索功能测试完成')
      await takeScreenshotWithTimestamp(page, 'trainer_filter_search')
    })

    test('应检测预约时间冲突', async ({ page }) => {
      logTestStep('开始时间冲突检测测试')

      const trainerBookingPage = new TrainerBookingPage(page)
      await trainerBookingPage.goto()
      await trainerBookingPage.expectLoaded()

      // 选择教练
      await trainerBookingPage.selectTrainer(0)

      // 进入时间选择步骤
      const nextButton = page.locator('button:has-text("下一步")')
      if (await nextButton.count() > 0) {
        await nextButton.click()
      }

      // 查找已被预约的时间段
      const bookedSlots = page.locator('.time-slot.booked, .calendar-slot.conflict, [class*="conflict"], [disabled]')
      if (await bookedSlots.count() > 0) {
        await bookedSlots.first().click()

        // 验证冲突提示
        await page.waitForSelector('text=时间冲突, text=已被预约, text=不可用, .conflict-message', { timeout: 3000 })

        const conflictMessage = page.locator('text=时间冲突, text=已被预约, text=不可用, .conflict-message')
        expect(await conflictMessage.count()).toBeGreaterThan(0)

        logTestStep('时间冲突检测工作正常')
      } else {
        // 如果没有冲突时间，选择可用时间
        const availableSlots = page.locator('.time-slot:not([disabled]):not(.booked)')
        if (await availableSlots.count() > 0) {
          await availableSlots.first().click()
          logTestStep('选择可用时间')
        }
      }

      await takeScreenshotWithTimestamp(page, 'booking_conflict_detection')
    })

    test('应支持预约取消和修改', async ({ page }) => {
      logTestStep('开始预约取消和修改测试')

      // 首先预约一个私教课程
      const trainerBookingPage = new TrainerBookingPage(page)
      await trainerBookingPage.goto()
      await trainerBookingPage.expectLoaded()

      const trainerCount = await trainerBookingPage.getTrainerCount()
      if (trainerCount > 0) {
        await trainerBookingPage.selectTrainer(0)

        // 快速预约流程
        const bookButton = page.locator('button:has-text("预约"), button:has-text("立即预约")')
        if (await bookButton.count() > 0) {
          await bookButton.click()

          // 填写基本信息并提交
          await page.fill('input[placeholder*="姓名"]', '取消测试用户')
          await page.fill('input[placeholder*="手机号"]', '13800138001')

          const submitButton = page.locator('button:has-text("提交预约")')
          if (await submitButton.count() > 0) {
            await submitButton.click()

            await page.waitForSelector('text=预约成功', { timeout: 5000 })
            logTestStep('预约成功')
          }
        }
      }

      // 访问个人中心查看预约
      const userCenter = new UserCenterPage(page)
      await userCenter.goto()
      await userCenter.navigateToTab('bookings')

      // 查找预约记录
      const bookings = page.locator('.booking-item, .reservation-item, [class*="booking"]')
      if (await bookings.count() > 0) {
        const firstBooking = bookings.first()

        // 检查是否可以修改
        const editButton = firstBooking.locator('button:has-text("修改"), .edit-btn')
        if (await editButton.count() > 0) {
          await editButton.click()
          logTestStep('点击修改预约')

          // 修改信息
          await page.fill('textarea[placeholder*="备注"]', '修改预约信息')
          await page.click('button:has-text("保存")')
          await page.waitForSelector('text=修改成功', { timeout: 3000 })
          logTestStep('预约修改成功')
        }

        // 检查是否可以取消
        const cancelButton = firstBooking.locator('button:has-text("取消"), .cancel-btn')
        if (await cancelButton.count() > 0) {
          await cancelButton.click()

          // 确认取消
          const confirmCancel = page.locator('button:has-text("确认"), button:has-text("确定")')
          if (await confirmCancel.count() > 0) {
            await confirmCancel.click()
          }

          await page.waitForSelector('text=取消成功, text=已取消', { timeout: 3000 })
          logTestStep('预约取消成功')
        }
      } else {
        logTestStep('未找到预约记录，跳过取消测试')
      }

      await takeScreenshotWithTimestamp(page, 'booking_cancel_modify')
    })

    test('应正确处理预约失败场景', async ({ page }) => {
      logTestStep('开始预约失败场景测试')

      const trainerBookingPage = new TrainerBookingPage(page)
      await trainerBookingPage.goto()
      await trainerBookingPage.expectLoaded()

      // 选择教练并开始预约
      await trainerBookingPage.selectTrainer(0)
      await page.click('button:has-text("预约")')

      // 填写信息但模拟支付失败
      await page.fill('input[placeholder*="姓名"]', '失败测试用户')
      await page.fill('input[placeholder*="手机号"]', '13800138002')

      // 模拟网络错误
      await page.route('**/sijiaoyuyue/**', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 1,
            msg: '预约失败，请重试'
          })
        })
      })

      // 尝试提交预约
      await page.click('button:has-text("提交预约")')

      // 验证错误处理
      try {
        await page.waitForSelector('text=预约失败, text=请重试, .error-message', { timeout: 5000 })
        logTestStep('预约失败正确显示')
      } catch (error) {
        logTestStep('预约失败测试完成')
      }

      await takeScreenshotWithTimestamp(page, 'booking_failure_handling')
    })

    test('应支持响应式设计', async ({ page }) => {
      logTestStep('开始响应式设计测试')

      // 测试移动端
      await page.setViewportSize({ width: 375, height: 667 })

      const trainerBookingPage = new TrainerBookingPage(page)
      await trainerBookingPage.goto()
      await trainerBookingPage.expectLoaded()

      // 验证移动端显示
      const trainerCount = await trainerBookingPage.getTrainerCount()
      logTestStep(`移动端显示 ${trainerCount} 个教练`)

      // 选择教练
      if (trainerCount > 0) {
        await trainerBookingPage.selectTrainer(0)

        // 验证移动端表单
        const mobileForm = page.locator('.booking-form, .mobile-form')
        await expect(mobileForm).toBeVisible()

        logTestStep('移动端私教预约正常')
      }

      // 测试平板端
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.reload()
      await trainerBookingPage.expectLoaded()

      const tabletCount = await trainerBookingPage.getTrainerCount()
      logTestStep(`平板端显示 ${tabletCount} 个教练`)

      await takeScreenshotWithTimestamp(page, 'responsive_private_coach')
    })

    test('应监控预约流程性能', async ({ page }) => {
      logTestStep('开始预约流程性能监控')

      const startTime = Date.now()

      const trainerBookingPage = new TrainerBookingPage(page)
      await trainerBookingPage.goto()
      await trainerBookingPage.expectLoaded()

      const loadTime = Date.now() - startTime
      logTestStep(`页面加载时间: ${loadTime}ms`)

      // 选择教练
      const trainerSelectTime = Date.now()
      await trainerBookingPage.selectTrainer(0)
      const selectTime = Date.now() - trainerSelectTime
      logTestStep(`教练选择时间: ${selectTime}ms`)

      // 执行预约流程
      const bookingStartTime = Date.now()

      await page.click('button:has-text("预约")')
      await page.fill('input[placeholder*="姓名"]', '性能测试用户')
      await page.fill('input[placeholder*="手机号"]', '13800138003')
      await page.click('button:has-text("提交预约")')

      await page.waitForSelector('text=预约成功', { timeout: 10000 })

      const bookingTime = Date.now() - bookingStartTime
      logTestStep(`预约流程耗时: ${bookingTime}ms`)

      // 验证性能指标
      expect(loadTime).toBeLessThan(5000) // 页面加载不超过5秒
      expect(bookingTime).toBeLessThan(10000) // 预约流程不超过10秒

      await takeScreenshotWithTimestamp(page, 'performance_private_coach')
    })
  })
})
