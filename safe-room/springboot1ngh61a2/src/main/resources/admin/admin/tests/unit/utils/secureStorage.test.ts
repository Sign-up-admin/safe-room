import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setupBrowserAPIs } from './test-helpers'

// Setup browser APIs
setupBrowserAPIs()

import { secureStorage, tokenStorage } from '../../../src/utils/secureStorage'

describe('secureStorage', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  describe('SecureStorage', () => {
    it('should set and get values', () => {
      secureStorage.set('test', 'value')
      expect(secureStorage.get('test')).toBe('value')
    })

    it('should store with prefix', () => {
      secureStorage.set('key', 'value')
      // Should store with prefix in sessionStorage
      expect(sessionStorage.getItem('secure_key')).toBe('value')
    })

    it('should return null for non-existent keys', () => {
      expect(secureStorage.get('nonexistent')).toBeNull()
    })

    it('should remove values', () => {
      secureStorage.set('test', 'value')
      secureStorage.remove('test')
      expect(secureStorage.get('test')).toBeNull()
    })

    it('should clear all prefixed storage items', () => {
      // Clear any existing items first
      sessionStorage.clear()

      secureStorage.set('key1', 'value1')
      secureStorage.set('key2', 'value2')
      sessionStorage.setItem('other_key', 'other_value')

      // Verify items are set
      expect(secureStorage.get('key1')).toBe('value1')
      expect(secureStorage.get('key2')).toBe('value2')
      expect(sessionStorage.getItem('other_key')).toBe('other_value')

      secureStorage.clear()

      // After clear, prefixed items should be null
      expect(secureStorage.get('key1')).toBeNull()
      expect(secureStorage.get('key2')).toBeNull()
      // Other keys should remain
      expect(sessionStorage.getItem('other_key')).toBe('other_value')
    })

    it('should handle storage errors gracefully', () => {
      // Mock sessionStorage.setItem to throw error
      const originalSetItem = sessionStorage.setItem
      sessionStorage.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError')
      })

      // Should not throw
      expect(() => {
        secureStorage.set('test', 'value')
      }).not.toThrow()

      // Restore original function
      sessionStorage.setItem = originalSetItem
    })

    it('should handle get errors gracefully', () => {
      const originalGetItem = sessionStorage.getItem
      sessionStorage.getItem = vi.fn(() => {
        throw new Error('StorageError')
      })

      expect(secureStorage.get('test')).toBeNull()

      // Restore original function
      sessionStorage.getItem = originalGetItem
    })

    it('should handle remove errors gracefully', () => {
      const originalRemoveItem = sessionStorage.removeItem
      sessionStorage.removeItem = vi.fn(() => {
        throw new Error('StorageError')
      })

      // Should not throw
      expect(() => {
        secureStorage.remove('test')
      }).not.toThrow()

      // Restore original function
      sessionStorage.removeItem = originalRemoveItem
    })

    it('should clear expired data when storage is full', () => {
      // Mock clearExpired method
      const clearExpiredSpy = vi.spyOn(secureStorage, 'clearExpired')

      // Mock setItem to throw QuotaExceededError
      const originalSetItem = sessionStorage.setItem
      sessionStorage.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError')
      })

      // This should trigger clearExpired call
      secureStorage.set('test', 'value')

      // clearExpired should be called when storage fails
      expect(clearExpiredSpy).toHaveBeenCalled()

      // Restore original function
      sessionStorage.setItem = originalSetItem
    })
  })

  describe('TokenStorage', () => {
    it('should set and get token', () => {
      tokenStorage.setToken('test-token')
      expect(tokenStorage.getToken()).toBe('test-token')
    })

    it('should clear token', () => {
      tokenStorage.setToken('test-token')
      tokenStorage.clearToken()
      expect(tokenStorage.getToken()).toBeNull()
    })

    it('should check token existence', () => {
      expect(tokenStorage.getToken()).toBe(null)

      tokenStorage.setToken('test-token')
      expect(tokenStorage.getToken()).not.toBe(null)

      tokenStorage.clearToken()
      expect(tokenStorage.getToken()).toBe(null)
    })

    it('should check token expiration', () => {
      // Mock current time
      const mockNow = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(mockNow)

      // Set token with future expiration
      tokenStorage.setToken('test-token', mockNow + 3600000) // 1 hour from now
      expect(tokenStorage.isExpired()).toBe(false)

      // Set token with past expiration
      tokenStorage.setToken('test-token', mockNow - 1000) // 1 second ago
      expect(tokenStorage.isExpired()).toBe(true)

      // Set token without expiration (should not be expired)
      tokenStorage.setToken('test-token')
      // When no expiry is set, isExpired() returns false
      expect(tokenStorage.isExpired()).toBe(false)
    })


    it('should handle token storage errors', () => {
      const originalSetItem = sessionStorage.setItem
      sessionStorage.setItem = vi.fn(() => {
        throw new Error('StorageError')
      })

      // Should not throw
      expect(() => {
        tokenStorage.setToken('test-token')
      }).not.toThrow()

      // Restore original function
      sessionStorage.setItem = originalSetItem
    })

    it('should handle token retrieval errors', () => {
      const originalGetItem = sessionStorage.getItem
      sessionStorage.getItem = vi.fn(() => {
        throw new Error('StorageError')
      })

      expect(tokenStorage.getToken()).toBeNull()
      expect(tokenStorage.getToken()).toBe(null)

      // Restore original function
      sessionStorage.getItem = originalGetItem
    })

    it('should store token with expiration', () => {
      const expirationTime = Date.now() + 3600000 // 1 hour from now

      tokenStorage.setToken('test-token', expirationTime)

      // Should be able to retrieve token
      expect(tokenStorage.getToken()).toBe('test-token')
      expect(tokenStorage.isExpired()).toBe(false)
    })

    it('should clear expired tokens', () => {
      // Set an expired token
      const pastTime = Date.now() - 1000
      tokenStorage.setToken('expired-token', pastTime)

      // Token should be considered expired
      expect(tokenStorage.isExpired()).toBe(true)

      // Get token again (should clear expired token automatically)
      const tokenAfterExpiry = tokenStorage.getToken()

      // Token should be cleared automatically
      expect(tokenAfterExpiry).toBeNull()
    })
  })

  describe('Integration tests', () => {
    it('should work with real token flow', () => {
      // Simulate login flow
      const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.valid.signature'

      tokenStorage.setToken(token)
      expect(tokenStorage.getToken()).not.toBe(null)
      expect(tokenStorage.getToken()).toBe(token)
      // Token format validation removed as method doesn't exist

      // Simulate logout
      tokenStorage.clearToken()
      expect(tokenStorage.getToken()).toBe(null)
      expect(tokenStorage.getToken()).toBeNull()
    })

    it('should handle multiple tokens', () => {
      // Clear any existing items first
      sessionStorage.clear()
      
      tokenStorage.setToken('token1')
      secureStorage.set('other_data', 'value')

      expect(tokenStorage.getToken()).toBe('token1')
      expect(secureStorage.get('other_data')).toBe('value')

      // Clear should only affect secureStorage items
      // Note: TokenStorage uses SecureStorage internally with prefix 'secure_'
      // So clearing secureStorage will also clear tokenStorage keys
      secureStorage.clear()
      // After clearing, both should be null
      expect(secureStorage.get('other_data')).toBeNull() // Other data should be cleared
      // TokenStorage keys are also prefixed, so they will be cleared too
      expect(tokenStorage.getToken()).toBeNull()
    })

    it('should persist data across component lifecycle', () => {
      // Set data
      tokenStorage.setToken('persistent-token')
      secureStorage.set('user_pref', 'dark-mode')

      // Simulate component re-mount (data should persist in sessionStorage)
      expect(tokenStorage.getToken()).toBe('persistent-token')
      expect(secureStorage.get('user_pref')).toBe('dark-mode')
    })
  })

  describe('Error resilience', () => {
    it('should handle sessionStorage unavailable', () => {
      // Mock sessionStorage as undefined
      const originalSessionStorage = global.sessionStorage

      // Temporarily make sessionStorage unavailable
      Object.defineProperty(global, 'sessionStorage', {
        value: undefined,
        writable: true,
        configurable: true
      })

      // Should not throw errors
      expect(() => {
        secureStorage.set('test', 'value')
        secureStorage.get('test')
        secureStorage.remove('test')
        secureStorage.clear()
        tokenStorage.setToken('token')
        tokenStorage.getToken()
        tokenStorage.clearToken()
      }).not.toThrow()

      // Restore sessionStorage
      Object.defineProperty(global, 'sessionStorage', {
        value: originalSessionStorage,
        writable: true,
        configurable: true
      })
    })

    it('should handle corrupted storage data', () => {
      // Manually set corrupted data
      sessionStorage.setItem('secure_test', '{"invalid": json}')

      // Should handle gracefully
      expect(secureStorage.get('test')).toBe('{"invalid": json}')

      // Clear and verify
      secureStorage.remove('test')
      expect(secureStorage.get('test')).toBeNull()
    })
  })
})
