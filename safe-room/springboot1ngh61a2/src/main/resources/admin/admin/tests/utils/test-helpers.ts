import { mount, VueWrapper, MountingOptions } from '@vue/test-utils'
import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import type { Component } from 'vue'

// Admin routes for testing
const routes = [
  { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
  { path: '/login', name: 'login', component: { template: '<div>Login</div>' } },
  { path: '/dashboard', name: 'dashboard', component: { template: '<div>Dashboard</div>' } },
  { path: '/users', name: 'users', component: { template: '<div>Users</div>' } },
  { path: '/settings', name: 'settings', component: { template: '<div>Settings</div>' } },
  { path: '/modules', name: 'modules', component: { template: '<div>Modules</div>' } },
  { path: '/logs', name: 'logs', component: { template: '<div>Logs</div>' } }
]

/**
 * Create a test Vue application with admin-specific plugins
 */
export function createTestApp() {
  const app = createApp({})
  const pinia = createPinia()
  const router = createRouter({
    history: createWebHistory(),
    routes
  })

  app.use(pinia)
  app.use(router)
  app.use(ElementPlus)

  return app
}

/**
 * Mount a component with admin-specific defaults
 */
export function mountComponent<T extends Component>(
  component: T,
  options: MountingOptions<any> = {}
): VueWrapper {
  const app = createTestApp()

  // Set active Pinia instance for stores
  setActivePinia(createPinia())

  // Default mounting options for admin components
  const defaultOptions: MountingOptions<any> = {
    global: {
      plugins: [app],
      stubs: {
        // Admin-specific stubs
        'el-button': true,
        'el-input': true,
        'el-table': true,
        'el-form': true,
        'el-dialog': true,
        'el-menu': true,
        'el-submenu': true,
        'el-menu-item': true,
        'el-card': true,
        'el-select': true,
        'el-option': true,
        'el-pagination': true,
        'el-breadcrumb': true,
        'el-breadcrumb-item': true,
        'el-loading': true,
        'el-message': true,
        'el-message-box': true,
        'el-notification': true,
        'transition': true,
        'transition-group': true,
        'teleport': true,
        // Admin layout components
        'index-header': true,
        'index-aside': true,
        'index-main': true,
        'tags-view': true,
        'breadcrumb': true,
        'svg-icon': true
      },
      mocks: {
        // Mock common composables
        $t: (key: string) => key,
        $tc: (key: string) => key,
        $te: (key: string) => true,
        $tm: (key: string) => ({}),
        $rt: (key: string) => key,
        $d: (value: any) => value,
        $n: (value: any) => String(value),
        // Admin-specific mocks
        $hasPermission: (permission: string) => true,
        $hasRole: (role: string) => true,
        $getUserInfo: () => createMockUser(),
        $getToken: () => 'mock-admin-token'
      },
      ...options.global
    },
    ...options
  }

  return mount(component, defaultOptions)
}

/**
 * Create mock API response (admin format)
 */
export function createMockResponse(data: any, code = 200, message = 'success') {
  return {
    data: {
      code,
      message,
      data
    },
    status: code === 200 ? 200 : 400,
    statusText: code === 200 ? 'OK' : 'Bad Request',
    headers: {
      'content-type': 'application/json'
    },
    config: {},
    request: {}
  }
}

/**
 * Create mock API error (admin format)
 */
export function createMockError(message: string, code = 500, statusText = 'Internal Server Error') {
  const error = new Error(message)
  ;(error as any).response = {
    data: {
      code,
      message,
      data: null
    },
    status: code,
    statusText,
    headers: {},
    config: {}
  }
  ;(error as any).isAxiosError = true
  return error
}

/**
 * Mock API calls for admin testing
 */
export function mockApiResponse(url: string, data: any, method = 'get') {
  return {
    url,
    data,
    method
  }
}

/**
 * Create a mock store instance with admin state
 */
export function createMockStore(initialState = {}) {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

/**
 * Create mock admin user
 */
export function createMockUser(overrides = {}) {
  return {
    id: 1,
    username: 'admin',
    realName: 'Administrator',
    email: 'admin@example.com',
    role: 'admin',
    roles: ['admin'],
    permissions: ['all'],
    avatar: '/avatar.jpg',
    status: 1,
    createTime: '2023-01-01 00:00:00',
    ...overrides
  }
}

/**
 * Create mock module data
 */
export function createMockModule(overrides = {}) {
  return {
    id: 1,
    name: 'User Management',
    path: '/users',
    component: 'users/index',
    icon: 'user',
    sort: 1,
    status: 1,
    createTime: '2023-01-01 00:00:00',
    ...overrides
  }
}

/**
 * Create mock menu data
 */
export function createMockMenu(overrides = {}) {
  return {
    id: 1,
    name: 'User Management',
    path: '/users',
    component: 'users/index',
    icon: 'user',
    sort: 1,
    parentId: null,
    children: [],
    meta: {
      title: 'User Management',
      icon: 'user',
      hidden: false
    },
    ...overrides
  }
}

/**
 * Create mock table data
 */
export function createMockTableData(count = 10, overrides = {}) {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `Item ${index + 1}`,
    status: index % 2 === 0 ? 1 : 0,
    createTime: '2023-01-01 00:00:00',
    updateTime: '2023-01-01 00:00:00',
    ...overrides
  }))
}

/**
 * Create mock form data
 */
export function createMockFormData(overrides = {}) {
  return {
    name: 'Test Item',
    description: 'Test description',
    status: 1,
    sort: 1,
    ...overrides
  }
}

/**
 * Create mock pagination data
 */
export function createMockPagination(overrides = {}) {
  return {
    current: 1,
    size: 10,
    total: 100,
    pages: 10,
    ...overrides
  }
}

/**
 * Wait for next Vue tick
 */
export function nextTick(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

/**
 * Create mock event
 */
export function createMockEvent(type: string, options = {}) {
  return {
    type,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    target: {
      value: '',
      checked: false,
      files: [],
      ...options
    },
    ...options
  }
}

/**
 * Create mock file for file upload tests
 */
export function createMockFile(name = 'test.jpg', size = 1024, type = 'image/jpeg') {
  const file = new File(['test'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

/**
 * Helper to test async operations
 */
export async function waitForAsync() {
  await new Promise(resolve => setTimeout(resolve, 100))
}

/**
 * Clean up after tests
 */
export function cleanupTest() {
  vi.clearAllMocks()
  vi.resetModules()
}

/**
 * Test wrapper for admin components that need authentication
 */
export function mountAdminComponent<T extends Component>(
  component: T,
  user = createMockUser(),
  options: MountingOptions<any> = {}
) {
  // Mock localStorage to simulate authenticated admin user
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn((key: string) => {
        if (key === 'user') return JSON.stringify(user)
        if (key === 'token') return 'mock-admin-token'
        return null
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    },
    writable: true
  })

  return mountComponent(component, options)
}

/**
 * Test wrapper for components that need specific route params
 */
export function mountWithRouteParams<T extends Component>(
  component: T,
  params: Record<string, any> = {},
  options: MountingOptions<any> = {}
) {
  const mergedOptions = {
    ...options,
    global: {
      ...options.global,
      mocks: {
        ...options.global?.mocks,
        $route: {
          params,
          query: {},
          path: '/',
          name: 'test',
          fullPath: '/',
          matched: [],
          meta: {},
          redirectedFrom: undefined
        }
      }
    }
  }

  return mountComponent(component, mergedOptions)
}

/**
 * Test wrapper for table components
 */
export function mountTableComponent<T extends Component>(
  component: T,
  tableData = createMockTableData(),
  options: MountingOptions<any> = {}
) {
  const mergedOptions = {
    ...options,
    props: {
      data: tableData,
      ...options.props
    }
  }

  return mountComponent(component, mergedOptions)
}

/**
 * Test wrapper for form components
 */
export function mountFormComponent<T extends Component>(
  component: T,
  formData = createMockFormData(),
  options: MountingOptions<any> = {}
) {
  const mergedOptions = {
    ...options,
    props: {
      model: formData,
      ...options.props
    }
  }

  return mountComponent(component, mergedOptions)
}

/**
 * Setup complete admin mock environment for E2E tests
 */
export async function mockAdminApi(page: any): Promise<void> {
  // Mock admin login API
  await page.route('**/admin/login', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        msg: '登录成功',
        token: 'mock-admin-jwt-token'
      })
    })
  })

  // Mock admin session API
  await page.route('**/admin/session', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        data: {
          id: 1,
          username: 'admin',
          realName: 'Administrator',
          role: 'admin'
        }
      })
    })
  })

  // Mock admin modules API
  await page.route('**/admin/modules/**', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        data: [{
          id: 1,
          name: '用户管理',
          path: '/yonghu',
          component: 'yonghu/index'
        }]
      })
    })
  })
}

/**
 * Seed admin session data
 */
export async function seedAdminSession(page: any): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem('admin-token', 'mock-admin-jwt-token')
    localStorage.setItem('admin-user', JSON.stringify({
      id: 1,
      username: 'admin',
      realName: 'Administrator',
      role: 'admin'
    }))
  })
}

/**
 * Login as admin user
 */
export async function loginAsAdmin(page: any): Promise<void> {
  const loginPage = new (await import('../page-objects/admin-pages')).AdminLoginPage(page)
  await loginPage.goto()
  await loginPage.login('admin', '123456')
}

/**
 * Navigate to admin module
 */
export async function navigateToModule(page: any, moduleName: string): Promise<void> {
  const modulePaths: Record<string, string> = {
    users: '#/index/yonghu',
    courses: '#/index/jianshenkecheng',
    coaches: '#/index/jianshenjiaolian',
    bookings: '#/index/kechengyuyue',
    memberships: '#/index/huiyuanka'
  }

  const path = modulePaths[moduleName] || '#/index/home'
  await page.goto(path)
  await page.waitForLoadState('networkidle')
}