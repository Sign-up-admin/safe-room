import { describe, expect, it } from 'vitest'
import { animationConfig, breakpoints } from '@/utils/animationConfig'

describe('animationConfig utilities', () => {
  it('exposes duration, easing and palette tokens', () => {
    expect(animationConfig.durations.fast).toBeLessThan(animationConfig.durations.slow)
    expect(animationConfig.ease.standard).toContain('cubic-bezier')
    expect(animationConfig.colors.energy).toContain('#FDD835')
    expect(animationConfig.hover.glow).toMatch(/rgba/)
    expect(breakpoints.desktop).toBeGreaterThan(breakpoints.mobile)
  })
})


