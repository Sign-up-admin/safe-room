import { faker } from '@faker-js/faker'

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

  return {
    id: faker.number.int({ min: 1, max: 1000 }),
    name,
    path,
    component,
    redirect: faker.helpers.maybe(() => path + '/index', { probability: 0.2 }),
    icon,
    title: name,
    hidden: faker.datatype.boolean(),
    sort: faker.number.int({ min: 1, max: 100 }),
    parentId: faker.helpers.maybe(() => faker.number.int({ min: 1, max: 10 }), { probability: 0.3 }),
    children: [],
    meta: {
      title: name,
      icon,
      hidden: faker.datatype.boolean(),
      keepAlive: faker.datatype.boolean(),
      roles: faker.helpers.arrayElements(['admin', 'manager', 'user'], { min: 1, max: 3 }),
      permissions: faker.helpers.arrayElements([
        'view', 'create', 'update', 'delete', 'export'
      ], { min: 1, max: 4 }).map(p => `${path.replace('/', '')}:${p}`)
    },
    status: faker.helpers.arrayElement([0, 1]),
    createTime: faker.date.past().toISOString(),
    updateTime: faker.date.recent().toISOString(),
    ...overrides
  }
}

/**
 * Create a mock menu module (top-level)
 */
export function createMockMenuModule(overrides: Partial<AdminModule> = {}): AdminModule {
  return createMockModule({
    parentId: undefined,
    hidden: false,
    sort: faker.number.int({ min: 1, max: 20 }),
    ...overrides
  })
}

/**
 * Create a mock submenu module
 */
export function createMockSubmenuModule(parentId: number, overrides: Partial<AdminModule> = {}): AdminModule {
  return createMockModule({
    parentId,
    path: faker.helpers.arrayElement([
      'list', 'create', 'edit', 'detail', 'statistics'
    ]),
    hidden: faker.datatype.boolean(),
    sort: faker.number.int({ min: 1, max: 50 }),
    ...overrides
  })
}

/**
 * Create a complete menu tree with parent and children
 */
export function createMockMenuTree(overrides: Partial<AdminModule & { childrenCount: number }> = {}): AdminModule {
  const { childrenCount = faker.number.int({ min: 2, max: 5 }), ...moduleOverrides } = overrides
  const parentModule = createMockMenuModule(moduleOverrides)

  parentModule.children = Array.from({ length: childrenCount }, () =>
    createMockSubmenuModule(parentModule.id)
  )

  return parentModule
}

/**
 * Create multiple mock modules
 */
export function createMockModules(count: number, overrides: Partial<AdminModule> = {}): AdminModule[] {
  return Array.from({ length: count }, () => createMockModule(overrides))
}

/**
 * Create mock modules by type
 */
export function createMockModulesByType(type: 'menu' | 'submenu', count = 5): AdminModule[] {
  if (type === 'menu') {
    return createMockModules(count, { parentId: undefined, hidden: false })
  } else {
    return createMockModules(count, { parentId: faker.number.int({ min: 1, max: 10 }) })
  }
}

/**
 * Create a full navigation menu structure
 */
export function createMockNavigationMenu(): AdminModule[] {
  const menuItems = [
    { name: '首页', path: '/dashboard', component: 'dashboard/index', icon: 'dashboard' },
    { name: '用户管理', path: '/users', component: 'users/index', icon: 'user' },
    { name: '课程管理', path: '/courses', component: 'courses/index', icon: 'book' },
    { name: '预约管理', path: '/bookings', component: 'bookings/index', icon: 'calendar' },
    { name: '订单管理', path: '/orders', component: 'orders/index', icon: 'shopping' },
    { name: '财务管理', path: '/finance', component: 'finance/index', icon: 'money' },
    { name: '系统设置', path: '/settings', component: 'settings/index', icon: 'setting' }
  ]

  return menuItems.map((item, index) => {
    const module = createMockMenuModule({
      id: index + 1,
      name: item.name,
      path: item.path,
      component: item.component,
      icon: item.icon,
      sort: index + 1
    })

    // Add some children to key modules
    if (['用户管理', '课程管理', '预约管理', '订单管理'].includes(item.name)) {
      module.children = [
        createMockSubmenuModule(module.id, {
          name: `${item.name}-列表`,
          path: 'list',
          component: `${item.component}/list`,
          sort: 1
        }),
        createMockSubmenuModule(module.id, {
          name: `${item.name}-新增`,
          path: 'create',
          component: `${item.component}/create`,
          sort: 2
        }),
        createMockSubmenuModule(module.id, {
          name: `${item.name}-编辑`,
          path: 'edit',
          component: `${item.component}/edit`,
          sort: 3
        })
      ]
    }

    return module
  })
}

/**
 * Create mock permission data
 */
export function createMockPermission(overrides: Partial<{
  id: number
  name: string
  code: string
  type: string
  parentId?: number
  description: string
  status: number
  createTime: string
}> = {}) {
  const types = ['menu', 'button', 'api']
  const type = faker.helpers.arrayElement(types)

  return {
    id: faker.number.int({ min: 1, max: 1000 }),
    name: faker.lorem.words({ min: 1, max: 3 }),
    code: faker.string.alphanumeric(10),
    type,
    parentId: faker.helpers.maybe(() => faker.number.int({ min: 1, max: 100 }), { probability: 0.4 }),
    description: faker.lorem.sentence(),
    status: faker.helpers.arrayElement([0, 1]),
    createTime: faker.date.past().toISOString(),
    ...overrides
  }
}

/**
 * Create mock role data
 */
export function createMockRole(overrides: Partial<{
  id: number
  name: string
  code: string
  description: string
  status: number
  permissions: string[]
  createTime: string
  updateTime?: string
}> = {}) {
  const roleNames = ['超级管理员', '管理员', '普通用户', '访客']
  const roleCodes = ['super_admin', 'admin', 'user', 'guest']

  const index = faker.number.int({ min: 0, max: 3 })

  return {
    id: faker.number.int({ min: 1, max: 100 }),
    name: roleNames[index],
    code: roleCodes[index],
    description: faker.lorem.sentence(),
    status: faker.helpers.arrayElement([0, 1]),
    permissions: faker.helpers.arrayElements([
      'user:view', 'user:create', 'user:update', 'user:delete',
      'course:view', 'course:create', 'course:update', 'course:delete',
      'system:view', 'system:update', 'all'
    ], { min: 3, max: 10 }),
    createTime: faker.date.past().toISOString(),
    updateTime: faker.date.recent().toISOString(),
    ...overrides
  }
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
