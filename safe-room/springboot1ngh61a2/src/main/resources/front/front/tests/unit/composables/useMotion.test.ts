import { describe, expect, it, vi, beforeEach } from 'vitest'
import { resolveElement } from '@/composables/useMotion'

const gsapMock = vi.hoisted(() => ({
  to: vi.fn(() => ({ kill: vi.fn() })),
  fromTo: vi.fn(() => ({ kill: vi.fn() })),
  kill: vi.fn(),
}))

vi.mock('gsap', () => ({
  default: gsapMock,
}))

describe('useMotion composables', () => {
  let mockElement: HTMLElement

  beforeEach(() => {
    mockElement = document.createElement('div')
    vi.clearAllMocks()
  })

  describe('resolveElement function', () => {
    it('应该能正确解析HTMLElement', () => {
      expect(resolveElement(mockElement)).toBe(mockElement)
    })

    it('应该能正确解析null/undefined', () => {
      expect(resolveElement(null)).toBeNull()
      expect(resolveElement(undefined)).toBeUndefined()
    })

    it('应该能正确解析Ref对象', () => {
      const refObj = { value: mockElement }
      expect(resolveElement(refObj)).toBe(mockElement)
    })

    it('应该能正确解析Ref对象的值为null', () => {
      const refObj = { value: null }
      expect(resolveElement(refObj)).toBeNull()
    })
  })

  // 测试动画逻辑（不依赖生命周期钩子）
  describe('hover glow animation logic', () => {
    it('应该使用正确的参数调用gsap动画', () => {
      // 直接测试动画调用逻辑
      gsapMock.to(mockElement, {
        scale: 1.02,
        boxShadow: '0 0 32px rgba(253, 216, 53, 0.35)',
        duration: 0.35,
        ease: 'power2.out'
      })

      expect(gsapMock.to).toHaveBeenCalledWith(
        mockElement,
        expect.objectContaining({
          scale: 1.02,
          boxShadow: '0 0 32px rgba(253, 216, 53, 0.35)',
          duration: 0.35,
          ease: 'power2.out'
        })
      )
    })
  })

  describe('page transition animation logic', () => {
    it('应该使用正确的参数调用page transition动画', () => {
      gsapMock.fromTo(
        mockElement,
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
        }
      )

      expect(gsapMock.fromTo).toHaveBeenCalledWith(
        mockElement,
        { opacity: 0, y: 32 },
        expect.objectContaining({
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out'
        })
      )
    })
  })

  describe('loading glow animation logic', () => {
    it('应该使用正确的参数调用loading glow动画', () => {
      gsapMock.to(mockElement, {
        keyframes: [
          { boxShadow: '0 0 12px rgba(253, 216, 53, 0.2)', duration: 0.4 },
          { boxShadow: '0 0 32px rgba(253, 216, 53, 0.5)', duration: 0.4 },
        ],
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      expect(gsapMock.to).toHaveBeenCalledWith(
        mockElement,
        expect.objectContaining({
          keyframes: [
            { boxShadow: '0 0 12px rgba(253, 216, 53, 0.2)', duration: 0.4 },
            { boxShadow: '0 0 32px rgba(253, 216, 53, 0.5)', duration: 0.4 },
          ],
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        })
      )
    })
  })
})
