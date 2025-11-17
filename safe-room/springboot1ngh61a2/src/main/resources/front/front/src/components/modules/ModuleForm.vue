<template>
  <el-card v-loading="saving">
    <template #header>
      <div class="form-header">
        <h2>{{ mode === 'edit' ? `编辑${config.name}` : `新增${config.name}` }}</h2>
        <div>
          <el-button @click="handleCancel">返回</el-button>
        </div>
      </div>
    </template>

    <el-form ref="formRef" :model="formModel" :rules="formRules" label-width="120px" :disabled="saving">
      <el-row :gutter="16">
        <el-col v-for="field in config.fields" :key="field.prop" :span="24">
          <el-form-item :label="field.label" :prop="field.prop">
            <component :is="getFieldComponent(field)" v-bind="getFieldProps(field)">
              <template v-if="field.type === 'select'" #default>
                <el-option
                  v-for="option in field.options || []"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </template>
            </component>
          </el-form-item>
        </el-col>
      </el-row>
      <div class="form-actions">
        <el-button type="primary" :loading="saving" data-testid="module-form-submit-button" @click="handleSubmit"
          >提交</el-button
        >
        <el-button data-testid="module-form-reset-button" @click="resetForm">重置</el-button>
      </div>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { moduleConfigs } from '@/config/modules'
import { useModuleForm } from '@/composables/useModuleCrud'
import type { ModuleEntityMap, ModuleKey } from '@/types/modules'
import FileUpload from '@/components/FileUpload.vue'
import Editor from '@/components/Editor.vue'

const props = defineProps<{
  moduleKey: ModuleKey
  mode?: 'create' | 'edit'
  initialData?: Record<string, any>
}>()

const emit = defineEmits<{
  (e: 'success'): void
  (e: 'cancel'): void
}>()

const mode = computed(() => props.mode || 'create')
const config = moduleConfigs[props.moduleKey]

const {
  formModel,
  saving,
  submit,
  resetForm: resetModuleForm,
  setFormData,
} = useModuleForm(props.moduleKey as ModuleKey, (props.initialData || {}) as any)

watch(
  () => props.initialData,
  val => {
    if (val) {
      setFormData(val)
    }
  },
  { deep: true },
)

const formRef = ref<FormInstance>()

const formRules = computed<FormRules>(() => {
  const rules: FormRules = {}
  config.fields.forEach(field => {
    if (field.required) {
      rules[field.prop] = [
        {
          required: true,
          message: `请输入${field.label}`,
          trigger: field.type === 'select' || field.type === 'date' || field.type === 'datetime' ? 'change' : 'blur',
        },
      ]
    }
  })
  return rules
})

function getFieldComponent(field: (typeof config.fields)[number]) {
  switch (field.type) {
    case 'select':
      return 'el-select'
    case 'textarea':
      return 'el-input'
    case 'number':
      return 'el-input-number'
    case 'date':
    case 'datetime':
      return 'el-date-picker'
    case 'image':
      return FileUpload
    case 'richtext':
      return Editor
    default:
      return 'el-input'
  }
}

function getFieldProps(field: (typeof config.fields)[number]) {
  const prop = field.prop as string
  const value = (formModel as any)[prop]
  if (field.type === 'textarea') {
    return {
      type: 'textarea',
      rows: 4,
      modelValue: value,
      'onUpdate:modelValue': (val: any) => ((formModel as any)[prop] = val),
      placeholder: field.placeholder || `请输入${field.label}`,
    }
  }
  if (field.type === 'select') {
    return {
      modelValue: value,
      'onUpdate:modelValue': (val: any) => ((formModel as any)[prop] = val),
      placeholder: field.placeholder || `请选择${field.label}`,
    }
  }
  if (field.type === 'number') {
    return {
      modelValue: value,
      'onUpdate:modelValue': (val: any) => ((formModel as any)[prop] = val),
      controls: false,
    }
  }
  if (field.type === 'date' || field.type === 'datetime') {
    return {
      modelValue: value,
      'onUpdate:modelValue': (val: any) => ((formModel as any)[prop] = val),
      type: field.type,
      clearable: true,
      'value-format': field.type === 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss',
      placeholder: field.placeholder || `请选择${field.label}`,
    }
  }
  if (field.type === 'image') {
    return {
      fileUrls: value as string,
      action: 'file/upload',
      limit: 1,
      onChange: (val: string) => ((formModel as any)[prop] = val),
    }
  }
  if (field.type === 'richtext') {
    return {
      value: value as string,
      action: 'file/upload',
      'onUpdate:value': (val: string) => ((formModel as any)[prop] = val),
    }
  }
  return {
    modelValue: value,
    'onUpdate:modelValue': (val: any) => ((formModel as any)[prop] = val),
    placeholder: field.placeholder || `请输入${field.label}`,
    clearable: true,
  }
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate()
  await submit(mode.value === 'edit')
  emit('success')
}

function handleCancel() {
  emit('cancel')
}

function resetForm() {
  resetModuleForm()
  formRef.value?.clearValidate()
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

:deep(.el-card) {
  @include glass-card();
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;

  h2 {
    margin: 0;
    letter-spacing: 0.2em;
    color: $color-text-primary;
  }
}

:deep(.el-form) {
  @include form-field-dark;

  .el-form-item__label {
    color: $color-text-secondary;
  }
}

.form-actions {
  margin-top: 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .form-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  :deep(.el-form) {
    .el-form-item {
      .el-form-item__label {
        width: 100% !important;
        text-align: left;
        margin-bottom: 8px;
      }

      .el-form-item__content {
        margin-left: 0 !important;
      }
    }
  }

  .form-actions {
    flex-direction: column;
    align-items: stretch;

    .el-button {
      width: 100%;
    }
  }
}
</style>
