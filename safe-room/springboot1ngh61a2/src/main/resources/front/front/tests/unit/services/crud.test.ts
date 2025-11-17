import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockUser, createValidatedUser } from '../../factories/user.factory'
import { createMockCourse, createValidatedCourse } from '../../factories/course.factory'
import { createApiResponse, createListResponse } from '../../utils/mock-response-builder'

const getMock = vi.fn()
const postMock = vi.fn()

vi.mock('../../../src/common/http', () => ({
  default: {
    get: getMock,
    post: postMock,
  },
}))

describe('services/crud', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('caches module services per key', async () => {
    const { getModuleService } = await import('../../../src/services/crud')
    const first = getModuleService('yonghu')
    const second = getModuleService('yonghu')
    expect(first).toBe(second)
  })

  it('invokes HTTP helpers for CRUD operations', async () => {
    const { getModuleService } = await import('../../../src/services/crud')
    const service = getModuleService('yonghu')

    const mockUserList = [createMockUser({ id: 1 })]
    getMock.mockResolvedValueOnce({ data: createListResponse(mockUserList, {}, 1) })
    await expect(service.list({ page: 2 })).resolves.toEqual({ list: mockUserList, total: 1 })
    expect(getMock).toHaveBeenCalledWith('/yonghu/list', { params: { page: 2 } })

    const mockUserDetail = createMockUser({ id: 5 })
    getMock.mockResolvedValueOnce({ data: createApiResponse(mockUserDetail) })
    await expect(service.detail(5)).resolves.toEqual(mockUserDetail)
    expect(getMock).toHaveBeenCalledWith('/yonghu/detail/5')

    postMock.mockResolvedValue({})
    await service.create({ name: 'foo' })
    expect(postMock).toHaveBeenCalledWith('/yonghu/add', { name: 'foo' })

    await service.update({ id: 1 })
    expect(postMock).toHaveBeenCalledWith('/yonghu/update', { id: 1 })

    await service.remove([1, 2])
    expect(postMock).toHaveBeenCalledWith('/yonghu/delete', [1, 2])

    await service.thumbsup(3, 0)
    expect(postMock).toHaveBeenCalledWith('/yonghu/thumbsup/3', undefined, { params: { type: 0 } })

    getMock.mockResolvedValueOnce({ data: { data: [{ id: 2 }] } })
    await expect(service.autoSort({ limit: 5 })).resolves.toEqual([{ id: 2 }])
    expect(getMock).toHaveBeenCalledWith('/yonghu/autoSort', { params: { limit: 5 } })

    getMock.mockResolvedValueOnce({ data: { data: [{ id: 3 }] } })
    await expect(service.autoSortCollaborative({ limit: 3 })).resolves.toEqual([{ id: 3 }])
    expect(getMock).toHaveBeenCalledWith('/yonghu/autoSort2', { params: { limit: 3 } })

    await service.shBatch([9], '已审核', 'ok')
    expect(postMock).toHaveBeenCalledWith('/yonghu/shBatch', [9], {
      params: { sfsh: '已审核', shhf: 'ok' },
    })

    getMock.mockResolvedValueOnce({ data: { data: [{ total: 10 }] } })
    await expect(service.fetchStats('stats', { foo: 1 })).resolves.toEqual([{ total: 10 }])
    expect(getMock).toHaveBeenCalledWith('/yonghu/stats', { params: { foo: 1 } })
  })

  describe('边界情况和错误处理', () => {
    let service: any

    beforeEach(async () => {
      const { getModuleService } = await import('../../../src/services/crud')
      service = getModuleService('test-module')
    })

    describe('list 方法', () => {
      it('处理空参数列表请求', async () => {
        getMock.mockResolvedValueOnce({ data: { data: { list: [], total: 0 } } })

        const result = await service.list()

        expect(result).toEqual({ list: [], total: 0 })
        expect(getMock).toHaveBeenCalledWith('/test-module/list', { params: {} })
      })

      it('处理分页参数', async () => {
        getMock.mockResolvedValueOnce({ data: { data: { list: [{ id: 1 }], total: 100 } } })

        const result = await service.list({ page: 1, size: 20, sort: 'id', order: 'desc' })

        expect(result).toEqual({ list: [{ id: 1 }], total: 100 })
        expect(getMock).toHaveBeenCalledWith('/test-module/list', {
          params: { page: 1, size: 20, sort: 'id', order: 'desc' }
        })
      })

      it('处理搜索参数', async () => {
        getMock.mockResolvedValueOnce({ data: { data: { list: [{ id: 1 }], total: 1 } } })

        const result = await service.list({ search: 'keyword', filter: 'active' })

        expect(result).toEqual({ list: [{ id: 1 }], total: 1 })
        expect(getMock).toHaveBeenCalledWith('/test-module/list', {
          params: { search: 'keyword', filter: 'active' }
        })
      })

      it('处理网络错误', async () => {
        getMock.mockRejectedValueOnce(new Error('Network Error'))

        await expect(service.list()).rejects.toThrow('Network Error')
      })

      it('处理服务器错误响应', async () => {
        getMock.mockRejectedValueOnce(new Error('Server Error'))

        await expect(service.list()).rejects.toThrow('Server Error')
      })
    })

    describe('detail 方法', () => {
      it('处理有效的ID', async () => {
        getMock.mockResolvedValueOnce({ data: { data: { id: 123, name: 'test' } } })

        const result = await service.detail(123)

        expect(result).toEqual({ id: 123, name: 'test' })
        expect(getMock).toHaveBeenCalledWith('/test-module/detail/123')
      })

      it('处理字符串ID', async () => {
        getMock.mockResolvedValueOnce({ data: { data: { id: 'abc', name: 'test' } } })

        const result = await service.detail('abc')

        expect(result).toEqual({ id: 'abc', name: 'test' })
        expect(getMock).toHaveBeenCalledWith('/test-module/detail/abc')
      })

      it('处理不存在的记录', async () => {
        getMock.mockRejectedValueOnce(new Error('Not Found'))

        await expect(service.detail(999)).rejects.toThrow('Not Found')
      })

      it('处理无效的ID', async () => {
        await expect(service.detail(null)).rejects.toThrow()
        await expect(service.detail(undefined)).rejects.toThrow()
        await expect(service.detail('')).rejects.toThrow()
      })
    })

    describe('create 方法', () => {
      it('处理成功创建', async () => {
        postMock.mockResolvedValueOnce({ data: { code: 0, data: { id: 456 } } })

        const result = await service.create({ name: 'new item', description: 'test' })

        expect(result).toEqual({ code: 0, data: { id: 456 } })
        expect(postMock).toHaveBeenCalledWith('/test-module/add', {
          name: 'new item',
          description: 'test'
        })
      })

      it('处理空数据创建', async () => {
        postMock.mockResolvedValueOnce({ data: { code: 0 } })

        const result = await service.create({})

        expect(result).toEqual({ code: 0 })
        expect(postMock).toHaveBeenCalledWith('/test-module/add', {})
      })

      it('处理创建冲突', async () => {
        postMock.mockRejectedValueOnce(new Error('Already exists'))

        await expect(service.create({ name: 'duplicate' })).rejects.toThrow('Already exists')
      })

      it('处理验证错误', async () => {
        postMock.mockRejectedValueOnce(new Error('Validation failed'))

        await expect(service.create({ name: '' })).rejects.toThrow('Validation failed')
      })
    })

    describe('update 方法', () => {
      it('处理成功更新', async () => {
        postMock.mockResolvedValueOnce({ data: { code: 0 } })

        const result = await service.update({ id: 123, name: 'updated' })

        expect(result).toEqual({ code: 0 })
        expect(postMock).toHaveBeenCalledWith('/test-module/update', { id: 123, name: 'updated' })
      })

      it('处理部分更新', async () => {
        postMock.mockResolvedValueOnce({ data: { code: 0 } })

        const result = await service.update({ id: 123, status: 'active' })

        expect(result).toEqual({ code: 0 })
        expect(postMock).toHaveBeenCalledWith('/test-module/update', { id: 123, status: 'active' })
      })

      it('处理更新不存在的记录', async () => {
        postMock.mockRejectedValueOnce(new Error('Not Found'))

        await expect(service.update({ id: 999, name: 'test' })).rejects.toThrow('Not Found')
      })

      it('处理并发更新冲突', async () => {
        postMock.mockRejectedValueOnce(new Error('Concurrent modification'))

        await expect(service.update({ id: 123, version: 1 })).rejects.toThrow('Concurrent modification')
      })
    })

    describe('remove 方法', () => {
      it('处理删除单个记录', async () => {
        postMock.mockResolvedValueOnce({ data: { code: 0 } })

        const result = await service.remove([123])

        expect(result).toEqual({ code: 0 })
        expect(postMock).toHaveBeenCalledWith('/test-module/delete', [123])
      })

      it('处理删除多个记录', async () => {
        postMock.mockResolvedValueOnce({ data: { code: 0 } })

        const result = await service.remove([1, 2, 3, 4, 5])

        expect(result).toEqual({ code: 0 })
        expect(postMock).toHaveBeenCalledWith('/test-module/delete', [1, 2, 3, 4, 5])
      })

      it('处理空数组删除', async () => {
        postMock.mockResolvedValueOnce({ data: { code: 0 } })

        const result = await service.remove([])

        expect(result).toEqual({ code: 0 })
        expect(postMock).toHaveBeenCalledWith('/test-module/delete', [])
      })

      it('处理删除不存在的记录', async () => {
        postMock.mockRejectedValueOnce(new Error('Not Found'))

        await expect(service.remove([999])).rejects.toThrow('Not Found')
      })

      it('处理部分删除成功', async () => {
        postMock.mockResolvedValueOnce({ data: { code: 0, data: { deleted: [1, 3], failed: [2] } } })

        const result = await service.remove([1, 2, 3])

        expect(result).toEqual({ code: 0, data: { deleted: [1, 3], failed: [2] } })
      })
    })

    describe('thumbsup 方法', () => {
      it('处理点赞操作', async () => {
        postMock.mockResolvedValueOnce({ data: { code: 0 } })

        const result = await service.thumbsup(123, 1)

        expect(result).toEqual({ code: 0 })
        expect(postMock).toHaveBeenCalledWith('/test-module/thumbsup/123', undefined, { params: { type: 1 } })
      })

      it('处理取消点赞', async () => {
        postMock.mockResolvedValueOnce({ data: { code: 0 } })

        const result = await service.thumbsup(123, 0)

        expect(result).toEqual({ code: 0 })
        expect(postMock).toHaveBeenCalledWith('/test-module/thumbsup/123', undefined, { params: { type: 0 } })
      })

      it('处理不存在的记录点赞', async () => {
        postMock.mockRejectedValueOnce(new Error('Not Found'))

        await expect(service.thumbsup(999, 1)).rejects.toThrow('Not Found')
      })
    })

    describe('autoSort 方法', () => {
      it('处理自动排序', async () => {
        getMock.mockResolvedValueOnce({ data: { data: [{ id: 1 }, { id: 2 }, { id: 3 }] } })

        const result = await service.autoSort({ limit: 10, category: 'popular' })

        expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }])
        expect(getMock).toHaveBeenCalledWith('/test-module/autoSort', {
          params: { limit: 10, category: 'popular' }
        })
      })

      it('处理空参数自动排序', async () => {
        getMock.mockResolvedValueOnce({ data: { data: [] } })

        const result = await service.autoSort()

        expect(result).toEqual([])
        expect(getMock).toHaveBeenCalledWith('/test-module/autoSort', { params: {} })
      })
    })

    describe('autoSortCollaborative 方法', () => {
      it('处理协同过滤排序', async () => {
        getMock.mockResolvedValueOnce({ data: { data: [{ id: 1, score: 0.9 }] } })

        const result = await service.autoSortCollaborative({ userId: 123, limit: 5 })

        expect(result).toEqual([{ id: 1, score: 0.9 }])
        expect(getMock).toHaveBeenCalledWith('/test-module/autoSort2', {
          params: { userId: 123, limit: 5 }
        })
      })
    })

    describe('shBatch 方法', () => {
      it('处理批量审核', async () => {
        postMock.mockResolvedValueOnce({ data: { code: 0 } })

        const result = await service.shBatch([1, 2, 3], '已审核', '审核通过')

        expect(result).toEqual({ code: 0 })
        expect(postMock).toHaveBeenCalledWith('/test-module/shBatch', [1, 2, 3], {
          params: { sfsh: '已审核', shhf: '审核通过' }
        })
      })

      it('处理批量拒绝', async () => {
        postMock.mockResolvedValueOnce({ data: { code: 0 } })

        const result = await service.shBatch([4, 5], '已拒绝', '不符合要求')

        expect(result).toEqual({ code: 0 })
        expect(postMock).toHaveBeenCalledWith('/test-module/shBatch', [4, 5], {
          params: { sfsh: '已拒绝', shhf: '不符合要求' }
        })
      })

      it('处理空审核列表', async () => {
        postMock.mockResolvedValueOnce({ data: { code: 0 } })

        const result = await service.shBatch([], '已审核', '')

        expect(result).toEqual({ code: 0 })
        expect(postMock).toHaveBeenCalledWith('/test-module/shBatch', [], {
          params: { sfsh: '已审核', shhf: '' }
        })
      })
    })

    describe('fetchStats 方法', () => {
      it('处理统计数据获取', async () => {
        getMock.mockResolvedValueOnce({ data: { data: [{ count: 100, category: 'A' }] } })

        const result = await service.fetchStats('category', { dateRange: '2024-01-01' })

        expect(result).toEqual([{ count: 100, category: 'A' }])
        expect(getMock).toHaveBeenCalledWith('/test-module/category', {
          params: { dateRange: '2024-01-01' }
        })
      })

      it('处理复杂统计查询', async () => {
        getMock.mockResolvedValueOnce({ data: { data: [{ total: 500, average: 25.5 }] } })

        const result = await service.fetchStats('summary', {
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          groupBy: 'month'
        })

        expect(result).toEqual([{ total: 500, average: 25.5 }])
        expect(getMock).toHaveBeenCalledWith('/test-module/summary', {
          params: {
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            groupBy: 'month'
          }
        })
      })
    })
  })

  describe('服务缓存机制', () => {
    it('缓存模块服务实例', async () => {
      const { getModuleService } = await import('../../../src/services/crud')

      const service1 = getModuleService('cached-module')
      const service2 = getModuleService('cached-module')
      const service3 = getModuleService('different-module')

      expect(service1).toBe(service2)
      expect(service1).not.toBe(service3)
      expect(service2).not.toBe(service3)
    })

    it('不同模块返回不同服务实例', async () => {
      const { getModuleService } = await import('../../../src/services/crud')

      const userService = getModuleService('user')
      const postService = getModuleService('post')

      expect(userService).not.toBe(postService)
    })
  })

  describe('并发操作处理', () => {
    it('正确处理并发请求', async () => {
      const { getModuleService } = await import('../../../src/services/crud')
      const service = getModuleService('concurrent-test')

      // 先设置 mock，再创建 promises
      getMock
        .mockResolvedValueOnce({ data: { data: { list: [{ id: 1 }], total: 1 } } })
        .mockResolvedValueOnce({ data: { data: { list: [{ id: 2 }], total: 1 } } })
        .mockResolvedValueOnce({ data: { data: { id: 1, name: 'item1' } } })
        .mockResolvedValueOnce({ data: { data: { id: 2, name: 'item2' } } })

      // 模拟并发请求
      const promises = [
        service.list({ page: 1 }),
        service.list({ page: 2 }),
        service.detail(1),
        service.detail(2),
      ]

      const results = await Promise.all(promises)

      expect(results).toHaveLength(4)
      expect(results[0]).toEqual({ list: [{ id: 1 }], total: 1 })
      expect(results[1]).toEqual({ list: [{ id: 2 }], total: 1 })
      expect(results[2]).toEqual({ id: 1, name: 'item1' })
      expect(results[3]).toEqual({ id: 2, name: 'item2' })
    })

    it('并发请求中的错误不影响其他请求', async () => {
      const { getModuleService } = await import('../../../src/services/crud')
      const service = getModuleService('error-test')

      // 第一个请求成功
      getMock.mockResolvedValueOnce({ data: { data: { list: [{ id: 1 }], total: 1 } } })
      const promise1 = service.list({ page: 1 })

      // 第二个请求失败
      getMock.mockRejectedValueOnce(new Error('Network Error'))
      const promise2 = service.list({ page: 2 }) // This will fail

      // 第三个请求成功
      getMock.mockResolvedValueOnce({ data: { data: { id: 3 } } })
      const promise3 = service.detail(3)

      await expect(promise1).resolves.toEqual({ list: [{ id: 1 }], total: 1 })
      await expect(promise2).rejects.toThrow('Network Error')
      await expect(promise3).resolves.toEqual({ id: 3 })
    })
  })
})


