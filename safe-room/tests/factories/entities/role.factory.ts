/**
 * Admin角色工厂
 * 创建和管理角色数据
 */

import {
  EnhancedBaseFactory,
  createRequiredFieldsValidator,
  createTypeValidator,
  createBaseValidator
} from '../base/base-factory'

// ========== 类型定义 ==========

/**
 * Admin角色接口
 */
export interface AdminRole {
  id: number
  name: string
  code: string
  description: string
  status: number // 0: disabled, 1: enabled
  permissions: string[]
  createTime: string
  updateTime?: string
  sort: number
  level: number // 角色等级，数字越大权限越高
  isSystem: boolean // 是否为系统角色
}

/**
 * 角色预设数据
 */
export const ROLE_PRESETS = {
  superAdmin: {
    name: '超级管理员',
    code: 'super_admin',
    description: '拥有系统所有权限的超级管理员角色',
    status: 1,
    permissions: ['all'],
    level: 100,
    isSystem: true
  },
  admin: {
    name: '管理员',
    code: 'admin',
    description: '系统管理员，拥有大部分管理权限',
    status: 1,
    permissions: [
      'user:view', 'user:create', 'user:update', 'user:delete',
      'course:view', 'course:create', 'course:update', 'course:delete',
      'system:view', 'system:update', 'reports:view', 'finance:view'
    ],
    level: 80,
    isSystem: true
  },
  manager: {
    name: '经理',
    code: 'manager',
    description: '部门经理，拥有部门管理权限',
    status: 1,
    permissions: [
      'user:view', 'user:create', 'user:update',
      'course:view', 'course:create', 'course:update',
      'reports:view', 'finance:view'
    ],
    level: 60,
    isSystem: false
  },
  operator: {
    name: '操作员',
    code: 'operator',
    description: '普通操作员，拥有基本操作权限',
    status: 1,
    permissions: [
      'user:view', 'course:view', 'reports:view'
    ],
    level: 40,
    isSystem: false
  },
  auditor: {
    name: '审计员',
    code: 'auditor',
    description: '审计人员，拥有查看和审计权限',
    status: 1,
    permissions: [
      'user:view', 'course:view', 'reports:view', 'log:view', 'finance:view'
    ],
    level: 30,
    isSystem: false
  },
  user: {
    name: '普通用户',
    code: 'user',
    description: '普通用户，拥有基本查看权限',
    status: 1,
    permissions: [
      'profile:view', 'profile:update', 'course:view', 'booking:create'
    ],
    level: 10,
    isSystem: true
  }
}

/**
 * Admin角色工厂类
 */
export class AdminRoleFactory extends EnhancedBaseFactory<AdminRole> {
  private readonly roleNames = [
    '超级管理员', '管理员', '经理', '主管', '操作员', '审计员', '客服', '销售', '财务', '人事'
  ]

  private readonly roleCodes = [
    'super_admin', 'admin', 'manager', 'supervisor', 'operator',
    'auditor', 'support', 'sales', 'finance', 'hr'
  ]

  constructor() {
    super({
      validator: createBaseValidator('adminRole', (role: AdminRole) => {
        const errors: string[] = []
        const warnings: string[] = []

        // 基础字段验证
        if (!role.name || role.name.trim().length === 0) {
          errors.push('角色名称不能为空')
        }
        if (!role.code || role.code.trim().length === 0) {
          errors.push('角色代码不能为空')
        }
        if (role.status !== 0 && role.status !== 1) {
          errors.push('角色状态必须是0或1')
        }
        if (role.level < 0 || role.level > 100) {
          warnings.push('角色等级应在0-100之间')
        }

        // 权限验证
        if (!Array.isArray(role.permissions)) {
          errors.push('权限必须是数组')
        } else if (role.permissions.length === 0) {
          warnings.push('角色至少应有一个权限')
        }

        // 系统角色验证
        if (role.isSystem && !['super_admin', 'admin', 'user'].includes(role.code)) {
          warnings.push('系统角色代码应为super_admin、admin或user')
        }

        return { isValid: errors.length === 0, errors, warnings }
      })
    })
  }

  /**
   * 创建角色
   */
  create(overrides: Partial<AdminRole> = {}): AdminRole {
    const id = overrides.id ?? this.nextId()
    const createdAt = overrides.createTime ? new Date(overrides.createTime) : this.randomDate()

    // 如果没有指定基本信息，随机生成
    const index = this.randomNumber(0, this.roleNames.length - 1)
    const name = overrides.name ?? this.roleNames[index]
    const code = overrides.code ?? this.roleCodes[index]

    return this.mergeDefaults({
      id,
      name,
      code,
      description: this.generateRoleDescription(name),
      status: this.randomFromArray([0, 1]),
      permissions: this.generateRolePermissions(code),
      createTime: createdAt.toISOString(),
      updateTime: this.randomBoolean() ? this.randomDate(createdAt).toISOString() : undefined,
      sort: this.randomNumber(1, 100),
      level: this.calculateRoleLevel(code),
      isSystem: this.isSystemRole(code)
    }, overrides)
  }

  /**
   * 生成角色描述
   */
  private generateRoleDescription(name: string): string {
    const descriptions: Record<string, string> = {
      '超级管理员': '拥有系统所有权限的超级管理员角色',
      '管理员': '系统管理员，拥有大部分管理权限',
      '经理': '部门经理，负责团队管理和业务运营',
      '主管': '小组主管，负责具体业务模块的管理',
      '操作员': '普通操作员，执行日常业务操作',
      '审计员': '审计人员，负责系统操作审计和检查',
      '客服': '客服人员，处理用户咨询和服务',
      '销售': '销售人员，负责销售和客户跟进',
      '财务': '财务人员，负责财务管理和核算',
      '人事': '人事专员，负责人事管理和招聘'
    }

    return descriptions[name] || `${name}角色，负责相关业务工作`
  }

  /**
   * 生成角色权限
   */
  private generateRolePermissions(code: string): string[] {
    const rolePermissions: Record<string, string[]> = {
      super_admin: ['all'],
      admin: [
        'user:manage', 'course:manage', 'system:manage',
        'reports:view', 'finance:view', 'log:view'
      ],
      manager: [
        'user:view', 'user:create', 'user:update',
        'course:view', 'course:create', 'course:update',
        'reports:view', 'booking:manage'
      ],
      supervisor: [
        'user:view', 'course:view', 'reports:view',
        'booking:create', 'booking:update'
      ],
      operator: [
        'user:view', 'course:view', 'booking:create', 'booking:view'
      ],
      auditor: [
        'user:view', 'course:view', 'reports:view', 'log:view',
        'finance:view', 'audit:view'
      ],
      support: [
        'user:view', 'message:manage', 'complaint:manage'
      ],
      sales: [
        'user:view', 'course:view', 'booking:create', 'sales:manage'
      ],
      finance: [
        'finance:view', 'finance:create', 'finance:update', 'reports:view'
      ],
      hr: [
        'user:manage', 'hr:manage', 'reports:view'
      ]
    }

    return rolePermissions[code] || ['profile:view', 'profile:update']
  }

  /**
   * 计算角色等级
   */
  private calculateRoleLevel(code: string): number {
    const levelMap: Record<string, number> = {
      super_admin: 100,
      admin: 80,
      manager: 60,
      supervisor: 50,
      auditor: 45,
      support: 40,
      sales: 40,
      finance: 40,
      hr: 40,
      operator: 30,
      user: 10
    }

    return levelMap[code] || 10
  }

  /**
   * 判断是否为系统角色
   */
  private isSystemRole(code: string): boolean {
    return ['super_admin', 'admin', 'user'].includes(code)
  }

  /**
   * 创建预设角色
   */
  createPresetRole(preset: keyof typeof ROLE_PRESETS, overrides: Partial<AdminRole> = {}): AdminRole {
    return this.create({
      ...ROLE_PRESETS[preset],
      ...overrides
    })
  }

  /**
   * 创建超级管理员角色
   */
  createSuperAdminRole(overrides: Partial<AdminRole> = {}): AdminRole {
    return this.createPresetRole('superAdmin', overrides)
  }

  /**
   * 创建管理员角色
   */
  createAdminRole(overrides: Partial<AdminRole> = {}): AdminRole {
    return this.createPresetRole('admin', overrides)
  }

  /**
   * 创建经理角色
   */
  createManagerRole(overrides: Partial<AdminRole> = {}): AdminRole {
    return this.createPresetRole('manager', overrides)
  }

  /**
   * 创建操作员角色
   */
  createOperatorRole(overrides: Partial<AdminRole> = {}): AdminRole {
    return this.createPresetRole('operator', overrides)
  }

  /**
   * 创建普通用户角色
   */
  createUserRole(overrides: Partial<AdminRole> = {}): AdminRole {
    return this.createPresetRole('user', overrides)
  }

  /**
   * 创建系统角色集合
   */
  createSystemRoles(): AdminRole[] {
    return [
      this.createSuperAdminRole({ id: 1, sort: 1 }),
      this.createAdminRole({ id: 2, sort: 2 }),
      this.createUserRole({ id: 3, sort: 10 })
    ]
  }

  /**
   * 创建业务角色集合
   */
  createBusinessRoles(): AdminRole[] {
    const roles: AdminRole[] = []
    let id = 4

    // 管理层角色
    roles.push(this.createManagerRole({ id: id++, sort: 3 }))

    // 业务角色
    roles.push(this.createPresetRole('operator', { id: id++, sort: 4 }))
    roles.push(this.createPresetRole('auditor', { id: id++, sort: 5 }))
    roles.push(this.createPresetRole('support', { id: id++, sort: 6 }))
    roles.push(this.createPresetRole('sales', { id: id++, sort: 7 }))
    roles.push(this.createPresetRole('finance', { id: id++, sort: 8 }))
    roles.push(this.createPresetRole('auditor', { id: id++, sort: 9 }))

    return roles
  }

  /**
   * 创建完整的角色体系
   */
  createCompleteRoleSystem(): AdminRole[] {
    return [
      ...this.createSystemRoles(),
      ...this.createBusinessRoles()
    ]
  }

  /**
   * 创建部门角色
   */
  createDepartmentRole(departmentName: string, overrides: Partial<AdminRole> = {}): AdminRole {
    return this.create({
      name: `${departmentName}管理员`,
      code: `${departmentName.toLowerCase()}_admin`,
      description: `负责${departmentName}部门的管理工作`,
      permissions: [
        `${departmentName.toLowerCase()}:manage`,
        'reports:view'
      ],
      level: 50,
      isSystem: false,
      ...overrides
    })
  }

  /**
   * 按等级筛选角色
   */
  filterByLevel(roles: AdminRole[], minLevel: number, maxLevel?: number): AdminRole[] {
    return roles.filter(role =>
      role.level >= minLevel && (maxLevel === undefined || role.level <= maxLevel)
    )
  }

  /**
   * 获取角色权限树
   */
  getRolePermissions(role: AdminRole): { resource: string; actions: string[] }[] {
    const permissionMap = new Map<string, string[]>()

    role.permissions.forEach(permission => {
      if (permission === 'all') {
        // 超级权限不分组
        return
      }

      const [resource, action] = permission.split(':')
      if (!permissionMap.has(resource)) {
        permissionMap.set(resource, [])
      }
      permissionMap.get(resource)!.push(action)
    })

    return Array.from(permissionMap.entries()).map(([resource, actions]) => ({
      resource,
      actions
    }))
  }

  /**
   * 检查角色是否有指定权限
   */
  hasPermission(role: AdminRole, permission: string): boolean {
    return role.permissions.includes('all') || role.permissions.includes(permission)
  }

  /**
   * 检查角色是否有资源权限
   */
  hasResourcePermission(role: AdminRole, resource: string, action?: string): boolean {
    if (role.permissions.includes('all')) {
      return true
    }

    const requiredPermission = action ? `${resource}:${action}` : `${resource}:`
    return role.permissions.some(permission =>
      permission === requiredPermission || permission.startsWith(`${resource}:`)
    )
  }

  /**
   * 获取角色等级名称
   */
  getRoleLevelName(level: number): string {
    if (level >= 90) return '超级管理员'
    if (level >= 70) return '高级管理员'
    if (level >= 50) return '中级管理员'
    if (level >= 30) return '初级管理员'
    return '普通用户'
  }
}

// ========== 全局工厂实例 ==========

export const adminRoleFactory = new AdminRoleFactory()

// ========== 便捷创建函数 ==========

/**
 * 创建单个角色
 */
export function createAdminRole(overrides: Partial<AdminRole> = {}): AdminRole {
  return adminRoleFactory.create(overrides)
}

/**
 * 创建多个角色
 */
export function createAdminRoles(count: number, overrides: Partial<AdminRole> = {}): AdminRole[] {
  return adminRoleFactory.createMany(count, overrides)
}

/**
 * 创建超级管理员角色
 */
export function createSuperAdminRole(overrides: Partial<AdminRole> = {}): AdminRole {
  return adminRoleFactory.createSuperAdminRole(overrides)
}

/**
 * 创建管理员角色
 */
export function createAdminRole(overrides: Partial<AdminRole> = {}): AdminRole {
  return adminRoleFactory.createAdminRole(overrides)
}

/**
 * 创建完整的角色体系
 */
export function createCompleteRoleSystem(): AdminRole[] {
  return adminRoleFactory.createCompleteRoleSystem()
}
