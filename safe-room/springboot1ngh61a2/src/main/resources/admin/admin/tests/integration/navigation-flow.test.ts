import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia } from 'pinia'
import { nextTick } from 'vue'
import App from '../../src/App.vue'
import IndexHeader from '../../src/components/index/IndexHeader.vue'

// Mock utils
vi.mock('@/utils/storage', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    clear: vi.fn(),
    remove: vi.fn()
  }
}))

vi.mock('@/utils/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

vi.mock('@/utils/base', () => ({
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

vi.mock('@/stores/tagsView', () => ({
  useTagsViewStore: vi.fn(() => ({
    delAllViews: vi.fn()
  }))
}))

describe('Navigation Flow Integration', () => {
  let router: any
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          name: 'home',
          path: '/',
          component: { template: '<div>Home Page</div>' },
          meta: { title: 'Home' }
        },
        {
          name: 'login',
          path: '/login',
          component: { template: '<div>Login Page</div>' },
          meta: { title: 'Login' }
        },
        {
          name: 'center',
          path: '/center',
          component: { template: '<div>User Center</div>' },
          meta: { title: 'User Center' }
        },
        {
          name: 'board',
          path: '/board',
          component: { template: '<div>Dashboard</div>' },
          meta: { title: 'Dashboard' }
        }
      ]
    })
    vi.clearAllMocks()
  })

  describe('App Router Integration', () => {
    it('should render different components based on route', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [router, pinia]
        }
      })

      // Navigate to home
      await router.push('/')
      await nextTick()

      expect(wrapper.find('router-view').exists()).toBe(true)

      // Navigate to login
      await router.push('/login')
      await nextTick()

      expect(wrapper.find('router-view').exists()).toBe(true)
    })

    it('should maintain app structure across route changes', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [router, pinia]
        }
      })

      // Check initial structure
      expect(wrapper.find('#app').exists()).toBe(true)
      expect(wrapper.find('router-view').exists()).toBe(true)

      // Navigate through different routes
      await router.push('/')
      await nextTick()
      expect(wrapper.find('#app').exists()).toBe(true)

      await router.push('/login')
      await nextTick()
      expect(wrapper.find('#app').exists()).toBe(true)

      await router.push('/center')
      await nextTick()
      expect(wrapper.find('#app').exists()).toBe(true)
    })
  })

  describe('Header Navigation Integration', () => {
    it('should navigate to center from header dropdown', async () => {
      const mockStorage = vi.mocked(require('@/utils/storage').default)
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

      await router.push('/')
      await nextTick()

      const pushSpy = vi.spyOn(router, 'push')

      // Trigger navigation from header
      await wrapper.vm.handleCommand('center')

      expect(pushSpy).toHaveBeenCalledWith('/center')
      expect(router.currentRoute.value.name).toBe('center')
    })

    it('should navigate to home from header dropdown', async () => {
      const mockStorage = vi.mocked(require('@/utils/storage').default)
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

      await router.push('/center')
      await nextTick()

      const pushSpy = vi.spyOn(router, 'push')

      // Trigger navigation to home
      await wrapper.vm.handleCommand('')

      expect(pushSpy).toHaveBeenCalledWith('/')
      expect(router.currentRoute.value.name).toBe('home')
    })

    it('should navigate to login on logout', async () => {
      const mockStorage = vi.mocked(require('@/utils/storage').default)
      const mockTagsViewStore = vi.mocked(require('@/stores/tagsView').useTagsViewStore)

      const wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/')
      await nextTick()

      const replaceSpy = vi.spyOn(router, 'replace')

      // Trigger logout
      await wrapper.vm.onLogout()

      expect(replaceSpy).toHaveBeenCalledWith({ name: 'login' })
      expect(router.currentRoute.value.name).toBe('login')
    })
  })

  describe('Route Guards and Navigation Flow', () => {
    it('should handle programmatic navigation', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [router, pinia]
        }
      })

      // Start at home
      await router.push('/')
      await nextTick()
      expect(router.currentRoute.value.name).toBe('home')

      // Navigate programmatically
      await router.push('/center')
      await nextTick()
      expect(router.currentRoute.value.name).toBe('center')

      // Navigate back
      await router.push('/')
      await nextTick()
      expect(router.currentRoute.value.name).toBe('home')
    })

    it('should handle navigation with query parameters', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [router, pinia]
        }
      })

      await router.push('/center?tab=profile')
      await nextTick()

      expect(router.currentRoute.value.name).toBe('center')
      expect(router.currentRoute.value.query.tab).toBe('profile')
    })
  })

  describe('Component Lifecycle with Navigation', () => {
    it('should handle component mounting/unmounting during navigation', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [router, pinia]
        }
      })

      // Navigate to different routes and ensure app remains stable
      await router.push('/')
      await nextTick()

      await router.push('/login')
      await nextTick()

      await router.push('/center')
      await nextTick()

      // App should still be functional
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('#app').exists()).toBe(true)
    })

    it('should maintain component state across navigation', async () => {
      const mockStorage = vi.mocked(require('@/utils/storage').default)
      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'adminName') return 'Test Admin'
        if (key === 'role') return 'Administrator'
        return null
      })

      const headerWrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      // Navigate around
      await router.push('/')
      await nextTick()

      await router.push('/center')
      await nextTick()

      // Header component should maintain its state
      expect(headerWrapper.exists()).toBe(true)
      expect(headerWrapper.text()).toContain('Test Admin')
    })
  })

  describe('Error Navigation', () => {
    it('should handle navigation to non-existent routes', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [router, pinia]
        }
      })

      // Try to navigate to non-existent route
      await router.push('/non-existent')
      await nextTick()

      // App should handle gracefully
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('#app').exists()).toBe(true)
    })

    it('should handle logout navigation errors gracefully', async () => {
      const mockStorage = vi.mocked(require('@/utils/storage').default)
      const mockTagsViewStore = vi.mocked(require('@/stores/tagsView').useTagsViewStore)

      const wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      // Mock router.replace to throw error
      const replaceSpy = vi.spyOn(router, 'replace').mockImplementation(() => {
        throw new Error('Navigation error')
      })

      // Logout should not crash the app
      expect(async () => {
        await wrapper.vm.onLogout()
      }).not.toThrow()

      replaceSpy.mockRestore()
    })
  })

  describe('Complete Navigation Scenarios', () => {
    it('should support login -> dashboard -> logout flow', async () => {
      const mockStorage = vi.mocked(require('@/utils/storage').default)
      const mockTagsViewStore = vi.mocked(require('@/stores/tagsView').useTagsViewStore)

      const appWrapper = mount(App, {
        global: {
          plugins: [router, pinia]
        }
      })

      const headerWrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      // Start at login
      await router.push('/login')
      await nextTick()
      expect(router.currentRoute.value.name).toBe('login')

      // Mock logged in state
      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'adminName') return 'Test Admin'
        if (key === 'role') return 'Administrator'
        return null
      })

      // Navigate to dashboard
      await router.push('/board')
      await nextTick()
      expect(router.currentRoute.value.name).toBe('board')

      // Perform logout
      const replaceSpy = vi.spyOn(router, 'replace')
      await headerWrapper.vm.onLogout()

      expect(mockStorage.clear).toHaveBeenCalled()
      expect(mockTagsViewStore().delAllViews).toHaveBeenCalled()
      expect(replaceSpy).toHaveBeenCalledWith({ name: 'login' })
      expect(router.currentRoute.value.name).toBe('login')
    })

    it('should handle rapid navigation changes', async () => {
      const wrapper = mount(App, {
        global: {
          plugins: [router, pinia]
        }
      })

      // Rapidly change routes
      await router.push('/')
      await router.push('/login')
      await router.push('/center')
      await router.push('/board')
      await router.push('/')

      await nextTick()

      // App should remain stable
      expect(wrapper.exists()).toBe(true)
      expect(router.currentRoute.value.name).toBe('home')
    })
  })
})
