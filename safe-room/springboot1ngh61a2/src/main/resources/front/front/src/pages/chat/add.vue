<template>
  <div class="chat-add">
    <TechCard as="section" title="提交留言" subtitle="我们会尽快回复" :interactive="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="主题" prop="ask">
          <el-input v-model="form.ask" maxlength="100" show-word-limit placeholder="请描述问题或需求" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="4" placeholder="可补充设备编号、课程名称等信息" />
        </el-form-item>
        <div class="actions">
          <el-button @click="resetForm">重置</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">提交</el-button>
        </div>
      </el-form>
    </TechCard>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { TechCard } from '@/components/common'
import http from '@/common/http'
import type { ApiResponse } from '@/types/api'

interface ChatForm {
  ask: string
  remark?: string
}

const router = useRouter()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const form = reactive<ChatForm>({
  ask: '',
  remark: '',
})

const rules: FormRules<ChatForm> = {
  ask: [{ required: true, message: '请输入留言内容', trigger: 'blur' }],
}

function resetForm() {
  form.ask = ''
  form.remark = ''
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    await http.post<ApiResponse>('/chat/add', {
      ask: `${form.ask}${form.remark ? ` · ${form.remark}` : ''}`,
    })
    ElMessage.success('留言提交成功，客服将尽快回复')
    router.replace('/index/chat')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || '提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.chat-add {
  min-height: 60vh;
  padding: 48px 20px 80px;
  display: flex;
  justify-content: center;

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>
