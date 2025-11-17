import { vi } from 'vitest'
import {
  createApiResponse,
  createPageResponse,
  createErrorResponse,
  createSuccessResponse,
  createFailureResponse,
  createListResponse,
  createDetailResponse,
  createCreateResponse,
  createUpdateResponse,
  createDeleteResponse,
  createLoginResponse,
  createLogoutResponse,
  createMenuListResponse,
  createUserListResponse,
  createConfigListResponse
} from '../utils/mock-response-builder'

// Mock axios
const axios = {
  get: vi.fn() as any,
  post: vi.fn() as any,
  put: vi.fn() as any,
  patch: vi.fn() as any,
  delete: vi.fn(),
  head: vi.fn(),
  options: vi.fn(),
  request: vi.fn(),
  interceptors: {
    request: {
      use: vi.fn(),
      eject: vi.fn()
    },
    response: {
      use: vi.fn(),
      eject: vi.fn()
    }
  },
  defaults: {
    baseURL: '/api',
    timeout: 10000,
    headers: {
      common: {},
      get: {},
      post: {},
      put: {},
      patch: {},
      delete: {},
      head: {},
      options: {}
    }
  },
  create: vi.fn(() => axios)
}

// Default response creators
export const createMockResponse = (data: any, status = 200, statusText = 'OK') => ({
  data,
  status,
  statusText,
  headers: {},
  config: {},
  request: {}
})

export const createMockError = (message: string, status = 500, statusText = 'Internal Server Error') => ({
  message,
  response: {
    data: { message, code: status },
    status,
    statusText,
    headers: {},
    config: {}
  },
  config: {},
  isAxiosError: true,
  toJSON: () => ({ message, status, code: status })
})

// Mock HTTP methods with default responses
axios.get.mockResolvedValue(createMockResponse({}))
axios.post.mockResolvedValue(createMockResponse({}))
axios.put.mockResolvedValue(createMockResponse({}))
axios.patch.mockResolvedValue(createMockResponse({}))
axios.delete.mockResolvedValue(createMockResponse({}))
axios.head.mockResolvedValue(createMockResponse({}))
axios.options.mockResolvedValue(createMockResponse({}))

// Mock axios.create to return the same mock instance
axios.create.mockReturnValue(axios)

// Admin-specific mock responses
const mockAdminResponses = {
  login: {
    code: 200,
    message: '登录成功',
    data: {
      token: 'mock-admin-token-12345',
      user: {
        id: 1,
        username: 'admin',
        role: 'admin',
        permissions: ['all']
      }
    }
  },
  userList: {
    code: 200,
    message: '获取成功',
    data: {
      list: [
        { id: 1, username: 'admin', role: 'admin', status: 1 },
        { id: 2, username: 'user1', role: 'user', status: 1 }
      ],
      total: 2
    }
  },
  menuList: {
    code: 200,
    message: '获取成功',
    data: [
      { id: 1, name: '首页', path: '/dashboard', icon: 'dashboard' },
      { id: 2, name: '用户管理', path: '/users', icon: 'user' },
      { id: 3, name: '系统设置', path: '/settings', icon: 'setting' }
    ]
  }
}

// ========== Admin特定的Mock响应 ==========

const mockAdminResponses = {
  login: createLoginResponse('mock-admin-token-12345', {
    id: 1,
    username: 'admin',
    role: 'admin',
    permissions: ['all']
  }),
  userList: createUserListResponse([
    { id: 1, username: 'admin', role: 'admin', status: 1 },
    { id: 2, username: 'user1', role: 'user', status: 1 }
  ], { total: 2, page: 1, limit: 10 }),
  menuList: createMenuListResponse([
    { id: 1, name: '首页', path: '/dashboard', icon: 'dashboard' },
    { id: 2, name: '用户管理', path: '/users', icon: 'user' },
    { id: 3, name: '系统设置', path: '/settings', icon: 'setting' }
  ])
}

// ========== 增强的Mock API函数 ==========

/**
 * Mock GET请求 - 使用统一的响应格式
 */
export const mockApiGet = (url: string, data?: any, options?: { code?: number; msg?: string }) => {
  let response: any

  // Admin-specific defaults
  if (url.includes('/login')) {
    response = mockAdminResponses.login
  } else if (url.includes('/users') && url.includes('/list')) {
    response = mockAdminResponses.userList
  } else if (url.includes('/menu')) {
    response = mockAdminResponses.menuList
  } else {
    response = createApiResponse(data, { code: 0, msg: 'success', ...options })
  }

  axios.get.mockImplementation((requestUrl: string) => {
    if (requestUrl === url || requestUrl.includes(url)) {
      return Promise.resolve({ data: response })
    }
    return axios.get.getMockImplementation()?.(requestUrl) || Promise.resolve({ data: createApiResponse({}) })
  })
}

/**
 * Mock POST请求 - 使用统一的响应格式
 */
export const mockApiPost = (url: string, data?: any, options?: { code?: number; msg?: string }) => {
  let response: any

  // Admin-specific defaults
  if (url.includes('/login')) {
    response = mockAdminResponses.login
  } else {
    response = createApiResponse(data, { code: 0, msg: 'success', ...options })
  }

  axios.post.mockImplementation((requestUrl: string) => {
    if (requestUrl === url || requestUrl.includes(url)) {
      return Promise.resolve({ data: response })
    }
    return axios.post.getMockImplementation()?.(requestUrl) || Promise.resolve({ data: createApiResponse({}) })
  })
}

/**
 * Mock PUT请求 - 使用统一的响应格式
 */
export const mockApiPut = (url: string, data?: any, options?: { code?: number; msg?: string }) => {
  const response = createApiResponse(data, { code: 0, msg: 'success', ...options })
  axios.put.mockImplementation((requestUrl: string) => {
    if (requestUrl === url || requestUrl.includes(url)) {
      return Promise.resolve({ data: response })
    }
    return axios.put.getMockImplementation()?.(requestUrl) || Promise.resolve({ data: createApiResponse({}) })
  })
}

/**
 * Mock DELETE请求 - 使用统一的响应格式
 */
export const mockApiDelete = (url: string, data?: any, options?: { code?: number; msg?: string }) => {
  const response = createApiResponse(data, { code: 0, msg: 'success', ...options })
  axios.delete.mockImplementation((requestUrl: string) => {
    if (requestUrl === url || requestUrl.includes(url)) {
      return Promise.resolve({ data: response })
    }
    return axios.delete.getMockImplementation()?.(requestUrl) || Promise.resolve({ data: createApiResponse({}) })
  })
}

/**
 * Mock用户列表查询
 */
export const mockUserList = (url: string, users: any[], pagination?: any) => {
  const response = createUserListResponse(users, pagination)
  axios.get.mockImplementation((requestUrl: string) => {
    if (requestUrl === url || requestUrl.includes(url)) {
      return Promise.resolve({ data: response })
    }
    return axios.get.getMockImplementation()?.(requestUrl) || Promise.resolve({ data: createApiResponse({}) })
  })
}

/**
 * Mock菜单列表查询
 */
export const mockMenuList = (url: string, menus: any[]) => {
  const response = createMenuListResponse(menus)
  axios.get.mockImplementation((requestUrl: string) => {
    if (requestUrl === url || requestUrl.includes(url)) {
      return Promise.resolve({ data: response })
    }
    return axios.get.getMockImplementation()?.(requestUrl) || Promise.resolve({ data: createApiResponse({}) })
  })
}

/**
 * Mock配置列表查询
 */
export const mockConfigList = (url: string, configs: any[], pagination?: any) => {
  const response = createConfigListResponse(configs, pagination)
  axios.get.mockImplementation((requestUrl: string) => {
    if (requestUrl === url || requestUrl.includes(url)) {
      return Promise.resolve({ data: response })
    }
    return axios.get.getMockImplementation()?.(requestUrl) || Promise.resolve({ data: createApiResponse({}) })
  })
}

/**
 * Mock通用列表查询
 */
export const mockApiList = (url: string, items: any[], pagination?: any, options?: { code?: number; msg?: string }) => {
  const response = createListResponse(items, pagination, options)
  axios.get.mockImplementation((requestUrl: string) => {
    if (requestUrl === url || requestUrl.includes(url)) {
      return Promise.resolve({ data: response })
    }
    return axios.get.getMockImplementation()?.(requestUrl) || Promise.resolve({ data: createApiResponse({}) })
  })
}

/**
 * Mock详情查询
 */
export const mockApiDetail = (url: string, data: any, options?: { code?: number; msg?: string }) => {
  const response = createDetailResponse(data, options?.msg || '查询成功')
  axios.get.mockImplementation((requestUrl: string) => {
    if (requestUrl === url || requestUrl.includes(url)) {
      return Promise.resolve({ data: response })
    }
    return axios.get.getMockImplementation()?.(requestUrl) || Promise.resolve({ data: createApiResponse({}) })
  })
}

/**
 * Mock创建操作
 */
export const mockApiCreate = (url: string, data?: any, options?: { code?: number; msg?: string }) => {
  const response = createCreateResponse(data, options?.msg || '新增成功')
  axios.post.mockImplementation((requestUrl: string) => {
    if (requestUrl === url || requestUrl.includes(url)) {
      return Promise.resolve({ data: response })
    }
    return axios.post.getMockImplementation()?.(requestUrl) || Promise.resolve({ data: createApiResponse({}) })
  })
}

/**
 * Mock更新操作
 */
export const mockApiUpdate = (url: string, data?: any, options?: { code?: number; msg?: string }) => {
  const response = createUpdateResponse(data, options?.msg || '更新成功')
  axios.post.mockImplementation((requestUrl: string) => {
    if (requestUrl === url || requestUrl.includes(url)) {
      return Promise.resolve({ data: response })
    }
    return axios.post.getMockImplementation()?.(requestUrl) || Promise.resolve({ data: createApiResponse({}) })
  })
}

/**
 * Mock删除操作
 */
export const mockApiRemove = (url: string, data?: any, options?: { code?: number; msg?: string }) => {
  const response = createDeleteResponse(data?.count, options?.msg || '删除成功')
  axios.post.mockImplementation((requestUrl: string) => {
    if (requestUrl === url || requestUrl.includes(url)) {
      return Promise.resolve({ data: response })
    }
    return axios.post.getMockImplementation()?.(requestUrl) || Promise.resolve({ data: createApiResponse({}) })
  })
}

/**
 * Mock登录
 */
export const mockApiLogin = (url: string, token: string, user: any, options?: { code?: number; msg?: string }) => {
  const response = createLoginResponse(token, user, options?.msg || '登录成功')
  axios.post.mockImplementation((requestUrl: string) => {
    if (requestUrl === url || requestUrl.includes(url)) {
      return Promise.resolve({ data: response })
    }
    return axios.post.getMockImplementation()?.(requestUrl) || Promise.resolve({ data: createApiResponse({}) })
  })
}

/**
 * Mock登出
 */
export const mockApiLogout = (url: string, options?: { code?: number; msg?: string }) => {
  const response = createLogoutResponse(options?.msg || '登出成功')
  axios.post.mockImplementation((requestUrl: string) => {
    if (requestUrl === url || requestUrl.includes(url)) {
      return Promise.resolve({ data: response })
    }
    return axios.post.getMockImplementation()?.(requestUrl) || Promise.resolve({ data: createApiResponse({}) })
  })
}

/**
 * Mock错误响应
 */
export const mockApiError = (url: string, code = 500, msg = '操作失败', error?: string) => {
  const response = createErrorResponse(code, msg, error)
  const methods = ['get', 'post', 'put', 'patch', 'delete']

  methods.forEach(method => {
    (axios as any)[method].mockImplementation((requestUrl: string) => {
      if (requestUrl === url || requestUrl.includes(url)) {
        return Promise.reject({ response: { data: response, status: code } })
      }
      return (axios as any)[method].getMockImplementation()?.(requestUrl)
    })
  })
}

/**
 * Mock成功响应（通用）
 */
export const mockApiSuccess = (method: string, url: string, data?: any, msg = '操作成功') => {
  const response = createSuccessResponse(data, msg)
  const axiosMethod = (axios as any)[method.toLowerCase()]

  if (axiosMethod) {
    axiosMethod.mockImplementation((requestUrl: string) => {
      if (requestUrl === url || requestUrl.includes(url)) {
        return Promise.resolve({ data: response })
      }
      return axiosMethod.getMockImplementation()?.(requestUrl) || Promise.resolve({ data: createApiResponse({}) })
    })
  }
}

/**
 * Mock失败响应（通用）
 */
export const mockApiFailure = (method: string, url: string, code = 500, msg = '操作失败') => {
  const response = createFailureResponse(msg, code)
  const axiosMethod = (axios as any)[method.toLowerCase()]

  if (axiosMethod) {
    axiosMethod.mockImplementation((requestUrl: string) => {
      if (requestUrl === url || requestUrl.includes(url)) {
        return Promise.reject({ response: { data: response, status: code } })
      }
      return axiosMethod.getMockImplementation()?.(requestUrl)
    })
  }
}

export const resetApiMocks = () => {
  axios.get.mockClear()
  axios.post.mockClear()
  axios.put.mockClear()
  axios.patch.mockClear()
  axios.delete.mockClear()
  axios.head.mockClear()
  axios.options.mockClear()

  // Reset to default resolved values
  axios.get.mockResolvedValue(createMockResponse({}))
  axios.post.mockResolvedValue(createMockResponse({}))
  axios.put.mockResolvedValue(createMockResponse({}))
  axios.patch.mockResolvedValue(createMockResponse({}))
  axios.delete.mockResolvedValue(createMockResponse({}))
  axios.head.mockResolvedValue(createMockResponse({}))
  axios.options.mockResolvedValue(createMockResponse({}))
}

export default axios
