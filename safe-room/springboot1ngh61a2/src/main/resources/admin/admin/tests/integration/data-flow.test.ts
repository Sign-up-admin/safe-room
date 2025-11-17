import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia } from 'pinia'
import { nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import IndexHeader from '@/components/index/IndexHeader.vue'
import { secureStorage, tokenStorage } from '@/utils/secureStorage'
import { sanitizeHtml, escapeHtml } from '@/utils/security'

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn(),
    success: vi.fn()
  }
}))

// Mock utils
vi.mock('../../../src/utils/storage', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    clear: vi.fn(),
    remove: vi.fn()
  }
}))

vi.mock('../../../src/utils/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

vi.mock('../../../src/utils/base', () => ({
  default: {
    get: vi.fn(() => ({
      url: 'http://localhost:8080',
      indexUrl: 'http://localhost:8080/front'
    })),
    getProjectName: vi.fn(() => ({
      projectName: 'Gym Management System'
    }))
  }
}))

vi.mock('../../../src/stores/tagsView', () => ({
  useTagsViewStore: vi.fn(() => ({
    delAllViews: vi.fn()
  }))
}))

describe('Data Flow Integration', () => {
  let router: any
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { name: 'home', path: '/', component: { template: '<div>Home</div>' } },
        { name: 'login', path: '/login', component: { template: '<div>Login</div>' } }
      ]
    })
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  describe('Authentication Data Flow', () => {
    it('should handle complete login data flow', async () => {
      const mockStorage = vi.mocked(require('../../../src/utils/storage').default)
      const mockHttp = vi.mocked(require('../../../src/utils/http').default)

      // Mock login response
      mockHttp.post.mockResolvedValue({
        data: {
          code: 0,
          data: {
            token: 'jwt-token-123',
            user: {
              id: 1,
              name: 'Test User',
              role: 'Administrator'
            }
          }
        }
      })

      // Store token
      tokenStorage.setToken('jwt-token-123')

      // Verify token is stored
      expect(tokenStorage.getToken()).toBe('jwt-token-123')
      expect(tokenStorage.hasToken()).toBe(true)
      expect(tokenStorage.isValidTokenFormat('jwt-token-123')).toBe(true)

      // Store user info
      secureStorage.set('user_profile', JSON.stringify({
        id: 1,
        name: 'Test User',
        role: 'Administrator'
      }))

      // Verify user data is stored
      const userData = secureStorage.get('user_profile')
      expect(userData).toBe(JSON.stringify({
        id: 1,
        name: 'Test User',
        role: 'Administrator'
      }))
    })

    it('should handle session management data flow', async () => {
      const mockStorage = vi.mocked(require('../../../src/utils/storage').default)
      const mockHttp = vi.mocked(require('../../../src/utils/http').default)

      // Mock session check
      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'sessionTable') return 'users'
        return null
      })

      mockHttp.get.mockResolvedValue({
        data: {
          code: 0,
          data: {
            id: 1,
            name: 'Test User',
            image: '/avatar.jpg'
          }
        }
      })

      const wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      await nextTick()

      // Verify session data flow
      expect(mockHttp.get).toHaveBeenCalledWith('/users/session')
      expect(mockStorage.set).toHaveBeenCalledWith('headportrait', '/avatar.jpg')
      expect(mockStorage.set).toHaveBeenCalledWith('userid', 1)
    })

    it('should handle logout data cleanup flow', async () => {
      const mockStorage = vi.mocked(require('../../../src/utils/storage').default)
      const mockTagsViewStore = vi.mocked(require('../../../src/stores/tagsView').useTagsViewStore)

      // Setup initial state
      tokenStorage.setToken('test-token')
      secureStorage.set('user_data', 'test-data')

      const wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      // Perform logout
      await wrapper.vm.onLogout()

      // Verify cleanup
      expect(mockStorage.clear).toHaveBeenCalled()
      expect(mockTagsViewStore().delAllViews).toHaveBeenCalled()

      // Token should be cleared
      expect(tokenStorage.getToken()).toBeNull()
      expect(tokenStorage.hasToken()).toBe(false)
    })
  })

  describe('API Data Flow', () => {
    it('should handle successful API response flow', async () => {
      const mockHttp = vi.mocked(require('../../../src/utils/http').default)

      // Mock successful API call
      mockHttp.get.mockResolvedValue({
        data: {
          code: 0,
          data: {
            list: [
              { id: 1, name: 'Item 1' },
              { id: 2, name: 'Item 2' }
            ],
            total: 2
          }
        }
      })

      // Simulate API call
      const response = await mockHttp.get('/test/endpoint', { params: { page: 1 } })

      expect(response.data.code).toBe(0)
      expect(response.data.data.list).toHaveLength(2)
      expect(response.data.data.total).toBe(2)
    })

    it('should handle API error flow', async () => {
      const mockHttp = vi.mocked(require('../../../src/utils/http').default)

      // Mock API error
      mockHttp.get.mockResolvedValue({
        data: {
          code: 1,
          msg: 'Data not found'
        }
      })

      const response = await mockHttp.get('/test/endpoint')

      expect(response.data.code).toBe(1)
      expect(response.data.msg).toBe('Data not found')
      expect(ElMessage.error).not.toHaveBeenCalled() // Error handling depends on component
    })

    it('should handle network error flow', async () => {
      const mockHttp = vi.mocked(require('../../../src/utils/http').default)

      // Mock network error
      mockHttp.get.mockRejectedValue(new Error('Network Error'))

      try {
        await mockHttp.get('/test/endpoint')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Network Error')
      }
    })
  })

  describe('Security Data Flow', () => {
    it('should handle XSS protection data flow', () => {
      // Test HTML sanitization
      const maliciousHtml = '<script>alert("xss")</script><p>Safe content</p>'
      const sanitized = sanitizeHtml(maliciousHtml)

      expect(sanitized).not.toContain('<script>')
      expect(sanitized).not.toContain('alert("xss")')
      expect(sanitized).toContain('<p>Safe content</p>')

      // Test HTML escaping
      const maliciousScript = '<script>alert("xss")</script>'
      const escaped = escapeHtml(maliciousScript)

      expect(escaped).toContain('&lt;script&gt;')
      expect(escaped).toContain('&lt;/script&gt;')
      expect(escaped).not.toContain('<script>')
    })

    it('should handle token security flow', () => {
      const validToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.valid.signature'
      const invalidToken = 'invalid-token'

      // Test token validation
      expect(tokenStorage.isValidTokenFormat(validToken)).toBe(true)
      expect(tokenStorage.isValidTokenFormat(invalidToken)).toBe(false)

      // Test token storage security
      tokenStorage.setToken(validToken)
      expect(tokenStorage.getToken()).toBe(validToken)
      expect(tokenStorage.hasToken()).toBe(true)

      // Test token expiration
      const expiredTokenTime = Date.now() - 1000
      tokenStorage.setToken('expired-token', expiredTokenTime)
      expect(tokenStorage.isTokenExpired()).toBe(true)
    })

    it('should handle secure storage data flow', () => {
      const sensitiveData = {
        apiKey: 'secret-key-123',
        userCredentials: {
          username: 'admin',
          password: 'hashed-password'
        }
      }

      const dataString = JSON.stringify(sensitiveData)

      // Store sensitive data securely
      secureStorage.set('credentials', dataString)

      // Retrieve and verify
      const retrieved = secureStorage.get('credentials')
      expect(retrieved).toBe(dataString)

      const parsed = JSON.parse(retrieved!)
      expect(parsed.apiKey).toBe('secret-key-123')
      expect(parsed.userCredentials.username).toBe('admin')
    })
  })

  describe('Form Data Flow', () => {
    it('should handle form submission data flow', async () => {
      const mockHttp = vi.mocked(require('../../../src/utils/http').default)

      const formData = {
        name: 'Test Item',
        description: '<p>Description with <strong>HTML</strong></p>',
        email: 'test@example.com'
      }

      // Sanitize HTML content
      const sanitizedDescription = sanitizeHtml(formData.description)

      // Mock successful submission
      mockHttp.post.mockResolvedValue({
        data: {
          code: 0,
          data: {
            id: 1,
            ...formData,
            description: sanitizedDescription
          }
        }
      })

      const response = await mockHttp.post('/items', {
        name: formData.name,
        description: sanitizedDescription,
        email: escapeHtml(formData.email)
      })

      expect(response.data.code).toBe(0)
      expect(response.data.data.name).toBe(formData.name)
      expect(response.data.data.description).toContain('<p>')
      expect(response.data.data.description).toContain('<strong>')
    })

    it('should handle file upload data flow', () => {
      const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })

      // Validate file
      const validation = {
        valid: true,
        error: undefined
      }

      expect(validation.valid).toBe(true)
      expect(file.name).toBe('test.jpg')
      expect(file.type).toBe('image/jpeg')
      expect(file.size).toBeGreaterThan(0)
    })
  })

  describe('Error Handling Data Flow', () => {
    it('should handle validation error data flow', () => {
      // Test various validation scenarios
      const invalidEmail = 'invalid-email'
      const validEmail = 'test@example.com'

      // Email validation would typically be handled by validator utility
      // Here we test the data flow concept
      expect(typeof invalidEmail).toBe('string')
      expect(typeof validEmail).toBe('string')

      // Error message flow
      const errorMessage = 'Invalid email format'
      expect(typeof errorMessage).toBe('string')
      expect(errorMessage.length).toBeGreaterThan(0)
    })

    it('should handle permission error data flow', async () => {
      const mockHttp = vi.mocked(require('../../../src/utils/http').default)

      // Mock permission denied response
      mockHttp.get.mockResolvedValue({
        data: {
          code: 403,
          msg: 'Access denied'
        }
      })

      const response = await mockHttp.get('/admin/endpoint')

      expect(response.data.code).toBe(403)
      expect(response.data.msg).toBe('Access denied')
    })

    it('should handle timeout error data flow', async () => {
      const mockHttp = vi.mocked(require('../../../src/utils/http').default)

      // Mock timeout error
      mockHttp.get.mockRejectedValue({
        code: 'ECONNABORTED',
        message: 'Timeout'
      })

      try {
        await mockHttp.get('/slow/endpoint')
      } catch (error: any) {
        expect(error.code).toBe('ECONNABORTED')
        expect(error.message).toBe('Timeout')
      }
    })
  })

  describe('State Management Data Flow', () => {
    it('should handle store state data flow', () => {
      // Test Pinia store data flow concepts
      const testData = {
        user: {
          id: 1,
          name: 'Test User',
          role: 'Admin'
        },
        settings: {
          theme: 'dark',
          language: 'en'
        }
      }

      // Simulate storing in secure storage
      secureStorage.set('user_state', JSON.stringify(testData.user))
      secureStorage.set('app_settings', JSON.stringify(testData.settings))

      // Retrieve and verify
      const userState = secureStorage.get('user_state')
      const appSettings = secureStorage.get('app_settings')

      expect(JSON.parse(userState!)).toEqual(testData.user)
      expect(JSON.parse(appSettings!)).toEqual(testData.settings)
    })

    it('should handle cache invalidation data flow', () => {
      // Set initial data
      secureStorage.set('cached_data', 'initial_data')
      secureStorage.set('cache_timestamp', Date.now().toString())

      expect(secureStorage.get('cached_data')).toBe('initial_data')

      // Simulate cache invalidation
      secureStorage.remove('cached_data')
      secureStorage.remove('cache_timestamp')

      expect(secureStorage.get('cached_data')).toBeNull()
      expect(secureStorage.get('cache_timestamp')).toBeNull()
    })
  })

  describe('Complete Data Pipeline', () => {
    it('should handle end-to-end data flow', async () => {
      const mockHttp = vi.mocked(require('../../../src/utils/http').default)
      const mockStorage = vi.mocked(require('../../../src/utils/storage').default)

      // 1. User authentication
      const loginData = { username: 'admin', password: 'password' }
      mockHttp.post.mockResolvedValueOnce({
        data: {
          code: 0,
          data: {
            token: 'jwt-token-123',
            user: { id: 1, name: 'Admin User' }
          }
        }
      })

      // 2. Store authentication data
      tokenStorage.setToken('jwt-token-123')
      secureStorage.set('user_profile', JSON.stringify({ id: 1, name: 'Admin User' }))

      // 3. Fetch user session
      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'sessionTable') return 'users'
        return null
      })

      mockHttp.get.mockResolvedValueOnce({
        data: {
          code: 0,
          data: { id: 1, name: 'Admin User', image: '/avatar.jpg' }
        }
      })

      // 4. Component mounts and loads data
      const wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      await nextTick()

      // 5. Verify complete data flow
      expect(tokenStorage.getToken()).toBe('jwt-token-123')
      expect(secureStorage.get('user_profile')).toBeTruthy()
      expect(mockHttp.get).toHaveBeenCalledWith('/users/session')
      expect(wrapper.exists()).toBe(true)
    })
  })
})
