/**
 * 全局错误处理工具
 * 捕获所有前端运行时错误，包括：
 * - Vue 组件错误
 * - 未处理的 Promise 拒绝
 * - 全局 JavaScript 错误
 * - 资源加载错误
 * 使用Chrome浏览器原生的错误捕获机制
 */

interface ErrorInfo {
  message: string
  source?: string
  lineno?: number
  colno?: number
  error?: Error
  stack?: string
  timestamp: string
  userAgent: string
  url: string
  type: 'vue' | 'promise' | 'error' | 'resource'
  level?: 'error' | 'warn' | 'info' | 'debug'
  componentName?: string
}

/**
 * 格式化错误信息
 */
function formatError(error: unknown, type: ErrorInfo['type']): ErrorInfo {
  const errorInfo: ErrorInfo = {
    message: '',
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    type,
  }

  if (error instanceof Error) {
    errorInfo.message = error.message
    errorInfo.stack = error.stack
    errorInfo.error = error
  } else if (typeof error === 'string') {
    errorInfo.message = error
  } else if (error && error.toString) {
    errorInfo.message = error.toString()
  } else {
    errorInfo.message = '未知错误'
  }

  return errorInfo
}

// 错误去重缓存（基于消息+堆栈+类型，5秒内相同错误只记录一次）
const errorDedupeCache = new Map<string, number>()
const DEDUPE_TIME = 5000 // 5秒

// 错误发送队列
const errorQueue: ErrorInfo[] = []
const QUEUE_BATCH_SIZE = 10
const QUEUE_FLUSH_INTERVAL = 5000 // 5秒
let queueTimer: number | null = null

// 错误发送配置
const ERROR_REPORT_CONFIG = {
  enabled: true, // 可通过配置控制
  apiEndpoint: '/api/error/report',
  maxRetries: 3,
  retryDelay: 1000, // 初始重试延迟1秒
}

/**
 * 生成错误去重键
 */
function getErrorDedupeKey(errorInfo: ErrorInfo): string {
  const stack = errorInfo.stack || ''
  const message = errorInfo.message || ''
  return `${errorInfo.type}:${message.substring(0, 100)}:${stack.substring(0, 200)}`
}

/**
 * 检查错误是否应该被去重
 */
function shouldDedupeError(errorInfo: ErrorInfo): boolean {
  const key = getErrorDedupeKey(errorInfo)
  const now = Date.now()
  const lastTime = errorDedupeCache.get(key)

  if (lastTime && now - lastTime < DEDUPE_TIME) {
    return true // 5秒内相同错误，去重
  }

  errorDedupeCache.set(key, now)

  // 清理过期缓存（保留最近100条）
  if (errorDedupeCache.size > 100) {
    const entries = Array.from(errorDedupeCache.entries())
    entries.sort((a, b) => b[1] - a[1])
    errorDedupeCache.clear()
    entries.slice(0, 100).forEach(([k, v]) => errorDedupeCache.set(k, v))
  }

  return false
}

/**
 * 清除错误去重缓存（仅用于测试）
 */
export function clearErrorDedupeCache(): void {
  errorDedupeCache.clear()
}

/**
 * 发送错误到后端API
 */
async function sendErrorToServer(errorInfo: ErrorInfo, retryCount = 0): Promise<void> {
  if (!ERROR_REPORT_CONFIG.enabled) {
    return
  }

  // 检查网络状态
  if (!navigator.onLine) {
    return // 离线时不发送
  }

  try {
    // 动态导入http以避免循环依赖
    const http = (await import('./http')).default

    await http.post(ERROR_REPORT_CONFIG.apiEndpoint, errorInfo)
  } catch (error) {
    // 重试机制
    if (retryCount < ERROR_REPORT_CONFIG.maxRetries) {
      const delay = ERROR_REPORT_CONFIG.retryDelay * Math.pow(2, retryCount) // 指数退避
      setTimeout(() => {
        sendErrorToServer(errorInfo, retryCount + 1).catch(() => {
          // 重试失败，静默处理
        })
      }, delay)
    }
  }
}

/**
 * 批量发送错误队列
 */
function flushErrorQueue() {
  if (errorQueue.length === 0) {
    return
  }

  const errorsToSend = errorQueue.splice(0, QUEUE_BATCH_SIZE)

  // 批量发送
  Promise.all(errorsToSend.map(error => sendErrorToServer(error))).catch(() => {
    // 发送失败，将错误重新加入队列（但限制队列大小）
    if (errorQueue.length < 100) {
      errorQueue.unshift(...errorsToSend)
    }
  })

  // 如果队列还有错误，继续定时发送
  if (errorQueue.length > 0 && !queueTimer) {
    queueTimer = window.setTimeout(() => {
      queueTimer = null
      flushErrorQueue()
    }, QUEUE_FLUSH_INTERVAL)
  }
}

/**
 * 处理错误 - 本地存储 + 发送到服务器
 */
function handleError(errorInfo: ErrorInfo) {
  // 错误去重检查
  if (shouldDedupeError(errorInfo)) {
    return // 相同错误在5秒内只记录一次
  }

  // 在控制台输出错误信息（所有环境都输出，便于调试）
  const level = errorInfo.level || 'error'
  const consoleMethod =
    level === 'error'
      ? console.error
      : level === 'warn'
        ? console.warn
        : level === 'info'
          ? console.info
          : level === 'debug'
            ? console.debug
            : console.log

  console.group(`🚨 ${errorInfo.type.toUpperCase()} 错误捕获`)
  consoleMethod('错误信息:', errorInfo.message)
  if (errorInfo.stack) {
    consoleMethod('错误堆栈:', errorInfo.stack)
  }
  consoleMethod('错误详情:', errorInfo)
  console.groupEnd()

  // 存储到 localStorage
  try {
    const errors = JSON.parse(localStorage.getItem('admin_errors') || '[]')
    errors.push(errorInfo)
    // 只保留最近 50 条错误
    if (errors.length > 50) {
      errors.shift()
    }
    localStorage.setItem('admin_errors', JSON.stringify(errors))
  } catch (e) {
    // 静默处理localStorage错误
  }

  // 添加到发送队列
  errorQueue.push(errorInfo)

  // 如果队列达到批量大小，立即发送
  if (errorQueue.length >= QUEUE_BATCH_SIZE) {
    flushErrorQueue()
  } else if (!queueTimer) {
    // 否则设置定时器
    queueTimer = window.setTimeout(() => {
      queueTimer = null
      flushErrorQueue()
    }, QUEUE_FLUSH_INTERVAL)
  }
}

/**
 * Vue 错误处理器
 */
export function vueErrorHandler(err: unknown, instance: any, info: string) {
  const errorInfo = formatError(err, 'vue')
  errorInfo.message = `Vue 组件错误 [${info}]: ${errorInfo.message}`

  if (instance) {
    // Vue 3 兼容性：尝试获取组件名称
    const componentName = instance.$options?.name || instance.type?.name || instance.type?.__name || 'Unknown'
    errorInfo.componentName = componentName
    errorInfo.message += ` | 组件: ${componentName}`
  }

  handleError(errorInfo)
}

/**
 * Promise 未捕获错误处理器
 */
export function unhandledRejectionHandler(event: PromiseRejectionEvent) {
  const errorInfo = formatError(event.reason, 'promise')
  errorInfo.message = `未处理的 Promise 拒绝: ${errorInfo.message}`

  // 先处理错误（会输出到控制台）
  handleError(errorInfo)

  // 然后阻止默认行为（避免重复输出）
  event.preventDefault()
}

/**
 * 全局 JavaScript 错误处理器
 */
export function globalErrorHandler(
  event: ErrorEvent | Event,
  source?: string,
  lineno?: number,
  colno?: number,
  error?: Error,
) {
  let errorInfo: ErrorInfo

  if (event instanceof ErrorEvent) {
    errorInfo = formatError(event.error || event.message, 'error')
    errorInfo.source = event.filename
    errorInfo.lineno = event.lineno
    errorInfo.colno = event.colno
  } else {
    errorInfo = formatError(event, 'error')
    errorInfo.source = source
    errorInfo.lineno = lineno
    errorInfo.colno = colno
    if (error) {
      errorInfo.error = error
      errorInfo.stack = error.stack
    }
  }

  handleError(errorInfo)
}

/**
 * 资源加载错误处理器
 */
export function resourceErrorHandler(event: ErrorEvent) {
  const target = event.target as HTMLElement

  if (target && (target.tagName === 'IMG' || target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
    const errorInfo: ErrorInfo = {
      message: `资源加载失败: ${target.tagName} - ${(target as HTMLImageElement).src || (target as HTMLLinkElement).href || 'unknown'}`,
      source: (target as HTMLImageElement).src || (target as HTMLLinkElement).href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      type: 'resource',
    }

    handleError(errorInfo)
  }
}

/**
 * 初始化所有错误处理器
 * 使用Chrome浏览器原生的错误捕获机制
 */
export function setupErrorHandlers() {
  // 全局 JavaScript 错误和资源加载错误监听器
  window.addEventListener(
    'error',
    event => {
      // 检查是否是资源加载错误
      const target = event.target as HTMLElement
      if (target && (target.tagName === 'IMG' || target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
        resourceErrorHandler(event)
      } else {
        // 普通 JavaScript 错误
        globalErrorHandler(event, event.filename, event.lineno, event.colno, event.error)
      }
    },
    true,
  ) // 使用捕获阶段，确保能捕获所有错误

  // Promise 未捕获错误监听器
  window.addEventListener('unhandledrejection', event => {
    unhandledRejectionHandler(event)
  })
}

/**
 * 获取存储的错误列表
 */
export function getStoredErrors(): ErrorInfo[] {
  try {
    return JSON.parse(localStorage.getItem('admin_errors') || '[]')
  } catch {
    return []
  }
}

/**
 * 清除存储的错误
 */
export function clearStoredErrors() {
  localStorage.removeItem('admin_errors')
}

