/**
 * Admin权限工厂
 * 创建和管理权限数据
 */

import {
  EnhancedBaseFactory,
  createRequiredFieldsValidator,
  createTypeValidator,
  createBaseValidator
} from '../base/base-factory'

// ========== 类型定义 ==========

/**
 * Admin权限接口
 */
export interface AdminPermission {
  id: number
  name: string
  code: string
  type: 'menu' | 'button' | 'api' | 'data'
  parentId?: number
  description: string
  status: number // 0: disabled, 1: enabled
  createTime: string
  updateTime?: string
  sort: number
  resource?: string
  action?: string
}

/**
 * 权限预设数据
 */
export const PERMISSION_PRESETS = {
  // 用户权限
  userView: {
    name: '查看用户',
    code: 'user:view',
    type: 'api' as const,
    resource: 'user',
    action: 'view',
    description: '查看用户列表和详情',
    status: 1
  },
  userCreate: {
    name: '创建用户',
    code: 'user:create',
    type: 'api' as const,
    resource: 'user',
    action: 'create',
    description: '创建新用户',
    status: 1
  },
  userUpdate: {
    name: '更新用户',
    code: 'user:update',
    type: 'api' as const,
    resource: 'user',
    action: 'update',
    description: '编辑用户信息',
    status: 1
  },
  userDelete: {
    name: '删除用户',
    code: 'user:delete',
    type: 'api' as const,
    resource: 'user',
    action: 'delete',
    description: '删除用户',
    status: 1
  },

  // 课程权限
  courseView: {
    name: '查看课程',
    code: 'course:view',
    type: 'api' as const,
    resource: 'course',
    action: 'view',
    description: '查看课程列表和详情',
    status: 1
  },
  courseManage: {
    name: '课程管理',
    code: 'course:manage',
    type: 'menu' as const,
    resource: 'course',
    action: 'manage',
    description: '课程管理菜单权限',
    status: 1
  },

  // 系统权限
  systemView: {
    name: '系统查看',
    code: 'system:view',
    type: 'menu' as const,
    resource: 'system',
    action: 'view',
    description: '系统设置查看权限',
    status: 1
  },
  systemUpdate: {
    name: '系统更新',
    code: 'system:update',
    type: 'api' as const,
    resource: 'system',
    action: 'update',
    description: '修改系统设置',
    status: 1
  },

  // 超级权限
  all: {
    name: '所有权限',
    code: 'all',
    type: 'api' as const,
    description: '所有系统权限',
    status: 1
  }
}

/**
 * Admin权限工厂类
 */
export class AdminPermissionFactory extends EnhancedBaseFactory<AdminPermission> {
  private readonly types: AdminPermission['type'][] = ['menu', 'button', 'api', 'data']
  private readonly resources = ['user', 'course', 'booking', 'order', 'finance', 'system', 'report', 'log']
  private readonly actions = ['view', 'create', 'update', 'delete', 'export', 'import', 'manage']

  constructor() {
    super({
      validator: createBaseValidator('adminPermission', (permission: AdminPermission) => {
        const errors: string[] = []
        const warnings: string[] = []

        // 基础字段验证
        if (!permission.name || permission.name.trim().length === 0) {
          errors.push('权限名称不能为空')
        }
        if (!permission.code || permission.code.trim().length === 0) {
          errors.push('权限代码不能为空')
        }
        if (!this.types.includes(permission.type)) {
          errors.push(`无效的权限类型: ${permission.type}`)
        }
        if (permission.status !== 0 && permission.status !== 1) {
          errors.push('权限状态必须是0或1')
        }

        // 权限代码格式验证
        if (permission.code !== 'all' && !permission.code.includes(':')) {
          warnings.push('权限代码建议使用resource:action格式')
        }

        // 资源和动作一致性验证
        if (permission.resource && permission.action) {
          const expectedCode = `${permission.resource}:${permission.action}`
          if (permission.code !== expectedCode && permission.code !== 'all') {
            warnings.push(`权限代码应为${expectedCode}`)
          }
        }

        return { isValid: errors.length === 0, errors, warnings }
      })
    })
  }

  /**
   * 创建权限
   */
  create(overrides: Partial<AdminPermission> = {}): AdminPermission {
    const id = overrides.id ?? this.nextId()
    const createdAt = overrides.createTime ? new Date(overrides.createTime) : this.randomDate()

    // 如果没有指定resource和action，随机生成
    const resource = overrides.resource ?? this.randomFromArray(this.resources)
    const action = overrides.action ?? this.randomFromArray(this.actions)
    const code = overrides.code ?? `${resource}:${action}`

    return this.mergeDefaults({
      id,
      name: this.generatePermissionName(resource, action),
      code,
      type: this.randomFromArray(this.types),
      parentId: this.randomBoolean() ? this.randomNumber(1, 10) : undefined,
      description: this.randomSentence(),
      status: this.randomFromArray([0, 1]),
      createTime: createdAt.toISOString(),
      updateTime: this.randomBoolean() ? this.randomDate(createdAt).toISOString() : undefined,
      sort: this.randomNumber(1, 100),
      resource,
      action
    }, overrides)
  }

  /**
   * 生成权限名称
   */
  private generatePermissionName(resource: string, action: string): string {
    const resourceNames: Record<string, string> = {
      user: '用户',
      course: '课程',
      booking: '预约',
      order: '订单',
      finance: '财务',
      system: '系统',
      report: '报表',
      log: '日志'
    }

    const actionNames: Record<string, string> = {
      view: '查看',
      create: '创建',
      update: '更新',
      delete: '删除',
      export: '导出',
      import: '导入',
      manage: '管理'
    }

    const resourceName = resourceNames[resource] || resource
    const actionName = actionNames[action] || action

    return `${resourceName}${actionName}`
  }

  /**
   * 创建API权限
   */
  createApiPermission(resource: string, action: string, overrides: Partial<AdminPermission> = {}): AdminPermission {
    return this.create({
      type: 'api',
      resource,
      action,
      code: `${resource}:${action}`,
      name: this.generatePermissionName(resource, action),
      ...overrides
    })
  }

  /**
   * 创建菜单权限
   */
  createMenuPermission(resource: string, overrides: Partial<AdminPermission> = {}): AdminPermission {
    return this.create({
      type: 'menu',
      resource,
      action: 'manage',
      code: `${resource}:manage`,
      name: `${this.generatePermissionName(resource, 'manage')}`,
      ...overrides
    })
  }

  /**
   * 创建按钮权限
   */
  createButtonPermission(resource: string, action: string, overrides: Partial<AdminPermission> = {}): AdminPermission {
    return this.create({
      type: 'button',
      resource,
      action,
      code: `${resource}:${action}`,
      name: this.generatePermissionName(resource, action),
      ...overrides
    })
  }

  /**
   * 创建数据权限
   */
  createDataPermission(resource: string, action: string, overrides: Partial<AdminPermission> = {}): AdminPermission {
    return this.create({
      type: 'data',
      resource,
      action,
      code: `${resource}:${action}`,
      name: this.generatePermissionName(resource, action),
      ...overrides
    })
  }

  /**
   * 创建预设权限
   */
  createPresetPermission(preset: keyof typeof PERMISSION_PRESETS, overrides: Partial<AdminPermission> = {}): AdminPermission {
    return this.create({
      ...PERMISSION_PRESETS[preset],
      ...overrides
    })
  }

  /**
   * 创建资源的所有权限
   */
  createResourcePermissions(resource: string): AdminPermission[] {
    const permissions: AdminPermission[] = []

    // 添加菜单权限
    permissions.push(this.createMenuPermission(resource, { sort: 1 }))

    // 添加CRUD权限
    const crudActions: (keyof typeof PERMISSION_PRESETS)[] = ['view', 'create', 'update', 'delete'] as const
    crudActions.forEach((action, index) => {
      const presetKey = `${resource}${action.charAt(0).toUpperCase() + action.slice(1)}` as keyof typeof PERMISSION_PRESETS
      if (PERMISSION_PRESETS[presetKey]) {
        permissions.push(this.createPresetPermission(presetKey, { sort: index + 2 }))
      } else {
        permissions.push(this.createApiPermission(resource, action, { sort: index + 2 }))
      }
    })

    return permissions
  }

  /**
   * 创建完整的权限树
   */
  createPermissionTree(): AdminPermission[] {
    const permissions: AdminPermission[] = []

    // 为每个资源创建权限
    this.resources.forEach((resource, index) => {
      const resourcePermissions = this.createResourcePermissions(resource)
      resourcePermissions.forEach(permission => {
        permission.id = permissions.length + 1
        permission.sort = index * 10 + permission.sort
      })
      permissions.push(...resourcePermissions)
    })

    // 添加特殊权限
    permissions.push(this.createPresetPermission('all', {
      id: permissions.length + 1,
      sort: 999
    }))

    return permissions
  }

  /**
   * 创建用户管理权限组
   */
  createUserPermissions(): AdminPermission[] {
    return [
      this.createPresetPermission('userView'),
      this.createPresetPermission('userCreate'),
      this.createPresetPermission('userUpdate'),
      this.createPresetPermission('userDelete')
    ]
  }

  /**
   * 创建课程管理权限组
   */
  createCoursePermissions(): AdminPermission[] {
    return [
      this.createPresetPermission('courseView'),
      this.createPresetPermission('courseManage'),
      this.createApiPermission('course', 'create'),
      this.createApiPermission('course', 'update'),
      this.createApiPermission('course', 'delete'),
      this.createApiPermission('course', 'export')
    ]
  }

  /**
   * 创建系统权限组
   */
  createSystemPermissions(): AdminPermission[] {
    return [
      this.createPresetPermission('systemView'),
      this.createPresetPermission('systemUpdate'),
      this.createApiPermission('system', 'config'),
      this.createApiPermission('system', 'backup'),
      this.createApiPermission('system', 'restore')
    ]
  }

  /**
   * 按类型筛选权限
   */
  filterByType(permissions: AdminPermission[], type: AdminPermission['type']): AdminPermission[] {
    return permissions.filter(permission => permission.type === type)
  }

  /**
   * 按资源筛选权限
   */
  filterByResource(permissions: AdminPermission[], resource: string): AdminPermission[] {
    return permissions.filter(permission => permission.resource === resource)
  }

  /**
   * 获取权限树结构
   */
  buildPermissionTree(permissions: AdminPermission[]): AdminPermission[] {
    const permissionMap = new Map<number, AdminPermission>()
    const rootPermissions: AdminPermission[] = []

    // 建立ID映射
    permissions.forEach(permission => {
      permissionMap.set(permission.id, { ...permission })
    })

    // 构建树结构
    permissions.forEach(permission => {
      const permissionWithChildren = permissionMap.get(permission.id)!
      if (permission.parentId && permissionMap.has(permission.parentId)) {
        // 这里简化处理，实际可以扩展为支持多级树结构
        console.warn('Permission tree building not fully implemented for nested structures')
      } else {
        rootPermissions.push(permissionWithChildren)
      }
    })

    return rootPermissions.sort((a, b) => a.sort - b.sort)
  }
}

// ========== 全局工厂实例 ==========

export const adminPermissionFactory = new AdminPermissionFactory()

// ========== 便捷创建函数 ==========

/**
 * 创建单个权限
 */
export function createAdminPermission(overrides: Partial<AdminPermission> = {}): AdminPermission {
  return adminPermissionFactory.create(overrides)
}

/**
 * 创建多个权限
 */
export function createAdminPermissions(count: number, overrides: Partial<AdminPermission> = {}): AdminPermission[] {
  return adminPermissionFactory.createMany(count, overrides)
}

/**
 * 创建API权限
 */
export function createApiPermission(resource: string, action: string, overrides: Partial<AdminPermission> = {}): AdminPermission {
  return adminPermissionFactory.createApiPermission(resource, action, overrides)
}

/**
 * 创建菜单权限
 */
export function createMenuPermission(resource: string, overrides: Partial<AdminPermission> = {}): AdminPermission {
  return adminPermissionFactory.createMenuPermission(resource, overrides)
}

/**
 * 创建资源的所有权限
 */
export function createResourcePermissions(resource: string): AdminPermission[] {
  return adminPermissionFactory.createResourcePermissions(resource)
}

/**
 * 创建完整的权限树
 */
export function createPermissionTree(): AdminPermission[] {
  return adminPermissionFactory.createPermissionTree()
}
