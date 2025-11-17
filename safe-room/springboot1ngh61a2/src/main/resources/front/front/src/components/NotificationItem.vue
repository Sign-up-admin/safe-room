<template>
  <div
    class="notification-item"
    :class="{
      'notification-item--unread': notification.status === NotificationStatus.UNREAD,
      'notification-item--read': notification.status === NotificationStatus.READ,
      'notification-item--high-priority': isHighPriority
    }"
    @click="handleClick"
  >
    <!-- 通知图标 -->
    <div class="notification-item__icon">
      <el-icon :size="24" :color="iconColor">
        <component :is="notificationIcon" />
      </el-icon>
      <!-- 未读标记 -->
      <div v-if="notification.status === NotificationStatus.UNREAD" class="notification-item__unread-dot"></div>
    </div>

    <!-- 通知内容 -->
    <div class="notification-item__content">
      <div class="notification-item__header">
        <h4 class="notification-item__title">
          {{ notification.title }}
        </h4>
        <span class="notification-item__time">
          {{ formatTime(notification.createdAt) }}
        </span>
      </div>

      <p class="notification-item__message">
        {{ notification.content }}
      </p>

      <!-- 通知类型标签 -->
      <div class="notification-item__meta">
        <el-tag
          :type="getTypeTagType(notification.type)"
          size="small"
          effect="light"
        >
          {{ getTypeLabel(notification.type) }}
        </el-tag>

        <!-- 优先级标签 -->
        <el-tag
          v-if="isHighPriority"
          type="danger"
          size="small"
          effect="light"
        >
          重要
        </el-tag>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="notification-item__actions">
      <el-dropdown
        trigger="click"
        @command="handleAction"
      >
        <el-button type="text" size="small">
          <el-icon><More /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-if="notification.status === NotificationStatus.UNREAD"
              command="mark-read"
            >
              <el-icon><Check /></el-icon>
              标记已读
            </el-dropdown-item>
            <el-dropdown-item command="delete" class="danger">
              <el-icon><Delete /></el-icon>
              删除
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Check,
  Delete,
  More,
  Bell,
  Calendar,
  CreditCard,
  User,
  Warning
} from '@element-plus/icons-vue'
import type { Notification } from '@/types/notification'
import { NotificationStatus, NotificationType } from '@/types/notification'
import { formatDate } from '@/utils/formatters'

interface Props {
  notification: Notification
}

const props = defineProps<Props>()

const emit = defineEmits<{
  read: [notificationId: string]
  delete: [notificationId: string]
}>()

// 计算属性
const isHighPriority = computed(() => {
  return props.notification.priority === 'high' || props.notification.priority === 'urgent'
})

const notificationIcon = computed(() => {
  switch (props.notification.type) {
    case NotificationType.APPOINTMENT_SUCCESS:
    case NotificationType.APPOINTMENT_REMINDER:
    case NotificationType.APPOINTMENT_CANCELLED:
    case NotificationType.APPOINTMENT_CHANGED:
      return Calendar
    case NotificationType.PAYMENT_SUCCESS:
    case NotificationType.PAYMENT_FAILED:
    case NotificationType.REFUND_SUCCESS:
      return CreditCard
    case NotificationType.MEMBERSHIP_EXPIRY_REMINDER:
    case NotificationType.MEMBERSHIP_RENEWAL_SUCCESS:
    case NotificationType.MEMBERSHIP_BENEFITS_CHANGED:
      return User
    case NotificationType.SYSTEM_MAINTENANCE:
      return Warning
    default:
      return Bell
  }
})

const iconColor = computed(() => {
  if (props.notification.status === NotificationStatus.UNREAD) {
    return isHighPriority.value ? '#ff4d4f' : '#fdd835'
  }
  return '#666'
})

// 方法
const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return formatDate(date)
}

const getTypeLabel = (type: NotificationType): string => {
  const labels: Record<NotificationType, string> = {
    [NotificationType.APPOINTMENT_SUCCESS]: '预约成功',
    [NotificationType.APPOINTMENT_REMINDER]: '预约提醒',
    [NotificationType.APPOINTMENT_CANCELLED]: '预约取消',
    [NotificationType.APPOINTMENT_CHANGED]: '预约变更',
    [NotificationType.PAYMENT_SUCCESS]: '支付成功',
    [NotificationType.PAYMENT_FAILED]: '支付失败',
    [NotificationType.REFUND_SUCCESS]: '退款成功',
    [NotificationType.MEMBERSHIP_EXPIRY_REMINDER]: '到期提醒',
    [NotificationType.MEMBERSHIP_RENEWAL_SUCCESS]: '续费成功',
    [NotificationType.MEMBERSHIP_BENEFITS_CHANGED]: '权益变更',
    [NotificationType.COURSE_NEW]: '新课程',
    [NotificationType.ACTIVITY_PROMOTION]: '活动通知',
    [NotificationType.SYSTEM_MAINTENANCE]: '系统维护'
  }
  return labels[type] || '系统通知'
}

const getTypeTagType = (type: NotificationType): string => {
  if (type.includes('appointment') || type.includes('booking')) {
    return 'primary'
  }
  if (type.includes('payment')) {
    return 'success'
  }
  if (type.includes('membership')) {
    return 'warning'
  }
  return ''
}

const handleClick = () => {
  // 点击通知项时，如果是未读则标记为已读
  if (props.notification.status === NotificationStatus.UNREAD) {
    emit('read', props.notification.id)
  }
}

const handleAction = (command: string) => {
  switch (command) {
    case 'mark-read':
      emit('read', props.notification.id)
      break
    case 'delete':
      emit('delete', props.notification.id)
      break
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: background-color $transition-base;
  position: relative;

  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  &--unread {
    background: rgba(253, 216, 53, 0.05);
    border-left: 3px solid $color-yellow;
  }

  &--high-priority {
    border-left-color: #ff4d4f;

    .notification-item__title {
      color: #ff4d4f;
    }
  }
}

.notification-item__icon {
  position: relative;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
}

.notification-item__unread-dot {
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 8px;
  background: $color-yellow;
  border-radius: 50%;
  border: 2px solid $color-bg-primary;
}

.notification-item__content {
  flex: 1;
  min-width: 0;
}

.notification-item__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
}

.notification-item__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: $color-text-primary;
  line-height: 1.4;
  flex: 1;
  min-width: 0;
}

.notification-item__time {
  font-size: 0.75rem;
  color: $color-text-secondary;
  flex-shrink: 0;
  white-space: nowrap;
}

.notification-item__message {
  margin: 0 0 12px;
  font-size: 0.875rem;
  color: $color-text-secondary;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-item__meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.notification-item__actions {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity $transition-base;

  .notification-item:hover & {
    opacity: 1;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .notification-item {
    padding: 12px 16px;
    gap: 12px;

    &__header {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }

    &__time {
      font-size: 0.7rem;
    }

    &__actions {
      opacity: 1; // 移动端始终显示操作按钮
    }
  }

  .notification-item__icon {
    width: 32px;
    height: 32px;
  }
}

// Element Plus 样式覆盖
:deep(.el-dropdown-menu__item.danger) {
  color: #ff4d4f;

  &:hover {
    background: rgba(255, 77, 79, 0.1);
    color: #ff4d4f;
  }
}
</style>
