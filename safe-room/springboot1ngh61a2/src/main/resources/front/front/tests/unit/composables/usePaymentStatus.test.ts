import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { usePaymentStatus } from '@/composables/usePaymentStatus'

describe('usePaymentStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('polls until success and stops automatically', async () => {
    const fetcher = vi
      .fn<[], Promise<'pending' | 'success' | 'failed'>>()
      .mockResolvedValueOnce('pending')
      .mockResolvedValueOnce('success')

    const { status, polling, start } = usePaymentStatus(fetcher, { interval: 1000 })

    start()
    expect(status.value).toBe('processing')
    expect(fetcher).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(1000)
    // Wait for the async poll function to complete
    await Promise.resolve()
    await Promise.resolve()
    expect(fetcher).toHaveBeenCalledTimes(2)

    await Promise.resolve()
    expect(status.value).toBe('success')
    expect(polling.value).toBe(false)
  })

  it('stop prevents additional polling and reset returns to idle', async () => {
    const fetcher = vi.fn<[], Promise<'pending' | 'success' | 'failed'>>().mockResolvedValue('pending')
    const { status, polling, start, stop, reset } = usePaymentStatus(fetcher, { interval: 500 })

    start()
    expect(polling.value).toBe(true)
    stop()
    expect(polling.value).toBe(false)

    await vi.advanceTimersByTimeAsync(500)
    expect(fetcher).toHaveBeenCalledTimes(1)

    status.value = 'failed'
    reset()
    expect(status.value).toBe('idle')
  })
})


