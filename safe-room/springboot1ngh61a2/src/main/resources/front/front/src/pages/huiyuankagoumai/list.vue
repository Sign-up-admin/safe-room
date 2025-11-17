<template>
  <div class="purchase-page" v-loading="loading.cards">
    <section class="purchase-hero">
      <div>
        <p class="section-eyebrow">MEMBERSHIP PURCHASE</p>
        <h1>三步完成购卡 · 立即解锁尊享权益</h1>
        <p>选择卡种 → 填写购卡信息 → 确认支付，支持优惠码与多种支付渠道。</p>
      </div>
      <PaymentStepper :steps="steps" :current="currentStep" />
    </section>

    <section v-show="currentStep === 1" class="purchase-section">
      <TechCard title="选择会员卡" subtitle="根据训练目标挑选合适卡种">
        <div class="card-selection-grid">
          <MembershipCard
            v-for="(card, index) in cards"
            :key="card.id"
            :card="card"
            :active="index === selectedIndex"
            :featured="index === 0"
            :show-hover-info="false"
            @select="onCardSelect"
          />
        </div>
        <div class="section-actions">
          <TechButton size="sm" :disabled="!selectedCard" @click="goToStep(2)">下一步</TechButton>
        </div>
      </TechCard>
    </section>

    <section v-show="currentStep === 2" class="purchase-section">
      <TechCard title="填写购卡信息" subtitle="我们将同步到个人中心">
        <el-form :model="form" :rules="rules" ref="formRef" label-position="top" class="purchase-form">
          <div class="form-grid">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" placeholder="请输入姓名" />
            </el-form-item>
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item label="优惠码">
              <el-input v-model="form.coupon" placeholder="如 VIP95" />
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="可填写特殊需求" />
            </el-form-item>
          </div>
        </el-form>
        <div class="section-actions">
          <TechButton size="sm" variant="ghost" @click="goToStep(1)">上一步</TechButton>
          <TechButton size="sm" :disabled="!canProceedInfo" @click="goToStep(3)">下一步</TechButton>
        </div>
      </TechCard>
    </section>

    <section v-show="currentStep === 3" class="purchase-section">
      <div class="summary-grid">
        <TechCard title="订单概览" :subtitle="selectedCard?.huiyuankamingcheng">
          <ul class="summary-list">
            <li>
              <span>卡种</span>
              <strong>{{ selectedCard?.huiyuankamingcheng }}</strong>
            </li>
            <li>
              <span>有效期</span>
              <strong>{{ selectedCard?.youxiaoqi || '12 个月' }}</strong>
            </li>
            <li>
              <span>原价</span>
              <strong>{{ formatCurrency(selectedCard?.jiage || 0) }}</strong>
            </li>
            <li>
              <span>优惠</span>
              <strong>-{{ formatCurrency(discountAmount) }}</strong>
            </li>
            <li>
              <span>应付金额</span>
              <strong class="price-final">{{ formatCurrency(finalPrice) }}</strong>
            </li>
          </ul>
        </TechCard>

        <!-- 协议与安全提示 -->
        <TechCard title="协议确认" subtitle="请阅读并同意相关条款" variant="minimal">
          <div class="agreement-section">
            <div class="security-notice">
              <div class="security-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L3 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-9-5z" stroke="currentColor" stroke-width="2"/>
                  <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div>
                <h5>安全保障</h5>
                <p>您的个人信息和支付数据将通过加密传输，严格保护您的隐私安全。</p>
              </div>
            </div>

            <div class="agreements">
              <el-checkbox v-model="agreements.privacy" class="agreement-checkbox">
                <span>我已阅读并同意</span>
                <a href="#" @click.prevent class="agreement-link">《隐私政策》</a>
              </el-checkbox>

              <el-checkbox v-model="agreements.membership" class="agreement-checkbox">
                <span>我已阅读并同意</span>
                <a href="#" @click.prevent class="agreement-link">《会员服务协议》</a>
              </el-checkbox>

              <el-checkbox v-model="agreements.refund" class="agreement-checkbox">
                <span>我已了解</span>
                <a href="#" @click.prevent class="agreement-link">《退款政策》</a>
              </el-checkbox>
            </div>

            <div class="agreement-actions">
              <small class="agreement-hint">
                提交订单即表示您已同意以上条款，如有疑问请咨询客服
              </small>
            </div>
          </div>
        </TechCard>

        <TechCard title="选择支付方式" subtitle="支持线上/线下">
          <div class="method-stack">
            <PaymentMethodCard
              v-for="method in paymentMethods"
              :key="method.id"
              :method="method"
              :active="method.id === selectedMethod"
              @select="(id) => (selectedMethod = id)"
            />
          </div>
          <div class="section-actions">
            <TechButton size="sm" variant="ghost" @click="goToStep(2)">上一步</TechButton>
            <TechButton size="sm" :loading="submitting" @click="submitOrder">提交订单</TechButton>
          </div>
        </TechCard>
      </div>
    </section>

    <transition name="purchase-success-fade">
      <div v-if="successVisible" class="purchase-success">
        <!-- 成功粒子效果 -->
        <div class="success-particles">
          <div v-for="i in 12" :key="i" class="particle" :style="{ animationDelay: `${i * 0.1}s` }"></div>
        </div>

        <TechCard
          class="purchase-success-card"
          eyebrow="🎉 下单成功"
          :title="successData.card"
          :subtitle="`订单号: ${successData.orderNumber}`"
          variant="layered"
          :interactive="false"
        >
          <div class="success-content">
            <div class="success-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="rgba(253, 216, 53, 0.1)"/>
                <path d="M8 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="success-message">订单已创建，可前往支付页完成付款或在个人中心查看详情。</p>

            <!-- 权益预览 -->
            <div class="success-benefits-preview">
              <h4>即将获得的权益</h4>
              <ul>
                <li v-for="benefit in deriveBenefits(selectedCard)" :key="benefit" class="benefit-item">
                  <span class="benefit-dot"></span>
                  {{ benefit }}
                </li>
              </ul>
            </div>
          </div>

          <div class="success-actions">
            <TechButton size="sm" variant="ghost" @click="continuePurchase">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="margin-right: 6px;">
                <path d="M4 12h16m-8-8v16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              继续选购
            </TechButton>
            <TechButton size="sm" variant="outline" @click="goCenter">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="margin-right: 6px;">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
              </svg>
              个人中心
            </TechButton>
            <TechButton size="sm" @click="goPay">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="margin-right: 6px;">
                <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
                <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" stroke-width="2"/>
              </svg>
              前往支付
            </TechButton>
          </div>
        </TechCard>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElForm } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { TechButton, TechCard } from '@/components/common'
import { MembershipCard } from '@/components/membership'
import { PaymentMethodCard, PaymentStepper } from '@/components/payment'
import { getModuleService } from '@/services/crud'
import type { Huiyuanka, Huiyuankagoumai } from '@/types/modules'
import { formatCurrency } from '@/utils/formatters'

const route = useRoute()
const router = useRouter()

const cardService = getModuleService('huiyuanka')
const purchaseService = getModuleService('huiyuankagoumai')

const cards = ref<Huiyuanka[]>([])
const selectedIndex = ref(0)
const currentStep = ref(1)
const submitting = ref(false)
const selectedMethod = ref('wechat')
const successVisible = ref(false)
const successData = ref<{ card: string; orderNumber: string; recordId?: number }>({ card: '', orderNumber: '' })
const formRef = ref<InstanceType<typeof ElForm>>()

const loading = reactive({
  cards: false,
})

const form = reactive({
  name: '',
  phone: '',
  coupon: '',
  remark: '',
})

const agreements = reactive({
  privacy: false,
  membership: false,
  refund: false,
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
}

const steps = [
  { label: '选择卡种', description: '挑选会员卡' },
  { label: '填写信息', description: '确认购卡人信息' },
  { label: '确认支付', description: '选择支付方式' },
]

const paymentMethods = [
  {
    id: 'wechat',
    name: '微信支付',
    channel: '扫码 / App',
    description: '实时到账，支持多张银行卡',
    extra: '0 手续费',
    fee: '推荐',
    icon: new URL('@/assets/weixin.png', import.meta.url).href,
  },
  {
    id: 'alipay',
    name: '支付宝',
    channel: '扫码 / 网页',
    description: '支持花呗、分期付款',
    extra: '可分 3/6/12 期',
    fee: '推荐',
    icon: new URL('@/assets/zhifubao.png', import.meta.url).href,
  },
  {
    id: 'offline',
    name: '线下支付',
    channel: '到店刷卡',
    description: '适合企业团体或线下办卡',
    extra: '需在 24h 内完成',
    fee: '人工确认',
    icon: new URL('@/assets/jiaotong.png', import.meta.url).href,
  },
]

const selectedCard = computed(() => cards.value[selectedIndex.value] || cards.value[0])

function onCardSelect(card: Huiyuanka) {
  const index = cards.value.findIndex(c => c.id === card.id)
  if (index >= 0) {
    selectedIndex.value = index
  }
}

const couponRate = computed(() => {
  if (!form.coupon) return 1
  if (form.coupon.toUpperCase() === 'VIP95') return 0.95
  if (form.coupon.toUpperCase() === 'BLACK90') return 0.9
  return 1
})

const discountAmount = computed(() => {
  const base = Number(selectedCard.value?.jiage) || 0
  return base - base * couponRate.value
})

const finalPrice = computed(() => {
  const base = Number(selectedCard.value?.jiage) || 0
  return Math.max(0, base * couponRate.value)
})

const canProceedInfo = computed(() => !!form.name && /^1\d{10}$/.test(form.phone))

onMounted(() => {
  loadCards()
})

async function loadCards() {
  loading.cards = true
  try {
    const { list } = await cardService.list({ page: 1, limit: 6 })
    cards.value = list ?? []
    hydrateSelection()
  } catch (error) {
    console.error(error)
  } finally {
    loading.cards = false
  }
}

function hydrateSelection() {
  const { cardId } = route.query
  if (cardId) {
    const index = cards.value.findIndex((card) => String(card.id) === String(cardId))
    if (index >= 0) {
      selectedIndex.value = index
      return
    }
  }
  selectedIndex.value = 0
}

function deriveBenefits(card: Huiyuanka | undefined) {
  if (!card) return ['预约提前 72h', '私教 9 折', '专属客服', '限定活动']
  const text = card.shiyongshuoming || card.huiyuankaxiangqing || ''
  const segments = text.split(/[\n、。,，]/).map((item) => item.trim()).filter(Boolean)
  if (segments.length) return segments.slice(0, 4)
  return ['预约提前 72h', '私教 9 折', '专属客服', '限定活动']
}

function goToStep(step: number) {
  if (step === 2 && !selectedCard.value) {
    ElMessage.warning('请先选择会员卡')
    return
  }
  if (step === 3 && !canProceedInfo.value) {
    ElMessage.warning('请完善购卡信息')
    return
  }
  currentStep.value = step
}

async function submitOrder() {
  if (!selectedCard.value) {
    ElMessage.warning('请选择会员卡')
    return
  }

  if (!agreements.privacy || !agreements.membership) {
    ElMessage.warning('请先同意相关协议条款')
    return
  }

  submitting.value = true
  try {
    const orderNumber = `VIP${Date.now()}`
    const payload: Partial<Huiyuankagoumai> = {
      huiyuankahao: orderNumber,
      huiyuankamingcheng: selectedCard.value.huiyuankamingcheng,
      tupian: selectedCard.value.tupian,
      youxiaoqi: selectedCard.value.youxiaoqi,
      jiage: finalPrice.value,
      goumairiqi: new Date().toISOString(),
      yonghuxingming: form.name,
      shoujihaoma: form.phone,
      beizhu: `${form.remark || ''} · 支付方式：${selectedMethod.value}`,
      ispay: selectedMethod.value === 'offline' ? '待线下支付' : '待支付',
    }
    await purchaseService.create(payload)
    const created = await fetchOrderByCode(orderNumber)
    successData.value = {
      card: selectedCard.value.huiyuankamingcheng,
      orderNumber,
      recordId: created?.id,
    }
    successVisible.value = true
  } catch (error) {
    console.error(error)
    ElMessage.error('提交订单失败，请稍后再试')
  } finally {
    submitting.value = false
  }
}

function continuePurchase() {
  successVisible.value = false
  currentStep.value = 1
}

function goCenter() {
  successVisible.value = false
  router.push('/index/center')
}

function goPay() {
  successVisible.value = false
  if (!successData.value.recordId) {
    ElMessage.info('订单已提交，请在个人中心发起支付，或稍后重试。')
    return
  }
  router.push({
    path: '/index/pay',
    query: {
      tableName: 'huiyuankagoumai',
      id: successData.value.recordId,
      amount: finalPrice.value,
      title: selectedCard.value?.huiyuankamingcheng,
    },
  })
}

async function fetchOrderByCode(code: string) {
  try {
    const { list } = await purchaseService.list({ page: 1, limit: 1, huiyuankahao: code })
    return list?.[0]
  } catch (error) {
    console.error(error)
    return undefined
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.purchase-page {
  padding: 24px 6vw 80px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.purchase-hero {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-start;
  margin-top: 24px;
}

.purchase-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-selection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 12px;
}

.section-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

.purchase-form {
  margin-top: 12px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.summary-list {
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
  }

  .price-final {
    font-size: 1.2rem;
    color: $color-yellow;
  }
}

.method-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

// 协议确认样式
.agreement-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.security-notice {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: rgba(74, 144, 226, 0.05);
  border: 1px solid rgba(74, 144, 226, 0.2);
  border-radius: 12px;

  .security-icon {
    color: rgba(74, 144, 226, 0.8);
    flex-shrink: 0;
  }

  h5 {
    margin: 0 0 4px 0;
    font-size: 0.9rem;
    font-weight: 600;
    color: rgba(74, 144, 226, 0.9);
  }

  p {
    margin: 0;
    font-size: 0.85rem;
    color: $color-text-secondary;
    line-height: 1.4;
  }
}

.agreements {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.agreement-checkbox {
  .el-checkbox__label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.875rem;
    color: $color-text-secondary;
  }
}

.agreement-link {
  color: $color-yellow;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;

  &:hover {
    color: rgba(253, 216, 53, 0.8);
    text-decoration: underline;
  }
}

.agreement-actions {
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.agreement-hint {
  color: $color-text-secondary;
  font-size: 0.8rem;
  line-height: 1.4;
  display: block;
}

.purchase-success {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 10;
}

// 成功粒子效果
.success-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: $color-yellow;
  border-radius: 50%;
  animation: particle-explosion 2s ease-out forwards;
  opacity: 0;

  &:nth-child(odd) {
    background: rgba(253, 216, 53, 0.8);
    box-shadow: 0 0 10px rgba(253, 216, 53, 0.6);
  }

  &:nth-child(even) {
    background: rgba(74, 144, 226, 0.8);
    box-shadow: 0 0 10px rgba(74, 144, 226, 0.6);
  }
}

@keyframes particle-explosion {
  0% {
    opacity: 1;
    transform: scale(0) rotate(0deg);
  }
  20% {
    opacity: 1;
    transform: scale(1) rotate(180deg);
  }
  100% {
    opacity: 0;
    transform: scale(2) rotate(360deg) translate(
      calc(var(--x, 0) * 100px),
      calc(var(--y, 0) * 100px)
    );
  }
}

.purchase-success-card {
  max-width: 480px;
  position: relative;
  z-index: 1;
  animation: success-card-appear 0.6s ease-out;

  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 24px;
    background: linear-gradient(135deg, rgba(253, 216, 53, 0.3), rgba(74, 144, 226, 0.2), rgba(253, 216, 53, 0.3));
    z-index: -1;
    animation: success-glow 2s ease-in-out infinite alternate;
  }
}

@keyframes success-card-appear {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes success-glow {
  from {
    opacity: 0.5;
  }
  to {
    opacity: 1;
  }
}

.success-content {
  text-align: center;
}

.success-icon {
  margin: 20px 0;
  color: $color-yellow;

  svg {
    animation: success-check 0.8s ease-out 0.3s both;
  }
}

@keyframes success-check {
  from {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  to {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.success-message {
  margin: 16px 0 24px;
  color: $color-text-secondary;
  line-height: 1.5;
}

.success-benefits-preview {
  background: rgba(253, 216, 53, 0.05);
  border: 1px solid rgba(253, 216, 53, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin: 20px 0;
  text-align: left;

  h4 {
    margin: 0 0 12px 0;
    color: $color-yellow;
    font-size: 0.9rem;
    font-weight: 600;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .benefit-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    color: $color-text-secondary;

    .benefit-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: $color-yellow;
      box-shadow: 0 0 8px rgba(253, 216, 53, 0.6);
    }
  }
}

.success-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;

  .tech-button {
    animation: action-button-appear 0.4s ease-out both;

    &:nth-child(1) { animation-delay: 0.8s; }
    &:nth-child(2) { animation-delay: 0.9s; }
    &:nth-child(3) { animation-delay: 1.0s; }
  }
}

@keyframes action-button-appear {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.purchase-success-fade-enter-active,
.purchase-success-fade-leave-active {
  transition: opacity 0.3s ease;
}

.purchase-success-fade-enter-from,
.purchase-success-fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
  .purchase-page {
    padding: 32px 16px 60px;
  }

  .section-actions {
    flex-direction: column;
  }
}
</style>
