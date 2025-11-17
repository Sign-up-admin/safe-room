import { ref, computed, reactive } from 'vue'
import type { Discussjianshenkecheng, Jianshenkecheng } from '@/types/modules'

// 类型定义
export interface UserProfile {
  id: number
  interests: string[]
  viewedItems: string[]
  likedItems: string[]
  followedUsers: number[]
  interactionHistory: InteractionRecord[]
}

export interface InteractionRecord {
  itemId: string
  itemType: 'discussion' | 'course' | 'user' | 'topic'
  action: 'view' | 'like' | 'comment' | 'share' | 'follow'
  timestamp: number
  weight: number
}

export interface RecommendationItem {
  id: string | number
  title?: string
  name?: string
  description?: string
  meta?: Array<{ label: string; value: string }>
  tags?: string[]
  likes?: number
  isLiked?: boolean
  type: 'discussion' | 'course' | 'user' | 'topic'
  score?: number
  reason?: string
}

// 推荐算法权重
const RECOMMENDATION_WEIGHTS = {
  interestMatch: 0.4,      // 兴趣匹配度
  popularity: 0.2,         // 流行度
  recency: 0.15,           // 新鲜度
  socialProof: 0.15,       // 社交证明
  diversity: 0.1           // 多样性
}

// 兴趣衰减因子（基于时间）
const INTEREST_DECAY_FACTOR = 0.95
const MAX_INTERACTION_AGE = 30 * 24 * 60 * 60 * 1000 // 30天

export function useRecommendation() {
  // 状态
  const userProfile = reactive<UserProfile>({
    id: 1,
    interests: ['训练', '健身', '饮食'],
    viewedItems: [],
    likedItems: [],
    followedUsers: [],
    interactionHistory: []
  })

  const availableItems = ref<RecommendationItem[]>([])
  const dismissedItems = ref<Set<string>>(new Set())

  // 计算属性
  const recommendations = computed(() => {
    if (availableItems.value.length === 0) return []

    // 计算每个项目的推荐分数
    const scoredItems = availableItems.value
      .filter(item => !dismissedItems.value.has(String(item.id)))
      .map(item => ({
        ...item,
        score: calculateRecommendationScore(item),
        reason: generateRecommendationReason(item)
      }))
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 10) // 取前10个

    return scoredItems
  })

  const personalizedRecommendations = computed(() => {
    return recommendations.value.filter(item => (item.score || 0) > 70)
  })

  const trendingRecommendations = computed(() => {
    return recommendations.value.filter(item => item.type === 'topic' || (item.score || 0) > 60)
  })

  // 方法
  const updateUserProfile = (updates: Partial<UserProfile>) => {
    Object.assign(userProfile, updates)
  }

  const addInteraction = (record: Omit<InteractionRecord, 'timestamp'>) => {
    const interaction: InteractionRecord = {
      ...record,
      timestamp: Date.now()
    }

    userProfile.interactionHistory.push(interaction)

    // 更新相关状态
    switch (record.action) {
      case 'view':
        if (!userProfile.viewedItems.includes(record.itemId)) {
          userProfile.viewedItems.push(record.itemId)
        }
        break
      case 'like':
        if (!userProfile.likedItems.includes(record.itemId)) {
          userProfile.likedItems.push(record.itemId)
        }
        break
      case 'follow':
        if (record.itemType === 'user' && !userProfile.followedUsers.includes(Number(record.itemId))) {
          userProfile.followedUsers.push(Number(record.itemId))
        }
        break
    }

    // 更新兴趣标签
    updateInterestsFromInteraction(interaction)
  }

  const setAvailableItems = (items: RecommendationItem[]) => {
    availableItems.value = items
  }

  const dismissRecommendation = (itemId: string | number) => {
    dismissedItems.value.add(String(itemId))
  }

  const resetDismissedItems = () => {
    dismissedItems.value.clear()
  }

  // 辅助方法
  const calculateRecommendationScore = (item: RecommendationItem): number => {
    let score = 0

    // 1. 兴趣匹配度
    const interestScore = calculateInterestMatch(item)
    score += interestScore * RECOMMENDATION_WEIGHTS.interestMatch

    // 2. 流行度
    const popularityScore = calculatePopularityScore(item)
    score += popularityScore * RECOMMENDATION_WEIGHTS.popularity

    // 3. 新鲜度
    const recencyScore = calculateRecencyScore(item)
    score += recencyScore * RECOMMENDATION_WEIGHTS.recency

    // 4. 社交证明
    const socialScore = calculateSocialProof(item)
    score += socialScore * RECOMMENDATION_WEIGHTS.socialProof

    // 5. 多样性奖励
    const diversityBonus = calculateDiversityBonus(item)
    score += diversityBonus * RECOMMENDATION_WEIGHTS.diversity

    return Math.min(Math.max(score, 0), 100)
  }

  const calculateInterestMatch = (item: RecommendationItem): number => {
    const itemTags = item.tags || []
    const userInterests = userProfile.interests

    if (userInterests.length === 0) return 50 // 默认中等匹配

    let matchCount = 0
    let totalWeight = 0

    userInterests.forEach(interest => {
      const weight = getInterestWeight(interest)
      if (itemTags.some(tag => tag.toLowerCase().includes(interest.toLowerCase()))) {
        matchCount += weight
      }
      totalWeight += weight
    })

    return totalWeight > 0 ? (matchCount / totalWeight) * 100 : 0
  }

  const calculatePopularityScore = (item: RecommendationItem): number => {
    // 基于点赞数和互动数的简单流行度计算
    const likes = item.likes || 0
    const maxLikes = Math.max(...availableItems.value.map(i => i.likes || 0))

    if (maxLikes === 0) return 50

    return (likes / maxLikes) * 100
  }

  const calculateRecencyScore = (item: RecommendationItem): number => {
    // 简单的随机新鲜度分数（实际应用中应该基于创建时间）
    // 这里可以根据项目的创建时间来计算
    return Math.random() * 100
  }

  const calculateSocialProof = (item: RecommendationItem): number => {
    // 基于用户是否关注了相关用户或点赞了类似内容
    let score = 0

    // 检查是否与用户喜欢的标签相关
    const likedTags = getLikedTags()
    const itemTags = item.tags || []

    const likedTagMatches = itemTags.filter(tag => likedTags.includes(tag)).length
    score += (likedTagMatches / Math.max(itemTags.length, 1)) * 50

    // 检查是否与关注的用户相关（这里简化处理）
    score += Math.random() * 50 // 随机社交分数

    return Math.min(score, 100)
  }

  const calculateDiversityBonus = (item: RecommendationItem): number => {
    // 奖励不同类型的内容，避免推荐过于单一
    const recentRecommendations = recommendations.value.slice(0, 5)
    const typeCount = recentRecommendations.filter(rec => rec.type === item.type).length

    // 如果这种类型的内容较少，给与奖励
    return typeCount < 2 ? 20 : 0
  }

  const generateRecommendationReason = (item: RecommendationItem): string => {
    const itemTags = item.tags || []
    const matchingInterests = userProfile.interests.filter(interest =>
      itemTags.some(tag => tag.toLowerCase().includes(interest.toLowerCase()))
    )

    if (matchingInterests.length > 0) {
      return `基于您对"${matchingInterests[0]}"的兴趣`
    }

    if ((item.score || 0) > 80) {
      return '热门推荐'
    }

    return '您可能感兴趣的内容'
  }

  const updateInterestsFromInteraction = (interaction: InteractionRecord) => {
    // 从用户互动中学习兴趣
    if (interaction.itemType === 'discussion' || interaction.itemType === 'topic') {
      // 这里可以从讨论或话题中提取标签
      // 简化实现：增加随机兴趣权重
      const possibleInterests = ['训练', '饮食', '健身', '瑜伽', '跑步', '游泳']
      const randomInterest = possibleInterests[Math.floor(Math.random() * possibleInterests.length)]

      if (!userProfile.interests.includes(randomInterest)) {
        userProfile.interests.push(randomInterest)
      }
    }
  }

  const getInterestWeight = (interest: string): number => {
    // 计算兴趣的权重（基于互动频率和时间衰减）
    const relevantInteractions = userProfile.interactionHistory
      .filter(record => {
        const age = Date.now() - record.timestamp
        return age < MAX_INTERACTION_AGE
      })
      .filter(record => {
        // 检查是否与该兴趣相关
        return record.itemType === 'discussion' || record.itemType === 'topic'
      })

    let weight = 1
    relevantInteractions.forEach(record => {
      const age = Date.now() - record.timestamp
      const decay = Math.pow(INTEREST_DECAY_FACTOR, age / (24 * 60 * 60 * 1000)) // 每日衰减
      weight += record.weight * decay
    })

    return weight
  }

  const getLikedTags = (): string[] => {
    // 从用户喜欢的讨论中提取标签
    const likedTags = new Set<string>()

    userProfile.likedItems.forEach(itemId => {
      const item = availableItems.value.find(i => String(i.id) === itemId)
      if (item && item.tags) {
        item.tags.forEach(tag => likedTags.add(tag))
      }
    })

    return Array.from(likedTags)
  }

  return {
    // 状态
    userProfile,
    availableItems,
    dismissedItems,

    // 计算属性
    recommendations,
    personalizedRecommendations,
    trendingRecommendations,

    // 方法
    updateUserProfile,
    addInteraction,
    setAvailableItems,
    dismissRecommendation,
    resetDismissedItems
  }
}
