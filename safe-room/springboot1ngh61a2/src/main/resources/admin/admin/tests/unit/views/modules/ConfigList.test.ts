import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia } from 'pinia'
import ConfigList from '../../../../src/views/modules/config/list.vue'
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

describe('ConfigList', () => {
  let router: any
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { name: 'config', path: '/config', component: ConfigList }
      ]
    })
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render the config list component', () => {
      const wrapper = mountComponent(ConfigList, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Configuration Management', () => {
    it('should load configuration data', async () => {
      const mockHttp = vi.mocked(http)
      mockHttp.get.mockResolvedValue({
        data: {
          code: 0,
          data: {
            list: [{ id: 1, key: 'test', value: 'value' }],
            total: 1
          }
        }
      })

      const wrapper = mountComponent(ConfigList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      expect(mockHttp.get).toHaveBeenCalledWith('/config/list', expect.any(Object))
    })

    it('should handle config operations', () => {
      const wrapper = mountComponent(ConfigList, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.vm).toBeDefined()
    })
  })
})
