import { defineStore } from 'pinia'
import type { Notification, NotificationPreferences, NotificationStats } from '@/types/notification'
import { NotificationStatus, NotificationType, NotificationChannel } from '@/types/notification'

// Node.js 环境变量类型声明
declare const process: {
  env: {
    NODE_ENV: string
    [key: string]: string | undefined
  }
}
import {
  getNotifications,
  getNotificationStats,
  getNotificationPreferences,
  updateNotificationPreferences,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  batchUpdateNotifications,
  createMockNotifications,
} from '@/services/notification'

interface NotificationState {
  // 通知列表
  notifications: Notification[]
  // 未读通知
  unreadNotifications: Notification[]
  // 通知统计
  stats: NotificationStats | null
  // 用户偏好设置
  preferences: NotificationPreferences | null
  // 加载状态
  loading: {
    list: boolean
    stats: boolean
    preferences: boolean
    actions: Record<string, boolean>
  }
  // 分页信息
  pagination: {
    current: number
    total: number
    hasMore: boolean
  }
  // 过滤器
  filters: {
    status?: NotificationStatus
    type?: NotificationType
  }
  // WebSocket连接状态
  wsConnected: boolean
  // 最后更新时间
  lastUpdated: string | null
}

export const useNotificationStore = defineStore('notification', {
  state: (): NotificationState => ({
    notifications: [],
    unreadNotifications: [],
    stats: null,
    preferences: null,
    loading: {
      list: false,
      stats: false,
      preferences: false,
      actions: {},
    },
    pagination: {
      current: 1,
      total: 0,
      hasMore: false,
    },
    filters: {},
    wsConnected: false,
    lastUpdated: null,
  }),

  getters: {
    // 获取未读通知数量
    unreadCount: state => state.unreadNotifications.length,

    // 获取所有通知（按时间倒序）
    allNotifications: state =>
      [...state.notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),

    // 获取已读通知
    readNotifications: state => state.notifications.filter(n => n.status === NotificationStatus.READ),

    // 按类型分组的通知
    notificationsByType: state => {
      const grouped: Record<NotificationType, Notification[]> = {} as Record<NotificationType, Notification[]>
      state.notifications.forEach(notification => {
        if (!grouped[notification.type]) {
          grouped[notification.type] = []
        }
        grouped[notification.type].push(notification)
      })
      return grouped
    },

    // 获取高优先级通知
    highPriorityNotifications: state =>
      state.notifications.filter(n => n.priority === 'high' || n.priority === 'urgent'),

    // 检查是否有新的高优先级通知
    hasUrgentNotifications: state => state.unreadNotifications.some(n => n.priority === 'urgent'),
  },

  actions: {
    // 加载通知列表
    async loadNotifications(params: { page?: number; refresh?: boolean } = {}) {
      this.loading.list = true
      try {
        const { page = 1, refresh = false } = params

        if (refresh || page === 1) {
          this.pagination.current = 1
          this.notifications = []
        }

        const response = await getNotifications({
          page: this.pagination.current,
          limit: 20,
          ...this.filters,
        })

        if (refresh || page === 1) {
          this.notifications = response.notifications
        } else {
          this.notifications.push(...response.notifications)
        }

        this.pagination.total = response.total
        this.pagination.hasMore = response.hasMore
        this.unreadNotifications = response.notifications.filter(n => n.status === NotificationStatus.UNREAD)
        this.lastUpdated = new Date().toISOString()

        return response
      } catch (error) {
        console.error('加载通知列表失败:', error)
        // 开发环境使用模拟数据
        if (process.env.NODE_ENV === 'development') {
          this.notifications = createMockNotifications()
          this.unreadNotifications = this.notifications.filter(n => n.status === NotificationStatus.UNREAD)
        }
        // 不重新抛出错误，让调用方处理
      } finally {
        this.loading.list = false
      }
    },

    // 加载通知统计
    async loadStats() {
      this.loading.stats = true
      try {
        const stats = await getNotificationStats()
        this.stats = stats
        return stats
      } catch (error) {
        console.error('加载通知统计失败:', error)
        throw error
      } finally {
        this.loading.stats = false
      }
    },

    // 加载用户偏好设置
    async loadPreferences() {
      this.loading.preferences = true
      try {
        const preferences = await getNotificationPreferences()
        this.preferences = preferences
        return preferences
      } catch (error) {
        console.error('加载通知偏好设置失败:', error)
        // 设置默认偏好
        this.preferences = {
          userId: 0,
          enabledChannels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
          enabledTypes: Object.values(NotificationType),
          quietHours: {
            enabled: false,
            startTime: '22:00',
            endTime: '08:00',
          },
          emailFrequency: 'immediate',
          smsEnabled: true,
          pushEnabled: true,
        }
        // 不重新抛出错误，返回undefined
        return undefined
      } finally {
        this.loading.preferences = false
      }
    },

    // 更新偏好设置
    async updatePreferences(newPreferences: Partial<NotificationPreferences>) {
      const actionKey = 'updatePreferences'
      this.loading.actions[actionKey] = true
      try {
        const result = await updateNotificationPreferences(newPreferences)
        if (result.success && this.preferences) {
          this.preferences = { ...this.preferences, ...newPreferences }
        }
        return result
      } catch (error) {
        console.error('更新通知偏好设置失败:', error)
        throw error
      } finally {
        delete this.loading.actions[actionKey]
      }
    },

    // 标记通知为已读
    async markAsRead(notificationId: string) {
      const actionKey = `markRead-${notificationId}`
      this.loading.actions[actionKey] = true
      try {
        const result = await markNotificationAsRead(notificationId)
        if (result.success) {
          const notification = this.notifications.find(n => n.id === notificationId)
          if (notification) {
            notification.status = NotificationStatus.READ
            notification.readAt = new Date().toISOString()
            // 从未读列表中移除
            this.unreadNotifications = this.unreadNotifications.filter(n => n.id !== notificationId)
          }
        }
        return result
      } catch (error) {
        console.error('标记通知已读失败:', error)
        throw error
      } finally {
        delete this.loading.actions[actionKey]
      }
    },

    // 标记所有通知为已读
    async markAllAsRead() {
      const actionKey = 'markAllRead'
      this.loading.actions[actionKey] = true
      try {
        const result = await markAllAsRead()
        if (result.success) {
          this.notifications.forEach(notification => {
            if (notification.status === NotificationStatus.UNREAD) {
              notification.status = NotificationStatus.READ
              notification.readAt = new Date().toISOString()
            }
          })
          this.unreadNotifications = []
        }
        return result
      } catch (error) {
        console.error('标记所有通知已读失败:', error)
        throw error
      } finally {
        delete this.loading.actions[actionKey]
      }
    },

    // 删除通知
    async deleteNotification(notificationId: string) {
      const actionKey = `delete-${notificationId}`
      this.loading.actions[actionKey] = true
      try {
        const result = await deleteNotification(notificationId)
        if (result.success) {
          this.notifications = this.notifications.filter(n => n.id !== notificationId)
          this.unreadNotifications = this.unreadNotifications.filter(n => n.id !== notificationId)
          this.pagination.total = Math.max(0, this.pagination.total - 1)
        }
        return result
      } catch (error) {
        console.error('删除通知失败:', error)
        throw error
      } finally {
        delete this.loading.actions[actionKey]
      }
    },

    // 批量操作通知
    async batchUpdateNotifications(action: {
      notificationIds: string[]
      action: 'mark_read' | 'mark_unread' | 'delete' | 'archive'
    }) {
      const actionKey = 'batchUpdate'
      this.loading.actions[actionKey] = true
      try {
        const result = await batchUpdateNotifications(action)
        if (result.success) {
          // 重新加载列表
          await this.loadNotifications({ refresh: true })
        }
        return result
      } catch (error) {
        console.error('批量操作通知失败:', error)
        throw error
      } finally {
        delete this.loading.actions[actionKey]
      }
    },

    // 添加新通知（WebSocket推送时调用）
    addNotification(notification: Notification) {
      // 检查是否已存在
      const existingIndex = this.notifications.findIndex(n => n.id === notification.id)
      if (existingIndex >= 0) {
        // 更新现有通知
        this.notifications[existingIndex] = notification
      } else {
        // 添加新通知
        this.notifications.unshift(notification)
        this.pagination.total += 1
      }

      // 更新未读列表
      if (notification.status === NotificationStatus.UNREAD) {
        const unreadIndex = this.unreadNotifications.findIndex(n => n.id === notification.id)
        if (unreadIndex >= 0) {
          this.unreadNotifications[unreadIndex] = notification
        } else {
          this.unreadNotifications.unshift(notification)
        }
      } else {
        this.unreadNotifications = this.unreadNotifications.filter(n => n.id !== notification.id)
      }

      this.lastUpdated = new Date().toISOString()
    },

    // 更新WebSocket连接状态
    setWsConnected(connected: boolean) {
      this.wsConnected = connected
    },

    // 设置过滤器
    setFilters(filters: Partial<NotificationState['filters']>) {
      this.filters = { ...this.filters, ...filters }
    },

    // 清空过滤器
    clearFilters() {
      this.filters = {}
    },

    // 重置状态
    reset() {
      this.notifications = []
      this.unreadNotifications = []
      this.stats = null
      this.preferences = null
      this.pagination = {
        current: 1,
        total: 0,
        hasMore: false,
      }
      this.filters = {}
      this.lastUpdated = null
    },
  },
})
