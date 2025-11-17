import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElDialog, ElButton, ElUpload } from 'element-plus'
import ImgComponent from '@/components/img.vue'

// Mock Element Plus components
vi.mock('element-plus', () => ({
  ElDialog: {
    name: 'ElDialog',
    template: '<div><slot /><slot name="footer" /></div>',
    props: ['title', 'modelValue', 'width'],
    emits: ['update:modelValue']
  },
  ElButton: {
    name: 'ElButton',
    template: '<button><slot /></button>',
    props: ['icon', 'size'],
    emits: ['click']
  },
  ElUpload: {
    name: 'ElUpload',
    template: '<div><slot /></div>',
    props: ['action', 'onSuccess', 'showFileList', 'accept'],
    emits: ['success']
  }
}))

// Mock navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn()
  },
  writable: true
})

// Mock getUserMedia for older browsers
Object.defineProperty(navigator, 'webkitGetUserMedia', {
  value: vi.fn(),
  writable: true
})

Object.defineProperty(navigator, 'mozGetUserMedia', {
  value: vi.fn(),
  writable: true
})

// Mock URL.createObjectURL
Object.defineProperty(window.URL, 'createObjectURL', {
  value: vi.fn(() => 'mock-object-url'),
  writable: true
})

// Mock canvas context
const mockContext = {
  drawImage: vi.fn(),
  clearRect: vi.fn()
}

const mockCanvas = {
  getContext: vi.fn(() => mockContext),
  toDataURL: vi.fn(() => 'data:image/png;base64,mockData'),
  width: 500,
  height: 400
}

// Mock document.getElementById
vi.spyOn(document, 'getElementById').mockImplementation((id: string) => {
  if (id === 'canvasCamera') return mockCanvas as any
  if (id === 'videoCamera') return { srcObject: { getTracks: vi.fn(() => [{ stop: vi.fn() }]) } } as any
  return null
})

describe('img.vue (CameraUpload)', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()

    wrapper = mount(ImgComponent, {
      global: {
        mocks: {
          $config: {
            baseUrl: '/api/'
          },
          $http: {
            post: vi.fn()
          },
          $notify: vi.fn()
        },
        stubs: {
          'el-dialog': true,
          'el-button': true,
          'el-upload': true
        }
      }
    })
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ElDialog' }).exists()).toBe(true)
  })

  it('initializes with correct default values', () => {
    const vm = wrapper.vm
    expect(vm.visible).toBe(false)
    expect(vm.loading).toBe(false)
    expect(vm.os).toBe(false)
    expect(vm.videoWidth).toBe(500)
    expect(vm.videoHeight).toBe(400)
  })

  it('computes action URL correctly', () => {
    const vm = wrapper.vm
    expect(vm.getActionUrl).toBe('/api/file/upload')
  })

  it('opens camera dialog when onTake is called', async () => {
    const vm = wrapper.vm
    await vm.onTake()

    expect(vm.visible).toBe(true)
    expect(vm.os).toBe(false)
  })

  it('closes dialog and uploads image on cancel', async () => {
    const vm = wrapper.vm
    const httpPostSpy = vi.spyOn(vm.$http, 'post').mockResolvedValue({
      data: { file: 'uploaded-file.jpg' }
    })

    vm.imgSrc = 'data:image/png;base64,testData'
    vm.visible = true

    await vm.onCancel()

    expect(httpPostSpy).toHaveBeenCalledWith('file/upload', expect.any(FormData))
    expect(vm.visible).toBe(false)
  })

  it('handles upload success', () => {
    const vm = wrapper.vm
    const emitSpy = vi.spyOn(vm, '$emit')

    vm.uploadSuccess({ file: 'test-file.jpg' })

    expect(vm.visible).toBe(false)
    expect(emitSpy).toHaveBeenCalledWith('imgChange', 'test-file.jpg')
  })

  it('converts base64 to file correctly', () => {
    const vm = wrapper.vm
    const base64Data = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

    const file = vm.base64toFile(base64Data, 'test')

    expect(file).toBeInstanceOf(File)
    expect(file.name).toBe('test.png')
    expect(file.type).toBe('image/png')
  })

  it('draws image from video to canvas', () => {
    const vm = wrapper.vm
    vm.thisVideo = { videoWidth: 500, videoHeight: 400 }
    vm.thisContext = mockContext
    vm.thisCancas = mockCanvas

    vm.drawImage()

    expect(mockContext.drawImage).toHaveBeenCalledWith(vm.thisVideo, 0, 0, 500, 400)
    expect(vm.imgSrc).toBe('data:image/png;base64,mockData')
  })

  it('resets canvas correctly', () => {
    const vm = wrapper.vm
    vm.imgSrc = 'data:image/png;base64,testData'

    vm.resetCanvas()

    expect(vm.imgSrc).toBe('')
    expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 500, 400)
  })

  it('stops navigator/camera correctly', () => {
    const vm = wrapper.vm
    const mockTrack = { stop: vi.fn() }
    const mockStream = { getTracks: vi.fn(() => [mockTrack]) }

    vm.thisVideo = { srcObject: mockStream }
    vm.os = false

    vm.stopNavigator()

    expect(mockStream.getTracks).toHaveBeenCalled()
    expect(mockTrack.stop).toHaveBeenCalled()
    expect(vm.os).toBe(true)
  })

  it('handles camera permission request', async () => {
    const vm = wrapper.vm
    const mockStream = { mock: 'stream' }

    // Mock successful getUserMedia
    navigator.mediaDevices.getUserMedia.mockResolvedValue(mockStream)

    // Mock video element
    const mockVideo = {
      srcObject: null,
      src: '',
      onloadedmetadata: null,
      play: vi.fn()
    }
    document.getElementById.mockReturnValue(mockVideo)

    await vm.getCompetence()

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      audio: false,
      video: {
        width: 500,
        height: 400,
        transform: 'scaleX(-1)'
      }
    })

    expect(mockVideo.srcObject).toBe(mockStream)
    expect(mockVideo.play).toHaveBeenCalled()
  })

  it('handles camera permission denied', async () => {
    const vm = wrapper.vm
    const notifySpy = vi.spyOn(vm, '$notify')

    navigator.mediaDevices.getUserMedia.mockRejectedValue(new Error('Permission denied'))

    await vm.getCompetence()

    expect(notifySpy).toHaveBeenCalledWith({
      title: '警告',
      message: '没有开启摄像头权限或浏览器版本不兼容.',
      type: 'warning'
    })
  })

  it('handles missing mediaDevices API', async () => {
    const vm = wrapper.vm

    // Temporarily remove mediaDevices
    const originalMediaDevices = navigator.mediaDevices
    delete (navigator as any).mediaDevices

    await vm.getCompetence()

    // Should not throw error
    expect(vm.os).toBe(false)

    // Restore
    navigator.mediaDevices = originalMediaDevices
  })

  it('clears canvas by id', () => {
    const vm = wrapper.vm
    const mockCanvasElement = {
      width: 100,
      height: 100,
      getContext: vi.fn(() => ({
        clearRect: vi.fn()
      }))
    }

    document.getElementById.mockReturnValue(mockCanvasElement as any)

    vm.clearCanvas('testCanvas')

    expect(mockCanvasElement.getContext).toHaveBeenCalledWith('2d')
    expect(mockCanvasElement.getContext('2d').clearRect).toHaveBeenCalledWith(0, 0, 100, 100)
  })

  it('handles form data creation for upload', () => {
    const vm = wrapper.vm
    vm.imgSrc = 'data:image/png;base64,testData'

    const formData = new FormData()
    formData.append('file', vm.base64toFile(vm.imgSrc))

    expect(formData.has('file')).toBe(true)
  })
})
