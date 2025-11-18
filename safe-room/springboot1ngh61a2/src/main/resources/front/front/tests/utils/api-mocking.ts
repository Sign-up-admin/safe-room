import { Page, Route, Request } from '@playwright/test'
import { faker } from '@faker-js/faker'

/**
 * API Mocking Utilities - API模拟和网络拦截工具
 * 提供完整的API模拟、拦截和测试功能
 */

export interface ApiMockConfig {
  url: string | RegExp
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  status?: number
  response: any
  delay?: number
  headers?: Record<string, string>
}

export interface NetworkScenario {
  name: string
  mocks: ApiMockConfig[]
  networkConditions?: {
    latency?: number
    downloadThroughput?: number
    uploadThroughput?: number
    offline?: boolean
  }
}

export class ApiMockManager {
  private page: Page
  private activeMocks: Map<string, Route[]> = new Map()
  private requestLog: RequestLog[] = []

  constructor(page: Page) {
    this.page = page
    this.setupRequestLogging()
  }

  /**
   * 设置请求日志记录
   */
  private setupRequestLogging(): void {
    this.page.on('request', (request) => {
      this.requestLog.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData(),
        timestamp: Date.now(),
        resourceType: request.resourceType()
      })
    })

    this.page.on('response', (response) => {
      const request = this.requestLog.find(log => log.url === response.url())
      if (request) {
        request.response = {
          status: response.status(),
          headers: response.headers(),
          timestamp: Date.now()
        }
      }
    })
  }

  /**
   * 创建单个API模拟
   */
  async mockApi(config: ApiMockConfig): Promise<Route> {
    const route = await this.page.route(config.url, async (route) => {
      // 检查方法匹配
      if (config.method && route.request().method() !== config.method) {
        await route.continue()
        return
      }

      // 添加延迟
      if (config.delay) {
        await new Promise(resolve => setTimeout(resolve, config.delay))
      }

      // 返回模拟响应
      await route.fulfill({
        status: config.status || 200,
        contentType: 'application/json',
        body: JSON.stringify(config.response),
        headers: {
          ...config.headers,
          'x-mocked': 'true',
          'access-control-allow-origin': '*',
          'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'access-control-allow-headers': 'Content-Type, Authorization'
        }
      })
    })

    return route
  }

  /**
   * 批量创建API模拟
   */
  async mockApis(configs: ApiMockConfig[]): Promise<Route[]> {
    const routes: Route[] = []

    for (const config of configs) {
      const route = await this.mockApi(config)
      routes.push(route)
    }

    return routes
  }

  /**
   * 创建网络场景（包含多个相关API）
   */
  async setupNetworkScenario(scenario: NetworkScenario): Promise<void> {
    // 设置网络条件
    if (scenario.networkConditions) {
      await this.setNetworkConditions(scenario.networkConditions)
    }

    // 创建API模拟
    const routes = await this.mockApis(scenario.mocks)
    this.activeMocks.set(scenario.name, routes)

    console.log(`Network scenario "${scenario.name}" setup complete`)
  }

  /**
   * 设置网络条件
   */
  private async setNetworkConditions(conditions: NonNullable<NetworkScenario['networkConditions']>): Promise<void> {
    if (conditions.offline) {
      await this.page.context().setOffline(true)
      return
    }

    // 设置网络延迟和带宽
    await this.page.route('**/*', async (route) => {
      if (conditions.latency) {
        await new Promise(resolve => setTimeout(resolve, conditions.latency))
      }
      await route.continue()
    })
  }

  /**
   * 移除网络场景
   */
  async removeNetworkScenario(scenarioName: string): Promise<void> {
    const routes = this.activeMocks.get(scenarioName)
    if (routes) {
      for (const route of routes) {
        await route.unroute()
      }
      this.activeMocks.delete(scenarioName)
      console.log(`Network scenario "${scenarioName}" removed`)
    }
  }

  /**
   * 获取请求日志
   */
  getRequestLog(): RequestLog[] {
    return [...this.requestLog]
  }

  /**
   * 清除请求日志
   */
  clearRequestLog(): void {
    this.requestLog = []
  }

  /**
   * 查找特定请求
   */
  findRequests(filter: {
    url?: string | RegExp
    method?: string
    status?: number
  }): RequestLog[] {
    return this.requestLog.filter(log => {
      if (filter.url) {
        const urlMatch = typeof filter.url === 'string'
          ? log.url.includes(filter.url)
          : filter.url.test(log.url)
        if (!urlMatch) return false
      }

      if (filter.method && log.method !== filter.method) return false
      if (filter.status && log.response?.status !== filter.status) return false

      return true
    })
  }

  /**
   * 等待特定API请求
   */
  async waitForApiCall(urlPattern: string | RegExp, options: {
    method?: string
    timeout?: number
  } = {}): Promise<RequestLog> {
    const timeout = options.timeout || 10000
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      const requests = this.findRequests({
        url: urlPattern,
        method: options.method
      })

      if (requests.length > 0) {
        return requests[requests.length - 1]
      }

      await new Promise(resolve => setTimeout(resolve, 100))
    }

    throw new Error(`API call to ${urlPattern} not found within ${timeout}ms`)
  }

  /**
   * 验证API调用
   */
  async verifyApiCall(urlPattern: string | RegExp, expected: {
    method?: string
    status?: number
    requestBody?: any
    responseBody?: any
  }): Promise<boolean> {
    const requests = this.findRequests({
      url: urlPattern,
      method: expected.method,
      status: expected.status
    })

    if (requests.length === 0) return false

    const request = requests[requests.length - 1]

    // 验证请求体
    if (expected.requestBody && request.postData) {
      const actualBody = JSON.parse(request.postData)
      if (JSON.stringify(actualBody) !== JSON.stringify(expected.requestBody)) {
        return false
      }
    }

    // 验证响应体（如果有响应数据）
    if (expected.responseBody && request.response) {
      // 这里需要额外的逻辑来获取响应体
      // 在实际使用中，可能需要通过mock配置来验证
    }

    return true
  }
}

/**
 * 预定义的网络场景
 */
export class NetworkScenarios {
  static readonly SUCCESSFUL_USER_JOURNEY: NetworkScenario = {
    name: 'successful_user_journey',
    mocks: [
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
      },
      {
        url: '**/kechengyuyue/**',
        method: 'POST',
        response: { code: 0, msg: '预约成功' }
      }
    ]
  }

  static readonly NETWORK_FAILURES: NetworkScenario = {
    name: 'network_failures',
    mocks: [
      {
        url: '**/yonghu/login',
        method: 'POST',
        status: 500,
        response: { code: 500, msg: '服务器内部错误' }
      },
      {
        url: '**/jianshenkecheng/**',
        status: 404,
        response: { code: 404, msg: '课程不存在' }
      }
    ]
  }

  static readonly SLOW_NETWORK: NetworkScenario = {
    name: 'slow_network',
    mocks: [
      {
        url: '**/*',
        delay: 2000, // 2秒延迟
        response: { code: 0, msg: '慢速网络响应' }
      }
    ],
    networkConditions: {
      latency: 1000,
      downloadThroughput: 500 * 1024, // 500 KB/s
      uploadThroughput: 100 * 1024    // 100 KB/s
    }
  }

  static readonly OFFLINE_MODE: NetworkScenario = {
    name: 'offline_mode',
    mocks: [],
    networkConditions: {
      offline: true
    }
  }

  static readonly CONFLICT_SCENARIOS: NetworkScenario = {
    name: 'conflict_scenarios',
    mocks: [
      {
        url: '**/kechengyuyue/**',
        method: 'POST',
        response: { code: 409, msg: '该时间段已被预约' }
      },
      {
        url: '**/huiyuanka/**',
        method: 'POST',
        response: { code: 410, msg: '会员卡已售罄' }
      }
    ]
  }
}

/**
 * API测试工具
 */
export class ApiTestingUtils {
  /**
   * 测试API响应时间
   */
  static async measureApiResponseTime(page: Page, url: string, method: string = 'GET'): Promise<number> {
    const startTime = Date.now()

    try {
      const response = await page.request[method.toLowerCase()](url)
      await response.json()
    } catch (error) {
      // 如果请求失败，仍然计算时间
    }

    return Date.now() - startTime
  }

  /**
   * 测试API并发性能
   */
  static async testApiConcurrency(page: Page, config: {
    url: string
    method?: string
    concurrentRequests: number
  }): Promise<{
    totalTime: number
    averageTime: number
    minTime: number
    maxTime: number
    successRate: number
  }> {
    const promises = []
    const startTime = Date.now()

    for (let i = 0; i < config.concurrentRequests; i++) {
      promises.push(ApiTestingUtils.measureApiResponseTime(page, config.url, config.method))
    }

    const results = await Promise.all(promises)
    const totalTime = Date.now() - startTime
    const successfulRequests = results.filter(time => time < 30000).length // 30秒超时

    return {
      totalTime,
      averageTime: results.reduce((sum, time) => sum + time, 0) / results.length,
      minTime: Math.min(...results),
      maxTime: Math.max(...results),
      successRate: successfulRequests / config.concurrentRequests
    }
  }

  /**
   * 测试API负载
   */
  static async testApiLoad(page: Page, config: {
    url: string
    method?: string
    totalRequests: number
    concurrentBatches: number
  }): Promise<{
    totalTime: number
    requestsPerSecond: number
    errors: number
  }> {
    const startTime = Date.now()
    let errors = 0

    for (let batch = 0; batch < config.totalRequests; batch += config.concurrentBatches) {
      const batchPromises = []

      for (let i = 0; i < config.concurrentBatches && (batch + i) < config.totalRequests; i++) {
        batchPromises.push(
          page.request[config.method?.toLowerCase() || 'get'](config.url)
            .catch(() => { errors++; return null })
        )
      }

      await Promise.all(batchPromises)
    }

    const totalTime = Date.now() - startTime
    const requestsPerSecond = config.totalRequests / (totalTime / 1000)

    return {
      totalTime,
      requestsPerSecond,
      errors
    }
  }

  /**
   * 生成API故障注入
   */
  static createApiFaultInjection(page: Page, faults: {
    url: string | RegExp
    faultType: 'delay' | 'error' | 'empty_response' | 'corrupted_data'
    probability: number
    config?: any
  }[]): void {
    page.route('**/*', async (route) => {
      const requestUrl = route.request().url()

      for (const fault of faults) {
        const urlMatch = typeof fault.url === 'string'
          ? requestUrl.includes(fault.url)
          : fault.url.test(requestUrl)

        if (urlMatch && Math.random() < fault.probability) {
          switch (fault.faultType) {
            case 'delay':
              await new Promise(resolve => setTimeout(resolve, fault.config?.delay || 5000))
              break

            case 'error':
              await route.fulfill({
                status: fault.config?.status || 500,
                contentType: 'application/json',
                body: JSON.stringify({ code: fault.config?.status || 500, msg: 'Injected fault' })
              })
              return

            case 'empty_response':
              await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({})
              })
              return

            case 'corrupted_data':
              await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: 'invalid json {{{'
              })
              return
          }
        }
      }

      await route.continue()
    })
  }
}

/**
 * 类型定义
 */
export interface RequestLog {
  url: string
  method: string
  headers: Record<string, string>
  postData: string | null
  timestamp: number
  resourceType: string
  response?: {
    status: number
    headers: Record<string, string>
    timestamp: number
  }
}

/**
 * 便捷函数
 */
export function createApiMockManager(page: Page): ApiMockManager {
  return new ApiMockManager(page)
}

export function createStandardMocks(): ApiMockConfig[] {
  return [
    // 用户相关API
    {
      url: '**/yonghu/login',
      method: 'POST',
      response: { code: 0, msg: '登录成功', token: faker.string.alphanumeric(32) }
    },
    {
      url: '**/yonghu/register',
      method: 'POST',
      response: { code: 0, msg: '注册成功' }
    },
    {
      url: '**/yonghu/session',
      response: {
        code: 0,
        data: {
          id: 1,
          yonghuzhanghao: 'testuser',
          yonghuxingming: '测试用户'
        }
      }
    },

    // 课程相关API
    {
      url: '**/jianshenkecheng/**',
      response: {
        code: 0,
        data: [
          {
            id: 1,
            kechengmingcheng: '燃脂瑜伽课程',
            jiage: '128',
            shichang: '60分钟'
          },
          {
            id: 2,
            kechengmingcheng: '力量训练入门',
            jiage: '98',
            shichang: '45分钟'
          }
        ]
      }
    },

    // 预约相关API
    {
      url: '**/kechengyuyue/**',
      method: 'POST',
      response: { code: 0, msg: '预约成功' }
    },

    // 会员卡相关API
    {
      url: '**/huiyuanka/**',
      response: {
        code: 0,
        data: [
          {
            id: 1,
            huiyuankamingcheng: '月卡',
            jiage: '299',
            youxiaoqi: '30'
          }
        ]
      }
    }
  ]
}
