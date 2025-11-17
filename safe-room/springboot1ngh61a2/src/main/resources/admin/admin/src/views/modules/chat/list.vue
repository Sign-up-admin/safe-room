<template>
  <div class="chat-page">
    <header class="module-page__header">
      <div>
        <p class="eyebrow">chat</p>
        <h2>留言反馈</h2>
      </div>
      <div class="actions">
        <el-button @click="fetchList">刷新</el-button>
      </div>
    </header>

    <div class="filter-section">
      <el-form :model="filterForm" inline>
        <el-form-item label="回复状态">
          <el-select v-model="filterForm.isreply" placeholder="请选择回复状态" clearable style="width: 150px">
            <el-option label="全部" :value="null" />
            <el-option label="未回复" :value="0" />
            <el-option label="已回复" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="留言内容">
          <el-input v-model="filterForm.ask" placeholder="请输入留言内容关键词" clearable style="width: 200px" />
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
      <el-table-column prop="userid" label="用户ID" width="100" />
      <el-table-column label="用户信息" min-width="150">
        <template #default="{ row }">
          <div v-if="row.yonghuEntity">
            <div>{{ row.yonghuEntity.yonghuming || '未知用户' }}</div>
            <el-text type="info" size="small">{{ row.yonghuEntity.shouji || '' }}</el-text>
          </div>
          <span v-else style="color: #a0a4b3">未关联用户</span>
        </template>
      </el-table-column>
      <el-table-column prop="ask" label="留言内容" min-width="250" show-overflow-tooltip />
      <el-table-column prop="reply" label="回复内容" min-width="250" show-overflow-tooltip>
        <template #default="{ row }">
          <span v-if="row.reply">{{ row.reply }}</span>
          <el-text v-else type="info" size="small">暂无回复</el-text>
        </template>
      </el-table-column>
      <el-table-column prop="isreply" label="回复状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.isreply === 1 ? 'success' : 'danger'">
            {{ row.isreply === 1 ? '已回复' : '未回复' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="addtime" label="留言时间" min-width="160" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button v-if="permissions.view" text type="primary" size="small" @click="viewRow(row)"> 查看 </el-button>
          <el-button v-if="permissions.update" text type="primary" size="small" @click="openReplyForm(row)">
            {{ row.isreply === 1 ? '修改回复' : '回复' }}
          </el-button>
          <el-button v-if="permissions.remove" text type="danger" size="small" @click="removeRow(row)">
            删除
          </el-button>
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

    <el-dialog v-model="detailVisible" title="留言详情" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="用户ID">{{ detailRecord?.userid }}</el-descriptions-item>
        <el-descriptions-item label="用户信息">
          <div v-if="detailRecord?.yonghuEntity">
            <div>用户名：{{ detailRecord.yonghuEntity.yonghuming || '未知' }}</div>
            <div>手机号：{{ detailRecord.yonghuEntity.shouji || '未知' }}</div>
            <div>邮箱：{{ detailRecord.yonghuEntity.youxiang || '未知' }}</div>
          </div>
          <span v-else>未关联用户</span>
        </el-descriptions-item>
        <el-descriptions-item label="留言内容">
          <div style="max-height: 200px; overflow-y: auto; white-space: pre-wrap">
            {{ detailRecord?.ask }}
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="回复内容">
          <div v-if="detailRecord?.reply" style="max-height: 200px; overflow-y: auto; white-space: pre-wrap">
            {{ detailRecord.reply }}
          </div>
          <el-text v-else type="info">暂无回复</el-text>
        </el-descriptions-item>
        <el-descriptions-item label="回复状态">
          <el-tag :type="detailRecord?.isreply === 1 ? 'success' : 'danger'">
            {{ detailRecord?.isreply === 1 ? '已回复' : '未回复' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="留言时间">{{ detailRecord?.addtime }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button
          v-if="permissions.update && detailRecord?.isreply !== 1"
          type="primary"
          @click="openReplyForm(detailRecord)"
        >
          回复
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="replyVisible" :title="isEditingReply ? '修改回复' : '回复留言'" width="600px">
      <el-form ref="replyFormRef" label-width="100px" :model="replyForm" :rules="replyRules">
        <el-form-item label="留言内容">
          <el-input v-model="replyForm.ask" type="textarea" :rows="4" readonly style="background-color: #f5f5f5" />
        </el-form-item>
        <el-form-item label="回复内容" prop="reply">
          <el-input
            v-model="replyForm.reply"
            type="textarea"
            :rows="6"
            placeholder="请输入回复内容"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeReplyForm">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitReply">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="ChatList">
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import http from '@/utils/http'
import { isAuth } from '@/utils/utils'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

interface ListResponse<T = any> {
  total: number
  list: T[]
}

const records = ref<Record<string, any>[]>([])
const loading = ref(false)
const detailVisible = ref(false)
const replyVisible = ref(false)
const submitting = ref(false)
const listError = ref('')
const isEditingReply = ref(false)
const detailRecord = ref<Record<string, any> | null>(null)
const replyFormRef = ref()

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
})

const filterForm = reactive({
  isreply: null as number | null,
  ask: '',
})

const replyForm = reactive({
  id: null as number | null,
  userid: null as number | null,
  ask: '',
  reply: '',
  isreply: 0,
})

const replyRules = {
  reply: [{ required: true, message: '请输入回复内容', trigger: 'blur' }],
}

const permissions = computed(() => ({
  create: isAuth('chat', 'Add'),
  update: isAuth('chat', 'Edit'),
  remove: isAuth('chat', 'Delete'),
  view: isAuth('chat', 'View'),
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
      sort: 'addtime',
      order: 'desc',
    }

    if (filterForm.isreply !== null) {
      params.isreply = filterForm.isreply
    }
    if (filterForm.ask) {
      params.ask = filterForm.ask
    }

    const response = await http.get<{ code: number; data: ListResponse }>(`/${API_ENDPOINTS.CHAT.PAGE}`, { params })
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
  filterForm.isreply = null
  filterForm.ask = ''
  pagination.page = 1
  fetchList()
}

const viewRow = async (row: Record<string, any>) => {
  try {
    const response = await http.get(`/${API_ENDPOINTS.CHAT.INFO(row['id'])}`)
    detailRecord.value = response.data.data || row
    detailVisible.value = true
  } catch (error: any) {
    detailRecord.value = row
    detailVisible.value = true
  }
}

const openReplyForm = (row: Record<string, any> | null) => {
  if (!row) return
  isEditingReply.value = row['isreply'] === 1
  Object.assign(replyForm, {
    id: row['id'],
    userid: row['userid'],
    ask: row['ask'] || '',
    reply: row['reply'] || '',
    isreply: row['isreply'] || 0,
  })
  replyVisible.value = true
}

const closeReplyForm = () => {
  replyVisible.value = false
  replyFormRef.value?.resetFields()
  Object.assign(replyForm, {
    id: null,
    userid: null,
    ask: '',
    reply: '',
    isreply: 0,
  })
}

const submitReply = async () => {
  if (!replyFormRef.value) return
  await replyFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    submitting.value = true
    try {
      const data = {
        id: replyForm.id,
        userid: replyForm.userid,
        reply: replyForm.reply,
        isreply: 1, // 设置已回复
      }
      await http.post(API_ENDPOINTS.CHAT.UPDATE, data)
      ElMessage.success('回复成功')
      closeReplyForm()
      fetchList()
    } catch (error: any) {
      ElMessage.error(error.message || '回复失败')
    } finally {
      submitting.value = false
    }
  })
}

const removeRow = async (row: Record<string, any>) => {
  try {
    await ElMessageBox.confirm('确定要删除该留言吗？', '提示', {
      type: 'warning',
    })
    await http.post(API_ENDPOINTS.CHAT.DELETE, { ids: row['id'] })
    ElMessage.success('删除成功')
    fetchList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/tokens' as *;

.chat-page {
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
</style>
