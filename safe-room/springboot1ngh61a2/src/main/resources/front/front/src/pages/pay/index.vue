<template>
  <div class="pay-page" v-loading="submitting">
    <section class="pay-header">
      <div>
        <p class="section-eyebrow">ORDER PAYMENT</p>
        <h1>¥{{ payment.amount.toFixed(2) }}</h1>
        <span>订单号：{{ payment.orderNumber }}</span>
      </div>
      <PaymentStepper :steps="steps" :current="currentStep" />
    </section>

    <div class="pay-grid">
      <el-card class="summary-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <div>
              <h2>{{ payment.title }}</h2>
              <p>请确认订单信息后选择支付方式</p>
            </div>
            <el-tag type="success" size="large">金额 ¥{{ payment.amount.toFixed(2) }}</el-tag>
          </div>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="业务模块">{{ payment.tableName || '未指定' }}</el-descriptions-item>
          <el-descriptions-item label="订单编号">{{ payment.orderNumber }}</el-descriptions-item>
          <el-descriptions-item label="关联记录">{{ payment.recordId || '--' }}</el-descriptions-item>
          <el-descriptions-item label="用户账号">{{ payment.username || '当前用户' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card class="method-card" shadow="hover">
        <template #header>
          <h3>选择支付方式</h3>
        </template>
        <div class="method-list">
          <PaymentMethodCard
            v-for="method in paymentMethods"
            :key="method.id"
            :method="method"
            :active="method.id === selectedMethod"
            @select="handleSelectMethod"
          />
        </div>
        <el-input
          v-model="payment.remark"
          class="mt-16"
          placeholder="备注（可选）"
          type="textarea"
          :rows="2"
        />
        <!-- 余额支付提示 -->
        <div v-if="selectedMethod === 'balance' && balanceTip" class="balance-tip" :class="{ 'balance-tip--insufficient': !hasEnoughBalance }">
          <svg v-if="balanceLoading" class="loading-icon" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="loading-circle"></circle>
          </svg>
          <svg v-else-if="hasEnoughBalance" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M15 9l-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M9 9l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span>{{ balanceTip }}</span>
        </div>

        <!-- 分期支付选项 -->
        <div v-if="selectedMethod === 'installment'" class="installment-options">
          <h4>选择分期期数</h4>
          <div class="installment-grid">
            <div
              v-for="option in installmentOptions"
              :key="option.periods"
              class="installment-option"
              :class="{ 'installment-option--active': selectedInstallment?.periods === option.periods }"
              @click="selectedInstallment = option"
            >
              <div class="installment-header">
                <span class="installment-periods">{{ option.periods }}期</span>
                <span class="installment-rate">{{ (option.monthlyRate * 100).toFixed(1) }}%/月</span>
              </div>
              <div class="installment-desc">{{ option.description }}</div>
            </div>
          </div>

          <!-- 分期详情 -->
          <div v-if="installmentDetails" class="installment-details">
            <div class="detail-row">
              <span>每月还款</span>
              <strong>¥{{ installmentDetails.monthlyPayment }}</strong>
            </div>
            <div class="detail-row">
              <span>总利息</span>
              <span>¥{{ installmentDetails.totalInterest }}</span>
            </div>
            <div class="detail-row detail-row--total">
              <span>总还款额</span>
              <strong>¥{{ installmentDetails.totalPayment }}</strong>
            </div>
          </div>
        </div>

        <div class="method-actions">
          <el-button @click="goBack">返回</el-button>
          <el-button
            type="primary"
            :disabled="!canSubmit || (selectedMethod === 'balance' && !hasEnoughBalance) || (selectedMethod === 'installment' && !selectedInstallment)"
            @click="handlePay"
          >
            确认支付
          </el-button>
        </div>
      </el-card>

      <section class="status-card">
        <PaymentResult
          :status="resultStatus"
          :order-number="payment.orderNumber"
          :amount="payment.amount"
          :error-message="errorMessage"
          :polling-count="paymentStatus.pollingCount.value"
          @retry="handleRetry"
        />
        <div class="status-actions">
          <el-button v-if="resultStatus === 'failed'" type="primary" @click="handleRetry">重试支付</el-button>
          <el-button link type="primary" @click="manualCheck">我已完成支付</el-button>
          <el-button link type="primary" @click="refreshStatus">刷新状态</el-button>
        </div>
      </section>

      <section class="security-card">
        <h3>支付安全保障</h3>
        <div class="security-badges">
          <div class="security-badge">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="#fdd835"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="#fdd835"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="#fdd835"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span>SSL 256位加密</span>
          </div>
          <div class="security-badge">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="#fdd835" stroke-width="2" />
              <path d="M7 11V7C7 4.79086 8.79086 3 11 3H13C15.2091 3 17 4.79086 17 7V11" stroke="#fdd835" stroke-width="2" />
              <circle cx="12" cy="16" r="1" fill="#fdd835" />
            </svg>
            <span>PCI DSS认证</span>
          </div>
          <div class="security-badge">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="#fdd835"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span>银行级安全</span>
          </div>
          <div class="security-badge">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z"
                stroke="#fdd835"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M9 12L11 14L15 10"
                stroke="#fdd835"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span>安全联盟认证</span>
          </div>
        </div>
        <ul>
          <li v-for="tip in securityTips" :key="tip.title">
            <strong>{{ tip.title }}</strong>
            <p>{{ tip.desc }}</p>
          </li>
        </ul>
        <div class="security-contact">
          <div class="contact-methods">
            <div class="contact-item">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22 16.92V19.92C22 20.52 21.52 21 20.92 21C17.72 21 14.72 19.72 12.52 17.52C10.32 15.32 9 12.32 9 9.12C9 8.52 9.48 8 10.08 8H13.08C13.44 8 13.76 8.24 13.88 8.58C14.04 9.06 14.32 9.5 14.68 9.86L15.52 10.7C16.32 11.5 16.32 12.8 15.52 13.6L13.52 15.6C13.32 15.8 13.2 16.08 13.2 16.36C13.2 16.64 13.32 16.92 13.52 17.12L14.36 17.96C14.72 18.32 15.16 18.6 15.64 18.76C15.98 18.88 16.22 19.2 16.22 19.56V19.92H22V16.92Z"
                  stroke="#fdd835"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <div>
                <strong>支付客服热线</strong>
                <a href="tel:400-800-8888" class="phone-link">400-800-8888</a>
                <span class="service-hours">24小时服务</span>
              </div>
            </div>
            <div class="contact-item">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                  stroke="#fdd835"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <div>
                <strong>在线客服</strong>
                <a href="#" class="online-link">点击咨询</a>
                <span class="service-hours">即时响应</span>
              </div>
            </div>
          </div>
          <div class="emergency-notice">
            <p>如遇紧急情况，请立即致电客服热线，我们将为您提供最及时的帮助。</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import http from '@/common/http'
import type { ApiResponse } from '@/types/api'
import { PaymentMethodCard, PaymentResult, PaymentStepper } from '@/components/payment'
import { usePaymentStatus } from '@/composables/usePaymentStatus'

const route = useRoute()
const router = useRouter()

const submitting = ref(false)
const selectedMethod = ref('wechat')
const currentStep = ref(2)
const errorMessage = ref('')
const retryCount = ref(0)
const maxRetries = 3

const steps = [
  { label: '确认订单', description: '核对金额/内容' },
  { label: '选择方式', description: '选择支付渠道' },
  { label: '支付中', description: '等待结果' },
  { label: '完成', description: '查看结果' },
]

const payment = reactive({
  amount: Number(route.query.amount || route.query.price || 0),
  tableName: (route.query.tableName as string) || '',
  recordId: (route.query.id as string) || '',
  title: (route.query.title as string) || '健身订单',
  orderNumber: (route.query.orderNo as string) || `GYM${Date.now()}`,
  username: route.query.username as string | undefined,
  remark: '',
})

const paymentMethods = [
  {
    id: 'balance',
    name: '余额支付',
    channel: '账户余额',
    description: '使用账户余额快速支付，无需等待',
    extra: '安全快捷，无手续费',
    fee: '0 手续费',
    arrivalTime: '实时',
    limit: '根据账户余额',
    icon: new URL('@/assets/balance.png', import.meta.url).href,
  },
  {
    id: 'wechat',
    name: '微信支付',
    channel: '扫码 / App',
    description: '推荐使用微信扫码支付，实时到账',
    extra: '最高单笔 5 万元',
    fee: '0 手续费',
    arrivalTime: '实时',
    limit: '5 万元',
    icon: new URL('@/assets/weixin.png', import.meta.url).href,
  },
  {
    id: 'alipay',
    name: '支付宝',
    channel: '扫码 / 网页',
    description: '支持花呗分期，到账即时同步',
    extra: '支持花呗 3/6/12 期',
    fee: '0 手续费',
    arrivalTime: '实时',
    limit: '50 万元',
    icon: new URL('@/assets/zhifubao.png', import.meta.url).href,
  },
  {
    id: 'installment',
    name: '分期支付',
    channel: '3/6/12 期',
    description: '低息分期，减轻支付压力',
    extra: '月费率 0.8%-1.2%',
    fee: '分期手续费',
    arrivalTime: '实时',
    limit: '10 万元',
    icon: new URL('@/assets/installment.png', import.meta.url).href,
  },
  {
    id: 'bank',
    name: '银行卡转账',
    channel: '对公账户',
    description: '适用于企业或大额支付，到账 1 个工作日内',
    extra: '请备注订单号',
    fee: '人工核对',
    arrivalTime: '1 个工作日',
    limit: '无限制',
    icon: new URL('@/assets/jiaotong.png', import.meta.url).href,
  },
]

const securityTips = [
  { title: 'HTTPS 加密传输', desc: '全程采用256位SSL加密，保障您的支付信息安全传输。' },
  { title: '防钓鱼提醒', desc: '请勿在陌生页面输入支付信息，谨防钓鱼网站欺诈。' },
  { title: '验证码安全', desc: '支付验证码仅用于本次交易，请勿告知他人或在其他地方使用。' },
  { title: '实时监控', desc: '系统实时监控交易状态，异常交易将立即冻结并通知您。' },
]

const canSubmit = computed(() => payment.amount > 0 && !!payment.tableName && !!payment.recordId)

const paymentStatus = usePaymentStatus(fetchPaymentStatus, {
  interval: 2000,
  timeout: 300000, // 5分钟超时
  maxPollingCount: 150,
})
const resultStatus = computed(() => {
  if (paymentStatus.status.value === 'success') return 'success'
  if (paymentStatus.status.value === 'failed' || paymentStatus.status.value === 'timeout') return 'failed'
  return 'processing'
})

watch(
  () => paymentStatus.status.value,
  (value) => {
    if (value === 'success' || value === 'failed' || value === 'timeout') {
      currentStep.value = 4
      if (value === 'timeout') {
        errorMessage.value = '支付超时，请刷新页面重新支付或联系客服'
      }
    }
  },
)

function handleSelectMethod(id: string) {
  selectedMethod.value = id
  currentStep.value = Math.max(currentStep.value, 2)
}

// 余额支付相关状态
const userBalance = ref(0)
const balanceLoading = ref(false)

// 分期支付相关状态
const installmentOptions = [
  { periods: 3, monthlyRate: 0.008, description: '3期分期' },
  { periods: 6, monthlyRate: 0.009, description: '6期分期' },
  { periods: 12, monthlyRate: 0.012, description: '12期分期' },
]
const selectedInstallment = ref<typeof installmentOptions[0] | null>(null)

// 检查用户余额
async function checkUserBalance() {
  if (selectedMethod.value !== 'balance') return

  balanceLoading.value = true
  try {
    // 这里应该调用获取用户余额的API
    // 暂时模拟余额检查
    const response = await http.get('/api/user/balance')
    userBalance.value = response.data?.balance || 0
  } catch (error) {
    console.error('获取余额失败:', error)
    userBalance.value = 0
  } finally {
    balanceLoading.value = false
  }
}

// 检查余额是否充足
const hasEnoughBalance = computed(() => {
  if (selectedMethod.value !== 'balance') return true
  return userBalance.value >= payment.amount
})

// 余额支付提示信息
const balanceTip = computed(() => {
  if (selectedMethod.value !== 'balance') return ''
  if (balanceLoading.value) return '正在检查余额...'
  if (!hasEnoughBalance.value) {
    return `余额不足，当前余额 ¥${userBalance.value.toFixed(2)}，需要 ¥${payment.amount.toFixed(2)}`
  }
  return `使用余额支付 ¥${payment.amount.toFixed(2)}，支付后余额 ¥${(userBalance.value - payment.amount).toFixed(2)}`
})

// 计算分期支付详情
const installmentDetails = computed(() => {
  if (selectedMethod.value !== 'installment' || !selectedInstallment.value) return null

  const principal = payment.amount
  const periods = selectedInstallment.value.periods
  const monthlyRate = selectedInstallment.value.monthlyRate

  // 计算每月还款额（等额本息）
  const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, periods)) /
                        (Math.pow(1 + monthlyRate, periods) - 1)

  // 计算总利息
  const totalInterest = monthlyPayment * periods - principal

  return {
    periods,
    monthlyRate: (monthlyRate * 100).toFixed(1),
    monthlyPayment: monthlyPayment.toFixed(2),
    totalPayment: (principal + totalInterest).toFixed(2),
    totalInterest: totalInterest.toFixed(2),
  }
})

// 监听支付方式变化，检查余额或重置分期选项
watch(selectedMethod, async (newMethod) => {
  if (newMethod === 'balance') {
    await checkUserBalance()
  } else if (newMethod === 'installment') {
    selectedInstallment.value = installmentOptions[0] // 默认选择3期
  } else {
    selectedInstallment.value = null
  }
})

async function handlePay() {
  if (!canSubmit.value) {
    ElMessage.warning('缺少订单信息，无法支付')
    return
  }
  submitting.value = true
  currentStep.value = 3
  paymentStatus.reset()
  paymentStatus.start()
  errorMessage.value = ''
  retryCount.value = 0
  try {
    await http.post<ApiResponse>(`/${payment.tableName}/update`, {
      id: payment.recordId,
      ispay: '已支付',
      paymethod: selectedMethod.value,
      remark: payment.remark,
    })
    ElMessage.success('支付请求已提交，正在确认状态')
  } catch (error: any) {
    console.error(error)
    paymentStatus.stop()
    paymentStatus.status.value = 'failed'
    errorMessage.value = error?.response?.data?.msg || '支付失败，请检查网络连接或稍后重试'
    ElMessage.error(errorMessage.value)
  } finally {
    submitting.value = false
  }
}

async function handleRetry() {
  if (retryCount.value >= maxRetries) {
    ElMessage.warning(`已达到最大重试次数（${maxRetries}次），请刷新页面或联系客服`)
    return
  }
  retryCount.value++
  errorMessage.value = ''
  await handlePay()
}

async function fetchPaymentStatus() {
  if (!payment.tableName || !payment.recordId) return 'failed'
  try {
    const response = await http.get<ApiResponse<any>>(`/${payment.tableName}/detail/${payment.recordId}`)
    const state = response.data.data?.ispay
    if (state === '已支付') return 'success'
    if (state === '支付失败') return 'failed'
    return 'pending'
  } catch (error) {
    console.error(error)
    return 'pending'
  }
}

function manualCheck() {
  paymentStatus.start()
}

async function refreshStatus() {
  const result = await fetchPaymentStatus()
  if (result === 'success') {
    paymentStatus.status.value = 'success'
  } else if (result === 'failed') {
    paymentStatus.status.value = 'failed'
  }
}

function goBack() {
  router.back()
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.pay-page {
  min-height: 100vh;
  background: radial-gradient(circle at 10% 20%, rgba(253, 216, 53, 0.18), transparent 45%),
    radial-gradient(circle at 80% 0%, rgba(253, 216, 53, 0.12), transparent 50%), #020202;
  padding: 48px 24px 80px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.pay-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;

  h1 {
    margin: 4px 0;
    font-size: clamp(2rem, 4vw, 3rem);
  }

  span {
    color: $color-text-secondary;
  }
}

.pay-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 24px;
}

.summary-card,
.method-card {
  @include glass-card();
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  h2 {
    margin: 0;
    letter-spacing: 0.2em;
  }

  p {
    margin: 4px 0 0;
    color: $color-text-secondary;
  }
}

.method-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mt-16 {
  margin-top: 16px;

  :deep(.el-textarea__inner) {
    min-height: 92px;
    border-radius: 16px;
  }
}

.method-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.status-card,
.security-card {
  @include glass-card();
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-actions {
  display: flex;
  gap: 12px;
}

.security-badges {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(253, 216, 53, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(253, 216, 53, 0.2);
}

.security-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;

  svg {
    width: 32px;
    height: 32px;
  }

  span {
    font-size: 0.85rem;
    color: $color-text-secondary;
    letter-spacing: 0.05em;
  }
}

.security-card ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;

  li {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 16px;
    padding: 12px 16px;

    strong {
      display: block;
      margin-bottom: 4px;
    }

    p {
      margin: 0;
      color: $color-text-secondary;
    }
  }
}

.security-contact {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);

  .contact-methods {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
  }

  .contact-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: rgba(253, 216, 53, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(253, 216, 53, 0.2);

    svg {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }

    div {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    strong {
      color: var(--color-text-primary);
      font-size: 0.9rem;
    }

    a {
      color: $color-yellow;
      text-decoration: none;
      font-weight: 600;
      font-size: 1.1rem;

      &:hover {
        text-decoration: underline;
      }
    }

    .service-hours {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.6);
    }
  }

  .emergency-notice {
    padding: 12px 16px;
    background: rgba(255, 82, 82, 0.1);
    border-radius: 12px;
    border: 1px solid rgba(255, 82, 82, 0.2);

    p {
      margin: 0;
      color: rgba(255, 82, 82, 0.9);
      font-size: 0.9rem;
      line-height: 1.5;
    }
  }
}

:deep(.el-descriptions__body) {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.08);
}

:deep(.el-descriptions__label) {
  color: $color-text-secondary;
  background: rgba(255, 255, 255, 0.02);
}

:deep(.el-descriptions__content) {
  color: $color-text-primary;
}

@media (max-width: 768px) {
  .pay-page {
    padding: 32px 16px 60px;
  }

  .pay-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .pay-header h1 {
    font-size: 2rem;
  }

  .pay-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .method-actions,
  .status-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .method-actions .el-button,
  .status-actions .el-button {
    width: 100%;
  }

  .security-badges {
    flex-direction: column;
    gap: 12px;
  }

  .security-contact .contact-methods {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .payment-stepper {
    gap: 12px;
  }

  .payment-stepper__item {
    padding: 10px 14px;
    font-size: 0.9rem;
  }
}

@media (max-width: 640px) {
  .pay-page {
    padding: 24px 12px 60px;
  }

  .pay-header h1 {
    font-size: 1.75rem;
  }

  .card-header {
    flex-direction: column;
    gap: 12px;
  }

  .summary-card,
  .method-card {
    .el-descriptions {
      font-size: 0.9rem;
    }
  }

  .security-badge {
    flex-direction: row;
    justify-content: flex-start;
    gap: 12px;

    svg {
      width: 28px;
      height: 28px;
    }

    span {
      font-size: 0.85rem;
    }
  }

  .contact-item {
    padding: 10px 12px;

    svg {
      width: 20px;
      height: 20px;
    }

    a {
      font-size: 1rem;
    }
  }
}

@media (max-width: 480px) {
  .pay-page {
    padding: 20px 10px 60px;
  }

  .pay-header h1 {
    font-size: 1.5rem;
  }

  .pay-header span {
    font-size: 0.9rem;
  }

  .payment-stepper {
    flex-wrap: wrap;
    justify-content: center;
  }

  .payment-stepper__item {
    min-width: 120px;
    padding: 8px 10px;
  }

  .payment-stepper__index {
    width: 24px;
    height: 24px;
    font-size: 0.8rem;
  }

  .security-badges {
    padding: 12px;
  }

  .emergency-notice {
    padding: 10px 12px;

    p {
      font-size: 0.85rem;
    }
  }
}
</style>

// 余额支付提示样式
<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.balance-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  font-size: 14px;
  background: rgba(253, 216, 53, 0.1);
  border: 1px solid rgba(253, 216, 53, 0.2);
  color: $color-text-primary;

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  .loading-icon {
    animation: spin 1s linear infinite;
  }

  .loading-circle {
    animation: loading-dash 1.5s ease-in-out infinite;
  }

  &--insufficient {
    background: rgba(244, 67, 54, 0.1);
    border-color: rgba(244, 67, 54, 0.2);
    color: #f44336;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes loading-dash {
  0% { stroke-dasharray: 0 62.8; }
  50% { stroke-dasharray: 31.4 31.4; }
  100% { stroke-dasharray: 0 62.8; }
}

// 分期支付样式
.installment-options {
  margin-bottom: 16px;

  h4 {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: $color-text-primary;
  }
}

.installment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.installment-option {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(253, 216, 53, 0.4);
    box-shadow: 0 8px 25px rgba(253, 216, 53, 0.15);
    background: rgba(253, 216, 53, 0.05);
  }

  &--active {
    border-color: rgba(253, 216, 53, 0.8);
    box-shadow: $shadow-glow;
    background: rgba(253, 216, 53, 0.08);
  }
}

.installment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.installment-periods {
  font-size: 18px;
  font-weight: 600;
  color: $color-text-primary;
}

.installment-rate {
  font-size: 12px;
  color: $color-text-secondary;
  background: rgba(253, 216, 53, 0.1);
  padding: 2px 6px;
  border-radius: 8px;
}

.installment-desc {
  font-size: 14px;
  color: $color-text-secondary;
}

.installment-details {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;

  &:last-child {
    margin-bottom: 0;
  }

  &--total {
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 12px;
    margin-top: 12px;

    strong {
      font-size: 16px;
      color: #fdd835;
    }
  }

  strong {
    color: $color-text-primary;
  }
}
</style>

