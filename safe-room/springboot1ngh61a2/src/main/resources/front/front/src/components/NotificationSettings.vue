<template>
  <el-drawer v-model="visible" title="通知设置" size="400px" :close-on-click-modal="false">
    <div class="notification-settings">
      <!-- 通知类型开关 -->
      <div class="notification-settings__section">
        <h3 class="notification-settings__section-title">通知类型</h3>
        <div class="notification-settings__switches">
          <div v-for="type in notificationTypes" :key="type.key" class="notification-settings__switch-item">
            <div class="notification-settings__switch-info">
              <span class="notification-settings__switch-label">{{ type.label }}</span>
              <span class="notification-settings__switch-desc">{{ type.description }}</span>
            </div>
            <el-switch
              v-model="localPreferences.enabledTypes"
              :value="type.key"
              :disabled="loading"
              @change="handleTypeChange"
            />
          </div>
        </div>
      </div>

      <!-- 通知渠道 -->
      <div class="notification-settings__section">
        <h3 class="notification-settings__section-title">通知渠道</h3>
        <div class="notification-settings__channels">
          <el-checkbox v-model="localPreferences.smsEnabled" :disabled="loading" @change="handleChannelChange">
            <div class="notification-settings__channel-info">
              <span class="notification-settings__channel-label">短信通知</span>
              <span class="notification-settings__channel-desc">通过短信接收重要通知</span>
            </div>
          </el-checkbox>

          <el-checkbox v-model="pushEnabled" :disabled="loading" @change="handlePushChannelChange">
            <div class="notification-settings__channel-info">
              <span class="notification-settings__channel-label">推送通知</span>
              <span class="notification-settings__channel-desc">通过App推送接收通知</span>
            </div>
          </el-checkbox>
        </div>
      </div>

      <!-- 邮件通知频率 -->
      <div class="notification-settings__section">
        <h3 class="notification-settings__section-title">邮件通知</h3>
        <div class="notification-settings__email">
          <el-radio-group v-model="localPreferences.emailFrequency" :disabled="loading" @change="handleChannelChange">
            <el-radio label="immediate">立即发送</el-radio>
            <el-radio label="daily">每日汇总</el-radio>
            <el-radio label="weekly">每周汇总</el-radio>
          </el-radio-group>
        </div>
      </div>

      <!-- 静默时间 -->
      <div class="notification-settings__section">
        <h3 class="notification-settings__section-title">静默时间</h3>
        <div class="notification-settings__quiet-hours">
          <el-switch
            v-model="localPreferences.quietHours.enabled"
            :disabled="loading"
            @change="handleQuietHoursChange"
          />
          <span class="notification-settings__quiet-desc">启用后，在指定时间段内不会收到通知</span>

          <div v-if="localPreferences.quietHours.enabled" class="notification-settings__time-picker">
            <div class="notification-settings__time-input">
              <label>开始时间</label>
              <el-time-picker
                v-model="quietStartTime"
                format="HH:mm"
                placeholder="选择时间"
                :disabled="loading"
                @change="handleTimeChange"
              />
            </div>
            <div class="notification-settings__time-input">
              <label>结束时间</label>
              <el-time-picker
                v-model="quietEndTime"
                format="HH:mm"
                placeholder="选择时间"
                :disabled="loading"
                @change="handleTimeChange"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="notification-settings__actions">
        <el-button type="default" :disabled="loading" @click="handleReset"> 重置 </el-button>
        <el-button type="primary" :loading="loading" @click="handleSave"> 保存设置 </el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { NotificationPreferences } from '@/types/notification'
import { NotificationType, NotificationChannel } from '@/types/notification'

interface Props {
  modelValue: boolean
  preferences: NotificationPreferences | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  update: [preferences: Partial<NotificationPreferences>]
}>()

// 响应式数据
const localPreferences = ref<NotificationPreferences>({
  userId: 0,
  enabledChannels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
  enabledTypes: [],
  quietHours: {
    enabled: false,
    startTime: '22:00',
    endTime: '08:00',
  },
  emailFrequency: 'immediate',
  smsEnabled: true,
  pushEnabled: true,
})

const quietStartTime = ref('')
const quietEndTime = ref('')

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const pushEnabled = computed({
  get: () => localPreferences.value.pushEnabled || false,
  set: (value: boolean) => {
    localPreferences.value.pushEnabled = value
    handleChannelChange()
  },
})

// 通知类型配置
const notificationTypes = [
  {
    key: NotificationType.APPOINTMENT_SUCCESS,
    label: '预约成功通知',
    description: '课程/私教预约成功后立即通知',
  },
  {
    key: NotificationType.APPOINTMENT_REMINDER,
    label: '预约提醒',
    description: '预约前1小时自动提醒',
  },
  {
    key: NotificationType.PAYMENT_SUCCESS,
    label: '支付成功通知',
    description: '支付完成确认',
  },
  {
    key: NotificationType.MEMBERSHIP_EXPIRY_REMINDER,
    label: '会员到期提醒',
    description: '会员卡到期前7天、3天、1天提醒',
  },
  {
    key: NotificationType.COURSE_NEW,
    label: '新课程发布',
    description: '新课程上架通知',
  },
  {
    key: NotificationType.ACTIVITY_PROMOTION,
    label: '活动通知',
    description: '优惠活动和赛事信息',
  },
]

// 监听props变化，同步到本地状态
watch(
  () => props.preferences,
  newPreferences => {
    if (newPreferences) {
      localPreferences.value = { ...newPreferences }

      // 同步时间选择器
      quietStartTime.value = newPreferences.quietHours.startTime
      quietEndTime.value = newPreferences.quietHours.endTime
    }
  },
  { immediate: true },
)

// 事件处理
const handleTypeChange = () => {
  // 通知类型变化处理
  updateChannelsFromTypes()
}

const handleChannelChange = () => {
  // 渠道变化处理
  updateChannelsFromPreferences()
}

const handlePushChannelChange = () => {
  // 推送渠道变化处理
  handleChannelChange()
}

const handleQuietHoursChange = () => {
  // 静默时间开关变化
  if (!localPreferences.value.quietHours.enabled) {
    // 关闭时重置时间
    quietStartTime.value = '22:00'
    quietEndTime.value = '08:00'
  }
}

const handleTimeChange = () => {
  // 时间变化
  localPreferences.value.quietHours.startTime = quietStartTime.value
  localPreferences.value.quietHours.endTime = quietEndTime.value
}

const handleSave = () => {
  emit('update', localPreferences.value)
}

const handleReset = () => {
  if (props.preferences) {
    localPreferences.value = { ...props.preferences }
    quietStartTime.value = props.preferences.quietHours.startTime
    quietEndTime.value = props.preferences.quietHours.endTime
  }
}

// 辅助方法
const updateChannelsFromTypes = () => {
  // 根据启用的通知类型更新渠道
  const enabledTypes = localPreferences.value.enabledTypes

  // 重要通知类型默认启用短信
  const importantTypes = [
    NotificationType.APPOINTMENT_SUCCESS,
    NotificationType.PAYMENT_SUCCESS,
    NotificationType.MEMBERSHIP_EXPIRY_REMINDER,
  ]

  const hasImportantTypes = importantTypes.some(type => enabledTypes.includes(type))
  localPreferences.value.smsEnabled = hasImportantTypes
}

const updateChannelsFromPreferences = () => {
  // 更新enabledChannels数组
  const channels: NotificationChannel[] = [NotificationChannel.IN_APP] // 站内消息始终启用

  if (localPreferences.value.smsEnabled) {
    channels.push(NotificationChannel.SMS)
  }

  channels.push(NotificationChannel.EMAIL) // 邮件始终启用，但可以通过频率控制

  if (localPreferences.value.pushEnabled) {
    channels.push(NotificationChannel.PUSH)
  }

  localPreferences.value.enabledChannels = channels
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.notification-settings {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 16px 0;
}

.notification-settings__section {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 24px;

  &:last-child {
    border-bottom: none;
  }
}

.notification-settings__section-title {
  margin: 0 0 16px;
  font-size: 1.125rem;
  font-weight: 600;
  color: $color-text-primary;
}

.notification-settings__switches {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notification-settings__switch-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.notification-settings__switch-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notification-settings__switch-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: $color-text-primary;
}

.notification-settings__switch-desc {
  font-size: 0.75rem;
  color: $color-text-secondary;
}

.notification-settings__channels {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notification-settings__channel-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-left: 8px;
}

.notification-settings__channel-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: $color-text-primary;
}

.notification-settings__channel-desc {
  font-size: 0.75rem;
  color: $color-text-secondary;
}

.notification-settings__email {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-settings__quiet-hours {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-settings__quiet-desc {
  font-size: 0.75rem;
  color: $color-text-secondary;
}

.notification-settings__time-picker {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 8px;
}

.notification-settings__time-input {
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 0.75rem;
    font-weight: 500;
    color: $color-text-primary;
  }
}

.notification-settings__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

// Element Plus 样式覆盖
:deep(.el-drawer__header) {
  margin-bottom: 0;
  padding: 24px 24px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

:deep(.el-drawer__body) {
  padding: 0 24px 24px;
}

// 响应式设计
@media (max-width: 480px) {
  .notification-settings__time-picker {
    grid-template-columns: 1fr;
  }

  .notification-settings__actions {
    flex-direction: column;

    .el-button {
      width: 100%;
    }
  }
}
</style>
