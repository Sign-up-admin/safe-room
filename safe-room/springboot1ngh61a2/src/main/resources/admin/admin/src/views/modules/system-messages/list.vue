<template>
  <div class="system-messages-page">
    <header class="module-page__header">
      <div>
        <p class="eyebrow">system messages</p>
        <h2>系统消息管理</h2>
      </div>
      <div class="actions">
        <el-button type="primary" :disabled="!hasUnreadMessages" @click="markAllAsRead"> 全部标记已读 </el-button>
        <el-button @click="fetchList">刷新</el-button>
      </div>
    </header>

    <!-- 筛选区域 -->
    <div class="filters-section">
      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item label="消息类型">
          <el-select v-model="filters.type" placeholder="全部类型" clearable style="width: 120px">
            <el-option v-for="type in messageTypes" :key="type.value" :label="type.label" :value="type.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.isRead" placeholder="全部状态" clearable style="width: 100px">
            <el-option label="未读" :value="false" />
            <el-option label="已读" :value="true" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索消息内容"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleResetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <el-row :gutter="16">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.total }}</div>
              <div class="stat-label">总消息数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number unread">{{ stats.unread }}</div>
              <div class="stat-label">未读消息</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.today }}</div>
              <div class="stat-label">今日消息</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ stats.system }}</div>
              <div class="stat-label">系统公告</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div v-if="listError" class="table-error">
      <el-result icon="warning" title="列表加载失败" :sub-title="listError">
        <template #extra>
          <el-button type="primary" @click="fetchList">重试</el-button>
        </template>
      </el-result>
    </div>

    <el-table v-else v-loading="loading" :data="records" border stripe row-class-name="message-row">
      <el-table-column type="index" label="#" width="60" />
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-badge v-if="!row.isRead" is-dot class="status-badge">
            <el-tag type="danger" size="small">未读</el-tag>
          </el-badge>
          <el-tag v-else type="info" size="small">已读</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="消息类型" width="120">
        <template #default="{ row }">
          <el-tag :type="getMessageTypeTag(row.type)">
            {{ getMessageTypeLabel(row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" min-width="200">
        <template #default="{ row }">
          <div class="message-title" :class="{ unread: !row.isRead }">
            <span>{{ row.title }}</span>
            <el-badge v-if="!row.isRead" is-dot />
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="内容预览" min-width="300">
        <template #default="{ row }">
          <div class="message-preview">
            <SafeHtml :html="truncateContent(row.content)" />
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="sender" label="发送者" width="120" />
      <el-table-column prop="createTime" label="发送时间" min-width="160" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button text type="primary" size="small" @click="viewMessage(row)"> 查看详情 </el-button>
          <el-button v-if="!row.isRead" text type="success" size="small" @click="markAsRead(row)"> 标记已读 </el-button>
          <el-button text type="danger" size="small" @click="deleteMessage(row)"> 删除 </el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="暂无消息">
          <el-button type="primary" @click="fetchList">刷新</el-button>
        </el-empty>
      </template>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-section">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 消息详情对话框 -->
    <el-dialog
      v-model="messageDialogVisible"
      :title="currentMessage?.title || '消息详情'"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="currentMessage" class="message-detail">
        <div class="message-meta">
          <el-row :gutter="16">
            <el-col :span="12">
              <div class="meta-item">
                <label>发送者：</label>
                <span>{{ currentMessage.sender }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="meta-item">
                <label>发送时间：</label>
                <span>{{ currentMessage.createTime }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="meta-item">
                <label>消息类型：</label>
                <el-tag :type="getMessageTypeTag(currentMessage.type)">
                  {{ getMessageTypeLabel(currentMessage.type) }}
                </el-tag>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="meta-item">
                <label>状态：</label>
                <el-tag :type="currentMessage.isRead ? 'info' : 'danger'">
                  {{ currentMessage.isRead ? '已读' : '未读' }}
                </el-tag>
              </div>
            </el-col>
          </el-row>
        </div>
        <div class="message-content">
          <h4>消息内容：</h4>
          <div class="content-body">
            <SafeHtml :html="currentMessage.content" />
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="messageDialogVisible = false">关闭</el-button>
        <el-button v-if="!currentMessage?.isRead" type="primary" @click="markCurrentAsRead"> 标记已读 </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="SystemMessagesList">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '@/utils/http'
import SafeHtml from '@/components/common/SafeHtml.vue'

// 消息类型定义
const messageTypes = [
  { value: 'system', label: '系统公告' },
  { value: 'reminder', label: '操作提醒' },
  { value: 'alert', label: '异常告警' },
  { value: 'report', label: '数据报告' },
]

// 响应式数据
const loading = ref(false)
const listError = ref('')
const records = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const messageDialogVisible = ref(false)
const currentMessage = ref<any>(null)

// 筛选条件
const filters = reactive({
  type: '',
  isRead: null as boolean | null,
  keyword: '',
})

// 统计数据
const stats = reactive({
  total: 0,
  unread: 0,
  today: 0,
  system: 0,
})

// 计算属性
const hasUnreadMessages = computed(() => stats.unread > 0)

// 获取消息类型标签样式
function getMessageTypeTag(type: string) {
  const typeMap: Record<string, string> = {
    system: 'primary',
    reminder: 'warning',
    alert: 'danger',
    report: 'success',
  }
  return typeMap[type] || 'info'
}

// 获取消息类型标签文本
function getMessageTypeLabel(type: string) {
  const typeMap: Record<string, string> = {
    system: '系统公告',
    reminder: '操作提醒',
    alert: '异常告警',
    report: '数据报告',
  }
  return typeMap[type] || '未知类型'
}

// 截断内容预览
function truncateContent(content: string, maxLength = 100) {
  if (!content) return ''
  const text = content.replace(/<[^>]*>/g, '') // 移除HTML标签
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

// 获取消息列表
async function fetchList() {
  loading.value = true
  listError.value = ''

  try {
    const params: Record<string, any> = {
      page: currentPage.value,
      limit: pageSize.value,
      ...filters,
    }

    // 移除空值
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null) {
        delete params[key]
      }
    })

    const response = await http.get('/system-messages/page', { params })
    const data = response.data

    if (data.code === 0) {
      records.value = data.data.list || []
      total.value = data.data.total || 0
      await fetchStats()
    } else {
      throw new Error(data.msg || '获取消息列表失败')
    }
  } catch (error: any) {
    console.error('获取消息列表失败:', error)
    listError.value = error.message || '获取消息列表失败'
    ElMessage.error(listError.value)
  } finally {
    loading.value = false
  }
}

// 获取统计数据
async function fetchStats() {
  try {
    const response = await http.get('/system-messages/stats')
    const data = response.data

    if (data.code === 0) {
      Object.assign(stats, data.data)
    }
  } catch (error) {
    console.warn('获取统计数据失败:', error)
    // 不显示错误信息，因为这不是关键功能
  }
}

// 查看消息详情
function viewMessage(message: any) {
  currentMessage.value = message
  messageDialogVisible.value = true

  // 如果是未读消息，自动标记为已读
  if (!message.isRead) {
    markAsRead(message, false) // 不显示提示
  }
}

// 标记消息为已读
async function markAsRead(message: any, showMessage = true) {
  try {
    const response = await http.post(`/system-messages/${message.id}/read`)
    const data = response.data

    if (data.code === 0) {
      message.isRead = true
      stats.unread = Math.max(0, stats.unread - 1)
      if (showMessage) {
        ElMessage.success('消息已标记为已读')
      }
    } else {
      throw new Error(data.msg || '标记已读失败')
    }
  } catch (error: any) {
    console.error('标记已读失败:', error)
    ElMessage.error(error.message || '标记已读失败')
  }
}

// 标记当前消息为已读
function markCurrentAsRead() {
  if (currentMessage.value) {
    markAsRead(currentMessage.value)
  }
}

// 全部标记已读
async function markAllAsRead() {
  try {
    await ElMessageBox.confirm('确定要将所有未读消息标记为已读吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const response = await http.post('/system-messages/mark-all-read')
    const data = response.data

    if (data.code === 0) {
      // 更新所有消息状态
      records.value.forEach(message => {
        message.isRead = true
      })
      stats.unread = 0
      ElMessage.success('所有消息已标记为已读')
    } else {
      throw new Error(data.msg || '操作失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('全部标记已读失败:', error)
      ElMessage.error(error.message || '操作失败')
    }
  }
}

// 删除消息
async function deleteMessage(message: any) {
  try {
    await ElMessageBox.confirm('确定要删除这条消息吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const response = await http.post('/system-messages/delete', {
      ids: [message.id],
    })
    const data = response.data

    if (data.code === 0) {
      ElMessage.success('消息已删除')
      await fetchList()
    } else {
      throw new Error(data.msg || '删除失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除消息失败:', error)
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 搜索
function handleSearch() {
  currentPage.value = 1
  fetchList()
}

// 重置筛选
function handleResetFilters() {
  Object.assign(filters, {
    type: '',
    isRead: null,
    keyword: '',
  })
  handleSearch()
}

// 分页大小改变
function handleSizeChange(newSize: number) {
  pageSize.value = newSize
  currentPage.value = 1
  fetchList()
}

// 页码改变
function handleCurrentChange(newPage: number) {
  currentPage.value = newPage
  fetchList()
}

// 初始化
onMounted(() => {
  fetchList()
})
</script>

<style scoped lang="scss">
@use '@/styles/tokens' as *;

.system-messages-page {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.module-page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .eyebrow {
    color: #3a80ff;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #1a202c;
  }

  .actions {
    display: flex;
    gap: 12px;
  }
}

.filters-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .filter-form {
    .el-form-item {
      margin-bottom: 0;
    }
  }
}

.stats-section {
  margin-bottom: 24px;

  .stat-card {
    text-align: center;

    .stat-content {
      .stat-number {
        font-size: 24px;
        font-weight: 600;
        color: #1a202c;
        margin-bottom: 4px;

        &.unread {
          color: #f56c6c;
        }
      }

      .stat-label {
        font-size: 12px;
        color: #718096;
      }
    }
  }
}

.message-row {
  &.unread {
    background-color: #fef7f7;
  }
}

.status-badge {
  .el-tag {
    position: relative;
  }
}

.message-title {
  display: flex;
  align-items: center;
  gap: 8px;

  &.unread {
    font-weight: 600;
    color: #1a202c;
  }
}

.message-preview {
  color: #718096;
  line-height: 1.5;
}

.pagination-section {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message-detail {
  .message-meta {
    margin-bottom: 24px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 6px;

    .meta-item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;

      label {
        font-weight: 600;
        color: #374151;
        min-width: 80px;
      }

      span {
        color: #6b7280;
      }
    }
  }

  .message-content {
    h4 {
      margin: 0 0 12px;
      font-size: 16px;
      font-weight: 600;
      color: #1a202c;
    }

    .content-body {
      line-height: 1.6;
      color: #374151;
      padding: 16px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
    }
  }
}

.table-error {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
