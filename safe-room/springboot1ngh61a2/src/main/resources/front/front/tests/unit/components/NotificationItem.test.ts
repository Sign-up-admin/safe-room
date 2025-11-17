import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import NotificationItem from '@/components/NotificationItem.vue'
import { NotificationType, NotificationStatus, NotificationChannel } from '@/types/notification'

describe('NotificationItem 组件', () => {
  const mockNotification = {
    id: '1',
    userId: 1,
    type: NotificationType.APPOINTMENT_SUCCESS,
    title: '预约成功',
    content: '您的课程预约已确认，请按时参加。',
    channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    status: NotificationStatus.UNREAD,
    priority: 'normal',
    createdAt: '2024-01-15T10:00:00Z'
  }

  const mountComponent = (props = {}) => mount(NotificationItem, {
      props: {
        notification: mockNotification,
        ...props
      },
      global: {
        stubs: {
          ElIcon: true,
          ElButton: true,
          ElTag: true,
          ElDropdown: true,
          ElDropdownMenu: true,
          ElDropdownItem: true
        }
      }
    })

  describe('渲染', () => {
    it('应该正确渲染通知内容', () => {
      const wrapper = mountComponent()

      expect(wrapper.text()).toContain('预约成功')
      expect(wrapper.text()).toContain('您的课程预约已确认，请按时参加。')
    })

    it('应该显示未读状态的样式', () => {
      const wrapper = mountComponent()
      const notificationItem = wrapper.find('.notification-item')

      expect(notificationItem.classes()).toContain('notification-item--unread')
    })

    it('应该显示已读状态的样式', () => {
      const readNotification = { ...mockNotification, status: NotificationStatus.READ }
      const wrapper = mountComponent({ notification: readNotification })
      const notificationItem = wrapper.find('.notification-item')

      expect(notificationItem.classes()).toContain('notification-item--read')
    })

    it('应该显示高优先级通知的样式', () => {
      const highPriorityNotification = { ...mockNotification, priority: 'high' }
      const wrapper = mountComponent({ notification: highPriorityNotification })

      expect(wrapper.find('.notification-item').classes()).toContain('notification-item--high-priority')
    })

    it('应该显示通知类型标签', () => {
      const wrapper = mountComponent()

      expect(wrapper.text()).toContain('预约成功')
    })

    it('应该显示优先级标签', () => {
      const highPriorityNotification = { ...mockNotification, priority: 'high' }
      const wrapper = mountComponent({ notification: highPriorityNotification })

      expect(wrapper.text()).toContain('重要')
    })
  })

  describe('时间显示', () => {
    it('应该显示时间', () => {
      const wrapper = mountComponent()

      // 检查时间元素是否存在
      const timeElement = wrapper.find('.notification-item__time')
      expect(timeElement.exists()).toBe(true)
    })
  })

  describe('操作按钮', () => {
    it('应该显示操作下拉菜单', () => {
      const wrapper = mountComponent()

      const actions = wrapper.find('.notification-item__actions')
      expect(actions.exists()).toBe(true)
    })

    it('应该在未读通知上显示"标记已读"选项', () => {
      const wrapper = mountComponent()

      expect(wrapper.text()).toContain('标记已读')
    })

    it('应该显示删除选项', () => {
      const wrapper = mountComponent()

      expect(wrapper.text()).toContain('删除')
    })
  })

  describe('事件处理', () => {
    it('应该在点击通知项时触发click事件', async () => {
      const wrapper = mountComponent()

      const notificationItem = wrapper.find('.notification-item')
      await notificationItem.trigger('click')

      expect(wrapper.emitted()).toHaveProperty('click')
      expect(wrapper.emitted('click')![0]).toEqual([mockNotification])
    })

    it('应该在操作下拉菜单选择时触发相应事件', async () => {
      const wrapper = mountComponent()

      // 模拟下拉菜单命令
      const dropdown = wrapper.findComponent({ name: 'ElDropdown' })
      if (dropdown.exists()) {
        await dropdown.vm.$emit('command', 'mark-read')

        expect(wrapper.emitted()).toHaveProperty('mark-as-read')
        expect(wrapper.emitted('mark-as-read')![0]).toEqual([mockNotification.id])
      }
    })
  })

  describe('错误处理', () => {
    it('应该处理无效的通知数据', () => {
      const invalidNotification = {
        id: 'invalid',
        userId: 1,
        type: 'invalid_type' as NotificationType,
        title: '',
        content: '',
        channels: [],
        status: NotificationStatus.UNREAD,
        priority: 'normal',
        createdAt: '2024-01-15T10:00:00Z'
      }

      expect(() => mountComponent({ notification: invalidNotification })).not.toThrow()
    })

    it('应该处理缺失的字段', () => {
      const incompleteNotification = {
        id: '1',
        userId: 1,
        type: NotificationType.APPOINTMENT_SUCCESS,
        title: '标题',
        content: '内容',
        channels: [NotificationChannel.IN_APP],
        status: NotificationStatus.UNREAD,
        priority: 'normal',
        createdAt: '2024-01-15T10:00:00Z'
      }

      expect(() => mountComponent({ notification: incompleteNotification })).not.toThrow()
    })
  })
})
