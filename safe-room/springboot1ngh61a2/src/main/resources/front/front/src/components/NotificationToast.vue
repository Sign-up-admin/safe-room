<template>
  <TransitionGroup name="notification-toast" tag="div" class="notification-toast-container">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="notification-toast"
      :class="{
        'notification-toast--high-priority':
          toast.notification.priority === 'high' || toast.notification.priority === 'urgent',
        'notification-toast--entering': toast.state === 'entering',
        'notification-toast--leaving': toast.state === 'leaving',
      }"
      @click="handleToastClick(toast)"
    >
      <!-- 通知图标 -->
      <div class="notification-toast__icon">
        <el-icon :size="20" :color="getIconColor(toast.notification)">
          <component :is="getNotificationIcon(toast.notification.type)" />
        </el-icon>
      </div>

      <!-- 通知内容 -->
      <div class="notification-toast__content">
        <div class="notification-toast__title">
          {{ toast.notification.title }}
        </div>
        <div class="notification-toast__message">
          {{ toast.notification.content }}
        </div>
        <div class="notification-toast__time">
          {{ formatTime(toast.notification.createdAt) }}
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="notification-toast__actions">
        <el-button type="text" size="small" @click.stop="handleDismiss(toast.id)">
          <el-icon size="16"><Close /></el-icon>
        </el-button>
      </div>

      <!-- 进度条 -->
      <div class="notification-toast__progress" :style="{ animationDuration: `${duration}ms` }"></div>
    </div>
  </TransitionGroup>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Close, Bell, Calendar, CreditCard, User, Warning } from '@element-plus/icons-vue'
import type { Notification } from '@/types/notification'
import { NotificationType } from '@/types/notification'
import { formatDate } from '@/utils/formatters'

interface ToastItem {
  id: string
  notification: Notification
  state: 'entering' | 'visible' | 'leaving'
  timer?: number
}

interface Props {
  duration?: number
  maxToasts?: number
}

const props = withDefaults(defineProps<Props>(), {
  duration: 5000, // 默认5秒
  maxToasts: 3, // 最大同时显示3个
})

// 响应式数据
const toasts = ref<ToastItem[]>([])

// 方法
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case NotificationType.APPOINTMENT_SUCCESS:
    case NotificationType.APPOINTMENT_REMINDER:
    case NotificationType.APPOINTMENT_CANCELLED:
    case NotificationType.APPOINTMENT_CHANGED:
      return Calendar
    case NotificationType.PAYMENT_SUCCESS:
    case NotificationType.PAYMENT_FAILED:
      return CreditCard
    case NotificationType.MEMBERSHIP_EXPIRY_REMINDER:
    case NotificationType.MEMBERSHIP_RENEWAL_SUCCESS:
      return User
    case NotificationType.SYSTEM_MAINTENANCE:
      return Warning
    default:
      return Bell
  }
}

const getIconColor = (notification: Notification): string => {
  if (notification.priority === 'high' || notification.priority === 'urgent') {
    return '#ff4d4f'
  }
  return '#fdd835'
}

const formatTime = (dateString: string): string => {
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

const showToast = (notification: Notification) => {
  const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  const toast: ToastItem = {
    id: toastId,
    notification,
    state: 'entering',
  }

  // 添加到队列
  toasts.value.unshift(toast)

  // 限制最大数量
  if (toasts.value.length > props.maxToasts) {
    const oldestToast = toasts.value[toasts.value.length - 1]
    dismissToast(oldestToast.id)
  }

  // 设置状态和定时器
  setTimeout(() => {
    const index = toasts.value.findIndex(t => t.id === toastId)
    if (index >= 0) {
      toasts.value[index].state = 'visible'

      // 设置自动消失定时器
      toasts.value[index].timer = window.setTimeout(() => {
        dismissToast(toastId)
      }, props.duration)
    }
  }, 100) // 短暂延迟确保进入动画完成
}

const dismissToast = (toastId: string) => {
  const index = toasts.value.findIndex(t => t.id === toastId)
  if (index >= 0) {
    const toast = toasts.value[index]

    // 清除定时器
    if (toast.timer) {
      clearTimeout(toast.timer)
    }

    // 设置离开状态
    toast.state = 'leaving'

    // 动画完成后移除
    setTimeout(() => {
      toasts.value.splice(index, 1)
    }, 300) // 与CSS过渡时间匹配
  }
}

const handleToastClick = (toast: ToastItem) => {
  // 点击时跳转到相关页面或执行操作
  console.log('Toast clicked:', toast.notification)

  // 这里可以根据通知类型跳转到不同页面
  // 例如：预约通知跳转到预约详情，支付通知跳转到订单详情等

  // 然后关闭toast
  dismissToast(toast.id)
}

const handleDismiss = (toastId: string) => {
  dismissToast(toastId)
}

// 暴露方法供父组件调用
defineExpose({
  showToast,
  dismissToast,
  clearAll: () => {
    toasts.value.forEach(toast => {
      if (toast.timer) {
        clearTimeout(toast.timer)
      }
    })
    toasts.value = []
  },
})

// 清理定时器
onUnmounted(() => {
  toasts.value.forEach(toast => {
    if (toast.timer) {
      clearTimeout(toast.timer)
    }
  })
})
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.notification-toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.notification-toast {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: $color-panel-primary;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  min-width: 320px;
  max-width: 480px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  }

  &--high-priority {
    border-color: #ff4d4f;
    background: linear-gradient(135deg, rgba(255, 77, 79, 0.1), rgba(10, 10, 10, 0.9));
  }

  &--entering {
    animation: slideInRight 0.3s ease-out;
  }

  &--leaving {
    animation: slideOutRight 0.3s ease-in;
  }
}

.notification-toast__icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
}

.notification-toast__content {
  flex: 1;
  min-width: 0;
}

.notification-toast__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: $color-text-primary;
  margin-bottom: 4px;
  line-height: 1.3;
}

.notification-toast__message {
  font-size: 0.75rem;
  color: $color-text-secondary;
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-toast__time {
  font-size: 0.7rem;
  color: $color-text-tertiary;
}

.notification-toast__actions {
  flex-shrink: 0;

  .el-button {
    padding: 4px;
    color: $color-text-secondary;

    &:hover {
      color: $color-text-primary;
    }
  }
}

.notification-toast__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, $color-yellow, $color-yellow);
  border-radius: 0 0 8px 8px;
  animation: progress linear;
  animation-fill-mode: forwards;
}

// 动画定义
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

@keyframes progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

// Vue TransitionGroup动画
.notification-toast-enter-active,
.notification-toast-leave-active {
  transition: all 0.3s ease;
}

.notification-toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.notification-toast-move {
  transition: transform 0.3s ease;
}

// 响应式设计
@media (max-width: 768px) {
  .notification-toast-container {
    top: 16px;
    right: 16px;
    left: 16px;
    width: auto;
  }

  .notification-toast {
    min-width: 0;
    max-width: none;
  }
}

@media (max-width: 480px) {
  .notification-toast-container {
    top: 12px;
    right: 12px;
    left: 12px;
  }

  .notification-toast {
    padding: 12px;
    gap: 8px;

    &__icon {
      width: 28px;
      height: 28px;
    }

    &__title {
      font-size: 0.8rem;
    }

    &__message {
      font-size: 0.7rem;
    }
  }
}
</style>
