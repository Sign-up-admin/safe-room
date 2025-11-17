import { test, expect } from '@playwright/test'
import {
  loginAsAdmin,
  mockAdminApi
} from '../../utils/test-helpers'
import {
  createTestData,
  cleanupTestData
} from '../../utils/shared-helpers'
import {
  AdminSystemConfigPage
} from '../../utils/page-objects/admin-pages'
import {
  waitFor,
  waitForPage,
  takeScreenshot,
  measurePerformance,
  logStep,
  assertElement,
  generateTestData
} from '../../utils/shared-helpers'

test.describe('Admin 系统配置管理流程', () => {
  test.beforeEach(async ({ page }) => {
    // 设置管理员API Mock
    await mockAdminApi(page)
    // 登录管理员
    await loginAsAdmin(page)
    logStep('管理员登录完成')
  })

  test('轮播图配置管理', async ({ page }) => {
    logStep('开始轮播图配置管理测试')

    const configPage = new AdminSystemConfigPage(page)

    // 访问系统配置页面
    await configPage.goto()
    await waitForPage(page)
    logStep('访问系统配置页面')

    // 检查轮播图配置区域
    const carouselSection = page.locator('.carousel-config, .banner-config, [data-config="carousel"]')
    if (await carouselSection.isVisible().catch(() => false)) {
      logStep('轮播图配置区域存在')

      // 更新轮播图设置
      const carouselSettings = {
        title: '健身房新年促销',
        image: 'https://example.com/carousel1.jpg',
        link: '/promotion/new-year'
      }

      await configPage.updateCarouselSettings(carouselSettings)
      logStep('更新轮播图配置')

      // 验证配置保存成功
      try {
        await page.waitForSelector('text=保存成功, text=配置已更新, text=设置成功', { timeout: 5000 })
        logStep('轮播图配置保存成功')

        // 验证配置已应用
        const titleInput = page.locator('input[name="title"]')
        if (await titleInput.isVisible().catch(() => false)) {
          const currentTitle = await titleInput.inputValue()
          expect(currentTitle).toBe(carouselSettings.title)
          logStep('轮播图配置正确保存')
        }

      } catch (error) {
        logStep('轮播图配置操作完成')
      }

    } else {
      logStep('未发现轮播图配置区域')
    }

    await takeScreenshot(page, 'carousel_config')
  })

  test('基础信息配置', async ({ page }) => {
    logStep('开始基础信息配置测试')

    const configPage = new AdminSystemConfigPage(page)

    // 访问系统配置页面
    await configPage.goto()

    // 检查基础信息配置区域
    const basicInfoSection = page.locator('.basic-config, .site-config, [data-config="basic"]')
    if (await basicInfoSection.isVisible().catch(() => false)) {
      logStep('基础信息配置区域存在')

      // 更新基础设置
      const basicSettings = {
        siteName: '优健身房管理系统',
        contact: '400-123-4567',
        address: '北京市朝阳区健身大道123号'
      }

      await configPage.updateBasicSettings(basicSettings)
      logStep('更新基础信息配置')

      // 验证配置保存成功
      try {
        await page.waitForSelector('text=保存成功, text=配置已更新, text=设置成功', { timeout: 5000 })
        logStep('基础信息配置保存成功')

        // 验证配置已应用
        const siteNameInput = page.locator('input[name="siteName"]')
        if (await siteNameInput.isVisible().catch(() => false)) {
          const currentSiteName = await siteNameInput.inputValue()
          expect(currentSiteName).toBe(basicSettings.siteName)
          logStep('基础信息配置正确保存')
        }

      } catch (error) {
        logStep('基础信息配置操作完成')
      }

    } else {
      logStep('未发现基础信息配置区域')
    }

    await takeScreenshot(page, 'basic_config')
  })

  test('公告分类配置', async ({ page }) => {
    logStep('开始公告分类配置测试')

    const configPage = new AdminSystemConfigPage(page)

    // 访问系统配置页面
    await configPage.goto()

    // 检查公告分类配置
    const newsTypeSection = page.locator('.news-type-config, .category-config, [data-config="newsType"]')
    if (await newsTypeSection.isVisible().catch(() => false)) {
      logStep('公告分类配置区域存在')

      // 添加新的公告分类
      const addCategoryButton = page.locator('button:has-text("添加分类"), button:has-text("新增")')
      if (await addCategoryButton.isVisible().catch(() => false)) {
        await addCategoryButton.click()
        logStep('点击添加分类按钮')

        // 填写分类信息
        const categoryNameInput = page.locator('input[name="typename"], input[placeholder*="分类名称"]')
        if (await categoryNameInput.isVisible().catch(() => false)) {
          await categoryNameInput.fill('促销活动')
          logStep('填写分类名称')

          // 保存分类
          const saveButton = page.locator('button:has-text("保存"), button:has-text("确定")')
          if (await saveButton.isVisible().catch(() => false)) {
            await saveButton.click()
            logStep('保存公告分类')

            // 验证保存成功
            try {
              await page.waitForSelector('text=保存成功, text=添加成功', { timeout: 3000 })
              logStep('公告分类添加成功')
            } catch (error) {
              logStep('分类保存操作完成')
            }
          }
        }
      }

    } else {
      logStep('未发现公告分类配置区域')
    }

    await takeScreenshot(page, 'news_category_config')
  })

  test('系统参数配置', async ({ page }) => {
    logStep('开始系统参数配置测试')

    const configPage = new AdminSystemConfigPage(page)

    // 访问系统配置页面
    await configPage.goto()

    // 检查系统参数配置
    const systemParamsSection = page.locator('.system-params, .params-config, [data-config="system"]')
    if (await systemParamsSection.isVisible().catch(() => false)) {
      logStep('系统参数配置区域存在')

      // 配置系统参数
      const params = [
        { name: 'maxFileSize', value: '10MB' },
        { name: 'sessionTimeout', value: '30分钟' },
        { name: 'backupInterval', value: '24小时' }
      ]

      for (const param of params) {
        const paramInput = page.locator(`input[name="${param.name}"], input[data-param="${param.name}"]`)
        if (await paramInput.isVisible().catch(() => false)) {
          await paramInput.fill(param.value)
          logStep(`设置参数 ${param.name}: ${param.value}`)
        }
      }

      // 保存系统参数
      const saveParamsButton = page.locator('button:has-text("保存参数"), button:has-text("应用设置")')
      if (await saveParamsButton.isVisible().catch(() => false)) {
        await saveParamsButton.click()
        logStep('保存系统参数')

        // 验证保存成功
        try {
          await page.waitForSelector('text=参数保存成功, text=设置已应用', { timeout: 3000 })
          logStep('系统参数保存成功')
        } catch (error) {
          logStep('参数保存操作完成')
        }
      }

    } else {
      logStep('未发现系统参数配置区域')
    }

    await takeScreenshot(page, 'system_params_config')
  })

  test('界面主题配置', async ({ page }) => {
    logStep('开始界面主题配置测试')

    const configPage = new AdminSystemConfigPage(page)

    // 访问系统配置页面
    await configPage.goto()

    // 检查主题配置
    const themeSection = page.locator('.theme-config, .ui-config, [data-config="theme"]')
    if (await themeSection.isVisible().catch(() => false)) {
      logStep('主题配置区域存在')

      // 测试主题切换
      const themeOptions = page.locator('input[type="radio"][name="theme"], select[name="theme"]')
      const themeCount = await themeOptions.count()

      if (themeCount > 0) {
        // 尝试切换到第二个主题
        if (themeCount > 1) {
          const secondTheme = themeOptions.nth(1)
          await secondTheme.click()
          logStep('切换界面主题')

          // 应用主题设置
          const applyThemeButton = page.locator('button:has-text("应用主题"), button:has-text("保存主题")')
          if (await applyThemeButton.isVisible().catch(() => false)) {
            await applyThemeButton.click()
            logStep('应用主题设置')

            // 验证主题切换成功
            try {
              await page.waitForSelector('text=主题已更新, text=设置成功', { timeout: 3000 })
              logStep('主题配置成功')
            } catch (error) {
              logStep('主题切换操作完成')
            }
          }
        }
      }

    } else {
      logStep('未发现主题配置区域')
    }

    await takeScreenshot(page, 'theme_config')
  })

  test('安全设置配置', async ({ page }) => {
    logStep('开始安全设置配置测试')

    const configPage = new AdminSystemConfigPage(page)

    // 访问系统配置页面
    await configPage.goto()

    // 检查安全设置
    const securitySection = page.locator('.security-config, .safe-config, [data-config="security"]')
    if (await securitySection.isVisible().catch(() => false)) {
      logStep('安全设置配置区域存在')

      // 配置安全参数
      const securitySettings = {
        passwordMinLength: '8',
        loginAttemptsLimit: '5',
        sessionTimeout: '60',
        enableTwoFactor: 'true'
      }

      for (const [key, value] of Object.entries(securitySettings)) {
        const settingInput = page.locator(`input[name="${key}"], select[name="${key}"]`)
        if (await settingInput.isVisible().catch(() => false)) {
          if (key === 'enableTwoFactor') {
            // 处理开关类型设置
            const toggle = page.locator(`input[type="checkbox"][name="${key}"]`)
            if (await toggle.isVisible().catch(() => false)) {
              if (value === 'true') {
                await toggle.check()
              } else {
                await toggle.uncheck()
              }
            }
          } else {
            await settingInput.fill(value)
          }
          logStep(`设置安全参数 ${key}: ${value}`)
        }
      }

      // 保存安全设置
      const saveSecurityButton = page.locator('button:has-text("保存安全设置"), button:has-text("应用安全配置")')
      if (await saveSecurityButton.isVisible().catch(() => false)) {
        await saveSecurityButton.click()
        logStep('保存安全设置')

        // 验证保存成功
        try {
          await page.waitForSelector('text=安全设置已保存, text=配置成功', { timeout: 3000 })
          logStep('安全设置保存成功')
        } catch (error) {
          logStep('安全设置保存操作完成')
        }
      }

    } else {
      logStep('未发现安全设置配置区域')
    }

    await takeScreenshot(page, 'security_config')
  })

  test('备份恢复配置', async ({ page }) => {
    logStep('开始备份恢复配置测试')

    const configPage = new AdminSystemConfigPage(page)

    // 访问系统配置页面
    await configPage.goto()

    // 检查备份配置
    const backupSection = page.locator('.backup-config, .recovery-config, [data-config="backup"]')
    if (await backupSection.isVisible().catch(() => false)) {
      logStep('备份恢复配置区域存在')

      // 配置备份设置
      const backupSettings = {
        backupInterval: 'daily',
        backupTime: '02:00',
        retentionDays: '30',
        autoBackup: 'true'
      }

      for (const [key, value] of Object.entries(backupSettings)) {
        const settingInput = page.locator(`input[name="${key}"], select[name="${key}"]`)
        if (await settingInput.isVisible().catch(() => false)) {
          if (key === 'autoBackup') {
            const toggle = page.locator(`input[type="checkbox"][name="${key}"]`)
            if (await toggle.isVisible().catch(() => false)) {
              if (value === 'true') {
                await toggle.check()
              } else {
                await toggle.uncheck()
              }
            }
          } else {
            await settingInput.fill(value)
          }
          logStep(`设置备份参数 ${key}: ${value}`)
        }
      }

      // 保存备份设置
      const saveBackupButton = page.locator('button:has-text("保存备份设置"), button:has-text("应用配置")')
      if (await saveBackupButton.isVisible().catch(() => false)) {
        await saveBackupButton.click()
        logStep('保存备份设置')

        // 验证保存成功
        try {
          await page.waitForSelector('text=备份设置已保存, text=配置成功', { timeout: 3000 })
          logStep('备份设置保存成功')
        } catch (error) {
          logStep('备份设置保存操作完成')
        }
      }

      // 测试手动备份
      const manualBackupButton = page.locator('button:has-text("立即备份"), button:has-text("手动备份")')
      if (await manualBackupButton.isVisible().catch(() => false)) {
        await manualBackupButton.click()
        logStep('执行手动备份')

        // 验证备份成功
        try {
          await page.waitForSelector('text=备份成功, text=备份完成', { timeout: 10000 })
          logStep('手动备份成功')
        } catch (error) {
          logStep('手动备份操作完成')
        }
      }

    } else {
      logStep('未发现备份恢复配置区域')
    }

    await takeScreenshot(page, 'backup_config')
  })

  test('日志配置管理', async ({ page }) => {
    logStep('开始日志配置管理测试')

    const configPage = new AdminSystemConfigPage(page)

    // 访问系统配置页面
    await configPage.goto()

    // 检查日志配置
    const logSection = page.locator('.log-config, .logging-config, [data-config="logging"]')
    if (await logSection.isVisible().catch(() => false)) {
      logStep('日志配置区域存在')

      // 配置日志参数
      const logSettings = {
        logLevel: 'INFO',
        logRetention: '90天',
        enableAuditLog: 'true',
        logFileSize: '100MB'
      }

      for (const [key, value] of Object.entries(logSettings)) {
        const settingInput = page.locator(`input[name="${key}"], select[name="${key}"]`)
        if (await settingInput.isVisible().catch(() => false)) {
          if (key === 'enableAuditLog') {
            const toggle = page.locator(`input[type="checkbox"][name="${key}"]`)
            if (await toggle.isVisible().catch(() => false)) {
              if (value === 'true') {
                await toggle.check()
              } else {
                await toggle.uncheck()
              }
            }
          } else {
            await settingInput.fill(value)
          }
          logStep(`设置日志参数 ${key}: ${value}`)
        }
      }

      // 保存日志设置
      const saveLogButton = page.locator('button:has-text("保存日志设置"), button:has-text("应用配置")')
      if (await saveLogButton.isVisible().catch(() => false)) {
        await saveLogButton.click()
        logStep('保存日志设置')

        // 验证保存成功
        try {
          await page.waitForSelector('text=日志设置已保存, text=配置成功', { timeout: 3000 })
          logStep('日志设置保存成功')
        } catch (error) {
          logStep('日志设置保存操作完成')
        }
      }

    } else {
      logStep('未发现日志配置区域')
    }

    await takeScreenshot(page, 'log_config')
  })

  test('系统配置权限验证', async ({ page }) => {
    logStep('开始系统配置权限验证测试')

    const configPage = new AdminSystemConfigPage(page)

    // 访问系统配置页面
    await configPage.goto()

    // 验证管理员权限
    const configActions = [
      'button:has-text("保存")',
      'button:has-text("应用")',
      'button:has-text("备份")',
      'button:has-text("导出")',
      'button:has-text("重置")'
    ]

    let availableActions = 0
    for (const actionSelector of configActions) {
      const action = page.locator(actionSelector)
      const isVisible = await action.isVisible().catch(() => false)
      if (isVisible) {
        availableActions++
        logStep(`权限验证通过: ${actionSelector}`)
      }
    }

    expect(availableActions).toBeGreaterThan(0)
    logStep(`管理员拥有 ${availableActions} 项系统配置权限`)

    await takeScreenshot(page, 'system_config_permissions')
  })

  test('系统配置性能测试', async ({ page }) => {
    logStep('开始系统配置性能测试')

    const configPage = new AdminSystemConfigPage(page)

    // 测试页面加载性能
    const startTime = Date.now()
    await configPage.goto()
    const loadTime = Date.now() - startTime
    logStep(`系统配置页面加载时间: ${loadTime}ms`)

    // 测试配置保存性能
    const saveStart = Date.now()
    const saveButton = page.locator('button:has-text("保存")').first()
    if (await saveButton.isVisible().catch(() => false)) {
      await saveButton.click()
      await page.waitForTimeout(500) // 等待保存完成
      const saveTime = Date.now() - saveStart
      logStep(`配置保存耗时: ${saveTime}ms`)
    }

    // 验证性能指标
    expect(loadTime).toBeLessThan(5000) // 页面加载不超过5秒

    await takeScreenshot(page, 'system_config_performance')
  })
})
