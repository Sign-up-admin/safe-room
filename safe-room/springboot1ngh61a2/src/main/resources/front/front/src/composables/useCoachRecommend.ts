import { computed } from 'vue'
import type { Jianshenjiaolian } from '@/types/modules'

export interface CoachRecommendOptions {
  keyword?: string
  skill?: string
  price?: number
  userHistory?: number[] // 用户历史预约的教练ID列表
  userPreferences?: {
    preferredTimes?: string[] // 偏好的时间段
    preferredGoals?: string[] // 偏好的训练目标
    budgetRange?: [number, number] // 预算范围
  }
  currentGoals?: string[] // 当前选择的训练目标
}

export function useCoachRecommend(coaches: Jianshenjiaolian[], options: CoachRecommendOptions = {}) {
  const {
    keyword = '',
    skill = '',
    price,
    userHistory = [],
    userPreferences = {},
    currentGoals = []
  } = options

  // 计算教练评分（基于多维度因素）
  const calculateRating = (coach: Jianshenjiaolian): number => {
    let rating = 4.5 // 基础评分
    const coachId = coach.id ?? 0

    // 基础评分随机性（实际应该从后端获取真实评分）
    rating += (coachId % 10) * 0.05

    // 价格因素：价格适中加分
    const coachPrice = coach.sijiaojiage || 499
    if (coachPrice >= 400 && coachPrice <= 600) {
      rating += 0.1
    }

    // 历史预约加分
    if (userHistory.includes(coachId)) {
      rating += 0.3
    }

    // 目标匹配度评分
    if (currentGoals.length > 0) {
      const tags = extractTags(coach)
      const goalMatchCount = currentGoals.filter(goal =>
        tags.some(tag => goal.includes(tag) || tag.includes(goal.split('')[0]))
      ).length
      rating += (goalMatchCount / currentGoals.length) * 0.2
    }

    // 用户偏好匹配
    if (userPreferences.preferredGoals?.length) {
      const tags = extractTags(coach)
      const preferenceMatch = userPreferences.preferredGoals.some(pref =>
        tags.some(tag => pref.includes(tag) || tag.includes(pref.split('')[0]))
      )
      if (preferenceMatch) rating += 0.15
    }

    // 预算范围匹配
    if (userPreferences.budgetRange) {
      const [min, max] = userPreferences.budgetRange
      if (coachPrice >= min && coachPrice <= max) {
        rating += 0.1
      }
    }

    // 教练热度因子（基于ID模拟）
    const popularityBonus = ((coachId * 7) % 20) / 100
    rating += popularityBonus

    return Math.min(rating, 5.0)
  }

  // 提取教练标签
  const extractTags = (coach: Jianshenjiaolian): string[] => {
    const tags: string[] = []
    const intro = coach.gerenjianjie || ''

    if (intro.includes('增肌') || intro.includes('力量')) tags.push('增肌')
    if (intro.includes('燃脂') || intro.includes('减脂')) tags.push('燃脂')
    if (intro.includes('康复') || intro.includes('修复')) tags.push('康复')
    if (intro.includes('青少年')) tags.push('青少年')
    if (intro.includes('体态') || intro.includes('塑形')) tags.push('体态')

    return tags
  }

  // 过滤和排序教练
  const recommendedCoaches = computed(() => {
    let filtered = [...coaches]

    // 关键词过滤
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase()
      filtered = filtered.filter(
        (coach) =>
          coach.jiaolianxingming?.toLowerCase().includes(lowerKeyword) ||
          coach.gerenjianjie?.toLowerCase().includes(lowerKeyword),
      )
    }

    // 技能过滤
    if (skill) {
      filtered = filtered.filter((coach) => {
        const tags = extractTags(coach)
        return tags.includes(skill) || coach.gerenjianjie?.includes(skill)
      })
    }

    // 价格过滤
    if (price) {
      filtered = filtered.filter((coach) => {
        const coachPrice = coach.sijiaojiage || 499
        return coachPrice <= price
      })
    }

    // 智能排序算法
    filtered.sort((a, b) => {
      const ratingA = calculateRating(a)
      const ratingB = calculateRating(b)

      // 优先级1: 历史预约过的教练
      const hasHistoryA = userHistory.includes(a.id ?? 0)
      const hasHistoryB = userHistory.includes(b.id ?? 0)
      if (hasHistoryA && !hasHistoryB) return -1
      if (!hasHistoryA && hasHistoryB) return 1

      // 优先级2: 评分高低
      if (Math.abs(ratingA - ratingB) > 0.05) {
        return ratingB - ratingA
      }

      // 优先级3: 目标匹配度
      if (currentGoals.length > 0) {
        const tagsA = extractTags(a)
        const tagsB = extractTags(b)
        const matchScoreA = currentGoals.filter(goal =>
          tagsA.some(tag => goal.includes(tag) || tag.includes(goal.split('')[0]))
        ).length / currentGoals.length
        const matchScoreB = currentGoals.filter(goal =>
          tagsB.some(tag => goal.includes(tag) || tag.includes(goal.split('')[0]))
        ).length / currentGoals.length

        if (Math.abs(matchScoreA - matchScoreB) > 0.1) {
          return matchScoreB - matchScoreA
        }
      }

      // 优先级4: 价格合理性（适中价格优先）
      const priceA = a.sijiaojiage || 499
      const priceB = b.sijiaojiage || 499
      const optimalPrice = 500
      const distanceA = Math.abs(priceA - optimalPrice)
      const distanceB = Math.abs(priceB - optimalPrice)
      return distanceA - distanceB
    })

    return filtered
  })

  // 生成推荐理由
  const generateRecommendReason = (coach: Jianshenjiaolian): string => {
    const reasons: string[] = []
    const coachId = coach.id ?? 0

    // 历史预约理由
    if (userHistory.includes(coachId)) {
      reasons.push('您之前预约过的教练')
    }

    // 目标匹配理由
    if (currentGoals.length > 0) {
      const tags = extractTags(coach)
      const matchingGoals = currentGoals.filter(goal =>
        tags.some(tag => goal.includes(tag) || tag.includes(goal.split('')[0]))
      )
      if (matchingGoals.length > 0) {
        reasons.push(`擅长${matchingGoals.join('、')}`)
      }
    }

    // 评分理由
    const rating = calculateRating(coach)
    if (rating >= 4.8) {
      reasons.push('评分优秀')
    } else if (rating >= 4.5) {
      reasons.push('教练口碑良好')
    }

    // 价格理由
    const coachPrice = coach.sijiaojiage || 499
    if (coachPrice <= 500) {
      reasons.push('价格实惠')
    }

    // 如果没有具体理由，给出通用理由
    if (reasons.length === 0) {
      reasons.push('综合实力出众')
    }

    return reasons.slice(0, 2).join(' · ') // 最多显示2个理由
  }

  // 获取教练推荐详情（包含理由）
  const coachesWithReasons = computed(() =>
    recommendedCoaches.value.map(coach => ({
      ...coach,
      recommendReason: generateRecommendReason(coach),
      rating: calculateRating(coach)
    }))
  )

  return {
    recommendedCoaches,
    coachesWithReasons,
    calculateRating,
    extractTags,
    generateRecommendReason,
  }
}

