import MockAdapter from 'axios-mock-adapter'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockPush = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))
const mockReplace = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))
const mockCurrentRoute = vi.hoisted(() => ({
  value: {
    path: '/current',
  },
}))

vi.mock('@/router', () => {
  return {
    default: {
      push: mockPush,
      replace: mockReplace,
      currentRoute: mockCurrentRoute,
    },
  }
})

import router from '@/router'
import http from '@/common/http'
import { CSRF_TOKEN_HEADER } from '@/utils/csrf'

describe('http client', () => {
  let mock: MockAdapter

  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    mock = new MockAdapter(http)
    mockPush.mockClear()
    mockReplace.mockClear()
  })

  afterEach(() => {
    mock.restore()
    vi.clearAllMocks()
  })

  describe('请求拦截器', () => {
    it('为请求添加 Token 头', async () => {
      localStorage.setItem('frontToken', 'secret-token')
      mock.onGet('/ping').reply(200, { code: 0, data: { ok: true } })

      await http.get('/ping')

      const request = mock.history.get[0]
      expect(request.headers?.Token).toBe('secret-token')
    })

    it('当没有 Token 时，Token 头为空字符串', async () => {
      mock.onGet('/ping').reply(200, { code: 0, data: { ok: true } })

      await http.get('/ping')

      const request = mock.history.get[0]
      expect(request.headers?.Token).toBe('')
    })

    it('为 POST 请求添加 CSRF Token', async () => {
      mock.onPost('/api/test').reply(200, { code: 0, data: {} })

      await http.post('/api/test', { data: 'test' })

      const request = mock.history.post[0]
      expect(request.headers?.[CSRF_TOKEN_HEADER]).toBeDefined()
      expect(request.headers?.[CSRF_TOKEN_HEADER]).toMatch(/^[a-f0-9]{64}$/)
    })

    it('为 PUT 请求添加 CSRF Token', async () => {
      mock.onPut('/api/test').reply(200, { code: 0, data: {} })

      await http.put('/api/test', { data: 'test' })

      const request = mock.history.put[0]
      expect(request.headers?.[CSRF_TOKEN_HEADER]).toBeDefined()
    })

    it('为 DELETE 请求添加 CSRF Token', async () => {
      mock.onDelete('/api/test').reply(200, { code: 0, data: {} })

      await http.delete('/api/test')

      const request = mock.history.delete[0]
      expect(request.headers?.[CSRF_TOKEN_HEADER]).toBeDefined()
    })

    it('GET 请求不添加 CSRF Token', async () => {
      mock.onGet('/api/test').reply(200, { code: 0, data: {} })

      await http.get('/api/test')

      const request = mock.history.get[0]
      expect(request.headers?.[CSRF_TOKEN_HEADER]).toBeUndefined()
    })

    it('为每个请求添加唯一的请求ID', async () => {
      mock.onGet('/ping1').reply(200, { code: 0, data: {} })
      mock.onGet('/ping2').reply(200, { code: 0, data: {} })

      await http.get('/ping1')
      await http.get('/ping2')

      const request1 = mock.history.get[0]
      const request2 = mock.history.get[1]
      expect(request1.headers?.['X-Request-ID']).toBeDefined()
      expect(request2.headers?.['X-Request-ID']).toBeDefined()
      expect(request1.headers?.['X-Request-ID']).not.toBe(request2.headers?.['X-Request-ID'])
    })

    it('请求ID格式正确', async () => {
      mock.onGet('/ping').reply(200, { code: 0, data: {} })

      await http.get('/ping')

      const request = mock.history.get[0]
      const requestId = request.headers?.['X-Request-ID']
      expect(requestId).toMatch(/^req_\d+_[a-z0-9]+$/)
    })
  })

  describe('响应拦截器 - 成功响应', () => {
    it('正常返回成功响应', async () => {
      mock.onGet('/api/data').reply(200, { code: 0, msg: 'success', data: { id: 1 } })

      const response = await http.get('/api/data')

      expect(response.data.code).toBe(0)
      expect(response.data.data).toEqual({ id: 1 })
    })

    it('处理 code 为 0 的成功响应', async () => {
      mock.onGet('/api/data').reply(200, { code: 0, msg: 'ok', data: [] })

      const response = await http.get('/api/data')

      expect(response.data.code).toBe(0)
      expect(response.status).toBe(200)
    })
  })

  describe('响应拦截器 - 错误处理', () => {
    it('处理 401 错误码，跳转到错误页并清空存储', async () => {
      localStorage.setItem('frontToken', 'expired-token')
      localStorage.setItem('otherData', 'test')
      mock.onGet('/secure').reply(200, { code: 401, msg: 'Unauthorized' })

      await expect(http.get('/secure')).rejects.toThrow('Unauthorized')

      expect(router.push).toHaveBeenCalledWith({
        path: '/error/401',
        query: { from: '/current' },
      })
      expect(localStorage.length).toBe(0)
    })

    it('处理 403 错误码，跳转到错误页并清空存储', async () => {
      localStorage.setItem('frontToken', 'token')
      mock.onGet('/forbidden').reply(200, { code: 403, msg: 'Forbidden' })

      await expect(http.get('/forbidden')).rejects.toThrow('Forbidden')

      expect(router.push).toHaveBeenCalledWith({
        path: '/error/403',
        query: { from: '/current' },
      })
      expect(localStorage.length).toBe(0)
    })

    it('处理 500 错误码，跳转到错误页', async () => {
      mock.onGet('/error').reply(200, { code: 500, msg: 'Server Error' })

      await expect(http.get('/error')).rejects.toThrow('Server Error')

      expect(router.push).toHaveBeenCalledWith({
        path: '/error/500',
        query: { from: '/current' },
      })
    })

    it('处理 HTTP 401 状态码', async () => {
      localStorage.setItem('frontToken', 'token')
      mock.onGet('/unauthorized').reply(401, { code: 401, msg: 'Unauthorized' })

      await expect(http.get('/unauthorized')).rejects.toThrow('未授权访问')

      expect(router.push).toHaveBeenCalledWith({
        path: '/error/401',
        query: { from: '/current' },
      })
      expect(localStorage.length).toBe(0)
    })

    it('处理 HTTP 403 状态码', async () => {
      localStorage.setItem('frontToken', 'token')
      mock.onGet('/forbidden').reply(403, { code: 403, msg: 'Forbidden' })

      await expect(http.get('/forbidden')).rejects.toThrow('禁止访问')

      expect(router.push).toHaveBeenCalledWith({
        path: '/error/403',
        query: { from: '/current' },
      })
      expect(localStorage.length).toBe(0)
    })

    it('处理 HTTP 500 状态码', async () => {
      mock.onGet('/server-error').reply(500, { code: 500, msg: '服务器内部错误' })

      await expect(http.get('/server-error')).rejects.toThrow('服务器内部错误，请稍后重试')

      expect(router.push).toHaveBeenCalledWith({
        path: '/error/500',
        query: { from: '/current' },
      })
    })

    it('处理网络超时错误', async () => {
      mock.onGet('/timeout').timeout()

      await expect(http.get('/timeout')).rejects.toThrow()

      expect(router.push).toHaveBeenCalledWith({
        path: '/error/network',
        query: { from: '/current' },
      })
    })

    it('处理网络连接错误', async () => {
      mock.onGet('/network-error').networkError()

      await expect(http.get('/network-error')).rejects.toThrow('网络连接失败，请检查网络设置')

      expect(router.push).toHaveBeenCalledWith({
        path: '/error/network',
        query: { from: '/current' },
      })
    })

    it('处理其他 HTTP 错误状态码', async () => {
      mock.onGet('/bad-request').reply(400, { code: 400, msg: 'Bad Request' })

      await expect(http.get('/bad-request')).rejects.toThrow()
    })
  })

  describe('网络错误处理', () => {
    it('处理超时错误', async () => {
      mock.onGet('/timeout').reply(() => {
        throw new Error('timeout of 86400000ms exceeded')
      })

      await expect(http.get('/timeout')).rejects.toThrow('网络请求超时，请稍后重试')

      expect(router.push).toHaveBeenCalledWith({
        path: '/error/network',
        query: { from: '/current' },
      })
    })

    it('处理网络连接错误', async () => {
      mock.onGet('/network-error').reply(() => {
        throw new Error('Network Error')
      })

      await expect(http.get('/network-error')).rejects.toThrow('网络连接失败，请检查网络设置')

      expect(router.push).toHaveBeenCalledWith({
        path: '/error/network',
        query: { from: '/current' },
      })
    })

    it('处理DNS解析错误', async () => {
      mock.onGet('/dns-error').reply(() => {
        throw new Error('getaddrinfo ENOTFOUND')
      })

      await expect(http.get('/dns-error')).rejects.toThrow('网络连接失败，请检查网络设置')
    })

    it('处理服务器拒绝连接错误', async () => {
      mock.onGet('/connection-refused').reply(() => {
        throw new Error('connect ECONNREFUSED')
      })

      await expect(http.get('/connection-refused')).rejects.toThrow('网络连接失败，请检查网络设置')
    })

    it('处理服务器无响应错误', async () => {
      mock.onGet('/no-response').reply(() => {
        throw new Error('read ECONNRESET')
      })

      await expect(http.get('/no-response')).rejects.toThrow('网络连接失败，请检查网络设置')
    })

    it('处理HTTP状态码错误（非200-299）', async () => {
      mock.onGet('/bad-request').reply(400, { message: 'Bad Request' })

      await expect(http.get('/bad-request')).rejects.toThrow()
    })

    it('处理HTTP状态码错误（非200-299）并包含错误信息', async () => {
      mock.onGet('/not-found').reply(404, { code: 404, msg: 'Not Found' })

      await expect(http.get('/not-found')).rejects.toThrow('Not Found')
    })
  })

  describe('请求重试机制', () => {
    // 注意：当前实现中没有自动重试机制，这些测试验证错误处理
    it('处理服务器错误（不自动重试）', async () => {
      mock.onGet('/retry').reply(500, { code: 500, msg: 'Server Error' })

      await expect(http.get('/retry')).rejects.toThrow('Server Error')

      // 只请求一次，没有重试
      expect(mock.history.get.length).toBe(1)
    })

    it('处理持久性服务器错误', async () => {
      mock.onGet('/max-retry').reply(500, { code: 500, msg: 'Persistent Server Error' })

      await expect(http.get('/max-retry')).rejects.toThrow('Persistent Server Error')

      // 只请求一次，没有重试
      expect(mock.history.get.length).toBe(1)
    })
  })

  describe('请求取消', () => {
    it('支持取消正在进行的请求', async () => {
      // axios v1.x 使用 AbortController，v0.x 使用 CancelToken
      const AbortController = globalThis.AbortController || (await import('axios')).default.CancelToken
      let cancelTokenSource
      
      if (typeof AbortController !== 'function') {
        // 使用 CancelToken (axios v0.x)
        const axios = await import('axios')
        cancelTokenSource = axios.default.CancelToken.source()
      } else {
        // 使用 AbortController (axios v1.x)
        cancelTokenSource = new AbortController()
      }

      mock.onGet('/cancellable').reply(() => {
        // 模拟延迟响应
        return new Promise((resolve) => {
          setTimeout(() => resolve([200, { code: 0, data: {} }]), 100)
        })
      })

      const requestPromise = http.get('/cancellable', {
        signal: cancelTokenSource?.signal || cancelTokenSource?.token,
      })

      // 立即取消请求
      if (cancelTokenSource?.abort) {
        cancelTokenSource.abort('Request cancelled by user')
      } else if (cancelTokenSource?.cancel) {
        cancelTokenSource.cancel('Request cancelled by user')
      }

      await expect(requestPromise).rejects.toThrow()
    })
  })

  describe('并发请求处理', () => {
    it('正确处理多个并发请求', async () => {
      mock.onGet('/concurrent1').reply(200, { code: 0, data: { id: 1 } })
      mock.onGet('/concurrent2').reply(200, { code: 0, data: { id: 2 } })
      mock.onGet('/concurrent3').reply(200, { code: 0, data: { id: 3 } })

      const [response1, response2, response3] = await Promise.all([
        http.get('/concurrent1'),
        http.get('/concurrent2'),
        http.get('/concurrent3'),
      ])

      expect(response1.data.data.id).toBe(1)
      expect(response2.data.data.id).toBe(2)
      expect(response3.data.data.id).toBe(3)
    })

    it('并发请求中的错误不会影响其他请求', async () => {
      mock.onGet('/success').reply(200, { code: 0, data: { success: true } })
      mock.onGet('/fail').reply(500, { code: 500, msg: 'Server Error' })

      const successPromise = http.get('/success')
      const failPromise = http.get('/fail')

      await expect(successPromise).resolves.toHaveProperty('data.code', 0)
      await expect(failPromise).rejects.toThrow('Server Error')
    })
  })

  describe('请求配置', () => {
    it('使用正确的 baseURL', () => {
      expect(http.defaults.baseURL).toBeDefined()
    })

    it('设置正确的超时时间', () => {
      expect(http.defaults.timeout).toBe(1000 * 86400)
    })

    it('启用 withCredentials', () => {
      expect(http.defaults.withCredentials).toBe(true)
    })

    it('设置正确的 Content-Type', () => {
      expect(http.defaults.headers['Content-Type']).toBe('application/json; charset=utf-8')
    })

    it('支持自定义请求头', async () => {
      mock.onGet('/custom-headers').reply(200, { code: 0, data: {} })

      await http.get('/custom-headers', {
        headers: {
          'X-Custom-Header': 'custom-value',
          'Authorization': 'Bearer token123',
        },
      })

      const request = mock.history.get[0]
      expect(request.headers?.['X-Custom-Header']).toBe('custom-value')
      expect(request.headers?.Authorization).toBe('Bearer token123')
    })

    it('支持查询参数', async () => {
      mock.onGet('/query-params').reply(200, { code: 0, data: {} })

      await http.get('/query-params', {
        params: {
          page: 1,
          size: 10,
          filter: 'active',
        },
      })

      const request = mock.history.get[0]
      // axios会把params序列化到URL中，检查params配置
      expect(request.params).toEqual({
        page: 1,
        size: 10,
        filter: 'active',
      })
    })

    it('正确序列化复杂查询参数', async () => {
      mock.onGet('/complex-params').reply(200, { code: 0, data: {} })

      await http.get('/complex-params', {
        params: {
          array: [1, 2, 3],
          object: { nested: 'value' },
          special: 'a+b=c&d=e',
        },
      })

      const request = mock.history.get[0]
      // axios会把params序列化，检查params配置
      expect(request.params).toEqual({
        array: [1, 2, 3],
        object: { nested: 'value' },
        special: 'a+b=c&d=e',
      })
    })
  })

  describe('响应数据格式验证', () => {
    it('正确处理JSON响应', async () => {
      const testData = { id: 1, name: 'test', nested: { value: 123 } }
      mock.onGet('/json-response').reply(200, { code: 0, msg: 'success', data: testData })

      const response = await http.get('/json-response')

      expect(response.data).toEqual({
        code: 0,
        msg: 'success',
        data: testData,
      })
      expect(response.data.data.nested.value).toBe(123)
    })

    it('正确处理空响应体', async () => {
      mock.onGet('/empty-response').reply(200, null)

      const response = await http.get('/empty-response')

      expect(response.data).toBeNull()
    })

    it('正确处理字符串响应', async () => {
      mock.onGet('/string-response').reply(200, 'plain text response')

      const response = await http.get('/string-response')

      expect(response.data).toBe('plain text response')
    })

    it('正确处理二进制响应', async () => {
      const binaryData = new Uint8Array([1, 2, 3, 4, 5])
      const arrayBuffer = binaryData.buffer.slice(binaryData.byteOffset, binaryData.byteOffset + binaryData.byteLength)

      mock.onGet('/binary-response').reply(200, arrayBuffer, {
        'Content-Type': 'application/octet-stream',
      })

      const response = await http.get('/binary-response', {
        responseType: 'arraybuffer',
      })

      // arraybuffer响应会被转换为ArrayBuffer，需要转换为Uint8Array进行比较
      const receivedData = new Uint8Array(response.data)
      expect(receivedData).toEqual(binaryData)
    })
  })
})


