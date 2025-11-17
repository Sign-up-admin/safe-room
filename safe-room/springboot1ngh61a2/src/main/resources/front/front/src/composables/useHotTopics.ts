import { ref, computed, type Ref } from 'vue'
import type { Discussjianshenkecheng } from '@/types/modules'

// 类型定义
export interface HotTopic {
  id: number
  title: string
  description: string
  heat: number
  postCount: number
  trend: 'up' | 'hot' | 'new'
  lastActivity: string
  tags?: string[]
}

// 时间范围枚举
export type TimeRange = '24h' | '7d' | '30d' | 'all'

// 热门度计算权重
const WEIGHTS = {
  replyCount: 2.0,    // 回复数量权重
  likeCount: 1.5,     // 点赞数量权重
  viewCount: 0.5,     // 浏览数量权重
  timeDecay: 0.8,     // 时间衰减系数
  tagBonus: 0.3       // 标签匹配奖励
}

export function useHotTopics(discussions: Ref<Discussjianshenkecheng[]>) {
  // 状态
  const timeRange = ref<TimeRange>('7d')
  const userInterests = ref<string[]>([]) // 用户兴趣标签

  // 计算热门话题
  const hotTopics = computed(() => {
    const now = new Date()
    const timeThreshold = getTimeThreshold(timeRange.value, now)

    // 筛选时间范围内的讨论
    const filteredDiscussions = discussions.value.filter(discussion => {
      const discussionTime = new Date(discussion.addtime || '')
      return discussionTime >= timeThreshold
    })

    // 计算每个话题的热度
    const topicMap = new Map<string, {
      discussions: Discussjianshenkecheng[]
      totalHeat: number
      lastActivity: Date
      tags: Set<string>
    }>()

    filteredDiscussions.forEach(discussion => {
      const tags = discussion.tags || []
      const discussionHeat = calculateDiscussionHeat(discussion)
      const discussionTime = new Date(discussion.addtime || '')

      tags.forEach(tag => {
        if (!topicMap.has(tag)) {
          topicMap.set(tag, {
            discussions: [],
            totalHeat: 0,
            lastActivity: discussionTime,
            tags: new Set()
          })
        }

        const topicData = topicMap.get(tag)!
        topicData.discussions.push(discussion)
        topicData.totalHeat += discussionHeat
        topicData.lastActivity = discussionTime > topicData.lastActivity ? discussionTime : topicData.lastActivity
        tags.forEach(t => topicData.tags.add(t))
      })
    })

    // 转换为热门话题列表
    const topics: HotTopic[] = Array.from(topicMap.entries()).map(([tagName, data]) => ({
      id: generateTopicId(tagName),
      title: tagName,
      description: generateTopicDescription(data.discussions),
      heat: Math.round(data.totalHeat),
      postCount: data.discussions.length,
      trend: calculateTrend(tagName, data.totalHeat),
      lastActivity: data.lastActivity.toISOString(),
      tags: Array.from(data.tags)
    }))

    // 按热度排序
    return topics.sort((a, b) => b.heat - a.heat).slice(0, 10)
  })

  // 推荐话题（基于用户兴趣）
  const recommendedTopics = computed(() => {
    if (userInterests.value.length === 0) {
      return hotTopics.value.slice(0, 5) // 如果没有用户兴趣，返回最热门的
    }

    return hotTopics.value
      .map(topic => ({
        ...topic,
        relevanceScore: calculateRelevanceScore(topic, userInterests.value)
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5)
  })

  // 按时间范围分组的热门话题
  const topicsByTimeRange = computed(() => {
    const ranges: TimeRange[] = ['24h', '7d', '30d']
    const result: Record<TimeRange, HotTopic[]> = {} as any

    ranges.forEach(range => {
      const originalRange = timeRange.value
      timeRange.value = range
      result[range] = hotTopics.value.slice(0, 5)
      timeRange.value = originalRange
    })

    return result
  })

  // 方法
  const setTimeRange = (range: TimeRange) => {
    timeRange.value = range
  }

  const setUserInterests = (interests: string[]) => {
    userInterests.value = interests
  }

  const getTopicDetails = (topicId: number) => {
    return hotTopics.value.find(topic => topic.id === topicId)
  }

  // 辅助函数
  function getTimeThreshold(range: TimeRange, now: Date): Date {
    const thresholds = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      'all': Infinity
    }

    return new Date(now.getTime() - thresholds[range])
  }

  function calculateDiscussionHeat(discussion: Discussjianshenkecheng): number {
    const replyCount = (discussion.replies?.length || 0) + (discussion.replyCount || 0)
    const likeCount = discussion.likes || 0
    const viewCount = discussion.viewCount || 0

    // 基础热度计算
    let heat = replyCount * WEIGHTS.replyCount +
               likeCount * WEIGHTS.likeCount +
               viewCount * WEIGHTS.viewCount

    // 时间衰减
    const discussionTime = new Date(discussion.addtime || '')
    const now = new Date()
    const hoursSincePosted = (now.getTime() - discussionTime.getTime()) / (1000 * 60 * 60)
    const timeDecayFactor = Math.pow(WEIGHTS.timeDecay, Math.log10(hoursSincePosted + 1))
    heat *= timeDecayFactor

    // 标签匹配奖励（如果有用户兴趣）
    if (userInterests.value.length > 0 && discussion.tags) {
      const matchingTags = discussion.tags.filter(tag => userInterests.value.includes(tag))
      heat += matchingTags.length * WEIGHTS.tagBonus
    }

    return Math.max(heat, 0.1) // 确保最小热度
  }

  function generateTopicId(tagName: string): number {
    let hash = 0
    for (let i = 0; i < tagName.length; i++) {
      const char = tagName.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    return Math.abs(hash)
  }

  function generateTopicDescription(discussions: Discussjianshenkecheng[]): string {
    if (discussions.length === 0) return '暂无讨论'

    const totalReplies = discussions.reduce((sum, d) => sum + ((d.replies?.length || 0) + (d.replyCount || 0)), 0)
    const totalLikes = discussions.reduce((sum, d) => sum + (d.likes || 0), 0)

    return `${discussions.length}个讨论，${totalReplies}条回复，${totalLikes}个点赞`
  }

  function calculateTrend(tagName: string, currentHeat: number): 'up' | 'hot' | 'new' {
    // 简化的趋势计算逻辑
    // 在实际应用中，这应该基于历史数据计算
    if (currentHeat > 50) return 'hot'
    if (currentHeat > 20) return 'up'
    return 'new'
  }

  function calculateRelevanceScore(topic: HotTopic, userInterests: string[]): number {
    // 基于用户兴趣计算相关性分数
    let score = topic.heat * 0.3 // 基础热度贡献30%

    // 标签匹配度贡献
    const matchingTags = topic.tags?.filter(tag => userInterests.includes(tag)) || []
    score += (matchingTags.length / Math.max(userInterests.length, 1)) * 0.7 * 100

    return score
  }

  return {
    // 状态
    timeRange,
    userInterests,

    // 计算属性
    hotTopics,
    recommendedTopics,
    topicsByTimeRange,

    // 方法
    setTimeRange,
    setUserInterests,
    getTopicDetails
  }
}
