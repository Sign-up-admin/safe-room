import { describe, it, expect } from 'vitest'
import {
  maskPhone,
  maskIdCard,
  maskBankCard,
  maskEmail,
  maskName,
  maskAddress,
  maskSensitiveData,
} from '@/utils/mask'

describe('敏感数据脱敏工具', () => {
  describe('maskPhone', () => {
    it('应该正确脱敏手机号', () => {
      expect(maskPhone('13812345678')).toBe('138****5678')
    })

    it('应该支持自定义保留位数', () => {
      expect(maskPhone('13812345678', 4, 3)).toBe('1381****678')
    })

    it('如果手机号太短，应该返回原值', () => {
      expect(maskPhone('138')).toBe('138')
    })

    it('如果手机号为null，应该返回空字符串', () => {
      expect(maskPhone(null)).toBe('')
    })

    it('如果手机号为undefined，应该返回空字符串', () => {
      expect(maskPhone(undefined)).toBe('')
    })

    it('应该能够处理带空格的手机号', () => {
      expect(maskPhone('138 1234 5678')).toBe('138****5678')
    })
  })

  describe('maskIdCard', () => {
    it('应该正确脱敏身份证号', () => {
      expect(maskIdCard('110101199001011234')).toBe('110***********1234')
    })

    it('应该支持自定义保留位数', () => {
      // 18位身份证，保留前4位和后3位，中间11位用*替代
      expect(maskIdCard('110101199001011234', 4, 3)).toBe('1101***********234')
    })

    it('如果身份证号太短，应该返回原值', () => {
      expect(maskIdCard('110')).toBe('110')
    })

    it('如果身份证号为null，应该返回空字符串', () => {
      expect(maskIdCard(null)).toBe('')
    })
  })

  describe('maskBankCard', () => {
    it('应该正确脱敏银行卡号', () => {
      expect(maskBankCard('6222021234567890123')).toBe('6222***********0123')
    })

    it('应该能够处理带空格的银行卡号', () => {
      expect(maskBankCard('6222 0212 3456 7890 123')).toBe('6222***********0123')
    })

    it('如果银行卡号太短，应该返回原值', () => {
      expect(maskBankCard('6222')).toBe('6222')
    })

    it('如果银行卡号为null，应该返回空字符串', () => {
      expect(maskBankCard(null)).toBe('')
    })
  })

  describe('maskEmail', () => {
    it('应该正确脱敏邮箱', () => {
      expect(maskEmail('test@example.com')).toBe('t***t@example.com')
    })

    it('应该能够处理短邮箱名', () => {
      expect(maskEmail('ab@example.com')).toBe('a***b@example.com')
    })

    it('如果不显示域名，应该隐藏域名', () => {
      expect(maskEmail('test@example.com', false)).toBe('t***t@***')
    })

    it('如果邮箱没有@符号，应该当作普通字符串处理', () => {
      expect(maskEmail('testemail')).toBe('t***l')
    })

    it('如果邮箱为null，应该返回空字符串', () => {
      expect(maskEmail(null)).toBe('')
    })
  })

  describe('maskName', () => {
    it('应该正确脱敏姓名（2个字）', () => {
      expect(maskName('张三')).toBe('张*')
    })

    it('应该正确脱敏姓名（3个字及以上）', () => {
      expect(maskName('张三丰')).toBe('张**')
      expect(maskName('欧阳修')).toBe('欧**')
    })

    it('如果姓名为1个字，应该返回原值', () => {
      expect(maskName('张')).toBe('张')
    })

    it('如果姓名为null，应该返回空字符串', () => {
      expect(maskName(null)).toBe('')
    })
  })

  describe('maskAddress', () => {
    it('应该正确脱敏地址', () => {
      expect(maskAddress('北京市朝阳区某某街道123号')).toBe('北京市朝阳区***')
    })

    it('应该支持自定义保留长度', () => {
      expect(maskAddress('北京市朝阳区某某街道123号', 3)).toBe('北京市***')
    })

    it('如果地址太短，应该返回原值', () => {
      expect(maskAddress('北京市', 6)).toBe('北京市')
    })

    it('如果地址为null，应该返回空字符串', () => {
      expect(maskAddress(null)).toBe('')
    })
  })

  describe('maskSensitiveData', () => {
    it('应该能够脱敏手机号', () => {
      expect(maskSensitiveData('13812345678', 'phone')).toBe('138****5678')
    })

    it('应该能够脱敏身份证号', () => {
      expect(maskSensitiveData('110101199001011234', 'idCard')).toBe('110***********1234')
    })

    it('应该能够脱敏银行卡号', () => {
      expect(maskSensitiveData('6222021234567890123', 'bankCard')).toBe('6222***********0123')
    })

    it('应该能够脱敏邮箱', () => {
      expect(maskSensitiveData('test@example.com', 'email')).toBe('t***t@example.com')
    })

    it('应该能够脱敏姓名', () => {
      expect(maskSensitiveData('张三', 'name')).toBe('张*')
    })

    it('应该能够脱敏地址', () => {
      expect(maskSensitiveData('北京市朝阳区某某街道123号', 'address')).toBe('北京市朝阳区***')
    })

    it('如果值为null，应该返回空字符串', () => {
      expect(maskSensitiveData(null, 'phone')).toBe('')
    })

    it('如果类型未知，应该返回原值', () => {
      expect(maskSensitiveData('test', 'unknown' as any)).toBe('test')
    })
  })
})

