/**
 * 统一的Mock数据
 *
 * 提供统一格式的Mock数据，确保与实际API响应一致
 * 支持版本管理和API同步检查
 */

import {
  mockVersionManager,
  initializeMockVersionManager,
  withSyncCheck,
  createVersionedMock
} from '../../../../../tests/shared/mock-version-manager'

// API响应基础结构
export interface ApiResponse<T = any> {
  code: number
  msg: string
  data?: T
}

// 用户相关数据类型
export interface User {
  id: number
  yonghuzhanghao: string
  yonghuxingming: string
  shoujihaoma: string
  youxiang?: string
  touxiang?: string
  dengjishijian?: string
  zuixiaodenglu?: string
}

export interface LoginRequest {
  username: string
  password: string
  tableName?: string
}

export interface LoginResponse extends ApiResponse {
  data?: {
    token: string
    user: User
  }
}

// 课程相关数据类型
export interface Course {
  id: number
  kechengmingcheng: string
  kechengjianjie?: string
  jiage: string
  shichang: string
  tupian?: string
  kechengleixing?: string
  jiaolianmingcheng?: string
  kefanghao?: string
  riqi?: string
  shijian?: string
}

export interface CourseListResponse extends ApiResponse {
  data?: Course[]
}

// 预约相关数据类型
export interface Booking {
  id: number
  kechengyuyueUUID?: string
  yonghu_id?: number
  kecheng_id?: number
  yuyueshijian?: string
  lianxiren?: string
  lianxishouji?: string
  beizhu?: string
  zhuangtai?: string
  insertTime?: string
}

export interface BookingRequest {
  kecheng_id: number
  yuyueshijian: string
  lianxiren: string
  lianxishouji: string
  beizhu?: string
}

export interface BookingResponse extends ApiResponse {
  data?: Booking
}

// 支付相关数据类型
export interface PaymentRequest {
  amount: number
  tableName: string
  recordId: number
  title: string
}

export interface PaymentResponse extends ApiResponse {
  data?: {
    orderId: string
    paymentUrl?: string
    status: string
  }
}

// Mock数据常量
export const MOCK_DATA = {
// 用户数据
  users: {
    testUser: {
      id: 1,
      yonghuzhanghao: 'testuser',
      yonghuxingming: '测试用户',
      shoujihaoma: '13800138000',
      youxiang: 'test@example.com',
      touxiang: '/avatar.jpg',
      dengjishijian: new Date().toISOString(),
      zuixiaodenglu: new Date().toISOString()
    } as User,

    adminUser: {
      id: 2,
      yonghuzhanghao: 'admin',
      yonghuxingming: '管理员',
      shoujihaoma: '13800138001',
      youxiang: 'admin@example.com',
      dengjishijian: new Date().toISOString(),
      zuixiaodenglu: new Date().toISOString()
    } as User
  },

// 课程数据
  courses: {
    yogaCourse: {
      id: 1,
      kechengmingcheng: '瑜伽入门课程',
      kechengjianjie: '适合初学者的瑜伽课程，掌握基础姿势',
      jiage: '99',
      shichang: '60分钟',
      tupian: '/course-yoga.jpg',
      kechengleixing: '瑜伽',
      jiaolianmingcheng: '张教练',
      kefanghao: 'A101',
      riqi: '2025-12-01',
      shijian: '09:00-10:00'
    } as Course,

    fitnessCourse: {
      id: 2,
      kechengmingcheng: '力量训练课程',
      kechengjianjie: '专业力量训练，提升肌肉力量',
      jiage: '129',
      shichang: '90分钟',
      tupian: '/course-fitness.jpg',
      kechengleixing: '力量训练',
      jiaolianmingcheng: '李教练',
      kefanghao: 'B201',
      riqi: '2025-12-02',
      shijian: '14:00-15:30'
    } as Course,

    danceCourse: {
      id: 3,
      kechengmingcheng: '街舞课程',
      kechengjianjie: '时尚街舞，释放青春活力',
      jiage: '89',
      shichang: '75分钟',
      tupian: '/course-dance.jpg',
      kechengleixing: '街舞',
      jiaolianmingcheng: '王教练',
      kefanghao: 'C301',
      riqi: '2025-12-03',
      shijian: '16:00-17:15'
    } as Course
  },

  // 预约数据
  bookings: {
    pendingBooking: {
      id: 1,
      kechengyuyueUUID: 'booking-001',
      yonghu_id: 1,
      kecheng_id: 1,
      yuyueshijian: '2025-12-01 09:00:00',
      lianxiren: '测试用户',
      lianxishouji: '13800138000',
      beizhu: '希望重点练习基础姿势',
      zhuangtai: '待确认',
      insertTime: new Date().toISOString()
    } as Booking,

    confirmedBooking: {
      id: 2,
      kechengyuyueUUID: 'booking-002',
      yonghu_id: 1,
      kecheng_id: 2,
      yuyueshijian: '2025-12-02 14:00:00',
      lianxiren: '测试用户',
      lianxishouji: '13800138000',
      beizhu: '请准备哑铃',
      zhuangtai: '已确认',
      insertTime: new Date().toISOString()
    } as Booking
  },

  // 支付数据
  payments: {
    pendingPayment: {
      orderId: 'order-001',
      amount: 99,
      status: 'pending',
      paymentUrl: 'https://payment.example.com/pay/001'
    },

    completedPayment: {
      orderId: 'order-002',
      amount: 129,
      status: 'completed'
    }
  }
}

// Mock API响应生成器
export const MOCK_RESPONSES = {
  // 登录相关
  login: {
    success: (user: User = MOCK_DATA.users.testUser): LoginResponse => ({
      code: 0,
      msg: '登录成功',
      data: {
        token: 'mock-jwt-token-' + Date.now(),
        user
      }
    }),

    failure: (message = '账号或密码错误'): LoginResponse => ({
      code: 1,
      msg: message
    }),

    networkError: (): LoginResponse => ({
      code: 500,
      msg: '网络错误，请稍后重试'
    })
  },

  // 用户相关
  user: {
    session: (user: User = MOCK_DATA.users.testUser): ApiResponse<User> => ({
      code: 0,
      msg: '获取成功',
      data: user
    }),

    profile: (user: User = MOCK_DATA.users.testUser): ApiResponse<User> => ({
      code: 0,
      msg: '获取成功',
      data: user
    })
  },

  // 课程相关
  course: {
    list: (courses: Course[] = Object.values(MOCK_DATA.courses)): CourseListResponse => ({
      code: 0,
      msg: '获取成功',
      data: courses
    }),

    detail: (course: Course = MOCK_DATA.courses.yogaCourse): ApiResponse<Course> => ({
      code: 0,
      msg: '获取成功',
      data: course
    }),

    notFound: (): ApiResponse => ({
      code: 1,
      msg: '课程不存在'
    })
  },

  // 预约相关
  booking: {
    success: (booking: Booking = MOCK_DATA.bookings.confirmedBooking): BookingResponse => ({
      code: 0,
      msg: '预约成功',
      data: booking
    }),

    failure: (message = '预约失败，请稍后重试'): BookingResponse => ({
      code: 1,
      msg: message
    }),

    conflict: (): BookingResponse => ({
      code: 1,
      msg: '该时间段已被预约，请选择其他时间'
    }),

    list: (bookings: Booking[] = Object.values(MOCK_DATA.bookings)): ApiResponse<Booking[]> => ({
      code: 0,
      msg: '获取成功',
      data: bookings
    })
  },

  // 支付相关
  payment: {
    success: (payment = MOCK_DATA.payments.completedPayment): PaymentResponse => ({
      code: 0,
      msg: '支付成功',
      data: payment
    }),

    pending: (payment = MOCK_DATA.payments.pendingPayment): PaymentResponse => ({
      code: 0,
      msg: '订单创建成功',
      data: payment
    }),

    failure: (message = '支付失败'): PaymentResponse => ({
      code: 1,
      msg: message
    })
  },

  // 文件上传相关
  file: {
    uploadSuccess: (fileUrl = '/uploads/test-image.jpg'): ApiResponse<{ fileUrl: string }> => ({
      code: 0,
      msg: '上传成功',
      data: { fileUrl }
    }),

    uploadFailure: (message = '上传失败'): ApiResponse => ({
      code: 1,
      msg: message
    })
  },

  // 通用响应
  common: {
    success: (data?: any, message = '操作成功'): ApiResponse => ({
      code: 0,
      msg: message,
      data
    }),

    failure: (message = '操作失败', code = 1): ApiResponse => ({
      code,
      msg: message
    }),

    networkError: (): ApiResponse => ({
      code: 500,
      msg: '网络错误，请稍后重试'
    }),

    unauthorized: (): ApiResponse => ({
      code: 401,
      msg: '请先登录'
    }),

    forbidden: (): ApiResponse => ({
      code: 403,
      msg: '权限不足'
    }),

    notFound: (): ApiResponse => ({
      code: 404,
      msg: '资源不存在'
    })
  }
}

// 数据工厂函数 - 用于生成测试数据变体
export const DATA_FACTORIES = {
  createUser: (overrides: Partial<User> = {}): User => ({
    ...MOCK_DATA.users.testUser,
    ...overrides,
    id: overrides.id || (Math.floor(Math.random() * 1000) + 10)
  }),

  createCourse: (overrides: Partial<Course> = {}): Course => ({
    ...MOCK_DATA.courses.yogaCourse,
    ...overrides,
    id: overrides.id || (Math.floor(Math.random() * 1000) + 10)
  }),

  createBooking: (overrides: Partial<Booking> = {}): Booking => ({
    ...MOCK_DATA.bookings.pendingBooking,
    ...overrides,
    id: overrides.id || (Math.floor(Math.random() * 1000) + 10)
  }),

  createCourseList: (count: number, baseCourse: Course = MOCK_DATA.courses.yogaCourse): Course[] => Array.from({ length: count }, (_, index) => ({
      ...baseCourse,
      id: index + 1,
      kechengmingcheng: `${baseCourse.kechengmingcheng} ${index + 1}`,
      jiage: (parseInt(baseCourse.jiage) + index * 10).toString()
    }))
}

// 验证函数 - 确保Mock数据格式正确
export const VALIDATORS = {
  isValidApiResponse: (response: unknown): response is ApiResponse => (
      typeof response === 'object' &&
      response !== null &&
      'code' in response &&
      'msg' in response &&
      typeof (response as ApiResponse).code === 'number' &&
      typeof (response as ApiResponse).msg === 'string'
    ),

  isValidUser: (user: unknown): user is User => (
      typeof user === 'object' &&
      user !== null &&
      'id' in user &&
      'yonghuzhanghao' in user &&
      'yonghuxingming' in user &&
      typeof (user as User).id === 'number' &&
      typeof (user as User).yonghuzhanghao === 'string' &&
      typeof (user as User).yonghuxingming === 'string'
    ),

  isValidCourse: (course: unknown): course is Course => (
      typeof course === 'object' &&
      course !== null &&
      'id' in course &&
      'kechengmingcheng' in course &&
      'jiage' in course &&
      typeof (course as Course).id === 'number' &&
      typeof (course as Course).kechengmingcheng === 'string' &&
      typeof (course as Course).jiage === 'string'
    )
}

// ========== Mock版本管理初始化 ==========

/**
 * 初始化前端Mock数据版本管理
 */
export function initializeFrontendMockData(): void {
  try {
    // 初始化版本管理器
    initializeMockVersionManager()

    // 注册API端点
    registerApiEndpoints()

    // 创建初始版本
    createInitialMockVersion()

    console.log('Frontend mock data initialized with version management')
  } catch (error) {
    console.warn('Failed to initialize frontend mock data:', error.message)
  }
}

/**
 * 注册前端API端点
 */
function registerApiEndpoints(): void {
  const endpoints = [
    // 用户相关端点
    { path: '/api/user/login', method: 'POST' as const, version: '1.0.0' },
    { path: '/api/user/register', method: 'POST' as const, version: '1.0.0' },
    { path: '/api/user/info', method: 'GET' as const, version: '1.0.0' },
    { path: '/api/user/profile', method: 'GET' as const, version: '1.0.0' },
    { path: '/api/user/profile', method: 'PUT' as const, version: '1.0.0' },

    // 课程相关端点
    { path: '/api/course/list', method: 'GET' as const, version: '1.0.0' },
    { path: '/api/course/detail', method: 'GET' as const, version: '1.0.0' },
    { path: '/api/course/create', method: 'POST' as const, version: '1.0.0' },
    { path: '/api/course/update', method: 'PUT' as const, version: '1.0.0' },
    { path: '/api/course/delete', method: 'DELETE' as const, version: '1.0.0' },

    // 预约相关端点
    { path: '/api/booking/list', method: 'GET' as const, version: '1.0.0' },
    { path: '/api/booking/create', method: 'POST' as const, version: '1.0.0' },
    { path: '/api/booking/cancel', method: 'PUT' as const, version: '1.0.0' },

    // 支付相关端点
    { path: '/api/payment/create', method: 'POST' as const, version: '1.0.0' },
    { path: '/api/payment/status', method: 'GET' as const, version: '1.0.0' }
  ]

  endpoints.forEach(endpoint => {
    mockVersionManager.registerEndpoint({
      ...endpoint,
      schema: {}, // 可以后续扩展添加详细的schema定义
      examples: []
    })
  })
}

/**
 * 创建初始Mock数据版本
 */
function createInitialMockVersion(): void {
  const existingVersions = mockVersionManager.getVersions()

  if (existingVersions.length === 0) {
    mockVersionManager.createVersion(
      'Initial frontend mock data',
      [
        'Created unified mock data structure',
        'Added user, course, booking, and payment mock data',
        'Implemented API response templates',
        'Added data validation functions',
        'Registered all frontend API endpoints'
      ]
    )
  }
}

// ========== 版本化Mock响应生成器 ==========

/**
 * 创建版本化的成功响应
 */
export const createVersionedSuccessResponse = createVersionedMock(
  <T>(data?: T) => mockVersionManager.createSuccessResponse(data),
  '1.0.0',
  { endpoint: '/api/*', method: 'GET' }
)

/**
 * 创建版本化的错误响应
 */
export const createVersionedErrorResponse = createVersionedMock(
  (code?: number, message?: string, error?: any) =>
    mockVersionManager.createErrorResponse(code, message, error),
  '1.0.0',
  { endpoint: '/api/*', method: 'POST' }
)

/**
 * 创建版本化的分页响应
 */
export const createVersionedPaginationResponse = createVersionedMock(
  <T>(list: T[], current?: number, size?: number, total?: number) =>
    mockVersionManager.createPaginationResponse(list, current, size, total),
  '1.0.0',
  { endpoint: '/api/*/list', method: 'GET' }
)

// ========== API同步检查工具 ==========

/**
 * 检查Mock数据与API同步状态
 */
export async function checkMockApiSync(apiSpecPath?: string): Promise<{
  isInSync: boolean
  version: string
  differences: any
  recommendations: string[]
}> {
  return mockVersionManager.checkSyncStatus(apiSpecPath)
}

/**
 * 获取API端点信息
 */
export function getApiEndpoint(method: string, path: string) {
  return mockVersionManager.getEndpoint(method, path)
}

/**
 * 获取所有已注册的端点
 */
export function getAllApiEndpoints() {
  return mockVersionManager.getEndpoints()
}

/**
 * 获取最新Mock版本
 */
export function getLatestMockVersion() {
  return mockVersionManager.getLatestVersion()
}

// ========== 兼容性导出 ==========

// 保持向后兼容
export const createApiResponse = mockVersionManager.createSuccessResponse.bind(mockVersionManager)
export const createErrorApiResponse = mockVersionManager.createErrorResponse.bind(mockVersionManager)
export const createPagedApiResponse = mockVersionManager.createPaginationResponse.bind(mockVersionManager)