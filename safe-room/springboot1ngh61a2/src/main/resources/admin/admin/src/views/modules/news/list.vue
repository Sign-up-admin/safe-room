<template>
  <div class="news-page">
    <header class="module-page__header">
      <div>
        <p class="eyebrow">news</p>
        <h2>公告管理</h2>
      </div>
      <div class="actions">
        <el-button v-if="permissions.create" type="primary" @click="openForm">新增</el-button>
        <el-button @click="fetchList">刷新</el-button>
      </div>
    </header>

    <div class="filter-section">
      <el-form :model="filterForm" inline>
        <el-form-item label="公告分类">
          <el-select v-model="filterForm.newstype" placeholder="请选择分类" clearable style="width: 200px">
            <el-option label="全部" :value="null" />
            <el-option v-for="type in newsTypes" :key="type.id" :label="type.leixing" :value="type.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="filterForm.biaoti" placeholder="请输入标题关键词" clearable style="width: 200px" />
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

    <el-table v-else v-loading="loading" :data="records" border stripe row-key="id">
      <el-table-column type="index" label="#" width="60" />
      <el-table-column label="封面" width="100">
        <template #default="{ row }">
          <el-image
            v-if="row.tupian"
            :src="row.tupian"
            :preview-src-list="[row.tupian]"
            fit="cover"
            style="width: 80px; height: 60px; border-radius: 4px"
            lazy
          />
          <span v-else style="color: #a0a4b3">暂无封面</span>
        </template>
      </el-table-column>
      <el-table-column prop="biaoti" label="标题" min-width="200" show-overflow-tooltip />
      <el-table-column label="分类" width="120">
        <template #default="{ row }">
          <el-tag v-if="row.newstypeEntity" type="info">
            {{ row.newstypeEntity.leixing || '未分类' }}
          </el-tag>
          <span v-else style="color: #a0a4b3">未分类</span>
        </template>
      </el-table-column>
      <el-table-column prop="clicktime" label="点击量" width="100" />
      <el-table-column prop="addtime" label="发布时间" min-width="160" />
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

    <el-dialog v-model="detailVisible" title="公告详情" width="800px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="标题">{{ detailRecord?.biaoti }}</el-descriptions-item>
        <el-descriptions-item label="分类">
          <el-tag v-if="detailRecord?.newstypeEntity" type="info">
            {{ detailRecord.newstypeEntity.leixing || '未分类' }}
          </el-tag>
          <span v-else>未分类</span>
        </el-descriptions-item>
        <el-descriptions-item label="封面">
          <el-image
            v-if="detailRecord?.tupian"
            :src="detailRecord.tupian"
            style="max-width: 400px; max-height: 300px"
            fit="contain"
          />
          <span v-else>暂无封面</span>
        </el-descriptions-item>
        <el-descriptions-item label="内容">
          <div class="content-preview">
            <SafeHtml :html="detailRecord?.neirong || '暂无内容'" />
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="点击量">{{ detailRecord?.clicktime || 0 }}</el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ detailRecord?.addtime }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog
      v-model="formVisible"
      :title="isEditing ? '编辑公告' : '新增公告'"
      width="900px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" label-width="100px" :model="formModel" :rules="formRules">
        <el-form-item label="标题" prop="biaoti">
          <el-input v-model="formModel.biaoti" placeholder="请输入公告标题" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="分类" prop="newstype">
          <el-select v-model="formModel.newstype" placeholder="请选择公告分类" style="width: 100%" filterable>
            <el-option v-for="type in newsTypes" :key="type.id" :label="type.leixing" :value="type.id" />
          </el-select>
          <el-button text type="primary" size="small" style="margin-top: 8px" @click="showCreateTypeDialog = true">
            + 快速创建分类
          </el-button>
        </el-form-item>
        <el-form-item label="封面图片" prop="tupian">
          <ImageUpload
            v-model="formModel.tupian"
            :limit="1"
            :multiple="false"
            list-type="picture-card"
            tip="支持jpg/png/webp格式，大小不超过5MB"
          />
          <div v-if="formModel.tupian" class="image-preview-tip">
            <el-text type="info" size="small">当前封面：</el-text>
            <el-image
              :src="formModel.tupian"
              style="width: 200px; height: 120px; margin-top: 8px; border-radius: 4px"
              fit="cover"
            />
          </div>
        </el-form-item>
        <el-form-item label="内容" prop="neirong">
          <RichTextEditor
            v-model="formModel.neirong"
            placeholder="请输入公告内容..."
            min-height="300px"
            max-height="600px"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeForm">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>

    <!-- 快速创建分类对话框 -->
    <el-dialog v-model="showCreateTypeDialog" title="快速创建分类" width="400px">
      <el-form ref="typeFormRef" :model="newTypeForm" :rules="typeFormRules">
        <el-form-item label="分类名称" prop="leixing">
          <el-input v-model="newTypeForm.leixing" placeholder="请输入分类名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateTypeDialog = false">取消</el-button>
        <el-button type="primary" @click="createType">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import http from '@/utils/http'
import { isAuth } from '@/utils/utils'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import ImageUpload from '@/components/common/ImageUpload.vue'
import RichTextEditor from '@/components/common/RichTextEditor.vue'
import SafeHtml from '@/components/common/SafeHtml.vue'

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
const newsTypes = ref<Record<string, any>[]>([])
const showCreateTypeDialog = ref(false)
const typeFormRef = ref()
const newTypeForm = reactive({
  leixing: '',
})

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
})

const filterForm = reactive({
  newstype: null as number | null,
  biaoti: '',
})

const formModel = reactive<Record<string, any>>({
  biaoti: '',
  neirong: '',
  tupian: '',
  newstype: null as number | null,
})

const formRules = {
  biaoti: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  neirong: [{ required: true, message: '请输入内容', trigger: 'blur' }],
  newstype: [{ required: true, message: '请选择分类', trigger: 'change' }],
}

const typeFormRules = {
  leixing: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
}

const permissions = computed(() => ({
  create: isAuth('news', 'Add'),
  update: isAuth('news', 'Edit'),
  remove: isAuth('news', 'Delete'),
  view: isAuth('news', 'View'),
}))

onMounted(() => {
  fetchNewsTypes()
  fetchList()
})

// 获取公告分类列表
const fetchNewsTypes = async () => {
  try {
    const response = await http.get(API_ENDPOINTS.NEWSTYPE.LIST)
    if (response.data.code === 0) {
      newsTypes.value = response.data.data || []
    }
  } catch (error: any) {
    console.error('获取分类列表失败:', error)
  }
}

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

    if (filterForm.newstype !== null) {
      params.newstype = filterForm.newstype
    }
    if (filterForm.biaoti) {
      params.biaoti = filterForm.biaoti
    }

    const response = await http.get<{ code: number; data: ListResponse }>(`/${API_ENDPOINTS.NEWS.PAGE}`, { params })
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
  filterForm.newstype = null
  filterForm.biaoti = ''
  pagination.page = 1
  fetchList()
}

const viewRow = async (row: Record<string, any>) => {
  try {
    const response = await http.get(`/${API_ENDPOINTS.NEWS.INFO(row['id'])}`)
    detailRecord.value = response.data.data || row
    detailVisible.value = true
  } catch (error: any) {
    detailRecord.value = row
    detailVisible.value = true
  }
}

const openForm = (row?: Record<string, any>) => {
  isEditing.value = !!row
  if (row) {
    Object.assign(formModel, {
      id: row.id,
      biaoti: row.biaoti || '',
      neirong: row.neirong || '',
      tupian: row.tupian || '',
      newstype: row.newstype || null,
    })
  } else {
    Object.assign(formModel, {
      biaoti: '',
      neirong: '',
      tupian: '',
      newstype: null,
    })
  }
  formVisible.value = true
}

const closeForm = () => {
  formVisible.value = false
  formRef.value?.resetFields()
  Object.assign(formModel, {
    biaoti: '',
    neirong: '',
    tupian: '',
    newstype: null,
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
        await http.post(API_ENDPOINTS.NEWS.UPDATE, data)
        ElMessage.success('更新成功')
      } else {
        await http.post(API_ENDPOINTS.NEWS.SAVE, data)
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
    await ElMessageBox.confirm('确定要删除该公告吗？', '提示', {
      type: 'warning',
    })
    await http.post(API_ENDPOINTS.NEWS.DELETE, { ids: row.id })
    ElMessage.success('删除成功')
    fetchList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 快速创建分类
const createType = async () => {
  if (!typeFormRef.value) return
  await typeFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    try {
      await http.post(API_ENDPOINTS.NEWSTYPE.SAVE, { leixing: newTypeForm.leixing })
      ElMessage.success('分类创建成功')
      showCreateTypeDialog.value = false
      newTypeForm.leixing = ''
      await fetchNewsTypes()
      // 自动选中新创建的分类
      const newType = newsTypes.value.find(t => t.leixing === newTypeForm.leixing)
      if (newType) {
        formModel.newstype = newType.id
      }
    } catch (error: any) {
      ElMessage.error(error.message || '创建失败')
    }
  })
}
</script>

<style scoped lang="scss">
@use '@/styles/tokens' as *;

.news-page {
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

.content-preview {
  max-height: 400px;
  overflow-y: auto;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
  line-height: 1.6;

  :deep(img) {
    max-width: 100%;
    height: auto;
  }
}

.image-preview-tip {
  margin-top: 8px;
}
</style>
