<template>
  <div class="users-page">
    <header class="module-page__header">
      <div>
        <p class="eyebrow">users</p>
        <h2>管理员账号管理</h2>
      </div>
      <div class="actions">
        <el-button v-if="permissions.create" type="primary" @click="openForm">新增</el-button>
        <el-button @click="fetchList">刷新</el-button>
      </div>
    </header>

    <!-- 权限检查提示 -->
    <div v-if="currentUserRole !== 'Administrator'" class="permission-denied">
      <el-result
        icon="lock"
        title="权限不足"
        sub-title="只有超级管理员可以管理其他管理员账号"
      >
        <template #extra>
          <el-button type="primary" @click="$router.go(-1)">返回上一页</el-button>
        </template>
      </el-result>
    </div>

    <div v-else-if="listError" class="table-error">
      <el-result icon="warning" title="列表加载失败" :sub-title="listError">
        <template #extra>
          <el-button type="primary" @click="fetchList">重试</el-button>
        </template>
      </el-result>
    </div>

    <el-table v-else-if="currentUserRole === 'Administrator'" v-loading="loading" :data="records" border stripe>
      <el-table-column type="index" label="#" width="60" />
      <el-table-column prop="username" label="用户名" min-width="140" />
      <el-table-column prop="role" label="角色" min-width="120">
        <template #default="{ row }">
          <el-tag :type="getRoleType(row.role)">{{ row.role || '未设置' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 0 ? 'success' : 'danger'">
            {{ row.status === 0 ? '正常' : '锁定' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="image" label="头像" width="80">
        <template #default="{ row }">
          <el-avatar v-if="row.image" :src="row.image" :size="40" />
          <el-avatar v-else :size="40">
            <el-icon><User /></el-icon>
          </el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="addtime" label="创建时间" min-width="160" />
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button v-if="permissions.view" text type="primary" size="small" @click="viewRow(row)"> 查看 </el-button>
          <el-button v-if="permissions.update && !isCurrentUser(row)" text size="small" @click="openForm(row)">
            编辑
          </el-button>
          <el-button
            v-if="permissions.update && !isCurrentUser(row)"
            text
            type="warning"
            size="small"
            @click="handleResetPassword(row)"
          >
            重置密码
          </el-button>
          <el-button
            v-if="permissions.update && !isCurrentUser(row)"
            text
            :type="row.status === 0 ? 'warning' : 'success'"
            size="small"
            @click="handleToggleStatus(row)"
          >
            {{ row.status === 0 ? '锁定' : '解锁' }}
          </el-button>
          <el-button
            v-if="permissions.remove && !isCurrentUser(row)"
            text
            type="danger"
            size="small"
            @click="removeRow(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="暂无数据">
          <el-button v-if="permissions.create" type="primary" @click="openForm">去新增</el-button>
        </el-empty>
      </template>
    </el-table>

    <div v-if="currentUserRole === 'Administrator'" class="pagination">
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

    <el-dialog v-model="detailVisible" title="管理员账号详情" width="520px">
      <pre class="json-view">{{ formattedDetail }}</pre>
    </el-dialog>

    <el-dialog v-model="formVisible" :title="isEditing ? '编辑管理员账号' : '新增管理员账号'" width="520px">
      <el-form ref="formRef" label-width="120px" :model="formModel" :rules="formRules">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="formModel.username" :disabled="isEditing" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item v-if="!isEditing" label="密码" prop="password">
          <el-input v-model="formModel.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="formModel.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="超级管理员" value="Administrator" />
            <el-option label="管理员" value="管理员" />
            <el-option label="客服" value="客服" />
            <el-option label="教练" value="教练" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formModel.status">
            <el-radio :label="0">正常</el-radio>
            <el-radio :label="1">锁定</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="头像" prop="image">
          <el-input v-model="formModel.image" placeholder="头像URL" />
          <div v-if="formModel.image" class="image-preview">
            <el-avatar :src="formModel.image" :size="60" />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeForm">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="UsersList">
import { ElMessage, ElMessageBox } from 'element-plus'
import { User } from '@element-plus/icons-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import http from '@/utils/http'
import { isAuth } from '@/utils/utils'
import storage from '@/utils/storage'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

interface ListResponse<T = Record<string, unknown>> {
  total: number
  list: T[]
}

const records = ref<Record<string, unknown>[]>([])
const loading = ref(false)
const formVisible = ref(false)
const detailVisible = ref(false)
const submitting = ref(false)
const listError = ref('')
const isEditing = ref(false)
const detailRecord = ref<Record<string, any> | null>(null)
const formRef = ref()
const currentUserId = ref<number | null>(null)

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
})

const formModel = reactive<Record<string, any>>({
  username: '',
  password: '',
  role: '管理员',
  status: 0,
  image: '',
})

const formRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

const currentUserRole = computed(() => storage.get('role') || '')

const permissions = computed(() => ({
  create: isAuth('users', 'Add') && currentUserRole.value === 'Administrator',
  update: isAuth('users', 'Edit') && currentUserRole.value === 'Administrator',
  remove: isAuth('users', 'Delete') && currentUserRole.value === 'Administrator',
  view: isAuth('users', 'View'),
}))

const formattedDetail = computed(() => (detailRecord.value ? JSON.stringify(detailRecord.value, null, 2) : '暂无数据'))

// 获取当前登录用户ID
onMounted(() => {
  const sessionInfo = storage.get('sessionTable')
  if (sessionInfo === 'users') {
    const userInfo = storage.get('user')
    if (userInfo) {
      const user = typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo
      if (user && user.id) {
        currentUserId.value = user.id
      }
    }
  }
  fetchList()
})

const fetchList = async () => {
  loading.value = true
  listError.value = ''
  try {
    const params: any = {
      page: pagination.page,
      limit: pagination.limit,
      sort: 'id',
      order: 'desc',
    }
    const response = await http.get<ListResponse>(API_ENDPOINTS.USERS.LIST, { params })
    records.value = response.data.list || []
    pagination.total = response.data.total || 0
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

const viewRow = (row: Record<string, any>) => {
  detailRecord.value = row
  detailVisible.value = true
}

const openForm = (row?: Record<string, any>) => {
  isEditing.value = !!row
  if (row) {
    Object.assign(formModel, {
      ...row,
      password: '', // 编辑时不显示密码
    })
  } else {
    Object.assign(formModel, {
      username: '',
      password: '',
      role: '管理员',
      status: 0,
      image: '',
    })
  }
  formVisible.value = true
}

const closeForm = () => {
  formVisible.value = false
  formRef.value?.resetFields()
  Object.assign(formModel, {
    username: '',
    password: '',
    role: '管理员',
    status: 0,
    image: '',
  })
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    submitting.value = true
    try {
      const data = { ...formModel }
      if (isEditing.value && !data.password) {
        delete data.password // 编辑时如果没有输入密码，则不更新密码
      }
      if (isEditing.value) {
        await http.post(API_ENDPOINTS.USERS.UPDATE, data)
        ElMessage.success('更新成功')
      } else {
        await http.post(API_ENDPOINTS.USERS.SAVE, data)
        ElMessage.success('新增成功')
      }
      closeForm()
      fetchList()
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    } finally {
      submitting.value = false
    }
  })
}

const removeRow = async (row: Record<string, any>) => {
  if (isCurrentUser(row)) {
    ElMessage.warning('不能删除当前登录账号')
    return
  }
  try {
    await ElMessageBox.confirm('确定要删除该管理员账号吗？', '提示', {
      type: 'warning',
    })
    await http.post(API_ENDPOINTS.USERS.DELETE, { ids: row.id })
    ElMessage.success('删除成功')
    fetchList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const handleResetPassword = async (row: Record<string, any>) => {
  if (isCurrentUser(row)) {
    ElMessage.warning('不能重置当前登录账号的密码')
    return
  }
  try {
    await ElMessageBox.confirm('确定要重置该账号的密码为默认密码（123456）吗？', '提示', {
      type: 'warning',
    })
    await http.post(API_ENDPOINTS.USERS.RESET_PASS, { id: row.id })
    ElMessage.success('密码重置成功，默认密码为：123456')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '重置失败')
    }
  }
}

const handleToggleStatus = async (row: Record<string, any>) => {
  if (isCurrentUser(row)) {
    ElMessage.warning('不能锁定当前登录账号')
    return
  }
  try {
    const action = row.status === 0 ? '锁定' : '解锁'
    await ElMessageBox.confirm(`确定要${action}该账号吗？`, '提示', {
      type: 'warning',
    })
    const newStatus = row.status === 0 ? 1 : 0
    await http.post(API_ENDPOINTS.USERS.UPDATE, {
      ...row,
      status: newStatus,
    })
    ElMessage.success(`${action}成功`)
    fetchList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

const isCurrentUser = (row: Record<string, any>): boolean => currentUserId.value !== null && row.id === currentUserId.value

const getRoleType = (role: string): string => {
  const roleMap: Record<string, string> = {
    Administrator: 'danger',
    管理员: 'primary',
    客服: 'success',
    教练: 'warning',
  }
  return roleMap[role] || 'info'
}
</script>

<style scoped lang="scss">
@use '@/styles/tokens' as *;

.users-page {
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
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.6;
  max-height: 400px;
}

.image-preview {
  margin-top: 8px;
}
</style>
