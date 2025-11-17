import { describe, it, expect } from 'vitest'
import { isEmail, isMobile, isPhone, isURL, isNumber, isIntNumer, checkIdCard } from '../../../src/utils/validate'
import { containsSqlInjection } from '../../../src/utils/validator'

describe('验证工具', () => {
  describe('isEmail', () => {
    it('应该验证有效的邮�?, () => {
      expect(isEmail('test@example.com')).toBe(true)
      expect(isEmail('user.name@example.co.uk')).toBe(true)
      expect(isEmail('test_123@test-domain.com')).toBe(true)
    })

    it('应该拒绝无效的邮�?, () => {
      expect(isEmail('invalid')).toBe(false)
      expect(isEmail('invalid@')).toBe(false)
      expect(isEmail('@example.com')).toBe(false)
      expect(isEmail('test@')).toBe(false)
      expect(isEmail('test@.com')).toBe(false)
    })
  })

  describe('isMobile', () => {
    it('应该验证有效的手机号', () => {
      expect(isMobile('13812345678')).toBe(true)
      expect(isMobile('15912345678')).toBe(true)
      expect(isMobile('18612345678')).toBe(true)
    })

    it('应该拒绝无效的手机号', () => {
      expect(isMobile('12345678901')).toBe(false) // 不是1开�?
      expect(isMobile('1381234567')).toBe(false) // 长度不够
      expect(isMobile('138123456789')).toBe(false) // 长度过长
      expect(isMobile('12812345678')).toBe(false) // 第二位不�?-9
    })
  })

  describe('isPhone', () => {
    it('应该验证有效的电话号�?, () => {
      expect(isPhone('010-12345678')).toBe(true)
      expect(isPhone('021-87654321')).toBe(true)
      expect(isPhone('12345678')).toBe(true)
      expect(isPhone('1234-56789012')).toBe(true)
    })

    it('应该拒绝无效的电话号�?, () => {
      expect(isPhone('123')).toBe(false) // 太短
      expect(isPhone('abc-12345678')).toBe(false) // 包含字母
    })
  })

  describe('isURL', () => {
    it('应该验证有效的URL', () => {
      expect(isURL('http://example.com')).toBe(true)
      expect(isURL('https://example.com')).toBe(true)
      expect(isURL('https://www.example.com/path?query=1')).toBe(true)
    })

    it('应该拒绝无效的URL', () => {
      expect(isURL('example.com')).toBe(false) // 缺少协议
      expect(isURL('ftp://example.com')).toBe(false) // 不是http/https
      expect(isURL('not a url')).toBe(false)
    })
  })

  describe('isNumber', () => {
    it('应该验证有效的数�?, () => {
      expect(isNumber('123')).toBe(true)
      expect(isNumber('123.45')).toBe(true)
      expect(isNumber('-123')).toBe(true)
      expect(isNumber('+123')).toBe(true)
      expect(isNumber('1.23e10')).toBe(true)
      expect(isNumber('')).toBe(true) // 可以为空
    })

    it('应该拒绝无效的数�?, () => {
      expect(isNumber('abc')).toBe(false)
      expect(isNumber('12.34.56')).toBe(false)
      expect(isNumber('12abc')).toBe(false)
    })
  })

  describe('isIntNumer', () => {
    it('应该验证有效的整�?, () => {
      expect(isIntNumer('123')).toBe(true)
      expect(isIntNumer('-123')).toBe(true)
      expect(isIntNumer('0')).toBe(true)
      expect(isIntNumer('')).toBe(true) // 可以为空
    })

    it('应该拒绝无效的整�?, () => {
      expect(isIntNumer('123.45')).toBe(false) // 小数
      expect(isIntNumer('abc')).toBe(false)
      expect(isIntNumer('12.34')).toBe(false)
    })
  })

  describe('checkIdCard', () => {
    it('应该验证有效的身份证�?, () => {
      expect(checkIdCard('110101199001011234')).toBe(true) // 18�?
      expect(checkIdCard('110101900101123')).toBe(true) // 15�?
      expect(checkIdCard('11010119900101123X')).toBe(true) // 18位带X
    })

    it('应该拒绝无效的身份证�?, () => {
      expect(checkIdCard('123')).toBe(false) // 太短
      expect(checkIdCard('1101011990010112345')).toBe(false) // 太长
      expect(checkIdCard('abc123456789012345')).toBe(false) // 包含字母（除了最后一位X�?
    })
  })

  describe('containsSqlInjection', () => {
    it('应该检测出SQL注入关键�?, () => {
      expect(containsSqlInjection('SELECT * FROM users')).toBe(true)
      expect(containsSqlInjection('DROP TABLE users')).toBe(true)
      expect(containsSqlInjection('INSERT INTO users VALUES')).toBe(true)
      expect(containsSqlInjection('UPDATE users SET')).toBe(true)
      expect(containsSqlInjection('DELETE FROM users')).toBe(true)
      expect(containsSqlInjection('UNION SELECT')).toBe(true)
    })

    it('应该检测出SQL注释符号', () => {
      expect(containsSqlInjection('SELECT * FROM users -- comment')).toBe(true)
      expect(containsSqlInjection('SELECT * FROM users # comment')).toBe(true)
      expect(containsSqlInjection('SELECT * FROM users /* comment */')).toBe(true)
    })

    it('应该检测出SQL注入模式', () => {
      expect(containsSqlInjection('OR 1=1')).toBe(true)
      expect(containsSqlInjection('AND 1=1')).toBe(true)
    })

    it('应该检测出SQL注入特殊字符模式', () => {
      expect(containsSqlInjection("SELECT * FROM users WHERE id = '1'")).toBe(true) // 单引�?
      expect(containsSqlInjection('"; DROP TABLE users')).toBe(true) // 双引�?SQL注入
      expect(containsSqlInjection('SELECT * FROM users;')).toBe(true) // 分号
      expect(containsSqlInjection("'; DROP TABLE users")).toBe(true) // 单引�?SQL注入
    })

    it('应该允许正常输入', () => {
      expect(containsSqlInjection('正常用户输入')).toBe(false)
      expect(containsSqlInjection('John Doe')).toBe(false)
      expect(containsSqlInjection('123456')).toBe(false)
      expect(containsSqlInjection('test@example.com')).toBe(false)
      expect(containsSqlInjection('"正常的双引号字符�?')).toBe(false)
      expect(containsSqlInjection('{"name": "John", "age": 30}')).toBe(false)
      expect(containsSqlInjection('file:///path/to/file')).toBe(false)
      expect(containsSqlInjection('C:\\Program Files\\app')).toBe(false)
    })

    it('应该允许正常的双引号使用', () => {
      expect(containsSqlInjection('SELECT * FROM users WHERE id = "1"')).toBe(false) // 正常的查�?
      expect(containsSqlInjection('"safe string"')).toBe(false) // 普通字符串
      expect(containsSqlInjection('field="value"')).toBe(false) // 正常的赋�?
    })

    it('应该处理空输�?, () => {
      expect(containsSqlInjection('')).toBe(false)
      expect(containsSqlInjection(null as any)).toBe(false)
      expect(containsSqlInjection(undefined as any)).toBe(false)
    })
  })
})

