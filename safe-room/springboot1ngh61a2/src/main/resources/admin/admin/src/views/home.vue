<template>
  <div v-loading="pageLoading" class="dashboard">
    <!-- 移动端提示 -->
    <div v-if="isMobile" class="mobile-notice">
      <el-alert
        title="建议使用桌面端访问"
        description="当前页面在移动设备上可能显示不完整，建议使用桌面端浏览器获得最佳体验。"
        type="info"
        :closable="false"
        show-icon
      />
    </div>

    <header class="dashboard__hero">
      <div>
        <p class="eyebrow">GYM CONTROL CENTER</p>
        <h1>欢迎回来，{{ adminName || '管理员' }}</h1>
        <p class="subtitle">实时掌握会员、课程、预约与营收数据</p>
      </div>
      <div class="dashboard__meta">
        <el-tag type="success" size="large">当前时间：{{ currentTime }}</el-tag>
        <el-button type="primary" plain :loading="refreshing" @click="refreshAll">刷新全部</el-button>
      </div>
    </header>

    <section class="stats-grid">
      <article
        v-for="card in displayStats"
        :key="card.id"
        class="stat-card"
        :class="{
          'stat-card--disabled': !card.canView,
          'stat-card--ready': statStates[card.id]?.status === 'ready',
          'stat-card--loading': statStates[card.id]?.status === 'loading',
          'stat-card--error': statStates[card.id]?.status === 'error',
        }"
      >
        <div class="stat-card__icon">
          <component :is="card.icon" />
        </div>
        <div v-if="card.canView" class="stat-card__content">
          <template v-if="statStates[card.id]?.status === 'ready'">
            <p class="stat-card__value">{{ formatNumber(card.value) }}</p>
            <p class="stat-card__label">{{ card.label }}</p>
            <div v-if="card.trend !== undefined" class="stat-card__trend">
              <el-icon :class="card.trend >= 0 ? 'trend-up' : 'trend-down'">
                <component :is="card.trend >= 0 ? 'ArrowUp' : 'ArrowDown'" />
              </el-icon>
              <span>{{ Math.abs(card.trend) }}%</span>
            </div>
          </template>
          <el-skeleton
            v-else-if="statStates[card.id]?.status === 'loading'"
            animated
            :rows="2"
            class="stat-card__skeleton"
          />
          <div v-else-if="statStates[card.id]?.status === 'error'" class="stat-card__state">
            <el-icon class="error-icon"><WarningFilled /></el-icon>
            <p>{{ statStates[card.id]?.message || '加载失败' }}</p>
            <el-button text size="small" @click="fetchStat(card)">重试</el-button>
          </div>
          <p v-else class="stat-card__label">{{ card.label }}</p>
        </div>
        <div v-else class="stat-card__placeholder">
          <el-icon><Lock /></el-icon>
          <span>无权限查看</span>
        </div>
      </article>
    </section>

    <section class="charts-grid">
      <div
        v-for="chart in displayCharts"
        :key="chart.id"
        class="chart-card"
        :class="{
          'chart-card--loading': chartStates[chart.id]?.status === 'loading',
          'chart-card--error': chartStates[chart.id]?.status === 'error',
          'chart-card--empty': chartStates[chart.id]?.status === 'empty',
        }"
      >
        <div class="chart-card__header">
          <h3>{{ chart.title }}</h3>
          <el-button
            v-if="chart.canView && chartStates[chart.id]?.status === 'ready'"
            text
            size="small"
            icon="Refresh"
            class="chart-refresh-btn"
            @click="reloadChart(chart)"
          >
            刷新
          </el-button>
        </div>
        <template v-if="chart.canView">
          <div
            :ref="el => setChartRef(chart.id, el as HTMLDivElement | null)"
            class="chart-card__canvas"
            :class="{ 'chart-card__canvas--hidden': chartStates[chart.id]?.status !== 'ready' }"
          />
          <div v-if="chartStates[chart.id]?.status === 'loading'" class="chart-loading">
            <el-skeleton animated :rows="6" />
          </div>
          <div v-else-if="chartStates[chart.id]?.status === 'empty'" class="chart-empty">
            <el-empty description="暂无数据" :image-size="100" />
          </div>
          <div v-else-if="chartStates[chart.id]?.status === 'error'" class="chart-error">
            <el-icon class="error-icon-large"><WarningFilled /></el-icon>
            <p class="error-title">加载失败</p>
            <p class="error-message">{{ chartStates[chart.id]?.message || '请稍后重试' }}</p>
            <el-button size="small" type="primary" @click="reloadChart(chart)">重试</el-button>
          </div>
        </template>
        <div v-else class="chart-card__placeholder">
          <el-icon><Lock /></el-icon>
          <span>无权限查看</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts" name="Home">
import * as echarts from 'echarts'
import {
  Histogram,
  Lock,
  Tickets,
  TrendCharts,
  User,
  ArrowUp,
  ArrowDown,
  WarningFilled,
  Refresh,
} from '@element-plus/icons-vue'
import { computed, markRaw, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import http from '@/utils/http'
import storage from '@/utils/storage'
import { isAuth, getCurDateTime } from '@/utils/utils'

type LoadStatus = 'idle' | 'loading' | 'ready' | 'empty' | 'error'

interface FetchState {
  status: LoadStatus
  message?: string
}

interface StatConfig {
  id: string
  label: string
  table: string
  authKey: string
  endpoint: string
  icon: any
  value: number
  trend?: number
}

interface ChartConfig {
  id: string
  title: string
  table: string
  authKey: string
  endpoint: string
  type: 'bar' | 'line'
  xField: string
  valueField: string
}

interface DisplayChart extends ChartConfig {
  canView: boolean
}

const pageLoading = ref(true)
const refreshing = ref(false)
const adminName = ref(storage.get('adminName') || '')
const currentTime = ref(getCurDateTime())
const chartInstances: Record<string, echarts.ECharts | null> = {}
const chartRefs: Record<string, HTMLDivElement | null> = {
  courseIncome: null,
  refundIncome: null,
  cardPurchase: null,
  renewal: null,
}

const stats = reactive<StatConfig[]>([
  {
    id: 'members',
    label: '会员总数',
    table: 'yonghu',
    authKey: 'Home Total',
    endpoint: 'yonghu/count',
    icon: markRaw(User),
    value: 0,
  },
  {
    id: 'courses',
    label: '课程总数',
    table: 'jianshenkecheng',
    authKey: 'Home Total',
    endpoint: 'jianshenkecheng/count',
    icon: markRaw(TrendCharts),
    value: 0,
  },
  {
    id: 'booking',
    label: '课程预约',
    table: 'kechengyuyue',
    authKey: 'Home Total',
    endpoint: 'kechengyuyue/count',
    icon: markRaw(Tickets),
    value: 0,
  },
  {
    id: 'card',
    label: '会员卡购买',
    table: 'huiyuankagoumai',
    authKey: 'Home Total',
    endpoint: 'huiyuankagoumai/count',
    icon: markRaw(Histogram),
    value: 0,
  },
])

const statStates = reactive<Record<string, FetchState>>({})
stats.forEach(stat => {
  statStates[stat.id] = { status: 'idle' }
})

const charts: ChartConfig[] = [
  {
    id: 'courseIncome',
    title: '课程预约日收入',
    table: 'kechengyuyue',
    authKey: 'Home Statistics',
    endpoint: 'kechengyuyue/value/yuyueshijian/kechengjiage/day',
    type: 'bar',
    xField: 'yuyueshijian',
    valueField: 'total',
  },
  {
    id: 'refundIncome',
    title: '课程退课日收入',
    table: 'kechengtuike',
    authKey: 'Home Statistics',
    endpoint: 'kechengtuike/value/shenqingshijian/kechengjiage/day',
    type: 'bar',
    xField: 'shenqingshijian',
    valueField: 'total',
  },
  {
    id: 'cardPurchase',
    title: '会员卡购买统计',
    table: 'huiyuankagoumai',
    authKey: 'Home Statistics',
    endpoint: 'huiyuankagoumai/group/huiyuankamingcheng',
    type: 'bar',
    xField: 'huiyuankamingcheng',
    valueField: 'total',
  },
  {
    id: 'renewal',
    title: '会员续费日收入',
    table: 'huiyuanxufei',
    authKey: 'Home Statistics',
    endpoint: 'huiyuanxufei/value/xufeishijian/jiage/day',
    type: 'line',
    xField: 'xufeishijian',
    valueField: 'total',
  },
]

const chartStates = reactive<Record<string, FetchState>>({})
charts.forEach(chart => {
  chartStates[chart.id] = { status: 'idle' }
})

const displayStats = computed(() =>
  stats.map(item => ({
    ...item,
    canView: canView(item.table, item.authKey),
  })),
)

const displayCharts = computed(() =>
  charts.map(item => ({
    ...item,
    canView: canView(item.table, item.authKey),
  })),
)

const isMobile = computed(() => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 992
})

let timeTimer: number | undefined

onMounted(async () => {
  updateTime()
  await refreshAll()
  window.addEventListener('resize', resizeCharts)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts)
  Object.values(chartInstances).forEach(instance => instance?.dispose())
  if (timeTimer) {
    window.clearTimeout(timeTimer)
  }
})

function canView(table: string, key: string) {
  return isAuth(table, key)
}

function updateTime() {
  currentTime.value = getCurDateTime()
  timeTimer = window.setTimeout(updateTime, 1000)
}

async function refreshAll() {
  if (refreshing.value) return
  refreshing.value = true
  try {
    await Promise.all([fetchStats(), loadAllCharts()])
  } finally {
    pageLoading.value = false
    refreshing.value = false
  }
}

async function fetchStats() {
  await Promise.all(stats.map(stat => fetchStat(stat)))
}

async function fetchStat(stat: StatConfig) {
  if (!canView(stat.table, stat.authKey)) {
    const state = statStates[stat.id]
    if (state) {
      state.status = 'idle'
    }
    return
  }
  if (!statStates[stat.id]) {
    statStates[stat.id] = { status: 'loading' }
  }
  const state = statStates[stat.id]!
  state.status = 'loading'
  state.message = ''
  try {
    const response = await http.get(stat.endpoint)
    if (response.data.code !== 0) {
      throw new Error(response.data.msg || '加载失败')
    }
    stat.value = response.data.data || 0
    state.status = 'ready'
  } catch (error: any) {
    state.status = 'error'
    state.message = error?.response?.data?.msg || error?.message || '加载失败'
  }
}

async function loadAllCharts() {
  await nextTick()
  const permitted = displayCharts.value.filter(chart => chart.canView)
  await Promise.all(permitted.map(chart => loadChart(chart)))
}

async function loadChart(chart: DisplayChart) {
  if (!chartStates[chart.id]) {
    chartStates[chart.id] = { status: 'loading' }
  }
  const state = chartStates[chart.id]!
  state.status = 'loading'
  state.message = ''
  await nextTick()
  const container = chartRefs[chart.id]
  if (!container) {
    state.status = 'error'
    state.message = '图表容器尚未就绪'
    return
  }
  try {
    const response = await http.get(chart.endpoint)
    if (response.data.code !== 0) {
      throw new Error(response.data.msg || '加载失败')
    }
    const list = response.data.data || []
    if (!list.length) {
      chartInstances[chart.id]?.clear()
      state.status = 'empty'
      return
    }
    const xAxisData = list.map((item: Record<string, any>) => item[chart.xField])
    const seriesData = list.map((item: Record<string, any>) => Number(item[chart.valueField]) || 0)
    if (!chartInstances[chart.id]) {
      chartInstances[chart.id] = echarts.init(container, undefined, { renderer: 'canvas' })
    }
    const option = buildOption(chart.type, chart.title, xAxisData, seriesData)
    chartInstances[chart.id]?.setOption(option, true)
    state.status = 'ready'
  } catch (error: any) {
    state.status = 'error'
    state.message = error?.response?.data?.msg || error?.message || '加载失败'
  }
}

function reloadChart(chart: DisplayChart) {
  if (!chart.canView) return
  loadChart(chart)
}

function setChartRef(id: string, el: HTMLDivElement | null) {
  chartRefs[id] = el
}

function buildOption(type: 'bar' | 'line', title: string, xAxis: string[], series: number[]) {
  return {
    backgroundColor: 'transparent',
    textStyle: { color: '#333' },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderColor: '#e0e0e0',
      textStyle: { color: '#333' },
    },
    grid: { left: 24, right: 24, top: 24, bottom: 32 },
    xAxis: {
      type: 'category',
      data: xAxis,
      axisLine: { lineStyle: { color: '#E0E0E0' } },
      axisLabel: { color: '#666' },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#E0E0E0' } },
      splitLine: { lineStyle: { color: '#F5F5F5' } },
      axisLabel: { color: '#666' },
    },
    series: [
      {
        data: series,
        type,
        smooth: type === 'line',
        areaStyle:
          type === 'line'
            ? {
                opacity: 0.2,
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: 'rgba(58, 128, 255, 0.3)' },
                    { offset: 1, color: 'rgba(58, 128, 255, 0.05)' },
                  ],
                },
              }
            : undefined,
        itemStyle: { color: '#3a80ff' },
        barWidth: type === 'bar' ? '60%' : undefined,
      },
    ],
  }
}

function resizeCharts() {
  Object.values(chartInstances).forEach(instance => instance?.resize())
}

function formatNumber(value: number): string {
  if (value >= 10000) {
    return (value / 10000).toFixed(1) + '万'
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'k'
  }
  return value.toString()
}
</script>

<style scoped lang="scss">
// Dashboard样式已提取到 components/_dashboard.scss
// 使用 .dashboard, .dashboard__hero, .stats-grid, .stat-card 等类名即可应用统一样式
</style>
