import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper, MountingOptions } from '@vue/test-utils'
import { createRouter, createMemoryHistory, Router } from 'vue-router'
import { createPinia, Pinia, setActivePinia } from 'pinia'
import { createApp, App } from 'vue'
import type { Component } from 'vue'

/**
 * Vue组件测试辅助函数
 */

// 全局mock存储
const mockStorage = (() => {
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

/**
 * 创建测试用的Vue应用实例
 */
export function createTestApp(component?: Component, options: MountingOptions<any> = {}): App {
  const app = createApp(component || { template: '<div>test</div>' })

  // 设置全局属性
  app.config.globalProperties = {
    $storage: mockStorage,
    ...options.global?.config?.globalProperties
  }

  return app
}

/**
 * 创建测试用的路由实例
 */
export function createTestRouter(routes: any[] = []): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes: routes.length > 0 ? routes : [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/login', component: { template: '<div>Login</div>' } },
      { path: '/home', component: { template: '<div>Home</div>' } }
    ]
  })
}

/**
 * 创建测试用的状态管理实例
 */
export function createTestPinia(): Pinia {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

/**
 * 挂载Vue组件的增强版本
 */
export function mountComponent<T extends Component>(
  component: T,
  options: MountingOptions<any> = {}
): VueWrapper {
  const defaultOptions: MountingOptions<any> = {
    global: {
      plugins: [],
      mocks: {
        $storage: mockStorage
      },
      stubs: {
        'el-button': { template: '<button><slot /></button>' },
        'el-input': { template: '<input />' },
        'el-table': { template: '<table><slot /></table>' },
        'el-table-column': { template: '<col />' },
        'el-form': { template: '<form><slot /></form>' },
        'el-form-item': { template: '<div><slot /></div>' },
        'el-dialog': { template: '<div><slot /></div>' },
        'el-menu': { template: '<ul><slot /></ul>' },
        'el-menu-item': { template: '<li><slot /></li>' },
        'el-submenu': { template: '<li><div><slot name="title" /></div><ul><slot /></ul></li>' },
        'el-menu-item-group': { template: '<li><div><slot name="title" /></div><ul><slot /></ul></li>' }
      }
    }
  }

  // 合并选项
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    global: {
      ...defaultOptions.global,
      ...options.global,
      plugins: [
        ...(defaultOptions.global?.plugins || []),
        ...(options.global?.plugins || [])
      ],
      mocks: {
        ...defaultOptions.global?.mocks,
        ...options.global?.mocks
      },
      stubs: {
        ...defaultOptions.global?.stubs,
        ...options.global?.stubs
      }
    }
  }

  return mount(component, mergedOptions)
}

/**
 * 创建带路由和状态管理的组件挂载选项
 */
export function createMountOptions(options: {
  routes?: any[]
  useRouter?: boolean
  usePinia?: boolean
  additionalPlugins?: any[]
  mocks?: Record<string, any>
  stubs?: Record<string, any>
} = {}): MountingOptions<any> {
  const {
    routes = [],
    useRouter = false,
    usePinia = false,
    additionalPlugins = [],
    mocks = {},
    stubs = {}
  } = options

  const plugins: any[] = []

  if (useRouter) {
    plugins.push(createTestRouter(routes))
  }

  if (usePinia) {
    plugins.push(createTestPinia())
  }

  plugins.push(...additionalPlugins)

  return {
    global: {
      plugins,
      mocks: {
        $storage: mockStorage,
        ...mocks
      },
      stubs: {
        'el-button': { template: '<button><slot /></button>' },
        'el-input': { template: '<input />' },
        'el-table': { template: '<table><slot /></table>' },
        'el-table-column': { template: '<col />' },
        'el-form': { template: '<form><slot /></form>' },
        'el-form-item': { template: '<div><slot /></div>' },
        'el-dialog': { template: '<div><slot /></div>' },
        'el-menu': { template: '<ul><slot /></ul>' },
        'el-menu-item': { template: '<li><slot /></li>' },
        'el-submenu': { template: '<li><div><slot name="title" /></div><ul><slot /></ul></li>' },
        'el-menu-item-group': { template: '<li><div><slot name="title" /></div><ul><slot /></ul></li>' },
        ...stubs
      }
    }
  }
}

/**
 * Element Plus组件mock辅助函数
 */
export const elementPlusMocks = {
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
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
    warning: vi.fn()
  }
}

/**
 * jQuery mock辅助函数
 */
export function createJQueryMock() {
  return function(selector: any) {
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
}

/**
 * 异步测试辅助函数
 */
export function waitForNextTick(wrapper: VueWrapper): Promise<void> {
  return new Promise(resolve => {
    wrapper.vm.$nextTick(() => {
      resolve()
    })
  })
}

/**
 * Mock工具函数
 */
export const mockUtils = {
  /**
   * Mock localStorage
   */
  localStorage: mockStorage,

  /**
   * Mock sessionStorage
   */
  sessionStorage: mockStorage,

  /**
   * Mock URL构造函数
   */
  createURL: (path: string) => ({
    href: `http://localhost:8081${path}`,
    pathname: path,
    origin: 'http://localhost:8081'
  }),

  /**
   * Mock import.meta.url
   */
  importMetaUrl: 'file:///mock/path/'
}

/**
 * 测试清理辅助函数
 */
export function cleanupTest(wrapper?: VueWrapper) {
  if (wrapper) {
    wrapper.unmount()
  }
  vi.clearAllMocks()
  vi.resetModules()
}

/**
 * 创建测试描述模板
 */
export function createTestSuite(name: string, tests: () => void) {
  describe(name, () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    afterEach(() => {
      vi.clearAllMocks()
    })

    tests()
  })
}

/**
 * 断言辅助函数
 */
export const testAssertions = {
  /**
   * 断言组件已正确渲染
   */
  assertComponentRendered: (wrapper: VueWrapper, selector?: string) => {
    expect(wrapper.exists()).toBe(true)
    if (selector) {
      expect(wrapper.find(selector).exists()).toBe(true)
    }
  },

  /**
   * 断言组件包含特定文本
   */
  assertComponentContainsText: (wrapper: VueWrapper, text: string) => {
    expect(wrapper.text()).toContain(text)
  },

  /**
   * 断言组件触发了特定事件
   */
  assertEventEmitted: (wrapper: VueWrapper, eventName: string, ...args: any[]) => {
    expect(wrapper.emitted(eventName)).toBeTruthy()
    if (args.length > 0) {
      expect(wrapper.emitted(eventName)?.[0]).toEqual(args)
    }
  },

  /**
   * 断言组件有正确的props
   */
  assertProps: (wrapper: VueWrapper, expectedProps: Record<string, any>) => {
    Object.entries(expectedProps).forEach(([key, value]) => {
      expect(wrapper.props(key)).toBe(value)
    })
  }
}
