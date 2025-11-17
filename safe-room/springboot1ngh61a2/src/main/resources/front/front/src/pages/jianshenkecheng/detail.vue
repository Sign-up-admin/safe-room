<template>
  <div v-if="course" class="course-detail">
    <section class="course-hero" :style="heroBackground">
      <video
        v-if="course.kechengshipin"
        class="course-hero__video"
        :src="resolveAssetUrl(course.kechengshipin)"
        autoplay
        muted
        loop
        playsinline
      />
      <div class="course-hero__content">
        <p class="section-eyebrow">{{ course.kechengleixing || '智能训练' }}</p>
        <h1>{{ course.kechengmingcheng }}</h1>
        <p class="course-hero__subtitle">
          {{ course.kechengjianjie || '沉浸式训练体验，融合 AI 体能监测、明星教练与数据化反馈。' }}
        </p>
        <div class="course-hero__stats">
          <div>
            <span>评分</span>
            <strong>{{ heroStats.rating }}</strong>
          </div>
          <div>
            <span>课时</span>
            <strong>{{ heroStats.sessions }} 次</strong>
          </div>
          <div>
            <span>热度</span>
            <strong>{{ heroStats.heat }}+</strong>
          </div>
        </div>
        <div class="course-hero__cta">
          <TechButton size="lg" @click="handleBook">预约体验</TechButton>
          <TechButton size="lg" variant="outline" @click="scrollToSchedule">咨询顾问</TechButton>
        </div>
      </div>
    </section>

    <div class="course-detail__grid">
      <main class="course-detail__main">
        <TechCard title="训练收益矩阵" subtitle="力量 / 体能 / 柔韧 / 体态">
          <CourseBenefitsChart :metrics="benefitMetrics" />
        </TechCard>

        <TechCard title="课程信息" subtitle="周期 · 适用人群 · 设备需求">
          <div class="course-info">
            <dl>
              <dt>课程类型</dt>
              <dd>{{ course.kechengleixing || '特色课程' }}</dd>
            </dl>
            <dl>
              <dt>上课时间</dt>
              <dd>{{ formattedDate }}</dd>
            </dl>
            <dl>
              <dt>上课地点</dt>
              <dd>{{ course.shangkedidian || '旗舰体验馆' }}</dd>
            </dl>
            <dl>
              <dt>单次价格</dt>
              <dd>{{ formattedPrice }}</dd>
            </dl>
            <dl>
              <dt>适用人群</dt>
              <dd>{{ persona }}</dd>
            </dl>
            <dl>
              <dt>设备要求</dt>
              <dd>{{ equipment }}</dd>
            </dl>
          </div>
          <p class="course-info__description">
            {{ course.kechengjianjie || '课程结合力量周期、体态修复与高效燃脂模块，配备 AI 训练监控与实时反馈系统。' }}
          </p>
        </TechCard>

        <TechCard ref="scheduleCard" title="预约流程 & 档期" subtitle="三步完成 · 实时查看余位">
          <Stepper :steps="bookingSteps" :current="selectedStep" />
          <div class="schedule-grid">
            <article v-for="day in schedule" :key="day.label" class="schedule-card">
              <header>
                <p>{{ day.label }}</p>
                <span>{{ day.weekday }}</span>
              </header>
              <div class="schedule-card__slots">
                <button
                  v-for="slot in day.slots"
                  :key="slot.time"
                  class="schedule-slot"
                  :class="[
                    `schedule-slot--${slot.status}`,
                    { 'schedule-slot--selected': isSelectedSlot(day.label, slot.time) },
                  ]"
                  @click="selectSlot(day.label, slot.time)"
                >
                  <span>{{ slot.time }}</span>
                  <small>{{ slot.statusLabel }}</small>
                </button>
              </div>
            </article>
          </div>
          <div class="schedule-actions">
            <TechButton size="sm" @click="handleBook">锁定当前时段</TechButton>
            <TechButton size="sm" variant="ghost" @click="handleMessage">联系客服</TechButton>
          </div>
        </TechCard>

        <TechCard title="好评如潮" subtitle="会员真实反馈">
          <div class="testimonials">
            <article v-for="item in testimonials" :key="item.user">
              <header>
                <strong>{{ item.user }}</strong>
                <span>{{ item.type }}</span>
              </header>
              <p>{{ item.content }}</p>
            </article>
          </div>
        </TechCard>

        <section class="course-detail__related">
          <div class="section-header">
            <div>
              <p class="section-eyebrow">NEXT STEP</p>
              <h2>相关推荐</h2>
            </div>
            <TechButton variant="text" @click="goCourseList">全部课程</TechButton>
          </div>
          <div v-loading="loading.related" class="course-detail__related-grid">
            <CourseCard
              v-for="item in relatedCourses"
              :key="item.id"
              :course="item"
              :intensity="getCourseIntensityLabel(item)"
              @view="goCourseDetail"
              @book="handleBook"
            />
            <el-empty v-if="!relatedCourses.length && !loading.related" description="暂无推荐" />
          </div>
        </section>
      </main>

      <aside class="course-detail__aside">
        <TechCard title="授课教练">
          <div v-if="coach" class="coach-card">
            <img :src="resolveAssetUrl(coach.zhaopian)" alt="教练" />
            <div>
              <p class="coach-card__name">{{ coach.jiaolianxingming }}</p>
              <p class="coach-card__role">资历 {{ coach.nianling || 6 }} 年 · 私教 {{ coach.sijiaojiage || 499 }} 元</p>
            </div>
          </div>
          <div class="coach-card__actions">
            <TechButton size="sm" variant="ghost" @click="goCoachDetail">教练详情</TechButton>
            <TechButton size="sm" @click="handleBook">预约私教</TechButton>
          </div>
        </TechCard>

        <TechCard title="课程亮点" :interactive="false">
          <ul class="highlights">
            <li v-for="highlight in highlights" :key="highlight">
              {{ highlight }}
            </li>
          </ul>
        </TechCard>

        <TechCard
          v-loading="smartRecommendations.loadingAuto"
          title="系统热推"
          subtitle="按热度实时推荐"
          :interactive="false"
        >
          <ul class="recommend-list">
            <li v-for="item in smartRecommendations.auto" :key="item.id">
              <div>
                <p>{{ item.kechengmingcheng }}</p>
                <small>{{ item.kechengleixing || '智能训练' }}</small>
              </div>
              <TechButton size="sm" variant="text" @click="goCourseDetail(item)">查看</TechButton>
            </li>
          </ul>
          <el-empty
            v-if="!smartRecommendations.auto.length && !smartRecommendations.loadingAuto"
            description="暂无数据"
          />
        </TechCard>

        <TechCard
          v-loading="smartRecommendations.loadingCollaborative"
          title="猜你想练"
          subtitle="基于收藏行为"
          :interactive="false"
        >
          <ul class="recommend-list">
            <li v-for="item in smartRecommendations.collaborative" :key="`smart-${item.id}`">
              <div>
                <p>{{ item.kechengmingcheng }}</p>
                <small>{{ formatCurrency(item.kechengjiage || 0) }}</small>
              </div>
              <TechButton size="sm" variant="text" @click="handleBook(item)">预约</TechButton>
            </li>
          </ul>
          <el-empty
            v-if="!smartRecommendations.collaborative.length && !smartRecommendations.loadingCollaborative"
            description="暂无数据"
          />
        </TechCard>
      </aside>
    </div>
  </div>

  <el-empty v-else-if="!loading.detail" description="未找到课程">
    <TechButton size="sm" variant="outline" @click="goCourseList">返回课程列表</TechButton>
  </el-empty>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { onMounted, reactive, ref, computed, nextTick, watch } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { TechButton, TechCard, Stepper } from '@/components/common'
import { CourseBenefitsChart, CourseCard } from '@/components/courses'
import { getModuleService } from '@/services/crud'
import type { Jianshenkecheng, Jianshenjiaolian } from '@/types/modules'
import { formatCurrency, formatDate } from '@/utils/formatters'

const courseService = getModuleService('jianshenkecheng')
const coachService = getModuleService('jianshenjiaolian')
const route = useRoute()
const router = useRouter()

const course = ref<Jianshenkecheng>()
const coach = ref<Jianshenjiaolian>()
const relatedCourses = ref<Jianshenkecheng[]>([])
const smartRecommendations = reactive({
  auto: [] as Jianshenkecheng[],
  collaborative: [] as Jianshenkecheng[],
  loadingAuto: false,
  loadingCollaborative: false,
})
const loading = reactive({
  detail: true,
  related: false,
  coach: false,
})
const selectedSlot = ref<{ day: string; time: string } | null>(null)
const scheduleCard = ref<ComponentPublicInstance | null>(null)

const testimonials = [
  {
    user: 'Sophie · 产品经理',
    type: '体态塑形会员',
    content: 'AI 姿态捕捉和教练即时纠错让我三周内改善了肩颈，搭配的康复拉伸非常到位。',
  },
  {
    user: 'Kevin · 创业者',
    type: '高级私教会员',
    content: '夜间 24h 场馆 + 预约排期提醒太贴心，训练效率比传统健身房提升 2 倍。',
  },
  {
    user: 'Marcus · 程序员',
    type: '燃脂训练会员',
    content: '高强度 HIIT 配合心率监控，燃脂和恢复节奏都可视化，终于养成了长期习惯。',
  },
]

const highlights = ['AI 负重监测 + 实时心率', '教练 1v1 动作纠正', '智能预约 · 冲突提醒', '课程完成度可视化']

const bookingSteps = [
  { label: '选择课程', description: '根据训练目标筛选' },
  { label: '预约时间', description: '查看余位 + 冲突检测' },
  { label: '确认信息', description: '填写备注与联系方式' },
]

const heroStats = computed(() => ({
  rating: (4.8 + ((course.value?.id ?? 0) % 10) * 0.02).toFixed(2),
  sessions: Math.max(6, ((course.value?.clicknum ?? 0) % 8) + 6),
  heat: (course.value?.clicknum ?? 0) + 280,
}))

const formattedPrice = computed(() => (course.value?.kechengjiage ? formatCurrency(course.value.kechengjiage) : '¥298'))

const formattedDate = computed(() =>
  course.value?.shangkeshijian ? formatDate(course.value.shangkeshijian) : '随到随练',
)

const persona = computed(() => {
  const type = course.value?.kechengleixing || ''
  if (type.includes('燃脂')) return '高效燃脂 · 提升心肺'
  if (type.includes('增肌')) return '想强化力量与线条的会员'
  if (type.includes('体态')) return '久坐白领 · 体态修复'
  return '所有希望升级训练体验的会员'
})

const equipment = computed(() => {
  const base = ['智能深蹲架', '自由力量区', '体态评估镜']
  if (course.value?.kechengleixing?.includes('HIIT')) {
    base.push('能量跑台', '心率臂带')
  }
  return base.join(' / ')
})

const benefitMetrics = computed(() => buildBenefitMetrics(course.value))
const schedule = computed(() => buildSchedule(course.value?.shangkeshijian))
const selectedStep = computed(() => (selectedSlot.value ? 2 : 1))

onMounted(() => {
  loadCourse()
})

watch(
  () => route.query.id,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      loadCourse()
    }
  },
)

async function loadCourse() {
  const id = route.query.id
  if (!id) {
    loading.detail = false
    router.push('/index/jianshenkecheng')
    return
  }

  loading.detail = true
  try {
    const detail = await courseService.detail(id as string)
    course.value = detail
    await Promise.all([
      loadCoach(detail.jiaoliangonghao),
      loadRelatedCourses(detail),
      loadAutoRecommendations(),
      loadCollaborativeRecommendations(),
    ])
  } catch (error) {
    console.error(error)
    ElMessage.error('无法加载课程详情')
  } finally {
    loading.detail = false
  }
}

async function loadCoach(gonghao?: string) {
  if (!gonghao) return
  loading.coach = true
  try {
    const { list } = await coachService.list({ jiaoliangonghao: gonghao, limit: 1 })
    coach.value = list[0]
  } catch (error) {
    console.error(error)
  } finally {
    loading.coach = false
  }
}

async function loadRelatedCourses(detail: Jianshenkecheng) {
  loading.related = true
  try {
    const { list } = await courseService.list({
      page: 1,
      limit: 3,
      sort: 'clicknum',
      order: 'desc',
      kechengleixing: detail.kechengleixing,
    })
    relatedCourses.value = (list ?? []).filter(item => item.id !== detail.id)
  } catch (error) {
    console.error(error)
  } finally {
    loading.related = false
  }
}

async function loadAutoRecommendations() {
  smartRecommendations.loadingAuto = true
  try {
    const list = await courseService.autoSort({ limit: 3 })
    smartRecommendations.auto = list.slice(0, 3)
  } catch (error) {
    console.error(error)
  } finally {
    smartRecommendations.loadingAuto = false
  }
}

async function loadCollaborativeRecommendations() {
  smartRecommendations.loadingCollaborative = true
  try {
    const list = await courseService.autoSortCollaborative({ limit: 3 })
    smartRecommendations.collaborative = list.slice(0, 3)
  } catch (error) {
    console.error(error)
  } finally {
    smartRecommendations.loadingCollaborative = false
  }
}

function buildBenefitMetrics(detail?: Jianshenkecheng) {
  const base = detail?.kechengleixing || ''
  const intensityBoost = base.includes('燃脂') ? 15 : base.includes('增肌') ? 10 : 0
  return [
    { label: '力量', value: clamp(70 + intensityBoost) },
    { label: '体能', value: clamp(65 + intensityBoost / 2) },
    { label: '柔韧', value: clamp(base.includes('塑形') ? 80 : 60) },
    { label: '体态', value: clamp(base.includes('体态') ? 85 : 62) },
  ]
}

function clamp(value: number) {
  return Math.max(40, Math.min(100, Math.round(value)))
}

function buildSchedule(dateString?: string) {
  const base = dateString ? new Date(dateString) : new Date()
  const formatter = new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric' })
  const weekdayFormatter = new Intl.DateTimeFormat('zh-CN', { weekday: 'short' })
  const slots = ['09:30', '14:00', '19:30']

  return Array.from({ length: 4 }).map((_, index) => {
    const day = new Date(base)
    day.setDate(base.getDate() + index)
    return {
      label: formatter.format(day),
      weekday: weekdayFormatter.format(day),
      slots: slots.map((time, slotIdx) => {
        const available = (index + slotIdx) % 3 !== 0
        return {
          time,
          status: available ? 'available' : 'tight',
          statusLabel: available ? '余位充足' : '名额紧张',
        }
      }),
    }
  })
}

function selectSlot(day: string, time: string) {
  selectedSlot.value = { day, time }
  ElMessage.success(`已选择 ${day} ${time} 时段`)
}

function isSelectedSlot(day: string, time: string) {
  return selectedSlot.value?.day === day && selectedSlot.value?.time === time
}

function handleBook(courseToBook?: Jianshenkecheng) {
  router.push({
    path: '/index/kechengyuyue',
    query: { courseId: courseToBook?.id ?? course.value?.id },
  })
}

function handleMessage() {
  ElMessage.info('客服已收到您的咨询，将尽快与您联系。')
}

function goCourseDetail(item: Jianshenkecheng) {
  router.push({ path: '/index/jianshenkechengDetail', query: { id: item.id } })
}

function goCourseList() {
  router.push('/index/jianshenkecheng')
}

function goCoachDetail() {
  if (!coach.value?.id) return
  router.push({ path: '/index/jianshenjiaolianDetail', query: { id: coach.value.id } })
}

function scrollToSchedule() {
  nextTick(() => {
    const el = scheduleCard.value?.$el as HTMLElement | undefined
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function resolveAssetUrl(path?: string) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  if (!path.trim()) return ''
  const base = import.meta.env.VITE_APP_BASE_API?.replace(/\/$/, '') || ''
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}

function getCourseIntensityLabel(item: Jianshenkecheng) {
  const type = item.kechengleixing || ''
  if (type.includes('燃脂')) return '燃脂'
  if (type.includes('增肌')) return '增肌'
  if (type.includes('体态')) return '体态'
  return '进阶'
}

const heroBackground = computed(() => {
  const image = resolveAssetUrl(course.value?.tupian)
  return image
    ? { backgroundImage: `linear-gradient(120deg, rgba(0,0,0,0.8), rgba(0,0,0,0.2)), url(${image})` }
    : undefined
})
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.course-hero {
  position: relative;
  border-radius: 32px;
  overflow: hidden;
  min-height: 420px;
  padding: 64px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  margin-bottom: 32px;

  &__video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.4;
  }

  &__content {
    position: relative;
    max-width: 720px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__subtitle {
    margin: 0;
    font-size: 1.1rem;
    color: $color-text-primary;
  }

  &__stats {
    display: flex;
    gap: 24px;

    div {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    span {
      text-transform: uppercase;
      letter-spacing: 0.3em;
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.8);
    }

    strong {
      font-size: 1.8rem;
    }
  }

  &__cta {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
}

.course-detail {
  padding: 40px 6vw 80px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.course-detail__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;
}

.course-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 18px;

  dl {
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  dt {
    color: $color-text-secondary;
    letter-spacing: 0.2em;
    font-size: 0.78rem;
  }
}

.course-info__description {
  margin-top: 16px;
  color: $color-text-secondary;
}

.schedule-grid {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.schedule-card {
  padding: 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);

  header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
  }
}

.schedule-card__slots {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.schedule-slot {
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: transparent;
  padding: 10px 14px;
  color: $color-text-primary;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: $transition-base;

  &--available {
    border-color: rgba(253, 216, 53, 0.35);
  }

  &--tight {
    border-color: rgba(255, 255, 255, 0.15);
    color: $color-text-secondary;
  }

  &--selected {
    border-color: $color-yellow;
    box-shadow: $shadow-glow;
  }

  small {
    font-size: 0.75rem;
  }
}

.schedule-actions {
  margin-top: 16px;
  display: flex;
  gap: 12px;
}

.testimonials {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;

  article {
    padding: 16px;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.02);
  }

  header {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 8px;
  }

  span {
    color: $color-text-secondary;
    font-size: 0.85rem;
  }
}

.course-detail__related {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.course-detail__related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.course-detail__aside {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.coach-card {
  display: flex;
  gap: 12px;
  align-items: center;

  img {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(253, 216, 53, 0.6);
  }

  &__name {
    margin: 0;
    font-size: 1.1rem;
  }

  &__role {
    margin: 2px 0 0;
    color: $color-text-secondary;
    font-size: 0.85rem;
  }

  &__actions {
    margin-top: 12px;
    display: flex;
    gap: 8px;
  }
}

.highlights {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;

  li::before {
    content: '✦';
    margin-right: 8px;
    color: $color-yellow;
  }
}

.recommend-list {
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
    padding: 6px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);

    &:last-child {
      border-bottom: none;
    }

    p {
      margin: 0;
      font-weight: 600;
    }

    small {
      color: var(--color-text-secondary);
    }
  }
}

@media (max-width: 1024px) {
  .course-detail__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .course-hero {
    padding: 32px;
    min-height: 360px;
  }

  .course-detail {
    padding: 32px 16px 60px;
  }

  .schedule-actions {
    flex-direction: column;
  }
}
</style>
