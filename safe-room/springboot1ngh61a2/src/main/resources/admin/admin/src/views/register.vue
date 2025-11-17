<template>
  <div class="register-page">
    <div class="register-background">
      <div class="background-pattern"></div>
      <div class="background-gradient"></div>
    </div>

    <div class="register-container">
      <el-card class="register-card" shadow="always">
        <div class="register-card__header">
          <div class="logo-section">
            <div class="logo-icon">
              <el-icon size="32"><UserFilled /></el-icon>
            </div>
            <p class="eyebrow">CREATE ACCOUNT</p>
            <h1>创建后台账号</h1>
            <p class="subtitle">选择角色并填写必要信息完成注册</p>
          </div>
        </div>

        <!-- Role Selection -->
        <div class="role-selection">
          <el-radio-group v-model="activeRole" class="role-radio-group">
            <el-radio-button v-for="role in roleOptions" :key="role.value" :value="role.value" class="role-radio">
              <el-icon v-if="role.icon === 'User'" class="role-icon"><User /></el-icon>
              <el-icon v-else-if="role.icon === 'Avatar'" class="role-icon"><Avatar /></el-icon>
              <span>{{ role.label }}</span>
            </el-radio-button>
          </el-radio-group>
        </div>

        <!-- Registration Form -->
        <el-form ref="formRef" :model="formModel" :rules="formRules" label-position="top" class="register-form">
          <el-form-item
            v-for="field in currentFields"
            :key="field.prop"
            :label="field.label"
            :prop="field.prop"
            :required="field.required"
          >
            <el-input
              v-model="formModel[field.prop]"
              :type="field.type || 'text'"
              :placeholder="'请输入' + field.label"
              size="large"
              :prefix-icon="getFieldIcon(field.icon)"
              :show-password="field.type === 'password'"
              clearable
              @blur="validateField(field.prop)"
            />
            <div v-if="field.hint" class="field-hint">
              <el-icon><InfoFilled /></el-icon>
              <span>{{ field.hint }}</span>
            </div>
          </el-form-item>

          <!-- Password Strength Indicator -->
          <div v-if="formModel['mima'] && formModel['mima'].length > 0" class="password-strength">
            <div class="strength-label">密码强度：</div>
            <div class="strength-bar">
              <div
                class="strength-fill"
                :class="passwordStrength.level"
                :style="{ width: passwordStrength.percentage + '%' }"
              ></div>
            </div>
            <span class="strength-text" :class="passwordStrength.level">
              {{ passwordStrength.text }}
            </span>
          </div>

          <!-- Terms Agreement -->
          <el-form-item>
            <el-checkbox v-model="agreeTerms" class="terms-checkbox">
              我已阅读并同意
              <a href="#" class="terms-link" @click.prevent="showTerms">《用户协议》</a>
              和
              <a href="#" class="terms-link" @click.prevent="showPrivacy">《隐私政策》</a>
            </el-checkbox>
          </el-form-item>

          <!-- Submit Button -->
          <el-form-item>
            <el-button
              type="primary"
              class="submit-btn"
              size="large"
              :loading="submitting"
              :disabled="!agreeTerms"
              @click="handleSubmit"
            >
              <span v-if="!submitting">立即注册</span>
              <span v-else>注册中...</span>
            </el-button>
          </el-form-item>
        </el-form>

        <!-- Footer Links -->
        <div class="register-footer">
          <div class="footer-links">
            <span>已有账号？</span>
            <a href="#" class="footer-link" @click.prevent="gotoLogin">立即登录</a>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts" name="RegisterView">
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { UserFilled, InfoFilled, User, Avatar } from '@element-plus/icons-vue'
import http from '@/utils/http'
import { validateInput, containsSqlInjection, containsXss } from '@/utils/validator'

interface FieldConfig {
  prop: string
  label: string
  required?: boolean
  type?: 'text' | 'password'
  icon?: string
  hint?: string
}

interface PasswordStrength {
  level: 'weak' | 'medium' | 'strong'
  percentage: number
  text: string
}

const router = useRouter()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const activeRole = ref<'yonghu' | 'jianshenjiaolian'>('yonghu')
const agreeTerms = ref(false)

const roleOptions = [
  { label: '会员用户', value: 'yonghu', icon: 'User' },
  { label: '健身教练', value: 'jianshenjiaolian', icon: 'Avatar' },
]

const roleFields: Record<'yonghu' | 'jianshenjiaolian', FieldConfig[]> = {
  yonghu: [
    {
      prop: 'yonghuzhanghao',
      label: '用户账号',
      required: true,
      icon: 'User',
      hint: '3-20个字符，支持字母、数字、下划线',
    },
    {
      prop: 'mima',
      label: '密码',
      required: true,
      type: 'password',
      hint: '至少8位，包含字母和数字',
    },
    {
      prop: 'mima2',
      label: '确认密码',
      required: true,
      type: 'password',
    },
    {
      prop: 'yonghuxingming',
      label: '姓名',
      required: true,
      icon: 'UserFilled',
    },
    {
      prop: 'shoujihaoma',
      label: '手机号',
      icon: 'Phone',
      hint: '11位手机号码',
    },
  ],
  jianshenjiaolian: [
    {
      prop: 'jiaoliangonghao',
      label: '教练工号',
      required: true,
      icon: 'Avatar',
      hint: '教练唯一工号',
    },
    {
      prop: 'mima',
      label: '密码',
      required: true,
      type: 'password',
      hint: '至少8位，包含字母和数字',
    },
    {
      prop: 'mima2',
      label: '确认密码',
      required: true,
      type: 'password',
    },
    {
      prop: 'jiaolianxingming',
      label: '教练姓名',
      required: true,
      icon: 'UserFilled',
    },
    {
      prop: 'lianxidianhua',
      label: '联系电话',
      icon: 'Phone',
      hint: '11位手机号码',
    },
  ],
}

const formModel = reactive<Record<string, any>>({})
const currentFields = computed(() => roleFields[activeRole.value])

// Form validation rules
const formRules = computed<FormRules>(() => {
  const rules: FormRules = {}

  currentFields.value.forEach(field => {
    if (field.required) {
      rules[field.prop] = [{ required: true, message: `请输入${field.label}`, trigger: 'blur' }]

      // Add specific validation rules
      if (field.prop === 'yonghuzhanghao' || field.prop === 'jiaoliangonghao') {
        const ruleArray = rules[field.prop] as any[]
        if (Array.isArray(ruleArray)) {
          ruleArray.push({
            validator: (_rule: any, value: any, callback: any) => {
              if (!value) {
                callback()
                return
              }
              if (containsSqlInjection(value) || containsXss(value)) {
                callback(new Error('账号包含非法字符'))
                return
              }
              if (value.length < 3 || value.length > 20) {
                callback(new Error('账号长度应在3-20个字符之间'))
                return
              }
              if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                callback(new Error('账号只能包含字母、数字和下划线'))
                return
              }
              callback()
            },
            trigger: 'blur',
          })
        }
      }

      if (field.prop === 'mima') {
        const ruleArray = rules[field.prop] as any[]
        if (Array.isArray(ruleArray)) {
          ruleArray.push({
            validator: (_rule: any, value: any, callback: any) => {
              if (!value) {
                callback()
                return
              }
              if (containsSqlInjection(value) || containsXss(value)) {
                callback(new Error('密码包含非法字符'))
                return
              }
              if (value.length < 8) {
                callback(new Error('密码长度至少8位'))
                return
              }
              if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(value)) {
                callback(new Error('密码必须包含字母和数字'))
                return
              }
              callback()
            },
            trigger: 'blur',
          })
        }
      }

      if (field.prop === 'mima2') {
        const ruleArray = rules[field.prop] as any[]
        if (Array.isArray(ruleArray)) {
          ruleArray.push({
            validator: (_rule: any, value: any, callback: any) => {
              if (!value) {
                callback()
                return
              }
              if (value !== formModel['mima']) {
                callback(new Error('两次密码输入不一致'))
                return
              }
              callback()
            },
            trigger: 'blur',
          })
        }
      }

      if (field.prop === 'yonghuxingming' || field.prop === 'jiaolianxingming') {
        const ruleArray = rules[field.prop] as any[]
        if (Array.isArray(ruleArray)) {
          ruleArray.push({
            validator: (_rule: any, value: any, callback: any) => {
              if (!value) {
                callback()
                return
              }
              if (containsSqlInjection(value) || containsXss(value)) {
                callback(new Error('姓名包含非法字符'))
                return
              }
              if (value.length > 20) {
                callback(new Error('姓名长度不能超过20个字符'))
                return
              }
              callback()
            },
            trigger: 'blur',
          })
        }
      }
    }

    if (field.prop === 'shoujihaoma' || field.prop === 'lianxidianhua') {
      rules[field.prop] = [
        {
          validator: (_rule: any, value: any, callback: any) => {
            if (!value) {
              callback()
              return
            }
            if (!/^1[3-9]\d{9}$/.test(value)) {
              callback(new Error('请输入正确的手机号码'))
              return
            }
            callback()
          },
          trigger: 'blur',
        },
      ]
    }
  })

  return rules
})

// Password strength calculation
const passwordStrength = computed<PasswordStrength>(() => {
  const password = formModel['mima'] || ''
  if (!password) {
    return { level: 'weak', percentage: 0, text: '' }
  }

  let strength = 0
  if (password.length >= 8) strength += 1
  if (password.length >= 12) strength += 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1
  if (/\d/.test(password)) strength += 1
  if (/[^a-zA-Z0-9]/.test(password)) strength += 1

  if (strength <= 2) {
    return { level: 'weak', percentage: 33, text: '弱' }
  } else if (strength <= 4) {
    return { level: 'medium', percentage: 66, text: '中' }
  } else {
    return { level: 'strong', percentage: 100, text: '强' }
  }
})

watch(
  () => activeRole.value,
  () => {
    resetForm()
    agreeTerms.value = false
  },
  { immediate: true },
)

function resetForm() {
  Object.keys(formModel).forEach(key => delete formModel[key])
  currentFields.value.forEach(field => {
    formModel[field.prop] = ''
  })
  formRef.value?.clearValidate()
}

function validateField(prop: string) {
  formRef.value?.validateField(prop)
}

async function handleSubmit() {
  if (!agreeTerms.value) {
    ElMessage.warning('请先阅读并同意用户协议和隐私政策')
    return
  }

  try {
    await formRef.value?.validate()
  } catch {
    ElMessage.error('请检查表单填写是否正确')
    return
  }

  // Additional validation
  if (formModel['mima'] !== formModel['mima2']) {
    ElMessage.error('两次密码输入不一致')
    return
  }

  // Security validation
  const usernameField = activeRole.value === 'yonghu' ? 'yonghuzhanghao' : 'jiaoliangonghao'
  const usernameValidation = validateInput(formModel[usernameField])
  const passwordValidation = validateInput(formModel['mima'])

  if (!usernameValidation.isValid || !passwordValidation.isValid) {
    ElMessage.error('输入包含非法字符，请检查后重试')
    return
  }

  submitting.value = true

  try {
    const payload = { ...formModel }
    delete payload['mima2']

    const response = await http.post(`/${activeRole.value}/register`, payload)

    if (response.data.code === 0) {
      ElMessage.success('注册成功，请登录')
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } else {
      ElMessage.error(response.data.msg || '注册失败')
    }
  } catch (error: any) {
    console.error(error)
    const errorMsg = error?.response?.data?.msg || error?.message || '注册失败'
    ElMessage.error(errorMsg)
  } finally {
    submitting.value = false
  }
}

function gotoLogin() {
  router.push('/login')
}

function showTerms() {
  ElMessageBox.alert('用户协议内容...', '用户协议', {
    confirmButtonText: '我知道了',
  })
}

function showPrivacy() {
  ElMessageBox.alert('隐私政策内容...', '隐私政策', {
    confirmButtonText: '我知道了',
  })
}

function getFieldIcon(iconName?: string) {
  if (!iconName) return undefined
  const iconMap: Record<string, string> = {
    User: 'User',
    UserFilled: 'UserFilled',
    Phone: 'Phone',
    Avatar: 'Avatar',
  }
  return iconMap[iconName]
}
</script>

<style scoped lang="scss">
@use '@/styles/tokens' as *;
@use '@/styles/mixins' as *;

.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  position: relative;
  overflow: hidden;
}

.register-background {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.background-pattern {
  position: absolute;
  inset: 0;
}

.background-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #091628, #101f3d);
}

.register-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: min(640px, 100%);
}

.register-card {
  width: 100%;
  border-radius: 24px;
  padding: 48px 40px;
  background: #ffffff !important;
  box-shadow: 0 30px 80px rgba(10, 24, 64, 0.45) !important;
  border: none !important;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  :deep(.el-card__body) {
    padding: 0;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 35px 90px rgba(10, 24, 64, 0.5) !important;
  }
}

.register-card__header {
  margin-bottom: 32px;
  text-align: center;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #3a80ff;
  border-radius: 16px;
  color: white;
  margin-bottom: 8px;
  box-shadow: 0 8px 20px rgba(58, 128, 255, 0.3);
}

.eyebrow {
  color: #3a80ff;
  letter-spacing: 0.3em;
  font-size: 12px;
  font-weight: 600;
  margin: 0;
  text-transform: uppercase;
}

h1 {
  margin: 8px 0;
  color: #1a202c;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.subtitle {
  margin: 0;
  color: #718096;
  font-size: 14px;
  line-height: 1.5;
}

// Role Selection
.role-selection {
  margin-bottom: 32px;
  padding: 20px;
  background: rgba(58, 128, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(58, 128, 255, 0.1);
}

.role-radio-group {
  width: 100%;
  display: flex;
  gap: 12px;

  :deep(.el-radio-button) {
    flex: 1;

    .el-radio-button__inner {
      width: 100%;
      border-radius: 8px;
      transition: all 0.3s ease;
      padding: 16px;
      font-size: 14px;
      border: 1px solid #e2e8f0;
      background-color: #ffffff;
      color: #4a5568;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    &.is-active .el-radio-button__inner {
      background-color: #3a80ff;
      border-color: #3a80ff;
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(58, 128, 255, 0.3);
    }
  }
}

.role-icon {
  font-size: 20px;
}

// 表单样式已提取到 components/_forms.scss
// 密码强度指示器样式已提取到 components/_password-strength.scss
// 使用 .register-form, .field-hint, .password-strength 等类名即可应用统一样式

// Terms Checkbox
.terms-checkbox {
  :deep(.el-checkbox__label) {
    color: #4a5568;
    font-size: 14px;
    line-height: 1.6;
  }

  .terms-link {
    color: #3a80ff;
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
      color: #4a90ff;
      text-decoration: underline;
    }
  }
}

// Submit Button
.submit-btn {
  width: 100%;
  margin-top: 8px;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  background: #3a80ff !important;
  border: none !important;
  box-shadow: 0 8px 20px rgba(58, 128, 255, 0.3);
  transition: all 0.3s ease;
  color: #ffffff !important;

  &:focus {
    box-shadow: 0 0 0 4px rgba(58, 128, 255, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: #4a90ff !important;
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(58, 128, 255, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
}

// Footer
.register-footer {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
  text-align: center;
  width: 100%;
}

.footer-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: #718096;

  .footer-link {
    color: #3a80ff;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s ease;

    &:hover {
      color: #4a90ff;
      text-decoration: underline;
    }
  }
}

// Responsive Design
@media (width <= 992px) {
  .register-card {
    padding: 32px 24px;
  }

  h1 {
    font-size: 22px;
  }
}

@media (width <= 768px) {
  .register-page {
    padding: 20px;
  }

  .register-card {
    padding: 32px 24px;
    border-radius: 16px;
  }

  h1 {
    font-size: 20px;
  }

  .logo-icon {
    width: 56px;
    height: 56px;
  }

  .role-radio-group {
    flex-direction: column;
    gap: 8px;
  }

  .role-selection {
    padding: 16px;
  }
}

@media (width <= 480px) {
  .register-card {
    padding: 24px 20px;
  }

  .password-strength {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .strength-bar {
    width: 100%;
  }
}
</style>
