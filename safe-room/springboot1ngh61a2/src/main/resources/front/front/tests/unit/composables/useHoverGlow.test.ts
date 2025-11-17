import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useHoverGlow } from '@/composables/useHoverGlow'

const gsapMock = vi.hoisted(() => ({
  to: vi.fn(),
}))

vi.mock('gsap', () => ({
  default: gsapMock,
}))

const gsapTo = gsapMock.to

describe('useHoverGlow', () => {
  let getComputedStyleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    gsapTo.mockClear()
    getComputedStyleSpy = vi
      .spyOn(window, 'getComputedStyle')
      .mockReturnValue({ borderColor: 'rgba(255, 255, 255, 0.2)' } as CSSStyleDeclaration)
  })

  afterEach(() => {
    getComputedStyleSpy.mockRestore()
  })

  it('attaches hover animations and cleans up listeners', () => {
    const { attach, detach } = useHoverGlow({ scale: 1.1, shadow: 'mock-shadow' })
    const card = document.createElement('div')

    attach(card)

    card.dispatchEvent(new Event('mouseenter'))
    expect(gsapTo).toHaveBeenCalledWith(
      card,
      expect.objectContaining({
        scale: 1.1,
        boxShadow: 'mock-shadow',
        borderColor: '#FDD835',
      }),
    )

    card.dispatchEvent(new Event('mouseleave'))
    expect(gsapTo).toHaveBeenLastCalledWith(
      card,
      expect.objectContaining({
        scale: 1,
        boxShadow: 'var(--shadow-soft)',
      }),
    )

    gsapTo.mockClear()
    detach(card)
    card.dispatchEvent(new Event('mouseenter'))
    expect(gsapTo).not.toHaveBeenCalled()
  })
})


