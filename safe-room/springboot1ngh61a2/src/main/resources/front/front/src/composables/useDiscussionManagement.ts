import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 类型定义
export interface DiscussionItem {
  id?: number
  userid?: number
  nickname?: string
  content: string
  isPinned?: boolean
  isFeatured?: boolean
  isHot?: boolean
}

export interface ReportData {
  discussionId: number
  reportType: 'spam' | 'harassment' | 'inappropriate' | 'copyright' | 'other'
  reason: string
  description?: string
}

export interface FollowData {
  userId: number
  nickname: string
  isFollowing: boolean
}

export function useDiscussionManagement() {
  // 状态
  const currentUser = ref({
    id: 1,
    nickname: '当前用户',
    role: 'admin', // 模拟管理员权限
  })

  const followingUsers = ref(new Set<number>())
  const reportedDiscussions = ref(new Set<number>())

  // 举报类型选项
  const reportTypes = [
    { value: 'spam', label: '垃圾信息' },
    { value: 'harassment', label: '骚扰行为' },
    { value: 'inappropriate', label: '不当内容' },
    { value: 'copyright', label: '版权侵权' },
    { value: 'other', label: '其他' },
  ]

  // 方法
  const togglePinDiscussion = async (discussion: DiscussionItem): Promise<boolean> => {
    if (!isAdmin()) {
      ElMessage.warning('只有管理员才能执行此操作')
      return false
    }

    try {
      const newPinnedState = !discussion.isPinned

      // 模拟API调用
      console.log(`${newPinnedState ? '置顶' : '取消置顶'}讨论:`, discussion.id)

      discussion.isPinned = newPinnedState
      ElMessage.success(newPinnedState ? '讨论已置顶' : '已取消置顶')

      return true
    } catch (error) {
      console.error('置顶操作失败:', error)
      ElMessage.error('操作失败，请重试')
      return false
    }
  }

  const toggleFeatureDiscussion = async (discussion: DiscussionItem): Promise<boolean> => {
    if (!isAdmin()) {
      ElMessage.warning('只有管理员才能执行此操作')
      return false
    }

    try {
      const newFeaturedState = !discussion.isFeatured

      // 模拟API调用
      console.log(`${newFeaturedState ? '设为精华' : '取消精华'}讨论:`, discussion.id)

      discussion.isFeatured = newFeaturedState
      ElMessage.success(newFeaturedState ? '讨论已设为精华' : '已取消精华')

      return true
    } catch (error) {
      console.error('精华操作失败:', error)
      ElMessage.error('操作失败，请重试')
      return false
    }
  }

  const reportDiscussion = async (discussion: DiscussionItem): Promise<boolean> => {
    try {
      // Create a select input for report types
      const selectOptions = reportTypes.map(type => ({
        label: type.label,
        value: type.value,
      }))

      // Create a simple select using prompt with custom validation
      const reportTypeOptions = selectOptions.map(opt => `${opt.label} (${opt.value})`).join('\n')
      const { value: selectedOption } = await ElMessageBox.prompt(
        `请选择举报类型：\n${reportTypeOptions}`,
        '举报讨论',
        {
          confirmButtonText: '提交举报',
          cancelButtonText: '取消',
          inputPlaceholder: '输入举报类型编号',
        },
      )

      // Parse the selected value
      const reportType = selectOptions.find(opt => opt.value === selectedOption)?.value || selectedOption

      if (!reportType) return false

      // 获取举报理由
      const { value: reason } = await ElMessageBox.prompt('请详细描述举报理由', '举报详情', {
        confirmButtonText: '提交',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputPlaceholder: '请详细说明举报原因...',
        inputValidator: value => {
          if (!value || value.trim().length < 10) {
            return '举报理由至少需要10个字符'
          }
          return true
        },
      })

      if (!reason) return false

      const reportData: ReportData = {
        discussionId: discussion.id,
        reportType: reportType as ReportData['reportType'],
        reason: reason.trim(),
        description: `举报用户: ${discussion.nickname || '未知用户'}`,
      }

      // 模拟API调用
      console.log('提交举报:', reportData)

      reportedDiscussions.value.add(discussion.id)
      ElMessage.success('举报已提交，我们会尽快处理')

      return true
    } catch (error) {
      if (error !== 'cancel') {
        console.error('举报失败:', error)
        ElMessage.error('举报提交失败，请重试')
      }
      return false
    }
  }

  const toggleFollowUser = async (userData: FollowData): Promise<boolean> => {
    try {
      const newFollowingState = !userData.isFollowing

      if (newFollowingState) {
        followingUsers.value.add(userData.userId)
        userData.isFollowing = true
        ElMessage.success(`已关注 ${userData.nickname}`)
      } else {
        followingUsers.value.delete(userData.userId)
        userData.isFollowing = false
        ElMessage.success(`已取消关注 ${userData.nickname}`)
      }

      // 模拟API调用
      console.log(`${newFollowingState ? '关注' : '取消关注'}用户:`, userData.userId)

      return true
    } catch (error) {
      console.error('关注操作失败:', error)
      ElMessage.error('操作失败，请重试')
      return false
    }
  }

  const deleteDiscussion = async (discussion: DiscussionItem): Promise<boolean> => {
    if (!isAdmin()) {
      ElMessage.warning('只有管理员才能删除讨论')
      return false
    }

    try {
      await ElMessageBox.confirm('确定要删除这个讨论吗？此操作不可撤销。', '删除讨论', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      })

      // 模拟API调用
      console.log('删除讨论:', discussion.id)

      ElMessage.success('讨论已删除')
      return true
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除失败:', error)
        ElMessage.error('删除失败，请重试')
      }
      return false
    }
  }

  // 权限检查
  const isAdmin = (): boolean => currentUser.value.role === 'admin'

  const canPinDiscussion = (discussion: DiscussionItem): boolean => isAdmin()

  const canFeatureDiscussion = (discussion: DiscussionItem): boolean => isAdmin()

  const canDeleteDiscussion = (discussion: DiscussionItem): boolean =>
    isAdmin() || discussion.userid === currentUser.value.id

  const canReportDiscussion = (discussion: DiscussionItem): boolean =>
    discussion.userid !== currentUser.value.id && !reportedDiscussions.value.has(discussion.id)

  const canFollowUser = (userId: number): boolean => userId !== currentUser.value.id

  // 计算属性
  const followingCount = computed(() => followingUsers.value.size)

  const isFollowingUser = (userId: number): boolean => followingUsers.value.has(userId)

  const hasReportedDiscussion = (discussionId: number): boolean => reportedDiscussions.value.has(discussionId)

  return {
    // 状态
    currentUser,
    followingUsers,
    reportedDiscussions,
    reportTypes,

    // 方法
    togglePinDiscussion,
    toggleFeatureDiscussion,
    reportDiscussion,
    toggleFollowUser,
    deleteDiscussion,

    // 权限检查
    isAdmin,
    canPinDiscussion,
    canFeatureDiscussion,
    canDeleteDiscussion,
    canReportDiscussion,
    canFollowUser,

    // 计算属性
    followingCount,
    isFollowingUser,
    hasReportedDiscussion,
  }
}
