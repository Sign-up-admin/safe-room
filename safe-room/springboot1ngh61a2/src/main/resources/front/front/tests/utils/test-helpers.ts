import { mount, VueWrapper, MountingOptions } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import type { Component, ComponentPublicInstance } from 'vue'
import { Page, Route } from '@playwright/test'

// Mock data type interfaces
interface MockResponse<T = unknown> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
  config: Record<string, unknown>
  request: Record<string, unknown>
}

interface AxiosError extends Error {
  response?: MockResponse
  isAxiosError: boolean
}

interface MockUser {
  id: number
  username: string
  email: string
  role: string
  avatar: string
  createdAt: Date
}

interface MockBooking {
  id: number
  userId: number
  courseId: number
  bookingTime: Date
  status: string
  notes?: string
}

interface MockCourse {
  id: number
  name: string
  description: string
  price: number
  duration: number
  category: string
  instructor: string
  image: string
}

interface MockNotification {
  id: number
  userId: number
  title: string
  content: string
  type: string
  read: boolean
  createdAt: Date
}

// Routes for testing
const routes = [
  { path: '/', name: 'home', component: { name: 'Home', template: '<div>Home</div>' } },
  { path: '/login', name: 'login', component: { name: 'Login', template: '<div>Login</div>' } },
  { path: '/register', name: 'register', component: { name: 'Register', template: '<div>Register</div>' } },
  { path: '/dashboard', name: 'dashboard', component: { name: 'Dashboard', template: '<div>Dashboard</div>' } },
  { path: '/profile', name: 'profile', component: { name: 'Profile', template: '<div>Profile</div>' } },
  { path: '/courses', name: 'courses', component: { name: 'Courses', template: '<div>Courses</div>' } },
  { path: '/booking', name: 'booking', component: { name: 'Booking', template: '<div>Booking</div>' } }
]

/**
 * Create a test Vue application with common plugins
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
 * Mount a component with test-friendly defaults
 */
export function mountComponent<T extends Component>(
  component: T,
  options: MountingOptions<ComponentPublicInstance> = {}
): VueWrapper<ComponentPublicInstance> {
  const app = createTestApp()

  // Set active Pinia instance for stores
  setActivePinia(createPinia())

  // Default mounting options
  const defaultOptions: MountingOptions<ComponentPublicInstance> = {
    global: {
      plugins: [app],
      stubs: {
        // Common stubs for third-party components
        'el-button': true,
        'el-input': true,
        'el-table': true,
        'el-form': true,
        'el-dialog': true,
        'el-menu': true,
        'el-card': true,
        'el-select': true,
        'el-option': true,
        'el-pagination': true,
        'el-breadcrumb': true,
        'el-loading': true,
        'transition': true,
        'transition-group': true,
        'teleport': true
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
        $tm: (key: string) => ({}),
        $rt: (key: string) => key
      },
      ...options.global
    },
    ...options
  }

  return mount(component, defaultOptions)
}

/**
 * Create mock API response
 */
export function createMockResponse<T = unknown>(data: T, status = 200, statusText = 'OK'): MockResponse<T> {
  return {
    data,
    status,
    statusText,
    headers: {
      'content-type': 'application/json'
    },
    config: {},
    request: {}
  }
}

/**
 * Create mock API error
 */
export function createMockError(message: string, status = 500, statusText = 'Internal Server Error'): AxiosError {
  const error = new Error(message) as AxiosError
  error.response = {
    data: { message },
    status,
    statusText,
    headers: {},
    config: {}
  }
  error.isAxiosError = true
  return error
}

/**
 * Mock API calls for testing
 */
export function mockApiResponse(url: string, data: unknown, method = 'get') {
  // This would be used with the mocked axios instance
  return {
    url,
    data,
    method
  }
}

/**
 * Create a mock store instance
 */
export function createMockStore(initialState: Record<string, unknown> = {}) {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
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
export function createMockEvent(type: string, options: Record<string, unknown> = {}) {
  return {
    type,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    target: {
      value: '',
      checked: false,
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
 * Create mock user session
 */
export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  return {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    role: 'user',
    avatar: '/avatar.jpg',
    createdAt: new Date('2023-01-01'),
    ...overrides
  }
}

/**
 * Create mock booking data
 */
export function createMockBooking(overrides: Partial<MockBooking> = {}): MockBooking {
  return {
    id: 1,
    userId: 1,
    courseId: 1,
    bookingTime: new Date('2023-01-01T10:00:00'),
    status: 'confirmed',
    notes: 'Test booking',
    ...overrides
  }
}

/**
 * Create mock course data
 */
export function createMockCourse(overrides: Partial<MockCourse> = {}): MockCourse {
  return {
    id: 1,
    name: 'Test Course',
    description: 'Test course description',
    price: 100,
    duration: 60,
    category: 'fitness',
    instructor: 'Test Instructor',
    image: '/course.jpg',
    ...overrides
  }
}

/**
 * Create mock notification data
 */
export function createMockNotification(overrides: Partial<MockNotification> = {}): MockNotification {
  return {
    id: 1,
    userId: 1,
    title: 'Test Notification',
    content: 'Test notification content',
    type: 'info',
    read: false,
    createdAt: new Date(),
    ...overrides
  }
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
  // Clear any global state
  vi.clearAllMocks()
  vi.resetModules()
}

/**
 * Test wrapper for components that need authentication
 */
export function mountAuthenticatedComponent<T extends Component>(
  component: T,
  user = createMockUser(),
  options: MountingOptions<ComponentPublicInstance> = {}
) {
  // Mock localStorage to simulate authenticated user
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn((key: string) => key === 'user' ? JSON.stringify(user) : null),
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
  params: Record<string, string | number> = {},
  options: MountingOptions<ComponentPublicInstance> = {}
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
 * Setup complete front-end mock environment for E2E tests
 */
export async function setupCompleteFrontMock(page: Page): Promise<void> {
  // Mock login API
  await page.route('**/yonghu/login', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        msg: '登录成功',
        token: 'mock-jwt-token-for-testing'
      })
    })
  })

  // Mock registration API
  await page.route('**/yonghu/register', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        msg: '注册成功'
      })
    })
  })

  // Mock user session API
  await page.route('**/yonghu/session', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        data: {
          id: 1,
          yonghuzhanghao: 'testuser',
          yonghuxingming: '测试用户',
          shoujihaoma: '13800138000'
        }
      })
    })
  })

  // Mock course APIs
  await page.route('**/jianshenkecheng/**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        data: [{
          id: 1,
          kechengmingcheng: '测试课程',
          jiage: '100',
          shichang: '60分钟'
        }]
      })
    })
  })

  // Mock booking APIs
  await page.route('**/kechengyuyue/**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        msg: '预约成功'
      })
    })
  })

  // Mock file upload API
  await page.route('**/file/upload', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        data: '/uploads/avatar.jpg'
      })
    })
  })
}

/**
 * Mock captcha for testing
 */
export async function mockCaptcha(page: any): Promise<void> {
  // Mock captcha verification - always return success
  await page.route('**/captcha/**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        valid: true
      })
    })
  })

  // Also mock any captcha images
  await page.route('**/captcha/image/**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'image/png',
      body: Buffer.from('fake-image-data')
    })
  })
}

/**
 * Simulate network delay
 */
export async function simulateNetworkDelay(page: any, delayMs: number): Promise<void> {
  await page.route('**/api/**', async (route: Route) => {
    await new Promise(resolve => setTimeout(resolve, delayMs))
    await route.continue()
  })
}

/**
 * Simulate network error
 */
export async function simulateNetworkError(page: any, statusCode = 500): Promise<void> {
  await page.route('**/api/**', async (route: Route) => {
    await route.fulfill({
      status: statusCode,
      contentType: 'application/json',
      body: JSON.stringify({
        code: statusCode,
        msg: '网络错误'
      })
    })
  })
}

/**
 * Mock front-end API endpoints (alias for setupCompleteFrontMock)
 */
export const mockFrontApi = setupCompleteFrontMock

/**
 * Seed front-end session data
 */
export async function seedFrontSession(page: Page): Promise<void> {
  // Set up authentication state
  await page.context().addCookies([{
    name: 'token',
    value: 'mock-jwt-token-for-testing',
    domain: '127.0.0.1',
    path: '/'
  }])

  // Mock session endpoint
  await page.route('**/yonghu/session', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        data: {
          id: 1,
          yonghuzhanghao: 'testuser',
          yonghuxingming: '测试用户',
          shoujihaoma: '13800138000'
        }
      })
    })
  })
}

/**
 * Mock payment flow for testing
 */
export async function mockPaymentFlow(page: any): Promise<void> {
  // Mock payment-related APIs
  await page.route('**/payment/**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        msg: '支付成功',
        data: {
          orderId: 'order_' + Date.now(),
          amount: 100,
          status: 'paid'
        }
      })
    })
  })

  // Mock membership purchase API
  await page.route('**/huiyuanka/**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 0,
        msg: '购买成功'
      })
    })
  })

  // Mock payment gateway (支付宝/微信等)
  await page.route('**/pay/**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<html><body>Payment Success</body></html>'
    })
  })
}