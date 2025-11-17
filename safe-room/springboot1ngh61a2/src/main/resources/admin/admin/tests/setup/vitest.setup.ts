import { beforeAll, afterEach, afterAll, vi } from 'vitest'

// Type declarations for global objects
declare global {
  interface Window {
    jQuery?: any
    $?: any
    RotateVerify?: any
    VerifyPlugin?: any
    createMockScript?: (src: string, onload?: (() => void) | null, onerror?: OnErrorEventHandler | null) => HTMLScriptElement
    mockJQuery?: () => void
    mockElementPlus?: () => any
  }
}

// Mock sessionStorage
const sessionStorageMock = (() => {
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
  }
})()

// Mock localStorage
const localStorageMock = (() => {
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
})()

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

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:8081/',
    origin: 'http://localhost:8081',
    protocol: 'http:',
    host: 'localhost:8081',
    hostname: 'localhost',
    port: '8081',
    pathname: '/',
    search: '',
    hash: ''
  },
  writable: true
})

// Mock import.meta.url
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      url: 'file:///mock/path/'
    }
  },
  writable: true
})

// Ensure window and document objects are available
if (typeof window === 'undefined') {
  (globalThis as any).window = globalThis
}

if (typeof document === 'undefined') {
  (globalThis as any).document = {
    createElement: vi.fn((tag: string) => ({
      tagName: tag.toUpperCase(),
      style: {},
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn(),
        toggle: vi.fn()
      },
      setAttribute: vi.fn(),
      getAttribute: vi.fn(),
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      querySelector: vi.fn(),
      querySelectorAll: vi.fn(() => []),
      readyState: 'complete',
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn()
      },
      head: {
        appendChild: vi.fn()
      }
    })),
    createTextNode: vi.fn((text: string) => ({ textContent: text })),
    createDocumentFragment: vi.fn(() => ({
      appendChild: vi.fn()
    })),
    getElementById: vi.fn(),
    getElementsByTagName: vi.fn(() => []),
    getElementsByClassName: vi.fn(() => []),
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(() => []),
    readyState: 'complete'
  }
}

// Mock console methods to reduce noise
const originalConsole = { ...console }
beforeAll(() => {
  console.warn = vi.fn()
  console.error = vi.fn()
  console.log = vi.fn()
})

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
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
  takeRecords: vi.fn(() => [])
})) as any

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn().mockImplementation((cb: FrameRequestCallback) => setTimeout(cb, 16) as any)
global.cancelAnimationFrame = vi.fn().mockImplementation((id: number) => {
  clearTimeout(id)
})

// Mock performance
Object.defineProperty(window, 'performance', {
  value: {
    now: () => Date.now(),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn(() => []),
    getEntriesByType: vi.fn(() => []),
    timing: {
      navigationStart: Date.now(),
      loadEventEnd: Date.now(),
      domContentLoadedEventEnd: Date.now()
    },
    navigation: {
      type: 0,
      redirectCount: 0
    }
  },
  writable: true
})

// Mock navigator
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'vitest',
    platform: 'test',
    language: 'en-US',
    languages: ['en-US', 'en'],
    onLine: true,
    cookieEnabled: true,
    geolocation: {
      getCurrentPosition: vi.fn(),
      watchPosition: vi.fn(),
      clearWatch: vi.fn()
    },
    clipboard: {
      readText: vi.fn().mockResolvedValue(''),
      writeText: vi.fn().mockResolvedValue(undefined),
      read: vi.fn().mockResolvedValue([]),
      write: vi.fn().mockResolvedValue(undefined)
    }
  },
  writable: true
})

// Mock screen
Object.defineProperty(window, 'screen', {
  value: {
    width: 1920,
    height: 1080,
    availWidth: 1920,
    availHeight: 1040,
    colorDepth: 24,
    pixelDepth: 24
  },
  writable: true
})

// Mock document methods that might be missing
Object.defineProperty(document, 'fullscreenEnabled', {
  value: false,
  writable: true
})

Object.defineProperty(document, 'fullscreenElement', {
  value: null,
  writable: true
})

Object.defineProperty(document, 'exitFullscreen', {
  value: vi.fn().mockResolvedValue(undefined),
  writable: true
})

// Mock URL constructor if not available
if (typeof global.URL === 'undefined') {
  global.URL = class URL {
    constructor(url: string, base?: string) {
      this.href = url
      this.origin = 'http://localhost:8081'
      this.protocol = 'http:'
      this.host = 'localhost:8081'
      this.hostname = 'localhost'
      this.port = '8081'
      this.pathname = '/'
      this.search = ''
      this.hash = ''
    }
    href: string
    origin: string
    protocol: string
    host: string
    hostname: string
    port: string
    pathname: string
    search: string
    hash: string

    toString() {
      return this.href
    }
  } as any
}

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn().mockResolvedValue({ data: {} }),
      post: vi.fn().mockResolvedValue({ data: {} }),
      put: vi.fn().mockResolvedValue({ data: {} }),
      delete: vi.fn().mockResolvedValue({ data: {} }),
      patch: vi.fn().mockResolvedValue({ data: {} }),
      interceptors: {
        request: { use: vi.fn(), eject: vi.fn() },
        response: { use: vi.fn(), eject: vi.fn() }
      }
    })),
    get: vi.fn().mockResolvedValue({ data: {} }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
    patch: vi.fn().mockResolvedValue({ data: {} }),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() }
    }
  }
}))

// Mock DOMPurify
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((html) => html || ''),
    isValidAttribute: vi.fn(() => true)
  }
}))

// Mock echarts
vi.mock('echarts', () => ({
  init: vi.fn(() => ({
    setOption: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn(),
    on: vi.fn(),
    off: vi.fn()
  })),
  connect: vi.fn(),
  disconnect: vi.fn()
}))

// Mock print-js
vi.mock('print-js', () => ({
  default: vi.fn()
}))

// Mock Vue
vi.mock('vue', () => {
  const vueMock = {
    createApp: vi.fn(() => {
      const registeredComponents = new Map()
      return {
        use: vi.fn().mockReturnThis(),
        component: vi.fn((name: string, component?: any) => {
          if (component) {
            // Register component
            registeredComponents.set(name, component)
            return this
          } else {
            // Get component
            return registeredComponents.get(name)
          }
        }),
        directive: vi.fn().mockReturnThis(),
        provide: vi.fn().mockReturnThis(),
        config: {
          globalProperties: {},
          warnHandler: vi.fn(),
          errorHandler: vi.fn()
        },
        mount: vi.fn(() => ({
          $el: document.createElement('div'),
          $destroy: vi.fn()
        })),
        unmount: vi.fn()
      }
    }),
    ref: vi.fn((value: any) => ({ value })),
    reactive: vi.fn((obj: any) => obj),
    computed: vi.fn((fn: any) => ({ value: fn() })),
    watch: vi.fn(),
    watchEffect: vi.fn(),
    nextTick: vi.fn().mockResolvedValue(),
    onMounted: vi.fn(),
    onUnmounted: vi.fn(),
    onBeforeMount: vi.fn(),
    onBeforeUnmount: vi.fn(),
    onUpdated: vi.fn(),
    defineComponent: vi.fn((options: any) => options),
    defineAsyncComponent: vi.fn((loader: any) => ({ __asyncComponent: true, loader })),
    h: vi.fn(),
    resolveComponent: vi.fn(),
    resolveDirective: vi.fn(),
    openBlock: vi.fn(),
    createBlock: vi.fn(),
    createVNode: vi.fn(),
    createElementVNode: vi.fn(),
    createTextVNode: vi.fn(),
    createCommentVNode: vi.fn(),
    createElementBlock: vi.fn(),
    renderList: vi.fn(),
    renderSlot: vi.fn(),
    toDisplayString: vi.fn((val: any) => String(val)),
    normalizeClass: vi.fn(),
    normalizeStyle: vi.fn(),
    withCtx: vi.fn(),
    withDirectives: vi.fn(),
    withKeys: vi.fn(),
    withModifiers: vi.fn(),
    vShow: vi.fn(),
    vModelText: vi.fn(),
    vModelCheckbox: vi.fn(),
    vModelRadio: vi.fn(),
    vModelSelect: vi.fn(),
    vModelDynamic: vi.fn(),
    getCurrentInstance: vi.fn(() => ({ ctx: {} })),
    inject: vi.fn(),
    provide: vi.fn()
  }
  return vueMock
})

// Mock Vue Router
vi.mock('vue-router', () => ({
  createRouter: vi.fn(() => ({
    beforeEach: vi.fn(),
    afterEach: vi.fn(),
    push: vi.fn().mockResolvedValue(),
    replace: vi.fn().mockResolvedValue(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    isReady: vi.fn().mockResolvedValue(true)
  })),
  createWebHistory: vi.fn(),
  createWebHashHistory: vi.fn(),
  createMemoryHistory: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    destroy: vi.fn()
  })),
  useRouter: vi.fn(() => ({
    push: vi.fn().mockResolvedValue(),
    replace: vi.fn().mockResolvedValue(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    isReady: vi.fn().mockResolvedValue(true)
  })),
  useRoute: vi.fn(() => ({
    params: {},
    query: {},
    path: '/',
    name: 'home',
    fullPath: '/',
    hash: '',
    matched: [],
    meta: {},
    redirectedFrom: undefined
  })),
  RouterLink: {
    name: 'RouterLink',
    props: ['to'],
    template: '<a :href="to"><slot /></a>'
  },
  RouterView: {
    name: 'RouterView',
    template: '<div><slot /></div>'
  }
}))

// Global test setup
beforeAll(() => {
  // Setup global mocks that persist across tests
  mockJQuery()
  mockElementPlus()
})

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks()

  // Reset modules
  vi.resetModules()

  // Reset global jQuery state
  delete window.jQuery
  delete window.$
  delete window.RotateVerify

  // Reset document state (skip readyState in happy-dom)
  try {
    ;(document as any).readyState = 'complete'
  } catch {
    // Ignore in environments where readyState is read-only
  }
})

// Clean up after all tests
afterAll(() => {
  vi.restoreAllMocks()
  Object.assign(console, originalConsole)
})

// Helper functions for tests
global.createMockScript = (src: string, onload?: (() => void) | null, onerror?: OnErrorEventHandler | null) => {
  const script = document.createElement('script')
  script.src = src
  if (onload) script.onload = onload as any
  if (onerror) script.onerror = onerror
  return script
}

global.mockJQuery = () => {
  window.jQuery = window.$ = function(selector: any) {
    if (typeof selector === 'string' && selector.includes('<style')) {
      return {
        length: 1,
        css: vi.fn().mockReturnThis(),
        appendTo: vi.fn().mockReturnThis()
      }
    }
    return {
      length: selector ? 1 : 0,
      _css: {},
      selector: selector,
      css: function(prop: string, value?: string) {
        if (value !== undefined) {
          this._css[prop] = value
          return this
        }
        return this._css[prop] || ''
      },
      each: function(callback: (index: number, element: any) => void) {
        for (let i = 0; i < this.length; i++) {
          callback.call(this[i] || this, i, this[i] || this)
        }
        return this
      },
      appendTo: vi.fn().mockReturnThis(),
      prependTo: vi.fn().mockReturnThis(),
      addClass: vi.fn().mockReturnThis(),
      removeClass: vi.fn().mockReturnThis(),
      attr: vi.fn().mockReturnThis(),
      prop: vi.fn().mockReturnThis(),
      val: vi.fn().mockReturnValue(''),
      html: vi.fn().mockReturnThis(),
      text: vi.fn().mockReturnValue(selector || ''),
      find: vi.fn().mockReturnValue({ length: 0 }),
      parent: vi.fn().mockReturnValue({ length: 0 }),
      children: vi.fn().mockReturnValue({ length: 0 }),
      siblings: vi.fn().mockReturnValue({ length: 0 }),
      next: vi.fn().mockReturnValue({ length: 0 }),
      prev: vi.fn().mockReturnValue({ length: 0 }),
      first: vi.fn().mockReturnThis(),
      last: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      filter: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnValue(false),
      has: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      off: vi.fn().mockReturnThis(),
      trigger: vi.fn().mockReturnThis(),
      show: vi.fn().mockReturnThis(),
      hide: vi.fn().mockReturnThis(),
      toggle: vi.fn().mockReturnThis(),
      fadeIn: vi.fn().mockReturnThis(),
      fadeOut: vi.fn().mockReturnThis(),
      slideDown: vi.fn().mockReturnThis(),
      slideUp: vi.fn().mockReturnThis(),
      animate: vi.fn().mockReturnThis(),
      // jQuery插件支持
      RotateVerify: vi.fn().mockReturnThis(),
      VerifyPlugin: vi.fn().mockReturnThis()
    }
  }
  window.jQuery.fn = window.$.fn = {
    RotateVerify: vi.fn().mockReturnThis(),
    VerifyPlugin: vi.fn().mockReturnThis()
  }
  window.jQuery.extend = window.$.extend = Object.assign
  window.jQuery.isArray = Array.isArray
  window.jQuery.isFunction = (obj: any) => typeof obj === 'function'
  window.jQuery.isPlainObject = (obj: any) => obj && typeof obj === 'object' && obj.constructor === Object
}

global.mockElementPlus = () => {
  const components = {
    ElMenu: {
      name: 'ElMenu',
      props: { mode: { type: String, default: 'vertical' }, defaultActive: String },
      template: '<ul class="el-menu"><slot /></ul>'
    },
    ElMenuItem: {
      name: 'ElMenuItem',
      props: { index: { type: String, required: true } },
      template: '<li class="el-menu-item"><slot /></li>'
    },
    ElSubMenu: {
      name: 'ElSubMenu',
      props: { index: { type: String, required: true } },
      template: '<li class="el-submenu"><div class="el-submenu__title"><slot name="title" /></div><ul class="el-menu el-menu--inline"><slot /></ul></li>'
    },
    ElMenuItemGroup: {
      name: 'ElMenuItemGroup',
      template: '<li class="el-menu-item-group"><div class="el-menu-item-group__title"><slot name="title" /></slot></div><ul><slot /></ul></li>'
    },
    ElButton: {
      name: 'ElButton',
      props: { type: { type: String, default: 'default' }, size: String },
      template: '<button class="el-button" :class="[`el-button--${type}`, size ? `el-button--${size}` : ``]"><slot /></button>'
    },
    ElInput: {
      name: 'ElInput',
      props: { modelValue: String, placeholder: String },
      template: '<div class="el-input"><input :value="modelValue" :placeholder="placeholder" class="el-input__inner" /></div>'
    },
    ElTable: {
      name: 'ElTable',
      props: { data: { type: Array, default: () => [] } },
      template: '<table class="el-table"><thead class="el-table__header"><slot name="header" /></thead><tbody class="el-table__body"><slot /></tbody></table>'
    },
    ElTableColumn: {
      name: 'ElTableColumn',
      props: { prop: String, label: String, width: String },
      template: '<col :style="{ width }" />'
    },
    ElForm: {
      name: 'ElForm',
      props: { model: Object, rules: Object },
      template: '<form class="el-form"><slot /></form>'
    },
    ElFormItem: {
      name: 'ElFormItem',
      props: { label: String, prop: String },
      template: '<div class="el-form-item"><label v-if="label" class="el-form-item__label">{{ label }}</label><div class="el-form-item__content"><slot /></div></div>'
    },
    ElDialog: {
      name: 'ElDialog',
      props: { modelValue: Boolean, title: String },
      template: '<div v-if="modelValue" class="el-dialog__wrapper"><div class="el-dialog"><div class="el-dialog__header"><span class="el-dialog__title">{{ title }}</span></div><div class="el-dialog__body"><slot /></div></div></div>'
    },
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
      service: vi.fn(() => ({ close: vi.fn() }))
    },
    ElNotification: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn()
    }
  }

  return {
    install(app: any) {
      Object.entries(components).forEach(([name, component]) => {
        app.component(name, component)
        // Also register kebab-case versions
        const kebabCase = name.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()
        app.component(kebabCase, component)
      })
    },
    ...components
  }
}
