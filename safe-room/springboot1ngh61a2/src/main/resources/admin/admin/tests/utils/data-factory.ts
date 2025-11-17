/**
 * Admin前端测试数据工厂
 *
 * 提供各种测试数据的生成器，支持自定义配置和数据覆盖
 */

import { vi } from 'vitest'

/**
 * 基础数据工厂接口
 */
export interface BaseFactory<T = any> {
  create(overrides?: Partial<T>): T
  createMany(count: number, overrides?: Partial<T> | ((index: number) => Partial<T>)): T[]
  createWithId(id: number | string, overrides?: Partial<T>): T
}

/**
 * 通用数据工厂类
 */
export class DataFactory<T extends Record<string, any>> implements BaseFactory<T> {
  private template: (index?: number) => T

  constructor(template: (index?: number) => T) {
    this.template = template
  }

  create(overrides: Partial<T> = {}): T {
    return { ...this.template(), ...overrides }
  }

  createMany(count: number, overrides: Partial<T> | ((index: number) => Partial<T>) = {}): T[] {
    return Array.from({ length: count }, (_, index) => {
      const itemOverrides = typeof overrides === 'function' ? overrides(index) : overrides
      return this.create(itemOverrides)
    })
  }

  createWithId(id: number | string, overrides: Partial<T> = {}): T {
    return this.create({ id, ...overrides } as Partial<T>)
  }
}

/**
 * 用户工厂
 */
export const UserFactory = new DataFactory((index = 0) => ({
  id: index + 1,
  username: `user${index + 1}`,
  realName: `User ${index + 1}`,
  email: `user${index + 1}@example.com`,
  role: ['admin', 'user', 'moderator'][index % 3],
  roles: [['admin'], ['user'], ['moderator']][index % 3],
  permissions: [['all'], ['read'], ['write']][index % 3],
  avatar: `/avatar${index + 1}.jpg`,
  status: [1, 0, 2][index % 3], // 1: active, 0: inactive, 2: pending
  createTime: '2023-01-01 00:00:00',
  updateTime: '2023-01-01 00:00:00'
}))

/**
 * 模块工厂
 */
export const ModuleFactory = new DataFactory((index = 0) => ({
  id: index + 1,
  name: `Module ${index + 1}`,
  path: `/module${index + 1}`,
  component: `module${index + 1}/index`,
  icon: ['user', 'setting', 'data', 'chart'][index % 4],
  sort: index + 1,
  status: 1,
  parentId: null,
  createTime: '2023-01-01 00:00:00',
  updateTime: '2023-01-01 00:00:00'
}))

/**
 * 菜单工厂
 */
export const MenuFactory = new DataFactory((index = 0) => ({
  id: index + 1,
  name: `Menu ${index + 1}`,
  path: `/menu${index + 1}`,
  component: `menu${index + 1}/index`,
  icon: 'menu',
  sort: index + 1,
  parentId: null,
  status: 1,
  children: [],
  meta: {
    title: `Menu ${index + 1}`,
    icon: 'menu',
    hidden: false,
    roles: ['admin']
  },
  createTime: '2023-01-01 00:00:00'
}))

/**
 * 权限工厂
 */
export const PermissionFactory = new DataFactory((index = 0) => ({
  id: index + 1,
  name: `permission:${index + 1}`,
  description: `Permission ${index + 1} description`,
  resource: ['user', 'module', 'menu', 'system'][index % 4],
  action: ['create', 'read', 'update', 'delete'][index % 4],
  status: 1,
  createTime: '2023-01-01 00:00:00'
}))

/**
 * 角色工厂
 */
export const RoleFactory = new DataFactory((index = 0) => ({
  id: index + 1,
  name: `Role ${index + 1}`,
  code: `role_${index + 1}`,
  description: `Role ${index + 1} description`,
  status: 1,
  permissions: PermissionFactory.createMany(3, { id: (i) => (index * 3) + i + 1 }),
  createTime: '2023-01-01 00:00:00'
}))

/**
 * 通用表格数据工厂
 */
export class TableDataFactory<T extends Record<string, any>> extends DataFactory<T> {
  private columns: Array<{ key: string; type: 'string' | 'number' | 'boolean' | 'date' | 'enum'; enumValues?: any[] }>

  constructor(
    template: (index?: number) => T,
    columns: Array<{ key: string; type: 'string' | 'number' | 'boolean' | 'date' | 'enum'; enumValues?: any[] }>
  ) {
    super(template)
    this.columns = columns
  }

  createRandom(overrides: Partial<T> = {}): T {
    const randomData: any = {}

    this.columns.forEach(column => {
      if (overrides[column.key] !== undefined) return

      switch (column.type) {
        case 'string':
          randomData[column.key] = `Random ${column.key} ${Math.random().toString(36).substr(2, 9)}`
          break
        case 'number':
          randomData[column.key] = Math.floor(Math.random() * 1000)
          break
        case 'boolean':
          randomData[column.key] = Math.random() > 0.5
          break
        case 'date':
          randomData[column.key] = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
          break
        case 'enum':
          randomData[column.key] = column.enumValues?.[Math.floor(Math.random() * (column.enumValues.length))] || null
          break
      }
    })

    return this.create({ ...randomData, ...overrides })
  }

  createManyRandom(count: number, overrides: Partial<T> | ((index: number) => Partial<T>) = {}): T[] {
    return Array.from({ length: count }, (_, index) => {
      const itemOverrides = typeof overrides === 'function' ? overrides(index) : overrides
      return this.createRandom(itemOverrides)
    })
  }
}

/**
 * 预定义的表格数据工厂
 */
export const UserTableFactory = new TableDataFactory(
  (index = 0) => ({
    id: index + 1,
    username: `user${index + 1}`,
    realName: `User ${index + 1}`,
    email: `user${index + 1}@example.com`,
    role: ['admin', 'user', 'moderator'][index % 3],
    status: [1, 0, 2][index % 3],
    createTime: '2023-01-01 00:00:00',
    updateTime: '2023-01-01 00:00:00'
  }),
  [
    { key: 'username', type: 'string' },
    { key: 'realName', type: 'string' },
    { key: 'email', type: 'string' },
    { key: 'role', type: 'enum', enumValues: ['admin', 'user', 'moderator'] },
    { key: 'status', type: 'enum', enumValues: [0, 1, 2] },
    { key: 'createTime', type: 'date' },
    { key: 'updateTime', type: 'date' }
  ]
)

export const ModuleTableFactory = new TableDataFactory(
  (index = 0) => ({
    id: index + 1,
    name: `Module ${index + 1}`,
    path: `/module${index + 1}`,
    icon: ['user', 'setting', 'data'][index % 3],
    sort: index + 1,
    status: 1,
    createTime: '2023-01-01 00:00:00'
  }),
  [
    { key: 'name', type: 'string' },
    { key: 'path', type: 'string' },
    { key: 'icon', type: 'enum', enumValues: ['user', 'setting', 'data', 'chart'] },
    { key: 'sort', type: 'number' },
    { key: 'status', type: 'enum', enumValues: [0, 1] },
    { key: 'createTime', type: 'date' }
  ]
)

/**
 * 表单数据工厂
 */
export class FormDataFactory<T extends Record<string, any>> extends DataFactory<T> {
  createValid(overrides: Partial<T> = {}): T {
    // 默认创建有效的表单数据
    return this.create(overrides)
  }

  createInvalid(overrides: Partial<T> = {}): T {
    // 创建无效的表单数据（用于测试验证）
    return this.create({
      // 这里可以添加一些无效的值，比如空字符串、错误的格式等
      ...overrides
    })
  }

  createEmpty(): T {
    const emptyData: any = {}
    const template = this['template'](0)

    Object.keys(template).forEach(key => {
      const value = template[key]
      if (typeof value === 'string') emptyData[key] = ''
      else if (typeof value === 'number') emptyData[key] = 0
      else if (typeof value === 'boolean') emptyData[key] = false
      else if (Array.isArray(value)) emptyData[key] = []
      else emptyData[key] = null
    })

    return emptyData
  }
}

/**
 * 用户表单工厂
 */
export const UserFormFactory = new FormDataFactory((index = 0) => ({
  username: `user${index + 1}`,
  realName: `User ${index + 1}`,
  email: `user${index + 1}@example.com`,
  password: 'password123',
  confirmPassword: 'password123',
  role: 'user',
  status: 1,
  avatar: ''
}))

/**
 * 模块表单工厂
 */
export const ModuleFormFactory = new FormDataFactory((index = 0) => ({
  name: `Module ${index + 1}`,
  path: `/module${index + 1}`,
  component: `module${index + 1}/index`,
  icon: 'user',
  sort: index + 1,
  status: 1,
  parentId: null
}))

/**
 * API响应数据工厂
 */
export class ApiResponseFactory {
  static success<T>(data: T, message = 'success') {
    return {
      code: 200,
      message,
      data,
      success: true
    }
  }

  static error(message = 'error', code = 500) {
    return {
      code,
      message,
      data: null,
      success: false
    }
  }

  static paginated<T>(data: T[], total = 100, current = 1, size = 10) {
    return this.success({
      records: data,
      total,
      current,
      size,
      pages: Math.ceil(total / size)
    })
  }

  static list<T>(data: T[], message = 'success') {
    return this.success({
      records: data,
      total: data.length
    }, message)
  }
}

/**
 * Mock数据生成器集合
 */
export const DataGenerators = {
  // 基础数据生成器
  user: UserFactory,
  module: ModuleFactory,
  menu: MenuFactory,
  role: RoleFactory,
  permission: PermissionFactory,

  // 表格数据生成器
  userTable: UserTableFactory,
  moduleTable: ModuleTableFactory,

  // 表单数据生成器
  userForm: UserFormFactory,
  moduleForm: ModuleFormFactory,

  // API响应生成器
  api: ApiResponseFactory,

  // 便捷方法
  users: (count: number, overrides?: any) => UserFactory.createMany(count, overrides),
  modules: (count: number, overrides?: any) => ModuleFactory.createMany(count, overrides),
  menus: (count: number, overrides?: any) => MenuFactory.createMany(count, overrides),

  // 随机数据生成器
  randomUsers: (count: number) => UserTableFactory.createManyRandom(count),
  randomModules: (count: number) => ModuleTableFactory.createManyRandom(count),

  // 表单数据
  validUserForm: (overrides?: any) => UserFormFactory.createValid(overrides),
  invalidUserForm: (overrides?: any) => UserFormFactory.createInvalid(overrides),
  emptyUserForm: () => UserFormFactory.createEmpty(),

  validModuleForm: (overrides?: any) => ModuleFormFactory.createValid(overrides),
  invalidModuleForm: (overrides?: any) => ModuleFormFactory.createInvalid(overrides),
  emptyModuleForm: () => ModuleFormFactory.createEmpty(),

  // API响应
  successResponse: ApiResponseFactory.success,
  errorResponse: ApiResponseFactory.error,
  paginatedResponse: ApiResponseFactory.paginated,
  listResponse: ApiResponseFactory.list
}

/**
 * 测试场景数据生成器
 */
export const TestScenarios = {
  // 空数据场景
  empty: {
    users: () => [],
    modules: () => [],
    tableData: () => [],
    apiResponse: () => ApiResponseFactory.success([])
  },

  // 单个数据场景
  single: {
    user: () => UserFactory.create(),
    module: () => ModuleFactory.create(),
    menu: () => MenuFactory.create()
  },

  // 大数据场景
  large: {
    users: (count = 1000) => UserFactory.createMany(count),
    modules: (count = 500) => ModuleFactory.createMany(count),
    tableData: (count = 1000) => UserTableFactory.createMany(count)
  },

  // 边界情况
  edge: {
    veryLongStrings: {
      user: () => UserFactory.create({
        realName: 'A'.repeat(1000),
        email: 'a'.repeat(500) + '@example.com'
      })
    },
    specialCharacters: {
      user: () => UserFactory.create({
        username: '!@#$%^&*()',
        realName: '用户<>&"\''
      })
    },
    unicode: {
      user: () => UserFactory.create({
        realName: '用户测试🚀',
        email: '测试@example.com'
      })
    }
  },

  // 权限场景
  permissions: {
    admin: () => UserFactory.create({ role: 'admin', permissions: ['all'] }),
    moderator: () => UserFactory.create({ role: 'moderator', permissions: ['read', 'write'] }),
    user: () => UserFactory.create({ role: 'user', permissions: ['read'] }),
    guest: () => UserFactory.create({ role: 'guest', permissions: [] })
  }
}
