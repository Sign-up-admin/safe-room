import { nextTick, onBeforeUnmount, ref } from 'vue'
import gsap from 'gsap'
import { useParticleSystem } from './useParticleSystem'

export interface SuccessAnimationOptions {
  duration?: number
  particleCount?: number
  particleColor?: string
  checkmarkSize?: number
}

const defaultOptions: Required<SuccessAnimationOptions> = {
  duration: 1.0,
  particleCount: 30,
  particleColor: '#fdd835',
  checkmarkSize: 80,
}

export function useSuccessAnimation(options: SuccessAnimationOptions = {}) {
  const resolved = { ...defaultOptions, ...options }
  const timeline = ref<gsap.core.Timeline | null>(null)
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  const checkmarkRef = ref<HTMLElement | null>(null)

  const play = async (
    containerElement: HTMLElement,
    checkmarkElement?: HTMLElement,
    canvasElement?: HTMLCanvasElement,
  ) => {
    if (timeline.value) {
      timeline.value.kill()
    }

    await nextTick()

    checkmarkRef.value = checkmarkElement || null
    canvasRef.value = canvasElement || null

    timeline.value = gsap.timeline()

    // 粒子爆发效果
    if (canvasElement && containerElement) {
      // 设置canvas尺寸
      const rect = containerElement.getBoundingClientRect()
      canvasElement.width = rect.width
      canvasElement.height = rect.height
      canvasElement.style.width = `${rect.width}px`
      canvasElement.style.height = `${rect.height}px`

      const particleSystem = useParticleSystem({
        canvas: canvasElement,
        colorPalette: [resolved.particleColor],
        density: 0.8,
        speed: 0.6,
      })

      particleSystem.mount()

      // 粒子动画
      timeline.value.to(
        canvasElement,
        {
          opacity: 1,
          scale: 1,
          duration: 0.2,
          ease: 'power2.out',
        },
        0,
      )

      timeline.value.to(
        canvasElement,
        {
          opacity: 0,
          scale: 1.2,
          duration: 0.6,
          ease: 'power2.in',
          onComplete: () => {
            particleSystem.destroy()
          },
        },
        0.4,
      )
    }

    // 勾选动画
    if (checkmarkElement) {
      const path = checkmarkElement.querySelector('path')
      if (path) {
        const pathLength = path.getTotalLength()
        path.style.strokeDasharray = `${pathLength}`
        path.style.strokeDashoffset = `${pathLength}`

        timeline.value.to(
          path,
          {
            strokeDashoffset: 0,
            duration: 0.5,
            ease: 'power2.out',
          },
          0.2,
        )
      } else {
        // 如果没有SVG路径，使用缩放动画
        gsap.set(checkmarkElement, {
          scale: 0,
          rotation: -180,
        })

        timeline.value.to(
          checkmarkElement,
          {
            scale: 1,
            rotation: 0,
            duration: 0.5,
            ease: 'back.out(1.7)',
          },
          0.2,
        )
      }

      // 发光效果
      timeline.value.to(
        checkmarkElement,
        {
          boxShadow: '0 0 40px rgba(253, 216, 53, 0.8)',
          duration: 0.3,
          ease: 'power2.out',
        },
        0.2,
      )
    }

    // 容器缩放和淡入
    gsap.set(containerElement, {
      scale: 0.8,
      opacity: 0,
    })

    timeline.value.to(
      containerElement,
      {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        ease: 'back.out(1.2)',
      },
      0,
    )

    return timeline.value
  }

  const createCheckmarkSVG = (size: number = resolved.checkmarkSize): string => {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" fill="none" stroke="${resolved.particleColor}" stroke-width="3" opacity="0.3"/>
        <path
          d="M 30 50 L 45 65 L 70 35"
          fill="none"
          stroke="${resolved.particleColor}"
          stroke-width="6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    `
  }

  onBeforeUnmount(() => {
    if (timeline.value) {
      timeline.value.kill()
      timeline.value = null
    }
  })

  return {
    play,
    createCheckmarkSVG,
    timeline,
  }
}

