import { onBeforeUnmount } from 'vue'
import gsap from 'gsap'

export interface HoverGlowOptions {
  scale?: number
  duration?: number
  ease?: string
  shadow?: string
  borderColor?: string
}

const defaultShadow = '0 24px 48px rgba(253, 216, 53, 0.35)'

export const useHoverGlow = (globalOptions: HoverGlowOptions = {}) => {
  const disposers = new Map<HTMLElement, () => void>()

  const attach = (target: HTMLElement | null, options: HoverGlowOptions = {}) => {
    if (!target || disposers.has(target)) return

    const config = {
      scale: 1.03,
      duration: 0.35,
      ease: 'power3.out',
      shadow: defaultShadow,
      borderColor: '#FDD835',
      ...globalOptions,
      ...options,
    }

    const { borderColor } = getComputedStyle(target)
    const initialShadow = target.style.boxShadow
    const initialBorder = borderColor || 'rgba(255, 255, 255, 0.15)'

    const onEnter = () => {
      gsap.to(target, {
        scale: config.scale,
        boxShadow: config.shadow,
        borderColor: config.borderColor,
        duration: config.duration,
        ease: config.ease,
      })
    }

    const onLeave = () => {
      gsap.to(target, {
        scale: 1,
        boxShadow: initialShadow || 'var(--shadow-soft)',
        borderColor: initialBorder,
        duration: config.duration,
        ease: config.ease,
      })
    }

    target.addEventListener('mouseenter', onEnter)
    target.addEventListener('focus', onEnter)
    target.addEventListener('mouseleave', onLeave)
    target.addEventListener('blur', onLeave)

    disposers.set(target, () => {
      target.removeEventListener('mouseenter', onEnter)
      target.removeEventListener('focus', onEnter)
      target.removeEventListener('mouseleave', onLeave)
      target.removeEventListener('blur', onLeave)
    })
  }

  const detach = (target: HTMLElement | null) => {
    if (!target) return
    const disposer = disposers.get(target)
    disposer?.()
    disposers.delete(target)
  }

  onBeforeUnmount(() => {
    disposers.forEach(dispose => dispose())
    disposers.clear()
  })

  return {
    attach,
    detach,
  }
}
