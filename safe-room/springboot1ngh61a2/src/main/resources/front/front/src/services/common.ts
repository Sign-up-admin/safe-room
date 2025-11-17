import http from '@/common/http'
import type { ApiResponse } from '@/types/api'

export interface OptionParams {
  conditionColumn?: string
  conditionValue?: string | number
  level?: string
  parent?: string
  [key: string]: string | number | undefined
}

export async function getOptions(table: string, column: string, params: OptionParams = {}): Promise<string[]> {
  const response = await http.get<ApiResponse<string[]>>(`/common/option/${table}/${column}`, {
    params,
  })
  // HTTP 拦截器已经处理了错误码，如果到这里说明 code === 0
  return response.data.data || []
}

export async function followRecord<T = Record<string, unknown>>(
  table: string,
  column: string,
  value: string | number,
): Promise<T | undefined> {
  const response = await http.get<ApiResponse<T>>(`/common/follow/${table}/${column}`, {
    params: { columnValue: value },
  })
  return response.data.data
}

export interface ShStatusPayload {
  id: number | string
  sfsh: string
  shhf?: string
}

export async function updateShStatus(table: string, payload: ShStatusPayload): Promise<ApiResponse> {
  const response = await http.post<ApiResponse>(`/common/sh/${table}`, payload)
  return response.data
}

export interface RemindParams {
  remindstart?: number
  remindend?: number
  [key: string]: string | number | undefined
}

export async function getRemindCount(
  table: string,
  column: string,
  type: '1' | '2',
  params: RemindParams = {},
): Promise<number> {
  const response = await http.get<ApiResponse<{ count: number } | number>>(
    `/common/remind/${table}/${column}/${type}`,
    { params },
  )
  // HTTP 拦截器已经处理了错误码，如果到这里说明 code === 0
  const data = response.data.data
  // 如果 data 是数字，直接返回
  if (typeof data === 'number') {
    return data
  }
  // 如果 data 是对象且有 count 字段，返回 count
  if (data && typeof data === 'object' && 'count' in data) {
    return (data as { count: number }).count
  }
  return 0
}

export async function calculateColumn(
  table: string,
  column: string,
  params: Record<string, string | number> = {},
): Promise<Record<string, number | string>> {
  const response = await http.get<ApiResponse<Record<string, number | string>>>(`/common/cal/${table}/${column}`, {
    params,
  })
  // HTTP 拦截器已经处理了错误码，如果到这里说明 code === 0
  return response.data.data || {}
}

export async function groupByColumn(
  table: string,
  column: string,
  params: Record<string, string | number> = {},
): Promise<Array<Record<string, number | string>>> {
  const response = await http.get<ApiResponse<Array<Record<string, number | string>>>>(
    `/common/group/${table}/${column}`,
    { params },
  )
  // HTTP 拦截器已经处理了错误码，如果到这里说明 code === 0
  return response.data.data || []
}

export async function getValueStats(
  table: string,
  xColumn: string,
  yColumn: string,
  params: Record<string, string | number> = {},
): Promise<Array<Record<string, number | string>>> {
  const response = await http.get<ApiResponse<Array<Record<string, number | string>>>>(
    `/common/value/${table}/${xColumn}/${yColumn}`,
    { params },
  )
  // HTTP 拦截器已经处理了错误码，如果到这里说明 code === 0
  return response.data.data || []
}

export async function getTimeValueStats(
  table: string,
  xColumn: string,
  yColumn: string,
  timeStatType: 'day' | 'week' | 'month',
  params: Record<string, string | number> = {},
): Promise<Array<Record<string, number | string>>> {
  const response = await http.get<ApiResponse<Array<Record<string, number | string>>>>(
    `/common/value/${table}/${xColumn}/${yColumn}/${timeStatType}`,
    { params },
  )
  // HTTP 拦截器已经处理了错误码，如果到这里说明 code === 0
  return response.data.data || []
}
