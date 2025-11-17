import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError, CancelToken } from 'axios'
import router from '@/router/index'
import storage from '@/utils/storage'
import { tokenStorage } from '@/utils/secureStorage'
import { getOrCreateCsrfToken, CSRF_TOKEN_HEADER } from '@/utils/csrf'
import { errorHandler } from '@/utils/errorHandler'

export interface ApiResponse<T extends Record<string, unknown> = Record<string, unknown>> {
  code: number
  msg: string
  data: T
}

// 导出CancelToken以便测试使用
export type { CancelToken }

const http: AxiosInstance = axios.create({
  timeout: 1000 * 86400,
  withCredentials: true,
  baseURL: '/springboot1ngh61a2',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
})

// 重试配置
const MAX_RETRY_COUNT = 3
const RETRY_DELAY = 1000

// 重试请求
async function retryRequest(config: InternalAxiosRequestConfig, retryCount = 0): Promise<AxiosResponse> {
  return new Promise((resolve, reject) => {
    setTimeout(
      () => {
        http.request(config).then(resolve).catch(reject)
      },
      RETRY_DELAY * (retryCount + 1),
    )
  })
}

// 生成请求ID用于追踪
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Request interceptor
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 添加Token（优先使用secureStorage，向后兼容localStorage）
    const token = tokenStorage.getToken() || storage.get('Token')
    if (config.headers) {
      config.headers['Token'] = token || ''

      // 添加CSRF Token（仅对非GET请求）
      if (config.method && config.method.toUpperCase() !== 'GET') {
        const csrfToken = getOrCreateCsrfToken()
        config.headers[CSRF_TOKEN_HEADER] = csrfToken
      }

      // 添加请求ID用于追踪
      config.headers['X-Request-ID'] = generateRequestId()

      // 添加时间戳用于防重放（可选，后端需要验证）
      config.headers['X-Request-Time'] = String(Date.now())
    }
    return config
  },
  error => Promise.reject(error),
)

// Response interceptor
http.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {

    if (response.data) {
      const code = response.data.code

      // 处理业务错误码
      if (code !== 0 && code !== undefined) {
        const error = new Error(response.data?.msg || `请求失败: ${code}`)

        // 为错误对象添加response信息，便于ErrorHandlerService处理
        ;(error as any).response = {
          status: code === 401 ? 401 : code === 403 ? 403 : code === 500 ? 500 : code === 503 ? 503 : 400,
          data: response.data
        }
        ;(error as any).config = response.config

        // 特殊处理登录接口的500错误
        if (code === 500) {
          const url = response.config?.url || ''
          const isLoginRequest = url.includes('/login')
          if (isLoginRequest) {
            // 登录接口不使用统一错误处理器，让组件自己处理
            return Promise.reject(error)
          }

          // 对于非登录接口，检查重试
          const config = response.config as InternalAxiosRequestConfig & { __retryCount?: number }
          const retryCount = config.__retryCount || 0

          if (retryCount < MAX_RETRY_COUNT) {
            config.__retryCount = retryCount + 1
            return retryRequest(config, retryCount)
          }
        }

        // 使用统一错误处理器
        return errorHandler.handleApiError(error, {
          showToast: true,
          redirect: true,
          logToConsole: true,
          context: 'HTTP Response'
        })
      }
    }
    return response
  },
  (error: AxiosError<ApiResponse>) => {

    // 处理HTTP错误和网络错误
    const status = error.response?.status
    const url = error.config?.url || ''

    // 特殊处理登录接口的500错误
    if (status === 500 && url.includes('/login')) {
      const errorMsg = error.response?.data?.msg || '登录失败，服务器内部错误'
      console.error('[HTTP拦截器] 登录接口HTTP 500错误:', {
        url: error.config?.url,
        method: error.config?.method,
        status: status,
        message: errorMsg,
        data: error.response?.data,
      })
      // 登录接口的500错误不使用统一错误处理器，让组件自己处理
      return Promise.reject(new Error(errorMsg))
    }

    // 处理500错误重试逻辑
    if (status === 500 && !url.includes('/login')) {
      const config = error.config as InternalAxiosRequestConfig & { __retryCount?: number }
      const retryCount = config.__retryCount || 0

      if (retryCount < MAX_RETRY_COUNT) {
        config.__retryCount = retryCount + 1
        return retryRequest(config, retryCount)
      }
    }

    // 使用统一错误处理器
    return errorHandler.handleApiError(error, {
      showToast: true,
      redirect: true,
      logToConsole: true,
      context: 'HTTP Error'
    })
  },
)

// 导出CancelToken以支持请求取消
;(http as any).CancelToken = axios.CancelToken

export default http
