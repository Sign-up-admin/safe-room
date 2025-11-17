/**
 * CRUD操作组合式函数
 * 提供通用的增删改查功能
 */
import { ref, reactive, computed, type Ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '@/utils/http'
import { errorHandler } from '@/utils/errorHandler'
import { isAuth } from '@/utils/utils'
import type { ApiEndpoints, SearchFieldConfig, TableColumnConfig } from '@/types/crud'

export interface CrudOptions {
  moduleKey: string
  title: string
  apiEndpoints?: Partial<ApiEndpoints>
  searchFields?: SearchFieldConfig[]
  defaultSort?: { prop: string; order: 'asc' | 'desc' }
  defaultPageSize?: number
}

export interface ListResponse<T extends Record<string, unknown> = Record<string, unknown>> {
  total: number
  list: T[]
  [key: string]: unknown
}

export interface ApiResponse<T extends Record<string, unknown> = Record<string, unknown>> {
  code: number
  data?: T
  msg?: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
}

export interface SearchForm {
  keyword: string
  [key: string]: unknown
}

/**
 * CRUD组合式函数
 */
export function useCrud<T extends Record<string, unknown> = Record<string, unknown>>(
  options: CrudOptions
) {
  const {
    moduleKey,
    title,
    apiEndpoints = {},
    searchFields = [],
    defaultSort = { prop: 'id', order: 'desc' },
    defaultPageSize = 10
  } = options

  // 默认API端点
  const defaultEndpoints: ApiEndpoints = {
    list: `${moduleKey}/list`,
    page: `${moduleKey}/page`,
    info: (id) => `${moduleKey}/info/${id}`,
    save: `${moduleKey}/save`,
    update: `${moduleKey}/update`,
    delete: `${moduleKey}/delete`,
    batchDelete: `${moduleKey}/batchDelete`,
    export: `${moduleKey}/export`,
    import: `${moduleKey}/import`,
  }

  // 合并API端点
  const endpoints = { ...defaultEndpoints, ...apiEndpoints }

  // 状态
  const records = ref<T[]>([]) as Ref<T[]>
  const loading = ref(false)
  const submitting = ref(false)
  const exporting = ref(false)
  const importing = ref(false)
  const listError = ref('')
  const selectedRows = ref<T[]>([])
  const formVisible = ref(false)
  const detailVisible = ref(false)
  const isEditing = ref(false)
  const detailRecord = ref<T | null>(null)
  const formModel = ref<Record<string, any>>({})

  // 搜索表单
  const searchForm = reactive<Record<string, any>>({
    keyword: '',
  })

  // 初始化搜索表单字段
  searchFields.forEach(field => {
    if (!(field.key in searchForm)) {
      searchForm[field.key] = field.type === 'select' || field.multiple ? [] : undefined
    }
  })

  // 分页
  const pagination = reactive<Pagination>({
    page: 1,
    limit: defaultPageSize,
    total: 0,
  })

  // 排序
  const sort = reactive({
    prop: defaultSort.prop,
    order: defaultSort.order,
  })

  // 权限
  const permissions = computed(() => ({
    create: isAuth(moduleKey, 'Add'),
    update: isAuth(moduleKey, 'Edit'),
    remove: isAuth(moduleKey, 'Delete'),
    view: isAuth(moduleKey, 'View'),
    export: isAuth(moduleKey, 'Export'),
    import: isAuth(moduleKey, 'Import'),
  }))

  /**
   * 获取列表数据
   */
  async function fetchList() {
    loading.value = true
    listError.value = ''
    try {
      const params: Record<string, any> = {
        page: pagination.page,
        limit: pagination.limit,
        sort: sort.prop,
        order: sort.order,
      }

      // 添加搜索表单参数
      Object.keys(searchForm).forEach(key => {
        const value = searchForm[key]
        if (value !== undefined && value !== null && value !== '') {
          params[key] = value
        }
      })

      const endpoint = endpoints.page || endpoints.list || `${moduleKey}/page`
      const response = await http.get<ApiResponse<ListResponse<T>>>(`/${endpoint}`, {
        params,
      })

      if (response.data.code === 0) {
        records.value = (response.data.data?.list ?? []) as T[]
        pagination.total = response.data.data?.total ?? 0
      } else {
        const message = response.data?.msg
        throw new Error(message || '加载失败')
      }
    } catch (error: any) {
      // 使用统一错误处理器处理错误
      listError.value = errorHandler.extractErrorMessage(error)
      errorHandler.handleApiError(error, {
        showToast: false, // 列表错误显示在页面上，不使用toast
        redirect: false,   // 列表错误通常不需要跳转
        logToConsole: true,
        context: `${moduleKey} List Fetch`
      }).catch(() => {
        // 错误处理器返回rejected promise，这里不需要额外处理
      })
    } finally {
      loading.value = false
    }
  }

  /**
   * 搜索
   */
  function handleSearch() {
    pagination.page = 1
    fetchList()
  }

  /**
   * 重置搜索
   */
  function handleReset() {
    // 重置所有搜索字段
    Object.keys(searchForm).forEach(key => {
      if (key === 'keyword') {
        searchForm[key] = ''
      } else {
        const fieldConfig = searchFields.find(f => f.key === key)
        searchForm[key] = fieldConfig?.type === 'select' || fieldConfig?.multiple ? [] : undefined
      }
    })
    pagination.page = 1
    fetchList()
  }

  /**
   * 分页变化
   */
  function handlePageChange(page: number) {
    pagination.page = page
    fetchList()
  }

  /**
   * 每页条数变化
   */
  function handleSizeChange(size: number) {
    pagination.limit = size
    pagination.page = 1
    fetchList()
  }

  /**
   * 选择变化
   */
  function handleSelectionChange(selection: T[]) {
    selectedRows.value = selection
  }

  /**
   * 批量删除
   */
  async function batchRemove() {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请选择要删除的记录')
      return
    }
    try {
      await ElMessageBox.confirm(
        `确定删除选中的 ${selectedRows.value.length} 条记录吗？该操作无法撤销。`,
        '批量删除确认',
        {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
      const ids = selectedRows.value.map(row => (row as any).id)
      const endpoint = endpoints.batchDelete || endpoints.delete || `${moduleKey}/delete`
      const response = await http.post<ApiResponse>(`/${endpoint}`, ids)
      if (response.data.code === 0) {
        ElMessage.success('批量删除成功')
        selectedRows.value = []
        fetchList()
      } else {
        const message = response.data?.msg || '批量删除失败'
        ElMessage.error(message)
      }
    } catch (error: any) {
      if (error === 'cancel') {
        return
      }
      // 使用统一错误处理器处理错误
      errorHandler.handleApiError(error, {
        showToast: true,
        redirect: false, // 删除错误通常不需要跳转
        logToConsole: true,
        context: `${moduleKey} Batch Remove`
      }).catch(() => {
        // 错误处理器返回rejected promise，这里不需要额外处理
      })
    }
  }

  /**
   * 删除单条记录
   */
  async function removeRow(row: T) {
    if (!permissions.value.remove) return
    try {
      await ElMessageBox.confirm(`确定删除该记录吗？该操作无法撤销。`, '删除确认', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      })
      const endpoint = endpoints.delete || `${moduleKey}/delete`
      const response = await http.post<ApiResponse>(`/${endpoint}`, [(row as any).id])
      if (response.data.code === 0) {
        ElMessage.success('已删除')
        // 如果删除后当前页没有数据了，返回上一页
        if (records.value.length === 1 && pagination.page > 1) {
          pagination.page--
        }
        fetchList()
      } else {
        const message = response.data?.msg || '删除失败'
        ElMessage.error(message)
      }
    } catch (error: any) {
      if (error === 'cancel') {
        return
      }
      // 使用统一错误处理器处理错误
      errorHandler.handleApiError(error, {
        showToast: true,
        redirect: false, // 删除错误通常不需要跳转
        logToConsole: true,
        context: `${moduleKey} Remove Row`
      }).catch(() => {
        // 错误处理器返回rejected promise，这里不需要额外处理
      })
    }
  }

  /**
   * 查看详情
   */
  async function viewDetail(row: T) {
    if (!permissions.value.view) return
    try {
      const id = (row as any).id
      if (!id) {
        detailRecord.value = row
        detailVisible.value = true
        return
      }

      const endpoint = endpoints.info ? endpoints.info(id) : `${moduleKey}/info/${id}`
      const response = await http.get<ApiResponse<T>>(`/${endpoint}`)
      if (response.data.code === 0) {
        detailRecord.value = response.data.data || row
        detailVisible.value = true
      } else {
        throw new Error(response.data?.msg || '获取详情失败')
      }
    } catch (error: any) {
      // 使用统一错误处理器处理错误，但不显示toast（因为有警告消息）
      errorHandler.handleApiError(error, {
        showToast: false, // 不显示错误toast，因为下面有警告消息
        redirect: false,   // 详情获取失败不需要跳转
        logToConsole: true,
        context: `${moduleKey} View Detail`
      }).catch(() => {
        // 错误处理器返回rejected promise，这里不需要额外处理
      })

      // 显示友好的警告消息并继续显示现有数据
      detailRecord.value = row
      detailVisible.value = true
      ElMessage.warning('获取最新详情失败，显示当前数据')
    }
  }

  /**
   * 打开表单（新增或编辑）
   */
  function openForm(row?: T) {
    isEditing.value = !!row
    if (row) {
      formModel.value = { ...row }
    } else {
      formModel.value = {}
    }
    formVisible.value = true
  }

  /**
   * 关闭表单
   */
  function closeForm() {
    formVisible.value = false
    formModel.value = {}
  }

  /**
   * 提交表单
   */
  async function submitForm(formData?: Record<string, any>) {
    const data = formData || formModel.value
    submitting.value = true
    try {
      let response: ApiResponse
      if (isEditing.value) {
        const endpoint = endpoints.update || `${moduleKey}/update`
        response = await http.post<ApiResponse>(`/${endpoint}`, data)
        ElMessage.success('更新成功')
      } else {
        const endpoint = endpoints.save || `${moduleKey}/save`
        response = await http.post<ApiResponse>(`/${endpoint}`, data)
        ElMessage.success('新增成功')
      }

      if (response.data.code === 0) {
        closeForm()
        fetchList()
        return response.data
      } else {
        throw new Error(String(response.data?.msg || '操作失败'))
      }
    } catch (error: any) {
      // 使用统一错误处理器处理错误
      errorHandler.handleApiError(error, {
        showToast: true,
        redirect: false, // 表单提交错误通常不需要跳转
        logToConsole: true,
        context: `${moduleKey} Form Submit`
      }).catch(() => {
        // 错误处理器返回rejected promise，这里不需要额外处理
      })
      throw error
    } finally {
      submitting.value = false
    }
  }

  /**
   * 关闭详情
   */
  function closeDetail() {
    detailVisible.value = false
    detailRecord.value = null
  }

  /**
   * 排序变化
   */
  function handleSortChange(sorter: { prop: string; order: string }) {
    sort.prop = sorter.prop
    sort.order = sorter.order === 'descending' ? 'desc' : 'asc'
    fetchList()
  }

  /**
   * 导出Excel
   */
  async function handleExport() {
    exporting.value = true
    try {
      const params: Record<string, any> = {
        page: 1,
        limit: 10000, // 导出所有数据
        sort: sort.prop,
        order: sort.order,
      }

      // 添加搜索表单参数
      Object.keys(searchForm).forEach(key => {
        const value = searchForm[key]
        if (value !== undefined && value !== null && value !== '') {
          params[key] = value
        }
      })

      const endpoint = endpoints.export || endpoints.list || `${moduleKey}/list`
      const response = await http.get<Blob>(`/${endpoint}`, {
        params,
        responseType: 'blob',
      })

      // 创建下载链接
      const blob = new Blob([response.data as any], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${title}_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      ElMessage.success('导出成功')
    } catch (error: any) {
      // 使用统一错误处理器处理错误
      errorHandler.handleApiError(error, {
        showToast: true,
        redirect: false, // 导出错误通常不需要跳转
        logToConsole: true,
        context: `${moduleKey} Export`
      }).catch(() => {
        // 错误处理器返回rejected promise，这里不需要额外处理
      })
    } finally {
      exporting.value = false
    }
  }

  /**
   * 导入数据
   */
  async function handleImport(file: File) {
    importing.value = true
    try {
      const formData = new FormData()
      formData.append('file', file)

      const endpoint = endpoints.import || `${moduleKey}/import`
      const response = await http.post<ApiResponse>(`/${endpoint}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.code === 0) {
        ElMessage.success('导入成功')
        fetchList()
        return response.data
      } else {
        throw new Error(response.data?.msg || '导入失败')
      }
    } catch (error: any) {
      // 使用统一错误处理器处理错误
      errorHandler.handleApiError(error, {
        showToast: true,
        redirect: false, // 导入错误通常不需要跳转
        logToConsole: true,
        context: `${moduleKey} Import`
      }).catch(() => {
        // 错误处理器返回rejected promise，这里不需要额外处理
      })
      throw error
    } finally {
      importing.value = false
    }
  }

  /**
   * 记录操作日志
   */
  async function logOperation(operation: string, data: Record<string, any>) {
    try {
      await http.post('/operationLog/save', {
        tablename: moduleKey,
        operation,
        operationcontent: JSON.stringify(data),
        addtime: new Date().toISOString(),
      })
    } catch (error) {
      // 操作日志记录失败不影响主流程
      console.error('操作日志记录失败:', error)
    }
  }

  return {
    // 状态
    records,
    loading,
    submitting,
    exporting,
    importing,
    listError,
    selectedRows,
    searchForm,
    pagination,
    sort,
    permissions,
    formVisible,
    detailVisible,
    isEditing,
    detailRecord,
    formModel,

    // 端点配置
    endpoints,

    // 方法
    fetchList,
    handleSearch,
    handleReset,
    handlePageChange,
    handleSizeChange,
    handleSelectionChange,
    handleSortChange,
    batchRemove,
    removeRow,
    handleExport,
    handleImport,
    viewDetail,
    openForm,
    closeForm,
    submitForm,
    closeDetail,
    logOperation,
  }
}
