import { faker } from '@faker-js/faker'

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
  role: string
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
  admin: {
    role: 'admin',
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
    role: 'manager',
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
    role: 'operator',
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
    role: 'admin',
    roles: ['admin'],
    permissions: ['all'],
    status: 1,
    isVerified: true,
    twoFactorEnabled: false,
    loginAttempts: 0
  }
}

/**
 * 创建单个管理员用户
 */
export function createAdminUser(overrides: Partial<AdminUser> = {}): AdminUser {
  const id = overrides.id ?? faker.number.int({ min: 1, max: 10000 })
  const roles = ['admin', 'manager', 'operator', 'viewer']
  const departments = ['技术部', '运营部', '市场部', '财务部', '人事部']

  return {
    id,
    username: overrides.username ?? `admin_${id}_${faker.string.alphanumeric(4)}`,
    realName: overrides.realName ?? faker.person.fullName(),
    email: overrides.email ?? faker.internet.email(),
    phone: overrides.phone ?? faker.phone.number(),
    avatar: overrides.avatar ?? faker.image.avatar(),
    role: overrides.role ?? faker.helpers.arrayElement(roles),
    roles: overrides.roles ?? [overrides.role ?? faker.helpers.arrayElement(roles)],
    permissions: overrides.permissions ?? ['user:view', 'course:view'],
    status: overrides.status ?? faker.helpers.arrayElement([0, 1]),
    createTime: overrides.createTime ?? faker.date.past().toISOString(),
    updateTime: overrides.updateTime ?? faker.date.recent().toISOString(),
    lastLoginTime: overrides.lastLoginTime ?? faker.date.recent().toISOString(),
    deptId: overrides.deptId ?? faker.number.int({ min: 1, max: 10 }),
    deptName: overrides.deptName ?? faker.helpers.arrayElement(departments),
    isVerified: overrides.isVerified ?? true,
    twoFactorEnabled: overrides.twoFactorEnabled ?? faker.datatype.boolean(),
    loginAttempts: overrides.loginAttempts ?? faker.number.int({ min: 0, max: 5 }),
    ...overrides
  }
}

/**
 * 创建多个管理员用户
 */
export function createAdminUsers(count: number, overrides: Partial<AdminUser> = {}): AdminUser[] {
  return Array.from({ length: count }, () => createAdminUser(overrides))
}

/**
 * 创建测试管理员
 */
export function createTestAdmin(overrides: Partial<AdminUser> = {}): AdminUser {
  return createAdminUser({
    ...USER_PRESETS.testUser,
    ...overrides
  })
}

/**
 * 创建管理员
 */
export function createAdmin(overrides: Partial<AdminUser> = {}): AdminUser {
  return createAdminUser({
    ...USER_PRESETS.admin,
    username: 'admin',
    realName: '管理员',
    ...overrides
  })
}

/**
 * 创建经理
 */
export function createManager(overrides: Partial<AdminUser> = {}): AdminUser {
  return createAdminUser({
    ...USER_PRESETS.manager,
    ...overrides
  })
}

/**
 * 创建操作员
 */
export function createOperator(overrides: Partial<AdminUser> = {}): AdminUser {
  return createAdminUser({
    ...USER_PRESETS.operator,
    ...overrides
  })
}

/**
 * 验证管理员用户数据
 */
export function validateAdminUserData(user: any): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // 基础字段验证
  if (!user.username || typeof user.username !== 'string' || user.username.trim().length === 0) {
    errors.push('用户名不能为空')
  }
  if (!user.realName || typeof user.realName !== 'string' || user.realName.trim().length === 0) {
    errors.push('真实姓名不能为空')
  }
  if (!user.email || typeof user.email !== 'string' || !user.email.includes('@')) {
    errors.push('邮箱格式无效')
  }
  if (user.status !== 0 && user.status !== 1) {
    warnings.push(`AdminUser ${user.username || 'unknown'} has invalid status: ${user.status}`)
  }

  // 验证角色
  const validRoles = ['admin', 'manager', 'operator', 'viewer']
  if (!validRoles.includes(user.role)) {
    warnings.push(`AdminUser ${user.username || 'unknown'} has invalid role: ${user.role}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * 验证操作日志数据
 */
export function validateOperationLogData(log: any): boolean {
  const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  const validStatuses = [0, 1]

  return (
    log &&
    typeof log === 'object' &&
    typeof log.id === 'number' &&
    typeof log.userId === 'number' &&
    typeof log.username === 'string' &&
    typeof log.operation === 'string' &&
    validMethods.includes(log.method) &&
    typeof log.url === 'string' &&
    validStatuses.includes(log.status) &&
    typeof log.createTime === 'string'
  )
}
