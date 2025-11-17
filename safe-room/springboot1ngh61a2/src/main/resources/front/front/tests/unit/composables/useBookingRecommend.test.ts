import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useBookingRecommend } from '@/composables/useBookingRecommend'
import type { Kechengyuyue } from '@/types/modules'
import { getModuleService } from '@/services/crud'
import { cleanupTest } from '../../utils/test-helpers'

// Mock dependencies
vi.mock('@/services/crud', () => ({
  getModuleService: vi.fn(() => ({
    list: vi.fn()
  }))
}))

vi.mock('@/utils/formatters', () => ({
  formatDate: vi.fn((date) => date.toISOString().split('T')[0])
}))

describe('useBookingRecommend', () => {
  let mockService: any

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset localStorage using our global mock
    localStorage.clear()

    mockService = vi.mocked(getModuleService)()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    cleanupTest()
  })

  describe('pattern analysis', () => {
    it('should analyze booking patterns from history', async () => {
      const mockBookings: Kechengyuyue[] = [
        {
          id: 1,
          yonghuzhanghao: 'testuser',
          yuyueshijian: '2025-01-15 19:00:00',
          kechengmingcheng: 'HIIT训练'
        },
        {
          id: 2,
          yonghuzhanghao: 'testuser',
          yuyueshijian: '2025-01-22 20:00:00',
          kechengmingcheng: '瑜伽课程'
        },
        {
          id: 3,
          yonghuzhanghao: 'testuser',
          yuyueshijian: '2025-02-05 19:30:00',
          kechengmingcheng: '力量训练'
        }
      ]

      const { analyzePattern } = useBookingRecommend()

      // Mock service response
      mockService.list.mockResolvedValue({
        list: mockBookings,
        total: 3
      })

      await analyzePattern()

      expect(mockService.list).toHaveBeenCalledWith({
        page: 1,
        limit: 100,
        yonghuzhanghao: undefined, // user not set
        sort: 'yuyueshijian',
        order: 'desc'
      })
    })

    it('should identify preferred times correctly', () => {
      const mockBookings: Kechengyuyue[] = [
        {
          id: 1,
          yonghuzhanghao: 'testuser',
          yuyueshijian: '2025-01-15 19:00:00',
          kechengmingcheng: 'HIIT训练'
        },
        {
          id: 2,
          yonghuzhanghao: 'testuser',
          yuyueshijian: '2025-01-22 20:00:00',
          kechengmingcheng: '瑜伽课程'
        }
      ]

      // Test the internal analyzeBookingPattern function
      const { analyzeBookingPattern } = require('@/composables/useBookingRecommend')
      const pattern = analyzeBookingPattern(mockBookings)

      expect(pattern).toBeDefined()
      expect(pattern.preferredTimes).toContain('19:00')
      expect(pattern.preferredTimes).toContain('20:00')
      expect(pattern.bookingFrequency).toBe(2)
    })
  })

  describe('time recommendations', () => {
    it('should generate time recommendations', () => {
      const { getTimeRecommendations } = useBookingRecommend()

      const mockConflictChecker = vi.fn().mockReturnValue(false)
      const mockCapacityChecker = vi.fn().mockReturnValue(10)

      const recommendations = getTimeRecommendations(
        '2025-01-15',
        mockConflictChecker,
        mockCapacityChecker
      )

      expect(recommendations).toBeInstanceOf(Array)
      expect(recommendations.length).toBeGreaterThan(0)

      recommendations.forEach(rec => {
        expect(rec).toHaveProperty('time')
        expect(rec).toHaveProperty('period')
        expect(rec).toHaveProperty('score')
        expect(rec).toHaveProperty('reason')
        expect(rec).toHaveProperty('confidence')
        expect(rec).toHaveProperty('isBest')
      })
    })

    it('should mark best recommendation', () => {
      const { getTimeRecommendations } = useBookingRecommend()

      const mockConflictChecker = vi.fn().mockReturnValue(false)
      const mockCapacityChecker = vi.fn().mockReturnValue(10)

      const recommendations = getTimeRecommendations(
        '2025-01-15',
        mockConflictChecker,
        mockCapacityChecker
      )

      const bestRecommendations = recommendations.filter(r => r.isBest)
      expect(bestRecommendations.length).toBe(1)
    })

    it('should penalize conflicting times', () => {
      const { getTimeRecommendations } = useBookingRecommend()

      const mockConflictChecker = vi.fn((date, time) => time === '19:00') // 19:00 has conflict
      const mockCapacityChecker = vi.fn().mockReturnValue(10)

      const recommendations = getTimeRecommendations(
        '2025-01-15',
        mockConflictChecker,
        mockCapacityChecker
      )

      const conflictedRecommendation = recommendations.find(r => r.time === '19:00')
      const nonConflictedRecommendation = recommendations.find(r => r.time !== '19:00')

      expect(conflictedRecommendation!.score).toBeLessThan(nonConflictedRecommendation!.score)
    })
  })

  describe('best recommendation', () => {
    it('should return best available time', () => {
      const { getBestRecommendation } = useBookingRecommend()

      const mockConflictChecker = vi.fn().mockReturnValue(false)
      const mockCapacityChecker = vi.fn().mockReturnValue(10)

      const best = getBestRecommendation(
        '2025-01-15',
        mockConflictChecker,
        mockCapacityChecker
      )

      expect(best).toBeTruthy()
      expect(best!.confidence).toBeGreaterThan(0.5)
      expect(best!.isBest).toBe(true)
    })

    it('should return null when no good recommendations', () => {
      const { getBestRecommendation } = useBookingRecommend()

      const mockConflictChecker = vi.fn().mockReturnValue(true) // All times conflict
      const mockCapacityChecker = vi.fn().mockReturnValue(1) // Low capacity

      const best = getBestRecommendation(
        '2025-01-15',
        mockConflictChecker,
        mockCapacityChecker
      )

      expect(best).toBeNull()
    })
  })

  describe('success prediction', () => {
    it('should predict booking success rate', () => {
      const { predictBookingSuccess } = useBookingRecommend()

      const successRate = predictBookingSuccess('19:00', '2025-01-15')

      expect(successRate).toBeGreaterThan(0)
      expect(successRate).toBeLessThanOrEqual(1)
    })
  })

  describe('user account resolution', () => {
    it('should resolve user account from localStorage', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify({
        yonghuzhanghao: 'testuser',
        yonghuming: 'Test User'
      }))

      const { useBookingRecommend } = require('@/composables/useBookingRecommend')
      const instance = useBookingRecommend()

      expect(instance.account.value).toBe('testuser')
    })

    it('should handle missing user data', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)

      const { useBookingRecommend } = require('@/composables/useBookingRecommend')
      const instance = useBookingRecommend()

      expect(instance.account.value).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    it('should handle empty booking history', () => {
      const mockBookings: Kechengyuyue[] = []

      const { analyzeBookingPattern } = require('@/composables/useBookingRecommend')
      const pattern = analyzeBookingPattern(mockBookings)

      expect(pattern.bookingFrequency).toBe(0)
      expect(pattern.preferredTimes).toEqual(['19:00', '20:00']) // Default times
    })

    it('should handle invalid booking data', () => {
      const mockBookings: Kechengyuyue[] = [
        {
          id: 1,
          yonghuzhanghao: 'testuser',
          yuyueshijian: null, // Invalid time
          kechengmingcheng: 'Test Course'
        }
      ]

      const { analyzeBookingPattern } = require('@/composables/useBookingRecommend')
      const pattern = analyzeBookingPattern(mockBookings)

      expect(pattern.bookingFrequency).toBe(1)
      expect(pattern.successRate).toBe(0.5) // Default success rate
    })

    it('should handle bookings with different time formats', () => {
      const mockBookings: Kechengyuyue[] = [
        {
          id: 1,
          yonghuzhanghao: 'testuser',
          yuyueshijian: '2025-01-15 19:00:00',
          kechengmingcheng: 'Evening Course'
        },
        {
          id: 2,
          yonghuzhanghao: 'testuser',
          yuyueshijian: '2025-01-16T20:00:00.000Z', // ISO format
          kechengmingcheng: 'Night Course'
        },
        {
          id: 3,
          yonghuzhanghao: 'testuser',
          yuyueshijian: '2025-01-17 19:00', // Without seconds
          kechengmingcheng: 'Another Evening Course'
        }
      ]

      const { analyzeBookingPattern } = require('@/composables/useBookingRecommend')
      const pattern = analyzeBookingPattern(mockBookings)

      expect(pattern.bookingFrequency).toBeGreaterThan(0)
      expect(pattern.preferredTimes).toContain('19:00')
      expect(pattern.preferredTimes).toContain('20:00')
    })

    it('should handle very old booking data', () => {
      const mockBookings: Kechengyuyue[] = [
        {
          id: 1,
          yonghuzhanghao: 'testuser',
          yuyueshijian: '2020-01-15 19:00:00', // Very old date
          kechengmingcheng: 'Old Course'
        }
      ]

      const { analyzeBookingPattern } = require('@/composables/useBookingRecommend')
      const pattern = analyzeBookingPattern(mockBookings)

      // Should still analyze but with low frequency due to old data
      expect(pattern.bookingFrequency).toBeLessThan(0.1)
    })

    it('should handle weekend vs weekday preferences', () => {
      const mockBookings: Kechengyuyue[] = [
        {
          id: 1,
          yonghuzhanghao: 'testuser',
          yuyueshijian: '2025-01-11 10:00:00', // Saturday
          kechengmingcheng: 'Weekend Course 1'
        },
        {
          id: 2,
          yonghuzhanghao: 'testuser',
          yuyueshijian: '2025-01-12 10:00:00', // Sunday
          kechengmingcheng: 'Weekend Course 2'
        },
        {
          id: 3,
          yonghuzhanghao: 'testuser',
          yuyueshijian: '2025-01-13 19:00:00', // Monday
          kechengmingcheng: 'Weekday Course'
        }
      ]

      const { analyzeBookingPattern } = require('@/composables/useBookingRecommend')
      const pattern = analyzeBookingPattern(mockBookings)

      expect(pattern.bookingFrequency).toBeGreaterThan(0)
      // Should recognize morning weekend preference
      expect(pattern.preferredTimes).toContain('10:00')
    })

    it('should predict booking success rate for different times', () => {
      const mockBookings: Kechengyuyue[] = [
        {
          id: 1,
          yonghuzhanghao: 'testuser',
          yuyueshijian: '2025-01-15 19:00:00',
          kechengmingcheng: 'Evening Course'
        },
        {
          id: 2,
          yonghuzhanghao: 'testuser',
          yuyueshijian: '2025-01-16 20:00:00',
          kechengmingcheng: 'Night Course'
        }
      ]

      mockService.list.mockResolvedValueOnce({ list: mockBookings, total: 2 })

      const { predictBookingSuccess } = useBookingRecommend()

      // Test prediction for preferred time
      const preferredTimeRate = predictBookingSuccess('19:00', '2025-01-20')
      // Test prediction for non-preferred time
      const nonPreferredTimeRate = predictBookingSuccess('14:00', '2025-01-20')

      expect(preferredTimeRate).toBeGreaterThan(nonPreferredTimeRate)
      expect(preferredTimeRate).toBeGreaterThan(0)
      expect(preferredTimeRate).toBeLessThanOrEqual(1)
    })
  })
})
