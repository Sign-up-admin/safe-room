<template>
  <div class="favorites-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">MY FAVORITES</p>
        <h2>沉浸式收藏柜</h2>
        <span>快速筛选课程、教练、器材收藏，一键预约或取消收藏。</span>
      </div>
      <div class="header-actions">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索课程 / 教练 / 标签"
          prefix-icon="Search"
          size="large"
          clearable
          class="search-input"
        />
        <TechButton size="sm" variant="outline" @click="refresh">刷新</TechButton>
      </div>
    </header>

    <!-- 收藏概览 -->
    <FavoritesOverview
      :categories="
        categories.slice(1).map(cat => ({ name: cat.label, count: cat.count, color: getCategoryColor(cat.value) }))
      "
      :total-count="favorites.length"
      :recent-count="recentCount"
    />

    <section class="filter-bar">
      <div class="filter-tabs">
        <button
          v-for="category in categories"
          :key="category.value"
          class="filter-tab"
          :class="[{ 'filter-tab--active': filters.category === category.value }]"
          @click="filters.category = category.value"
        >
          {{ category.label }} <span>{{ category.count }}</span>
        </button>
      </div>
      <div class="bulk-actions">
        <div class="selection-controls">
          <el-checkbox
            v-model="selectAll"
            :indeterminate="selectedIds.length > 0 && selectedIds.length < favorites.length"
            @change="handleSelectAll"
          >
            全选 {{ favorites.length }} 项
          </el-checkbox>
          <div v-if="selectedIds.length" class="bulk-selection-info">
            <span class="selection-count">已选择 {{ selectedIds.length }} 项</span>
            <TechButton size="sm" variant="ghost" @click="clearSelection">清空选择</TechButton>
          </div>
        </div>
        <div class="bulk-operation-buttons">
          <TechButton size="sm" variant="outline" :disabled="!selectedIds.length" @click="batchBook">
            <template #icon>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </template>
            批量预约
          </TechButton>
          <TechButton size="sm" variant="outline" :disabled="!selectedIds.length" @click="batchConsult">
            <template #icon>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
            </template>
            批量咨询
          </TechButton>
          <TechButton size="sm" variant="outline" :disabled="!selectedIds.length" @click="batchRemove">
            <template #icon>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M19 7L5 7M10 11V17M14 11V17M22 7V19C22 20.1046 21.1046 21 20 21H8C6.89543 21 6 20.1046 6 19V7M4 7H2M4 7H6M4 7V5C4 3.89543 4.89543 3 6 3H8M20 7V5C20 3.89543 19.1046 3 18 3H16"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </template>
            批量删除
          </TechButton>
          <TechButton size="sm" variant="outline" :disabled="!selectedIds.length" @click="batchShare">
            <template #icon>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12C9 11.518 8.886 11.062 8.684 10.658M8.684 13.342L6 16M8.684 13.342L6.658 16.316M8.684 10.658L6 8M8.684 10.658L6.658 7.684M15 7L15 17M18 10L15 7L12 10M18 14L15 17L12 14"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </template>
            批量分享
          </TechButton>
          <TechButton size="sm" variant="outline" :disabled="!selectedIds.length" @click="batchExport">
            <template #icon>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 10V16M12 16L9 13M12 16L15 13M17 7H7C5.89543 7 5 7.89543 5 9V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V9C19 7.89543 18.1046 7 17 7Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </template>
            导出列表
          </TechButton>
        </div>
      </div>
    </section>

    <section v-loading="loading" class="favorites-grid">
      <TechCard
        v-for="item in filteredFavorites"
        :key="item.id"
        class="favorite-card"
        :class="[{ 'favorite-card--selected': selectionState[item.id!] }]"
        :interactive="false"
      >
        <div class="card-media">
          <img v-if="item.picture" :src="resolveAssetUrl(item.picture)" :alt="item.name" />
          <div class="card-type">{{ translateTableName(item.tablename) }}</div>
          <el-checkbox v-model="selectionState[item.id!]" @change="value => handleSelectChange(item.id!, value)" />
        </div>
        <div class="card-body">
          <h3>{{ item.name }}</h3>
          <p>{{ item.remark || '暂无备注，点击查看详情了解更多' }}</p>
          <div class="card-meta">
            <span>{{ formatDate(item.addtime) }}</span>
            <span>来源 ID：{{ item.refid || '--' }}</span>
          </div>
        </div>
        <div class="card-actions">
          <TechButton size="sm" variant="outline" @click="goDetail(item)">查看详情</TechButton>
          <TechButton size="sm" variant="text" @click="remove(item.id)">取消收藏</TechButton>
        </div>
      </TechCard>
      <el-empty v-if="!filteredFavorites.length && !loading" description="没有符合筛选条件的收藏" />
    </section>

    <div class="pagination">
      <el-pagination
        background
        layout="total, prev, pager, next"
        :current-page="pagination.page"
        :page-size="pagination.limit"
        :total="pagination.total"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 推荐内容 -->
    <section v-if="recommendedItems.length > 0" class="recommendations-section">
      <TechCard title="为你推荐" subtitle="根据你的收藏偏好推荐">
        <div class="recommendations-grid">
          <TechCard v-for="item in recommendedItems" :key="item.id" class="recommendation-card" :interactive="false">
            <div class="recommendation-media">
              <img v-if="item.picture" :src="resolveAssetUrl(item.picture)" :alt="item.name" />
              <div class="recommendation-type">{{ translateTableName(item.tablename) }}</div>
            </div>
            <div class="recommendation-body">
              <h4>{{ item.name }}</h4>
              <p>{{ item.remark || '点击查看详情了解更多' }}</p>
            </div>
            <div class="recommendation-actions">
              <TechButton size="sm" variant="outline" @click="goDetail(item)">查看详情</TechButton>
              <TechButton size="sm" @click="addToFavorites(item)">加入收藏</TechButton>
            </div>
          </TechCard>
        </div>
      </TechCard>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import http from '@/common/http'
import config from '@/config/config'
import type { ApiResponse, PageResult } from '@/types/api'
import type { StoreupItem } from '@/types/content'
import type { ModuleEntityMap } from '@/types/modules'
import { formatDate } from '@/utils/formatters'
import { TechButton, TechCard } from '@/components/common'
import FavoritesOverview from '@/components/favorites/FavoritesOverview.vue'
import { getModuleService } from '@/services/crud'

const router = useRouter()
const favorites = ref<StoreupItem[]>([])
const loading = ref(false)
const pagination = reactive({ page: 1, limit: 9, total: 0 })
const filters = reactive({ category: 'all', keyword: '' })
const selectionState = reactive<Record<number, boolean>>({})
const selectAll = ref(false)
const userId = localStorage.getItem('userid')

const selectedIds = computed(() =>
  Object.entries(selectionState)
    .filter(([, checked]) => checked)
    .map(([id]) => Number(id)),
)

const recommendedItems = ref<StoreupItem[]>([])

// 7天内收藏数量
const recentCount = computed(() => {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  return favorites.value.filter(item => {
    if (!item.addtime) return false
    const addTime = new Date(item.addtime)
    return addTime >= sevenDaysAgo
  }).length
})

// 分类颜色映射
function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    jianshenkecheng: '#4a90e2',
    jianshenjiaolian: '#f44336',
    jianshenqicai: '#4caf50',
    news: '#ff9800',
    other: '#9c27b0',
  }
  return colors[category] || '#666'
}

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
  ]
})

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

onMounted(() => {
  refresh()
  loadRecommendations()
})

function refresh() {
  loadFavorites()
}

async function loadFavorites() {
  loading.value = true
  try {
    const response = await http.get<ApiResponse<PageResult<StoreupItem>>>('/storeup/autoSort', {
      params: {
        page: pagination.page,
        limit: pagination.limit,
        userid: userId,
      },
    })
    favorites.value = response.data.data?.list ?? []
    pagination.total = response.data.data?.total ?? 0
    resetSelection()
    selectAll.value = false
  } catch (error) {
    console.error(error)
    ElMessage.error('加载收藏列表失败')
  } finally {
    loading.value = false
  }
}

function resetSelection() {
  Object.keys(selectionState).forEach(key => delete selectionState[Number(key)])
}

function handlePageChange(page: number) {
  pagination.page = page
  loadFavorites()
}

async function remove(id?: number) {
  if (!id) return
  try {
    await http.post<ApiResponse>('/storeup/delete', [id])
    ElMessage.success('已取消收藏')
    refresh()
  } catch (error) {
    console.error(error)
    ElMessage.error('取消收藏失败')
  }
}

async function batchRemove() {
  if (!selectedIds.value.length) return
  try {
    await http.post<ApiResponse>('/storeup/delete', selectedIds.value)
    ElMessage.success('批量取消成功')
    refresh()
  } catch (error) {
    console.error(error)
    ElMessage.error('批量取消失败')
  }
}

function goDetail(item: StoreupItem) {
  if (!item.refid || !item.tablename) return
  router.push({ path: `/index/${item.tablename}Detail`, query: { id: item.refid } })
}

function translateTableName(value?: string) {
  switch (value) {
    case 'jianshenkecheng':
      return '健身课程'
    case 'jianshenjiaolian':
      return '健身教练'
    case 'jianshenqicai':
      return '健身器材'
    default:
      return '其他'
  }
}

function resolveAssetUrl(path?: string) {
  if (!path) return new URL('@/assets/jianshe.png', import.meta.url).href
  if (/^https?:\/\//i.test(path)) return path
  const normalizedBase = config.baseUrl.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${normalizedBase}${normalizedPath}`
}

function handleSelectChange(id: number, value: boolean) {
  selectionState[id] = value
  updateSelectAllState()
}

function handleSelectAll(value: boolean) {
  selectAll.value = value
  favorites.value.forEach(item => {
    if (item.id) {
      selectionState[item.id] = value
    }
  })
}

function updateSelectAllState() {
  const selectedCount = selectedIds.value.length
  const totalCount = favorites.value.length

  if (selectedCount === 0) {
    selectAll.value = false
  } else if (selectedCount === totalCount) {
    selectAll.value = true
  }
  // indeterminate state is handled by the :indeterminate prop
}

function clearSelection() {
  Object.keys(selectionState).forEach(key => delete selectionState[Number(key)])
}

async function batchShare() {
  if (!selectedIds.value.length) return

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
      // Fallback for browsers that don't support Web Share API
      await navigator.clipboard.writeText(`${shareText}\n\n来自: ${window.location.href}`)
      ElMessage.success('收藏列表已复制到剪贴板')
    }
  } catch (error) {
    ElMessage.error('分享失败，请稍后重试')
  }
}

async function batchExport() {
  if (!selectedIds.value.length) return

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

  ElMessage.success('收藏列表已导出')
}

// 批量预约
async function batchBook() {
  if (!selectedIds.value.length) return

  const selectedItems = favorites.value.filter(item => selectedIds.value.includes(item.id!))
  const bookableItems = selectedItems.filter(item => item.tablename === 'jianshenkecheng')

  if (bookableItems.length === 0) {
    ElMessage.warning('选中的收藏中没有可预约的课程')
    return
  }

  try {
    // 批量创建预约记录
    const bookingPromises = bookableItems.map(async item => {
      const bookingData = {
        kechengyuyue: {
          kechengmingcheng: item.name,
          kechengid: item.refid,
          yuyueshijian: new Date().toISOString(),
          yonghuzhanghao: userId,
          yuyuezhuangtai: '待确认',
        },
      }
      return http.post('/kechengyuyue/save', bookingData)
    })

    await Promise.all(bookingPromises)

    ElMessage.success(`成功预约 ${bookableItems.length} 个课程`)
    clearSelection()

    // 可以跳转到预约管理页面
    // router.push('/index/yuyueguanli')
  } catch (error) {
    console.error('批量预约失败:', error)
    ElMessage.error('批量预约失败，请稍后重试')
  }
}

// 批量咨询
async function batchConsult() {
  if (!selectedIds.value.length) return

  const selectedItems = favorites.value.filter(item => selectedIds.value.includes(item.id!))
  const consultableItems = selectedItems.filter(
    item => item.tablename === 'jianshenjiaolian' || item.tablename === 'jianshenqicai',
  )

  if (consultableItems.length === 0) {
    ElMessage.warning('选中的收藏中没有可咨询的项目')
    return
  }

  try {
    // 创建咨询记录或发送咨询消息
    const consultPromises = consultableItems.map(async item => {
      const consultData = {
        consultType: item.tablename,
        targetId: item.refid,
        targetName: item.name,
        userId: userId,
        message: `对收藏的${translateTableName(item.tablename)}"${item.name}"感兴趣，想咨询更多详情`,
        createTime: new Date().toISOString(),
      }
      return http.post('/consult/save', consultData)
    })

    await Promise.all(consultPromises)

    ElMessage.success(`已发送 ${consultableItems.length} 个咨询请求`)
    clearSelection()
  } catch (error) {
    console.error('批量咨询失败:', error)
    ElMessage.error('批量咨询失败，请稍后重试')
  }
}

// 加载推荐内容
async function loadRecommendations() {
  try {
    // 根据收藏类型推荐相关内容
    const favoriteTypes = [...new Set(favorites.value.map(item => item.tablename).filter(Boolean))]

    if (favoriteTypes.length === 0) {
      // 如果没有收藏，推荐热门内容
      const courseService = getModuleService('jianshenkecheng')
      const coachService = getModuleService('jianshenjiaolian')

      const [courses, coaches] = await Promise.all([
        courseService.list({ page: 1, limit: 3, sort: 'clicknum', order: 'desc' }),
        coachService.list({ page: 1, limit: 3, sort: 'addtime', order: 'desc' }),
      ])

      recommendedItems.value = [
        ...(courses.list?.map(item => ({
          id: item.id,
          name: item.kechengmingcheng || '',
          tablename: 'jianshenkecheng',
          refid: item.id,
          picture: item.tupian,
          remark: item.kechengjieshao,
          addtime: item.addtime,
        })) || []),
        ...(coaches.list?.map(item => ({
          id: item.id,
          name: item.jiaolianxingming || '',
          tablename: 'jianshenjiaolian',
          refid: item.id,
          picture: item.touxiang,
          remark: item.jiaolianjieshao,
          addtime: item.addtime,
        })) || []),
      ].slice(0, 6)
      return
    }

    // 根据收藏类型推荐
    const recommendations: StoreupItem[] = []

    for (const type of favoriteTypes.slice(0, 2)) {
      try {
        const service = getModuleService(type as keyof ModuleEntityMap)
        const { list } = await service.list({ page: 1, limit: 3, sort: 'clicknum', order: 'desc' })

        const items =
          list?.map(item => {
            const name =
              type === 'jianshenkecheng'
                ? (item as any).kechengmingcheng
                : type === 'jianshenjiaolian'
                  ? (item as any).jiaolianxingming
                  : (item as any).qicaimingcheng || ''

            const picture =
              type === 'jianshenkecheng'
                ? (item as any).tupian
                : type === 'jianshenjiaolian'
                  ? (item as any).touxiang
                  : (item as any).tupian || ''

            const remark =
              type === 'jianshenkecheng'
                ? (item as any).kechengjieshao
                : type === 'jianshenjiaolian'
                  ? (item as any).jiaolianjieshao
                  : (item as any).qicaijieshao || ''

            return {
              id: item.id,
              name,
              tablename: type,
              refid: item.id,
              picture,
              remark,
              addtime: (item as any).addtime,
            } as StoreupItem
          }) || []

        recommendations.push(...items)
      } catch (error) {
        console.warn(`Failed to load recommendations for ${type}`, error)
      }
    }

    // 过滤掉已收藏的内容
    const favoriteRefIds = new Set(
      favorites.value.filter(item => item.refid).map(item => `${item.tablename}-${item.refid}`),
    )

    recommendedItems.value = recommendations
      .filter(item => !favoriteRefIds.has(`${item.tablename}-${item.refid}`))
      .slice(0, 6)
  } catch (error) {
    console.warn('Failed to load recommendations', error)
  }
}

// 添加到收藏
async function addToFavorites(item: StoreupItem) {
  if (!item.refid || !item.tablename || !userId) {
    ElMessage.warning('无法添加收藏')
    return
  }

  try {
    await http.post<ApiResponse>('/storeup/add', {
      refid: item.refid,
      tablename: item.tablename,
      name: item.name,
      picture: item.picture,
      remark: item.remark,
    })
    ElMessage.success('已添加到收藏')
    refresh()
    loadRecommendations()
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || '添加收藏失败')
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.favorites-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 15% 20%, rgba(253, 216, 53, 0.2), transparent 45%),
    radial-gradient(circle at 80% 0%, rgba(253, 216, 53, 0.12), transparent 45%), #020202;
  padding: 48px 24px 64px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  max-width: 1200px;
  margin: 0 auto;

  h2 {
    margin: 4px 0;
    letter-spacing: 0.2em;
  }

  span {
    color: $color-text-secondary;
  }
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;

  .search-input {
    width: 260px;
  }
}

.filter-bar {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.filter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-tab {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  padding: 6px 14px;
  background: transparent;
  color: $color-text-secondary;
  cursor: pointer;
  transition: $transition-base;

  span {
    margin-left: 6px;
    color: $color-text-secondary;
  }

  &--active {
    color: $color-yellow;
    border-color: rgba(253, 216, 53, 0.8);
    box-shadow: $shadow-glow;
  }
}

.bulk-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.selection-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.bulk-selection-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(253, 216, 53, 0.1);
  border: 1px solid rgba(253, 216, 53, 0.3);
}

.selection-count {
  font-weight: 600;
  color: $color-yellow;
  font-size: 0.9rem;
}

.bulk-operation-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.favorites-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}

.favorite-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;

  &:hover {
    transform: translateY(-2px);
  }

  &--selected {
    border-color: rgba(253, 216, 53, 0.6);
    box-shadow: 0 0 20px rgba(253, 216, 53, 0.3);
  }
}

.card-media {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  min-height: 160px;
  background: rgba(255, 255, 255, 0.04);

  img {
    width: 100%;
    height: 180px;
    object-fit: cover;
  }

  .card-type {
    position: absolute;
    top: 12px;
    left: 12px;
    padding: 2px 10px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.5);
  }

  :deep(.el-checkbox) {
    position: absolute;
    top: 12px;
    right: 12px;
  }
}

.card-body {
  h3 {
    margin: 0 0 6px;
  }

  p {
    margin: 0;
    color: $color-text-secondary;
    min-height: 44px;
  }
}

.card-meta {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  color: $color-text-secondary;
  font-size: 0.85rem;
}

.card-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.pagination {
  max-width: 1200px;
  margin: 24px auto 0;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .favorites-grid {
    grid-template-columns: 1fr;
  }
}

.recommendations-section {
  max-width: 1200px;
  margin: 32px auto 0;
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.recommendation-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommendation-media {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  min-height: 140px;
  background: rgba(255, 255, 255, 0.04);

  img {
    width: 100%;
    height: 140px;
    object-fit: cover;
  }

  .recommendation-type {
    position: absolute;
    top: 12px;
    left: 12px;
    padding: 4px 10px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.6);
    font-size: 0.75rem;
    color: $color-yellow;
  }
}

.recommendation-body {
  h4 {
    margin: 0 0 6px;
    font-size: 1rem;
    font-weight: 600;
  }

  p {
    margin: 0;
    color: $color-text-secondary;
    font-size: 0.875rem;
    min-height: 40px;
  }
}

.recommendation-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

@media (max-width: 768px) {
  .recommendations-grid {
    grid-template-columns: 1fr;
  }
}
</style>
