<template>
  <div v-if="coach" class="coach-detail">
    <section class="coach-hero">
      <div class="coach-hero__media">
        <img :src="resolveAssetUrl(coach.zhaopian)" :alt="coach.jiaolianxingming" />
      </div>
      <div class="coach-hero__content">
        <p class="section-eyebrow">STAR COACH</p>
        <h1>{{ coach.jiaolianxingming }}</h1>
        <p class="coach-hero__role">{{ coachProfile.role }}</p>
        <div class="coach-hero__stats">
          <div>
            <span>评分</span>
            <strong>{{ coachProfile.rating }}</strong>
          </div>
          <div>
            <span>资历</span>
            <strong>{{ coachProfile.years }} 年</strong>
          </div>
          <div>
            <span>私教价</span>
            <strong>¥{{ coachProfile.price }}</strong>
          </div>
          <div>
            <span>年度私教</span>
            <strong>{{ coachProfile.clients }}+</strong>
          </div>
        </div>
        <p class="coach-hero__bio">
          {{ coach.gerenjianjie || '国家认证体能与体态双证导师，擅长力量周期化训练与智能康复。' }}
        </p>
        <div class="coach-hero__cta">
          <TechButton size="lg" @click="handleBook">预约私教</TechButton>
          <TechButton size="lg" variant="outline" @click="goCourseBooking">查看课程</TechButton>
        </div>
      </div>
    </section>

    <div class="coach-detail__grid">
      <main class="coach-detail__main">
        <TechCard title="资格认证" subtitle="权威证书 · 赛事荣誉" :interactive="false">
          <ul class="coach-certificates">
            <li v-for="cert in certificates" :key="cert.title">
              <p>{{ cert.title }}</p>
              <span>{{ cert.subtitle }}</span>
            </li>
          </ul>
        </TechCard>

        <TechCard title="技能谱系" subtitle="擅长领域 / 训练理念">
          <CourseBenefitsChart :metrics="skillMetrics" />
          <div class="coach-skills">
            <span v-for="skill in coachProfile.skills" :key="skill">{{ skill }}</span>
          </div>
          <p class="coach-philosophy">
            {{ coachProfile.philosophy }}
          </p>
        </TechCard>

        <TechCard v-loading="loading.courses" title="授课课程" subtitle="当前负责课程">
          <div class="coach-courses">
            <article v-for="course in courses" :key="course.id">
              <div>
                <p class="coach-courses__title">{{ course.kechengmingcheng }}</p>
                <span>{{ course.kechengleixing || '特色课程' }}</span>
              </div>
              <div class="coach-courses__meta">
                <span>{{ formatDate(course.shangkeshijian) }}</span>
                <span>{{ formatCurrency(course.kechengjiage || 0) }}</span>
              </div>
              <TechButton size="sm" variant="text" @click="goCourseDetail(course.id)">查看</TechButton>
            </article>
          </div>
        </TechCard>

        <TechCard title="预约排期" subtitle="同步日程 · 选择时段">
          <Stepper :steps="bookingSteps" :current="selectedStep" />
          <div class="coach-schedule">
            <div v-for="day in schedule" :key="day.label" class="coach-schedule__day">
              <header>
                <p>{{ day.label }}</p>
                <span>{{ day.weekday }}</span>
              </header>
              <div class="coach-schedule__slots">
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
                  {{ slot.time }}
                </button>
              </div>
            </div>
          </div>
          <div class="coach-schedule__actions">
            <TechButton size="sm" @click="handleBook">锁定时段</TechButton>
            <TechButton size="sm" variant="ghost" @click="handleMessage">联系顾问</TechButton>
          </div>
        </TechCard>

        <TechCard title="Before / After" subtitle="会员蜕变">
          <div class="before-after">
            <div v-for="item in beforeAfter" :key="item.name" class="before-after__card">
              <p class="before-after__name">{{ item.name }}</p>
              <p class="before-after__goal">{{ item.goal }}</p>
              <p class="before-after__result">{{ item.result }}</p>
            </div>
          </div>
        </TechCard>
      </main>

      <aside class="coach-detail__aside">
        <TechCard title="FAQ" :interactive="false">
          <ul class="coach-faq">
            <li v-for="faq in faqs" :key="faq.q">
              <p>{{ faq.q }}</p>
              <span>{{ faq.a }}</span>
            </li>
          </ul>
        </TechCard>

        <TechCard title="CTA" subtitle="立即加入">
          <p>加入会员享优先预约与价格优惠，解锁 AI 训练数据档案。</p>
          <TechButton block size="sm" @click="goMembership">加入会员</TechButton>
        </TechCard>
      </aside>
    </div>
  </div>

  <el-empty v-else-if="!loading.detail" description="未找到教练">
    <TechButton size="sm" variant="outline" @click="goCoachList">返回列表</TechButton>
  </el-empty>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { TechButton, TechCard, Stepper } from '@/components/common'
import { CourseBenefitsChart } from '@/components/courses'
import { getModuleService } from '@/services/crud'
import type { Jianshenjiaolian, Jianshenkecheng } from '@/types/modules'
import { formatCurrency, formatDate } from '@/utils/formatters'

const coachService = getModuleService('jianshenjiaolian')
const courseService = getModuleService('jianshenkecheng')
const route = useRoute()
const router = useRouter()

const coach = ref<Jianshenjiaolian>()
const courses = ref<Jianshenkecheng[]>([])
const selectedSlot = ref<{ day: string; time: string } | null>(null)

const loading = reactive({
  detail: true,
  courses: false,
})

const bookingSteps = [
  { label: '选定教练', description: '匹配擅长领域' },
  { label: '锁定时段', description: '同步余位' },
  { label: '确认信息', description: '提交预约' },
]

const certificates = [
  { title: 'NSCA-CPT', subtitle: '美国体能协会认证私教' },
  { title: 'ETS 体态矫正', subtitle: '中级教练认证' },
  { title: '运动康复导师', subtitle: '国家二级按摩理疗师' },
]

const beforeAfter = [
  { name: 'Ivy', goal: '体态塑形', result: '12 周体脂下降 6%，体态曲线明显' },
  { name: 'Eric', goal: '康复强化', result: '肩部灵活度恢复，力量提升 35%' },
]

const faqs = [
  { q: '取消/改期规则', a: '提前 4 小时可免费改期一次，迟到超过 15 分钟视为当次消耗。' },
  { q: '是否支持到店体验', a: '首次预约可申请 30min 免费体验，由顾问协助安排。' },
]

const coachProfile = computed(() => ({
  role: coach.value?.xingbie === '女' ? '体态塑形 · 认证导师' : '力量体能 · 认证导师',
  rating: (4.8 + ((coach.value?.id ?? 0) % 4) * 0.04).toFixed(2),
  years: Number(coach.value?.nianling) || 6,
  price: coach.value?.sijiaojiage || 499,
  clients: 220 + ((coach.value?.id ?? 0) % 6) * 40,
  skills: deriveSkills(coach.value),
  philosophy: coach.value?.gerenjianjie?.slice(0, 120) || '倡导“科学训练 + 数据反馈 + 生活习惯重塑”的闭环式训练路径。',
}))

const skillMetrics = computed(() => buildSkillMetrics(coachProfile.value.skills))
const schedule = computed(() => buildSchedule())
const selectedStep = computed(() => (selectedSlot.value ? 2 : 1))

watch(
  () => route.query.id,
  (newId, oldId) => {
    if (newId && newId !== oldId) {
      loadCoach()
    }
  },
)

onMounted(() => {
  loadCoach()
})

async function loadCoach() {
  const id = route.query.id
  if (!id) {
    loading.detail = false
    router.push('/index/jianshenjiaolian')
    return
  }
  loading.detail = true
  try {
    const detail = await coachService.detail(id as string)
    coach.value = detail
    await loadCourses(detail.jiaoliangonghao)
  } catch (error) {
    console.error(error)
    ElMessage.error('无法加载教练详情')
  } finally {
    loading.detail = false
  }
}

async function loadCourses(gonghao?: string) {
  if (!gonghao) return
  loading.courses = true
  try {
    const { list } = await courseService.list({
      page: 1,
      limit: 4,
      jiaoliangonghao: gonghao,
      sort: 'clicknum',
      order: 'desc',
    })
    courses.value = list ?? []
  } catch (error) {
    console.error(error)
  } finally {
    loading.courses = false
  }
}

function buildSkillMetrics(skills: string[]) {
  const base = {
    力量: 75,
    体能: 70,
    康复: skills.includes('功能康复') ? 80 : 60,
    青少年: skills.includes('青少年体适能') ? 78 : 55,
    体态: skills.includes('体态塑形') ? 85 : 65,
  }
  return Object.entries(base).map(([label, value]) => ({ label, value }))
}

function deriveSkills(detail?: Jianshenjiaolian) {
  const text = `${detail?.gerenjianjie ?? ''}`
  const skills: string[] = []
  if (/增肌|力量/.test(text)) skills.push('增肌力量')
  if (/燃脂|心肺|HIIT/.test(text)) skills.push('燃脂 HIIT')
  if (/康复|修复/.test(text)) skills.push('功能康复')
  if (/青少年/.test(text)) skills.push('青少年体适能')
  if (/体态|塑形/.test(text)) skills.push('体态塑形')
  return skills.length ? skills : ['综合训练']
}

function buildSchedule() {
  const base = new Date()
  const formatter = new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric' })
  const weekdayFormatter = new Intl.DateTimeFormat('zh-CN', { weekday: 'short' })
  const slots = ['08:00', '11:00', '15:00', '19:30']

  return Array.from({ length: 4 }).map((_, index) => {
    const day = new Date(base)
    day.setDate(base.getDate() + index)
    return {
      label: formatter.format(day),
      weekday: weekdayFormatter.format(day),
      slots: slots.map((time, slotIdx) => ({
        time,
        status: (index + slotIdx) % 3 ? 'available' : 'tight',
      })),
    }
  })
}

function selectSlot(day: string, time: string) {
  selectedSlot.value = { day, time }
  ElMessage.success(`已选择 ${day} ${time}`)
}

function isSelectedSlot(day: string, time: string) {
  return selectedSlot.value?.day === day && selectedSlot.value?.time === time
}

function handleBook() {
  router.push({
    path: '/index/sijiaoyuyue',
    query: { coachId: coach.value?.id, coachName: coach.value?.jiaolianxingming },
  })
}

function handleMessage() {
  ElMessage.info('已为您记录需求，客服将尽快与您联系。')
}

function goCourseDetail(id?: number) {
  if (!id) return
  router.push({ path: '/index/jianshenkechengDetail', query: { id } })
}

function goCourseBooking() {
  router.push('/index/kechengyuyue')
}

function goCoachList() {
  router.push('/index/jianshenjiaolian')
}

function goMembership() {
  router.push('/index/huiyuanka')
}

function resolveAssetUrl(path?: string) {
  if (!path) return new URL('@/assets/touxiang.png', import.meta.url).href
  if (/^https?:\/\//i.test(path)) return path
  const base = import.meta.env.VITE_APP_BASE_API?.replace(/\/$/, '') || ''
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.coach-detail {
  padding: 40px 6vw 80px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.coach-hero {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 32px;
  padding: 32px;
  border-radius: 32px;
  background: radial-gradient(circle at 10% 20%, rgba(253, 216, 53, 0.18), rgba(10, 10, 10, 0.9));
}

.coach-hero__media {
  border-radius: 24px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.coach-hero__content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.coach-hero__role {
  margin: 0;
  color: $color-text-secondary;
}

.coach-hero__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;

  span {
    letter-spacing: 0.2em;
    font-size: 0.75rem;
    color: $color-text-secondary;
  }
}

.coach-hero__bio {
  margin: 0;
  color: $color-text-secondary;
}

.coach-hero__cta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.coach-detail__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 24px;
}

.coach-certificates {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;

  li {
    padding: 12px;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.02);
  }

  span {
    color: $color-text-secondary;
    font-size: 0.85rem;
  }
}

.coach-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;

  span {
    @include pill;
    background: rgba(255, 255, 255, 0.04);
  }
}

.coach-courses {
  display: flex;
  flex-direction: column;
  gap: 12px;

  article {
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    padding-bottom: 8px;
  }

  &:last-child article {
    border-bottom: none;
  }
}

.coach-philosophy {
  margin-top: 12px;
  color: $color-text-secondary;
}

.coach-courses__title {
  margin: 0;
  font-weight: 600;
}

.coach-courses__meta {
  margin-left: auto;
  display: flex;
  flex-direction: column;
  color: $color-text-secondary;
  font-size: 0.85rem;
}

.coach-schedule {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.coach-schedule__day {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 14px;
}

.coach-schedule__slots {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.schedule-slot {
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: transparent;
  padding: 6px 14px;
  cursor: pointer;
  transition: $transition-base;

  &--available {
    border-color: rgba(253, 216, 53, 0.4);
  }

  &--tight {
    border-color: rgba(255, 255, 255, 0.2);
    color: $color-text-secondary;
  }

  &--selected {
    border-color: $color-yellow;
    box-shadow: $shadow-glow;
  }
}

.coach-schedule__actions {
  margin-top: 18px;
  display: flex;
  gap: 12px;
}

.before-after {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.before-after__card {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 12px;
}

.before-after__name {
  margin: 0;
  font-weight: 600;
}

.before-after__goal {
  margin: 4px 0 0;
  color: $color-text-secondary;
}

.before-after__result {
  margin: 6px 0 0;
}

.coach-faq {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;

  span {
    color: $color-text-secondary;
    font-size: 0.85rem;
  }
}

.coach-detail__aside {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

@media (max-width: 1024px) {
  .coach-detail__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .coach-hero {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .coach-detail {
    padding: 32px 16px 60px;
  }

  .coach-schedule__actions {
    flex-direction: column;
  }
}
</style>
