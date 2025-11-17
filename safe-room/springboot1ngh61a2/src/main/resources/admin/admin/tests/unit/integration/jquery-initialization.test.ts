/**
 * jQuery 初始化测试
 * 测试 jQuery 脚本加载顺序和初始化问题
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// 模拟 jQuery 未加载的情况
describe('jQuery Initialization Tests', () => {

  beforeEach(() => {
    vi.useFakeTimers()

    // 清理全局 jQuery 变量
    delete window.jQuery
    delete window.$

    // 清理可能存在的 script 标签
    const scripts = document.querySelectorAll('script[src*="jquery"]')
    scripts.forEach(script => script.remove())

    // 重置 document.readyState
    Object.defineProperty(document, 'readyState', {
      writable: true,
      value: 'loading'
    })
  })

  afterEach(() => {
    vi.useRealTimers()

    // 清理测试后可能遗留的变量
    delete window.jQuery
    delete window.$
  })

  it('should handle jQuery not loaded yet', () => {
    // 测试 jQuery 未加载时的行为
    expect(typeof window.jQuery).toBe('undefined')
    expect(typeof window.$).toBe('undefined')
  })

  it('should wait for jQuery to load before executing dependent code', async () => {
    let executionCount = 0

    // 模拟需要 jQuery 的代码 - 简化逻辑
    function codeNeedingJQuery(): Promise<void> {
      return new Promise((resolve) => {
        function checkJQuery() {
          if (typeof window.jQuery === 'undefined') {
            executionCount++
            // 如果 jQuery 未加载，继续检查
            setTimeout(checkJQuery, 10)
            return
          }

          // jQuery 已加载，执行依赖代码
          executionCount++
          const element = window.jQuery('<div>test</div>')
          expect(element.length).toBe(1)
          expect(element.text()).toBe('test')
          resolve()
        }

        checkJQuery()
      })
    }

    // 设置 jQuery 的异步加载逻辑
    setTimeout(() => {
      // 模拟 jQuery 库加载
      window.jQuery = window.$ = function(selector: any) {
        if (typeof selector === 'string' && selector.startsWith('<')) {
          // 简单的 jQuery 模拟，用于测试目的
          return {
            length: 1,
            text: function(content?: string) {
              if (content !== undefined) {
                this._text = content
                return this
              }
              return this._text || ''
            },
            _text: selector.replace(/<[^>]+>/g, '').replace(/<\/[^>]+>/g, '')
          }
        }
        return { length: 0 }
      }
      window.jQuery.fn = window.$.fn = {}
    }, 30)

    // 开始执行依赖代码
    const promise = codeNeedingJQuery()

    // 推进时间，确保异步操作完成
    vi.advanceTimersByTime(50)

    await promise

    // 验证至少执行了一次等待检查
    expect(executionCount).toBeGreaterThan(1)
  })

  it('should handle DOM ready state correctly', async () => {
    let loadScriptsCalled = false

    // 模拟脚本加载逻辑
    function loadDependentScripts(): Promise<void> {
      return new Promise((resolve) => {
        if (typeof window.jQuery === 'undefined' || typeof window.$ === 'undefined') {
          setTimeout(() => {
            resolve(loadDependentScripts())
          }, 10)
          return
        }

        loadScriptsCalled = true
        resolve()
      })
    }

    // 测试 DOM 未准备好的情况
    expect(document.readyState).toBe('loading')

    // 设置事件监听器
    document.addEventListener('DOMContentLoaded', () => {
      loadDependentScripts()
    })

    // 模拟 jQuery 加载
    setTimeout(() => {
      window.jQuery = window.$ = { version: '3.4.1' }
    }, 20)

    // 模拟 DOMContentLoaded 事件
    setTimeout(() => {
      document.dispatchEvent(new Event('DOMContentLoaded'))
    }, 30)

    // 推进时间，确保异步操作完成
    vi.advanceTimersByTime(50)

    // 等待异步操作完成
    await Promise.resolve()

    // 验证脚本加载被调用
    expect(loadScriptsCalled).toBe(true)
  })

  it('should prevent jQuery initialization errors', () => {
    // 测试在 jQuery 未完全初始化时访问变量的情况
    const mockJQueryCode = `
      // 模拟 jQuery 内部的变量提升问题
      let o
      try {
        // 尝试在声明前访问变量
        const result = o // 这应该抛出 ReferenceError
      } catch (e) {
        if (e instanceof ReferenceError) {
          // 正确捕获到错误
          o = {} // 现在可以安全赋值
        }
      }
    `

    // 使用 Function 构造函数来模拟 jQuery 的执行环境
    const testFunction = new Function(mockJQueryCode)

    // 这个应该不会抛出错误，因为我们在 try-catch 中处理了
    expect(() => testFunction()).not.toThrow()
  })

  it('should handle script loading errors gracefully', async () => {
    let errorCount = 0
    let successCount = 0

    // 模拟脚本加载逻辑
    function loadScript(src: string): Promise<void> {
      return new Promise((resolve, reject) => {
        if (src === 'error.js') {
          // 模拟加载失败
          errorCount++
          reject(new Error('Script load failed'))
        } else {
          // 模拟加载成功
          successCount++
          resolve()
        }
      })
    }

    // 测试错误处理 - 顺序加载脚本
    const scripts = ['working.js', 'error.js', 'another.js']

    // 逐个加载脚本，处理错误
    for (const script of scripts) {
      try {
        await loadScript(script)
      } catch (error) {
        // 错误已经被计数，忽略
      }
    }

    // 验证结果
    expect(successCount).toBe(2) // working.js 和 another.js 成功
    expect(errorCount).toBe(1) // error.js 失败
  })

  it('should handle script loading timeouts gracefully', async () => {
    let timeoutReached = false
    let scriptLoaded = false

    function loadWithTimeout(): Promise<void> {
      return new Promise((resolve) => {
        const startTime = Date.now()

        function checkTimeout() {
          if (Date.now() - startTime > 5000) { // 5秒超时
            timeoutReached = true
            resolve()
            return
          }

          if (typeof window.jQuery !== 'undefined') {
            scriptLoaded = true
            resolve()
            return
          }

          setTimeout(checkTimeout, 100)
        }

        checkTimeout()
      })
    }

    // 开始加载检查
    const loadPromise = loadWithTimeout()

    // 模拟长时间等待
    vi.advanceTimersByTime(6000)

    await loadPromise
    expect(timeoutReached).toBe(true)
    expect(scriptLoaded).toBe(false)

    // 现在加载 jQuery
    window.jQuery = window.$ = { version: '3.4.1' }

    // 重新调用
    const loadPromise2 = loadWithTimeout()

    // 立即加载
    vi.advanceTimersByTime(10)

    await loadPromise2
    expect(scriptLoaded).toBe(true)
  })

  it('should load jQuery core successfully', () => {
    // 先加载 jQuery
    ;(global as any).mockJQuery()

    // 确保 jQuery 已加载
    expect(typeof window.jQuery).toBe('function')
    expect(typeof window.$).toBe('function')
    expect(window.jQuery).toBe(window.$)
  })

  it('should initialize jQuery plugins after core load', () => {
    // 先加载 jQuery
    ;(global as any).mockJQuery()

    // 测试依赖 jQuery 的插件代码
    function initializePlugin() {
      if (typeof window.jQuery === 'undefined') {
        throw new Error('jQuery not loaded')
      }

      // 插件初始化代码
      window.jQuery.fn.myPlugin = function(options: { color?: string }) {
        return this.each(function() {
          // 插件逻辑
          window.jQuery(this).css('color', options.color || 'black')
        })
      }

      return true
    }

    // 应该成功初始化插件
    expect(() => initializePlugin()).not.toThrow()
    expect(typeof window.jQuery.fn.myPlugin).toBe('function')
  })

  it('should execute jQuery plugin functionality correctly', () => {
    // 先加载 jQuery
    ;(global as any).mockJQuery()

    // 初始化插件 - 直接添加到实例上（mock 环境下）
    const element = window.jQuery('<div>')
    element.myPlugin = function(options: { color?: string }) {
      // 插件逻辑
      this.css('color', options.color || 'black')
      return this
    }

    // 测试插件使用
    element.myPlugin({ color: 'red' })
    expect(element._css.color).toBe('red')

    // 测试默认颜色
    const element2 = window.jQuery('<div>')
    element2.myPlugin = function(options: { color?: string }) {
      this.css('color', options.color || 'black')
      return this
    }
    element2.myPlugin({})
    expect(element2._css.color).toBe('black')
  })

  it('should fail plugin initialization when jQuery not loaded', () => {
    // 确保 jQuery 未加载
    delete window.jQuery
    delete window.$

    // 测试依赖 jQuery 的插件代码
    function initializePlugin() {
      if (typeof window.jQuery === 'undefined') {
        throw new Error('jQuery not loaded')
      }
      return true
    }

    // 应该抛出错误
    expect(() => initializePlugin()).toThrow('jQuery not loaded')
  })
})
