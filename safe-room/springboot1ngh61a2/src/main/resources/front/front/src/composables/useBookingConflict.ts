import { computed, ref } from 'vue'
import { getModuleService } from '@/services/crud'
import type { Kechengyuyue, Sijiaoyuyue } from '@/types/modules'
import { formatDate } from '@/utils/formatters'

const DEFAULT_SLOT_CAPACITY = 12

interface ConflictUsage {
  course: number
  coach: number
  courseItems: Kechengyuyue[]
  coachItems: Sijiaoyuyue[]
}

function normalizeTime(time?: string) {
  if (!time) return ''
  return time.slice(0, 5)
}

function extractSlot(value?: string) {
  if (!value) return null
  const [date, time] = value.split(' ')
  if (!date || !time) return null
  return {
    date,
    time: normalizeTime(time),
  }
}

function slotKeyByParts(date: string, time: string) {
  return `${date}_${time}`
}

function resolveUserAccount() {
  if (typeof window === 'undefined') return undefined
  try {
    const raw = localStorage.getItem('userInfo')
    if (raw) {
      const parsed = JSON.parse(raw)
      return parsed.yonghuzhanghao || parsed.yonghuming || parsed.username
    }
  } catch (error) {
    console.warn('[useBookingConflict] failed to parse userInfo', error)
  }
  return localStorage.getItem('front_username') ?? undefined
}

export function useBookingConflict(userAccount?: string) {
  const account = ref(userAccount ?? resolveUserAccount())
  const courseService = getModuleService('kechengyuyue')
  const coachService = getModuleService('sijiaoyuyue')

  const loading = ref(false)
  const courseBookings = ref<Kechengyuyue[]>([])
  const coachBookings = ref<Sijiaoyuyue[]>([])

  const usageMap = computed(() => {
    const map = new Map<string, ConflictUsage>()

    const stack = [
      {
        list: courseBookings.value,
        type: 'course' as const,
      },
      {
        list: coachBookings.value,
        type: 'coach' as const,
      },
    ]

    stack.forEach(({ list, type }) => {
      list.forEach(item => {
        const slot = extractSlot(item.yuyueshijian)
        if (!slot) return
        const key = slotKeyByParts(slot.date, slot.time)
        if (!map.has(key)) {
          map.set(key, {
            course: 0,
            coach: 0,
            courseItems: [],
            coachItems: [],
          })
        }
        const target = map.get(key)!
        target[type] += 1
        if (type === 'course') {
          target.courseItems.push(item as Kechengyuyue)
        } else {
          target.coachItems.push(item as Sijiaoyuyue)
        }
      })
    })

    return map
  })

  async function refresh() {
    loading.value = true
    try {
      const filters = account.value ? { yonghuzhanghao: account.value } : {}
      const [courseResp, coachResp] = await Promise.all([
        courseService.list({ page: 1, limit: 200, ...filters }),
        coachService.list({ page: 1, limit: 200, ...filters }),
      ])

      courseBookings.value = courseResp.list ?? []
      coachBookings.value = coachResp.list ?? []
    } finally {
      loading.value = false
    }
  }

  function usageAt(isoDate: string, time: string) {
    const key = slotKeyByParts(formatDate(isoDate), time)
    return usageMap.value.get(key)
  }

  function resolveRemaining(isoDate: string, time: string, capacity = DEFAULT_SLOT_CAPACITY) {
    const usage = usageAt(isoDate, time)
    const used = usage ? usage.course + usage.coach : 0
    return Math.max(capacity - used, 0)
  }

  function hasConflict(isoDate: string, time: string) {
    const usage = usageAt(isoDate, time)
    if (!usage) return false
    return usage.course > 0 || usage.coach > 0
  }

  function conflictDetails(isoDate: string, time: string) {
    const usage = usageAt(isoDate, time)
    if (!usage) return []
    const details: string[] = []
    usage.courseItems.forEach(item => {
      const courseName = item.kechengmingcheng ?? '未知课程'
      const coachName = item.jiaolianxingming ? `（${item.jiaolianxingming}）` : ''
      details.push(`课程预约：${courseName}${coachName}`)
    })
    usage.coachItems.forEach(item => {
      const coachName = item.jiaolianxingming ?? '未知教练'
      const price = item.sijiaojiage ? ` ¥${item.sijiaojiage}` : ''
      details.push(`私教预约：${coachName}${price}`)
    })
    return details
  }

  function getConflictSummary(isoDate: string, time: string) {
    const usage = usageAt(isoDate, time)
    if (!usage) return null

    const totalConflicts = usage.course + usage.coach
    const types: string[] = []
    if (usage.course > 0) types.push(`${usage.course}个课程预约`)
    if (usage.coach > 0) types.push(`${usage.coach}个私教预约`)

    return {
      total: totalConflicts,
      types: types.join('、'),
      details: conflictDetails(isoDate, time),
      hasCourseConflict: usage.course > 0,
      hasCoachConflict: usage.coach > 0,
    }
  }

  function getConflictMessage(isoDate: string, time: string): string {
    const summary = getConflictSummary(isoDate, time)
    if (!summary) return ''

    const dateStr = formatDate(isoDate)
    if (summary.total === 1) {
      return `该时间段（${dateStr} ${time}）与您的${summary.types}冲突`
    }
    return `该时间段（${dateStr} ${time}）与您的${summary.types}冲突，共${summary.total}个预约`
  }

  // 获取智能时间建议
  function getTimeSuggestions(
    isoDate: string,
    preferredTime?: string,
  ): Array<{
    time: string
    period: string
    score: number
    reason: string
  }> {
    const slots = [
      { time: '08:00', period: '清晨' },
      { time: '10:00', period: '上午' },
      { time: '13:30', period: '下午' },
      { time: '16:30', period: '黄昏' },
      { time: '20:00', period: '夜训' },
    ]

    const suggestions = slots.map(slot => {
      const conflict = hasConflict(isoDate, slot.time)
      const remaining = resolveRemaining(isoDate, slot.time)

      let score = 10 // 基础分数
      let reason = '推荐时间段'

      // 冲突惩罚
      if (conflict) {
        score -= 5
        reason = '有冲突，不推荐'
      }

      // 名额奖励
      if (remaining >= 8) {
        score += 3
        reason = remaining >= 10 ? '名额充足' : '名额良好'
      } else if (remaining >= 5) {
        score += 1
        reason = '名额适中'
      } else if (remaining <= 2) {
        score -= 2
        reason = '名额紧张'
      }

      // 偏好时间奖励
      if (preferredTime && slot.time === preferredTime) {
        score += 4
        reason = '符合您的偏好时间'
      }

      // 时间段偏好（基于用户历史分析）
      const hour = parseInt(slot.time.split(':')[0])
      if (hour >= 8 && hour <= 12) {
        score += 1 // 工作日早上更受欢迎
      } else if (hour >= 18 && hour <= 21) {
        score += 2 // 晚上训练更受欢迎
      }

      return {
        time: slot.time,
        period: slot.period,
        score,
        reason,
      }
    })

    // 按分数排序，返回前3个建议
    return suggestions.sort((a, b) => b.score - a.score).slice(0, 3)
  }

  // 获取最佳可用时间
  function getBestAvailableTime(isoDate: string): { time: string; period: string } | null {
    const suggestions = getTimeSuggestions(isoDate)
    const best = suggestions.find(s => s.score >= 8) // 分数大于等于8的算优质时间
    return best ? { time: best.time, period: best.period } : null
  }

  return {
    account,
    loading,
    courseBookings,
    coachBookings,
    refresh,
    hasConflict,
    conflictDetails,
    getConflictSummary,
    getConflictMessage,
    resolveRemaining,
    getTimeSuggestions,
    getBestAvailableTime,
  }
}
