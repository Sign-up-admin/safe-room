<template>
  <div v-loading="loading" class="remind-page">
    <section class="remind-hero">
      <div>
        <p class="section-eyebrow">EXPIRY ALERT CENTER</p>
        <h1>多通道提醒 · 不错过任何到期窗口</h1>
        <p>系统根据会员卡有效期推送提醒，可配置短信/站内/邮箱三种渠道，并与续费页联动。</p>
        <div v-if="unreadCount > 0" class="message-integration">
          <TechButton size="sm" variant="outline" @click="viewMessages"> 📬 未读消息 ({{ unreadCount }}) </TechButton>
        </div>
      </div>
      <div class="hero-stats">
        <article>
          <h3>{{ upcomingReminders.length }}</h3>
          <p>未来 7 天提醒</p>
        </article>
        <article>
          <h3>{{ urgentCount }}</h3>
          <p>紧急（≤3 天）</p>
        </article>
        <article>
          <h3>{{ unreadCount }}</h3>
          <p>未读消息</p>
        </article>
      </div>
    </section>

    <section class="remind-grid">
      <TechCard title="智能提醒时间轴" subtitle="可展开详情 · 支持批量操作" :interactive="false">
        <!-- 筛选和批量操作栏 -->
        <div class="timeline-controls">
          <div class="filter-group">
            <el-select v-model="filterType" placeholder="筛选类型" size="small" style="width: 120px">
              <el-option label="全部" value="all" />
              <el-option label="紧急提醒" value="urgent" />
              <el-option label="普通提醒" value="normal" />
            </el-select>
            <el-select v-model="sortBy" placeholder="排序方式" size="small" style="width: 120px">
              <el-option label="到期时间" value="date" />
              <el-option label="优先级" value="priority" />
            </el-select>
          </div>
          <div v-if="selectedItems.length > 0" class="batch-actions">
            <TechButton size="sm" variant="outline" @click="markAsProcessed">标记已处理</TechButton>
            <TechButton size="sm" variant="outline" @click="postponeReminders">延期提醒</TechButton>
            <TechButton size="sm" variant="outline" @click="deleteSelected">删除选中</TechButton>
          </div>
        </div>

        <!-- 时间轴列表 -->
        <div class="timeline-container">
          <div class="timeline">
            <div
              v-for="(item, index) in filteredReminders"
              :key="item.id"
              class="timeline-item"
              :class="{ 'timeline-item--expanded': item.expanded, 'timeline-item--urgent': item.level === 'urgent' }"
            >
              <!-- 时间轴节点 -->
              <div class="timeline-node">
                <div class="timeline-dot" :class="`timeline-dot--${item.level}`"></div>
                <div v-if="index !== filteredReminders.length - 1" class="timeline-line"></div>
              </div>

              <!-- 主要内容 -->
              <div class="timeline-content">
                <div class="timeline-header" @click="toggleExpand(item)">
                  <div class="timeline-info">
                    <div class="timeline-meta">
                      <strong>{{ item.yonghuxingming || '会员' }}</strong>
                      <small>{{ item.huiyuankahao || '—' }}</small>
                    </div>
                    <div class="timeline-time">
                      <span>{{ formatDate(item.tixingshijian) }}</span>
                      <span class="timeline-days">{{ item.daysLeft }}天后到期</span>
                    </div>
                  </div>
                  <div class="timeline-actions">
                    <el-checkbox v-model="item.selected" @change="updateSelection" />
                    <span class="timeline-badge" :class="[`timeline-badge--${item.level}`]">{{ item.levelLabel }}</span>
                    <TechButton size="sm" variant="text" @click.stop="goRenew(item)">续费</TechButton>
                    <svg
                      class="expand-icon"
                      :class="{ 'expand-icon--rotated': item.expanded }"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      @click.stop="toggleExpand(item)"
                    >
                      <path
                        d="M6 9l6 6 6-6"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                <!-- 展开详情 -->
                <div v-show="item.expanded" class="timeline-details">
                  <div class="details-grid">
                    <div class="detail-item">
                      <label>会员卡类型</label>
                      <span>{{ (item as any).huiyuankamingcheng || '—' }}</span>
                    </div>
                    <div class="detail-item">
                      <label>联系方式</label>
                      <span>{{ (item as any).shoujihaoma || '—' }}</span>
                    </div>

                    <!-- 智能建议 -->
                    <div v-if="generateSmartSuggestions(item).length > 0" class="smart-suggestions">
                      <h5>智能建议</h5>
                      <div class="suggestions-list">
                        <div
                          v-for="suggestion in generateSmartSuggestions(item)"
                          :key="suggestion.title"
                          class="suggestion-item"
                          :class="`suggestion-item--${suggestion.type}`"
                          @click="handleSuggestionClick(suggestion, item)"
                        >
                          <div class="suggestion-header">
                            <span class="suggestion-title">{{ suggestion.title }}</span>
                            <span v-if="suggestion.priority <= 2" class="suggestion-priority">优先处理</span>
                          </div>
                          <p class="suggestion-desc">{{ suggestion.description }}</p>
                          <span class="suggestion-action">{{ suggestion.action }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- 提醒历史 -->
                    <div class="reminder-history">
                      <h5>提醒历史</h5>
                      <div class="history-timeline">
                        <div v-for="history in getReminderHistory(item)" :key="history.date" class="history-item">
                          <div class="history-dot"></div>
                          <div class="history-content">
                            <div class="history-header">
                              <span class="history-action">{{ history.action }}</span>
                              <span class="history-date">{{ history.date }}</span>
                            </div>
                            <div class="history-details">
                              <span class="history-operator">{{ history.operator }}</span>
                              <p class="history-note">{{ history.note }}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="detail-item">
                      <label>提醒渠道</label>
                      <div class="channels-display">
                        <span v-if="strategy.sms" class="channel-tag">短信</span>
                        <span v-if="strategy.email" class="channel-tag">邮件</span>
                        <span v-if="strategy.inbox" class="channel-tag">站内</span>
                      </div>
                    </div>
                    <div class="detail-item">
                      <label>备注</label>
                      <span>{{ item.beizhu || '系统自动提醒' }}</span>
                    </div>
                  </div>

                  <!-- 关联预约和订单 -->
                  <div class="related-info">
                    <h5>关联信息</h5>
                    <div class="related-grid">
                      <div v-for="booking in getRelatedBookings(item)" :key="booking.id" class="related-item">
                        <div class="related-icon">📅</div>
                        <div class="related-content">
                          <p>{{ booking.name }}</p>
                          <small>{{ formatDate(booking.date) }}</small>
                        </div>
                      </div>
                      <div v-for="order in getRelatedOrders(item)" :key="order.id" class="related-item">
                        <div class="related-icon">🛒</div>
                        <div class="related-content">
                          <p>{{ order.name }}</p>
                          <small>¥{{ order.amount }}</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 智能续费建议 -->
                  <div class="renewal-suggestion">
                    <h5>智能续费建议</h5>
                    <div class="suggestion-card" :class="`suggestion-card--${getRenewalSuggestion(item).level}`">
                      <div class="suggestion-icon">{{ getRenewalSuggestion(item).icon }}</div>
                      <div class="suggestion-content">
                        <p>{{ getRenewalSuggestion(item).message }}</p>
                        <div class="suggestion-options">
                          <TechButton
                            v-for="option in getRenewalSuggestion(item).options"
                            :key="option.id"
                            size="sm"
                            variant="outline"
                            @click="applySuggestion(item, option)"
                          >
                            {{ option.label }}
                          </TechButton>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 提醒历史记录 -->
                  <div class="reminder-history">
                    <h5>提醒历史</h5>
                    <div class="history-timeline">
                      <div v-for="(history, index) in getReminderHistory(item)" :key="index" class="history-item">
                        <div class="history-dot"></div>
                        <div class="history-content">
                          <p>{{ history.action }} - {{ history.note }}</p>
                          <small>{{ formatDate(history.date) }}</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="details-actions">
                    <TechButton size="sm" variant="outline" @click="postponeReminder(item)">延期3天</TechButton>
                    <TechButton size="sm" variant="outline" @click="markProcessed(item)">标记已处理</TechButton>
                    <TechButton size="sm" @click="goRenew(item)">立即续费</TechButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <el-empty v-if="!filteredReminders.length" description="暂无到期提醒" />
        </div>
      </TechCard>

      <TechCard title="提醒策略" subtitle="自定义推送渠道">
        <el-form label-position="top" class="strategy-form">
          <div class="strategy-grid">
            <el-form-item label="到期提醒阈值 (天)">
              <el-slider v-model="strategy.threshold" :max="14" :min="1" />
            </el-form-item>
            <el-form-item label="短信提醒">
              <el-switch v-model="strategy.sms" />
            </el-form-item>
            <el-form-item label="站内消息">
              <el-switch v-model="strategy.inbox" />
            </el-form-item>
            <el-form-item label="邮箱提醒">
              <el-switch v-model="strategy.email" />
            </el-form-item>
            <el-form-item label="每日提醒时刻">
              <el-time-select v-model="strategy.time" start="08:00" end="21:00" step="01:00" placeholder="选择时间" />
            </el-form-item>
          </div>
        </el-form>
        <div class="section-actions">
          <TechButton size="sm" variant="outline" @click="openForm">新增提醒</TechButton>
          <TechButton size="sm" @click="saveStrategy">保存策略</TechButton>
        </div>
      </TechCard>
    </section>

    <TechCard class="remind-cta" variant="layered" :interactive="false" title="同步到期提醒" subtitle="与续费流程打通">
      <p>提醒创建后可自动在续费页面显示倒计时，减少手动跟进。建议至少提前 7 天提醒会员续费。</p>
      <template #footer>
        <div class="cta-actions">
          <TechButton size="sm" @click="goRenew">前往续费</TechButton>
          <TechButton size="sm" variant="outline" @click="openList">查看全部提醒</TechButton>
        </div>
      </template>
    </TechCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { TechButton, TechCard } from '@/components/common'
import { getModuleService } from '@/services/crud'
import { useMessageCenter } from '@/composables/useMessageCenter'
import type { Daoqitixing } from '@/types/modules'
import { formatDate } from '@/utils/formatters'

const router = useRouter()
const reminderService = getModuleService('daoqitixing')
const { unreadCount, loadUnreadCount } = useMessageCenter()

const reminders = ref<Daoqitixing[]>([])
const loading = ref(false)

// 筛选和排序状态
const filterType = ref('all')
const sortBy = ref('date')
const selectedItems = ref<number[]>([])

const strategy = reactive({
  threshold: 7,
  sms: true,
  inbox: true,
  email: false,
  time: '09:00',
})

// 增强的提醒列表计算
const enhancedReminders = computed(() =>
  reminders.value.map(item => {
    const daysLeft = item.tixingshijian
      ? Math.ceil((new Date(item.tixingshijian).getTime() - Date.now()) / 86400000)
      : 0
    return {
      ...item,
      daysLeft,
      selected: false,
      expanded: false,
      priority: item.tixingshijian
        ? Math.ceil((new Date(item.tixingshijian).getTime() - Date.now()) / 86400000) <= 3
          ? 1
          : 2
        : 0,
      level: daysLeft <= 3 ? 'urgent' : daysLeft <= 7 ? 'warning' : 'normal',
      levelLabel: daysLeft <= 3 ? '紧急' : daysLeft <= 7 ? '警告' : '正常',
      processed: false,
      status: '待处理',
      postponed: false,
    }
  }),
)

const filteredReminders = computed(() => {
  let filtered = enhancedReminders.value.filter(item => item.daysLeft >= -1)

  // 按类型筛选
  if (filterType.value !== 'all') {
    filtered = filtered.filter(item => item.level === filterType.value)
  }

  // 排序
  if (sortBy.value === 'date') {
    filtered.sort((a, b) => (a.tixingshijian || '').localeCompare(b.tixingshijian || ''))
  } else if (sortBy.value === 'priority') {
    filtered.sort((a, b) => a.priority - b.priority)
  }

  return filtered.slice(0, 10).map(item => ({
    ...item,
    level: item.daysLeft <= 3 ? 'urgent' : 'normal',
    levelLabel: item.daysLeft <= 3 ? '紧急' : '提醒中',
  }))
})

const upcomingReminders = computed(() => filteredReminders.value.slice(0, 6))
const urgentCount = computed(() => upcomingReminders.value.filter(item => item.level === 'urgent').length)

onMounted(async () => {
  await Promise.all([fetchReminders(), loadUnreadCount()])
})

async function fetchReminders() {
  loading.value = true
  try {
    const { list } = await reminderService.list({ page: 1, limit: 10, sort: 'tixingshijian', order: 'asc' })
    reminders.value = list ?? []
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

function openForm() {
  router.push('/index/daoqitixingAdd')
}

function openList() {
  router.push('/index/daoqitixingDetail')
}

function goRenew(item?: any) {
  router.push('/index/huiyuanxufei')
}

function viewMessages() {
  // 可以跳转到消息中心页面，或者显示消息弹窗
  // 暂时跳转到个人中心
  router.push('/index/center')
}

function saveStrategy() {
  console.log('Reminder strategy saved:', { ...strategy })
  // 这里可以调用后端API保存策略
}

// 时间轴交互功能
function toggleExpand(item: any) {
  item.expanded = !item.expanded
}

function updateSelection() {
  selectedItems.value = filteredReminders.value.filter(item => item.selected).map(item => item.id)
}

// 批量操作功能增强
async function markAsProcessed() {
  const selectedReminders = filteredReminders.value.filter(item => item.selected)
  if (selectedReminders.length === 0) return

  try {
    // 这里应该调用后端API批量标记为已处理
    console.log('批量标记已处理:', selectedReminders)

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 更新本地状态
    selectedReminders.forEach(item => {
      item.processed = true
      item.selected = false
      item.status = '已处理'
    })

    selectedItems.value = []

    // 刷新数据
    await fetchReminders()

    // 显示成功反馈
    console.log(`✅ 成功标记 ${selectedReminders.length} 个提醒为已处理`)
  } catch (error) {
    console.error('批量标记失败:', error)
    // 这里可以显示错误提示
  }
}

async function postponeReminders() {
  const selectedReminders = filteredReminders.value.filter(item => item.selected)
  if (selectedReminders.length === 0) return

  try {
    // 计算延期后的日期（默认延期7天）
    const postponeDays = 7

    console.log(`延期 ${selectedReminders.length} 个提醒 ${postponeDays} 天`)

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 更新本地状态
    selectedReminders.forEach(item => {
      if (item.tixingshijian) {
        const newDate = new Date(item.tixingshijian)
        newDate.setDate(newDate.getDate() + postponeDays)
        item.tixingshijian = newDate.toISOString()
        item.daysLeft += postponeDays
      }
      item.selected = false
      item.postponed = true
    })

    selectedItems.value = []

    // 重新计算优先级和排序
    await fetchReminders()

    console.log(`✅ 成功延期 ${selectedReminders.length} 个提醒`)
  } catch (error) {
    console.error('延期提醒失败:', error)
  }
}

async function deleteSelected() {
  const selectedReminders = filteredReminders.value.filter(item => item.selected)
  if (selectedReminders.length === 0) return

  // 确认删除
  const confirmed = confirm(`确定要删除选中的 ${selectedReminders.length} 个提醒吗？此操作不可恢复。`)
  if (!confirmed) return

  try {
    console.log('批量删除提醒:', selectedReminders)

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 从列表中移除
    const idsToDelete = selectedReminders.map(item => item.id)
    reminders.value = reminders.value.filter(item => !idsToDelete.includes(item.id))

    selectedItems.value = []

    console.log(`✅ 成功删除 ${selectedReminders.length} 个提醒`)
  } catch (error) {
    console.error('批量删除失败:', error)
  }
}

// 单个提醒操作
function postponeReminder(item: any) {
  console.log('Postponing reminder:', item)
  // 这里应该调用后端API延期单个提醒
}

// 消息联动优化：自动关联相关预约和订单
function generateSmartSuggestions(item: any) {
  const suggestions = []

  // 基于到期天数生成建议
  if (item.daysLeft <= 3) {
    suggestions.push({
      type: 'urgent',
      title: '立即续费',
      description: '会员卡即将到期，建议立即办理续费',
      action: '续费',
      priority: 1,
    })
  } else if (item.daysLeft <= 7) {
    suggestions.push({
      type: 'warning',
      title: '提前续费',
      description: '建议选择更长期的续费方案，享受更多优惠',
      action: '查看优惠',
      priority: 2,
    })
  } else {
    suggestions.push({
      type: 'info',
      title: '规划续费',
      description: '可以开始规划续费方案，对比不同优惠',
      action: '了解详情',
      priority: 3,
    })
  }

  // 基于历史行为生成个性化建议
  if (item.daysLeft > 0) {
    suggestions.push({
      type: 'recommendation',
      title: '智能推荐',
      description: '根据您的使用习惯，推荐最适合的续费方案',
      action: '查看推荐',
      priority: 4,
    })
  }

  return suggestions
}

// 提醒历史记录追溯
function getReminderHistory(item: any) {
  // 这里应该从后端获取该会员的提醒历史
  // 暂时返回模拟数据
  return [
    {
      date: '2025-11-01',
      action: '创建提醒',
      operator: '系统自动',
      note: '距离到期还有30天',
    },
    {
      date: '2025-11-10',
      action: '发送邮件提醒',
      operator: '系统自动',
      note: '已发送到期提醒邮件',
    },
    {
      date: '2025-11-15',
      action: '发送短信提醒',
      operator: '系统自动',
      note: '已发送到期提醒短信',
    },
  ]
}

// 消息模板个性化定制
function customizeMessageTemplate(item: any, channel: string) {
  const memberName = item.yonghuxingming || '尊敬的会员'
  const cardName = item.huiyuankamingcheng || '会员卡'
  const daysLeft = item.daysLeft

  const templates = {
    email: {
      subject: `【重要提醒】您的${cardName}还有${daysLeft}天到期`,
      content: `
        ${memberName}，您好！

        您的${cardName}还有${daysLeft}天即将到期，为了不影响您的正常使用，请及时办理续费。

        续费提醒：
        - 到期时间：${formatDate(item.tixingshijian)}
        - 会员卡号：${item.huiyuankahao || '未设置'}
        - 建议提前续费，享受更多优惠

        点击下方链接立即续费：
        [续费链接]

        如有疑问，请联系客服。
        祝您生活愉快！

        健身房管理系统
      `,
    },
    sms: {
      content: `${memberName}，您的${cardName}还有${daysLeft}天到期，请及时续费。客服电话：400-800-8888`,
    },
    inApp: {
      title: '会员卡到期提醒',
      content: `您的${cardName}还有${daysLeft}天到期，点击查看续费优惠`,
      action: '立即续费',
    },
  }

  return templates[channel as keyof typeof templates]
}

function markProcessed(item: any) {
  console.log('Marking processed:', item)
  // 这里应该调用后端API标记已处理
}

// 处理智能建议点击
function handleSuggestionClick(suggestion: any, item: any) {
  console.log('Suggestion clicked:', suggestion, item)

  switch (suggestion.action) {
    case '续费':
      router.push({
        path: '/index/huiyuanxufei',
        query: { memberId: item.yonghuzhanghao },
      })
      break
    case '查看优惠':
      router.push('/index/huiyuanka')
      break
    case '了解详情':
      // 跳转到会员卡详情页
      router.push({
        path: '/index/huiyuanka',
        query: { cardId: item.huiyuankaid },
      })
      break
    case '查看推荐':
      // 跳转到续费页面，显示智能推荐
      router.push({
        path: '/index/huiyuanxufei',
        query: { showRecommendation: 'true', memberId: item.yonghuzhanghao },
      })
      break
    default:
      console.log('Unknown suggestion action:', suggestion.action)
  }
}

// 获取关联预约信息
function getRelatedBookings(item: any) {
  // 模拟数据，实际应该从API获取
  return [
    {
      id: 1,
      name: '瑜伽课程预约',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ].filter(() => item.yonghuxingming) // 只有当有用户信息时才显示
}

// 获取关联订单信息
function getRelatedOrders(item: any) {
  // 模拟数据，实际应该从API获取
  return [
    {
      id: 1,
      name: '季度会员卡',
      amount: 1299,
    },
  ].filter(() => item.huiyuankamingcheng) // 只有当有会员卡信息时才显示
}

// 获取智能续费建议
function getRenewalSuggestion(item: any) {
  const daysLeft = item.daysLeft

  if (daysLeft <= 3) {
    return {
      level: 'urgent',
      icon: '🚨',
      message: '会员卡即将到期，建议立即续费以避免服务中断',
      options: [
        { id: 'quarter', label: '续费3个月' },
        { id: 'semi-annual', label: '续费6个月' },
        { id: 'annual', label: '续费12个月' },
      ],
    }
  } else if (daysLeft <= 7) {
    return {
      level: 'warning',
      icon: '⚠️',
      message: '会员卡即将到期，建议提前续费享受优惠',
      options: [
        { id: 'quarter', label: '季度续费' },
        { id: 'semi-annual', label: '半年续费' },
      ],
    }
  } else {
    return {
      level: 'normal',
      icon: '💡',
      message: '建议选择长期续费方案，享受更多优惠',
      options: [
        { id: 'semi-annual', label: '半年优惠' },
        { id: 'annual', label: '年度特惠' },
      ],
    }
  }
}

// 应用续费建议
function applySuggestion(item: any, option: any) {
  console.log('Applying suggestion:', item, option)
  // 跳转到续费页面并传递建议参数
  router.push({
    path: '/index/huiyuanxufei',
    query: {
      suggestion: option.id,
      memberId: item.id,
      cardType: item.huiyuankamingcheng,
    },
  })
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.remind-page {
  padding: 48px 6vw 80px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.remind-hero {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 24px;
}

.message-integration {
  margin-top: 16px;
}

.hero-stats {
  display: flex;
  gap: 12px;

  article {
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
    padding: 16px;
    min-width: 140px;
    text-align: center;

    h3 {
      margin: 0;
      font-size: 2rem;
    }

    p {
      margin: 4px 0 0;
      color: $color-text-secondary;
    }
  }
}

.remind-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

// 时间轴控制栏
.timeline-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.filter-group {
  display: flex;
  gap: 12px;
}

.batch-actions {
  display: flex;
  gap: 8px;
}

// 时间轴容器
.timeline-container {
  max-height: 600px;
  overflow-y: auto;
}

.timeline {
  position: relative;
  padding-left: 40px;
}

.timeline-item {
  position: relative;
  margin-bottom: 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(253, 216, 53, 0.3);
    background: rgba(253, 216, 53, 0.05);
  }

  &--expanded {
    background: rgba(253, 216, 53, 0.08);
    border-color: rgba(253, 216, 53, 0.4);
  }

  &--urgent {
    border-color: rgba(255, 82, 82, 0.3);

    .timeline-dot {
      background: #ff5252;
      box-shadow: 0 0 0 3px rgba(255, 82, 82, 0.2);
    }
  }
}

.timeline-node {
  position: absolute;
  left: -45px;
  top: 20px;
  width: 20px;
  height: 100%;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: $color-yellow;
  box-shadow: 0 0 0 3px rgba(253, 216, 53, 0.2);
  position: relative;
  z-index: 2;

  &--urgent {
    background: #ff5252;
    box-shadow: 0 0 0 3px rgba(255, 82, 82, 0.2);
  }

  &--normal {
    background: $color-yellow;
    box-shadow: 0 0 0 3px rgba(253, 216, 53, 0.2);
  }
}

.timeline-line {
  position: absolute;
  left: 5px;
  top: 20px;
  width: 2px;
  height: calc(100% - 20px);
  background: rgba(255, 255, 255, 0.1);
}

.timeline-content {
  padding: 16px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 8px 0;
}

.timeline-info {
  display: flex;
  justify-content: space-between;
  flex: 1;
  margin-right: 16px;
}

.timeline-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong {
    font-size: 1rem;
    color: $color-text-primary;
  }

  small {
    color: $color-text-secondary;
    font-size: 0.8rem;
  }
}

.timeline-time {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;

  span {
    font-size: 0.9rem;
    color: $color-text-primary;
  }

  .timeline-days {
    font-size: 0.8rem;
    color: $color-text-secondary;
  }
}

.timeline-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.timeline-badge {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;

  &--urgent {
    background: rgba(255, 82, 82, 0.2);
    color: #ff5252;
  }

  &--normal {
    background: rgba(253, 216, 53, 0.15);
    color: $color-yellow;
  }
}

// 关联信息样式
.related-info {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  h5 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.related-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.related-icon {
  font-size: 20px;
  opacity: 0.8;
}

.related-content {
  flex: 1;

  p {
    margin: 0 0 4px 0;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);
  }

  small {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
  }
}

// 续费建议样式
.renewal-suggestion {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  h5 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }
}

.suggestion-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  &--urgent {
    background: linear-gradient(135deg, rgba(255, 82, 82, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%);
    border-color: rgba(255, 82, 82, 0.3);
  }

  &--warning {
    background: linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(253, 216, 53, 0.05) 100%);
    border-color: rgba(255, 152, 0, 0.3);
  }

  &--normal {
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(102, 179, 255, 0.05) 100%);
    border-color: rgba(64, 158, 255, 0.3);
  }
}

.suggestion-icon {
  font-size: 24px;
  opacity: 0.9;
  flex-shrink: 0;
}

.suggestion-content {
  flex: 1;

  p {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.5;
  }
}

.suggestion-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

// 提醒历史样式
.reminder-history {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  h5 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }
}

.history-timeline {
  position: relative;
  padding-left: 20px;
}

.history-timeline::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1px;
}

.history-item {
  position: relative;
  padding: 8px 0;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.history-dot {
  width: 12px;
  height: 12px;
  background: rgba(64, 158, 255, 0.6);
  border-radius: 50%;
  position: absolute;
  left: -20px;
  top: 12px;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.history-content {
  flex: 1;

  p {
    margin: 0 0 4px 0;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.8);
  }

  small {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
  }
}

// 时间轴悬停效果增强
.timeline-item {
  &:hover {
    .timeline-header {
      background: rgba(255, 255, 255, 0.02);
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .timeline-actions {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

.timeline-actions {
  opacity: 0.7;
  transform: translateY(2px);
  transition: all 0.2s ease;
}

.expand-icon {
  transition: transform 0.3s ease;
  cursor: pointer;
  color: $color-text-secondary;

  &--rotated {
    transform: rotate(180deg);
  }
}

// 展开详情
.timeline-details {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;

  label {
    font-size: 0.8rem;
    color: $color-text-secondary;
    font-weight: 500;
  }

  span {
    font-size: 0.9rem;
    color: $color-text-primary;
  }
}

.channels-display {
  display: flex;
  gap: 6px;
}

.channel-tag {
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 0.75rem;
  background: rgba(74, 144, 226, 0.1);
  color: #4a90e2;
}

.details-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.strategy-form {
  margin-top: 12px;
}

.strategy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.section-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.remind-cta {
  text-align: center;

  p {
    margin: 0;
    color: $color-text-secondary;
  }
}

.cta-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

// 智能建议样式
.smart-suggestions {
  margin: 20px 0;
  padding: 16px;
  background: rgba(74, 144, 226, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(74, 144, 226, 0.2);

  h5 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #4a90e2;
  }
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggestion-item {
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(74, 144, 226, 0.4);
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.15);
  }

  &--urgent {
    background: rgba(244, 67, 54, 0.05);
    border-color: rgba(244, 67, 54, 0.2);

    &:hover {
      border-color: rgba(244, 67, 54, 0.4);
      box-shadow: 0 4px 12px rgba(244, 67, 54, 0.15);
    }
  }

  &--warning {
    background: rgba(255, 152, 0, 0.05);
    border-color: rgba(255, 152, 0, 0.2);

    &:hover {
      border-color: rgba(255, 152, 0, 0.4);
      box-shadow: 0 4px 12px rgba(255, 152, 0, 0.15);
    }
  }

  &--recommendation {
    background: rgba(76, 175, 80, 0.05);
    border-color: rgba(76, 175, 80, 0.2);

    &:hover {
      border-color: rgba(76, 175, 80, 0.4);
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.15);
    }
  }
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.suggestion-title {
  font-size: 14px;
  font-weight: 600;
  color: $color-text-primary;
}

.suggestion-priority {
  font-size: 11px;
  padding: 2px 6px;
  background: #f44336;
  color: white;
  border-radius: 8px;
  font-weight: 500;
}

.suggestion-desc {
  margin: 4px 0;
  font-size: 13px;
  color: $color-text-secondary;
  line-height: 1.4;
}

.suggestion-action {
  font-size: 12px;
  color: #4a90e2;
  font-weight: 500;
  text-decoration: underline;
}

// 提醒历史样式
.reminder-history {
  margin: 20px 0;
  padding: 16px;
  background: rgba(156, 39, 176, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(156, 39, 176, 0.2);

  h5 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #9c27b0;
  }
}

.history-timeline {
  position: relative;
  padding-left: 20px;
}

.history-timeline::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(156, 39, 176, 0.3);
}

.history-item {
  position: relative;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.history-dot {
  position: absolute;
  left: -13px;
  top: 6px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #9c27b0;
  border: 2px solid rgba(255, 255, 255, 0.9);
}

.history-content {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  padding: 12px;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.history-action {
  font-size: 14px;
  font-weight: 600;
  color: $color-text-primary;
}

.history-date {
  font-size: 12px;
  color: $color-text-secondary;
}

.history-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-operator {
  font-size: 12px;
  color: #9c27b0;
  font-weight: 500;
}

.history-note {
  margin: 0;
  font-size: 13px;
  color: $color-text-secondary;
  line-height: 1.4;
}

@media (max-width: 640px) {
  .remind-page {
    padding: 32px 16px 60px;
  }

  .schedule-list li {
    grid-template-columns: 1fr;
  }

  .section-actions,
  .cta-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
