import { describe, expect, it, vi } from 'vitest'

const startMock = vi.fn()
const destroyMock = vi.fn()

const ParticleSystemMock = vi.hoisted(() => {
  return class {
    constructor(_options: any) {}
    start = startMock
    destroy = destroyMock
  }
})

vi.mock('@/utils/particleSystem', () => ({
  ParticleSystem: ParticleSystemMock,
}))

import { useParticleSystem } from '@/composables/useParticleSystem'

describe('useParticleSystem composable', () => {
  it('creates and destroys particle system instances', () => {
    const canvas = document.createElement('canvas')
    const { mount, destroy } = useParticleSystem({ canvas, density: 10 } as any)

    mount()
    expect(startMock).toHaveBeenCalled()

    destroy()
    expect(destroyMock).toHaveBeenCalled()
  })
})


