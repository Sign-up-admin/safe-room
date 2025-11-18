/**
 * 单元测试共享配置
 *
 * 提取重复的mount配置和测试辅助函数，提升测试代码的可维护性
 */

import { mount, MountingOptions } from '@vue/test-utils'
import { createApp, type Component } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import ElementPlus from 'element-plus'

// ========== 默认路由配置 ==========

/**
 * 默认测试路由配置
 */
export const DEFAULT_ROUTES = [
  { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
  { path: '/login', name: 'login', component: { template: '<div>Login</div>' } },
  { path: '/register', name: 'register', component: { template: '<div>Register</div>' } },
  { path: '/dashboard', name: 'dashboard', component: { template: '<div>Dashboard</div>' } },
  { path: '/profile', name: 'profile', component: { template: '<div>Profile</div>' } },
  { path: '/courses', name: 'courses', component: { template: '<div>Courses</div>' } },
  { path: '/booking', name: 'booking', component: { template: '<div>Booking</div>' } }
]

// ========== 默认Stubs配置 ==========

/**
 * 常用的组件stubs
 */
export const COMMON_STUBS = {
  // Element Plus组件
  'el-button': true,
  'el-input': true,
  'el-form': true,
  'el-form-item': true,
  'el-select': true,
  'el-option': true,
  'el-table': true,
  'el-pagination': true,
  'el-dialog': true,
  'el-menu': true,
  'el-menu-item': true,
  'el-submenu': true,
  'el-card': true,
  'el-row': true,
  'el-col': true,
  'el-breadcrumb': true,
  'el-breadcrumb-item': true,
  'el-loading': true,
  'el-message': true,
  'el-notification': true,
  'el-drawer': true,
  'el-dropdown': true,
  'el-dropdown-menu': true,
  'el-dropdown-item': true,
  'el-tabs': true,
  'el-tab-pane': true,
  'el-collapse': true,
  'el-collapse-item': true,
  'el-alert': true,
  'el-badge': true,
  'el-avatar': true,
  'el-tag': true,
  'el-progress': true,
  'el-empty': true,
  'el-descriptions': true,
  'el-descriptions-item': true,
  'el-upload': true,
  'el-image': true,
  'el-date-picker': true,
  'el-time-picker': true,

  // Vue内置组件
  'transition': true,
  'transition-group': true,
  'teleport': true,
  'keep-alive': true,
  'suspense': true,

  // 第三方组件
  'router-link': true,
  'router-view': true
}

/**
 * 自定义组件stubs（需要模板的组件）
 */
export const CUSTOM_STUBS = {
  TechCard: {
    template: '<div class="tech-card" v-bind="$attrs"><slot /></div>',
    inheritAttrs: false
  },

  TechButton: {
    template: '<button class="tech-button tech-btn" @click="$emit(\'click\')" v-bind="$attrs"><slot /></button>',
    inheritAttrs: false
  },

  TechInput: {
    template: '<input class="tech-input" v-bind="$attrs" />',
    inheritAttrs: false
  },

  TechSelect: {
    template: '<select class="tech-select" v-bind="$attrs"><slot /></select>',
    inheritAttrs: false
  }
}

// ========== 默认Mocks配置 ==========

/**
 * 常用的全局mocks
 */
export const COMMON_MOCKS = {
  // Vue I18n mocks
  $t: (key: string) => key,
  $tc: (key: string) => key,
  $te: (key: string) => true,
  $tm: (key: string) => ({}),
  $rt: (key: string) => key,
  $d: (value: any) => value,
  $n: (value: any) => String(value),

  // Vue Router mocks
  $router: {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    currentRoute: {
      value: {
        path: '/',
        name: 'home',
        params: {},
        query: {},
        fullPath: '/',
        matched: [],
        meta: {}
      }
    }
  },

  $route: {
    params: {},
    query: {},
    path: '/',
    name: 'home',
    fullPath: '/',
    matched: [],
    meta: {},
    redirectedFrom: undefined
  }
}

// ========== 测试应用创建函数 ==========

/**
 * 创建测试Vue应用实例
 */
export function createTestApp() {
  const app = createApp({})
  const pinia = createPinia()
  const router = createRouter({
    history: createWebHistory(),
    routes: DEFAULT_ROUTES
  })

  app.use(pinia)
  app.use(router)
  app.use(ElementPlus)

  return app
}

/**
 * 创建测试Pinia实例
 */
export function createTestPinia() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

// ========== Mount选项创建函数 ==========

/**
 * 创建基础的mount选项
 */
export function createBaseMountOptions(options: MountingOptions<any> = {}): MountingOptions<any> {
  const app = createTestApp()

  return {
    global: {
      plugins: [app],
      stubs: {
        ...COMMON_STUBS,
        ...options.global?.stubs
      },
      mocks: {
        ...COMMON_MOCKS,
        ...options.global?.mocks
      },
      ...options.global
    },
    ...options
  }
}

/**
 * 创建带组件stubs的mount选项
 */
export function createMountOptionsWithStubs(
  componentStubs: Record<string, any> = {},
  options: MountingOptions<any> = {}
): MountingOptions<any> {
  return createBaseMountOptions({
    ...options,
    global: {
      ...options.global,
      stubs: {
        ...COMMON_STUBS,
        ...CUSTOM_STUBS,
        ...componentStubs,
        ...options.global?.stubs
      }
    }
  })
}

// ========== 组件包装器创建函数 ==========

/**
 * 创建组件包装器（高阶函数）
 */
export function createComponentWrapper<T extends Component>(
  ComponentClass: T,
  defaultOptions: MountingOptions<any> = {}
) {
  return (options: MountingOptions<any> = {}) => {
    const mergedOptions = createMountOptionsWithStubs(
      defaultOptions.global?.stubs || {},
      {
        ...defaultOptions,
        ...options,
        global: {
          ...defaultOptions.global,
          ...options.global
        }
      }
    )

    return mount(ComponentClass, mergedOptions)
  }
}

/**
 * 创建标准组件测试包装器
 */
export function createStandardComponentWrapper<T extends Component>(
  ComponentClass: T,
  componentStubs: Record<string, any> = {}
) {
  return createComponentWrapper(ComponentClass, {
    global: {
      stubs: componentStubs
    }
  })
}

// ========== 常用测试辅助函数 ==========

/**
 * 等待Vue nextTick
 */
export function nextTick(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

/**
 * 创建mock事件
 */
export function createMockEvent(type: string, options = {}) {
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
 * 创建mock文件
 */
export function createMockFile(
  name = 'test.jpg',
  size = 1024,
  type = 'image/jpeg'
) {
  const file = new File(['test'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

/**
 * 创建mock用户会话（localStorage）
 */
export function createMockUserSession(user: any = {}) {
  const defaultUser = {
    id: 1,
    username: 'testuser',
    name: '测试用户',
    phone: '13800138000',
    ...user
  }

  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn((key: string) => key === 'user' ? JSON.stringify(defaultUser) : null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    },
    writable: true
  })

  return defaultUser
}

/**
 * 清理测试状态
 */
export function cleanupTestState() {
  vi.clearAllMocks()
  vi.resetAllMocks()
  vi.restoreAllMocks()
}

// ========== 预设的组件配置 ==========

/**
 * 课程卡片组件的默认配置
 */
export const COURSE_CARD_CONFIG = {
  stubs: {
    TechCard: CUSTOM_STUBS.TechCard,
    TechButton: CUSTOM_STUBS.TechButton
  }
}

/**
 * 表单组件的默认配置
 */
export const FORM_CONFIG = {
  stubs: {
    TechInput: CUSTOM_STUBS.TechInput,
    TechSelect: CUSTOM_STUBS.TechSelect
  }
}

/**
 * 列表组件的默认配置
 */
export const LIST_CONFIG = {
  stubs: {
    TechCard: CUSTOM_STUBS.TechCard
  }
}
