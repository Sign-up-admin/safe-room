import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useFavoritesStore } from '@/composables/useFavoritesStore'
import type { StoreupItem } from '@/types/modules'
import { getModuleService } from '@/services/crud'
import { cleanupTest } from '../../utils/test-helpers'

// Mock dependencies
vi.mock('@/services/crud', () => ({
  getModuleService: vi.fn(() => ({
    list: vi.fn(),
    delete: vi.fn(),
    save: vi.fn()
  }))
}))

describe('useFavoritesStore', () => {
  let mockService: any

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock localStorage using the global mock - now available with jsdom
    localStorage.setItem('userId', 'testuser')

    mockService = vi.mocked(getModuleService)()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    cleanupTest()
  })

  describe('initialization', () => {
    it('should initialize with empty favorites', () => {
      const { favorites, loading, pagination } = useFavoritesStore()

      expect(favorites.value).toEqual([])
      expect(loading.value).toBe(false)
      expect(pagination.page).toBe(1)
      expect(pagination.limit).toBe(12)
    })

    it('should load favorites on mount', async () => {
      const mockFavorites: StoreupItem[] = [
        {
          id: 1,
          refid: 1,
          tablename: 'jianshenkecheng',
          name: 'HIIT训练',
          userid: 'testuser',
          addtime: '2025-01-15 10:00:00'
        },
        {
          id: 2,
          refid: 2,
          tablename: 'jianshenjiaolian',
          name: '张教练',
          userid: 'testuser',
          addtime: '2025-01-16 10:00:00'
        }
      ]

      mockService = (await import('@/services/crud')).getModuleService()
      mockService.list.mockResolvedValue({
        list: mockFavorites,
        total: 2
      })

      const { loadFavorites, favorites } = useFavoritesStore()
      await loadFavorites()

      expect(mockService.list).toHaveBeenCalledWith({
        page: 1,
        limit: 12,
        userid: 'testuser'
      })
      expect(favorites.value).toEqual(mockFavorites)
    })
  })

  describe('computed properties', () => {
    it('should compute selected ids correctly', () => {
      const { selectionState, selectedIds } = useFavoritesStore()

      selectionState.value[1] = true
      selectionState.value[3] = true

      expect(selectedIds.value).toEqual([1, 3])
    })

    it('should filter favorites correctly', () => {
      const { filters, filteredFavorites } = useFavoritesStore()
      const mockFavorites: StoreupItem[] = [
        {
          id: 1,
          refid: 1,
          tablename: 'jianshenkecheng',
          name: 'HIIT训练',
          userid: 'testuser'
        },
        {
          id: 2,
          refid: 2,
          tablename: 'jianshenjiaolian',
          name: '张教练',
          userid: 'testuser'
        }
      ]

      // Mock favorites
      const { favorites } = useFavoritesStore()
      favorites.value = mockFavorites

      // Test category filter
      filters.category = 'jianshenkecheng'
      expect(filteredFavorites.value).toHaveLength(1)
      expect(filteredFavorites.value[0].tablename).toBe('jianshenkecheng')

      // Test keyword filter
      filters.category = 'all'
      filters.keyword = '教练'
      expect(filteredFavorites.value).toHaveLength(1)
      expect(filteredFavorites.value[0].name).toBe('张教练')
    })

    it('should compute categories with counts', () => {
      const { favorites, categories } = useFavoritesStore()
      const mockFavorites: StoreupItem[] = [
        {
          id: 1,
          tablename: 'jianshenkecheng',
          name: 'HIIT训练'
        },
        {
          id: 2,
          tablename: 'jianshenkecheng',
          name: '瑜伽课程'
        },
        {
          id: 3,
          tablename: 'jianshenjiaolian',
          name: '张教练'
        }
      ]

      favorites.value = mockFavorites

      expect(categories.value).toEqual([
        { label: '全部', value: 'all', count: 3 },
        { label: '课程', value: 'jianshenkecheng', count: 2 },
        { label: '教练', value: 'jianshenjiaolian', count: 1 },
        { label: '其他', value: 'other', count: 0 }
      ])
    })

    it('should compute stats correctly', () => {
      const { favorites, stats } = useFavoritesStore()
      const now = new Date()
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const mockFavorites: StoreupItem[] = [
        {
          id: 1,
          tablename: 'jianshenkecheng',
          addtime: now.toISOString()
        },
        {
          id: 2,
          tablename: 'jianshenkecheng',
          addtime: now.toISOString()
        },
        {
          id: 3,
          tablename: 'jianshenjiaolian',
          addtime: sevenDaysAgo.toISOString()
        }
      ]

      favorites.value = mockFavorites

      expect(stats.value.totalCount).toBe(3)
      expect(stats.value.recentCount).toBe(2) // 2 recent favorites
      expect(stats.value.categories).toHaveLength(2)
    })
  })

  describe('favorite operations', () => {
    it('should remove favorite successfully', async () => {
      const mockFavorites: StoreupItem[] = [
        { id: 1, name: 'Test Item', tablename: 'test' },
        { id: 2, name: 'Another Item', tablename: 'test' }
      ]

      mockService = (await import('@/services/crud')).getModuleService()
      mockService.delete.mockResolvedValue({})

      const { favorites, removeFavorite } = useFavoritesStore()
      favorites.value = mockFavorites

      await removeFavorite(1)

      expect(mockService.delete).toHaveBeenCalledWith(1)
      expect(favorites.value).toHaveLength(1)
      expect(favorites.value[0].id).toBe(2)
    })

    it('should add favorite successfully', async () => {
      mockService = (await import('@/services/crud')).getModuleService()
      mockService.save.mockResolvedValue({ id: 3 })

      const { addFavorite, favorites } = useFavoritesStore()

      const result = await addFavorite(1, 'jianshenkecheng', 'Test Course')

      expect(mockService.save).toHaveBeenCalledWith({
        refid: 1,
        tablename: 'jianshenkecheng',
        name: 'Test Course',
        userid: 'testuser'
      })
      expect(result.id).toBe(3)
    })

    it('should handle add favorite error', async () => {
      mockService = (await import('@/services/crud')).getModuleService()
      mockService.save.mockRejectedValue(new Error('API Error'))

      const { addFavorite } = useFavoritesStore()

      await expect(addFavorite(1, 'jianshenkecheng', 'Test Course')).rejects.toThrow('API Error')
    })
  })

  describe('batch operations', () => {
    it('should batch remove favorites', async () => {
      const mockFavorites: StoreupItem[] = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' }
      ]

      mockService = (await import('@/services/crud')).getModuleService()
      mockService.delete.mockResolvedValue({})

      const { favorites, batchRemove } = useFavoritesStore()
      favorites.value = mockFavorites

      await batchRemove([1, 3])

      expect(mockService.delete).toHaveBeenCalledTimes(2)
      expect(favorites.value).toHaveLength(1)
      expect(favorites.value[0].id).toBe(2)
    })

    it('should export favorites as CSV', () => {
      const mockFavorites: StoreupItem[] = [
        {
          id: 1,
          name: 'Test Course',
          tablename: 'jianshenkecheng',
          refid: 1,
          addtime: '2025-01-15 10:00:00'
        }
      ]

      // Mock URL and document
      const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url')
      const mockClick = vi.fn()
      global.URL.createObjectURL = mockCreateObjectURL
      global.URL.revokeObjectURL = vi.fn()

      const mockLink = {
        click: mockClick,
        setAttribute: vi.fn(),
        style: {}
      }
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any)
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => {})

      const { favorites, exportFavorites, selectedIds } = useFavoritesStore()
      favorites.value = mockFavorites
      selectedIds.value = [1]

      exportFavorites()

      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
    })

    it('should share favorites', async () => {
      const mockFavorites: StoreupItem[] = [
        { id: 1, name: 'Course 1', tablename: 'jianshenkecheng' },
        { id: 2, name: 'Coach 1', tablename: 'jianshenjiaolian' }
      ]

      // Mock navigator.share
      Object.defineProperty(navigator, 'share', {
        value: vi.fn().mockResolvedValue(undefined),
        writable: true
      })

      const { favorites, shareFavorites, selectedIds } = useFavoritesStore()
      favorites.value = mockFavorites
      selectedIds.value = [1, 2]

      await shareFavorites()

      expect(navigator.share).toHaveBeenCalledWith({
        title: '我的收藏列表',
        text: expect.stringContaining('Course 1'),
        url: window.location.href
      })
    })
  })

  describe('selection management', () => {
    it('should handle select all', () => {
      const mockFavorites: StoreupItem[] = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ]

      const { favorites, handleSelectAll, selectAll, selectedIds } = useFavoritesStore()
      favorites.value = mockFavorites

      handleSelectAll(true)

      expect(selectAll.value).toBe(true)
      expect(selectedIds.value).toEqual([1, 2])
    })

    it('should handle individual selection', () => {
      const { handleSelectChange, selectionState, selectedIds } = useFavoritesStore()

      handleSelectChange(1, true)
      expect(selectionState.value[1]).toBe(true)
      expect(selectedIds.value).toEqual([1])

      handleSelectChange(1, false)
      expect(selectionState.value[1]).toBe(false)
      expect(selectedIds.value).toEqual([])
    })

    it('should clear selection', () => {
      const { clearSelection, selectionState, selectedIds } = useFavoritesStore()

      selectionState.value[1] = true
      selectionState.value[2] = true

      clearSelection()

      expect(selectedIds.value).toEqual([])
      expect(selectionState.value[1]).toBe(false)
      expect(selectionState.value[2]).toBe(false)
    })
  })

  describe('utility functions', () => {
    it('should translate table names correctly', () => {
      const { translateTableName } = useFavoritesStore()

      expect(translateTableName('jianshenkecheng')).toBe('课程')
      expect(translateTableName('jianshenjiaolian')).toBe('教练')
      expect(translateTableName('jianshenqicai')).toBe('器材')
      expect(translateTableName('unknown')).toBe('其他')
    })
  })

  describe('error handling', () => {
    it('should handle API errors gracefully', async () => {
      mockService = (await import('@/services/crud')).getModuleService()
      mockService.list.mockRejectedValue(new Error('Network Error'))

      const { loadFavorites } = useFavoritesStore()

      // Should not throw
      await expect(loadFavorites()).resolves.not.toThrow()
    })
  })
})
