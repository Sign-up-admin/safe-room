import { ref, computed } from 'vue'
import { getModuleService } from '../services/crud'
import type { MessageEntity } from '../types/modules'

const messageService = getModuleService('messages')

// 响应式状态
const messages = ref<MessageEntity[]>([])
const loading = ref(false)
const unreadCount = ref(0)

// 计算属性
const unreadMessages = computed(() => messages.value.filter(msg => msg.isread === 0))

const reminderMessages = computed(() => messages.value.filter(msg => msg.type === 'reminder'))

// 方法
export function useMessageCenter() {
  // 加载用户消息
  const loadMessages = async (params: any = {}) => {
    loading.value = true
    try {
      const { list } = await messageService.list({
        page: 1,
        limit: 50,
        order: 'desc',
        sort: 'addtime',
        ...params,
      })
      messages.value = list || []
      updateUnreadCount()
    } catch (error) {
      console.error('加载消息失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 获取未读消息数量
  const loadUnreadCount = async () => {
    try {
      const response = await fetch('/messages/unreadCount', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const result = await response.json()
      unreadCount.value = result.count || 0
    } catch (error) {
      console.error('获取未读消息数量失败:', error)
    }
  }

  // 标记消息为已读
  const markAsRead = async (messageIds: number[]) => {
    try {
      await fetch('/messages/markRead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageIds),
      })

      // 更新本地状态
      messages.value.forEach(msg => {
        if (messageIds.includes(msg.id)) {
          msg.isread = 1
        }
      })
      updateUnreadCount()
    } catch (error) {
      console.error('标记消息已读失败:', error)
    }
  }

  // 发送提醒消息
  const sendReminderMessage = async (params: {
    userId: number
    title: string
    content: string
    relatedType?: string
    relatedId?: number
  }) => {
    try {
      await fetch('/messages/sendReminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })
    } catch (error) {
      console.error('发送提醒消息失败:', error)
      throw error
    }
  }

  // 更新未读数量
  const updateUnreadCount = () => {
    unreadCount.value = unreadMessages.value.length
  }

  // 初始化
  const init = async () => {
    await Promise.all([loadMessages(), loadUnreadCount()])
  }

  return {
    // 状态
    messages,
    loading,
    unreadCount,
    unreadMessages,
    reminderMessages,

    // 方法
    loadMessages,
    loadUnreadCount,
    markAsRead,
    sendReminderMessage,
    init,
  }
}
