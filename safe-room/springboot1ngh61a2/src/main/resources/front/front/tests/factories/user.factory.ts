import { faker } from '@faker-js/faker'
import type { validateApiResponse } from '../../../../../../../../tests/shared/types/api-response.types'

export interface User {
  id: number
  username: string
  email: string
  realName?: string
  avatar?: string
  phone?: string
  role: string
  status: number
  createTime: string
  updateTime?: string
}

/**
 * Create a mock user with default values
 */
export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: faker.number.int({ min: 1, max: 1000 }),
    username: faker.internet.username(),
    email: faker.internet.email(),
    realName: faker.person.fullName(),
    avatar: faker.image.avatar(),
    phone: faker.phone.number(),
    role: 'user',
    status: 1,
    createTime: faker.date.past().toISOString(),
    updateTime: faker.date.recent().toISOString(),
    ...overrides
  }
}

/**
 * Create a mock admin user
 */
export function createMockAdminUser(overrides: Partial<User> = {}): User {
  return createMockUser({
    role: 'admin',
    username: 'admin',
    email: 'admin@example.com',
    realName: 'Administrator',
    ...overrides
  })
}

/**
 * Create a mock coach user
 */
export function createMockCoachUser(overrides: Partial<User> = {}): User {
  return createMockUser({
    role: 'coach',
    username: faker.internet.username(),
    email: faker.internet.email(),
    realName: `${faker.person.fullName()} (Coach)`,
    ...overrides
  })
}

/**
 * Create multiple mock users
 */
export function createMockUsers(count: number, overrides: Partial<User> = {}): User[] {
  return Array.from({ length: count }, () => createMockUser(overrides))
}

/**
 * Create a mock user profile
 */
export function createMockUserProfile(overrides: Partial<User & {
  bio?: string
  location?: string
  website?: string
  socialLinks?: Record<string, string>
  preferences?: Record<string, any>
}> = {}) {
  return {
    ...createMockUser(overrides),
    bio: faker.lorem.paragraph(),
    location: faker.location.city(),
    website: faker.internet.url(),
    socialLinks: {
      wechat: faker.internet.username(),
      qq: faker.number.int({ min: 100000, max: 999999999 }).toString()
    },
    preferences: {
      notifications: true,
      language: 'zh-CN',
      theme: 'light'
    },
    ...overrides
  }
}

/**
 * Create a mock user session
 */
export function createMockUserSession(overrides: Partial<{
  user: User
  token: string
  expiresAt: string
  refreshToken: string
}> = {}) {
  const user = createMockUser()
  return {
    user,
    token: faker.string.alphanumeric(32),
    expiresAt: faker.date.future().toISOString(),
    refreshToken: faker.string.alphanumeric(32),
    ...overrides
  }
}

// ========== 数据一致性检查函数 ==========

/**
 * 验证User对象是否符合接口规范
 */
export function validateUserData(user: any): user is User {
  return (
    user &&
    typeof user === 'object' &&
    typeof user.id === 'number' &&
    typeof user.username === 'string' &&
    typeof user.email === 'string' &&
    typeof user.role === 'string' &&
    typeof user.status === 'number' &&
    typeof user.createTime === 'string' &&
    user.username.length > 0 &&
    user.email.includes('@')
  )
}

/**
 * 验证User数组数据一致性
 */
export function validateUserListConsistency(users: User[]): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  if (!Array.isArray(users)) {
    errors.push('Input is not an array')
    return { isValid: false, errors, warnings }
  }

  const usernames = new Set<string>()
  const emails = new Set<string>()

  users.forEach((user, index) => {
    if (!validateUserData(user)) {
      errors.push(`User at index ${index} has invalid structure`)
    }

    // 检查用户名唯一性
    if (usernames.has(user.username)) {
      warnings.push(`Duplicate username ${user.username} found`)
    }
    usernames.add(user.username)

    // 检查邮箱唯一性
    if (emails.has(user.email)) {
      warnings.push(`Duplicate email ${user.email} found`)
    }
    emails.add(user.email)

    // 检查邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(user.email)) {
      warnings.push(`User ${user.username} has invalid email format: ${user.email}`)
    }

    // 检查状态值合理性
    if (user.status !== 0 && user.status !== 1) {
      warnings.push(`User ${user.username} has invalid status: ${user.status}`)
    }

    // 检查角色合理性
    const validRoles = ['user', 'admin', 'coach', 'member']
    if (!validRoles.includes(user.role)) {
      warnings.push(`User ${user.username} has invalid role: ${user.role}`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * 验证用户会话数据
 */
export function validateUserSession(session: any): boolean {
  return (
    session &&
    typeof session === 'object' &&
    validateUserData(session.user) &&
    typeof session.token === 'string' &&
    typeof session.expiresAt === 'string' &&
    typeof session.refreshToken === 'string' &&
    session.token.length > 0 &&
    session.refreshToken.length > 0
  )
}

/**
 * 创建验证后的用户数据（带类型检查）
 */
export function createValidatedUser(overrides: Partial<User> = {}): User {
  const user = createMockUser(overrides)

  if (!validateUserData(user)) {
    throw new Error('Generated user data does not match User interface')
  }

  return user
}

/**
 * 创建验证后的用户列表
 */
export function createValidatedUsers(count: number, overrides: Partial<User> = {}): User[] {
  const users = createMockUsers(count, overrides)
  const validation = validateUserListConsistency(users)

  if (!validation.isValid) {
    console.warn('User list validation warnings:', validation.warnings)
    throw new Error(`User list validation failed: ${validation.errors.join(', ')}`)
  }

  return users
}
