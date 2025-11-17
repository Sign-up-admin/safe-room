import { onBeforeUnmount, ref } from 'vue'

export type PaymentState = 'idle' | 'processing' | 'success' | 'failed' | 'timeout'

export interface PaymentStatusOptions {
  interval?: number
  timeout?: number
  maxPollingCount?: number
}

type Fetcher = () => Promise<'pending' | 'success' | 'failed'>

const defaultOptions: Required<PaymentStatusOptions> = {
  interval: 2000,
  timeout: 300000, // 5分钟超时
  maxPollingCount: 150, // 最多轮询150次（5分钟）
}

export function usePaymentStatus(fetcher: Fetcher, options: PaymentStatusOptions = {}) {
  const resolved = { ...defaultOptions, ...options }
  const status = ref<PaymentState>('idle')
  const polling = ref(false)
  const pollingCount = ref(0)
  const startTime = ref<number | null>(null)
  let timer: number | null = null
  let timeoutTimer: number | null = null

  async function poll() {
    if (!polling.value) return

    // 检查超时
    if (startTime.value && Date.now() - startTime.value > resolved.timeout) {
      status.value = 'timeout'
      stop()
      return
    }

    // 检查最大轮询次数
    if (pollingCount.value >= resolved.maxPollingCount) {
      status.value = 'timeout'
      stop()
      return
    }

    try {
      pollingCount.value++
      const result = await fetcher()
      if (result === 'pending') {
        timer = setTimeout(poll, resolved.interval) as unknown as number
        return
      }
      status.value = result
      stop()
    } catch (error) {
      console.error('[usePaymentStatus] Polling error:', error)
      // 网络错误时不立即停止，继续轮询
      timer = setTimeout(poll, resolved.interval) as unknown as number
    }
  }

  function start() {
    if (polling.value) return
    polling.value = true
    status.value = 'processing'
    pollingCount.value = 0
    startTime.value = Date.now()

    // 设置超时定时器
    timeoutTimer = setTimeout(() => {
      if (polling.value) {
        status.value = 'timeout'
        stop()
      }
    }, resolved.timeout) as unknown as number

    poll()
  }

  function stop() {
    polling.value = false
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
    if (timeoutTimer !== null) {
      clearTimeout(timeoutTimer)
      timeoutTimer = null
    }
    startTime.value = null
  }

  function reset() {
    stop()
    status.value = 'idle'
    pollingCount.value = 0
  }

  onBeforeUnmount(() => stop())

  return {
    status,
    polling,
    pollingCount,
    start,
    stop,
    reset,
  }
}

