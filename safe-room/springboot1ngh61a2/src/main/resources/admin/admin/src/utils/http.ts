import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError, CancelToken } from 'axios'
import router from '@/router/index'
import storage from '@/utils/storage'
import { tokenStorage } from '@/utils/secureStorage'
import { getOrCreateCsrfToken, CSRF_TOKEN_HEADER } from '@/utils/csrf'

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
      const currentPath = router.currentRoute?.value?.path || window.location.pathname

      // 避免在错误页面重复跳转
      if (currentPath.startsWith('/error/')) {
        return response
      }

      if (code === 401) {
        // 先清除Token，然后跳转到登录页
        tokenStorage.clearToken()
        storage.remove('Token')
        storage.clear()
        sessionStorage.clear()
        router
          .push({
            name: 'login',
          })
          .catch(() => {})
        return Promise.reject(new Error(response.data?.msg || 'Unauthorized'))
      }
      if (code === 403) {
        router
          .push({
            path: '/error/403',
            query: { from: currentPath },
          })
          .catch(() => {})
        return Promise.reject(new Error(response.data?.msg || 'Forbidden'))
      }
      if (code === 500) {
        const url = response.config?.url || ''
        const isLoginRequest = url.includes('/login')

        // 对于登录接口，不进行重试，直接返回错误让组件处理
        if (isLoginRequest) {
          const errorMsg = response.data?.msg || '登录失败，服务器错误'
          // console.error('[HTTP拦截器] 登录接口返回500错误:', {
          //   url: response.config?.url,
          //   method: response.config?.method,
          //   message: errorMsg,
          //   data: response.data,
          // })
          // 登录接口的500错误不跳转错误页面，让登录组件自己处理
          return Promise.reject(new Error(errorMsg))
        }

        const config = response.config as InternalAxiosRequestConfig & { __retryCount?: number }
        const retryCount = config.__retryCount || 0

        // 如果未达到最大重试次数，则重试
        if (retryCount < MAX_RETRY_COUNT) {
          config.__retryCount = retryCount + 1
          return retryRequest(config, retryCount)
        }

        // 达到最大重试次数，输出错误信息到控制台，便于调试
        console.error('[HTTP拦截器] 服务器返回500错误:', {
          url: response.config?.url,
          method: response.config?.method,
          message: response.data?.msg || 'Server Error',
          data: response.data,
          response: response,
        })
        router
          .push({
            path: '/error/500',
            query: { from: currentPath },
          })
          .catch(() => {})
        return Promise.reject(new Error(response.data?.msg || 'Server Error'))
      }
      // 处理503错误码（系统维护）
      if (code === 503) {
        router
          .push({
            path: '/error/503',
            query: { from: currentPath },
          })
          .catch(() => {})
        return Promise.reject(new Error(response.data?.msg || 'Service Unavailable'))
      }
      // 处理其他错误码（如404, 409等）
      if (code !== 0 && code !== undefined) {
        return Promise.reject(new Error(response.data?.msg || `请求失败: ${code}`))
      }
    }
    return response
  },
  (error: AxiosError<ApiResponse>) => {
    // 处理网络错误和HTTP错误
    const currentPath = router.currentRoute.value.path

    // 避免在错误页面重复跳转
    if (currentPath.startsWith('/error/')) {
      return Promise.reject(error)
    }

    if (error.response) {
      const { status, data } = error.response

      // 401/403: 未授权
      if (status === 401) {
        // 先清除Token，然后跳转到登录页
        tokenStorage.clearToken()
        storage.remove('Token')
        storage.clear()
        sessionStorage.clear()
        router
          .push({
            name: 'login',
          })
          .catch(() => {})
        return Promise.reject(new Error(data?.msg || 'Unauthorized'))
      }
      if (status === 403) {
        router
          .push({
            path: '/error/403',
            query: { from: currentPath },
          })
          .catch(() => {})
        return Promise.reject(new Error(data?.msg || 'Forbidden'))
      }

      // 500: 服务器错误 - 支持重试
      if (status === 500) {
        const url = error.config?.url || ''
        const isLoginRequest = url.includes('/login')

        // 对于登录接口，不进行重试，直接返回错误让组件处理
        if (isLoginRequest) {
          const errorMsg = data?.msg || '登录失败，服务器内部错误'
          console.error('[HTTP拦截器] 登录接口HTTP 500错误:', {
            url: error.config?.url,
            method: error.config?.method,
            status: status,
            message: errorMsg,
            data: data,
          })
          // 登录接口的500错误不跳转错误页面，让登录组件自己处理
          return Promise.reject(new Error(errorMsg))
        }

        const config = error.config as InternalAxiosRequestConfig & { __retryCount?: number }
        const retryCount = config.__retryCount || 0

        // 如果未达到最大重试次数，则重试
        if (retryCount < MAX_RETRY_COUNT) {
          config.__retryCount = retryCount + 1
          return retryRequest(config, retryCount)
        }

        // 达到最大重试次数，输出错误信息到控制台，便于调试
        console.error('[HTTP拦截器] HTTP 500服务器错误:', {
          url: error.config?.url,
          method: error.config?.method,
          status: status,
          message: data?.msg || '服务器内部错误',
          data: data,
          error: error,
        })
        router
          .push({
            path: '/error/500',
            query: { from: currentPath },
          })
          .catch(() => {})
        return Promise.reject(new Error(data?.msg || '服务器内部错误，请稍后重试'))
      }

      // 其他错误，返回后端错误消息（如果安全）
      const errorMessage = data?.msg || `请求失败: ${status}`
      return Promise.reject(new Error(errorMessage))
    }

    // 网络错误
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.error('[HTTP拦截器] 网络超时错误:', {
        url: error.config?.url,
        method: error.config?.method,
        code: error.code,
        message: error.message,
        error: error,
      })
      router
        .push({
          path: '/error/network',
          query: { from: currentPath },
        })
        .catch(() => {})
      return Promise.reject(new Error('网络请求超时，请稍后重试'))
    }

    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.error('[HTTP拦截器] 网络连接错误:', {
        url: error.config?.url,
        method: error.config?.method,
        code: error.code,
        message: error.message,
        error: error,
      })
      router
        .push({
          path: '/error/network',
          query: { from: currentPath },
        })
        .catch(() => {})
      return Promise.reject(new Error('网络连接失败，请检查网络设置'))
    }

    // 其他未处理的错误，也输出到控制台
    console.error('[HTTP拦截器] 未处理的HTTP错误:', {
      url: error.config?.url,
      method: error.config?.method,
      status: (error.response as any)?.status,
      message: error.message,
      error: error,
    })

    // 其他错误
    return Promise.reject(error)
  },
)

// 导出CancelToken以支持请求取消
;(http as any).CancelToken = axios.CancelToken

export default http
