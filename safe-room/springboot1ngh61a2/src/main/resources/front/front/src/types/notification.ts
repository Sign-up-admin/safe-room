// 通知类型定义
export enum NotificationType {
  APPOINTMENT_SUCCESS = 'appointment_success',
  APPOINTMENT_REMINDER = 'appointment_reminder',
  APPOINTMENT_CANCELLED = 'appointment_cancelled',
  APPOINTMENT_CHANGED = 'appointment_changed',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  REFUND_SUCCESS = 'refund_success',
  MEMBERSHIP_EXPIRY_REMINDER = 'membership_expiry_reminder',
  MEMBERSHIP_RENEWAL_SUCCESS = 'membership_renewal_success',
  MEMBERSHIP_BENEFITS_CHANGED = 'membership_benefits_changed',
  COURSE_NEW = 'course_new',
  ACTIVITY_PROMOTION = 'activity_promotion',
  SYSTEM_MAINTENANCE = 'system_maintenance'
}

// 通知渠道枚举
export enum NotificationChannel {
  SMS = 'sms',
  EMAIL = 'email',
  IN_APP = 'in_app',
  PUSH = 'push'
}

// 通知状态枚举
export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived'
}

// 通知接口
export interface Notification {
  id: string;
  userId: number;
  type: NotificationType;
  title: string;
  content: string;
  channels: NotificationChannel[];
  status: NotificationStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: Record<string, any>;
  createdAt: string;
  readAt?: string;
  expiredAt?: string;
}

// 通知偏好设置接口
export interface NotificationPreferences {
  userId: number;
  enabledChannels: NotificationChannel[];
  enabledTypes: NotificationType[];
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm 格式
    endTime: string;   // HH:mm 格式
  };
  emailFrequency: 'immediate' | 'daily' | 'weekly';
  smsEnabled: boolean;
  pushEnabled: boolean;
}

// 通知列表查询参数
export interface NotificationQuery {
  page?: number;
  limit?: number;
  status?: NotificationStatus;
  type?: NotificationType;
  startDate?: string;
  endDate?: string;
}

// 通知列表响应
export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  hasMore: boolean;
}

// WebSocket通知消息
export interface WebSocketNotificationMessage {
  type: 'notification';
  data: Notification;
}

// 通知操作响应
export interface NotificationActionResponse {
  success: boolean;
  message: string;
  notification?: Notification;
}

// 批量操作请求
export interface BatchNotificationAction {
  notificationIds: string[];
  action: 'mark_read' | 'mark_unread' | 'delete' | 'archive';
}

// 通知统计信息
export interface NotificationStats {
  total: number;
  unread: number;
  today: number;
  thisWeek: number;
  byType: Record<NotificationType, number>;
}

// 通知模板接口
export interface NotificationTemplate {
  type: NotificationType;
  channels: NotificationChannel[];
  titleTemplate: string;
  contentTemplate: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
}
