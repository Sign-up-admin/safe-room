/**
 * 用户Builder构建器
 * 提供链式API来构建用户数据
 */

import { AdminUser } from '../entities/user.factory'
import { faker } from '@faker-js/faker'

// ========== 用户Builder类 ==========

/**
 * 用户Builder类
 * 使用链式调用构建复杂的用户数据
 */
export class UserBuilder {
  private data: Partial<AdminUser> = {}

  constructor() {
    this.reset()
  }

  /**
   * 重置为默认值
   */
  reset(): this {
    this.data = {
      id: faker.number.int({ min: 1, max: 9999 }),
      username: faker.internet.username(),
      realName: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number('1##########'),
      avatar: faker.image.avatar(),
      role: 'user',
      roles: ['user'],
      permissions: ['profile:view', 'profile:update'],
      status: 1,
      createTime: faker.date.recent().toISOString(),
      updateTime: faker.date.recent().toISOString(),
      isVerified: true,
      twoFactorEnabled: false,
      loginAttempts: 0
    }
    return this
  }

  /**
   * 设置ID
   */
  withId(id: number): this {
    this.data.id = id
    return this
  }

  /**
   * 设置用户名
   */
  withUsername(username: string): this {
    this.data.username = username
    return this
  }

  /**
   * 设置真实姓名
   */
  withName(name: string): this {
    this.data.realName = name
    return this
  }

  /**
   * 设置邮箱
   */
  withEmail(email: string): this {
    this.data.email = email
    return this
  }

  /**
   * 设置手机号
   */
  withPhone(phone: string): this {
    this.data.phone = phone
    return this
  }

  /**
   * 设置头像
   */
  withAvatar(avatar: string): this {
    this.data.avatar = avatar
    return this
  }

  /**
   * 设置角色
   */
  withRole(role: AdminUser['role']): this {
    this.data.role = role
    this.data.roles = [role]

    // 根据角色自动设置权限
    switch (role) {
      case 'super_admin':
        this.data.permissions = ['all']
        break
      case 'admin':
        this.data.permissions = [
          'user:manage', 'course:manage', 'system:manage',
          'reports:view', 'finance:view', 'log:view'
        ]
        break
      case 'manager':
        this.data.permissions = [
          'user:view', 'user:create', 'user:update',
          'course:view', 'course:create', 'course:update',
          'reports:view', 'finance:view'
        ]
        break
      case 'moderator':
        this.data.permissions = [
          'user:view', 'course:view', 'reports:view',
          'content:manage'
        ]
        break
      case 'operator':
        this.data.permissions = [
          'user:view', 'course:view', 'booking:create', 'booking:view'
        ]
        break
      case 'user':
      default:
        this.data.permissions = ['profile:view', 'profile:update', 'course:view']
        break
    }

    return this
  }

  /**
   * 设置权限
   */
  withPermissions(permissions: string[]): this {
    this.data.permissions = permissions
    return this
  }

  /**
   * 添加权限
   */
  addPermission(permission: string): this {
    if (!this.data.permissions) {
      this.data.permissions = []
    }
    if (!this.data.permissions.includes(permission)) {
      this.data.permissions.push(permission)
    }
    return this
  }

  /**
   * 设置状态
   */
  withStatus(status: number): this {
    this.data.status = status
    return this
  }

  /**
   * 设置为活跃状态
   */
  active(): this {
    this.data.status = 1
    return this
  }

  /**
   * 设置为非活跃状态
   */
  inactive(): this {
    this.data.status = 0
    return this
  }

  /**
   * 设置部门ID
   */
  withDepartment(deptId: number, deptName?: string): this {
    this.data.deptId = deptId
    if (deptName) {
      this.data.deptName = deptName
    }
    return this
  }

  /**
   * 设置最后登录时间
   */
  withLastLogin(lastLoginAt: Date | string): this {
    this.data.lastLoginAt = lastLoginAt instanceof Date ? lastLoginAt : new Date(lastLoginAt)
    return this
  }

  /**
   * 设置创建时间
   */
  withCreateTime(createTime: Date | string): this {
    this.data.createTime = createTime instanceof Date ? createTime.toISOString() : createTime
    return this
  }

  /**
   * 设置更新时间
   */
  withUpdateTime(updateTime: Date | string): this {
    this.data.updateTime = updateTime instanceof Date ? updateTime.toISOString() : updateTime
    return this
  }

  /**
   * 设置是否已验证
   */
  verified(isVerified: boolean = true): this {
    this.data.isVerified = isVerified
    return this
  }

  /**
   * 设置两因素认证
   */
  withTwoFactor(enabled: boolean = true): this {
    this.data.twoFactorEnabled = enabled
    return this
  }

  /**
   * 设置登录尝试次数
   */
  withLoginAttempts(attempts: number): this {
    this.data.loginAttempts = attempts
    return this
  }

  /**
   * 设置为超级管理员
   */
  asSuperAdmin(): this {
    return this.withRole('super_admin').verified(true).withTwoFactor(true)
  }

  /**
   * 设置为管理员
   */
  asAdmin(): this {
    return this.withRole('admin').verified(true)
  }

  /**
   * 设置为经理
   */
  asManager(): this {
    return this.withRole('manager').verified(true)
  }

  /**
   * 设置为操作员
   */
  asOperator(): this {
    return this.withRole('operator').verified(true)
  }

  /**
   * 设置为审核员
   */
  asModerator(): this {
    return this.withRole('moderator').verified(true)
  }

  /**
   * 设置为普通用户
   */
  asUser(): this {
    return this.withRole('user')
  }

  /**
   * 设置为测试用户
   */
  asTestUser(): this {
    return this
      .withUsername('testuser')
      .withEmail('test@example.com')
      .withName('测试用户')
      .withRole('admin')
      .active()
      .verified(true)
      .withTwoFactor(false)
      .withLoginAttempts(0)
  }

  /**
   * 设置为随机用户
   */
  randomize(): this {
    return this
      .withId(faker.number.int({ min: 1, max: 9999 }))
      .withUsername(faker.internet.username())
      .withName(faker.person.fullName())
      .withEmail(faker.internet.email())
      .withPhone(faker.phone.number('1##########'))
      .withAvatar(faker.image.avatar())
      .withRole(faker.helpers.arrayElement(['super_admin', 'admin', 'manager', 'operator', 'user']))
      .withStatus(faker.helpers.arrayElement([0, 1]))
      .withCreateTime(faker.date.past())
      .withUpdateTime(faker.date.recent())
      .verified(faker.datatype.boolean())
      .withTwoFactor(faker.datatype.boolean())
      .withLoginAttempts(faker.number.int({ min: 0, max: 5 }))
  }

  /**
   * 批量设置属性
   */
  withOverrides(overrides: Partial<AdminUser>): this {
    Object.assign(this.data, overrides)
    return this
  }

  /**
   * 从现有用户复制
   */
  fromUser(user: Partial<AdminUser>): this {
    this.data = { ...user }
    return this
  }

  /**
   * 获取当前数据（用于调试）
   */
  getData(): Partial<AdminUser> {
    return { ...this.data }
  }

  /**
   * 构建最终用户对象
   */
  build(): AdminUser {
    // 确保必要字段存在
    if (!this.data.id) {
      this.data.id = faker.number.int({ min: 1, max: 9999 })
    }
    if (!this.data.username) {
      this.data.username = faker.internet.username()
    }
    if (!this.data.realName) {
      this.data.realName = faker.person.fullName()
    }
    if (!this.data.email) {
      this.data.email = faker.internet.email()
    }
    if (!this.data.createTime) {
      this.data.createTime = faker.date.recent().toISOString()
    }

    return this.data as AdminUser
  }

  /**
   * 构建多个用户
   */
  buildMany(count: number): AdminUser[] {
    const users: AdminUser[] = []
    for (let i = 0; i < count; i++) {
      // 为每个用户生成不同的ID和用户名
      const user = this.build()
      user.id = (this.data.id || 0) + i
      user.username = `${this.data.username || 'user'}${i + 1}`
      user.email = `${user.username}@example.com`
      users.push(user)
    }
    return users
  }

  /**
   * 克隆当前Builder
   */
  clone(): UserBuilder {
    const newBuilder = new UserBuilder()
    newBuilder.data = { ...this.data }
    return newBuilder
  }
}

// ========== 便捷构建函数 ==========

/**
 * 创建用户Builder实例
 */
export function userBuilder(): UserBuilder {
  return new UserBuilder()
}

/**
 * 快速构建用户
 */
export function buildUser(overrides: Partial<AdminUser> = {}): AdminUser {
  return new UserBuilder().withOverrides(overrides).build()
}

/**
 * 构建超级管理员
 */
export function buildSuperAdmin(overrides: Partial<AdminUser> = {}): AdminUser {
  return new UserBuilder().asSuperAdmin().withOverrides(overrides).build()
}

/**
 * 构建管理员
 */
export function buildAdmin(overrides: Partial<AdminUser> = {}): AdminUser {
  return new UserBuilder().asAdmin().withOverrides(overrides).build()
}

/**
 * 构建测试用户
 */
export function buildTestUser(overrides: Partial<AdminUser> = {}): AdminUser {
  return new UserBuilder().asTestUser().withOverrides(overrides).build()
}

/**
 * 构建随机用户
 */
export function buildRandomUser(overrides: Partial<AdminUser> = {}): AdminUser {
  return new UserBuilder().randomize().withOverrides(overrides).build()
}

/**
 * 构建用户列表
 */
export function buildUserList(count: number, baseOverrides: Partial<AdminUser> = {}): AdminUser[] {
  return new UserBuilder().withOverrides(baseOverrides).buildMany(count)
}
