/**
 * 脚本加载顺序集成测试
 * 测试 jQuery 和依赖脚本的加载顺序问题
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock DOM API
const mockScriptElements: any[] = []
const mockEventListeners: Record<string, any> = {}

const originalCreateElement = document.createElement
const originalAddEventListener = document.addEventListener
const originalDispatchEvent = document.dispatchEvent

beforeEach(() => {
  // Mock document.createElement for script tags
  document.createElement = vi.fn((tagName: string) => {
    if (tagName === 'script') {
      const script = {
        src: '',
        async: false,
        onload: null as any,
        onerror: null as any,
        parentNode: null,
        remove: vi.fn()
      }
      mockScriptElements.push(script)
      return script
    }
    return originalCreateElement.call(document, tagName)
  })

  // Mock document.addEventListener
  document.addEventListener = vi.fn((event: string, handler: any) => {
    mockEventListeners[event] = handler
  })

  // Mock document.dispatchEvent
  document.dispatchEvent = vi.fn((event: any) => {
    const handler = mockEventListeners[event.type]
    if (handler) {
      handler(event)
    }
  })

  // Reset global state
  delete window.jQuery
  delete window.$
  delete window.RotateVerify

  // Mock setTimeout
  vi.useFakeTimers()
})

afterEach(() => {
  // Restore original functions
  document.createElement = originalCreateElement
  document.addEventListener = originalAddEventListener
  document.dispatchEvent = originalDispatchEvent

  // Clear mocks
  mockScriptElements.length = 0
  Object.keys(mockEventListeners).forEach(key => delete mockEventListeners[key])

  // Clear global state
  delete window.jQuery
  delete window.$
  delete window.RotateVerify

  vi.useRealTimers()
})

describe('Script Loading Integration Tests', () => {

  it('should load jQuery before dependent scripts', () => {
    // 模拟脚本加载逻辑（从 index.html 中提取）
    function loadDependentScripts() {
      if (typeof window.jQuery === 'undefined' || typeof window.$ === 'undefined') {
        setTimeout(loadDependentScripts, 10)
        return
      }

      const scripts = ['/verifys/yz.js', '/verifys/verify.js']
      scripts.forEach((src: string) => {
        const script = document.createElement('script')
        script.src = src
        script.async = false
        document.body.appendChild(script)
      })
    }

    // 初始状态：jQuery 未加载
    expect(typeof window.jQuery).toBe('undefined')
    expect(typeof window.$).toBe('undefined')

    // 开始加载依赖脚本
    loadDependentScripts()

    // 10ms 后，仍然没有创建脚本标签（因为 jQuery 未加载）
    vi.advanceTimersByTime(10)
    expect(mockScriptElements.length).toBe(0)

    // 模拟 jQuery 加载完成
    window.jQuery = window.$ = { version: '3.4.1' }

    // 再次调用（模拟下一次检查）
    loadDependentScripts()

    // 现在应该创建了脚本标签
    expect(mockScriptElements.length).toBe(2)
    expect(mockScriptElements[0].src).toBe('/verifys/yz.js')
    expect(mockScriptElements[1].src).toBe('/verifys/verify.js')
    expect(mockScriptElements[0].async).toBe(false)
    expect(mockScriptElements[1].async).toBe(false)
  })

  it('should handle DOM ready state changes correctly', () => {
    let loadScriptsCalled = false

    function loadDependentScripts() {
      if (typeof window.jQuery === 'undefined' || typeof window.$ === 'undefined') {
        setTimeout(loadDependentScripts, 10)
        return
      }
      loadScriptsCalled = true
    }

    // 设置初始状态为 loading
    Object.defineProperty(document, 'readyState', {
      value: 'loading',
      writable: true
    })

    // 添加 DOMContentLoaded 监听器
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadDependentScripts)
    }

    // 模拟 jQuery 加载
    setTimeout(() => {
      window.jQuery = window.$ = { version: '3.4.1' }
    }, 50)

    // 模拟 DOMContentLoaded 事件
    setTimeout(() => {
      document.dispatchEvent(new Event('DOMContentLoaded'))
    }, 100)

    // 验证在 DOMContentLoaded 事件触发前不会调用
    vi.advanceTimersByTime(50)
    expect(loadScriptsCalled).toBe(false)

    // jQuery 加载完成
    vi.advanceTimersByTime(50)
    expect(typeof window.jQuery).toBe('function')

    // DOMContentLoaded 事件触发
    vi.advanceTimersByTime(50)
    expect(loadScriptsCalled).toBe(true)
  })

  it('should handle script loading errors gracefully', () => {
    let errorCount = 0
    let successCount = 0

    // 模拟更复杂的脚本加载逻辑
    function loadScriptsSequentially() {
      const scripts = ['success.js', 'error.js', 'success2.js']
      let index = 0

      function loadNext() {
        if (index >= scripts.length) return

        const script = document.createElement('script')
        script.src = scripts[index]

        script.onload = function() {
          successCount++
          index++
          loadNext()
        }

        script.onerror = function() {
          errorCount++
          index++
          loadNext()
        }

        // 模拟脚本加载结果
        if (scripts[index] === 'error.js') {
          setTimeout(() => script.onerror?.(), 10)
        } else {
          setTimeout(() => script.onload?.(), 10)
        }

        document.body.appendChild(script)
      }

      loadNext()
    }

    loadScriptsSequentially()

    // 执行异步操作
    vi.advanceTimersByTime(50)

    expect(successCount).toBe(2) // success.js 和 success2.js
    expect(errorCount).toBe(1) // error.js
  })

  it('should prevent race conditions between script loading', () => {
    const executionOrder: string[] = []

    // 模拟两个异步脚本加载过程
    function loadScript1() {
      executionOrder.push('script1-start')
      setTimeout(() => {
        executionOrder.push('script1-end')
        // 模拟 jQuery 加载
        window.jQuery = window.$ = { version: '3.4.1' }
      }, 20)
    }

    function loadScript2() {
      executionOrder.push('script2-start')
      if (typeof window.jQuery === 'undefined') {
        setTimeout(() => {
          if (typeof window.jQuery !== 'undefined') {
            executionOrder.push('script2-end')
          } else {
            loadScript2() // 递归重试
          }
        }, 10)
        return
      }
      executionOrder.push('script2-end')
    }

    // 启动两个脚本加载
    loadScript1()
    loadScript2()

    // 执行异步操作
    vi.advanceTimersByTime(50)

    expect(executionOrder).toEqual([
      'script1-start',
      'script2-start',
      'script1-end',
      'script2-end'
    ])
  })

  it('should handle jQuery plugin initialization correctly', () => {
    let pluginInitialized = false

    // 模拟 yz.js 的结构
    function simulateYzJs() {
      if (typeof window.jQuery === 'undefined' || typeof window.$ === 'undefined') {
        setTimeout(simulateYzJs, 10)
        return
      }

      // 模拟插件初始化
      const inlineCss = '*{margin:0;padding:0;}'
      const styleObj = window.jQuery(`<style type="text/css">${inlineCss}</style>`)

      // 模拟 RotateVerify 构造函数
      window.RotateVerify = function(options: any) {
        this.options = options
        pluginInitialized = true
      }

      const _global = (function(){ return this || (0, eval)('this') }())
      if (typeof (globalThis as any).module !== "undefined" && (globalThis as any).module.exports) {
        (globalThis as any).module.exports = window.RotateVerify
      } else if (typeof (globalThis as any).define === "function" && (globalThis as any).define.amd) {
        (globalThis as any).define(() => window.RotateVerify)
      } else {
        !('RotateVerify' in _global) && (_global.RotateVerify = window.RotateVerify)
      }
    }

    // 初始状态
    expect(typeof window.RotateVerify).toBe('undefined')
    expect(pluginInitialized).toBe(false)

    // 开始插件初始化
    simulateYzJs()

    // 10ms 后仍未初始化（jQuery 未加载）
    vi.advanceTimersByTime(10)
    expect(pluginInitialized).toBe(false)

    // 模拟 jQuery 加载
    window.jQuery = window.$ = function(selector: any) {
      return {
        length: 1,
        selector: selector,
        css: vi.fn().mockReturnThis()
      }
    }
    window.jQuery.fn = window.$.fn = {}

    // 再次调用（模拟重试）
    simulateYzJs()

    // 现在应该初始化了
    expect(pluginInitialized).toBe(true)
    expect(typeof window.RotateVerify).toBe('function')
  })

  it('should handle multiple jQuery-dependent scripts', () => {
    let script1Executed = false
    let script2Executed = false

    function loadMultipleScripts() {
      if (typeof window.jQuery === 'undefined' || typeof window.$ === 'undefined') {
        setTimeout(loadMultipleScripts, 10)
        return
      }

      // 模拟加载 yz.js
      const script1 = document.createElement('script')
      script1.src = '/verifys/yz.js'
      script1.onload = function() {
        script1Executed = true
        window.RotateVerify = function() { return 'yz-plugin' }
      }
      document.body.appendChild(script1)

      // 模拟加载 verify.js
      const script2 = document.createElement('script')
      script2.src = '/verifys/verify.js'
      script2.onload = function() {
        script2Executed = true
        if (window.RotateVerify) {
          window.VerifyPlugin = function() { return 'verify-plugin' }
        }
      }
      document.body.appendChild(script2)
    }

    // 开始加载
    loadMultipleScripts()

    // 10ms 后未执行
    vi.advanceTimersByTime(10)
    expect(script1Executed).toBe(false)
    expect(script2Executed).toBe(false)

    // 模拟 jQuery 加载
    window.jQuery = window.$ = { version: '3.4.1' }

    // 重新调用加载逻辑
    loadMultipleScripts()

    // 触发 onload 事件
    mockScriptElements.forEach(script => {
      if (script.onload) script.onload()
    })

    expect(script1Executed).toBe(true)
    expect(script2Executed).toBe(true)
    expect(typeof window.RotateVerify).toBe('function')
    expect(typeof window.VerifyPlugin).toBe('function')
  })

  it('should handle script loading timeouts', () => {
    let timeoutReached = false
    let scriptLoaded = false

    function loadWithTimeout() {
      const startTime = Date.now()

      function checkTimeout() {
        if (Date.now() - startTime > 5000) { // 5秒超时
          timeoutReached = true
          return
        }

        if (typeof window.jQuery === 'undefined') {
          setTimeout(checkTimeout, 100)
          return
        }

        scriptLoaded = true
      }

      checkTimeout()
    }

    loadWithTimeout()

    // 模拟长时间等待
    vi.advanceTimersByTime(6000)

    expect(timeoutReached).toBe(true)
    expect(scriptLoaded).toBe(false)

    // 现在加载 jQuery
    window.jQuery = window.$ = { version: '3.4.1' }

    // 重新调用
    loadWithTimeout()

    // 立即加载
    vi.advanceTimersByTime(10)
    expect(scriptLoaded).toBe(true)
  })

  it('should handle circular dependencies between scripts', () => {
    let scriptACalled = false
    let scriptBCalled = false
    let circularDependencyResolved = false

    function loadScriptA() {
      if (typeof window.jQuery === 'undefined') {
        setTimeout(loadScriptA, 10)
        return
      }
      scriptACalled = true
      // Script A 需要 Script B
      if (typeof window.ScriptB === 'undefined') {
        loadScriptB()
      } else {
        circularDependencyResolved = true
      }
    }

    function loadScriptB() {
      if (typeof window.jQuery === 'undefined') {
        setTimeout(loadScriptB, 10)
        return
      }
      scriptBCalled = true
      window.ScriptB = true
      // 检查 Script A 是否已经调用
      if (scriptACalled) {
        circularDependencyResolved = true
      }
    }

    // 开始加载 Script A
    loadScriptA()

    // 10ms 后未执行
    vi.advanceTimersByTime(10)
    expect(scriptACalled).toBe(false)
    expect(scriptBCalled).toBe(false)

    // 加载 jQuery
    window.jQuery = window.$ = { version: '3.4.1' }

    // 重新调用
    loadScriptA()

    // 执行异步操作
    vi.advanceTimersByTime(20)

    expect(scriptACalled).toBe(true)
    expect(scriptBCalled).toBe(true)
    expect(circularDependencyResolved).toBe(true)
  })
})
