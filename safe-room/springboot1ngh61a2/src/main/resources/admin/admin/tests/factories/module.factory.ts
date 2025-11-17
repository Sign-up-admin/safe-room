import { faker } from '@faker-js/faker'
import type { validateApiResponse } from '../../../../../../../tests/shared/types/api-response.types'

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
  status: number
  createTime: string
  updateTime?: string
}

/**
 * Create a mock admin module with default values
 */
export function createMockModule(overrides: Partial<AdminModule> = {}): AdminModule {
  const name = faker.helpers.arrayElement([
    '用户管理', '课程管理', '预约管理', '订单管理', '财务管理',
    '系统设置', '权限管理', '数据统计', '日志管理', '消息管理'
  ])

  const path = faker.helpers.arrayElement([
    '/users', '/courses', '/bookings', '/orders', '/finance',
    '/settings', '/permissions', '/statistics', '/logs', '/messages'
  ])

  const component = faker.helpers.arrayElement([
    'users/index', 'courses/index', 'bookings/index', 'orders/index', 'finance/index',
    'settings/index', 'permissions/index', 'statistics/index', 'logs/index', 'messages/index'
  ])

  const icon = faker.helpers.arrayElement([
    'user', 'book', 'calendar', 'shopping', 'money',
    'setting', 'lock', 'chart', 'file-text', 'message'
  ])

  const id = overrides.id ?? faker.number.int({ min: 1, max: 1000 })

  return {
    id,
    name: overrides.name ?? name,
    path: overrides.path ?? path,
    component: overrides.component ?? component,
    redirect: overrides.redirect,
    icon: overrides.icon ?? icon,
    title: overrides.title ?? name,
    hidden: overrides.hidden ?? faker.datatype.boolean(),
    sort: overrides.sort ?? faker.number.int({ min: 1, max: 100 }),
    parentId: overrides.parentId ?? faker.helpers.maybe(() => faker.number.int({ min: 1, max: 50 }), { probability: 0.3 }),
    children: overrides.children,
    meta: {
      title: overrides.meta?.title ?? name,
      icon: overrides.meta?.icon ?? icon,
      hidden: overrides.meta?.hidden ?? faker.datatype.boolean(),
      keepAlive: overrides.meta?.keepAlive ?? faker.datatype.boolean(),
      roles: overrides.meta?.roles ?? ['admin'],
      permissions: overrides.meta?.permissions ?? ['read'],
      ...overrides.meta
    },
    status: overrides.status ?? faker.helpers.arrayElement([0, 1]),
    createTime: overrides.createTime ?? faker.date.past().toISOString(),
    updateTime: overrides.updateTime ?? faker.date.recent().toISOString(),
    ...overrides
  }
}

/**
 * Create multiple mock modules
 */
export function createMockModules(count: number, overrides: Partial<AdminModule> = {}): AdminModule[] {
  return Array.from({ length: count }, () => createMockModule(overrides))
}

/**
 * Create a hierarchical module structure
 */
export function createMockModuleTree(depth = 2, overrides: Partial<AdminModule> = {}): AdminModule[] {
  const modules: AdminModule[] = []

  // Create root modules
  for (let i = 0; i < 5; i++) {
    const rootModule = createMockModule({
      ...overrides,
      parentId: undefined,
      id: i + 1
    })

    if (depth > 1) {
      rootModule.children = []
      // Create child modules
      for (let j = 0; j < faker.number.int({ min: 2, max: 5 }); j++) {
        const childModule = createMockModule({
          ...overrides,
          parentId: rootModule.id,
          id: (i + 1) * 100 + j + 1
        })
        rootModule.children.push(childModule)
      }
    }

    modules.push(rootModule)
  }

  return modules
}

/**
 * Create a menu module
 */
export function createMockMenuModule(overrides: Partial<AdminModule> = {}): AdminModule {
  return createMockModule({
    hidden: false,
    meta: {
      title: faker.lorem.words({ min: 1, max: 2 }),
      icon: faker.helpers.arrayElement(['home', 'user', 'setting', 'chart', 'file']),
      hidden: false,
      keepAlive: true,
      roles: ['admin', 'manager'],
      permissions: ['read', 'write']
    },
    ...overrides
  })
}

/**
 * Create a hidden system module
 */
export function createMockSystemModule(overrides: Partial<AdminModule> = {}): AdminModule {
  return createMockModule({
    hidden: true,
    path: `/system/${faker.string.alphanumeric(8)}`,
    component: 'system/index',
    meta: {
      title: `系统${faker.lorem.word()}`,
      icon: 'setting',
      hidden: true,
      keepAlive: false,
      roles: ['super_admin'],
      permissions: ['admin']
    },
    ...overrides
  })
}

/**
 * Create a permission-based module
 */
export function createMockPermissionModule(permission: string, overrides: Partial<AdminModule> = {}): AdminModule {
  return createMockModule({
    meta: {
      title: `${permission}管理`,
      icon: 'lock',
      hidden: false,
      keepAlive: true,
      roles: ['admin'],
      permissions: [permission]
    },
    ...overrides
  })
}

/**
 * Create mock department data
 */
export function createMockDepartment(overrides: Partial<{
  id: number
  name: string
  code: string
  parentId?: number
  leader: string
  phone?: string
  email?: string
  status: number
  sort: number
  createTime: string
}> = {}) {
  return {
    id: faker.number.int({ min: 1, max: 100 }),
    name: faker.company.name(),
    code: faker.string.alphanumeric(5),
    parentId: faker.helpers.maybe(() => faker.number.int({ min: 1, max: 10 }), { probability: 0.3 }),
    leader: faker.person.fullName(),
    phone: faker.phone.number(),
    email: faker.internet.email(),
    status: faker.helpers.arrayElement([0, 1]),
    sort: faker.number.int({ min: 1, max: 100 }),
    createTime: faker.date.past().toISOString(),
    ...overrides
  }
}

/**
 * Validate module data structure
 */
export function validateModuleData(module: any): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  if (!module.name || typeof module.name !== 'string') {
    errors.push('模块名称不能为空')
  }

  if (!module.path || typeof module.path !== 'string') {
    errors.push('模块路径不能为空')
  }

  if (!module.component || typeof module.component !== 'string') {
    errors.push('模块组件不能为空')
  }

  if (module.status !== 0 && module.status !== 1) {
    warnings.push(`模块状态无效: ${module.status}`)
  }

  if (module.meta && typeof module.meta !== 'object') {
    errors.push('模块meta信息格式错误')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Validate module hierarchy
 */
export function validateModuleHierarchy(modules: AdminModule[]): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  const moduleMap = new Map<number, AdminModule>()
  modules.forEach(module => moduleMap.set(module.id, module))

  modules.forEach(module => {
    if (module.parentId) {
      const parent = moduleMap.get(module.parentId)
      if (!parent) {
        errors.push(`模块 ${module.id} 的父模块 ${module.parentId} 不存在`)
      }
    }

    if (module.children) {
      module.children.forEach(child => {
        if (child.parentId !== module.id) {
          warnings.push(`子模块 ${child.id} 的parentId与父模块 ${module.id} 不匹配`)
        }
      })
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}
