import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createApp } from 'vue'
import ChatReplyForm from '@/components/modules/chat/ChatReplyForm.vue'
import { createElementPlusMocks } from '@/tests/utils/unit-test-helpers'

const elMocks = createElementPlusMocks()

describe('ChatReplyForm', () => {
  const mountComponent = (props = {}) => {
    const app = createApp({})
    app.use(elMocks)
    return mount(ChatReplyForm, {
      props,
      global: {
        plugins: [app]
      }
    })
  }

  describe('Component Rendering', () => {
    it('should render the form component', () => {
      const wrapper = mountComponent()
      expect(wrapper.exists()).toBe(true)
    })

    it('should render dialog with correct title for new reply', () => {
      const wrapper = mountComponent({
        visible: true,
        record: { isreply: 0 }
      })
      const dialog = wrapper.findComponent({ name: 'ElDialog' })
      expect(dialog.props('title')).toBe('回复留言')
    })

    it('should render dialog with correct title for editing reply', () => {
      const wrapper = mountComponent({
        visible: true,
        record: { isreply: 1 }
      })
      const dialog = wrapper.findComponent({ name: 'ElDialog' })
      expect(dialog.props('title')).toBe('修改回复')
    })
  })

  describe('Dialog Visibility', () => {
    it('should show dialog when visible is true', () => {
      const wrapper = mountComponent({ visible: true })
      const dialog = wrapper.findComponent({ name: 'ElDialog' })
      expect(dialog.props('modelValue')).toBe(true)
    })

    it('should emit update:visible when dialog is closed', async () => {
      const wrapper = mountComponent({ visible: true })
      const dialog = wrapper.findComponent({ name: 'ElDialog' })
      await dialog.vm.$emit('update:modelValue', false)

      expect(wrapper.emitted('update:visible')).toBeTruthy()
      expect(wrapper.emitted('update:visible')[0]).toEqual([false])
    })
  })

  describe('Form Data', () => {
    const mockRecord = {
      id: 1,
      userid: 123,
      ask: 'Test question',
      reply: 'Existing reply',
      isreply: 1
    }

    it('should populate form data when record changes', async () => {
      const wrapper = mountComponent({
        visible: true,
        record: mockRecord
      })

      await wrapper.vm.$nextTick()

      expect(wrapper.vm.formData.ask).toBe('Test question')
      expect(wrapper.vm.formData.reply).toBe('Existing reply')
    })

    it('should clear form data when record is null', async () => {
      const wrapper = mountComponent({
        visible: true,
        record: null
      })

      await wrapper.vm.$nextTick()

      expect(wrapper.vm.formData.ask).toBe('')
      expect(wrapper.vm.formData.reply).toBe('')
    })
  })

  describe('Form Validation', () => {
    it('should require reply content', async () => {
      const wrapper = mountComponent({
        visible: true,
        record: { id: 1, ask: 'test' }
      })

      const form = wrapper.findComponent({ name: 'ElForm' })
      const result = await form.vm.validate()

      expect(result).toBe(false)
    })

    it('should validate successfully with reply content', async () => {
      const wrapper = mountComponent({
        visible: true,
        record: { id: 1, ask: 'test' }
      })

      // Set reply content
      const textarea = wrapper.find('textarea')
      await textarea.setValue('Test reply')

      const form = wrapper.findComponent({ name: 'ElForm' })
      const result = await form.vm.validate()

      expect(result).toBe(true)
    })
  })

  describe('Form Submission', () => {
    it('should emit submit event with correct data when form is valid', async () => {
      const mockRecord = { id: 1, userid: 123, ask: 'test' }
      const wrapper = mountComponent({
        visible: true,
        record: mockRecord
      })

      // Set reply content
      const textarea = wrapper.find('textarea')
      await textarea.setValue('Test reply content')

      // Submit form
      const submitButton = wrapper.findAll('button').find(btn => btn.text() === '保存')
      await submitButton.trigger('click')

      expect(wrapper.emitted('submit')).toBeTruthy()
      expect(wrapper.emitted('submit')[0]).toEqual([{
        id: 1,
        userid: 123,
        reply: 'Test reply content'
      }])
    })

    it('should show loading state when submitting', () => {
      const wrapper = mountComponent({
        visible: true,
        submitting: true
      })

      const submitButton = wrapper.findAll('button').find(btn => btn.text() === '保存')
      expect(submitButton.attributes('loading')).toBe('true')
    })
  })

  describe('Form Reset', () => {
    it('should provide resetForm method', () => {
      const wrapper = mountComponent()

      expect(typeof wrapper.vm.resetForm).toBe('function')
    })

    it('should clear form data when resetForm is called', async () => {
      const wrapper = mountComponent({
        visible: true,
        record: { id: 1, ask: 'test', reply: 'existing' }
      })

      await wrapper.vm.$nextTick()
      expect(wrapper.vm.formData.ask).toBe('test')
      expect(wrapper.vm.formData.reply).toBe('existing')

      wrapper.vm.resetForm()

      expect(wrapper.vm.formData.ask).toBe('')
      expect(wrapper.vm.formData.reply).toBe('')
    })
  })

  describe('Props', () => {
    it('should accept all required props', () => {
      const props = {
        visible: true,
        record: { id: 1 },
        submitting: false
      }
      const wrapper = mountComponent(props)

      expect(wrapper.vm.visible).toBe(true)
      expect(wrapper.vm.record).toEqual({ id: 1 })
      expect(wrapper.vm.submitting).toBe(false)
    })
  })
})
