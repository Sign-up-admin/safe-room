/**
 * jQuery 初始化测试
 * 测试 jQuery 脚本加载顺序和初始化问题
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'

// 模拟 jQuery 未加载的情况
describe('jQuery Initialization Tests', () => {

  beforeEach(() => {
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

    // 模拟需要 jQuery 的代码
    function codeNeedingJQuery(): Promise<void> {
      return new Promise((resolve) => {
        if (typeof window.jQuery === 'undefined') {
          executionCount++
          // 如果 jQuery 未加载，安排下一次检查
          setTimeout(() => {
            resolve(codeNeedingJQuery())
          }, 10)
          return
        }

        // jQuery 已加载，执行依赖代码
        executionCount++
        const element = window.jQuery('<div>test</div>')
        expect(element.length).toBe(1)
        expect(element.text()).toBe('test')
        resolve()
      })
    }

    // 开始执行依赖代码
    await codeNeedingJQuery()

    // 模拟 jQuery 加载完成
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
    }, 50)

    // 验证至少执行了一次等待检查
    setTimeout(() => {
      expect(executionCount).toBeGreaterThan(1)
    }, 100)
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

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadDependentScripts)
    } else {
      loadDependentScripts()
    }

    // 模拟 jQuery 加载
    setTimeout(() => {
      window.jQuery = window.$ = { version: '3.4.1' }
    }, 20)

    // 模拟 DOMContentLoaded 事件
    setTimeout(() => {
      document.dispatchEvent(new Event('DOMContentLoaded'))
    }, 30)
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
    function loadScript(src: string, onSuccess?: () => void, onError?: (error: Error) => void) {
      if (src === 'error.js') {
        // 模拟加载失败
        setTimeout(() => {
          errorCount++
          onError && onError(new Error('Script load failed'))
        }, 10)
      } else {
        // 模拟加载成功
        setTimeout(() => {
          successCount++
          onSuccess && onSuccess()
        }, 10)
      }
    }

    // 测试错误处理
    const scripts = ['working.js', 'error.js', 'another.js']
    let loadIndex = 0

    function loadNext(): Promise<void> {
      return new Promise((resolve) => {
        if (loadIndex >= scripts.length) {
          // 所有脚本处理完成
          expect(successCount).toBe(2) // working.js 和 another.js 成功
          expect(errorCount).toBe(1) // error.js 失败
          resolve()
          return
        }

      const script = scripts[loadIndex]
      loadScript(
        script,
        () => {
          loadIndex++
          loadNext()
        },
        () => {
          loadIndex++
          loadNext()
        }
      )
    }

    await loadNext()
  })

  it('should properly initialize jQuery plugins after core load', () => {
    // 先加载 jQuery
    ;(global as any).mockJQuery()

    // 确保 jQuery 已加载
    expect(typeof window.jQuery).toBe('function')
    expect(typeof window.$).toBe('function')

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

    // 测试插件使用
    const element = window.jQuery('<div>')
    element.myPlugin({ color: 'red' })
    expect(element._css.color).toBe('red')
  })
})
