<template>
  <div class="notification-center">
    <!-- 头部区域 -->
    <div class="notification-center__header">
      <div class="notification-center__title-section">
        <h2 class="notification-center__title">消息中心</h2>
        <div v-if="unreadCount > 0" class="notification-center__unread-badge">{{ unreadCount }} 条未读</div>
      </div>

      <div class="notification-center__actions">
        <!-- 筛选器 -->
        <div class="notification-center__filters">
          <el-select v-model="currentFilter" placeholder="筛选通知" size="small" @change="handleFilterChange">
            <el-option label="全部" value="all" />
            <el-option label="未读" value="unread" />
            <el-option label="已读" value="read" />
            <el-option label="预约相关" value="appointment" />
            <el-option label="支付相关" value="payment" />
            <el-option label="会员相关" value="membership" />
          </el-select>
        </div>

        <!-- 操作按钮 -->
        <div class="notification-center__buttons">
          <el-button
            v-if="unreadCount > 0"
            type="primary"
            size="small"
            :loading="loading.actions['markAllRead']"
            @click="handleMarkAllRead"
          >
            全部已读
          </el-button>

          <el-button type="default" size="small" @click="showSettings = true">
            <el-icon><Setting /></el-icon>
            设置
          </el-button>
        </div>
      </div>
    </div>

    <!-- 通知列表 -->
    <div class="notification-center__content">
      <!-- 加载状态 -->
      <div v-if="loading.list" class="notification-center__loading">
        <el-skeleton v-for="i in 5" :key="i" animated :loading="true">
          <template #template>
            <div class="notification-skeleton">
              <el-skeleton-item variant="circle" style="width: 40px; height: 40px" />
              <div style="flex: 1">
                <el-skeleton-item variant="text" style="width: 200px" />
                <el-skeleton-item variant="text" style="width: 150px; margin-top: 8px" />
              </div>
            </div>
          </template>
        </el-skeleton>
      </div>

      <!-- 通知列表 -->
      <div v-else-if="filteredNotifications.length > 0" class="notification-center__list">
        <NotificationItem
          v-for="notification in filteredNotifications"
          :key="notification.id"
          :notification="notification"
          @read="handleMarkAsRead"
          @delete="handleDelete"
        />

        <!-- 加载更多 -->
        <div v-if="pagination.hasMore && !loading.list" class="notification-center__load-more">
          <el-button type="default" size="small" :loading="loading.list" @click="handleLoadMore"> 加载更多 </el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="notification-center__empty">
        <div class="notification-center__empty-icon">
          <el-icon size="48" color="#666"><Bell /></el-icon>
        </div>
        <h3 class="notification-center__empty-title">暂无通知</h3>
        <p class="notification-center__empty-desc">
          {{ currentFilter === 'all' ? '您还没有收到任何通知' : '该筛选条件下没有通知' }}
        </p>
        <el-button v-if="currentFilter !== 'all'" type="primary" size="small" @click="currentFilter = 'all'">
          查看全部通知
        </el-button>
      </div>
    </div>

    <!-- 通知设置抽屉 -->
    <NotificationSettings
      v-model="showSettings"
      :preferences="preferences"
      :loading="loading.preferences"
      @update="handleUpdatePreferences"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Setting, Bell } from '@element-plus/icons-vue'
import { useNotificationStore } from '@/stores/notification'
import type { Notification } from '@/types/notification'
import { NotificationStatus, NotificationType } from '@/types/notification'
import NotificationItem from './NotificationItem.vue'
import NotificationSettings from './NotificationSettings.vue'

const notificationStore = useNotificationStore()

// 响应式数据
const showSettings = ref(false)
const currentFilter = ref<'all' | 'unread' | 'read' | 'appointment' | 'payment' | 'membership'>('all')

// 计算属性
const { notifications, unreadCount, loading, pagination, preferences } = notificationStore

// 筛选后的通知列表
const filteredNotifications = computed(() => {
  let filtered = [...notifications]

  switch (currentFilter.value) {
    case 'unread':
      filtered = filtered.filter(n => n.status === NotificationStatus.UNREAD)
      break
    case 'read':
      filtered = filtered.filter(n => n.status === NotificationStatus.READ)
      break
    case 'appointment':
      filtered = filtered.filter(n => n.type.includes('appointment') || n.type.includes('booking'))
      break
    case 'payment':
      filtered = filtered.filter(n => n.type.includes('payment'))
      break
    case 'membership':
      filtered = filtered.filter(n => n.type.includes('membership'))
      break
    default:
      // all - 不筛选
      break
  }

  // 按时间倒序排序
  return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

// 事件处理
const handleFilterChange = () => {
  // 筛选器改变时重新加载（如果需要）
  console.log('筛选器改变:', currentFilter.value)
}

const handleMarkAsRead = async (notificationId: string) => {
  try {
    await notificationStore.markAsRead(notificationId)
    ElMessage.success('已标记为已读')
  } catch (error) {
    ElMessage.error('标记已读失败')
  }
}

const handleDelete = async (notificationId: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这条通知吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await notificationStore.deleteNotification(notificationId)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleMarkAllRead = async () => {
  try {
    await notificationStore.markAllAsRead()
    ElMessage.success('全部标记为已读')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleLoadMore = async () => {
  try {
    await notificationStore.loadNotifications({
      page: pagination.current + 1,
    })
  } catch (error) {
    ElMessage.error('加载失败')
  }
}

const handleUpdatePreferences = async (newPreferences: any) => {
  try {
    await notificationStore.updatePreferences(newPreferences)
    ElMessage.success('设置更新成功')
  } catch (error) {
    ElMessage.error('设置更新失败')
  }
}

// 生命周期
onMounted(async () => {
  try {
    // 同时加载通知列表和偏好设置
    await Promise.all([
      notificationStore.loadNotifications({ refresh: true }),
      notificationStore.loadPreferences(),
      notificationStore.loadStats(),
    ])
  } catch (error) {
    console.error('初始化通知中心失败:', error)
  }
})

// 监听筛选器变化
watch(currentFilter, () => {
  // 可以在这里添加筛选逻辑
})
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.notification-center {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: $color-bg-primary;

  &__header {
    padding: 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: $color-panel-primary;
  }

  &__title-section {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  &__title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: $color-text-primary;
  }

  &__unread-badge {
    padding: 4px 8px;
    background: $color-yellow;
    color: $color-bg-primary;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  &__actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }

  &__filters {
    flex: 1;
    max-width: 200px;
  }

  &__buttons {
    display: flex;
    gap: 8px;
  }

  &__content {
    flex: 1;
    overflow-y: auto;
    padding: 0;
  }

  &__loading {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__list {
    padding: 0;
  }

  &__load-more {
    padding: 24px;
    text-align: center;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 24px;
    text-align: center;
  }

  &__empty-icon {
    margin-bottom: 16px;
    opacity: 0.5;
  }

  &__empty-title {
    margin: 0 0 8px;
    font-size: 1.125rem;
    color: $color-text-primary;
  }

  &__empty-desc {
    margin: 0 0 24px;
    color: $color-text-secondary;
    font-size: 0.875rem;
  }
}

.notification-skeleton {
  display: flex;
  gap: 12px;
  padding: 16px;
  align-items: center;
}

// 响应式设计
@media (max-width: 768px) {
  .notification-center {
    &__header {
      padding: 16px;
    }

    &__actions {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }

    &__filters {
      max-width: none;
    }

    &__buttons {
      justify-content: center;
    }

    &__empty {
      padding: 48px 16px;
    }
  }
}
</style>
