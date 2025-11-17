import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CountDown from '@/components/CountDown.vue'

describe('CountDown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('displays countdown text between start and end time', async () => {
    const now = Date.now()
    const wrapper = mount(CountDown, {
      props: {
        startTime: now - 1_000,
        endTime: now + 5_000,
        tipText: '距离开始',
        tipTextEnd: '距离结束',
      },
      global: {
        config: {
          globalProperties: {
            $set(target: Record<string, any>, key: string, value: any) {
              target[key] = value
            },
          },
        },
      },
    })

    // allow timers to update internal state
    vi.advanceTimersByTime(1_100)

    expect(wrapper.text()).toMatch(/距离结束|已结束/)
  })
})


