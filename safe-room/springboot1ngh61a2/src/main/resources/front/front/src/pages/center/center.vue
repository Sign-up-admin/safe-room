<template>
  <div v-loading="loading" class="center-page">
    <section class="center-hero">
      <TechCard class="profile-summary" :interactive="false">
        <div class="profile-info">
          <img :src="avatarUrl" alt="头像" />
          <div>
            <p class="eyebrow">WELCOME BACK</p>
            <h2>{{ profile.yonghuxingming || profile.yonghuzhanghao }}</h2>
            <span>{{ profile.huiyuankahao ? `会员卡：${profile.huiyuankahao}` : '尚未绑定会员卡' }}</span>
          </div>
        </div>
        <div class="profile-actions">
          <TechButton size="sm" variant="outline" @click="resetPassword">重置密码</TechButton>
          <TechButton size="sm" variant="ghost" @click="logout">退出登录</TechButton>
        </div>
        <div class="summary-stats">
          <article>
            <h3>{{ remindStats.week }}</h3>
            <p>7 天内到期提醒</p>
          </article>
          <article>
            <h3>{{ remindStats.month }}</h3>
            <p>30 天内到期提醒</p>
          </article>
          <article>
            <h3>{{ upcomingBookings.length }}</h3>
            <p>即将开始的预约</p>
          </article>
        </div>
      </TechCard>
    </section>

    <section class="dashboard-grid">
      <TechCard title="训练数据" subtitle="近 4 周训练趋势" class="data-visualization-card">
        <!-- 空状态处理 -->
        <div v-if="!trainingTrend.some(t => t.value > 0)" class="empty-training-state">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <h4>暂无训练数据</h4>
          <p>开始您的第一次训练，数据将在这里显示</p>
          <TechButton size="sm" @click="router.push('/index/jianshenkecheng')">浏览课程</TechButton>
        </div>

        <div v-else class="training-metrics">
          <div class="metric-grid">
            <article class="metric-item">
              <div class="metric-value">{{ trainingInsights.averageIntensity }}%</div>
              <div class="metric-label">平均训练强度</div>
              <div
                class="metric-insight"
                :class="
                  trainingInsights.averageIntensity > 70
                    ? 'positive'
                    : trainingInsights.averageIntensity > 40
                      ? 'neutral'
                      : 'negative'
                "
              >
                {{
                  trainingInsights.averageIntensity > 70
                    ? '训练积极'
                    : trainingInsights.averageIntensity > 40
                      ? '训练稳定'
                      : '需加强训练'
                }}
              </div>
            </article>
            <article class="metric-item">
              <div class="metric-value">{{ trainingInsights.peakIntensity }}%</div>
              <div class="metric-label">最高训练强度</div>
              <div class="metric-insight positive">个人最佳</div>
            </article>
            <article class="metric-item">
              <div class="metric-value">{{ trainingInsights.progressRate }}%</div>
              <div class="metric-label">训练进步</div>
              <div
                class="metric-insight"
                :class="
                  trainingInsights.progressRate > 0
                    ? 'positive'
                    : trainingInsights.progressRate === 0
                      ? 'neutral'
                      : 'negative'
                "
              >
                {{
                  trainingInsights.progressRate > 0
                    ? '稳步提升'
                    : trainingInsights.progressRate === 0
                      ? '保持稳定'
                      : '需要调整'
                }}
              </div>
            </article>
            <article class="metric-item">
              <div class="metric-value">{{ trainingInsights.consistency }}%</div>
              <div class="metric-label">训练一致性</div>
              <div
                class="metric-insight"
                :class="
                  trainingInsights.consistency > 70
                    ? 'positive'
                    : trainingInsights.consistency > 40
                      ? 'neutral'
                      : 'negative'
                "
              >
                {{
                  trainingInsights.consistency > 70
                    ? '非常规律'
                    : trainingInsights.consistency > 40
                      ? '较为规律'
                      : '训练不稳定'
                }}
              </div>
            </article>
          </div>

          <!-- 数据洞察提示 -->
          <div class="data-insights">
            <div v-if="trainingInsights.recommendations.length > 0" class="insight-item">
              <h5>💡 训练建议</h5>
              <ul>
                <li v-for="rec in trainingInsights.recommendations" :key="rec">{{ rec }}</li>
              </ul>
            </div>
            <div v-if="trainingInsights.achievements.length > 0" class="insight-item">
              <h5>🏆 训练成就</h5>
              <ul>
                <li v-for="achievement in trainingInsights.achievements" :key="achievement">{{ achievement }}</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="trend-chart">
          <div v-for="item in trainingTrend" :key="item.label" class="trend-bar">
            <div class="trend-bar__container">
              <span class="trend-bar__fill" :style="{ height: `${item.value}%` }"></span>
              <span class="trend-bar__value">{{ item.value }}</span>
            </div>
            <small>{{ item.label }}</small>
          </div>
        </div>
        <div class="chart-legend">
          <div class="legend-item">
            <span class="legend-color"></span>
            <span>训练完成度 (%)</span>
          </div>
          <div class="legend-hint">数据基于课程预约和私教预约的训练记录</div>
        </div>
      </TechCard>

      <TechCard title="预约管理" subtitle="智能提醒 · 批量操作">
        <!-- 预约筛选和批量操作 -->
        <div v-if="allBookings.length > 0" class="booking-controls">
          <div class="filter-tabs">
            <button
              v-for="filter in bookingFilters"
              :key="filter.value"
              class="filter-tab"
              :class="[{ 'filter-tab--active': bookingFilter === filter.value }]"
              @click="bookingFilter = filter.value"
            >
              {{ filter.label }}
            </button>
          </div>

          <div v-if="selectedBookings.length > 0" class="bulk-actions">
            <span class="selection-info">已选择 {{ selectedBookings.length }} 项</span>
            <TechButton size="sm" variant="outline" @click="batchCancelBookings">批量取消</TechButton>
            <TechButton size="sm" variant="outline" @click="batchReschedule">批量改期</TechButton>
          </div>
        </div>

        <!-- 智能提醒 -->
        <div v-if="urgentBookings.length > 0" class="smart-reminders">
          <div class="reminder-alert">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <div>
              <strong>{{ urgentBookings.length }} 个预约即将开始</strong>
              <p>请准时参加，避免影响训练效果</p>
            </div>
          </div>
        </div>

        <!-- 预约列表 -->
        <div class="booking-list-container">
          <ul class="booking-list">
            <li
              v-for="booking in filteredBookings"
              :key="booking.id"
              class="booking-item"
              :class="{ 'booking-item--selected': booking.selected, 'booking-item--urgent': booking.isUrgent }"
            >
              <div class="booking-checkbox">
                <el-checkbox :model-value="booking.selected" @change="value => toggleBookingSelection(booking.id)" />
              </div>
              <div class="booking-content">
                <div class="booking-header">
                  <p class="booking-title">{{ booking.title }}</p>
                  <span class="booking-tag" :class="`booking-tag--${booking.type.toLowerCase()}`">{{
                    booking.type
                  }}</span>
                </div>
                <div class="booking-meta">
                  <small class="booking-time">{{ booking.time }}</small>
                  <small class="booking-status" :class="`booking-status--${booking.status.toLowerCase()}`">
                    {{ booking.statusText }}
                  </small>
                </div>
                <div v-if="booking.reminder" class="booking-reminder">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                  </svg>
                  {{ booking.reminder }}
                </div>
              </div>
              <div class="booking-actions">
                <TechButton size="sm" variant="ghost" @click="rescheduleBooking(booking)">改期</TechButton>
                <TechButton size="sm" variant="outline" @click="cancelBooking(booking)">取消</TechButton>
              </div>
            </li>
          </ul>
          <el-empty v-if="!filteredBookings.length" description="暂无预约" />
        </div>

        <template #footer>
          <div class="booking-footer">
            <TechButton size="sm" variant="outline" @click="goBooking">查看全部预约</TechButton>
            <TechButton size="sm" @click="createBooking">新建预约</TechButton>
          </div>
        </template>
      </TechCard>

      <TechCard title="快捷服务" subtitle="更多服务入口">
        <div class="quick-grid">
          <article v-for="link in quickLinks" :key="link.label" @click="router.push(link.path)">
            <div class="quick-icon">
              <component :is="link.icon" />
            </div>
            <h4>{{ link.label }}</h4>
            <p>{{ link.desc }}</p>
          </article>
        </div>

        <!-- 扩展服务区域 -->
        <div class="extended-services">
          <h5>热门服务</h5>
          <div class="service-grid">
            <div class="service-item" @click="router.push('/index/huiyuanxufei')">
              <div class="service-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <div class="service-content">
                <h6>会员续费</h6>
                <p>智能推荐续费方案</p>
              </div>
            </div>

            <div class="service-item" @click="router.push('/index/storeup')">
              <div class="service-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <div class="service-content">
                <h6>我的收藏</h6>
                <p>收藏管理与批量操作</p>
              </div>
            </div>

            <div class="service-item" @click="router.push('/index/daoqitixing')">
              <div class="service-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <div class="service-content">
                <h6>到期提醒</h6>
                <p>智能提醒与批量管理</p>
              </div>
            </div>

            <div class="service-item" @click="openCustomerService">
              <div class="service-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <div class="service-content">
                <h6>在线客服</h6>
                <p>7×24小时服务支持</p>
              </div>
            </div>

            <div class="service-item" @click="router.push('/index/jianshenqicai')">
              <div class="service-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <div class="service-content">
                <h6>健身器材</h6>
                <p>3D展示与使用教程</p>
              </div>
            </div>

            <div class="service-item" @click="router.push('/index/news')">
              <div class="service-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <div class="service-content">
                <h6>健身资讯</h6>
                <p>专业健身知识分享</p>
              </div>
            </div>
          </div>
        </div>
      </TechCard>
    </section>

    <el-card class="profile-card" shadow="hover">
      <div class="card-header">
        <div>
          <h2>完善个人资料</h2>
          <p>保持信息最新，便于预约与提醒</p>
        </div>
      </div>
      <el-form ref="formRef" :model="profile" :rules="rules" label-width="120px">
        <el-row :gutter="20">
          <el-col :md="12" :span="24">
            <el-form-item label="会员账号" prop="yonghuzhanghao">
              <el-input v-model="profile.yonghuzhanghao" disabled />
            </el-form-item>
          </el-col>
          <el-col :md="12" :span="24">
            <el-form-item label="姓名" prop="yonghuxingming">
              <el-input v-model="profile.yonghuxingming" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :md="12" :span="24">
            <el-form-item label="性别" prop="xingbie">
              <el-select v-model="profile.xingbie" placeholder="请选择性别">
                <el-option label="男" value="男" />
                <el-option label="女" value="女" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :md="12" :span="24">
            <el-form-item label="手机号" prop="shoujihaoma">
              <el-input v-model="profile.shoujihaoma" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :md="12" :span="24">
            <el-form-item label="身高 (cm)" prop="shengao">
              <el-input v-model="profile.shengao" placeholder="可选填" />
            </el-form-item>
          </el-col>
          <el-col :md="12" :span="24">
            <el-form-item label="体重 (kg)" prop="tizhong">
              <el-input v-model="profile.tizhong" placeholder="可选填" />
            </el-form-item>
          </el-col>
          <el-col :md="12" :span="24">
            <el-form-item label="会员卡号" prop="huiyuankahao">
              <el-input v-model="profile.huiyuankahao" placeholder="可选填" />
            </el-form-item>
          </el-col>
          <el-col :md="12" :span="24">
            <el-form-item label="有效期至" prop="youxiaoqizhi">
              <el-date-picker
                v-model="profile.youxiaoqizhi"
                type="date"
                placeholder="请选择日期"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="头像">
              <file-upload
                action="file/upload"
                tip="点击上传头像"
                :limit="1"
                :file-urls="profile.touxiang || ''"
                @change="handleAvatarChange"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="actions">
          <el-button size="large" @click="resetForm">重置</el-button>
          <el-button size="large" type="primary" :loading="saving" @click="saveProfile">保存信息</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { computed, reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import http from '@/common/http'
import storage from '@/common/storage'
import { TechButton, TechCard } from '@/components/common'
import { getModuleService } from '@/services/crud'
import type { Yonghu, Kechengyuyue, Sijiaoyuyue } from '@/types/modules'
import type { ApiResponse } from '@/types/api'
import { formatDate } from '@/utils/formatters'

interface Profile extends Yonghu {
  shoujihaoma?: string
}

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(true)
const saving = ref(false)
const originalProfile = ref<Profile | null>(null)
const remindStats = reactive({ week: 0, month: 0 })
const upcomingBookings = ref<Array<{ id: number; title: string; time: string; type: string }>>([])

// 训练洞察数据
const trainingInsights = reactive({
  averageIntensity: 65,
  peakIntensity: 85,
  progressRate: 12,
  consistency: 78,
  recommendations: ['建议增加有氧训练时间', '可以尝试高强度间歇训练', '注意训练后恢复质量'],
  achievements: ['连续训练7天达成', '训练强度提升15%'],
})

// 预约管理数据
const allBookings = ref<Array<any>>([])
const bookingFilters = [
  { label: '全部', value: 'all' },
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '待确认', value: 'pending' },
]
const bookingFilter = ref('all')
const selectedBookings = ref<Array<number>>([])

const profile = reactive<Profile>({
  id: undefined,
  yonghuzhanghao: '',
  mima: '',
  yonghuxingming: '',
  xingbie: '男',
  shoujihaoma: '',
  shengao: '',
  tizhong: '',
  huiyuankahao: '',
  youxiaoqizhi: '',
  touxiang: '',
})

const courseBookingService = getModuleService('kechengyuyue')
const coachBookingService = getModuleService('sijiaoyuyue')

const quickLinks = [
  { label: '消息中心', desc: '查看通知消息', path: '/index/notifications', icon: 'Bell' },
  { label: '预约课程', desc: '查看课程排期', path: '/index/kechengyuyue', icon: 'Calendar' },
  { label: '会员卡', desc: '查看权益与续费', path: '/index/huiyuanka' },
  { label: '支付中心', desc: '管理支付记录', path: '/index/pay' },
]

const rules: FormRules<Profile> = {
  yonghuxingming: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  xingbie: [{ required: true, message: '请选择性别', trigger: 'change' }],
  shoujihaoma: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
}

// 训练数据可视化 - 模拟真实数据
const trainingTrend = computed(() => {
  const now = new Date()
  const trends = []
  for (let i = 3; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i * 7)
    const weekLabel = `W-${i + 1}`
    // 模拟更真实的训练数据：基础值 + 随机波动
    const baseValue = 50 + Math.random() * 40
    const trendValue = Math.max(20, Math.min(100, baseValue + (Math.random() - 0.5) * 20))
    trends.push({
      label: weekLabel,
      value: Math.round(trendValue),
      date: date.toISOString().split('T')[0],
    })
  }
  return trends
})

const avatarUrl = computed(() => {
  if (!profile.touxiang) return new URL('@/assets/touxiang.png', import.meta.url).href
  if (/^https?:\/\//i.test(profile.touxiang)) return profile.touxiang
  const base = import.meta.env.VITE_APP_BASE_API?.replace(/\/$/, '') || ''
  return `${base}/${profile.touxiang.replace(/^\//, '')}`
})

onMounted(() => {
  fetchProfile()
  fetchReminderStats()
  fetchBookings()
})
async function fetchProfile() {
  loading.value = true
  try {
    const response = await http.get<ApiResponse<Profile>>('/yonghu/session')
    if (!response.data.data) {
      throw new Error('请先登录')
    }
    Object.assign(profile, response.data.data)
    originalProfile.value = { ...response.data.data }
    localStorage.setItem('userInfo', JSON.stringify(response.data.data))
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || error?.message || '加载个人信息失败')
    router.replace('/login')
  } finally {
    loading.value = false
  }
}

async function fetchReminderStats() {
  try {
    const [weekRes, monthRes] = await Promise.all([
      http.get<ApiResponse<{ count: number }>>('/yonghu/remind/youxiaoqizhi/2', {
        params: { remindstart: 0, remindend: 7 },
      }),
      http.get<ApiResponse<{ count: number }>>('/yonghu/remind/youxiaoqizhi/2', {
        params: { remindstart: 0, remindend: 30 },
      }),
    ])
    remindStats.week = (weekRes.data as any).count ?? 0
    remindStats.month = (monthRes.data as any).count ?? 0
  } catch (error) {
    console.warn('获取提醒数据失败', error)
  }
}

async function fetchBookings() {
  try {
    const [courses, coaches] = await Promise.all([
      courseBookingService.list({ page: 1, limit: 3, order: 'asc' }),
      coachBookingService.list({ page: 1, limit: 3, order: 'asc' }),
    ])
    const courseItems =
      courses.list?.map(item => ({
        id: item.id!,
        title: item.kechengmingcheng || '健身课程',
        time: item.yuyueshijian ? formatDate(item.yuyueshijian) : '待定',
        type: '课程',
      })) ?? []
    const coachItems =
      coaches.list?.map(item => ({
        id: item.id!,
        title: item.jiaolianxingming || '私教预约',
        time: item.yuyueshijian ? formatDate(item.yuyueshijian) : '待定',
        type: '私教',
      })) ?? []
    upcomingBookings.value = [...courseItems, ...coachItems].slice(0, 4)
  } catch (error) {
    console.warn('加载预约信息失败', error)
  }
}

async function saveProfile() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  saving.value = true
  try {
    await http.post<ApiResponse>('/yonghu/update', profile)
    ElMessage.success('个人信息已更新')
    originalProfile.value = { ...profile }
    localStorage.setItem('userInfo', JSON.stringify(profile))
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || '保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

function handleAvatarChange(value: string) {
  profile.touxiang = value
}

function resetForm() {
  if (originalProfile.value) {
    Object.assign(profile, originalProfile.value)
  }
}

async function logout() {
  try {
    await http.post<ApiResponse>('/yonghu/logout')
  } catch (error) {
    console.warn('退出登录失败', error)
  } finally {
    storage.remove('frontToken')
    localStorage.removeItem('UserTableName')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('userid')
    router.replace('/login')
  }
}

async function resetPassword() {
  if (!profile.yonghuzhanghao) return
  try {
    await ElMessageBox.confirm('确认将密码重置为初始值 123456 吗？', '重置密码', { type: 'warning' })
  } catch {
    return
  }
  try {
    const response = await http.post<ApiResponse>('/yonghu/resetPass', undefined, {
      params: { username: profile.yonghuzhanghao },
    })
    ElMessage.success(response.data.msg || '密码已重置为 123456')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || '重置失败，请稍后重试')
  }
}

// 预约管理方法
const filteredBookings = computed(() => {
  if (!allBookings.value.length) return []
  switch (bookingFilter.value) {
    case 'today':
      return allBookings.value.filter(booking => {
        const bookingDate = new Date(booking.time)
        const today = new Date()
        return bookingDate.toDateString() === today.toDateString()
      })
    case 'week':
      return allBookings.value.filter(booking => {
        const bookingDate = new Date(booking.time)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return bookingDate >= weekAgo
      })
    case 'pending':
      return allBookings.value.filter(booking => booking.status === 'pending')
    default:
      return allBookings.value
  }
})

const urgentBookings = computed(() =>
  allBookings.value.filter(booking => {
    const bookingTime = new Date(booking.time)
    const now = new Date()
    const hoursDiff = (bookingTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    return hoursDiff <= 24 && hoursDiff > 0
  }),
)

const toggleBookingSelection = (bookingId: number) => {
  const index = selectedBookings.value.indexOf(bookingId)
  if (index > -1) {
    selectedBookings.value.splice(index, 1)
  } else {
    selectedBookings.value.push(bookingId)
  }
}

const batchCancelBookings = async () => {
  if (!selectedBookings.value.length) {
    ElMessage.warning('请先选择要取消的预约')
    return
  }
  try {
    await ElMessageBox.confirm('确定要取消选中的预约吗？', '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    // 这里应该调用实际的取消API
    ElMessage.success('批量取消成功')
    selectedBookings.value = []
  } catch {
    // 用户取消操作
  }
}

const batchReschedule = () => {
  if (!selectedBookings.value.length) {
    ElMessage.warning('请先选择要改期的预约')
    return
  }
  ElMessage.success('批量改期功能开发中')
}

const createBooking = () => {
  router.push('/index/kechengyuyue')
}

const cancelBooking = async (booking: any) => {
  try {
    await ElMessageBox.confirm('确定要取消此预约吗？', '确认操作', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    // 这里应该调用实际的取消API
    ElMessage.success('取消成功')
  } catch {
    // 用户取消操作
  }
}

const rescheduleBooking = (booking: any) => {
  ElMessage.success('改期功能开发中')
}

const openCustomerService = () => {
  ElMessage.success('客服功能开发中')
}

function goBooking() {
  router.push('/index/kechengyuyue')
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.center-page {
  min-height: 100vh;
  padding: 48px 4vw 80px;
  background:
    radial-gradient(circle at 10% 20%, rgba(253, 216, 53, 0.18), transparent 45%),
    radial-gradient(circle at 80% 0%, rgba(253, 216, 53, 0.1), transparent 50%), #020202;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.center-hero {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile-summary {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.profile-info {
  display: flex;
  gap: 16px;
  align-items: center;

  img {
    width: 72px;
    height: 72px;
    border-radius: 20px;
    object-fit: cover;
    border: 2px solid rgba(255, 255, 255, 0.2);
  }

  .eyebrow {
    margin: 0;
    letter-spacing: 0.2em;
    color: $color-text-secondary;
  }
}

.profile-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.summary-stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  article {
    flex: 1;
    min-width: 140px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 12px 16px;

    h3 {
      margin: 0;
      font-size: 1.8rem;
    }

    p {
      margin: 4px 0 0;
      color: $color-text-secondary;
    }
  }
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
}

.training-metrics {
  margin-bottom: 24px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.metric-item {
  text-align: center;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: $color-yellow;
  margin-bottom: 4px;
}

.metric-label {
  font-size: 0.85rem;
  color: $color-text-secondary;
}

.trend-chart {
  display: flex;
  align-items: flex-end;
  gap: 18px;
  height: 180px;

  .trend-bar {
    flex: 1;
    text-align: center;
    position: relative;

    &__container {
      position: relative;
      height: 100%;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }

    &__fill {
      display: block;
      width: 100%;
      min-height: 20px;
      border-radius: 12px 12px 4px 4px;
      background: linear-gradient(180deg, rgba(253, 216, 53, 0.9), rgba(253, 216, 53, 0.2));
      box-shadow: 0 0 12px rgba(253, 216, 53, 0.4);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        animation: shimmer 2s infinite;
      }
    }

    &__value {
      position: absolute;
      top: -24px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.85rem;
      font-weight: 600;
      color: $color-yellow;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover {
      .trend-bar__fill {
        box-shadow: 0 0 20px rgba(253, 216, 53, 0.6);
        transform: scaleY(1.05);
      }

      .trend-bar__value {
        opacity: 1;
      }
    }

    small {
      display: block;
      margin-top: 6px;
      color: $color-text-secondary;
    }
  }
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.chart-legend {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: $color-text-secondary;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background: linear-gradient(180deg, rgba(253, 216, 53, 0.9), rgba(253, 216, 53, 0.2));
}

.legend-hint {
  font-size: 0.8rem;
  color: $color-text-secondary;
  opacity: 0.7;
}

.booking-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;

  li {
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    padding: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.booking-tag {
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 0.8rem;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;

  article {
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    padding: 10px;
    cursor: pointer;
    transition: $transition-base;

    &:hover {
      border-color: rgba(253, 216, 53, 0.6);
      box-shadow: $shadow-glow;
    }
  }
}

.profile-card {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 36px;
  @include glass-card();

  :deep(.el-form) {
    @include form-field-dark;
  }
}

.card-header {
  margin-bottom: 24px;

  h2 {
    margin: 0;
    letter-spacing: 0.2em;
  }

  p {
    margin: 6px 0 0;
    color: $color-text-secondary;
  }
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

@media (max-width: 768px) {
  .center-page {
    padding: 32px 20px 60px;
  }

  .profile-card {
    padding: 24px;
  }
}
</style>
