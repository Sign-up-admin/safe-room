<template>
  <div class="operation-log-page">
    <header class="module-page__header">
      <div>
        <p class="eyebrow">operation-log</p>
        <h2>操作日志</h2>
      </div>
      <div class="actions">
        <el-button :loading="exporting" @click="handleExport">导出Excel</el-button>
        <el-button @click="fetchList">刷新</el-button>
      </div>
    </header>

    <div class="filter-section">
      <el-form :model="filterForm" inline>
        <el-form-item label="操作人">
          <el-input v-model="filterForm.username" placeholder="请输入操作人用户名" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="filterForm.type" placeholder="请选择操作类型" clearable style="width: 150px">
            <el-option label="新增" value="Add" />
            <el-option label="编辑" value="Edit" />
            <el-option label="删除" value="Delete" />
            <el-option label="查看" value="View" />
            <el-option label="导出" value="Export" />
            <el-option label="登录" value="Login" />
            <el-option label="退出" value="Logout" />
          </el-select>
        </el-form-item>
        <el-form-item label="表名/模块">
          <el-input v-model="filterForm.table" placeholder="请输入表名" clearable style="width: 150px" />
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 360px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div v-if="listError" class="table-error">
      <el-result icon="warning" title="列表加载失败" :sub-title="listError">
        <template #extra>
          <el-button type="primary" @click="fetchList">重试</el-button>
        </template>
      </el-result>
    </div>

    <el-table v-else v-loading="loading" :data="records" border stripe>
      <el-table-column type="index" label="#" width="60" />
      <el-table-column prop="username" label="操作人" min-width="120" />
      <el-table-column prop="operationType" label="操作类型" width="100">
        <template #default="{ row }">
          <el-tag :type="getTypeTagType(row['operationType'] || row['type'])">
            {{ getTypeLabel(row['operationType'] || row['type']) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="tableName" label="表名/模块" min-width="140">
        <template #default="{ row }">
          {{ row['tableName'] || row['table'] || '--' }}
        </template>
      </el-table-column>
      <el-table-column prop="content" label="操作内容" min-width="200" show-overflow-tooltip />
      <el-table-column prop="ip" label="IP地址" width="140" />
      <el-table-column prop="addtime" label="操作时间" min-width="160" />
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button text type="primary" size="small" @click="viewRow(row)">查看详情</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="暂无数据" />
      </template>
    </el-table>

    <div class="pagination">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next"
        :total="pagination.total"
        :current-page="pagination.page"
        :page-size="pagination.limit"
        :page-sizes="[10, 20, 30, 50]"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <el-dialog v-model="detailVisible" title="操作日志详情" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="操作人">{{ detailRecord?.username }}</el-descriptions-item>
        <el-descriptions-item label="操作类型">
          <el-tag :type="getTypeTagType(detailRecord?.operationType || detailRecord?.type)">
            {{ getTypeLabel(detailRecord?.operationType || detailRecord?.type) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="表名/模块">
          {{ detailRecord?.tableName || detailRecord?.table || '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="操作内容">
          <div style="max-height: 200px; overflow-y: auto">{{ detailRecord?.content }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ detailRecord?.ip }}</el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ detailRecord?.addtime }}</el-descriptions-item>
        <el-descriptions-item v-if="detailRecord?.beforeData" label="操作前数据">
          <pre class="json-view">{{ formatJson(detailRecord.beforeData) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item v-if="detailRecord?.afterData" label="操作后数据">
          <pre class="json-view">{{ formatJson(detailRecord.afterData) }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="OperationLogList">
import { ElMessage } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import http from '@/utils/http'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

interface ListResponse<T = any> {
  total: number
  list: T[]
}

const records = ref<Record<string, any>[]>([])
const loading = ref(false)
const detailVisible = ref(false)
const exporting = ref(false)
const listError = ref('')
const detailRecord = ref<Record<string, any> | null>(null)
const dateRange = ref<[string, string] | null>(null)

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
})

const filterForm = reactive({
  username: '',
  type: '',
  table: '',
})

onMounted(() => {
  fetchList()
})

const fetchList = async () => {
  loading.value = true
  listError.value = ''
  try {
    const params: any = {
      page: pagination.page,
      limit: pagination.limit,
      sort: 'addtime',
      order: 'desc',
    }

    if (filterForm.username) {
      params.username = filterForm.username
    }
    if (filterForm.type) {
      params.operationType = filterForm.type
    }
    if (filterForm.table) {
      params.tableName = filterForm.table
    }
    if (dateRange.value && dateRange.value.length === 2) {
      params.startTime = dateRange.value[0]
      params.endTime = dateRange.value[1]
    }

    // 使用操作日志接口
    const endpoint = API_ENDPOINTS.OPERATION_LOG.PAGE
    const response = await http.get<{ code: number; data: ListResponse }>(`/${endpoint}`, { params })
    if (response.data.code === 0) {
      records.value = response.data.data?.list ?? []
      pagination.total = response.data.data?.total ?? 0
    } else {
      throw new Error((response.data as any)?.msg || '加载失败')
    }
  } catch (error: any) {
    listError.value = error.message || '加载失败'
    ElMessage.error('加载列表失败')
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (size: number) => {
  pagination.limit = size
  pagination.page = 1
  fetchList()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  fetchList()
}

const handleSearch = () => {
  pagination.page = 1
  fetchList()
}

const handleReset = () => {
  filterForm.username = ''
  filterForm.type = ''
  filterForm.table = ''
  dateRange.value = null
  pagination.page = 1
  fetchList()
}

const viewRow = async (row: Record<string, any>) => {
  try {
    // 获取详情，包含操作前后数据对比
    const response = await http.get(`/${API_ENDPOINTS.OPERATION_LOG.INFO(row['id'])}`)
    detailRecord.value = response.data.data || row
    detailVisible.value = true
  } catch (error: any) {
    // 如果详情接口不存在，直接显示当前行数据
    detailRecord.value = row
    detailVisible.value = true
  }
}

const handleExport = async () => {
  exporting.value = true
  try {
    // 先尝试使用后端导出接口
    try {
      const params: any = {
        sort: 'addtime',
        order: 'desc',
      }

      if (filterForm.username) {
        params.username = filterForm.username
      }
      if (filterForm.type) {
        params.operationType = filterForm.type
      }
      if (filterForm.table) {
        params.tableName = filterForm.table
      }
      if (dateRange.value && dateRange.value.length === 2) {
        params.startTime = dateRange.value[0]
        params.endTime = dateRange.value[1]
      }

      const response = await http.get(`/${API_ENDPOINTS.OPERATION_LOG.EXPORT}`, {
        params,
        responseType: 'blob',
      })

      // 创建下载链接
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `操作日志_${new Date().toISOString().slice(0, 10)}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      ElMessage.success('导出成功')
      
    } catch (exportError: any) {
      // 如果后端导出接口不存在，使用前端方式导出
      if (exportError.response?.status === 404 || exportError.message?.includes('404')) {
        // 获取所有数据（不分页）
        const params: any = {
          limit: 10000, // 获取大量数据
          sort: 'addtime',
          order: 'desc',
        }

        if (filterForm.username) {
          params.username = filterForm.username
        }
        if (filterForm.type) {
          params.operationType = filterForm.type
        }
        if (filterForm.table) {
          params.tableName = filterForm.table
        }
        if (dateRange.value && dateRange.value.length === 2) {
          params.startTime = dateRange.value[0]
          params.endTime = dateRange.value[1]
        }

        const response = await http.get<{ code: number; data: ListResponse }>(`/${API_ENDPOINTS.OPERATION_LOG.PAGE}`, {
          params,
        })

        if (response.data.code === 0) {
          const exportData = response.data.data?.list ?? []
          // 转换为CSV格式
          const headers = ['操作人', '操作类型', '表名/模块', '操作内容', 'IP地址', '操作时间']
          const rows = exportData.map((item: any) => [
            item.username || '',
            getTypeLabel(item.operationType || item.type || ''),
            item.tableName || item.table || '',
            (item.content || '').replace(/"/g, '""'), // 转义双引号
            item.ip || '',
            item.addtime || '',
          ])

          const csvContent =
            '\uFEFF' + // BOM for Excel UTF-8
            headers.join(',') +
            '\n' +
            rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `操作日志_${new Date().toISOString().slice(0, 10)}.csv`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)

          ElMessage.success('导出成功（CSV格式）')
          return
        }
      }
      throw exportError
    }
  } catch (error: any) {
    ElMessage.error(error.message || '导出失败')
  } finally {
    exporting.value = false
  }
}

const getTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    Add: '新增',
    Edit: '编辑',
    Delete: '删除',
    View: '查看',
    Export: '导出',
    Login: '登录',
    Logout: '退出',
  }
  return typeMap[type] || type
}

const getTypeTagType = (type: string): string => {
  const typeMap: Record<string, string> = {
    Add: 'success',
    Edit: 'primary',
    Delete: 'danger',
    View: 'info',
    Export: 'warning',
    Login: 'success',
    Logout: 'info',
  }
  return typeMap[type] || 'info'
}

const formatJson = (data: any): string => {
  if (typeof data === 'string') {
    try {
      return JSON.stringify(JSON.parse(data), null, 2)
    } catch {
      return data
    }
  }
  return JSON.stringify(data, null, 2)
}
</script>

<style scoped lang="scss">
@use '@/styles/tokens' as *;

.operation-log-page {
  padding: 20px;
  background: $color-bg-main;
  min-height: 100vh;
}

.module-page__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 20px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .eyebrow {
    font-size: 12px;
    color: #a0a4b3;
    margin: 0 0 8px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  h2 {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }

  .actions {
    display: flex;
    gap: 12px;
  }
}

.filter-section {
  padding: 20px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.table-error {
  padding: 40px;
  background: #ffffff;
  border-radius: 8px;
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding: 20px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.json-view {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.6;
  max-height: 200px;
  margin: 0;
}

// 响应式设计
@media (width <= 768px) {
  .operation-log-page {
    padding: 16px;
  }

  .module-page__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 16px;

    .actions {
      width: 100%;
      flex-wrap: wrap;

      .el-button {
        flex: 1;
        min-width: 100px;
      }
    }
  }

  .filter-section {
    padding: 16px;

    :deep(.el-form-item) {
      margin-bottom: 12px;
      width: 100%;
    }

    :deep(.el-input),
    :deep(.el-select),
    :deep(.el-date-picker) {
      width: 100% !important;
    }
  }

  :deep(.el-table) {
    font-size: 12px;

    .el-table__cell {
      padding: 8px 4px;
    }
  }

  .pagination {
    padding: 16px;
    justify-content: center;
    flex-wrap: wrap;
  }
}

@media (width > 768px) and (width <= 1024px) {
  .operation-log-page {
    padding: 18px;
  }

  .filter-section {
    :deep(.el-form-item) {
      margin-bottom: 12px;
    }
  }
}
</style>
