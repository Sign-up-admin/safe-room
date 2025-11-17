import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper, MountingOptions } from '@vue/test-utils'
import { createRouter, createMemoryHistory, Router } from 'vue-router'
import { createPinia, Pinia, setActivePinia } from 'pinia'
import { createApp, App, defineComponent, h } from 'vue'
import type { Component } from 'vue'
import { createMockUser } from './test-helpers'

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
        'el-table-column': {
          name: 'ElTableColumn',
          props: {
            type: { type: String, default: 'default' },
            label: String,
            prop: String,
            width: [String, Number]
          },
          setup(props: any, { slots }: any) {
            return () => {
              // 如果有默认插槽，调用它并传递作用域参数
              if (slots.default) {
                const slotContent = slots.default({
                  row: {},
                  column: props,
                  $index: 0
                })
                return h('div', { class: 'el-table-column' }, slotContent)
              }
              return h('col', { style: { width: props.width + 'px' } })
            }
          }
        },
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
        'el-table-column': {
          name: 'ElTableColumn',
          props: {
            type: { type: String, default: 'default' },
            label: String,
            prop: String,
            width: [String, Number]
          },
          setup(props: any, { slots }: any) {
            return () => {
              // 如果有默认插槽，调用它并传递作用域参数
              if (slots.default) {
                const slotContent = slots.default({
                  row: {},
                  column: props,
                  $index: 0
                })
                return h('div', { class: 'el-table-column' }, slotContent)
              }
              return h('col', { style: { width: props.width + 'px' } })
            }
          }
        },
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
  },

  /**
   * 断言表格数据正确渲染
   */
  assertTableDataRendered: (wrapper: VueWrapper, data: any[]) => {
    const table = wrapper.findComponent({ name: 'ElTable' })
    expect(table.exists()).toBe(true)
    expect(table.props('data')).toEqual(data)
  },

  /**
   * 断言作用域插槽正确调用
   */
  assertScopedSlotCalled: (slotMock: any, expectedProps: Record<string, any>) => {
    expect(slotMock).toHaveBeenCalledWith(expectedProps)
  }
}

/**
 * 创建表格测试环境
 */
export function createTableTestEnvironment(tableData: any[] = []) {
  return {
    tableData,
    mountWithTableData: (component: Component, options: MountingOptions<any> = {}) =>
      mountComponent(component, {
        ...options,
        global: {
          ...options.global,
          stubs: {
            ...options.global?.stubs,
            'el-table': {
              name: 'ElTable',
              props: { data: { type: Array, default: () => tableData } },
              template: '<table class="el-table"><tbody><slot /></tbody></table>'
            }
          }
        }
      }),
    createMockData: (count = 3, template?: Partial<any>) => {
      const defaultTemplate = {
        id: (i: number) => i + 1,
        name: (i: number) => `Item ${i + 1}`,
        status: (i: number) => ['active', 'inactive', 'pending'][i % 3]
      }
      const mergedTemplate = { ...defaultTemplate, ...template }
      return Array.from({ length: count }, (_, i) => {
        const item: any = {}
        Object.entries(mergedTemplate).forEach(([key, value]) => {
          item[key] = typeof value === 'function' ? value(i) : value
        })
        return item
      })
    }
  }
}

/**
 * 表格组件专用挂载函数
 */
export function mountTableComponent<T extends Component>(
  component: T,
  tableData: any[] = [],
  options: MountingOptions<any> = {}
): VueWrapper {
  return mountComponent(component, {
    ...options,
    global: {
      ...options.global,
      stubs: {
        ...options.global?.stubs,
        'el-table': {
          name: 'ElTable',
          props: { data: { type: Array, default: () => tableData } },
          template: '<table class="el-table"><tbody><slot /></tbody></table>'
        }
      }
    }
  })
}

/**
 * 组件Wrapper工厂配置接口
 */
export interface ComponentWrapperConfig {
  /** 是否使用路由 */
  useRouter?: boolean
  /** 是否使用Pinia */
  usePinia?: boolean
  /** 是否启用Element Plus */
  useElementPlus?: boolean
  /** 自定义路由配置 */
  routes?: any[]
  /** 自定义插件 */
  plugins?: any[]
  /** 全局mocks */
  mocks?: Record<string, any>
  /** 组件stubs */
  stubs?: Record<string, any>
  /** 是否为Admin组件 */
  isAdmin?: boolean
  /** 是否需要认证 */
  authenticated?: boolean
}

/**
 * 通用组件Wrapper工厂函数
 * 根据配置自动创建合适的测试环境
 */
export function createComponentWrapper<T extends Component>(
  component: T,
  config: ComponentWrapperConfig = {}
): VueWrapper {
  const {
    useRouter = false,
    usePinia = false,
    useElementPlus = true,
    routes = [],
    plugins = [],
    mocks = {},
    stubs = {},
    isAdmin = false,
    authenticated = false
  } = config

  // 基础挂载选项
  const mountOptions: MountingOptions<any> = {
    global: {
      plugins: [],
      mocks: {},
      stubs: {}
    }
  }

  // 配置路由
  if (useRouter) {
    const router = createTestRouter(routes)
    mountOptions.global!.plugins!.push(router)
  }

  // 配置Pinia
  if (usePinia) {
    const pinia = createTestPinia()
    mountOptions.global!.plugins!.push(pinia)
  }

  // 配置Element Plus (默认启用)
  if (useElementPlus) {
    mountOptions.global!.stubs = {
      ...mountOptions.global!.stubs,
      ...elementPlusMocks
    }
  }

  // 添加自定义插件
  mountOptions.global!.plugins!.push(...plugins)

  // 合并mocks
  mountOptions.global!.mocks = {
    ...mountOptions.global!.mocks,
    ...mocks
  }

  // 合并stubs
  mountOptions.global!.stubs = {
    ...mountOptions.global!.stubs,
    ...stubs
  }

  // 如果是Admin组件，应用Admin特定的配置
  if (isAdmin) {
    return createAdminComponentWrapper(component, mountOptions, authenticated)
  }

  return mount(component, mountOptions)
}

/**
 * Admin组件专用Wrapper工厂
 */
function createAdminComponentWrapper<T extends Component>(
  component: T,
  baseOptions: MountingOptions<any>,
  authenticated = false
): VueWrapper {
  // Admin路由配置
  const adminRoutes = [
    { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
    { path: '/login', name: 'login', component: { template: '<div>Login</div>' } },
    { path: '/dashboard', name: 'dashboard', component: { template: '<div>Dashboard</div>' } },
    { path: '/users', name: 'users', component: { template: '<div>Users</div>' } },
    { path: '/settings', name: 'settings', component: { template: '<div>Settings</div>' } },
    { path: '/modules', name: 'modules', component: { template: '<div>Modules</div>' } },
    { path: '/logs', name: 'logs', component: { template: '<div>Logs</div>' } }
  ]

  // Admin特定的mocks
  const adminMocks = {
    $t: (key: string) => key,
    $tc: (key: string) => key,
    $te: (key: string) => true,
    $tm: (key: string) => ({}),
    $rt: (key: string) => key,
    $d: (value: any) => value,
    $n: (value: any) => String(value),
    $hasPermission: (permission: string) => true,
    $hasRole: (role: string) => true,
    $getUserInfo: () => createMockUser(),
    $getToken: () => 'mock-admin-token'
  }

  // 合并Admin配置
  const adminOptions: MountingOptions<any> = {
    ...baseOptions,
    global: {
      ...baseOptions.global,
      plugins: [
        ...(baseOptions.global?.plugins || []),
        createTestRouter(adminRoutes),
        createTestPinia()
      ],
      mocks: {
        ...baseOptions.global?.mocks,
        ...adminMocks
      },
      stubs: {
        ...baseOptions.global?.stubs,
        // Admin layout组件
        'index-header': true,
        'index-aside': true,
        'index-main': true,
        'tags-view': true,
        'breadcrumb': true,
        'svg-icon': true
      }
    }
  }

  // 如果需要认证，设置localStorage
  if (authenticated) {
    setupAuthenticatedStorage()
  }

  return mount(component, adminOptions)
}

/**
 * 设置认证状态的localStorage mock
 */
function setupAuthenticatedStorage() {
  const adminUser = {
    id: 1,
    username: 'admin',
    realName: 'Administrator',
    email: 'admin@example.com',
    role: 'admin',
    roles: ['admin'],
    permissions: ['all'],
    avatar: '/avatar.jpg',
    status: 1,
    createTime: '2023-01-01 00:00:00'
  }

  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn((key: string) => {
        if (key === 'user') return JSON.stringify(adminUser)
        if (key === 'token') return 'mock-admin-jwt-token'
        return null
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    },
    writable: true
  })
}

/**
 * 表单组件专用Wrapper工厂
 */
export function createFormWrapper<T extends Component>(
  component: T,
  formData: any = {},
  config: ComponentWrapperConfig = {}
): VueWrapper {
  return createComponentWrapper(component, {
    ...config,
    props: {
      model: formData,
      ...config.props
    }
  })
}

/**
 * 表格组件专用Wrapper工厂
 */
export function createTableWrapper<T extends Component>(
  component: T,
  tableData: any[] = [],
  config: ComponentWrapperConfig = {}
): VueWrapper {
  return createComponentWrapper(component, {
    ...config,
    props: {
      data: tableData,
      ...config.props
    },
    stubs: {
      ...config.stubs,
      'el-table': {
        name: 'ElTable',
        props: { data: { type: Array, default: () => tableData } },
        template: '<table class="el-table"><tbody><slot /></tbody></table>'
      }
    }
  })
}

/**
 * 对话框组件专用Wrapper工厂
 */
export function createDialogWrapper<T extends Component>(
  component: T,
  visible = true,
  config: ComponentWrapperConfig = {}
): VueWrapper {
  return createComponentWrapper(component, {
    ...config,
    props: {
      modelValue: visible,
      ...config.props
    }
  })
}

/**
 * 快速创建不同类型组件的Wrapper
 */
export const ComponentWrappers = {
  /** 基础组件 */
  basic: <T extends Component>(component: T, config?: ComponentWrapperConfig) =>
    createComponentWrapper(component, config),

  /** Admin组件 */
  admin: <T extends Component>(component: T, config?: ComponentWrapperConfig) =>
    createComponentWrapper(component, { ...config, isAdmin: true }),

  /** 已认证的Admin组件 */
  authenticated: <T extends Component>(component: T, config?: ComponentWrapperConfig) =>
    createComponentWrapper(component, { ...config, isAdmin: true, authenticated: true }),

  /** 表单组件 */
  form: <T extends Component>(component: T, formData?: any, config?: ComponentWrapperConfig) =>
    createFormWrapper(component, formData, config),

  /** 表格组件 */
  table: <T extends Component>(component: T, tableData?: any[], config?: ComponentWrapperConfig) =>
    createTableWrapper(component, tableData, config),

  /** 对话框组件 */
  dialog: <T extends Component>(component: T, visible?: boolean, config?: ComponentWrapperConfig) =>
    createDialogWrapper(component, visible, config)
}

/**
 * Mock创建器配置接口
 */
export interface MockCreatorConfig {
  /** 是否创建Element Plus mock */
  elementPlus?: boolean
  /** 是否创建Admin特定的mock */
  admin?: boolean
  /** 是否创建认证状态 */
  authenticated?: boolean
  /** 自定义mocks */
  customMocks?: Record<string, any>
  /** 自定义stubs */
  customStubs?: Record<string, any>
}

/**
 * 统一Mock创建器
 * 根据配置自动创建各种类型的mock
 */
export function createUnifiedMocks(config: MockCreatorConfig = {}) {
  const {
    elementPlus = true,
    admin = false,
    authenticated = false,
    customMocks = {},
    customStubs = {}
  } = config

  const mocks: Record<string, any> = {}
  const stubs: Record<string, any> = {}

  // Element Plus mocks
  if (elementPlus) {
    Object.assign(mocks, elementPlusMocks)
  }

  // Admin特定的mocks
  if (admin) {
    Object.assign(mocks, {
      $t: (key: string) => key,
      $tc: (key: string) => key,
      $te: (key: string) => true,
      $tm: (key: string) => ({}),
      $rt: (key: string) => key,
      $d: (value: any) => value,
      $n: (value: any) => String(value),
      $hasPermission: (permission: string) => true,
      $hasRole: (role: string) => true,
      $getUserInfo: () => createMockUser(),
      $getToken: () => 'mock-admin-token'
    })

    // Admin layout组件stubs
    Object.assign(stubs, {
      'index-header': true,
      'index-aside': true,
      'index-main': true,
      'tags-view': true,
      'breadcrumb': true,
      'svg-icon': true
    })
  }

  // 认证状态
  if (authenticated) {
    setupAuthenticatedStorage()
  }

  // 自定义mocks和stubs
  Object.assign(mocks, customMocks)
  Object.assign(stubs, customStubs)

  return { mocks, stubs }
}

/**
 * 快速Mock创建器
 */
export const MockCreators = {
  /** 基础mock (只包含Element Plus) */
  basic: (config?: MockCreatorConfig) => createUnifiedMocks({ ...config, elementPlus: true }),

  /** Admin mock */
  admin: (config?: MockCreatorConfig) => createUnifiedMocks({ ...config, elementPlus: true, admin: true }),

  /** 已认证的Admin mock */
  authenticated: (config?: MockCreatorConfig) => createUnifiedMocks({
    ...config,
    elementPlus: true,
    admin: true,
    authenticated: true
  }),

  /** 自定义mock */
  custom: (config: MockCreatorConfig) => createUnifiedMocks(config)
}

/**
 * API Mock创建器
 */
export function createApiMocks(baseUrl = '/api') {
  return {
    // 用户相关API
    users: {
      list: `${baseUrl}/users`,
      create: `${baseUrl}/users`,
      update: `${baseUrl}/users/:id`,
      delete: `${baseUrl}/users/:id`,
      detail: `${baseUrl}/users/:id`
    },

    // 模块相关API
    modules: {
      list: `${baseUrl}/modules`,
      create: `${baseUrl}/modules`,
      update: `${baseUrl}/modules/:id`,
      delete: `${baseUrl}/modules/:id`,
      detail: `${baseUrl}/modules/:id`
    },

    // 认证相关API
    auth: {
      login: `${baseUrl}/login`,
      logout: `${baseUrl}/logout`,
      refresh: `${baseUrl}/refresh`,
      session: `${baseUrl}/session`
    }
  }
}

/**
 * 数据Mock创建器
 */
export function createDataMocks() {
  return {
    // 用户数据
    users: (count = 5) => Array.from({ length: count }, (_, i) => createMockUser({
      id: i + 1,
      username: `user${i + 1}`,
      email: `user${i + 1}@example.com`
    })),

    // 表格数据
    tableData: (count = 10, template?: any) => {
      const defaultTemplate = {
        id: (i: number) => i + 1,
        name: (i: number) => `Item ${i + 1}`,
        status: (i: number) => ['active', 'inactive', 'pending'][i % 3],
        createTime: '2023-01-01 00:00:00'
      }
      const mergedTemplate = { ...defaultTemplate, ...template }
      return Array.from({ length: count }, (_, i) => {
        const item: any = {}
        Object.entries(mergedTemplate).forEach(([key, value]) => {
          item[key] = typeof value === 'function' ? value(i) : value
        })
        return item
      })
    },

    // 表单数据
    formData: (overrides = {}) => ({
      name: 'Test Item',
      description: 'Test description',
      status: 1,
      sort: 1,
      ...overrides
    }),

    // 分页数据
    pagination: (overrides = {}) => ({
      current: 1,
      size: 10,
      total: 100,
      pages: 10,
      ...overrides
    }),

    // 菜单数据
    menus: (count = 3) => Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `Menu ${i + 1}`,
      path: `/menu${i + 1}`,
      icon: 'menu',
      sort: i + 1,
      children: []
    })),

    // 模块数据
    modules: (count = 3) => Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `Module ${i + 1}`,
      path: `/module${i + 1}`,
      component: `module${i + 1}/index`,
      icon: 'module',
      sort: i + 1,
      status: 1
    }))
  }
}

/**
 * 组合Mock创建器
 * 同时创建多种类型的mock
 */
export function createCombinedMocks(config: {
  api?: boolean
  data?: boolean
  elementPlus?: boolean
  admin?: boolean
  authenticated?: boolean
  customMocks?: Record<string, any>
  customStubs?: Record<string, any>
} = {}) {
  const {
    api = false,
    data = false,
    elementPlus = true,
    admin = false,
    authenticated = false,
    customMocks = {},
    customStubs = {}
  } = config

  const result: any = {}

  if (api) result.api = createApiMocks()
  if (data) result.data = createDataMocks()
  if (elementPlus || admin || authenticated) {
    const { mocks, stubs } = createUnifiedMocks({ elementPlus, admin, authenticated, customMocks, customStubs })
    result.mocks = mocks
    result.stubs = stubs
  }

  return result
}