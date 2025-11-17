import { describe, it, expect } from 'vitest'
import {
  maskPhone,
  maskIdCard,
  maskBankCard,
  maskEmail,
  maskName,
  maskAddress,
  maskSensitiveData
} from '@/utils/mask'

describe('mask utilities', () => {
  describe('maskPhone', () => {
    it('should mask phone numbers correctly', () => {
      expect(maskPhone('13800138000')).toBe('138****8000')
      expect(maskPhone('15012345678')).toBe('150****5678')
    })

    it('should handle custom start and end lengths', () => {
      expect(maskPhone('13800138000', 4, 3)).toBe('1380****000')
      expect(maskPhone('15012345678', 2, 2)).toBe('15*******78')
    })

    it('should not mask short phone numbers', () => {
      expect(maskPhone('138')).toBe('138')
      expect(maskPhone('')).toBe('')
      expect(maskPhone(null)).toBe('')
      expect(maskPhone(undefined)).toBe('')
    })

    it('should handle edge cases', () => {
      // 长度10，3+4=7，可以mask
      expect(maskPhone('1380013800', 3, 4)).toBe('138***3800')
      expect(maskPhone('1380013800', 2, 2)).toBe('13****00')
    })

    it('should trim whitespace', () => {
      expect(maskPhone(' 13800138000 ')).toBe('138****8000')
    })
  })

  describe('maskIdCard', () => {
    it('should mask ID card numbers correctly', () => {
      expect(maskIdCard('110101199001011234')).toBe('110***********1234')
      expect(maskIdCard('110101900101123')).toBe('110********1123')
    })

    it('should handle custom start and end lengths', () => {
      expect(maskIdCard('110101199001011234', 4, 3)).toBe('1101***********234')
      expect(maskIdCard('110101199001011234', 2, 2)).toBe('11**************34')
    })

    it('should not mask short ID cards', () => {
      expect(maskIdCard('110101')).toBe('110101')
      expect(maskIdCard('')).toBe('')
      expect(maskIdCard(null)).toBe('')
      expect(maskIdCard(undefined)).toBe('')
    })

    it('should handle 15-digit ID cards', () => {
      expect(maskIdCard('110101900101123')).toBe('110********1123')
    })

    it('should trim whitespace', () => {
      expect(maskIdCard(' 110101199001011234 ')).toBe('110***********1234')
    })
  })

  describe('maskBankCard', () => {
    it('should mask bank card numbers correctly', () => {
      expect(maskBankCard('6222021234567890123')).toBe('6222***********0123')
      expect(maskBankCard('6222 0212 3456 7890 123')).toBe('6222***********0123') // With spaces
    })

    it('should handle custom start and end lengths', () => {
      // 长度19，6+3=9，mask长度=19-9=10
      expect(maskBankCard('6222021234567890123', 6, 3)).toBe('622202**********123')
      // 长度19，2+2=4，mask长度=19-4=15
      expect(maskBankCard('6222021234567890123', 2, 2)).toBe('62****************23')
    })

    it('should not mask short card numbers', () => {
      expect(maskBankCard('6222')).toBe('6222')
      expect(maskBankCard('')).toBe('')
      expect(maskBankCard(null)).toBe('')
      expect(maskBankCard(undefined)).toBe('')
    })

    it('should remove spaces and mask correctly', () => {
      expect(maskBankCard('6222 0212 3456 7890')).toBe('6222********7890')
      expect(maskBankCard(' 6222021234567890 ')).toBe('6222********7890')
    })
  })

  describe('maskEmail', () => {
    it('should mask email addresses correctly', () => {
      expect(maskEmail('test@example.com')).toBe('t***t@example.com')
      expect(maskEmail('user123@gmail.com')).toBe('u***3@gmail.com')
      expect(maskEmail('a@b.com')).toBe('a***@b.com')
    })

    it('should handle short local parts', () => {
      expect(maskEmail('a@example.com')).toBe('a***@example.com')
      expect(maskEmail('ab@example.com')).toBe('ab***@example.com')
    })

    it('should hide domain when showDomain is false', () => {
      expect(maskEmail('test@example.com', false)).toBe('t***t@***')
      expect(maskEmail('user@gmail.com', false)).toBe('u***r@***')
    })

    it('should handle emails without @ symbol', () => {
      expect(maskEmail('testemail')).toBe('t***l')
      // 长度2，应该返回原值
      expect(maskEmail('ab')).toBe('ab')
      expect(maskEmail('a')).toBe('a')
    })

    it('should handle empty or invalid inputs', () => {
      expect(maskEmail('')).toBe('')
      expect(maskEmail(null)).toBe('')
      expect(maskEmail(undefined)).toBe('')
      expect(maskEmail('@example.com')).toBe('***@example.com')
    })

    it('should trim whitespace', () => {
      expect(maskEmail(' test@example.com ')).toBe('t***t@example.com')
    })
  })

  describe('maskName', () => {
    it('should mask names correctly', () => {
      expect(maskName('张三')).toBe('张*')
      expect(maskName('李四')).toBe('李*')
      expect(maskName('王五')).toBe('王*')
      expect(maskName('赵钱孙李')).toBe('赵***')
      expect(maskName('陈明')).toBe('陈*')
    })

    it('should not mask single character names', () => {
      expect(maskName('张')).toBe('张')
    })

    it('should handle empty or invalid inputs', () => {
      expect(maskName('')).toBe('')
      expect(maskName(null)).toBe('')
      expect(maskName(undefined)).toBe('')
    })

    it('should trim whitespace', () => {
      expect(maskName(' 张三 ')).toBe('张*')
    })
  })

  describe('maskAddress', () => {
    it('should mask addresses correctly', () => {
      // 默认keepLength=6
      expect(maskAddress('北京市朝阳区建国门外大街1号')).toBe('北京市朝阳区***')
      // 长度12，keepLength=6，应该显示前6个字符+***
      expect(maskAddress('上海市浦东新区陆家嘴金融贸易区')).toBe('上海市浦东新区***')
    })

    it('should handle custom keep length', () => {
      expect(maskAddress('北京市朝阳区建国门外大街1号', 3)).toBe('北京市朝***')
      // 如果keepLength >= 字符串长度，返回原值
      expect(maskAddress('北京市朝阳区建国门外大街1号', 20)).toBe('北京市朝阳区建国门外大街1号')
    })

    it('should not mask short addresses', () => {
      expect(maskAddress('北京市')).toBe('北京市')
      expect(maskAddress('')).toBe('')
      expect(maskAddress(null)).toBe('')
      expect(maskAddress(undefined)).toBe('')
    })

    it('should trim whitespace', () => {
      expect(maskAddress(' 北京市朝阳区 ')).toBe('北京市朝阳区')
    })
  })

  describe('maskSensitiveData', () => {
    it('should mask data based on type', () => {
      expect(maskSensitiveData('13800138000', 'phone')).toBe('138****8000')
      expect(maskSensitiveData('110101199001011234', 'idCard')).toBe('110***********1234')
      expect(maskSensitiveData('6222021234567890123', 'bankCard')).toBe('6222***********0123')
      expect(maskSensitiveData('test@example.com', 'email')).toBe('t***t@example.com')
      expect(maskSensitiveData('张三', 'name')).toBe('张*')
      expect(maskSensitiveData('北京市朝阳区建国门外大街1号', 'address')).toBe('北京市朝阳区***')
    })

    it('should return original value for unknown type', () => {
      expect(maskSensitiveData('test', 'unknown' as any)).toBe('test')
    })

    it('should handle null and undefined inputs', () => {
      expect(maskSensitiveData(null, 'phone')).toBe('')
      expect(maskSensitiveData(undefined, 'email')).toBe('')
    })

    it('should handle empty string', () => {
      expect(maskSensitiveData('', 'phone')).toBe('')
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle non-string inputs', () => {
      expect(maskPhone(13800138000 as any)).toBe('138****8000')
      expect(maskIdCard('110101199001011234')).toBe('110***********1234')
    })

    it('should handle very long strings', () => {
      const longPhone = '1'.repeat(20)
      expect(maskPhone(longPhone)).toBe(`${'1'.repeat(3)}${'*'.repeat(13)}${'1'.repeat(4)}`)

      const longAddress = 'A'.repeat(100)
      expect(maskAddress(longAddress)).toBe(`${'A'.repeat(6)}***`)
    })

    it('should handle special characters', () => {
      expect(maskEmail('test@domain.com')).toBe('t***t@domain.com')
      expect(maskName('张三@')).toBe('张**')
      expect(maskAddress('北京市朝阳区@#$%')).toBe('北京市朝阳区@#$%')
    })

    it('should handle unicode characters', () => {
      expect(maskName('王小明')).toBe('王**')
      expect(maskAddress('北京市朝阳区🚀')).toBe('北京市朝阳区***')
    })
  })

  describe('integration tests', () => {
    it('should work with real data examples', () => {
      // Phone number
      expect(maskPhone('18612345678')).toBe('186****5678')

      // ID card
      expect(maskIdCard('350181198510152234')).toBe('350***********2234')

      // Bank card
      expect(maskBankCard('6228480123456789012')).toBe('6228***********9012')

      // Email
      expect(maskEmail('john.doe@example.com')).toBe('j***e@example.com')

      // Name
      expect(maskName('李小明')).toBe('李**')

      // Address
      expect(maskAddress('广东省深圳市南山区科技园')).toBe('广东省深圳市***')
    })

    it('should be consistent with repeated calls', () => {
      const phone = '13800138000'
      expect(maskPhone(phone)).toBe(maskPhone(phone))
      expect(maskPhone(phone)).toBe('138****8000')
    })
  })
})
