/**
 * 测试上下文管理器
 * 提供测试隔离和自动清理功能
 */

import { CleanupManager, CleanupScope } from './cleanup-manager'
import { faker } from '@faker-js/faker'

// ========== 类型定义 ==========

/**
 * 测试上下文选项
 */
export interface TestContextOptions {
  name?: string
  autoCleanup?: boolean
  cleanupTimeout?: number
  tags?: string[]
}

/**
 * 测试上下文统计信息
 */
export interface TestContextStats {
  contextId: string
  name: string
  createdAt: Date
  duration: number
  cleanupCount: number
  errorCount: number
  resourceCount: Record<string, number>
}

/**
 * 资源管理器接口
 */
export interface ResourceManager<T = any> {
  create: (data: Partial<T>) => T
  cleanup: (resource: T) => Promise<void> | void
  getStats: () => Record<string, number>
}

// ========== 测试上下文类 ==========

/**
 * 测试上下文类
 * 管理单个测试的资源和清理
 */
export class TestContext {
  private contextId: string
  private name: string
  private createdAt: Date
  private autoCleanup: boolean
  private cleanupTimeout: number
  private tags: string[]
  private cleanupScope: CleanupScope
  private resources = new Map<string, any[]>()
  private resourceManagers = new Map<string, ResourceManager>()
  private errors: Error[] = []
  private stats: Partial<TestContextStats> = {}

  constructor(options: TestContextOptions = {}) {
    this.contextId = faker.string.uuid()
    this.name = options.name || `TestContext-${this.contextId.slice(0, 8)}`
    this.createdAt = new Date()
    this.autoCleanup = options.autoCleanup !== false
    this.cleanupTimeout = options.cleanupTimeout || 30000 // 默认30秒超时
    this.tags = options.tags || []

    // 创建专用的清理作用域
    this.cleanupScope = cleanupManager.createScope(
      `context-${this.contextId}`,
      ['test-context', ...this.tags]
    )

    this.initializeStats()
  }

  /**
   * 初始化统计信息
   */
  private initializeStats(): void {
    this.stats = {
      contextId: this.contextId,
      name: this.name,
      createdAt: this.createdAt,
      duration: 0,
      cleanupCount: 0,
      errorCount: 0,
      resourceCount: {}
    }
  }

  /**
   * 注册资源管理器
   */
  registerResourceManager<T>(
    type: string,
    manager: ResourceManager<T>
  ): void {
    this.resourceManagers.set(type, manager)
    this.resources.set(type, [])
    this.stats.resourceCount![type] = 0
  }

  /**
   * 创建资源
   */
  createResource<T>(
    type: string,
    data: Partial<T>,
    options: { autoCleanup?: boolean } = {}
  ): T {
    const manager = this.resourceManagers.get(type)
    if (!manager) {
      throw new Error(`Resource manager for type '${type}' not registered`)
    }

    try {
      const resource = manager.create(data)

      // 记录资源
      if (!this.resources.has(type)) {
        this.resources.set(type, [])
      }
      this.resources.get(type)!.push(resource)
      this.stats.resourceCount![type] = (this.stats.resourceCount![type] || 0) + 1

      // 注册清理任务
      if (options.autoCleanup !== false) {
        this.cleanupScope.register(
          `resource-${type}-${resource.id || faker.string.uuid()}`,
          () => manager.cleanup(resource),
          {
            name: `Cleanup ${type} resource`,
            priority: 10,
            tags: [type, 'resource']
          }
        )
      }

      return resource
    } catch (error) {
      this.recordError(error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  /**
   * 批量创建资源
   */
  createResources<T>(
    type: string,
    dataList: Array<Partial<T>>,
    options: { autoCleanup?: boolean } = {}
  ): T[] {
    return dataList.map(data => this.createResource(type, data, options))
  }

  /**
   * 获取资源
   */
  getResources<T>(type: string): T[] {
    return this.resources.get(type) || []
  }

  /**
   * 获取资源数量
   */
  getResourceCount(type?: string): number {
    if (type) {
      return this.stats.resourceCount![type] || 0
    }
    return Object.values(this.stats.resourceCount!).reduce((sum, count) => sum + count, 0)
  }

  /**
   * 添加自定义清理任务
   */
  addCleanupTask(
    id: string,
    callback: () => Promise<void> | void,
    options: {
      name?: string
      priority?: number
      tags?: string[]
    } = {}
  ): void {
    this.cleanupScope.register(id, callback, {
      name: options.name || `Custom cleanup: ${id}`,
      priority: options.priority ?? 5,
      tags: [...(options.tags || []), 'custom']
    })
  }

  /**
   * 记录错误
   */
  recordError(error: Error): void {
    this.errors.push(error)
    this.stats.errorCount!++
  }

  /**
   * 获取错误列表
   */
  getErrors(): Error[] {
    return [...this.errors]
  }

  /**
   * 检查是否有错误
   */
  hasErrors(): boolean {
    return this.errors.length > 0
  }

  /**
   * 执行清理
   */
  async cleanup(options: { force?: boolean } = {}): Promise<{
    success: boolean
    results: Array<{ id: string; success: boolean; error?: Error; duration: number }>
    errors: Error[]
  }> {
    const startTime = Date.now()

    try {
      console.log(`Starting cleanup for test context: ${this.name} (${this.contextId})`)

      const cleanupResult = await this.cleanupScope.execute({
        continueOnError: true
      })

      const duration = Date.now() - startTime
      this.stats.duration = duration
      this.stats.cleanupCount = cleanupResult.results.length

      console.log(`Cleanup completed for test context: ${this.name} (${this.contextId})`)

      return {
        success: cleanupResult.overallSuccess,
        results: cleanupResult.results,
        errors: this.errors
      }
    } catch (error) {
      this.recordError(error instanceof Error ? error : new Error(String(error)))
      return {
        success: false,
        results: [],
        errors: this.errors
      }
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): TestContextStats {
    return {
      ...this.stats,
      duration: this.stats.duration || Date.now() - this.createdAt.getTime(),
      cleanupCount: this.stats.cleanupCount || 0,
      errorCount: this.stats.errorCount || 0,
      resourceCount: this.stats.resourceCount || {}
    } as TestContextStats
  }

  /**
   * 获取上下文ID
   */
  getContextId(): string {
    return this.contextId
  }

  /**
   * 获取上下文名称
   */
  getName(): string {
    return this.name
  }

  /**
   * 检查是否已清理
   */
  isCleaned(): boolean {
    return this.stats.cleanupCount !== undefined && this.stats.cleanupCount > 0
  }
}

// ========== 测试上下文管理器类 ==========

/**
 * 测试上下文管理器类
 * 管理多个测试上下文的生命周期
 */
export class TestContextManager {
  private contexts = new Map<string, TestContext>()
  private activeContextId: string | null = null

  /**
   * 创建新的测试上下文
   */
  createContext(options: TestContextOptions = {}): TestContext {
    const context = new TestContext(options)
    this.contexts.set(context.getContextId(), context)

    if (!this.activeContextId) {
      this.activeContextId = context.getContextId()
    }

    return context
  }

  /**
   * 获取测试上下文
   */
  getContext(id: string): TestContext | undefined {
    return this.contexts.get(id)
  }

  /**
   * 获取活动上下文
   */
  getActiveContext(): TestContext | null {
    return this.activeContextId ? this.contexts.get(this.activeContextId) || null : null
  }

  /**
   * 设置活动上下文
   */
  setActiveContext(id: string): boolean {
    if (this.contexts.has(id)) {
      this.activeContextId = id
      return true
    }
    return false
  }

  /**
   * 清理测试上下文
   */
  async cleanupContext(id: string, options: { force?: boolean } = {}): Promise<boolean> {
    const context = this.contexts.get(id)
    if (!context) {
      return false
    }

    const result = await context.cleanup(options)

    if (result.success || options.force) {
      this.contexts.delete(id)
      if (this.activeContextId === id) {
        this.activeContextId = null
      }
      return true
    }

    return false
  }

  /**
   * 清理所有上下文
   */
  async cleanupAll(options: { force?: boolean; timeout?: number } = {}): Promise<{
    results: Array<{ id: string; success: boolean }>
    overallSuccess: boolean
  }> {
    const results: Array<{ id: string; success: boolean }> = []
    let overallSuccess = true

    const contextIds = Array.from(this.contexts.keys())
    const timeout = options.timeout || 60000 // 默认60秒超时

    const cleanupPromises = contextIds.map(async (id) => {
      try {
        const success = await this.cleanupContext(id, options)
        results.push({ id, success })
        if (!success) {
          overallSuccess = false
        }
      } catch (error) {
        console.error(`Failed to cleanup context ${id}:`, error)
        results.push({ id, success: false })
        overallSuccess = false
      }
    })

    // 设置超时
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Cleanup timeout')), timeout)
    })

    try {
      await Promise.race([Promise.all(cleanupPromises), timeoutPromise])
    } catch (error) {
      console.error('Cleanup timeout or error:', error)
      overallSuccess = false
    }

    return { results, overallSuccess }
  }

  /**
   * 获取所有上下文ID
   */
  getAllContextIds(): string[] {
    return Array.from(this.contexts.keys())
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    totalContexts: number
    activeContexts: number
    totalResources: number
    totalErrors: number
    contextStats: TestContextStats[]
  } {
    const contextStats = Array.from(this.contexts.values()).map(ctx => ctx.getStats())
    const totalResources = contextStats.reduce((sum, stats) =>
      sum + Object.values(stats.resourceCount).reduce((s, c) => s + c, 0), 0
    )
    const totalErrors = contextStats.reduce((sum, stats) => sum + stats.errorCount, 0)

    return {
      totalContexts: this.contexts.size,
      activeContexts: this.contexts.size, // 简化处理，实际可以根据是否清理来判断
      totalResources,
      totalErrors,
      contextStats
    }
  }

  /**
   * 重置管理器
   */
  async reset(): Promise<void> {
    await this.cleanupAll({ force: true })
    this.contexts.clear()
    this.activeContextId = null
  }
}

// ========== 便捷函数和装饰器 ==========

/**
 * 创建测试上下文
 */
export function createTestContext(options?: TestContextOptions): TestContext {
  return testContextManager.createContext(options)
}

/**
 * 获取当前活动上下文
 */
export function getActiveTestContext(): TestContext | null {
  return testContextManager.getActiveContext()
}

/**
 * 清理当前活动上下文
 */
export async function cleanupActiveContext(): Promise<boolean> {
  const activeContext = testContextManager.getActiveContext()
  if (!activeContext) {
    return true
  }
  return testContextManager.cleanupContext(activeContext.getContextId())
}

/**
 * 测试上下文装饰器
 */
export function withTestContext(options?: TestContextOptions) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const context = testContextManager.createContext({
        name: `${target.constructor.name}.${propertyKey}`,
        ...options
      })

      try {
        const result = await originalMethod.apply(this, args)
        return result
      } finally {
        await context.cleanup()
      }
    }

    return descriptor
  }
}

/**
 * 自动清理装饰器
 */
export function autoCleanup(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value

  descriptor.value = async function (...args: any[]) {
    try {
      const result = await originalMethod.apply(this, args)
      return result
    } finally {
      await cleanupActiveContext()
    }
  }

  return descriptor
}

// ========== 资源管理器实现 ==========

/**
 * 通用资源管理器
 */
export class GenericResourceManager<T> implements ResourceManager<T> {
  private resources = new Map<string, T>()
  private createFn: (data: Partial<T>) => T
  private cleanupFn?: (resource: T) => Promise<void> | void

  constructor(
    createFn: (data: Partial<T>) => T,
    cleanupFn?: (resource: T) => Promise<void> | void
  ) {
    this.createFn = createFn
    this.cleanupFn = cleanupFn
  }

  create(data: Partial<T>): T {
    const resource = this.createFn(data)
    const id = (resource as any).id || faker.string.uuid()
    this.resources.set(id, resource)
    return resource
  }

  async cleanup(resource: T): Promise<void> {
    if (this.cleanupFn) {
      const result = this.cleanupFn(resource)
      if (result instanceof Promise) {
        await result
      }
    }

    // 从资源映射中移除
    const id = (resource as any).id
    if (id) {
      this.resources.delete(id)
    }
  }

  getStats(): Record<string, number> {
    return {
      total: this.resources.size,
      active: this.resources.size
    }
  }
}

// ========== 全局实例 ==========

import { cleanupManager } from './cleanup-manager'

export const testContextManager = new TestContextManager()

// ========== 默认资源管理器 ==========

/**
 * 用户资源管理器
 */
export const userResourceManager = new GenericResourceManager(
  (data) => ({ id: faker.string.uuid(), ...data }),
  async (user) => {
    console.log(`Cleaning up user: ${(user as any).username || (user as any).id}`)
  }
)

/**
 * 数据库资源管理器
 */
export const databaseResourceManager = new GenericResourceManager(
  (data) => ({ id: faker.string.uuid(), ...data }),
  async (record) => {
    console.log(`Cleaning up database record: ${(record as any).id}`)
  }
)
