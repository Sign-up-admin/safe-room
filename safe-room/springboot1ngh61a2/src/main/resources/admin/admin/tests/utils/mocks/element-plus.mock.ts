/**
 * Element Plus Mock 工具
 * 提供完整的 Element Plus 组件模拟实现
 */

import { vi } from 'vitest'

// Element Plus 组件的类型定义
export interface MockElementPlusComponent {
  name: string
  template?: string
  props?: Record<string, any>
  [key: string]: any
}

export interface MockElementPlusPlugin {
  install(app: any): void
  ElMenu?: MockElementPlusComponent
  ElMenuItem?: MockElementPlusComponent
  ElSubMenu?: MockElementPlusComponent
  ElMenuItemGroup?: MockElementPlusComponent
}

/**
 * 创建 Element Plus 组件 mock
 */
export function createElementPlusMock(): MockElementPlusPlugin {
  const components = {
    ElMenu: {
      name: 'ElMenu',
      template: '<ul><slot /></ul>',
      props: {
        defaultActive: { type: String, default: '' },
        mode: { type: String, default: 'vertical' }
      }
    },
    ElMenuItem: {
      name: 'ElMenuItem',
      template: '<li><slot /></li>',
      props: {
        index: { type: [String, Number], required: true }
      }
    },
    ElSubMenu: {
      name: 'ElSubMenu',
      template: '<li><div><slot name="title" /></div><ul><slot /></ul></li>',
      props: {
        index: { type: [String, Number], required: true }
      }
    },
    ElMenuItemGroup: {
      name: 'ElMenuItemGroup',
      template: '<li><div><slot name="title" /></div><ul><slot /></ul></li>',
      props: {
        title: { type: String, default: '' }
      }
    }
  }

  const plugin: MockElementPlusPlugin = {
    install(app: any) {
      // 注册 PascalCase 版本
      Object.entries(components).forEach(([name, component]) => {
        app.component(name, component)
      })

      // 注册 kebab-case 版本
      app.component('ElMenu', components.ElMenu)
      app.component('ElMenuItem', components.ElMenuItem)
      app.component('ElSubmenu', components.ElSubMenu)
      app.component('ElMenuItemGroup', components.ElMenuItemGroup)
    },
    ...components
  }

  return plugin
}

/**
 * 创建单个 Element Plus 组件 mock
 */
export function createComponentMock(componentName: string, template?: string, props?: Record<string, any>): MockElementPlusComponent {
  return {
    name: componentName,
    template: template || `<div><slot /></div>`,
    props: props || {},
    // 添加组件的其他方法
    setup: vi.fn(),
    render: vi.fn(),
    data: vi.fn(() => ({})),
    methods: {},
    computed: {},
    watch: {}
  }
}

/**
 * 创建菜单组件系列 mock
 */
export function createMenuComponentsMock() {
  return {
    ElMenu: createComponentMock('ElMenu', '<ul><slot /></ul>', {
      defaultActive: { type: String, default: '' },
      mode: { type: String, default: 'vertical' },
      collapse: { type: Boolean, default: false },
      backgroundColor: { type: String, default: '#ffffff' },
      textColor: { type: String, default: '#303133' },
      activeTextColor: { type: String, default: '#409EFF' }
    }),
    ElMenuItem: createComponentMock('ElMenuItem', '<li><slot /></li>', {
      index: { type: [String, Number], required: true },
      route: { type: [String, Object] },
      disabled: { type: Boolean, default: false }
    }),
    ElSubMenu: createComponentMock('ElSubMenu', '<li><div><slot name="title" /></div><ul><slot /></ul></li>', {
      index: { type: [String, Number], required: true },
      popperClass: { type: String, default: '' },
      disabled: { type: Boolean, default: false }
    }),
    ElMenuItemGroup: createComponentMock('ElMenuItemGroup', '<li><div><slot name="title" /></div><ul><slot /></ul></li>', {
      title: { type: String, default: '' }
    })
  }
}

/**
 * 创建表单组件系列 mock
 */
export function createFormComponentsMock() {
  return {
    ElInput: createComponentMock('ElInput', '<input><slot /></input>', {
      modelValue: { type: [String, Number], default: '' },
      placeholder: { type: String, default: '' },
      disabled: { type: Boolean, default: false },
      readonly: { type: Boolean, default: false }
    }),
    ElButton: createComponentMock('ElButton', '<button><slot /></button>', {
      type: { type: String, default: 'default' },
      size: { type: String, default: 'default' },
      disabled: { type: Boolean, default: false },
      loading: { type: Boolean, default: false }
    }),
    ElSelect: createComponentMock('ElSelect', '<select><slot /></select>', {
      modelValue: { type: [String, Number, Array], default: '' },
      placeholder: { type: String, default: '' },
      disabled: { type: Boolean, default: false }
    })
  }
}

/**
 * 安装 Element Plus mock 到 Vue 应用
 */
export function installElementPlusMock(app: any, options: { size?: string, zIndex?: number } = {}) {
  const mockPlugin = createElementPlusMock()
  app.use(mockPlugin, options)
  return mockPlugin
}

/**
 * 创建完整的 Element Plus mock 环境
 */
export function createElementPlusTestEnvironment() {
  const mockPlugin = createElementPlusMock()
  const menuComponents = createMenuComponentsMock()
  const formComponents = createFormComponentsMock()

  return {
    plugin: mockPlugin,
    menuComponents,
    formComponents,
    install: (app: any, options?: any) => installElementPlusMock(app, options),
    // 便捷方法
    createMenu: () => menuComponents,
    createForm: () => formComponents,
    createComponent: createComponentMock
  }
}

/**
 * 默认导出 Element Plus 测试环境
 */
export const elementPlusTestEnvironment = createElementPlusTestEnvironment()

export default elementPlusTestEnvironment
