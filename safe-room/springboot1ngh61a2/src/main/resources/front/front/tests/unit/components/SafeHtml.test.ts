import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SafeHtml from '@/components/common/SafeHtml.vue'

describe('SafeHtml', () => {
  it('应该渲染HTML内容', () => {
    const wrapper = mount(SafeHtml, {
      props: {
        html: '<p>Hello World</p>',
      },
    })

    expect(wrapper.html()).toContain('Hello World')
  })

  it('应该清理不安全的HTML', () => {
    const wrapper = mount(SafeHtml, {
      props: {
        html: '<script>alert("xss")</script><p>Safe content</p>',
      },
    })

    // script标签应该被移除
    expect(wrapper.html()).not.toContain('<script>')
    expect(wrapper.html()).toContain('Safe content')
  })

  it('应该在没有HTML时渲染插槽内容', () => {
    const wrapper = mount(SafeHtml, {
      slots: {
        default: '<span>Slot content</span>',
      },
    })

    expect(wrapper.html()).toContain('Slot content')
  })

  it('应该应用自定义className', () => {
    const wrapper = mount(SafeHtml, {
      props: {
        html: '<p>Test</p>',
        className: 'custom-class',
      },
    })

    expect(wrapper.classes()).toContain('custom-class')
  })

  it('应该支持自定义允许的标签', () => {
    const wrapper = mount(SafeHtml, {
      props: {
        html: '<div>Test</div><script>alert("xss")</script>',
        allowTags: ['div'],
      },
    })

    expect(wrapper.html()).toContain('Test')
    expect(wrapper.html()).not.toContain('<script>')
  })

  it('应该处理null HTML', () => {
    const wrapper = mount(SafeHtml, {
      props: {
        html: null,
      },
      slots: {
        default: 'Default content',
      },
    })

    expect(wrapper.html()).toContain('Default content')
  })

  it('应该处理空字符串HTML', () => {
    const wrapper = mount(SafeHtml, {
      props: {
        html: '',
      },
      slots: {
        default: 'Default content',
      },
    })

    expect(wrapper.html()).toContain('Default content')
  })
})

