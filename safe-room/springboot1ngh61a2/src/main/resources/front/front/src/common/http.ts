import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import router from '@/router'
import storage from '@/common/storage'
import config from '@/config/config'
import { getOrCreateCsrfToken, CSRF_TOKEN_HEADER } from '@/utils/csrf'

export interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

const http: AxiosInstance = axios.create({
  timeout: 1000 * 86400,
  withCredentials: true,
  baseURL: config.name,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
})

// 生成请求ID用于追踪
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Request interceptor
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.get('frontToken')
    if (config.headers) {
      config.headers['Token'] = token || ''
      
      // 添加CSRF Token（仅对非GET请求）
      if (config.method && config.method.toUpperCase() !== 'GET') {
        const csrfToken = getOrCreateCsrfToken()
        config.headers[CSRF_TOKEN_HEADER] = csrfToken
      }
      
      // 添加请求ID用于追踪
      config.headers['X-Request-ID'] = generateRequestId()
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor
http.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // 对于 blob 或 arraybuffer 响应，直接返回，不进行业务错误码检查
    if (response.config?.responseType === 'blob' || response.config?.responseType === 'arraybuffer' || response.data instanceof Blob || response.data instanceof ArrayBuffer) {
      return response
    }
    
    if (response.data && typeof response.data === 'object' && 'code' in response.data) {
      const code = response.data.code
      // 处理业务错误码（非0表示错误）
      if (code !== 0 && code !== undefined && code !== null) {
        // 401: 未授权 - 使用服务器返回的消息，如果没有则使用默认消息
        if (code === 401) {
          router
            .push({
              path: `/error/${code}`,
              query: { from: router.currentRoute.value.path },
            })
            .catch(() => {})
          localStorage.clear()
          const errorMsg = response.data?.msg || '未授权访问'
          return Promise.reject(new Error(errorMsg))
        }
        // 403: 禁止访问 - 使用服务器返回的消息，如果没有则使用默认消息
        if (code === 403) {
          router
            .push({
              path: `/error/${code}`,
              query: { from: router.currentRoute.value.path },
            })
            .catch(() => {})
          localStorage.clear()
          const errorMsg = response.data?.msg || '禁止访问'
          return Promise.reject(new Error(errorMsg))
        }
        // 500: 业务错误码 500（注意：这是业务错误码，不是 HTTP 状态码 500）
        // 业务错误码 500 通常表示业务逻辑错误（如登录失败、数据验证失败等）
        // 不应该重试，也不应该跳转到错误页面，应该让调用方自己处理
        if (code === 500) {
          const errorMsg = response.data?.msg || '服务器内部错误'
          const url = response.config?.url || ''
          
          // 判断是否为登录相关请求
          const isLoginRequest = url.includes('/login')
          // 判断是否为需要让组件自己处理的请求（登录、注册等业务接口）
          const isBusinessRequest = isLoginRequest || 
                                   url.includes('/register') ||
                                   url.includes('/api/') ||
                                   url.includes('/list') ||
                                   url.includes('/detail')
          
          // 对于业务请求（如登录），不跳转错误页面，直接返回错误消息让组件处理
          if (isBusinessRequest) {
            // 业务错误不需要添加"请稍后重试"后缀，直接返回原始错误消息
            return Promise.reject(new Error(errorMsg))
          }
          
          // 对于其他请求，输出错误日志并跳转到错误页面
          console.error('[HTTP拦截器] 业务错误码500:', {
            url: response.config?.url,
            method: response.config?.method,
            message: errorMsg,
            data: response.data,
          })
          
          router
            .push({
              path: '/error/500',
              query: { from: router.currentRoute.value.path },
            })
            .catch(() => {})
          
          return Promise.reject(new Error(errorMsg.includes('请稍后重试') ? errorMsg : `${errorMsg}，请稍后重试`))
        }
        // 其他业务错误码（如 404, 409 等），抛出错误
        const errorMessage = response.data?.msg || `请求失败 (code: ${code})`
        return Promise.reject(new Error(errorMessage))
      }
    }
    return response
  },
  (error: AxiosError<ApiResponse>) => {
    // 处理HTTP错误响应
    if (error.response) {
      const { status, data } = error.response
      
      // 401/403: 未授权
      if (status === 401) {
        localStorage.clear()
        router
          .push({
            path: `/error/${status}`,
            query: { from: router.currentRoute.value.path },
          })
          .catch(() => {})
        return Promise.reject(new Error('未授权访问'))
      }
      if (status === 403) {
        localStorage.clear()
        router
          .push({
            path: `/error/${status}`,
            query: { from: router.currentRoute.value.path },
          })
          .catch(() => {})
        return Promise.reject(new Error('禁止访问'))
      }
      
      // 500: HTTP 状态码 500（真正的服务器内部错误）
      // 注意：这与业务错误码 500 不同，HTTP 500 表示服务器端出现了异常
      if (status === 500) {
        const errorMsg = data?.msg || '服务器内部错误'
        const url = error.config?.url || ''
        
        // 判断是否为需要让组件自己处理的请求（登录、注册等业务接口）
        const isBusinessRequest = url.includes('/login') ||
                                 url.includes('/register') ||
                                 url.startsWith('/api/') ||
                                 url.includes('/list') ||
                                 url.includes('/detail')
        
        // 对于业务请求，不跳转错误页面，让组件自己处理
        if (isBusinessRequest) {
          console.error('[HTTP拦截器] HTTP 500服务器错误（业务请求）:', {
            url: error.config?.url,
            method: error.config?.method,
            status: status,
            message: errorMsg,
          })
          return Promise.reject(new Error(errorMsg))
        }
        
        // 对于其他请求，输出错误日志并跳转到错误页面
        console.error('[HTTP拦截器] HTTP 500服务器错误:', {
          url: error.config?.url,
          method: error.config?.method,
          status: status,
          message: errorMsg,
          data: data,
          error: error
        })
        
        router
          .push({
            path: '/error/500',
            query: { from: router.currentRoute.value.path },
          })
          .catch(() => {})
        
        return Promise.reject(new Error(errorMsg.includes('请稍后重试') ? errorMsg : `${errorMsg}，请稍后重试`))
      }
      
      // 其他HTTP错误状态码（400, 404等），尝试从响应数据中提取错误消息
      if (data && typeof data === 'object' && 'msg' in data) {
        return Promise.reject(new Error(data.msg as string))
      }
      // 如果没有msg字段，使用默认的HTTP状态码错误消息
      return Promise.reject(new Error(`Request failed with status code ${status}`))
    }
    
    // 网络错误处理
    if (error.code === 'ECONNABORTED' ||
        error.message?.includes('Network Error') ||
        error.message?.includes('timeout') ||
        error.message?.includes('ENOTFOUND') ||
        error.message?.includes('ECONNREFUSED') ||
        error.message?.includes('ECONNRESET') ||
        error.message?.includes('getaddrinfo') ||
        error.message?.includes('connect ') ||
        error.message?.includes('read ')) {
      console.error('[HTTP拦截器] 网络错误:', {
        url: error.config?.url,
        method: error.config?.method,
        code: error.code,
        message: error.message,
        error: error
      })
      router
        .push({
          path: '/error/network',
          query: { from: router.currentRoute.value.path },
        })
        .catch(() => {})
      // 根据错误类型返回不同的错误消息
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return Promise.reject(new Error('网络请求超时，请稍后重试'))
      }
      return Promise.reject(new Error('网络连接失败，请检查网络设置'))
    }
    
    // 其他未处理的错误，也输出到控制台
    console.error('[HTTP拦截器] 未处理的HTTP错误:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status || 'unknown',
      message: error.message,
      error: error
    })
    
    return Promise.reject(error)
  },
)

export default http

// 导出 CancelToken 用于请求取消
export const CancelToken = axios.CancelToken

