<template>
  <div class="news-page">
    <section class="news-hero">
      <div>
        <p class="section-eyebrow">LATEST STORIES</p>
        <h1>沉浸式资讯墙</h1>
        <p>了解课程上新、会员活动与训练干货，滚动阅读进度实时追踪。</p>
        <div v-if="readingStats.totalRead > 0" class="reading-stats">
          <div class="stat-item">
            <span class="stat-value">{{ readingStats.totalRead }}</span>
            <span class="stat-label">篇已阅览</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ readingStats.averageProgress }}%</span>
            <span class="stat-label">平均进度</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ readingStats.readingTime }}min</span>
            <span class="stat-label">阅读时间</span>
          </div>
        </div>
      </div>
      <div class="hero-actions">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索标题 / 关键词"
          prefix-icon="Search"
          size="large"
          clearable
          @keyup.enter="handleSearch"
        />
        <TechButton size="sm" variant="outline" @click="handleSearch">搜索</TechButton>
        <TechButton size="sm" variant="outline" @click="toggleReadingMode">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14,2 14,8 20,8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10,9 9,9 8,9" />
          </svg>
          {{ isReadingMode ? '退出沉浸' : '沉浸阅读' }}
        </TechButton>
      </div>
    </section>

    <section class="news-filters">
      <div class="filter-tabs">
        <button
          v-for="option in categoryOptions"
          :key="option.value"
          class="filter-tab"
          :class="[{ 'filter-tab--active': filters.typename === option.value }]"
          @click="changeCategory(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
      <div class="sort-tabs">
        <button
          v-for="option in sortOptions"
          :key="option.value"
          class="filter-tab"
          :class="[{ 'filter-tab--active': filters.sort === option.value }]"
          @click="changeSort(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </section>

    <section class="news-grid" :class="{ 'news-grid--loading': loading }">
      <!-- 自定义模糊 loading 遮罩 -->
      <div v-if="loading" class="news-loading-overlay">
        <div class="news-loading-spinner">
          <svg class="circular" viewBox="0 0 50 50">
            <circle class="path" cx="25" cy="25" r="20" fill="none" stroke="#fdd835" stroke-width="3" />
          </svg>
        </div>
      </div>
      <TechCard v-for="(item, index) in newsList" :key="item.id" class="news-card" :interactive="false">
        <div class="card-media" @click="goDetail(item.id)">
          <img :src="resolveAssetUrl(item.picture)" :alt="item.title" />
          <span class="card-tag">{{ item.typename || '公告' }}</span>
        </div>
        <div class="card-body">
          <h3 @click="goDetail(item.id)">{{ item.title }}</h3>
          <p>{{ item.introduction || '敬请期待详细内容' }}</p>
          <div class="card-meta">
            <span>{{ formatDate(item.addtime) }}</span>
            <span>阅读 {{ item.clicknum || 0 }}</span>
          </div>
          <div class="progress-bar">
            <span :style="{ width: `${readingProgress(index)}%` }"></span>
          </div>
        </div>
        <div class="card-actions">
          <TechButton size="sm" variant="text" @click="goDetail(item.id)">阅读更多</TechButton>
          <TechButton size="sm" variant="outline" @click="share(item)">分享</TechButton>
        </div>
      </TechCard>
      <el-empty v-if="!newsList.length && !loading" description="暂无资讯" />
    </section>

    <section v-if="timelineGroups.length" class="timeline">
      <h3>阅读时间线</h3>
      <ul>
        <li v-for="group in timelineGroups" :key="group.month">
          <div class="timeline-dot"></div>
          <div>
            <p>{{ group.month }}</p>
            <small>{{ group.items.length }} 篇内容</small>
          </div>
          <TechButton size="sm" variant="text" @click="scrollToArticle(group.items[0].id)">跳转</TechButton>
        </li>
      </ul>
    </section>

    <!-- 全局滚动进度指示器 -->
    <div class="scroll-progress-indicator" :style="{ width: `${scrollProgress}%` }"></div>

    <div class="pagination">
      <el-pagination
        background
        layout="total, prev, pager, next, jumper"
        :current-page="pagination.page"
        :page-size="pagination.limit"
        :total="pagination.total"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import http from '@/common/http'
import config from '@/config/config'
import { TechButton, TechCard } from '@/components/common'
import type { ApiResponse, PageResult } from '@/types/api'
import type { NewsItem } from '@/types/content'
import { formatDate } from '@/utils/formatters'

const router = useRouter()
const loading = ref(false)
const newsList = ref<NewsItem[]>([])
const categoryOptions = ref<Array<{ label: string; value: string }>>([{ label: '全部', value: '全部' }])
const sortOptions = [
  { label: '最新', value: 'latest' },
  { label: '最热', value: 'hot' },
]
const scrollProgress = ref(0)
const isReadingMode = ref(false)
const readingStats = reactive({
  totalRead: 0,
  averageProgress: 0,
  readingTime: 0,
})

const filters = reactive({
  keyword: '',
  typename: '全部',
  sort: 'latest',
})

const pagination = reactive({
  page: 1,
  limit: 6,
  total: 0,
})

onMounted(() => {
  loadCategories()
  loadNews()
  setupScrollListener()
})

onUnmounted(() => {
  removeScrollListener()
})

async function loadCategories() {
  try {
    const response = await http.get<ApiResponse<PageResult<{ typename: string }>>>('/newstype/list', {
      params: { page: 1, limit: 100, sort: 'id', order: 'asc' },
    })
    const mapped = response.data.data?.list?.map(item => ({ label: item.typename, value: item.typename })) ?? []
    categoryOptions.value = [{ label: '全部', value: '全部' }, ...mapped]
  } catch (error) {
    console.warn('加载公告类型失败', error)
  }
}

async function loadNews() {
  loading.value = true
  try {
    const response = await http.get<ApiResponse<PageResult<NewsItem>>>('/news/list', {
      params: {
        page: pagination.page,
        limit: pagination.limit,
        sort: filters.sort === 'hot' ? 'clicknum' : 'addtime',
        order: filters.sort === 'hot' ? 'desc' : 'desc',
        title: filters.keyword,
        typename: filters.typename === '全部' ? undefined : filters.typename,
      },
    })
    const data = response.data.data
    newsList.value = data?.list ?? []
    pagination.total = data?.total ?? 0
  } catch (error) {
    console.error(error)
    ElMessage.error('加载资讯失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  pagination.page = 1
  loadNews()
}

function changeCategory(value: string) {
  filters.typename = value
  handleSearch()
}

function changeSort(value: string) {
  filters.sort = value
  handleSearch()
}

function handlePageChange(page: number) {
  pagination.page = page
  loadNews()
}

function goDetail(id?: number) {
  if (!id) return
  router.push({ path: '/index/newsDetail', query: { id } })
}

function share(item: NewsItem) {
  navigator.clipboard?.writeText(`${window.location.origin}/#/index/newsDetail?id=${item.id}`)
  ElMessage.success('链接已复制，快去分享吧！')
}

function resolveAssetUrl(path?: string) {
  if (!path) return new URL('@/assets/jianshe.png', import.meta.url).href
  if (/^https?:\/\//i.test(path)) return path
  const normalizedBase = config.baseUrl.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${normalizedBase}${normalizedPath}`
}

function readingProgress(index: number) {
  if (!newsList.value.length) return 0
  // 基于滚动位置的动态进度计算
  const container = document.querySelector('.news-grid')
  if (!container) return Math.round(((index + 1) / newsList.value.length) * 100)

  const containerRect = container.getBoundingClientRect()
  const itemRect = container.children[index]?.getBoundingClientRect()
  if (!itemRect) return 0

  const containerTop = containerRect.top
  const containerHeight = containerRect.height
  const itemTop = itemRect.top
  const itemHeight = itemRect.height

  // 计算该项目在容器中的相对位置
  const relativeTop = itemTop - containerTop
  const progressInContainer = (relativeTop + itemHeight / 2) / containerHeight
  const baseProgress = (index / newsList.value.length) * 100
  const scrollProgress = progressInContainer * 20 // 滚动影响权重

  return Math.min(100, Math.max(0, Math.round(baseProgress + scrollProgress)))
}

const timelineGroups = computed(() => {
  const groups: Record<string, NewsItem[]> = {}
  newsList.value.forEach(item => {
    const month = item.addtime ? item.addtime.slice(0, 7) : '未知'
    if (!groups[month]) groups[month] = []
    groups[month].push(item)
  })
  return Object.entries(groups).map(([month, items]) => ({ month, items }))
})

function scrollToArticle(id?: number) {
  if (!id) return
  goDetail(id)
}

function setupScrollListener() {
  const handleScroll = () => {
    const container = document.querySelector('.news-page')
    if (!container) return

    const scrolled = window.scrollY
    const maxScroll = container.scrollHeight - window.innerHeight
    scrollProgress.value = Math.min(100, Math.max(0, (scrolled / maxScroll) * 100))

    // 更新阅读统计
    updateReadingStats()
  }

  window.addEventListener('scroll', handleScroll, { passive: true })
  // 存储引用以便后续移除
  ;(window as any)._newsScrollHandler = handleScroll
}

function removeScrollListener() {
  const handler = (window as any)._newsScrollHandler
  if (handler) {
    window.removeEventListener('scroll', handler)
  }
}

function updateReadingStats() {
  if (!newsList.value.length) return

  const visibleItems = getVisibleItems()
  readingStats.totalRead = visibleItems.length

  const totalProgress = visibleItems.reduce((sum, index) => sum + readingProgress(index), 0)
  readingStats.averageProgress = visibleItems.length > 0 ? Math.round(totalProgress / visibleItems.length) : 0

  // 模拟阅读时间（基于滚动进度）
  readingStats.readingTime = Math.round(scrollProgress.value * 0.3)
}

function getVisibleItems() {
  const container = document.querySelector('.news-grid')
  if (!container) return []

  const containerRect = container.getBoundingClientRect()
  const visibleItems: number[] = []

  Array.from(container.children).forEach((child, index) => {
    const childRect = child.getBoundingClientRect()
    // 检查元素是否至少部分可见
    if (childRect.bottom > containerRect.top && childRect.top < containerRect.bottom) {
      visibleItems.push(index)
    }
  })

  return visibleItems
}

function toggleReadingMode() {
  isReadingMode.value = !isReadingMode.value
  if (isReadingMode.value) {
    // 进入沉浸阅读模式
    document.body.style.overflow = 'hidden'
    document.querySelector('.news-page')?.classList.add('reading-mode')
  } else {
    // 退出沉浸阅读模式
    document.body.style.overflow = ''
    document.querySelector('.news-page')?.classList.remove('reading-mode')
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.news-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 10% 20%, rgba(253, 216, 53, 0.18), transparent 45%),
    radial-gradient(circle at 80% 0%, rgba(253, 216, 53, 0.12), transparent 45%), #020202;
  padding: 48px 24px 64px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  transition: all 0.3s ease;

  &.reading-mode {
    background: #020202;
    padding: 0;

    .news-hero,
    .news-filters,
    .timeline,
    .pagination {
      display: none;
    }

    .news-grid {
      padding: 24px;
      max-width: none;
      grid-template-columns: 1fr;
      gap: 48px;
    }

    .news-card {
      max-width: 800px;
      margin: 0 auto;
      border-radius: 24px;
      border: 1px solid rgba(253, 216, 53, 0.2);
      background: rgba(255, 255, 255, 0.02);
    }
  }
}

.news-hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 16px;

  h1 {
    margin: 8px 0 0;
    letter-spacing: 0.2em;
  }

  p {
    color: $color-text-secondary;
  }
}

.hero-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.reading-stats {
  display: flex;
  gap: 24px;
  margin-top: 16px;
  flex-wrap: wrap;

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 16px;
    border-radius: 12px;
    background: rgba(253, 216, 53, 0.1);
    border: 1px solid rgba(253, 216, 53, 0.2);

    .stat-value {
      font-size: 1.2rem;
      font-weight: 700;
      color: #fdd835;
    }

    .stat-label {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.7);
      margin-top: 2px;
    }
  }
}

.news-filters {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-tabs,
.sort-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-tab {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  padding: 6px 14px;
  background: transparent;
  cursor: pointer;
  color: $color-text-secondary;

  &--active {
    border-color: rgba(253, 216, 53, 0.8);
    color: $color-yellow;
    box-shadow: $shadow-glow;
  }
}

.news-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  position: relative;
  min-height: 200px;

  &--loading {
    pointer-events: none;
  }
}

// 自定义模糊 loading 遮罩层
.news-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  background-color: rgba(2, 2, 2, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
}

.news-loading-spinner {
  .circular {
    width: 50px;
    height: 50px;
    animation: loading-rotate 2s linear infinite;
  }

  .path {
    animation: loading-dash 1.5s ease-in-out infinite;
    stroke-dasharray: 90, 150;
    stroke-dashoffset: 0;
    stroke-linecap: round;
  }
}

@keyframes loading-rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes loading-dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 200;
    stroke-dashoffset: -35px;
  }
  100% {
    stroke-dasharray: 90, 200;
    stroke-dashoffset: -125px;
  }
}

.news-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-media {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;

  img {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }

  .card-tag {
    position: absolute;
    top: 12px;
    left: 12px;
    padding: 2px 10px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.6);
  }
}

.card-body {
  h3 {
    margin: 0 0 8px;
    cursor: pointer;
  }

  p {
    margin: 0;
    color: $color-text-secondary;
    min-height: 44px;
  }
}

.card-meta {
  display: flex;
  justify-content: space-between;
  color: $color-text-secondary;
  font-size: 0.85rem;
}

.progress-bar {
  margin-top: 12px;
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;

  span {
    display: block;
    height: 100%;
    border-radius: 4px;
    background: linear-gradient(120deg, rgba(253, 216, 53, 0.9), rgba(253, 216, 53, 0.3));
  }
}

.card-actions {
  display: flex;
  gap: 12px;
}

.timeline {
  max-width: 600px;
  margin: 12px auto 0;

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  li {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 12px;
    align-items: center;
  }
}

.timeline-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: $color-yellow;
  box-shadow: $shadow-glow;
}

.scroll-progress-indicator {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, rgba(253, 216, 53, 0.9), rgba(253, 216, 53, 0.3));
  z-index: 1000;
  transition: width 0.1s ease-out;
  box-shadow: 0 0 10px rgba(253, 216, 53, 0.5);
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .news-page {
    padding: 32px 16px 60px;
  }

  .news-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<!-- 全局样式覆盖 Element Plus loading 遮罩层 - 针对新闻页面 -->
<style lang="scss">
.news-page .news-grid .el-loading-mask {
  background-color: rgba(2, 2, 2, 0.6) !important;
}

.news-page .news-grid .el-loading-spinner .el-loading-text {
  color: #fdd835 !important;
}

.news-page .news-grid .el-loading-spinner .path {
  stroke: #fdd835 !important;
}

.news-page .news-grid .el-loading-spinner .el-icon {
  color: #fdd835 !important;
}
</style>
