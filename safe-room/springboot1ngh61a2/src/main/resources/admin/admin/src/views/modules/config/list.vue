<template>
  <div class="config-page">
    <header class="module-page__header">
      <div>
        <p class="eyebrow">config</p>
        <h2>轮播管理</h2>
      </div>
      <div class="actions">
        <el-button v-if="permissions.create" type="primary" @click="openForm">新增</el-button>
        <el-button @click="fetchList">刷新</el-button>
      </div>
    </header>

    <div v-if="listError" class="table-error">
      <el-result icon="warning" title="列表加载失败" :sub-title="listError">
        <template #extra>
          <el-button type="primary" @click="fetchList">重试</el-button>
        </template>
      </el-result>
    </div>

    <el-table
      v-else
      v-loading="loading"
      :data="records"
      border
      stripe
      row-key="id"
      :default-sort="{ prop: 'addtime', order: 'descending' }"
    >
      <el-table-column type="index" label="#" width="60" />
      <el-table-column label="排序" width="80">
        <template #default="{ row, $index }">
          <el-input-number
            v-model="row.sort"
            :min="0"
            :max="999"
            size="small"
            style="width: 70px"
            @change="handleSortChange(row, $index)"
          />
        </template>
      </el-table-column>
      <el-table-column label="缩略图" width="120">
        <template #default="{ row }">
          <el-image
            v-if="row.url"
            :src="row.url"
            :preview-src-list="[row.url]"
            fit="cover"
            style="width: 100px; height: 60px; border-radius: 4px"
            lazy
          />
          <span v-else style="color: #a0a4b3">暂无图片</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="标题" min-width="200" show-overflow-tooltip />
      <el-table-column prop="value" label="描述" min-width="200" show-overflow-tooltip />
      <el-table-column prop="url" label="图片URL" min-width="200" show-overflow-tooltip />
      <el-table-column prop="addtime" label="添加时间" min-width="160" />
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button v-if="permissions.view" text type="primary" size="small" @click="viewRow(row)"> 查看 </el-button>
          <el-button v-if="permissions.update" text size="small" @click="openForm(row)"> 编辑 </el-button>
          <el-button v-if="permissions.remove" text type="danger" size="small" @click="removeRow(row)">
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

    <el-dialog v-model="detailVisible" title="轮播详情" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="标题">{{ detailRecord?.name }}</el-descriptions-item>
        <el-descriptions-item label="描述">{{ detailRecord?.value }}</el-descriptions-item>
        <el-descriptions-item label="图片">
          <el-image
            v-if="detailRecord?.url"
            :src="detailRecord.url"
            style="max-width: 400px; max-height: 300px"
            fit="contain"
          />
        </el-descriptions-item>
        <el-descriptions-item label="图片URL">{{ detailRecord?.url }}</el-descriptions-item>
        <el-descriptions-item label="添加时间">{{ detailRecord?.addtime }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog v-model="formVisible" :title="isEditing ? '编辑轮播' : '新增轮播'" width="600px">
      <el-form ref="formRef" label-width="100px" :model="formModel" :rules="formRules">
        <el-form-item label="标题" prop="name">
          <el-input v-model="formModel.name" placeholder="请输入轮播标题" />
        </el-form-item>
        <el-form-item label="描述" prop="value">
          <el-input v-model="formModel.value" type="textarea" :rows="3" placeholder="请输入轮播描述" />
        </el-form-item>
        <el-form-item label="图片" prop="url">
          <ImageUpload
            v-model="formModel.url"
            :limit="1"
            :multiple="false"
            list-type="picture-card"
            tip="支持jpg/png/webp格式，大小不超过5MB"
          />
          <div v-if="formModel.url" class="image-preview-tip">
            <el-text type="info" size="small">当前图片：</el-text>
            <el-image
              :src="formModel.url"
              style="width: 200px; height: 120px; margin-top: 8px; border-radius: 4px"
              fit="cover"
            />
          </div>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="formModel.sort"
            :min="0"
            :max="999"
            placeholder="数字越大越靠前"
            style="width: 200px"
          />
          <el-text type="info" size="small" style="margin-left: 8px">数字越大越靠前</el-text>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeForm">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="ConfigList">
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import http from '@/utils/http'
import { isAuth } from '@/utils/utils'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import ImageUpload from '@/components/common/ImageUpload.vue'

interface ListResponse<T = any> {
  total: number
  list: T[]
}

const records = ref<Record<string, any>[]>([])
const loading = ref(false)
const formVisible = ref(false)
const detailVisible = ref(false)
const submitting = ref(false)
const listError = ref('')
const isEditing = ref(false)
const detailRecord = ref<Record<string, any> | null>(null)
const formRef = ref()

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
})

const formModel = reactive<Record<string, any>>({
  name: '',
  value: '',
  url: '',
  sort: 0,
})

const formRules = {
  name: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  url: [{ required: true, message: '请上传图片', trigger: 'change' }],
}

const permissions = computed(() => ({
  create: isAuth('config', 'Add'),
  update: isAuth('config', 'Edit'),
  remove: isAuth('config', 'Delete'),
  view: isAuth('config', 'View'),
}))

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
      sort: 'sort',
      order: 'desc',
    }
    const response = await http.get<{ code: number; data: ListResponse }>(`/${API_ENDPOINTS.CONFIG.LIST}`, { params })
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

const viewRow = (row: Record<string, any>) => {
  detailRecord.value = row
  detailVisible.value = true
}

const openForm = (row?: Record<string, any>) => {
  isEditing.value = !!row
  if (row) {
    Object.assign(formModel, {
      id: row.id,
      name: row.name || '',
      value: row.value || '',
      url: row.url || '',
      sort: row.sort || 0,
    })
  } else {
    Object.assign(formModel, {
      name: '',
      value: '',
      url: '',
      sort: 0,
    })
  }
  formVisible.value = true
}

const closeForm = () => {
  formVisible.value = false
  formRef.value?.resetFields()
  Object.assign(formModel, {
    name: '',
    value: '',
    url: '',
  })
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    submitting.value = true
    try {
      const data = { ...formModel }
      if (isEditing.value) {
        await http.post(API_ENDPOINTS.CONFIG.UPDATE, data)
        ElMessage.success('更新成功')
      } else {
        await http.post(API_ENDPOINTS.CONFIG.SAVE, data)
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
  try {
    await ElMessageBox.confirm('确定要删除该轮播吗？', '提示', {
      type: 'warning',
    })
    await http.post(API_ENDPOINTS.CONFIG.DELETE, { ids: row.id })
    ElMessage.success('删除成功')
    fetchList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const handleSortChange = async (row: Record<string, any>, index: number) => {
  try {
    await http.post(API_ENDPOINTS.CONFIG.UPDATE, {
      id: row.id,
      sort: row.sort,
    })
    // 重新排序列表
    records.value.sort((a, b) => (b.sort || 0) - (a.sort || 0))
    ElMessage.success('排序已更新')
  } catch (error: any) {
    ElMessage.error(error.message || '更新排序失败')
    fetchList() // 失败时重新加载列表
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/tokens' as *;

.config-page {
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

.image-preview-tip {
  margin-top: 8px;
}
</style>
