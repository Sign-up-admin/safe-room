import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import type { Huiyuanka } from '@/types/modules'

export interface MembershipSelectionState {
  selectedCardId: number | null
  hoveredCardId: number | null
  comparedCardIds: number[]
  cards: Huiyuanka[]
  isLoading: boolean
  error: string | null
}

export interface MembershipComparisonData {
  price: Record<number, number>
  duration: Record<number, number>
  priority: Record<number, number>
  trainerDiscount: Record<number, number>
  facilityAccess: Record<number, number>
  guestBenefits: Record<number, number>
}

export const useMembershipSelection = defineStore('membershipSelection', () => {
  // 状态
  const selectedCardId = ref<number | null>(null)
  const hoveredCardId = ref<number | null>(null)
  const comparedCardIds = ref<number[]>([])
  const cards = ref<Huiyuanka[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const selectedCard = computed(() => cards.value.find(card => card.id === selectedCardId.value) || null)

  const hoveredCard = computed(() => cards.value.find(card => card.id === hoveredCardId.value) || null)

  const comparedCards = computed(() => cards.value.filter(card => comparedCardIds.value.includes(card.id!)))

  const comparisonData = computed<MembershipComparisonData>(() => {
    const data: MembershipComparisonData = {
      price: {},
      duration: {},
      priority: {},
      trainerDiscount: {},
      facilityAccess: {},
      guestBenefits: {},
    }

    cards.value.forEach((card, index) => {
      if (!card.id) return

      // 价格优势计算（越高越好）
      const prices = cards.value.map(c => Number(c.jiage) || 0)
      const maxPrice = Math.max(...prices)
      const minPrice = Math.min(...prices)
      const currentPrice = Number(card.jiage) || 0
      if (maxPrice !== minPrice) {
        data.price[card.id] = 100 - ((currentPrice - minPrice) / (maxPrice - minPrice)) * 60
      } else {
        data.price[card.id] = 70
      }

      // 有效期（月数）
      data.duration[card.id] = parseInt(card.youxiaoqi || '12', 10)

      // 预约优先级（基于卡种等级）
      const priorityLevels: Record<string, number> = {
        尊享: 100,
        黑金: 100,
        高级: 75,
        提升: 75,
        标准: 50,
        体验: 25,
      }
      const cardName = card.huiyuankamingcheng?.toLowerCase() || ''
      data.priority[card.id] =
        priorityLevels[Object.keys(priorityLevels).find(level => cardName.includes(level.toLowerCase())) || '标准'] ||
        50

      // 私教折扣（折扣力度，9.5折=95，8.5折=85）
      const discountLevels: Record<string, number> = {
        尊享: 95,
        黑金: 95,
        高级: 90,
        提升: 90,
        标准: 85,
        体验: 80,
      }
      data.trainerDiscount[card.id] =
        discountLevels[Object.keys(discountLevels).find(level => cardName.includes(level.toLowerCase())) || '标准'] ||
        85

      // 设施权限（设施数量）
      const facilityLevels: Record<string, number> = {
        尊享: 100,
        黑金: 100,
        高级: 80,
        提升: 80,
        标准: 60,
        体验: 40,
      }
      data.facilityAccess[card.id] =
        facilityLevels[Object.keys(facilityLevels).find(level => cardName.includes(level.toLowerCase())) || '标准'] ||
        60

      // 嘉宾权益（活动次数）
      const guestLevels: Record<string, number> = {
        尊享: 100,
        黑金: 100,
        高级: 70,
        提升: 70,
        标准: 40,
        体验: 20,
      }
      data.guestBenefits[card.id] =
        guestLevels[Object.keys(guestLevels).find(level => cardName.includes(level.toLowerCase())) || '标准'] || 40
    })

    return data
  })

  // 推荐卡片（基于综合评分）
  const recommendedCard = computed(() => {
    if (cards.value.length === 0) return null

    let bestCard = cards.value[0]
    let bestScore = 0

    cards.value.forEach(card => {
      if (!card.id) return

      const priceScore = comparisonData.value.price[card.id] || 0
      const durationScore = Math.min(100, (comparisonData.value.duration[card.id] || 0) * 8.33)
      const priorityScore = comparisonData.value.priority[card.id] || 0
      const trainerScore = comparisonData.value.trainerDiscount[card.id] || 0
      const facilityScore = comparisonData.value.facilityAccess[card.id] || 0
      const guestScore = comparisonData.value.guestBenefits[card.id] || 0

      // 加权平均分
      const totalScore =
        priceScore * 0.25 +
        durationScore * 0.15 +
        priorityScore * 0.2 +
        trainerScore * 0.15 +
        facilityScore * 0.15 +
        guestScore * 0.1

      if (totalScore > bestScore) {
        bestScore = totalScore
        bestCard = card
      }
    })

    return bestCard
  })

  // 动作
  function setSelectedCard(cardId: number | null) {
    selectedCardId.value = cardId
  }

  function setHoveredCard(cardId: number | null) {
    hoveredCardId.value = cardId
  }

  function addToComparison(cardId: number) {
    if (!comparedCardIds.value.includes(cardId) && comparedCardIds.value.length < 3) {
      comparedCardIds.value.push(cardId)
    }
  }

  function removeFromComparison(cardId: number) {
    const index = comparedCardIds.value.indexOf(cardId)
    if (index > -1) {
      comparedCardIds.value.splice(index, 1)
    }
  }

  function clearComparison() {
    comparedCardIds.value = []
  }

  function setCards(newCards: Huiyuanka[]) {
    cards.value = newCards

    // 如果没有选中卡片，默认选中第一个或推荐卡片
    if (!selectedCardId.value && newCards.length > 0) {
      selectedCardId.value = recommendedCard.value?.id || newCards[0].id || null
    }
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading
  }

  function setError(newError: string | null) {
    error.value = newError
  }

  // 监听选中卡片变化，自动添加到对比列表
  watch(selectedCardId, newId => {
    if (newId && !comparedCardIds.value.includes(newId)) {
      addToComparison(newId)
    }
  })

  // 初始化推荐卡片
  watch(recommendedCard, newRecommended => {
    if (newRecommended && !selectedCardId.value && cards.value.length > 0) {
      selectedCardId.value = newRecommended.id || null
    }
  })

  return {
    // 状态
    selectedCardId,
    hoveredCardId,
    comparedCardIds,
    cards,
    isLoading,
    error,

    // 计算属性
    selectedCard,
    hoveredCard,
    comparedCards,
    comparisonData,
    recommendedCard,

    // 动作
    setSelectedCard,
    setHoveredCard,
    addToComparison,
    removeFromComparison,
    clearComparison,
    setCards,
    setLoading,
    setError,
  }
})

// 组合式函数版本（用于组件内部使用）
export function useMembershipSelectionComposable() {
  const store = useMembershipSelection()

  return {
    // 响应式状态
    selectedCardId: computed(() => store.selectedCardId),
    hoveredCardId: computed(() => store.hoveredCardId),
    comparedCardIds: computed(() => store.comparedCardIds),
    cards: computed(() => store.cards),
    isLoading: computed(() => store.isLoading),
    error: computed(() => store.error),

    // 计算属性
    selectedCard: computed(() => store.selectedCard),
    hoveredCard: computed(() => store.hoveredCard),
    comparedCards: computed(() => store.comparedCards),
    comparisonData: computed(() => store.comparisonData),
    recommendedCard: computed(() => store.recommendedCard),

    // 方法
    setSelectedCard: store.setSelectedCard,
    setHoveredCard: store.setHoveredCard,
    addToComparison: store.addToComparison,
    removeFromComparison: store.removeFromComparison,
    clearComparison: store.clearComparison,
    setCards: store.setCards,
    setLoading: store.setLoading,
    setError: store.setError,
  }
}
