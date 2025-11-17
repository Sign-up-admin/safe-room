<template>
  <div class="private-booking">
    <section class="private-booking__hero">
      <p class="section-eyebrow">PRIVATE COACH BOOKING</p>
      <h1>一键预约明星私教 · 目标驱动 · 智能排期</h1>
      <p>选择私人教练，设定训练目标与套餐，系统自动匹配时段并计算价格。</p>
      <div class="progress-indicator">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${completionProgress}%` }" />
        </div>
        <span class="progress-text">{{ completionProgress }}% 完成</span>
      </div>
    </section>

    <Stepper :steps="steps" :current="currentStep - 1" />

    <section
      v-show="currentStep === 1"
      ref="(el) => (sectionRefs[0] = el as HTMLElement)"
      class="private-section page-enter"
    >
      <TechCard title="选择教练" subtitle="按擅长、价格、评分筛选">
        <CoachRecommend
          v-model:keyword="coachFilters.keyword"
          v-model:skill="coachFilters.skill"
          v-model:price="coachFilters.price"
          :coaches="coaches"
          :selected-coach="selectedCoach"
          :skill-options="skillOptions"
          :price-options="priceOptions"
          :loading="loading.coaches"
          @refresh="loadCoaches"
          @select="selectCoach"
          @view-all="goCoachList"
        >
          <template #actions>
            <TechButton size="sm" :disabled="!selectedCoach" @click="goToStep(2)">下一步</TechButton>
          </template>
        </CoachRecommend>
      </TechCard>
    </section>

    <section
      v-show="currentStep === 2"
      ref="(el) => (sectionRefs[1] = el as HTMLElement)"
      class="private-section page-enter"
    >
      <TechCard title="设定目标 & 套餐" subtitle="训练目标可多选">
        <GoalSelector
          v-model:selected-goals="selectedGoals"
          :goals="goalOptions"
          :package-options="packageOptions"
          :selected-package="selectedPackage"
          :price-calculator="pkg => priceBreakdown.finalPrice"
        >
          <template #actions>
            <div class="booking-actions">
              <TechButton size="sm" variant="ghost" @click="goToStep(1)">上一步</TechButton>
              <TechButton size="sm" :disabled="!selectedPackage" @click="goToStep(3)">下一步</TechButton>
            </div>
          </template>
        </GoalSelector>
      </TechCard>
    </section>

    <section
      v-show="currentStep === 3"
      ref="(el) => (sectionRefs[2] = el as HTMLElement)"
      class="private-section page-enter"
    >
      <TechCard title="安排私教时间" subtitle="智能排期 · 冲突提示">
        <SchedulePlanner
          :days="schedule"
          :selected-slot-key="selectedSlotKey"
          :loading="calendarLoading"
          :coach-name="selectedCoach?.jiaolianxingming"
          @select="handleSlotSelected"
        />

        <!-- 智能时间建议 -->
        <div v-if="!selectedSlot" class="time-suggestions">
          <h4>智能推荐时间</h4>
          <div class="suggestions-grid">
            <button
              v-for="(suggestion, index) in timeSuggestions"
              :key="suggestion.time"
              class="suggestion-item"
              :class="{ 'suggestion-item--best': index === 0 }"
              @click="selectSuggestedTime(suggestion)"
            >
              <div class="suggestion-time">
                <span>{{ suggestion.time }}</span>
                <small>{{ suggestion.period }}</small>
              </div>
              <div class="suggestion-reason">
                <span class="reason-badge">{{ suggestion.reason }}</span>
              </div>
            </button>
          </div>
        </div>

        <div class="booking-actions">
          <TechButton size="sm" variant="ghost" @click="goToStep(2)">上一步</TechButton>
          <TechButton size="sm" :disabled="!selectedSlot" @click="goToStep(4)">下一步</TechButton>
        </div>
      </TechCard>
    </section>

    <section
      v-show="currentStep === 4"
      ref="(el) => (sectionRefs[3] = el as HTMLElement)"
      class="private-section page-enter"
    >
      <TechCard title="确认预约 & 支付" subtitle="选择支付方式，提交预约">
        <div class="summary-grid">
          <article>
            <p>教练</p>
            <strong>{{ selectedCoach?.jiaolianxingming || '--' }}</strong>
          </article>
          <article>
            <p>目标</p>
            <strong>{{ goalSummary }}</strong>
          </article>
          <article>
            <p>套餐</p>
            <strong>{{ selectedPackage.label }}</strong>
          </article>
          <article>
            <p>预约时间</p>
            <strong>{{ summarySlot }}</strong>
          </article>
          <article>
            <p>预计金额</p>
            <div class="price-breakdown">
              <strong>{{ formatCurrency(priceBreakdown.finalPrice) }}</strong>
              <span v-if="priceBreakdown.savings > 0" class="savings">
                省 ¥{{ priceBreakdown.savings.toFixed(2) }}
              </span>
            </div>
          </article>
        </div>

        <!-- 价格明细 -->
        <div v-if="priceBreakdown.savings > 0" class="price-details">
          <h4>价格明细</h4>
          <div class="price-detail-row">
            <span>基础价格</span>
            <span>{{ formatCurrency(priceBreakdown.basePrice) }}</span>
          </div>
          <div v-if="priceBreakdown.packageDiscount > 0" class="price-detail-row discount">
            <span>套餐优惠</span>
            <span>-{{ formatCurrency(priceBreakdown.packageDiscount) }}</span>
          </div>
          <div v-if="priceBreakdown.membershipDiscount > 0" class="price-detail-row discount">
            <span>会员折扣</span>
            <span>-{{ formatCurrency(priceBreakdown.membershipDiscount) }}</span>
          </div>
          <div v-if="priceBreakdown.couponDiscount > 0" class="price-detail-row discount">
            <span>优惠券</span>
            <span>-{{ formatCurrency(priceBreakdown.couponDiscount) }}</span>
          </div>
          <div class="price-detail-row total">
            <span>应付金额</span>
            <span>{{ formatCurrency(priceBreakdown.finalPrice) }}</span>
          </div>
        </div>

        <div class="payment-options">
          <label
            v-for="method in paymentMethods"
            :key="method.value"
            class="payment-option"
            :class="[{ 'payment-option--active': paymentMethod === method.value }]"
          >
            <input v-model="paymentMethod" type="radio" :value="method.value" />
            <div>
              <p>{{ method.label }}</p>
              <span>{{ method.desc }}</span>
            </div>
          </label>
        </div>

        <BookingSummary
          ref="summaryRef"
          v-model:contact="contact"
          v-model:phone="phone"
          v-model:remark="remark"
          v-model:agreement="agreement"
          :course-name="selectedCoach?.jiaolianxingming"
          :slot-label="summarySlot"
          :amount="totalPrice"
        >
          <template #actions>
            <TechButton size="sm" variant="ghost" @click="goToStep(3)">上一步</TechButton>
            <TechButton size="sm" :loading="loading.submitting" @click="submitBooking">提交预约</TechButton>
          </template>
        </BookingSummary>
      </TechCard>
    </section>

    <transition name="booking-success-fade">
      <div v-if="successVisible" class="private-success-overlay">
        <TechCard
          class="private-success-card"
          eyebrow="预约成功"
          :title="successData.coach"
          :subtitle="successData.slot"
          variant="layered"
          :interactive="false"
        >
          <p>顾问会尽快与您确认，您也可先前往支付页完成付款。</p>
          <div class="private-success-card__actions">
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
import { BookingSummary, CoachRecommend, GoalSelector, SchedulePlanner } from '@/components/booking'
import { getModuleService } from '@/services/crud'
import type { Jianshenjiaolian, Sijiaoyuyue } from '@/types/modules'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { useBookingConflict } from '@/composables/useBookingConflict'
import { useBookingStore } from '@/stores/booking'
import { useCoachRecommend } from '@/composables/useCoachRecommend'
import { useStepTransition } from '@/composables/useStepTransition'
import { usePageTransition } from '@/composables/usePageTransition'
import { usePricingEngine } from '@/composables/usePricingEngine'

const steps = [
  {
    label: '选择教练',
    description: '匹配擅长领域',
    validation: () => !!selectedCoach.value,
    errorMessage: '请先选择一位教练',
  },
  {
    label: '设定目标',
    description: '选择训练套餐',
    validation: () => !!selectedPackage.value,
    errorMessage: '请选择训练套餐',
  },
  {
    label: '选择时间',
    description: '排期 & 冲突检测',
    validation: () => !!selectedSlot.value,
    errorMessage: '请选择预约时间',
  },
  {
    label: '确认支付',
    description: '提交预约',
    validation: () => {
      const valid = agreement.value && contact.value && phone.value
      return valid
    },
    errorMessage: '请完善预约信息并同意服务条款',
  },
]

const coachService = getModuleService('jianshenjiaolian')
const privateService = getModuleService('sijiaoyuyue')
const route = useRoute()
const router = useRouter()
const bookingStore = useBookingStore()
const { contact, phone, remark } = storeToRefs(bookingStore)

interface SelectedSlot {
  iso: string
  date: string
  label: string
  time: string
  period: string
}

interface PackageOption {
  label: string
  sessions: number
  duration: string
  desc: string
}

const bookingConflict = useBookingConflict()
const { context: pricingContext, priceBreakdown, updateContext } = usePricingEngine()

const goalOptions = ['增肌力量', '燃脂塑形', '体态修复', '功能康复', '心肺提升']
const skillOptions = ['增肌', '燃脂', '康复', '青少年', '体态']
const priceOptions = [400, 600, 800]

const packageOptions: PackageOption[] = [
  { label: '8 次燃脂计划', sessions: 8, duration: '45min', desc: '高强度 HIIT + 代谢调节' },
  { label: '12 次精英训练', sessions: 12, duration: '60min', desc: '力量周期 + 体态修复' },
  { label: '20 次全周期', sessions: 20, duration: '60min', desc: '完整增肌/塑形路径' },
]

const paymentMethods = [
  { label: '线下支付', value: 'offline', desc: '到店刷卡 / 微信' },
  { label: '在线支付', value: 'online', desc: '支持支付宝 / 微信' },
]

const currentStep = ref(1)
const coaches = ref<Jianshenjiaolian[]>([])
const selectedCoach = ref<Jianshenjiaolian>()
const selectedGoals = ref<string[]>(['增肌力量'])
const selectedPackage = ref<PackageOption>(packageOptions[1])
const selectedSlot = ref<SelectedSlot | null>(null)
const coachFilters = reactive({
  keyword: '',
  skill: '',
  price: 600,
})
const paymentMethod = ref('online')
const agreement = ref(false)
const successVisible = ref(false)
const successData = ref({ coach: '', slot: '' })
const loading = reactive({
  coaches: false,
  submitting: false,
})

const sectionRefs = ref<(HTMLElement | null)[]>([])
const summaryRef = ref<InstanceType<typeof BookingSummary>>()
const { transition: stepTransition } = useStepTransition()
const { enter: pageEnter } = usePageTransition()

// 更新定价上下文的监听器
watch([selectedCoach, selectedPackage, selectedGoals], () => {
  updateContext({
    coach: selectedCoach.value,
    package: selectedPackage.value,
    goals: selectedGoals.value,
  })
})

// 使用新的定价引擎
const totalPrice = computed(() => priceBreakdown.value.finalPrice)
const summarySlot = computed(() =>
  selectedSlot.value ? `${selectedSlot.value.label} ${selectedSlot.value.time}` : '未选择',
)
const goalSummary = computed(() => (selectedGoals.value.length ? selectedGoals.value.join(' / ') : '综合提升'))
const selectedSlotKey = computed(() =>
  selectedSlot.value ? `${selectedSlot.value.iso}-${selectedSlot.value.time}` : undefined,
)
const schedule = computed(() => buildSchedule())
const calendarLoading = computed(() => bookingConflict.loading.value)

// 时间建议
const timeSuggestions = computed(() => {
  if (!selectedCoach.value) return []
  // 获取今天的最佳时间建议
  const today = new Date().toISOString()
  return bookingConflict.getTimeSuggestions(today)
})

// 计算整体完成进度
const completionProgress = computed(() => {
  const steps = [
    !!selectedCoach.value, // 步骤1
    !!selectedPackage.value, // 步骤2
    !!selectedSlot.value, // 步骤3
    agreement.value && !!contact.value && !!phone.value, // 步骤4
  ]
  const completedSteps = steps.filter(Boolean).length
  return Math.round((completedSteps / steps.length) * 100)
})

onMounted(() => {
  loadCoaches()
  bookingConflict.refresh()
})

watch(
  () => route.query.coachId,
  () => hydrateCoachSelection(),
)

watch(coaches, () => hydrateCoachSelection())

function hydrateCoachSelection() {
  const coachId = route.query.coachId
  if (coachId && coaches.value.length) {
    const target = coaches.value.find(coach => String(coach.id) === String(coachId))
    if (target) {
      selectedCoach.value = target
      currentStep.value = 2
      return
    }
  }
  if (!selectedCoach.value && coaches.value.length) {
    selectedCoach.value = coaches.value[0]
  }
}

async function loadCoaches() {
  loading.coaches = true
  try {
    const params: Record<string, any> = {
      page: 1,
      limit: 50, // 获取更多数据用于推荐算法
      sort: 'addtime',
      order: 'desc',
    }
    if (coachFilters.keyword) params.keyword = coachFilters.keyword
    const { list } = await coachService.list(params)
    const allCoaches = list ?? []

    // 获取用户历史预约的教练ID（从私教预约记录中提取）
    const userAccount = localStorage.getItem('front_username') || ''
    let userHistory: number[] = []
    if (userAccount) {
      try {
        const privateService = getModuleService('sijiaoyuyue')
        const historyResp = await privateService.list({
          page: 1,
          limit: 100,
          yonghuzhanghao: userAccount,
        })
        userHistory = (historyResp.list ?? [])
          .map(item => {
            // 从教练工号或姓名匹配教练ID
            const matched = allCoaches.find(
              c => c.jiaoliangonghao === item.jiaoliangonghao || c.jiaolianxingming === item.jiaolianxingming,
            )
            return matched?.id
          })
          .filter((id): id is number => id !== undefined)
      } catch (error) {
        console.warn('Failed to load user booking history', error)
      }
    }

    // 使用增强的推荐算法
    const { coachesWithReasons } = useCoachRecommend(allCoaches, {
      keyword: coachFilters.keyword,
      skill: coachFilters.skill,
      price: coachFilters.price,
      userHistory,
      currentGoals: selectedGoals.value,
      userPreferences: {
        preferredGoals: goalOptions.slice(0, 2), // 假设前两个是用户偏好
        budgetRange: [300, 800], // 默认预算范围
      },
    })

    coaches.value = coachesWithReasons.value.slice(0, 8) // 只显示前8个
  } catch (error) {
    console.error(error)
    ElMessage.error('加载教练失败')
  } finally {
    loading.coaches = false
  }
}

function selectCoach(coach: Jianshenjiaolian) {
  selectedCoach.value = coach
  selectedSlot.value = null
  currentStep.value = 2
}

async function goToStep(step: number) {
  // 验证当前步骤是否完成（如果要前进到下一阶段）
  if (step > currentStep.value) {
    const currentStepConfig = steps[currentStep.value]
    if (currentStepConfig.validation && !currentStepConfig.validation()) {
      ElMessage.warning(currentStepConfig.errorMessage)
      return
    }
  }

  const oldStep = currentStep.value
  currentStep.value = step

  // 触发步骤切换动画
  await nextTick()
  const stepElements = sectionRefs.value.filter(Boolean) as HTMLElement[]
  if (stepElements.length > 0 && oldStep > 0 && step > 0) {
    const fromEl = stepElements[oldStep - 1]
    const toEl = stepElements[step - 1]
    if (fromEl && toEl) {
      await stepTransition(oldStep - 1, step - 1, [fromEl, toEl], toEl)
    }
  }

  // 页面进入动画
  if (sectionRefs.value[step - 1]) {
    pageEnter(sectionRefs.value[step - 1]!)
  }
}

function buildSchedule() {
  const base = selectedCoach.value?.addtime ? new Date(selectedCoach.value.addtime) : new Date()
  const slots = [
    { time: '08:00', period: '清晨' },
    { time: '10:00', period: '上午' },
    { time: '13:30', period: '下午' },
    { time: '16:30', period: '黄昏' },
    { time: '20:00', period: '夜训' },
  ]

  return Array.from({ length: 14 }).map((_, index) => {
    const day = new Date(base)
    day.setDate(base.getDate() + index)
    const iso = day.toISOString()
    const date = formatDate(day)
    return {
      label: `${day.getMonth() + 1}/${day.getDate()}`,
      weekday: new Intl.DateTimeFormat('zh-CN', { weekday: 'short' }).format(day),
      iso,
      date,
      slots: slots.map((slot, slotIdx) => {
        const restDay = (index + slotIdx + (selectedCoach.value?.id ?? 1)) % 7 === 0
        const conflict = bookingConflict.hasConflict(iso, slot.time)
        const remaining = bookingConflict.resolveRemaining(iso, slot.time, 6)
        const status = restDay ? 'disabled' : conflict ? 'conflict' : remaining <= 1 ? 'low' : 'available'
        return {
          time: slot.time,
          period: slot.period,
          status,
          statusLabel:
            status === 'disabled' ? '休息' : status === 'conflict' ? '冲突' : remaining <= 1 ? '名额紧张' : '可预约',
          remaining,
          conflictReasons: conflict ? bookingConflict.conflictDetails(iso, slot.time) : undefined,
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
    ElMessage.warning(conflictMsg || slot.conflictReasons?.join(' / ') || '该时间段存在冲突')
    return
  }
  if (slot.status === 'disabled') {
    ElMessage.warning('该时间段不可预约')
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

function selectSuggestedTime(suggestion: { time: string; period: string }) {
  // 找到今天对应的日期数据
  const today = schedule.value[0] // 假设第一个是今天
  if (!today) return

  // 查找对应的slot
  const slot = today.slots.find(s => s.time === suggestion.time)
  if (!slot) return

  if (slot.status === 'conflict') {
    ElMessage.warning('该推荐时间段存在冲突，请选择其他时间')
    return
  }

  // 自动选择这个时间段
  selectedSlot.value = {
    iso: today.iso,
    date: today.date,
    label: `${today.label} ${today.weekday}`,
    time: suggestion.time,
    period: suggestion.period,
  }

  ElMessage.success(`已选择推荐时间：${suggestion.time} ${suggestion.period}`)
}

async function submitBooking() {
  if (!selectedCoach.value || !selectedSlot.value) {
    ElMessage.warning('请完成前序步骤')
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
    const payload: Partial<Sijiaoyuyue> = {
      jiaoliangonghao: selectedCoach.value.jiaoliangonghao,
      jiaolianxingming: selectedCoach.value.jiaolianxingming,
      sijiaojiage: totalPrice.value,
      yuyueshijian: slotExpression,
      huiyuankahao: '',
      yonghuxingming: contact.value,
      shoujihaoma: phone.value,
      beizhu: `${goalSummary.value} · ${selectedPackage.value.label} · ${remark.value || ''}`,
      ispay: paymentMethod.value === 'online' ? '待支付' : '线下支付',
    }
    await privateService.create(payload)
    successData.value = {
      coach: selectedCoach.value.jiaolianxingming,
      slot: `${slotExpression} ｜ ${selectedSlot.value.period}`,
    }
    successVisible.value = true
    bookingConflict.refresh()
  } catch (error) {
    console.error(error)
    ElMessage.error('预约失败，请稍后重试')
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
  router.push({ path: '/index/pay', query: { tableName: 'sijiaoyuyue' } })
}

function goCoachList() {
  router.push('/index/jianshenjiaolian')
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.private-booking {
  padding: 40px 6vw 80px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.private-booking__hero {
  max-width: 740px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  h1 {
    margin: 0;
  }
}

.progress-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #fdd835, #f6c300);
  border-radius: 3px;
  transition: width 0.5s ease;
  box-shadow: 0 0 8px rgba(253, 216, 53, 0.4);
}

.progress-text {
  font-size: 0.85rem;
  color: $color-yellow;
  font-weight: 500;
  letter-spacing: 0.05em;
}

.private-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.booking-actions {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 16px;

  article {
    p {
      margin: 0;
      color: $color-text-secondary;
    }
  }
}

.price-breakdown {
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong {
    font-size: 1.1rem;
  }

  .savings {
    font-size: 0.85rem;
    color: #4ade80;
    font-weight: 500;
  }
}

.price-details {
  margin: 16px 0;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);

  h4 {
    margin: 0 0 12px;
    font-size: 0.9rem;
    color: $color-text-secondary;
    letter-spacing: 0.05em;
  }
}

.price-detail-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 0.9rem;

  &.discount {
    color: #4ade80;
  }

  &.total {
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 12px;
    margin-top: 8px;
    font-weight: 600;
    color: $color-yellow;
  }
}

.payment-options {
  margin: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.payment-option {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  gap: 12px;

  &--active {
    border-color: $color-yellow;
  }

  input {
    margin-top: 6px;
  }

  span {
    color: $color-text-secondary;
    font-size: 0.85rem;
  }
}

.private-success-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 10;
}

.private-success-card {
  max-width: 420px;
  text-align: center;

  p {
    margin: 12px 0 24px;
    color: $color-text-secondary;
  }
}

.private-success-card__actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.time-suggestions {
  margin: 20px 0;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);

  h4 {
    margin: 0 0 12px;
    font-size: 0.9rem;
    color: $color-text-secondary;
    letter-spacing: 0.05em;
  }
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
}

.suggestion-item {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.01);
  cursor: pointer;
  transition: $transition-base;
  display: flex;
  flex-direction: column;
  gap: 6px;

  &:hover {
    border-color: rgba(253, 216, 53, 0.4);
    transform: translateY(-2px);
  }

  &--best {
    border-color: rgba(253, 216, 53, 0.6);
    background: rgba(253, 216, 53, 0.05);
    position: relative;

    &::before {
      content: '★';
      position: absolute;
      top: -8px;
      right: -8px;
      background: $color-yellow;
      color: #000;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
    }
  }
}

.suggestion-time {
  text-align: center;

  span {
    font-size: 1.1rem;
    font-weight: 600;
    color: $color-yellow;
  }

  small {
    display: block;
    font-size: 0.75rem;
    color: $color-text-secondary;
    margin-top: 2px;
  }
}

.suggestion-reason {
  text-align: center;
}

.reason-badge {
  font-size: 0.75rem;
  color: $color-text-secondary;
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 8px;
  border-radius: 8px;
  letter-spacing: 0.02em;
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
  .private-booking {
    padding: 24px 16px 60px;
  }

  .private-booking__hero {
    max-width: 100%;
  }

  .private-section {
    gap: 12px;
  }

  .booking-actions {
    flex-direction: column;
    width: 100%;
  }

  .booking-actions .tech-button {
    width: 100%;
  }

  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .private-booking {
    padding: 20px 12px 60px;
  }

  .private-booking__hero h1 {
    font-size: 1.5rem;
  }

  .booking-actions {
    flex-direction: column;
    gap: 8px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .payment-options {
    gap: 8px;
  }
}
</style>
