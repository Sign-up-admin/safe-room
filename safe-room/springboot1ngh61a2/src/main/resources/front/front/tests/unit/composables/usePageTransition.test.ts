import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePageTransition } from '@/composables/usePageTransition'

const gsapMock = vi.hoisted(() => ({
  fromTo: vi.fn(),
  to: vi.fn(),
}))

vi.mock('gsap', () => ({
  default: gsapMock,
  fromTo: gsapMock.fromTo,
  to: gsapMock.to,
}))

const { fromTo, to } = gsapMock

describe('usePageTransition', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('runs enter animations with merged options', () => {
    const { enter } = usePageTransition({ duration: 1, opacity: 0.2 })
    enter('.hero', { offset: 60 })

    expect(fromTo).toHaveBeenCalledWith(
      '.hero',
      { opacity: 0.2, y: 60 },
      expect.objectContaining({
        duration: 1,
        ease: 'power3.out',
        stagger: 0.06,
      }),
    )
  })

  it('creates leave and fadeIn tweens', () => {
    const { leave, fadeIn } = usePageTransition({ offset: 40, duration: 0.5 })

    leave('.page')
    expect(to).toHaveBeenCalledWith(
      '.page',
      expect.objectContaining({
        opacity: 0,
        y: -24,
        duration: 0.4,
      }),
    )

    fadeIn('.card', { duration: 1 })
    expect(fromTo).toHaveBeenCalledWith(
      '.card',
      { opacity: 0 },
      expect.objectContaining({
        opacity: 1,
        duration: 0.8,
      }),
    )
  })
})


