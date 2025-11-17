import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia } from 'pinia'
import ChatList from '@/views/modules/chat/list.vue'
import http from '@/utils/http'

vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn()
  }
}))

vi.mock('@/utils/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

vi.mock('@/utils/storage', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn()
  }
}))

vi.mock('@/utils/base', () => ({
  default: {
    get: vi.fn(() => ({ url: 'http://localhost:8080' }))
  }
}))

describe('ChatList', () => {
  let router: any
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { name: 'chat', path: '/chat', component: ChatList }
      ]
    })
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render the chat list component', () => {
      const wrapper = mount(ChatList, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Chat Management', () => {
    it('should load chat data', async () => {
      const mockHttp = vi.mocked(http)
      mockHttp.get.mockResolvedValue({
        data: {
          code: 0,
          data: {
            list: [{ id: 1, message: 'Hello' }],
            total: 1
          }
        }
      })

      const wrapper = mount(ChatList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      expect(mockHttp.get).toHaveBeenCalledWith('/chat/list', expect.any(Object))
    })

    it('should handle chat operations', () => {
      const wrapper = mount(ChatList, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.vm).toBeDefined()
    })
  })
})
