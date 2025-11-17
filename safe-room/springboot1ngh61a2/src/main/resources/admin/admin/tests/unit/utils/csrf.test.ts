import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setupBrowserAPIs } from './test-helpers'

// Setup browser APIs
setupBrowserAPIs()

import {
  generateCsrfToken,
  getOrCreateCsrfToken,
  getCsrfToken,
  setCsrfToken,
  clearCsrfToken,
  validateCsrfToken,
  CSRF_TOKEN_HEADER,
} from '../../../src/utils/csrf'

describe('CSRF Token工具', () => {
  beforeEach(() => {
    // 清理sessionStorage
    sessionStorage.clear()
    // Mock crypto.getRandomValues - 确保在测试环境中可用
    if (typeof global.crypto === 'undefined') {
      global.crypto = {
        getRandomValues: (arr: Uint8Array) => {
          for (let i = 0; i < arr.length; i++) {
            arr[i] = Math.floor(Math.random() * 256)
          }
          return arr
        },
      } as any
    } else {
      // 如果已存在，确保getRandomValues可用
      if (!global.crypto.getRandomValues) {
        global.crypto.getRandomValues = (arr: Uint8Array) => {
          for (let i = 0; i < arr.length; i++) {
            arr[i] = Math.floor(Math.random() * 256)
          }
          return arr
        }
      }
    }
  })

  describe('generateCsrfToken', () => {
    it('应该生成64字符的十六进制字符串', () => {
      const token = generateCsrfToken()
      expect(token).toBeTruthy()
      expect(token.length).toBe(64)
      expect(token).toMatch(/^[0-9a-f]{64}$/)
    })

    it('每次生成的token应该不同', () => {
      const token1 = generateCsrfToken()
      const token2 = generateCsrfToken()
      expect(token1).not.toBe(token2)
    })
  })

  describe('getOrCreateCsrfToken', () => {
    it('如果sessionStorage中没有token，应该生成新token', () => {
      const token = getOrCreateCsrfToken()
      expect(token).toBeTruthy()
      expect(token.length).toBe(64)
      expect(sessionStorage.getItem('csrf_token')).toBe(token)
    })

    it('如果sessionStorage中已有token，应该返回现有的', () => {
      const existingToken = 'existing_token_12345'
      sessionStorage.setItem('csrf_token', existingToken)
      const token = getOrCreateCsrfToken()
      expect(token).toBe(existingToken)
    })
  })

  describe('getCsrfToken', () => {
    it('如果sessionStorage中没有token，应该返回null', () => {
      const token = getCsrfToken()
      expect(token).toBeNull()
    })

    it('如果sessionStorage中有token，应该返回token', () => {
      const testToken = 'test_token_12345'
      sessionStorage.setItem('csrf_token', testToken)
      const token = getCsrfToken()
      expect(token).toBe(testToken)
    })
  })

  describe('setCsrfToken', () => {
    it('应该设置token到sessionStorage', () => {
      const testToken = 'test_token_12345'
      setCsrfToken(testToken)
      expect(sessionStorage.getItem('csrf_token')).toBe(testToken)
    })
  })

  describe('clearCsrfToken', () => {
    it('应该清除sessionStorage中的token', () => {
      sessionStorage.setItem('csrf_token', 'test_token')
      clearCsrfToken()
      expect(sessionStorage.getItem('csrf_token')).toBeNull()
    })

      it('如果token不存在，应该不报错', () => {
      expect(() => clearCsrfToken()).not.toThrow()
    })
  })

  describe('validateCsrfToken', () => {
    it('如果token为null，应该返回false', () => {
      expect(validateCsrfToken(null)).toBe(false)
    })

    it('如果token为undefined，应该返回false', () => {
      expect(validateCsrfToken(undefined)).toBe(false)
    })

    it('如果sessionStorage中没有token，应该返回false', () => {
      expect(validateCsrfToken('any_token')).toBe(false)
    })

    it('如果token不匹配，应该返回false', () => {
      sessionStorage.setItem('csrf_token', 'stored_token')
      expect(validateCsrfToken('different_token')).toBe(false)
    })

    it('如果token匹配，应该返回true', () => {
      const testToken = 'matching_token'
      sessionStorage.setItem('csrf_token', testToken)
      expect(validateCsrfToken(testToken)).toBe(true)
    })
  })

  describe('CSRF_TOKEN_HEADER', () => {
      it('应该是正确的请求头名称', () => {
      expect(CSRF_TOKEN_HEADER).toBe('X-CSRF-Token')
    })
  })
})

