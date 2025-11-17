<template>
  <ElDialog v-model="visible" title="留言详情" width="600px">
    <ElDescriptions :column="1" border>
      <ElDescriptionsItem label="用户ID">{{ record?.userid }}</ElDescriptionsItem>
      <ElDescriptionsItem label="用户信息">
        <div v-if="record?.yonghuEntity">
          <div>用户名：{{ record.yonghuEntity.yonghuming || '未知' }}</div>
          <div>手机号：{{ record.yonghuEntity.shouji || '未知' }}</div>
          <div>邮箱：{{ record.yonghuEntity.youxiang || '未知' }}</div>
        </div>
        <span v-else>未关联用户</span>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="留言内容">
        <div style="max-height: 200px; overflow-y: auto; white-space: pre-wrap">
          {{ record?.ask }}
        </div>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="回复内容">
        <div v-if="record?.reply" style="max-height: 200px; overflow-y: auto; white-space: pre-wrap">
          {{ record.reply }}
        </div>
        <ElText v-else type="info">暂无回复</ElText>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="回复状态">
        <ElTag :type="record?.isreply === 1 ? 'success' : 'danger'">
          {{ record?.isreply === 1 ? '已回复' : '未回复' }}
        </ElTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="留言时间">{{ record?.addtime }}</ElDescriptionsItem>
    </ElDescriptions>
    <template #footer>
      <ElButton @click="closeDialog">关闭</ElButton>
      <ElButton
        v-if="permissions.update && record?.isreply !== 1"
        type="primary"
        @click="handleReply"
      >
        回复
      </ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts" name="ChatDetailDialog">
import { ElDialog, ElDescriptions, ElDescriptionsItem, ElText, ElTag, ElButton } from 'element-plus'

interface ChatRecord {
  id?: number
  userid?: number
  ask?: string
  reply?: string
  addtime?: string
  isreply?: number
  yonghuEntity?: {
    yonghuming?: string
    shouji?: string
    youxiang?: string
  }
}

interface Permissions {
  view?: boolean
  update?: boolean
  remove?: boolean
}

interface Props {
  visible: boolean
  record: ChatRecord | null
  permissions: Permissions
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'reply', record: ChatRecord): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const closeDialog = () => {
  visible.value = false
}

const handleReply = () => {
  if (props.record) {
    emit('reply', props.record)
  }
}
</script>
