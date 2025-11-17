import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setupBrowserAPIs } from './test-helpers'

// Setup browser APIs
setupBrowserAPIs()

import {
  vueErrorHandler,
  unhandledRejectionHandler,
  globalErrorHandler,
  resourceErrorHandler,
  setupErrorHandlers,
  getStoredErrors,
  clearStoredErrors,
  clearErrorDedupeCache,
} from '../../../src/utils/errorHandler'

// Mock http module
vi.mock('../../../src/utils/http', () => ({
  default: {
    post: vi.fn(() => Promise.resolve()),
  },
}))

describe('错误处理工具', () => {
  beforeEach(() => {
    // 清除localStorage
    localStorage.clear()
    // 清除错误去重缓存
    clearErrorDedupeCache()
    // Mock console methods
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'info').mockImplementation(() => {})
    vi.spyOn(console, 'group').mockImplementation(() => {})
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {})
    // Mock navigator
    Object.defineProperty(window, 'navigator', {
      value: { userAgent: 'test-agent', onLine: true },
      writable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    clearStoredErrors()
  })

  describe('vueErrorHandler', () => {
    it('应该处理Vue组件错误', () => {
      const error = new Error('Test error')
      const instance = { $options: { name: 'TestComponent' } }
      vueErrorHandler(error, instance, 'render')
      
      const errors = getStoredErrors()
      expect(errors.length).toBe(1)
      expect(errors[0].type).toBe('vue')
      expect(errors[0].message).toContain('Vue 组件错误')
      expect(errors[0].componentName).toBe('TestComponent')
    })

    it('应该处理字符串错误', () => {
      vueErrorHandler('String error', null, 'render')
      const errors = getStoredErrors()
      expect(errors.length).toBe(1)
      expect(errors[0].message).toContain('String error')
    })

    it('应该处理未知类型的错误', () => {
      vueErrorHandler({ toString: () => 'Unknown error' }, null, 'render')
      const errors = getStoredErrors()
      expect(errors.length).toBe(1)
    })
  })

  describe('unhandledRejectionHandler', () => {
    it('应该处理Promise拒绝', () => {
      const error = new Error('Promise rejection')
      const event = {
        reason: error,
        preventDefault: vi.fn(),
      } as any
      
      unhandledRejectionHandler(event)
      
      const errors = getStoredErrors()
      expect(errors.length).toBe(1)
      expect(errors[0].type).toBe('promise')
      expect(errors[0].message).toContain('未处理的 Promise 拒绝')
      expect(event.preventDefault).toHaveBeenCalled()
    })
  })

  describe('globalErrorHandler', () => {
    it('应该处理ErrorEvent', () => {
      const error = new Error('Global error')
      const event = new ErrorEvent('error', {
        error,
        message: 'Test error',
        filename: 'test.js',
        lineno: 10,
        colno: 5,
      })
      
      globalErrorHandler(event)
      
      const errors = getStoredErrors()
      expect(errors.length).toBe(1)
      expect(errors[0].type).toBe('error')
      expect(errors[0].source).toBe('test.js')
      expect(errors[0].lineno).toBe(10)
      expect(errors[0].colno).toBe(5)
    })

    it('应该处理普通Event', () => {
      const event = new Event('error')
      globalErrorHandler(event, 'test.js', 10, 5, new Error('Test'))
      
      const errors = getStoredErrors()
      expect(errors.length).toBe(1)
      expect(errors[0].source).toBe('test.js')
    })
  })

  describe('resourceErrorHandler', () => {
    it('应该处理图片加载错误', () => {
      const img = document.createElement('img')
      img.src = 'test.jpg'
      // Create a proper ErrorEvent with target
      const event = new Event('error') as ErrorEvent
      Object.defineProperty(event, 'target', {
        value: img,
        writable: false,
        enumerable: true,
        configurable: true
      })
      
      resourceErrorHandler(event)
      
      const errors = getStoredErrors()
      expect(errors.length).toBe(1)
      expect(errors[0].type).toBe('resource')
      expect(errors[0].message).toContain('资源加载失败')
      expect(errors[0].message).toContain('IMG')
    })

    it('应该处理脚本加载错误', () => {
      const script = document.createElement('script')
      script.src = 'test.js'
      // Create a proper ErrorEvent with target
      const event = new Event('error') as ErrorEvent
      Object.defineProperty(event, 'target', {
        value: script,
        writable: false,
        enumerable: true,
        configurable: true
      })
      
      resourceErrorHandler(event)
      
      const errors = getStoredErrors()
      expect(errors.length).toBe(1)
      expect(errors[0].message).toContain('SCRIPT')
    })
  })

  describe('getStoredErrors', () => {
    it('如果没有错误，应该返回空数组', () => {
      const errors = getStoredErrors()
      expect(errors).toEqual([])
    })

    it('应该返回存储的错误', () => {
      vueErrorHandler(new Error('Test'), null, 'render')
      const errors = getStoredErrors()
      expect(errors.length).toBe(1)
    })

    it('如果localStorage数据损坏，应该返回空数组', () => {
      localStorage.setItem('admin_errors', 'invalid json')
      const errors = getStoredErrors()
      expect(errors).toEqual([])
    })
  })

  describe('clearStoredErrors', () => {
    it('应该清除存储的错误', () => {
      vueErrorHandler(new Error('Test'), null, 'render')
      clearStoredErrors()
      const errors = getStoredErrors()
      expect(errors.length).toBe(0)
    })
  })

  describe('错误去重', () => {
    it('5秒内相同错误应该只记录一次', () => {
      vi.useFakeTimers()
      const error = new Error('Same error')
      
      vueErrorHandler(error, null, 'render')
      vueErrorHandler(error, null, 'render')
      
      const errors = getStoredErrors()
      expect(errors.length).toBe(1)
      
      vi.useRealTimers()
    })

    it('5秒后相同错误应该再次记录', () => {
      vi.useFakeTimers()
      const error = new Error('Same error')
      
      vueErrorHandler(error, null, 'render')
      vi.advanceTimersByTime(6000)
      vueErrorHandler(error, null, 'render')
      
      const errors = getStoredErrors()
      expect(errors.length).toBe(2)
      
      vi.useRealTimers()
    })
  })

  describe('错误数量限制', () => {
    it('应该只保留最近50条错误', () => {
      for (let i = 0; i < 60; i++) {
        vueErrorHandler(new Error(`Error ${i}`), null, 'render')
      }
      
      const errors = getStoredErrors()
      expect(errors.length).toBe(50)
      // 应该保留最新的50条
      expect(errors[0].message).toContain('Error 10')
    })
  })
})

