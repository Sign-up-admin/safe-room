import { ref, computed, reactive } from 'vue'
import { getModuleService } from '../services/crud'
import type { StoreupItem } from '../types/modules'
import { formatDate } from '../utils/formatters'

interface FavoritesStats {
  totalCount: number
  recentCount: number // 7天内收藏
  categories: Array<{
    name: string
    count: number
    color: string
  }>
}

interface FavoritesFilters {
  category: string
  keyword: string
}

export function useFavoritesStore() {
  const storeupService = getModuleService('storeup')

  // 状态
  const favorites = ref<StoreupItem[]>([])
  const loading = ref(false)
  const pagination = reactive({
    page: 1,
    limit: 12,
    total: 0,
  })

  const filters = reactive<FavoritesFilters>({
    category: 'all',
    keyword: '',
  })

  const selectionState = reactive<Record<number, boolean>>({})
  const selectAll = ref(false)

  // 计算属性
  const selectedIds = computed(() =>
    Object.entries(selectionState)
      .filter(([, checked]) => checked)
      .map(([id]) => Number(id)),
  )

  const filteredFavorites = computed(() =>
    favorites.value.filter(item => {
      const matchCategory = filters.category === 'all' || item.tablename === filters.category
      const keyword = filters.keyword.trim().toLowerCase()
      const matchKeyword =
        !keyword ||
        item.name?.toLowerCase().includes(keyword) ||
        item.remark?.toLowerCase().includes(keyword) ||
        translateTableName(item.tablename).includes(filters.keyword)
      return matchCategory && matchKeyword
    }),
  )

  const categories = computed(() => {
    const map: Record<string, number> = {}
    favorites.value.forEach(item => {
      const key = item.tablename || 'other'
      map[key] = (map[key] || 0) + 1
    })

    return [
      { label: '全部', value: 'all', count: favorites.value.length },
      { label: '课程', value: 'jianshenkecheng', count: map.jianshenkecheng || 0 },
      { label: '教练', value: 'jianshenjiaolian', count: map.jianshenjiaolian || 0 },
      { label: '器材', value: 'jianshenqicai', count: map.jianshenqicai || 0 },
      { label: '其他', value: 'other', count: map.other || 0 },
    ]
  })

  const stats = computed((): FavoritesStats => {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const recentCount = favorites.value.filter(item => {
      if (!item.addtime) return false
      const addTime = new Date(item.addtime)
      return addTime >= sevenDaysAgo
    }).length

    const categoryMap: Record<string, number> = {}
    favorites.value.forEach(item => {
      const key = item.tablename || 'other'
      categoryMap[key] = (categoryMap[key] || 0) + 1
    })

    const colors = ['#4a90e2', '#f44336', '#4caf50', '#ff9800', '#9c27b0']
    const categoryData = Object.entries(categoryMap).map(([name, count], index) => ({
      name: translateTableName(name),
      count,
      color: colors[index % colors.length],
    }))

    return {
      totalCount: favorites.value.length,
      recentCount,
      categories: categoryData,
    }
  })

  // 方法
  async function loadFavorites() {
    loading.value = true
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        userid: localStorage.getItem('userid'),
      }

      const response = await storeupService.list(params)
      favorites.value = response.list ?? []
      pagination.total = response.total ?? 0

      resetSelection()
      selectAll.value = false
    } catch (error) {
      console.error('加载收藏列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  async function removeFavorite(id: number) {
    try {
      await storeupService.delete(id)
      favorites.value = favorites.value.filter(item => item.id !== id)
      delete selectionState[id]
    } catch (error) {
      console.error('取消收藏失败:', error)
      throw error
    }
  }

  async function batchRemove(ids: number[]) {
    try {
      await Promise.all(ids.map(id => storeupService.delete(id)))
      favorites.value = favorites.value.filter(item => !ids.includes(item.id!))
      ids.forEach(id => delete selectionState[id])
    } catch (error) {
      console.error('批量取消收藏失败:', error)
      throw error
    }
  }

  async function addFavorite(refid: number, tablename: string, name?: string, picture?: string) {
    try {
      const data = {
        refid,
        tablename,
        name,
        picture,
        userid: Number(localStorage.getItem('userid')),
      }

      const response = await storeupService.save(data)
      await loadFavorites() // 重新加载列表
      return response
    } catch (error) {
      console.error('添加收藏失败:', error)
      throw error
    }
  }

  function handleSelectChange(id: number, selected: boolean) {
    selectionState[id] = selected
    updateSelectAllState()
  }

  function handleSelectAll(selected: boolean) {
    filteredFavorites.value.forEach(item => {
      if (item.id) {
        selectionState[item.id] = selected
      }
    })
  }

  function updateSelectAllState() {
    const selectedCount = selectedIds.value.length
    const totalCount = filteredFavorites.value.length

    if (selectedCount === 0) {
      selectAll.value = false
    } else if (selectedCount === totalCount) {
      selectAll.value = true
    }
    // indeterminate state is handled by the component
  }

  function clearSelection() {
    Object.keys(selectionState).forEach(key => {
      selectionState[Number(key)] = false
    })
  }

  function resetSelection() {
    Object.keys(selectionState).forEach(key => {
      delete selectionState[Number(key)]
    })
    selectAll.value = false
  }

  function translateTableName(tablename?: string): string {
    const map: Record<string, string> = {
      jianshenkecheng: '课程',
      jianshenjiaolian: '教练',
      jianshenqicai: '器材',
      news: '新闻',
      discussjianshenkecheng: '讨论',
    }
    return map[tablename || ''] || '其他'
  }

  // 导出推荐内容
  async function exportFavorites() {
    const selectedItems = favorites.value.filter(item => selectedIds.value.includes(item.id!))
    const csvContent = [
      ['名称', '类型', '收藏时间', '来源ID'].join(','),
      ...selectedItems.map(item =>
        [
          `"${item.name || ''}"`,
          `"${translateTableName(item.tablename)}"`,
          `"${formatDate(item.addtime)}"`,
          `"${item.refid || ''}"`,
        ].join(','),
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `favorites-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 批量分享
  async function shareFavorites() {
    const selectedItems = favorites.value.filter(item => selectedIds.value.includes(item.id!))
    const shareText = selectedItems.map(item => `${item.name} - ${translateTableName(item.tablename)}`).join('\n')

    try {
      if (navigator.share) {
        await navigator.share({
          title: '我的收藏列表',
          text: shareText,
          url: window.location.href,
        })
      } else {
        // 复制到剪贴板
        await navigator.clipboard.writeText(`${shareText}\n\n${window.location.href}`)
        console.log('收藏列表已复制到剪贴板')
      }
    } catch (error) {
      console.error('分享失败:', error)
    }
  }

  return {
    // 状态
    favorites,
    loading,
    pagination,
    filters,
    selectionState,
    selectAll,

    // 计算属性
    selectedIds,
    filteredFavorites,
    categories,
    stats,

    // 方法
    loadFavorites,
    removeFavorite,
    batchRemove,
    addFavorite,
    handleSelectChange,
    handleSelectAll,
    updateSelectAllState,
    clearSelection,
    resetSelection,
    exportFavorites,
    shareFavorites,
    translateTableName,
  }
}
