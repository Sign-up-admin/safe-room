import { describe, it, expect } from 'vitest'
import { API_ENDPOINTS, getEndpoint, getEndpointString } from '../../../src/constants/apiEndpoints'

describe('API端点常量', () => {
  describe('API_ENDPOINTS', () => {
    it('应该包含AUTH端点', () => {
      expect(API_ENDPOINTS.AUTH).toBeDefined()
      expect(typeof API_ENDPOINTS.AUTH.LOGIN).toBe('function')
      expect(API_ENDPOINTS.AUTH.LOGIN('users')).toBe('/users/login')
    })

    it('应该包含YONGHU端点', () => {
      expect(API_ENDPOINTS.YONGHU).toBeDefined()
      expect(API_ENDPOINTS.YONGHU.LIST).toBe('yonghu/list')
      expect(API_ENDPOINTS.YONGHU.INFO(123)).toBe('yonghu/info/123')
      expect(API_ENDPOINTS.YONGHU.SAVE).toBe('yonghu/save')
    })

    it('应该包含FILE端点', () => {
      expect(API_ENDPOINTS.FILE).toBeDefined()
      expect(API_ENDPOINTS.FILE.UPLOAD).toBe('file/upload')
      expect(API_ENDPOINTS.FILE.VIDEO('test.mp4')).toBe('file/video/test.mp4')
    })

    it('应该包含COMMON端点', () => {
      expect(API_ENDPOINTS.COMMON).toBeDefined()
      expect(API_ENDPOINTS.COMMON.OPTION('table', 'column')).toBe('common/option/table/column')
      expect(API_ENDPOINTS.COMMON.REMIND('table', 'column', 'type')).toBe('common/remind/table/column/type')
    })
  })

  describe('getEndpoint', () => {
    it('应该通过路径获取端点', () => {
      const endpoint = getEndpoint('YONGHU.LIST')
      expect(endpoint).toBe('yonghu/list')
    })

    it('应该通过路径获取函数端点', () => {
      const endpoint = getEndpoint('AUTH.LOGIN')
      expect(typeof endpoint).toBe('function')
      expect((endpoint as Function)('users')).toBe('/users/login')
    })

    it('如果路径不存在，应该抛出错误', () => {
      expect(() => getEndpoint('NONEXISTENT.PATH')).toThrow('API endpoint not found')
    })
  })

  describe('getEndpointString', () => {
    it('应该返回字符串端点', () => {
      const endpoint = getEndpointString('YONGHU.LIST')
      expect(endpoint).toBe('yonghu/list')
    })

    it('应该调用函数端点并返回字符串', () => {
      const endpoint = getEndpointString('AUTH.LOGIN', 'users')
      expect(endpoint).toBe('/users/login')
    })

    it('应该支持多个参数', () => {
      const endpoint = getEndpointString('COMMON.REMIND', 'table', 'column', 'type')
      expect(endpoint).toBe('common/remind/table/column/type')
    })
  })
})

