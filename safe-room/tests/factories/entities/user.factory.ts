/**
 * Admin用户工厂
 * 整合现有的AdminUserFactory和user.factory.ts功能
 */

import {
  EnhancedBaseFactory,
  createRequiredFieldsValidator,
  createTypeValidator,
  createBaseValidator
} from '../base/base-factory'
import { faker } from '@faker-js/faker'

// ========== 类型定义 ==========

/**
 * Admin用户接口
 */
export interface AdminUser {
  id: number
  username: string
  realName: string
  email: string
  phone?: string
  avatar?: string
  role: 'super_admin' | 'admin' | 'moderator' | 'operator' | 'manager' | 'user'
  roles: string[]
  permissions: string[]
  status: number // 0: inactive, 1: active
  createTime: string
  updateTime?: string
  lastLoginTime?: string
  deptId?: number
  deptName?: string
  isVerified: boolean
  twoFactorEnabled: boolean
  loginAttempts: number
}

/**
 * 用户预设数据
 */
export const USER_PRESETS = {
  superAdmin: {
    role: 'super_admin' as const,
    roles: ['super_admin'],
    permissions: ['all'],
    status: 1,
    isVerified: true,
    twoFactorEnabled: true
  },
  admin: {
    role: 'admin' as const,
    roles: ['admin'],
    permissions: [
      'user:view', 'user:create', 'user:update', 'user:delete',
      'course:view', 'course:create', 'course:update', 'course:delete',
      'system:view', 'system:update', 'reports:view'
    ],
    status: 1,
    isVerified: true,
    twoFactorEnabled: false
  },
  manager: {
    role: 'manager' as const,
    roles: ['manager'],
    permissions: [
      'user:view', 'user:create', 'user:update',
      'course:view', 'course:create', 'course:update',
      'reports:view'
    ],
    status: 1,
    isVerified: true,
    twoFactorEnabled: false
  },
  operator: {
    role: 'operator' as const,
    roles: ['operator'],
    permissions: [
      'user:view', 'course:view', 'reports:view'
    ],
    status: 1,
    isVerified: true,
    twoFactorEnabled: false
  },
  testUser: {
    username: 'testadmin',
    email: 'admin@test.com',
    realName: '测试管理员',
    role: 'admin' as const,
    roles: ['admin'],
    permissions: ['all'],
    status: 1,
    isVerified: true,
    twoFactorEnabled: false,
    loginAttempts: 0
  }
}

/**
 * Admin用户工厂类
 */
export class AdminUserFactory extends EnhancedBaseFactory<AdminUser> {
  private readonly roles: AdminUser['role'][] = ['super_admin', 'admin', 'moderator', 'operator', 'manager', 'user']
  private readonly departments = ['技术部', '运营部', '市场部', '财务部', '人事部', '客服部', '销售部', '产品部']

  constructor() {
    super({
      validator: createBaseValidator('adminUser', (user: AdminUser) => {
        const errors: string[] = []
        const warnings: string[] = []

        // 基础字段验证
        if (!user.username || user.username.trim().length === 0) {
          errors.push('用户名不能为空')
        }
        if (!user.realName || user.realName.trim().length === 0) {
          errors.push('真实姓名不能为空')
        }
        if (!user.email || !user.email.includes('@')) {
          errors.push('邮箱格式无效')
        }
        if (!this.roles.includes(user.role)) {
          errors.push(`无效的用户角色: ${user.role}`)
        }
        if (user.status !== 0 && user.status !== 1) {
          errors.push('用户状态必须是0或1')
        }

        // 权限验证
        if (!Array.isArray(user.permissions)) {
          errors.push('权限必须是数组')
        }

        // 登录尝试次数验证
        if (user.loginAttempts < 0) {
          warnings.push('登录尝试次数不能为负数')
        }

        return { isValid: errors.length === 0, errors, warnings }
      })
    })
  }

  /**
   * 创建用户
   */
  create(overrides: Partial<AdminUser> = {}): AdminUser {
    const id = overrides.id ?? this.nextId()
    const createdAt = overrides.createTime ? new Date(overrides.createTime) : this.randomDate()
    const role = overrides.role ?? this.randomFromArray(this.roles)

    return this.mergeDefaults({
      id,
      username: `admin_${id}_${this.randomString(4)}`,
      realName: this.randomName(),
      email: this.randomEmail('admin.com'),
      phone: this.randomPhone(),
      avatar: this.randomAvatar(),
      role,
      roles: [role],
      permissions: this.generatePermissions(role),
      status: this.randomFromArray([0, 1]),
      createTime: createdAt.toISOString(),
      updateTime: this.randomBoolean() ? this.randomDate(createdAt).toISOString() : undefined,
      lastLoginTime: this.randomBoolean() ? this.randomDate(createdAt).toISOString() : undefined,
      deptId: this.randomNumber(1, 10),
      deptName: this.randomFromArray(this.departments),
      isVerified: true, // 管理员默认已验证
      twoFactorEnabled: this.randomBoolean(),
      loginAttempts: this.randomNumber(0, 5)
    }, overrides)
  }

  /**
   * 根据角色生成权限列表
   */
  private generatePermissions(role: AdminUser['role']): string[] {
    const rolePermissions: Record<AdminUser['role'], string[]> = {
      super_admin: ['all'],
      admin: [
        'user:view', 'user:create', 'user:update', 'user:delete',
        'course:view', 'course:create', 'course:update', 'course:delete',
        'system:view', 'system:update', 'reports:view', 'finance:view'
      ],
      manager: [
        'user:view', 'user:create', 'user:update',
        'course:view', 'course:create', 'course:update',
        'reports:view', 'finance:view'
      ],
      moderator: [
        'user:view', 'user:update', 'course:view', 'course:update',
        'reports:view'
      ],
      operator: [
        'user:view', 'course:view', 'reports:view'
      ],
      user: [
        'profile:view', 'profile:update'
      ]
    }

    return rolePermissions[role] || []
  }

  /**
   * 创建超级管理员
   */
  createSuperAdmin(overrides: Partial<AdminUser> = {}): AdminUser {
    return this.create({
      ...USER_PRESETS.superAdmin,
      username: 'superadmin',
      realName: '超级管理员',
      ...overrides
    })
  }

  /**
   * 创建管理员
   */
  createAdmin(overrides: Partial<AdminUser> = {}): AdminUser {
    return this.create({
      ...USER_PRESETS.admin,
      username: 'admin',
      realName: '管理员',
      ...overrides
    })
  }

  /**
   * 创建经理
   */
  createManager(overrides: Partial<AdminUser> = {}): AdminUser {
    return this.create({
      ...USER_PRESETS.manager,
      ...overrides
    })
  }

  /**
   * 创建操作员
   */
  createOperator(overrides: Partial<AdminUser> = {}): AdminUser {
    return this.create({
      ...USER_PRESETS.operator,
      ...overrides
    })
  }

  /**
   * 创建测试用户
   */
  createTestAdmin(overrides: Partial<AdminUser> = {}): AdminUser {
    return this.create({
      ...USER_PRESETS.testUser,
      ...overrides
    })
  }

  /**
   * 创建被暂停的用户
   */
  createSuspendedUser(overrides: Partial<AdminUser> = {}): AdminUser {
    return this.create({
      status: 0,
      ...overrides
    })
  }

  /**
   * 创建活跃用户
   */
  createActiveUser(overrides: Partial<AdminUser> = {}): AdminUser {
    return this.create({
      status: 1,
      ...overrides
    })
  }

  /**
   * 创建用户列表（按角色）
   */
  createUsersByRole(role: AdminUser['role'], count: number): AdminUser[] {
    return this.createMany(count, { role, roles: [role] })
  }

  /**
   * 创建用户列表（混合角色）
   */
  createUserList(count: number, roleDistribution?: Partial<Record<AdminUser['role'], number>>): AdminUser[] {
    if (!roleDistribution) {
      return this.createMany(count)
    }

    const users: AdminUser[] = []
    let remaining = count

    // 按指定分布创建用户
    for (const [role, roleCount] of Object.entries(roleDistribution) as [AdminUser['role'], number][]) {
      const actualCount = Math.min(roleCount, remaining)
      users.push(...this.createUsersByRole(role, actualCount))
      remaining -= actualCount
      if (remaining <= 0) break
    }

    // 填充剩余用户
    while (remaining > 0) {
      users.push(this.create())
      remaining--
    }

    return users
  }
}

// ========== 全局工厂实例 ==========

export const adminUserFactory = new AdminUserFactory()

// ========== 便捷创建函数 ==========

/**
 * 创建单个管理员用户
 */
export function createAdminUser(overrides: Partial<AdminUser> = {}): AdminUser {
  return adminUserFactory.create(overrides)
}

/**
 * 创建多个管理员用户
 */
export function createAdminUsers(count: number, overrides: Partial<AdminUser> = {}): AdminUser[] {
  return adminUserFactory.createMany(count, overrides)
}

/**
 * 创建测试管理员
 */
export function createTestAdmin(overrides: Partial<AdminUser> = {}): AdminUser {
  return adminUserFactory.createTestAdmin(overrides)
}

/**
 * 创建超级管理员
 */
export function createSuperAdmin(overrides: Partial<AdminUser> = {}): AdminUser {
  return adminUserFactory.createSuperAdmin(overrides)
}

/**
 * 创建管理员
 */
export function createAdmin(overrides: Partial<AdminUser> = {}): AdminUser {
  return adminUserFactory.createAdmin(overrides)
}
