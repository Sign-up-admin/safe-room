<template>
  <ElDialog v-model="visible" :title="isEditing ? '修改回复' : '回复留言'" width="600px">
    <ElForm ref="formRef" label-width="100px" :model="formData" :rules="rules">
      <ElFormItem label="留言内容">
        <ElInput v-model="formData.ask" type="textarea" :rows="4" readonly style="background-color: #f5f5f5" />
      </ElFormItem>
      <ElFormItem label="回复内容" prop="reply">
        <ElInput
          v-model="formData.reply"
          type="textarea"
          :rows="6"
          placeholder="请输入回复内容"
          maxlength="1000"
          show-word-limit
        />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="closeDialog">取消</ElButton>
      <ElButton type="primary" :loading="submitting" @click="handleSubmit">保存</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts" name="ChatReplyForm">
import { ElDialog, ElForm, ElFormItem, ElInput, ElButton } from 'element-plus'
import { ref } from 'vue'

interface ChatRecord {
  id?: number
  userid?: number
  ask?: string
  reply?: string
  isreply?: number
}

interface Props {
  visible: boolean
  record: ChatRecord | null
  submitting: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'submit', data: { id: number, userid: number, reply: string }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref()

const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const isEditing = computed(() => props.record?.isreply === 1)

const formData = ref({
  ask: '',
  reply: ''
})

const rules = {
  reply: [{ required: true, message: '请输入回复内容', trigger: 'blur' }]
}

// 监听record变化，更新表单数据
watch(() => props.record, (newRecord) => {
  if (newRecord) {
    formData.value.ask = newRecord.ask || ''
    formData.value.reply = newRecord.reply || ''
  } else {
    formData.value.ask = ''
    formData.value.reply = ''
  }
}, { immediate: true })

const closeDialog = () => {
  visible.value = false
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  if (!formRef.value || !props.record) return

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return

    const submitData = {
      id: props.record!.id!,
      userid: props.record!.userid!,
      reply: formData.value.reply
    }

    emit('submit', submitData)
  })
}

// 暴露重置方法供父组件调用
defineExpose({
  resetForm: () => {
    formRef.value?.resetFields()
    formData.value = {
      ask: '',
      reply: ''
    }
  }
})
</script>
