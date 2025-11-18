import { faker } from '@faker-js/faker'
import { User, createMockUser, createMockUsers, validateUserData } from './user.factory'
import { Course, createMockCourse, createMockCourses, validateCourseData } from './course.factory'
import { Booking, createMockBooking, createMockBookings, validateBookingData } from './booking.factory'

/**
 * Test Data Manager - 统一的测试数据管理器
 * 提供数据生成、验证、清理和管理功能
 */
export class TestDataManager {
  private static instance: TestDataManager
  private testContexts: Map<string, TestContext> = new Map()
  private generatedData: Map<string, any[]> = new Map()

  private constructor() {}

  static getInstance(): TestDataManager {
    if (!TestDataManager.instance) {
      TestDataManager.instance = new TestDataManager()
    }
    return TestDataManager.instance
  }

  /**
   * 创建测试上下文
   */
  createTestContext(testId: string, testName: string): TestContext {
    const context: TestContext = {
      id: testId,
      name: testName,
      createdAt: new Date(),
      data: new Map(),
      cleanup: []
    }

    this.testContexts.set(testId, context)
    return context
  }

  /**
   * 获取测试上下文
   */
  getTestContext(testId: string): TestContext | undefined {
    return this.testContexts.get(testId)
  }

  /**
   * 清理测试上下文
   */
  async cleanupTestContext(testId: string, page?: any): Promise<void> {
    const context = this.testContexts.get(testId)
    if (!context) return

    // 执行清理函数
    for (const cleanupFn of context.cleanup) {
      try {
        await cleanupFn(page)
      } catch (error) {
        console.warn(`Cleanup failed for test ${testId}:`, error)
      }
    }

    // 清理数据
    context.data.clear()
    this.testContexts.delete(testId)
  }

  /**
   * 生成隔离的用户数据
   */
  generateIsolatedUser(overrides: Partial<User> = {}): User {
    const user = createMockUser({
      username: `test_${faker.string.alphanumeric(8)}`,
      email: `test_${faker.string.alphanumeric(8)}@example.com`,
      ...overrides
    })

    this.storeGeneratedData('users', user)
    return user
  }

  /**
   * 生成隔离的课程数据
   */
  generateIsolatedCourse(overrides: Partial<Course> = {}): Course {
    const course = createMockCourse({
      kechengmingcheng: `测试课程_${faker.string.alphanumeric(6)}`,
      ...overrides
    })

    this.storeGeneratedData('courses', course)
    return course
  }

  /**
   * 生成隔离的预约数据
   */
  generateIsolatedBooking(userId: number, courseId: number, overrides: Partial<Booking> = {}): Booking {
    const booking = createMockBooking({
      yonghuzhanghao: `user_${userId}`,
      kechengmingcheng: `course_${courseId}`,
      ...overrides
    })

    this.storeGeneratedData('bookings', booking)
    return booking
  }

  /**
   * 生成完整的业务场景数据
   */
  generateBusinessScenario(scenario: BusinessScenario): BusinessScenarioData {
    const testId = `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const context = this.createTestContext(testId, scenario.name)

    switch (scenario.type) {
      case 'user_registration':
        return this.generateUserRegistrationScenario(context, scenario)

      case 'course_booking':
        return this.generateCourseBookingScenario(context, scenario)

      case 'membership_purchase':
        return this.generateMembershipPurchaseScenario(context, scenario)

      case 'coach_booking':
        return this.generateCoachBookingScenario(context, scenario)

      case 'complete_user_journey':
        return this.generateCompleteUserJourneyScenario(context, scenario)

      default:
        throw new Error(`Unknown scenario type: ${scenario.type}`)
    }
  }

  /**
   * 批量生成测试数据
   */
  generateBulkData(config: BulkDataConfig): BulkDataResult {
    const result: BulkDataResult = {
      users: [],
      courses: [],
      bookings: [],
      metadata: {
        generatedAt: new Date(),
        config,
        validation: {
          passed: true,
          errors: [],
          warnings: []
        }
      }
    }

    // 生成用户
    if (config.users) {
      result.users = createMockUsers(config.users.count, config.users.overrides)
    }

    // 生成课程
    if (config.courses) {
      result.courses = createMockCourses(config.courses.count, config.courses.overrides)
    }

    // 生成预约
    if (config.bookings) {
      result.bookings = createMockBookings(config.bookings.count, config.bookings.overrides)
    }

    // 验证数据一致性
    result.metadata.validation = this.validateBulkData(result)

    return result
  }

  /**
   * 验证批量数据
   */
  private validateBulkData(data: BulkDataResult): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // 验证用户数据
    if (data.users.length > 0) {
      const userValidation = this.validateUserListConsistency(data.users)
      errors.push(...userValidation.errors)
      warnings.push(...userValidation.warnings)
    }

    // 验证课程数据
    if (data.courses.length > 0) {
      const courseValidation = this.validateCourseListConsistency(data.courses)
      errors.push(...courseValidation.errors)
      warnings.push(...courseValidation.warnings)
    }

    // 验证预约数据
    if (data.bookings.length > 0) {
      const bookingValidation = this.validateBookingListConsistency(data.bookings)
      errors.push(...bookingValidation.errors)
      warnings.push(...bookingValidation.warnings)
    }

    return {
      passed: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * 存储生成的数据
   */
  private storeGeneratedData(type: string, data: any): void {
    if (!this.generatedData.has(type)) {
      this.generatedData.set(type, [])
    }
    this.generatedData.get(type)!.push(data)
  }

  /**
   * 获取生成的测试数据
   */
  getGeneratedData(type: string): any[] {
    return this.generatedData.get(type) || []
  }

  /**
   * 清理所有生成的测试数据
   */
  clearGeneratedData(): void {
    this.generatedData.clear()
  }

  // 私有验证方法
  private validateUserListConsistency(users: User[]): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    const usernames = new Set<string>()
    const emails = new Set<string>()

    users.forEach((user, index) => {
      if (!validateUserData(user)) {
        errors.push(`User at index ${index} has invalid structure`)
      }

      if (usernames.has(user.username)) {
        warnings.push(`Duplicate username ${user.username} found`)
      }
      usernames.add(user.username)

      if (emails.has(user.email)) {
        warnings.push(`Duplicate email ${user.email} found`)
      }
      emails.add(user.email)
    })

    return { passed: errors.length === 0, errors, warnings }
  }

  private validateCourseListConsistency(courses: Course[]): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    const courseNames = new Set<string>()

    courses.forEach((course, index) => {
      if (!validateCourseData(course)) {
        errors.push(`Course at index ${index} has invalid structure`)
      }

      if (courseNames.has(course.kechengmingcheng)) {
        warnings.push(`Duplicate course name ${course.kechengmingcheng} found`)
      }
      courseNames.add(course.kechengmingcheng)
    })

    return { passed: errors.length === 0, errors, warnings }
  }

  private validateBookingListConsistency(bookings: Booking[]): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    bookings.forEach((booking, index) => {
      if (!validateBookingData(booking)) {
        errors.push(`Booking at index ${index} has invalid structure`)
      }
    })

    return { passed: errors.length === 0, errors, warnings }
  }

  // 业务场景生成方法
  private generateUserRegistrationScenario(context: TestContext, scenario: BusinessScenario): UserRegistrationScenario {
    const user = this.generateIsolatedUser({
      role: 'user',
      status: 1
    })

    context.data.set('user', user)

    return {
      context,
      user,
      expected: {
        registrationSuccess: true,
        loginSuccess: true,
        profileCreated: true
      }
    }
  }

  private generateCourseBookingScenario(context: TestContext, scenario: BusinessScenario): CourseBookingScenario {
    const user = this.generateIsolatedUser()
    const course = this.generateIsolatedCourse()
    const booking = this.generateIsolatedBooking(user.id, course.id)

    context.data.set('user', user)
    context.data.set('course', course)
    context.data.set('booking', booking)

    return {
      context,
      user,
      course,
      booking,
      expected: {
        bookingSuccess: true,
        notificationSent: true,
        calendarUpdated: true
      }
    }
  }

  private generateMembershipPurchaseScenario(context: TestContext, scenario: BusinessScenario): MembershipPurchaseScenario {
    const user = this.generateIsolatedUser()
    const membership = {
      id: faker.number.int({ min: 1, max: 100 }),
      huiyuankamingcheng: `会员卡_${faker.string.alphanumeric(4)}`,
      jiage: faker.number.int({ min: 100, max: 1000 }),
      youxiaoqi: faker.number.int({ min: 30, max: 365 }),
      huiyuankaxiangqing: faker.lorem.sentence()
    }

    context.data.set('user', user)
    context.data.set('membership', membership)

    return {
      context,
      user,
      membership,
      expected: {
        purchaseSuccess: true,
        paymentProcessed: true,
        membershipActivated: true
      }
    }
  }

  private generateCoachBookingScenario(context: TestContext, scenario: BusinessScenario): CoachBookingScenario {
    const user = this.generateIsolatedUser()
    const coach = this.generateIsolatedUser({ role: 'coach' })
    const booking = {
      id: faker.number.int({ min: 1, max: 100 }),
      jiaoliangonghao: `COACH_${coach.id}`,
      jiaolianxingming: coach.realName || '教练',
      yuyueshijian: faker.date.future().toISOString().slice(0, 16).replace('T', ' '),
      yonghuzhanghao: user.username,
      yonghuxingming: user.realName || '用户',
      shoujihaoma: user.phone || faker.phone.number(),
      zhuangtai: '已预约'
    }

    context.data.set('user', user)
    context.data.set('coach', coach)
    context.data.set('booking', booking)

    return {
      context,
      user,
      coach,
      booking,
      expected: {
        bookingSuccess: true,
        coachNotified: true,
        scheduleUpdated: true
      }
    }
  }

  private generateCompleteUserJourneyScenario(context: TestContext, scenario: BusinessScenario): CompleteUserJourneyScenario {
    const user = this.generateIsolatedUser()
    const course = this.generateIsolatedCourse()
    const coach = this.generateIsolatedUser({ role: 'coach' })
    const membership = {
      id: faker.number.int({ min: 1, max: 100 }),
      huiyuankamingcheng: '季卡',
      jiage: 799,
      youxiaoqi: 90,
      huiyuankaxiangqing: '季卡会员，享受所有课程7折优惠'
    }

    const courseBooking = this.generateIsolatedBooking(user.id, course.id)
    const coachBooking = {
      id: faker.number.int({ min: 1, max: 100 }),
      jiaoliangonghao: `COACH_${coach.id}`,
      jiaolianxingming: coach.realName || '教练',
      yuyueshijian: faker.date.future().toISOString().slice(0, 16).replace('T', ' '),
      yonghuzhanghao: user.username,
      yonghuxingming: user.realName || '用户',
      shoujihaoma: user.phone || faker.phone.number(),
      zhuangtai: '已预约'
    }

    context.data.set('user', user)
    context.data.set('course', course)
    context.data.set('coach', coach)
    context.data.set('membership', membership)
    context.data.set('courseBooking', courseBooking)
    context.data.set('coachBooking', coachBooking)

    return {
      context,
      user,
      course,
      coach,
      membership,
      courseBooking,
      coachBooking,
      expected: {
        registrationSuccess: true,
        courseBookingSuccess: true,
        coachBookingSuccess: true,
        membershipPurchaseSuccess: true,
        profileComplete: true,
        notificationsReceived: true
      }
    }
  }
}

// 类型定义
export interface TestContext {
  id: string
  name: string
  createdAt: Date
  data: Map<string, any>
  cleanup: Array<(page?: any) => Promise<void>>
}

export interface ValidationResult {
  passed: boolean
  errors: string[]
  warnings: string[]
}

export interface BusinessScenario {
  name: string
  type: 'user_registration' | 'course_booking' | 'membership_purchase' | 'coach_booking' | 'complete_user_journey'
  config?: Record<string, any>
}

export interface BusinessScenarioData {
  context: TestContext
  [key: string]: any
}

export interface UserRegistrationScenario extends BusinessScenarioData {
  user: User
  expected: {
    registrationSuccess: boolean
    loginSuccess: boolean
    profileCreated: boolean
  }
}

export interface CourseBookingScenario extends BusinessScenarioData {
  user: User
  course: Course
  booking: Booking
  expected: {
    bookingSuccess: boolean
    notificationSent: boolean
    calendarUpdated: boolean
  }
}

export interface MembershipPurchaseScenario extends BusinessScenarioData {
  user: User
  membership: any
  expected: {
    purchaseSuccess: boolean
    paymentProcessed: boolean
    membershipActivated: boolean
  }
}

export interface CoachBookingScenario extends BusinessScenarioData {
  user: User
  coach: User
  booking: any
  expected: {
    bookingSuccess: boolean
    coachNotified: boolean
    scheduleUpdated: boolean
  }
}

export interface CompleteUserJourneyScenario extends BusinessScenarioData {
  user: User
  course: Course
  coach: User
  membership: any
  courseBooking: Booking
  coachBooking: any
  expected: {
    registrationSuccess: boolean
    courseBookingSuccess: boolean
    coachBookingSuccess: boolean
    membershipPurchaseSuccess: boolean
    profileComplete: boolean
    notificationsReceived: boolean
  }
}

export interface BulkDataConfig {
  users?: {
    count: number
    overrides?: Partial<User>
  }
  courses?: {
    count: number
    overrides?: Partial<Course>
  }
  bookings?: {
    count: number
    overrides?: Partial<Booking>
  }
}

export interface BulkDataResult {
  users: User[]
  courses: Course[]
  bookings: Booking[]
  metadata: {
    generatedAt: Date
    config: BulkDataConfig
    validation: ValidationResult
  }
}

// 导入所需的工厂
import { Course } from './course.factory'
import { Booking } from './booking.factory'
