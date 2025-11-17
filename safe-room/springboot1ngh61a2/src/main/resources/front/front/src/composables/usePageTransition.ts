import gsap from 'gsap'

export interface PageTransitionOptions {
  duration?: number
  offset?: number
  stagger?: number
  ease?: string
  opacity?: number
}

const defaultOptions: Required<PageTransitionOptions> = {
  duration: 0.65,
  offset: 30,
  stagger: 0.06,
  ease: 'power3.out',
  opacity: 0,
}

export const usePageTransition = (globalOptions: PageTransitionOptions = {}) => {
  const resolved = { ...defaultOptions, ...globalOptions }

  const enter = (targets: gsap.TweenTarget = '.page-enter', overrides: PageTransitionOptions = {}) => {
    const options = { ...resolved, ...overrides }
    return gsap.fromTo(
      targets,
      { opacity: options.opacity, y: options.offset },
      { opacity: 1, y: 0, duration: options.duration, ease: options.ease, stagger: options.stagger },
    )
  }

  const leave = (targets: gsap.TweenTarget = '.page-enter', overrides: PageTransitionOptions = {}) => {
    const options = { ...resolved, ...overrides }
    return gsap.to(targets, {
      opacity: 0,
      y: options.offset * -0.6,
      duration: options.duration * 0.8,
      ease: options.ease,
      stagger: options.stagger,
    })
  }

  const fadeIn = (targets: gsap.TweenTarget, overrides: PageTransitionOptions = {}) => {
    const options = { ...resolved, ...overrides }
    return gsap.fromTo(
      targets,
      { opacity: options.opacity },
      { opacity: 1, duration: options.duration * 0.8, ease: options.ease, stagger: options.stagger },
    )
  }

  return {
    enter,
    leave,
    fadeIn,
  }
}
