/**
 * CRUD操作组合式函数
 * 提供通用的增删改查功能
 */
import { ref, reactive, computed, type Ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '@/utils/http'
import { isAuth } from '@/utils/utils'

export interface CrudOptions {
  moduleKey: string
  title: string
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
  const { moduleKey, title } = options

  // 状态
  const records = ref<T[]>([]) as Ref<T[]>
  const loading = ref(false)
  const submitting = ref(false)
  const exporting = ref(false)
  const listError = ref('')
  const selectedRows = ref<T[]>([])

  // 搜索表单
  const searchForm = reactive<SearchForm>({
    keyword: '',
  })

  // 分页
  const pagination = reactive<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
  })

  // 权限
  const permissions = computed(() => ({
    create: isAuth(moduleKey, 'Add'),
    update: isAuth(moduleKey, 'Edit'),
    remove: isAuth(moduleKey, 'Delete'),
    view: isAuth(moduleKey, 'View'),
    export: isAuth(moduleKey, 'Export'),
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
        sort: 'id',
        order: 'desc',
      }
      if (searchForm.keyword) {
        params.keyword = searchForm.keyword
      }

      const response = await http.get<ApiResponse<ListResponse<T>>>(`/${moduleKey}/list`, {
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
      console.error(error)
      listError.value = error?.response?.data?.msg || error?.message || '加载数据失败'
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
    searchForm.keyword = ''
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
      const response = await http.post<ApiResponse>(`/${moduleKey}/delete`, ids)
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
      console.error(error)
      const message = error?.response?.data?.msg || error?.message || '批量删除失败'
      ElMessage.error(message)
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
      const response = await http.post<ApiResponse>(`/${moduleKey}/delete`, [(row as any).id])
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
      console.error(error)
      const message = error?.response?.data?.msg || error?.message || '删除失败'
      ElMessage.error(message)
    }
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
      }
      if (searchForm.keyword) {
        params.keyword = searchForm.keyword
      }

      const response = await http.get<Blob>(`/${moduleKey}/list`, {
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
      console.error(error)
      ElMessage.error(error?.response?.data?.msg || error?.message || '导出失败')
    } finally {
      exporting.value = false
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
    listError,
    selectedRows,
    searchForm,
    pagination,
    permissions,

    // 方法
    fetchList,
    handleSearch,
    handleReset,
    handlePageChange,
    handleSizeChange,
    handleSelectionChange,
    batchRemove,
    removeRow,
    handleExport,
    logOperation,
  }
}
