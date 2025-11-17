import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
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

describe('IndexHeader', () => {
  let router: any
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { name: 'login', path: '/login' },
        { name: 'home', path: '/' },
        { name: 'center', path: '/center' }
      ]
    })

    // Reset all mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render component correctly', () => {
      const wrapper = mount(IndexHeader, {
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
      const wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.text()).toContain('Gym Management System')
    })
  })

  describe('User Information Display', () => {
    it('should display admin name from storage', async () => {
      const wrapper = mount(IndexHeader, {
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

      const wrapper = mount(IndexHeader, {
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

      const wrapper = mount(IndexHeader, {
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

  describe('Dropdown Menu', () => {
    it('should show all menu items for non-administrator', () => {
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

      const wrapper = mount(IndexHeader, {
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
      const wrapper = mount(IndexHeader, {
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
      const wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      const pushSpy = vi.spyOn(router, 'push')

      await wrapper.vm.handleCommand('center')

      expect(pushSpy).toHaveBeenCalledWith('/center')
    })

    it('should call onLogout when command is "logout"', async () => {
      const wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      const logoutSpy = vi.spyOn(wrapper.vm, 'onLogout')

      await wrapper.vm.handleCommand('logout')

      expect(logoutSpy).toHaveBeenCalled()
    })

    it('should call onIndexTap when command is "front"', async () => {
      const wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      const indexTapSpy = vi.spyOn(wrapper.vm, 'onIndexTap')

      await wrapper.vm.handleCommand('front')

      expect(indexTapSpy).toHaveBeenCalled()
    })
  })

  describe('onLogout', () => {
    it('should clear storage, delete all views, and navigate to login', async () => {
      const mockTagsViewStore = vi.mocked(useTagsViewStore)

      const wrapper = mount(IndexHeader, {
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
      const wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      const mockWindow = vi.spyOn(window.location, 'href', 'set')

      wrapper.vm.onIndexTap()

      expect(mockWindow).toHaveBeenCalledWith('http://localhost:8080/springboot1ngh61a2/front/dist/index.html')
    })
  })

  describe('onMounted - User Session', () => {
    it('should fetch user session for yonghu and set avatar', async () => {

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

      const wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      expect(mockHttp.get).toHaveBeenCalledWith('/yonghu/session')
      expect(mockStorage.set).toHaveBeenCalledWith('headportrait', '/user-avatar.jpg')
      expect(mockStorage.set).toHaveBeenCalledWith('userid', 1)
    })

    it('should fetch user session for jianshenjiaolian and set avatar', async () => {

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

      const wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      expect(mockHttp.get).toHaveBeenCalledWith('/jianshenjiaolian/session')
      expect(mockStorage.set).toHaveBeenCalledWith('headportrait', '/coach-avatar.jpg')
      expect(mockStorage.set).toHaveBeenCalledWith('userid', 2)
    })

    it('should fetch user session for users and set avatar', async () => {

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

      const wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      expect(mockHttp.get).toHaveBeenCalledWith('/users/session')
      expect(mockStorage.set).toHaveBeenCalledWith('headportrait', '/admin-avatar.jpg')
      expect(mockStorage.set).toHaveBeenCalledWith('userid', 3)
    })

    it('should show error message when session fetch fails', async () => {

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

    it('should handle network errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

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

      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch user session:', expect.any(Error))
    })

    it('should not fetch session when sessionTable is not set', async () => {

      const wrapper = mount(IndexHeader, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      expect(mockHttp.get).not.toHaveBeenCalled()
    })
  })
})
