import { nextTick, onBeforeUnmount, ref } from 'vue'
import gsap from 'gsap'

export interface StepTransitionOptions {
  duration?: number
  ease?: string
  slideOffset?: number
  glowIntensity?: number
}

const defaultOptions: Required<StepTransitionOptions> = {
  duration: 0.5,
  ease: 'power3.out',
  slideOffset: 30,
  glowIntensity: 0.8,
}

export function useStepTransition(options: StepTransitionOptions = {}) {
  const resolved = { ...defaultOptions, ...options }
  const timeline = ref<gsap.core.Timeline | null>(null)

  const transition = async (
    fromStep: number,
    toStep: number,
    stepElements: HTMLElement[],
    contentElement?: HTMLElement,
  ) => {
    if (timeline.value) {
      timeline.value.kill()
    }

    await nextTick()

    timeline.value = gsap.timeline()

    // 步骤条动画：横向滑动和进度填充
    if (stepElements.length > 0 && fromStep >= 0 && toStep >= 0) {
      const fromEl = stepElements[fromStep]
      const toEl = stepElements[toStep]

      if (fromEl && toEl) {
        // 移除之前的发光效果
        stepElements.forEach(el => {
          gsap.set(el, {
            boxShadow: 'none',
            scale: 1,
          })
        })

        // 当前步骤发光和放大
        timeline.value.to(
          toEl,
          {
            scale: 1.05,
            boxShadow: `0 0 ${20 * resolved.glowIntensity}px rgba(253, 216, 53, ${resolved.glowIntensity})`,
            duration: resolved.duration * 0.6,
            ease: resolved.ease,
          },
          0,
        )

        // 已完成步骤保持高亮
        for (let i = 0; i < toStep; i++) {
          const completedEl = stepElements[i]
          if (completedEl) {
            timeline.value.to(
              completedEl,
              {
                opacity: 0.8,
                duration: resolved.duration * 0.3,
              },
              0,
            )
          }
        }
      }
    }

    // 内容区域横向滑动
    if (contentElement) {
      const direction = toStep > fromStep ? 1 : -1
      timeline.value.fromTo(
        contentElement,
        {
          x: direction * resolved.slideOffset,
          opacity: 0,
        },
        {
          x: 0,
          opacity: 1,
          duration: resolved.duration,
          ease: resolved.ease,
        },
        0,
      )
    }

    return timeline.value
  }

  const highlightStep = (stepIndex: number, stepElements: HTMLElement[]) => {
    if (stepIndex < 0 || stepIndex >= stepElements.length) return

    const stepEl = stepElements[stepIndex]
    if (!stepEl) return

    gsap.to(stepEl, {
      scale: 1.05,
      boxShadow: `0 0 ${20 * resolved.glowIntensity}px rgba(253, 216, 53, ${resolved.glowIntensity})`,
      duration: 0.3,
      ease: 'power2.out',
    })
  }

  const resetGlow = (stepElements: HTMLElement[]) => {
    gsap.set(stepElements, {
      scale: 1,
      boxShadow: 'none',
    })
  }

  onBeforeUnmount(() => {
    if (timeline.value) {
      timeline.value.kill()
      timeline.value = null
    }
  })

  return {
    transition,
    highlightStep,
    resetGlow,
    timeline,
  }
}
