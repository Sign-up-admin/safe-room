import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ParticleSystem } from '@/utils/particleSystem'

const rafCallbacks: FrameRequestCallback[] = []
const rafMock = vi.fn((cb: FrameRequestCallback) => {
  rafCallbacks.push(cb)
  return rafCallbacks.length
})
const cafMock = vi.fn()

const createContext = () => ({
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  createRadialGradient: vi.fn(() => ({
    addColorStop: vi.fn(),
  })),
  fill: vi.fn(),
  fillStyle: '',
  scale: vi.fn(),
})

const createCanvas = () =>
  ({
    width: 0,
    height: 0,
    getBoundingClientRect: () => ({ width: 200, height: 100 }),
    getContext: vi.fn(() => createContext()),
  } as unknown as HTMLCanvasElement)

describe('ParticleSystem', () => {
  beforeEach(() => {
    rafCallbacks.length = 0
    vi.stubGlobal('requestAnimationFrame', rafMock)
    vi.stubGlobal('cancelAnimationFrame', cafMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    rafMock.mockClear()
    cafMock.mockClear()
  })

  it('throws when canvas context is unavailable', () => {
    const canvas = {
      getContext: () => null,
    } as HTMLCanvasElement
    expect(
      () => new ParticleSystem({ canvas, colorPalette: ['#fff'] }),
    ).toThrow(/context is not available/)
  })

  it('starts, stops and destroys particle animation', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const canvas = createCanvas()
    const system = new ParticleSystem({
      canvas,
      colorPalette: ['#fff'],
      density: 0.4,
      speed: 0.2,
    })

    expect(addSpy).toHaveBeenCalledWith('resize', system.resize)

    system.start()
    expect(rafMock).toHaveBeenCalled()
    rafCallbacks.forEach((cb) => cb(0))

    system.stop()
    expect(cafMock).toHaveBeenCalled()

    system.destroy()
    expect(removeSpy).toHaveBeenCalledWith('resize', system.resize)
  })
})


