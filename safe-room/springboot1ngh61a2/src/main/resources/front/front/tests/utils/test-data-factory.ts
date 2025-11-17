/**
 * 统一的测试数据工厂
 *
 * 提供Builder模式的测试数据生成，支持随机数据和默认值生成
 * 确保测试数据的一致性和可维护性
 */

import { faker } from '@faker-js/faker'
import type { User, Course, Booking, PaymentRequest, PaymentResponse } from './mock-data'
import {
  registerDataFactory,
  registerEntityFactory,
  registerMockFactory,
  createTestContext,
  getGlobalTestContext,
  validateData,
  registerDataValidator
} from '../../../../../../../tests/shared/factory-registry'
import { initializeFrontendMockData } from './mock-data'

// ========== Builder模式基础类 ==========

/**
 * 基础Builder类
 */
abstract class BaseBuilder<T> {
  protected data: Partial<T> = {}

  /**
   * 设置单个属性
   */
  with<K extends keyof T>(key: K, value: T[K]): this {
    this.data[key] = value
    return this
  }

  /**
   * 设置多个属性
   */
  withOverrides(overrides: Partial<T>): this {
    Object.assign(this.data, overrides)
    return this
  }

  /**
   * 构建最终对象
   */
  abstract build(): T

  /**
   * 获取当前数据（用于调试）
   */
  getData(): Partial<T> {
    return { ...this.data }
  }
}

// ========== 用户数据Builder ==========

export class UserBuilder extends BaseBuilder<User> {
  constructor() {
    super()
    this.reset()
  }

  /**
   * 重置为默认值
   */
  reset(): this {
    this.data = {
      id: faker.number.int({ min: 1, max: 9999 }),
      yonghuzhanghao: faker.internet.userName(),
      yonghuxingming: faker.person.fullName(),
      shoujihaoma: faker.phone.number(),
      youxiang: faker.internet.email(),
      touxiang: faker.image.avatar(),
      dengjishijian: faker.date.recent().toISOString(),
      zuixiaodenglu: faker.date.recent().toISOString()
    }
    return this
  }

  withId(id: number): this {
    return this.with('id', id)
  }

  withUsername(username: string): this {
    return this.with('yonghuzhanghao', username)
  }

  withName(name: string): this {
    return this.with('yonghuxingming', name)
  }

  withPhone(phone: string): this {
    return this.with('shoujihaoma', phone)
  }

  withEmail(email: string): this {
    return this.with('youxiang', email)
  }

  build(): User {
    return { ...this.data } as User
  }
}

// ========== 课程数据Builder ==========

export class CourseBuilder extends BaseBuilder<Course> {
  constructor() {
    super()
    this.reset()
  }

  reset(): this {
    this.data = {
      id: faker.number.int({ min: 1, max: 9999 }),
      kechengmingcheng: faker.lorem.words(3),
      kechengjianjie: faker.lorem.sentence(),
      jiage: faker.number.int({ min: 50, max: 500 }).toString(),
      shichang: `${faker.number.int({ min: 30, max: 120 })}分钟`,
      tupian: faker.image.url(),
      kechengleixing: faker.helpers.arrayElement(['瑜伽', '力量训练', '普拉提', '舞蹈', '游泳']),
      jiaolianmingcheng: faker.person.fullName(),
      kefanghao: `A${faker.number.int({ min: 100, max: 999 })}`,
      riqi: faker.date.future().toISOString().split('T')[0],
      shijian: faker.helpers.arrayElement(['09:00-10:00', '10:30-11:30', '14:00-15:00', '15:30-16:30'])
    }
    return this
  }

  withId(id: number): this {
    return this.with('id', id)
  }

  withName(name: string): this {
    return this.with('kechengmingcheng', name)
  }

  withDescription(description: string): this {
    return this.with('kechengjianjie', description)
  }

  withPrice(price: string | number): this {
    return this.with('jiage', typeof price === 'number' ? price.toString() : price)
  }

  withDuration(duration: string): this {
    return this.with('shichang', duration)
  }

  withType(type: string): this {
    return this.with('kechengleixing', type)
  }

  build(): Course {
    return { ...this.data } as Course
  }
}

// ========== 预约数据Builder ==========

export class BookingBuilder extends BaseBuilder<Booking> {
  constructor() {
    super()
    this.reset()
  }

  reset(): this {
    this.data = {
      id: faker.number.int({ min: 1, max: 9999 }),
      kechengyuyueUUID: faker.string.uuid(),
      yonghu_id: faker.number.int({ min: 1, max: 100 }),
      kecheng_id: faker.number.int({ min: 1, max: 50 }),
      yuyueshijian: faker.date.future().toISOString(),
      lianxiren: faker.person.fullName(),
      lianxishouji: faker.phone.number(),
      beizhu: faker.lorem.sentence(),
      zhuangtai: faker.helpers.arrayElement(['待确认', '已确认', '已取消', '已完成']),
      insertTime: faker.date.recent().toISOString()
    }
    return this
  }

  withId(id: number): this {
    return this.with('id', id)
  }

  withUserId(userId: number): this {
    return this.with('yonghu_id', userId)
  }

  withCourseId(courseId: number): this {
    return this.with('kecheng_id', courseId)
  }

  withBookingTime(time: string): this {
    return this.with('yuyueshijian', time)
  }

  withStatus(status: string): this {
    return this.with('zhuangtai', status)
  }

  withContactName(name: string): this {
    return this.with('lianxiren', name)
  }

  withContactPhone(phone: string): this {
    return this.with('lianxishouji', phone)
  }

  build(): Booking {
    return { ...this.data } as Booking
  }
}

// ========== 工厂函数 ==========

/**
 * 创建用户数据
 */
export function createUser(overrides: Partial<User> = {}): User {
  return new UserBuilder().withOverrides(overrides).build()
}

/**
 * 创建课程数据
 */
export function createCourse(overrides: Partial<Course> = {}): Course {
  return new CourseBuilder().withOverrides(overrides).build()
}

/**
 * 创建预约数据
 */
export function createBooking(overrides: Partial<Booking> = {}): Booking {
  return new BookingBuilder().withOverrides(overrides).build()
}

/**
 * 创建多个用户数据
 */
export function createUsers(count: number, baseOverrides: Partial<User> = {}): User[] {
  return Array.from({ length: count }, (_, index) =>
    createUser({
      id: baseOverrides.id ? baseOverrides.id + index : undefined,
      ...baseOverrides
    })
  )
}

/**
 * 创建多个课程数据
 */
export function createCourses(count: number, baseOverrides: Partial<Course> = {}): Course[] {
  return Array.from({ length: count }, (_, index) =>
    createCourse({
      id: baseOverrides.id ? baseOverrides.id + index : undefined,
      ...baseOverrides
    })
  )
}

/**
 * 创建多个预约数据
 */
export function createBookings(count: number, baseOverrides: Partial<Booking> = {}): Booking[] {
  return Array.from({ length: count }, (_, index) =>
    createBooking({
      id: baseOverrides.id ? baseOverrides.id + index : undefined,
      ...baseOverrides
    })
  )
}

// ========== 预设数据 ==========

/**
 * 预设的测试用户
 */
export const PRESET_USERS = {
  testUser: createUser({
    id: 1,
    yonghuzhanghao: 'testuser',
    yonghuxingming: '测试用户',
    shoujihaoma: '13800138000',
    youxiang: 'test@example.com'
  }),

  adminUser: createUser({
    id: 2,
    yonghuzhanghao: 'admin',
    yonghuxingming: '管理员',
    shoujihaoma: '13800138001',
    youxiang: 'admin@example.com'
  }),

  coachUser: createUser({
    id: 3,
    yonghuzhanghao: 'coach',
    yonghuxingming: '教练用户',
    shoujihaoma: '13800138002',
    youxiang: 'coach@example.com'
  })
}

/**
 * 预设的测试课程
 */
export const PRESET_COURSES = {
  yogaCourse: createCourse({
    id: 1,
    kechengmingcheng: '瑜伽入门课程',
    kechengjianjie: '适合初学者的瑜伽课程，掌握基础姿势',
    jiage: '99',
    shichang: '60分钟',
    kechengleixing: '瑜伽'
  }),

  fitnessCourse: createCourse({
    id: 2,
    kechengmingcheng: '力量训练课程',
    kechengjianjie: '专业力量训练，提升肌肉力量',
    jiage: '129',
    shichang: '90分钟',
    kechengleixing: '力量训练'
  }),

  pilatesCourse: createCourse({
    id: 3,
    kechengmingcheng: '普拉提课程',
    kechengjianjie: '普拉提核心训练',
    jiage: '109',
    shichang: '75分钟',
    kechengleixing: '普拉提'
  })
}

/**
 * 预设的测试预约
 */
export const PRESET_BOOKINGS = {
  confirmedBooking: createBooking({
    id: 1,
    yonghu_id: 1,
    kecheng_id: 1,
    zhuangtai: '已确认',
    yuyueshijian: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 明天
    lianxiren: '测试用户',
    lianxishouji: '13800138000'
  }),

  pendingBooking: createBooking({
    id: 2,
    yonghu_id: 2,
    kecheng_id: 2,
    zhuangtai: '待确认',
    yuyueshijian: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 后天
    lianxiren: '管理员',
    lianxishouji: '13800138001'
  })
}

// ========== 数据验证器 ==========

/**
 * 用户数据验证器
 */
function validateUserData(user: any): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  if (!user.id || typeof user.id !== 'number') {
    errors.push('User ID must be a valid number')
  }

  if (!user.yonghuzhanghao || typeof user.yonghuzhanghao !== 'string') {
    errors.push('Username is required and must be a string')
  }

  if (!user.yonghuxingming || typeof user.yonghuxingming !== 'string') {
    errors.push('Full name is required and must be a string')
  }

  if (!user.youxiang || typeof user.youxiang !== 'string' || !user.youxiang.includes('@')) {
    errors.push('Valid email is required')
  }

  if (!user.shoujihaoma || typeof user.shoujihaoma !== 'string') {
    errors.push('Phone number is required')
  }

  return { isValid: errors.length === 0, errors, warnings }
}

/**
 * 课程数据验证器
 */
function validateCourseData(course: any): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  if (!course.id || typeof course.id !== 'number') {
    errors.push('Course ID must be a valid number')
  }

  if (!course.kechengmingcheng || typeof course.kechengmingcheng !== 'string') {
    errors.push('Course name is required and must be a string')
  }

  if (!course.jiage || typeof course.jiage !== 'string') {
    errors.push('Course price is required and must be a string')
  }

  if (course.kechengleixing && typeof course.kechengleixing !== 'string') {
    warnings.push('Course type should be a string')
  }

  return { isValid: errors.length === 0, errors, warnings }
}

/**
 * 预约数据验证器
 */
function validateBookingData(booking: any): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  if (!booking.id || typeof booking.id !== 'number') {
    errors.push('Booking ID must be a valid number')
  }

  if (!booking.yonghu_id || typeof booking.yonghu_id !== 'number') {
    errors.push('User ID is required and must be a number')
  }

  if (!booking.kecheng_id || typeof booking.kecheng_id !== 'number') {
    errors.push('Course ID is required and must be a number')
  }

  if (!booking.zhuangtai || typeof booking.zhuangtai !== 'string') {
    errors.push('Booking status is required and must be a string')
  }

  if (booking.yuyueshijian) {
    try {
      new Date(booking.yuyueshijian)
    } catch {
      errors.push('Invalid booking time format')
    }
  }

  return { isValid: errors.length === 0, errors, warnings }
}

// ========== 工厂注册 ==========

/**
 * 初始化并注册所有前端测试数据工厂
 */
export function initializeFrontendFactories(): void {
  // 初始化Mock数据版本管理
  initializeFrontendMockData()

  // 注册数据验证器
  registerDataValidator('user', validateUserData)
  registerDataValidator('course', validateCourseData)
  registerDataValidator('booking', validateBookingData)

  // 注册用户数据工厂
  registerEntityFactory(
    'frontend-user',
    (overrides?: Partial<User>) => createUser(overrides),
    'Frontend user entity factory with validation',
    ['frontend', 'user', 'entity'],
    [],
    'front'
  )

  // 注册课程数据工厂
  registerEntityFactory(
    'frontend-course',
    (overrides?: Partial<Course>) => createCourse(overrides),
    'Frontend course entity factory with validation',
    ['frontend', 'course', 'entity'],
    [],
    'front'
  )

  // 注册预约数据工厂
  registerEntityFactory(
    'frontend-booking',
    (overrides?: Partial<Booking>) => createBooking(overrides),
    'Frontend booking entity factory with validation',
    ['frontend', 'booking', 'entity'],
    [],
    'front'
  )

  // 注册模拟数据工厂
  registerMockFactory(
    'frontend-payment-request',
    (overrides?: Partial<PaymentRequest>) => ({
      orderId: faker.string.uuid(),
      amount: faker.number.int({ min: 50, max: 500 }),
      currency: 'CNY',
      description: faker.lorem.sentence(),
      ...overrides
    }),
    'Frontend payment request mock factory',
    ['frontend', 'payment', 'mock'],
    [],
    'front'
  )

  registerMockFactory(
    'frontend-payment-response',
    (overrides?: Partial<PaymentResponse>) => ({
      success: true,
      orderId: faker.string.uuid(),
      transactionId: faker.string.uuid(),
      amount: faker.number.int({ min: 50, max: 500 }),
      status: 'completed',
      timestamp: new Date().toISOString(),
      ...overrides
    }),
    'Frontend payment response mock factory',
    ['frontend', 'payment', 'mock'],
    [],
    'front'
  )
}

// ========== 测试上下文管理 ==========

/**
 * 创建前端测试上下文
 */
export function createFrontendTestContext(contextId?: string): ReturnType<typeof createTestContext> {
  return createTestContext(contextId || `frontend-${faker.string.uuid()}`)
}

/**
 * 获取前端全局测试上下文
 */
export function getFrontendGlobalTestContext(contextId: string): ReturnType<typeof getGlobalTestContext> {
  return getGlobalTestContext(`frontend-${contextId}`)
}

// ========== 增强的工厂函数 ==========

/**
 * 创建验证后的用户数据
 */
export function createValidatedUser(overrides?: Partial<User>): User {
  const user = createUser(overrides)
  const validation = validateData('user', user)

  if (!validation.isValid) {
    throw new Error(`User data validation failed: ${validation.errors.join(', ')}`)
  }

  if (validation.warnings.length > 0) {
    console.warn('User data validation warnings:', validation.warnings)
  }

  return user
}

/**
 * 创建验证后的课程数据
 */
export function createValidatedCourse(overrides?: Partial<Course>): Course {
  const course = createCourse(overrides)
  const validation = validateData('course', course)

  if (!validation.isValid) {
    throw new Error(`Course data validation failed: ${validation.errors.join(', ')}`)
  }

  if (validation.warnings.length > 0) {
    console.warn('Course data validation warnings:', validation.warnings)
  }

  return course
}

/**
 * 创建验证后的预约数据
 */
export function createValidatedBooking(overrides?: Partial<Booking>): Booking {
  const booking = createBooking(overrides)
  const validation = validateData('booking', booking)

  if (!validation.isValid) {
    throw new Error(`Booking data validation failed: ${validation.errors.join(', ')}`)
  }

  if (validation.warnings.length > 0) {
    console.warn('Booking data validation warnings:', validation.warnings)
  }

  return booking
}

// ========== 批量创建和验证 ==========

/**
 * 批量创建并验证用户数据
 */
export function createValidatedUsers(count: number, baseOverrides?: Partial<User>): User[] {
  const users = createUsers(count, baseOverrides)
  const validation = validateData('user', users)

  if (!validation.isValid) {
    throw new Error(`User data list validation failed: ${validation.errors.join(', ')}`)
  }

  if (validation.warnings.length > 0) {
    console.warn('User data list validation warnings:', validation.warnings)
  }

  return users
}

/**
 * 批量创建并验证课程数据
 */
export function createValidatedCourses(count: number, baseOverrides?: Partial<Course>): Course[] {
  const courses = createCourses(count, baseOverrides)
  const validation = validateData('course', courses)

  if (!validation.isValid) {
    throw new Error(`Course data list validation failed: ${validation.errors.join(', ')}`)
  }

  if (validation.warnings.length > 0) {
    console.warn('Course data list validation warnings:', validation.warnings)
  }

  return courses
}

/**
 * 批量创建并验证预约数据
 */
export function createValidatedBookings(count: number, baseOverrides?: Partial<Booking>): Booking[] {
  const bookings = createBookings(count, baseOverrides)
  const validation = validateData('booking', bookings)

  if (!validation.isValid) {
    throw new Error(`Booking data list validation failed: ${validation.errors.join(', ')}`)
  }

  if (validation.warnings.length > 0) {
    console.warn('Booking data list validation warnings:', validation.warnings)
  }

  return bookings
}

// ========== 兼容性函数 ==========

/**
 * 与现有test-helpers.ts保持兼容
 */
export const createMockUser = createUser
export const createMockCourse = createCourse
export const createMockBooking = createBooking
