import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TestButton from './TestButton.vue'

describe('TestButton', () => {
  it('renders slot content', () => {
    const wrapper = mount(TestButton, {
      slots: {
        default: 'Click me'
      }
    })
    expect(wrapper.text()).toBe('Click me')
  })

  it('emits click event', async () => {
    const wrapper = mount(TestButton)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
