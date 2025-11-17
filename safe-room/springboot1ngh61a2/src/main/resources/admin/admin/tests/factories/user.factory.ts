import { faker } from '@faker-js/faker'

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
  status: number
  createTime: string
  updateTime?: string
  lastLoginTime?: string
  deptId?: number
  deptName?: string
}

/**
 * Create a mock admin user with default values
 */
export function createMockUser(overrides: Partial<AdminUser> = {}): AdminUser {
  const role = faker.helpers.arrayElement(['admin', 'manager', 'user'])
  const roles = role === 'admin' ? ['admin'] : [role]
  const permissions = role === 'admin' ? ['all'] : faker.helpers.arrayElements([
    'user:view', 'user:create', 'user:update', 'user:delete',
    'course:view', 'course:create', 'course:update', 'course:delete',
    'booking:view', 'booking:create', 'booking:update', 'booking:delete',
    'system:view', 'system:update'
  ], { min: 3, max: 8 })

  return {
    id: faker.number.int({ min: 1, max: 1000 }),
    username: faker.internet.username(),
    realName: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    avatar: faker.image.avatar(),
    role,
    roles,
    permissions,
    status: faker.helpers.arrayElement([0, 1]),
    createTime: faker.date.past().toISOString(),
    updateTime: faker.date.recent().toISOString(),
    lastLoginTime: faker.date.recent().toISOString(),
    deptId: faker.number.int({ min: 1, max: 10 }),
    deptName: faker.company.name(),
    ...overrides
  }
}

/**
 * Create a mock admin user
 */
export function createMockAdminUser(overrides: Partial<AdminUser> = {}): AdminUser {
  return createMockUser({
    role: 'admin',
    roles: ['admin'],
    permissions: ['all'],
    username: 'admin',
    email: 'admin@example.com',
    realName: 'Administrator',
    ...overrides
  })
}

/**
 * Create a mock manager user
 */
export function createMockManagerUser(overrides: Partial<AdminUser> = {}): AdminUser {
  return createMockUser({
    role: 'manager',
    roles: ['manager'],
    permissions: [
      'user:view', 'user:create', 'user:update',
      'course:view', 'course:create', 'course:update',
      'booking:view', 'booking:create', 'booking:update'
    ],
    ...overrides
  })
}

/**
 * Create a mock regular user
 */
export function createMockRegularUser(overrides: Partial<AdminUser> = {}): AdminUser {
  return createMockUser({
    role: 'user',
    roles: ['user'],
    permissions: ['user:view', 'course:view', 'booking:view'],
    ...overrides
  })
}

/**
 * Create multiple mock users
 */
export function createMockUsers(count: number, overrides: Partial<AdminUser> = {}): AdminUser[] {
  return Array.from({ length: count }, () => createMockUser(overrides))
}

/**
 * Create mock users by role
 */
export function createMockUsersByRole(role: string, count = 5): AdminUser[] {
  return createMockUsers(count, { role, roles: [role] })
}

/**
 * Create a mock user profile for admin panel
 */
export function createMockUserProfile(overrides: Partial<AdminUser & {
  bio?: string
  location?: string
  position?: string
  joinDate?: string
  lastActive?: string
}> = {}) {
  return {
    ...createMockUser(overrides),
    bio: faker.lorem.paragraph(),
    location: faker.location.city(),
    position: faker.person.jobTitle(),
    joinDate: faker.date.past({ years: 5 }).toISOString(),
    lastActive: faker.date.recent().toISOString(),
    ...overrides
  }
}

/**
 * Create mock user login log
 */
export function createMockUserLoginLog(overrides: Partial<{
  id: number
  userId: number
  username: string
  loginTime: string
  logoutTime?: string
  ip: string
  userAgent: string
  status: number
  message?: string
}> = {}) {
  const user = createMockUser()
  return {
    id: faker.number.int({ min: 1, max: 10000 }),
    userId: user.id,
    username: user.username,
    loginTime: faker.date.recent().toISOString(),
    logoutTime: faker.helpers.maybe(() => faker.date.recent().toISOString(), { probability: 0.8 }),
    ip: faker.internet.ip(),
    userAgent: faker.internet.userAgent(),
    status: faker.helpers.arrayElement([0, 1]),
    message: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }),
    ...overrides
  }
}

/**
 * Create mock user operation log
 */
export function createMockUserOperationLog(overrides: Partial<{
  id: number
  userId: number
  username: string
  operation: string
  method: string
  params?: string
  result?: string
  ip: string
  createTime: string
  status: number
  duration: number
}> = {}) {
  const user = createMockUser()
  const operations = [
    '用户登录', '用户登出', '创建用户', '更新用户', '删除用户',
    '创建课程', '更新课程', '删除课程', '查看报表', '系统设置'
  ]

  return {
    id: faker.number.int({ min: 1, max: 10000 }),
    userId: user.id,
    username: user.username,
    operation: faker.helpers.arrayElement(operations),
    method: faker.helpers.arrayElement(['GET', 'POST', 'PUT', 'DELETE']),
    params: faker.helpers.maybe(() => JSON.stringify({ id: faker.number.int() }), { probability: 0.6 }),
    result: faker.helpers.maybe(() => 'success', { probability: 0.9 }),
    ip: faker.internet.ip(),
    createTime: faker.date.recent().toISOString(),
    status: faker.helpers.arrayElement([0, 1]),
    duration: faker.number.int({ min: 10, max: 2000 }),
    ...overrides
  }
}
