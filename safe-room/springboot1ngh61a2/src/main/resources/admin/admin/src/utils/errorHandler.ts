import axios from 'axios'

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
 * 创建简化的错误报告HTTP客户端（避免循环依赖）
 */
function createErrorReportClient() {
  const client = axios.create({
    timeout: 5000, // 5秒超时
    baseURL: '/springboot1ngh61a2',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  })

  // 简化的请求拦截器，只添加基本header
  client.interceptors.request.use(config => {
    config.headers['X-Error-Report'] = 'true'
    return config
  })

  return client
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
    // 使用独立的HTTP客户端，避免与主HTTP实例的循环依赖
    const errorClient = createErrorReportClient()
    await errorClient.post(ERROR_REPORT_CONFIG.apiEndpoint, errorInfo)
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

// ========================================
// 统一错误处理服务类
// ========================================

import { AxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router/index'
import type { ApiResponse } from './http'

/**
 * 错误处理选项
 */
export interface ErrorHandlerOptions {
  showToast?: boolean
  redirect?: boolean
  logToConsole?: boolean
  context?: string
}

/**
 * 表单验证错误
 */
export interface ValidationError {
  field: string
  message: string
  rule?: any
}

/**
 * 错误类型枚举
 */
export enum ErrorType {
  NETWORK = 'network',
  HTTP = 'http',
  BUSINESS = 'business',
  VALIDATION = 'validation',
  SYSTEM = 'system'
}

/**
 * 统一错误处理服务类
 */
export class ErrorHandlerService {
  private static instance: ErrorHandlerService

  static getInstance(): ErrorHandlerService {
    if (!ErrorHandlerService.instance) {
      ErrorHandlerService.instance = new ErrorHandlerService()
    }
    return ErrorHandlerService.instance
  }

  /**
   * 处理API错误（主要用于HTTP拦截器）
   */
  handleApiError(error: AxiosError | Error, options: ErrorHandlerOptions = {}): Promise<any> {
    const {
      showToast = true,
      redirect = true,
      logToConsole = true,
      context = ''
    } = options

    if (logToConsole) {
      console.error(`[${context}] API Error:`, error)
    }

    // 网络错误
    if (this.isNetworkError(error)) {
      return this.handleNetworkError(error, showToast, redirect)
    }

    // HTTP状态码错误
    if (this.isHttpError(error)) {
      return this.handleHttpError(error as AxiosError, showToast, redirect, context)
    }

    // 业务错误（后端返回的错误码）
    if (this.isBusinessError(error)) {
      return this.handleBusinessError(error, showToast, context)
    }

    // 系统错误
    return this.handleSystemError(error, showToast)
  }

  /**
   * 处理表单验证错误
   */
  handleFormValidationError(errors: ValidationError[]): void {
    if (!errors || errors.length === 0) return

    // 显示第一个错误
    const firstError = errors[0]
    ElMessage.error(firstError.message)

    // 可以扩展：显示所有错误或字段级错误
    if (errors.length > 1) {
      console.warn('表单验证错误:', errors)
    }
  }

  /**
   * 处理业务逻辑错误
   */
  handleBusinessError(error: Error, context?: string): Promise<any> {
    const message = this.extractErrorMessage(error)
    console.error(`[${context}] 业务错误:`, message)

    ElMessage.error(message)
    return Promise.reject(error)
  }

  /**
   * 统一提取错误消息
   */
  extractErrorMessage(error: any): string {
    // 优先级：error.response?.data?.msg → error.response?.data?.message → error.message → '操作失败'

    if (error?.response?.data) {
      const data = error.response.data
      if (typeof data === 'string') return data
      if (data?.msg) return data.msg
      if (data?.message) return data.message
      if (data?.error) return data.error
    }

    if (error?.message) return error.message
    if (typeof error === 'string') return error

    return '操作失败'
  }

  /**
   * 统一显示错误提示
   */
  showError(message: string, type: 'error' | 'warning' | 'info' = 'error'): void {
    switch (type) {
      case 'warning':
        ElMessage.warning(message)
        break
      case 'info':
        ElMessage.info(message)
        break
      default:
        ElMessage.error(message)
    }
  }

  /**
   * 判断是否需要路由跳转
   */
  shouldRedirect(error: any): boolean {
    if (error?.response?.status) {
      const status = error.response.status
      return [401, 403, 500].includes(status)
    }

    if (this.isNetworkError(error)) {
      return true
    }

    return false
  }

  /**
   * 统一处理路由跳转
   */
  handleRedirect(error: any): void {
    if (!this.shouldRedirect(error)) return

    const currentPath = router.currentRoute?.value?.path || window.location.pathname

    // 避免在错误页面重复跳转
    if (currentPath.startsWith('/error/')) return

    if (error?.response?.status) {
      const status = error.response.status
      switch (status) {
        case 401:
          // 清除认证信息并跳转登录
          this.clearAuthAndRedirect('/login')
          break
        case 403:
          router.push({
            path: '/error/403',
            query: { from: currentPath }
          }).catch(() => {})
          break
        case 500:
          // 检查是否为登录接口，登录接口不跳转错误页面
          const url = error.config?.url || ''
          if (!url.includes('/login')) {
            router.push({
              path: '/error/500',
              query: { from: currentPath }
            }).catch(() => {})
          }
          break
      }
    } else if (this.isNetworkError(error)) {
      router.push({
        path: '/error/network',
        query: { from: currentPath }
      }).catch(() => {})
    }
  }

  // ========================================
  // 私有方法
  // ========================================

  private isNetworkError(error: any): boolean {
    return (
      error.code === 'ECONNABORTED' ||
      error.code === 'ERR_NETWORK' ||
      error.message?.includes('timeout') ||
      error.message === 'Network Error'
    )
  }

  private isHttpError(error: any): boolean {
    return !!(error.response?.status && error.response.status >= 400)
  }

  private isBusinessError(error: any): boolean {
    // 后端业务错误通常有response.data.code
    return !!(
      error.response?.data &&
      typeof error.response.data === 'object' &&
      'code' in error.response.data &&
      error.response.data.code !== 0
    )
  }

  private handleNetworkError(error: AxiosError | Error, showToast: boolean, redirect: boolean): Promise<any> {
    let message = '网络连接失败，请检查网络设置'

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      message = '网络请求超时，请稍后重试'
    }

    if (showToast) {
      this.showError(message, 'warning')
    }

    if (redirect) {
      this.handleRedirect(error)
    }

    return Promise.reject(error)
  }

  private handleHttpError(error: AxiosError, showToast: boolean, redirect: boolean, context: string): Promise<any> {
    const status = error.response?.status
    const data = error.response?.data as ApiResponse

    let message = this.extractErrorMessage(error)

    // 根据状态码提供友好提示
    switch (status) {
      case 400:
        message = message || '请求参数错误'
        break
      case 404:
        message = message || '请求的资源不存在'
        break
      case 408:
        message = '请求超时，请稍后重试'
        break
      case 429:
        message = '请求过于频繁，请稍后重试'
        break
      case 500:
        message = message || '服务器内部错误，请稍后重试'
        break
      case 502:
        message = '服务器暂时不可用，请稍后重试'
        break
      case 503:
        message = '服务维护中，请稍后重试'
        break
      default:
        message = message || `请求失败 (${status})`
    }

    if (showToast && status !== 401 && status !== 403) {
      this.showError(message)
    }

    if (redirect) {
      this.handleRedirect(error)
    }

    // 对于401/403，直接拒绝，不显示toast
    if (status === 401 || status === 403) {
      return Promise.reject(error)
    }

    // 对于业务错误码，直接返回错误消息
    if (data?.code && data.code !== 0) {
      return Promise.reject(new Error(message))
    }

    return Promise.reject(error)
  }

  private handleSystemError(error: Error, showToast: boolean): Promise<any> {
    const message = this.extractErrorMessage(error)

    if (showToast) {
      this.showError(message)
    }

    return Promise.reject(error)
  }

  private clearAuthAndRedirect(loginPath: string): void {
    // 清除认证信息
    const tokenStorage = require('@/utils/secureStorage').tokenStorage
    const storage = require('@/utils/storage')

    tokenStorage.clearToken()
    storage.remove('Token')
    storage.clear()
    sessionStorage.clear()

    // 跳转登录页
    router.push({
      name: 'login'
    }).catch(() => {})
  }
}

// 导出单例实例
export const errorHandler = ErrorHandlerService.getInstance()

