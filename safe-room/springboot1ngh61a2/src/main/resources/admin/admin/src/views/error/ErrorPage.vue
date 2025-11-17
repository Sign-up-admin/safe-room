<template>
  <div class="admin-error-page">
    <div class="admin-error-page__container">
      <div ref="cardRef" class="admin-error-page__card">
        <!-- 错误图标 -->
        <div ref="iconRef" class="admin-error-page__icon">
          <svg
            v-if="errorCode === '401' || errorCode === '403'"
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              fill="currentColor"
            />
          </svg>
          <svg
            v-else-if="errorCode === '404'"
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
              fill="currentColor"
            />
          </svg>
          <svg v-else width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
              fill="currentColor"
            />
          </svg>
        </div>

        <!-- 错误码 -->
        <div ref="codeRef" class="admin-error-page__code" :aria-label="`错误码 ${errorCode}`">
          {{ errorCode }}
        </div>

        <!-- 错误标题 -->
        <h1 ref="titleRef" class="admin-error-page__title" role="alert">
          {{ errorInfo.title }}
        </h1>

        <!-- 错误描述 -->
        <p ref="descriptionRef" class="admin-error-page__description">
          {{ errorInfo.description }}
        </p>

        <!-- 自动跳转倒计时 -->
        <div v-if="showCountdown" class="admin-error-page__countdown">
          <span>{{ countdown }} 秒后自动跳转到{{ redirectTarget }} </span>
          <button class="admin-error-page__cancel-btn" @click="cancelAutoRedirect">取消</button>
        </div>

        <!-- 操作按钮组 -->
        <div ref="actionsRef" class="admin-error-page__actions">
          <el-button v-if="showLoginButton" type="primary" size="large" @click="goToLogin" @keydown.enter="goToLogin">
            {{ errorInfo.primaryButton }}
          </el-button>
          <el-button v-if="showReloadButton" type="primary" size="large" @click="reload" @keydown.enter="reload">
            {{ errorInfo.primaryButton }}
          </el-button>
          <el-button v-if="showRetryButton" type="primary" size="large" @click="retry" @keydown.enter="retry">
            {{ errorInfo.primaryButton }}
          </el-button>
          <el-button v-if="showHomeButton" type="primary" size="large" @click="goHome" @keydown.enter="goHome">
            {{ errorInfo.primaryButton }}
          </el-button>
          <el-button
            v-if="!showHomeButton && !showLoginButton && !showReloadButton && !showRetryButton"
            size="large"
            @click="goHome"
            @keydown.enter="goHome"
          >
            返回首页
          </el-button>
          <el-button v-if="canGoBack" size="large" @click="goBack" @keydown.enter="goBack"> 返回上一页 </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useErrorStore } from '@/stores/error'

const props = defineProps<{
  code?: string
}>()

const route = useRoute()
const router = useRouter()
const errorStore = useErrorStore()

const cardRef = ref<HTMLElement>()
const iconRef = ref<HTMLElement>()
const codeRef = ref<HTMLElement>()
const titleRef = ref<HTMLElement>()
const descriptionRef = ref<HTMLElement>()
const actionsRef = ref<HTMLElement>()

const errorCode = computed(() => props.code || (route.params.code as string) || '404')

const errorConfig = {
  '401': {
    title: '登录已过期',
    description: '您的会话已失效，请重新登录',
    primaryButton: '前往登录',
    autoRedirect: true,
    redirectDelay: 3000,
    redirectTarget: '登录页',
  },
  '403': {
    title: '权限不足',
    description: '您没有权限访问此功能，请联系管理员',
    primaryButton: '返回首页',
    autoRedirect: true,
    redirectDelay: 5000,
    redirectTarget: '首页',
  },
  '404': {
    title: '页面不存在',
    description: '请求的页面不存在或已被移除',
    primaryButton: '返回首页',
    autoRedirect: false,
  },
  '500': {
    title: '服务器异常',
    description: '服务器处理请求时发生错误，请稍后重试',
    primaryButton: '重新加载',
    autoRedirect: false,
  },
  network: {
    title: '网络异常',
    description: '网络连接失败，请检查网络后重试',
    primaryButton: '重试连接',
    autoRedirect: false,
  },
}

const errorInfo = computed(() => errorConfig[errorCode.value as keyof typeof errorConfig] || errorConfig['404'])

const showCountdown = ref(false)
const countdown = ref(0)
const redirectTarget = computed(() => {
  const info = errorInfo.value as any
  return info.redirectTarget || ''
})
let countdownTimer: ReturnType<typeof setInterval> | null = null

const showLoginButton = computed(() => errorCode.value === '401')
const showReloadButton = computed(() => errorCode.value === '500')
const showRetryButton = computed(() => errorCode.value === 'network')
const showHomeButton = computed(() => errorCode.value === '403' || errorCode.value === '404')
const canGoBack = computed(() => window.history.length > 1)

const startCountdown = () => {
  const info = errorInfo.value as any
  if (!info.autoRedirect) return

  showCountdown.value = true
  countdown.value = (info.redirectDelay || 0) / 1000

  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer!)
      countdownTimer = null
      if (errorCode.value === '401') {
        goToLogin()
      } else if (errorCode.value === '403') {
        goHome()
      }
    }
  }, 1000)
}

const cancelAutoRedirect = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  showCountdown.value = false
}

const goToLogin = () => {
  const from = (route.query['from'] as string) || route.path
  router.push({ name: 'login', query: { redirect: from } })
}

const goHome = () => {
  router.push({ name: 'System Home Dashboard' })
}

const goBack = () => {
  router.go(-1)
}

const reload = () => {
  window.location.reload()
}

const retry = () => {
  const from = (route.query['from'] as string) || '/'
  router.push(from).then(() => {
    window.location.reload()
  })
}

// 动画初始化
const initAnimations = () => {
  // 使用 CSS transition 实现简单动效
  setTimeout(() => {
    if (cardRef.value) cardRef.value.classList.add('animate-in')
    if (iconRef.value) iconRef.value.classList.add('animate-in')
    if (codeRef.value) codeRef.value.classList.add('animate-in')
    if (titleRef.value) titleRef.value.classList.add('animate-in')
    if (descriptionRef.value) descriptionRef.value.classList.add('animate-in')
    if (actionsRef.value) actionsRef.value.classList.add('animate-in')
  }, 50)
}

// 键盘操作
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && canGoBack.value) {
    goBack()
  }
}

onMounted(() => {
  // 记录错误信息
  const from = (route.query['from'] as string) || route.path
  errorStore.setError(errorCode.value, errorInfo.value.title, from)

  // 初始化动画
  initAnimations()

  // 启动倒计时
  if (errorInfo.value.autoRedirect) {
    startCountdown()
  }

  // 监听键盘事件
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style lang="scss" scoped>
.admin-error-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #091628, #101f3d);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;

  &__container {
    width: 100%;
    max-width: 600px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__card {
    width: 100%;
    min-width: 600px;
    background: #ffffff;
    border-radius: 24px;
    padding: 48px;
    box-shadow: 0 30px 80px rgba(10, 24, 64, 0.45);
    text-align: center;
    position: relative;

    @media (width <= 992px) {
      min-width: auto;
      width: 90%;
      padding: 32px;
    }

    @media (width <= 768px) {
      width: 100%;
      padding: 24px;
      border-radius: 16px;
    }

    &.animate-in {
      animation: card-fade-in 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      opacity: 0;
    }
  }

  &__icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 24px;
    color: #3a80ff;

    @media (width <= 768px) {
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }

    &.animate-in {
      animation: icon-rotate 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      transform: rotate(-5deg);
    }

    svg {
      width: 100%;
      height: 100%;
    }
  }

  &__code {
    font-size: 64px;
    font-weight: 900;
    color: #3a80ff;
    line-height: 1;
    margin-bottom: 16px;
    letter-spacing: -0.02em;

    @media (width <= 768px) {
      font-size: 48px;
    }

    &.animate-in {
      animation: fade-in 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.1s forwards;
      opacity: 0;
    }
  }

  &__title {
    font-size: 24px;
    font-weight: 700;
    color: #333333;
    margin: 0 0 12px;
    letter-spacing: 0.02em;

    @media (width <= 768px) {
      font-size: 20px;
    }

    &.animate-in {
      animation: fade-in-up 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards;
      opacity: 0;
    }
  }

  &__description {
    font-size: 16px;
    color: #666666;
    margin: 0 0 32px;
    line-height: 1.6;

    @media (width <= 768px) {
      font-size: 14px;
      margin-bottom: 24px;
    }

    &.animate-in {
      animation: fade-in 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.3s forwards;
      opacity: 0;
    }
  }

  &__countdown {
    margin-bottom: 24px;
    padding: 12px;
    background: rgba(58, 128, 255, 0.1);
    border-radius: 8px;
    color: #666666;
    font-size: 14px;

    .admin-error-page__cancel-btn {
      margin-left: 8px;
      color: #3a80ff;
      background: none;
      border: none;
      cursor: pointer;
      text-decoration: underline;
      font-size: 14px;

      &:hover {
        opacity: 0.8;
      }
    }
  }

  &__actions {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;

    @media (width <= 768px) {
      flex-direction: column;

      :deep(.el-button) {
        width: 100%;
      }
    }

    &.animate-in {
      animation: fade-in-up 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.4s forwards;
      opacity: 0;
    }
  }
}

// CSS 动画
@keyframes card-fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes icon-rotate {
  from {
    transform: rotate(-5deg);
    opacity: 0;
  }
  to {
    transform: rotate(0deg);
    opacity: 1;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
