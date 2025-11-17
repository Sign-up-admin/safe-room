import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createApp } from 'vue'
import ChatDetailDialog from '@/components/modules/chat/ChatDetailDialog.vue'
import { createElementPlusMocks } from '@/tests/utils/unit-test-helpers'

const elMocks = createElementPlusMocks()

describe('ChatDetailDialog', () => {
  const mountComponent = (props = {}) => {
    const app = createApp({})
    app.use(elMocks)
    return mount(ChatDetailDialog, {
      props,
      global: {
        plugins: [app]
      }
    })
  }

  describe('Component Rendering', () => {
    it('should render the dialog component', () => {
      const wrapper = mountComponent()
      expect(wrapper.exists()).toBe(true)
    })

    it('should render dialog with correct title', () => {
      const wrapper = mountComponent({ visible: true })
      const dialog = wrapper.findComponent({ name: 'ElDialog' })
      expect(dialog.props('title')).toBe('留言详情')
    })
  })

  describe('Dialog Visibility', () => {
    it('should show dialog when visible is true', () => {
      const wrapper = mountComponent({ visible: true })
      const dialog = wrapper.findComponent({ name: 'ElDialog' })
      expect(dialog.props('modelValue')).toBe(true)
    })

    it('should hide dialog when visible is false', () => {
      const wrapper = mountComponent({ visible: false })
      const dialog = wrapper.findComponent({ name: 'ElDialog' })
      expect(dialog.props('modelValue')).toBe(false)
    })

    it('should emit update:visible when dialog is closed', async () => {
      const wrapper = mountComponent({ visible: true })
      const dialog = wrapper.findComponent({ name: 'ElDialog' })
      await dialog.vm.$emit('update:modelValue', false)

      expect(wrapper.emitted('update:visible')).toBeTruthy()
      expect(wrapper.emitted('update:visible')[0]).toEqual([false])
    })
  })

  describe('Record Display', () => {
    const mockRecord = {
      id: 1,
      userid: 123,
      ask: 'Test question',
      reply: 'Test reply',
      addtime: '2024-01-01 10:00:00',
      isreply: 1,
      yonghuEntity: {
        yonghuming: 'Test User',
        shouji: '13800138000',
        youxiang: 'test@example.com'
      }
    }

    it('should display record information correctly', () => {
      const wrapper = mountComponent({
        visible: true,
        record: mockRecord
      })

      expect(wrapper.text()).toContain('123') // User ID
      expect(wrapper.text()).toContain('Test User') // Username
      expect(wrapper.text()).toContain('13800138000') // Phone
      expect(wrapper.text()).toContain('Test question') // Question
      expect(wrapper.text()).toContain('Test reply') // Reply
    })

    it('should display reply status tag correctly', () => {
      const wrapper = mountComponent({
        visible: true,
        record: { ...mockRecord, isreply: 1 }
      })

      const tag = wrapper.findComponent({ name: 'ElTag' })
      expect(tag.text()).toBe('已回复')
      expect(tag.props('type')).toBe('success')
    })

    it('should handle record without user entity', () => {
      const wrapper = mountComponent({
        visible: true,
        record: { ...mockRecord, yonghuEntity: null }
      })

      expect(wrapper.text()).toContain('未关联用户')
    })
  })

  describe('Reply Button', () => {
    const mockPermissions = { update: true, view: true }

    it('should show reply button when record is not replied and has update permission', () => {
      const wrapper = mountComponent({
        visible: true,
        record: { isreply: 0 },
        permissions: mockPermissions
      })

      const replyButton = wrapper.findAll('button').find(btn => btn.text() === '回复')
      expect(replyButton).toBeDefined()
    })

    it('should not show reply button when record is already replied', () => {
      const wrapper = mountComponent({
        visible: true,
        record: { isreply: 1 },
        permissions: mockPermissions
      })

      const replyButton = wrapper.findAll('button').find(btn => btn.text() === '回复')
      expect(replyButton).toBeUndefined()
    })

    it('should emit reply event when reply button is clicked', async () => {
      const mockRecord = { id: 1, isreply: 0 }
      const wrapper = mountComponent({
        visible: true,
        record: mockRecord,
        permissions: mockPermissions
      })

      const replyButton = wrapper.findAll('button').find(btn => btn.text() === '回复')
      await replyButton.trigger('click')

      expect(wrapper.emitted('reply')).toBeTruthy()
      expect(wrapper.emitted('reply')[0]).toEqual([mockRecord])
    })
  })

  describe('Props', () => {
    it('should accept all required props', () => {
      const props = {
        visible: true,
        record: { id: 1 },
        permissions: { update: true }
      }
      const wrapper = mountComponent(props)

      expect(wrapper.vm.visible).toBe(true)
      expect(wrapper.vm.record).toEqual({ id: 1 })
      expect(wrapper.vm.permissions).toEqual({ update: true })
    })
  })
})
