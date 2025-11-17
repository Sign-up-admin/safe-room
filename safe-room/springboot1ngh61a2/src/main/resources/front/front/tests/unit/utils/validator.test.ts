import { describe, it, expect, vi } from 'vitest'
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
  validateInput
} from '@/utils/validator'

describe('validator utilities', () => {
  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true)
      expect(validateEmail('test123@gmail.com')).toBe(true)
    })

    it('should reject invalid email formats', () => {
      expect(validateEmail('')).toBe(false)
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('test..email@example.com')).toBe(false)
      expect(validateEmail('test@example')).toBe(false)
    })

    it('should trim whitespace', () => {
      expect(validateEmail('  test@example.com  ')).toBe(true)
      expect(validateEmail(' test@ ')).toBe(false)
    })
  })

  describe('validatePhone', () => {
    it('should validate correct Chinese phone numbers', () => {
      expect(validatePhone('13800138000')).toBe(true)
      expect(validatePhone('15012345678')).toBe(true)
      expect(validatePhone('19987654321')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('')).toBe(false)
      expect(validatePhone('12345678901')).toBe(false) // Starts with invalid digit
      expect(validatePhone('1380013800')).toBe(false) // Too short
      expect(validatePhone('138001380000')).toBe(false) // Too long
      expect(validatePhone('1380013800a')).toBe(false) // Contains letter
      expect(validatePhone('138 001 3800')).toBe(false) // Contains spaces
    })

    it('should trim whitespace', () => {
      expect(validatePhone(' 13800138000 ')).toBe(true)
    })
  })

  describe('validateIdCard', () => {
    it('should validate correct Chinese ID card numbers', () => {
      expect(validateIdCard('110101199001011234')).toBe(true) // 18 digits
      expect(validateIdCard('110101900101123')).toBe(true) // 15 digits
      expect(validateIdCard('11010119900101123X')).toBe(true) // 18 digits with X
      expect(validateIdCard('11010119900101123x')).toBe(true) // 18 digits with lowercase x
    })

    it('should reject invalid ID card numbers', () => {
      expect(validateIdCard('')).toBe(false)
      expect(validateIdCard('1234567890123456789')).toBe(false) // Too long
      expect(validateIdCard('12345678901234')).toBe(false) // Too short
      expect(validateIdCard('11010119900101123Y')).toBe(false) // Invalid ending character
      expect(validateIdCard('abcdefghijklmnopqrs')).toBe(false) // Letters only
    })

    it('should trim whitespace', () => {
      expect(validateIdCard(' 110101199001011234 ')).toBe(true)
    })
  })

  describe('validateUrl', () => {
    it('should validate correct URLs', () => {
      expect(validateUrl('https://example.com')).toBe(true)
      expect(validateUrl('http://localhost:3000')).toBe(true)
      expect(validateUrl('ftp://ftp.example.com')).toBe(true)
      expect(validateUrl('https://subdomain.example.com/path?query=value')).toBe(true)
    })

    it('should reject invalid URLs', () => {
      expect(validateUrl('')).toBe(false)
      expect(validateUrl('not-a-url')).toBe(false)
      expect(validateUrl('http://')).toBe(false)
      expect(validateUrl('https://')).toBe(false)
      expect(validateUrl('example.com')).toBe(false)
    })
  })

  describe('containsSqlInjection', () => {
    it('should detect SQL injection keywords', () => {
      expect(containsSqlInjection('SELECT * FROM users')).toBe(true)
      expect(containsSqlInjection('INSERT INTO table VALUES')).toBe(true)
      expect(containsSqlInjection('DROP TABLE users')).toBe(true)
      expect(containsSqlInjection('UNION SELECT password')).toBe(true)
    })

    it('should detect SQL injection patterns', () => {
      expect(containsSqlInjection('1; DROP TABLE users')).toBe(true)
      expect(containsSqlInjection('admin\' --')).toBe(true)
      expect(containsSqlInjection('user\' OR \'1\'=\'1')).toBe(true)
      expect(containsSqlInjection('SELECT * FROM /* comment */')).toBe(true)
    })

    it('should not flag normal input', () => {
      expect(containsSqlInjection('')).toBe(false)
      expect(containsSqlInjection('John Doe')).toBe(false)
      expect(containsSqlInjection('user@example.com')).toBe(false)
      expect(containsSqlInjection('password123')).toBe(false)
    })
  })

  describe('containsXss', () => {
    it('should detect script tags', () => {
      expect(containsXss('<script>alert("xss")</script>')).toBe(true)
      expect(containsXss('<SCRIPT>alert("xss")</SCRIPT>')).toBe(true)
    })

    it('should detect javascript URLs', () => {
      expect(containsXss('javascript:alert("xss")')).toBe(true)
      expect(containsXss('JAVASCRIPT:alert("xss")')).toBe(true)
    })

    it('should detect event handlers', () => {
      expect(containsXss('<img src="x" onerror="alert(1)">')).toBe(true)
      expect(containsXss('<div onclick="alert(1)">')).toBe(true)
    })

    it('should detect iframe and embed tags', () => {
      expect(containsXss('<iframe src="malicious.com"></iframe>')).toBe(true)
      expect(containsXss('<object data="malicious.swf">')).toBe(true)
      expect(containsXss('<embed src="malicious.swf">')).toBe(true)
    })

    it('should not flag normal input', () => {
      expect(containsXss('')).toBe(false)
      expect(containsXss('Hello World')).toBe(false)
      expect(containsXss('<div>safe content</div>')).toBe(false)
    })
  })

  describe('validateFileExtension', () => {
    it('should validate allowed extensions', () => {
      expect(validateFileExtension('document.pdf', ['pdf', 'doc'])).toBe(true)
      expect(validateFileExtension('image.JPG', ['jpg', 'png'])).toBe(true)
      expect(validateFileExtension('FILE.PDF', ['pdf'])).toBe(true)
    })

    it('should reject disallowed extensions', () => {
      expect(validateFileExtension('document.pdf', ['doc', 'txt'])).toBe(false)
      expect(validateFileExtension('image.exe', ['jpg', 'png'])).toBe(false)
    })

    it('should handle files without extensions', () => {
      expect(validateFileExtension('filewithoutextension', ['pdf'])).toBe(false)
      expect(validateFileExtension('', ['pdf'])).toBe(false)
    })

    it('should handle empty allowed extensions list', () => {
      expect(validateFileExtension('document.pdf', [])).toBe(false)
    })

    it('should handle case insensitive matching', () => {
      expect(validateFileExtension('document.PDF', ['pdf'])).toBe(true)
      expect(validateFileExtension('document.pdf', ['PDF'])).toBe(true)
    })
  })

  describe('validateMimeType', () => {
    it('should validate allowed MIME types', () => {
      expect(validateMimeType('image/jpeg', ['image/jpeg', 'image/png'])).toBe(true)
      expect(validateMimeType('IMAGE/JPEG', ['image/jpeg'])).toBe(true)
      expect(validateMimeType('text/plain', ['text/plain'])).toBe(true)
    })

    it('should reject disallowed MIME types', () => {
      expect(validateMimeType('image/jpeg', ['image/png'])).toBe(false)
      expect(validateMimeType('application/pdf', ['image/jpeg'])).toBe(false)
    })

    it('should handle empty inputs', () => {
      expect(validateMimeType('', ['image/jpeg'])).toBe(false)
      expect(validateMimeType('image/jpeg', [])).toBe(false)
    })

    it('should handle case insensitive matching', () => {
      expect(validateMimeType('IMAGE/JPEG', ['image/jpeg'])).toBe(true)
      expect(validateMimeType('image/jpeg', ['IMAGE/JPEG'])).toBe(true)
    })
  })

  describe('validateFileSize', () => {
    it('should validate file sizes within limits', () => {
      expect(validateFileSize(1024, 2048)).toBe(true) // 1KB within 2KB limit
      expect(validateFileSize(2048, 2048)).toBe(true) // Exactly at limit
    })

    it('should reject file sizes exceeding limits', () => {
      expect(validateFileSize(3072, 2048)).toBe(false) // 3KB over 2KB limit
      expect(validateFileSize(0, 1024)).toBe(false) // Zero size
      expect(validateFileSize(-1024, 2048)).toBe(false) // Negative size
    })
  })

  describe('validatePasswordStrength', () => {
    it('should validate strong passwords', () => {
      expect(validatePasswordStrength('password123')).toBe(true)
      expect(validatePasswordStrength('abc123DEF')).toBe(true)
      expect(validatePasswordStrength('MyPassword1')).toBe(true)
    })

    it('should reject weak passwords', () => {
      expect(validatePasswordStrength('')).toBe(false)
      expect(validatePasswordStrength('short')).toBe(false) // Too short
      expect(validatePasswordStrength('password')).toBe(false) // No numbers
      expect(validatePasswordStrength('123456789')).toBe(false) // No letters
      expect(validatePasswordStrength('password!')).toBe(false) // No numbers
    })

    it('should respect custom minimum length', () => {
      expect(validatePasswordStrength('abc123', 6)).toBe(true)
      expect(validatePasswordStrength('abc123', 10)).toBe(false)
    })
  })

  describe('validateUsername', () => {
    it('should validate correct usernames', () => {
      expect(validateUsername('john_doe')).toBe(true)
      expect(validateUsername('user123')).toBe(true)
      expect(validateUsername('test-user')).toBe(true)
      expect(validateUsername('abc')).toBe(true) // Minimum length
    })

    it('should reject invalid usernames', () => {
      expect(validateUsername('')).toBe(false)
      expect(validateUsername('ab')).toBe(false) // Too short
      expect(validateUsername('a'.repeat(21))).toBe(false) // Too long
      expect(validateUsername('user name')).toBe(false) // Contains space
      expect(validateUsername('user@name')).toBe(false) // Invalid character
      expect(validateUsername('user.name')).toBe(false) // Contains dot
    })

    it('should trim whitespace', () => {
      expect(validateUsername('  john_doe  ')).toBe(true)
    })

    it('should respect custom length limits', () => {
      expect(validateUsername('ab', 2, 5)).toBe(true)
      expect(validateUsername('abcdef', 2, 5)).toBe(false) // Too long
    })
  })

  describe('validateInput', () => {
    it('should validate safe input', () => {
      const result = validateInput('Hello World')
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should reject empty input', () => {
      const result = validateInput('')
      expect(result.isValid).toBe(false)
      expect(result.errors).toEqual(['输入不能为空'])
    })

    it('should detect SQL injection', () => {
      const result = validateInput('admin\' OR \'1\'=\'1')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('输入包含非法字符，疑似SQL注入攻击')
    })

    it('should detect XSS attacks', () => {
      const result = validateInput('<script>alert("xss")</script>')
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('输入包含非法字符，疑似XSS攻击')
    })

    it('should detect multiple attack types', () => {
      const result = validateInput('<script>SELECT * FROM users</script>')
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(2)
      expect(result.errors).toContain('输入包含非法字符，疑似SQL注入攻击')
      expect(result.errors).toContain('输入包含非法字符，疑似XSS攻击')
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle null and undefined inputs', () => {
      expect(validateEmail(null as any)).toBe(false)
      expect(validateEmail(undefined as any)).toBe(false)
      expect(validatePhone(null as any)).toBe(false)
      expect(validateIdCard(undefined as any)).toBe(false)
      expect(validateUrl(null as any)).toBe(false)
      expect(containsSqlInjection(undefined as any)).toBe(false)
      expect(containsXss(null as any)).toBe(false)
    })

    it('should handle malformed URLs gracefully', () => {
      expect(validateUrl('http://192.168.1.1:8080/path%20with%20spaces')).toBe(false)
      expect(validateUrl('not-a-scheme://example.com')).toBe(false)
    })

    it('should handle regex edge cases', () => {
      // These should not cause regex errors
      expect(containsSqlInjection('SELECT')).toBe(true)
      expect(containsXss('<script>')).toBe(true)
    })
  })
})
