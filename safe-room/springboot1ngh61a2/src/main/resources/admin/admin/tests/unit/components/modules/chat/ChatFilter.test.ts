import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createApp } from 'vue'
import ChatFilter from '@/components/modules/chat/ChatFilter.vue'
import { createElementPlusMocks } from '@/tests/utils/unit-test-helpers'

const elMocks = createElementPlusMocks()

describe('ChatFilter', () => {
  const mountComponent = (props = {}) => {
    const app = createApp({})
    app.use(elMocks)
    return mount(ChatFilter, {
      props,
      global: {
        plugins: [app]
      }
    })
  }

  describe('Component Rendering', () => {
    it('should render the filter component', () => {
      const wrapper = mountComponent()
      expect(wrapper.exists()).toBe(true)
    })

    it('should render filter form with all fields', () => {
      const wrapper = mountComponent()
      expect(wrapper.find('.filter-section').exists()).toBe(true)
      expect(wrapper.find('form').exists()).toBe(true)
    })
  })

  describe('Filter Form', () => {
    it('should emit search event when search button is clicked', async () => {
      const wrapper = mountComponent({
        modelValue: { isreply: null, ask: '' }
      })

      const searchButton = wrapper.find('button[type="primary"]')
      await searchButton.trigger('click')

      expect(wrapper.emitted('search')).toBeTruthy()
    })

    it('should emit reset event when reset button is clicked', async () => {
      const wrapper = mountComponent({
        modelValue: { isreply: 1, ask: 'test' }
      })

      const resetButton = wrapper.findAll('button')[1] // Second button is reset
      await resetButton.trigger('click')

      expect(wrapper.emitted('reset')).toBeTruthy()
    })

    it('should update model value when filter fields change', async () => {
      const wrapper = mountComponent({
        modelValue: { isreply: null, ask: '' }
      })

      const select = wrapper.findComponent({ name: 'ElSelect' })
      await select.vm.$emit('update:modelValue', 1)

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([{ isreply: 1, ask: '' }])
    })
  })

  describe('Props', () => {
    it('should accept and display initial filter values', () => {
      const filterValue = { isreply: 1, ask: 'test query' }
      const wrapper = mountComponent({
        modelValue: filterValue
      })

      // The component should accept the props without error
      expect(wrapper.vm.filterForm.isreply).toBe(1)
      expect(wrapper.vm.filterForm.ask).toBe('test query')
    })
  })
})
