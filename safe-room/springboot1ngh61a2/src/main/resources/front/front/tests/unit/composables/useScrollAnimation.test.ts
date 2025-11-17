import { describe, expect, it, vi } from 'vitest'

const observers: IntersectionObserverStub[] = []

class IntersectionObserverStub {
  callback: (entries: IntersectionObserverEntry[]) => void
  options?: IntersectionObserverInit
  constructor(callback: (entries: IntersectionObserverEntry[]) => void, options?: IntersectionObserverInit) {
    this.callback = callback
    this.options = options
    observers.push(this)
  }
  observe = vi.fn()
  disconnect = vi.fn()
}

;(globalThis as any).IntersectionObserver = IntersectionObserverStub

import { useScrollAnimation } from '@/composables/useScrollAnimation'

describe('useScrollAnimation composable', () => {
  it('observes targets and triggers callback once', () => {
    const target = document.createElement('div')
    document.body.appendChild(target)
    const callback = vi.fn()
    const { observe, disconnect } = useScrollAnimation(() => target, callback, { once: true })

    observe()
    expect(observers.at(-1)?.observe).toHaveBeenCalled()

    const currentObserver = observers.at(-1)!
    currentObserver.callback([{ isIntersecting: true } as IntersectionObserverEntry])
    expect(callback).toHaveBeenCalled()
    disconnect()
    expect(currentObserver.disconnect).toHaveBeenCalled()
  })
})


