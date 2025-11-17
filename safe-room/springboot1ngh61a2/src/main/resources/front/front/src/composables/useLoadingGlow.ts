import { onBeforeUnmount, ref } from 'vue'
import gsap from 'gsap'

export interface LoadingGlowOptions {
  duration?: number
  intensity?: number
  color?: string
}

const defaultOptions: Required<LoadingGlowOptions> = {
  duration: 1.5,
  intensity: 0.4,
  color: '#FDD835',
}

export const useLoadingGlow = (options: LoadingGlowOptions = {}) => {
  const config = { ...defaultOptions, ...options }
  const isActive = ref(false)
  let animation: gsap.core.Tween | null = null

  const start = (target: HTMLElement | null, overrides: LoadingGlowOptions = {}) => {
    if (!target) return

    const finalConfig = { ...config, ...overrides }
    isActive.value = true

    if (animation) {
      animation.kill()
    }

    animation = gsap.to(target, {
      boxShadow: `0 0 ${20 + finalConfig.intensity * 30}px ${finalConfig.color}${Math.round(finalConfig.intensity * 255)
        .toString(16)
        .padStart(2, '0')}`,
      duration: finalConfig.duration,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: -1,
    })
  }

  const stop = () => {
    if (animation) {
      animation.kill()
      animation = null
    }
    isActive.value = false
  }

  onBeforeUnmount(() => {
    stop()
  })

  return {
    isActive,
    start,
    stop,
  }
}
