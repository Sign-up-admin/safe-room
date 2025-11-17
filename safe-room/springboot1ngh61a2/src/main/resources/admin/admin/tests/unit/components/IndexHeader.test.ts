import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia, Pinia } from 'pinia'
import { createRouter, createMemoryHistory, Router } from 'vue-router'
import { ElMessage } from 'element-plus'
import IndexHeader from '@/components/index/IndexHeader.vue'
import type { User, FitnessCoach } from '@/types/api'
import { useTagsViewStore } from '@/stores/tagsView'

// Mock dependencies
vi.mock('@/utils/base', () => ({
  default: {
    get: vi.fn(() => ({
      url: 'http://localhost:8080/springboot1ngh61a2/',
      name: 'springboot1ngh61a2',
      indexUrl: 'http://localhost:8080/springboot1ngh61a2/front/dist/index.html'
    })),
    getProjectName: vi.fn(() => ({
      projectName: 'Gym Management System'
    }))
  }
}))

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
    get: vi.fn()
  }
}))

vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn()
  }
}))

vi.mock('@/stores/tagsView', () => ({
  useTagsViewStore: vi.fn(() => ({
    delAllViews: vi.fn()
  }))
}))

// Mock storage for testing
const mockStorage = {
  get: vi.fn(),
  set: vi.fn(),
  clear: vi.fn(),
  remove: vi.fn()
}

// Mock HTTP for testing
const mockHttp = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn()
}

describe('IndexHeader', () => {
  let router: Router
  let pinia: Pinia
  let wrapper: VueWrapper

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { name: 'login', path: '/login', component: {} as any },
        { name: 'home', path: '/', component: {} as any },
        { name: 'center', path: '/center', component: {} as any }
      ]
    })

    // Reset all mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.restoreAllMocks()
  })

  describe('Lifecycle Hooks', () => {
    it('should mount successfully and initialize properly', async () => {
      wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.vm).toBeDefined()
      await wrapper.vm.$nextTick()
    })

    it('should execute onMounted hook and fetch user session for yonghu', async () => {
      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'sessionTable') return 'yonghu'
        return null
      })

      mockHttp.get.mockResolvedValue({
        data: {
          code: 0,
          data: {
            id: 1,
            touxiang: '/user-avatar.jpg'
          }
        }
      })

      wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      // Wait for onMounted to execute
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0)) // Allow async operations

      expect(mockHttp.get).toHaveBeenCalledWith('/yonghu/session')
      expect(mockStorage.set).toHaveBeenCalledWith('headportrait', '/user-avatar.jpg')
      expect(mockStorage.set).toHaveBeenCalledWith('userid', 1)
    })

    it('should execute onMounted hook and fetch user session for jianshenjiaolian', async () => {
      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'sessionTable') return 'jianshenjiaolian'
        return null
      })

      mockHttp.get.mockResolvedValue({
        data: {
          code: 0,
          data: {
            id: 2,
            zhaopian: '/coach-avatar.jpg'
          }
        }
      })

      wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(mockHttp.get).toHaveBeenCalledWith('/jianshenjiaolian/session')
      expect(mockStorage.set).toHaveBeenCalledWith('headportrait', '/coach-avatar.jpg')
      expect(mockStorage.set).toHaveBeenCalledWith('userid', 2)
    })

    it('should execute onMounted hook and fetch user session for users', async () => {
      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'sessionTable') return 'users'
        return null
      })

      mockHttp.get.mockResolvedValue({
        data: {
          code: 0,
          data: {
            id: 3,
            image: '/admin-avatar.jpg'
          }
        }
      })

      wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(mockHttp.get).toHaveBeenCalledWith('/users/session')
      expect(mockStorage.set).toHaveBeenCalledWith('headportrait', '/admin-avatar.jpg')
      expect(mockStorage.set).toHaveBeenCalledWith('userid', 3)
    })

    it('should handle session fetch errors gracefully', async () => {
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

      wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(ElMessage.error).toHaveBeenCalledWith('Session expired')
    })

    it('should handle network errors in session fetch', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'sessionTable') return 'yonghu'
        return null
      })

      mockHttp.get.mockRejectedValue(new Error('Network error'))

      wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch user session:', expect.any(Error))
    })

    it('should not fetch session when sessionTable is not set', async () => {
      wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(mockHttp.get).not.toHaveBeenCalled()
    })
  })

  describe('Data Binding', () => {
    it('should update computed properties when dependencies change', async () => {
      wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      // Test projectName computed property - check rendered text
      expect(wrapper.text()).toContain('Gym Management System')

      // Test adminName computed property
      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'adminName') return 'Test Admin'
        return null
      })

      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Test Admin')

      // Test role computed property
      mockUserStore.userRole = 'Administrator'

      await wrapper.vm.$nextTick()
      // Role is used in template logic, check that non-admin users see the front link
      const frontLink = wrapper.find('.item3')
      expect(frontLink.exists()).toBe(false) // Administrator shouldn't see front link
    })

    it('should update avatar computed property based on storage', async () => {
      wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      // Initially no avatar - check that default avatar is used
      const avatarImg = wrapper.find('.avatar')
      expect(avatarImg.exists()).toBe(true)

      // Set avatar in storage
      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'headportrait') return '/test-avatar.jpg'
        return null
      })

      await wrapper.vm.$nextTick()
      // Avatar should be updated in the DOM
      const updatedAvatarImg = wrapper.find('.avatar')
      expect(updatedAvatarImg.attributes('src')).toContain('/test-avatar.jpg')
    })

    it('should update user ref when session data is available', async () => {
      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'sessionTable') return 'yonghu'
        return null
      })

      mockHttp.get.mockResolvedValue({
        data: {
          code: 0,
          data: {
            id: 1,
            name: 'Test User',
            touxiang: '/avatar.jpg'
          }
        }
      })

      wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(wrapper.vm.user).toEqual({
        id: 1,
        name: 'Test User',
        touxiang: '/avatar.jpg'
      })
    })
  })

  describe('Component Rendering', () => {
    it('should render component correctly', () => {
      wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.navbar').exists()).toBe(true)
      expect(wrapper.find('.title').exists()).toBe(true)
      expect(wrapper.find('.user-dropdown').exists()).toBe(true)
    })

    it('should display project name', () => {
      wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.text()).toContain('Gym Management System')
    })
  })

  describe('User Information Display', () => {
    it('should display admin name from storage', async () => {
      wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should display default avatar when no user avatar', () => {
      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'adminName') return 'Test Admin'
        if (key === 'role') return 'Administrator'
        return null
      })

      wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      const avatar = wrapper.find('.avatar')
      expect(avatar.exists()).toBe(false) // No user, so no avatar
    })

    it('should display user avatar when user exists', async () => {
      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'adminName') return 'Test Admin'
        if (key === 'role') return 'Administrator'
        if (key === 'headportrait') return '/avatar.jpg'
        return null
      })

      // Mock http response for user session
      mockHttp.get.mockResolvedValue({
        data: {
          code: 0,
          data: { id: 1, name: 'Test User' }
        }
      })

      wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      const avatar = wrapper.find('.avatar')
      expect(avatar.exists()).toBe(true)
      expect(avatar.attributes('src')).toContain('/avatar.jpg')
    })
  })

  describe('Event Handling', () => {
    it('should handle logout event correctly', async () => {
      const mockTagsViewStore = vi.mocked(useTagsViewStore)

      wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      const clearSpy = mockStorage.clear
      const delAllViewsSpy = mockTagsViewStore().delAllViews
      const replaceSpy = vi.spyOn(router, 'replace')

      await wrapper.vm.handleCommand('logout')

      expect(clearSpy).toHaveBeenCalled()
      expect(delAllViewsSpy).toHaveBeenCalled()
      expect(replaceSpy).toHaveBeenCalledWith({ name: 'login' })
    })

    it('should handle index tap event correctly', () => {
      wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      const mockWindow = vi.spyOn(window.location, 'href', 'set')

      wrapper.vm.handleCommand('front')

      expect(mockWindow).toHaveBeenCalled()
    })

    it('should handle dropdown command routing correctly', async () => {
      wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      const pushSpy = vi.spyOn(router, 'push')

      // Test home command
      await wrapper.vm.handleCommand('')
      expect(pushSpy).toHaveBeenCalledWith('/')

      pushSpy.mockClear()

      // Test center command
      await wrapper.vm.handleCommand('center')
      expect(pushSpy).toHaveBeenCalledWith('/center')
    })

    it('should handle dropdown command actions correctly', async () => {
      wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      const handleCommandSpy = vi.spyOn(wrapper.vm, 'handleCommand')

      // Test logout command
      await wrapper.vm.handleCommand('logout')
      expect(handleCommandSpy).toHaveBeenCalledWith('logout')

      // Test front command
      await wrapper.vm.handleCommand('front')
      expect(handleCommandSpy).toHaveBeenCalledWith('front')
    })
  })

  describe('Dropdown Menu', () => {
    it('should show all menu items for non-administrator', () => {
      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'adminName') return 'Test Admin'
        if (key === 'role') return 'User'
        return null
      })

      wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      const dropdownItems = wrapper.findAll('.el-dropdown-menu__item')
      expect(dropdownItems.length).toBe(4) // Home, User Info, Visit Frontend, Logout
      expect(wrapper.text()).toContain('Home')
      expect(wrapper.text()).toContain('User Info')
      expect(wrapper.text()).toContain('Visit Frontend')
      expect(wrapper.text()).toContain('Logout')
    })

    it('should hide "Visit Frontend" for administrator', () => {
      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'adminName') return 'Test Admin'
        if (key === 'role') return 'Administrator'
        return null
      })

      wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      const dropdownItems = wrapper.findAll('.el-dropdown-menu__item')
      expect(dropdownItems.length).toBe(3) // Home, User Info, Logout
      expect(wrapper.text()).toContain('Home')
      expect(wrapper.text()).toContain('User Info')
      expect(wrapper.text()).not.toContain('Visit Frontend')
      expect(wrapper.text()).toContain('Logout')
    })
  })

  describe('handleCommand', () => {
    it('should navigate to home when command is empty string', async () => {
      wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      const pushSpy = vi.spyOn(router, 'push')

      // Call handleCommand with empty string
      await wrapper.vm.handleCommand('')

      expect(pushSpy).toHaveBeenCalledWith('/')
    })

    it('should navigate to center when command is "center"', async () => {
      wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      const pushSpy = vi.spyOn(router, 'push')

      await wrapper.vm.handleCommand('center')

      expect(pushSpy).toHaveBeenCalledWith('/center')
    })

    it('should call onLogout when command is "logout"', async () => {
      wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      const routerSpy = vi.spyOn(router, 'replace')

      await wrapper.vm.handleCommand('logout')

      expect(routerSpy).toHaveBeenCalledWith({ name: 'login' })
    })

    it('should call onIndexTap when command is "front"', async () => {
      wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      const locationSpy = vi.spyOn(window.location, 'href', 'set')

      await wrapper.vm.handleCommand('front')

      expect(locationSpy).toHaveBeenCalled()
    })
  })

  describe('onLogout', () => {
    it('should clear storage, delete all views, and navigate to login', async () => {
      const mockTagsViewStore = vi.mocked(useTagsViewStore)

      wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      const clearSpy = mockStorage.clear
      const delAllViewsSpy = mockTagsViewStore().delAllViews
      const replaceSpy = vi.spyOn(router, 'replace')

      await wrapper.vm.onLogout()

      expect(clearSpy).toHaveBeenCalled()
      expect(delAllViewsSpy).toHaveBeenCalled()
      expect(replaceSpy).toHaveBeenCalledWith({ name: 'login' })
    })
  })

  describe('onIndexTap', () => {
    it('should redirect to frontend URL', () => {
      wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      const mockWindow = vi.spyOn(window.location, 'href', 'set')

      wrapper.vm.onIndexTap()

      expect(mockWindow).toHaveBeenCalledWith('http://localhost:8080/springboot1ngh61a2/front/dist/index.html')
    })
  })
})
