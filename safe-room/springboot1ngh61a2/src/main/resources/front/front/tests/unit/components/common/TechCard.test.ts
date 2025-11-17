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
import TechCard from '@/components/common/TechCard.vue'

describe('TechCard', () => {
  it('renders header, actions, footer and default content', () => {
    const wrapper = mount(TechCard, {
      props: {
        title: 'AI 私教课程',
        subtitle: '燃脂 / 45min',
        eyebrow: 'Premium',
        variant: 'layered',
      },
      slots: {
        icon: () => h('span', { class: 'card-icon' }, '🔥'),
        actions: () => h('button', { class: 'card-action' }, '详情'),
        footer: () => h('div', { class: 'card-footer' }, '底部信息'),
        default: () => h('p', '自定义内容'),
      },
    })

    expect(wrapper.classes()).toContain('tech-card--variant-layered')
    expect(wrapper.find('.tech-card__header').exists()).toBe(true)
    expect(wrapper.find('.card-icon').exists()).toBe(true)
    expect(wrapper.find('.tech-card__title').text()).toBe('AI 私教课程')
    expect(wrapper.find('.tech-card__subtitle').text()).toBe('燃脂 / 45min')
    expect(wrapper.find('.card-action').text()).toBe('详情')
    expect(wrapper.find('.tech-card__body').text()).toContain('自定义内容')
    expect(wrapper.find('.card-footer').text()).toBe('底部信息')
  })

  it('applies variant flags, padding style and custom tag', () => {
    const wrapper = mount(TechCard, {
      props: {
        as: 'article',
        variant: 'minimal',
        padding: '24px',
        interactive: false,
        borderless: true,
        ghost: true,
      },
      slots: {
        default: () => '内容',
      },
    })

    expect(wrapper.element.tagName).toBe('ARTICLE')
    expect(wrapper.classes()).toContain('tech-card--variant-minimal')
    expect(wrapper.classes()).toContain('tech-card--borderless')
    expect(wrapper.classes()).toContain('tech-card--ghost')
    expect(wrapper.classes()).not.toContain('tech-card--interactive')
    expect((wrapper.element as HTMLElement).style.getPropertyValue('--tech-card-padding')).toBe('24px')
  })

  it('hides header when no header fields or slots are provided', () => {
    const wrapper = mount(TechCard, {
      slots: {
        default: () => 'fallback body',
      },
    })

    expect(wrapper.find('.tech-card__header').exists()).toBe(false)
    expect(wrapper.find('.tech-card__body').text()).toContain('fallback body')
  })
})









