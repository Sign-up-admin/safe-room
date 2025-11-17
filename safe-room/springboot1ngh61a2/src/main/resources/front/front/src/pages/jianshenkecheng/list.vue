<template>
  <div class="courses-page">
    <section class="courses-page__hero">
      <p class="section-eyebrow">COURSE MATRIX</p>
      <h1>智能训练 · 数据化课程体系</h1>
      <p class="courses-page__hero-desc">
        基于体能数据与训练目标的课程矩阵，提供从入门平衡到高强度 HIIT 的全链路训练体验。
      </p>
    </section>

    <TechCard as="section" class="courses-page__filters" :interactive="false" variant="layered">
      <div class="filters__grid">
        <el-input v-model="filters.keyword" placeholder="搜索课程名称 / 关键词" :prefix-icon="Search" clearable />

        <el-select v-model="filters.type" placeholder="课程类型" clearable>
          <el-option v-for="type in typeOptions" :key="type" :label="type" :value="type" />
        </el-select>

        <el-select v-model="filters.intensity" placeholder="训练强度">
          <el-option
            v-for="option in intensityOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>

        <el-select v-model="filters.sort" placeholder="排序">
          <el-option v-for="option in sortOptions" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>
      </div>

      <div class="filters__price">
        <p>价格范围</p>
        <div class="filters__price-options">
          <button
            v-for="segment in priceSegments"
            :key="segment.value"
            class="filters__chip"
            :class="[{ 'filters__chip--active': filters.price === segment.value }]"
            @click="filters.price = segment.value"
          >
            {{ segment.label }}
          </button>
        </div>
      </div>

      <div class="filters__actions">
        <TechButton size="sm" variant="ghost" @click="resetFilters">重置</TechButton>
        <TechButton size="sm" @click="applyFilters">应用筛选</TechButton>
      </div>
    </TechCard>

    <div class="courses-page__ribbon">
      <TechCard class="ribbon-card" variant="minimal" :interactive="false">
        <p class="ribbon-card__label">课程总数</p>
        <strong>{{ metrics.totalCourses }}</strong>
        <span>实时同步后台数据</span>
      </TechCard>
      <TechCard class="ribbon-card" variant="minimal" :interactive="false">
        <p class="ribbon-card__label">平均价格</p>
        <strong>{{ metrics.avgPrice }}</strong>
        <span>含私教/团课区间</span>
      </TechCard>
      <TechCard class="ribbon-card" variant="minimal" :interactive="false">
        <p class="ribbon-card__label">热门标签</p>
        <strong>{{ metrics.trendingTag }}</strong>
        <span>来自实时点击</span>
      </TechCard>
    </div>

    <div v-if="tagCards.length > 0" class="courses-page__tags">
      <TechCard
        v-for="tag in tagCards"
        :key="tag.key"
        class="tag-card"
        variant="minimal"
        :interactive="true"
        @click="applyTagFilter(tag)"
      >
        <p class="tag-card__title">{{ tag.label }}</p>
        <div class="tag-card__content">
          <span class="tag-card__count">{{ tag.count }}</span>
          <span class="tag-card__unit">门课程</span>
        </div>
      </TechCard>
    </div>

    <div class="courses-page__content">
      <div v-loading="loading.list" class="courses-page__grid">
        <CourseCard
          v-for="course in courses"
          :key="course.id"
          :course="course"
          :intensity="getCourseIntensityLabel(course)"
          @view="goCourseDetail"
          @book="handleBook"
        />
        <el-empty v-if="!courses.length && !loading.list" description="暂无符合条件的课程" />
      </div>

      <div class="courses-page__aside">
        <TechCard class="leaderboard" title="热度榜 TOP3" subtitle="实时点击 & 收藏" :interactive="false">
          <ol class="leaderboard__list">
            <li v-for="(item, index) in leaderboardCourses" :key="item.id">
              <span class="leaderboard__rank">0{{ index + 1 }}</span>
              <div>
                <p class="leaderboard__name">{{ item.kechengmingcheng }}</p>
                <p class="leaderboard__meta">
                  {{ item.kechengleixing || '特色课程' }} · 热度 {{ (item.clicknum ?? 0) + 120 }}
                </p>
              </div>
              <TechButton size="sm" variant="text" @click="goCourseDetail(item)">查看</TechButton>
            </li>
          </ol>
        </TechCard>

        <TechCard
          class="courses-page__cta"
          title="不确定选哪个课程？"
          subtitle="咨询 AI 训练顾问，获取个性化训练路径。"
          variant="layered"
        >
          <template #footer>
            <TechButton block size="sm" @click="handleBook">开启智能推荐</TechButton>
          </template>
        </TechCard>

        <TechCard
          v-loading="recommendations.loadingHeat"
          class="recommend-card"
          title="系统热推"
          subtitle="根据点击热度实时排序"
          :interactive="false"
        >
          <ul class="recommend-card__list">
            <li v-for="item in recommendations.trending" :key="item.id">
              <div>
                <p>{{ item.kechengmingcheng }}</p>
                <small>{{ item.kechengleixing || '智能训练' }}</small>
              </div>
              <TechButton size="sm" variant="text" @click="goCourseDetail(item)">查看</TechButton>
            </li>
          </ul>
          <el-empty v-if="!recommendations.trending.length && !recommendations.loadingHeat" description="暂无推荐" />
        </TechCard>

        <TechCard
          v-loading="recommendations.loadingCollaborative"
          class="recommend-card"
          title="猜你想练"
          subtitle="基于收藏协同过滤"
          :interactive="false"
        >
          <ul class="recommend-card__list">
            <li v-for="item in recommendations.collaborative" :key="`collab-${item.id}`">
              <div>
                <p>{{ item.kechengmingcheng }}</p>
                <small>{{ formatCurrency(item.kechengjiage || 0) }}</small>
              </div>
              <TechButton size="sm" variant="text" @click="handleBook(item)">预约</TechButton>
            </li>
          </ul>
          <el-empty
            v-if="!recommendations.collaborative.length && !recommendations.loadingCollaborative"
            description="暂无推荐"
          />
        </TechCard>
      </div>
    </div>

    <div class="courses-page__pagination">
      <el-pagination
        background
        layout="prev, pager, next"
        :current-page="pagination.page"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { onMounted, reactive, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CourseCard } from '@/components/courses'
import { TechButton, TechCard } from '@/components/common'
import { getModuleService } from '@/services/crud'
import type { Jianshenkecheng } from '@/types/modules'
import { formatCurrency } from '@/utils/formatters'

type SortValue = 'heat' | 'price' | 'latest'

const courseService = getModuleService('jianshenkecheng')
const typeService = getModuleService('kechengleixing')
const route = useRoute()
const router = useRouter()

const courses = ref<Jianshenkecheng[]>([])
const allCourses = ref<Jianshenkecheng[]>([]) // 用于计算标签数量
const typeOptions = ref<string[]>([])
const loading = reactive({
  list: false,
  types: false,
  tags: false,
})
const recommendations = reactive({
  trending: [] as Jianshenkecheng[],
  collaborative: [] as Jianshenkecheng[],
  loadingHeat: false,
  loadingCollaborative: false,
})

const pagination = reactive({
  page: 1,
  pageSize: 9,
  total: 0,
})

const priceSegments = [
  { label: '< ¥299', value: 'segment-1', min: 0, max: 299 },
  { label: '¥300 - 599', value: 'segment-2', min: 300, max: 599 },
  { label: '¥600 - 999', value: 'segment-3', min: 600, max: 999 },
  { label: '¥1000+', value: 'segment-4', min: 1000 },
]

const intensityOptions = [
  { label: '全部强度', value: 'all' },
  { label: '入门平衡', value: 'starter' },
  { label: '燃脂 HIIT', value: 'burn' },
  { label: '增肌进阶', value: 'advance' },
  { label: '康复塑形', value: 'rehab' },
]

const sortOptions: Array<{ label: string; value: SortValue }> = [
  { label: '热度优先', value: 'heat' },
  { label: '价格优先', value: 'price' },
  { label: '最新上线', value: 'latest' },
]

const filters = reactive({
  keyword: '',
  type: '',
  intensity: 'all',
  price: priceSegments[1].value,
  sort: 'heat' as SortValue,
})

const metrics = computed(() => ({
  totalCourses: pagination.total,
  avgPrice: courses.value.length
    ? formatCurrency(courses.value.reduce((sum, item) => sum + (item.kechengjiage || 0), 0) / courses.value.length)
    : '¥0',
  trendingTag: courses.value[0]?.kechengleixing || '智能训练',
}))

const leaderboardCourses = computed(() =>
  [...courses.value].sort((a, b) => (b.clicknum ?? 0) - (a.clicknum ?? 0)).slice(0, 3),
)

// 标签卡片数据
const tagCards = computed(() => {
  const typeMap = new Map<string, number>()
  const intensityMap = new Map<string, number>()

  // 统计课程类型
  allCourses.value.forEach(course => {
    const type = course.kechengleixing
    if (type) {
      typeMap.set(type, (typeMap.get(type) || 0) + 1)
    }
  })

  // 统计强度标签
  allCourses.value.forEach(course => {
    const intensityLabel = getCourseIntensityLabel(course)
    intensityMap.set(intensityLabel, (intensityMap.get(intensityLabel) || 0) + 1)
  })

  // 合并类型和强度标签
  const tags: Array<{ key: string; label: string; count: number; filterType: string }> = []

  // 添加课程类型标签
  typeMap.forEach((count, label) => {
    tags.push({
      key: `type-${label}`,
      label,
      count,
      filterType: 'type',
    })
  })

  // 添加强度标签
  intensityMap.forEach((count, label) => {
    tags.push({
      key: `intensity-${label}`,
      label,
      count,
      filterType: 'intensity',
    })
  })

  // 排序并限制数量
  return tags
    .filter(tag => tag.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6) // 最多显示6个标签
})

watch(
  () => route.query.focus,
  focus => {
    if (typeof focus === 'string') {
      applyFocus(focus)
    }
  },
  { immediate: true },
)

onMounted(() => {
  loadCourseTypes()
  loadCourses()
  loadRecommendations()
  loadAllCoursesForTags()
})

async function loadCourseTypes() {
  loading.types = true
  try {
    const { list } = await typeService.list({ page: 1, limit: 50 })
    typeOptions.value = list.map(item => item.kechengleixing).filter(Boolean) as string[]
  } catch (error) {
    console.error(error)
  } finally {
    loading.types = false
  }
}

async function loadCourses() {
  loading.list = true
  try {
    const params: Record<string, any> = {
      page: pagination.page,
      limit: pagination.pageSize,
      ...buildSortParams(filters.sort),
    }
    if (filters.keyword) params.keyword = filters.keyword
    if (filters.type) params.kechengleixing = filters.type

    const priceRange = priceSegments.find(segment => segment.value === filters.price)
    if (priceRange?.min !== undefined) params.minprice = priceRange.min
    if (priceRange?.max !== undefined) params.maxprice = priceRange.max

    const { list, total } = await courseService.list(params)
    courses.value = applyIntensityFilter(list ?? [])
    pagination.total = total
  } catch (error) {
    console.error(error)
    ElMessage.error('加载课程失败')
  } finally {
    loading.list = false
  }
}

async function loadAllCoursesForTags() {
  loading.tags = true
  try {
    const { list } = await courseService.list({ page: 1, limit: 1000 })
    allCourses.value = list ?? []
  } catch (error) {
    console.error(error)
  } finally {
    loading.tags = false
  }
}

async function loadRecommendations() {
  await Promise.all([loadHeatRecommendations(), loadCollaborativeRecommendations()])
}

async function loadHeatRecommendations() {
  recommendations.loadingHeat = true
  try {
    const list = await courseService.autoSort({ limit: 3 })
    recommendations.trending = list.slice(0, 3)
  } catch (error) {
    console.error(error)
  } finally {
    recommendations.loadingHeat = false
  }
}

async function loadCollaborativeRecommendations() {
  recommendations.loadingCollaborative = true
  try {
    const list = await courseService.autoSortCollaborative({ limit: 3 })
    recommendations.collaborative = list.slice(0, 3)
  } catch (error) {
    console.error(error)
  } finally {
    recommendations.loadingCollaborative = false
  }
}

function applyIntensityFilter(list: Jianshenkecheng[]) {
  if (filters.intensity === 'all') return list
  return list.filter(course => deriveIntensity(course) === filters.intensity)
}

function deriveIntensity(course: Jianshenkecheng): string {
  const source = `${course.kechengleixing ?? ''}${course.kechengjianjie ?? ''}`
  if (/燃脂|HIIT|冲刺/.test(source)) return 'burn'
  if (/增肌|力量|爆发/.test(source)) return 'advance'
  if (/康复|体态|修复/.test(source)) return 'rehab'
  return 'starter'
}

function getCourseIntensityLabel(course: Jianshenkecheng) {
  const mapping: Record<string, string> = {
    starter: '入门',
    burn: '燃脂',
    advance: '进阶',
    rehab: '康复',
  }
  return mapping[deriveIntensity(course)] || '进阶'
}

function applyFilters() {
  pagination.page = 1
  loadCourses()
}

function resetFilters() {
  filters.keyword = ''
  filters.type = ''
  filters.intensity = 'all'
  filters.price = priceSegments[1].value
  filters.sort = 'heat'
  applyFilters()
}

function handlePageChange(page: number) {
  pagination.page = page
  loadCourses()
}

function goCourseDetail(course: Jianshenkecheng) {
  router.push({ path: '/index/jianshenkechengDetail', query: { id: course.id } })
}

function handleBook(course?: Jianshenkecheng) {
  const query = course?.id ? { courseId: course.id } : undefined
  router.push({ path: '/index/kechengyuyue', query })
}

function applyFocus(slug: string) {
  const mapping: Record<string, string> = {
    mass: '增肌特训',
    'fat-burn': '燃脂训练',
    posture: '体态塑形',
    vip: '高级私教',
    group: '团体课程',
    environment: '场馆环境',
  }
  if (mapping[slug]) {
    filters.type = mapping[slug]
    pagination.page = 1
    loadCourses()
  }
}

function buildSortParams(sort: SortValue) {
  switch (sort) {
    case 'price':
      return { sort: 'kechengjiage', order: 'asc' }
    case 'latest':
      return { sort: 'addtime', order: 'desc' }
    default:
      return { sort: 'clicknum', order: 'desc' }
  }
}

function applyTagFilter(tag: { key: string; label: string; filterType: string }) {
  if (tag.filterType === 'type') {
    filters.type = tag.label
    filters.intensity = 'all'
  } else {
    // 强度标签
    const intensityMap: Record<string, string> = {
      入门: 'starter',
      燃脂: 'burn',
      进阶: 'advance',
      康复: 'rehab',
    }
    filters.intensity = intensityMap[tag.label] || 'all'
    filters.type = ''
  }
  pagination.page = 1
  applyFilters()
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.courses-page {
  padding: 60px 6vw 80px;
  display: flex;
  flex-direction: column;
  gap: 32px;

  &__hero {
    max-width: 720px;
    display: flex;
    flex-direction: column;
    gap: 12px;

    h1 {
      margin: 0;
      font-size: clamp(2.4rem, 4vw, 3.4rem);
    }
  }

  &__hero-desc {
    color: $color-text-secondary;
    margin: 0;
    font-size: 1.05rem;
  }

  &__filters {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__ribbon {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 18px;
  }

  &__tags {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 18px;
  }

  &__content {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 320px;
    gap: 24px;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    min-height: 200px;
  }

  &__aside {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  &__cta {
    text-align: left;
  }

  &__pagination {
    display: flex;
    justify-content: center;
  }
}

.recommend-card {
  &__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;

    li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);

      &:last-child {
        border-bottom: none;
      }

      p {
        margin: 0;
        font-weight: 600;
      }

      small {
        color: $color-text-secondary;
      }
    }
  }
}

.filters {
  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  &__price {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__price-options {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__chip {
    border-radius: 999px;
    padding: 6px 18px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: transparent;
    color: $color-text-primary;
    letter-spacing: 0.08em;
    cursor: pointer;
    transition: $transition-base;

    &--active {
      border-color: $color-yellow;
      color: $color-yellow;
      box-shadow: 0 0 12px rgba(253, 216, 53, 0.28);
    }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

.ribbon-card {
  gap: 6px;

  strong {
    font-size: 2rem;
    letter-spacing: 0.1em;
  }

  span {
    color: $color-text-secondary;
  }
}

.tag-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 16px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(253, 216, 53, 0.2);
  }

  &__title {
    margin: 0;
    color: $color-yellow;
    font-size: 0.95rem;
    font-weight: 600;
    letter-spacing: 0.05em;
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 80px;
    border: 1px solid $color-yellow;
    border-radius: 8px;
    padding: 16px;
    background: rgba(253, 216, 53, 0.05);
    gap: 4px;
  }

  &__count {
    font-size: 1.8rem;
    font-weight: 700;
    color: $color-yellow;
    letter-spacing: 0.1em;
  }

  &__unit {
    font-size: 0.85rem;
    color: rgba(253, 216, 53, 0.7);
  }
}

.leaderboard {
  &__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  li {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__rank {
    font-size: 1.2rem;
    color: $color-yellow;
    letter-spacing: 0.25em;
  }

  &__name {
    margin: 0;
  }

  &__meta {
    margin: 2px 0 0;
    color: $color-text-secondary;
    font-size: 0.85rem;
  }
}

@media (max-width: 1024px) {
  .courses-page__content {
    grid-template-columns: 1fr;
  }

  .courses-page__aside {
    flex-direction: row;
    flex-wrap: wrap;

    > * {
      flex: 1 1 280px;
    }
  }
}

@media (max-width: 640px) {
  .courses-page {
    padding: 40px 16px 60px;
  }

  .filters__actions {
    flex-direction: column;
  }
}
</style>
