/**
 * 测试数据工厂注册表
 * 统一管理所有测试数据工厂，提供工厂查找和注册机制
 */

// ========== 工厂接口定义 ==========

/**
 * 工厂函数接口
 */
export interface FactoryFunction<T = any> {
  (...args: any[]): T
}

/**
 * 工厂配置接口
 */
export interface FactoryConfig {
  name: string
  description?: string
  category: 'data' | 'entity' | 'response' | 'mock'
  dependencies?: string[]
  tags?: string[]
}

/**
 * 注册的工厂信息
 */
export interface RegisteredFactory {
  config: FactoryConfig
  factory: FactoryFunction
  module?: string // 所属模块
  validated?: boolean // 是否已验证
}

/**
 * 工厂依赖关系
 */
export interface FactoryDependency {
  factory: string
  dependsOn: string[]
  resolved: boolean
}

// ========== 工厂注册表类 ==========

/**
 * 工厂注册表类
 * 管理所有测试数据工厂的注册、查找和依赖关系
 */
export class FactoryRegistry {
  private factories = new Map<string, RegisteredFactory>()
  private dependencies = new Map<string, FactoryDependency>()
  private categories = new Map<string, Set<string>>()

  /**
   * 注册工厂
   */
  register(
    name: string,
    factory: FactoryFunction,
    config: FactoryConfig,
    module?: string
  ): void {
    if (this.factories.has(name)) {
      console.warn(`Factory '${name}' is already registered. Overwriting...`)
    }

    const registeredFactory: RegisteredFactory = {
      config,
      factory,
      module,
      validated: false
    }

    this.factories.set(name, registeredFactory)

    // 添加到分类索引
    if (!this.categories.has(config.category)) {
      this.categories.set(config.category, new Set())
    }
    this.categories.get(config.category)!.add(name)

    // 注册依赖关系
    if (config.dependencies && config.dependencies.length > 0) {
      this.dependencies.set(name, {
        factory: name,
        dependsOn: config.dependencies,
        resolved: false
      })
    }

    console.log(`Factory '${name}' registered in category '${config.category}'`)
  }

  /**
   * 注销工厂
   */
  unregister(name: string): boolean {
    const factory = this.factories.get(name)
    if (!factory) {
      return false
    }

    // 从分类索引中移除
    const categorySet = this.categories.get(factory.config.category)
    if (categorySet) {
      categorySet.delete(name)
      if (categorySet.size === 0) {
        this.categories.delete(factory.config.category)
      }
    }

    // 移除依赖关系
    this.dependencies.delete(name)

    // 移除工厂
    this.factories.delete(name)

    console.log(`Factory '${name}' unregistered`)
    return true
  }

  /**
   * 获取工厂
   */
  get(name: string): RegisteredFactory | undefined {
    return this.factories.get(name)
  }

  /**
   * 获取工厂函数
   */
  getFactory(name: string): FactoryFunction | undefined {
    const registered = this.factories.get(name)
    return registered?.factory
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
   * 获取指定分类的工厂
   */
  getByCategory(category: string): RegisteredFactory[] {
    const names = this.categories.get(category)
    if (!names) return []

    return Array.from(names)
      .map(name => this.factories.get(name))
      .filter(Boolean) as RegisteredFactory[]
  }

  /**
   * 获取指定标签的工厂
   */
  getByTag(tag: string): RegisteredFactory[] {
    return Array.from(this.factories.values())
      .filter(factory => factory.config.tags?.includes(tag))
  }

  /**
   * 获取指定模块的工厂
   */
  getByModule(module: string): RegisteredFactory[] {
    return Array.from(this.factories.values())
      .filter(factory => factory.module === module)
  }

  /**
   * 解析依赖关系
   */
  resolveDependencies(): {
    resolved: string[]
    unresolved: string[]
    cycles: string[]
  } {
    const resolved = new Set<string>()
    const unresolved = new Set<string>()
    const visiting = new Set<string>()

    const visit = (name: string): boolean => {
      if (resolved.has(name)) return true
      if (visiting.has(name)) return false // 循环依赖

      visiting.add(name)

      const dependency = this.dependencies.get(name)
      if (dependency) {
        for (const dep of dependency.dependsOn) {
          if (!this.factories.has(dep)) {
            unresolved.add(`${name} -> ${dep} (missing)`)
            continue
          }
          if (!visit(dep)) {
            unresolved.add(`${name} -> ${dep} (cycle)`)
            return false
          }
        }
      }

      visiting.delete(name)
      resolved.add(name)
      dependency!.resolved = true
      return true
    }

    // 遍历所有有依赖关系的工厂
    for (const name of this.dependencies.keys()) {
      if (!resolved.has(name) && !unresolved.has(name)) {
        visit(name)
      }
    }

    const cycles = Array.from(unresolved).filter(dep => dep.includes('(cycle)'))

    return {
      resolved: Array.from(resolved),
      unresolved: Array.from(unresolved),
      cycles
    }
  }

  /**
   * 获取依赖关系图
   */
  getDependencyGraph(): Record<string, string[]> {
    const graph: Record<string, string[]> = {}

    for (const [name, dependency] of this.dependencies) {
      graph[name] = dependency.dependsOn
    }

    return graph
  }

  /**
   * 验证工厂（检查依赖等）
   */
  validateFactory(name: string): {
    valid: boolean
    errors: string[]
    warnings: string[]
  } {
    const factory = this.factories.get(name)
    if (!factory) {
      return {
        valid: false,
        errors: [`Factory '${name}' not found`],
        warnings: []
      }
    }

    const errors: string[] = []
    const warnings: string[] = []

    // 检查依赖
    if (factory.config.dependencies) {
      for (const dep of factory.config.dependencies) {
        if (!this.factories.has(dep)) {
          errors.push(`Dependency '${dep}' not found`)
        }
      }
    }

    // 检查必需字段
    if (!factory.config.name) {
      errors.push('Factory name is required')
    }

    if (!factory.config.category) {
      errors.push('Factory category is required')
    }

    // 标记为已验证
    factory.validated = errors.length === 0

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * 批量验证所有工厂
   */
  validateAll(): {
    valid: boolean
    results: Record<string, { valid: boolean; errors: string[]; warnings: string[] }>
  } {
    const results: Record<string, { valid: boolean; errors: string[]; warnings: string[] }> = {}
    let allValid = true

    for (const name of this.factories.keys()) {
      const result = this.validateFactory(name)
      results[name] = result
      if (!result.valid) {
        allValid = false
      }
    }

    return {
      valid: allValid,
      results
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    total: number
    byCategory: Record<string, number>
    byModule: Record<string, number>
    withDependencies: number
    validated: number
  } {
    const byCategory: Record<string, number> = {}
    const byModule: Record<string, number> = {}

    let withDependencies = 0
    let validated = 0

    for (const factory of this.factories.values()) {
      // 按分类统计
      const category = factory.config.category
      byCategory[category] = (byCategory[category] || 0) + 1

      // 按模块统计
      const module = factory.module || 'unknown'
      byModule[module] = (byModule[module] || 0) + 1

      // 统计依赖和验证状态
      if (factory.config.dependencies && factory.config.dependencies.length > 0) {
        withDependencies++
      }

      if (factory.validated) {
        validated++
      }
    }

    return {
      total: this.factories.size,
      byCategory,
      byModule,
      withDependencies,
      validated
    }
  }

  /**
   * 清空注册表
   */
  clear(): void {
    this.factories.clear()
    this.dependencies.clear()
    this.categories.clear()
  }

  /**
   * 获取所有工厂的详细信息
   */
  getAllFactories(): Record<string, RegisteredFactory> {
    return Object.fromEntries(this.factories)
  }
}

// ========== 全局注册表实例 ==========

/**
 * 全局工厂注册表实例
 */
export const factoryRegistry = new FactoryRegistry()

// ========== 便捷注册函数 ==========

/**
 * 注册数据工厂
 */
export function registerDataFactory(
  name: string,
  factory: FactoryFunction,
  description?: string,
  dependencies?: string[],
  tags?: string[],
  module?: string
): void {
  factoryRegistry.register(name, factory, {
    name,
    description,
    category: 'data',
    dependencies,
    tags
  }, module)
}

/**
 * 注册实体工厂
 */
export function registerEntityFactory(
  name: string,
  factory: FactoryFunction,
  description?: string,
  dependencies?: string[],
  tags?: string[],
  module?: string
): void {
  factoryRegistry.register(name, factory, {
    name,
    description,
    category: 'entity',
    dependencies,
    tags
  }, module)
}

/**
 * 注册响应工厂
 */
export function registerResponseFactory(
  name: string,
  factory: FactoryFunction,
  description?: string,
  dependencies?: string[],
  tags?: string[],
  module?: string
): void {
  factoryRegistry.register(name, factory, {
    name,
    description,
    category: 'response',
    dependencies,
    tags
  }, module)
}

/**
 * 注册Mock工厂
 */
export function registerMockFactory(
  name: string,
  factory: FactoryFunction,
  description?: string,
  dependencies?: string[],
  tags?: string[],
  module?: string
): void {
  factoryRegistry.register(name, factory, {
    name,
    description,
    category: 'mock',
    dependencies,
    tags
  }, module)
}

// ========== 便捷查找函数 ==========

/**
 * 获取数据工厂
 */
export function getDataFactory(name: string): FactoryFunction | undefined {
  const factory = factoryRegistry.get(name)
  return factory?.config.category === 'data' ? factory.factory : undefined
}

/**
 * 获取实体工厂
 */
export function getEntityFactory(name: string): FactoryFunction | undefined {
  const factory = factoryRegistry.get(name)
  return factory?.config.category === 'entity' ? factory.factory : undefined
}

/**
 * 获取响应工厂
 */
export function getResponseFactory(name: string): FactoryFunction | undefined {
  const factory = factoryRegistry.get(name)
  return factory?.config.category === 'response' ? factory.factory : undefined
}

/**
 * 获取Mock工厂
 */
export function getMockFactory(name: string): FactoryFunction | undefined {
  const factory = factoryRegistry.get(name)
  return factory?.config.category === 'mock' ? factory.factory : undefined
}

// ========== 批量操作函数 ==========

/**
 * 批量注册工厂
 */
export function registerFactories(factories: Array<{
  name: string
  factory: FactoryFunction
  config: FactoryConfig
  module?: string
}>): void {
  factories.forEach(({ name, factory, config, module }) => {
    factoryRegistry.register(name, factory, config, module)
  })
}

/**
 * 批量注销工厂
 */
export function unregisterFactories(names: string[]): void {
  names.forEach(name => factoryRegistry.unregister(name))
}

/**
 * 初始化预定义工厂
 * 这个函数会在测试设置时调用，注册所有已知的工厂
 */
export function initializePredefinedFactories(): void {
  // 这里将在后续步骤中添加具体的工厂注册
  // 目前先创建空实现
  console.log('Initializing predefined factories...')

  // 注册一些示例工厂（将在后续步骤中完善）
  registerDataFactory(
    'user',
    () => ({ id: 1, name: 'Test User' }),
    'User data factory',
    [],
    ['entity', 'test'],
    'shared'
  )

  registerEntityFactory(
    'course',
    () => ({ id: 1, title: 'Test Course' }),
    'Course entity factory',
    [],
    ['entity', 'test'],
    'shared'
  )

  console.log('Predefined factories initialized')
}
