/**
 * DOM API Mock 工具
 * 提供完整的 DOM API 模拟实现
 */

import { vi } from 'vitest'

// DOM 元素的类型定义
export interface MockElement {
  tagName: string
  className?: string
  id?: string
  innerHTML?: string
  textContent?: string
  style?: Record<string, string>
  attributes?: Record<string, string>
  children?: MockElement[]
  parentNode?: MockElement | null
  appendChild?: (child: MockElement) => MockElement
  removeChild?: (child: MockElement) => MockElement
  setAttribute?: (name: string, value: string) => void
  getAttribute?: (name: string) => string | null
  querySelector?: (selector: string) => MockElement | null
  querySelectorAll?: (selector: string) => MockElement[]
  addEventListener?: (event: string, handler: Function) => void
  removeEventListener?: (event: string, handler: Function) => void
  dispatchEvent?: (event: any) => boolean
  [key: string]: any
}

// 事件对象的类型定义
export interface MockEvent {
  type: string
  target?: MockElement
  currentTarget?: MockElement
  preventDefault?: () => void
  stopPropagation?: () => void
  [key: string]: any
}

/**
 * 创建 DOM 元素 mock
 */
export function createElementMock(tagName: string, attributes: Record<string, any> = {}): MockElement {
  const element: MockElement = {
    tagName: tagName.toUpperCase(),
    className: attributes.className || '',
    id: attributes.id || '',
    innerHTML: '',
    textContent: '',
    style: {},
    attributes: { ...attributes },
    children: [],
    parentNode: null,

    appendChild: vi.fn(function(child: MockElement) {
      this.children!.push(child)
      child.parentNode = this
      return child
    }),

    removeChild: vi.fn(function(child: MockElement) {
      const index = this.children!.indexOf(child)
      if (index > -1) {
        this.children!.splice(index, 1)
        child.parentNode = null
      }
      return child
    }),

    setAttribute: vi.fn(function(name: string, value: string) {
      this.attributes![name] = value
    }),

    getAttribute: vi.fn(function(name: string) {
      return this.attributes![name] || null
    }),

    querySelector: vi.fn(function(selector: string) {
      // 简单的选择器实现
      if (selector.startsWith('#')) {
        const id = selector.slice(1)
        return this.children!.find(child => child.id === id) || null
      }
      if (selector.startsWith('.')) {
        const className = selector.slice(1)
        return this.children!.find(child => child.className?.includes(className)) || null
      }
      return this.children!.find(child => child.tagName.toLowerCase() === selector) || null
    }),

    querySelectorAll: vi.fn(function(selector: string) {
      // 简单的选择器实现
      if (selector.startsWith('.')) {
        const className = selector.slice(1)
        return this.children!.filter(child => child.className?.includes(className))
      }
      return this.children!.filter(child => child.tagName.toLowerCase() === selector)
    }),

    addEventListener: vi.fn(),

    removeEventListener: vi.fn(),

    dispatchEvent: vi.fn(function(event: MockEvent) {
      // 简单的同步事件分发
      event.target = this
      event.currentTarget = this
      return true
    })
  }

  return element
}

/**
 * 创建事件对象 mock
 */
export function createEventMock(type: string, properties: Record<string, any> = {}): MockEvent {
  return {
    type,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    ...properties
  }
}

/**
 * 创建 script 元素 mock
 */
export function createScriptMock(src = '', attributes: Record<string, any> = {}): MockElement {
  const script = createElementMock('script', {
    src,
    async: false,
    defer: false,
    ...attributes
  })

  // Script 特有的属性
  script.onload = null
  script.onerror = null
  script.readyState = 'loaded'

  return script
}

/**
 * 创建 style 元素 mock
 */
export function createStyleMock(content = ''): MockElement {
  const style = createElementMock('style', {
    type: 'text/css'
  })
  style.innerHTML = content
  return style
}

/**
 * 创建 document.body mock
 */
export function createBodyMock(): MockElement {
  const body = createElementMock('body')
  body.appendChild = vi.fn(function(child: MockElement) {
    this.children!.push(child)
    child.parentNode = this
    return child
  })
  body.removeChild = vi.fn(function(child: MockElement) {
    const index = this.children!.indexOf(child)
    if (index > -1) {
      this.children!.splice(index, 1)
      child.parentNode = null
    }
    return child
  })
  return body
}

/**
 * 创建 document mock
 */
export function createDocumentMock() {
  const body = createBodyMock()

  return {
    body,
    head: createElementMock('head'),
    readyState: 'complete' as DocumentReadyState,

    createElement: vi.fn((tagName: string) => {
      if (tagName === 'div') {
        return createElementMock('div', {
          style: {},
          className: '',
          innerHTML: '',
          appendChild: vi.fn(),
          removeChild: vi.fn(),
          setAttribute: vi.fn(),
          getAttribute: vi.fn(),
          querySelector: vi.fn(),
          querySelectorAll: vi.fn(() => [])
        })
      }
      if (tagName === 'script') {
        return createScriptMock()
      }
      if (tagName === 'style') {
        return createStyleMock()
      }
      return createElementMock(tagName)
    }),

    querySelector: vi.fn((selector: string) => {
      if (selector === 'body') return body
      return null
    }),

    querySelectorAll: vi.fn(() => []),

    addEventListener: vi.fn(),

    dispatchEvent: vi.fn((event: any) => {
      event.target = document
      event.currentTarget = document
      return true
    }),

    getElementById: vi.fn((id: string) => 
      // 简单的 ID 查找实现
       body.querySelector!(`#${id}`)
    ),

    getElementsByTagName: vi.fn((tagName: string) => [body].filter(el => el.tagName.toLowerCase() === tagName.toLowerCase())),

    getElementsByClassName: vi.fn((className: string) => [body].filter(el => el.className?.includes(className)))
  }
}

/**
 * 创建 window mock
 */
export function createWindowMock() {
  return {
    location: {
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

    localStorage: {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      get length() { return 0 },
      key: vi.fn(() => null)
    },

    sessionStorage: {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    },

    matchMedia: vi.fn(() => ({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    })),

    ResizeObserver: vi.fn(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    })),

    IntersectionObserver: vi.fn(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn()
    })),

    requestAnimationFrame: vi.fn(cb => setTimeout(cb, 16)),
    cancelAnimationFrame: vi.fn(),

    performance: {
      now: () => Date.now(),
      mark: vi.fn(),
      measure: vi.fn(),
      getEntriesByName: vi.fn(() => []),
      getEntriesByType: vi.fn(() => [])
    }
  }
}

/**
 * 创建完整的 DOM 测试环境
 */
export function createDOMTestEnvironment() {
  const documentMock = createDocumentMock()
  const windowMock = createWindowMock()

  return {
    document: documentMock,
    window: windowMock,
    // 便捷方法
    createElement: createElementMock,
    createScript: createScriptMock,
    createStyle: createStyleMock,
    createEvent: createEventMock,
    createBody: createBodyMock,

    // 安装到全局
    install: () => {
      Object.assign(global.document, documentMock)
      Object.assign(global.window, windowMock)
    }
  }
}

/**
 * 默认导出 DOM 测试环境
 */
export const domTestEnvironment = createDOMTestEnvironment()

export default domTestEnvironment
