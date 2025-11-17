/**
 * 统一的测试数据工厂注册表
 *
 * 提供跨项目的工厂注册、管理和清理功能
 * 支持数据一致性验证和测试隔离
 */

import { faker } from '@faker-js/faker'

// ========== 类型定义 ==========

export interface FactoryMetadata {
  name: string
  description: string
  tags: string[]
  project: string
  version: string
  createdAt: string
  dependencies?: string[]
}

export interface FactoryInstance<T = any> {
  create: (overrides?: Partial<T>) => T
  createMany: (count: number, overrides?: Partial<T>) => T[]
  metadata: FactoryMetadata
  validate?: (data: T) => boolean
  cleanup?: () => Promise<void>
}

export interface FactoryRegistry {
  register: <T>(factory: FactoryInstance<T>) => void
  unregister: (name: string) => void
  get: <T>(name: string) => FactoryInstance<T> | undefined
  list: () => string[]
  listByTag: (tag: string) => string[]
  listByProject: (project: string) => string[]
  clear: () => void
  cleanupAll: () => Promise<void>
}

// ========== 工厂注册表实现 ==========

class FactoryRegistryImpl implements FactoryRegistry {
  private factories = new Map<string, FactoryInstance>()

  register<T>(factory: FactoryInstance<T>): void {
    if (this.factories.has(factory.metadata.name)) {
      throw new Error(`Factory '${factory.metadata.name}' is already registered`)
    }

    // 验证依赖
    if (factory.metadata.dependencies) {
      for (const dep of factory.metadata.dependencies) {
        if (!this.factories.has(dep)) {
          throw new Error(`Factory '${factory.metadata.name}' depends on '${dep}' which is not registered`)
        }
      }
    }

    this.factories.set(factory.metadata.name, factory)
  }

  unregister(name: string): void {
    const factory = this.factories.get(name)
    if (factory && factory.cleanup) {
      factory.cleanup().catch(console.error)
    }
    this.factories.delete(name)
  }

  get<T>(name: string): FactoryInstance<T> | undefined {
    return this.factories.get(name) as FactoryInstance<T> | undefined
  }

  list(): string[] {
    return Array.from(this.factories.keys()).sort()
  }

  listByTag(tag: string): string[] {
    return Array.from(this.factories.entries())
      .filter(([, factory]) => factory.metadata.tags.includes(tag))
      .map(([name]) => name)
      .sort()
  }

  listByProject(project: string): string[] {
    return Array.from(this.factories.entries())
      .filter(([, factory]) => factory.metadata.project === project)
      .map(([name]) => name)
      .sort()
  }

  clear(): void {
    // 清理所有工厂
    for (const factory of this.factories.values()) {
      if (factory.cleanup) {
        factory.cleanup().catch(console.error)
      }
    }
    this.factories.clear()
  }

  async cleanupAll(): Promise<void> {
    const cleanupPromises = Array.from(this.factories.values())
      .filter(factory => factory.cleanup)
      .map(factory => factory.cleanup!())

    await Promise.allSettled(cleanupPromises)
  }
}

// ========== 全局注册表实例 ==========

export const factoryRegistry = new FactoryRegistryImpl()

// ========== 工厂创建工具 ==========

/**
 * 创建标准工厂实例
 */
export function createFactory<T>(
  name: string,
  createFn: (overrides?: Partial<T>) => T,
  options: {
    description?: string
    tags?: string[]
    project?: string
    version?: string
    validate?: (data: T) => boolean
    cleanup?: () => Promise<void>
    dependencies?: string[]
  } = {}
): FactoryInstance<T> {
  const {
    description = '',
    tags = [],
    project = 'shared',
    version = '1.0.0',
    validate,
    cleanup,
    dependencies = []
  } = options

  const metadata: FactoryMetadata = {
    name,
    description,
    tags,
    project,
    version,
    createdAt: new Date().toISOString(),
    dependencies
  }

  return {
    create: createFn,
    createMany: (count: number, overrides?: Partial<T>) =>
      Array.from({ length: count }, (_, index) =>
        createFn({
          ...overrides,
          id: overrides?.id ? (overrides.id as number) + index : undefined
        })
      ),
    metadata,
    validate,
    cleanup
  }
}

/**
 * 注册数据工厂
 */
export function registerDataFactory<T>(
  name: string,
  createFn: (overrides?: Partial<T>) => T,
  description: string,
  tags: string[] = [],
  dependencies: string[] = [],
  project: string = 'shared'
): void {
  const factory = createFactory(name, createFn, {
    description,
    tags: ['data', ...tags],
    project,
    dependencies
  })

  factoryRegistry.register(factory)
}

/**
 * 注册实体工厂
 */
export function registerEntityFactory<T>(
  name: string,
  createFn: (overrides?: Partial<T>) => T,
  description: string,
  tags: string[] = [],
  dependencies: string[] = [],
  project: string = 'shared'
): void {
  const factory = createFactory(name, createFn, {
    description,
    tags: ['entity', ...tags],
    project,
    dependencies
  })

  factoryRegistry.register(factory)
}

/**
 * 注册模拟数据工厂
 */
export function registerMockFactory<T>(
  name: string,
  createFn: (overrides?: Partial<T>) => T,
  description: string,
  tags: string[] = [],
  dependencies: string[] = [],
  project: string = 'shared'
): void {
  const factory = createFactory(name, createFn, {
    description,
    tags: ['mock', ...tags],
    project,
    dependencies
  })

  factoryRegistry.register(factory)
}

// ========== 工厂管理工具 ==========

/**
 * 获取工厂
 */
export function getFactory<T>(name: string): FactoryInstance<T> | undefined {
  return factoryRegistry.get<T>(name)
}

/**
 * 取消注册工厂
 */
export function unregisterFactory(name: string): void {
  factoryRegistry.unregister(name)
}

/**
 * 批量取消注册工厂
 */
export function unregisterFactories(names: string[]): void {
  names.forEach(name => factoryRegistry.unregister(name))
}

/**
 * 初始化预定义工厂
 * 这个函数会在测试设置时调用，注册所有已知的工厂
 */
export function initializePredefinedFactories(): void {
  console.log('Initializing predefined factories...')

  try {
    // 尝试初始化前端工厂
    try {
      const { initializeFrontendFactories } = require('../../springboot1ngh61a2/src/main/resources/front/front/tests/utils/test-data-factory')
      if (initializeFrontendFactories) {
        initializeFrontendFactories()
        console.log('Frontend factories initialized')
      }
    } catch (error) {
      console.warn('Failed to initialize frontend factories:', error.message)
    }

    // 尝试初始化admin工厂
    try {
      const { initializeAdminFactories } = require('../../factories')
      if (initializeAdminFactories) {
        initializeAdminFactories()
        console.log('Admin factories initialized')
      }
    } catch (error) {
      console.warn('Failed to initialize admin factories:', error.message)
    }

    // 注册一些基础共享工厂
    registerDataFactory(
      'user',
      () => ({ id: 1, name: 'Test User' }),
      'Basic user data factory',
      ['entity', 'test'],
      [],
      'shared'
    )

    registerEntityFactory(
      'course',
      () => ({ id: 1, title: 'Test Course' }),
      'Basic course entity factory',
      ['entity', 'test'],
      [],
      'shared'
    )

    console.log('Predefined factories initialized successfully')
  } catch (error) {
    console.error('Failed to initialize predefined factories:', error.message)
  }
}

// ========== 测试隔离和清理 ==========

/**
 * 测试上下文管理器
 */
export class TestContext {
  private createdEntities = new Map<string, any[]>()
  private contextId: string

  constructor(contextId: string = faker.string.uuid()) {
    this.contextId = contextId
  }

  /**
   * 记录创建的实体
   */
  recordEntity(factoryName: string, entity: any): void {
    if (!this.createdEntities.has(factoryName)) {
      this.createdEntities.set(factoryName, [])
    }
    this.createdEntities.get(factoryName)!.push(entity)
  }

  /**
   * 获取创建的实体
   */
  getEntities(factoryName?: string): any[] {
    if (factoryName) {
      return this.createdEntities.get(factoryName) || []
    }
    return Array.from(this.createdEntities.values()).flat()
  }

  /**
   * 清理当前上下文的所有实体
   */
  async cleanup(): Promise<void> {
    const cleanupPromises: Promise<void>[] = []

    for (const [factoryName, entities] of this.createdEntities) {
      const factory = factoryRegistry.get(factoryName)
      if (factory?.cleanup) {
        cleanupPromises.push(factory.cleanup())
      }
    }

    await Promise.allSettled(cleanupPromises)
    this.createdEntities.clear()
  }

  /**
   * 获取上下文ID
   */
  getContextId(): string {
    return this.contextId
  }
}

/**
 * 创建测试上下文
 */
export function createTestContext(contextId?: string): TestContext {
  return new TestContext(contextId)
}

/**
 * 全局测试上下文存储
 */
const globalTestContexts = new Map<string, TestContext>()

/**
 * 获取或创建全局测试上下文
 */
export function getGlobalTestContext(contextId: string): TestContext {
  if (!globalTestContexts.has(contextId)) {
    globalTestContexts.set(contextId, new TestContext(contextId))
  }
  return globalTestContexts.get(contextId)!
}

/**
 * 清理全局测试上下文
 */
export async function cleanupGlobalTestContexts(): Promise<void> {
  const cleanupPromises = Array.from(globalTestContexts.values())
    .map(context => context.cleanup())

  await Promise.allSettled(cleanupPromises)
  globalTestContexts.clear()
}

// ========== 数据一致性验证 ==========

/**
 * 验证器集合
 */
export interface DataValidator<T = any> {
  name: string
  validate: (data: T) => { isValid: boolean; errors: string[]; warnings: string[] }
}

/**
 * 注册数据验证器
 */
const dataValidators = new Map<string, DataValidator>()

export function registerDataValidator<T>(
  name: string,
  validator: (data: T) => { isValid: boolean; errors: string[]; warnings: string[] }
): void {
  dataValidators.set(name, { name, validate: validator })
}

/**
 * 验证数据
 */
export function validateData<T>(
  validatorName: string,
  data: T
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const validator = dataValidators.get(validatorName)
  if (!validator) {
    return {
      isValid: false,
      errors: [`Validator '${validatorName}' not found`],
      warnings: []
    }
  }

  return validator.validate(data)
}

/**
 * 批量验证数据列表
 */
export function validateDataList<T>(
  validatorName: string,
  dataList: T[]
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const allErrors: string[] = []
  const allWarnings: string[] = []
  let isValid = true

  for (let i = 0; i < dataList.length; i++) {
    const result = validateData(validatorName, dataList[i])
    if (!result.isValid) {
      isValid = false
      allErrors.push(...result.errors.map(error => `Item ${i}: ${error}`))
    }
    allWarnings.push(...result.warnings.map(warning => `Item ${i}: ${warning}`))
  }

  return { isValid, errors: allErrors, warnings: allWarnings }
}

// ========== 导出工具函数 ==========

/**
 * 获取所有注册的工厂名称
 */
export function getRegisteredFactories(): string[] {
  return factoryRegistry.list()
}

/**
 * 获取按标签分组的工厂
 */
export function getFactoriesByTag(): Record<string, string[]> {
  const tags = new Set<string>()
  const factories = factoryRegistry.list()

  factories.forEach(factoryName => {
    const factory = factoryRegistry.get(factoryName)
    if (factory) {
      factory.metadata.tags.forEach(tag => tags.add(tag))
    }
  })

  const result: Record<string, string[]> = {}
  tags.forEach(tag => {
    result[tag] = factoryRegistry.listByTag(tag)
  })

  return result
}

/**
 * 获取按项目分组的工厂
 */
export function getFactoriesByProject(): Record<string, string[]> {
  const projects = new Set<string>()
  const factories = factoryRegistry.list()

  factories.forEach(factoryName => {
    const factory = factoryRegistry.get(factoryName)
    if (factory) {
      projects.add(factory.metadata.project)
    }
  })

  const result: Record<string, string[]> = {}
  projects.forEach(project => {
    result[project] = factoryRegistry.listByProject(project)
  })

  return result
}

/**
 * 获取工厂统计信息
 */
export function getFactoryStatistics(): {
  totalFactories: number
  factoriesByTag: Record<string, number>
  factoriesByProject: Record<string, number>
} {
  const factories = factoryRegistry.list()
  const factoriesByTag: Record<string, number> = {}
  const factoriesByProject: Record<string, number> = {}

  factories.forEach(factoryName => {
    const factory = factoryRegistry.get(factoryName)
    if (factory) {
      factory.metadata.tags.forEach(tag => {
        factoriesByTag[tag] = (factoriesByTag[tag] || 0) + 1
      })
      const project = factory.metadata.project
      factoriesByProject[project] = (factoriesByProject[project] || 0) + 1
    }
  })

  return {
    totalFactories: factories.length,
    factoriesByTag,
    factoriesByProject
  }
}
