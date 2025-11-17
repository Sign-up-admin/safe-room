import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getNotifications,
  getNotificationById,
  markNotificationAsRead,
  deleteNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  getUnreadCount,
  createMockNotifications
} from '@/services/notification'
import { NotificationChannel, NotificationStatus, NotificationType } from '@/types/notification'
import http from '@/common/http'

// Mock http module
vi.mock('@/common/http', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

describe('通知API服务', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getNotifications', () => {
    it('应该正确调用API并返回通知列表', async () => {
      const mockResponse = {
        data: {
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
      }

      vi.mocked(http.get).mockResolvedValue(mockResponse)

      const result = await getNotifications()

      expect(http.get).toHaveBeenCalledWith('/notifications', {
        params: {
          page: 1,
          limit: 20
        }
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('应该支持查询参数', async () => {
      const mockResponse = {
        data: {
          notifications: [],
          total: 0,
          unreadCount: 0,
          hasMore: false
        }
      }

      vi.mocked(http.get).mockResolvedValue(mockResponse)

      await getNotifications({
        page: 2,
        limit: 10,
        status: NotificationStatus.READ
      })

      expect(http.get).toHaveBeenCalledWith('/notifications', {
        params: {
          page: 2,
          limit: 10,
          status: NotificationStatus.READ
        }
      })
    })

    it('应该处理API错误', async () => {
      const error = new Error('API Error')
      vi.mocked(http.get).mockRejectedValue(error)

      await expect(getNotifications()).rejects.toThrow('API Error')
    })
  })

  describe('getNotificationById', () => {
    it('应该正确获取单个通知', async () => {
      const mockNotification = {
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

      const mockResponse = {
        data: mockNotification
      }

      vi.mocked(http.get).mockResolvedValue(mockResponse)

      const result = await getNotificationById('1')

      expect(http.get).toHaveBeenCalledWith('/notifications/1')
      expect(result).toEqual(mockNotification)
    })

    it('应该返回null当通知不存在时', async () => {
      const mockResponse = {
        data: null
      }

      vi.mocked(http.get).mockResolvedValue(mockResponse)

      const result = await getNotificationById('999')

      expect(result).toBeNull()
    })
  })

  describe('markNotificationAsRead', () => {
    it('应该正确标记通知为已读', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: '标记成功'
        }
      }

      vi.mocked(http.put).mockResolvedValue(mockResponse)

      const result = await markNotificationAsRead('1')

      expect(http.put).toHaveBeenCalledWith('/notifications/1/read')
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('deleteNotification', () => {
    it('应该正确删除通知', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: '删除成功'
        }
      }

      vi.mocked(http.delete).mockResolvedValue(mockResponse)

      const result = await deleteNotification('1')

      expect(http.delete).toHaveBeenCalledWith('/notifications/1')
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('getNotificationPreferences', () => {
    it('应该正确获取用户偏好设置', async () => {
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

      const mockResponse = {
        data: mockPreferences
      }

      vi.mocked(http.get).mockResolvedValue(mockResponse)

      const result = await getNotificationPreferences()

      expect(http.get).toHaveBeenCalledWith('/notifications/preferences')
      expect(result).toEqual(mockPreferences)
    })

    it('应该返回null当偏好设置不存在时', async () => {
      const mockResponse = {
        data: null
      }

      vi.mocked(http.get).mockResolvedValue(mockResponse)

      const result = await getNotificationPreferences()

      expect(result).toBeNull()
    })
  })

  describe('updateNotificationPreferences', () => {
    it('应该正确更新偏好设置', async () => {
      const newPreferences = {
        smsEnabled: false,
        pushEnabled: true
      }

      const mockResponse = {
        data: {
          success: true,
          message: '设置更新成功'
        }
      }

      vi.mocked(http.put).mockResolvedValue(mockResponse)

      const result = await updateNotificationPreferences(newPreferences)

      expect(http.put).toHaveBeenCalledWith('/notifications/preferences', newPreferences)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('getUnreadCount', () => {
    it('应该正确获取未读通知数量', async () => {
      const mockResponse = {
        data: {
          count: 5
        }
      }

      vi.mocked(http.get).mockResolvedValue(mockResponse)

      const result = await getUnreadCount()

      expect(http.get).toHaveBeenCalledWith('/notifications/unread-count')
      expect(result).toBe(5)
    })

    it('应该返回0当API返回null时', async () => {
      const mockResponse = {
        data: null
      }

      vi.mocked(http.get).mockResolvedValue(mockResponse)

      const result = await getUnreadCount()

      expect(result).toBe(0)
    })
  })

  describe('createMockNotifications', () => {
    it('应该生成有效的模拟通知数据', () => {
      const mockNotifications = createMockNotifications()

      expect(mockNotifications).toBeInstanceOf(Array)
      expect(mockNotifications.length).toBeGreaterThan(0)

      const firstNotification = mockNotifications[0]
      expect(firstNotification).toHaveProperty('id')
      expect(firstNotification).toHaveProperty('userId')
      expect(firstNotification).toHaveProperty('type')
      expect(firstNotification).toHaveProperty('title')
      expect(firstNotification).toHaveProperty('content')
      expect(firstNotification).toHaveProperty('channels')
      expect(firstNotification).toHaveProperty('status')
      expect(firstNotification).toHaveProperty('priority')
      expect(firstNotification).toHaveProperty('createdAt')

      // 验证前3个通知是未读状态
      mockNotifications.slice(0, 3).forEach(notification => {
        expect(notification.status).toBe(NotificationStatus.UNREAD)
      })

      // 验证其他通知是已读状态
      mockNotifications.slice(3).forEach(notification => {
        expect(notification.status).toBe(NotificationStatus.READ)
        expect(notification.readAt).toBeDefined()
      })
    })

    it('应该包含所有预期的通知类型', () => {
      const mockNotifications = createMockNotifications()
      const types = mockNotifications.map(n => n.type)

      expect(types).toContain(NotificationType.APPOINTMENT_SUCCESS)
      expect(types).toContain(NotificationType.PAYMENT_SUCCESS)
      expect(types).toContain(NotificationType.MEMBERSHIP_EXPIRY_REMINDER)
      expect(types).toContain(NotificationType.COURSE_NEW)
    })
  })

  describe('错误处理', () => {
    it('应该在API调用失败时抛出错误', async () => {
      const error = new Error('Network Error')
      vi.mocked(http.get).mockRejectedValue(error)

      await expect(getNotifications()).rejects.toThrow('Network Error')
    })

    it('应该在获取偏好设置失败时抛出错误', async () => {
      const error = new Error('Preferences not found')
      vi.mocked(http.get).mockRejectedValue(error)

      await expect(getNotificationPreferences()).rejects.toThrow('Preferences not found')
    })
  })
})
