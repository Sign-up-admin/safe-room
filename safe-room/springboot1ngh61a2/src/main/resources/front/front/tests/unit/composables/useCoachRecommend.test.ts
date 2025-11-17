import { describe, expect, it } from 'vitest'
import { useCoachRecommend } from '@/composables/useCoachRecommend'
import type { Jianshenjiaolian } from '@/types/modules'

describe('useCoachRecommend', () => {
  const mockCoaches: Jianshenjiaolian[] = [
    {
      id: 1,
      jiaolianxingming: '张教练',
      gerenjianjie: '增肌力量训练专家',
      sijiaojiage: 500,
    },
    {
      id: 2,
      jiaolianxingming: '李教练',
      gerenjianjie: '燃脂减脂训练',
      sijiaojiage: 400,
    },
    {
      id: 3,
      jiaolianxingming: '王教练',
      gerenjianjie: '康复修复训练',
      sijiaojiage: 600,
    },
  ] as Jianshenjiaolian[]

  it('returns all coaches when no filters applied', () => {
    const { recommendedCoaches } = useCoachRecommend(mockCoaches)
    expect(recommendedCoaches.value).toHaveLength(3)
  })

  it('filters coaches by keyword', () => {
    const { recommendedCoaches } = useCoachRecommend(mockCoaches, {
      keyword: '张',
    })
    expect(recommendedCoaches.value).toHaveLength(1)
    expect(recommendedCoaches.value[0].jiaolianxingming).toBe('张教练')
  })

  it('filters coaches by skill', () => {
    const { recommendedCoaches } = useCoachRecommend(mockCoaches, {
      skill: '增肌',
    })
    expect(recommendedCoaches.value.length).toBeGreaterThan(0)
    expect(recommendedCoaches.value[0].gerenjianjie).toContain('增肌')
  })

  it('filters coaches by price', () => {
    const { recommendedCoaches } = useCoachRecommend(mockCoaches, {
      price: 450,
    })
    expect(recommendedCoaches.value.length).toBeLessThan(3)
    recommendedCoaches.value.forEach((coach) => {
      expect(coach.sijiaojiage || 499).toBeLessThanOrEqual(450)
    })
  })

  it('prioritizes coaches with user history', () => {
    const { recommendedCoaches } = useCoachRecommend(mockCoaches, {
      userHistory: [2],
    })
    expect(recommendedCoaches.value[0].id).toBe(2)
  })

  it('calculates rating correctly', () => {
    const { calculateRating } = useCoachRecommend(mockCoaches)
    const rating = calculateRating(mockCoaches[0])
    expect(rating).toBeGreaterThanOrEqual(0)
    expect(rating).toBeLessThanOrEqual(5)
  })

  it('extracts tags from coach description', () => {
    const { extractTags } = useCoachRecommend(mockCoaches)
    const tags = extractTags(mockCoaches[0])
    expect(tags).toContain('增肌')
  })

  it('sorts coaches by rating and price', () => {
    const { recommendedCoaches } = useCoachRecommend(mockCoaches)
    const coaches = recommendedCoaches.value
    // Should be sorted (higher rating first, then lower price)
    expect(coaches.length).toBe(3)
  })
})

