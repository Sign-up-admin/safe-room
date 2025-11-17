<template>
  <div v-loading="loading" class="renew-page">
    <section class="renew-hero">
      <div>
        <p class="section-eyebrow">MEMBERSHIP RENEWAL</p>
        <h1>续费倒计时 · 提前锁定尊享权益</h1>
        <p>系统自动同步到期时间，智能提醒 + 一键续费，避免权益中断。</p>
        <div v-if="nextExpiry" class="hero-countdown">
          <div class="countdown-visual">
            <div class="countdown-ring">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255, 255, 255, 0.1)" stroke-width="8" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  :stroke="countdownColor"
                  stroke-width="8"
                  stroke-linecap="round"
                  :stroke-dasharray="`${circumference} ${circumference}`"
                  :stroke-dashoffset="strokeDashoffset"
                  transform="rotate(-90 60 60)"
                  class="countdown-progress"
                />
              </svg>
              <div class="countdown-center">
                <strong>{{ nextExpiry.daysLeft }}</strong>
                <span>天</span>
              </div>
            </div>
          </div>
          <div class="countdown-info">
            <small>距离到期</small>
            <p>{{ nextExpiry.label }}</p>
            <div class="countdown-status" :class="countdownStatusClass">
              {{ countdownStatusText }}
            </div>
            <!-- 智能提醒状态 -->
            <div v-if="nextExpiry.daysLeft <= 30" class="reminder-status">
              <div class="reminder-channels">
                <span
                  v-if="reminderChannels.email"
                  class="channel-tag email"
                  @click="sendReminderNotification('email')"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                  </svg>
                  邮件提醒
                </span>
                <span v-if="reminderChannels.sms" class="channel-tag sms" @click="sendReminderNotification('sms')">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                  </svg>
                  短信提醒
                </span>
                <span
                  v-if="reminderChannels.inApp"
                  class="channel-tag inapp"
                  @click="sendReminderNotification('inApp')"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="2" />
                  </svg>
                  站内提醒
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="hero-actions">
          <TechButton size="lg" @click="goPurchase">立即续费</TechButton>
          <TechButton size="lg" variant="outline" @click="goReminder">管理提醒</TechButton>
        </div>
      </div>
      <TechCard
        class="hero-card"
        title="当前会员卡"
        :subtitle="currentCard?.huiyuankamingcheng || '未绑定'"
        :interactive="false"
      >
        <ul>
          <li>
            <span>有效期至</span>
            <strong>{{ currentCard?.youxiaoqi || '--' }}</strong>
          </li>
          <li>
            <span>最近续费</span>
            <strong>{{ currentCard?.xufeishijian || '--' }}</strong>
          </li>
        </ul>
        <!-- 优惠券展示 -->
        <div v-if="availableCoupons.length" class="coupons-section">
          <h4>可用优惠券</h4>
          <div class="coupons-list">
            <div v-for="coupon in availableCoupons" :key="coupon.id" class="coupon-item">
              <div class="coupon-info">
                <span class="coupon-name">{{ coupon.name }}</span>
                <span class="coupon-discount">{{ coupon.discount }}</span>
              </div>
              <span class="coupon-expiry">到期: {{ formatDate(coupon.expiry) }}</span>
            </div>
          </div>
        </div>
      </TechCard>
    </section>

    <section class="renew-grid">
      <TechCard title="续费时间轴" subtitle="最近三次续费记录">
        <ol class="timeline">
          <li v-for="item in renewalTimeline" :key="item.id">
            <div class="timeline-dot"></div>
            <div>
              <p>{{ item.huiyuankamingcheng }}</p>
              <small>{{ formatDate(item.xufeishijian) }} · {{ item.jiage ? formatCurrency(item.jiage) : '—' }}</small>
            </div>
            <span>{{ item.status }}</span>
          </li>
          <el-empty v-if="!renewalTimeline.length" description="暂无续费记录" />
        </ol>
      </TechCard>

      <TechCard title="提醒时间轴" subtitle="来自到期提醒模块">
        <ul class="reminder-list">
          <li v-for="item in reminderList" :key="item.id">
            <header>
              <strong>{{ item.yonghuxingming || '会员' }}</strong>
              <small>{{ formatDate(item.tixingshijian) }}</small>
            </header>
            <p>{{ item.beizhu || '系统提醒：请尽快续费' }}</p>
            <span class="reminder-tag" :class="[`reminder-tag--${item.level}`]">{{ item.levelLabel }}</span>
          </li>
          <el-empty v-if="!reminderList.length" description="暂无提醒" />
        </ul>
      </TechCard>

      <TechCard title="续费数据可视化" subtitle="消费趋势与会员价值分析">
        <div class="data-visualization">
          <div class="chart-grid">
            <div class="chart-item">
              <h4>月度消费趋势</h4>
              <div class="simple-chart">
                <div class="chart-bars">
                  <div
                    v-for="(month, index) in monthlyConsumption"
                    :key="index"
                    class="chart-bar"
                    :style="{ height: `${month.percentage}%` }"
                  >
                    <span class="bar-value">¥{{ month.amount }}</span>
                  </div>
                </div>
                <div class="chart-labels">
                  <span v-for="month in monthlyConsumption" :key="month.month">{{ month.month }}</span>
                </div>
              </div>
            </div>

            <div class="chart-item">
              <h4>会员价值评估</h4>
              <div class="value-metrics">
                <div class="metric-item">
                  <div class="metric-value">{{ renewalProgress.totalRenewals }}</div>
                  <div class="metric-label">总续费次数</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value">{{ renewalProgress.averageDuration }}</div>
                  <div class="metric-label">平均续费月数</div>
                </div>
                <div class="metric-item">
                  <div class="metric-value">¥{{ calculateTotalSpent() }}</div>
                  <div class="metric-label">累计消费</div>
                </div>
              </div>
            </div>
          </div>

          <div class="recommendation-insight">
            <div class="insight-card">
              <div class="insight-icon">🎯</div>
              <div class="insight-content">
                <h5>智能推荐洞察</h5>
                <p>基于您的续费历史，{{ renewalProgress.nextBestOffer }}可能是最佳选择</p>
                <small>系统分析了您的消费频率和偏好</small>
              </div>
            </div>
          </div>
        </div>
      </TechCard>
    </section>

    <!-- 优惠券区域 -->
    <section v-if="availableCoupons.filter(c => c.granted).length > 0" class="renew-coupons">
      <TechCard title="可用优惠券" subtitle="到期前自动发放，助您省钱续费" :interactive="false">
        <div class="coupons-grid">
          <div
            v-for="coupon in availableCoupons.filter(c => c.granted)"
            :key="coupon.id"
            class="coupon-card"
            :class="`coupon-card--${coupon.type}`"
          >
            <div class="coupon-header">
              <h4>{{ coupon.name }}</h4>
              <span class="coupon-discount">{{ coupon.discount }}</span>
            </div>
            <div class="coupon-details">
              <p class="coupon-condition">{{ coupon.condition }}</p>
              <p class="coupon-expiry">有效期至: {{ coupon.expiry }}</p>
            </div>
            <div class="coupon-status">
              <span class="status-badge">可使用</span>
            </div>
          </div>
        </div>
      </TechCard>
    </section>

    <section class="renew-actions">
      <TechCard title="智能续费推荐" subtitle="基于您的使用习惯为您推荐最适合的续费方案" :interactive="false">
        <div class="smart-grid">
          <article
            v-for="option in smartRecommendations"
            :key="option.id"
            class="smart-option-card"
            :class="{ 'smart-option-card--recommended': option.recommended }"
            @click="goPurchaseSmart(option)"
          >
            <div class="option-header">
              <h3>{{ option.name }}</h3>
              <div v-if="option.recommended" class="option-badge">智能推荐</div>
            </div>
            <p class="option-duration">{{ option.duration }}</p>
            <div class="option-benefits">
              <span v-for="benefit in option.benefits" :key="benefit" class="benefit-chip">
                {{ benefit }}
              </span>
            </div>
            <!-- 智能推荐理由 -->
            <div v-if="option.recommended" class="recommendation-reason">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span>{{ option.reasoning }}</span>
            </div>
            <div class="option-footer">
              <div class="option-price">
                <strong>¥{{ option.price.toLocaleString() }}</strong>
                <small v-if="option.savings">节省 ¥{{ option.savings }}</small>
                <del v-if="option.originalPrice">¥{{ option.originalPrice.toLocaleString() }}</del>
              </div>
              <TechButton size="sm" class="option-cta" :variant="option.recommended ? 'primary' : 'outline'">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="margin-right: 6px">
                  <path d="M12 2v20m10-10H2" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
                立即续费
              </TechButton>
            </div>
          </article>
        </div>
      </TechCard>
    </section>

    <!-- 续费数据可视化 -->
    <section class="renew-analytics">
      <TechCard title="续费数据分析" subtitle="您的会员价值与消费趋势" :interactive="false">
        <div class="analytics-grid">
          <!-- 续费历史图表 -->
          <div class="analytics-chart">
            <h4>续费历史记录</h4>
            <div class="renewal-history-chart">
              <div class="chart-placeholder">
                <svg width="100%" height="200" viewBox="0 0 400 200">
                  <!-- 续费时间线 -->
                  <line x1="50" y1="150" x2="350" y2="150" stroke="#fdd835" stroke-width="2" />
                  <text x="30" y="155" font-size="12" fill="#666">时间</text>

                  <!-- 模拟续费点 -->
                  <circle
                    v-for="(renewal, index) in renewals.slice(0, 6)"
                    :key="index"
                    :cx="50 + index * 50"
                    cy="150"
                    r="8"
                    fill="#fdd835"
                  />
                  <text
                    v-for="(renewal, index) in renewals.slice(0, 6)"
                    :key="`text-${index}`"
                    :x="50 + index * 50"
                    y="130"
                    font-size="10"
                    text-anchor="middle"
                    fill="#666"
                  >
                    ¥{{ (Number(renewal.xufeijine) || 0).toFixed(0) }}
                  </text>
                </svg>
              </div>
            </div>
          </div>

          <!-- 消费趋势分析 -->
          <div class="analytics-chart">
            <h4>月度消费趋势</h4>
            <div class="consumption-trend">
              <div v-for="month in monthlyConsumption" :key="month.month" class="trend-bar">
                <div class="bar-container">
                  <div class="bar-fill" :style="{ height: `${month.percentage}%` }"></div>
                </div>
                <span class="bar-label">{{ month.month }}</span>
                <span class="bar-value">¥{{ month.amount }}</span>
              </div>
            </div>
          </div>

          <!-- 会员价值评估 -->
          <div class="analytics-metrics">
            <h4>会员价值评估</h4>
            <div class="metrics-grid">
              <div class="metric-item">
                <span class="metric-label">总续费金额</span>
                <strong class="metric-value">¥{{ calculateTotalSpent().toLocaleString() }}</strong>
              </div>
              <div class="metric-item">
                <span class="metric-label">平均续费周期</span>
                <strong class="metric-value">{{ renewalProgress.averageDuration }}个月</strong>
              </div>
              <div class="metric-item">
                <span class="metric-label">连续续费次数</span>
                <strong class="metric-value">{{ renewalProgress.currentStreak }}次</strong>
              </div>
              <div class="metric-item">
                <span class="metric-label">会员等级</span>
                <strong class="metric-value">{{
                  renewalProgress.currentStreak >= 5 ? 'VIP' : renewalProgress.currentStreak >= 3 ? '高级' : '普通'
                }}</strong>
              </div>
            </div>
          </div>
        </div>
      </TechCard>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { TechButton, TechCard } from '@/components/common'
import { getModuleService } from '@/services/crud'
import type { Huiyuanxufei, Daoqitixing } from '@/types/modules'
import { formatCurrency, formatDate } from '@/utils/formatters'

const router = useRouter()
const renewService = getModuleService('huiyuanxufei')
const reminderService = getModuleService('daoqitixing')

const renewals = ref<Huiyuanxufei[]>([])
const reminders = ref<Daoqitixing[]>([])
const loading = ref(false)

// 智能提醒相关数据
const reminderChannels = ref({
  email: true,
  sms: true,
  inApp: true,
})

// 优惠券数据 - 基于会员等级和到期时间自动发放
const availableCoupons = ref([
  {
    id: 1,
    name: '续费8折优惠券',
    discount: '8折',
    type: 'percentage',
    value: 0.8,
    expiry: '2025-12-31',
    autoGranted: true,
    condition: '到期前30天自动发放',
    granted: true,
    grantedAt: '2025-10-01T00:00:00.000Z',
  },
  {
    id: 2,
    name: '赠送一个月会员',
    discount: '赠一个月',
    type: 'gift',
    value: 1,
    expiry: '2025-11-30',
    autoGranted: true,
    condition: '连续续费3次及以上',
    granted: true,
    grantedAt: '2025-10-01T00:00:00.000Z',
  },
  {
    id: 3,
    name: '续费满减券',
    discount: '满1000减100',
    type: 'fixed',
    value: 100,
    minAmount: 1000,
    expiry: '2025-12-15',
    autoGranted: false,
    granted: false,
    condition: '手动领取',
  },
])

// 自动发放优惠券逻辑
function autoGrantCoupons() {
  if (!nextExpiry.value || nextExpiry.value.daysLeft > 30) return

  const newCoupons = availableCoupons.value.filter(
    coupon =>
      coupon.autoGranted && !availableCoupons.value.some(existing => existing.id === coupon.id && existing.granted),
  )

  newCoupons.forEach(coupon => {
    coupon.granted = true
    coupon.grantedAt = new Date().toISOString()
    // 这里可以调用API记录优惠券发放
    console.log(`🎫 自动发放优惠券: ${coupon.name}`)
  })
}

// 智能推荐续费方案 - 基于用户行为智能推荐
const smartRecommendations = ref([
  {
    id: 'quarterly',
    name: '季度续费',
    duration: '3个月',
    price: 1299,
    originalPrice: 1499,
    savings: 200,
    benefits: ['基础权益', '优先预约', '私教8折'],
    recommended: false,
    score: 0,
    reasoning: '',
  },
  {
    id: 'semi-annual',
    name: '半年续费',
    duration: '6个月',
    price: 2499,
    originalPrice: 2999,
    savings: 500,
    benefits: ['全部权益', '优先预约', '私教9折', '赠体检'],
    recommended: false,
    score: 0,
    reasoning: '',
  },
  {
    id: 'annual',
    name: '年度续费',
    duration: '12个月',
    price: 4599,
    originalPrice: 5799,
    savings: 1200,
    benefits: ['尊享权益', '最高优先', '私教9折', '专属客服'],
    recommended: false,
    score: 0,
    reasoning: '',
  },
])

// 智能推荐算法 - 基于用户历史行为
function calculateSmartRecommendations() {
  if (!renewals.value.length) return

  const userHistory = renewals.value
  const totalSpent = userHistory.reduce((sum, renewal) => sum + (Number(renewal.xufeijine) || 0), 0)
  const avgSpentPerRenewal = totalSpent / userHistory.length
  const renewalFrequency = userHistory.length / 12 // 年均续费次数
  const consecutiveRenewals = calculateConsecutiveRenewals(userHistory)

  smartRecommendations.value.forEach(option => {
    let score = 0
    let reasoning = ''

    // 基于消费频率的推荐
    if (renewalFrequency >= 2) {
      // 高频用户
      if (option.id === 'annual') {
        score += 30
        reasoning += '高频用户推荐年度方案，节省更多成本；'
      } else if (option.id === 'semi-annual') {
        score += 20
        reasoning += '适合您的续费频率；'
      }
    } else if (renewalFrequency >= 1) {
      // 正常用户
      if (option.id === 'semi-annual') {
        score += 25
        reasoning += '平衡价格与权益的最佳选择；'
      }
    } else {
      // 低频用户
      if (option.id === 'quarterly') {
        score += 20
        reasoning += '适合首次尝试的用户；'
      }
    }

    // 基于消费金额的推荐
    if (avgSpentPerRenewal >= 2000) {
      // 高消费用户
      if (option.id === 'annual') {
        score += 25
        reasoning += '高消费用户推荐长期方案，性价比更高；'
      }
    } else if (avgSpentPerRenewal >= 1000) {
      // 中等消费用户
      if (option.id === 'semi-annual') {
        score += 20
        reasoning += '符合您的消费水平；'
      }
    }

    // 连续续费奖励
    if (consecutiveRenewals >= 3) {
      if (option.id === 'annual') {
        score += 15
        reasoning += '连续续费用户专享优惠；'
      }
    }

    // 到期紧急程度
    if (nextExpiry.value) {
      const daysLeft = nextExpiry.value.daysLeft
      if (daysLeft <= 7) {
        // 紧急续费
        if (option.id === 'quarterly') {
          score += 20
          reasoning += '到期临近，推荐短期方案快速续费；'
        }
      } else if (daysLeft <= 30) {
        // 近期到期
        if (option.id === 'semi-annual') {
          score += 15
          reasoning += '中期方案适合您的到期情况；'
        }
      }
    }

    // 优惠力度加成
    const savingsRate = option.savings / option.price
    score += savingsRate * 50 // 节省比例越高分数越高

    option.score = Math.min(100, Math.max(0, score))
    option.reasoning = reasoning || '通用推荐方案'
  })

  // 设置推荐标记
  const maxScore = Math.max(...smartRecommendations.value.map(r => r.score))
  smartRecommendations.value.forEach(option => {
    option.recommended = option.score === maxScore && option.score > 20
  })
}

// 计算连续续费次数
function calculateConsecutiveRenewals(history: typeof renewals.value) {
  if (!history.length) return 0

  const sortedHistory = history.sort(
    (a, b) => new Date(b.xufeishijian || 0).getTime() - new Date(a.xufeishijian || 0).getTime(),
  )

  let consecutive = 1
  for (let i = 1; i < sortedHistory.length; i++) {
    const prevDate = new Date(sortedHistory[i - 1].xufeishijian || 0)
    const currDate = new Date(sortedHistory[i].xufeishijian || 0)
    const monthsDiff = (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24 * 30)

    if (monthsDiff <= 4) {
      // 连续续费间隔不超过4个月
      consecutive++
    } else {
      break
    }
  }

  return consecutive
}

const currentCard = computed(() => renewals.value[0])

const nextExpiry = computed(() => {
  const target = renewals.value.find(item => item.youxiaoqi)
  if (!target || !target.youxiaoqi) return null
  const date = new Date(target.youxiaoqi)
  if (Number.isNaN(date.getTime())) return null
  const diff = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return {
    label: `${formatDate(target.youxiaoqi)} · ${target.huiyuankamingcheng || ''}`,
    daysLeft: Math.max(diff, 0),
  }
})

const circumference = computed(() => 2 * Math.PI * 50)

const strokeDashoffset = computed(() => {
  if (!nextExpiry.value) return circumference.value
  const totalDays = 90 // 假设3个月为基准
  const progress = Math.max(0, Math.min(1, nextExpiry.value.daysLeft / totalDays))
  return circumference.value * (1 - progress)
})

const countdownColor = computed(() => {
  if (!nextExpiry.value) return 'rgba(253, 216, 53, 0.8)'
  const days = nextExpiry.value.daysLeft
  if (days <= 7) return 'rgba(255, 82, 82, 0.8)' // 红色 - 紧急
  if (days <= 30) return 'rgba(255, 152, 0, 0.8)' // 橙色 - 警告
  return 'rgba(253, 216, 53, 0.8)' // 金色 - 正常
})

const countdownStatusClass = computed(() => {
  if (!nextExpiry.value) return 'status-normal'
  const days = nextExpiry.value.daysLeft
  if (days <= 7) return 'status-urgent'
  if (days <= 30) return 'status-warning'
  return 'status-normal'
})

const countdownStatusText = computed(() => {
  if (!nextExpiry.value) return '状态正常'
  const days = nextExpiry.value.daysLeft
  if (days <= 7) return '紧急续费'
  if (days <= 30) return '即将到期'
  return '状态正常'
})

const renewalTimeline = computed(() =>
  renewals.value.slice(0, 3).map(item => ({
    ...item,
    status: item.ispay === '已支付' ? '已续费' : '待支付',
  })),
)

const reminderList = computed(() =>
  reminders.value.slice(0, 4).map(item => ({
    ...item,
    level: resolveLevel(item),
    levelLabel: resolveLevel(item) === 'urgent' ? '紧急' : '即将到期',
  })),
)

// 续费进度可视化数据
const renewalProgress = ref({
  currentStreak: 3, // 连续续费次数
  totalRenewals: 8, // 总续费次数
  averageDuration: 6, // 平均续费月数
  nextBestOffer: '半年续费', // 下次最佳优惠
})

// 月度消费数据（模拟数据）
const monthlyConsumption = ref([
  { month: '1月', amount: 299, percentage: 60 },
  { month: '2月', amount: 199, percentage: 40 },
  { month: '3月', amount: 399, percentage: 80 },
  { month: '4月', amount: 499, percentage: 100 },
  { month: '5月', amount: 349, percentage: 70 },
  { month: '6月', amount: 299, percentage: 60 },
])

onMounted(() => {
  loadData()
  // 检查并自动发放优惠券
  autoGrantCoupons()
})

async function loadData() {
  loading.value = true
  try {
    const [{ list: renewList }, { list: remindList }] = await Promise.all([
      renewService.list({ page: 1, limit: 20, order: 'desc', sort: 'xufeishijian' }), // 获取更多历史数据用于分析
      reminderService.list({ page: 1, limit: 5, order: 'asc', sort: 'tixingshijian' }),
    ])
    renewals.value = renewList ?? []
    reminders.value = remindList ?? []

    // 基于历史数据计算智能推荐
    calculateSmartRecommendations()
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

function resolveLevel(item: Daoqitixing) {
  if (!item.tixingshijian) return 'normal'
  const days = (new Date(item.tixingshijian).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  return days <= 3 ? 'urgent' : 'normal'
}

function goPurchase(cardId?: number) {
  router.push({ path: '/index/huiyuankagoumai', query: cardId ? { cardId } : undefined })
}

function goPurchaseSmart(option: (typeof smartRecommendations.value)[0]) {
  // 传递智能推荐参数到购买页面
  router.push({
    path: '/index/huiyuankagoumai',
    query: {
      smartRecommend: option.id,
      duration: option.duration,
      price: option.price.toString(),
    },
  })
}

function goReminder() {
  router.push('/index/daoqitixing')
}

// 智能提醒逻辑：到期前30天开始提醒
function shouldSendReminder() {
  if (!nextExpiry.value) return false
  return nextExpiry.value.daysLeft <= 30
}

// 发送提醒通知（增强版）
async function sendReminderNotification(type: 'email' | 'sms' | 'inApp') {
  if (!nextExpiry.value) return

  try {
    // 这里应该调用实际的API
    const response = await fetch('/api/reminder/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        memberId: currentCard.value?.id,
        daysLeft: nextExpiry.value.daysLeft,
        expiryDate: nextExpiry.value.label,
      }),
    })

    if (response.ok) {
      // 显示成功提示
      console.log(`✅ ${type}提醒发送成功`)
      // 这里可以显示一个toast通知
    } else {
      throw new Error('发送失败')
    }
  } catch (error) {
    console.error(`❌ ${type}提醒发送失败:`, error)
    // 这里可以显示错误提示
  }
}

// 计算总消费金额
function calculateTotalSpent() {
  return monthlyConsumption.value.reduce((total, month) => total + month.amount, 0)
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.renew-page {
  padding: 24px 6vw 80px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.renew-hero {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  align-items: center;
  margin-top: 24px;
}

.hero-countdown {
  margin: 24px 0;
  display: flex;
  gap: 20px;
  align-items: center;
}

.countdown-visual {
  flex-shrink: 0;
}

.countdown-ring {
  position: relative;
  width: 120px;
  height: 120px;

  svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  .countdown-progress {
    transition: stroke-dashoffset 0.5s ease;
  }
}

.countdown-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;

  strong {
    display: block;
    font-size: 2rem;
    font-weight: 700;
    color: $color-yellow;
    line-height: 1;
  }

  span {
    display: block;
    font-size: 0.875rem;
    color: $color-text-secondary;
    margin-top: 2px;
  }
}

.countdown-info {
  flex: 1;

  small {
    display: block;
    color: $color-text-secondary;
    font-size: 0.875rem;
    margin-bottom: 4px;
  }

  p {
    margin: 0 0 8px 0;
    font-size: 0.9rem;
    color: $color-text-primary;
    line-height: 1.4;
  }
}

.countdown-status {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.05em;

  &.status-normal {
    background: rgba(253, 216, 53, 0.1);
    color: $color-yellow;
    border: 1px solid rgba(253, 216, 53, 0.3);
  }

  &.status-warning {
    background: rgba(255, 152, 0, 0.1);
    color: #ff9800;
    border: 1px solid rgba(255, 152, 0, 0.3);
  }

  &.status-urgent {
    background: rgba(255, 82, 82, 0.1);
    color: #ff5252;
    border: 1px solid rgba(255, 82, 82, 0.3);
    animation: urgent-pulse 2s ease-in-out infinite;
  }
}

@keyframes urgent-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.4);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(255, 82, 82, 0);
  }
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-card ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reminder-status {
  margin-top: 12px;
}

.reminder-channels {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.channel-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &.email {
    background: rgba(74, 144, 226, 0.1);
    color: #4a90e2;
    border-color: rgba(74, 144, 226, 0.3);
  }

  &.sms {
    background: rgba(76, 175, 80, 0.1);
    color: #4caf50;
    border-color: rgba(76, 175, 80, 0.3);
  }

  &.inapp {
    background: rgba(253, 216, 53, 0.1);
    color: $color-yellow;
    border-color: rgba(253, 216, 53, 0.3);
  }
}

.coupons-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);

  h4 {
    margin: 0 0 12px 0;
    font-size: 0.9rem;
    color: $color-text-primary;
    font-weight: 600;
  }
}

.coupons-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.coupon-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(253, 216, 53, 0.05);
  border: 1px solid rgba(253, 216, 53, 0.2);
  border-radius: 8px;
}

.coupon-info {
  display: flex;
  flex-direction: column;
  gap: 2px;

  .coupon-name {
    font-size: 0.85rem;
    font-weight: 600;
    color: $color-yellow;
  }

  .coupon-discount {
    font-size: 0.75rem;
    color: $color-text-secondary;
  }
}

.coupon-expiry {
  font-size: 0.75rem;
  color: $color-text-secondary;
}

.renew-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;

  li {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 12px;
    align-items: center;
  }
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: $color-yellow;
  box-shadow: $shadow-glow;
}

.reminder-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;

  li {
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 12px;
  }
}

.reminder-tag {
  display: inline-flex;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  margin-top: 6px;

  &--urgent {
    background: rgba(255, 82, 82, 0.2);
    color: #ff5252;
  }

  &--normal {
    background: rgba(253, 216, 53, 0.15);
    color: $color-yellow;
  }
}

.renew-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.smart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.smart-option-card {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.02);
  position: relative;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(253, 216, 53, 0.3);
    box-shadow: 0 8px 25px rgba(253, 216, 53, 0.15);
  }

  &--recommended {
    border-color: rgba(74, 144, 226, 0.5);
    background: rgba(74, 144, 226, 0.05);

    &::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border-radius: 20px;
      background: linear-gradient(135deg, rgba(74, 144, 226, 0.3), rgba(253, 216, 53, 0.2));
      z-index: -1;
      animation: recommended-glow 3s ease-in-out infinite alternate;
    }
  }
}

@keyframes recommended-glow {
  from {
    opacity: 0.5;
  }
  to {
    opacity: 1;
  }
}

.option-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }
}

.option-badge {
  padding: 2px 8px;
  border-radius: 12px;
  background: linear-gradient(135deg, $color-yellow, rgba(253, 216, 53, 0.8));
  color: rgba(0, 0, 0, 0.8);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.option-duration {
  margin: 0;
  color: $color-text-secondary;
  font-size: 0.875rem;
  line-height: 1.4;
}

.option-benefits {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.benefit-chip {
  padding: 3px 8px;
  border-radius: 12px;
  background: rgba(253, 216, 53, 0.1);
  color: $color-yellow;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid rgba(253, 216, 53, 0.2);
}

.option-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.option-price {
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 2px;

  strong {
    display: block;
    font-size: 1.25rem;
    color: $color-yellow;
    font-weight: 700;
  }

  small {
    color: rgba(76, 175, 80, 0.8);
    font-size: 0.8rem;
    font-weight: 500;
  }

  del {
    color: $color-text-secondary;
    font-size: 0.75rem;
    text-decoration: line-through;
  }
}

.option-cta {
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
}

// 数据可视化样式
.data-visualization {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.chart-item {
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);

  h4 {
    margin: 0 0 16px 0;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }
}

.simple-chart {
  .chart-bars {
    display: flex;
    align-items: end;
    justify-content: space-between;
    height: 120px;
    margin-bottom: 12px;
    gap: 8px;
  }

  .chart-bar {
    flex: 1;
    background: linear-gradient(180deg, #409eff 0%, #66b3ff 100%);
    border-radius: 4px 4px 0 0;
    position: relative;
    transition: all 0.3s ease;
    min-height: 20px;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
    }

    .bar-value {
      position: absolute;
      top: -24px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 11px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
      white-space: nowrap;
    }
  }

  .chart-labels {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
  }
}

.value-metrics {
  display: flex;
  gap: 16px;

  .metric-item {
    flex: 1;
    text-align: center;
    padding: 16px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .metric-value {
    font-size: 24px;
    font-weight: 700;
    color: #409eff;
    margin-bottom: 4px;
  }

  .metric-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
  }
}

.recommendation-insight {
  .insight-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(102, 179, 255, 0.05) 100%);
    border: 1px solid rgba(64, 158, 255, 0.2);
    border-radius: 12px;
  }

  .insight-icon {
    font-size: 32px;
    opacity: 0.8;
  }

  .insight-content {
    flex: 1;

    h5 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
    }

    p {
      margin: 0 0 4px 0;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
    }

    small {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
    }
  }
}

@media (max-width: 640px) {
  .renew-page {
    padding: 32px 16px 60px;
  }

  .hero-actions {
    flex-direction: column;
  }

  .chart-grid {
    grid-template-columns: 1fr;
  }

  .value-metrics {
    flex-direction: column;
  }
}
</style>
