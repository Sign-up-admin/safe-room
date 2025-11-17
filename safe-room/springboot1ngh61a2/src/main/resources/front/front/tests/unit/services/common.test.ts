import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  calculateColumn,
  followRecord,
  getOptions,
  getRemindCount,
  getTimeValueStats,
  getValueStats,
  groupByColumn,
  updateShStatus,
} from '@/services/common'

const httpMock = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}))

vi.mock('@/common/http', () => ({
  default: httpMock,
}))

const { get: getMock, post: postMock } = httpMock

describe('services/common', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches options and follows related records', async () => {
    getMock.mockResolvedValueOnce({ data: { data: ['A', 'B'] } })
    const options = await getOptions('table', 'column', { level: 'vip' })
    expect(getMock).toHaveBeenCalledWith('/common/option/table/column', {
      params: { level: 'vip' },
    })
    expect(options).toEqual(['A', 'B'])

    getMock.mockResolvedValueOnce({ data: { data: { id: 9 } } })
    const record = await followRecord('table', 'column', 42)
    expect(getMock).toHaveBeenCalledWith('/common/follow/table/column', {
      params: { columnValue: 42 },
    })
    expect(record).toEqual({ id: 9 })
  })

  it('updates sh status and resolves remind counts from different payloads', async () => {
    postMock.mockResolvedValueOnce({ data: { code: 0 } })
    await updateShStatus('yuyue', { id: 1, sfsh: '已审核', shhf: 'OK' })
    expect(postMock).toHaveBeenCalledWith('/common/sh/yuyue', { id: 1, sfsh: '已审核', shhf: 'OK' })

    getMock.mockResolvedValueOnce({ data: { data: { count: 5 } } })
    await expect(getRemindCount('table', 'column', '1')).resolves.toBe(5)

    getMock.mockResolvedValueOnce({ data: { data: 3 } })
    await expect(getRemindCount('table', 'column', '2', { remindstart: 1 })).resolves.toBe(3)
  })

  it('computes aggregated stats helpers', async () => {
    getMock.mockResolvedValueOnce({ data: { data: { total: 10 } } })
    await expect(calculateColumn('course', 'price', {})).resolves.toEqual({ total: 10 })

    getMock.mockResolvedValueOnce({ data: { data: [{ name: 'A' }] } })
    await expect(groupByColumn('course', 'category', {})).resolves.toEqual([{ name: 'A' }])

    getMock.mockResolvedValueOnce({ data: { data: [{ x: '2025', y: 12 }] } })
    await expect(getValueStats('course', 'x', 'y', {})).resolves.toEqual([{ x: '2025', y: 12 }])

    getMock.mockResolvedValueOnce({ data: { data: [{ x: '2025-01', y: 5 }] } })
    await expect(getTimeValueStats('course', 'x', 'y', 'month', {})).resolves.toEqual([
      { x: '2025-01', y: 5 },
    ])

    expect(getMock.mock.calls.map(([url]) => url)).toEqual([
      '/common/cal/course/price',
      '/common/group/course/category',
      '/common/value/course/x/y',
      '/common/value/course/x/y/month',
    ])
  })

  describe('getOptions 方法 - 详细测试', () => {
    it('成功获取选项列表', async () => {
      const mockOptions = ['选项A', '选项B', '选项C']
      getMock.mockResolvedValueOnce({ data: { data: mockOptions } })

      const result = await getOptions('course', 'category')

      expect(result).toEqual(mockOptions)
      expect(getMock).toHaveBeenCalledWith('/common/option/course/category', { params: {} })
    })

    it('获取带参数的选项列表', async () => {
      const mockOptions = ['VIP选项', '普通选项']
      getMock.mockResolvedValueOnce({ data: { data: mockOptions } })

      const result = await getOptions('course', 'category', { level: 'vip', active: true })

      expect(result).toEqual(mockOptions)
      expect(getMock).toHaveBeenCalledWith('/common/option/course/category', {
        params: { level: 'vip', active: true }
      })
    })

    it('处理空选项列表', async () => {
      getMock.mockResolvedValueOnce({ data: { data: [] } })

      const result = await getOptions('course', 'category')

      expect(result).toEqual([])
    })

    it('处理网络错误', async () => {
      getMock.mockRejectedValueOnce(new Error('Network Error'))

      await expect(getOptions('course', 'category')).rejects.toThrow('Network Error')
    })

    it('处理服务器错误响应', async () => {
      // 模拟HTTP拦截器抛出的错误
      getMock.mockRejectedValueOnce(new Error('Server Error'))

      await expect(getOptions('course', 'category')).rejects.toThrow('Server Error')
    })

    it('处理不存在的表或列', async () => {
      getMock.mockRejectedValueOnce(new Error('Table or column not found'))

      await expect(getOptions('nonexistent', 'column')).rejects.toThrow('Table or column not found')
    })
  })

  describe('followRecord 方法 - 详细测试', () => {
    it('成功获取关联记录', async () => {
      const mockRecord = { id: 123, name: '关联记录', type: 'reference' }
      getMock.mockResolvedValueOnce({ data: { data: mockRecord } })

      const result = await followRecord('course', 'coach', 456)

      expect(result).toEqual(mockRecord)
      expect(getMock).toHaveBeenCalledWith('/common/follow/course/coach', {
        params: { columnValue: 456 }
      })
    })

    it('处理字符串类型的关联值', async () => {
      const mockRecord = { id: 'abc', name: '字符串关联' }
      getMock.mockResolvedValueOnce({ data: { data: mockRecord } })

      const result = await followRecord('course', 'category', 'vip')

      expect(result).toEqual(mockRecord)
      expect(getMock).toHaveBeenCalledWith('/common/follow/course/category', {
        params: { columnValue: 'vip' }
      })
    })

    it('处理不存在的关联记录', async () => {
      getMock.mockRejectedValueOnce(new Error('Record not found'))

      await expect(followRecord('course', 'coach', 999)).rejects.toThrow('Record not found')
    })

    it('处理无效的关联值', async () => {
      await expect(followRecord('course', 'coach', null)).rejects.toThrow()
      await expect(followRecord('course', 'coach', undefined)).rejects.toThrow()
      await expect(followRecord('course', 'coach', '')).rejects.toThrow()
    })
  })

  describe('updateShStatus 方法 - 详细测试', () => {
    it('成功更新审核状态', async () => {
      postMock.mockResolvedValueOnce({ data: { code: 0 } })

      const result = await updateShStatus('course', {
        id: 123,
        sfsh: '已审核',
        shhf: '审核通过，内容优质'
      })

      expect(result).toEqual({ code: 0 })
      expect(postMock).toHaveBeenCalledWith('/common/sh/course', {
        id: 123,
        sfsh: '已审核',
        shhf: '审核通过，内容优质'
      })
    })

    it('处理审核拒绝', async () => {
      postMock.mockResolvedValueOnce({ data: { code: 0 } })

      const result = await updateShStatus('course', {
        id: 456,
        sfsh: '已拒绝',
        shhf: '内容不符合要求'
      })

      expect(result).toEqual({ code: 0 })
      expect(postMock).toHaveBeenCalledWith('/common/sh/course', {
        id: 456,
        sfsh: '已拒绝',
        shhf: '内容不符合要求'
      })
    })

    it('处理审核状态更新失败', async () => {
      postMock.mockRejectedValueOnce(new Error('Update failed'))

      await expect(updateShStatus('course', {
        id: 123,
        sfsh: '已审核',
        shhf: '审核通过'
      })).rejects.toThrow('Update failed')
    })

    it('处理不存在的记录', async () => {
      postMock.mockRejectedValueOnce(new Error('Record not found'))

      await expect(updateShStatus('course', {
        id: 999,
        sfsh: '已审核',
        shhf: '审核通过'
      })).rejects.toThrow('Record not found')
    })

    it('处理并发审核冲突', async () => {
      postMock.mockRejectedValueOnce(new Error('Concurrent modification'))

      await expect(updateShStatus('course', {
        id: 123,
        sfsh: '已审核',
        shhf: '审核通过'
      })).rejects.toThrow('Concurrent modification')
    })
  })

  describe('getRemindCount 方法 - 详细测试', () => {
    it('获取提醒计数（标准响应格式）', async () => {
      getMock.mockResolvedValueOnce({ data: { data: { count: 5 } } })

      const result = await getRemindCount('course', 'coach', '1')

      expect(result).toBe(5)
      expect(getMock).toHaveBeenCalledWith('/common/remind/course/coach/1', { params: {} })
    })

    it('获取提醒计数（数据包装响应格式）', async () => {
      getMock.mockResolvedValueOnce({ data: { data: 3 } })

      const result = await getRemindCount('course', 'coach', '1', { status: 'active' })

      expect(result).toBe(3)
      expect(getMock).toHaveBeenCalledWith('/common/remind/course/coach/1', {
        params: { status: 'active' }
      })
    })

    it('处理零计数', async () => {
      getMock.mockResolvedValueOnce({ data: { data: { count: 0 } } })

      const result = await getRemindCount('course', 'coach', '1')

      expect(result).toBe(0)
    })

    it('处理大数字计数', async () => {
      getMock.mockResolvedValueOnce({ data: { data: 999999 } })

      const result = await getRemindCount('course', 'coach', '1')

      expect(result).toBe(999999)
    })

    it('处理无效的响应格式', async () => {
      getMock.mockRejectedValueOnce(new Error('Invalid response format'))

      await expect(getRemindCount('course', 'coach', '1')).rejects.toThrow('Invalid response format')
    })
  })

  describe('calculateColumn 方法 - 详细测试', () => {
    it('计算数值列的总和', async () => {
      const mockResult = { total: 1500.50, count: 10, average: 150.05 }
      getMock.mockResolvedValueOnce({ data: { data: mockResult } })

      const result = await calculateColumn('course', 'price')

      expect(result).toEqual(mockResult)
      expect(getMock).toHaveBeenCalledWith('/common/cal/course/price', { params: {} })
    })

    it('计算带条件的列统计', async () => {
      const mockResult = { total: 500, count: 5, min: 50, max: 150 }
      getMock.mockResolvedValueOnce({ data: { data: mockResult } })

      const result = await calculateColumn('course', 'price', { category: 'vip', active: true })

      expect(result).toEqual(mockResult)
      expect(getMock).toHaveBeenCalledWith('/common/cal/course/price', {
        params: { category: 'vip', active: true }
      })
    })

    it('处理不存在的列', async () => {
      getMock.mockRejectedValueOnce(new Error('Column not found'))

      await expect(calculateColumn('course', 'nonexistent')).rejects.toThrow('Column not found')
    })

    it('处理计算错误', async () => {
      getMock.mockRejectedValueOnce(new Error('Calculation error'))

      await expect(calculateColumn('course', 'price')).rejects.toThrow('Calculation error')
    })
  })

  describe('groupByColumn 方法 - 详细测试', () => {
    it('按列分组统计', async () => {
      const mockGroups = [
        { name: '健身', count: 15 },
        { name: '瑜伽', count: 8 },
        { name: '舞蹈', count: 12 }
      ]
      getMock.mockResolvedValueOnce({ data: { data: mockGroups } })

      const result = await groupByColumn('course', 'category')

      expect(result).toEqual(mockGroups)
      expect(getMock).toHaveBeenCalledWith('/common/group/course/category', { params: {} })
    })

    it('处理复杂的分组查询', async () => {
      const mockGroups = [
        { status: 'active', count: 20 },
        { status: 'inactive', count: 5 }
      ]
      getMock.mockResolvedValueOnce({ data: { data: mockGroups } })

      const result = await groupByColumn('course', 'status', { dateRange: '2024' })

      expect(result).toEqual(mockGroups)
      expect(getMock).toHaveBeenCalledWith('/common/group/course/status', {
        params: { dateRange: '2024' }
      })
    })

    it('处理空分组结果', async () => {
      getMock.mockResolvedValueOnce({ data: { data: [] } })

      const result = await groupByColumn('course', 'category')

      expect(result).toEqual([])
    })

    it('处理分组查询错误', async () => {
      getMock.mockRejectedValueOnce(new Error('Group query failed'))

      await expect(groupByColumn('course', 'invalid')).rejects.toThrow('Group query failed')
    })
  })

  describe('getValueStats 方法 - 详细测试', () => {
    it('获取数值统计数据', async () => {
      const mockStats = [
        { x: '2024-01', y: 100 },
        { x: '2024-02', y: 150 },
        { x: '2024-03', y: 200 }
      ]
      getMock.mockResolvedValueOnce({ data: { data: mockStats } })

      const result = await getValueStats('course', 'month', 'count')

      expect(result).toEqual(mockStats)
      expect(getMock).toHaveBeenCalledWith('/common/value/course/month/count', { params: {} })
    })

    it('处理带参数的数值统计', async () => {
      const mockStats = [
        { x: 'VIP', y: 50 },
        { x: '普通', y: 30 }
      ]
      getMock.mockResolvedValueOnce({ data: { data: mockStats } })

      const result = await getValueStats('course', 'level', 'sales', { year: 2024 })

      expect(result).toEqual(mockStats)
      expect(getMock).toHaveBeenCalledWith('/common/value/course/level/sales', {
        params: { year: 2024 }
      })
    })

    it('处理时间序列统计', async () => {
      const mockStats = [
        { x: '2024-01-01', y: 10 },
        { x: '2024-01-02', y: 15 },
        { x: '2024-01-03', y: 20 }
      ]
      getMock.mockResolvedValueOnce({ data: { data: mockStats } })

      const result = await getValueStats('course', 'date', 'registrations')

      expect(result).toEqual(mockStats)
    })

    it('处理空统计结果', async () => {
      getMock.mockResolvedValueOnce({ data: { data: [] } })

      const result = await getValueStats('course', 'month', 'count')

      expect(result).toEqual([])
    })
  })

  describe('getTimeValueStats 方法 - 详细测试', () => {
    it('获取时间维度数值统计（按日）', async () => {
      const mockStats = [
        { x: '2024-01-01', y: 25 },
        { x: '2024-01-02', y: 30 }
      ]
      getMock.mockResolvedValueOnce({ data: { data: mockStats } })

      const result = await getTimeValueStats('course', 'date', 'count', 'day')

      expect(result).toEqual(mockStats)
      expect(getMock).toHaveBeenCalledWith('/common/value/course/date/count/day', { params: {} })
    })

    it('获取时间维度数值统计（按月）', async () => {
      const mockStats = [
        { x: '2024-01', y: 500 },
        { x: '2024-02', y: 600 }
      ]
      getMock.mockResolvedValueOnce({ data: { data: mockStats } })

      const result = await getTimeValueStats('course', 'month', 'revenue', 'month')

      expect(result).toEqual(mockStats)
      expect(getMock).toHaveBeenCalledWith('/common/value/course/month/revenue/month', { params: {} })
    })

    it('获取时间维度数值统计（按年）', async () => {
      const mockStats = [
        { x: '2023', y: 5000 },
        { x: '2024', y: 6000 }
      ]
      getMock.mockResolvedValueOnce({ data: { data: mockStats } })

      const result = await getTimeValueStats('course', 'year', 'total', 'year')

      expect(result).toEqual(mockStats)
      expect(getMock).toHaveBeenCalledWith('/common/value/course/year/total/year', { params: {} })
    })

    it('处理带参数的时间统计', async () => {
      const mockStats = [
        { x: '2024-01', y: 100 },
        { x: '2024-02', y: 120 }
      ]
      getMock.mockResolvedValueOnce({ data: { data: mockStats } })

      const result = await getTimeValueStats('course', 'month', 'registrations', 'month', {
        category: 'vip',
        status: 'active'
      })

      expect(result).toEqual(mockStats)
      expect(getMock).toHaveBeenCalledWith('/common/value/course/month/registrations/month', {
        params: { category: 'vip', status: 'active' }
      })
    })

    it('处理不支持的时间统计类型', async () => {
      getMock.mockRejectedValueOnce(new Error('Unsupported time stat type'))

      await expect(getTimeValueStats('course', 'date', 'count', 'invalid')).rejects.toThrow('Unsupported time stat type')
    })
  })

  describe('错误处理和边界情况', () => {
    it('处理网络超时错误', async () => {
      getMock.mockRejectedValueOnce(new Error('Timeout'))

      await expect(getOptions('course', 'category')).rejects.toThrow('Timeout')
    })

    it('处理服务器不可用错误', async () => {
      getMock.mockRejectedValueOnce(new Error('Service Unavailable'))

      await expect(calculateColumn('course', 'price')).rejects.toThrow('Service Unavailable')
    })

    it('处理权限不足错误', async () => {
      getMock.mockRejectedValueOnce(new Error('Forbidden'))

      await expect(groupByColumn('course', 'category')).rejects.toThrow('Forbidden')
    })

    it('处理请求参数过大错误', async () => {
      getMock.mockRejectedValueOnce(new Error('Payload too large'))

      await expect(getValueStats('course', 'month', 'count')).rejects.toThrow('Payload too large')
    })

    it('处理并发请求限制', async () => {
      getMock.mockRejectedValueOnce(new Error('Too many requests'))

      await expect(getRemindCount('course', 'coach', '1')).rejects.toThrow('Too many requests')
    })
  })

  describe('参数验证', () => {
    it('验证表名参数', async () => {
      await expect(getOptions('', 'category')).rejects.toThrow()
      await expect(getOptions(null as any, 'category')).rejects.toThrow()
      await expect(getOptions(undefined as any, 'category')).rejects.toThrow()
    })

    it('验证列名参数', async () => {
      await expect(getOptions('course', '')).rejects.toThrow()
      await expect(getOptions('course', null as any)).rejects.toThrow()
      await expect(getOptions('course', undefined as any)).rejects.toThrow()
    })

    it('验证时间统计类型参数', async () => {
      await expect(getTimeValueStats('course', 'month', 'count', '')).rejects.toThrow()
      await expect(getTimeValueStats('course', 'month', 'count', null as any)).rejects.toThrow()
      await expect(getTimeValueStats('course', 'month', 'count', undefined as any)).rejects.toThrow()
    })
  })

  describe('响应数据验证', () => {
    it('处理各种数据类型的响应', async () => {
      // 字符串数据
      getMock.mockResolvedValueOnce({ data: { data: 'string response' } })
      await expect(getOptions('test', 'column')).resolves.toBe('string response')

      // 数字数据
      getMock.mockResolvedValueOnce({ data: { data: 42 } })
      await expect(getRemindCount('test', 'column', '1')).resolves.toBe(42)

      // 布尔数据
      getMock.mockResolvedValueOnce({ data: { data: true } })
      await expect(calculateColumn('test', 'column')).resolves.toBe(true)

      // 对象数据
      const objData = { key: 'value', nested: { prop: 123 } }
      getMock.mockResolvedValueOnce({ data: { data: objData } })
      await expect(groupByColumn('test', 'column')).resolves.toEqual(objData)
    })

    it('处理嵌套数据结构', async () => {
      const nestedData = {
        summary: {
          total: 1000,
          categories: [
            { name: 'A', count: 500 },
            { name: 'B', count: 500 }
          ]
        },
        metadata: {
          generatedAt: '2024-01-01T00:00:00Z',
          version: '1.0'
        }
      }

      getMock.mockResolvedValueOnce({ data: { data: nestedData } })
      const result = await getValueStats('test', 'x', 'y')

      expect(result).toEqual(nestedData)
      expect(result.summary.categories).toHaveLength(2)
    })

    it('处理大数据响应', async () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        value: Math.random() * 1000
      }))

      getMock.mockResolvedValueOnce({ data: { data: largeData } })
      const result = await getValueStats('test', 'x', 'y')

      expect(result).toHaveLength(1000)
      expect(result[0]).toHaveProperty('id', 0)
      expect(result[999]).toHaveProperty('id', 999)
    })
  })
})


