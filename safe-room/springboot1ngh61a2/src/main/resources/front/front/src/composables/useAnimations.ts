import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import gsap from 'gsap'

// =================================
// 基础动画系统
// =================================

interface TimelineMap {
  [key: string]: gsap.core.Timeline
}

export const useAnimations = () => {
  const timelines: TimelineMap = {}

  const registerTimeline = (key: string, config?: gsap.TimelineVars) => {
    if (timelines[key]) {
      timelines[key].kill()
    }

    timelines[key] = gsap.timeline({
      defaults: { ease: 'power3.out' },
      ...config,
    })

    return timelines[key]
  }

  const play = (key: string) => {
    timelines[key]?.play()
  }

  const pause = (key: string) => {
    timelines[key]?.pause()
  }

  const kill = (key: string) => {
    timelines[key]?.kill()
    delete timelines[key]
  }

  onUnmounted(() => {
    Object.values(timelines).forEach(timeline => timeline.kill())
  })

  return {
    registerTimeline,
    play,
    pause,
    kill,
  }
}

// =================================
// Hover Glow 动效
// =================================

interface HoverGlowOptions {
  scale?: number
  glowColor?: string
  glowIntensity?: number
  duration?: number
}

export const useHoverGlow = (elementRef: Ref<HTMLElement | null>, options: HoverGlowOptions = {}) => {
  const { scale = 1.02, glowColor = 'var(--color-primary)', glowIntensity = 0.3, duration = 0.3 } = options

  let originalBoxShadow = ''
  let originalTransform = ''

  const applyGlow = () => {
    if (!elementRef.value) return

    const element = elementRef.value
    originalBoxShadow = element.style.boxShadow || ''
    originalTransform = element.style.transform || ''

    gsap.to(element, {
      duration,
      ease: 'power2.out',
      scale,
      boxShadow: `0 0 20px rgba(${glowColor}, ${glowIntensity})`,
      y: -4,
    })
  }

  const removeGlow = () => {
    if (!elementRef.value) return

    const element = elementRef.value
    gsap.to(element, {
      duration,
      ease: 'power2.out',
      scale: 1,
      boxShadow: originalBoxShadow,
      y: 0,
    })
  }

  const setupHoverListeners = () => {
    if (!elementRef.value) return

    const element = elementRef.value
    element.addEventListener('mouseenter', applyGlow)
    element.addEventListener('mouseleave', removeGlow)
  }

  const removeHoverListeners = () => {
    if (!elementRef.value) return

    const element = elementRef.value
    element.removeEventListener('mouseenter', applyGlow)
    element.removeEventListener('mouseleave', removeGlow)
  }

  onMounted(() => {
    setupHoverListeners()
  })

  onUnmounted(() => {
    removeHoverListeners()
  })

  return {
    applyGlow,
    removeGlow,
    setupHoverListeners,
    removeHoverListeners,
  }
}

// =================================
// Page Transition 动效
// =================================

interface PageTransitionOptions {
  enterDuration?: number
  exitDuration?: number
  stagger?: number
  enterDirection?: 'up' | 'down' | 'left' | 'right' | 'fade'
  exitDirection?: 'up' | 'down' | 'left' | 'right' | 'fade'
}

export const usePageTransition = (containerRef: Ref<HTMLElement | null>, options: PageTransitionOptions = {}) => {
  const {
    enterDuration = 0.6,
    exitDuration = 0.4,
    stagger = 0.1,
    enterDirection = 'up',
    exitDirection = 'down',
  } = options

  const isTransitioning = ref(false)

  const getEnterAnimation = (element: HTMLElement, index: number) => {
    const delay = index * stagger

    switch (enterDirection) {
      case 'up':
        return gsap.fromTo(
          element,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: enterDuration, delay, ease: 'power3.out' },
        )
      case 'down':
        return gsap.fromTo(
          element,
          { y: -50, opacity: 0 },
          { y: 0, opacity: 1, duration: enterDuration, delay, ease: 'power3.out' },
        )
      case 'left':
        return gsap.fromTo(
          element,
          { x: -50, opacity: 0 },
          { x: 0, opacity: 1, duration: enterDuration, delay, ease: 'power3.out' },
        )
      case 'right':
        return gsap.fromTo(
          element,
          { x: 50, opacity: 0 },
          { x: 0, opacity: 1, duration: enterDuration, delay, ease: 'power3.out' },
        )
      case 'fade':
      default:
        return gsap.fromTo(element, { opacity: 0 }, { opacity: 1, duration: enterDuration, delay, ease: 'power3.out' })
    }
  }

  const getExitAnimation = (element: HTMLElement) => {
    switch (exitDirection) {
      case 'up':
        return gsap.to(element, { y: -50, opacity: 0, duration: exitDuration, ease: 'power3.in' })
      case 'down':
        return gsap.to(element, { y: 50, opacity: 0, duration: exitDuration, ease: 'power3.in' })
      case 'left':
        return gsap.to(element, { x: -50, opacity: 0, duration: exitDuration, ease: 'power3.in' })
      case 'right':
        return gsap.to(element, { x: 50, opacity: 0, duration: exitDuration, ease: 'power3.in' })
      case 'fade':
      default:
        return gsap.to(element, { opacity: 0, duration: exitDuration, ease: 'power3.in' })
    }
  }

  const animateEnter = (selector = '.animate-item') => {
    if (!containerRef.value || isTransitioning.value) return

    isTransitioning.value = true
    const elements = containerRef.value.querySelectorAll(selector)

    elements.forEach((element, index) => {
      getEnterAnimation(element as HTMLElement, index)
    })

    // Reset transitioning flag after animation
    setTimeout(
      () => {
        isTransitioning.value = false
      },
      (enterDuration + elements.length * stagger) * 1000,
    )
  }

  const animateExit = (selector = '.animate-item') => {
    if (!containerRef.value || isTransitioning.value) return

    isTransitioning.value = true
    const elements = containerRef.value.querySelectorAll(selector)

    elements.forEach(element => {
      getExitAnimation(element as HTMLElement)
    })

    // Reset transitioning flag after animation
    setTimeout(() => {
      isTransitioning.value = false
    }, exitDuration * 1000)
  }

  return {
    isTransitioning,
    animateEnter,
    animateExit,
  }
}

// =================================
// Loading Glow 动效
// =================================

interface LoadingGlowOptions {
  glowColor?: string
  glowIntensity?: number
  pulseDuration?: number
  scale?: number
}

export const useLoadingGlow = (elementRef: Ref<HTMLElement | null>, options: LoadingGlowOptions = {}) => {
  const { glowColor = 'var(--color-primary)', glowIntensity = 0.6, pulseDuration = 1.5, scale = 1.05 } = options

  let animation: gsap.core.Timeline | null = null

  const startGlow = () => {
    if (!elementRef.value) return

    const element = elementRef.value

    animation = gsap.timeline({ repeat: -1, yoyo: true })
    animation.to(element, {
      duration: pulseDuration,
      ease: 'power2.inOut',
      boxShadow: `0 0 30px rgba(${glowColor}, ${glowIntensity})`,
      scale,
      yoyo: true,
      repeat: 1,
    })
  }

  const stopGlow = () => {
    if (animation) {
      animation.kill()
      animation = null
    }

    if (elementRef.value) {
      gsap.to(elementRef.value, {
        duration: 0.3,
        boxShadow: 'none',
        scale: 1,
        ease: 'power2.out',
      })
    }
  }

  onUnmounted(() => {
    stopGlow()
  })

  return {
    startGlow,
    stopGlow,
  }
}

// =================================
// Calendar Animation 动效
// =================================

export const useCalendarAnimation = (calendarRef: Ref<HTMLElement | null>) => {
  const animateCalendarOpen = () => {
    if (!calendarRef.value) return

    const calendar = calendarRef.value
    gsap.fromTo(
      calendar,
      { scale: 0.8, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' },
    )
  }

  const animateCalendarClose = () => {
    if (!calendarRef.value) return

    const calendar = calendarRef.value
    gsap.to(calendar, {
      scale: 0.8,
      opacity: 0,
      y: 20,
      duration: 0.3,
      ease: 'power2.in',
    })
  }

  const animateDateSelect = (selectedElement: HTMLElement) => {
    gsap.to(selectedElement, {
      scale: 1.1,
      duration: 0.15,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
    })
  }

  return {
    animateCalendarOpen,
    animateCalendarClose,
    animateDateSelect,
  }
}

// =================================
// Stepper Animation 动效
// =================================

export const useStepperAnimation = (stepperRef: Ref<HTMLElement | null>) => {
  const animateStepChange = (fromStep: number, toStep: number) => {
    if (!stepperRef.value) return

    const stepper = stepperRef.value
    const stepElements = stepper.querySelectorAll('.step-item')

    // Animate current step out
    if (stepElements[fromStep]) {
      gsap.to(stepElements[fromStep], {
        scale: 0.9,
        opacity: 0.5,
        duration: 0.3,
        ease: 'power2.out',
      })
    }

    // Animate new step in
    if (stepElements[toStep]) {
      gsap.fromTo(
        stepElements[toStep],
        { scale: 0.9, opacity: 0.5 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' },
      )
    }
  }

  const animateStepComplete = (stepElement: HTMLElement) => {
    gsap.to(stepElement, {
      scale: 1.05,
      duration: 0.2,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
    })
  }

  return {
    animateStepChange,
    animateStepComplete,
  }
}

// =================================
// Card Hover Animation 动效
// =================================

export const useCardHoverAnimation = (cardRef: Ref<HTMLElement | null>) => {
  const animateHover = (isHover: boolean) => {
    if (!cardRef.value) return

    const card = cardRef.value
    if (isHover) {
      gsap.to(card, {
        y: -8,
        scale: 1.02,
        boxShadow: 'var(--shadow-glow-yellow)',
        duration: 0.3,
        ease: 'power2.out',
      })
    } else {
      gsap.to(card, {
        y: 0,
        scale: 1,
        boxShadow: 'var(--shadow-card)',
        duration: 0.3,
        ease: 'power2.out',
      })
    }
  }

  return {
    animateHover,
  }
}
