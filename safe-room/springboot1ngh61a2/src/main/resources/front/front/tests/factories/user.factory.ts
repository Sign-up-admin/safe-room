import { faker } from '@faker-js/faker'

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
