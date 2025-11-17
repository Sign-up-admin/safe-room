import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMembershipSelection } from '../../../src/composables/useMembershipSelection'
import type { Huiyuanka } from '../../../src/types/modules'

describe('useMembershipSelection', () => {
  let store: ReturnType<typeof useMembershipSelection>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useMembershipSelection()
  })

  it('should initialize with default state', () => {
    expect(store.selectedCardId).toBe(null)
    expect(store.hoveredCardId).toBe(null)
    expect(store.comparedCardIds).toEqual([])
    expect(store.cards).toEqual([])
    expect(store.isLoading).toBe(false)
    expect(store.error).toBe(null)
  })

  it('should select a card', () => {
    store.setSelectedCard(1)
    expect(store.selectedCardId).toBe(1)
  })

  it('should hover a card', () => {
    store.setHoveredCard(2)
    expect(store.hoveredCardId).toBe(2)
  })

  it('should clear hover state', () => {
    store.setHoveredCard(2)
    expect(store.hoveredCardId).toBe(2)

    store.setHoveredCard(null)
    expect(store.hoveredCardId).toBe(null)
  })

  it('should add card to comparison', () => {
    store.addToComparison(1)
    expect(store.comparedCardIds).toEqual([1])
  })

  it('should remove card from comparison', () => {
    store.addToComparison(1)
    store.addToComparison(2)
    expect(store.comparedCardIds).toEqual([1, 2])

    store.removeFromComparison(1)
    expect(store.comparedCardIds).toEqual([2])
  })

  it('should clear comparison', () => {
    store.addToComparison(1)
    store.addToComparison(2)
    expect(store.comparedCardIds).toEqual([1, 2])

    store.clearComparison()
    expect(store.comparedCardIds).toEqual([])
  })

  it('should limit comparison to maximum 3 cards', () => {
    store.addToComparison(1)
    store.addToComparison(2)
    store.addToComparison(3)
    store.addToComparison(4)

    expect(store.comparedCardIds).toEqual([1, 2, 3])
  })

  it('should set cards data', () => {
    const mockCards: Huiyuanka[] = [
      {
        id: 1,
        kahao: 'VIP001',
        huiyuankamingcheng: 'VIP会员',
        huiyuankaleixing: 'VIP',
        jiage: 299,
        youxiaoqi: 365,
        createtime: new Date().toISOString()
      },
      {
        id: 2,
        kahao: 'STD001',
        huiyuankamingcheng: '标准会员',
        huiyuankaleixing: '标准',
        jiage: 199,
        youxiaoqi: 365,
        createtime: new Date().toISOString()
      }
    ]

    store.setCards(mockCards)
    expect(store.cards).toEqual(mockCards)
  })

  it('should compute selected card correctly', () => {
    const mockCards: Huiyuanka[] = [
      {
        id: 1,
        kahao: 'VIP001',
        huiyuankamingcheng: 'VIP会员',
        huiyuankaleixing: 'VIP',
        jiage: 299,
        youxiaoqi: 365,
        createtime: new Date().toISOString()
      }
    ]

    store.setCards(mockCards)
    store.setSelectedCard(1)

    expect(store.selectedCard).toEqual(mockCards[0])
  })

  it('should return null for non-existent selected card', () => {
    const mockCards: Huiyuanka[] = [
      {
        id: 1,
        kahao: 'VIP001',
        huiyuankamingcheng: 'VIP会员',
        huiyuankaleixing: 'VIP',
        jiage: 299,
        youxiaoqi: 365,
        createtime: new Date().toISOString()
      }
    ]

    store.setCards(mockCards)
    store.setSelectedCard(999) // Non-existent ID

    expect(store.selectedCard).toBe(null)
  })

  it('should compute hovered card correctly', () => {
    const mockCards: Huiyuanka[] = [
      {
        id: 1,
        kahao: 'VIP001',
        huiyuankamingcheng: 'VIP会员',
        huiyuankaleixing: 'VIP',
        jiage: 299,
        youxiaoqi: 365,
        createtime: new Date().toISOString()
      }
    ]

    store.setCards(mockCards)
    store.setHoveredCard(1)

    expect(store.hoveredCard).toEqual(mockCards[0])
  })

  it('should compute compared cards correctly', () => {
    const mockCards: Huiyuanka[] = [
      {
        id: 1,
        kahao: 'VIP001',
        huiyuankamingcheng: 'VIP会员',
        huiyuankaleixing: 'VIP',
        jiage: 299,
        youxiaoqi: 365,
        createtime: new Date().toISOString()
      },
      {
        id: 2,
        kahao: 'STD001',
        huiyuankamingcheng: '标准会员',
        huiyuankaleixing: '标准',
        jiage: 199,
        youxiaoqi: 365,
        createtime: new Date().toISOString()
      },
      {
        id: 3,
        kahao: 'BSC001',
        huiyuankamingcheng: '基础会员',
        huiyuankaleixing: '基础',
        jiage: 99,
        youxiaoqi: 365,
        createtime: new Date().toISOString()
      }
    ]

    store.setCards(mockCards)
    store.addToComparison(1)
    store.addToComparison(3)

    expect(store.comparedCards).toEqual([mockCards[0], mockCards[2]])
  })

  it('should handle loading states', () => {
    store.setLoading(true)
    expect(store.isLoading).toBe(true)

    store.setLoading(false)
    expect(store.isLoading).toBe(false)
  })

  it('should handle error states', () => {
    const errorMessage = 'Failed to load cards'
    store.setError(errorMessage)
    expect(store.error).toBe(errorMessage)

    store.setError(null)
    expect(store.error).toBe(null)
  })

  it('should reset state correctly', () => {
    // Set up some state
    store.setSelectedCard(1)
    store.setHoveredCard(2)
    store.addToComparison(1)
    store.setError('Some error')

    // Reset - since there's no reset method, we'll manually reset
    store.setSelectedCard(null)
    store.setHoveredCard(null)
    store.clearComparison()
    store.setError(null)

    expect(store.selectedCardId).toBe(null)
    expect(store.hoveredCardId).toBe(null)
    expect(store.comparedCardIds).toEqual([])
    expect(store.error).toBe(null)
  })

  it('should validate comparison limit', () => {
    // Helper function to check if can add to comparison
    const canAddToComparison = (cardId: number) => {
      return !store.comparedCardIds.includes(cardId) && store.comparedCardIds.length < 3
    }

    expect(canAddToComparison(1)).toBe(true)

    store.addToComparison(1)
    store.addToComparison(2)
    store.addToComparison(3)

    expect(canAddToComparison(4)).toBe(false) // Already at limit
    expect(canAddToComparison(1)).toBe(false) // Already in comparison
  })

  it('should check if card is in comparison', () => {
    expect(store.comparedCardIds.includes(1)).toBe(false)

    store.addToComparison(1)
    expect(store.comparedCardIds.includes(1)).toBe(true)
    expect(store.comparedCardIds.includes(2)).toBe(false)
  })

  it('should check if card is selected', () => {
    expect(store.selectedCardId === 1).toBe(false)

    store.setSelectedCard(1)
    expect(store.selectedCardId === 1).toBe(true)
    expect(store.selectedCardId === 2).toBe(false)
  })

  it('should check if card is hovered', () => {
    expect(store.hoveredCardId === 1).toBe(false)

    store.setHoveredCard(1)
    expect(store.hoveredCardId === 1).toBe(true)
    expect(store.hoveredCardId === 2).toBe(false)
  })
})
