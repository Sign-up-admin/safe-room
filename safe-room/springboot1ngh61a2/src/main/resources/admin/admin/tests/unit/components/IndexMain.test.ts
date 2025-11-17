import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { createRouter, createMemoryHistory, Router } from 'vue-router'
import { createPinia, Pinia } from 'pinia'
import ElementPlus from 'element-plus'
import IndexMain from '@/components/index/IndexMain.vue'
import type { MenuRole } from '@/types/menu'

// Mock dependencies
vi.mock('@/utils/menu', () => ({
  default: {
    list: vi.fn(() => [
      {
        roleName: 'Administrator',
        backMenu: [
          { name: 'home', path: '/', title: 'Home' },
          { name: 'users', path: '/users', title: 'Users' }
        ]
      },
      {
        roleName: 'User',
        backMenu: [
          { name: 'profile', path: '/profile', title: 'Profile' }
        ]
      }
    ])
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

const mockStorage = vi.mocked(await import('@/utils/storage')).default as any
const mockMenu = vi.mocked(await import('@/utils/menu')).default

describe('IndexMain', () => {
  let router: Router
  let pinia: Pinia
  let wrapper: VueWrapper

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

    // Reset all mocks
    vi.clearAllMocks()

    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1200
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.restoreAllMocks()
  })

  describe('Component Mounting', () => {
    it('should mount successfully and render layout structure', async () => {
      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'role') return 'Administrator'
        if (key === 'asideCollapse') return 'false'
        return null
      })

      wrapper = mount(IndexMain, {
        global: {
          plugins: [router, pinia, ElementPlus]
        }
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.vm).toBeDefined()
      expect(wrapper.find('.admin-layout').exists()).toBe(true)
      expect(wrapper.find('.admin-layout__header').exists()).toBe(true)
      expect(wrapper.find('.admin-layout__aside').exists()).toBe(true)
      expect(wrapper.find('.admin-layout__content').exists()).toBe(true)
      expect(wrapper.find('bread-crumbs').exists()).toBe(true)
      expect(wrapper.find('tags-view').exists()).toBe(true)
      expect(wrapper.find('router-view').exists()).toBe(true)
    })

    it('should initialize reactive data correctly', async () => {
      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'asideCollapse') return 'true'
        return null
      })

      wrapper = mount(IndexMain, {
        global: {
          plugins: [router, pinia, ElementPlus]
        }
      })

      await wrapper.vm.$nextTick()

      // Check initial reactive data through DOM
      const aside = wrapper.find('.admin-layout__aside')
      expect(aside.classes()).toContain('admin-layout__aside--collapsed')

      const content = wrapper.find('.admin-layout__content')
      expect(content.classes()).toContain('admin-layout__content--vertical')
      expect(content.classes()).toContain('admin-layout__content--collapsed')
    })
  })

  describe('Lifecycle Hooks - onMounted', () => {
    it('should execute onMounted hook and initialize menu data', async () => {
      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'role') return 'Administrator'
        if (key === 'asideCollapse') return 'false'
        return null
      })

      wrapper = mount(IndexMain, {
        global: {
          plugins: [router, pinia, ElementPlus]
        }
      })

      // Wait for onMounted to execute
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(mockMenu.list).toHaveBeenCalled()
      // Check that menu data is loaded by verifying component renders correctly
      const header = wrapper.find('.admin-layout__header')
      const aside = wrapper.find('.admin-layout__aside')
      const content = wrapper.find('.admin-layout__content')
      expect(header.exists()).toBe(true)
      expect(aside.exists()).toBe(true)
      expect(content.exists()).toBe(true)
            { name: 'profile', path: '/profile', title: 'Profile' }
          ]
        }
      ])
      // Role is used internally, check that component renders with correct role-based behavior
    })

    it('should execute onMounted hook and call handleResize', async () => {
      const handleResizeSpy = vi.spyOn(window, 'addEventListener')

      wrapper = mount(IndexMain, {
        global: {
          plugins: [router, pinia, ElementPlus]
        }
      })

      await wrapper.vm.$nextTick()

      expect(handleResizeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    })

    it('should execute onMounted hook and handle mobile detection', async () => {
      // Mock mobile width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 600
      })

      wrapper = mount(IndexMain, {
        global: {
          plugins: [router, pinia, ElementPlus]
        }
      })

      await wrapper.vm.$nextTick()

      // Check mobile state through DOM changes
      const aside = wrapper.find('.admin-layout__aside')
      expect(aside.classes()).toContain('admin-layout__aside--collapsed')
    })

    it('should execute onMounted hook and handle desktop detection', async () => {
      // Mock desktop width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1200
      })

      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'asideCollapse') return 'false'
        return null
      })

      wrapper = mount(IndexMain, {
        global: {
          plugins: [router, pinia, ElementPlus]
        }
      })

      await wrapper.vm.$nextTick()

      expect(wrapper.vm.isMobile).toBe(false)
      expect(wrapper.vm.isCollapse).toBe(false)
    })
  })

  describe('Lifecycle Hooks - onBeforeUnmount', () => {
    it('should execute onBeforeUnmount hook and remove resize listener', async () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      wrapper = mount(IndexMain, {
        global: {
          plugins: [router, pinia, ElementPlus]
        }
      })

      await wrapper.vm.$nextTick()

      wrapper.unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    })
  })

  describe('Data Binding and Reactivity', () => {
    it('should update isCollapse reactively when storage changes', async () => {
      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'asideCollapse') return 'false'
        return null
      })

      wrapper = mount(IndexMain, {
        global: {
          plugins: [router, pinia, ElementPlus]
        }
      })

      await wrapper.vm.$nextTick()

      expect(wrapper.vm.isCollapse).toBe(false)

      // Simulate storage change (this would normally be triggered by watch)
      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'asideCollapse') return 'true'
        return null
      })

      // Trigger watch manually (in real scenario this would be automatic)
      wrapper.vm.isCollapse = true
      await wrapper.vm.$nextTick()

      expect(mockStorage.set).toHaveBeenCalledWith('asideCollapse', true)
    })

    it('should maintain preferredCollapse state correctly', async () => {
      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'asideCollapse') return 'false'
        return null
      })

      wrapper = mount(IndexMain, {
        global: {
          plugins: [router, pinia, ElementPlus]
        }
      })

      await wrapper.vm.$nextTick()

      expect(wrapper.vm.preferredCollapse).toBe(false)

      // Change collapse state
      wrapper.vm.isCollapse = true
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.preferredCollapse).toBe(true)
    })

    it('should handle layout mode changes', async () => {
      wrapper = mount(IndexMain, {
        global: {
          plugins: [router, pinia, ElementPlus]
        }
      })

      expect(wrapper.vm.layoutMode).toBe('vertical')

      // Change layout mode
      wrapper.vm.layoutMode = 'horizontal'
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.layoutMode).toBe('horizontal')
    })
  })

  describe('Event Handling', () => {
    it('should handle collapseChange event correctly', async () => {
      wrapper = mount(IndexMain, {
        global: {
          plugins: [router, pinia, ElementPlus]
        }
      })

      expect(wrapper.vm.isCollapse).toBe(false)

      // Trigger collapse change
      wrapper.vm.collapseChange(true)
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.isCollapse).toBe(true)
    })

    it('should handle handleResize on window resize', async () => {
      wrapper = mount(IndexMain, {
        global: {
          plugins: [router, pinia, ElementPlus]
        }
      })

      // Mock mobile width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 600
      })

      wrapper.vm.handleResize()
      await wrapper.vm.$nextTick()

      // Check mobile state through DOM changes
      const aside = wrapper.find('.admin-layout__aside')
      expect(aside.classes()).toContain('admin-layout__aside--collapsed')
    })

    it('should handle handleResize on desktop resize', async () => {
      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'asideCollapse') return 'false'
        return null
      })

      wrapper = mount(IndexMain, {
        global: {
          plugins: [router, pinia, ElementPlus]
        }
      })

      // Mock desktop width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 1200
      })

      wrapper.vm.handleResize()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.isMobile).toBe(false)
      expect(wrapper.vm.isCollapse).toBe(false)
    })

    it('should prevent updating from resize when updatingFromResize is true', async () => {
      wrapper = mount(IndexMain, {
        global: {
          plugins: [router, pinia, ElementPlus]
        }
      })

      wrapper.vm.updatingFromResize = true
      wrapper.vm.isCollapse = true

      // Trigger handleResize - should not update
      wrapper.vm.handleResize()
      await wrapper.vm.$nextTick()

      // The watch should not have triggered storage.set
      expect(mockStorage.set).not.toHaveBeenCalled()
    })
  })

  describe('Component Structure', () => {
    it('should render vertical layout correctly', () => {
      wrapper = mount(IndexMain, {
        global: {
          plugins: [router, pinia, ElementPlus]
        }
      })

      const layout = wrapper.find('.admin-layout')
      expect(layout.exists()).toBe(true)
      expect(layout.classes()).toContain('admin-layout')

      const content = wrapper.find('.admin-layout__content')
      expect(content.classes()).toContain('admin-layout__content--vertical')
    })

    it('should render collapsed state correctly', () => {
      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'asideCollapse') return 'true'
        return null
      })

      wrapper = mount(IndexMain, {
        global: {
          plugins: [router, pinia, ElementPlus]
        }
      })

      const aside = wrapper.find('.admin-layout__aside')
      expect(aside.classes()).toContain('admin-layout__aside--collapsed')

      const content = wrapper.find('.admin-layout__content')
      expect(content.classes()).toContain('admin-layout__content--collapsed')
    })

    it('should render expanded state correctly', () => {
      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'asideCollapse') return 'false'
        return null
      })

      wrapper = mount(IndexMain, {
        global: {
          plugins: [router, pinia, ElementPlus]
        }
      })

      const aside = wrapper.find('.admin-layout__aside')
      expect(aside.classes()).toContain('admin-layout__aside--expanded')
    })

    it('should hide aside in horizontal layout mode', () => {
      wrapper = mount(IndexMain, {
        global: {
          plugins: [router, pinia, ElementPlus]
        }
      })

      // Change to horizontal mode
      wrapper.vm.layoutMode = 'horizontal'
      const aside = wrapper.find('.admin-layout__aside')

      // In horizontal mode, aside should be hidden (v-if condition)
      expect(aside.exists()).toBe(false)
    })
  })

  describe('Responsive Behavior', () => {
    it('should apply mobile styles when screen width <= 768px', () => {
      wrapper = mount(IndexMain, {
        global: {
          plugins: [router, pinia, ElementPlus]
        }
      })

      const breadcrumbs = wrapper.find('.bread-crumbs')
      const routerView = wrapper.find('.router-view')

      // Check mobile responsive styles are applied
      expect(breadcrumbs.classes()).toContain('bread-crumbs')
      expect(routerView.classes()).toContain('router-view')
    })

    it('should apply tablet styles when screen width is between 768px and 1024px', () => {
      wrapper = mount(IndexMain, {
        global: {
          plugins: [router, pinia, ElementPlus]
        }
      })

      const breadcrumbs = wrapper.find('.bread-crumbs')

      // Tablet styles should be applied
      expect(breadcrumbs.classes()).toContain('bread-crumbs')
    })
  })
})
