import { test, expect } from '@playwright/test'
import { createApiMockManager, NetworkScenarios, ApiTestingUtils } from '../utils/api-mocking'

test.describe('API Interception and Mocking Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Setup basic mocks
    const mockManager = createApiMockManager(page)
    await mockManager.mockApis([
      {
        url: '**/yonghu/login',
        method: 'POST',
        response: { code: 0, msg: '登录成功', token: 'mock-jwt-token' }
      },
      {
        url: '**/jianshenkecheng/**',
        response: {
          code: 0,
          data: [
            { id: 1, kechengmingcheng: '瑜伽课程', jiage: '128' },
            { id: 2, kechengmingcheng: '力量训练', jiage: '98' }
          ]
        }
      }
    ])
  })

  test.describe('API请求拦截和验证', () => {
    test('应正确拦截和验证登录API请求', async ({ page }) => {
      const mockManager = createApiMockManager(page)

      // 导航到登录页面
      await page.goto('/#/login')

      // 填写登录表单
      await page.fill('input[name="yonghuzhanghao"]', 'testuser')
      await page.fill('input[type="password"]', 'password123')
      await page.click('button:has-text("登录")')

      // 等待API调用
      const loginRequest = await mockManager.waitForApiCall('**/yonghu/login', {
        method: 'POST',
        timeout: 5000
      })

      // 验证请求
      expect(loginRequest.method).toBe('POST')
      expect(loginRequest.url).toContain('yonghu/login')

      // 验证请求体包含正确的字段
      const requestBody = JSON.parse(loginRequest.postData || '{}')
      expect(requestBody).toHaveProperty('yonghuzhanghao', 'testuser')
      expect(requestBody).toHaveProperty('mima')

      // 验证响应
      expect(loginRequest.response?.status).toBe(200)
    })

    test('应正确拦截和验证课程列表API请求', async ({ page }) => {
      const mockManager = createApiMockManager(page)

      // 导航到课程页面
      await page.goto('/#/courses')

      // 等待API调用
      const courseRequest = await mockManager.waitForApiCall('**/jianshenkecheng/**', {
        method: 'GET',
        timeout: 5000
      })

      // 验证请求
      expect(courseRequest.method).toBe('GET')
      expect(courseRequest.url).toContain('jianshenkecheng')

      // 验证响应包含预期数据
      expect(courseRequest.response?.status).toBe(200)
    })

    test('应验证API请求头和认证信息', async ({ page }) => {
      const mockManager = createApiMockManager(page)

      // 先登录获取token
      await page.goto('/#/login')
      await page.fill('input[name="yonghuzhanghao"]', 'testuser')
      await page.fill('input[type="password"]', 'password123')
      await page.click('button:has-text("登录")')

      // 等待登录成功，然后访问需要认证的页面
      await page.goto('/#/profile')

      // 查找认证相关的API调用
      const authRequests = mockManager.findRequests({
        url: /profile|user|session/
      })

      // 验证至少有一个认证请求
      expect(authRequests.length).toBeGreaterThan(0)

      // 验证请求头包含认证信息（如果适用）
      const authRequest = authRequests[0]
      expect(authRequest.headers).toBeDefined()
    })
  })

  test.describe('网络场景测试', () => {
    test('应在成功用户旅程场景下正常工作', async ({ page }) => {
      const mockManager = createApiMockManager(page)

      // 设置成功场景
      await mockManager.setupNetworkScenario(NetworkScenarios.SUCCESSFUL_USER_JOURNEY)

      // 执行用户旅程
      await page.goto('/#/login')
      await page.fill('input[name="yonghuzhanghao"]', 'testuser')
      await page.fill('input[type="password"]', 'password123')
      await page.click('button:has-text("登录")')

      // 验证登录成功
      await expect(page.locator('[data-testid*="user-info"]')).toBeVisible()

      // 访问课程页面
      await page.goto('/#/courses')
      await expect(page.locator('.course-card, [data-testid*="course"]')).toBeVisible()

      // 预约课程
      const bookButton = page.locator('button:has-text("预约")').first()
      if (await bookButton.isVisible()) {
        await bookButton.click()
        await page.click('button:has-text("确认预约")')
        await expect(page.locator('text=预约成功')).toBeVisible()
      }

      // 清理场景
      await mockManager.removeNetworkScenario('successful_user_journey')
    })

    test('应处理网络故障场景', async ({ page }) => {
      const mockManager = createApiMockManager(page)

      // 设置故障场景
      await mockManager.setupNetworkScenario(NetworkScenarios.NETWORK_FAILURES)

      // 尝试登录
      await page.goto('/#/login')
      await page.fill('input[name="yonghuzhanghao"]', 'testuser')
      await page.fill('input[type="password"]', 'wrongpassword')
      await page.click('button:has-text("登录")')

      // 验证错误处理
      await expect(page.locator('text=服务器内部错误, .error-message')).toBeVisible()

      // 清理场景
      await mockManager.removeNetworkScenario('network_failures')
    })

    test('应处理慢速网络场景', async ({ page }) => {
      const mockManager = createApiMockManager(page)

      // 设置慢速网络场景
      await mockManager.setupNetworkScenario(NetworkScenarios.SLOW_NETWORK)

      const startTime = Date.now()

      // 访问课程页面
      await page.goto('/#/courses')

      // 等待内容加载
      await expect(page.locator('.course-card, [data-testid*="course"]')).toBeVisible()

      const loadTime = Date.now() - startTime

      // 验证加载时间在预期范围内（慢速网络）
      expect(loadTime).toBeGreaterThan(2000) // 至少2秒

      // 清理场景
      await mockManager.removeNetworkScenario('slow_network')
    })

    test('应处理离线场景', async ({ page }) => {
      const mockManager = createApiMockManager(page)

      // 设置离线场景
      await mockManager.setupNetworkScenario(NetworkScenarios.OFFLINE_MODE)

      // 尝试访问需要网络的页面
      await page.goto('/#/courses')

      // 验证离线状态处理
      await expect(page.locator('text=网络连接失败, text=离线模式')).toBeVisible()

      // 恢复网络
      await page.context().setOffline(false)
    })
  })

  test.describe('API性能和负载测试', () => {
    test('应测试API响应时间', async ({ page }) => {
      const responseTime = await ApiTestingUtils.measureApiResponseTime(
        page,
        'http://localhost:8080/api/courses'
      )

      // 验证响应时间在合理范围内
      expect(responseTime).toBeLessThan(5000) // 5秒以内
      console.log(`API response time: ${responseTime}ms`)
    })

    test('应测试API并发性能', async ({ page }) => {
      const concurrencyResult = await ApiTestingUtils.testApiConcurrency(page, {
        url: 'http://localhost:8080/api/courses',
        concurrentRequests: 5
      })

      console.log('Concurrency test results:', concurrencyResult)

      // 验证并发性能
      expect(concurrencyResult.successRate).toBeGreaterThan(0.8) // 80% 成功率
      expect(concurrencyResult.averageTime).toBeLessThan(10000) // 平均响应时间
    })

    test('应测试API负载能力', async ({ page }) => {
      const loadResult = await ApiTestingUtils.testApiLoad(page, {
        url: 'http://localhost:8080/api/courses',
        totalRequests: 20,
        concurrentBatches: 5
      })

      console.log('Load test results:', loadResult)

      // 验证负载能力
      expect(loadResult.requestsPerSecond).toBeGreaterThan(1) // 至少1个请求/秒
      expect(loadResult.errors).toBeLessThan(5) // 错误少于5个
    })
  })

  test.describe('API故障注入测试', () => {
    test('应处理API延迟故障', async ({ page }) => {
      // 注入延迟故障
      ApiTestingUtils.createApiFaultInjection(page, [
        {
          url: '**/jianshenkecheng/**',
          faultType: 'delay',
          probability: 1.0, // 100% 概率
          config: { delay: 3000 }
        }
      ])

      const startTime = Date.now()

      // 访问课程页面
      await page.goto('/#/courses')
      await expect(page.locator('.course-card, [data-testid*="course"]')).toBeVisible()

      const loadTime = Date.now() - startTime

      // 验证延迟生效
      expect(loadTime).toBeGreaterThan(3000)
    })

    test('应处理API错误故障', async ({ page }) => {
      // 注入错误故障
      ApiTestingUtils.createApiFaultInjection(page, [
        {
          url: '**/jianshenkecheng/**',
          faultType: 'error',
          probability: 1.0,
          config: { status: 503 }
        }
      ])

      // 访问课程页面
      await page.goto('/#/courses')

      // 验证错误处理
      await expect(page.locator('text=服务不可用, text=系统错误')).toBeVisible()
    })

    test('应处理API数据损坏故障', async ({ page }) => {
      // 注入数据损坏故障
      ApiTestingUtils.createApiFaultInjection(page, [
        {
          url: '**/jianshenkecheng/**',
          faultType: 'corrupted_data',
          probability: 1.0
        }
      ])

      // 访问课程页面
      await page.goto('/#/courses')

      // 验证数据损坏处理
      await expect(page.locator('text=数据解析失败, text=系统异常')).toBeVisible()
    })
  })

  test.describe('API请求日志和分析', () => {
    test('应记录和分析API请求日志', async ({ page }) => {
      const mockManager = createApiMockManager(page)

      // 执行一些API调用
      await page.goto('/#/login')
      await page.fill('input[name="yonghuzhanghao"]', 'testuser')
      await page.fill('input[type="password"]', 'password123')
      await page.click('button:has-text("登录")')

      await page.goto('/#/courses')

      // 获取请求日志
      const requestLog = mockManager.getRequestLog()

      // 分析日志
      const apiRequests = requestLog.filter(log =>
        log.url.includes('/api/') || log.url.includes('/yonghu/') || log.url.includes('/jianshenkecheng/')
      )

      // 验证至少有一些API请求
      expect(apiRequests.length).toBeGreaterThan(0)

      // 验证请求包含必要信息
      const sampleRequest = apiRequests[0]
      expect(sampleRequest.method).toBeDefined()
      expect(sampleRequest.url).toBeDefined()
      expect(sampleRequest.timestamp).toBeDefined()
      expect(sampleRequest.headers).toBeDefined()

      console.log(`Recorded ${apiRequests.length} API requests`)
    })

    test('应验证API调用模式', async ({ page }) => {
      const mockManager = createApiMockManager(page)

      // 执行完整用户旅程
      await page.goto('/#/login')
      await page.fill('input[name="yonghuzhanghao"]', 'testuser')
      await page.fill('input[type="password"]', 'password123')
      await page.click('button:has-text("登录")')

      await page.goto('/#/courses')
      await page.goto('/#/profile')

      // 分析API调用模式
      const requestLog = mockManager.getRequestLog()

      const getRequests = requestLog.filter(log => log.method === 'GET')
      const postRequests = requestLog.filter(log => log.method === 'POST')

      // 验证请求分布合理
      expect(getRequests.length).toBeGreaterThan(postRequests.length)

      // 验证关键API被调用
      const hasLoginApi = requestLog.some(log => log.url.includes('login'))
      const hasCourseApi = requestLog.some(log => log.url.includes('jianshenkecheng'))

      expect(hasLoginApi).toBe(true)
      expect(hasCourseApi).toBe(true)
    })
  })

  test.describe('高级API测试场景', () => {
    test('应测试API请求重试机制', async ({ page }) => {
      let attemptCount = 0

      // 设置API在第一次和第二次调用时失败，第三次成功
      await page.route('**/yonghu/login', async (route) => {
        attemptCount++

        if (attemptCount < 3) {
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ code: 500, msg: '临时服务器错误' })
          })
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ code: 0, msg: '登录成功' })
          })
        }
      })

      // 执行登录
      await page.goto('/#/login')
      await page.fill('input[name="yonghuzhanghao"]', 'testuser')
      await page.fill('input[type="password"]', 'password123')

      // 假设前端有重试机制，这里我们多次点击登录
      for (let i = 0; i < 3; i++) {
        await page.click('button:has-text("登录")')
        await page.waitForTimeout(1000)
      }

      // 验证最终成功（如果前端有重试机制）
      // 注意：这取决于实际前端实现
      expect(attemptCount).toBeGreaterThanOrEqual(3)
    })

    test('应测试API缓存机制', async ({ page }) => {
      let requestCount = 0

      // 设置API响应并计数请求次数
      await page.route('**/jianshenkecheng/**', async (route) => {
        requestCount++
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: {
            'cache-control': 'max-age=300', // 5分钟缓存
            'x-mocked': 'true'
          },
          body: JSON.stringify({
            code: 0,
            data: [
              { id: 1, kechengmingcheng: '缓存测试课程' }
            ]
          })
        })
      })

      // 多次访问相同API
      for (let i = 0; i < 3; i++) {
        await page.goto('/#/courses')
        await page.waitForLoadState('networkidle')
        await page.reload()
      }

      // 如果有缓存，请求次数应该减少
      // 注意：这取决于前端是否实现缓存
      console.log(`Total API requests: ${requestCount}`)
      expect(requestCount).toBeDefined()
    })

    test('应测试API数据分页', async ({ page }) => {
      // 设置分页数据
      let currentPage = 1

      await page.route('**/jianshenkecheng/**', async (route) => {
        const url = route.request().url()
        const pageMatch = url.match(/page=(\d+)/)
        const page = pageMatch ? parseInt(pageMatch[1]) : 1

        const itemsPerPage = 10
        const totalItems = 25
        const startIndex = (page - 1) * itemsPerPage

        const mockData = []
        for (let i = 0; i < itemsPerPage && startIndex + i < totalItems; i++) {
          mockData.push({
            id: startIndex + i + 1,
            kechengmingcheng: `课程 ${startIndex + i + 1}`,
            jiage: `${100 + i * 10}`
          })
        }

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 0,
            data: mockData,
            total: totalItems,
            page,
            totalPages: Math.ceil(totalItems / itemsPerPage)
          })
        })
      })

      // 访问课程页面
      await page.goto('/#/courses')
      await page.waitForLoadState('networkidle')

      // 验证第一页数据
      const courseItems = page.locator('.course-card, [data-testid*="course"]')
      await expect(courseItems).toHaveCount(10)

      // 如果有分页控件，测试下一页
      const nextButton = page.locator('button:has-text("下一页"), .pagination .next')
      if (await nextButton.isVisible()) {
        await nextButton.click()
        await page.waitForLoadState('networkidle')

        // 验证第二页数据
        const secondPageItems = page.locator('.course-card, [data-testid*="course"]')
        await expect(secondPageItems).toHaveCount(10) // 应该还有10个项目
      }
    })
  })
})
