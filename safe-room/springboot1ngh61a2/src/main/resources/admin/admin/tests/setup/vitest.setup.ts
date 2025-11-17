import { beforeAll, afterEach, afterAll, vi } from 'vitest'
import { createIconsMock } from '../utils/mocks/element-plus.mock'
import ElementPlusMock from '../mocks/element-plus'

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

// Enhanced window mock for lifecycle testing
if (typeof window !== 'undefined') {
  // Ensure window has event listener methods
  if (!window.addEventListener) {
    window.addEventListener = vi.fn()
    window.removeEventListener = vi.fn()
    window.dispatchEvent = vi.fn()
  }

  // Mock window.innerWidth for responsive testing
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    value: 1200
  })

  // Mock window.innerHeight
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    value: 800
  })

  // Mock matchMedia for responsive design testing
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  })

  // Mock requestAnimationFrame and cancelAnimationFrame
  Object.defineProperty(window, 'requestAnimationFrame', {
    writable: true,
    value: vi.fn((callback: Function) => setTimeout(callback, 16))
  })

  Object.defineProperty(window, 'cancelAnimationFrame', {
    writable: true,
    value: vi.fn((id: number) => clearTimeout(id))
  })

  // Mock performance.now for timing tests
  if (!window.performance) {
    window.performance = {
      now: vi.fn(() => Date.now()),
      mark: vi.fn(),
      measure: vi.fn(),
      getEntriesByName: vi.fn(() => []),
      getEntriesByType: vi.fn(() => [])
    } as any
  }
}

// Ensure window and document objects are available
if (typeof window === 'undefined') {
  (globalThis as any).window = globalThis
}

if (typeof document === 'undefined') {
  // Create a proper body element mock
  const bodyElement = {
    tagName: 'BODY',
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(() => []),
    style: {},
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn(),
      toggle: vi.fn()
    }
  }

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
      readyState: 'complete'
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
    readyState: 'complete',
    body: bodyElement,
    head: {
      appendChild: vi.fn()
    }
  }
} else {
  // Ensure document.body exists even in Happy DOM
  if (!document.body) {
    document.body = {
      tagName: 'BODY',
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      querySelector: vi.fn(),
      querySelectorAll: vi.fn(() => []),
      style: {},
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn(),
        toggle: vi.fn()
      }
    } as any
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

// Global mocks for modules accessed via require() in tests
vi.mock('@/utils/storage', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    getObj: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn()
  }
}), { virtual: true })

vi.mock('@/utils/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}), { virtual: true })

vi.mock('@/stores/tagsView', () => ({
  useTagsViewStore: () => ({
    delAllViews: vi.fn()
  })
}), { virtual: true })

// Mock @element-plus/icons-vue using unified mock factory functions
vi.mock('@element-plus/icons-vue', async () => {
  const { createIconsMock } = await import('../utils/mocks/element-plus.mock')
  const icons = createIconsMock()
  return {
    ...icons,
    // Default export for dynamic imports
    default: icons
  }
})

// Mock element-plus using unified mock factory functions
vi.mock('element-plus', async () => {
  const {
    createElementPlusMock,
    createComponentMocks,
    createServiceMocks
  } = await import('../utils/mocks/element-plus.mock')

  const elementPlusMock = createElementPlusMock()
  const componentMocks = createComponentMocks()
  const serviceMocks = createServiceMocks()

  return {
    default: elementPlusMock,
    ...elementPlusMock,
    ...componentMocks,
    ...serviceMocks
  }
})

// Mock @vueup/vue-quill
vi.mock('@vueup/vue-quill', () => ({
  QuillEditor: {
    name: 'QuillEditor',
    props: {
      content: String,
      options: Object,
      disabled: Boolean
    },
    template: '<div class="quill-editor"><div ref="editor" v-html="content"></div></div>',
    mounted() {
      this.$refs.editor.innerHTML = this.content || ''
    }
  }
}))

// Mock js-md5
vi.mock('js-md5', () => ({
  default: vi.fn((str: string) => `md5-${str}`),
  md5: vi.fn((str: string) => `md5-${str}`)
}))

// Mock echarts-wordcloud
vi.mock('echarts-wordcloud', () => ({
  default: vi.fn()
}))

// Mock quill
vi.mock('quill', () => ({
  default: class Quill {
    constructor(container: HTMLElement, options?: any) {
      this.container = container
      this.options = options || {}
      this.content = ''
    }
    container: HTMLElement
    options: any
    content: string

    setContents(delta: any) {
      this.content = delta
    }

    getContents() {
      return this.content
    }

    on(event: string, handler: Function) {
      // Mock event handler
    }

    off(event: string, handler: Function) {
      // Mock event handler removal
    }

    focus() {
      // Mock focus
    }

    blur() {
      // Mock blur
    }

    destroy() {
      // Mock destroy
    }
  }
}))

// Mock @amap/amap-jsapi-loader
vi.mock('@amap/amap-jsapi-loader', () => ({
  default: {
    load: vi.fn().mockResolvedValue({
      Map: class MockMap {
        constructor(container: string | HTMLElement, opts?: any) {
          this.container = container
          this.opts = opts || {}
        }
        container: string | HTMLElement
        opts: any

        setZoom(zoom: number) {
          // Mock set zoom
        }

        setCenter(center: [number, number]) {
          // Mock set center
        }

        destroy() {
          // Mock destroy
        }
      },
      Marker: class MockMarker {
        constructor(opts?: any) {
          this.opts = opts || {}
        }
        opts: any

        setPosition(position: [number, number]) {
          // Mock set position
        }

        setMap(map: any) {
          // Mock set map
        }
      }
    })
  }
}))

// Note: Removed global Vue mock to allow real Vue component imports
// Vue mocking should be done per-test if needed

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

// Define mock functions
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
      selector,
      css: vi.fn().mockImplementation(function(prop: string, value?: string) {
        if (value === undefined) {
          return this._css[prop]
        }
        this._css[prop] = value
        return this
      }),
      each: vi.fn().mockImplementation(function(callback: Function) {
        if (this.length > 0) {
          callback.call(this, 0, this)
        }
        return this
      }),
      appendTo: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      off: vi.fn().mockReturnThis(),
      trigger: vi.fn().mockReturnThis(),
      animate: vi.fn().mockReturnThis(),
      show: vi.fn().mockReturnThis(),
      hide: vi.fn().mockReturnThis(),
      addClass: vi.fn().mockReturnThis(),
      removeClass: vi.fn().mockReturnThis(),
      toggleClass: vi.fn().mockReturnThis(),
      hasClass: vi.fn().mockReturnThis(),
      attr: vi.fn().mockImplementation(function(name: string, value?: any) {
        if (value === undefined) {
          return this._attributes?.[name]
        }
        this._attributes = this._attributes || {}
        this._attributes[name] = value
        return this
      }),
      prop: vi.fn().mockImplementation(function(name: string, value?: any) {
        if (value === undefined) {
          return this._properties?.[name]
        }
        this._properties = this._properties || {}
        this._properties[name] = value
        return this
      }),
      val: vi.fn().mockImplementation(function(value?: any) {
        if (value === undefined) {
          return this._value
        }
        this._value = value
        return this
      }),
      text: vi.fn().mockImplementation(function(text?: string) {
        if (text === undefined) {
          return this._text || ''
        }
        this._text = text
        return this
      }),
      html: vi.fn().mockImplementation(function(html?: string) {
        if (html === undefined) {
          return this._html || ''
        }
        this._html = html
        return this
      }),
      find: vi.fn().mockReturnValue({ length: 0 }),
      parent: vi.fn().mockReturnThis(),
      children: vi.fn().mockReturnValue({ length: 0 }),
      siblings: vi.fn().mockReturnValue({ length: 0 }),
      next: vi.fn().mockReturnValue({ length: 0 }),
      prev: vi.fn().mockReturnValue({ length: 0 }),
      first: vi.fn().mockReturnThis(),
      last: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      slice: vi.fn().mockReturnThis(),
      filter: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnValue(false),
      exists: vi.fn().mockReturnValue(true),
      ready: vi.fn().mockImplementation(function(callback: Function) {
        if (typeof callback === 'function') {
          callback()
        }
        return this
      }),
      extend: vi.fn().mockImplementation(function(target: any, ...sources: any[]) {
        return Object.assign(target, ...sources)
      }),
      RotateVerify: vi.fn().mockImplementation(function(options: any) {
        this.options = options
        return this
      }),
      VerifyPlugin: vi.fn().mockImplementation(function(options: any) {
        this.options = options
        return this
      })
    }
  }

  // Mock jQuery plugins
  window.jQuery.extend = vi.fn().mockImplementation((target: any, ...sources: any[]) => {
    return Object.assign(target, ...sources)
  })
}

global.mockElementPlus = () => {
  const mockComponents = ElementPlusMock
  const mockIcons = createIconsMock()

  return {
    ...mockComponents,
    ...mockIcons
  }
}

// Global test setup
beforeAll(() => {
  // Setup global mocks that persist across tests
  global.mockJQuery()
  global.mockElementPlus()
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
      props: {
        type: { type: String, default: 'default' },
        label: { type: [String, Number, Function, Object], default: '' },
        className: { type: String, default: '' },
        labelClassName: { type: String, default: '' },
        property: { type: String, default: '' },
        prop: { type: String, default: '' },
        width: { type: [String, Number], default: '' },
        minWidth: { type: [String, Number], default: '' },
        renderHeader: { type: Function, default: null },
        sortable: { type: [Boolean, String], default: false },
        sortMethod: { type: Function, default: null },
        sortBy: { type: [String, Array, Function], default: '' },
        resizable: { type: Boolean, default: true },
        columnKey: { type: [String, Number], default: '' },
        align: { type: String, default: 'left' },
        headerAlign: { type: String, default: '' },
        showTooltipWhenOverflow: { type: Boolean, default: false },
        showOverflowTooltip: { type: Boolean, default: false },
        fixed: { type: [Boolean, String], default: false },
        formatter: { type: Function, default: null },
        selectable: { type: Function, default: null },
        reserveSelection: { type: Boolean, default: false },
        filterMethod: { type: Function, default: null },
        filteredValue: { type: Array, default: () => [] },
        filters: { type: Array, default: () => [] },
        filterPlacement: { type: String, default: '' },
        filterMultiple: { type: Boolean, default: true },
        index: { type: [Number, Function], default: null },
        sortOrders: { type: Array, default: () => ['ascending', 'descending', null] }
      },
      setup(props, { slots }) {
        return () => {
          // 如果有默认插槽，调用它并传递作用域参数
          if (slots.default) {
            const slotContent = slots.default({
              row: {},
              column: props,
              $index: 0
            })
            return actual.h('div', { class: 'el-table-column' }, slotContent)
          }
          return actual.h('col', { style: { width: props.width + 'px' } })
        }
      }
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
    },
    // 扩展更多常用组件
    ElPagination: {
      name: 'ElPagination',
      props: {
        currentPage: { type: Number, default: 1 },
        pageSize: { type: Number, default: 10 },
        total: { type: Number, default: 0 },
        layout: { type: String, default: 'prev, pager, next' }
      },
      template: '<div class="el-pagination"><slot /></div>'
    },
    ElSelect: {
      name: 'ElSelect',
      props: {
        modelValue: [String, Number, Array],
        placeholder: String,
        multiple: Boolean,
        clearable: Boolean
      },
      template: '<div class="el-select"><div class="el-select__input"><input :value="modelValue" :placeholder="placeholder" /></div><slot /></div>'
    },
    ElOption: {
      name: 'ElOption',
      props: {
        label: [String, Number],
        value: [String, Number, Boolean],
        disabled: Boolean
      },
      template: '<div class="el-select-dropdown__item"><slot /></div>'
    },
    ElRadio: {
      name: 'ElRadio',
      props: {
        modelValue: [String, Number, Boolean],
        label: [String, Number, Boolean],
        disabled: Boolean,
        border: Boolean
      },
      template: '<label class="el-radio"><input type="radio" :checked="modelValue === label" :disabled="disabled" /><span class="el-radio__input"><span class="el-radio__inner"></span></span><span class="el-radio__label"><slot /></span></label>'
    },
    ElRadioGroup: {
      name: 'ElRadioGroup',
      props: {
        modelValue: [String, Number, Boolean],
        disabled: Boolean
      },
      template: '<div class="el-radio-group"><slot /></div>'
    },
    ElRadioButton: {
      name: 'ElRadioButton',
      props: {
        label: [String, Number, Boolean],
        disabled: Boolean
      },
      template: '<label class="el-radio-button"><input type="radio" /><span class="el-radio-button__inner"><slot /></span></label>'
    },
    ElCheckbox: {
      name: 'ElCheckbox',
      props: {
        modelValue: [Boolean, String, Number],
        label: [String, Number],
        disabled: Boolean,
        indeterminate: Boolean
      },
      template: '<label class="el-checkbox"><input type="checkbox" :checked="modelValue" :disabled="disabled" /><span class="el-checkbox__input"><span class="el-checkbox__inner"></span></span><span class="el-checkbox__label"><slot /></span></label>'
    },
    ElTag: {
      name: 'ElTag',
      props: {
        type: { type: String, default: 'primary' },
        size: String,
        closable: Boolean,
        disableTransitions: Boolean
      },
      template: '<span class="el-tag" :class="[`el-tag--${type}`, size ? `el-tag--${size}` : ``]"><slot /></span>'
    },
    ElCard: {
      name: 'ElCard',
      props: {
        shadow: { type: String, default: 'always' },
        bodyStyle: Object
      },
      template: '<div class="el-card"><div class="el-card__header" v-if="$slots.header"><slot name="header" /></div><div class="el-card__body"><slot /></div></div>'
    },
    ElAvatar: {
      name: 'ElAvatar',
      props: {
        size: { type: [Number, String], default: 'large' },
        src: String,
        icon: String
      },
      template: '<span class="el-avatar" :class="`el-avatar--${size}`"><img v-if="src" :src="src" /><i v-else-if="icon" :class="icon" /><slot /></span>'
    },
    ElBadge: {
      name: 'ElBadge',
      props: {
        value: [String, Number],
        max: Number,
        isDot: Boolean,
        hidden: Boolean,
        type: { type: String, default: 'danger' }
      },
      template: '<div class="el-badge"><slot /><sup v-if="!isDot && value" class="el-badge__content" :class="`el-badge__content--${type}`">{{ value > max ? `${max}+` : value }}</sup><sup v-else-if="isDot" class="el-badge__content el-badge__content--dot" :class="`el-badge__content--${type}`"></sup></div>'
    },
    ElInputNumber: {
      name: 'ElInputNumber',
      props: {
        modelValue: [Number, String],
        min: { type: Number, default: -Infinity },
        max: { type: Number, default: Infinity },
        step: { type: Number, default: 1 },
        precision: Number,
        disabled: Boolean
      },
      template: '<div class="el-input-number"><input type="number" :value="modelValue" :min="min" :max="max" :step="step" :disabled="disabled" /></div>'
    },
    ElDatePicker: {
      name: 'ElDatePicker',
      props: {
        modelValue: [Date, String, Array],
        type: { type: String, default: 'date' },
        placeholder: String,
        disabled: Boolean,
        clearable: Boolean
      },
      template: '<div class="el-date-picker"><input :value="modelValue" :placeholder="placeholder" :disabled="disabled" /></div>'
    },
    ElUpload: {
      name: 'ElUpload',
      props: {
        action: String,
        multiple: Boolean,
        limit: Number,
        accept: String,
        disabled: Boolean
      },
      template: '<div class="el-upload"><slot /></div>'
    },
    ElBreadcrumb: {
      name: 'ElBreadcrumb',
      props: {
        separator: { type: String, default: '/' }
      },
      template: '<div class="el-breadcrumb"><slot /></div>'
    },
    ElBreadcrumbItem: {
      name: 'ElBreadcrumbItem',
      template: '<span class="el-breadcrumb__item"><slot /></span>'
    },
    ElTabs: {
      name: 'ElTabs',
      props: {
        modelValue: [String, Number],
        type: { type: String, default: 'border-card' },
        closable: Boolean
      },
      template: '<div class="el-tabs"><div class="el-tabs__header"><slot name="header" /></div><div class="el-tabs__content"><slot /></div></div>'
    },
    ElTabPane: {
      name: 'ElTabPane',
      props: {
        label: [String, Number],
        name: [String, Number],
        disabled: Boolean
      },
      template: '<div class="el-tab-pane"><slot /></div>'
    },
    ElCollapse: {
      name: 'ElCollapse',
      props: {
        modelValue: [String, Number, Array],
        accordion: Boolean
      },
      template: '<div class="el-collapse"><slot /></div>'
    },
    ElCollapseItem: {
      name: 'ElCollapseItem',
      props: {
        name: [String, Number],
        title: String,
        disabled: Boolean
      },
      template: '<div class="el-collapse-item"><div class="el-collapse-item__header">{{ title }}</div><div class="el-collapse-item__wrap"><div class="el-collapse-item__content"><slot /></div></div></div>'
    },
    ElProgress: {
      name: 'ElProgress',
      props: {
        percentage: { type: Number, default: 0 },
        type: { type: String, default: 'line' },
        status: String,
        strokeWidth: { type: Number, default: 6 },
        textInside: Boolean,
        width: Number,
        showText: { type: Boolean, default: true }
      },
      template: '<div class="el-progress"><div class="el-progress-bar"><div class="el-progress-bar__outer"><div class="el-progress-bar__inner" :style="{ width: percentage + \'%\' }"></div></div></div><div v-if="showText" class="el-progress__text">{{ percentage }}%</div></div>'
    },
    ElRate: {
      name: 'ElRate',
      props: {
        modelValue: { type: Number, default: 0 },
        max: { type: Number, default: 5 },
        disabled: Boolean,
        allowHalf: Boolean
      },
      template: '<div class="el-rate"><slot /></div>'
    },
    ElSlider: {
      name: 'ElSlider',
      props: {
        modelValue: [Number, Array],
        min: { type: Number, default: 0 },
        max: { type: Number, default: 100 },
        step: { type: Number, default: 1 },
        disabled: Boolean
      },
      template: '<div class="el-slider"><slot /></div>'
    },
    ElSwitch: {
      name: 'ElSwitch',
      props: {
        modelValue: [Boolean, String, Number],
        disabled: Boolean,
        activeValue: { default: true },
        inactiveValue: { default: false }
      },
      template: '<div class="el-switch"><input type="checkbox" :checked="modelValue === activeValue" :disabled="disabled" /><span class="el-switch__core"><span class="el-switch__button"></span></span></div>'
    },
    ElTextarea: {
      name: 'ElTextarea',
      props: {
        modelValue: String,
        placeholder: String,
        rows: { type: Number, default: 2 },
        disabled: Boolean,
        maxlength: Number
      },
      template: '<div class="el-textarea"><textarea :value="modelValue" :placeholder="placeholder" :rows="rows" :disabled="disabled" :maxlength="maxlength" class="el-textarea__inner"></textarea></div>'
    },
    ElAutocomplete: {
      name: 'ElAutocomplete',
      props: {
        modelValue: String,
        placeholder: String,
        disabled: Boolean,
        clearable: Boolean
      },
      template: '<div class="el-autocomplete"><input :value="modelValue" :placeholder="placeholder" :disabled="disabled" /></div>'
    },
    ElCascader: {
      name: 'ElCascader',
      props: {
        modelValue: Array,
        options: { type: Array, default: () => [] },
        placeholder: String,
        disabled: Boolean,
        clearable: Boolean
      },
      template: '<div class="el-cascader"><input :value="modelValue" :placeholder="placeholder" :disabled="disabled" /></div>'
    },
    ElTree: {
      name: 'ElTree',
      props: {
        data: { type: Array, default: () => [] },
        props: Object,
        showCheckbox: Boolean,
        nodeKey: String,
        defaultExpandAll: Boolean
      },
      template: '<div class="el-tree"><slot /></div>'
    },
    ElTransfer: {
      name: 'ElTransfer',
      props: {
        modelValue: { type: Array, default: () => [] },
        data: { type: Array, default: () => [] },
        props: Object,
        titles: { type: Array, default: () => [] }
      },
      template: '<div class="el-transfer"><slot /></div>'
    },
    ElCalendar: {
      name: 'ElCalendar',
      props: {
        modelValue: [Date, String],
        range: Array
      },
      template: '<div class="el-calendar"><slot /></div>'
    },
    ElTimePicker: {
      name: 'ElTimePicker',
      props: {
        modelValue: [Date, String],
        placeholder: String,
        disabled: Boolean,
        clearable: Boolean
      },
      template: '<div class="el-time-picker"><input :value="modelValue" :placeholder="placeholder" :disabled="disabled" /></div>'
    },
    ElColorPicker: {
      name: 'ElColorPicker',
      props: {
        modelValue: String,
        disabled: Boolean,
        showAlpha: Boolean
      },
      template: '<div class="el-color-picker"><input type="color" :value="modelValue" :disabled="disabled" /></div>'
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

      // Register Element Plus directives
      app.directive('loading', {
        mounted(el: HTMLElement, binding: any) {
          if (binding.value) {
            el.style.position = el.style.position || 'relative'
            const loadingEl = document.createElement('div')
            loadingEl.className = 'el-loading-mask'
            loadingEl.innerHTML = `
              <div class="el-loading-spinner">
                <svg class="circular" viewBox="0 0 50 50">
                  <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5" stroke-miterlimit="10"/>
                </svg>
              </div>
            `
            el.appendChild(loadingEl)
          }
        },
        updated(el: HTMLElement, binding: any) {
          const mask = el.querySelector('.el-loading-mask')
          if (binding.value && !mask) {
            // Add loading mask
            const loadingEl = document.createElement('div')
            loadingEl.className = 'el-loading-mask'
            loadingEl.innerHTML = `
              <div class="el-loading-spinner">
                <svg class="circular" viewBox="0 0 50 50">
                  <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5" stroke-miterlimit="10"/>
                </svg>
              </div>
            `
            el.appendChild(loadingEl)
          } else if (!binding.value && mask) {
            // Remove loading mask
            mask.remove()
          }
        }
      })
    },
    ...components
  }
}
