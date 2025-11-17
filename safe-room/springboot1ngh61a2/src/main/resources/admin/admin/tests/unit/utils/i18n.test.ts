import { describe, it, expect } from 'vitest'
import { generateTitle } from '../../../src/utils/i18n'

describe('i18n工具', () => {
  describe('generateTitle', () => {
    it('应该返回原始标题', () => {
      const title = '测试标题'
      const result = generateTitle(title)
      expect(result).toBe(title)
    })

    it('应该能够处理空字符串', () => {
      const result = generateTitle('')
      expect(result).toBe('')
    })

    it('应该能够处理英文标题', () => {
      const title = 'Test Title'
      const result = generateTitle(title)
      expect(result).toBe(title)
    })

    it('应该能够处理特殊字符', () => {
      const title = 'Test & Title'
      const result = generateTitle(title)
      expect(result).toBe(title)
    })

      it('应该能够处理长标题', () => {
      const title = '这是一个很长的测试标题，用于测试长文本的处理能�?
      const result = generateTitle(title)
      expect(result).toBe(title)
    })
  })
})

