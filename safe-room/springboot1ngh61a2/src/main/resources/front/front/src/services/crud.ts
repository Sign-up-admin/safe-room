import http from '../common/http'
import type { ApiResponse, PageParams, PageResult } from '../types/api'
import type { ModuleEntityMap, ModuleKey } from '../types/modules'

export interface ListResult<T> {
  list: T[]
  total: number
}

class CrudService<TRecord extends Record<string, any>> {
  constructor(private readonly basePath: string) {}

  async list(params: Partial<PageParams> = {}): Promise<ListResult<TRecord>> {
    const response = await http.get<ApiResponse<PageResult<TRecord>>>(`${this.basePath}/list`, {
      params: params || ({} as any),
    })
    return response.data.data || { list: [], total: 0 }
  }

  async detail(id: number | string): Promise<TRecord> {
    const response = await http.get<ApiResponse<TRecord>>(`${this.basePath}/detail/${id}`)
    return response.data.data!
  }

  async create(payload: Partial<TRecord>): Promise<ApiResponse> {
    const response = await http.post<ApiResponse>(`${this.basePath}/add`, payload)
    return response.data
  }

  async update(payload: Partial<TRecord>): Promise<ApiResponse> {
    const response = await http.post<ApiResponse>(`${this.basePath}/update`, payload)
    return response.data
  }

  async remove(ids: Array<number | string>): Promise<ApiResponse> {
    const response = await http.post<ApiResponse>(`${this.basePath}/delete`, ids)
    return response.data
  }

  // Alias methods for compatibility
  async delete(id: number | string): Promise<ApiResponse> {
    return this.remove([id])
  }

  async save(payload: Partial<TRecord>): Promise<ApiResponse> {
    if (payload.id) {
      return this.update(payload)
    } else {
      return this.create(payload)
    }
  }

  async thumbsup(id: number | string, type: 0 | 1 = 1): Promise<ApiResponse> {
    const response = await http.post<ApiResponse>(`${this.basePath}/thumbsup/${id}`, undefined, {
      params: { type },
    })
    return response.data
  }

  async autoSort(params: Partial<PageParams> = {}): Promise<TRecord[]> {
    const response = await http.get<ApiResponse<PageResult<TRecord>>>(`${this.basePath}/autoSort`, {
      params: params || ({} as any),
    })
    // 后端返回的是 PageUtils 对象，包含 list 和 total
    const pageData = response.data.data
    if (pageData && typeof pageData === 'object' && 'list' in pageData) {
      return (pageData as PageResult<TRecord>).list || []
    }
    // 兼容直接返回数组的情况
    return Array.isArray(pageData) ? pageData : []
  }

  async autoSortCollaborative(params: Partial<PageParams> = {}): Promise<TRecord[]> {
    const response = await http.get<ApiResponse<PageResult<TRecord>>>(`${this.basePath}/autoSort2`, {
      params: params || ({} as any),
    })
    // 后端返回的是 PageUtils 对象，包含 list 和 total
    const pageData = response.data.data
    if (pageData && typeof pageData === 'object' && 'list' in pageData) {
      return (pageData as PageResult<TRecord>).list || []
    }
    // 兼容直接返回数组的情况
    return Array.isArray(pageData) ? pageData : []
  }

  async shBatch(ids: Array<number | string>, sfsh: string, shhf?: string): Promise<ApiResponse> {
    const response = await http.post<ApiResponse>(`${this.basePath}/shBatch`, ids, {
      params: { sfsh, shhf },
    })
    return response.data
  }

  async fetchStats<T = any>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const response = await http.get<ApiResponse<T>>(`${this.basePath}/${endpoint}`, {
      params: params || ({} as any),
    })
    return response.data.data!
  }
}

const serviceCache: Partial<Record<ModuleKey, CrudService<any>>> = {}

export function getModuleService<K extends ModuleKey>(key: K): CrudService<ModuleEntityMap[K]> {
  if (!serviceCache[key]) {
    serviceCache[key] = new CrudService<ModuleEntityMap[K]>(`/${key}`)
  }
  return serviceCache[key]!
}

