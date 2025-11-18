import { beforeAll, afterAll, vi } from 'vitest'
import type { Component } from 'vue'
import type { MountingOptions } from '@vue/test-utils'
import type { Router } from 'vue-router'
import type { ComponentPublicInstance } from 'vue'

// Type declarations for global test helpers
declare global {
  function flushPromises(): Promise<void>
  function createWrapper(component: Component, options?: MountingOptions<Record<string, unknown>>): Promise<ComponentPublicInstance>
  function createMockStore(initialState?: Record<string, unknown>): Record<string, unknown>
  function createMockRouter(): Partial<Router>
  function createMockService(methods?: Record<string, unknown>): Record<string, unknown>
  function mockLocalStorage(data?: Record<string, string>): Record<string, string>
  function mockSessionStorage(data?: Record<string, string>): Record<string, string>
  function cleanupTestState(): void
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))


// Mock navigator.share
Object.defineProperty(navigator, 'share', {
  value: vi.fn().mockResolvedValue(undefined),
  writable: true
})

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue('')
  },
  writable: true
})

// Mock window.confirm and window.alert
Object.defineProperty(window, 'confirm', {
  value: vi.fn(() => true),
  writable: true
})

Object.defineProperty(window, 'alert', {
  value: vi.fn(),
  writable: true
})

// Mock window.prompt
Object.defineProperty(window, 'prompt', {
  value: vi.fn(() => 'test'),
  writable: true
})

// Mock console methods to avoid noise in tests
const originalConsole = { ...console }
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
  log: vi.fn(),
  table: vi.fn()
}

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn(() => []),
    getEntriesByType: vi.fn(() => [])
  },
  writable: true
})

// Mock requestAnimationFrame and cancelAnimationFrame
Object.defineProperty(window, 'requestAnimationFrame', {
  value: vi.fn((callback) => setTimeout(callback, 16)),
  writable: true
})

Object.defineProperty(window, 'cancelAnimationFrame', {
  value: vi.fn((id) => clearTimeout(id)),
  writable: true
})

// Mock setTimeout and setInterval for better test control
const originalSetTimeout = global.setTimeout
const originalSetInterval = global.setInterval
const originalClearTimeout = global.clearTimeout
const originalClearInterval = global.clearInterval

// Mock Element.scrollIntoView
Object.defineProperty(Element.prototype, 'scrollIntoView', {
  value: vi.fn(),
  writable: true
})

// Mock Element.getBoundingClientRect
Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
  value: vi.fn(() => ({
    width: 100,
    height: 100,
    top: 0,
    left: 0,
    bottom: 100,
    right: 100,
    x: 0,
    y: 0,
    toJSON: vi.fn()
  })),
  writable: true
})

// Mock HTMLElement.offsetWidth and offsetHeight
Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
  get: () => 100,
  configurable: true
})

Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
  get: () => 100,
  configurable: true
})

// Mock Storage API for tests
class MockStorage {
  data: Map<string, string>

  constructor() {
    this.data = new Map()
  }

  get length() {
    return this.data.size
  }

  key(index: number) {
    const keys = Array.from(this.data.keys())
    return keys[index] || null
  }

  getItem(key: string) {
    return this.data.get(key) || null
  }

  setItem(key: string, value: string) {
    this.data.set(key, String(value))
  }

  removeItem(key: string) {
    this.data.delete(key)
  }

  clear() {
    this.data.clear()
  }
}

// Make Storage constructor globally available
Object.defineProperty(global, 'Storage', {
  value: MockStorage,
  writable: true,
  configurable: true
})

// Create and assign storage instances
const localStorageInstance = new MockStorage()
const sessionStorageInstance = new MockStorage()

Object.defineProperty(global, 'localStorage', {
  value: localStorageInstance,
  writable: true,
  configurable: true
})

Object.defineProperty(global, 'sessionStorage', {
  value: sessionStorageInstance,
  writable: true,
  configurable: true
})

// Also make them available on window for compatibility
Object.defineProperty(window, 'localStorage', {
  value: localStorageInstance,
  writable: true,
  configurable: true
})

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageInstance,
  writable: true,
  configurable: true
})

// Mock ElementPlus components
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn().mockResolvedValue(true)
  },
  ElLoading: {
    service: vi.fn(() => ({
      close: vi.fn()
    }))
  }
}))

// Mock Vue Router
vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRouter: () => ({
      push: vi.fn().mockResolvedValue(undefined),
      replace: vi.fn().mockResolvedValue(undefined),
      go: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      isReady: vi.fn().mockResolvedValue(true)
    }),
    useRoute: () => ({
      params: {},
      query: {},
      path: '/',
      name: 'home',
      fullPath: '/',
      hash: '',
      matched: [],
      meta: {},
      redirectedFrom: undefined
    }),
    createRouter: vi.fn(() => ({
      beforeEach: vi.fn(),
      afterEach: vi.fn(),
      push: vi.fn().mockResolvedValue(undefined),
      replace: vi.fn().mockResolvedValue(undefined),
      go: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      isReady: vi.fn().mockResolvedValue(true)
    })),
    createWebHistory: vi.fn(),
    createWebHashHistory: vi.fn(),
    RouterLink: {
      name: 'RouterLink',
      props: ['to'],
      template: '<a :href="to"><slot /></a>'
    },
    RouterView: {
      name: 'RouterView',
      template: '<div><slot /></div>'
    }
  }
})

// Mock Vue I18n (if used)
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn((key) => key),
    tm: vi.fn((key) => key),
    te: vi.fn(() => true)
  }),
  createI18n: vi.fn()
}))

// Mock HTTP requests
vi.mock('@/common/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    request: vi.fn()
  }
}))

// Mock API services
vi.mock('@/services/crud', () => ({
  getModuleService: vi.fn(() => ({
    list: vi.fn(),
    detail: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }))
}))

// Mock Pinia stores (if used)
vi.mock('pinia', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    createPinia: vi.fn(() => ({
      use: vi.fn(),
      install: vi.fn()
    })),
    defineStore: vi.fn(),
    storeToRefs: vi.fn((store) => store),
    setActivePinia: vi.fn()
  }
})

// Mock Vue components that might cause issues
vi.mock('@/components/common', () => ({
  TechButton: {
    name: 'TechButton',
    props: ['size', 'variant', 'disabled'],
    template: '<button :class="`tech-button tech-button--${variant} tech-button--${size}`" :disabled="disabled"><slot /></button>'
  },
  TechCard: {
    name: 'TechCard',
    props: ['title', 'subtitle'],
    template: '<div class="tech-card"><div class="tech-card__title">{{ title }}</div><div class="tech-card__subtitle">{{ subtitle }}</div><slot /></div>'
  },
  SafeHtml: {
    name: 'SafeHtml',
    props: ['html'],
    template: '<div v-html="html"></div>'
  },
  TechStepper: {
    name: 'TechStepper',
    props: ['currentStep', 'steps'],
    template: '<div class="tech-stepper"><div v-for="(step, index) in steps" :key="index" :class="[`step-${index}`, { active: index === currentStep }]">{{ step.title }}</div></div>'
  }
}))

// Mock specific components that cause issues
vi.mock('@/components/NotificationCenter.vue', () => ({
  default: {
    name: 'NotificationCenter',
    template: '<div class="notification-center"><slot /></div>'
  }
}))

vi.mock('@/components/NotificationItem.vue', () => ({
  default: {
    name: 'NotificationItem',
    template: '<div class="notification-item"><slot /></div>'
  }
}))

vi.mock('@/components/NotificationSettings.vue', () => ({
  default: {
    name: 'NotificationSettings',
    template: '<div class="notification-settings"><slot /></div>'
  }
}))

vi.mock('@/components/NotificationToast.vue', () => ({
  default: {
    name: 'NotificationToast',
    template: '<div class="notification-toast"><slot /></div>'
  }
}))

// Mock assets
vi.mock('@/assets/touxiang.png', () => '/mock-avatar.png')
vi.mock('@/assets/logo.png', () => '/mock-logo.png')

// Mock axios for HTTP requests
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    request: vi.fn(),
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      request: vi.fn()
    }))
  }
}))

// Mock file and blob APIs
Object.defineProperty(window, 'File', {
  value: class MockFile {
    constructor(parts: unknown[], filename: string, options: { size?: number; type?: string; lastModified?: number } = {}) {
      this.name = filename
      this.size = options.size || 0
      this.type = options.type || ''
      this.lastModified = options.lastModified || Date.now()
    }
    name: string
    size: number
    type: string
    lastModified: number
  },
  writable: true
})

Object.defineProperty(window, 'FileReader', {
  value: class MockFileReader {
    onload: ((event: ProgressEvent<FileReader>) => void) | null = null
    onerror: ((event: ProgressEvent<FileReader>) => void) | null = null
    readAsDataURL = vi.fn(() => {
      if (this.onload) {
        this.onload({ target: { result: 'data:image/png;base64,mock' } })
      }
    })
    readAsText = vi.fn(() => {
      if (this.onload) {
        this.onload({ target: { result: 'mock content' } })
      }
    })
  },
  writable: true
})

// Mock URL APIs
global.URL = class URL {
  constructor(url: string) {
    this.href = url
  }
  href: string
  static createObjectURL = vi.fn(() => 'mock-url')
  static revokeObjectURL = vi.fn()
}

// Mock canvas API
Object.defineProperty(window.HTMLCanvasElement.prototype, 'getContext', {
  value: vi.fn(() => ({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    arc: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 10 }))
  }))
})

// Mock media devices
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: vi.fn(() => []),
      getVideoTracks: vi.fn(() => []),
      getAudioTracks: vi.fn(() => [])
    })
  },
  writable: true
})

// Helper functions for tests
global.flushPromises = () => new Promise(setImmediate)

// Vue Test Utils helper
global.createWrapper = async (component: Component, options: MountingOptions<Record<string, unknown>> = {}) => {
  const { mount } = await import('@vue/test-utils')
  return mount(component, {
    global: {
      stubs: {
        RouterLink: true,
        RouterView: true,
        ElButton: true,
        ElInput: true,
        ElForm: true,
        ElFormItem: true,
        ElCard: true,
        ElDialog: true,
        ElTable: true,
        ElTableColumn: true
      },
      directives: {
        loading: vi.fn()
      }
    },
    ...options
  })
}

// Test helper functions
global.createMockStore = (initialState: Record<string, any> = {}) => ({
  ...initialState,
  $subscribe: vi.fn(),
  $patch: vi.fn(),
  $reset: vi.fn()
})

global.createMockRouter = () => ({
  push: vi.fn().mockResolvedValue(undefined),
  replace: vi.fn().mockResolvedValue(undefined),
  go: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  isReady: vi.fn().mockResolvedValue(true),
  currentRoute: {
    value: {
      params: {},
      query: {},
      path: '/',
      name: 'home'
    }
  }
})

global.createMockService = (methods: Record<string, any> = {}) => ({
  list: vi.fn().mockResolvedValue({ list: [], total: 0 }),
  detail: vi.fn().mockResolvedValue({}),
  save: vi.fn().mockResolvedValue({}),
  update: vi.fn().mockResolvedValue({}),
  delete: vi.fn().mockResolvedValue({}),
  ...methods
})

global.mockLocalStorage = (data: Record<string, string> = {}) => {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn((key: string) => data[key] || null),
      setItem: vi.fn((key: string, value: string) => { data[key] = value }),
      removeItem: vi.fn((key: string) => { delete data[key] }),
      clear: vi.fn(() => { Object.keys(data).forEach(key => delete data[key]) }),
      key: vi.fn((index: number) => Object.keys(data)[index] || null),
      get length() { return Object.keys(data).length }
    },
    writable: true
  })
  return data
}

global.mockSessionStorage = (data: Record<string, string> = {}) => {
  Object.defineProperty(window, 'sessionStorage', {
    value: {
      getItem: vi.fn((key: string) => data[key] || null),
      setItem: vi.fn((key: string, value: string) => { data[key] = value }),
      removeItem: vi.fn((key: string) => { delete data[key] }),
      clear: vi.fn(() => { Object.keys(data).forEach(key => delete data[key]) }),
      key: vi.fn((index: number) => Object.keys(data)[index] || null),
      get length() { return Object.keys(data).length }
    },
    writable: true
  })
  return data
}

// Test cleanup helpers
global.cleanupTestState = () => {
  vi.clearAllMocks()
  vi.resetAllMocks()
  vi.restoreAllMocks()
}

// Global test setup
beforeAll(() => {
  // Set up global test environment
  console.log('Setting up test environment...')
})

afterAll(() => {
  // Clean up global test environment
  console.log('Cleaning up test environment...')
})
