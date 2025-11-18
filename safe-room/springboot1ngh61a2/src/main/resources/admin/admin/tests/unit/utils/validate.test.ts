import { describe, it, expect } from 'vitest'
import {
  validateEmail,
  validatePhone,
  validatePassword,
  validateRequired,
  validatePasswordConfirm,
  validateUsername,
  rules,
} from '@/utils/validate'

describe('validate.ts', () => {
  describe('validateEmail', () => {
    it('应该验证有效的邮箱地址', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@example.co.uk')).toBe(true)
      expect(validateEmail('user+tag@example.com')).toBe(true)
    })

    it('应该拒绝无效的邮箱地址', () => {
      expect(validateEmail('invalid')).toBe(false)
      expect(validateEmail('invalid@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('invalid@example')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('validatePhone', () => {
    it('应该验证有效的手机号', () => {
      expect(validatePhone('13800138000')).toBe(true)
      expect(validatePhone('15912345678')).toBe(true)
      expect(validatePhone('18600000000')).toBe(true)
    })

    it('应该拒绝无效的手机号', () => {
      expect(validatePhone('12345678901')).toBe(false)
      expect(validatePhone('1380013800')).toBe(false)
      expect(validatePhone('23800138000')).toBe(false)
      expect(validatePhone('')).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('应该验证至少6位的密码', () => {
      expect(validatePassword('123456')).toBe(true)
      expect(validatePassword('password123')).toBe(true)
      expect(validatePassword('abcdefgh')).toBe(true)
    })

    it('应该拒绝少于6位的密码', () => {
      expect(validatePassword('12345')).toBe(false)
      expect(validatePassword('abc')).toBe(false)
      expect(validatePassword('')).toBe(false)
    })
  })

  describe('validateRequired', () => {
    it('应该验证非空字符串', () => {
      expect(validateRequired('test')).toBe(true)
      expect(validateRequired('  test  ')).toBe(true)
    })

    it('应该拒绝空值', () => {
      expect(validateRequired('')).toBe(false)
      expect(validateRequired('   ')).toBe(false)
      expect(validateRequired(null)).toBe(false)
      expect(validateRequired(undefined)).toBe(false)
    })

    it('应该验证数组', () => {
      expect(validateRequired([1, 2, 3])).toBe(true)
      expect(validateRequired([])).toBe(false)
    })

    it('应该验证其他类型', () => {
      expect(validateRequired(0)).toBe(true)
      expect(validateRequired(false)).toBe(true)
      expect(validateRequired({})).toBe(true)
    })
  })

  describe('validatePasswordConfirm', () => {
    it('应该验证密码确认匹配', () => {
      expect(validatePasswordConfirm('password123', 'password123')).toBe(true)
      expect(validatePasswordConfirm('', '')).toBe(true)
    })

    it('应该拒绝不匹配的密码', () => {
      expect(validatePasswordConfirm('password123', 'password456')).toBe(false)
      expect(validatePasswordConfirm('password', '')).toBe(false)
    })
  })

  describe('validateUsername', () => {
    it('应该验证有效的用户名', () => {
      expect(validateUsername('user123')).toBe(true)
      expect(validateUsername('user_name')).toBe(true)
      expect(validateUsername('User123')).toBe(true)
      expect(validateUsername('abc')).toBe(true)
      expect(validateUsername('a'.repeat(20))).toBe(true)
    })

    it('应该拒绝无效的用户名', () => {
      expect(validateUsername('ab')).toBe(false)
      expect(validateUsername('a'.repeat(21))).toBe(false)
      expect(validateUsername('user-name')).toBe(false)
      expect(validateUsername('user name')).toBe(false)
      expect(validateUsername('')).toBe(false)
    })
  })

  describe('rules', () => {
    describe('required', () => {
      it('应该创建必填验证规则', () => {
        const rule = rules.required('此字段为必填项')
        expect(rule.required).toBe(true)
        expect(rule.message).toBe('此字段为必填项')
        expect(rule.trigger).toBe('blur')
        expect(typeof rule.validator).toBe('function')
      })

      it('应该使用默认消息', () => {
        const rule = rules.required()
        expect(rule.message).toBe('此字段为必填项')
      })
    })

    describe('email', () => {
      it('应该创建邮箱验证规则', () => {
        const rule = rules.email('请输入有效的邮箱地址')
        expect(rule.type).toBe('email')
        expect(rule.message).toBe('请输入有效的邮箱地址')
        expect(rule.trigger).toBe('blur')
        expect(typeof rule.validator).toBe('function')
      })
    })

    describe('phone', () => {
      it('应该创建手机号验证规则', () => {
        const rule = rules.phone('请输入有效的手机号')
        expect(rule.pattern).toBeInstanceOf(RegExp)
        expect(rule.message).toBe('请输入有效的手机号')
        expect(rule.trigger).toBe('blur')
      })
    })

    describe('password', () => {
      it('应该创建密码验证规则', () => {
        const rule = rules.password('密码长度至少6位')
        expect(rule.min).toBe(6)
        expect(rule.message).toBe('密码长度至少6位')
        expect(rule.trigger).toBe('blur')
      })
    })
  })
})

