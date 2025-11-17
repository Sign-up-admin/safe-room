/**
 * 数据清理管理器
 * 管理测试数据的清理和资源释放
 */

import { faker } from '@faker-js/faker'

// ========== 类型定义 ==========

/**
 * 清理回调函数类型
 */
export type CleanupCallback = () => Promise<void> | void

/**
 * 清理任务接口
 */
export interface CleanupTask {
  id: string
  name: string
  callback: CleanupCallback
  priority: number // 清理优先级，数字越大越先执行
  createdAt: Date
  executed: boolean
  tags: string[]
}

/**
 * 清理统计信息
 */
export interface CleanupStats {
  totalTasks: number
  executedTasks: number
  pendingTasks: number
  failedTasks: number
  totalExecutionTime: number
  averageExecutionTime: number
}

// ========== 清理管理器类 ==========

/**
 * 清理管理器类
 * 负责管理和执行数据清理任务
 */
export class CleanupManager {
  private tasks = new Map<string, CleanupTask>()
  private executionHistory: Array<{
    taskId: string
    executedAt: Date
    duration: number
    success: boolean
    error?: Error
  }> = []

  /**
   * 注册清理任务
   */
  register(
    id: string,
    callback: CleanupCallback,
    options: {
      name?: string
      priority?: number
      tags?: string[]
    } = {}
  ): void {
    if (this.tasks.has(id)) {
      console.warn(`Cleanup task '${id}' is already registered. Overwriting...`)
    }

    const task: CleanupTask = {
      id,
      name: options.name || id,
      callback,
      priority: options.priority ?? 0,
      createdAt: new Date(),
      executed: false,
      tags: options.tags ?? []
    }

    this.tasks.set(id, task)
  }

  /**
   * 注销清理任务
   */
  unregister(id: string): boolean {
    return this.tasks.delete(id)
  }

  /**
   * 获取清理任务
   */
  getTask(id: string): CleanupTask | undefined {
    return this.tasks.get(id)
  }

  /**
   * 获取所有任务ID
   */
  getAllTaskIds(): string[] {
    return Array.from(this.tasks.keys())
  }

  /**
   * 获取按优先级排序的任务
   */
  getTasksByPriority(): CleanupTask[] {
    return Array.from(this.tasks.values())
      .sort((a, b) => b.priority - a.priority) // 高优先级先执行
  }

  /**
   * 获取按标签筛选的任务
   */
  getTasksByTag(tag: string): CleanupTask[] {
    return Array.from(this.tasks.values())
      .filter(task => task.tags.includes(tag))
  }

  /**
   * 执行单个清理任务
   */
  async executeTask(id: string): Promise<{ success: boolean; error?: Error; duration: number }> {
    const task = this.tasks.get(id)
    if (!task) {
      throw new Error(`Cleanup task '${id}' not found`)
    }

    if (task.executed) {
      console.warn(`Cleanup task '${id}' has already been executed`)
      return { success: true, duration: 0 }
    }

    const startTime = Date.now()
    let success = false
    let error: Error | undefined

    try {
      console.log(`Executing cleanup task: ${task.name} (${id})`)
      const result = task.callback()
      if (result instanceof Promise) {
        await result
      }
      success = true
      task.executed = true
      console.log(`Cleanup task completed: ${task.name} (${id})`)
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err))
      console.error(`Cleanup task failed: ${task.name} (${id})`, error)
    }

    const duration = Date.now() - startTime

    // 记录执行历史
    this.executionHistory.push({
      taskId: id,
      executedAt: new Date(),
      duration,
      success,
      error
    })

    return { success, error, duration }
  }

  /**
   * 执行多个清理任务
   */
  async executeTasks(
    taskIds: string[],
    options: { continueOnError?: boolean } = {}
  ): Promise<{
    results: Array<{ id: string; success: boolean; error?: Error; duration: number }>
    overallSuccess: boolean
  }> {
    const results: Array<{ id: string; success: boolean; error?: Error; duration: number }> = []
    let overallSuccess = true

    for (const id of taskIds) {
      try {
        const result = await this.executeTask(id)
        results.push({ id, ...result })

        if (!result.success) {
          overallSuccess = false
          if (!options.continueOnError) {
            break
          }
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        results.push({ id, success: false, error: err, duration: 0 })
        overallSuccess = false

        if (!options.continueOnError) {
          break
        }
      }
    }

    return { results, overallSuccess }
  }

  /**
   * 执行所有清理任务（按优先级排序）
   */
  async executeAll(options: { continueOnError?: boolean; tag?: string } = {}): Promise<{
    results: Array<{ id: string; success: boolean; error?: Error; duration: number }>
    overallSuccess: boolean
  }> {
    let tasksToExecute = this.getTasksByPriority()

    // 如果指定了标签，筛选任务
    if (options.tag) {
      tasksToExecute = tasksToExecute.filter(task => task.tags.includes(options.tag!))
    }

    const taskIds = tasksToExecute.map(task => task.id)
    return this.executeTasks(taskIds, options)
  }

  /**
   * 重置清理状态
   */
  reset(): void {
    for (const task of this.tasks.values()) {
      task.executed = false
    }
    this.executionHistory = []
  }

  /**
   * 清除所有任务
   */
  clear(): void {
    this.tasks.clear()
    this.executionHistory = []
  }

  /**
   * 获取清理统计信息
   */
  getStats(): CleanupStats {
    const executedTasks = this.executionHistory.filter(h => h.success).length
    const failedTasks = this.executionHistory.filter(h => !h.success).length
    const totalExecutionTime = this.executionHistory.reduce((sum, h) => sum + h.duration, 0)
    const averageExecutionTime = this.executionHistory.length > 0
      ? totalExecutionTime / this.executionHistory.length
      : 0

    return {
      totalTasks: this.tasks.size,
      executedTasks,
      pendingTasks: this.tasks.size - executedTasks - failedTasks,
      failedTasks,
      totalExecutionTime,
      averageExecutionTime
    }
  }

  /**
   * 获取执行历史
   */
  getExecutionHistory(): Array<{
    taskId: string
    executedAt: Date
    duration: number
    success: boolean
    error?: Error
  }> {
    return [...this.executionHistory]
  }

  /**
   * 获取失败的任务
   */
  getFailedTasks(): CleanupTask[] {
    const failedIds = this.executionHistory
      .filter(h => !h.success)
      .map(h => h.taskId)

    return failedIds
      .map(id => this.tasks.get(id))
      .filter(Boolean) as CleanupTask[]
  }

  /**
   * 重试失败的任务
   */
  async retryFailedTasks(): Promise<{
    results: Array<{ id: string; success: boolean; error?: Error; duration: number }>
    overallSuccess: boolean
  }> {
    const failedTaskIds = this.getFailedTasks().map(task => task.id)
    return this.executeTasks(failedTaskIds, { continueOnError: true })
  }

  /**
   * 创建清理作用域
   */
  createScope(name: string, tags: string[] = []): CleanupScope {
    return new CleanupScope(this, name, tags)
  }
}

// ========== 清理作用域类 ==========

/**
 * 清理作用域类
 * 提供作用域化的清理管理
 */
export class CleanupScope {
  private manager: CleanupManager
  private scopeName: string
  private scopeTags: string[]
  private scopedTasks: string[] = []

  constructor(manager: CleanupManager, name: string, tags: string[] = []) {
    this.manager = manager
    this.scopeName = name
    this.scopeTags = tags
  }

  /**
   * 在作用域内注册清理任务
   */
  register(
    id: string,
    callback: CleanupCallback,
    options: {
      name?: string
      priority?: number
    } = {}
  ): void {
    const scopedId = `${this.scopeName}:${id}`
    const tags = [...this.scopeTags, `scope:${this.scopeName}`]

    this.manager.register(scopedId, callback, {
      ...options,
      name: options.name || `${this.scopeName}:${options.name || id}`,
      tags
    })

    this.scopedTasks.push(scopedId)
  }

  /**
   * 执行作用域内的所有任务
   */
  async execute(options: { continueOnError?: boolean } = {}): Promise<{
    results: Array<{ id: string; success: boolean; error?: Error; duration: number }>
    overallSuccess: boolean
  }> {
    return this.manager.executeTasks(this.scopedTasks, options)
  }

  /**
   * 清理作用域（移除所有相关的任务）
   */
  cleanup(): void {
    for (const taskId of this.scopedTasks) {
      this.manager.unregister(taskId)
    }
    this.scopedTasks = []
  }

  /**
   * 获取作用域内的任务ID
   */
  getScopedTaskIds(): string[] {
    return [...this.scopedTasks]
  }
}

// ========== 便捷清理任务创建函数 ==========

/**
 * 创建数据库清理任务
 */
export function createDatabaseCleanupTask(
  tableName: string,
  condition: string,
  priority: number = 10
): CleanupCallback {
  return async () => {
    // 这里应该是实际的数据库清理逻辑
    console.log(`Cleaning up database table: ${tableName} with condition: ${condition}`)
    // 模拟异步操作
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}

/**
 * 创建文件清理任务
 */
export function createFileCleanupTask(
  filePaths: string[],
  priority: number = 5
): CleanupCallback {
  return async () => {
    console.log(`Cleaning up files: ${filePaths.join(', ')}`)
    // 这里应该是实际的文件删除逻辑
    await new Promise(resolve => setTimeout(resolve, 50))
  }
}

/**
 * 创建缓存清理任务
 */
export function createCacheCleanupTask(
  cacheKeys: string[],
  priority: number = 1
): CleanupCallback {
  return () => {
    console.log(`Cleaning up cache keys: ${cacheKeys.join(', ')}`)
    // 这里应该是实际的缓存清理逻辑
  }
}

/**
 * 创建内存清理任务
 */
export function createMemoryCleanupTask(
  objects: any[],
  priority: number = 1
): CleanupCallback {
  return () => {
    console.log(`Cleaning up ${objects.length} objects from memory`)
    // 清除对象引用
    objects.length = 0
  }
}

// ========== 全局清理管理器实例 ==========

export const cleanupManager = new CleanupManager()

// ========== 便捷函数 ==========

/**
 * 注册清理任务
 */
export function registerCleanupTask(
  id: string,
  callback: CleanupCallback,
  options?: { name?: string; priority?: number; tags?: string[] }
): void {
  cleanupManager.register(id, callback, options)
}

/**
 * 执行所有清理任务
 */
export async function executeAllCleanups(options?: { continueOnError?: boolean; tag?: string }): Promise<{
  results: Array<{ id: string; success: boolean; error?: Error; duration: number }>
  overallSuccess: boolean
}> {
  return cleanupManager.executeAll(options)
}

/**
 * 创建清理作用域
 */
export function createCleanupScope(name: string, tags?: string[]): CleanupScope {
  return cleanupManager.createScope(name, tags)
}
