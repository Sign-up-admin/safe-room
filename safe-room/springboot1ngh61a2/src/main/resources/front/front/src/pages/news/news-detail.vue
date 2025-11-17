<template>
  <div class="detail-page" v-loading="loading">
    <section class="detail-hero" v-if="detail">
      <div>
        <p class="detail-tag">{{ detail.typename || '公告' }}</p>
        <h1>{{ detail.title }}</h1>
        <div class="detail-meta">
          <span>发布日期：{{ formatDate(detail.addtime) }}</span>
          <span>发布人：{{ detail.name || '管理员' }}</span>
          <span>阅读：{{ detail.clicknum || 0 }}</span>
        </div>
      </div>
      <div class="hero-actions">
        <TechButton size="sm" variant="outline" @click="toggleTheme">
          <span class="theme-icon">{{ getThemeIcon() }}</span>
          {{ getThemeLabel() }}
        </TechButton>
        <TechButton size="sm" variant="outline" @click="goBack">返回列表</TechButton>
        <TechButton size="sm" variant="ghost" @click="share">分享</TechButton>
      </div>
    </section>

    <TechCard v-if="detail" class="detail-card" :interactive="false">
      <img v-if="detail.picture" :src="resolveAssetUrl(detail.picture)" alt="公告封面" class="detail-hero-img" />
      <SafeHtml :html="detail.content || detail.introduction" className="detail-content" />
      <div class="detail-actions">
        <TechButton size="sm" variant="ghost" :loading="thumbLoading && pendingThumbType === 1" @click="handleThumb(1)">
          👍 点赞
        </TechButton>
        <TechButton size="sm" variant="ghost" :loading="thumbLoading && pendingThumbType === 0" @click="handleThumb(0)">
          👎 反馈
        </TechButton>
      </div>
    </TechCard>

    <section class="cta-card" v-if="detail">
      <TechCard title="延伸阅读 · 预约体验" subtitle="将灵感转化为行动" :interactive="false">
        <p>想深入体验文章提到的课程或教练？立即预约体验或查看课程详情。</p>
        <div class="cta-actions">
          <TechButton size="sm" @click="router.push('/index/kechengyuyue')">
            📅 预约课程
          </TechButton>
          <TechButton size="sm" variant="outline" @click="router.push('/index/jianshenjiaolian')">
            👨‍💼 查看教练
          </TechButton>
          <TechButton size="sm" variant="ghost" @click="toggleFavorite">
            {{ isFavorited ? '❤️ 已收藏' : '🤍 收藏文章' }}
          </TechButton>
        </div>

        <div class="cta-features" v-if="relatedCourses.length">
          <h4>推荐课程</h4>
          <div class="course-grid">
            <div
              v-for="course in relatedCourses.slice(0, 3)"
              :key="course.id"
              class="course-item"
              @click="router.push(`/index/jianshenkechengDetail?id=${course.id}`)"
            >
              <div class="course-info">
                <strong>{{ course.jianshenkecheng }}</strong>
                <small>{{ course.jianshenleixing }}</small>
              </div>
              <TechButton size="xs" variant="text">查看</TechButton>
            </div>
          </div>
        </div>
      </TechCard>
    </section>

    <TechCard v-if="relatedNews.length" class="related-card" title="最新公告">
      <ul>
        <li v-for="item in relatedNews" :key="item.id" @click="goDetail(item.id)">
          <div>
            <strong>{{ item.title }}</strong>
            <small>{{ formatDate(item.addtime) }}</small>
          </div>
          <TechButton size="sm" variant="text">查看</TechButton>
        </li>
      </ul>
    </TechCard>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import http from '@/common/http'
import config from '@/config/config'
import { TechButton, TechCard } from '@/components/common'
import SafeHtml from '@/components/common/SafeHtml.vue'
import type { ApiResponse, PageResult } from '@/types/api'
import type { NewsItem } from '@/types/content'
import { formatDate } from '@/utils/formatters'
import { useTheme, type ThemeType } from '@/composables/useTheme'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const detail = ref<NewsItem>()
const relatedNews = ref<NewsItem[]>([])
const thumbLoading = ref(false)
const pendingThumbType = ref<0 | 1 | null>(null)
const isFavorited = ref(false)
const relatedCourses = ref<any[]>([])

// 主题管理
const { currentTheme, toggleTheme } = useTheme()

onMounted(() => {
  loadDetail()
})

watch(
  () => route.query.id,
  () => {
    loadDetail()
  },
)

async function loadDetail() {
  const id = route.query.id as string
  if (!id) {
    router.replace('/index/news')
    return
  }
  loading.value = true
  try {
    const response = await http.get<ApiResponse<NewsItem>>(`/news/detail/${id}`)
    detail.value = response.data.data
    await Promise.all([loadRelated(), loadRelatedCourses()])
    checkFavoriteStatus()
  } catch (error) {
    console.error(error)
    ElMessage.error('加载公告失败')
  } finally {
    loading.value = false
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

async function handleThumb(type: 0 | 1) {
  if (!detail.value?.id || thumbLoading.value) return
  thumbLoading.value = true
  pendingThumbType.value = type
  try {
    await http.post<ApiResponse>(`/news/thumbsup/${detail.value.id}`, undefined, { params: { type } })
    const message = type === 1 ? '感谢点赞' : '已记录您的反馈'
    if (type === 1) {
      detail.value.clicknum = (detail.value.clicknum ?? 0) + 1
    }
    ElMessage.success(message)
  } catch (error) {
    console.error(error)
    ElMessage.error('操作失败，请稍后重试')
  } finally {
    thumbLoading.value = false
    pendingThumbType.value = null
  }
}

async function loadRelated() {
  try {
    const response = await http.get<ApiResponse<PageResult<NewsItem>>>('/news/list', {
      params: { page: 1, limit: 5, sort: 'addtime', order: 'desc' },
    })
    relatedNews.value = response.data.data?.list?.filter((item) => item.id !== detail.value?.id) ?? []
  } catch (error) {
    console.warn('加载推荐公告失败', error)
  }
}

async function loadRelatedCourses() {
  try {
    const response = await http.get<ApiResponse<PageResult<any>>>('/jianshenkecheng/list', {
      params: { page: 1, limit: 6, sort: 'addtime', order: 'desc' },
    })
    relatedCourses.value = response.data.data?.list ?? []
  } catch (error) {
    console.warn('加载推荐课程失败', error)
  }
}

function checkFavoriteStatus() {
  // 从本地存储检查收藏状态
  const favorites = JSON.parse(localStorage.getItem('news-favorites') || '[]')
  isFavorited.value = favorites.includes(detail.value?.id)
}

async function toggleFavorite() {
  if (!detail.value?.id) return

  const favorites = JSON.parse(localStorage.getItem('news-favorites') || '[]')
  const newsId = detail.value.id

  if (isFavorited.value) {
    // 取消收藏
    const index = favorites.indexOf(newsId)
    if (index > -1) {
      favorites.splice(index, 1)
    }
    isFavorited.value = false
    ElMessage.success('已取消收藏')
  } else {
    // 添加收藏
    favorites.push(newsId)
    isFavorited.value = true
    ElMessage.success('已添加到收藏')
  }

  localStorage.setItem('news-favorites', JSON.stringify(favorites))
}

function goBack() {
  router.back()
}

function goDetail(id?: number) {
  if (!id) return
  router.push({ path: '/index/newsDetail', query: { id } })
}

function share() {
  if (!detail.value?.id) return
  navigator.clipboard?.writeText(`${window.location.origin}/#/index/newsDetail?id=${detail.value.id}`)
  ElMessage.success('链接已复制')
}

function resolveAssetUrl(path?: string) {
  if (!path) return new URL('@/assets/jianshe.png', import.meta.url).href
  if (/^https?:\/\//i.test(path)) return path
  const normalizedBase = config.baseUrl.replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${normalizedBase}${normalizedPath}`
}

function getThemeIcon() {
  const icons = {
    dark: '🌙',
    light: '☀️',
    blue: '🌊'
  }
  return icons[currentTheme.value] || '🎨'
}

function getThemeLabel() {
  const labels = {
    dark: '深色',
    light: '浅色',
    blue: '蓝色'
  }
  return labels[currentTheme.value] || '主题'
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.detail-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 48px 20px 80px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;

  h1 {
    margin: 8px 0;
  }
}

.detail-tag {
  display: inline-flex;
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid rgba(253, 216, 53, 0.5);
  letter-spacing: 0.2em;
  color: $color-yellow;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.theme-icon {
  margin-right: 4px;
  font-size: 1.1em;
}

.detail-card {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: $color-text-secondary;
}

.detail-hero-img {
  width: 100%;
  max-height: 380px;
  object-fit: cover;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.detail-content {
  color: $color-text-secondary;
  line-height: 1.8;

  :deep(img) {
    max-width: 100%;
    display: block;
    margin: 12px auto;
    border-radius: 12px;
  }
}

.detail-actions {
  display: flex;
  gap: 12px;
}

.cta-card,
.related-card {
  @include glass-card();
}

.cta-actions {
  margin-top: 12px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.cta-features {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);

  h4 {
    margin: 0 0 12px 0;
    font-size: 1rem;
    color: $color-text-primary;
  }
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.course-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: $color-yellow;
    background: rgba(253, 216, 53, 0.05);
    transform: translateY(-2px);
  }
}

.course-info {
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong {
    color: $color-text-primary;
    font-size: 0.9rem;
  }

  small {
    color: $color-text-secondary;
    font-size: 0.75rem;
  }
}

.related-card ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;

  li {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    cursor: pointer;
  }
}

@media (max-width: 1024px) {
  .detail-page {
    max-width: 100%;
    padding: 40px 24px 60px;
  }

  .course-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .detail-page {
    padding: 32px 16px 60px;
    gap: 20px;
  }

  .detail-hero {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;

    h1 {
      font-size: 1.5rem;
      margin: 12px 0;
    }
  }

  .detail-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .hero-actions {
    width: 100%;
    flex-direction: column;
    gap: 8px;

    .el-button {
      width: 100%;
      justify-content: center;
    }
  }

  .detail-card {
    padding: 20px;
  }

  .detail-hero-img {
    max-height: 250px;
  }

  .cta-actions {
    flex-direction: column;
    gap: 10px;

    .el-button {
      width: 100%;
      justify-content: center;
    }
  }

  .course-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .course-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 16px;

    .el-button {
      align-self: stretch;
      justify-content: center;
    }
  }

  .related-card ul li {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 12px 0;

    .el-button {
      align-self: stretch;
      justify-content: center;
    }
  }
}
</style>

