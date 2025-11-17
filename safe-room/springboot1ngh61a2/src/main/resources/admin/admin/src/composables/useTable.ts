/**
 * 表格操作组合式函数
 * 提供通用的表格CRUD操作
 */
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useApi } from './useApi'
import type { PageResult, PageParams, ListQueryParams } from '@/types/api'

export interface UseTableOptions<T extends Record<string, unknown> = Record<string, unknown>> {
  /**
   * 列表查询接口
   */
  listApi: string
  /**
   * 删除接口
   */
  deleteApi?: string
  /**
   * 导出接口
   */
  exportApi?: string
  /**
   * 默认查询参数
   */
  defaultParams?: Record<string, unknown>
  /**
   * 是否立即加载
   */
  immediate?: boolean
}

/**
 * 使用表格的组合式函数
 */
export function useTable<T extends Record<string, unknown> = Record<string, unknown>>(options: UseTableOptions<T>) {
  const { listApi, deleteApi, exportApi, defaultParams = {}, immediate = true } = options
  const api = useApi()

  // 状态
  const loading = ref(false)
  const records = ref<T[]>([])
  const total = ref(0)
  const selectedRows = ref<T[]>([])
  const listError = ref<string | null>(null)

  // 分页参数
  const pagination = reactive<PageParams>({
    page: 1,
    limit: 10,
    ...defaultParams,
  })

  // 搜索表单
  const searchForm = reactive<ListQueryParams>({
    page: 1,
    limit: 10,
    keyword: '',
    ...defaultParams,
  })

  // 计算属性
  const hasSelection = computed(() => selectedRows.value.length > 0)

  /**
   * 获取列表数据
   */
  async function fetchList() {
    loading.value = true
    listError.value = null

    try {
      const params = {
        ...pagination,
        ...searchForm,
      }

      const response = await api.page<T>(listApi, params)

      if (response.code === 0 && response.data) {
        records.value = response.data.list || []
        total.value = response.data.total || 0
      } else {
        listError.value = response.msg || '获取列表失败'
        records.value = []
        total.value = 0
      }
    } catch (error: any) {
      listError.value = error.message || '获取列表失败'
      records.value = []
      total.value = 0
      console.error('获取列表失败:', error)
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
    Object.keys(searchForm).forEach(key => {
      if (key !== 'keyword') {
        delete (searchForm as any)[key]
      } else {
        ;(searchForm as any)[key] = ''
      }
    })
    pagination.page = 1
    fetchList()
  }

  /**
   * 分页大小改变
   */
  function handleSizeChange(size: number) {
    pagination.limit = size
    pagination.page = 1
    fetchList()
  }

  /**
   * 页码改变
   */
  function handlePageChange(page: number) {
    pagination.page = page
    fetchList()
  }

  /**
   * 选择改变
   */
  function handleSelectionChange(selection: T[]) {
    selectedRows.value = selection
  }

  /**
   * 删除单条记录
   */
  async function removeRow(row: T, idKey = 'id') {
    if (!deleteApi) {
      ElMessage.warning('未配置删除接口')
      return
    }

    try {
      await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
        type: 'warning',
      })

      const id = (row as any)[idKey]
      if (!id) {
        ElMessage.error('无法获取记录ID')
        return
      }

      const response = await api.del(deleteApi, { id })

      if (response.code === 0) {
        ElMessage.success('删除成功')
        fetchList()
      } else {
        ElMessage.error(response.msg || '删除失败')
      }
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error(error.message || '删除失败')
      }
    }
  }

  /**
   * 批量删除
   */
  async function batchRemove(idKey = 'id') {
    if (!deleteApi) {
      ElMessage.warning('未配置删除接口')
      return
    }

    if (selectedRows.value.length === 0) {
      ElMessage.warning('请选择要删除的记录')
      return
    }

    try {
      await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 条记录吗？`, '提示', {
        type: 'warning',
      })

      const ids = selectedRows.value.map(row => (row as any)[idKey]).filter(Boolean)

      if (ids.length === 0) {
        ElMessage.error('无法获取记录ID')
        return
      }

      const response = await api.del(deleteApi, { ids })

      if (response.code === 0) {
        ElMessage.success('批量删除成功')
        selectedRows.value = []
        fetchList()
      } else {
        ElMessage.error(response.msg || '批量删除失败')
      }
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error(error.message || '批量删除失败')
      }
    }
  }

  /**
   * 导出
   */
  async function handleExport() {
    if (!exportApi) {
      ElMessage.warning('未配置导出接口')
      return
    }

    try {
      const params = {
        ...searchForm,
      }

      // 这里应该调用导出接口，实际实现可能需要根据后端接口调整
      ElMessage.info('导出功能开发中')
    } catch (error: any) {
      ElMessage.error(error.message || '导出失败')
    }
  }

  // 立即加载
  if (immediate) {
    fetchList()
  }

  return {
    // 状态
    loading,
    records,
    total,
    selectedRows,
    listError,
    pagination,
    searchForm,
    // 计算属性
    hasSelection,
    // 方法
    fetchList,
    handleSearch,
    handleReset,
    handleSizeChange,
    handlePageChange,
    handleSelectionChange,
    removeRow,
    batchRemove,
    handleExport,
  }
}
