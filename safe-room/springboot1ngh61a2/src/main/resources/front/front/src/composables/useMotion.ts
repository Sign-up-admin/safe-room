import { onMounted, onBeforeUnmount, type Ref } from 'vue'
import gsap from 'gsap'

type MaybeElement = HTMLElement | null | undefined

export function resolveElement(target: MaybeElement | Ref<MaybeElement>): MaybeElement {
  if ((target as Ref<MaybeElement>)?.value !== undefined) {
    return (target as Ref<MaybeElement>).value ?? null
  }
  return target as MaybeElement
}

export function useHoverGlow(target: MaybeElement | Ref<MaybeElement>, options: { scale?: number } = {}) {
  const scale = options.scale ?? 1.02
  const handleEnter = () => {
    const el = resolveElement(target)
    if (!el) return
    gsap.to(el, { scale, boxShadow: '0 0 32px rgba(253, 216, 53, 0.35)', duration: 0.35, ease: 'power2.out' })
  }

  const handleLeave = () => {
    const el = resolveElement(target)
    if (!el) return
    gsap.to(el, { scale: 1, boxShadow: 'none', duration: 0.35, ease: 'power2.out' })
  }

  onMounted(() => {
    const el = resolveElement(target)
    el?.addEventListener('mouseenter', handleEnter)
    el?.addEventListener('mouseleave', handleLeave)
  })

  onBeforeUnmount(() => {
    const el = resolveElement(target)
    el?.removeEventListener('mouseenter', handleEnter)
    el?.removeEventListener('mouseleave', handleLeave)
  })
}

export function usePageTransition(container: MaybeElement | Ref<MaybeElement>) {
  onMounted(() => {
    const el = resolveElement(container)
    if (!el) return
    gsap.fromTo(
      el,
      { opacity: 0, y: 32 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
      },
    )
  })
}

export function useLoadingGlow(target: MaybeElement | Ref<MaybeElement>) {
  let tween: gsap.core.Tween | undefined

  onMounted(() => {
    const el = resolveElement(target)
    if (!el) return
    tween = gsap.to(el, {
      keyframes: [
        { boxShadow: '0 0 12px rgba(253, 216, 53, 0.2)', duration: 0.4 },
        { boxShadow: '0 0 32px rgba(253, 216, 53, 0.5)', duration: 0.4 },
      ],
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })
  })

  onBeforeUnmount(() => {
    tween?.kill()
  })
}
