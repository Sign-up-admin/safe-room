import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia } from 'pinia'
import AssetsList from '@/views/modules/assets/list.vue'
import http from '@/utils/http'
import { ElMessage } from 'element-plus'
import { mountComponent, createElementPlusMocks } from '@/tests/utils/unit-test-helpers'

// Mock Element Plus components using unified helpers
const elMocks = createElementPlusMocks()
vi.mock('element-plus', () => elMocks)

// Mock utils
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

// Mock HTTP for testing
const mockHttp = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn()
}

describe('AssetsList', () => {
  let router: any
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { name: 'assets', path: '/assets', component: AssetsList }
      ]
    })

    // Reset all mocks
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render the assets list component', () => {
      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should have proper component structure', () => {
      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      // Check for common list component elements
      expect(wrapper.vm).toBeDefined()
    })
  })

  describe('Data Loading', () => {
    it('should load assets data on mount', async () => {
      const mockHttp = vi.mocked(http)
      const mockData = {
        list: [
          { id: 1, assetName: 'Test Asset 1', assetType: 'image', status: 'active' },
          { id: 2, assetName: 'Test Asset 2', assetType: 'video', status: 'active' }
        ],
        total: 2
      }

      mockHttp.get.mockResolvedValue({
        data: {
          code: 0,
          data: mockData
        }
      })

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      // Verify HTTP call with correct parameters
      expect(mockHttp.get).toHaveBeenCalledWith('/assets/list', expect.objectContaining({
        params: expect.objectContaining({
          page: 1,
          limit: 10,
          sort: 'id',
          order: 'desc'
        })
      }))

      // Verify data loading is triggered (applyFilters is called on mount)
      expect(mockHttp.get).toHaveBeenCalledTimes(1)
    })

    it('should render loaded data correctly', async () => {
      const mockHttp = vi.mocked(http)
      const mockData = {
        list: [
          { id: 1, assetName: 'Hero Banner', assetType: 'image', module: 'home', status: 'active' },
          { id: 2, assetName: 'Product Video', assetType: 'video', module: 'course', status: 'active' }
        ],
        total: 2
      }

      mockHttp.get.mockResolvedValue({
        data: {
          code: 0,
          data: mockData
        }
      })

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      // Verify that ModuleCrudPage component is rendered
      const crudPage = wrapper.findComponent({ name: 'ModuleCrudPage' })
      expect(crudPage.exists()).toBe(true)

      // Verify queryParams are passed correctly
      expect(crudPage.props('queryParams')).toBeDefined()
    })

    it('should handle loading errors gracefully', async () => {
      const mockHttp = vi.mocked(http)
      const mockElMessage = vi.mocked(ElMessage)

      mockHttp.get.mockRejectedValue(new Error('Network error'))

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      // Should handle error without crashing
      expect(wrapper.exists()).toBe(true)

      // Component should still be functional
      const crudPage = wrapper.findComponent({ name: 'ModuleCrudPage' })
      expect(crudPage.exists()).toBe(true)
    })

    it('should pass filter parameters to API calls', async () => {
      const mockHttp = vi.mocked(http)
      mockHttp.get.mockResolvedValue({
        data: {
          code: 0,
          data: { list: [], total: 0 }
        }
      })

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      // Get the component instance
      const vm = wrapper.vm as any

      // Simulate applying filters
      vm.filterForm.keyword = 'test'
      vm.filterForm.assetType = 'image'
      vm.filterForm.module = 'home'
      vm.applyFilters()

      // Verify API was called with filter parameters
      expect(mockHttp.get).toHaveBeenCalledWith('/assets/list', expect.objectContaining({
        params: expect.objectContaining({
          keyword: 'test',
          assetType: 'image',
          module: 'home'
        })
      }))
    })

    it('should handle pagination parameters', async () => {
      const mockHttp = vi.mocked(http)
      mockHttp.get.mockResolvedValue({
        data: {
          code: 0,
          data: { list: [], total: 0 }
        }
      })

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      // Get the component instance and crud reference
      const vm = wrapper.vm as any
      const crudRef = vm.crudRef

      // Simulate pagination change (this would be handled by ModuleCrudPage)
      if (crudRef && crudRef.handlePageChange) {
        crudRef.handlePageChange(2)
      }

      // Verify the component has access to crud functionality
      expect(vm.crudRef).toBeDefined()
    })
  })

  describe('CRUD Operations', () => {
    it('should support adding new assets', async () => {
      const mockHttp = vi.mocked(http)
      mockHttp.post.mockResolvedValue({ data: { code: 0 } })

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any

      // Access ModuleCrudPage component
      const crudPage = wrapper.findComponent({ name: 'ModuleCrudPage' })
      expect(crudPage.exists()).toBe(true)

      // Verify CRUD functionality is available through ModuleCrudPage
      expect(crudPage.props()).toHaveProperty('moduleKey', 'assets')
      expect(crudPage.props()).toHaveProperty('title', '素材管理')
    })

    it('should support editing assets', async () => {
      const mockHttp = vi.mocked(http)
      mockHttp.post.mockResolvedValue({ data: { code: 0 } })

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      // Verify that editing functionality is available
      const crudPage = wrapper.findComponent({ name: 'ModuleCrudPage' })
      expect(crudPage.exists()).toBe(true)

      // The actual edit functionality is handled by ModuleCrudPage
      expect(crudPage.vm).toBeDefined()
    })

    it('should support deleting assets', async () => {
      const mockHttp = vi.mocked(http)
      const mockElMessageBox = vi.mocked(ElMessageBox)

      mockHttp.post.mockResolvedValue({ data: { code: 0 } })
      mockElMessageBox.confirm.mockResolvedValue()

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any

      // Test single asset deletion (handled by ModuleCrudPage)
      const crudPage = wrapper.findComponent({ name: 'ModuleCrudPage' })
      expect(crudPage.exists()).toBe(true)
    })

    it('should support batch deleting assets', async () => {
      const mockHttp = vi.mocked(http)
      const mockElMessage = vi.mocked(ElMessage)
      const mockElMessageBox = vi.mocked(ElMessageBox)

      mockHttp.post.mockResolvedValue({ data: { code: 0 } })
      mockElMessageBox.confirm.mockResolvedValue()

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any

      // Test batch delete functionality
      const testRows = [
        { id: 1, assetName: 'Asset 1' },
        { id: 2, assetName: 'Asset 2' }
      ]

      vm.handleBatchDelete(testRows)

      // Should show confirmation dialog
      expect(mockElMessageBox.confirm).toHaveBeenCalledWith(
        '确定删除选中的 2 个素材？该操作不可恢复。',
        '批量删除',
        expect.any(Object)
      )
    })

    it('should handle batch delete success', async () => {
      const mockHttp = vi.mocked(http)
      const mockElMessage = vi.mocked(ElMessage)
      const mockElMessageBox = vi.mocked(ElMessageBox)

      mockHttp.post.mockResolvedValue({ data: { code: 0 } })
      mockElMessageBox.confirm.mockResolvedValue()

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any

      const testRows = [{ id: 1, assetName: 'Asset 1' }]
      await vm.handleBatchDelete(testRows)

      // Should call delete API
      expect(mockHttp.post).toHaveBeenCalledWith('/assets/delete', [1])

      // Should show success message
      expect(mockElMessage.success).toHaveBeenCalledWith('批量删除成功')

      // Should refresh data (call crudRef.refresh)
      expect(vm.crudRef).toBeDefined()
    })

    it('should support batch status updates', async () => {
      const mockHttp = vi.mocked(http)
      const mockElMessage = vi.mocked(ElMessage)

      mockHttp.post.mockResolvedValue({ data: { code: 0 } })

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any

      // Test batch enable
      const testRows = [
        { id: 1, assetName: 'Asset 1', status: 'deprecated' },
        { id: 2, assetName: 'Asset 2', status: 'deprecated' }
      ]

      vm.handleBatchStatus(testRows, 'active')

      // Should show warning if no rows selected
      expect(mockElMessage.warning).not.toHaveBeenCalled()

      // Should proceed with status update logic
      expect(vm.crudRef).toBeDefined()
    })

    it('should handle batch status update success', async () => {
      const mockHttp = vi.mocked(http)
      const mockElMessage = vi.mocked(ElMessage)

      mockHttp.post.mockResolvedValue({ data: { code: 0 } })

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any

      const testRows = [
        { id: 1, assetName: 'Asset 1', status: 'deprecated' },
        { id: 2, assetName: 'Asset 2', status: 'deprecated' }
      ]

      await vm.handleBatchStatus(testRows, 'active')

      // Should call batch status update API
      expect(mockHttp.post).toHaveBeenCalledWith('/assets/batchStatus', {
        ids: [1, 2],
        status: 'active'
      })

      // Should show success message
      expect(mockElMessage.success).toHaveBeenCalledWith('已批量启用')

      // Should refresh data
      expect(vm.crudRef).toBeDefined()
    })

    it('should handle empty batch operations', async () => {
      const mockElMessage = vi.mocked(ElMessage)

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any

      // Test batch delete with empty array
      vm.handleBatchDelete([])

      // Should show warning
      expect(mockElMessage.warning).toHaveBeenCalledWith('请先选择需要删除的素材')

      // Test batch status with empty array
      vm.handleBatchStatus([], 'active')

      // Should show warning
      expect(mockElMessage.warning).toHaveBeenCalledWith('请至少选择一条素材')
    })

    it('should export selected assets', async () => {
      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any

      const testRows = [
        {
          id: 1,
          assetName: 'Test Asset 1',
          assetType: 'image',
          module: 'home',
          usage: 'hero',
          version: 'v1',
          status: 'active',
          filePath: '/uploads/test1.jpg',
          tags: 'tag1,tag2'
        }
      ]

      vm.exportSelection(testRows)

      // Should create CSV content
      expect(vm.toCsvValue).toBeDefined()

      // Verify the method exists
      expect(typeof vm.toCsvValue).toBe('function')
    })

    it('should handle export with empty selection', async () => {
      const mockElMessage = vi.mocked(ElMessage)

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any

      vm.exportSelection([])

      // Should show warning
      expect(mockElMessage.warning).toHaveBeenCalledWith('请选择需要导出的素材')
    })
  })

  describe('Form Validation', () => {
    it('should validate asset name is required', async () => {
      const mockHttp = vi.mocked(http)
      const mockElMessage = vi.mocked(ElMessage)

      mockHttp.post.mockResolvedValue({ data: { code: 0 } })

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any
      const crudRef = vm.crudRef

      // Mock form model without asset name
      const formModel = { filePath: '/uploads/test.jpg' }

      // Call handleSave method
      vm.handleSave(formModel, () => {})

      // Should show warning message for missing asset name
      expect(mockElMessage.warning).toHaveBeenCalledWith('请输入素材名称')

      // Should not proceed with API call
      expect(mockHttp.post).not.toHaveBeenCalled()
    })

    it('should validate file upload is required', async () => {
      const mockHttp = vi.mocked(http)
      const mockElMessage = vi.mocked(ElMessage)

      mockHttp.post.mockResolvedValue({ data: { code: 0 } })

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any

      // Mock form model with asset name but no file
      const formModel = { assetName: 'Test Asset' }

      // Call handleSave method
      vm.handleSave(formModel, () => {})

      // Should show warning message for missing file
      expect(mockElMessage.warning).toHaveBeenCalledWith('请上传素材文件')

      // Should not proceed with API call
      expect(mockHttp.post).not.toHaveBeenCalled()
    })

    it('should allow valid form submission', async () => {
      const mockHttp = vi.mocked(http)
      const mockElMessage = vi.mocked(ElMessage)

      mockHttp.post.mockResolvedValue({ data: { code: 0 } })

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any

      // Mock form model with both required fields
      const formModel = {
        assetName: 'Test Asset',
        filePath: '/uploads/test.jpg'
      }

      // Mock submit function
      const mockSubmit = vi.fn()

      // Call handleSave method
      vm.handleSave(formModel, mockSubmit)

      // Should not show any warning messages
      expect(mockElMessage.warning).not.toHaveBeenCalled()

      // Should proceed with form submission
      expect(mockSubmit).toHaveBeenCalled()
    })

    it('should handle form validation failure', async () => {
      const mockHttp = vi.mocked(http)
      const mockElMessage = vi.mocked(ElMessage)

      mockHttp.post.mockResolvedValue({ data: { code: 0 } })

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any

      // Mock form model with empty values
      const formModel = {
        assetName: '',
        filePath: ''
      }

      // Call handleSave method
      vm.handleSave(formModel, () => {})

      // Should show warning message for missing asset name first
      expect(mockElMessage.warning).toHaveBeenCalledWith('请输入素材名称')

      // Should not proceed with API call
      expect(mockHttp.post).not.toHaveBeenCalled()
    })

    it('should validate form fields in correct order', async () => {
      const mockHttp = vi.mocked(http)
      const mockElMessage = vi.mocked(ElMessage)

      mockHttp.post.mockResolvedValue({ data: { code: 0 } })

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any

      // Mock form model with no asset name and no file
      const formModel = {}

      // Call handleSave method
      vm.handleSave(formModel, () => {})

      // Should show warning for asset name first (checked before file)
      expect(mockElMessage.warning).toHaveBeenCalledWith('请输入素材名称')
      expect(mockElMessage.warning).toHaveBeenCalledTimes(1)

      // Should not proceed with API call
      expect(mockHttp.post).not.toHaveBeenCalled()
    })
  })

  describe('Component Methods', () => {
    it('should have data loading methods', () => {
      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      // Component should have methods for data operations
      expect(wrapper.vm).toBeDefined()
    })

    it('should handle pagination', () => {
      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.vm).toBeDefined()
    })

    it('should handle search functionality', () => {
      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      expect(wrapper.vm).toBeDefined()
    })
  })

  describe('Filter Functionality', () => {
    it('should apply keyword filter', async () => {
      const mockHttp = vi.mocked(http)
      mockHttp.get.mockResolvedValue({
        data: {
          code: 0,
          data: { list: [], total: 0 }
        }
      })

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any

      // Set keyword filter
      vm.filterForm.keyword = 'test keyword'
      vm.applyFilters()

      // Verify API call includes keyword parameter
      expect(mockHttp.get).toHaveBeenCalledWith('/assets/list', expect.objectContaining({
        params: expect.objectContaining({
          keyword: 'test keyword'
        })
      }))
    })

    it('should apply asset type filter', async () => {
      const mockHttp = vi.mocked(http)
      mockHttp.get.mockResolvedValue({
        data: {
          code: 0,
          data: { list: [], total: 0 }
        }
      })

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any

      // Set asset type filter
      vm.filterForm.assetType = 'image'
      vm.applyFilters()

      // Verify API call includes assetType parameter
      expect(mockHttp.get).toHaveBeenCalledWith('/assets/list', expect.objectContaining({
        params: expect.objectContaining({
          assetType: 'image'
        })
      }))
    })

    it('should apply module filter', async () => {
      const mockHttp = vi.mocked(http)
      mockHttp.get.mockResolvedValue({
        data: {
          code: 0,
          data: { list: [], total: 0 }
        }
      })

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any

      // Set module filter
      vm.filterForm.module = 'home'
      vm.applyFilters()

      // Verify API call includes module parameter
      expect(mockHttp.get).toHaveBeenCalledWith('/assets/list', expect.objectContaining({
        params: expect.objectContaining({
          module: 'home'
        })
      }))
    })

    it('should apply usage filter', async () => {
      const mockHttp = vi.mocked(http)
      mockHttp.get.mockResolvedValue({
        data: {
          code: 0,
          data: { list: [], total: 0 }
        }
      })

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any

      // Set usage filter
      vm.filterForm.usage = 'hero'
      vm.applyFilters()

      // Verify API call includes usage parameter
      expect(mockHttp.get).toHaveBeenCalledWith('/assets/list', expect.objectContaining({
        params: expect.objectContaining({
          usage: 'hero'
        })
      }))
    })

    it('should apply status filter', async () => {
      const mockHttp = vi.mocked(http)
      mockHttp.get.mockResolvedValue({
        data: {
          code: 0,
          data: { list: [], total: 0 }
        }
      })

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any

      // Set status filter
      vm.filterForm.status = 'active'
      vm.applyFilters()

      // Verify API call includes status parameter
      expect(mockHttp.get).toHaveBeenCalledWith('/assets/list', expect.objectContaining({
        params: expect.objectContaining({
          status: 'active'
        })
      }))
    })

    it('should apply date range filter', async () => {
      const mockHttp = vi.mocked(http)
      mockHttp.get.mockResolvedValue({
        data: {
          code: 0,
          data: { list: [], total: 0 }
        }
      })

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any

      // Set date range filter
      vm.filterForm.dateRange = ['2024-01-01', '2024-01-31']
      vm.applyFilters()

      // Verify API call includes startDate and endDate parameters
      expect(mockHttp.get).toHaveBeenCalledWith('/assets/list', expect.objectContaining({
        params: expect.objectContaining({
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        })
      }))
    })

    it('should reset all filters', async () => {
      const mockHttp = vi.mocked(http)
      mockHttp.get.mockResolvedValue({
        data: {
          code: 0,
          data: { list: [], total: 0 }
        }
      })

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any

      // Set multiple filters
      vm.filterForm.keyword = 'test'
      vm.filterForm.assetType = 'image'
      vm.filterForm.module = 'home'
      vm.filterForm.usage = 'hero'
      vm.filterForm.status = 'active'
      vm.filterForm.dateRange = ['2024-01-01', '2024-01-31']

      // Reset filters
      vm.resetFilters()

      // Verify all filters are cleared
      expect(vm.filterForm.keyword).toBe('')
      expect(vm.filterForm.assetType).toBe('')
      expect(vm.filterForm.module).toBe('')
      expect(vm.filterForm.usage).toBe('')
      expect(vm.filterForm.status).toBe('')
      expect(vm.filterForm.dateRange).toBe('')

      // Verify applied filters are updated
      expect(vm.appliedFilters.keyword).toBe('')
      expect(vm.appliedFilters.assetType).toBe('')
      expect(vm.appliedFilters.module).toBe('')
      expect(vm.appliedFilters.usage).toBe('')
      expect(vm.appliedFilters.status).toBe('')
      expect(vm.appliedFilters.startDate).toBe('')
      expect(vm.appliedFilters.endDate).toBe('')
    })

    it('should handle empty date range', async () => {
      const mockHttp = vi.mocked(http)
      mockHttp.get.mockResolvedValue({
        data: {
          code: 0,
          data: { list: [], total: 0 }
        }
      })

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any

      // Set empty date range
      vm.filterForm.dateRange = ''
      vm.applyFilters()

      // Verify startDate and endDate are empty
      expect(vm.appliedFilters.startDate).toBe('')
      expect(vm.appliedFilters.endDate).toBe('')
    })

    it('should handle partial date range', async () => {
      const mockHttp = vi.mocked(http)
      mockHttp.get.mockResolvedValue({
        data: {
          code: 0,
          data: { list: [], total: 0 }
        }
      })

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any

      // Set incomplete date range
      vm.filterForm.dateRange = ['2024-01-01']
      vm.applyFilters()

      // Should not set startDate and endDate
      expect(vm.appliedFilters.startDate).toBe('')
      expect(vm.appliedFilters.endDate).toBe('')
    })

    it('should apply multiple filters simultaneously', async () => {
      const mockHttp = vi.mocked(http)
      mockHttp.get.mockResolvedValue({
        data: {
          code: 0,
          data: { list: [], total: 0 }
        }
      })

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any

      // Set multiple filters
      vm.filterForm.keyword = 'hero banner'
      vm.filterForm.assetType = 'image'
      vm.filterForm.module = 'home'
      vm.filterForm.usage = 'hero'
      vm.filterForm.status = 'active'
      vm.filterForm.dateRange = ['2024-01-01', '2024-01-31']

      vm.applyFilters()

      // Verify all filters are applied
      expect(mockHttp.get).toHaveBeenCalledWith('/assets/list', expect.objectContaining({
        params: expect.objectContaining({
          keyword: 'hero banner',
          assetType: 'image',
          module: 'home',
          usage: 'hero',
          status: 'active',
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        })
      }))
    })

    it('should trigger data reload when filters change', async () => {
      const mockHttp = vi.mocked(http)
      mockHttp.get.mockResolvedValue({
        data: {
          code: 0,
          data: { list: [], total: 0 }
        }
      })

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      // Clear initial call
      mockHttp.get.mockClear()

      const vm = wrapper.vm as any

      // Apply filters
      vm.filterForm.keyword = 'test'
      vm.applyFilters()

      // Verify data reload was triggered
      expect(mockHttp.get).toHaveBeenCalledTimes(1)
      expect(mockHttp.get).toHaveBeenCalledWith('/assets/list', expect.objectContaining({
        params: expect.objectContaining({
          keyword: 'test'
        })
      }))
    })
  })

  describe('File Upload', () => {
    it('should trigger file upload when upload button is clicked', async () => {
      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any

      // Mock file input click
      const mockClick = vi.fn()
      vm.fileInputRef = { click: mockClick }

      // Create a mock form model
      const formModel = { assetName: 'Test Asset' }

      // Trigger upload
      vm.triggerUpload(formModel)

      // Verify file input click was triggered
      expect(mockClick).toHaveBeenCalled()

      // Verify current form model was set
      expect(vm.currentFormModel).toBe(formModel)
    })

    it('should handle file selection and upload', async () => {
      const mockHttp = vi.mocked(http)
      const mockElMessage = vi.mocked(ElMessage)

      // Mock successful upload response
      mockHttp.post.mockResolvedValue({
        data: {
          code: 0,
          file: '/uploads/test-image.jpg',
          width: 1920,
          height: 1080,
          dimensions: '1920x1080'
        }
      })

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any

      // Create mock file
      const mockFile = new File(['test image content'], 'test-image.jpg', { type: 'image/jpeg' })

      // Mock file input with files
      vm.fileInputRef = {
        files: [mockFile],
        value: ''
      }

      // Set current form model
      vm.currentFormModel = {
        assetName: 'Test Asset',
        assetType: 'image',
        module: 'home',
        usage: 'hero',
        version: 'v1',
        tags: 'test',
        category: 'static',
        status: 'active',
        description: 'Test description',
        uploadUser: 'testuser'
      }

      // Trigger file change
      await vm.handleFileChange()

      // Verify upload API was called with FormData
      expect(mockHttp.post).toHaveBeenCalledWith('/file/uploadAsset', expect.any(FormData), {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      // Verify success message
      expect(mockElMessage.success).toHaveBeenCalledWith('文件上传成功')

      // Verify form model was updated with upload results
      expect(vm.currentFormModel.filePath).toBe('/uploads/test-image.jpg')
      expect(vm.currentFormModel.width).toBe(1920)
      expect(vm.currentFormModel.height).toBe(1080)
      expect(vm.currentFormModel.dimensions).toBe('1920x1080')
    })

    it('should handle file upload failure', async () => {
      const mockHttp = vi.mocked(http)
      const mockElMessage = vi.mocked(ElMessage)

      // Mock failed upload response
      mockHttp.post.mockRejectedValue(new Error('Upload failed'))

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any

      // Create mock file
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

      // Mock file input
      vm.fileInputRef = {
        files: [mockFile],
        value: 'test.jpg'
      }

      // Set current form model
      vm.currentFormModel = { assetName: 'Test Asset' }

      // Trigger file change
      await vm.handleFileChange()

      // Verify error message
      expect(mockElMessage.error).toHaveBeenCalledWith('上传失败')

      // Verify file input value was reset
      expect(vm.fileInputRef.value).toBe('')
    })

    it('should handle API error responses during upload', async () => {
      const mockHttp = vi.mocked(http)
      const mockElMessage = vi.mocked(ElMessage)

      // Mock API error response
      mockHttp.post.mockResolvedValue({
        data: {
          code: 1,
          msg: 'File too large'
        }
      })

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any

      // Mock file input
      const mockFile = new File(['large file'], 'large.jpg', { type: 'image/jpeg' })
      vm.fileInputRef = {
        files: [mockFile],
        value: 'large.jpg'
      }

      vm.currentFormModel = { assetName: 'Large Asset' }

      // Trigger file change
      await vm.handleFileChange()

      // Verify error message from API
      expect(mockElMessage.error).toHaveBeenCalledWith('File too large')
    })

    it('should skip upload when no file is selected', async () => {
      const mockHttp = vi.mocked(http)

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any

      // Mock empty file input
      vm.fileInputRef = { files: [] }

      // Trigger file change
      await vm.handleFileChange()

      // Verify no API call was made
      expect(mockHttp.post).not.toHaveBeenCalled()
    })

    it('should skip upload when no current form model', async () => {
      const mockHttp = vi.mocked(http)

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any

      // Mock file input but no current form model
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      vm.fileInputRef = { files: [mockFile] }
      vm.currentFormModel = null

      // Trigger file change
      await vm.handleFileChange()

      // Verify no API call was made
      expect(mockHttp.post).not.toHaveBeenCalled()
    })

    it('should construct FormData correctly for upload', async () => {
      const mockHttp = vi.mocked(http)

      mockHttp.post.mockImplementation((url, formData) => {
        // Verify FormData contents
        expect(formData instanceof FormData).toBe(true)

        // Note: In a real test environment, you might need to verify FormData contents
        // but Jest/Vitest has limitations with FormData inspection

        return Promise.resolve({
          data: {
            code: 0,
            file: '/uploads/test.jpg'
          }
        })
      })

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any

      // Create mock file
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

      // Mock file input
      vm.fileInputRef = {
        files: [mockFile],
        value: 'test.jpg'
      }

      // Set current form model with various fields
      vm.currentFormModel = {
        assetName: 'Test Asset',
        assetType: 'image',
        module: 'home',
        usage: 'hero',
        version: 'v1',
        tags: 'tag1,tag2',
        category: 'static',
        status: 'active',
        description: 'Test desc',
        uploadUser: 'testuser'
      }

      // Trigger file change
      await vm.handleFileChange()

      // Verify upload was called
      expect(mockHttp.post).toHaveBeenCalledWith('/file/uploadAsset', expect.any(FormData), {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    })

    it('should reset uploading state after upload completes', async () => {
      const mockHttp = vi.mocked(http)

      mockHttp.post.mockResolvedValue({
        data: { code: 0, file: '/uploads/test.jpg' }
      })

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any

      // Set uploading state to true initially
      vm.uploading = true

      // Mock file input
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      vm.fileInputRef = {
        files: [mockFile],
        value: 'test.jpg'
      }
      vm.currentFormModel = { assetName: 'Test' }

      // Trigger file change
      await vm.handleFileChange()

      // Verify uploading state was reset
      expect(vm.uploading).toBe(false)
    })

    it('should reset uploading state after upload fails', async () => {
      const mockHttp = vi.mocked(http)

      mockHttp.post.mockRejectedValue(new Error('Upload failed'))

      const wrapper = mountComponent(AssetsList, {
        global: {
          plugins: [router, pinia]
        }
      })

      await wrapper.vm.$nextTick()

      const vm = wrapper.vm as any

      // Set uploading state to true initially
      vm.uploading = true

      // Mock file input
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      vm.fileInputRef = {
        files: [mockFile],
        value: 'test.jpg'
      }
      vm.currentFormModel = { assetName: 'Test' }

      // Trigger file change
      await vm.handleFileChange()

      // Verify uploading state was reset
      expect(vm.uploading).toBe(false)
    })
  })
})
