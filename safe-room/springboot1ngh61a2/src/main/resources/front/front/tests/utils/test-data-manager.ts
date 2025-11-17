/**
 * 测试数据管理器
 * 管理测试用例之间的数据关系，避免数据冲突
 */

import { Page } from '@playwright/test'
import fs from 'fs'
import path from 'path'

export interface TestUser {
  id: string
  username: string
  password: string
  email?: string
  phone?: string
  role?: string
  createdAt: Date
  isActive: boolean
}

export interface TestCourse {
  id: string
  name: string
  type: string
  price: number
  duration: number
  instructor: string
  createdAt: Date
  isActive: boolean
}

export interface TestBooking {
  id: string
  userId: string
  courseId: string
  bookingTime: Date
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  createdAt: Date
}

export interface TestDataContext {
  testId: string
  testName: string
  createdData: {
    users: TestUser[]
    courses: TestCourse[]
    bookings: TestBooking[]
  }
  dependencies: string[]
  cleanupRequired: boolean
}

/**
 * 测试数据管理器类
 */
export class TestDataManager {
  private static instance: TestDataManager
  private dataContexts: Map<string, TestDataContext> = new Map()
  private dataStorePath: string
  private isolationPrefix = 'e2e_test_'

  constructor() {
    this.dataStorePath = path.join(process.cwd(), 'test-data-store.json')
    this.loadDataStore()
  }

  static getInstance(): TestDataManager {
    if (!TestDataManager.instance) {
      TestDataManager.instance = new TestDataManager()
    }
    return TestDataManager.instance
  }

  /**
   * 创建测试数据上下文
   */
  createTestContext(testId: string, testName: string, dependencies: string[] = []): TestDataContext {
    const context: TestDataContext = {
      testId,
      testName,
      createdData: {
        users: [],
        courses: [],
        bookings: []
      },
      dependencies: [...dependencies],
      cleanupRequired: true
    }

    this.dataContexts.set(testId, context)
    this.saveDataStore()

    return context
  }

  /**
   * 获取测试数据上下文
   */
  getTestContext(testId: string): TestDataContext | undefined {
    return this.dataContexts.get(testId)
  }

  /**
   * 生成隔离的用户数据
   */
  generateIsolatedUser(overrides: Partial<TestUser> = {}): TestUser {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)

    return {
      id: `${this.isolationPrefix}user_${timestamp}_${random}`,
      username: `${this.isolationPrefix}user_${timestamp}_${random}`,
      password: '123456',
      email: `test_${timestamp}_${random}@example.com`,
      phone: `138001${random.toString().padStart(5, '0')}`,
      role: 'user',
      createdAt: new Date(),
      isActive: true,
      ...overrides
    }
  }

  /**
   * 生成隔离的课程数据
   */
  generateIsolatedCourse(overrides: Partial<TestCourse> = {}): TestCourse {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)

    return {
      id: `${this.isolationPrefix}course_${timestamp}_${random}`,
      name: `${this.isolationPrefix}测试课程_${timestamp}_${random}`,
      type: '健身课程',
      price: 100 + random,
      duration: 60,
      instructor: '测试教练',
      createdAt: new Date(),
      isActive: true,
      ...overrides
    }
  }

  /**
   * 生成隔离的预约数据
   */
  generateIsolatedBooking(userId: string, courseId: string, overrides: Partial<TestBooking> = {}): TestBooking {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)

    return {
      id: `${this.isolationPrefix}booking_${timestamp}_${random}`,
      userId,
      courseId,
      bookingTime: new Date(timestamp + random * 60000), // 未来几分钟
      status: 'pending',
      createdAt: new Date(),
      ...overrides
    }
  }

  /**
   * 注册创建的用户数据
   */
  registerUser(testId: string, user: TestUser): void {
    const context = this.getTestContext(testId)
    if (context) {
      context.createdData.users.push(user)
      this.saveDataStore()
    }
  }

  /**
   * 注册创建的课程数据
   */
  registerCourse(testId: string, course: TestCourse): void {
    const context = this.getTestContext(testId)
    if (context) {
      context.createdData.courses.push(course)
      this.saveDataStore()
    }
  }

  /**
   * 注册创建的预约数据
   */
  registerBooking(testId: string, booking: TestBooking): void {
    const context = this.getTestContext(testId)
    if (context) {
      context.createdData.bookings.push(booking)
      this.saveDataStore()
    }
  }

  /**
   * 检查数据依赖是否满足
   */
  checkDependencies(testId: string): { satisfied: boolean; missing: string[] } {
    const context = this.getTestContext(testId)
    if (!context) {
      return { satisfied: false, missing: ['context_not_found'] }
    }

    const missing: string[] = []

    for (const depTestId of context.dependencies) {
      const depContext = this.getTestContext(depTestId)
      if (!depContext) {
        missing.push(`test_context_${depTestId}`)
        continue
      }

      // 检查依赖的数据是否存在
      if (depContext.createdData.users.length === 0 &&
          depContext.createdData.courses.length === 0 &&
          depContext.createdData.bookings.length === 0) {
        missing.push(`test_data_${depTestId}`)
      }
    }

    return {
      satisfied: missing.length === 0,
      missing
    }
  }

  /**
   * 获取可重用的测试数据
   */
  getReusableData(type: 'user' | 'course' | 'booking', filters: any = {}): any[] {
    const allContexts = Array.from(this.dataContexts.values())
    const reusableData: any[] = []

    for (const context of allContexts) {
      let dataArray: any[]

      switch (type) {
        case 'user':
          dataArray = context.createdData.users
          break
        case 'course':
          dataArray = context.createdData.courses
          break
        case 'booking':
          dataArray = context.createdData.bookings
          break
        default:
          continue
      }

      // 应用过滤器
      const filteredData = dataArray.filter(item => {
        for (const [key, value] of Object.entries(filters)) {
          if (item[key] !== value) {
            return false
          }
        }
        return true
      })

      reusableData.push(...filteredData)
    }

    return reusableData
  }

  /**
   * 清理测试数据上下文
   */
  async cleanupTestContext(testId: string, page?: Page): Promise<void> {
    const context = this.getTestContext(testId)
    if (!context || !context.cleanupRequired) {
      return
    }

    try {
      // 清理预约数据
      for (const booking of context.createdData.bookings.reverse()) {
        await this.cleanupBooking(booking, page)
      }

      // 清理课程数据
      for (const course of context.createdData.courses.reverse()) {
        await this.cleanupCourse(course, page)
      }

      // 清理用户数据
      for (const user of context.createdData.users.reverse()) {
        await this.cleanupUser(user, page)
      }

      // 移除上下文
      this.dataContexts.delete(testId)
      this.saveDataStore()

    } catch (error) {
      console.warn(`清理测试上下文 ${testId} 时发生错误:`, error)
      // 即使清理失败，也要移除上下文以避免重复清理
      this.dataContexts.delete(testId)
      this.saveDataStore()
    }
  }

  /**
   * 清理所有测试数据
   */
  async cleanupAllTestData(page?: Page): Promise<void> {
    const testIds = Array.from(this.dataContexts.keys())

    for (const testId of testIds) {
      await this.cleanupTestContext(testId, page)
    }

    // 清理数据存储文件
    if (fs.existsSync(this.dataStorePath)) {
      fs.unlinkSync(this.dataStorePath)
    }
  }

  /**
   * 清理用户数据
   */
  private async cleanupUser(user: TestUser, page?: Page): Promise<void> {
    if (!page) return

    try {
      // 通过API删除用户
      await page.request.delete(`/api/users/${user.id}`)
    } catch (error) {
      console.warn(`无法清理用户 ${user.username}:`, error)
    }
  }

  /**
   * 清理课程数据
   */
  private async cleanupCourse(course: TestCourse, page?: Page): Promise<void> {
    if (!page) return

    try {
      // 通过API删除课程
      await page.request.delete(`/api/courses/${course.id}`)
    } catch (error) {
      console.warn(`无法清理课程 ${course.name}:`, error)
    }
  }

  /**
   * 清理预约数据
   */
  private async cleanupBooking(booking: TestBooking, page?: Page): Promise<void> {
    if (!page) return

    try {
      // 通过API删除预约
      await page.request.delete(`/api/bookings/${booking.id}`)
    } catch (error) {
      console.warn(`无法清理预约 ${booking.id}:`, error)
    }
  }

  /**
   * 加载数据存储
   */
  private loadDataStore(): void {
    try {
      if (fs.existsSync(this.dataStorePath)) {
        const data = fs.readFileSync(this.dataStorePath, 'utf8')
        const parsed = JSON.parse(data)

        // 转换日期字符串回Date对象
        for (const [testId, context] of Object.entries(parsed)) {
          const ctx = context as TestDataContext
          ctx.createdData.users.forEach(user => {
            user.createdAt = new Date(user.createdAt)
          })
          ctx.createdData.courses.forEach(course => {
            course.createdAt = new Date(course.createdAt)
          })
          ctx.createdData.bookings.forEach(booking => {
            booking.createdAt = new Date(booking.createdAt)
            booking.bookingTime = new Date(booking.bookingTime)
          })

          this.dataContexts.set(testId, ctx)
        }
      }
    } catch (error) {
      console.warn('加载测试数据存储失败:', error)
    }
  }

  /**
   * 保存数据存储
   */
  private saveDataStore(): void {
    try {
      const data = Object.fromEntries(this.dataContexts)
      fs.writeFileSync(this.dataStorePath, JSON.stringify(data, null, 2))
    } catch (error) {
      console.error('保存测试数据存储失败:', error)
    }
  }

  /**
   * 获取数据统计信息
   */
  getDataStats(): {
    totalContexts: number
    totalUsers: number
    totalCourses: number
    totalBookings: number
  } {
    let totalUsers = 0
    let totalCourses = 0
    let totalBookings = 0

    for (const context of this.dataContexts.values()) {
      totalUsers += context.createdData.users.length
      totalCourses += context.createdData.courses.length
      totalBookings += context.createdData.bookings.length
    }

    return {
      totalContexts: this.dataContexts.size,
      totalUsers,
      totalCourses,
      totalBookings
    }
  }
}

/**
 * 测试数据隔离装饰器
 */
export function withDataIsolation(testFunction: Function, dependencies: string[] = []) {
  return async function(...args: any[]) {
    const testInfo = args[0] // Playwright的testInfo参数
    const testId = testInfo.testId || `test_${Date.now()}_${Math.random()}`

    const dataManager = TestDataManager.getInstance()
    const context = dataManager.createTestContext(testId, testInfo.title, dependencies)

    try {
      // 检查依赖
      const depCheck = dataManager.checkDependencies(testId)
      if (!depCheck.satisfied) {
        throw new Error(`测试依赖未满足: ${depCheck.missing.join(', ')}`)
      }

      // 执行测试
      const result = await testFunction.apply(this, args)

      return result

    } finally {
      // 清理数据（在afterEach中处理）
    }
  }
}

/**
 * 便捷的数据管理函数
 */
export const testData = {
  /**
   * 创建用户数据
   */
  createUser: (testId: string, overrides: Partial<TestUser> = {}) => {
    const manager = TestDataManager.getInstance()
    const user = manager.generateIsolatedUser(overrides)
    manager.registerUser(testId, user)
    return user
  },

  /**
   * 创建课程数据
   */
  createCourse: (testId: string, overrides: Partial<TestCourse> = {}) => {
    const manager = TestDataManager.getInstance()
    const course = manager.generateIsolatedCourse(overrides)
    manager.registerCourse(testId, course)
    return course
  },

  /**
   * 创建预约数据
   */
  createBooking: (testId: string, userId: string, courseId: string, overrides: Partial<TestBooking> = {}) => {
    const manager = TestDataManager.getInstance()
    const booking = manager.generateIsolatedBooking(userId, courseId, overrides)
    manager.registerBooking(testId, booking)
    return booking
  },

  /**
   * 查找可重用数据
   */
  findReusable: (type: 'user' | 'course' | 'booking', filters: any = {}) => {
    const manager = TestDataManager.getInstance()
    return manager.getReusableData(type, filters)
  },

  /**
   * 清理测试数据
   */
  cleanup: async (testId: string, page?: Page) => {
    const manager = TestDataManager.getInstance()
    await manager.cleanupTestContext(testId, page)
  },

  /**
   * 获取统计信息
   */
  getStats: () => {
    const manager = TestDataManager.getInstance()
    return manager.getDataStats()
  }
}

export default TestDataManager
