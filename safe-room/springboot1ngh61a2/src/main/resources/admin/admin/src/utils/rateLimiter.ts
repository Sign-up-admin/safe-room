/**
 * 速率限制工具
 * 用于防止暴力破解和频繁请求
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private storage: Map<string, RateLimitEntry> = new Map()
  private readonly defaultWindowMs: number = 15 * 60 * 1000 // 15分钟
  private readonly defaultMaxAttempts: number = 5 // 默认最大尝试次数

  /**
   * 检查是否超过速率限制
   * @param key - 限制键（如IP、用户名等）
   * @param maxAttempts - 最大尝试次数，默认5次
   * @param windowMs - 时间窗口（毫秒），默认15分钟
   * @returns 如果超过限制返回true，否则返回false
   */
  isRateLimited(key: string, maxAttempts = this.defaultMaxAttempts, windowMs = this.defaultWindowMs): boolean {
    const now = Date.now()
    const entry = this.storage.get(key)

    if (!entry) {
      // 首次尝试，创建新记录
      this.storage.set(key, {
        count: 1,
        resetTime: now + windowMs,
      })
      return false
    }

    // 检查是否超过时间窗口
    if (now > entry.resetTime) {
      // 重置计数
      this.storage.set(key, {
        count: 1,
        resetTime: now + windowMs,
      })
      return false
    }

    // 增加计数
    entry.count++
    this.storage.set(key, entry)

    // 检查是否超过最大尝试次数
    if (entry.count > maxAttempts) {
      return true
    }

    return false
  }

  /**
   * 获取剩余尝试次数
   * @param key - 限制键
   * @param maxAttempts - 最大尝试次数
   * @returns 剩余尝试次数
   */
  getRemainingAttempts(key: string, maxAttempts = this.defaultMaxAttempts): number {
    const entry = this.storage.get(key)
    if (!entry) {
      return maxAttempts
    }

    const now = Date.now()
    if (now > entry.resetTime) {
      return maxAttempts
    }

    return Math.max(0, maxAttempts - entry.count)
  }

  /**
   * 获取重置时间（毫秒时间戳）
   * @param key - 限制键
   * @returns 重置时间戳，如果不存在则返回null
   */
  getResetTime(key: string): number | null {
    const entry = this.storage.get(key)
    if (!entry) {
      return null
    }

    const now = Date.now()
    if (now > entry.resetTime) {
      return null
    }

    return entry.resetTime
  }

  /**
   * 清除指定键的限制记录
   * @param key - 限制键
   */
  clear(key: string): void {
    this.storage.delete(key)
  }

  /**
   * 清除所有限制记录
   */
  clearAll(): void {
    this.storage.clear()
  }

  /**
   * 清理过期的记录（定期调用以释放内存）
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.storage.entries()) {
      if (now > entry.resetTime) {
        this.storage.delete(key)
      }
    }
  }
}

// 导出单例
export const rateLimiter = new RateLimiter()

// 定期清理过期记录（每5分钟）
if (typeof window !== 'undefined') {
  setInterval(
    () => {
      rateLimiter.cleanup()
    },
    5 * 60 * 1000,
  )
}
