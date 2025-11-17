<template>
  <div class="error-page">
    <div class="error-page__container">
      <div ref="cardRef" class="error-page__card">
        <!-- 错误码展示 -->
        <div ref="codeRef" class="error-page__code" :aria-label="`错误码 ${errorCode}`">
          {{ errorCode }}
        </div>

        <!-- 错误标题 -->
        <h1 ref="titleRef" class="error-page__title" role="alert">
          {{ errorInfo.title }}
        </h1>

        <!-- 错误描述 -->
        <p ref="descriptionRef" class="error-page__description">
          {{ errorInfo.description }}
        </p>

        <!-- 自动跳转倒计时 -->
        <div v-if="showCountdown" class="error-page__countdown">
          <span>{{ countdown }} 秒后自动跳转到{{ redirectTarget }} </span>
          <button class="error-page__cancel-btn" @click="cancelAutoRedirect">取消</button>
        </div>

        <!-- 操作按钮组 -->
        <div ref="actionsRef" class="error-page__actions">
          <button
            v-if="showLoginButton"
            class="error-page__btn error-page__btn--primary"
            @click="goToLogin"
            @keydown.enter="goToLogin"
          >
            {{ errorInfo.primaryButton }}
          </button>
          <button
            v-if="showReloadButton"
            class="error-page__btn error-page__btn--primary"
            @click="reload"
            @keydown.enter="reload"
          >
            {{ errorInfo.primaryButton }}
          </button>
          <button
            v-if="showRetryButton"
            class="error-page__btn error-page__btn--primary"
            @click="retry"
            @keydown.enter="retry"
          >
            {{ errorInfo.primaryButton }}
          </button>
          <button
            v-if="showHomeButton"
            class="error-page__btn error-page__btn--primary"
            @click="goHome"
            @keydown.enter="goHome"
          >
            {{ errorInfo.primaryButton }}
          </button>
          <button
            v-if="!showHomeButton && !showLoginButton && !showReloadButton && !showRetryButton"
            class="error-page__btn error-page__btn--secondary"
            @click="goHome"
            @keydown.enter="goHome"
          >
            返回首页
          </button>
          <button
            v-if="canGoBack"
            class="error-page__btn error-page__btn--secondary"
            @click="goBack"
            @keydown.enter="goBack"
          >
            返回上一页
          </button>
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
const codeRef = ref<HTMLElement>()
const titleRef = ref<HTMLElement>()
const descriptionRef = ref<HTMLElement>()
const actionsRef = ref<HTMLElement>()

const errorCode = computed(() => props.code || (route.params.code as string) || '404')

interface ErrorConfigItem {
  title: string
  description: string
  primaryButton: string
  autoRedirect: boolean
  redirectDelay?: number
  redirectTarget?: string
}

const errorConfig: Record<string, ErrorConfigItem> = {
  '401': {
    title: '身份验证失败',
    description: '您的登录已过期，请重新登录以继续访问',
    primaryButton: '前往登录',
    autoRedirect: true,
    redirectDelay: 3000,
    redirectTarget: '登录页',
  },
  '403': {
    title: '访问被拒绝',
    description: '抱歉，您没有权限访问此页面',
    primaryButton: '返回首页',
    autoRedirect: true,
    redirectDelay: 5000,
    redirectTarget: '首页',
  },
  '404': {
    title: '页面不存在',
    description: '您访问的页面可能已被移除或不存在',
    primaryButton: '返回首页',
    autoRedirect: false,
  },
  '500': {
    title: '服务器错误',
    description: '服务器遇到了问题，我们正在努力修复',
    primaryButton: '重新加载',
    autoRedirect: false,
  },
  network: {
    title: '网络连接失败',
    description: '无法连接到服务器，请检查网络设置',
    primaryButton: '重试连接',
    autoRedirect: false,
  },
}

const errorInfo = computed(() => errorConfig[errorCode.value as keyof typeof errorConfig] || errorConfig['404'])

const showCountdown = ref(false)
const countdown = ref(0)
const redirectTarget = computed(() => errorInfo.value.redirectTarget || '')
let countdownTimer: ReturnType<typeof setInterval> | null = null

const showLoginButton = computed(() => errorCode.value === '401')
const showReloadButton = computed(() => errorCode.value === '500')
const showRetryButton = computed(() => errorCode.value === 'network')
const showHomeButton = computed(() => errorCode.value === '403' || errorCode.value === '404')
const canGoBack = computed(() => window.history.length > 1)

const startCountdown = () => {
  if (!errorInfo.value.autoRedirect) return

  showCountdown.value = true
  countdown.value = errorInfo.value.redirectDelay! / 1000

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
  const from = (route.query.from as string) || route.path
  router.push({ path: '/login', query: { redirect: from } })
}

const goHome = () => {
  router.push('/index/home')
}

const goBack = () => {
  router.go(-1)
}

const reload = () => {
  window.location.reload()
}

const retry = () => {
  const from = (route.query.from as string) || '/index/home'
  router.push(from).then(() => {
    window.location.reload()
  })
}

// 动画初始化
const initAnimations = () => {
  // 使用 GSAP 如果可用，否则使用 CSS 动画
  if (typeof window !== 'undefined' && (window as any).gsap) {
    const gsap = (window as any).gsap
    const tl = gsap.timeline()

    // 错误码动画
    if (codeRef.value) {
      tl.from(codeRef.value, {
        opacity: 0,
        scale: 0.8,
        duration: 0.6,
        ease: 'power3.out',
      })
    }

    // 标题动画
    if (titleRef.value) {
      tl.from(
        titleRef.value,
        {
          opacity: 0,
          y: 20,
          duration: 0.5,
          ease: 'power3.out',
        },
        '-=0.4',
      )
    }

    // 描述动画
    if (descriptionRef.value) {
      tl.from(
        descriptionRef.value,
        {
          opacity: 0,
          duration: 0.4,
          ease: 'power3.out',
        },
        '-=0.3',
      )
    }

    // 卡片动画
    if (cardRef.value) {
      gsap.from(cardRef.value, {
        opacity: 0,
        y: 40,
        duration: 0.5,
        ease: 'power3.out',
      })
    }

    // 按钮组动画
    if (actionsRef.value) {
      tl.from(
        actionsRef.value,
        {
          opacity: 0,
          y: 20,
          duration: 0.5,
          ease: 'power3.out',
        },
        '-=0.2',
      )
    }
  } else {
    // 如果没有 GSAP，使用 CSS 类触发动画
    if (cardRef.value) cardRef.value.classList.add('animate-in')
    if (codeRef.value) codeRef.value.classList.add('animate-in')
    if (titleRef.value) titleRef.value.classList.add('animate-in')
    if (descriptionRef.value) descriptionRef.value.classList.add('animate-in')
    if (actionsRef.value) actionsRef.value.classList.add('animate-in')
  }
}

// 键盘操作
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && canGoBack.value) {
    goBack()
  }
}

onMounted(() => {
  // 记录错误信息
  const from = (route.query.from as string) || route.path
  errorStore.setError(errorCode.value, errorInfo.value.title, from)

  // 初始化动画
  setTimeout(() => {
    initAnimations()
  }, 50)

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
@use '@/styles/design-tokens.scss' as *;

.error-page {
  min-height: 100vh;
  background: var(--tech-color-bg-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--tech-spacing-lg);
  position: relative;
  overflow: hidden;

  &__container {
    width: 100%;
    max-width: 600px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__card {
    @include glass-card();
    width: 100%;
    padding: 48px;
    text-align: center;
    position: relative;

    @media (max-width: 768px) {
      padding: 32px 24px;
    }
  }

  &__code {
    font-size: 180px;
    font-weight: 900;
    color: var(--tech-color-yellow);
    line-height: 1;
    margin-bottom: var(--tech-spacing-lg);
    text-shadow: 0 0 40px var(--tech-color-yellow-glow);
    letter-spacing: -0.05em;

    @media (max-width: 1200px) {
      font-size: 120px;
    }

    @media (max-width: 768px) {
      font-size: 100px;
    }

    &.animate-in {
      animation: codeFadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
  }

  &__title {
    font-size: 32px;
    font-weight: 700;
    color: var(--tech-color-text-primary);
    margin: 0 0 var(--tech-spacing-md) 0;
    letter-spacing: 0.05em;

    @media (max-width: 768px) {
      font-size: 24px;
    }

    &.animate-in {
      animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards;
      opacity: 0;
    }
  }

  &__description {
    font-size: 18px;
    color: var(--tech-color-text-secondary);
    margin: 0 0 var(--tech-spacing-xl) 0;
    line-height: 1.6;

    @media (max-width: 768px) {
      font-size: 16px;
    }

    &.animate-in {
      animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.4s forwards;
      opacity: 0;
    }
  }

  &__countdown {
    margin-bottom: var(--tech-spacing-lg);
    padding: var(--tech-spacing-md);
    background: rgba(253, 216, 53, 0.1);
    border-radius: 8px;
    color: var(--tech-color-text-secondary);
    font-size: 14px;

    .error-page__cancel-btn {
      margin-left: var(--tech-spacing-sm);
      color: var(--tech-color-yellow);
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
    gap: var(--tech-spacing-md);
    justify-content: center;
    flex-wrap: wrap;

    @media (max-width: 768px) {
      flex-direction: column;

      .error-page__btn {
        width: 100%;
      }
    }

    &.animate-in {
      animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.6s forwards;
      opacity: 0;
    }
  }

  &__btn {
    @include yellow-button(false, 48px);
    cursor: pointer;
    font-size: 16px;
    border: none;
    outline: none;
    transition: var(--tech-transition-base);

    &:focus-visible {
      outline: 2px solid var(--tech-color-yellow);
      outline-offset: 2px;
    }

    &--primary {
      // 主按钮样式已在 yellow-button mixin 中定义
    }

    &--secondary {
      @include yellow-button(true, 48px);
    }
  }

  &__card.animate-in {
    animation: cardSlideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    opacity: 0;
  }
}

// CSS 动画（当 GSAP 不可用时）
@keyframes codeFadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes cardSlideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
