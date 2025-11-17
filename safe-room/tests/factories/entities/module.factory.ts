/**
 * Admin模块工厂
 * 整合现有的module.factory.ts功能
 */

import {
  EnhancedBaseFactory,
  createRequiredFieldsValidator,
  createTypeValidator,
  createBaseValidator
} from '../base/base-factory'

// ========== 类型定义 ==========

/**
 * Admin模块接口
 */
export interface AdminModule {
  id: number
  name: string
  path: string
  component: string
  redirect?: string
  icon: string
  title: string
  hidden: boolean
  sort: number
  parentId?: number
  children?: AdminModule[]
  meta: {
    title: string
    icon: string
    hidden?: boolean
    keepAlive?: boolean
    roles?: string[]
    permissions?: string[]
  }
  status: number // 0: disabled, 1: enabled
  createTime: string
  updateTime?: string
}

/**
 * 模块预设数据
 */
export const MODULE_PRESETS = {
  dashboard: {
    name: '首页',
    path: '/dashboard',
    component: 'dashboard/index',
    icon: 'dashboard',
    title: '首页',
    hidden: false,
    sort: 1,
    status: 1,
    meta: {
      title: '首页',
      icon: 'dashboard',
      keepAlive: true,
      roles: ['admin', 'manager', 'user'],
      permissions: ['dashboard:view']
    }
  },
  userManagement: {
    name: '用户管理',
    path: '/users',
    component: 'users/index',
    icon: 'user',
    title: '用户管理',
    hidden: false,
    sort: 2,
    status: 1,
    meta: {
      title: '用户管理',
      icon: 'user',
      roles: ['admin', 'manager'],
      permissions: ['user:view']
    }
  },
  courseManagement: {
    name: '课程管理',
    path: '/courses',
    component: 'courses/index',
    icon: 'book',
    title: '课程管理',
    hidden: false,
    sort: 3,
    status: 1,
    meta: {
      title: '课程管理',
      icon: 'book',
      roles: ['admin', 'manager'],
      permissions: ['course:view']
    }
  },
  systemSettings: {
    name: '系统设置',
    path: '/settings',
    component: 'settings/index',
    icon: 'setting',
    title: '系统设置',
    hidden: false,
    sort: 10,
    status: 1,
    meta: {
      title: '系统设置',
      icon: 'setting',
      roles: ['admin'],
      permissions: ['system:view']
    }
  }
}

/**
 * Admin模块工厂类
 */
export class AdminModuleFactory extends EnhancedBaseFactory<AdminModule> {
  private readonly icons = [
    'user', 'book', 'calendar', 'shopping', 'money', 'setting', 'lock',
    'chart', 'file-text', 'message', 'dashboard', 'team', 'tool', 'database'
  ]

  private readonly moduleTypes = [
    { name: '用户管理', path: '/users', component: 'users/index', icon: 'user' },
    { name: '课程管理', path: '/courses', component: 'courses/index', icon: 'book' },
    { name: '预约管理', path: '/bookings', component: 'bookings/index', icon: 'calendar' },
    { name: '订单管理', path: '/orders', component: 'orders/index', icon: 'shopping' },
    { name: '财务管理', path: '/finance', component: 'finance/index', icon: 'money' },
    { name: '系统设置', path: '/settings', component: 'settings/index', icon: 'setting' },
    { name: '权限管理', path: '/permissions', component: 'permissions/index', icon: 'lock' },
    { name: '数据统计', path: '/statistics', component: 'statistics/index', icon: 'chart' },
    { name: '日志管理', path: '/logs', component: 'logs/index', icon: 'file-text' },
    { name: '消息管理', path: '/messages', component: 'messages/index', icon: 'message' }
  ]

  constructor() {
    super({
      validator: createBaseValidator('adminModule', (module: AdminModule) => {
        const errors: string[] = []
        const warnings: string[] = []

        // 基础字段验证
        if (!module.name || module.name.trim().length === 0) {
          errors.push('模块名称不能为空')
        }
        if (!module.path || !module.path.startsWith('/')) {
          errors.push('模块路径必须以/开头')
        }
        if (!module.component || !module.component.includes('/')) {
          errors.push('组件路径格式应为module/action')
        }
        if (module.status !== 0 && module.status !== 1) {
          errors.push('模块状态必须是0或1')
        }
        if (module.sort < 0) {
          warnings.push('排序值不应为负数')
        }

        // 权限验证
        if (module.meta?.permissions) {
          module.meta.permissions.forEach(permission => {
            if (!permission.includes(':')) {
              warnings.push(`权限格式建议为resource:action，当前: ${permission}`)
            }
          })
        }

        // 子模块验证
        if (module.children && Array.isArray(module.children)) {
          module.children.forEach((child, index) => {
            if (child.parentId !== module.id) {
              warnings.push(`子模块${index}的parentId与父模块不匹配`)
            }
          })
        }

        return { isValid: errors.length === 0, errors, warnings }
      })
    })
  }

  /**
   * 创建模块
   */
  create(overrides: Partial<AdminModule> = {}): AdminModule {
    const id = overrides.id ?? this.nextId()
    const moduleType = overrides.name ? null : this.randomFromArray(this.moduleTypes)
    const createdAt = overrides.createTime ? new Date(overrides.createTime) : this.randomDate()

    const baseModule = moduleType ? {
      name: moduleType.name,
      path: moduleType.path,
      component: moduleType.component,
      icon: moduleType.icon,
      title: moduleType.name
    } : {
      name: this.faker.lorem.words({ min: 1, max: 3 }),
      path: `/${this.faker.lorem.slug()}`,
      component: `${this.faker.lorem.slug()}/index`,
      icon: this.randomFromArray(this.icons),
      title: this.faker.lorem.words({ min: 1, max: 2 })
    }

    return this.mergeDefaults({
      id,
      ...baseModule,
      redirect: this.randomBoolean() ? `${baseModule.path}/index` : undefined,
      hidden: this.randomBoolean(),
      sort: this.randomNumber(1, 100),
      parentId: undefined,
      children: [],
      meta: {
        title: baseModule.title,
        icon: baseModule.icon,
        hidden: this.randomBoolean(),
        keepAlive: this.randomBoolean(),
        roles: this.randomFromArray([
          ['admin'],
          ['admin', 'manager'],
          ['admin', 'manager', 'user'],
          ['admin', 'manager', 'operator']
        ]),
        permissions: this.generatePermissions(baseModule.path)
      },
      status: this.randomFromArray([0, 1]),
      createTime: createdAt.toISOString(),
      updateTime: this.randomBoolean() ? this.randomDate(createdAt).toISOString() : undefined
    }, overrides)
  }

  /**
   * 生成模块权限
   */
  private generatePermissions(path: string): string[] {
    const resource = path.replace('/', '')
    return [
      `${resource}:view`,
      `${resource}:create`,
      `${resource}:update`,
      `${resource}:delete`
    ]
  }

  /**
   * 创建顶级菜单模块
   */
  createMenuModule(overrides: Partial<AdminModule> = {}): AdminModule {
    return this.create({
      parentId: undefined,
      hidden: false,
      sort: this.randomNumber(1, 20),
      ...overrides
    })
  }

  /**
   * 创建子菜单模块
   */
  createSubmenuModule(parentId: number, overrides: Partial<AdminModule> = {}): AdminModule {
    return this.create({
      parentId,
      path: this.randomFromArray(['list', 'create', 'edit', 'detail', 'statistics']),
      hidden: this.randomBoolean(),
      sort: this.randomNumber(1, 50),
      ...overrides
    })
  }

  /**
   * 创建完整的菜单树
   */
  createMenuTree(overrides: Partial<AdminModule & { childrenCount: number }> = {}): AdminModule {
    const { childrenCount = this.randomNumber(2, 5), ...moduleOverrides } = overrides
    const parentModule = this.createMenuModule(moduleOverrides)

    parentModule.children = Array.from({ length: childrenCount }, () =>
      this.createSubmenuModule(parentModule.id)
    )

    return parentModule
  }

  /**
   * 创建预设模块
   */
  createPresetModule(preset: keyof typeof MODULE_PRESETS, overrides: Partial<AdminModule> = {}): AdminModule {
    return this.create({
      ...MODULE_PRESETS[preset],
      ...overrides
    })
  }

  /**
   * 创建导航菜单结构
   */
  createNavigationMenu(): AdminModule[] {
    const menuItems = [
      { key: 'dashboard', sort: 1 },
      { key: 'userManagement', sort: 2 },
      { key: 'courseManagement', sort: 3 },
      { key: 'systemSettings', sort: 10 }
    ] as const

    return menuItems.map((item, index) => {
      const module = this.createPresetModule(item.key, {
        id: index + 1,
        sort: item.sort
      })

      // 为主要模块添加子菜单
      if (['userManagement', 'courseManagement'].includes(item.key)) {
        module.children = [
          this.createSubmenuModule(module.id, {
            name: `${module.name}-列表`,
            path: 'list',
            component: `${module.component}/list`,
            sort: 1
          }),
          this.createSubmenuModule(module.id, {
            name: `${module.name}-新增`,
            path: 'create',
            component: `${module.component}/create`,
            sort: 2
          }),
          this.createSubmenuModule(module.id, {
            name: `${module.name}-编辑`,
            path: 'edit',
            component: `${module.component}/edit`,
            sort: 3
          })
        ]
      }

      return module
    })
  }

  /**
   * 创建隐藏模块
   */
  createHiddenModule(overrides: Partial<AdminModule> = {}): AdminModule {
    return this.create({
      hidden: true,
      ...overrides
    })
  }

  /**
   * 创建禁用模块
   */
  createDisabledModule(overrides: Partial<AdminModule> = {}): AdminModule {
    return this.create({
      status: 0,
      ...overrides
    })
  }

  /**
   * 按状态筛选模块
   */
  filterByStatus(modules: AdminModule[], status: number): AdminModule[] {
    return modules.filter(module => module.status === status)
  }

  /**
   * 获取模块树结构
   */
  buildModuleTree(modules: AdminModule[]): AdminModule[] {
    const moduleMap = new Map<number, AdminModule>()
    const rootModules: AdminModule[] = []

    // 建立ID映射
    modules.forEach(module => {
      moduleMap.set(module.id, { ...module, children: [] })
    })

    // 构建树结构
    modules.forEach(module => {
      const moduleWithChildren = moduleMap.get(module.id)!
      if (module.parentId && moduleMap.has(module.parentId)) {
        const parent = moduleMap.get(module.parentId)!
        if (!parent.children) parent.children = []
        parent.children.push(moduleWithChildren)
      } else {
        rootModules.push(moduleWithChildren)
      }
    })

    return rootModules
  }
}

// ========== 全局工厂实例 ==========

export const adminModuleFactory = new AdminModuleFactory()

// ========== 便捷创建函数 ==========

/**
 * 创建单个模块
 */
export function createAdminModule(overrides: Partial<AdminModule> = {}): AdminModule {
  return adminModuleFactory.create(overrides)
}

/**
 * 创建多个模块
 */
export function createAdminModules(count: number, overrides: Partial<AdminModule> = {}): AdminModule[] {
  return adminModuleFactory.createMany(count, overrides)
}

/**
 * 创建菜单模块
 */
export function createMenuModule(overrides: Partial<AdminModule> = {}): AdminModule {
  return adminModuleFactory.createMenuModule(overrides)
}

/**
 * 创建导航菜单
 */
export function createNavigationMenu(): AdminModule[] {
  return adminModuleFactory.createNavigationMenu()
}

/**
 * 创建菜单树
 */
export function createMenuTree(overrides: Partial<AdminModule & { childrenCount: number }> = {}): AdminModule {
  return adminModuleFactory.createMenuTree(overrides)
}
