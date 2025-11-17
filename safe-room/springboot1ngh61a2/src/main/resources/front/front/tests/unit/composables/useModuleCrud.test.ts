import { describe, expect, it, beforeEach, vi } from 'vitest'

const listMock = vi.fn(async () => ({ list: [{ id: 1 }], total: 1 }))
const detailMock = vi.fn(async () => ({ id: 1 }))
const createMock = vi.fn(async () => ({}))
const updateMock = vi.fn(async () => ({}))

vi.mock('@/config/modules', () => ({
  getModuleConfig: () => ({
    defaultSort: { prop: 'id', order: 'desc' },
  }),
}))

vi.mock('@/services/crud', () => ({
  getModuleService: () => ({
    list: listMock,
    detail: detailMock,
    create: createMock,
    update: updateMock,
  }),
}))

import { useModuleDetail, useModuleForm, useModuleList } from '@/composables/useModuleCrud'

describe('useModuleCrud composable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches list data with pagination helpers', async () => {
    const { records, pagination, fetchList, handleSearch } = useModuleList('yonghu')
    await fetchList()

    expect(listMock).toHaveBeenCalledWith(expect.objectContaining({ page: 1, limit: 10 }))
    expect(records.value).toHaveLength(1)

    pagination.page = 2
    handleSearch()
    expect(pagination.page).toBe(1)
  })

  it('loads detail data', async () => {
    const { record, fetchDetail } = useModuleDetail('yonghu')
    await fetchDetail(1)
    expect(detailMock).toHaveBeenCalledWith(1)
    expect(record.value).toEqual({ id: 1 })
  })

  it('submits form data', async () => {
    const { submit } = useModuleForm('yonghu')
    await submit()
    expect(createMock).toHaveBeenCalled()
    await submit(true)
    expect(updateMock).toHaveBeenCalled()
  })
})


