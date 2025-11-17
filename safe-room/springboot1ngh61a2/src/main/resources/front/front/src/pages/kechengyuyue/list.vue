<template>
  <div class="booking-page">
    <section class="booking-hero">
      <p class="section-eyebrow">SMART BOOKING</p>
      <h1>课程预约 · 智能排期 · 冲突检测</h1>
      <p>三步完成预约：选择课程、锁定时间、确认信息，系统自动检测冲突并同步余位。</p>
    </section>

    <Stepper :steps="steps" :current="currentStep - 1" />

    <section v-show="currentStep === 1" class="booking-section">
      <TechCard title="选择课程" subtitle="根据训练目标筛选" :interactive="false">
        <CoursePicker
          v-model:keyword="courseFilters.keyword"
          v-model:type="courseFilters.type"
          :courses="courses"
          :course-types="courseTypes"
          :loading="loading.courses"
          :selected-course="selectedCourse"
          @refresh="loadCourses"
          @select="selectCourse"
          @view-all="goCourseList"
        >
          <template #actions>
            <TechButton size="sm" :disabled="!selectedCourse" @click="goToStep(2)">下一步</TechButton>
          </template>
        </CoursePicker>
      </TechCard>
    </section>

    <section v-show="currentStep === 2" class="booking-section">
      <TechCard title="选择日期 & 时间" subtitle="系统自动检测冲突">
        <div v-if="selectedCourse" class="course-schedule-info">
          <div class="course-info-header">
            <h4>{{ selectedCourse.kechengmingcheng }}</h4>
            <p>教练: {{ selectedCourse.jiaolianxingming || '暂无' }}</p>
            <p>上课地点: {{ selectedCourse.shangkedidian || '暂无' }}</p>
          </div>
          <div class="course-time-info">
            <span v-if="selectedCourse.shangkeshijian">
              课程时间: {{ formatDate(selectedCourse.shangkeshijian) }}
            </span>
            <span v-else>课程时间: 随到随练</span>
          </div>
          <div v-if="!selectedCourse.shangkeshijian" class="schedule-notice">
            <p>💡 此课程为灵活安排，您可以在下方选择合适的预约时间</p>
          </div>
        </div>
        <BookingCalendar
          :days="schedule"
          :selected-slot-key="selectedSlotKey"
          :loading="calendarLoading || loading.courses"
          @select="handleSlotSelected"
        />
        <p class="conflict-hint">{{ conflictHint }}</p>
        <div class="booking-actions">
          <TechButton size="sm" variant="ghost" @click="goToStep(1)">上一步</TechButton>
          <TechButton size="sm" :disabled="!selectedSlot" @click="goToStep(3)">下一步</TechButton>
        </div>
      </TechCard>
    </section>

    <section v-show="currentStep === 3" class="booking-section">
      <TechCard title="确认信息" subtitle="填写联系人与备注">
        <BookingSummary
          ref="summaryRef"
          :course-name="selectedCourse?.kechengmingcheng"
          :slot-label="summarySlot"
          :amount="selectedCourse?.kechengjiage"
          v-model:contact="contact"
          v-model:phone="phone"
          v-model:remark="remark"
          v-model:agreement="agreement"
        >
          <template #actions>
            <TechButton size="sm" variant="ghost" @click="goToStep(2)">上一步</TechButton>
            <TechButton size="sm" :loading="loading.submitting" @click="submitBooking">提交预约</TechButton>
          </template>
        </BookingSummary>
      </TechCard>
    </section>

    <transition name="booking-success-fade">
      <div v-if="successVisible" ref="successOverlayRef" class="booking-success-overlay">
        <canvas ref="particleCanvasRef" class="booking-success-particles" />
        <TechCard
          ref="successCardRef"
          class="booking-success-card"
          eyebrow="预约成功"
          :title="successData.course"
          :subtitle="successData.slot"
          variant="layered"
          :interactive="false"
        >
          <div ref="checkmarkRef" class="booking-success-checkmark" v-html="checkmarkSVG" />
          <p>系统已同步该预约，可前往个人中心查看详情或直接前往支付。</p>
          <div class="booking-success-card__actions">
            <TechButton size="sm" variant="ghost" @click="continueBooking">继续预约</TechButton>
            <TechButton size="sm" variant="outline" @click="goCenter">个人中心</TechButton>
            <TechButton size="sm" @click="goPay">前往支付</TechButton>
          </div>
        </TechCard>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { TechButton, TechCard, Stepper } from '@/components/common'
import { BookingCalendar, BookingSummary, CoursePicker } from '@/components/booking'
import { getModuleService } from '@/services/crud'
import type { Jianshenkecheng, Kechengyuyue } from '@/types/modules'
import { formatDate } from '@/utils/formatters'
import { useBookingConflict } from '@/composables/useBookingConflict'
import { useBookingStore } from '@/stores/booking'
import { useSuccessAnimation } from '@/composables/useSuccessAnimation'

interface SelectedSlot {
  iso: string
  date: string
  label: string
  time: string
  period: string
}

const steps = [
  { label: '选择课程', description: '匹配训练目标' },
  { label: '选择时间', description: '冲突检测' },
  { label: '确认预约', description: '填写信息' },
]

const SLOT_TEMPLATES = [
  { time: '07:00', period: '晨练' },
  { time: '09:30', period: '上午' },
  { time: '14:00', period: '下午' },
  { time: '19:00', period: '夜间' },
]
const DAY_WINDOW = 14
const COURSE_LIMIT = 8

const labelFormatter = new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric' })
const weekdayFormatter = new Intl.DateTimeFormat('zh-CN', { weekday: 'short' })

const courseService = getModuleService('jianshenkecheng')
const bookingService = getModuleService('kechengyuyue')
const typeService = getModuleService('kechengleixing')

const route = useRoute()
const router = useRouter()

const bookingStore = useBookingStore()
const { contact, phone, remark, slot: slotDraft } = storeToRefs(bookingStore)

const currentStep = ref(1)
const courses = ref<Jianshenkecheng[]>([])
const courseTypes = ref<string[]>([])
const selectedCourse = ref<Jianshenkecheng>()
const agreement = ref(false)
const successVisible = ref(false)
const successData = ref({ course: '', slot: '' })
const successOverlayRef = ref<HTMLElement>()
const successCardRef = ref<HTMLElement>()
const particleCanvasRef = ref<HTMLCanvasElement>()
const checkmarkRef = ref<HTMLElement>()
const summaryRef = ref<InstanceType<typeof BookingSummary>>()

const { play: playSuccessAnimation, createCheckmarkSVG } = useSuccessAnimation()
const checkmarkSVG = createCheckmarkSVG(80)

const courseFilters = reactive({
  keyword: '',
  type: '',
})

const loading = reactive({
  courses: false,
  submitting: false,
})

const selectedSlot = computed<SelectedSlot | null>({
  get: () => (slotDraft.value?.iso ? (slotDraft.value as SelectedSlot) : null),
  set: (value) => bookingStore.setSlot(value ?? undefined),
})

const selectedSlotKey = computed(() =>
  selectedSlot.value ? `${selectedSlot.value.iso}-${selectedSlot.value.time}` : undefined,
)

const bookingConflict = useBookingConflict()
const calendarLoading = computed(() => bookingConflict.loading.value)

const schedule = computed(() => buildSchedule(selectedCourse.value))
const summarySlot = computed(() =>
  selectedSlot.value ? `${selectedSlot.value.label} ${selectedSlot.value.time}` : '未选择',
)

const conflictHint = computed(() => {
  if (selectedSlot.value) {
    return `已锁定 ${selectedSlot.value.label} ${selectedSlot.value.time} · 可在个人中心查看`
  }
  if (bookingConflict.loading.value) {
    return '正在同步预约记录...'
  }
  return '选择时段后系统自动检测冲突，避免重复预约。'
})

onMounted(() => {
  loadCourseTypes()
  loadCourses()
  bookingConflict.refresh()
})

watch(
  () => bookingStore.selectedCourseId,
  (id) => {
    if (!id) return
    const target = courses.value.find((item) => item.id === id)
    if (target) {
      selectedCourse.value = target
    }
  },
)

watch(
  [() => route.query.courseId, () => route.query.focus, courses],
  () => hydrateSelection(),
  { immediate: true },
)

function hydrateSelection() {
  if (!courses.value.length) return
  const { courseId, focus } = route.query
  let target = selectedCourse.value
  if (courseId) {
    target = courses.value.find((item) => String(item.id) === String(courseId))
  } else if (focus) {
    target = courses.value.find((item) => item.kechengmingcheng?.includes(String(focus)))
  } else if (bookingStore.selectedCourseId) {
    target = courses.value.find((item) => item.id === bookingStore.selectedCourseId)
  }
  if (!target && courses.value.length) {
    target = courses.value[0]
  }
  if (target) {
    selectedCourse.value = target
    bookingStore.setCourse(target.id)
  }
}

async function loadCourseTypes() {
  try {
    const { list } = await typeService.list({ page: 1, limit: 50 })
    courseTypes.value = list.map((item) => item.kechengleixing).filter(Boolean) as string[]
  } catch (error) {
    console.error(error)
  }
}

async function loadCourses() {
  loading.courses = true
  try {
    const params: Record<string, any> = {
      page: 1,
      limit: COURSE_LIMIT,
      sort: 'clicknum',
      order: 'desc',
    }
    if (courseFilters.keyword) params.keyword = courseFilters.keyword
    if (courseFilters.type) params.kechengleixing = courseFilters.type
    const { list } = await courseService.list(params)
    courses.value = list ?? []
    hydrateSelection()
  } catch (error) {
    console.error(error)
    ElMessage.error('加载课程失败')
  } finally {
    loading.courses = false
  }
}

function selectCourse(course: Jianshenkecheng) {
  selectedCourse.value = course
  bookingStore.setCourse(course.id)
  selectedSlot.value = null
  currentStep.value = 2
}

function goToStep(step: number) {
  if (step === 2 && !selectedCourse.value) {
    ElMessage.warning('请先选择课程')
    return
  }
  if (step === 3 && !selectedSlot.value) {
    ElMessage.warning('请选择预约时间')
    return
  }
  currentStep.value = step
}

function buildSchedule(course?: Jianshenkecheng) {
  const base = course?.shangkeshijian ? new Date(course.shangkeshijian) : new Date()

  // 如果课程有具体的上课时间，提取时间信息
  let courseTimeSlots = SLOT_TEMPLATES
  if (course?.shangkeshijian) {
    const courseDate = new Date(course.shangkeshijian)
    const timeString = courseDate.toTimeString().slice(0, 5) // 提取 HH:MM 格式
    const hour = courseDate.getHours()

    // 根据时间确定时段
    let period = '上午'
    if (hour >= 18) period = '夜间'
    else if (hour >= 14) period = '下午'
    else if (hour >= 12) period = '中午'
    else if (hour >= 6) period = '上午'
    else period = '凌晨'

    // 使用课程的实际时间替换默认时段
    courseTimeSlots = [{
      time: timeString,
      period
    }]
  }

  return Array.from({ length: DAY_WINDOW }).map((_, index) => {
    const day = new Date(base)
    day.setDate(base.getDate() + index)
    const iso = day.toISOString()
    const date = formatDate(day)

    return {
      label: labelFormatter.format(day),
      weekday: weekdayFormatter.format(day),
      iso,
      date,
      slots: courseTimeSlots.map((template) => {
        const remaining = bookingConflict.resolveRemaining(iso, template.time)
        const conflict = bookingConflict.hasConflict(iso, template.time)
        const status = conflict ? 'conflict' : remaining <= 0 ? 'disabled' : remaining <= 3 ? 'low' : 'available'
        return {
          time: template.time,
          period: template.period,
          status,
          statusLabel: conflict ? '冲突' : remaining <= 0 ? '满员' : remaining <= 3 ? '名额紧张' : '可预约',
          remaining,
          conflictReasons: conflict ? bookingConflict.conflictDetails(iso, template.time) : undefined,
        }
      }),
    }
  })
}

function handleSlotSelected(payload: {
  day: { iso: string; label: string; date: string; weekday: string }
  slot: { time: string; period: string; status: string; conflictReasons?: string[] }
}) {
  const { day, slot } = payload
  if (slot.status === 'conflict') {
    const conflictMsg = bookingConflict.getConflictMessage(day.iso, slot.time)
    ElMessage.warning(conflictMsg || slot.conflictReasons?.join(' / ') || '该时间段与现有预约冲突')
    return
  }
  if (slot.status === 'disabled') {
    ElMessage.warning('该时间段已满员')
    return
  }
  selectedSlot.value = {
    iso: day.iso,
    date: day.date,
    label: `${day.label} ${day.weekday}`,
    time: slot.time,
    period: slot.period,
  }
}

async function submitBooking() {
  if (!selectedCourse.value || !selectedSlot.value) {
    ElMessage.warning('请完善课程与时段选择')
    return
  }

  // 表单验证
  try {
    await summaryRef.value?.validate()
  } catch (error) {
    ElMessage.warning('请完善表单信息')
    return
  }

  loading.submitting = true
  try {
    const slotExpression = `${selectedSlot.value.date} ${selectedSlot.value.time}`
    const payload: Partial<Kechengyuyue> = {
      kechengmingcheng: selectedCourse.value.kechengmingcheng,
      kechengleixing: selectedCourse.value.kechengleixing,
      jiaoliangonghao: selectedCourse.value.jiaoliangonghao,
      jiaolianxingming: selectedCourse.value.jiaolianxingming,
      kechengjiage: selectedCourse.value.kechengjiage,
      shangkeshijian: slotExpression,
      yuyueshijian: slotExpression,
      yonghuxingming: contact.value,
      shoujihaoma: phone.value,
      beizhu: remark.value,
    }

    await bookingService.create(payload)
    successData.value = {
      course: selectedCourse.value.kechengmingcheng,
      slot: `${slotExpression} ｜ ${selectedSlot.value.period}`,
    }
    successVisible.value = true
    bookingConflict.refresh()

    // 播放成功动画
    await nextTick()
    if (successOverlayRef.value && successCardRef.value) {
      playSuccessAnimation(
        successOverlayRef.value,
        checkmarkRef.value || undefined,
        particleCanvasRef.value || undefined,
      )
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('预约提交失败，请稍后重试')
  } finally {
    loading.submitting = false
  }
}

function continueBooking() {
  successVisible.value = false
  agreement.value = false
  selectedSlot.value = null
  currentStep.value = 1
}

function goCenter() {
  successVisible.value = false
  router.push('/index/center')
}

function goPay() {
  successVisible.value = false
  router.push({ path: '/index/pay', query: { tableName: 'kechengyuyue' } })
}

function goCourseList() {
  router.push('/index/jianshenkecheng')
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.booking-page {
  padding: 40px 6vw 80px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
}

.booking-hero {
  max-width: 720px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  h1 {
    margin: 0;
  }
}

.booking-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.booking-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
}

.course-schedule-info {
  margin-bottom: 20px;
  padding: 16px;
  border-radius: 12px;
  background: rgba(253, 216, 53, 0.05);
  border: 1px solid rgba(253, 216, 53, 0.2);
}

.course-info-header {
  margin-bottom: 12px;

  h4 {
    margin: 0 0 8px;
    font-size: 1.1rem;
    font-weight: 600;
    color: $color-yellow;
  }

  p {
    margin: 4px 0;
    font-size: 0.9rem;
    color: $color-text-secondary;
  }
}

.course-time-info {
  padding-top: 12px;
  border-top: 1px solid rgba(253, 216, 53, 0.2);

  span {
    font-size: 0.95rem;
    font-weight: 500;
    color: $color-text-primary;
  }
}

.schedule-notice {
  margin-top: 12px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(33, 150, 243, 0.1);
  border: 1px solid rgba(33, 150, 243, 0.3);

  p {
    margin: 0;
    font-size: 0.9rem;
    color: #2196f3;
    font-weight: 500;
  }
}

.conflict-hint {
  margin-top: 12px;
  color: $color-text-secondary;
}

.booking-success-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 10;
  overflow: hidden;
}

.booking-success-particles {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0;
}

.booking-success-checkmark {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 16px 0;
  width: 80px;
  height: 80px;
  margin-left: auto;
  margin-right: auto;

  :deep(svg) {
    width: 100%;
    height: 100%;
  }
}

.booking-success-card {
  max-width: 420px;
  text-align: center;

  p {
    margin: 12px 0 24px;
    color: $color-text-secondary;
  }
}

.booking-success-card__actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.booking-success-fade-enter-active,
.booking-success-fade-leave-active {
  transition: opacity 0.3s ease;
}

.booking-success-fade-enter-from,
.booking-success-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .booking-page {
    padding: 24px 16px 60px;
  }

  .booking-hero {
    max-width: 100%;
  }

  .booking-section {
    gap: 12px;
  }

  .booking-actions {
    flex-direction: column;
    width: 100%;
  }

  .booking-actions .tech-button {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .booking-page {
    padding: 20px 12px 60px;
  }

  .booking-hero h1 {
    font-size: 1.5rem;
  }

  .booking-actions {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
