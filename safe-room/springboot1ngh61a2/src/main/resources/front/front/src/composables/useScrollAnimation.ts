import { onBeforeUnmount } from 'vue'

export interface ScrollAnimationOptions {
  rootMargin?: string
  threshold?: number | number[]
  once?: boolean
}

export const useScrollAnimation = (
  target: () => Element | null,
  callback: (entry: IntersectionObserverEntry) => void,
  options: ScrollAnimationOptions = {},
) => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback(entry)
          if (options.once) {
            observer.disconnect()
          }
        }
      })
    },
    {
      rootMargin: options.rootMargin ?? '0px',
      threshold: options.threshold ?? 0.3,
    },
  )

  const observe = () => {
    const element = target()
    if (element) {
      observer.observe(element)
    }
  }

  const disconnect = () => observer.disconnect()

  onBeforeUnmount(() => {
    observer.disconnect()
  })

  return {
    observe,
    disconnect,
  }
}

