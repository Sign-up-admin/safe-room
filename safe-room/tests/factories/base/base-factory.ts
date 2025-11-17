/**
 * 增强的基础工厂类
 * 提供测试数据生成的通用功能，支持faker集成、数据验证和清理回调
 */

import { faker } from '@faker-js/faker'

// ========== 类型定义 ==========

/**
 * 数据验证结果接口
 */
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * 数据验证器接口
 */
export interface DataValidator<T = any> {
  validate: (data: T) => ValidationResult
  name?: string
}

/**
 * 清理回调函数类型
 */
export type CleanupCallback = () => Promise<void> | void

/**
 * 工厂选项接口
 */
export interface FactoryOptions<T = any> {
  validator?: DataValidator<T>
  cleanupCallbacks?: CleanupCallback[]
  enableValidation?: boolean
  enableCleanup?: boolean
}

/**
 * 增强的基础工厂类
 */
export abstract class EnhancedBaseFactory<T> {
  protected sequence = 0
  protected faker = faker
  protected validator?: DataValidator<T>
  protected cleanupCallbacks: CleanupCallback[] = []
  protected enableValidation = true
  protected enableCleanup = true

  /**
   * 构造函数
   */
  constructor(options: FactoryOptions<T> = {}) {
    this.validator = options.validator
    this.cleanupCallbacks = options.cleanupCallbacks || []
    this.enableValidation = options.enableValidation !== false
    this.enableCleanup = options.enableCleanup !== false

    // 设置faker的中文本地化
    this.faker.setLocale('zh_CN')
  }

  // ========== 基础生成方法 ==========

  /**
   * 生成下一个序列号
   */
  protected nextId(): number {
    return ++this.sequence
  }

  /**
   * 生成随机字符串
   */
  protected randomString(length = 8): string {
    return this.faker.string.alphanumeric(length)
  }

  /**
   * 生成随机数字
   */
  protected randomNumber(min = 0, max = 100): number {
    return this.faker.number.int({ min, max })
  }

  /**
   * 从数组中随机选择一个元素
   */
  protected randomFromArray<U>(array: U[]): U {
    if (array.length === 0) {
      throw new Error('Array cannot be empty')
    }
    return this.faker.helpers.arrayElement(array)
  }

  /**
   * 生成随机日期
   */
  protected randomDate(start?: Date, end?: Date): Date {
    const startDate = start || new Date(2020, 0, 1)
    const endDate = end || new Date()
    return this.faker.date.between({ from: startDate, to: endDate })
  }

  /**
   * 生成随机布尔值
   */
  protected randomBoolean(): boolean {
    return this.faker.datatype.boolean()
  }

  /**
   * 生成随机邮箱
   */
  protected randomEmail(domain = 'example.com'): string {
    return this.faker.internet.email({ provider: domain })
  }

  /**
   * 生成随机电话号码
   */
  protected randomPhone(): string {
    return this.faker.phone.number('1##########')
  }

  /**
   * 生成随机姓名
   */
  protected randomName(): string {
    return this.faker.person.fullName()
  }

  /**
   * 生成随机用户名
   */
  protected randomUsername(): string {
    return this.faker.internet.username()
  }

  /**
   * 生成随机URL
   */
  protected randomUrl(): string {
    return this.faker.internet.url()
  }

  /**
   * 生成随机UUID
   */
  protected randomUuid(): string {
    return this.faker.string.uuid()
  }

  /**
   * 生成随机头像URL
   */
  protected randomAvatar(): string {
    return this.faker.image.avatar()
  }

  /**
   * 生成随机句子
   */
  protected randomSentence(): string {
    return this.faker.lorem.sentence()
  }

  /**
   * 生成随机段落
   */
  protected randomParagraph(): string {
    return this.faker.lorem.paragraph()
  }

  /**
   * 生成随机单词
   */
  protected randomWord(): string {
    return this.faker.lorem.word()
  }

  /**
   * 生成随机IP地址
   */
  protected randomIp(): string {
    return this.faker.internet.ip()
  }

  /**
   * 生成随机User Agent
   */
  protected randomUserAgent(): string {
    return this.faker.internet.userAgent()
  }

  /**
   * 合并默认属性和覆盖属性
   */
  protected mergeDefaults(defaults: Partial<T>, overrides: Partial<T> = {}): T {
    return { ...defaults, ...overrides } as T
  }

  // ========== 数据验证 ==========

  /**
   * 设置验证器
   */
  setValidator(validator: DataValidator<T>): void {
    this.validator = validator
  }

  /**
   * 验证数据
   */
  protected validateData(data: T): ValidationResult {
    if (!this.enableValidation || !this.validator) {
      return { isValid: true, errors: [], warnings: [] }
    }

    return this.validator.validate(data)
  }

  /**
   * 验证数据列表
   */
  protected validateDataList(dataList: T[]): ValidationResult {
    const allErrors: string[] = []
    const allWarnings: string[] = []
    let isValid = true

    dataList.forEach((data, index) => {
      const result = this.validateData(data)
      if (!result.isValid) {
        isValid = false
        allErrors.push(...result.errors.map(error => `Item ${index}: ${error}`))
      }
      allWarnings.push(...result.warnings.map(warning => `Item ${index}: ${warning}`))
    })

    return { isValid, errors: allErrors, warnings: allWarnings }
  }

  // ========== 清理回调管理 ==========

  /**
   * 添加清理回调
   */
  addCleanupCallback(callback: CleanupCallback): void {
    this.cleanupCallbacks.push(callback)
  }

  /**
   * 移除清理回调
   */
  removeCleanupCallback(callback: CleanupCallback): void {
    const index = this.cleanupCallbacks.indexOf(callback)
    if (index > -1) {
      this.cleanupCallbacks.splice(index, 1)
    }
  }

  /**
   * 执行所有清理回调
   */
  protected async executeCleanupCallbacks(): Promise<void> {
    if (!this.enableCleanup) return

    const cleanupPromises = this.cleanupCallbacks.map(callback => {
      try {
        const result = callback()
        return result instanceof Promise ? result : Promise.resolve()
      } catch (error) {
        console.warn('Cleanup callback failed:', error)
        return Promise.resolve()
      }
    })

    await Promise.allSettled(cleanupPromises)
  }

  // ========== 工厂方法 ==========

  /**
   * 创建单个实例
   */
  abstract create(overrides?: Partial<T>): T

  /**
   * 创建多个实例
   */
  createMany(count: number, overrides?: Partial<T>): T[] {
    const instances: T[] = []
    for (let i = 0; i < count; i++) {
      instances.push(this.create(overrides))
    }

    // 验证批量创建的数据
    if (this.enableValidation) {
      const validation = this.validateDataList(instances)
      if (!validation.isValid) {
        console.warn('Batch creation validation warnings:', validation.warnings)
        throw new Error(`Batch creation validation failed: ${validation.errors.join(', ')}`)
      }
    }

    return instances
  }

  /**
   * 创建并验证单个实例
   */
  createValidated(overrides?: Partial<T>): T {
    const instance = this.create(overrides)
    const validation = this.validateData(instance)

    if (!validation.isValid) {
      console.warn('Instance validation warnings:', validation.warnings)
      throw new Error(`Instance validation failed: ${validation.errors.join(', ')}`)
    }

    return instance
  }

  /**
   * 创建并验证多个实例
   */
  createManyValidated(count: number, overrides?: Partial<T>): T[] {
    const instances = this.createMany(count, overrides)
    const validation = this.validateDataList(instances)

    if (!validation.isValid) {
      console.warn('Batch validation warnings:', validation.warnings)
      throw new Error(`Batch validation failed: ${validation.errors.join(', ')}`)
    }

    return instances
  }

  // ========== 生命周期方法 ==========

  /**
   * 重置序列号
   */
  reset(): void {
    this.sequence = 0
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    await this.executeCleanupCallbacks()
    this.cleanupCallbacks = []
  }

  /**
   * 获取工厂统计信息
   */
  getStats(): {
    sequence: number
    hasValidator: boolean
    cleanupCallbackCount: number
    validationEnabled: boolean
    cleanupEnabled: boolean
  } {
    return {
      sequence: this.sequence,
      hasValidator: !!this.validator,
      cleanupCallbackCount: this.cleanupCallbacks.length,
      validationEnabled: this.enableValidation,
      cleanupEnabled: this.enableCleanup
    }
  }
}

/**
 * 增强的工厂管理器
 * 用于管理多个增强工厂实例
 */
export class EnhancedFactoryManager {
  private factories = new Map<string, EnhancedBaseFactory<any>>()

  /**
   * 注册工厂
   */
  register<T>(name: string, factory: EnhancedBaseFactory<T>): void {
    if (this.factories.has(name)) {
      console.warn(`Factory '${name}' is already registered. Overwriting...`)
    }
    this.factories.set(name, factory)
  }

  /**
   * 注销工厂
   */
  unregister(name: string): boolean {
    const factory = this.factories.get(name)
    if (factory) {
      factory.cleanup().catch(console.error)
      this.factories.delete(name)
      return true
    }
    return false
  }

  /**
   * 获取工厂
   */
  get<T>(name: string): EnhancedBaseFactory<T> | undefined {
    return this.factories.get(name) as EnhancedBaseFactory<T> | undefined
  }

  /**
   * 检查工厂是否存在
   */
  has(name: string): boolean {
    return this.factories.has(name)
  }

  /**
   * 获取所有工厂名称
   */
  getAllNames(): string[] {
    return Array.from(this.factories.keys())
  }

  /**
   * 重置所有工厂
   */
  resetAll(): void {
    for (const factory of this.factories.values()) {
      factory.reset()
    }
  }

  /**
   * 清理所有工厂
   */
  async cleanupAll(): Promise<void> {
    const cleanupPromises = this.factories.values().map(factory =>
      factory.cleanup().catch(error => {
        console.error('Factory cleanup failed:', error)
      })
    )
    await Promise.allSettled(cleanupPromises)
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    totalFactories: number
    factoriesWithValidators: number
    factoriesWithCleanup: number
  } {
    let factoriesWithValidators = 0
    let factoriesWithCleanup = 0

    for (const factory of this.factories.values()) {
      const stats = factory.getStats()
      if (stats.hasValidator) factoriesWithValidators++
      if (stats.cleanupEnabled && stats.cleanupCallbackCount > 0) factoriesWithCleanup++
    }

    return {
      totalFactories: this.factories.size,
      factoriesWithValidators,
      factoriesWithCleanup
    }
  }
}

// 全局增强工厂管理器实例
export const enhancedFactoryManager = new EnhancedFactoryManager()

// ========== 便捷验证器创建函数 ==========

/**
 * 创建基础数据验证器
 */
export function createBaseValidator<T>(
  name: string,
  validateFn: (data: T) => ValidationResult
): DataValidator<T> {
  return {
    name,
    validate: validateFn
  }
}

/**
 * 创建字段存在性验证器
 */
export function createRequiredFieldsValidator<T extends Record<string, any>>(
  requiredFields: (keyof T)[]
): DataValidator<T> {
  return createBaseValidator('requiredFields', (data: T) => {
    const errors: string[] = []
    const warnings: string[] = []

    requiredFields.forEach(field => {
      const value = data[field]
      if (value === undefined || value === null) {
        errors.push(`Required field '${String(field)}' is missing`)
      } else if (typeof value === 'string' && value.trim().length === 0) {
        warnings.push(`Field '${String(field)}' is empty`)
      }
    })

    return { isValid: errors.length === 0, errors, warnings }
  })
}

/**
 * 创建类型验证器
 */
export function createTypeValidator<T extends Record<string, any>>(
  fieldTypes: Record<keyof T, string>
): DataValidator<T> {
  return createBaseValidator('fieldTypes', (data: T) => {
    const errors: string[] = []
    const warnings: string[] = []

    Object.entries(fieldTypes).forEach(([field, expectedType]) => {
      const value = data[field as keyof T]
      const actualType = typeof value

      if (actualType !== expectedType && !(expectedType === 'number' && actualType === 'string' && !isNaN(Number(value)))) {
        errors.push(`Field '${field}' expected ${expectedType}, got ${actualType}`)
      }
    })

    return { isValid: errors.length === 0, errors, warnings }
  })
}
