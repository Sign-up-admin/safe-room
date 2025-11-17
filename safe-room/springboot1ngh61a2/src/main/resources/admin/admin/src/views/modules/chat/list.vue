<template>
  <ModuleCrudPage
    ref="crudRef"
    :config="crudConfig"
    @create="handleCreate"
    @update="handleUpdate"
    @delete="handleDelete"
    @view="handleView"
    @export="handleExport"
    @import="handleImport"
  >
    <!-- 自定义过滤区域 -->
    <template #filter-extra>
      <ChatFilter
        v-model="chatFilterForm"
        @search="handleChatSearch"
        @reset="handleChatReset"
      />
    </template>

    <!-- 自定义表格列 -->
    <template #table-column-yonghuEntity="{ row }">
      <div v-if="row.yonghuEntity">
        <div>{{ row.yonghuEntity.yonghuming || '未知用户' }}</div>
        <el-text type="info" size="small">{{ row.yonghuEntity.shouji || '' }}</el-text>
      </div>
      <span v-else style="color: #a0a4b3">未关联用户</span>
    </template>

    <template #table-column-reply="{ row }">
      <span v-if="row.reply">{{ row.reply }}</span>
      <el-text v-else type="info" size="small">暂无回复</el-text>
    </template>

    <template #table-column-isreply="{ row }">
      <el-tag :type="row.isreply === 1 ? 'success' : 'danger'">
        {{ row.isreply === 1 ? '已回复' : '未回复' }}
      </el-tag>
    </template>

    <!-- 自定义操作列 -->
    <template #table-actions="{ row }">
      <el-button v-if="crud.permissions.view" text type="primary" size="small" @click="crud.viewDetail(row)"> 查看 </el-button>
      <el-button v-if="crud.permissions.update" text type="primary" size="small" @click="openReplyForm(row)">
        {{ row.isreply === 1 ? '修改回复' : '回复' }}
      </el-button>
      <el-button v-if="crud.permissions.remove" text type="danger" size="small" @click="crud.removeRow(row)">
        删除
      </el-button>
    </template>

    <!-- 自定义详情内容 -->
    <template #detail-content="{ record }">
      <ChatDetailDialog
        v-model:visible="detailVisible"
        :record="record"
        :permissions="crud.permissions"
        @reply="openReplyForm"
      />
    </template>
  </ModuleCrudPage>

  <!-- 回复表单对话框 -->
  <ChatReplyForm
    v-model:visible="replyVisible"
    :record="replyRecord"
    :submitting="submitting"
    @submit="submitReply"
  />
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import http from '@/utils/http'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'
import ModuleCrudPage from '@/components/common/ModuleCrudPage.vue'
import ChatFilter from '@/components/modules/chat/ChatFilter.vue'
import ChatDetailDialog from '@/components/modules/chat/ChatDetailDialog.vue'
import ChatReplyForm from '@/components/modules/chat/ChatReplyForm.vue'
import type { CrudPageConfig } from '@/types/crud'

// 状态管理
const crudRef = ref<InstanceType<typeof ModuleCrudPage> | null>(null)
const detailVisible = ref(false)
const replyVisible = ref(false)
const submitting = ref(false)
const replyRecord = ref<Record<string, any> | null>(null)

// Chat过滤表单
let chatFilterForm = reactive({
  isreply: null as number | null,
  ask: '',
})

// CRUD配置
const crudConfig: CrudPageConfig = {
  moduleKey: 'chat',
  title: '留言反馈',
  apiEndpoints: {
    page: API_ENDPOINTS.CHAT.PAGE,
    info: (id) => API_ENDPOINTS.CHAT.INFO(id),
    update: API_ENDPOINTS.CHAT.UPDATE,
    delete: API_ENDPOINTS.CHAT.DELETE,
  },
  columns: [
    {
      prop: 'userid',
      label: '用户ID',
      width: 100,
    },
    {
      prop: 'yonghuEntity',
      label: '用户信息',
      minWidth: 150,
      slot: 'yonghuEntity', // 使用自定义插槽
    },
    {
      prop: 'ask',
      label: '留言内容',
      minWidth: 250,
      showOverflowTooltip: true,
    },
    {
      prop: 'reply',
      label: '回复内容',
      minWidth: 250,
      showOverflowTooltip: true,
      slot: 'reply', // 使用自定义插槽
    },
    {
      prop: 'isreply',
      label: '回复状态',
      width: 100,
      slot: 'isreply', // 使用自定义插槽
    },
    {
      prop: 'addtime',
      label: '留言时间',
      minWidth: 160,
    },
  ],
  searchFields: [], // 使用自定义过滤组件
  formFields: [], // 没有标准的表单，使用自定义回复功能
  defaultSort: { prop: 'addtime', order: 'desc' },
  enableSelection: false,
  enablePagination: true,
  enableSearch: false, // 使用自定义过滤
  enableCreate: false, // 留言不能创建
  enableUpdate: true, // 用于回复功能
  enableDelete: true,
  enableDetail: true,
  enableExport: true,
  enableImport: false,
  formDialogWidth: '800px',
  detailDialogWidth: '800px',
}

// 事件处理函数
const handleCreate = () => {
  // 留言不能创建
}

const handleUpdate = (record: any) => {
  // 更新逻辑在回复中处理
}

const handleDelete = (record: any) => {
  // 删除逻辑由组件内部处理
}

const handleView = (record: any) => {
  // 查看逻辑由组件内部处理
}

const handleExport = () => {
  // 导出前的逻辑
}

const handleImport = (file: File) => {
  // 导入逻辑
}

// Chat过滤处理
const handleChatSearch = () => {
  // 更新CRUD的搜索参数
  if (crudRef.value?.crud) {
    crudRef.value.crud.searchForm.isreply = chatFilterForm.isreply
    crudRef.value.crud.searchForm.ask = chatFilterForm.ask
    crudRef.value.crud.handleSearch()
  }
}

const handleChatReset = () => {
  chatFilterForm.isreply = null
  chatFilterForm.ask = ''
  handleChatSearch()
}

// 回复功能
const openReplyForm = (row: Record<string, any> | null) => {
  if (!row) return
  replyRecord.value = row
  replyVisible.value = true
}

const submitReply = async (data: { id: number, userid: number, reply: string }) => {
  submitting.value = true
  try {
    const submitData = {
      ...data,
      isreply: 1, // 设置已回复
    }
    await http.post(API_ENDPOINTS.CHAT.UPDATE, submitData)
    ElMessage.success('回复成功')
    replyVisible.value = false
    replyRecord.value = null
    // 刷新列表
    crudRef.value?.refresh()
  } catch (error: any) {
    ElMessage.error(error.message || '回复失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
// Chat页面没有特殊的样式，所有样式都由ModuleCrudPage提供
</style>
