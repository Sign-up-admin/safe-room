/**
 * 安全审计工具
 * 用于记录和监控安全相关事件
 */

export enum SecurityEventType {
  LOGIN_ATTEMPT = 'login_attempt',
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  PASSWORD_RESET_ATTEMPT = 'password_reset_attempt',
  PASSWORD_RESET_SUCCESS = 'password_reset_success',
  PASSWORD_RESET_FAILURE = 'password_reset_failure',
  SMS_CODE_SENT = 'sms_code_sent',
  RESET_LINK_SENT = 'reset_link_sent',
  RESET_LINK_VERIFIED = 'reset_link_verified',
  RESET_LINK_INVALID = 'reset_link_invalid',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  INVALID_TOKEN = 'invalid_token',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  XSS_ATTEMPT = 'xss_attempt',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
}

export interface SecurityEvent {
  type: SecurityEventType
  timestamp: number
  details: Record<string, any>
  userAgent?: string
  url?: string
}

class SecurityAuditor {
  private events: SecurityEvent[] = []
  private readonly maxEvents = 100 // 最多保存100条事件
  private readonly storageKey = 'security_audit_events'

  constructor() {
    // 从localStorage加载历史事件（仅用于调试）
    this.loadEvents()
  }

  /**
   * 记录安全事件
   * @param type - 事件类型
   * @param details - 事件详情
   */
  logEvent(type: SecurityEventType, details: Record<string, any> = {}): void {
    const event: SecurityEvent = {
      type,
      timestamp: Date.now(),
      details,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' && window.location ? window.location.href : 'unknown',
    }

    this.events.push(event)

    // 限制事件数量
    if (this.events.length > this.maxEvents) {
      this.events.shift()
    }

    // 保存到localStorage（仅用于调试，生产环境应发送到服务器）
    this.saveEvents()

    // 在控制台输出（开发环境）
    if (import.meta.env.DEV) {
      console.warn('[安全审计]', type, details)
    }

    // 对于严重事件，可以发送到服务器
    if (this.isCriticalEvent(type)) {
      this.reportToServer(event)
    }
  }

  /**
   * 获取所有事件
   * @returns 事件列表
   */
  getEvents(): SecurityEvent[] {
    return [...this.events]
  }

  /**
   * 获取指定类型的事件
   * @param type - 事件类型
   * @returns 事件列表
   */
  getEventsByType(type: SecurityEventType): SecurityEvent[] {
    return this.events.filter(event => event.type === type)
  }

  /**
   * 获取最近的事件
   * @param count - 数量
   * @returns 事件列表
   */
  getRecentEvents(count = 10): SecurityEvent[] {
    return this.events.slice(-count).reverse()
  }

  /**
   * 清除所有事件
   */
  clearEvents(): void {
    this.events = []
    this.saveEvents()
  }

  /**
   * 检查是否为严重事件
   * @param type - 事件类型
   * @returns 是否为严重事件
   */
  private isCriticalEvent(type: SecurityEventType): boolean {
    return [
      SecurityEventType.RATE_LIMIT_EXCEEDED,
      SecurityEventType.UNAUTHORIZED_ACCESS,
      SecurityEventType.XSS_ATTEMPT,
      SecurityEventType.SQL_INJECTION_ATTEMPT,
      SecurityEventType.SUSPICIOUS_ACTIVITY,
    ].includes(type)
  }

  /**
   * 报告严重事件到服务器
   * @param event - 安全事件
   */
  private async reportToServer(event: SecurityEvent): Promise<void> {
    try {
      // 这里可以发送到后端API
      // await http.post('/api/security/audit', event)
      // 目前仅记录日志
      console.error('[严重安全事件]', event)
    } catch (error) {
      console.error('报告安全事件失败:', error)
    }
  }

  /**
   * 保存事件到localStorage
   */
  private saveEvents(): void {
    try {
      if (typeof sessionStorage !== 'undefined') {
        const data = JSON.stringify(this.events.slice(-50)) // 只保存最近50条
        sessionStorage.setItem(this.storageKey, data)
      }
    } catch (error) {
      console.error('保存安全事件失败:', error)
    }
  }

  /**
   * 从localStorage加载事件
   */
  private loadEvents(): void {
    try {
      if (typeof sessionStorage !== 'undefined') {
        const data = sessionStorage.getItem(this.storageKey)
        if (data) {
          this.events = JSON.parse(data)
        }
      }
    } catch (error) {
      console.error('加载安全事件失败:', error)
    }
  }

  /**
   * 分析安全事件，检测异常模式
   * @returns 分析结果
   */
  analyze(): {
    totalEvents: number
    eventCounts: Record<SecurityEventType, number>
    recentFailures: number
    hasSuspiciousActivity: boolean
  } {
    const eventCounts = {} as Record<SecurityEventType, number>
    let recentFailures = 0
    let hasSuspiciousActivity = false

    // 统计事件数量
    for (const event of this.events) {
      eventCounts[event.type] = (eventCounts[event.type] || 0) + 1

      // 统计最近的失败登录
      if (event.type === SecurityEventType.LOGIN_FAILURE && Date.now() - event.timestamp < 15 * 60 * 1000) {
        recentFailures++
      }

      // 检测可疑活动
      if (
        [
          SecurityEventType.XSS_ATTEMPT,
          SecurityEventType.SQL_INJECTION_ATTEMPT,
          SecurityEventType.SUSPICIOUS_ACTIVITY,
        ].includes(event.type)
      ) {
        hasSuspiciousActivity = true
      }
    }

    return {
      totalEvents: this.events.length,
      eventCounts,
      recentFailures,
      hasSuspiciousActivity,
    }
  }
}

// 导出单例
export const securityAuditor = new SecurityAuditor()
