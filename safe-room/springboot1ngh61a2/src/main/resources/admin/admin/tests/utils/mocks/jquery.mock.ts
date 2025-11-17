/**
 * jQuery Mock 工具
 * 提供完整的 jQuery 模拟实现
 */

import { vi } from 'vitest'

// jQuery 模拟对象的类型定义
export interface MockJQueryElement {
  length: number
  selector?: string
  _text?: string
  _css?: Record<string, string>
  [key: string]: any
}

// jQuery 模拟函数的类型定义
export interface MockJQueryFunction {
  (selector?: any): MockJQueryElement
  fn: Record<string, any>
  extend?: (target: any, ...sources: any[]) => any
  isArray?: (obj: any) => boolean
  isFunction?: (obj: any) => boolean
  isPlainObject?: (obj: any) => boolean
}

/**
 * 创建 jQuery 模拟对象
 */
export function createJQueryMock(): MockJQueryFunction {
  const jQueryMock: MockJQueryFunction = function(selector?: any): MockJQueryElement {
    // 处理样式标签创建
    if (typeof selector === 'string' && selector.includes('<style')) {
      return {
        length: 1,
        css: vi.fn().mockReturnThis(),
        appendTo: vi.fn().mockReturnThis()
      }
    }

    // 处理普通选择器
    return {
      length: selector ? 1 : 0,
      selector: selector,
      css: vi.fn().mockReturnThis(),
      appendTo: vi.fn().mockReturnThis(),
      prependTo: vi.fn().mockReturnThis(),
      addClass: vi.fn().mockReturnThis(),
      removeClass: vi.fn().mockReturnThis(),
      attr: vi.fn().mockReturnThis(),
      prop: vi.fn().mockReturnThis(),
      val: vi.fn().mockReturnValue(''),
      html: vi.fn().mockReturnThis(),
      text: function(content?: string) {
        if (content !== undefined) {
          this._text = content
          return this
        }
        return this._text || ''
      },
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
      animate: vi.fn().mockReturnThis()
    }
  }

  // 添加 jQuery 静态方法
  jQueryMock.fn = {}
  jQueryMock.extend = Object.assign
  jQueryMock.isArray = Array.isArray
  jQueryMock.isFunction = (obj: any) => typeof obj === 'function'
  jQueryMock.isPlainObject = (obj: any) => obj && typeof obj === 'object' && obj.constructor === Object

  return jQueryMock
}

/**
 * 安装 jQuery mock 到全局对象
 */
export function installJQueryMock() {
  const jQueryMock = createJQueryMock()
  ;(window as any).jQuery = jQueryMock
  ;(window as any).$ = jQueryMock
  return jQueryMock
}

/**
 * 卸载 jQuery mock
 */
export function uninstallJQueryMock() {
  delete (window as any).jQuery
  delete (window as any).$
}

/**
 * 创建 jQuery 插件 mock
 */
export function createJQueryPluginMock(pluginName: string, implementation?: any) {
  const mockPlugin = vi.fn().mockImplementation(implementation || function() {
    return this
  })

  // 将插件添加到 jQuery.fn
  if ((window as any).jQuery && (window as any).jQuery.fn) {
    ;(window as any).jQuery.fn[pluginName] = mockPlugin
  }

  return mockPlugin
}

/**
 * 创建 RotateVerify mock
 */
export function createRotateVerifyMock() {
  const RotateVerifyMock = vi.fn().mockImplementation(function(options: any) {
    this.options = options
    return this
  })

  ;(window as any).RotateVerify = RotateVerifyMock
  return RotateVerifyMock
}

/**
 * 默认导出一个配置好的 jQuery mock 环境
 */
export const jQueryTestEnvironment = {
  install: installJQueryMock,
  uninstall: uninstallJQueryMock,
  createPlugin: createJQueryPluginMock,
  createRotateVerify: createRotateVerifyMock,
  createMock: createJQueryMock
}

export default jQueryTestEnvironment
