import storage from '@/common/storage'

describe('storage utility', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('sets and gets primitive values', () => {
    storage.set('greeting', 'hello')
    expect(storage.get('greeting')).toBe('hello')
  })

  it('handles JSON objects through getObj', () => {
    storage.set('profile', { name: 'Alice' })
    expect(storage.getObj<{ name: string }>('profile')).toEqual({ name: 'Alice' })
  })

  it('returns empty string or null when key does not exist', () => {
    expect(storage.get('missing')).toBe('')
    expect(storage.getObj('missing')).toBeNull()
  })

  it('removes keys and clears storage', () => {
    storage.set('k1', 'v1')
    storage.remove('k1')
    expect(storage.get('k1')).toBe('')
    storage.set('k2', 'v2')
    storage.clear()
    expect(localStorage.length).toBe(0)
  })
})


