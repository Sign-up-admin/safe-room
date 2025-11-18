import { describe, it, expect } from 'vitest'
import {
  formatDate,
  formatDateTime,
  formatCurrency,
  stripHtml,
} from '@/utils/formatters'

describe('formatters', () => {
  describe('formatDate', () => {
    it('应该格式化日期字符串', () => {
      expect(formatDate('2024-01-15')).toBe('2024-01-15')
      expect(formatDate('2024-01-15T10:30:00Z')).toBe('2024-01-15')
    })

    it('应该格式化Date对象', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      expect(formatDate(date)).toBe('2024-01-15')
    })

    it('应该格式化时间戳', () => {
      const timestamp = new Date('2024-01-15').getTime()
      expect(formatDate(timestamp)).toBe('2024-01-15')
    })

    it('应该处理无效日期', () => {
      expect(formatDate('invalid')).toBe('--')
      expect(formatDate('')).toBe('--')
      expect(formatDate(null as any)).toBe('--')
      expect(formatDate(undefined)).toBe('--')
    })

    it('应该使用自定义fallback', () => {
      expect(formatDate('invalid', 'N/A')).toBe('N/A')
      expect(formatDate(null as any, '无')).toBe('无')
    })
  })

  describe('formatDateTime', () => {
    it('应该格式化日期时间字符串', () => {
      const result = formatDateTime('2024-01-15T10:30:00Z')
      expect(result).toContain('2024-01-15')
      expect(result).toContain('10:30:00')
    })

    it('应该格式化Date对象', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const result = formatDateTime(date)
      expect(result).toContain('2024-01-15')
    })

    it('应该处理无效日期时间', () => {
      expect(formatDateTime('invalid')).toBe('--')
      expect(formatDateTime('')).toBe('--')
      expect(formatDateTime(null as any)).toBe('--')
    })

    it('应该使用自定义fallback', () => {
      expect(formatDateTime('invalid', 'N/A')).toBe('N/A')
    })
  })

  describe('formatCurrency', () => {
    it('应该格式化数字为货币', () => {
      expect(formatCurrency(100)).toBe('¥100.00')
      expect(formatCurrency(100.5)).toBe('¥100.50')
      expect(formatCurrency(100.999)).toBe('¥101.00')
    })

    it('应该格式化字符串数字', () => {
      expect(formatCurrency('100')).toBe('¥100.00')
      expect(formatCurrency('100.5')).toBe('¥100.50')
    })

    it('应该处理无效数字', () => {
      expect(formatCurrency('invalid')).toBe('¥0.00')
      expect(formatCurrency(null as any)).toBe('¥0.00')
      expect(formatCurrency(undefined)).toBe('¥0.00')
    })

    it('应该支持自定义货币符号', () => {
      expect(formatCurrency(100, '$')).toBe('$100.00')
      expect(formatCurrency(100, '€')).toBe('€100.00')
    })

    it('应该处理负数', () => {
      expect(formatCurrency(-100)).toBe('¥-100.00')
    })
  })

  describe('stripHtml', () => {
    it('应该移除HTML标签', () => {
      expect(stripHtml('<p>Hello</p>')).toBe('Hello')
      expect(stripHtml('<div><span>Test</span></div>')).toBe('Test')
    })

    it('应该处理多个空格', () => {
      expect(stripHtml('<p>Hello   World</p>')).toBe('Hello World')
    })

    it('应该处理空字符串', () => {
      expect(stripHtml('')).toBe('')
      expect(stripHtml(null as any)).toBe('')
      expect(stripHtml(undefined)).toBe('')
    })

    it('应该处理纯文本', () => {
      expect(stripHtml('Hello World')).toBe('Hello World')
    })

    it('应该处理复杂的HTML', () => {
      const html = '<div class="test"><p>Hello <strong>World</strong></p></div>'
      expect(stripHtml(html)).toBe('Hello World')
    })
  })
})
