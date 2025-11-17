/**
 * 安全存储工具
 * 提供更安全的存储方式，减少XSS攻击的影响范围
 */

/**
 * 使用sessionStorage存储Token（相比localStorage，sessionStorage在标签页关闭时自动清除，减少XSS影响范围）
 */
class SecureStorage {
  private prefix = 'secure_'
  
  /**
   * 设置值到sessionStorage
   * @param key - 存储键
   * @param value - 存储值
   */
  set(key: string, value: string): void {
    try {
      sessionStorage.setItem(`${this.prefix}${key}`, value)
    } catch (error) {
      console.error('SecureStorage set error:', error)
      // 如果sessionStorage已满，尝试清除旧数据
      this.clearExpired()
      try {
        sessionStorage.setItem(`${this.prefix}${key}`, value)
      } catch (retryError) {
        console.error('SecureStorage set retry error:', retryError)
      }
    }
  }
  
  /**
   * 从sessionStorage获取值
   * @param key - 存储键
   * @returns 存储值或null
   */
  get(key: string): string | null {
    try {
      return sessionStorage.getItem(`${this.prefix}${key}`)
    } catch (error) {
      console.error('SecureStorage get error:', error)
      return null
    }
  }
  
  /**
   * 从sessionStorage移除值
   * @param key - 存储键
   */
  remove(key: string): void {
    try {
      sessionStorage.removeItem(`${this.prefix}${key}`)
    } catch (error) {
      console.error('SecureStorage remove error:', error)
    }
  }
  
  /**
   * 清除所有带前缀的存储项
   */
  clear(): void {
    try {
      const keys = Object.keys(sessionStorage)
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          sessionStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('SecureStorage clear error:', error)
    }
  }
  
  /**
   * 清除过期的存储项（可以根据需要实现过期逻辑）
   */
  private clearExpired(): void {
    // 这里可以添加过期时间检查逻辑
    // 目前简单实现：清除所有带前缀的项
    this.clear()
  }
}

/**
 * Token存储工具
 */
class TokenStorage {
  private storage = new SecureStorage()
  private tokenKey = 'token'
  private tokenExpiryKey = 'token_expiry'
  
  /**
   * 设置Token
   * @param token - Token值
   * @param expiryTime - 过期时间（毫秒时间戳），可选
   */
  setToken(token: string, expiryTime?: number): void {
    this.storage.set(this.tokenKey, token)
    if (expiryTime) {
      this.storage.set(this.tokenExpiryKey, String(expiryTime))
    }
  }
  
  /**
   * 获取Token
   * @returns Token值或null
   */
  getToken(): string | null {
    const token = this.storage.get(this.tokenKey)
    
    // 检查是否过期
    if (token && this.isExpired()) {
      this.clearToken()
      return null
    }
    
    return token
  }
  
  /**
   * 清除Token
   */
  clearToken(): void {
    this.storage.remove(this.tokenKey)
    this.storage.remove(this.tokenExpiryKey)
  }
  
  /**
   * 检查Token是否过期
   * @returns 如果过期返回true，否则返回false
   */
  isExpired(): boolean {
    const expiryStr = this.storage.get(this.tokenExpiryKey)
    if (!expiryStr) return false
    
    const expiryTime = parseInt(expiryStr, 10)
    if (isNaN(expiryTime)) return false
    
    return Date.now() > expiryTime
  }
  
  /**
   * 检查Token是否存在且有效
   * @returns 如果Token存在且未过期返回true，否则返回false
   */
  hasValidToken(): boolean {
    const token = this.getToken()
    return token !== null && !this.isExpired()
  }
}

// 导出单例
export const secureStorage = new SecureStorage()
export const tokenStorage = new TokenStorage()

// 为了向后兼容，也提供类似localStorage的API
export default {
  set: (key: string, value: any): void => {
    secureStorage.set(key, typeof value === 'string' ? value : JSON.stringify(value))
  },
  get: (key: string): string | null => {
    return secureStorage.get(key)
  },
  getObj: <T = any>(key: string): T | null => {
    const value = secureStorage.get(key)
    if (!value) return null
    try {
      return JSON.parse(value) as T
    } catch {
      return null
    }
  },
  remove: (key: string): void => {
    secureStorage.remove(key)
  },
  clear: (): void => {
    secureStorage.clear()
  }
}

