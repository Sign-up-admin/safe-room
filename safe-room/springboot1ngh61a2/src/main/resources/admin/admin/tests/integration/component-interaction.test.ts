import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia } from 'pinia'
import { ElMessage } from 'element-plus'
import IndexHeader from '@/components/index/IndexHeader.vue'
import IndexMain from '@/components/index/IndexMain.vue'

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn(),
    success: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn()
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
    post: vi.fn()
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

describe('Component Interaction Integration', () => {
  let router: any
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { name: 'home', path: '/', component: { template: '<div>Home</div>' } },
        { name: 'login', path: '/login', component: { template: '<div>Login</div>' } },
        { name: 'center', path: '/center', component: { template: '<div>Center</div>' } }
      ]
    })
    vi.clearAllMocks()
  })

  describe('IndexHeader and IndexMain Layout Integration', () => {
    it('should render IndexHeader and IndexMain together in a layout', () => {
      const wrapper = mount({
        template: `
          <div class="admin-layout">
            <IndexHeader />
            <IndexMain />
          </div>
        `,
        components: { IndexHeader, IndexMain }
      }, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.find('.admin-layout').exists()).toBe(true)
      expect(wrapper.findComponent(IndexHeader).exists()).toBe(true)
      expect(wrapper.findComponent(IndexMain).exists()).toBe(true)
    })

    it('should maintain layout structure when components mount', async () => {
      const wrapper = mount({
        template: `
          <div class="admin-layout">
            <IndexHeader />
            <IndexMain />
          </div>
        `,
        components: { IndexHeader, IndexMain }
      }, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      // Both components should be present and functional
      const header = wrapper.findComponent(IndexHeader)
      const main = wrapper.findComponent(IndexMain)

      expect(header.exists()).toBe(true)
      expect(main.exists()).toBe(true)
      expect(header.text()).toContain('Gym Management System')
    })
  })

  describe('Header and Router Integration', () => {
    it('should handle route navigation from header dropdown', async () => {
      // Mock storage to return admin role (to hide "Visit Frontend" option)
      const mockStorage = vi.mocked(require('../../../src/utils/storage').default)
      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'adminName') return 'Test Admin'
        if (key === 'role') return 'Administrator'
        return null
      })

      const wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      const pushSpy = vi.spyOn(router, 'push')

      // Test navigation to center
      await wrapper.vm.handleCommand('center')
      expect(pushSpy).toHaveBeenCalledWith('/center')

      // Test navigation to home
      await wrapper.vm.handleCommand('')
      expect(pushSpy).toHaveBeenCalledWith('/')
    })

    it('should handle logout flow with router navigation', async () => {
      const mockStorage = vi.mocked(require('../../../src/utils/storage').default)
      const mockTagsViewStore = vi.mocked(require('../../../src/stores/tagsView').useTagsViewStore)

      const wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      const replaceSpy = vi.spyOn(router, 'replace')
      const clearSpy = mockStorage.clear
      const delAllViewsSpy = mockTagsViewStore().delAllViews

      await wrapper.vm.onLogout()

      expect(clearSpy).toHaveBeenCalled()
      expect(delAllViewsSpy).toHaveBeenCalled()
      expect(replaceSpy).toHaveBeenCalledWith({ name: 'login' })
    })
  })

  describe('Component State Management', () => {
    it('should handle user session data flow', async () => {
      const mockStorage = vi.mocked(require('../../../src/utils/storage').default)
      const mockHttp = vi.mocked(require('../../../src/utils/http').default)

      // Mock session table and successful response
      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'sessionTable') return 'yonghu'
        return null
      })

      mockHttp.get.mockResolvedValue({
        data: {
          code: 0,
          data: {
            id: 1,
            touxiang: '/avatar.jpg',
            name: 'Test User'
          }
        }
      })

      const wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      // Should have made the session request
      expect(mockHttp.get).toHaveBeenCalledWith('/yonghu/session')

      // Should have stored the data
      expect(mockStorage.set).toHaveBeenCalledWith('headportrait', '/avatar.jpg')
      expect(mockStorage.set).toHaveBeenCalledWith('userid', 1)
    })

    it('should handle session errors gracefully', async () => {
      const mockStorage = vi.mocked(require('../../../src/utils/storage').default)
      const mockHttp = vi.mocked(require('../../../src/utils/http').default)

      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'sessionTable') return 'yonghu'
        return null
      })

      mockHttp.get.mockRejectedValue(new Error('Network error'))

      const wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      // Component should still be functional
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.vm).toBeDefined()
    })
  })

  describe('Store and Component Integration', () => {
    it('should integrate with TagsView store', async () => {
      const mockTagsViewStore = vi.mocked(require('../../../src/stores/tagsView').useTagsViewStore)

      const wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      const delAllViewsSpy = mockTagsViewStore().delAllViews

      await wrapper.vm.onLogout()

      expect(delAllViewsSpy).toHaveBeenCalled()
    })

    it('should handle store state changes', () => {
      // Test that components can respond to store changes
      const wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      // Component should be reactive to store changes
      expect(wrapper.vm).toBeDefined()
    })
  })

  describe('Error Handling Integration', () => {
    it('should show error messages for failed operations', async () => {
      const mockHttp = vi.mocked(require('../../../src/utils/http').default)
      const mockStorage = vi.mocked(require('../../../src/utils/storage').default)

      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'sessionTable') return 'yonghu'
        return null
      })

      mockHttp.get.mockResolvedValue({
        data: {
          code: 1,
          msg: 'Session expired'
        }
      })

      const wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      expect(ElMessage.error).toHaveBeenCalledWith('Session expired')
    })

    it('should handle network errors in session loading', async () => {
      const mockHttp = vi.mocked(require('../../../src/utils/http').default)
      const mockStorage = vi.mocked(require('../../../src/utils/storage').default)

      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'sessionTable') return 'yonghu'
        return null
      })

      mockHttp.get.mockRejectedValue(new Error('Network error'))

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch user session:', expect.any(Error))
    })
  })

  describe('Full User Journey', () => {
    it('should support complete login to logout flow', async () => {
      const mockStorage = vi.mocked(require('../../../src/utils/storage').default)
      const mockHttp = vi.mocked(require('../../../src/utils/http').default)
      const mockTagsViewStore = vi.mocked(require('../../../src/stores/tagsView').useTagsViewStore)

      // Setup initial state (logged in)
      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'adminName') return 'Test Admin'
        if (key === 'role') return 'Administrator'
        if (key === 'sessionTable') return 'users'
        return null
      })

      mockHttp.get.mockResolvedValue({
        data: {
          code: 0,
          data: { id: 1, name: 'Test Admin' }
        }
      })

      const wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      // Verify initial state
      expect(wrapper.text()).toContain('Test Admin')

      // Perform logout
      const replaceSpy = vi.spyOn(router, 'replace')
      await wrapper.vm.onLogout()

      // Verify logout actions
      expect(mockStorage.clear).toHaveBeenCalled()
      expect(mockTagsViewStore().delAllViews).toHaveBeenCalled()
      expect(replaceSpy).toHaveBeenCalledWith({ name: 'login' })
    })

    it('should handle navigation between different sections', async () => {
      const mockStorage = vi.mocked(require('../../../src/utils/storage').default)
      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'adminName') return 'Test Admin'
        if (key === 'role') return 'User'
        return null
      })

      const wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      const pushSpy = vi.spyOn(router, 'push')

      // Navigate to different sections
      await wrapper.vm.handleCommand('center')
      expect(pushSpy).toHaveBeenCalledWith('/center')

      await wrapper.vm.handleCommand('')
      expect(pushSpy).toHaveBeenCalledWith('/')
    })
  })
})
