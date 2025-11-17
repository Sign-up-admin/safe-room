import { describe, it, expect } from 'vitest'
import {
  NotificationType,
  NotificationChannel,
  NotificationStatus,
  type Notification,
  type NotificationPreferences
} from '@/types/notification'

describe('通知类型定义', () => {
  describe('NotificationType 枚举', () => {
    it('应该包含所有预期的通知类型', () => {
      const expectedTypes = [
        'appointment_success',
        'appointment_reminder',
        'appointment_cancelled',
        'appointment_changed',
        'payment_success',
        'payment_failed',
        'refund_success',
        'membership_expiry_reminder',
        'membership_renewal_success',
        'membership_benefits_changed',
        'course_new',
        'activity_promotion',
        'system_maintenance'
      ]

      expectedTypes.forEach(type => {
        expect(Object.values(NotificationType)).toContain(type)
      })
    })

    it('应该有正确的枚举值', () => {
      expect(NotificationType.APPOINTMENT_SUCCESS).toBe('appointment_success')
      expect(NotificationType.PAYMENT_SUCCESS).toBe('payment_success')
      expect(NotificationType.MEMBERSHIP_EXPIRY_REMINDER).toBe('membership_expiry_reminder')
    })
  })

  describe('NotificationChannel 枚举', () => {
    it('应该包含所有预期的通知渠道', () => {
      const expectedChannels = ['sms', 'email', 'in_app', 'push']

      expectedChannels.forEach(channel => {
        expect(Object.values(NotificationChannel)).toContain(channel)
      })
    })

    it('应该有正确的枚举值', () => {
      expect(NotificationChannel.SMS).toBe('sms')
      expect(NotificationChannel.EMAIL).toBe('email')
      expect(NotificationChannel.IN_APP).toBe('in_app')
      expect(NotificationChannel.PUSH).toBe('push')
    })
  })

  describe('NotificationStatus 枚举', () => {
    it('应该包含所有预期的通知状态', () => {
      const expectedStatuses = ['unread', 'read', 'archived']

      expectedStatuses.forEach(status => {
        expect(Object.values(NotificationStatus)).toContain(status)
      })
    })

    it('应该有正确的枚举值', () => {
      expect(NotificationStatus.UNREAD).toBe('unread')
      expect(NotificationStatus.READ).toBe('read')
      expect(NotificationStatus.ARCHIVED).toBe('archived')
    })
  })

  describe('Notification 接口', () => {
    it('应该能够创建有效的通知对象', () => {
      const notification: Notification = {
        id: 'test-123',
        userId: 1,
        type: NotificationType.APPOINTMENT_SUCCESS,
        title: '预约成功',
        content: '您的课程预约已确认',
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        status: NotificationStatus.UNREAD,
        priority: 'normal',
        createdAt: '2024-01-01T10:00:00Z'
      }

      expect(notification.id).toBe('test-123')
      expect(notification.type).toBe(NotificationType.APPOINTMENT_SUCCESS)
      expect(notification.status).toBe(NotificationStatus.UNREAD)
    })

    it('应该支持可选字段', () => {
      const notification: Notification = {
        id: 'test-123',
        userId: 1,
        type: NotificationType.APPOINTMENT_SUCCESS,
        title: '预约成功',
        content: '您的课程预约已确认',
        channels: [NotificationChannel.IN_APP],
        status: NotificationStatus.UNREAD,
        priority: 'high',
        createdAt: '2024-01-01T10:00:00Z',
        readAt: '2024-01-01T10:05:00Z',
        metadata: { courseId: 123, coachId: 456 }
      }

      expect(notification.readAt).toBe('2024-01-01T10:05:00Z')
      expect(notification.metadata).toEqual({ courseId: 123, coachId: 456 })
    })
  })

  describe('NotificationPreferences 接口', () => {
    it('应该能够创建有效的偏好设置对象', () => {
      const preferences: NotificationPreferences = {
        userId: 1,
        enabledChannels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        enabledTypes: [NotificationType.APPOINTMENT_SUCCESS, NotificationType.PAYMENT_SUCCESS],
        quietHours: {
          enabled: true,
          startTime: '22:00',
          endTime: '08:00'
        },
        emailFrequency: 'daily',
        smsEnabled: true,
        pushEnabled: false
      }

      expect(preferences.userId).toBe(1)
      expect(preferences.enabledChannels).toContain(NotificationChannel.IN_APP)
      expect(preferences.enabledTypes).toContain(NotificationType.APPOINTMENT_SUCCESS)
      expect(preferences.quietHours.enabled).toBe(true)
      expect(preferences.emailFrequency).toBe('daily')
    })
  })

  describe('类型安全检查', () => {
    it('应该正确验证通知类型', () => {
      const validTypes = Object.values(NotificationType)
      const invalidType = 'invalid_type'

      expect(validTypes).toContain(NotificationType.APPOINTMENT_SUCCESS)
      expect(validTypes).not.toContain(invalidType)
    })

    it('应该正确验证通知渠道', () => {
      const validChannels = Object.values(NotificationChannel)
      const invalidChannel = 'invalid_channel'

      expect(validChannels).toContain(NotificationChannel.EMAIL)
      expect(validChannels).not.toContain(invalidChannel)
    })

    it('应该正确验证通知状态', () => {
      const validStatuses = Object.values(NotificationStatus)
      const invalidStatus = 'invalid_status'

      expect(validStatuses).toContain(NotificationStatus.READ)
      expect(validStatuses).not.toContain(invalidStatus)
    })
  })
})
