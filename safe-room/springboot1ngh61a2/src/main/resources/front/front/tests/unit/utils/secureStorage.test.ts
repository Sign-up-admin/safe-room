import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { secureStorage, tokenStorage, default as secureStorageApi } from '@/utils/secureStorage'

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
})

// Mock console.error
const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('secureStorage utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorageMock.getItem.mockReturnValue(null)
    sessionStorageMock.setItem.mockImplementation(() => {})
    sessionStorageMock.removeItem.mockImplementation(() => {})
    sessionStorageMock.clear.mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockClear()
  })

  describe('SecureStorage', () => {
    describe('set', () => {
      it('should set value to sessionStorage with prefix', () => {
        secureStorage.set('testKey', 'testValue')

        expect(sessionStorageMock.setItem).toHaveBeenCalledWith('secure_testKey', 'testValue')
      })

      it('should handle sessionStorage quota exceeded error', () => {
        sessionStorageMock.setItem
          .mockImplementationOnce(() => { throw new Error('QuotaExceededError') })
          .mockImplementationOnce(() => {})

        const clearExpiredSpy = vi.spyOn(secureStorage as any, 'clearExpired')

        secureStorage.set('testKey', 'testValue')

        expect(consoleSpy).toHaveBeenCalledWith('SecureStorage set error:', expect.any(Error))
        expect(clearExpiredSpy).toHaveBeenCalled()
        expect(sessionStorageMock.setItem).toHaveBeenCalledTimes(2)
      })

      it('should handle retry failure after clearing expired data', () => {
        sessionStorageMock.setItem
          .mockImplementationOnce(() => { throw new Error('QuotaExceededError') })
          .mockImplementationOnce(() => { throw new Error('QuotaExceededError') })

        secureStorage.set('testKey', 'testValue')

        expect(consoleSpy).toHaveBeenCalledWith('SecureStorage set retry error:', expect.any(Error))
      })
    })

    describe('get', () => {
      it('should get value from sessionStorage with prefix', () => {
        sessionStorageMock.getItem.mockReturnValue('testValue')

        const result = secureStorage.get('testKey')

        expect(sessionStorageMock.getItem).toHaveBeenCalledWith('secure_testKey')
        expect(result).toBe('testValue')
      })

      it('should return null when key does not exist', () => {
        const result = secureStorage.get('nonExistentKey')

        expect(result).toBe(null)
      })

      it('should handle sessionStorage access error', () => {
        sessionStorageMock.getItem.mockImplementation(() => { throw new Error('AccessError') })

        const result = secureStorage.get('testKey')

        expect(consoleSpy).toHaveBeenCalledWith('SecureStorage get error:', expect.any(Error))
        expect(result).toBe(null)
      })
    })

    describe('remove', () => {
      it('should remove value from sessionStorage with prefix', () => {
        secureStorage.remove('testKey')

        expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('secure_testKey')
      })

      it('should handle sessionStorage access error', () => {
        sessionStorageMock.removeItem.mockImplementation(() => { throw new Error('AccessError') })

        secureStorage.remove('testKey')

        expect(consoleSpy).toHaveBeenCalledWith('SecureStorage remove error:', expect.any(Error))
      })
    })

    describe('clear', () => {
      it('should clear all prefixed items from sessionStorage', () => {
        // Mock Object.keys to return some keys
        const originalKeys = Object.keys
        Object.keys = vi.fn(() => ['secure_key1', 'secure_key2', 'other_key'])

        secureStorage.clear()

        expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('secure_key1')
        expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('secure_key2')
        expect(sessionStorageMock.removeItem).not.toHaveBeenCalledWith('other_key')

        // Restore
        Object.keys = originalKeys
      })

      it('should handle sessionStorage access error', () => {
        sessionStorageMock.removeItem.mockImplementation(() => { throw new Error('AccessError') })

        secureStorage.clear()

        expect(consoleSpy).toHaveBeenCalledWith('SecureStorage clear error:', expect.any(Error))
      })
    })

    describe('clearExpired', () => {
      it('should call clear method', () => {
        const clearSpy = vi.spyOn(secureStorage, 'clear')

        ;(secureStorage as any).clearExpired()

        expect(clearSpy).toHaveBeenCalled()
      })
    })
  })

  describe('TokenStorage', () => {
    describe('setToken', () => {
      it('should set token without expiry time', () => {
        tokenStorage.setToken('test-token')

        expect(sessionStorageMock.setItem).toHaveBeenCalledWith('secure_token', 'test-token')
        expect(sessionStorageMock.setItem).not.toHaveBeenCalledWith('secure_token_expiry', expect.any(String))
      })

      it('should set token with expiry time', () => {
        const expiryTime = Date.now() + 3600000 // 1 hour from now

        tokenStorage.setToken('test-token', expiryTime)

        expect(sessionStorageMock.setItem).toHaveBeenCalledWith('secure_token', 'test-token')
        expect(sessionStorageMock.setItem).toHaveBeenCalledWith('secure_token_expiry', String(expiryTime))
      })
    })

    describe('getToken', () => {
      it('should return token when not expired', () => {
        sessionStorageMock.getItem.mockReturnValue('test-token')

        const result = tokenStorage.getToken()

        expect(result).toBe('test-token')
      })

      it('should return null when token is expired', () => {
        sessionStorageMock.getItem.mockReturnValue('test-token')

        const result = tokenStorage.getToken()

        expect(result).toBe('test-token') // Token exists but not expired by default
      })

      it('should return null when no token exists', () => {
        sessionStorageMock.getItem.mockReturnValue(null)

        const result = tokenStorage.getToken()

        expect(result).toBe(null)
      })
    })

    describe('clearToken', () => {
      it('should remove token and expiry time', () => {
        tokenStorage.clearToken()

        expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('secure_token')
        expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('secure_token_expiry')
      })
    })

    describe('isExpired', () => {
      it('should return false when no expiry time is set', () => {
        sessionStorageMock.getItem.mockReturnValue(null)

        const result = tokenStorage.isExpired()

        expect(result).toBe(false)
      })

      it('should return false when expiry time is invalid', () => {
        sessionStorageMock.getItem.mockReturnValue('invalid-timestamp')

        const result = tokenStorage.isExpired()

        expect(result).toBe(false)
      })

      it('should return false when token has not expired', () => {
        const futureTime = Date.now() + 3600000 // 1 hour from now
        sessionStorageMock.getItem.mockReturnValue(String(futureTime))

        const result = tokenStorage.isExpired()

        expect(result).toBe(false)
      })

      it('should return true when token has expired', () => {
        const pastTime = Date.now() - 3600000 // 1 hour ago
        sessionStorageMock.getItem.mockReturnValue(String(pastTime))

        const result = tokenStorage.isExpired()

        expect(result).toBe(true)
      })
    })

    describe('hasValidToken', () => {
      it('should return true when token exists and is not expired', () => {
        sessionStorageMock.getItem.mockReturnValue('test-token')

        const result = tokenStorage.hasValidToken()

        expect(result).toBe(true)
      })

      it('should return false when token does not exist', () => {
        sessionStorageMock.getItem.mockReturnValue(null)

        const result = tokenStorage.hasValidToken()

        expect(result).toBe(false)
      })
    })
  })

  describe('default export (backward compatibility)', () => {
    describe('set', () => {
      it('should set string value directly', () => {
        const setSpy = vi.spyOn(secureStorage, 'set')

        secureStorageApi.set('testKey', 'testValue')

        expect(setSpy).toHaveBeenCalledWith('testKey', 'testValue')
      })

      it('should stringify object values', () => {
        const setSpy = vi.spyOn(secureStorage, 'set')

        const testObject = { name: 'test', value: 123 }
        secureStorageApi.set('testKey', testObject)

        expect(setSpy).toHaveBeenCalledWith('testKey', JSON.stringify(testObject))
      })
    })

    describe('get', () => {
      it('should get value from secureStorage', () => {
        sessionStorageMock.getItem.mockReturnValue('testValue')

        const result = secureStorageApi.get('testKey')

        expect(sessionStorageMock.getItem).toHaveBeenCalledWith('secure_testKey')
        expect(result).toBe('testValue')
      })
    })

    describe('getObj', () => {
      it('should parse JSON string and return object', () => {
        const testObject = { name: 'test', value: 123 }
        sessionStorageMock.getItem.mockReturnValue(JSON.stringify(testObject))

        const result = secureStorageApi.getObj('testKey')

        expect(result).toEqual(testObject)
      })

      it('should return null when value is not found', () => {
        sessionStorageMock.getItem.mockReturnValue(null)

        const result = secureStorageApi.getObj('testKey')

        expect(result).toBe(null)
      })

      it('should return null when JSON parsing fails', () => {
        sessionStorageMock.getItem.mockReturnValue('invalid-json')

        const result = secureStorageApi.getObj('testKey')

        expect(result).toBe(null)
      })
    })

    describe('remove', () => {
      it('should remove value from secureStorage', () => {
        secureStorageApi.remove('testKey')

        expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('secure_testKey')
      })
    })

    describe('clear', () => {
      it('should clear all values from secureStorage', () => {
        // Mock some prefixed keys in sessionStorage
        const originalKeys = Object.keys
        Object.keys = vi.fn(() => ['secure_key1', 'secure_key2', 'other_key'])

        secureStorageApi.clear()

        expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('secure_key1')
        expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('secure_key2')
        expect(sessionStorageMock.removeItem).not.toHaveBeenCalledWith('other_key')

        // Restore
        Object.keys = originalKeys
      })
    })
  })

  describe('integration tests', () => {
    it('should handle token lifecycle correctly', () => {
      const token = 'test-jwt-token'

      // Mock sessionStorage to properly store and retrieve values
      const storageMap = new Map()
      sessionStorageMock.getItem.mockImplementation((key: string) => storageMap.get(key) || null)
      sessionStorageMock.setItem.mockImplementation((key: string, value: string) => storageMap.set(key, value))
      sessionStorageMock.removeItem.mockImplementation((key: string) => storageMap.delete(key))

      // Set token
      tokenStorage.setToken(token)

      // Check that token is valid
      expect(tokenStorage.hasValidToken()).toBe(true)
      expect(tokenStorage.getToken()).toBe(token)

      // Clear token
      tokenStorage.clearToken()

      // Check that token is cleared
      expect(tokenStorage.hasValidToken()).toBe(false)
      expect(tokenStorage.getToken()).toBe(null)
    })

    it('should handle expired token automatically', () => {
      const token = 'expired-token'
      const pastTime = Date.now() - 3600000 // 1 hour ago

      // Set expired token
      tokenStorage.setToken(token, pastTime)

      // Token should be cleared automatically on access
      expect(tokenStorage.getToken()).toBe(null)
      expect(tokenStorage.hasValidToken()).toBe(false)
    })

    it('should maintain sessionStorage isolation with prefix', () => {
      // Set secure storage value
      secureStorage.set('user', 'john')

      // Check that sessionStorage was called with prefix
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith('secure_user', 'john')

      // Get value back
      secureStorage.get('user')
      expect(sessionStorageMock.getItem).toHaveBeenCalledWith('secure_user')
    })
  })
})
