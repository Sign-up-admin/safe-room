import { describe, it, expect } from 'vitest'
import {
  validateEmail,
  validatePhone,
  validateIdCard,
  validateUrl,
  containsSqlInjection,
  containsXss,
  validateFileExtension,
  validateMimeType,
  validateFileSize,
  validatePasswordStrength,
  validateUsername,
  validateInput,
} from '@/utils/validator'

describe('validator', () => {
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
      expect(validateEmail('user..name@example.com')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })

    it('应该处理带空格的邮箱', () => {
      expect(validateEmail(' test@example.com ')).toBe(true)
      expect(validateEmail('test @example.com')).toBe(false)
    })
  })

  describe('validatePhone', () => {
    it('应该验证有效的手机号', () => {
      expect(validatePhone('13800138000')).toBe(true)
      expect(validatePhone('15912345678')).toBe(true)
      expect(validatePhone('18612345678')).toBe(true)
    })

    it('应该拒绝无效的手机号', () => {
      expect(validatePhone('12345678901')).toBe(false)
      expect(validatePhone('1380013800')).toBe(false)
      expect(validatePhone('23800138000')).toBe(false)
      expect(validatePhone('')).toBe(false)
    })

    it('应该处理带空格的手机号', () => {
      expect(validatePhone(' 13800138000 ')).toBe(true)
    })
  })

  describe('validateIdCard', () => {
    it('应该验证有效的身份证号', () => {
      expect(validateIdCard('110101199001011234')).toBe(true)
      expect(validateIdCard('110101900101123')).toBe(true)
      expect(validateIdCard('11010119900101123X')).toBe(true)
      expect(validateIdCard('11010119900101123x')).toBe(true)
    })

    it('应该拒绝无效的身份证号', () => {
      expect(validateIdCard('12345678901234567')).toBe(false)
      expect(validateIdCard('11010119900101123A')).toBe(false)
      expect(validateIdCard('')).toBe(false)
    })
  })

  describe('validateUrl', () => {
    it('应该验证有效的URL', () => {
      expect(validateUrl('https://example.com')).toBe(true)
      expect(validateUrl('http://example.com')).toBe(true)
      expect(validateUrl('https://example.com/path?query=1')).toBe(true)
    })

    it('应该拒绝无效的URL', () => {
      expect(validateUrl('not-a-url')).toBe(false)
      expect(validateUrl('example.com')).toBe(false)
      expect(validateUrl('')).toBe(false)
    })
  })

  describe('containsSqlInjection', () => {
    it('应该检测SQL注入模式', () => {
      expect(containsSqlInjection("' OR '1'='1")).toBe(true)
      expect(containsSqlInjection('SELECT * FROM users')).toBe(true)
      expect(containsSqlInjection('DROP TABLE users')).toBe(true)
      expect(containsSqlInjection('admin--')).toBe(true)
      expect(containsSqlInjection('test; DELETE FROM users')).toBe(true)
    })

    it('应该允许正常输入', () => {
      expect(containsSqlInjection('hello world')).toBe(false)
      expect(containsSqlInjection('user@example.com')).toBe(false)
      expect(containsSqlInjection('')).toBe(false)
    })
  })

  describe('containsXss', () => {
    it('应该检测XSS攻击模式', () => {
      expect(containsXss('<script>alert("xss")</script>')).toBe(true)
      expect(containsXss('javascript:alert("xss")')).toBe(true)
      expect(containsXss('<img onclick="alert(1)">')).toBe(true)
      expect(containsXss('<iframe src="evil.com"></iframe>')).toBe(true)
    })

    it('应该允许正常输入', () => {
      expect(containsXss('hello world')).toBe(false)
      expect(containsXss('<p>Hello</p>')).toBe(false)
      expect(containsXss('')).toBe(false)
    })
  })

  describe('validateFileExtension', () => {
    it('应该验证文件扩展名', () => {
      expect(validateFileExtension('test.jpg', ['jpg', 'png'])).toBe(true)
      expect(validateFileExtension('test.PNG', ['jpg', 'png'])).toBe(true)
      expect(validateFileExtension('test.pdf', ['pdf', 'doc'])).toBe(true)
    })

    it('应该拒绝不允许的扩展名', () => {
      expect(validateFileExtension('test.exe', ['jpg', 'png'])).toBe(false)
      expect(validateFileExtension('test', ['jpg', 'png'])).toBe(false)
      expect(validateFileExtension('', ['jpg', 'png'])).toBe(false)
    })
  })

  describe('validateMimeType', () => {
    it('应该验证MIME类型', () => {
      expect(validateMimeType('image/jpeg', ['image/jpeg', 'image/png'])).toBe(true)
      expect(validateMimeType('IMAGE/PNG', ['image/jpeg', 'image/png'])).toBe(true)
    })

    it('应该拒绝不允许的MIME类型', () => {
      expect(validateMimeType('application/exe', ['image/jpeg'])).toBe(false)
      expect(validateMimeType('', ['image/jpeg'])).toBe(false)
    })
  })

  describe('validateFileSize', () => {
    it('应该验证文件大小', () => {
      expect(validateFileSize(1024, 2048)).toBe(true)
      expect(validateFileSize(2048, 2048)).toBe(true)
      expect(validateFileSize(0, 2048)).toBe(false)
      expect(validateFileSize(3000, 2048)).toBe(false)
    })
  })

  describe('validatePasswordStrength', () => {
    it('应该验证强密码', () => {
      expect(validatePasswordStrength('Password123')).toBe(true)
      expect(validatePasswordStrength('abc123XYZ')).toBe(true)
    })

    it('应该拒绝弱密码', () => {
      expect(validatePasswordStrength('password')).toBe(false)
      expect(validatePasswordStrength('12345678')).toBe(false)
      expect(validatePasswordStrength('short')).toBe(false)
      expect(validatePasswordStrength('')).toBe(false)
    })

    it('应该支持自定义最小长度', () => {
      expect(validatePasswordStrength('ab1', 3)).toBe(true)
      expect(validatePasswordStrength('ab1', 10)).toBe(false)
    })
  })

  describe('validateUsername', () => {
    it('应该验证有效的用户名', () => {
      expect(validateUsername('user123')).toBe(true)
      expect(validateUsername('user_name')).toBe(true)
      expect(validateUsername('user-name')).toBe(true)
    })

    it('应该拒绝无效的用户名', () => {
      expect(validateUsername('ab')).toBe(false)
      expect(validateUsername('user@name')).toBe(false)
      expect(validateUsername('user name')).toBe(false)
      expect(validateUsername('')).toBe(false)
    })

    it('应该支持自定义长度', () => {
      expect(validateUsername('ab', 2, 5)).toBe(true)
      expect(validateUsername('a', 2, 5)).toBe(false)
      expect(validateUsername('abcdef', 2, 5)).toBe(false)
    })
  })

  describe('validateInput', () => {
    it('应该验证正常输入', () => {
      const result = validateInput('hello world')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该检测SQL注入', () => {
      const result = validateInput("' OR '1'='1")
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('输入包含非法字符，疑似SQL注入攻击')
    })

    it('应该检测XSS攻击', () => {
      const result = validateInput('<script>alert("xss")</script>')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('输入包含非法字符，疑似XSS攻击')
    })

    it('应该处理空输入', () => {
      const result = validateInput('')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('输入不能为空')
    })
  })
})
