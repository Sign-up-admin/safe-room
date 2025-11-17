# 重构后使用示例

本文档展示如何使用重构后的新功能。

## 1. 使用 Composables

### usePagination - 分页

```vue
<template>
  <div>
    <el-table :data="records" v-loading="loading">
      <!-- 表格列 -->
    </el-table>
    <el-pagination
      :current-page="pagination.page"
      :page-size="pagination.limit"
      :total="pagination.total"
      :page-sizes="pageSizes"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { usePagination, useTable } from '@/composables'
import { http } from '@/utils/http'
import api from '@/utils/api'

// 分页
const { pagination, pageSizes, handlePageChange, handleSizeChange, updateFromResponse } = usePagination()

// 表格
const { records, loading, fetchList } = useTable({
  fetchApi: async (params) => {
    const response = await http.get(api.yonghupage, { params })
    updateFromResponse(response.data)
    return response
  },
})

// 初始加载
fetchList(pagination)
</script>
```

### useTable - 表格操作

```vue
<template>
  <div>
    <el-button @click="handleBatchDelete" :disabled="!hasSelection">
      批量删除 ({{ selectedRows.length }})
    </el-button>
    <el-table
      :data="records"
      v-loading="loading"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" />
      <!-- 其他列 -->
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { useTable } from '@/composables'
import { http } from '@/utils/http'
import api from '@/utils/api'

const {
  records,
  loading,
  selectedRows,
  hasSelection,
  fetchList,
  removeRow,
  batchRemove,
  handleSelectionChange,
} = useTable({
  fetchApi: async (params) => {
    return await http.get(api.yonghupage, { params })
  },
  deleteApi: async (id) => {
    return await http.post(api.yonghudelete, { id })
  },
  deleteBatchApi: async (ids) => {
    return await http.post(api.yonghudeleteBatch, { ids })
  },
})

async function handleDelete(row: any) {
  const success = await removeRow(row, '确定要删除这个用户吗？')
  if (success) {
    fetchList()
  }
}

async function handleBatchDelete() {
  const success = await batchRemove('确定要删除选中的用户吗？')
  if (success) {
    fetchList()
  }
}
</script>
```

### useForm - 表单操作

```vue
<template>
  <el-dialog v-model="visible" :title="isEditing ? '编辑用户' : '新增用户'">
    <el-form ref="formRef" :model="formModel" :rules="rules">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="formModel.username" />
      </el-form-item>
      <!-- 其他表单项 -->
    </el-form>
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from '@/composables'
import { http } from '@/utils/http'
import api from '@/utils/api'

const visible = ref(false)

const {
  formRef,
  formModel,
  loading,
  isEditing,
  rules,
  submitForm,
  setEditMode,
  setAddMode,
  resetForm,
} = useForm({
  initialData: {
    username: '',
    email: '',
  },
  rules: {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
    ],
  },
  onSubmit: async (data) => {
    if (isEditing.value) {
      return await http.post(api.yonghuupdate, data)
    } else {
      return await http.post(api.yonghusave, data)
    }
  },
  onSuccess: () => {
    visible.value = false
    resetForm()
    // 刷新列表
  },
})

function handleCancel() {
  visible.value = false
  resetForm()
}

async function handleSubmit() {
  await submitForm()
}

function openAddDialog() {
  setAddMode()
  visible.value = true
}

function openEditDialog(row: any) {
  setEditMode(row)
  visible.value = true
}
</script>
```

## 2. 使用用户 Store

```vue
<template>
  <div>
    <div v-if="userStore.isAuthenticated">
      <p>欢迎，{{ userStore.userName }}</p>
      <p>角色：{{ userStore.userRole }}</p>
      <el-button @click="handleLogout">退出登录</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 检查权限
if (userStore.hasPermission('user:create')) {
  // 有创建用户权限
}

// 检查角色
if (userStore.hasRole('admin')) {
  // 是管理员
}

// 获取用户会话信息
onMounted(async () => {
  await userStore.fetchSession()
})

function handleLogout() {
  userStore.logout()
  router.push('/login')
}
</script>
```

## 3. 使用格式化工具

```vue
<template>
  <div>
    <p>日期：{{ formatDate(record.createTime) }}</p>
    <p>金额：{{ formatCurrency(record.price) }}</p>
    <p>状态：{{ formatStatus(record.status) }}</p>
    <p>文件大小：{{ formatFileSize(record.fileSize) }}</p>
  </div>
</template>

<script setup lang="ts">
import {
  formatDate,
  formatDateTime,
  formatCurrency,
  formatNumber,
  formatPercent,
  formatFileSize,
  formatBoolean,
  formatStatus,
  truncateText,
} from '@/utils/format'

const record = {
  createTime: '2025-01-01 10:00:00',
  price: 99.99,
  status: 1,
  fileSize: 1024000,
}
</script>
```

## 4. 组合使用示例

```vue
<template>
  <div class="user-management">
    <!-- 搜索栏 -->
    <el-form :inline="true" :model="searchForm">
      <el-form-item label="关键词">
        <el-input v-model="searchForm.keyword" placeholder="搜索用户名" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作栏 -->
    <div class="actions">
      <el-button type="primary" @click="openAddDialog">新增用户</el-button>
      <el-button
        type="danger"
        :disabled="!hasSelection"
        @click="handleBatchDelete"
      >
        批量删除 ({{ selectedRows.length }})
      </el-button>
    </div>

    <!-- 表格 -->
    <el-table
      :data="records"
      v-loading="loading"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="createTime" label="创建时间">
        <template #default="{ row }">
          {{ formatDateTime(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button text type="primary" @click="openEditDialog(row)">
            编辑
          </el-button>
          <el-button text type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      :current-page="pagination.page"
      :page-size="pagination.limit"
      :total="pagination.total"
      :page-sizes="pageSizes"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />

    <!-- 表单对话框 -->
    <user-form-dialog
      v-model="formVisible"
      :form-data="formData"
      :is-editing="isEditing"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { usePagination, useTable } from '@/composables'
import { useUserStore } from '@/stores/user'
import { formatDateTime } from '@/utils/format'
import { http } from '@/utils/http'
import api from '@/utils/api'

const userStore = useUserStore()

// 搜索表单
const searchForm = reactive({
  keyword: '',
})

// 分页
const { pagination, pageSizes, handlePageChange, handleSizeChange, updateFromResponse, getPaginationParams } =
  usePagination()

// 表格
const {
  records,
  loading,
  selectedRows,
  hasSelection,
  fetchList,
  removeRow,
  batchRemove,
  handleSelectionChange,
} = useTable({
  fetchApi: async (params) => {
    const response = await http.get(api.yonghupage, {
      params: {
        ...getPaginationParams(),
        ...searchForm,
        ...params,
      },
    })
    updateFromResponse(response.data)
    return response
  },
  deleteApi: async (id) => {
    return await http.post(api.yonghudelete, { id })
  },
  deleteBatchApi: async (ids) => {
    return await http.post(api.yonghudeleteBatch, { ids })
  },
})

// 表单对话框
const formVisible = ref(false)
const formData = ref({})
const isEditing = ref(false)

// 搜索
function handleSearch() {
  pagination.page = 1
  fetchList()
}

function handleReset() {
  searchForm.keyword = ''
  handleSearch()
}

// 删除
async function handleDelete(row: any) {
  const success = await removeRow(row, '确定要删除这个用户吗？')
  if (success) {
    fetchList()
  }
}

async function handleBatchDelete() {
  const success = await batchRemove('确定要删除选中的用户吗？')
  if (success) {
    fetchList()
  }
}

// 表单
function openAddDialog() {
  isEditing.value = false
  formData.value = {}
  formVisible.value = true
}

function openEditDialog(row: any) {
  isEditing.value = true
  formData.value = { ...row }
  formVisible.value = true
}

function handleFormSuccess() {
  formVisible.value = false
  fetchList()
}

// 初始加载
fetchList()
</script>
```

## 5. 路由使用

路由配置已经模块化，新增路由只需在对应的路由文件中添加：

```typescript
// src/router/routes/business.ts
export const businessRoutes: RouteRecordRaw[] = [
  // ... 现有路由
  {
    path: '/new-module',
    name: 'New Module',
    component: () => import('@/views/modules/new-module/list.vue'),
  },
]
```

## 总结

通过使用新的 Composables、Store 和工具函数，可以显著简化代码，提高开发效率和代码质量。建议在新开发的页面中优先使用这些新的功能。

