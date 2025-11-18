import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TechButton from '@/components/common/TechButton.vue'

describe('TechButton', () => {
  it('应该渲染按钮', () => {
    const wrapper = mount(TechButton, {
      slots: {
        default: 'Click me',
      },
    })

    expect(wrapper.text()).toContain('Click me')
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('应该应用默认variant和size', () => {
    const wrapper = mount(TechButton)
    expect(wrapper.classes()).toContain('tech-button--primary')
    expect(wrapper.classes()).toContain('tech-button--md')
  })

  it('应该支持不同的variant', () => {
    const variants = ['primary', 'outline', 'ghost', 'text'] as const

    variants.forEach((variant) => {
      const wrapper = mount(TechButton, {
        props: { variant },
      })
      expect(wrapper.classes()).toContain(`tech-button--${variant}`)
    })
  })

  it('应该支持不同的size', () => {
    const sizes = ['sm', 'md', 'lg'] as const

    sizes.forEach((size) => {
      const wrapper = mount(TechButton, {
        props: { size },
      })
      expect(wrapper.classes()).toContain(`tech-button--${size}`)
    })
  })

  it('应该支持block模式', () => {
    const wrapper = mount(TechButton, {
      props: { block: true },
    })
    expect(wrapper.classes()).toContain('tech-button--block')
  })

  it('应该在loading时显示spinner', () => {
    const wrapper = mount(TechButton, {
      props: { loading: true },
    })
    expect(wrapper.find('.tech-button__spinner').exists()).toBe(true)
    expect(wrapper.classes()).toContain('tech-button--loading')
  })

  it('应该在loading时禁用按钮', () => {
    const wrapper = mount(TechButton, {
      props: { loading: true },
    })
    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('应该在disabled时禁用按钮', () => {
    const wrapper = mount(TechButton, {
      props: { disabled: true },
    })
    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('应该支持自定义标签', () => {
    const wrapper = mount(TechButton, {
      props: { as: 'a' },
    })
    expect(wrapper.find('a').exists()).toBe(true)
  })

  it('应该支持icon插槽', () => {
    const wrapper = mount(TechButton, {
      slots: {
        icon: '<span class="icon">★</span>',
        default: 'Button',
      },
    })
    expect(wrapper.find('.icon').exists()).toBe(true)
  })

  it('应该支持点击事件', async () => {
    const wrapper = mount(TechButton)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('应该在disabled时不触发点击事件', async () => {
    const wrapper = mount(TechButton, {
      props: { disabled: true },
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })
})

