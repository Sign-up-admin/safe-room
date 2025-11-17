import { vi } from 'vitest'

// Mock axios
const axios = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
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

// Helper functions for tests
export const mockApiGet = (url: string, response: any) => {
  axios.get.mockImplementation((requestUrl: string) => {
    if (requestUrl === url || requestUrl.includes(url)) {
      return Promise.resolve(createMockResponse(response))
    }
    // Admin-specific defaults
    if (url.includes('/login')) {
      return Promise.resolve(createMockResponse(mockAdminResponses.login))
    }
    if (url.includes('/users')) {
      return Promise.resolve(createMockResponse(mockAdminResponses.userList))
    }
    if (url.includes('/menu')) {
      return Promise.resolve(createMockResponse(mockAdminResponses.menuList))
    }
    return axios.get.getMockImplementation()?.(requestUrl) || Promise.resolve(createMockResponse({}))
  })
}

export const mockApiPost = (url: string, response: any) => {
  axios.post.mockImplementation((requestUrl: string) => {
    if (requestUrl === url || requestUrl.includes(url)) {
      return Promise.resolve(createMockResponse(response))
    }
    // Admin-specific defaults
    if (url.includes('/login')) {
      return Promise.resolve(createMockResponse(mockAdminResponses.login))
    }
    return axios.post.getMockImplementation()?.(requestUrl) || Promise.resolve(createMockResponse({}))
  })
}

export const mockApiPut = (url: string, response: any) => {
  axios.put.mockImplementation((requestUrl: string) => {
    if (requestUrl === url || requestUrl.includes(url)) {
      return Promise.resolve(createMockResponse(response))
    }
    return axios.put.getMockImplementation()?.(requestUrl) || Promise.resolve(createMockResponse({}))
  })
}

export const mockApiDelete = (url: string, response: any) => {
  axios.delete.mockImplementation((requestUrl: string) => {
    if (requestUrl === url || requestUrl.includes(url)) {
      return Promise.resolve(createMockResponse(response))
    }
    return axios.delete.getMockImplementation()?.(requestUrl) || Promise.resolve(createMockResponse({}))
  })
}

export const mockApiError = (url: string, error: any) => {
  const methods = ['get', 'post', 'put', 'patch', 'delete']
  methods.forEach(method => {
    (axios as any)[method].mockImplementation((requestUrl: string) => {
      if (requestUrl === url || requestUrl.includes(url)) {
        return Promise.reject(createMockError(error.message || 'API Error', error.status || 500))
      }
      return (axios as any)[method].getMockImplementation()?.(requestUrl)
    })
  })
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
