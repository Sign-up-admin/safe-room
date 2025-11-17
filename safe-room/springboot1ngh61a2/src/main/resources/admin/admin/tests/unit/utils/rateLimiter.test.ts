import { describe, it, expect, beforeEach, vi } from 'vitest'
import { rateLimiter } from '../../../src/utils/rateLimiter'

describe('速率限制工具', () => {
  beforeEach(() => {
    // 清除所有限制记�?
    rateLimiter.clearAll()
  })

  describe('isRateLimited', () => {
    it('首次请求不应该被限制', () => {
      expect(rateLimiter.isRateLimited('test_key')).toBe(false)
    })

    it('在限制次数内不应该被限制', () => {
      const key = 'test_key'
      for (let i = 0; i < 5; i++) {
        expect(rateLimiter.isRateLimited(key)).toBe(false)
      }
    })

      it('超过限制次数应该被限制', () => {
      const key = 'test_key'
      // �?次不应该被限�?
      for (let i = 0; i < 5; i++) {
        rateLimiter.isRateLimited(key)
      }
      // �?次应该被限制
      expect(rateLimiter.isRateLimited(key)).toBe(true)
    })

    it('应该支持自定义最大尝试次�?, () => {
      const key = 'test_key_custom'
      // 设置最大尝试次数为3
      for (let i = 0; i < 3; i++) {
        expect(rateLimiter.isRateLimited(key, 3)).toBe(false)
      }
      // �?次应该被限制
      expect(rateLimiter.isRateLimited(key, 3)).toBe(true)
    })

    it('不同key应该独立计数', () => {
      const key1 = 'key1'
      const key2 = 'key2'
      
      // key1请求5�?
      for (let i = 0; i < 5; i++) {
        rateLimiter.isRateLimited(key1)
      }
      
      // key2首次请求不应该被限制
      expect(rateLimiter.isRateLimited(key2)).toBe(false)
    })

    it('超过时间窗口后应该重置计�?, () => {
      const key = 'test_key_time'
      vi.useFakeTimers()
      
      // 请求5�?
      for (let i = 0; i < 5; i++) {
        rateLimiter.isRateLimited(key, 5, 1000) // 1秒窗�?
      }
      
      // 应该被限�?
      expect(rateLimiter.isRateLimited(key, 5, 1000)).toBe(true)
      
      // 快进1�?
      vi.advanceTimersByTime(1001)
      
      // 应该重置，不被限�?
      expect(rateLimiter.isRateLimited(key, 5, 1000)).toBe(false)
      
      vi.useRealTimers()
    })
  })

  describe('getRemainingAttempts', () => {
    it('如果没有记录，应该返回最大尝试次�?, () => {
      expect(rateLimiter.getRemainingAttempts('new_key')).toBe(5)
    })

    it('应该正确计算剩余尝试次数', () => {
      const key = 'test_key'
      rateLimiter.isRateLimited(key) // 1�?
      expect(rateLimiter.getRemainingAttempts(key)).toBe(4)
      
      rateLimiter.isRateLimited(key) // 2�?
      expect(rateLimiter.getRemainingAttempts(key)).toBe(3)
    })

    it('如果超过限制，应该返�?', () => {
      const key = 'test_key'
      for (let i = 0; i < 5; i++) {
        rateLimiter.isRateLimited(key)
      }
      expect(rateLimiter.getRemainingAttempts(key)).toBe(0)
    })

    it('应该支持自定义最大尝试次�?, () => {
      const key = 'test_key_custom'
      rateLimiter.isRateLimited(key, 10)
      expect(rateLimiter.getRemainingAttempts(key, 10)).toBe(9)
    })
  })

  describe('getResetTime', () => {
    it('如果没有记录，应该返回null', () => {
      expect(rateLimiter.getResetTime('new_key')).toBeNull()
    })

    it('应该返回重置时间�?, () => {
      const key = 'test_key'
      rateLimiter.isRateLimited(key)
      const resetTime = rateLimiter.getResetTime(key)
      expect(resetTime).toBeTruthy()
      expect(typeof resetTime).toBe('number')
      expect(resetTime).toBeGreaterThan(Date.now())
    })

    it('如果超过时间窗口，应该返回null', () => {
      const key = 'test_key'
      vi.useFakeTimers()
      
      rateLimiter.isRateLimited(key, 5, 1000)
      const resetTime = rateLimiter.getResetTime(key)
      expect(resetTime).toBeTruthy()
      
      // 快进超过时间窗口
      vi.advanceTimersByTime(1001)
      expect(rateLimiter.getResetTime(key)).toBeNull()
      
      vi.useRealTimers()
    })
  })

  describe('clear', () => {
    it('应该清除指定key的限制记�?, () => {
      const key = 'test_key'
      rateLimiter.isRateLimited(key)
      rateLimiter.clear(key)
      expect(rateLimiter.getRemainingAttempts(key)).toBe(5)
    })
  })

  describe('clearAll', () => {
    it('应该清除所有限制记�?, () => {
      rateLimiter.isRateLimited('key1')
      rateLimiter.isRateLimited('key2')
      rateLimiter.clearAll()
      expect(rateLimiter.getRemainingAttempts('key1')).toBe(5)
      expect(rateLimiter.getRemainingAttempts('key2')).toBe(5)
    })
  })

  describe('cleanup', () => {
    it('应该清理过期的记�?, () => {
      vi.useFakeTimers()
      
      const key1 = 'key1'
      const key2 = 'key2'
      
      // key1: 1秒窗�?
      rateLimiter.isRateLimited(key1, 5, 1000)
      // key2: 10秒窗�?
      rateLimiter.isRateLimited(key2, 5, 10000)
      
      // 快进2�?
      vi.advanceTimersByTime(2000)
      
      // 清理过期记录
      rateLimiter.cleanup()
      
      // key1应该被清�?
      expect(rateLimiter.getResetTime(key1)).toBeNull()
      // key2应该还在
      expect(rateLimiter.getResetTime(key2)).toBeTruthy()
      
      vi.useRealTimers()
    })
  })
})

