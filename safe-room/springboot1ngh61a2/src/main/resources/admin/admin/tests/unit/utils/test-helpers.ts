// Test helpers for browser API mocks

// Mock sessionStorage for tests
export const createSessionStorageMock = () => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    },
  }
}

// Mock localStorage for tests
export const createLocalStorageMock = () => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    },
  }
}

// Setup browser APIs for tests
export const setupBrowserAPIs = () => {
  const sessionStorageMock = createSessionStorageMock()
  const localStorageMock = createLocalStorageMock()

  // Define window if not exists
  if (typeof window === 'undefined') {
    (global as any).window = {}
  }

  // Setup storage APIs
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
    writable: true,
  })

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  })

  Object.defineProperty(global, 'sessionStorage', {
    value: sessionStorageMock,
    writable: true,
  })

  Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true,
  })

  // Setup window.location
  if (!window.location) {
    window.location = {
      href: 'http://localhost:3000',
      hostname: 'localhost',
      pathname: '/',
      protocol: 'http:',
      search: '',
      hash: '',
    } as any
  }

  // Setup navigator
  if (typeof navigator === 'undefined') {
    (global as any).navigator = {
      userAgent: 'Mozilla/5.0 (Test Browser)',
      platform: 'test',
      language: 'en-US',
    }
  }

  // Setup document
  if (typeof document === 'undefined') {
    (global as any).document = {
      createElement: (tag: string) => ({
        tagName: tag.toUpperCase(),
        src: '',
        addEventListener: () => {},
        removeEventListener: () => {},
      }),
      body: {},
      head: {},
    }
  }

  // Setup ErrorEvent constructor
  if (typeof ErrorEvent === 'undefined') {
    (global as any).ErrorEvent = class ErrorEvent {
      type: string
      error: Error | null
      message: string
      filename?: string
      lineno?: number
      colno?: number

      constructor(type: string, options: any = {}) {
        this.type = type
        this.error = options.error || null
        this.message = options.message || ''
        this.filename = options.filename
        this.lineno = options.lineno
        this.colno = options.colno
      }
    }
  }

  // Setup timer functions
  if (!window.setTimeout) {
    window.setTimeout = setTimeout as any
  }
  if (!window.clearTimeout) {
    window.clearTimeout = clearTimeout as any
  }
  if (!window.setInterval) {
    window.setInterval = setInterval as any
  }
  if (!window.clearInterval) {
    window.clearInterval = clearInterval as any
  }

  return { sessionStorageMock, localStorageMock }
}
