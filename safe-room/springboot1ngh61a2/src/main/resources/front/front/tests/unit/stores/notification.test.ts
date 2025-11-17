import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNotificationStore } from '@/stores/notification'
import {
  NotificationType,
  NotificationChannel,
  NotificationStatus
} from '@/types/notification'
import * as notificationService from '@/services/notification'

// Mock notification service
vi.mock('@/services/notification', () => ({
  getNotifications: vi.fn(),
  getNotificationStats: vi.fn(),
  getNotificationPreferences: vi.fn(),
  markNotificationAsRead: vi.fn(),
  deleteNotification: vi.fn(),
  markAllAsRead: vi.fn(),
  updateNotificationPreferences: vi.fn(),
  createMockNotifications: vi.fn()
}))

describe('通知Store', () => {
  let store: ReturnType<typeof useNotificationStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useNotificationStore()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      expect(store.notifications).toEqual([])
      expect(store.unreadNotifications).toEqual([])
      expect(store.stats).toBeNull()
      expect(store.preferences).toBeNull()
      expect(store.loading.list).toBe(false)
      expect(store.loading.stats).toBe(false)
      expect(store.loading.preferences).toBe(false)
      expect(store.pagination.current).toBe(1)
      expect(store.pagination.total).toBe(0)
      expect(store.pagination.hasMore).toBe(false)
      expect(store.wsConnected).toBe(false)
      expect(store.lastUpdated).toBeNull()
    })
  })

  describe('Getters', () => {
    beforeEach(() => {
      store.notifications = [
        {
          id: '1',
          userId: 1,
          type: NotificationType.APPOINTMENT_SUCCESS,
          title: '预约成功',
          content: '您的课程预约已确认',
          channels: [NotificationChannel.IN_APP],
          status: NotificationStatus.UNREAD,
          priority: 'normal',
          createdAt: '2024-01-02T10:00:00Z'
        },
        {
          id: '2',
          userId: 1,
          type: NotificationType.PAYMENT_SUCCESS,
          title: '支付成功',
          content: '您的支付已完成',
          channels: [NotificationChannel.IN_APP],
          status: NotificationStatus.READ,
          priority: 'normal',
          createdAt: '2024-01-01T10:00:00Z'
        }
      ]
      store.unreadNotifications = [store.notifications[0]]
    })

    it('应该正确计算未读通知数量', () => {
      expect(store.unreadCount).toBe(1)
    })

    it('应该按时间倒序返回所有通知', () => {
      const allNotifications = store.allNotifications
      expect(allNotifications[0].id).toBe('1') // 最新的通知
      expect(allNotifications[1].id).toBe('2') // 较早的通知
    })

    it('应该正确返回已读通知', () => {
      expect(store.readNotifications).toHaveLength(1)
      expect(store.readNotifications[0].id).toBe('2')
    })

    it('应该按类型分组通知', () => {
      const grouped = store.notificationsByType
      expect(grouped[NotificationType.APPOINTMENT_SUCCESS]).toHaveLength(1)
      expect(grouped[NotificationType.PAYMENT_SUCCESS]).toHaveLength(1)
    })

    it('应该正确返回高优先级通知', () => {
      store.notifications[0].priority = 'high'
      expect(store.highPriorityNotifications).toHaveLength(1)
      expect(store.highPriorityNotifications[0].priority).toBe('high')
    })

    it('应该正确检测是否有紧急通知', () => {
      expect(store.hasUrgentNotifications).toBe(false)

      store.notifications[0].priority = 'urgent'
      expect(store.hasUrgentNotifications).toBe(true)
    })
  })

  describe('loadNotifications', () => {
    it('应该成功加载通知列表', async () => {
      const mockResponse = {
        notifications: [
          {
            id: '1',
            userId: 1,
            type: NotificationType.APPOINTMENT_SUCCESS,
            title: '预约成功',
            content: '您的课程预约已确认',
            channels: [NotificationChannel.IN_APP],
            status: NotificationStatus.UNREAD,
            priority: 'normal',
            createdAt: '2024-01-01T10:00:00Z'
          }
        ],
        total: 1,
        unreadCount: 1,
        hasMore: false
      }

      vi.mocked(notificationService.getNotifications).mockResolvedValue(mockResponse)

      const result = await store.loadNotifications()

      expect(notificationService.getNotifications).toHaveBeenCalledWith({
        page: 1,
        limit: 20
      })
      expect(store.notifications).toEqual(mockResponse.notifications)
      expect(store.unreadNotifications).toEqual([mockResponse.notifications[0]])
      expect(store.pagination.total).toBe(1)
      expect(store.loading.list).toBe(false)
      expect(result).toEqual(mockResponse)
    })

    it('应该支持刷新加载', async () => {
      store.notifications = [{ id: 'old', userId: 1, type: NotificationType.APPOINTMENT_SUCCESS, title: 'Old', content: 'Old', channels: [NotificationChannel.IN_APP], status: NotificationStatus.READ, priority: 'normal', createdAt: '2024-01-01T10:00:00Z' }]
      store.pagination.current = 2

      const mockResponse = {
        notifications: [],
        total: 0,
        unreadCount: 0,
        hasMore: false
      }

      vi.mocked(notificationService.getNotifications).mockResolvedValue(mockResponse)

      await store.loadNotifications({ refresh: true })

      expect(store.notifications).toEqual([])
      expect(store.pagination.current).toBe(1)
    })

    it('应该处理加载失败并使用模拟数据', async () => {
      const mockNotifications = [
        {
          id: 'mock-1',
          userId: 1,
          type: NotificationType.APPOINTMENT_SUCCESS,
          title: '模拟通知',
          content: '这是一条模拟通知',
          channels: [NotificationChannel.IN_APP],
          status: NotificationStatus.UNREAD,
          priority: 'normal',
          createdAt: '2024-01-01T10:00:00Z'
        }
      ]

      vi.mocked(notificationService.getNotifications).mockRejectedValue(new Error('API Error'))
      vi.mocked(notificationService.createMockNotifications).mockReturnValue(mockNotifications)

      // Mock process.env.NODE_ENV
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      await store.loadNotifications()

      expect(store.notifications).toEqual(mockNotifications)
      expect(store.loading.list).toBe(false)

      // Restore
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('markAsRead', () => {
    beforeEach(() => {
      store.notifications = [
        {
          id: '1',
          userId: 1,
          type: NotificationType.APPOINTMENT_SUCCESS,
          title: '预约成功',
          content: '您的课程预约已确认',
          channels: [NotificationChannel.IN_APP],
          status: NotificationStatus.UNREAD,
          priority: 'normal',
          createdAt: '2024-01-01T10:00:00Z'
        }
      ]
      store.unreadNotifications = [store.notifications[0]]
    })

    it('应该成功标记通知为已读', async () => {
      const mockResponse = {
        success: true,
        message: '标记成功'
      }

      vi.mocked(notificationService.markNotificationAsRead).mockResolvedValue(mockResponse)

      const result = await store.markAsRead('1')

      expect(notificationService.markNotificationAsRead).toHaveBeenCalledWith('1')
      expect(store.notifications[0].status).toBe(NotificationStatus.READ)
      expect(store.notifications[0].readAt).toBeDefined()
      expect(store.unreadNotifications).toHaveLength(0)
      expect(store.loading.actions['markRead-1']).toBeUndefined()
      expect(result).toEqual(mockResponse)
    })

    it('应该处理标记失败的情况', async () => {
      const mockResponse = {
        success: false,
        message: '标记失败'
      }

      vi.mocked(notificationService.markNotificationAsRead).mockResolvedValue(mockResponse)

      const result = await store.markAsRead('1')

      expect(store.notifications[0].status).toBe(NotificationStatus.UNREAD) // 状态不变
      expect(store.unreadNotifications).toHaveLength(1)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteNotification', () => {
    beforeEach(() => {
      store.notifications = [
        {
          id: '1',
          userId: 1,
          type: NotificationType.APPOINTMENT_SUCCESS,
          title: '预约成功',
          content: '您的课程预约已确认',
          channels: [NotificationChannel.IN_APP],
          status: NotificationStatus.UNREAD,
          priority: 'normal',
          createdAt: '2024-01-01T10:00:00Z'
        },
        {
          id: '2',
          userId: 1,
          type: NotificationType.PAYMENT_SUCCESS,
          title: '支付成功',
          content: '您的支付已完成',
          channels: [NotificationChannel.IN_APP],
          status: NotificationStatus.READ,
          priority: 'normal',
          createdAt: '2024-01-01T10:00:00Z'
        }
      ]
      store.unreadNotifications = [store.notifications[0]]
      store.pagination.total = 2
    })

    it('应该成功删除通知', async () => {
      const mockResponse = {
        success: true,
        message: '删除成功'
      }

      vi.mocked(notificationService.deleteNotification).mockResolvedValue(mockResponse)

      const result = await store.deleteNotification('1')

      expect(notificationService.deleteNotification).toHaveBeenCalledWith('1')
      expect(store.notifications).toHaveLength(1)
      expect(store.notifications[0].id).toBe('2')
      expect(store.unreadNotifications).toHaveLength(0)
      expect(store.pagination.total).toBe(1)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('markAllAsRead', () => {
    beforeEach(() => {
      store.notifications = [
        {
          id: '1',
          userId: 1,
          type: NotificationType.APPOINTMENT_SUCCESS,
          title: '预约成功',
          content: '您的课程预约已确认',
          channels: [NotificationChannel.IN_APP],
          status: NotificationStatus.UNREAD,
          priority: 'normal',
          createdAt: '2024-01-01T10:00:00Z'
        },
        {
          id: '2',
          userId: 1,
          type: NotificationType.PAYMENT_SUCCESS,
          title: '支付成功',
          content: '您的支付已完成',
          channels: [NotificationChannel.IN_APP],
          status: NotificationStatus.UNREAD,
          priority: 'normal',
          createdAt: '2024-01-01T10:00:00Z'
        }
      ]
      store.unreadNotifications = store.notifications
    })

    it('应该成功标记所有通知为已读', async () => {
      const mockResponse = {
        success: true,
        message: '全部标记成功'
      }

      vi.mocked(notificationService.markAllAsRead).mockResolvedValue(mockResponse)

      const result = await store.markAllAsRead()

      expect(notificationService.markAllAsRead).toHaveBeenCalled()
      expect(store.notifications.every(n => n.status === NotificationStatus.READ)).toBe(true)
      expect(store.notifications.every(n => n.readAt)).toBeDefined()
      expect(store.unreadNotifications).toHaveLength(0)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('loadPreferences', () => {
    it('应该成功加载偏好设置', async () => {
      const mockPreferences = {
        userId: 1,
        enabledChannels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        enabledTypes: [NotificationType.APPOINTMENT_SUCCESS],
        quietHours: {
          enabled: true,
          startTime: '22:00',
          endTime: '08:00'
        },
        emailFrequency: 'daily',
        smsEnabled: true,
        pushEnabled: false
      }

      vi.mocked(notificationService.getNotificationPreferences).mockResolvedValue(mockPreferences)

      const result = await store.loadPreferences()

      expect(notificationService.getNotificationPreferences).toHaveBeenCalled()
      expect(store.preferences).toEqual(mockPreferences)
      expect(store.loading.preferences).toBe(false)
      expect(result).toEqual(mockPreferences)
    })

    it('应该在API失败时设置默认偏好', async () => {
      vi.mocked(notificationService.getNotificationPreferences).mockRejectedValue(new Error('API Error'))

      await store.loadPreferences()

      expect(store.preferences).toBeDefined()
      expect(store.preferences?.enabledChannels).toContain(NotificationChannel.IN_APP)
      expect(store.preferences?.enabledTypes).toEqual(Object.values(NotificationType))
      expect(store.loading.preferences).toBe(false)
    })
  })

  describe('addNotification', () => {
    it('应该正确添加新通知', () => {
      const newNotification = {
        id: '3',
        userId: 1,
        type: NotificationType.COURSE_NEW,
        title: '新课程发布',
        content: '新课程已上线',
        channels: [NotificationChannel.IN_APP],
        status: NotificationStatus.UNREAD,
        priority: 'normal',
        createdAt: '2024-01-03T10:00:00Z'
      }

      store.notifications = [
        {
          id: '1',
          userId: 1,
          type: NotificationType.APPOINTMENT_SUCCESS,
          title: '预约成功',
          content: '您的课程预约已确认',
          channels: [NotificationChannel.IN_APP],
          status: NotificationStatus.UNREAD,
          priority: 'normal',
          createdAt: '2024-01-01T10:00:00Z'
        }
      ]
      store.pagination.total = 1

      store.addNotification(newNotification)

      expect(store.notifications).toHaveLength(2)
      expect(store.notifications[0]).toEqual(newNotification)
      expect(store.pagination.total).toBe(2)
      expect(store.unreadNotifications).toHaveLength(1)
      expect(store.unreadNotifications[0]).toEqual(newNotification)
      expect(store.lastUpdated).toBeDefined()
    })

    it('应该更新已存在的通知', () => {
      const updatedNotification = {
        id: '1',
        userId: 1,
        type: NotificationType.APPOINTMENT_SUCCESS,
        title: '预约成功（已更新）',
        content: '您的课程预约已确认并更新',
        channels: [NotificationChannel.IN_APP],
        status: NotificationStatus.READ,
        priority: 'normal',
        createdAt: '2024-01-01T10:00:00Z',
        readAt: '2024-01-01T10:05:00Z'
      }

      store.notifications = [
        {
          id: '1',
          userId: 1,
          type: NotificationType.APPOINTMENT_SUCCESS,
          title: '预约成功',
          content: '您的课程预约已确认',
          channels: [NotificationChannel.IN_APP],
          status: NotificationStatus.UNREAD,
          priority: 'normal',
          createdAt: '2024-01-01T10:00:00Z'
        }
      ]
      store.unreadNotifications = [store.notifications[0]]

      store.addNotification(updatedNotification)

      expect(store.notifications).toHaveLength(1)
      expect(store.notifications[0]).toEqual(updatedNotification)
      expect(store.unreadNotifications).toHaveLength(0)
    })
  })

  describe('setWsConnected', () => {
    it('应该正确设置WebSocket连接状态', () => {
      expect(store.wsConnected).toBe(false)

      store.setWsConnected(true)
      expect(store.wsConnected).toBe(true)

      store.setWsConnected(false)
      expect(store.wsConnected).toBe(false)
    })
  })

  describe('reset', () => {
    beforeEach(() => {
      store.notifications = [{ id: '1', userId: 1, type: NotificationType.APPOINTMENT_SUCCESS, title: 'Test', content: 'Test', channels: [NotificationChannel.IN_APP], status: NotificationStatus.READ, priority: 'normal', createdAt: '2024-01-01T10:00:00Z' }]
      store.unreadNotifications = []
      store.stats = { total: 1, unread: 0, today: 1, thisWeek: 1, byType: {} }
      store.preferences = { userId: 1, enabledChannels: [], enabledTypes: [], quietHours: { enabled: false, startTime: '22:00', endTime: '08:00' }, emailFrequency: 'daily', smsEnabled: false, pushEnabled: false }
      store.pagination.current = 3
      store.filters = { status: NotificationStatus.READ }
      store.lastUpdated = '2024-01-01T10:00:00Z'
    })

    it('应该重置所有状态', () => {
      store.reset()

      expect(store.notifications).toEqual([])
      expect(store.unreadNotifications).toEqual([])
      expect(store.stats).toBeNull()
      expect(store.preferences).toBeNull()
      expect(store.pagination.current).toBe(1)
      expect(store.pagination.total).toBe(0)
      expect(store.pagination.hasMore).toBe(false)
      expect(store.filters).toEqual({})
      expect(store.lastUpdated).toBeNull()
    })
  })
})
