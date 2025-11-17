import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import RotateVerify from '../../../../src/components/common/RotateVerify.vue'

// Mock canvas APIs
const mockCanvasContext = {
  beginPath: vi.fn(),
  arc: vi.fn(),
  closePath: vi.fn(),
  clip: vi.fn(),
  save: vi.fn(),
  clearRect: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  drawImage: vi.fn(),
  restore: vi.fn(),
}

const mockCanvasElement = {
  getContext: vi.fn(() => mockCanvasContext),
  width: 200,
  height: 200,
}

const mockImageElement = {
  setAttribute: vi.fn(),
  onload: null as any,
  src: '',
  style: {} as any,
}

Object.defineProperty(document, 'createElement', {
  writable: true,
  value: vi.fn((tagName: string) => {
    if (tagName === 'canvas') {
      return {
        ...mockCanvasElement,
        getBoundingClientRect: vi.fn(() => ({ width: 200, height: 200, left: 0, top: 0 })),
      }
    }
    if (tagName === 'img') {
      return { ...mockImageElement }
    }
    return {
      style: {},
      setAttribute: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }
  }),
})

Object.defineProperty(document, 'getElementById', {
  writable: true,
  value: vi.fn(() => null),
})

describe('RotateVerify Component', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.useRealTimers()
  })

  describe('Component Initialization', () => {
    it('should render correctly with default props', () => {
      wrapper = mount(RotateVerify)

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('.rotateverify-contaniner').exists()).toBe(true)
      expect(wrapper.find('.rotate-can').exists()).toBe(true)
      expect(wrapper.find('.slide-drag-btn').exists()).toBe(true)
    })

    it('should accept custom props', () => {
      wrapper = mount(RotateVerify, {
        props: {
          initText: '请拖动滑块',
          slideAreaNum: 15,
        },
      })

      expect(wrapper.vm.initText).toBe('请拖动滑块')
      expect(wrapper.vm.slideAreaNum).toBe(15)
    })

    it('should initialize canvas and image on mount', async () => {
      wrapper = mount(RotateVerify)

      await nextTick()

      // Should create image element and set up canvas
      expect(document.createElement).toHaveBeenCalledWith('img')
      expect(mockCanvasElement.getContext).toHaveBeenCalledWith('2d')
    })
  })

  describe('Image Loading and Canvas Drawing', () => {
    it('should load and draw image when image loads', async () => {
      wrapper = mount(RotateVerify)

      await nextTick()

      // Trigger image onload
      const imgElement = document.createElement('img') as any
      imgElement.onload()

      expect(mockCanvasContext.beginPath).toHaveBeenCalled()
      expect(mockCanvasContext.arc).toHaveBeenCalled()
      expect(mockCanvasContext.drawImage).toHaveBeenCalled()
    })

    it('should generate random rotation angle', async () => {
      // Mock Math.random to return consistent values
      const originalRandom = Math.random
      Math.random = vi.fn(() => 0.5) // This gives angle 225 degrees

      wrapper = mount(RotateVerify)
      await nextTick()

      expect(wrapper.vm.randRot).toBe(225)
      expect(wrapper.vm.sucLenMin).toBeDefined()
      expect(wrapper.vm.sucLenMax).toBeDefined()

      Math.random = originalRandom
    })
  })

  describe('Mouse Interaction', () => {
    let slideBtn: any
    let slideWrap: any

    beforeEach(async () => {
      wrapper = mount(RotateVerify)
      await nextTick()

      slideBtn = wrapper.find('.control-btn')
      slideWrap = wrapper.find('.slide-drag-wrap')
    })

    it('should handle mouse down event', async () => {
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 50,
      })

      await slideBtn.trigger('mousedown', mouseDownEvent)

      expect(wrapper.vm.ifThisMousedown).toBe(true)
      expect(slideBtn.classes()).toContain('control-btn-active')
    })

    it('should handle mouse move event', async () => {
      // First trigger mousedown
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 50,
        clientY: 50,
      })
      await slideBtn.trigger('mousedown', mouseDownEvent)

      // Then trigger mousemove
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 150,
        clientY: 50,
      })

      // Mock getBoundingClientRect
      const mockRect = { left: 50, width: 200 }
      slideBtn.element.getBoundingClientRect = vi.fn(() => mockRect)
      slideWrap.element.offsetWidth = 200
      slideBtn.element.offsetWidth = 40

      // Trigger mousemove on document
      document.dispatchEvent(mouseMoveEvent)

      expect(mockCanvasContext.clearRect).toHaveBeenCalled()
      expect(mockCanvasContext.rotate).toHaveBeenCalled()
    })

    it('should handle mouse up and verify success', async () => {
      // Setup success condition
      wrapper.vm.sucLenMin = 50
      wrapper.vm.sucLenMax = 150
      wrapper.vm.disLf = 100 // Within success range

      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 50,
        clientY: 50,
      })
      await slideBtn.trigger('mousedown', mouseDownEvent)

      // Trigger mouseup
      const mouseUpEvent = new MouseEvent('mouseup')
      document.dispatchEvent(mouseUpEvent)

      expect(wrapper.vm.verifyState).toBe(true)
      expect(wrapper.emitted('success')).toBeTruthy()
      expect(wrapper.emitted('success')[0]).toEqual([true])
    })

    it('should handle verification failure', async () => {
      // Setup failure condition
      wrapper.vm.sucLenMin = 50
      wrapper.vm.sucLenMax = 150
      wrapper.vm.disLf = 200 // Outside success range

      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 50,
        clientY: 50,
      })
      await slideBtn.trigger('mousedown', mouseDownEvent)

      // Trigger mouseup
      const mouseUpEvent = new MouseEvent('mouseup')
      document.dispatchEvent(mouseUpEvent)

      expect(wrapper.vm.verifyState).toBe(false)
      expect(slideWrap.classes()).toContain('control-horizontal')
    })
  })

  describe('Touch Interaction', () => {
    it('should handle touch events', async () => {
      wrapper = mount(RotateVerify)
      await nextTick()

      const slideBtn = wrapper.find('.control-btn')

      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [{ pageX: 50, pageY: 50 } as Touch],
      })

      await slideBtn.trigger('touchstart', touchStartEvent)

      expect(wrapper.vm.touchX).toBe(50)
      expect(slideBtn.classes()).toContain('control-btn-active')
    })
  })

  describe('Component Methods', () => {
    it('should refresh slide correctly', async () => {
      wrapper = mount(RotateVerify)
      await nextTick()

      const originalRandRot = wrapper.vm.randRot

      wrapper.vm.refreshSlide()

      expect(wrapper.vm.disLf).toBe(0)
      expect(wrapper.vm.verifyState).toBe(false)
    })

    it('should reset slide correctly', async () => {
      wrapper = mount(RotateVerify, {
        props: {
          initText: 'Custom Text',
        },
      })
      await nextTick()

      wrapper.vm.resetSlide()

      expect(wrapper.vm.disLf).toBe(0)
      expect(wrapper.vm.verifyState).toBe(false)
      expect(wrapper.vm.slideDragBtn.style.left).toBe('0px')
    })
  })

  describe('CSS Injection', () => {
    it('should inject styles on mount', async () => {
      // Mock document.getElementById to return null (styles not injected yet)
      const originalGetElementById = document.getElementById
      document.getElementById = vi.fn(() => null)

      wrapper = mount(RotateVerify)
      await nextTick()

      expect(document.createElement).toHaveBeenCalledWith('style')
      expect(document.head?.appendChild).toHaveBeenCalled()

      document.getElementById = originalGetElementById
    })
  })

  describe('Props Watching', () => {
    it('should re-initialize when slideImage prop changes', async () => {
      wrapper = mount(RotateVerify, {
        props: {
          slideImage: 'image1.jpg',
        },
      })
      await nextTick()

      const initCanvasImgSpy = vi.spyOn(wrapper.vm, 'initCanvasImg')

      await wrapper.setProps({ slideImage: 'image2.jpg' })

      expect(initCanvasImgSpy).toHaveBeenCalled()
    })
  })
})
