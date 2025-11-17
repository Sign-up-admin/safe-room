import http from '@/common/http'
import type { ApiResponse } from '@/types/api'
import type {
  Notification,
  NotificationPreferences,
  NotificationQuery,
  NotificationListResponse,
  NotificationActionResponse,
  BatchNotificationAction,
  NotificationStats
} from '@/types/notification'
import {
  NotificationType,
  NotificationChannel,
  NotificationStatus
} from '@/types/notification'

// 获取通知列表
export async function getNotifications(params: NotificationQuery = {}): Promise<NotificationListResponse> {
  const response = await http.get<ApiResponse<NotificationListResponse>>('/notifications', {
    params: {
      page: 1,
      limit: 20,
      ...params
    }
  })
  return response.data || {
    notifications: [],
    total: 0,
    unreadCount: 0,
    hasMore: false
  }
}

// 获取单个通知详情
export async function getNotificationById(id: string): Promise<Notification | null> {
  const response = await http.get<ApiResponse<Notification>>(`/notifications/${id}`)
  return response.data || null
}

// 标记通知为已读
export async function markNotificationAsRead(id: string): Promise<NotificationActionResponse> {
  const response = await http.put<ApiResponse<NotificationActionResponse>>(`/notifications/${id}/read`)
  return response.data || { success: false, message: '操作失败' }
}

// 批量操作通知
export async function batchUpdateNotifications(action: BatchNotificationAction): Promise<NotificationActionResponse> {
  const response = await http.post<ApiResponse<NotificationActionResponse>>('/notifications/batch', action)
  return response.data || { success: false, message: '批量操作失败' }
}

// 删除通知
export async function deleteNotification(id: string): Promise<NotificationActionResponse> {
  const response = await http.delete<ApiResponse<NotificationActionResponse>>(`/notifications/${id}`)
  return response.data || { success: false, message: '删除失败' }
}

// 获取通知偏好设置
export async function getNotificationPreferences(): Promise<NotificationPreferences | null> {
  const response = await http.get<ApiResponse<NotificationPreferences>>('/notifications/preferences')
  return response.data || null
}

// 更新通知偏好设置
export async function updateNotificationPreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationActionResponse> {
  const response = await http.put<ApiResponse<NotificationActionResponse>>('/notifications/preferences', preferences)
  return response.data || { success: false, message: '设置更新失败' }
}

// 获取通知统计信息
export async function getNotificationStats(): Promise<NotificationStats> {
  const response = await http.get<ApiResponse<NotificationStats>>('/notifications/stats')
  return response.data || {
    total: 0,
    unread: 0,
    today: 0,
    thisWeek: 0,
    byType: {} as Record<NotificationType, number>
  }
}

// 发送测试通知（开发调试用）
export async function sendTestNotification(type: NotificationType, channels: NotificationChannel[]): Promise<NotificationActionResponse> {
  const response = await http.post<ApiResponse<NotificationActionResponse>>('/notifications/test', {
    type,
    channels
  })
  return response.data || { success: false, message: '测试通知发送失败' }
}

// 获取未读通知数量
export async function getUnreadCount(): Promise<number> {
  const response = await http.get<ApiResponse<{ count: number }>>('/notifications/unread-count')
  return response.data?.count || 0
}

// 标记所有通知为已读
export async function markAllAsRead(): Promise<NotificationActionResponse> {
  const response = await http.put<ApiResponse<NotificationActionResponse>>('/notifications/mark-all-read')
  return response.data || { success: false, message: '操作失败' }
}

// 清理过期通知
export async function cleanupExpiredNotifications(): Promise<NotificationActionResponse> {
  const response = await http.post<ApiResponse<NotificationActionResponse>>('/notifications/cleanup')
  return response.data || { success: false, message: '清理失败' }
}

// WebSocket连接相关（前端维护连接，后端推送）
export interface WebSocketConfig {
  url: string
  token: string
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

// 建立WebSocket连接用于实时通知
export function createNotificationWebSocket(config: WebSocketConfig): WebSocket {
  const wsUrl = `${config.url}?token=${config.token}`
  const ws = new WebSocket(wsUrl)

  ws.onopen = () => {
    console.log('通知WebSocket连接已建立')
  }

  ws.onclose = (event) => {
    console.log('通知WebSocket连接已关闭', event.code, event.reason)
    // 自动重连逻辑
    if (config.maxReconnectAttempts && config.maxReconnectAttempts > 0) {
      setTimeout(() => {
        console.log('尝试重连通知WebSocket...')
        createNotificationWebSocket({
          ...config,
          maxReconnectAttempts: config.maxReconnectAttempts! - 1
        })
      }, config.reconnectInterval || 5000)
    }
  }

  ws.onerror = (error) => {
    console.error('通知WebSocket连接错误:', error)
  }

  return ws
}

// 模拟通知数据（开发阶段备用）
export function createMockNotifications(): Notification[] {
  const types: NotificationType[] = [
    NotificationType.APPOINTMENT_SUCCESS,
    NotificationType.PAYMENT_SUCCESS,
    NotificationType.MEMBERSHIP_EXPIRY_REMINDER,
    NotificationType.COURSE_NEW
  ]

  const titles: Partial<Record<NotificationType, string>> = {
    [NotificationType.APPOINTMENT_SUCCESS]: '预约成功通知',
    [NotificationType.PAYMENT_SUCCESS]: '支付成功通知',
    [NotificationType.MEMBERSHIP_EXPIRY_REMINDER]: '会员到期提醒',
    [NotificationType.COURSE_NEW]: '新课程发布'
  }

  const contents: Partial<Record<NotificationType, string>> = {
    [NotificationType.APPOINTMENT_SUCCESS]: '您的课程预约已确认，请按时参加。',
    [NotificationType.PAYMENT_SUCCESS]: '您的支付已成功，感谢您的支持！',
    [NotificationType.MEMBERSHIP_EXPIRY_REMINDER]: '您的会员卡即将到期，请及时续费。',
    [NotificationType.COURSE_NEW]: '新课程已发布，赶紧来了解一下吧！'
  }

  return Array.from({ length: 10 }, (_, i) => {
    const type = types[i % types.length]
    const title = titles[type] || `通知 ${i + 1}`
    const content = contents[type] || '这是一条测试通知内容'
    return {
      id: `mock-${i + 1}`,
      userId: 1,
      type: type,
      title: title,
      content: content,
      channels: [NotificationChannel.IN_APP],
      status: i < 3 ? NotificationStatus.UNREAD : NotificationStatus.READ,
      priority: 'normal' as const,
      createdAt: new Date(Date.now() - i * 3600000).toISOString(),
      ...(i < 3 ? {} : { readAt: new Date(Date.now() - i * 1800000).toISOString() })
    }
  })
}
