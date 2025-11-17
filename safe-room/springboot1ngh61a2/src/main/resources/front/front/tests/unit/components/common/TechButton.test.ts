import { describe, expect, it, vi } from 'vitest'

vi.mock('vue', async () => {
  const actual = await vi.importActual<typeof import('vue')>('vue')
  const originalRenderSlot = actual.renderSlot
  return {
    ...actual,
    renderSlot: (...args: Parameters<typeof originalRenderSlot>) => {
      const [slots, name, props = {}, fallback] = args
      if (!actual.getCurrentInstance?.()) {
        const slot = slots?.[name]
        const children = slot ? slot(props) : fallback ? fallback() : []
        return actual.h(actual.Fragment, null, children)
      }
      return originalRenderSlot(...args)
    },
  }
})

import { mount } from '@vue/test-utils'
import { h } from 'vue'
import TechButton from '@/components/common/TechButton.vue'

const mountButton = (props = {}, options = {}) =>
  mount(TechButton, {
    props,
    slots: {
      default: () => h('span', '立即预约'),
      icon: () => h('span', { class: 'icon-slot' }),
    },
    ...options,
  })

describe('TechButton', () => {
  it('renders all variants, sizes and block state with passed attrs', () => {
    const variants = ['primary', 'outline', 'ghost', 'text'] as const
    variants.forEach((variant) => {
      const wrapper = mountButton({ variant })
      expect(wrapper.classes()).toContain(`tech-button--${variant}`)
    })

    const sizes = ['sm', 'md', 'lg'] as const
    sizes.forEach((size) => {
      const wrapper = mountButton({ size })
      expect(wrapper.classes()).toContain(`tech-button--${size}`)
    })

    const wrapper = mountButton(
      { block: true },
      {
        attrs: {
          'aria-label': 'cta',
          id: 'cta-button',
        },
      },
    )

    expect(wrapper.classes()).toContain('tech-button--block')
    expect(wrapper.attributes('aria-label')).toBe('cta')
    expect(wrapper.attributes('id')).toBe('cta-button')
    expect(wrapper.text()).toContain('立即预约')
  })

  it('disables when loading and shows spinner', () => {
    const wrapper = mountButton({ loading: true })

    expect(wrapper.classes()).toContain('tech-button--loading')
    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.find('.tech-button__spinner').exists()).toBe(true)
  })

  it('respects the "as" prop and forwards events/attrs correctly', async () => {
    const onClick = vi.fn()
    const buttonWrapper = mountButton({}, { attrs: { onClick } })
    expect(buttonWrapper.element.tagName).toBe('BUTTON')
    expect(buttonWrapper.attributes('type')).toBe('button')

    await buttonWrapper.trigger('click')
    expect(onClick).toHaveBeenCalledTimes(1)

    const linkWrapper = mountButton(
      { as: 'a', variant: 'text', disabled: true },
      {
        attrs: {
          href: '#pay',
          onClick,
        },
      },
    )

    expect(linkWrapper.element.tagName).toBe('A')
    expect(linkWrapper.attributes('type')).toBeUndefined()
    expect(linkWrapper.attributes('href')).toBe('#pay')
    expect(linkWrapper.attributes('disabled')).toBeDefined()

    await linkWrapper.trigger('click')
    expect(onClick).toHaveBeenCalledTimes(2)
  })
})


