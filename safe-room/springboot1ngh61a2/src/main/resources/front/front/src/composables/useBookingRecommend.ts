import { computed, ref, reactive } from 'vue'
import { getModuleService } from '../services/crud'
import type { Kechengyuyue } from '../types/modules'
import { formatDate } from '../utils/formatters'

interface TimePreference {
  time: string
  score: number
  frequency: number
  successRate: number
}

interface BookingPattern {
  preferredTimes: string[]
  preferredDays: number[] // 0-6, 周日到周六
  preferredPeriods: string[] // morning, afternoon, evening
  bookingFrequency: number
  preferredCourseTypes: string[]
  successRate: number
}

interface RecommendationResult {
  time: string
  period: string
  score: number
  reason: string
  confidence: number // 0-1, 推荐置信度
  isBest: boolean
}

const TIME_SLOTS = [
  { time: '08:00', period: '清晨', hour: 8 },
  { time: '10:00', period: '上午', hour: 10 },
  { time: '13:30', period: '下午', hour: 13 },
  { time: '16:30', period: '黄昏', hour: 16 },
  { time: '19:00', period: '傍晚', hour: 19 },
  { time: '20:00', period: '夜训', hour: 20 },
]

function resolveUserAccount(): string | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const raw = localStorage.getItem('userInfo')
    if (raw) {
      const parsed = JSON.parse(raw)
      return parsed.yonghuzhanghao || parsed.yonghuming || parsed.username
    }
  } catch (error) {
    console.warn('[useBookingRecommend] failed to parse userInfo', error)
  }
  return localStorage.getItem('front_username') ?? undefined
}

function analyzeBookingPattern(bookings: Kechengyuyue[]): BookingPattern {
  if (!bookings.length) {
    return {
      preferredTimes: ['19:00', '20:00'], // 默认推荐晚上时间
      preferredDays: [1, 2, 3, 4, 5], // 默认工作日
      preferredPeriods: ['傍晚', '夜训'],
      bookingFrequency: 0,
      preferredCourseTypes: [],
      successRate: 0.5,
    }
  }

  const timeStats = new Map<string, TimePreference>()
  const dayStats = new Map<number, number>()
  const periodStats = new Map<string, number>()
  const courseTypeStats = new Map<string, number>()

  let successfulBookings = 0

  bookings.forEach(booking => {
    if (!booking.yuyueshijian) return

    // 解析时间
    const dateTime = new Date(booking.yuyueshijian)
    const time = `${dateTime.getHours().toString().padStart(2, '0')}:00`
    const day = dateTime.getDay() // 0-6, 周日到周六

    // 确定时段
    const hour = dateTime.getHours()
    let period = '上午'
    if (hour >= 17) period = '傍晚'
    else if (hour >= 12) period = '下午'
    else if (hour >= 6) period = '上午'
    else period = '清晨'

    // 统计时间偏好
    if (!timeStats.has(time)) {
      timeStats.set(time, { time, score: 0, frequency: 0, successRate: 0 })
    }
    const timeStat = timeStats.get(time)!
    timeStat.frequency += 1

    // 统计星期偏好
    dayStats.set(day, (dayStats.get(day) || 0) + 1)

    // 统计时段偏好
    periodStats.set(period, (periodStats.get(period) || 0) + 1)

    // 统计课程类型偏好
    if (booking.kechengmingcheng) {
      // 简单的课程类型分类
      let courseType = '通用'
      if (booking.kechengmingcheng.includes('燃脂') || booking.kechengmingcheng.includes('减重')) {
        courseType = '燃脂塑形'
      } else if (booking.kechengmingcheng.includes('增肌') || booking.kechengmingcheng.includes('力量')) {
        courseType = '力量增肌'
      } else if (booking.kechengmingcheng.includes('瑜伽') || booking.kechengmingcheng.includes('普拉提')) {
        courseType = '瑜伽普拉提'
      }
      courseTypeStats.set(courseType, (courseTypeStats.get(courseType) || 0) + 1)
    }

    // 检查预约是否成功（假设有状态字段）
    if (booking.zhuangtai === '已确认' || booking.zhuangtai === '已完成' || !booking.zhuangtai) {
      successfulBookings += 1
    }
  })

  // 计算成功率
  const successRate = successfulBookings / bookings.length

  // 计算时间分数（基于频率和成功率）
  timeStats.forEach(stat => {
    stat.successRate = successRate
    stat.score = (stat.frequency / bookings.length) * 10 + successRate * 5
  })

  // 提取偏好时间（分数前3）
  const preferredTimes = Array.from(timeStats.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(stat => stat.time)

  // 提取偏好星期（频率前3）
  const preferredDays = Array.from(dayStats.entries())
    .sort(([, freqA], [, freqB]) => freqB - freqA)
    .slice(0, 3)
    .map(([day]) => day)

  // 提取偏小时段
  const preferredPeriods = Array.from(periodStats.entries())
    .sort(([, freqA], [, freqB]) => freqB - freqA)
    .slice(0, 2)
    .map(([period]) => period)

  // 提取偏好课程类型
  const preferredCourseTypes = Array.from(courseTypeStats.entries())
    .sort(([, freqA], [, freqB]) => freqB - freqA)
    .slice(0, 2)
    .map(([type]) => type)

  return {
    preferredTimes,
    preferredDays,
    preferredPeriods,
    bookingFrequency: bookings.length,
    preferredCourseTypes,
    successRate,
  }
}

function calculateRecommendationScore(
  timeSlot: (typeof TIME_SLOTS)[0],
  pattern: BookingPattern,
  hasConflict: boolean,
  remainingCapacity: number,
  date: Date,
): { score: number; reason: string; confidence: number } {
  let score = 5 // 基础分数
  let reason = '可用时间段'
  let confidence = 0.5

  // 时间偏好奖励
  if (pattern.preferredTimes.includes(timeSlot.time)) {
    score += 4
    reason = '符合您的预约习惯'
    confidence += 0.2
  }

  // 时段偏好奖励
  if (pattern.preferredPeriods.includes(timeSlot.period)) {
    score += 3
    reason = '符合您的偏好时段'
    confidence += 0.15
  }

  // 星期偏好奖励
  if (pattern.preferredDays.includes(date.getDay())) {
    score += 2
    reason = '符合您的偏好日期'
    confidence += 0.1
  }

  // 历史成功率奖励
  score += pattern.successRate * 3

  // 冲突惩罚
  if (hasConflict) {
    score -= 8
    reason = '时间段有冲突'
    confidence -= 0.3
  }

  // 容量奖励/惩罚
  if (remainingCapacity >= 8) {
    score += 2
    if (!hasConflict) reason = '名额充足，推荐预约'
  } else if (remainingCapacity >= 5) {
    score += 1
  } else if (remainingCapacity <= 2) {
    score -= 3
    reason = '名额紧张'
    confidence -= 0.1
  }

  // 预约频率奖励（经常预约的用户更可能继续预约）
  if (pattern.bookingFrequency >= 5) {
    score += 1
  }

  // 时间合理性检查
  const hour = timeSlot.hour
  if (hour < 6 || hour > 22) {
    score -= 2 // 太早或太晚的时间段
  }

  // 确保分数在合理范围内
  score = Math.max(0, Math.min(20, score))
  confidence = Math.max(0, Math.min(1, confidence))

  return { score, reason, confidence }
}

export function useBookingRecommend(userAccount?: string) {
  const account = ref(userAccount ?? resolveUserAccount())
  const courseService = getModuleService('kechengyuyue')

  const loading = ref(false)
  const bookingHistory = ref<Kechengyuyue[]>([])
  const pattern = ref<BookingPattern | null>(null)

  // 分析用户预约模式
  const analyzePattern = async () => {
    if (!account.value) return

    loading.value = true
    try {
      const response = await courseService.list({
        page: 1,
        limit: 100, // 获取更多历史数据进行分析
        yonghuzhanghao: account.value,
        sort: 'yuyueshijian',
        order: 'desc',
      })

      bookingHistory.value = response.list ?? []
      pattern.value = analyzeBookingPattern(bookingHistory.value)
    } finally {
      loading.value = false
    }
  }

  // 获取智能时间推荐
  const getTimeRecommendations = (
    targetDate: string,
    conflictChecker: (date: string, time: string) => boolean,
    capacityChecker: (date: string, time: string) => number,
  ): RecommendationResult[] => {
    if (!pattern.value) {
      // 如果没有分析出模式，返回默认推荐
      return TIME_SLOTS.slice(0, 3).map(slot => ({
        time: slot.time,
        period: slot.period,
        score: 5,
        reason: '默认推荐时间',
        confidence: 0.5,
        isBest: false,
      }))
    }

    const date = new Date(targetDate)
    const recommendations: RecommendationResult[] = []

    TIME_SLOTS.forEach(slot => {
      const hasConflict = conflictChecker(targetDate, slot.time)
      const remainingCapacity = capacityChecker(targetDate, slot.time)

      const { score, reason, confidence } = calculateRecommendationScore(
        slot,
        pattern.value!,
        hasConflict,
        remainingCapacity,
        date,
      )

      recommendations.push({
        time: slot.time,
        period: slot.period,
        score,
        reason,
        confidence,
        isBest: false,
      })
    })

    // 按分数排序
    recommendations.sort((a, b) => b.score - a.score)

    // 标记最佳推荐
    if (recommendations.length > 0) {
      recommendations[0].isBest = true
    }

    return recommendations
  }

  // 获取最优推荐时间
  const getBestRecommendation = (
    targetDate: string,
    conflictChecker: (date: string, time: string) => boolean,
    capacityChecker: (date: string, time: string) => number,
  ): RecommendationResult | null => {
    const recommendations = getTimeRecommendations(targetDate, conflictChecker, capacityChecker)
    return recommendations.find(r => r.confidence >= 0.7) || recommendations[0] || null
  }

  // 获取预约成功率预测
  const predictBookingSuccess = (selectedTime: string, targetDate: string): number => {
    if (!pattern.value) return 0.5

    const date = new Date(targetDate)
    const slot = TIME_SLOTS.find(s => s.time === selectedTime)
    if (!slot) return 0.5

    const { confidence } = calculateRecommendationScore(
      slot,
      pattern.value,
      false, // 假设无冲突
      10, // 假设充足容量
      date,
    )

    // 基于置信度和历史成功率计算预测成功率
    return (confidence + pattern.value.successRate) / 2
  }

  // 刷新分析数据
  const refresh = async () => {
    await analyzePattern()
  }

  // 初始化
  if (account.value) {
    analyzePattern()
  }

  return {
    loading: computed(() => loading.value),
    pattern: computed(() => pattern.value),
    bookingHistory: computed(() => bookingHistory.value),
    hasAnalysisData: computed(() => bookingHistory.value.length > 0),

    analyzePattern,
    getTimeRecommendations,
    getBestRecommendation,
    predictBookingSuccess,
    refresh,
  }
}
