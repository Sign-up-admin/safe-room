import { vi } from 'vitest'
import { config } from '@vue/test-utils'

type StorageRecord = Record<string, string>

class LocalStorageMock implements Storage {
  private store: StorageRecord = {}

  clear(): void {
    this.store = {}
  }

  getItem(key: string): string | null {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null
  }

  get length(): number {
    return Object.keys(this.store).length
  }

  removeItem(key: string): void {
    delete this.store[key]
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value)
  }
}

class SessionStorageMock implements Storage {
  private store: StorageRecord = {}

  clear(): void {
    this.store = {}
  }

  getItem(key: string): string | null {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null
  }

  get length(): number {
    return Object.keys(this.store).length
  }

  removeItem(key: string): void {
    delete this.store[key]
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value)
  }
}

// Mock browser APIs
Object.defineProperty(globalThis, 'localStorage', {
  value: new LocalStorageMock(),
  writable: false,
})

Object.defineProperty(globalThis, 'sessionStorage', {
  value: new SessionStorageMock(),
  writable: false,
})

// Mock window APIs
Object.defineProperty(globalThis, 'window', {
  value: {
    ...globalThis,
    localStorage: new LocalStorageMock(),
    sessionStorage: new SessionStorageMock(),
    location: {
      href: 'http://localhost:3000',
      origin: 'http://localhost:3000',
      pathname: '/',
      search: '',
      hash: '',
      hostname: 'localhost',
      port: '3000',
      protocol: 'http:',
    },
    navigator: {
      userAgent: 'vitest',
      platform: 'Node.js',
    },
    document: {
      createElement: vi.fn(() => ({
        style: {},
        setAttribute: vi.fn(),
        getAttribute: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
      querySelector: vi.fn(),
      querySelectorAll: vi.fn(),
      getElementById: vi.fn(),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
      head: {
        appendChild: vi.fn(),
      },
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    setTimeout: vi.fn((cb: Function) => setTimeout(cb, 0)),
    clearTimeout: vi.fn(),
    setInterval: vi.fn(),
    clearInterval: vi.fn(),
    requestAnimationFrame: vi.fn((cb: Function) => setTimeout(cb, 16)),
    cancelAnimationFrame: vi.fn(),
    matchMedia: vi.fn(() => ({
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
    getComputedStyle: vi.fn(() => ({})),
    scrollTo: vi.fn(),
    scrollBy: vi.fn(),
    alert: vi.fn(),
    confirm: vi.fn(),
    prompt: vi.fn(),
  },
  writable: true,
})

// Mock globalThis for better compatibility
Object.defineProperty(globalThis, 'globalThis', {
  value: globalThis,
  writable: false,
})

// Mock ResizeObserver
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock IntersectionObserver
globalThis.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock fetch API
globalThis.fetch = vi.fn()

// Mock URL APIs
globalThis.URL = class URL {
  constructor(public href: string) {}
  toString() { return this.href }
}

globalThis.URLSearchParams = class URLSearchParams {
  private params: Map<string, string> = new Map()

  constructor(init?: string | Record<string, string>) {
    if (typeof init === 'string') {
      // Simple parsing for test purposes
      const pairs = init.replace('?', '').split('&')
      pairs.forEach(pair => {
        const [key, value] = pair.split('=')
        if (key) this.params.set(decodeURIComponent(key), decodeURIComponent(value || ''))
      })
    } else if (init) {
      Object.entries(init).forEach(([key, value]) => {
        this.params.set(key, String(value))
      })
    }
  }

  get(key: string): string | null {
    return this.params.get(key) || null
  }

  set(key: string, value: string): void {
    this.params.set(key, value)
  }

  toString(): string {
    return Array.from(this.params.entries())
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&')
  }
}

// Mock performance API
globalThis.performance = {
  now: () => Date.now(),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByName: vi.fn(() => []),
  getEntriesByType: vi.fn(() => []),
}

// Mock console methods for cleaner test output
const originalConsole = { ...console }
vi.spyOn(console, 'log').mockImplementation(() => {})
vi.spyOn(console, 'warn').mockImplementation(() => {})
vi.spyOn(console, 'error').mockImplementation(() => {})

// Restore console on test failure for debugging
const restoreConsole = () => {
  Object.assign(console, originalConsole)
}

afterEach(() => {
  restoreConsole()
})

// Configure Vue Test Utils
config.global.stubs = {
  transition: false,
  'transition-group': false,
  teleport: true,
}

// Configure global plugins if needed
config.global.plugins = []

