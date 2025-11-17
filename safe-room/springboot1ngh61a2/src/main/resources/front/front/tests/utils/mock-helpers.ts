import MockAdapter from 'axios-mock-adapter'
import http from '@/common/http'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

/**
 * API Mock 辅助函数
 * 提供通用的Mock响应和测试数据生成
 */

// Mock适配器管理
let mockAdapter: MockAdapter | null = null

/**
 * 初始化Mock适配器
 */
export function setupMockAdapter() {
  if (!mockAdapter) {
    mockAdapter = new MockAdapter(http, { delayResponse: 100 })
  }
  return mockAdapter
}

/**
 * 重置Mock适配器
 */
export function resetMockAdapter() {
  if (mockAdapter) {
    mockAdapter.reset()
  }
}

/**
 * 清理Mock适配器
 */
export function cleanupMockAdapter() {
  if (mockAdapter) {
    mockAdapter.restore()
    mockAdapter = null
  }
}

/**
 * 创建标准API响应
 */
export function createApiResponse<T = any>(
  code = 0,
  data?: T,
  msg = 'success'
) {
  return {
    code,
    msg,
    data
  }
}

/**
 * 创建分页响应
 */
export function createPaginatedResponse<T = any>(
  list: T[],
  total: number,
  page = 1,
  size = 10
) {
  return createApiResponse(0, {
    list,
    total,
    page,
    size,
    totalPages: Math.ceil(total / size)
  })
}

/**
 * 创建用户相关Mock数据
 */
export const mockUserData = {
  createUser: (overrides: Partial<any> = {}) => ({
    id: Math.floor(Math.random() * 10000),
    username: 'testuser',
    email: 'test@example.com',
    phone: '13800138000',
    role: 'user',
    token: 'mock-jwt-token',
    createTime: new Date().toISOString(),
    ...overrides
  }),

  createUserList: (count = 5) => Array.from({ length: count }, (_, i) =>
      mockUserData.createUser({
        id: i + 1,
        username: `user${i + 1}`,
        email: `user${i + 1}@example.com`,
        phone: `13800138${String(i + 1).padStart(3, '0')}`
      })
    )
}

/**
 * 创建课程相关Mock数据
 */
export const mockCourseData = {
  createCourse: (overrides: Partial<any> = {}) => ({
    id: Math.floor(Math.random() * 10000),
    name: '测试课程',
    category: '健身',
    duration: 45,
    difficulty: '中级',
    price: 299,
    coachName: '测试教练',
    status: 'active',
    createTime: new Date().toISOString(),
    ...overrides
  }),

  createCourseList: (count = 5) => {
    const categories = ['健身', '瑜伽', '舞蹈', '力量训练']
    const difficulties = ['初级', '中级', '高级']

    return Array.from({ length: count }, (_, i) =>
      mockCourseData.createCourse({
        id: i + 1,
        name: `${categories[i % categories.length]}课程${i + 1}`,
        category: categories[i % categories.length],
        difficulty: difficulties[i % difficulties.length],
        price: 199 + (i * 50),
        coachName: `教练${i + 1}`
      })
    )
  }
}

/**
 * 创建预约相关Mock数据
 */
export const mockReservationData = {
  createReservation: (overrides: Partial<any> = {}) => ({
    id: Math.floor(Math.random() * 10000),
    userId: 1,
    courseId: 1,
    coachId: 1,
    reservationTime: new Date(Date.now() + 86400000).toISOString(), // 明天
    status: 'confirmed',
    remarks: '测试预约',
    createTime: new Date().toISOString(),
    ...overrides
  }),

  createReservationList: (count = 5) => Array.from({ length: count }, (_, i) =>
      mockReservationData.createReservation({
        id: i + 1,
        userId: i + 1,
        courseId: i + 1,
        status: i % 2 === 0 ? 'confirmed' : 'pending'
      })
    )
}

/**
 * 创建订单相关Mock数据
 */
export const mockOrderData = {
  createOrder: (overrides: Partial<any> = {}) => ({
    id: Math.floor(Math.random() * 10000),
    orderNumber: `ORDER${Date.now()}${Math.floor(Math.random() * 1000)}`,
    userId: 1,
    courseId: 1,
    amount: 299,
    status: 'paid',
    paymentMethod: 'alipay',
    createTime: new Date().toISOString(),
    payTime: new Date().toISOString(),
    ...overrides
  }),

  createOrderList: (count = 5) => {
    const statuses = ['paid', 'pending', 'cancelled', 'refunded']

    return Array.from({ length: count }, (_, i) =>
      mockOrderData.createOrder({
        id: i + 1,
        orderNumber: `ORDER20240115${String(i + 1).padStart(3, '0')}`,
        userId: i + 1,
        courseId: i + 1,
        amount: 199 + (i * 50),
        status: statuses[i % statuses.length]
      })
    )
  }
}

/**
 * 创建教练相关Mock数据
 */
export const mockCoachData = {
  createCoach: (overrides: Partial<any> = {}) => ({
    id: Math.floor(Math.random() * 10000),
    name: '测试教练',
    specialty: '健身训练',
    experience: '3年',
    phone: '13800138000',
    email: 'coach@example.com',
    rating: 4.8,
    status: 'active',
    createTime: new Date().toISOString(),
    ...overrides
  }),

  createCoachList: (count = 5) => {
    const specialties = ['健身训练', '瑜伽教学', '舞蹈指导', '力量训练', '游泳教学']

    return Array.from({ length: count }, (_, i) =>
      mockCoachData.createCoach({
        id: i + 1,
        name: `教练${i + 1}`,
        specialty: specialties[i % specialties.length],
        experience: `${2 + i}年`,
        rating: 4.5 + (Math.random() * 0.5)
      })
    )
  }
}

/**
 * 创建会员卡相关Mock数据
 */
export const mockMembershipCardData = {
  createCard: (overrides: Partial<any> = {}) => ({
    id: Math.floor(Math.random() * 10000),
    name: '测试会员卡',
    price: 999,
    duration: 180, // 天数
    benefits: ['无限次课程', '优先预约'],
    status: 'active',
    createTime: new Date().toISOString(),
    ...overrides
  }),

  createCardList: (count = 3) => {
    const cardTypes = [
      { name: '铜卡会员', price: 499, duration: 90 },
      { name: '银卡会员', price: 999, duration: 180 },
      { name: '金卡会员', price: 1999, duration: 365 }
    ]

    return Array.from({ length: count }, (_, i) =>
      mockMembershipCardData.createCard({
        id: i + 1,
        ...cardTypes[i % cardTypes.length]
      })
    )
  }
}

/**
 * 创建新闻相关Mock数据
 */
export const mockNewsData = {
  createNews: (overrides: Partial<any> = {}) => ({
    id: Math.floor(Math.random() * 10000),
    title: '测试新闻标题',
    content: '这是测试新闻的内容...',
    author: '管理员',
    addtime: new Date().toISOString(),
    clicknum: 0,
    thumbsupnum: 0,
    ...overrides
  }),

  createNewsList: (count = 5) => {
    const titles = [
      '健身新趋势：HIIT训练大受欢迎',
      '营养搭配指南：运动后如何补充能量',
      '瑜伽入门：基础姿势教学',
      '力量训练：正确举铁方法',
      '运动损伤预防：常见问题及解决'
    ]

    return Array.from({ length: count }, (_, i) =>
      mockNewsData.createNews({
        id: i + 1,
        title: titles[i % titles.length],
        content: `这是${titles[i % titles.length]}的详细内容...`,
        clicknum: Math.floor(Math.random() * 1000),
        thumbsupnum: Math.floor(Math.random() * 100)
      })
    )
  }
}

/**
 * 创建评论相关Mock数据
 */
export const mockCommentData = {
  createComment: (overrides: Partial<any> = {}) => ({
    id: Math.floor(Math.random() * 10000),
    courseid: 1,
    userid: 1,
    content: '课程很棒，教练讲解很详细！',
    addtime: new Date().toISOString(),
    thumbsupnum: 0,
    ...overrides
  }),

  createCommentList: (count = 5) => {
    const comments = [
      '课程内容很丰富，教练很有耐心！',
      '练习效果很好，坚持练习感觉身体变化很大',
      '教练的专业水平很高，讲解很细致',
      '课程安排合理，时间控制得很好',
      '学习氛围很好，其他学员也很友好'
    ]

    return Array.from({ length: count }, (_, i) =>
      mockCommentData.createComment({
        id: i + 1,
        courseid: 1,
        userid: i + 1,
        content: comments[i % comments.length],
        thumbsupnum: Math.floor(Math.random() * 20)
      })
    )
  }
}

/**
 * 通用Mock响应设置器
 */
export const mockResponses = {
  /**
   * 设置用户相关API的Mock响应
   */
  setupUserMocks: (mock: MockAdapter) => {
    // 登录
    mock.onPost(API_ENDPOINTS.AUTH.LOGIN('yonghu')).reply(200,
      createApiResponse(0, mockUserData.createUser({ token: 'user-token-123' }))
    )

    // 会话
    mock.onGet(API_ENDPOINTS.AUTH.SESSION('yonghu')).reply(200,
      createApiResponse(0, mockUserData.createUser())
    )

    // 用户列表
    mock.onGet(API_ENDPOINTS.YONGHU.LIST).reply(200,
      createPaginatedResponse(mockUserData.createUserList(10), 100)
    )

    // 用户详情
    mock.onGet(new RegExp(`${API_ENDPOINTS.YONGHU.DETAIL('')}\\d+`)).reply(200,
      createApiResponse(0, mockUserData.createUser({ id: 1 }))
    )

    // 更新用户
    mock.onPost(API_ENDPOINTS.YONGHU.UPDATE).reply(200,
      createApiResponse(0, null, '更新成功')
    )
  },

  /**
   * 设置课程相关API的Mock响应
   */
  setupCourseMocks: (mock: MockAdapter) => {
    // 课程列表
    mock.onGet(API_ENDPOINTS.JIANSHENKECHENG.LIST).reply(200,
      createPaginatedResponse(mockCourseData.createCourseList(12), 50)
    )

    // 课程详情
    mock.onGet(new RegExp(`${API_ENDPOINTS.JIANSHENKECHENG.DETAIL('')}\\d+`)).reply(200,
      createApiResponse(0, mockCourseData.createCourse({ id: 1 }))
    )

    // 热门课程
    mock.onGet(API_ENDPOINTS.JIANSHENKECHENG.AUTO_SORT).reply(200,
      createApiResponse(0, mockCourseData.createCourseList(8))
    )

    // 推荐课程
    mock.onGet(API_ENDPOINTS.JIANSHENKECHENG.AUTO_SORT2).reply(200,
      createApiResponse(0, mockCourseData.createCourseList(6))
    )
  },

  /**
   * 设置预约相关API的Mock响应
   */
  setupReservationMocks: (mock: MockAdapter) => {
    // 预约列表
    mock.onGet(API_ENDPOINTS.KECHENGYUYUE.LIST).reply(200,
      createPaginatedResponse(mockReservationData.createReservationList(8), 30)
    )

    // 创建预约
    mock.onPost(API_ENDPOINTS.KECHENGYUYUE.ADD).reply(200,
      createApiResponse(0, { id: 1001 }, '预约成功')
    )

    // 批量审核
    mock.onPost(API_ENDPOINTS.KECHENGYUYUE.SH_BATCH).reply(200,
      createApiResponse(0, { approved: 5, rejected: 0 }, '批量审核完成')
    )
  },

  /**
   * 设置教练相关API的Mock响应
   */
  setupCoachMocks: (mock: MockAdapter) => {
    // 教练列表
    mock.onGet(API_ENDPOINTS.JIANSHENJIAOLIAN.LIST).reply(200,
      createPaginatedResponse(mockCoachData.createCoachList(8), 25)
    )

    // 教练详情
    mock.onGet(new RegExp(`${API_ENDPOINTS.JIANSHENJIAOLIAN.DETAIL('')}\\d+`)).reply(200,
      createApiResponse(0, mockCoachData.createCoach({ id: 1 }))
    )
  },

  /**
   * 设置订单相关API的Mock响应
   */
  setupOrderMocks: (mock: MockAdapter) => {
    // 订单列表
    mock.onGet('/orders/list').reply(200,
      createPaginatedResponse(mockOrderData.createOrderList(10), 80)
    )

    // 创建订单
    mock.onPost('/orders/create').reply(200,
      createApiResponse(0, mockOrderData.createOrder({ id: 1001 }), '订单创建成功')
    )
  },

  /**
   * 设置新闻相关API的Mock响应
   */
  setupNewsMocks: (mock: MockAdapter) => {
    // 新闻列表
    mock.onGet(API_ENDPOINTS.NEWS.LIST).reply(200,
      createPaginatedResponse(mockNewsData.createNewsList(10), 40)
    )

    // 新闻详情
    mock.onGet(new RegExp(`${API_ENDPOINTS.NEWS.DETAIL('')}\\d+`)).reply(200,
      createApiResponse(0, mockNewsData.createNews({ id: 1 }))
    )

    // 点赞新闻
    mock.onPost(new RegExp(`${API_ENDPOINTS.NEWS.THUMBSUP('')}\\d+`)).reply(200,
      createApiResponse(0, null, '点赞成功')
    )
  },

  /**
   * 设置评论相关API的Mock响应
   */
  setupCommentMocks: (mock: MockAdapter) => {
    // 评论列表
    mock.onGet(API_ENDPOINTS.DISCUSSJIANSHENKECHENG.LIST).reply(200,
      createPaginatedResponse(mockCommentData.createCommentList(8), 25)
    )

    // 发布评论
    mock.onPost(API_ENDPOINTS.DISCUSSJIANSHENKECHENG.ADD).reply(200,
      createApiResponse(0, { id: 1001 }, '评论发表成功')
    )
  },

  /**
   * 设置通用服务API的Mock响应
   */
  setupCommonMocks: (mock: MockAdapter) => {
    // 获取选项
    mock.onGet(new RegExp('/common/option/\\w+/\\w+')).reply(200,
      createApiResponse(0, ['选项A', '选项B', '选项C'])
    )

    // 关联记录
    mock.onGet(new RegExp('/common/follow/\\w+/\\w+')).reply(200,
      createApiResponse(0, { id: 1, name: '关联记录' })
    )

    // 更新审核状态
    mock.onPost(new RegExp('/common/sh/\\w+')).reply(200,
      createApiResponse(0, null, '审核状态更新成功')
    )

    // 获取提醒计数
    mock.onGet(new RegExp('/common/remind/\\w+/\\w+/\\w+')).reply(200,
      createApiResponse(0, { count: 5 })
    )

    // 计算列统计
    mock.onGet(new RegExp('/common/cal/\\w+/\\w+')).reply(200,
      createApiResponse(0, { total: 1500, count: 10, average: 150 })
    )

    // 分组统计
    mock.onGet(new RegExp('/common/group/\\w+/\\w+')).reply(200,
      createApiResponse(0, [{ name: '分组A', count: 20 }, { name: '分组B', count: 15 }])
    )

    // 值统计
    mock.onGet(new RegExp('/common/value/\\w+/\\w+/\\w+')).reply(200,
      createApiResponse(0, [{ x: '2024-01', y: 100 }, { x: '2024-02', y: 150 }])
    )
  },

  /**
   * 设置文件上传相关API的Mock响应
   */
  setupFileMocks: (mock: MockAdapter) => {
    // 文件上传
    mock.onPost(API_ENDPOINTS.FILE.UPLOAD).reply(200,
      createApiResponse(0, {
        url: '/uploads/test.jpg',
        filename: 'test.jpg',
        size: 1024000
      }, '文件上传成功')
    )
  },

  /**
   * 设置所有Mock响应（一键设置）
   */
  setupAllMocks: (mock: MockAdapter) => {
    mockResponses.setupUserMocks(mock)
    mockResponses.setupCourseMocks(mock)
    mockResponses.setupReservationMocks(mock)
    mockResponses.setupCoachMocks(mock)
    mockResponses.setupOrderMocks(mock)
    mockResponses.setupNewsMocks(mock)
    mockResponses.setupCommentMocks(mock)
    mockResponses.setupCommonMocks(mock)
    mockResponses.setupFileMocks(mock)
  }
}

/**
 * 错误响应工厂
 */
export const errorResponses = {
  unauthorized: createApiResponse(401, null, '未授权访问'),
  forbidden: createApiResponse(403, null, '权限不足'),
  notFound: createApiResponse(404, null, '资源不存在'),
  conflict: createApiResponse(409, null, '数据冲突'),
  validationError: createApiResponse(400, null, '参数验证失败'),
  serverError: createApiResponse(500, null, '服务器内部错误'),
  networkError: () => { throw new Error('网络连接失败，请检查网络设置') },
  timeout: () => { throw new Error('网络请求超时，请稍后重试') }
}

/**
 * 测试数据验证器
 */
export const dataValidators = {
  isValidUser: (user: any) => user &&
           typeof user.id === 'number' &&
           typeof user.username === 'string' &&
           typeof user.email === 'string',

  isValidCourse: (course: any) => course &&
           typeof course.id === 'number' &&
           typeof course.name === 'string' &&
           typeof course.price === 'number',

  isValidReservation: (reservation: any) => reservation &&
           typeof reservation.id === 'number' &&
           typeof reservation.userId === 'number' &&
           typeof reservation.courseId === 'number',

  isValidApiResponse: (response: any) => response &&
           typeof response.code === 'number' &&
           typeof response.msg === 'string',

  isValidPaginatedResponse: (response: any) => dataValidators.isValidApiResponse(response) &&
           response.data &&
           Array.isArray(response.data.list) &&
           typeof response.data.total === 'number'
}
