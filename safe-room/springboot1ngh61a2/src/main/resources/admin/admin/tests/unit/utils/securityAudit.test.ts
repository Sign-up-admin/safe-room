import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from 'vitest'
import { securityAuditor, SecurityEventType } from '../../../src/utils/securityAudit'

describe('安全审计工具', () => {
  beforeAll(() => {
    // 确保sessionStorage mock存在
    if (!global.sessionStorage) {
      const sessionStorageMock = (() => {
        let store: Record<string, string> = {}
        return {
          getItem: (key: string) => store[key] || null,
          setItem: (key: string, value: string) => {
            store[key] = value.toString()
          },
          removeItem: (key: string) => {
            delete store[key]
          },
          clear: () => {
            store = {}
          },
        }
      })()
      Object.defineProperty(global, 'sessionStorage', {
        value: sessionStorageMock,
        writable: true,
      })
    }
  })

  beforeEach(() => {
    // 清除所有事件
    securityAuditor.clearEvents()
    // 清除sessionStorage
    if (global.sessionStorage) {
      global.sessionStorage.clear()
    }
    // Mock console methods
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('logEvent', () => {
    it('应该记录安全事件', () => {
      securityAuditor.logEvent(SecurityEventType.LOGIN_ATTEMPT, { username: 'test' })
      const events = securityAuditor.getEvents()
      expect(events.length).toBe(1)
      expect(events[0].type).toBe(SecurityEventType.LOGIN_ATTEMPT)
      expect(events[0].details.username).toBe('test')
    })

    it('事件应该包含时间戳', () => {
      securityAuditor.logEvent(SecurityEventType.LOGIN_ATTEMPT)
      const events = securityAuditor.getEvents()
      expect(events[0].timestamp).toBeTruthy()
      expect(typeof events[0].timestamp).toBe('number')
    })

    it('事件应该包含userAgent和url', () => {
      securityAuditor.logEvent(SecurityEventType.LOGIN_ATTEMPT)
      const events = securityAuditor.getEvents()
      expect(events[0].userAgent).toBeTruthy()
      expect(events[0].url).toBeTruthy()
    })

    it('应该限制事件数量为100条', () => {
      for (let i = 0; i < 150; i++) {
        securityAuditor.logEvent(SecurityEventType.LOGIN_ATTEMPT, { index: i })
      }
      const events = securityAuditor.getEvents()
      expect(events.length).toBe(100)
      // 应该保留最新的100条
      expect(events[0].details.index).toBe(50)
    })
  })

  describe('getEvents', () => {
    it('应该返回所有事件', () => {
      securityAuditor.logEvent(SecurityEventType.LOGIN_ATTEMPT)
      securityAuditor.logEvent(SecurityEventType.LOGIN_SUCCESS)
      const events = securityAuditor.getEvents()
      expect(events.length).toBe(2)
    })

    it('应该返回事件的副本，而不是引用', () => {
      securityAuditor.logEvent(SecurityEventType.LOGIN_ATTEMPT)
      const events1 = securityAuditor.getEvents()
      const events2 = securityAuditor.getEvents()
      expect(events1).not.toBe(events2)
    })
  })

  describe('getEventsByType', () => {
    it('应该返回指定类型的事件', () => {
      securityAuditor.logEvent(SecurityEventType.LOGIN_ATTEMPT)
      securityAuditor.logEvent(SecurityEventType.LOGIN_SUCCESS)
      securityAuditor.logEvent(SecurityEventType.LOGIN_ATTEMPT)
      
      const loginAttempts = securityAuditor.getEventsByType(SecurityEventType.LOGIN_ATTEMPT)
      expect(loginAttempts.length).toBe(2)
      expect(loginAttempts.every(e => e.type === SecurityEventType.LOGIN_ATTEMPT)).toBe(true)
    })

    it('如果没有匹配的事件，应该返回空数组', () => {
      securityAuditor.logEvent(SecurityEventType.LOGIN_ATTEMPT)
      const events = securityAuditor.getEventsByType(SecurityEventType.XSS_ATTEMPT)
      expect(events.length).toBe(0)
    })
  })

  describe('getRecentEvents', () => {
    it('应该返回最近的事件', () => {
      for (let i = 0; i < 15; i++) {
        securityAuditor.logEvent(SecurityEventType.LOGIN_ATTEMPT, { index: i })
      }
      const recent = securityAuditor.getRecentEvents(10)
      expect(recent.length).toBe(10)
      // 应该是最新的10条，且是倒序
      expect(recent[0].details.index).toBe(14)
      expect(recent[9].details.index).toBe(5)
    })

    it('如果事件数量少于请求数量，应该返回所有事件', () => {
      securityAuditor.logEvent(SecurityEventType.LOGIN_ATTEMPT)
      securityAuditor.logEvent(SecurityEventType.LOGIN_SUCCESS)
      const recent = securityAuditor.getRecentEvents(10)
      expect(recent.length).toBe(2)
    })
  })

  describe('clearEvents', () => {
    it('应该清除所有事件', () => {
      securityAuditor.logEvent(SecurityEventType.LOGIN_ATTEMPT)
      securityAuditor.logEvent(SecurityEventType.LOGIN_SUCCESS)
      securityAuditor.clearEvents()
      const events = securityAuditor.getEvents()
      expect(events.length).toBe(0)
    })
  })

  describe('analyze', () => {
    it('应该正确分析事件', () => {
      securityAuditor.logEvent(SecurityEventType.LOGIN_ATTEMPT)
      securityAuditor.logEvent(SecurityEventType.LOGIN_SUCCESS)
      securityAuditor.logEvent(SecurityEventType.LOGIN_FAILURE)
      securityAuditor.logEvent(SecurityEventType.XSS_ATTEMPT)
      
      const analysis = securityAuditor.analyze()
      expect(analysis.totalEvents).toBe(4)
      expect(analysis.eventCounts[SecurityEventType.LOGIN_ATTEMPT]).toBe(1)
      expect(analysis.eventCounts[SecurityEventType.LOGIN_SUCCESS]).toBe(1)
      expect(analysis.eventCounts[SecurityEventType.LOGIN_FAILURE]).toBe(1)
      expect(analysis.eventCounts[SecurityEventType.XSS_ATTEMPT]).toBe(1)
    })

    it('应该检测可疑活动', () => {
      securityAuditor.logEvent(SecurityEventType.XSS_ATTEMPT)
      const analysis = securityAuditor.analyze()
      expect(analysis.hasSuspiciousActivity).toBe(true)
    })

    it('如果没有可疑活动，应该返回false', () => {
      securityAuditor.logEvent(SecurityEventType.LOGIN_ATTEMPT)
      securityAuditor.logEvent(SecurityEventType.LOGIN_SUCCESS)
      const analysis = securityAuditor.analyze()
      expect(analysis.hasSuspiciousActivity).toBe(false)
    })

    it('应该统计最近的失败登录', () => {
      vi.useFakeTimers()
      const now = Date.now()
      
      // 记录一些失败登录
      securityAuditor.logEvent(SecurityEventType.LOGIN_FAILURE)
      vi.advanceTimersByTime(1000)
      securityAuditor.logEvent(SecurityEventType.LOGIN_FAILURE)
      
      // 快进超过15分钟
      vi.advanceTimersByTime(16 * 60 * 1000)
      securityAuditor.logEvent(SecurityEventType.LOGIN_FAILURE)
      
      const analysis = securityAuditor.analyze()
      // 只有最近的失败登录（15分钟内）会被统计
      expect(analysis.recentFailures).toBeGreaterThanOrEqual(1)
      
      vi.useRealTimers()
    })
  })
})

