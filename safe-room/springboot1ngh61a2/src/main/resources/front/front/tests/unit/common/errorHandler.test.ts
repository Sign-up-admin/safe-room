import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanupTest } from '../../utils/test-helpers'

const mockHttpPost = vi.fn<[], Promise<void>>().mockResolvedValue()

const importErrorHandler = async () => {
  vi.resetModules()
  return await import('@/common/errorHandler')
}

const setupErrorHandler = async () => {
  const module = await importErrorHandler()
  module.__setErrorReporterHttpClient({
    post: mockHttpPost,
  })
  return module
}

describe('common/errorHandler', () => {
  beforeEach(() => {
    // Clear localStorage - now available with jsdom
    localStorage.clear()
    mockHttpPost.mockClear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
    cleanupTest()
  })

  it('stores vue component errors with component metadata', async () => {
    const { vueErrorHandler, getStoredErrors, clearStoredErrors } = await setupErrorHandler()
    clearStoredErrors()

    vueErrorHandler(
      new Error('render boom'),
      { type: { name: 'HeroSection' } } as any,
      'render',
    )

    const errors = getStoredErrors()
    expect(errors).toHaveLength(1)
    expect(errors[0].type).toBe('vue')
    expect(errors[0].message).toContain('HeroSection')
  })

  it('deduplicates identical errors within 5 seconds', async () => {
    const { vueErrorHandler, getStoredErrors, clearStoredErrors } = await setupErrorHandler()
    clearStoredErrors()

    const err = new Error('same issue')
    vueErrorHandler(err, null, 'render')
    vueErrorHandler(err, null, 'render')

    expect(getStoredErrors()).toHaveLength(1)

    vi.advanceTimersByTime(6000)
    vueErrorHandler(err, null, 'render')

    expect(getStoredErrors()).toHaveLength(2)
  })

  it('handles unhandled promise rejections and prevents default handling', async () => {
    const { unhandledRejectionHandler, getStoredErrors, clearStoredErrors } =
      await setupErrorHandler()
    clearStoredErrors()

    const preventDefault = vi.fn()
    const event = {
      preventDefault,
      reason: 'network fail',
    } as unknown as PromiseRejectionEvent

    unhandledRejectionHandler(event)

    expect(preventDefault).toHaveBeenCalled()
    const errors = getStoredErrors()
    expect(errors[0].type).toBe('promise')
    expect(errors[0].message).toContain('network fail')
  })

  it('captures global ErrorEvent metadata', async () => {
    const { globalErrorHandler, getStoredErrors, clearStoredErrors } = await setupErrorHandler()
    clearStoredErrors()

    const evt = new ErrorEvent('error', {
      message: 'script crash',
      filename: '/foo.js',
      lineno: 10,
      colno: 20,
      error: new Error('script crash'),
    })

    globalErrorHandler(evt)

    const [errorInfo] = getStoredErrors()
    expect(errorInfo.source).toBe('/foo.js')
    expect(errorInfo.lineno).toBe(10)
    expect(errorInfo.colno).toBe(20)
  })

  it('records resource loading errors for media targets', async () => {
    const { resourceErrorHandler, getStoredErrors, clearStoredErrors } = await setupErrorHandler()
    clearStoredErrors()

    const img = document.createElement('img')
    img.src = 'https://cdn.example.com/missing.png'
    const event = new Event('error')
    Object.defineProperty(event, 'target', { value: img })

    resourceErrorHandler(event as unknown as ErrorEvent)

    const [errorInfo] = getStoredErrors()
    expect(errorInfo.type).toBe('resource')
    expect(errorInfo.message).toContain('missing.png')
  })

  it('exposes helpers to read and clear stored errors', async () => {
    const { vueErrorHandler, getStoredErrors, clearStoredErrors } = await setupErrorHandler()
    clearStoredErrors()

    vueErrorHandler(new Error('first'), null, 'render')
    expect(getStoredErrors()).toHaveLength(1)

    clearStoredErrors()
    expect(getStoredErrors()).toHaveLength(0)
  })

  it('flushes batched errors to server when queue reaches batch size', async () => {
    const {
      vueErrorHandler,
      getStoredErrors,
      clearStoredErrors,
    } = await setupErrorHandler()
    clearStoredErrors()

    const onlineSpy = vi.spyOn(window.navigator, 'onLine', 'get').mockReturnValue(true)

    for (let i = 0; i < 10; i++) {
      vueErrorHandler(new Error(`error-${i}`), null, `info-${i}`)
    }

    expect(getStoredErrors()).toHaveLength(10)

    await vi.waitFor(() => {
      expect(mockHttpPost).toHaveBeenCalledTimes(10)
    })

    onlineSpy.mockRestore()
  })
})


