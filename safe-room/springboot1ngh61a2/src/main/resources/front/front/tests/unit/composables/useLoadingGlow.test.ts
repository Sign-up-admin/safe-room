import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest'
import { useLoadingGlow } from '@/composables/useLoadingGlow'

const gsapMock = vi.hoisted(() => ({
  to: vi.fn(() => ({ kill: vi.fn() })),
  kill: vi.fn(),
}))

vi.mock('gsap', () => ({
  default: gsapMock,
}))

describe('useLoadingGlow composable', () => {
  let mockElement: HTMLElement

  beforeEach(() => {
    mockElement = document.createElement('div')
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('应该有正确的默认配置', () => {
    const { isActive, start, stop } = useLoadingGlow()

    expect(isActive.value).toBe(false)
    expect(typeof start).toBe('function')
    expect(typeof stop).toBe('function')
  })

  it('应该能用自定义选项覆盖默认配置', () => {
    const customOptions = {
      duration: 2,
      intensity: 0.6,
      color: '#FF0000'
    }

    const { start } = useLoadingGlow(customOptions)

    start(mockElement)

    expect(gsapMock.to).toHaveBeenCalledWith(
      mockElement,
      expect.objectContaining({
        duration: 2,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: -1,
      })
    )
  })

  it('开始时应该设置isActive为true', () => {
    const { isActive, start } = useLoadingGlow()

    expect(isActive.value).toBe(false)

    start(mockElement)

    expect(isActive.value).toBe(true)
  })

  it('开始时应该使用正确的boxShadow值', () => {
    const { start } = useLoadingGlow({
      intensity: 0.5,
      color: '#00FF00'
    })

    start(mockElement)

    expect(gsapMock.to).toHaveBeenCalledWith(
      mockElement,
      expect.objectContaining({
        boxShadow: '0 0 35px #00FF0080', // 20 + 0.5 * 30 = 35, 0.5 * 255 = 127.5 ≈ 80
      })
    )
  })

  it('如果没有提供target元素，应该不执行任何操作', () => {
    const { start } = useLoadingGlow()

    start(null as any)

    expect(gsapMock.to).not.toHaveBeenCalled()
  })

  it('停止时应该设置isActive为false', () => {
    const { isActive, start, stop } = useLoadingGlow()

    start(mockElement)
    expect(isActive.value).toBe(true)

    stop()
    expect(isActive.value).toBe(false)
  })

  it('停止时应该终止动画', () => {
    const { start, stop } = useLoadingGlow()
    const mockAnimation = { kill: vi.fn() }

    gsapMock.to.mockReturnValue(mockAnimation)

    start(mockElement)
    stop()

    expect(mockAnimation.kill).toHaveBeenCalled()
  })

  it('重新开始时应该终止之前的动画', () => {
    const { start } = useLoadingGlow()
    const firstAnimation = { kill: vi.fn() }
    const secondAnimation = { kill: vi.fn() }

    gsapMock.to.mockReturnValueOnce(firstAnimation)
    gsapMock.to.mockReturnValueOnce(secondAnimation)

    start(mockElement)
    start(mockElement)

    expect(firstAnimation.kill).toHaveBeenCalled()
    expect(gsapMock.to).toHaveBeenCalledTimes(2)
  })

  it('应该在unmount时自动停止动画', () => {
    const { start, stop } = useLoadingGlow()
    const mockAnimation = { kill: vi.fn() }

    gsapMock.to.mockReturnValue(mockAnimation)

    start(mockElement)
    expect(mockAnimation.kill).not.toHaveBeenCalled()

    // 调用stop模拟unmount时的清理行为
    stop()
    expect(mockAnimation.kill).toHaveBeenCalled()
  })
})
