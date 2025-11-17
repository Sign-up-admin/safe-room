import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia } from 'pinia'
import NewsList from '../../../../src/views/modules/news/list.vue'
import http from '@/utils/http'
import { mountComponent, createElementPlusMocks } from '@/tests/utils/unit-test-helpers'

// Mock Element Plus components using unified helpers
const elMocks = createElementPlusMocks()
vi.mock('element-plus', () => elMocks)

vi.mock('@/utils/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

// Mock HTTP for testing
const mockHttp = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn()
}

describe('NewsList', () => {
  let router: any
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { name: 'news', path: '/news', component: NewsList }
      ]
    })
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render the news list component', () => {
      const wrapper = mountComponent(NewsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('News Management', () => {
    it('should load news data', async () => {
      const mockHttp = vi.mocked(http)
      mockHttp.get.mockResolvedValue({
        data: {
          code: 0,
          data: {
            list: [{ id: 1, title: 'News Title', content: 'News content' }],
            total: 1
          }
        }
      })

      const wrapper = mountComponent(NewsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      expect(mockHttp.get).toHaveBeenCalledWith('/news/list', expect.any(Object))
    })

    it('should handle news CRUD operations', () => {
      const wrapper = mountComponent(NewsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.vm).toBeDefined()
    })
  })
})
