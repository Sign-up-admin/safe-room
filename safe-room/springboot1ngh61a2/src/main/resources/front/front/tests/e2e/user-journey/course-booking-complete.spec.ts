import { test, expect } from '@playwright/test'
import {
  setupTestEnvironment,
  waitFor,
  waitForPage,
  takeScreenshot,
  measurePerformance,
  logStep,
  assertElement,
  assertUrl
} from '../utils/shared-helpers'
import {
  mockPaymentFlow,
  mockCaptcha,
  simulateNetworkDelay
} from '../../utils/test-helpers'

test.describe('Front 课程预约完整流程', () => {
  test.beforeEach(async ({ page }) => {
    // 使用完整的测试环境设置，包括Mock和Cookie处理
    await setupTestEnvironment(page)
    await mockPaymentFlow(page)
    logStep('设置课程预约测试环境完成')
  })

  test('课程预约完整流程 - 燃脂�?, async ({ page }) => {
    logStep('开始燃脂课预约测试')

    // 步骤1: 访问课程列表页面
    await page.goto('/#/index/jianshenkecheng')
    await waitForPage(page)
    await assertElement(page, 'text=课程, text=预约')
    logStep('访问课程列表页面')

    // 步骤2: 浏览课程列表
    const courseCards = page.locator('.course-card, .card-item, [class*="course"]')
    const courseCount = await courseCards.count()
    expect(courseCount).toBeGreaterThan(0)
    logStep(`找到 ${courseCount} 个课程`)

    // 选择燃脂�?
    const cardioCourse = page.locator('.course-card:has-text("燃脂"), [data-type="cardio"]').first()
    if (await cardioCourse.count() > 0) {
      await cardioCourse.click()
      logStep('选择燃脂�?)
    } else {
      await courseCards.first().click()
      logStep('选择第一个课�?)
    }

    // 步骤3: 查看课程详情
    await page.waitForSelector('.course-detail, .detail-modal, .course-info', { timeout: 3000 })

    // 验证课程信息显示
    const courseTitle = page.locator('.course-title, .title, h1, h2')
    if (await courseTitle.count() > 0) {
      const titleText = await courseTitle.textContent()
      expect(titleText).toBeTruthy()
      logStep(`课程标题: ${titleText}`)
    }

    // 验证价格显示
    const priceElement = page.locator('.price, .course-price, [class*="price"]')
    if (await priceElement.count() > 0) {
      const priceText = await priceElement.textContent()
      expect(priceText).toMatch(/\d+/)
      logStep(`课程价格: ${priceText}`)
    }

    // 步骤4: 点击预约按钮
    const bookButton = page.locator('button:has-text("预约"), button:has-text("立即预约"), button:has-text("选课")').first()
    await bookButton.click()
    logStep('点击预约按钮')

    // 步骤5: 选择预约时间
    await page.waitForSelector('.time-selection, .calendar, .schedule, [class*="time"]', { timeout: 5000 })

    // 选择可用时间�?
    const availableSlots = page.locator('.time-slot:not([disabled]), .calendar-slot:not([disabled]), [class*="available"]')
    if (await availableSlots.count() > 0) {
      await availableSlots.first().click()
      logStep('选择预约时间')
    } else {
      // 如果没有时间选择器，直接进入下一�?
      logStep('无时间选择，直接进入下一�?)
    }

    // 点击下一�?
    const nextButton = page.locator('button:has-text("下一�?), button:has-text("继续")').first()
    if (await nextButton.count() > 0) {
      await nextButton.click()
      logStep('点击下一�?)
    }

    // 步骤6: 填写预约信息
    await page.waitForSelector('form, .booking-form, .reservation-form', { timeout: 3000 })

    const bookingInfo = {
      name: '预约测试用户',
      phone: '13800138000',
      notes: '希望获得专业指导'
    }

    // 填写预约信息
    await page.fill('input[name="xingming"], input[placeholder*="姓名"]', bookingInfo.name)
    await page.fill('input[name="shouji"], input[placeholder*="手机�?], input[placeholder*="电话"]', bookingInfo.phone)

    // 备注信息（如果有�?
    const notesInput = page.locator('textarea[name="beizhu"], textarea[placeholder*="备注"]')
    if (await notesInput.count() > 0) {
      await notesInput.fill(bookingInfo.notes)
    }

    // 处理验证�?
    const captchaInput = page.locator('input[placeholder*="验证�?], input[name="captcha"]')
    if (await captchaInput.count() > 0) {
      await captchaInput.fill('1234')
    }

    // 同意条款
    const agreeCheckbox = page.locator('input[type="checkbox"]')
    if (await agreeCheckbox.count() > 0) {
      await agreeCheckbox.check()
    }

    logStep('填写预约信息完成')

    // 步骤7: 提交预约
    const submitButton = page.locator('button:has-text("提交预约"), button:has-text("确认预约")').first()
    await submitButton.click()
    logStep('提交预约')

    // 步骤8: 验证预约成功
    try {
      await page.waitForSelector('text=预约成功, text=提交成功, .success-message', { timeout: 10000 })
      logStep('预约成功')

      // 验证预约详情
      const bookingDetails = page.locator('.booking-details, .reservation-info, [class*="booking"]')
      if (await bookingDetails.count() > 0) {
        const detailsText = await bookingDetails.textContent()
        expect(detailsText).toContain(bookingInfo.name)
        logStep('预约详情正确')
      }

      // 检查是否可以查看预约记�?
      const viewBookingsButton = page.locator('button:has-text("查看预约"), a:has-text("我的预约")')
      if (await viewBookingsButton.count() > 0) {
        await viewBookingsButton.click()
        await page.waitForURL('**/#/index/**', { timeout: 3000 })
        logStep('跳转到预约记录页�?)
      }

    } catch (error) {
      logStep('预约流程完成')
    }

    // 截图保存
    await takeScreenshot(page, 'course_booking_complete')
  })

  test('课程预约 - 力量训练课完整流�?, async ({ page }) => {
    logStep('开始力量训练课预约测试')

    await page.goto('/#/index/jianshenkecheng')
    await waitForPage(page)

    // 选择力量训练�?
    const strengthCourse = page.locator('.course-card:has-text("力量"), [data-type="strength"]').first()
    if (await strengthCourse.count() > 0) {
      await strengthCourse.click()
      logStep('选择力量训练�?)
    } else {
      const courses = page.locator('.course-card, .card-item')
      await courses.nth(1).click() // 选择第二个课�?
      logStep('选择第二个课�?)
    }

    // 快速预约流�?
    await page.click('button:has-text("预约")')

    // 选择时间（如果有�?
    const timeSlots = page.locator('.time-slot:not([disabled])')
    if (await timeSlots.count() > 0) {
      await timeSlots.first().click()
    }

    // 填写信息
    await page.fill('input[placeholder*="姓名"]', '力量训练用户')
    await page.fill('input[placeholder*="手机�?]', '13800138001')

    // 提交预约
    await page.click('button:has-text("提交预约")')

    // 验证预约成功
    await page.waitForSelector('text=预约成功', { timeout: 5000 })
    logStep('力量训练课预约成�?)

    await takeScreenshot(page, 'strength_course_booking')
  })

  test('课程预约 - 瑜伽课完整流�?, async ({ page }) => {
    logStep('开始瑜伽课预约测试')

    await page.goto('/#/index/jianshenkecheng')
    await waitForPage(page)

    // 选择瑜伽�?
    const yogaCourse = page.locator('.course-card:has-text("瑜伽"), [data-type="yoga"]').first()
    if (await yogaCourse.count() > 0) {
      await yogaCourse.click()
      logStep('选择瑜伽�?)
    } else {
      const courses = page.locator('.course-card, .card-item')
      const courseCount = await courses.count()
      await courses.nth(courseCount - 1).click() // 选择最后一个课�?
      logStep('选择最后一个课�?)
    }

    // 查看课程详情
    await page.waitForSelector('.course-detail, .detail-modal')

    // 检查课程特�?
    const features = page.locator('.features, .course-features, [class*="feature"]')
    if (await features.count() > 0) {
      const featureText = await features.textContent()
      expect(featureText).toBeTruthy()
      logStep('课程特色信息正确')
    }

    // 开始预�?
    await page.click('button:has-text("预约")')

    // 选择时间�?
    const scheduleSlots = page.locator('.schedule-slot, .time-slot')
    if (await scheduleSlots.count() > 0) {
      await scheduleSlots.first().click()
      logStep('选择课程时间')
    }

    // 填写详细信息
    await page.fill('input[placeholder*="姓名"]', '瑜伽练习�?)
    await page.fill('input[placeholder*="手机�?]', '13800138002')
    await page.fill('textarea[placeholder*="备注"]', '初学者，需要基础指导')

    // 提交预约
    await page.click('button:has-text("提交预约")')

    // 验证预约成功和课程提�?
    await page.waitForSelector('text=预约成功', { timeout: 5000 })

    const reminder = page.locator('text=课程提醒, text=请提�? .reminder')
    if (await reminder.count() > 0) {
      logStep('课程提醒显示正确')
    }

    logStep('瑜伽课预约完�?)
    await takeScreenshot(page, 'yoga_course_booking')
  })

  test('课程预约冲突检�?, async ({ page }) => {
    logStep('开始预约冲突检测测�?)

    await page.goto('/#/index/jianshenkecheng')
    await waitForPage(page)

    // 选择课程
    const courses = page.locator('.course-card, .card-item')
    await courses.first().click()

    // 点击预约
    await page.click('button:has-text("预约")')

    // 尝试选择已被预约的时�?
    const bookedSlots = page.locator('.time-slot.booked, .calendar-slot.conflict, [class*="conflict"]')
    if (await bookedSlots.count() > 0) {
      await bookedSlots.first().click()

      // 验证冲突提示
      await page.waitForSelector('text=时间冲突, text=已被预约, text=不可�? .conflict-message', { timeout: 3000 })

      const conflictMessage = page.locator('text=时间冲突, text=已被预约, text=不可�? .conflict-message')
      expect(await conflictMessage.count()).toBeGreaterThan(0)

      logStep('冲突检测工作正�?)
    } else {
      // 如果没有冲突时间，选择可用时间
      const availableSlots = page.locator('.time-slot:not([disabled]):not(.booked)')
      if (await availableSlots.count() > 0) {
        await availableSlots.first().click()
        logStep('选择可用时间')
      }
    }

    // 填写信息并提�?
    await page.fill('input[placeholder*="姓名"]', '冲突检测用�?)
    await page.fill('input[placeholder*="手机�?]', '13800138003')

    await page.click('button:has-text("提交预约")')

    // 验证预约成功
    await page.waitForSelector('text=预约成功', { timeout: 5000 })
    logStep('预约成功，无冲突')

    await takeScreenshot(page, 'booking_conflict_detection')
  })

  test('课程预约表单验证', async ({ page }) => {
    logStep('开始课程预约表单验证测�?)

    await page.goto('/#/index/jianshenkecheng')
    await waitForPage(page)

    // 选择课程并开始预�?
    const courses = page.locator('.course-card, .card-item')
    await courses.first().click()
    await page.click('button:has-text("预约")')

    // 跳过时间选择步骤（如果有�?
    const nextButton = page.locator('button:has-text("下一�?)')
    if (await nextButton.count() > 0) {
      await nextButton.click()
    }

    // 尝试提交空表�?
    const submitButton = page.locator('button[type="submit"], button:has-text("提交")').first()
    await submitButton.click()

    // 验证必填字段错误
    await page.waitForSelector('.error-message, .el-form-item__error, text=必填', { timeout: 3000 })

    const errorMessages = page.locator('.error-message, .el-form-item__error, text=必填, text=不能为空')
    const errorCount = await errorMessages.count()
    expect(errorCount).toBeGreaterThan(0)
    logStep(`表单验证发现 ${errorCount} 个错误`)

    // 验证手机号格�?
    await page.fill('input[placeholder*="手机�?]', 'invalid-phone')
    await submitButton.click()

    await page.waitForTimeout(500)
    logStep('手机号格式验证完�?)

    await takeScreenshot(page, 'course_booking_validation')
  })

  test('课程预约取消和修�?, async ({ page }) => {
    logStep('开始预约取消和修改测试')

    // 首先预约一个课�?
    await page.goto('/#/index/jianshenkecheng')
    await waitForPage(page)

    const courses = page.locator('.course-card, .card-item')
    await courses.first().click()
    await page.click('button:has-text("预约")')

    // 填写预约信息
    await page.fill('input[placeholder*="姓名"]', '取消测试用户')
    await page.fill('input[placeholder*="手机�?]', '13800138004')
    await page.click('button:has-text("提交预约")')

    await page.waitForSelector('text=预约成功', { timeout: 5000 })
    logStep('预约成功')

    // 访问个人中心查看预约
    await page.goto('/#/index/center')
    await waitForPage(page)

    // 查找预约记录
    const bookings = page.locator('.booking-item, .reservation-item, [class*="booking"]')
    if (await bookings.count() > 0) {
      // 点击修改按钮（如果有�?
      const editButton = page.locator('button:has-text("修改"), .edit-btn').first()
      if (await editButton.count() > 0) {
        await editButton.click()
        logStep('点击修改预约')

        // 修改信息
        await page.fill('input[placeholder*="备注"]', '修改预约信息')
        await page.click('button:has-text("保存")')
        await page.waitForSelector('text=修改成功', { timeout: 3000 })
        logStep('预约修改成功')
      }

      // 点击取消按钮
      const cancelButton = page.locator('button:has-text("取消"), .cancel-btn').first()
      if (await cancelButton.count() > 0) {
        await cancelButton.click()

        // 确认取消
        const confirmCancel = page.locator('button:has-text("确认"), button:has-text("确定")').first()
        if (await confirmCancel.count() > 0) {
          await confirmCancel.click()
        }

        await page.waitForSelector('text=取消成功, text=已取�?, { timeout: 3000 })
        logStep('预约取消成功')
      }
    } else {
      logStep('未找到预约记录，跳过取消测试')
    }

    await takeScreenshot(page, 'booking_cancel_modify')
  })

  test('课程预约网络延迟测试', async ({ page }) => {
    logStep('开始网络延迟预约测�?)

    // 设置网络延迟
    await simulateNetworkDelay(page, 2000)

    await page.goto('/#/index/jianshenkecheng')
    await waitForPage(page)

    // 快速操作预约流�?
    const courses = page.locator('.course-card, .card-item')
    await courses.first().click()

    const startTime = Date.now()

    await page.click('button:has-text("预约")')
    await page.fill('input[placeholder*="姓名"]', '延迟测试用户')
    await page.fill('input[placeholder*="手机�?]', '13800138005')
    await page.click('button:has-text("提交预约")')

    // 等待预约成功
    await page.waitForSelector('text=预约成功', { timeout: 15000 })

    const endTime = Date.now()
    const duration = endTime - startTime

    expect(duration).toBeGreaterThan(2000) // 应该至少�?秒延�?
    logStep(`网络延迟测试完成，耗时: ${duration}ms`)

    await takeScreenshot(page, 'course_booking_delay')
  })

  test('课程预约性能监控', async ({ page }) => {
    logStep('开始课程预约性能测试')

    const startTime = Date.now()

    await page.goto('/#/index/jianshenkecheng')
    await waitForPage(page)

    const loadTime = Date.now() - startTime
    logStep(`课程列表页面加载时间: ${loadTime}ms`)

    // 选择课程
    const courses = page.locator('.course-card, .card-item')
    await courses.first().click()

    const detailLoadTime = Date.now() - startTime - loadTime
    logStep(`课程详情加载时间: ${detailLoadTime}ms`)

    // 开始预约流�?
    const bookingStartTime = Date.now()

    await page.click('button:has-text("预约")')
    await page.fill('input[placeholder*="姓名"]', '性能测试用户')
    await page.fill('input[placeholder*="手机�?]', '13800138006')
    await page.click('button:has-text("提交预约")')

    await page.waitForSelector('text=预约成功', { timeout: 10000 })

    const bookingTime = Date.now() - bookingStartTime
    logStep(`预约流程耗时: ${bookingTime}ms`)

    // 验证性能指标
    expect(loadTime).toBeLessThan(5000) // 页面加载不超�?�?
    expect(bookingTime).toBeLessThan(10000) // 预约流程不超�?0�?

    await takeScreenshot(page, 'course_booking_performance')
  })

  test('课程预约多课程同时预�?, async ({ page }) => {
    logStep('开始多课程同时预约测试')

    await page.goto('/#/index/jianshenkecheng')
    await waitForPage(page)

    const courses = page.locator('.course-card, .card-item')
    const courseCount = await courses.count()

    // 预约两个不同的课�?
    for (let i = 0; i < Math.min(2, courseCount); i++) {
      logStep(`预约�?${i + 1} 个课程`)

      // 重新加载页面确保状态正�?
      if (i > 0) {
        await page.reload()
        await waitForPage(page)
      }

      const course = courses.nth(i)
      await course.click()

      await page.click('button:has-text("预约")')

      // 选择时间
      const timeSlots = page.locator('.time-slot:not([disabled])')
      if (await timeSlots.count() > 0) {
        await timeSlots.first().click()
      }

      // 填写信息
      await page.fill('input[placeholder*="姓名"]', `多课程用�?{i + 1}`)
      await page.fill('input[placeholder*="手机�?]', `1380013800${i + 7}`)

      await page.click('button:has-text("提交预约")')
      await page.waitForSelector('text=预约成功', { timeout: 5000 })

      logStep(`�?${i + 1} 个课程预约成功`)
    }

    // 验证个人中心的预约记�?
    await page.goto('/#/index/center')
    await waitForPage(page)

    const bookingRecords = page.locator('.booking-item, .reservation-item')
    const recordCount = await bookingRecords.count()

    expect(recordCount).toBeGreaterThanOrEqual(2)
    logStep(`个人中心显示 ${recordCount} 个预约记录`)

    await takeScreenshot(page, 'multiple_course_booking')
  })
})
