<template>
  <div class="service-status-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">系统监控</p>
        <h2>服务状态</h2>
      </div>
      <el-button :icon="Refresh" :loading="loading" @click="refreshStatus">刷新</el-button>
    </header>

    <div class="status-grid">
      <el-card class="status-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>服务器状态</span>
            <el-tag :type="serverStatus.type" size="small">{{ serverStatus.text }}</el-tag>
          </div>
        </template>
        <div class="status-content">
          <div class="status-item">
            <span class="label">运行时间：</span>
            <span class="value">{{ serverStatus.uptime || '--' }}</span>
          </div>
          <div class="status-item">
            <span class="label">CPU 使用率：</span>
            <span class="value">{{ serverStatus.cpu || '--' }}%</span>
          </div>
          <div class="status-item">
            <span class="label">内存使用率：</span>
            <span class="value">{{ serverStatus.memory || '--' }}%</span>
          </div>
          <div class="status-item">
            <span class="label">磁盘使用率：</span>
            <span class="value">{{ serverStatus.disk || '--' }}%</span>
          </div>
        </div>
      </el-card>

      <el-card class="status-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>数据库状态</span>
            <el-tag :type="dbStatus.type" size="small">{{ dbStatus.text }}</el-tag>
          </div>
        </template>
        <div class="status-content">
          <div class="status-item">
            <span class="label">连接状态：</span>
            <span class="value">{{ dbStatus.connected ? '已连接' : '未连接' }}</span>
          </div>
          <div class="status-item">
            <span class="label">响应时间：</span>
            <span class="value">{{ dbStatus.responseTime || '--' }}ms</span>
          </div>
          <div class="status-item">
            <span class="label">活跃连接数：</span>
            <span class="value">{{ dbStatus.activeConnections || '--' }}</span>
          </div>
          <div class="status-item">
            <span class="label">数据库版本：</span>
            <span class="value">{{ dbStatus.version || '--' }}</span>
          </div>
        </div>
      </el-card>

      <el-card class="status-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>API 服务</span>
            <el-tag :type="apiStatus.type" size="small">{{ apiStatus.text }}</el-tag>
          </div>
        </template>
        <div class="status-content">
          <div class="status-item">
            <span class="label">API 可用性：</span>
            <span class="value">{{ apiStatus.availability || '--' }}%</span>
          </div>
          <div class="status-item">
            <span class="label">平均响应时间：</span>
            <span class="value">{{ apiStatus.avgResponseTime || '--' }}ms</span>
          </div>
          <div class="status-item">
            <span class="label">今日请求数：</span>
            <span class="value">{{ apiStatus.todayRequests || '--' }}</span>
          </div>
          <div class="status-item">
            <span class="label">错误率：</span>
            <span class="value">{{ apiStatus.errorRate || '--' }}%</span>
          </div>
        </div>
      </el-card>

      <el-card class="status-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>缓存服务</span>
            <el-tag :type="cacheStatus.type" size="small">{{ cacheStatus.text }}</el-tag>
          </div>
        </template>
        <div class="status-content">
          <div class="status-item">
            <span class="label">连接状态：</span>
            <span class="value">{{ cacheStatus.connected ? '已连接' : '未连接' }}</span>
          </div>
          <div class="status-item">
            <span class="label">命中率：</span>
            <span class="value">{{ cacheStatus.hitRate || '--' }}%</span>
          </div>
          <div class="status-item">
            <span class="label">缓存大小：</span>
            <span class="value">{{ cacheStatus.size || '--' }}</span>
          </div>
          <div class="status-item">
            <span class="label">键数量：</span>
            <span class="value">{{ cacheStatus.keys || '--' }}</span>
          </div>
        </div>
      </el-card>
    </div>

    <el-card v-if="recentErrors.length > 0" class="recent-errors" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>最近错误</span>
          <el-button text size="small" @click="clearErrors">清空</el-button>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item
          v-for="(error, index) in recentErrors"
          :key="index"
          :timestamp="error.timestamp"
          placement="top"
          type="danger"
        >
          <p>{{ error.message }}</p>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup lang="ts" name="ServiceStatusList">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import http from '@/utils/http'
import type { ApiResponse } from '@/types/api'

interface ServiceStatus extends Record<string, unknown> {
  server: {
    status: string
    uptime?: string
    cpu?: number
    memory?: number
    disk?: number
  }
  database: {
    connected: boolean
    responseTime?: number
    activeConnections?: number
    version?: string
  }
  api: {
    availability?: number
    avgResponseTime?: number
    todayRequests?: number
    errorRate?: number
  }
  cache: {
    connected: boolean
    hitRate?: number
    size?: string
    keys?: number
  }
  errors?: Array<{
    timestamp: string
    message: string
  }>
}

const loading = ref(false)
const serverStatus = ref({
  type: 'success' as 'success' | 'warning' | 'danger',
  text: '正常',
  uptime: '',
  cpu: 0,
  memory: 0,
  disk: 0,
})

const dbStatus = ref({
  type: 'success' as 'success' | 'warning' | 'danger',
  text: '正常',
  connected: false,
  responseTime: 0,
  activeConnections: 0,
  version: '',
})

const apiStatus = ref({
  type: 'success' as 'success' | 'warning' | 'danger',
  text: '正常',
  availability: 100,
  avgResponseTime: 0,
  todayRequests: 0,
  errorRate: 0,
})

const cacheStatus = ref({
  type: 'success' as 'success' | 'warning' | 'danger',
  text: '正常',
  connected: false,
  hitRate: 0,
  size: '',
  keys: 0,
})

const recentErrors = ref<Array<{ timestamp: string; message: string }>>([])
let refreshTimer: number | null = null

onMounted(() => {
  refreshStatus()
  // 每30秒自动刷新
  refreshTimer = window.setInterval(() => {
    refreshStatus()
  }, 30000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})

async function refreshStatus() {
  loading.value = true
  try {
    const response = await http.get<ApiResponse<ServiceStatus>>('/common/service-status')
    const data = response.data.data

    if (data) {
      // 更新服务器状态
      if (data.server) {
        serverStatus.value.uptime = data.server.uptime || '--'
        serverStatus.value.cpu = data.server.cpu || 0
        serverStatus.value.memory = data.server.memory || 0
        serverStatus.value.disk = data.server.disk || 0
        serverStatus.value.type = data.server.status === 'healthy' ? 'success' : 'warning'
        serverStatus.value.text = data.server.status === 'healthy' ? '正常' : '警告'
      }

      // 更新数据库状态
      if (data.database) {
        dbStatus.value.connected = data.database.connected
        dbStatus.value.responseTime = data.database.responseTime ?? 0
        dbStatus.value.activeConnections = data.database.activeConnections ?? 0
        dbStatus.value.version = data.database.version ?? ''
        dbStatus.value.type = data.database.connected ? 'success' : 'danger'
        dbStatus.value.text = data.database.connected ? '正常' : '异常'
      }

      // 更新API状态
      if (data.api) {
        apiStatus.value.availability = data.api.availability || 100
        apiStatus.value.avgResponseTime = data.api.avgResponseTime || 0
        apiStatus.value.todayRequests = data.api.todayRequests || 0
        apiStatus.value.errorRate = data.api.errorRate || 0
        apiStatus.value.type =
          data.api.availability && data.api.availability >= 99
            ? 'success'
            : data.api.availability && data.api.availability >= 95
              ? 'warning'
              : 'danger'
        apiStatus.value.text =
          data.api.availability && data.api.availability >= 99
            ? '正常'
            : data.api.availability && data.api.availability >= 95
              ? '警告'
              : '异常'
      }

      // 更新缓存状态
      if (data.cache) {
        cacheStatus.value.connected = data.cache.connected
        cacheStatus.value.hitRate = data.cache.hitRate ?? 0
        cacheStatus.value.size = data.cache.size ?? ''
        cacheStatus.value.keys = data.cache.keys ?? 0
        cacheStatus.value.type = data.cache.connected ? 'success' : 'danger'
        cacheStatus.value.text = data.cache.connected ? '正常' : '异常'
      }

      // 更新错误列表
      if (data.errors) {
        recentErrors.value = data.errors.slice(0, 10)
      }
    }
  } catch (error: any) {
    console.error('获取服务状态失败', error)
    ElMessage.error('获取服务状态失败：' + (error.message || '未知错误'))

    // 设置默认错误状态
    serverStatus.value.type = 'danger'
    serverStatus.value.text = '无法获取'
    dbStatus.value.type = 'danger'
    dbStatus.value.text = '无法获取'
    apiStatus.value.type = 'danger'
    apiStatus.value.text = '无法获取'
    cacheStatus.value.type = 'danger'
    cacheStatus.value.text = '无法获取'
  } finally {
    loading.value = false
  }
}

function clearErrors() {
  recentErrors.value = []
  ElMessage.success('已清空错误记录')
}
</script>

<style scoped lang="scss">
.service-status-page {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .eyebrow {
    margin: 0 0 8px;
    font-size: 0.875rem;
    color: #909399;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
  }
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.status-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }

  .status-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .label {
      color: #606266;
      font-size: 0.9rem;
    }

    .value {
      color: #303133;
      font-weight: 500;
    }
  }
}

.recent-errors {
  margin-top: 24px;
}

@media (width <= 768px) {
  .status-grid {
    grid-template-columns: 1fr;
  }
}
</style>
