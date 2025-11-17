import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

// 类型定义
export interface DiscussionReply {
  id: number
  userId: number
  userNickname: string
  userAvatar?: string
  userLevel?: string
  content: string
  createTime: string
  likeCount?: number
  isLiked?: boolean
  isOfficial?: boolean
  parentId?: number
  parentUserNickname?: string
  attachments?: any[]
  children?: DiscussionReply[]
  showReplyInput?: boolean
  replyContent?: string
}

export interface DiscussionItem {
  id: number
  content: string
  nickname?: string
  userid?: number
  replies?: DiscussionReply[]
  replyCount?: number
}

// 组合式函数
export function useDiscussionInteraction() {
  // 状态
  const currentUser = ref({
    id: 1,
    nickname: '当前用户',
  })

  const followingUsers = ref(new Set<number>())

  // 回复点赞功能
  const handleReplyLike = async (reply: DiscussionReply): Promise<void> => {
    try {
      const newLikedState = !reply.isLiked
      reply.isLiked = newLikedState
      reply.likeCount = (reply.likeCount || 0) + (newLikedState ? 1 : -1)

      // 这里可以调用实际的API
      console.log(`Reply ${reply.id} ${newLikedState ? 'liked' : 'unliked'}`)

      ElMessage.success(newLikedState ? '点赞成功' : '已取消点赞')
    } catch (error) {
      console.error('点赞失败:', error)
      ElMessage.error('操作失败，请重试')
    }
  }

  // 显示回复输入框
  const showReplyInput = (reply: DiscussionReply): void => {
    reply.showReplyInput = true
    reply.replyContent = ''
  }

  // 取消回复
  const cancelReply = (reply: DiscussionReply): void => {
    reply.showReplyInput = false
    reply.replyContent = ''
  }

  // 提交嵌套回复
  const submitNestedReply = async (reply: DiscussionReply, discussionId: number): Promise<void> => {
    if (!reply.replyContent?.trim()) {
      ElMessage.warning('请输入回复内容')
      return
    }

    if (reply.replyContent.length > 500) {
      ElMessage.warning('回复内容不能超过500个字符')
      return
    }

    try {
      const newReply: DiscussionReply = {
        id: Date.now(),
        userId: currentUser.value.id,
        userNickname: currentUser.value.nickname,
        content: reply.replyContent,
        createTime: new Date().toISOString(),
        likeCount: 0,
        isLiked: false,
        parentId: reply.id,
        parentUserNickname: reply.userNickname,
        children: [],
      }

      // 添加到父回复的子回复列表
      if (!reply.children) {
        reply.children = []
      }
      reply.children.unshift(newReply)

      // 隐藏输入框
      reply.showReplyInput = false
      reply.replyContent = ''

      ElMessage.success('回复成功')

      // 触发通知
      triggerReplyNotification(reply, newReply)
    } catch (error) {
      console.error('回复失败:', error)
      ElMessage.error('回复失败，请重试')
    }
  }

  // 关注用户
  const toggleFollow = (userId: number, userNickname: string): void => {
    if (followingUsers.value.has(userId)) {
      followingUsers.value.delete(userId)
      ElMessage.success(`已取消关注 ${userNickname}`)
    } else {
      followingUsers.value.add(userId)
      ElMessage.success(`已关注 ${userNickname}`)
    }
  }

  // 举报回复
  const reportReply = (reply: DiscussionReply): void => {
    ElMessage.success('举报已提交，我们会尽快处理')
  }

  // 回复通知机制
  const triggerReplyNotification = (parentReply: DiscussionReply, newReply: DiscussionReply): void => {
    const notificationMessage = `您的回复收到来自 ${newReply.userNickname} 的回复`

    console.log('Reply notification:', notificationMessage)

    // 这里可以集成实际的通知服务：
    // 1. 站内信通知
    // 2. 邮件通知
    // 3. 浏览器推送通知

    // 模拟发送通知
    if (parentReply.userId !== currentUser.value.id) {
      console.log(`Notifying ${parentReply.userNickname} about reply from ${newReply.userNickname}`)
    }
  }

  // 格式化回复内容（处理@用户提醒）
  const formatReplyContent = (content: string): string => {
    if (!content) return ''

    // 处理@用户提醒
    let formattedContent = content.replace(/@(\w+)/g, '<span class="mention">@$1</span>')

    // 处理换行
    formattedContent = formattedContent.replace(/\n/g, '<br>')

    return formattedContent
  }

  // 格式化时间
  const formatTimeAgo = (time: string): string => {
    if (!time) return '—'
    const now = new Date()
    const past = new Date(time)
    const diff = now.getTime() - past.getTime()

    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days > 0) return `${days}天前`
    if (hours > 0) return `${hours}小时前`
    if (minutes > 0) return `${minutes}分钟前`
    return '刚刚'
  }

  // 检查是否可以举报
  const canReport = (reply: DiscussionReply): boolean => reply.userId !== currentUser.value.id

  // 检查是否是当前用户
  const isCurrentUser = (userId: number): boolean => userId === currentUser.value.id

  // 检查是否已关注
  const isFollowing = (userId: number): boolean => followingUsers.value.has(userId)

  return {
    // 状态
    currentUser,
    followingUsers,

    // 方法
    handleReplyLike,
    showReplyInput,
    cancelReply,
    submitNestedReply,
    toggleFollow,
    reportReply,
    formatReplyContent,
    formatTimeAgo,
    canReport,
    isCurrentUser,
    isFollowing,
  }
}
