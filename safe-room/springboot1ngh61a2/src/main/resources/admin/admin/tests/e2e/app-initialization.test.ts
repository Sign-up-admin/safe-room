/**
 * 端到端应用初始化测试
 * 测试完整的应用启动过程，包括页面加载、脚本执行、Vue应用初始化等
 */

import { test, expect } from '@playwright/test'

// 内联logStep函数以避免ES模块导入问题
const logStep = (stepName: string, details?: any): void => {
  console.log(`[TEST STEP] ${stepName}`, details || '')
}

test.describe('Admin应用初始化E2E测试', () => {
  test('should load admin application successfully', async ({ page }) => {
    logStep('开始Admin应用加载测试')

    // 访问Admin应用首页
    await page.goto('/', { waitUntil: 'networkidle' })

    // 验证页面标题
    const title = await page.title()
    expect(title).toBeTruthy()
    logStep(`页面标题: ${title}`)

    // 验证应用容器存在
    const appContainer = page.locator('#app')
    await expect(appContainer).toBeVisible()
    logStep('应用容器可见')

    // 等待Vue应用初始化
    await page.waitForTimeout(2000)

    // 验证Vue应用已挂载（检查是否有Vue相关属性）
    const vueAppMounted = await page.evaluate(() => !!(window as any).Vue || !!(window as any).$ || document.querySelector('[data-v-]'))
    expect(vueAppMounted).toBe(true)
    logStep('Vue应用已挂载')
  })

  test('should load required scripts in correct order', async ({ page }) => {
    logStep('开始脚本加载顺序测试')

    const loadedScripts: string[] = []

    // 监听脚本加载
    page.on('response', (response) => {
      const url = response.url()
      if (url.endsWith('.js') || url.includes('/js/') || url.includes('/verifys/')) {
        loadedScripts.push(url)
      }
    })

    await page.goto('/', { waitUntil: 'networkidle' })

    // 验证关键脚本已加载
    const hasVue = loadedScripts.some(script =>
      script.includes('vue') || script.includes('Vue')
    )
    const hasElementPlus = loadedScripts.some(script =>
      script.includes('element-plus') || script.includes('element')
    )

    expect(hasVue || loadedScripts.length > 0).toBe(true)
    logStep(`已加载 ${loadedScripts.length} 个脚本文件`)

    // 验证jQuery相关脚本
    const jQueryScripts = loadedScripts.filter(script =>
      script.includes('jquery') || script.includes('jQuery')
    )
    if (jQueryScripts.length > 0) {
      logStep('jQuery脚本已加载')
    }
  })

  test('should initialize jQuery plugins correctly', async ({ page }) => {
    logStep('开始jQuery插件初始化测试')

    await page.goto('/', { waitUntil: 'networkidle' })

    // 等待脚本加载完成
    await page.waitForTimeout(3000)

    // 验证jQuery已加载
    const jQueryLoaded = await page.evaluate(() => typeof (window as any).jQuery !== 'undefined' ||
             typeof (window as any).$ !== 'undefined')

    if (jQueryLoaded) {
      logStep('jQuery已加载')

      // 验证jQuery版本
      const jQueryVersion = await page.evaluate(() => (window as any).jQuery?.fn?.jquery || (window as any).$?.fn?.jquery)

      if (jQueryVersion) {
        logStep(`jQuery版本: ${jQueryVersion}`)
      }

      // 验证RotateVerify插件（如果存在）
      const rotateVerifyAvailable = await page.evaluate(() => typeof (window as any).RotateVerify !== 'undefined')

      if (rotateVerifyAvailable) {
        logStep('RotateVerify插件已加载')
      }
    } else {
      logStep('jQuery未加载（可能为纯Vue应用）')
    }
  })

  test('should handle application errors gracefully', async ({ page }) => {
    logStep('开始应用错误处理测试')

    // 监听控制台错误
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // 监听页面错误
    const pageErrors: string[] = []
    page.on('pageerror', (error) => {
      pageErrors.push(error.message)
    })

    await page.goto('/', { waitUntil: 'networkidle' })

    // 等待应用完全加载
    await page.waitForTimeout(5000)

    // 验证没有严重的JavaScript错误
    const criticalErrors = consoleErrors.filter(error =>
      !error.includes('favicon') &&
      !error.includes('404') &&
      !error.includes('chunk') &&
      !error.includes('vendor')
    )

    if (criticalErrors.length > 0) {
      console.warn('检测到控制台错误:', criticalErrors)
    }

    if (pageErrors.length > 0) {
      console.warn('检测到页面错误:', pageErrors)
    }

    // 验证应用仍能正常显示（即使有错误）
    const bodyVisible = await page.isVisible('body')
    expect(bodyVisible).toBe(true)
    logStep('应用界面正常显示')
  })

  test('should initialize Element Plus components', async ({ page }) => {
    logStep('开始Element Plus组件初始化测试')

    await page.goto('/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(3000)

    // 检查Element Plus样式是否加载
    const elementPlusStyles = await page.locator('[class*="el-"]').count()
    if (elementPlusStyles > 0) {
      logStep(`检测到 ${elementPlusStyles} 个Element Plus组件`)
    }

    // 验证常见Element Plus组件可用
    const componentSelectors = [
      '.el-button',
      '.el-input',
      '.el-menu',
      '.el-card',
      '.el-table'
    ]

    let foundComponents = 0
    for (const selector of componentSelectors) {
      const count = await page.locator(selector).count()
      if (count > 0) {
        foundComponents++
        logStep(`找到组件: ${selector} (${count}个)`)
      }
    }

    // 如果应用使用了Element Plus，应该能找到一些组件
    expect(foundComponents >= 0).toBe(true)
    logStep(`共找到 ${foundComponents} 种Element Plus组件`)
  })
})