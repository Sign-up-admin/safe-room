/**
 * 统一的Mock管理器
 *
 * 提供统一的API Mock管理和场景化Mock支持
 */

import { Page, Route } from '@playwright/test'

export interface MockResponse {
  status?: number
  contentType?: string
  body?: string | object
  headers?: Record<string, string>
}

export interface MockRule {
  pattern: string | RegExp
  method?: string
  response: MockResponse | ((route: Route) => Promise<void> | void)
  delay?: number
}

export interface MockScenario {
  name: string
  description: string
  rules: MockRule[]
}

export class MockManager {
  private page: Page
  private activeMocks: Map<string, MockRule> = new Map()
  private scenarios: Map<string, MockScenario> = new Map()

  constructor(page: Page) {
    this.page = page
  }

  /**
   * 注册Mock场景
   */
  registerScenario(scenario: MockScenario): void {
    this.scenarios.set(scenario.name, scenario)
  }

  /**
   * 应用Mock场景
   */
  async applyScenario(scenarioName: string): Promise<void> {
    const scenario = this.scenarios.get(scenarioName)
    if (!scenario) {
      throw new Error(`Mock scenario '${scenarioName}' not found`)
    }

    console.log(`Applying mock scenario: ${scenario.name} - ${scenario.description}`)

    for (const rule of scenario.rules) {
      await this.addMock(rule)
    }
  }

  /**
   * 添加单个Mock规则
   */
  async addMock(rule: MockRule): Promise<void> {
    const mockId = this.generateMockId(rule)

    await this.page.route(rule.pattern, async (route) => {
      // 检查方法匹配（如果指定了方法）
      if (rule.method && route.request().method() !== rule.method) {
        await route.continue()
        return
      }

      // 添加延迟（如果指定了）
      if (rule.delay) {
        await new Promise(resolve => setTimeout(resolve, rule.delay))
      }

      // 处理响应
      if (typeof rule.response === 'function') {
        await rule.response(route)
      } else {
        const response = rule.response
        const body = typeof response.body === 'object'
          ? JSON.stringify(response.body)
          : response.body

        await route.fulfill({
          status: response.status || 200,
          contentType: response.contentType || 'application/json',
          body,
          headers: response.headers
        })
      }
    })

    this.activeMocks.set(mockId, rule)
  }

  /**
   * 移除Mock规则
   */
  async removeMock(rule: MockRule): Promise<void> {
    const mockId = this.generateMockId(rule)
    this.activeMocks.delete(mockId)

    // 重新设置路由，但不包括已移除的规则
    await this.reapplyAllMocks()
  }

  /**
   * 清除所有Mock规则
   */
  async clearAllMocks(): Promise<void> {
    this.activeMocks.clear()
    await this.page.unroute('**/*')
  }

  /**
   * 获取活动中的Mock规则
   */
  getActiveMocks(): MockRule[] {
    return Array.from(this.activeMocks.values())
  }

  /**
   * 创建成功响应
   */
  static createSuccessResponse(data: any, message = 'success'): MockResponse {
    return {
      status: 200,
      contentType: 'application/json',
      body: {
        code: 0,
        msg: message,
        data
      }
    }
  }

  /**
   * 创建错误响应
   */
  static createErrorResponse(message = 'error', code = 1, status = 200): MockResponse {
    return {
      status,
      contentType: 'application/json',
      body: {
        code,
        msg: message
      }
    }
  }

  /**
   * 创建网络错误响应
   */
  static createNetworkErrorResponse(status = 500, message = 'Internal Server Error'): MockResponse {
    return {
      status,
      contentType: 'application/json',
      body: {
        code: status,
        msg: message
      }
    }
  }

  private generateMockId(rule: MockRule): string {
    const pattern = typeof rule.pattern === 'string' ? rule.pattern : rule.pattern.source
    const method = rule.method || 'ANY'
    return `${method}:${pattern}`
  }

  private async reapplyAllMocks(): Promise<void> {
    await this.page.unroute('**/*')

    for (const rule of this.activeMocks.values()) {
      await this.addMock(rule)
    }
  }
}

// 预定义的常用Mock场景
export const COMMON_MOCK_SCENARIOS: MockScenario[] = [
  {
    name: 'login-success',
    description: '登录成功场景',
    rules: [
      {
        pattern: '**/yonghu/login',
        method: 'POST',
        response: MockManager.createSuccessResponse(
          { token: 'mock-jwt-token', userId: 1 },
          '登录成功'
        )
      },
      {
        pattern: '**/yonghu/session',
        method: 'GET',
        response: MockManager.createSuccessResponse({
          id: 1,
          yonghuzhanghao: 'testuser',
          yonghuxingming: '测试用户',
          shoujihaoma: '13800138000'
        })
      }
    ]
  },
  {
    name: 'login-failure',
    description: '登录失败场景',
    rules: [
      {
        pattern: '**/yonghu/login',
        method: 'POST',
        response: MockManager.createErrorResponse('账号或密码错误', 1)
      }
    ]
  },
  {
    name: 'booking-success',
    description: '预约成功场景',
    rules: [
      {
        pattern: '**/kechengyuyue',
        method: 'POST',
        response: MockManager.createSuccessResponse(
          { id: 1, status: 'confirmed' },
          '预约成功'
        )
      },
      {
        pattern: '**/jianshenkecheng',
        method: 'GET',
        response: MockManager.createSuccessResponse([
          {
            id: 1,
            kechengmingcheng: '测试课程',
            jiage: '100',
            shichang: '60分钟',
            tupian: '/test-image.jpg'
          }
        ])
      }
    ]
  },
  {
    name: 'network-error',
    description: '网络错误场景',
    rules: [
      {
        pattern: '**/api/**',
        response: MockManager.createNetworkErrorResponse(500, '网络错误')
      }
    ]
  },
  {
    name: 'slow-response',
    description: '慢响应场景',
    rules: [
      {
        pattern: '**/api/**',
        response: MockManager.createSuccessResponse({}),
        delay: 3000
      }
    ]
  }
]

/**
 * 创建Mock管理器实例
 */
export function createMockManager(page: Page): MockManager {
  const manager = new MockManager(page)

  // 注册预定义场景
  COMMON_MOCK_SCENARIOS.forEach(scenario => {
    manager.registerScenario(scenario)
  })

  return manager
}

/**
 * 快速应用常用Mock场景的辅助函数
 */
export async function applyCommonMock(page: Page, scenarioName: string): Promise<MockManager> {
  const manager = createMockManager(page)
  await manager.applyScenario(scenarioName)
  return manager
}
