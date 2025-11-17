import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

export interface SearchFilters {
  keyword: string
  courseId: string[]
  tags: string[]
  timeRange: string
  status: string[]
  sort: string
  author: string
}

export interface Course {
  id: string
  kehnegmingcheng: string
}

export interface Tag {
  name: string
  count?: number
  level?: 'normal' | 'hot' | 'trending'
}

export interface SearchResult {
  items: any[]
  total: number
  filtered: number
  hasMore: boolean
}

export interface SearchOptions {
  debounceDelay?: number
  enableSuggestions?: boolean
  maxSuggestions?: number
  enableHistory?: boolean
  historyKey?: string
}

export function useAdvancedSearch(options: SearchOptions = {}) {
  const {
    debounceDelay = 300,
    enableSuggestions = true,
    maxSuggestions = 10,
    enableHistory = true,
    historyKey = 'discussion-search-history',
  } = options

  // 响应式状态
  const filters = reactive<SearchFilters>({
    keyword: '',
    courseId: [],
    tags: [],
    timeRange: '',
    status: [],
    sort: 'latest',
    author: '',
  })

  const isSearching = ref(false)
  const searchResults = ref<SearchResult>({
    items: [],
    total: 0,
    filtered: 0,
    hasMore: false,
  })

  const searchHistory = ref<string[]>([])
  const searchSuggestions = ref<string[]>([])
  const availableCourses = ref<Course[]>([])
  const availableTags = ref<Tag[]>([])

  // 计算属性
  const activeFiltersCount = computed(() => {
    let count = 0
    if (filters.keyword) count++
    if (filters.courseId.length > 0) count++
    if (filters.tags.length > 0) count++
    if (filters.timeRange) count++
    if (filters.status.length > 0) count++
    if (filters.author) count++
    return count
  })

  const hasActiveFilters = computed(() => activeFiltersCount.value > 0)

  const filterStats = computed(() => ({
    total: searchResults.value.total,
    filtered: searchResults.value.filtered,
  }))

  // 防抖搜索
  let searchTimeout: number | null = null

  const debouncedSearch = (callback: () => void) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    searchTimeout = setTimeout(callback, debounceDelay)
  }

  // 关键词搜索处理
  const handleKeywordChange = (keyword: string) => {
    filters.keyword = keyword

    if (enableSuggestions && keyword.length >= 2) {
      debouncedSearch(() => {
        generateSearchSuggestions(keyword)
      })
    } else {
      searchSuggestions.value = []
    }
  }

  // 生成搜索建议
  const generateSearchSuggestions = async (keyword: string) => {
    try {
      // 这里可以调用API获取搜索建议
      // 暂时使用本地生成逻辑
      const suggestions = generateLocalSuggestions(keyword)
      searchSuggestions.value = suggestions.slice(0, maxSuggestions)
    } catch (error) {
      console.error('获取搜索建议失败:', error)
      searchSuggestions.value = []
    }
  }

  // 本地生成搜索建议
  const generateLocalSuggestions = (keyword: string): string[] => {
    const commonTerms = [
      '训练技巧',
      '饮食建议',
      '健身计划',
      '教练推荐',
      '运动经验',
      '减肥方法',
      '增肌训练',
      '瑜伽课程',
      '跑步技巧',
      '力量训练',
      '有氧运动',
      '康复训练',
    ]

    const suggestions: string[] = []

    // 完全匹配
    commonTerms.forEach(term => {
      if (term.includes(keyword)) {
        suggestions.push(`${keyword} ${term}`)
      }
    })

    // 前缀匹配
    commonTerms.forEach(term => {
      if (term.startsWith(keyword)) {
        suggestions.push(term)
      }
    })

    // 组合建议
    suggestions.push(`${keyword} 训练技巧`)
    suggestions.push(`${keyword} 饮食建议`)
    suggestions.push(`${keyword} 教练推荐`)

    return [...new Set(suggestions)] // 去重
  }

  // 应用搜索建议
  const applySuggestion = (suggestion: string) => {
    filters.keyword = suggestion
    searchSuggestions.value = []
    performSearch()
    saveToHistory(suggestion)
  }

  // 执行搜索
  const performSearch = async () => {
    if (isSearching.value) return

    isSearching.value = true
    try {
      // 构建搜索参数
      const searchParams = buildSearchParams()

      // 这里应该调用实际的搜索API
      // const response = await searchAPI(searchParams)

      // 暂时模拟搜索结果
      const mockResults = await mockSearchAPI(searchParams)

      searchResults.value = mockResults

      if (filters.keyword) {
        saveToHistory(filters.keyword)
      }

      // 触发搜索完成事件
      emit('search-completed', {
        filters: { ...filters },
        results: mockResults,
      })
    } catch (error) {
      console.error('搜索失败:', error)
      ElMessage.error('搜索失败，请稍后重试')
    } finally {
      isSearching.value = false
    }
  }

  // 构建搜索参数
  const buildSearchParams = () => {
    const params: Record<string, any> = {
      page: 1,
      limit: 20,
    }

    if (filters.keyword) params.content = filters.keyword
    if (filters.courseId.length > 0) params.refid = filters.courseId
    if (filters.tags.length > 0) params.tags = filters.tags.join(',')
    if (filters.timeRange) params.timeRange = filters.timeRange
    if (filters.status.length > 0) params.status = filters.status.join(',')
    if (filters.sort) params.sort = filters.sort
    if (filters.author) params.author = filters.author

    return params
  }

  // 模拟搜索API
  const mockSearchAPI = async (params: Record<string, any>): Promise<SearchResult> => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    // 模拟搜索结果
    const totalItems = Math.floor(Math.random() * 100) + 50
    const filteredItems = Math.floor(totalItems * (0.3 + Math.random() * 0.7))

    return {
      items: Array.from({ length: Math.min(filteredItems, 20) }, (_, i) => ({
        id: `item-${i + 1}`,
        title: `讨论标题 ${i + 1}`,
        content: `讨论内容 ${i + 1}，包含关键词：${params.content || '无'}`,
        author: `用户${i + 1}`,
        createTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        tags: params.tags ? params.tags.split(',') : ['健身', '训练'],
        replyCount: Math.floor(Math.random() * 20),
        viewCount: Math.floor(Math.random() * 100),
      })),
      total: totalItems,
      filtered: filteredItems,
      hasMore: filteredItems > 20,
    }
  }

  // 重置筛选条件
  const resetFilters = () => {
    Object.assign(filters, {
      keyword: '',
      courseId: [],
      tags: [],
      timeRange: '',
      status: [],
      sort: 'latest',
      author: '',
    })
    searchSuggestions.value = []
  }

  // 应用筛选条件
  const applyFilters = () => {
    performSearch()
  }

  // 加载可用课程
  const loadAvailableCourses = async () => {
    try {
      // 这里应该调用获取课程列表的API
      // const courses = await courseAPI.getList()
      const mockCourses: Course[] = [
        { id: '1', kehnegmingcheng: '瑜伽入门课程' },
        { id: '2', kehnegmingcheng: '力量训练基础' },
        { id: '3', kehnegmingcheng: '有氧运动指导' },
        { id: '4', kehnegmingcheng: '康复训练课程' },
        { id: '5', kehnegmingcheng: '营养饮食指导' },
      ]
      availableCourses.value = mockCourses
    } catch (error) {
      console.error('加载课程列表失败:', error)
    }
  }

  // 加载可用标签
  const loadAvailableTags = async () => {
    try {
      // 这里应该调用获取标签列表的API
      // const tags = await tagAPI.getList()
      const mockTags: Tag[] = [
        { name: '瑜伽', count: 25, level: 'hot' },
        { name: '力量训练', count: 30, level: 'hot' },
        { name: '有氧运动', count: 20, level: 'normal' },
        { name: '康复训练', count: 15, level: 'normal' },
        { name: '营养饮食', count: 35, level: 'trending' },
        { name: '教练推荐', count: 18, level: 'normal' },
        { name: '训练技巧', count: 42, level: 'hot' },
        { name: '运动经验', count: 28, level: 'trending' },
      ]
      availableTags.value = mockTags
    } catch (error) {
      console.error('加载标签列表失败:', error)
    }
  }

  // 搜索历史管理
  const loadSearchHistory = () => {
    if (!enableHistory) return

    try {
      const history = localStorage.getItem(historyKey)
      if (history) {
        searchHistory.value = JSON.parse(history)
      }
    } catch (error) {
      console.error('加载搜索历史失败:', error)
    }
  }

  const saveToHistory = (keyword: string) => {
    if (!enableHistory || !keyword.trim()) return

    const history = searchHistory.value.filter(item => item !== keyword)
    history.unshift(keyword)
    searchHistory.value = history.slice(0, 10) // 保留最近10条

    try {
      localStorage.setItem(historyKey, JSON.stringify(searchHistory.value))
    } catch (error) {
      console.error('保存搜索历史失败:', error)
    }
  }

  const clearSearchHistory = () => {
    searchHistory.value = []
    try {
      localStorage.removeItem(historyKey)
    } catch (error) {
      console.error('清除搜索历史失败:', error)
    }
  }

  // 切换标签筛选
  const toggleTag = (tagName: string) => {
    const index = filters.tags.indexOf(tagName)
    if (index > -1) {
      filters.tags.splice(index, 1)
    } else {
      filters.tags.push(tagName)
    }
    performSearch()
  }

  // 更新筛选条件
  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    Object.assign(filters, newFilters)
  }

  // 初始化
  const init = async () => {
    loadSearchHistory()
    await Promise.all([loadAvailableCourses(), loadAvailableTags()])
  }

  // 监听筛选变化自动搜索
  watch(
    () => [filters.courseId, filters.tags, filters.timeRange, filters.status, filters.sort, filters.author],
    () => {
      debouncedSearch(() => {
        performSearch()
      })
    },
    { deep: true },
  )

  // 自定义事件发射器
  const emit = (event: string, data?: any) => {
    // 这里可以集成Vue的事件系统或自定义事件总线
    console.log(`Search event: ${event}`, data)
  }

  return {
    // 状态
    filters,
    isSearching,
    searchResults,
    searchHistory,
    searchSuggestions,
    availableCourses,
    availableTags,

    // 计算属性
    activeFiltersCount,
    hasActiveFilters,
    filterStats,

    // 方法
    handleKeywordChange,
    applySuggestion,
    performSearch,
    resetFilters,
    applyFilters,
    loadAvailableCourses,
    loadAvailableTags,
    toggleTag,
    updateFilters,
    clearSearchHistory,
    init,
  }
}
