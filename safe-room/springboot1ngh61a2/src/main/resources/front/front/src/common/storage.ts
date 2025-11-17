const storage = {
  set(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value))
  },
  get(key: string): string {
    const item = localStorage.getItem(key)
    if (!item) return ''
    return item.replace(/^"/, '').replace(/"$/, '')
  },
  getObj<T = any>(key: string): T | null {
    const item = localStorage.getItem(key)
    if (!item) return null
    try {
      return JSON.parse(item) as T
    } catch {
      return null
    }
  },
  remove(key: string): void {
    localStorage.removeItem(key)
  },
  clear(): void {
    localStorage.clear()
  },
}

export default storage

