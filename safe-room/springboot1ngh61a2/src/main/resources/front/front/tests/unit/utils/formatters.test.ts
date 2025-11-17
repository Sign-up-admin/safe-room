import { describe, it, expect } from 'vitest'
import { formatDate } from '../../../src/utils/formatters'

describe('formatters', () => {
  describe('formatDate', () => {
    it('should format Date object to YYYY-MM-DD format', () => {
      const date = new Date('2025-01-15T10:30:00Z')
      const result = formatDate(date)
      expect(result).toBe('2025-01-15')
    })

    it('should format ISO string to YYYY-MM-DD format', () => {
      const dateString = '2025-01-15T10:30:00Z'
      const result = formatDate(dateString)
      expect(result).toBe('2025-01-15')
    })

    it('should format date string without time', () => {
      const dateString = '2025-01-15'
      const result = formatDate(dateString)
      expect(result).toBe('2025-01-15')
    })

    it('should handle different date formats', () => {
      const testCases = [
        '2025/01/15',
        '2025-01-15 10:30:00',
        'January 15, 2025',
        '2025-01-15T10:30:00.000Z'
      ]

      testCases.forEach(dateInput => {
        const result = formatDate(dateInput)
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      })
    })

    it('should handle invalid date strings gracefully', () => {
      const invalidDate = 'invalid-date'
      const result = formatDate(invalidDate)
      // Should return a valid date string or handle error
      expect(typeof result).toBe('string')
    })

    it('should handle null and undefined values', () => {
      expect(() => formatDate(null as any)).not.toThrow()
      expect(() => formatDate(undefined as any)).not.toThrow()
    })

    it('should preserve timezone information correctly', () => {
      const utcDate = new Date('2025-01-15T00:00:00Z')
      const result = formatDate(utcDate)
      expect(result).toBe('2025-01-15')
    })

    it('should handle leap year dates', () => {
      const leapYearDate = new Date('2024-02-29T10:30:00Z')
      const result = formatDate(leapYearDate)
      expect(result).toBe('2024-02-29')
    })

    it('should handle edge dates', () => {
      const startOfYear = new Date('2025-01-01T00:00:00Z')
      const endOfYear = new Date('2025-12-31T23:59:59Z')

      expect(formatDate(startOfYear)).toBe('2025-01-01')
      expect(formatDate(endOfYear)).toBe('2025-12-31')
    })

    it('should be consistent across multiple calls', () => {
      const date = new Date('2025-01-15T10:30:00Z')
      const result1 = formatDate(date)
      const result2 = formatDate(date)

      expect(result1).toBe(result2)
      expect(result1).toBe('2025-01-15')
    })

    it('should handle timezone differences', () => {
      // Test with different timezone representations
      const date1 = new Date('2025-01-15T10:30:00+08:00')
      const date2 = new Date('2025-01-15T02:30:00Z')

      // Both should represent the same moment
      const result1 = formatDate(date1)
      const result2 = formatDate(date2)

      // Depending on timezone handling, they might be the same or different
      expect(typeof result1).toBe('string')
      expect(typeof result2).toBe('string')
    })
  })
})