import { describe, expect, it } from 'vitest'

describe('Simple test', () => {
  it('should perform basic arithmetic', () => {
    expect(1 + 1).toBe(2)
    expect(2 * 3).toBe(6)
    expect(10 - 4).toBe(6)
    expect(8 / 2).toBe(4)
  })

  it('should handle boolean logic', () => {
    expect(true && true).toBe(true)
    expect(true || false).toBe(true)
    expect(!false).toBe(true)
  })

  it('should work with arrays', () => {
    const arr = [1, 2, 3, 4, 5]
    expect(arr.length).toBe(5)
    expect(arr[0]).toBe(1)
    expect(arr.includes(3)).toBe(true)
  })

  it('should work with objects', () => {
    const obj = { name: 'test', value: 42 }
    expect(obj.name).toBe('test')
    expect(obj.value).toBe(42)
    expect(Object.keys(obj)).toHaveLength(2)
  })
})
