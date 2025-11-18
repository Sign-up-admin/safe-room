import { describe, it, expect, beforeEach } from 'vitest'
import storage from '@/utils/storage'

describe('storage', () => {
  beforeEach(() => {
    // 每个测试前清空localStorage
    storage.clear()
  })

  describe('set and get', () => {
    it('应该能够设置和获取字符串值', () => {
      storage.set('test', 'value')
      expect(storage.get('test')).toBe('value')
    })

    it('应该能够设置和获取对象值', () => {
      const obj = { name: 'test', age: 20 }
      storage.set('test', obj)
      expect(storage.get('test')).toEqual(obj)
    })

    it('应该能够设置和获取数组值', () => {
      const arr = [1, 2, 3]
      storage.set('test', arr)
      expect(storage.get('test')).toEqual(arr)
    })

    it('应该能够设置和获取数字值', () => {
      storage.set('test', 123)
      expect(storage.get('test')).toBe(123)
    })

    it('应该能够设置和获取布尔值', () => {
      storage.set('test', true)
      expect(storage.get('test')).toBe(true)
    })

    it('获取不存在的键应该返回null', () => {
      expect(storage.get('nonexistent')).toBeNull()
    })
  })

  describe('remove', () => {
    it('应该能够移除存储的值', () => {
      storage.set('test', 'value')
      expect(storage.get('test')).toBe('value')
      storage.remove('test')
      expect(storage.get('test')).toBeNull()
    })

    it('移除不存在的键不应该报错', () => {
      expect(() => storage.remove('nonexistent')).not.toThrow()
    })
  })

  describe('clear', () => {
    it('应该能够清空所有存储', () => {
      storage.set('key1', 'value1')
      storage.set('key2', 'value2')
      storage.clear()
      expect(storage.get('key1')).toBeNull()
      expect(storage.get('key2')).toBeNull()
    })
  })

  describe('has', () => {
    it('应该能够检查键是否存在', () => {
      expect(storage.has('test')).toBe(false)
      storage.set('test', 'value')
      expect(storage.has('test')).toBe(true)
      storage.remove('test')
      expect(storage.has('test')).toBe(false)
    })
  })

  describe('keys', () => {
    it('应该能够获取所有键', () => {
      storage.set('key1', 'value1')
      storage.set('key2', 'value2')
      const keys = storage.keys()
      expect(keys).toContain('key1')
      expect(keys).toContain('key2')
    })

    it('空存储应该返回空数组', () => {
      expect(storage.keys()).toEqual([])
    })
  })
})

