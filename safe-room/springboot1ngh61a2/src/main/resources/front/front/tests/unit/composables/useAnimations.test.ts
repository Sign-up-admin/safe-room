import { describe, expect, it, vi } from 'vitest'

const playMock = vi.fn()
const pauseMock = vi.fn()
const killMock = vi.fn()

vi.mock('gsap', () => ({
  default: {
    timeline: vi.fn(() => ({
      play: playMock,
      pause: pauseMock,
      kill: killMock,
    })),
  },
  timeline: vi.fn(() => ({
    play: playMock,
    pause: pauseMock,
    kill: killMock,
  })),
}))

import { useAnimations } from '@/composables/useAnimations'

describe('useAnimations composable', () => {
  it('registers and controls timelines', () => {
    const { registerTimeline, play, pause, kill } = useAnimations()
    registerTimeline('intro')
    play('intro')
    pause('intro')
    kill('intro')

    expect(playMock).toHaveBeenCalled()
    expect(pauseMock).toHaveBeenCalled()
    expect(killMock).toHaveBeenCalled()
  })
})


