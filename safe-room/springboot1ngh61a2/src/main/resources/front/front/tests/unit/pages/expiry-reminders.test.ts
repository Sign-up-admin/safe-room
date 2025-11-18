import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { ElMessage } from 'element-plus'
import ExpiryReminders from '@/pages/daoqitixing/list.vue'
import { getModuleService } from '@/services/crud'
import type { Router } from 'vue-router'

// Mock dependencies
vi.mock('@/services/crud', () => ({
  getModuleService: vi.fn(() => ({
    list: vi.fn(),
  })),
}))

vi.mock('@/composables/useMessageCenter', () => ({
  useMessageCenter: () => ({
    unreadCount: ref(5),
    loadUnreadCount: vi.fn(),
  }),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

vi.mock('@/components/common', () => ({
  TechButton: {
    name: 'TechButton',
    template: '<button @click="$emit(\'click\')" :class="variant" :size="size"><slot /></button>',
    props: ['variant', 'size'],
  },
  TechCard: {
    name: 'TechCard',
    template: '<div class="tech-card"><div v-if="$slots.title" class="card-title"><slot name="title" /></div><slot /></div>',
    props: ['title', 'interactive'],
  },
}))

vi.mock('@/utils/formatters', () => ({
  formatDate: vi.fn((date) => new Date(date).toLocaleDateString('zh-CN')),
}))

describe('ExpiryReminders Page', () => {
  let router: Partial<Router>
  let pinia: any
  let mockService: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    router = createRouter({
      history: createWebHistory(),
      routes: [{ path: '/', component: { template: '<div></div>' } }],
    })

    mockService = {
      list: vi.fn(),
    }
    ;(getModuleService as any).mockReturnValue(mockService)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Initialization', () => {
    it('should load reminders and message count on mount', async () => {
      const mockReminders = [
        {
          id: 1,
          yonghuxingming: '张三',
          huiyuankahao: 'VIP001',
          tixingshijian: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          beizhu: '会员卡即将到期，请及时续费',
        },
        {
          id: 2,
          yonghuxingming: '李四',
          huiyuankahao: 'VIP002',
          tixingshijian: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          beizhu: '紧急提醒：会员卡即将到期',
        },
      ]

      mockService.list.mockResolvedValue({ list: mockReminders })

      const wrapper = mount(ExpiryReminders, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0)) // Wait for onMounted

      expect(mockService.list).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        sort: 'tixingshijian',
        order: 'asc',
      })
      expect(wrapper.vm.reminders).toEqual(mockReminders)
    })
  })

  describe('Timeline Filtering', () => {
    it('should filter reminders by type', async () => {
      const mockReminders = [
        {
          id: 1,
          tixingshijian: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          tixingshijian: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 3,
          tixingshijian: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]

      mockService.list.mockResolvedValue({ list: mockReminders })

      const wrapper = mount(ExpiryReminders, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      // Test filtering urgent reminders
      await wrapper.setData({ filterType: 'urgent' })
      const urgentReminders = wrapper.vm.filteredReminders
      expect(urgentReminders.every((reminder: any) => reminder.level === 'urgent')).toBe(true)

      // Test showing all reminders
      await wrapper.setData({ filterType: 'all' })
      const allReminders = wrapper.vm.filteredReminders
      expect(allReminders).toHaveLength(3)
    })

    it('should sort reminders by date and priority', async () => {
      const mockReminders = [
        {
          id: 1,
          tixingshijian: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          tixingshijian: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 3,
          tixingshijian: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]

      mockService.list.mockResolvedValue({ list: mockReminders })

      const wrapper = mount(ExpiryReminders, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      // Test date sorting
      await wrapper.setData({ sortBy: 'date' })
      const dateSorted = wrapper.vm.filteredReminders
      expect(new Date(dateSorted[0].tixingshijian).getTime()).toBeLessThan(
        new Date(dateSorted[1].tixingshijian).getTime()
      )

      // Test priority sorting
      await wrapper.setData({ sortBy: 'priority' })
      const prioritySorted = wrapper.vm.filteredReminders
      expect(prioritySorted[0].priority).toBeLessThanOrEqual(prioritySorted[1].priority)
    })
  })

  describe('Timeline Interactions', () => {
    it('should toggle reminder expansion', async () => {
      const mockReminders = [
        {
          id: 1,
          tixingshijian: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]

      mockService.list.mockResolvedValue({ list: mockReminders })

      const wrapper = mount(ExpiryReminders, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const reminder = wrapper.vm.filteredReminders[0]
      expect(reminder.expanded).toBe(false)

      wrapper.vm.toggleExpand(reminder)
      expect(reminder.expanded).toBe(true)

      wrapper.vm.toggleExpand(reminder)
      expect(reminder.expanded).toBe(false)
    })

    it('should handle reminder selection', async () => {
      const mockReminders = [
        {
          id: 1,
          tixingshijian: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          tixingshijian: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]

      mockService.list.mockResolvedValue({ list: mockReminders })

      const wrapper = mount(ExpiryReminders, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const reminders = wrapper.vm.filteredReminders
      reminders[0].selected = true
      reminders[1].selected = true

      wrapper.vm.updateSelection()

      expect(wrapper.vm.selectedItems).toEqual([1, 2])
    })
  })

  describe('Bulk Operations', () => {
    it('should mark selected reminders as processed', async () => {
      const mockReminders = [
        {
          id: 1,
          selected: true,
          tixingshijian: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          selected: false,
          tixingshijian: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]

      mockService.list.mockResolvedValue({ list: mockReminders })

      const wrapper = mount(ExpiryReminders, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      wrapper.vm.markAsProcessed()

      const reminders = wrapper.vm.filteredReminders
      expect(reminders[0].selected).toBe(false)
      expect(wrapper.vm.selectedItems).toEqual([])
    })

    it('should postpone selected reminders', async () => {
      const mockReminders = [
        {
          id: 1,
          selected: true,
          tixingshijian: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]

      mockService.list.mockResolvedValue({ list: mockReminders })

      const wrapper = mount(ExpiryReminders, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      wrapper.vm.postponeReminders()

      const reminders = wrapper.vm.filteredReminders
      expect(reminders[0].selected).toBe(false)
      expect(wrapper.vm.selectedItems).toEqual([])
    })

    it('should delete selected reminders', async () => {
      const mockReminders = [
        {
          id: 1,
          selected: true,
          tixingshijian: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]

      mockService.list.mockResolvedValue({ list: mockReminders })

      const wrapper = mount(ExpiryReminders, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      wrapper.vm.deleteSelected()

      const reminders = wrapper.vm.filteredReminders
      expect(reminders[0].selected).toBe(false)
      expect(wrapper.vm.selectedItems).toEqual([])
    })
  })

  describe('Individual Reminder Actions', () => {
    it('should postpone individual reminder', async () => {
      const mockReminders = [
        {
          id: 1,
          tixingshijian: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]

      mockService.list.mockResolvedValue({ list: mockReminders })

      const wrapper = mount(ExpiryReminders, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const reminder = wrapper.vm.filteredReminders[0]
      wrapper.vm.postponeReminder(reminder)

      // Should not throw error
      expect(true).toBe(true)
    })

    it('should mark individual reminder as processed', async () => {
      const mockReminders = [
        {
          id: 1,
          tixingshijian: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]

      mockService.list.mockResolvedValue({ list: mockReminders })

      const wrapper = mount(ExpiryReminders, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const reminder = wrapper.vm.filteredReminders[0]
      wrapper.vm.markProcessed(reminder)

      // Should not throw error
      expect(true).toBe(true)
    })
  })

  describe('Statistics Display', () => {
    it('should calculate urgent reminder count correctly', async () => {
      const mockReminders = [
        {
          id: 1,
          tixingshijian: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1天后
        },
        {
          id: 2,
          tixingshijian: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2天后
        },
        {
          id: 3,
          tixingshijian: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10天后
        },
      ]

      mockService.list.mockResolvedValue({ list: mockReminders })

      const wrapper = mount(ExpiryReminders, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const urgentCount = wrapper.vm.urgentCount
      expect(urgentCount).toBe(2) // 前两个都是3天内到期
    })
  })

  describe('Strategy Management', () => {
    it('should update reminder strategy', async () => {
      mockService.list.mockResolvedValue({ list: [] })

      const wrapper = mount(ExpiryReminders, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      const newStrategy = {
        threshold: 14,
        sms: false,
        inbox: true,
        email: true,
        time: '10:00',
      }

      await wrapper.setData({ strategy: newStrategy })
      wrapper.vm.saveStrategy()

      expect(wrapper.vm.strategy.threshold).toBe(14)
      expect(wrapper.vm.strategy.sms).toBe(false)
      expect(wrapper.vm.strategy.email).toBe(true)
    })
  })

  describe('Navigation', () => {
    it('should navigate to renewal page', async () => {
      const pushSpy = vi.fn()
      vi.mocked(router.push).mockImplementation(pushSpy)

      mockService.list.mockResolvedValue({ list: [] })

      const wrapper = mount(ExpiryReminders, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      wrapper.vm.goRenew()

      expect(pushSpy).toHaveBeenCalledWith('/index/huiyuanxufei')
    })

    it('should navigate to reminder detail page', async () => {
      const pushSpy = vi.fn()
      vi.mocked(router.push).mockImplementation(pushSpy)

      mockService.list.mockResolvedValue({ list: [] })

      const wrapper = mount(ExpiryReminders, {
        global: {
          plugins: [router, pinia],
        },
      })

      await new Promise(resolve => setTimeout(resolve, 0))

      wrapper.vm.openList()

      expect(pushSpy).toHaveBeenCalledWith('/index/daoqitixingDetail')
    })
  })
})
