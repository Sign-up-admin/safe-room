<template>
  <div class="payment-result" :class="[`payment-result--${status}`, { 'payment-result--shake': shouldShake }]">
    <div class="payment-result__icon">
      <div v-if="status === 'processing'" class="processing-spinner">
        <svg class="spinner" viewBox="0 0 50 50">
          <circle
            class="path"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke-width="4"
          />
        </svg>
      </div>
      <div v-else-if="status === 'success'" class="success-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M20 6L9 17L4 12"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div v-else class="error-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M18 6L6 18M6 6L18 18"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </div>
    <div>
      <h4>{{ title }}</h4>
      <p>{{ message }}</p>
      <small>订单号：{{ orderNumber }}</small>
      <div v-if="status === 'processing'" class="payment-result__status-info">
        <div class="status-indicator">
          <div class="status-dot"></div>
          <span>正在查询支付状态...</span>
        </div>
        <div v-if="pollingCount > 0" class="polling-info">
          已查询 {{ pollingCount }} 次 • 每2秒自动刷新
        </div>
      </div>
      <div v-if="status === 'processing' && countdown > 0" class="payment-result__countdown">
        <svg class="countdown-circle" viewBox="0 0 36 36">
          <circle
            class="countdown-circle-bg"
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            stroke-width="2"
          />
          <circle
            class="countdown-circle-progress"
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="#fdd835"
            stroke-width="2"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="strokeDashoffset"
            stroke-linecap="round"
            transform="rotate(-90 18 18)"
          />
        </svg>
        <span class="countdown-text">{{ countdown }}s</span>
      </div>
      <div v-if="status === 'failed' && errorMessage" class="payment-result__error">
        <p class="error-message">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    status: 'processing' | 'success' | 'failed'
    orderNumber?: string
    amount?: number
    countdownDuration?: number
    errorMessage?: string
    pollingCount?: number
  }>(),
  {
    status: 'processing',
    orderNumber: '',
    amount: 0,
    countdownDuration: 300, // 5分钟倒计时
    errorMessage: '',
    pollingCount: 0,
  },
)

const emit = defineEmits<{
  (e: 'retry'): void
}>()

const shouldShake = ref(false)

const countdown = ref(props.countdownDuration)
const timer = ref<number | null>(null)
const circumference = 2 * Math.PI * 16 // 半径16的圆周长

const title = computed(() => {
  if (props.status === 'success') return '支付成功'
  if (props.status === 'failed') return '支付失败'
  return '等待支付结果'
})

const message = computed(() => {
  if (props.status === 'success') return `已完成支付 ¥${props.amount?.toFixed(2)}`
  if (props.status === 'failed') return '支付未完成，请重试或联系顾问'
  if (countdown.value <= 0) return '二维码已过期，请刷新页面重新生成'
  return '请完成支付，若已支付请点击"我已完成支付"'
})

const strokeDashoffset = computed(() => {
  const progress = countdown.value / props.countdownDuration
  return circumference * (1 - progress)
})

function startCountdown() {
  if (timer.value) {
    clearInterval(timer.value)
  }
  countdown.value = props.countdownDuration
  timer.value = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      stopCountdown()
    }
  }, 1000) as unknown as number
}

function stopCountdown() {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
}

function resetCountdown() {
  stopCountdown()
  countdown.value = props.countdownDuration
}

watch(
  () => props.status,
  (newStatus, oldStatus) => {
    if (newStatus === 'processing') {
      startCountdown()
      shouldShake.value = false
    } else {
      stopCountdown()
      if (newStatus === 'failed' && oldStatus !== 'failed') {
        // 触发shake动画
        shouldShake.value = true
        setTimeout(() => {
          shouldShake.value = false
        }, 600)
      }
    }
  },
  { immediate: true },
)

watch(
  () => props.countdownDuration,
  () => {
    if (props.status === 'processing') {
      resetCountdown()
      startCountdown()
    }
  },
)

onMounted(() => {
  if (props.status === 'processing') {
    startCountdown()
  }
})

onBeforeUnmount(() => {
  stopCountdown()
})
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.payment-result {
  display: flex;
  gap: 16px;
  border-radius: 18px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);

  &--success {
    border-color: rgba(76, 175, 80, 0.6);
  }

  &--failed {
    border-color: rgba(255, 82, 82, 0.6);
  }
}

.payment-result__icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.08);
  display: grid;
  place-items: center;
  font-size: 1.2rem;
}

.processing-spinner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 32px;
  height: 32px;
  animation: spin 1s linear infinite;
}

.path {
  stroke: #fdd835;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 0, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

.success-icon,
.error-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
}

.success-icon svg {
  width: 24px;
  height: 24px;
  color: #4caf50;
}

.error-icon svg {
  width: 24px;
  height: 24px;
  color: #f44336;
}

h4 {
  margin: 0 0 4px;
}

p {
  margin: 0 0 6px;
  color: $color-text-secondary;
}

small {
  color: $color-text-secondary;
}

.payment-result__status-info {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: $color-text-secondary;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #fdd835;
  animation: blink 1.5s ease-in-out infinite;
}

.polling-info {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(253, 216, 53, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid rgba(253, 216, 53, 0.2);
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

.payment-result__countdown {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding: 8px 16px;
  border-radius: 12px;
  background: rgba(253, 216, 53, 0.1);
  border: 1px solid rgba(253, 216, 53, 0.3);
}

.countdown-circle {
  width: 32px;
  height: 32px;
  transform: rotate(-90deg);
}

.countdown-circle-bg {
  transition: stroke 0.3s ease;
}

.countdown-circle-progress {
  transition: stroke-dashoffset 1s linear;
  filter: drop-shadow(0 0 4px rgba(253, 216, 53, 0.6));
}

.countdown-text {
  font-weight: 600;
  color: #fdd835;
  font-size: 0.9rem;
  letter-spacing: 0.1em;
}

.payment-result--processing .payment-result__countdown {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.payment-result--shake {
  animation: shake 0.6s ease-in-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-8px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(8px);
  }
}

.payment-result__error {
  margin-top: 12px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 82, 82, 0.1);
  border: 1px solid rgba(255, 82, 82, 0.3);
}

.error-message {
  margin: 0;
  color: #ff5252;
  font-size: 0.9rem;
  line-height: 1.5;
}
</style>

