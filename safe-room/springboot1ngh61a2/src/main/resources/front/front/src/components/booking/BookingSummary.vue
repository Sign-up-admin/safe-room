<template>
  <section class="booking-summary">
    <div class="booking-summary__grid">
      <article>
        <p>课程</p>
        <strong>{{ courseName || '未选择' }}</strong>
      </article>
      <article>
        <p>预约时间</p>
        <strong>{{ slotLabel || '未选择' }}</strong>
      </article>
      <article>
        <p>金额</p>
        <strong>{{ formatCurrency(amount || 0) }}</strong>
      </article>
    </div>

    <el-form
      ref="formRef"
      label-position="top"
      class="booking-summary__form"
      :model="formData"
      :rules="formRules"
      data-testid="booking-info-form"
    >
      <el-form-item label="联系人" prop="contact">
        <el-input
          v-model="contactModel"
          placeholder="请输入姓名"
          maxlength="20"
          show-word-limit
          data-testid="booking-name-input"
        />
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="phoneModel" placeholder="请输入手机号" maxlength="11" data-testid="booking-phone-input" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model="remarkModel"
          type="textarea"
          :rows="3"
          placeholder="可填写训练目标、特殊需求"
          maxlength="200"
          show-word-limit
          data-testid="booking-remark-input"
        />
      </el-form-item>
      <el-form-item prop="agreement">
        <el-checkbox v-model="agreementModel" data-testid="booking-agreement-checkbox"
          >我已阅读并同意预约规则</el-checkbox
        >
      </el-form-item>
    </el-form>

    <div class="booking-summary__actions">
      <slot name="actions" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { formatCurrency } from '@/utils/formatters'

const props = withDefaults(
  defineProps<{
    courseName?: string
    slotLabel?: string
    amount?: number
    contact: string
    phone: string
    remark: string
    agreement: boolean
  }>(),
  {
    courseName: '未选择',
    slotLabel: '未选择',
    amount: 0,
    contact: '',
    phone: '',
    remark: '',
    agreement: false,
  },
)

const emit = defineEmits<{
  (e: 'update:contact', value: string): void
  (e: 'update:phone', value: string): void
  (e: 'update:remark', value: string): void
  (e: 'update:agreement', value: boolean): void
}>()

const formRef = ref<FormInstance>()

const validatePhone = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入手机号'))
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的手机号'))
  } else {
    callback()
  }
}

const validateContact = (_rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入联系人姓名'))
  } else if (value.trim().length < 2) {
    callback(new Error('联系人姓名至少2个字符'))
  } else {
    callback()
  }
}

const validateAgreement = (_rule: any, value: boolean, callback: any) => {
  if (!value) {
    callback(new Error('请同意预约规则'))
  } else {
    callback()
  }
}

const formRules: FormRules = {
  contact: [{ validator: validateContact, trigger: 'blur' }],
  phone: [{ validator: validatePhone, trigger: 'blur' }],
  agreement: [{ validator: validateAgreement, trigger: 'change' }],
}

const formData = computed(() => ({
  contact: props.contact,
  phone: props.phone,
  remark: props.remark,
  agreement: props.agreement,
}))

const contactModel = computed({
  get: () => props.contact,
  set: (value: string) => emit('update:contact', value),
})

const phoneModel = computed({
  get: () => props.phone,
  set: (value: string) => emit('update:phone', value),
})

const remarkModel = computed({
  get: () => props.remark,
  set: (value: string) => emit('update:remark', value),
})

const agreementModel = computed({
  get: () => props.agreement,
  set: (value: boolean) => emit('update:agreement', value),
})

defineExpose({
  validate: () => formRef.value?.validate(),
  resetFields: () => formRef.value?.resetFields(),
})
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.booking-summary {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.booking-summary__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;

  article {
    padding: 16px;
    border-radius: 18px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.02);

    p {
      margin: 0 0 6px;
      color: $color-text-secondary;
    }

    strong {
      letter-spacing: 0.08em;
    }
  }
}

.booking-summary__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 640px) {
  .booking-summary__actions {
    flex-direction: column;
  }
}
</style>
