/**
 * E2E测试共享设置
 *
 * 提供场景化的测试环境设置函数，提取重复的beforeEach代码
 * 支持不同测试场景的预设配置
 */

import { Page, TestInfo } from '@playwright/test'
import { setupTestEnvironment, logTestStep } from './shared-helpers'
import { applyCommonMock, SCENARIO_NAMES } from './mock-manager'
import { seedFrontSession, mockFrontApi } from './test-helpers'
import { mockAdminApi, seedAdminSession } from '../../admin/admin/tests/utils/test-helpers'

// ========== 测试场景类型定义 ==========

/**
 * 测试场景配置
 */
export interface TestScenario {
  name: string
  description: string
  mocks: string[]
  session: 'front' | 'admin' | 'none'
  additionalSetup?: (page: Page) => Promise<void>
}

/**
 * 预定义的测试场景
 */
export const TEST_SCENARIOS = {
  // 前端场景
  FRONT_BOOKING_JOURNEY: {
    name: '预约完整旅程',
    description: '完整的课程预约流程，包括登录、选课、预约等',
    mocks: [SCENARIO_NAMES.COMPLETE_BOOKING_JOURNEY],
    session: 'front' as const,
    additionalSetup: async (page: Page) => {
      // 预约场景的额外设置
      await page.route('**/kechengyuyue/**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 0,
            msg: '预约成功',
            data: { id: Date.now() }
          })
        })
      })
    }
  },

  FRONT_COURSE_MANAGEMENT: {
    name: '课程管理',
    description: '课程列表、详情查看、搜索等功能',
    mocks: [SCENARIO_NAMES.COURSE_DETAIL_SUCCESS, SCENARIO_NAMES.COURSES_LIST_SUCCESS],
    session: 'front' as const
  },

  FRONT_USER_PROFILE: {
    name: '用户资料管理',
    description: '个人资料查看和编辑功能',
    mocks: [SCENARIO_NAMES.USER_PROFILE_JOURNEY],
    session: 'front' as const
  },

  FRONT_PAYMENT_FLOW: {
    name: '支付流程',
    description: '会员购买、课程支付等支付相关功能',
    mocks: [SCENARIO_NAMES.PAYMENT_SUCCESS, SCENARIO_NAMES.MEMBERSHIP_PURCHASE],
    session: 'front' as const
  },

  // 管理端场景
  ADMIN_COURSE_MANAGEMENT: {
    name: '管理端课程管理',
    description: '课程的增删改查管理功能',
    mocks: [SCENARIO_NAMES.ADMIN_COURSE_MANAGEMENT],
    session: 'admin' as const
  },

  ADMIN_USER_MANAGEMENT: {
    name: '管理端用户管理',
    description: '用户管理、权限设置等功能',
    mocks: [SCENARIO_NAMES.ADMIN_USER_MANAGEMENT],
    session: 'admin' as const
  },

  ADMIN_SYSTEM_CONFIG: {
    name: '系统配置管理',
    description: '系统参数配置、设置管理',
    mocks: [SCENARIO_NAMES.ADMIN_SYSTEM_CONFIG],
    session: 'admin' as const
  },

  // 通用场景
  AUTHENTICATION: {
    name: '认证流程',
    description: '登录、注册、登出等认证功能',
    mocks: [SCENARIO_NAMES.LOGIN_SUCCESS, SCENARIO_NAMES.REGISTER_SUCCESS],
    session: 'none' as const
  },

  BASIC_FRONT: {
    name: '基础前端功能',
    description: '基础的前端页面和组件功能',
    mocks: [],
    session: 'front' as const
  },

  BASIC_ADMIN: {
    name: '基础管理端功能',
    description: '基础的管理端页面和组件功能',
    mocks: [],
    session: 'admin' as const
  }
} as const

// ========== 场景设置函数 ==========

/**
 * 应用测试场景配置
 */
export async function setupTestScenario(
  page: Page,
  scenario: TestScenario,
  testInfo?: TestInfo
): Promise<void> {
  await logTestStep(`设置测试场景: ${scenario.name}`)

  // 基础环境设置
  await setupTestEnvironment(page)

  // 应用Mock场景
  for (const mockName of scenario.mocks) {
    await applyCommonMock(page, mockName)
  }

  // 设置用户会话
  if (scenario.session === 'front') {
    await seedFrontSession(page)
    await logTestStep('前端用户会话已设置')
  } else if (scenario.session === 'admin') {
    await seedAdminSession(page)
    await logTestStep('管理端用户会话已设置')
  }

  // 执行额外设置
  if (scenario.additionalSetup) {
    await scenario.additionalSetup(page)
  }

  await logTestStep(`测试场景 ${scenario.name} 设置完成`)
}

// ========== 便捷的场景设置函数 ==========

/**
 * 设置预约流程测试场景
 */
export async function setupBookingScenario(page: Page, testInfo?: TestInfo): Promise<void> {
  await setupTestScenario(page, TEST_SCENARIOS.FRONT_BOOKING_JOURNEY, testInfo)
}

/**
 * 设置课程管理测试场景
 */
export async function setupCourseManagementScenario(page: Page, testInfo?: TestInfo): Promise<void> {
  await setupTestScenario(page, TEST_SCENARIOS.FRONT_COURSE_MANAGEMENT, testInfo)
}

/**
 * 设置用户资料测试场景
 */
export async function setupUserProfileScenario(page: Page, testInfo?: TestInfo): Promise<void> {
  await setupTestScenario(page, TEST_SCENARIOS.FRONT_USER_PROFILE, testInfo)
}

/**
 * 设置支付流程测试场景
 */
export async function setupPaymentScenario(page: Page, testInfo?: TestInfo): Promise<void> {
  await setupTestScenario(page, TEST_SCENARIOS.FRONT_PAYMENT_FLOW, testInfo)
}

/**
 * 设置管理端课程管理场景
 */
export async function setupAdminCourseScenario(page: Page, testInfo?: TestInfo): Promise<void> {
  await setupTestScenario(page, TEST_SCENARIOS.ADMIN_COURSE_MANAGEMENT, testInfo)
}

/**
 * 设置管理端用户管理场景
 */
export async function setupAdminUserScenario(page: Page, testInfo?: TestInfo): Promise<void> {
  await setupTestScenario(page, TEST_SCENARIOS.ADMIN_USER_MANAGEMENT, testInfo)
}

/**
 * 设置认证流程场景
 */
export async function setupAuthScenario(page: Page, testInfo?: TestInfo): Promise<void> {
  await setupTestScenario(page, TEST_SCENARIOS.AUTHENTICATION, testInfo)
}

/**
 * 设置基础前端场景
 */
export async function setupBasicFrontScenario(page: Page, testInfo?: TestInfo): Promise<void> {
  await setupTestScenario(page, TEST_SCENARIOS.BASIC_FRONT, testInfo)
}

/**
 * 设置基础管理端场景
 */
export async function setupBasicAdminScenario(page: Page, testInfo?: TestInfo): Promise<void> {
  await setupTestScenario(page, TEST_SCENARIOS.BASIC_ADMIN, testInfo)
}

// ========== 自定义场景创建函数 ==========

/**
 * 创建自定义测试场景
 */
export function createCustomScenario(
  name: string,
  description: string,
  mocks: string[] = [],
  session: 'front' | 'admin' | 'none' = 'none',
  additionalSetup?: (page: Page) => Promise<void>
): TestScenario {
  return {
    name,
    description,
    mocks,
    session,
    additionalSetup
  }
}

/**
 * 使用自定义场景设置测试环境
 */
export async function setupCustomScenario(
  page: Page,
  scenario: TestScenario,
  testInfo?: TestInfo
): Promise<void> {
  await setupTestScenario(page, scenario, testInfo)
}

// ========== 兼容性函数 ==========

/**
 * 兼容旧的设置函数（逐步迁移用）
 */
export async function setupFrontBookingTest(page: Page): Promise<void> {
  await setupBookingScenario(page)
}

export async function setupFrontCourseTest(page: Page): Promise<void> {
  await setupCourseManagementScenario(page)
}

export async function setupAdminTest(page: Page): Promise<void> {
  await setupBasicAdminScenario(page)
}

// ========== 测试辅助函数 ==========

/**
 * 等待页面完全加载并稳定
 */
export async function waitForPageStability(page: Page, timeout = 5000): Promise<void> {
  await page.waitForLoadState('domcontentloaded')
  await page.waitForLoadState('networkidle', { timeout })

  // 额外等待页面元素稳定
  await page.waitForTimeout(500)
}

/**
 * 安全导航到页面（带重试机制）
 */
export async function navigateSafely(
  page: Page,
  url: string,
  options: { timeout?: number; retries?: number } = {}
): Promise<void> {
  const { timeout = 30000, retries = 2 } = options

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      await page.goto(url, { timeout, waitUntil: 'domcontentloaded' })
      await waitForPageStability(page)
      return
    } catch (error) {
      if (attempt > retries) {
        throw error
      }
      await logTestStep(`导航失败，重试 ${attempt}/${retries}: ${error.message}`)
      await page.waitForTimeout(1000)
    }
  }
}

/**
 * 执行测试步骤（带日志和截图）
 */
export async function executeTestStep(
  page: Page,
  stepName: string,
  stepFunction: () => Promise<void>,
  options: { screenshot?: boolean; timeout?: number } = {}
): Promise<void> {
  const { screenshot = false, timeout = 30000 } = options

  await logTestStep(`开始: ${stepName}`)

  try {
    await Promise.race([
      stepFunction(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`步骤超时: ${stepName}`)), timeout)
      )
    ])

    await logTestStep(`完成: ${stepName}`)

    if (screenshot) {
      await page.screenshot({ path: `test-results/screenshots/${stepName.replace(/\s+/g, '_')}.png` })
    }
  } catch (error) {
    await logTestStep(`失败: ${stepName} - ${error.message}`)
    throw error
  }
}
