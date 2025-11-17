/**
 * Mock预设场景
 *
 * 提供预定义的常用Mock场景，简化测试中的Mock使用
 */

import { MockScenario } from './mock-manager'
import { MOCK_RESPONSES, MOCK_DATA, DATA_FACTORIES } from './mock-data'

// 基础Mock场景
export const BASIC_SCENARIOS: MockScenario[] = [
  {
    name: 'login-success',
    description: '登录成功场景 - 用户成功登录并获取会话信息',
    rules: [
      {
        pattern: '**/yonghu/login',
        method: 'POST',
        response: MOCK_RESPONSES.login.success()
      },
      {
        pattern: '**/yonghu/session',
        method: 'GET',
        response: MOCK_RESPONSES.user.session()
      }
    ]
  },

  {
    name: 'login-failure',
    description: '登录失败场景 - 用户名或密码错误',
    rules: [
      {
        pattern: '**/yonghu/login',
        method: 'POST',
        response: MOCK_RESPONSES.login.failure()
      }
    ]
  },

  {
    name: 'login-network-error',
    description: '登录网络错误场景 - 服务器错误',
    rules: [
      {
        pattern: '**/yonghu/login',
        method: 'POST',
        response: MOCK_RESPONSES.login.networkError()
      }
    ]
  }
]

// 课程相关Mock场景
export const COURSE_SCENARIOS: MockScenario[] = [
  {
    name: 'courses-list-success',
    description: '课程列表成功场景 - 获取课程列表',
    rules: [
      {
        pattern: '**/jianshenkecheng/list**',
        method: 'GET',
        response: MOCK_RESPONSES.course.list()
      }
    ]
  },

  {
    name: 'courses-empty',
    description: '课程列表为空场景 - 无可用课程',
    rules: [
      {
        pattern: '**/jianshenkecheng/list**',
        method: 'GET',
        response: MOCK_RESPONSES.course.list([])
      }
    ]
  },

  {
    name: 'course-detail-success',
    description: '课程详情成功场景 - 获取单个课程详情',
    rules: [
      {
        pattern: '**/jianshenkecheng/detail**',
        method: 'GET',
        response: MOCK_RESPONSES.course.detail()
      }
    ]
  },

  {
    name: 'course-not-found',
    description: '课程不存在场景 - 课程ID不存在',
    rules: [
      {
        pattern: '**/jianshenkecheng/detail**',
        method: 'GET',
        response: MOCK_RESPONSES.course.notFound()
      }
    ]
  }
]

// 预约相关Mock场景
export const BOOKING_SCENARIOS: MockScenario[] = [
  {
    name: 'booking-success',
    description: '预约成功场景 - 课程预约成功',
    rules: [
      {
        pattern: '**/kechengyuyue/save**',
        method: 'POST',
        response: MOCK_RESPONSES.booking.success()
      }
    ]
  },

  {
    name: 'booking-failure',
    description: '预约失败场景 - 预约失败',
    rules: [
      {
        pattern: '**/kechengyuyue/save**',
        method: 'POST',
        response: MOCK_RESPONSES.booking.failure()
      }
    ]
  },

  {
    name: 'booking-conflict',
    description: '预约冲突场景 - 时间段已被预约',
    rules: [
      {
        pattern: '**/kechengyuyue/save**',
        method: 'POST',
        response: MOCK_RESPONSES.booking.conflict()
      }
    ]
  },

  {
    name: 'booking-list-success',
    description: '预约列表成功场景 - 获取用户预约列表',
    rules: [
      {
        pattern: '**/kechengyuyue/list**',
        method: 'GET',
        response: MOCK_RESPONSES.booking.list()
      }
    ]
  }
]

// 支付相关Mock场景
export const PAYMENT_SCENARIOS: MockScenario[] = [
  {
    name: 'payment-success',
    description: '支付成功场景 - 支付成功完成',
    rules: [
      {
        pattern: '**/pay/create**',
        method: 'POST',
        response: MOCK_RESPONSES.payment.success()
      }
    ]
  },

  {
    name: 'payment-pending',
    description: '支付待处理场景 - 订单创建成功，等待支付',
    rules: [
      {
        pattern: '**/pay/create**',
        method: 'POST',
        response: MOCK_RESPONSES.payment.pending()
      }
    ]
  },

  {
    name: 'payment-failure',
    description: '支付失败场景 - 支付失败',
    rules: [
      {
        pattern: '**/pay/create**',
        method: 'POST',
        response: MOCK_RESPONSES.payment.failure()
      }
    ]
  }
]

// 文件上传相关Mock场景
export const FILE_SCENARIOS: MockScenario[] = [
  {
    name: 'file-upload-success',
    description: '文件上传成功场景',
    rules: [
      {
        pattern: '**/file/upload**',
        method: 'POST',
        response: MOCK_RESPONSES.file.uploadSuccess()
      }
    ]
  },

  {
    name: 'file-upload-failure',
    description: '文件上传失败场景',
    rules: [
      {
        pattern: '**/file/upload**',
        method: 'POST',
        response: MOCK_RESPONSES.file.uploadFailure()
      }
    ]
  }
]

// 网络和错误相关Mock场景
export const NETWORK_SCENARIOS: MockScenario[] = [
  {
    name: 'network-error',
    description: '网络错误场景 - 所有API请求返回500错误',
    rules: [
      {
        pattern: '**/api/**',
        response: MOCK_RESPONSES.common.networkError()
      }
    ]
  },

  {
    name: 'unauthorized',
    description: '未授权场景 - 需要登录',
    rules: [
      {
        pattern: '**/api/**',
        response: MOCK_RESPONSES.common.unauthorized()
      }
    ]
  },

  {
    name: 'slow-response',
    description: '慢响应场景 - 所有请求延迟3秒',
    rules: [
      {
        pattern: '**/api/**',
        response: MOCK_RESPONSES.common.success(),
        delay: 3000
      }
    ]
  }
]

// 组合场景 - 完整的用户旅程Mock
export const JOURNEY_SCENARIOS: MockScenario[] = [
  {
    name: 'complete-booking-journey',
    description: '完整预约旅程场景 - 从登录到预约成功',
    rules: [
      // 登录相关
      {
        pattern: '**/yonghu/login',
        method: 'POST',
        response: MOCK_RESPONSES.login.success()
      },
      {
        pattern: '**/yonghu/session',
        method: 'GET',
        response: MOCK_RESPONSES.user.session()
      },

      // 课程相关
      {
        pattern: '**/jianshenkecheng/list**',
        method: 'GET',
        response: MOCK_RESPONSES.course.list()
      },
      {
        pattern: '**/jianshenkecheng/detail**',
        method: 'GET',
        response: MOCK_RESPONSES.course.detail()
      },

      // 预约相关
      {
        pattern: '**/kechengyuyue/save**',
        method: 'POST',
        response: MOCK_RESPONSES.booking.success()
      },

      // 支付相关
      {
        pattern: '**/pay/create**',
        method: 'POST',
        response: MOCK_RESPONSES.payment.success()
      }
    ]
  },

  {
    name: 'user-profile-journey',
    description: '用户资料管理旅程场景',
    rules: [
      // 用户信息
      {
        pattern: '**/yonghu/session',
        method: 'GET',
        response: MOCK_RESPONSES.user.session()
      },
      {
        pattern: '**/yonghu/detail**',
        method: 'GET',
        response: MOCK_RESPONSES.user.profile()
      },
      {
        pattern: '**/yonghu/update**',
        method: 'POST',
        response: MOCK_RESPONSES.common.success({}, '更新成功')
      },

      // 文件上传
      {
        pattern: '**/file/upload**',
        method: 'POST',
        response: MOCK_RESPONSES.file.uploadSuccess()
      }
    ]
  }
]

// 所有预设场景的集合
export const ALL_PRESET_SCENARIOS = [
  ...BASIC_SCENARIOS,
  ...COURSE_SCENARIOS,
  ...BOOKING_SCENARIOS,
  ...PAYMENT_SCENARIOS,
  ...FILE_SCENARIOS,
  ...NETWORK_SCENARIOS,
  ...JOURNEY_SCENARIOS
]

// 场景名称常量 - 提供类型安全
export const SCENARIO_NAMES = {
  // 基础场景
  LOGIN_SUCCESS: 'login-success',
  LOGIN_FAILURE: 'login-failure',
  LOGIN_NETWORK_ERROR: 'login-network-error',

  // 课程场景
  COURSES_LIST_SUCCESS: 'courses-list-success',
  COURSES_EMPTY: 'courses-empty',
  COURSE_DETAIL_SUCCESS: 'course-detail-success',
  COURSE_NOT_FOUND: 'course-not-found',

  // 预约场景
  BOOKING_SUCCESS: 'booking-success',
  BOOKING_FAILURE: 'booking-failure',
  BOOKING_CONFLICT: 'booking-conflict',
  BOOKING_LIST_SUCCESS: 'booking-list-success',

  // 支付场景
  PAYMENT_SUCCESS: 'payment-success',
  PAYMENT_PENDING: 'payment-pending',
  PAYMENT_FAILURE: 'payment-failure',

  // 文件场景
  FILE_UPLOAD_SUCCESS: 'file-upload-success',
  FILE_UPLOAD_FAILURE: 'file-upload-failure',

  // 网络场景
  NETWORK_ERROR: 'network-error',
  UNAUTHORIZED: 'unauthorized',
  SLOW_RESPONSE: 'slow-response',

  // 组合场景
  COMPLETE_BOOKING_JOURNEY: 'complete-booking-journey',
  USER_PROFILE_JOURNEY: 'user-profile-journey'
}

export type ScenarioName = typeof SCENARIO_NAMES[keyof typeof SCENARIO_NAMES]

// 场景描述映射 - 用于文档和调试
export const SCENARIO_DESCRIPTIONS: Record<ScenarioName, string> = {
  [SCENARIO_NAMES.LOGIN_SUCCESS]: '登录成功场景',
  [SCENARIO_NAMES.LOGIN_FAILURE]: '登录失败场景',
  [SCENARIO_NAMES.LOGIN_NETWORK_ERROR]: '登录网络错误场景',
  [SCENARIO_NAMES.COURSES_LIST_SUCCESS]: '课程列表成功场景',
  [SCENARIO_NAMES.COURSES_EMPTY]: '课程列表为空场景',
  [SCENARIO_NAMES.COURSE_DETAIL_SUCCESS]: '课程详情成功场景',
  [SCENARIO_NAMES.COURSE_NOT_FOUND]: '课程不存在场景',
  [SCENARIO_NAMES.BOOKING_SUCCESS]: '预约成功场景',
  [SCENARIO_NAMES.BOOKING_FAILURE]: '预约失败场景',
  [SCENARIO_NAMES.BOOKING_CONFLICT]: '预约冲突场景',
  [SCENARIO_NAMES.BOOKING_LIST_SUCCESS]: '预约列表成功场景',
  [SCENARIO_NAMES.PAYMENT_SUCCESS]: '支付成功场景',
  [SCENARIO_NAMES.PAYMENT_PENDING]: '支付待处理场景',
  [SCENARIO_NAMES.PAYMENT_FAILURE]: '支付失败场景',
  [SCENARIO_NAMES.FILE_UPLOAD_SUCCESS]: '文件上传成功场景',
  [SCENARIO_NAMES.FILE_UPLOAD_FAILURE]: '文件上传失败场景',
  [SCENARIO_NAMES.NETWORK_ERROR]: '网络错误场景',
  [SCENARIO_NAMES.UNAUTHORIZED]: '未授权场景',
  [SCENARIO_NAMES.SLOW_RESPONSE]: '慢响应场景',
  [SCENARIO_NAMES.COMPLETE_BOOKING_JOURNEY]: '完整预约旅程场景',
  [SCENARIO_NAMES.USER_PROFILE_JOURNEY]: '用户资料管理旅程场景'
}

// 工具函数 - 根据名称查找场景
export function findScenarioByName(name: ScenarioName): MockScenario | undefined {
  return ALL_PRESET_SCENARIOS.find(scenario => scenario.name === name)
}

// 工具函数 - 获取场景描述
export function getScenarioDescription(name: ScenarioName): string {
  return SCENARIO_DESCRIPTIONS[name] || '未知场景'
}

// 工具函数 - 获取所有可用场景名称
export function getAvailableScenarioNames(): ScenarioName[] {
  return ALL_PRESET_SCENARIOS.map(scenario => scenario.name as ScenarioName)
}
