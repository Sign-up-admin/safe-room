<template>
  <div class="password-page">
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <el-icon class="header-icon"><Lock /></el-icon>
          <h1 class="page-title">修改密码</h1>
          <p class="page-subtitle">定期更换密码可提高账户安全性</p>
        </div>
      </div>
    </div>

    <div class="content-wrapper">
      <el-card v-loading="loading" class="password-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <div class="header-title">
              <el-icon class="title-icon"><Lock /></el-icon>
              <h2>密码设置</h2>
            </div>
          </div>
        </template>

        <el-form ref="formRef" :model="form" :rules="formRules" label-width="140px" class="password-form">
          <el-form-item label="原密码" prop="oldPassword">
            <el-input
              v-model="form.oldPassword"
              type="password"
              autocomplete="current-password"
              placeholder="请输入当前密码"
              size="large"
              show-password
              clearable
              prefix-icon="Lock"
            />
            <div class="field-hint">
              <el-icon><InfoFilled /></el-icon>
              <span>请输入您当前使用的登录密码</span>
            </div>
          </el-form-item>

          <el-form-item label="新密码" prop="newPassword">
            <el-input
              v-model="form.newPassword"
              type="password"
              autocomplete="new-password"
              placeholder="请输入新密码"
              size="large"
              show-password
              clearable
              prefix-icon="Lock"
              @input="checkPasswordStrength"
            />
            <div class="field-hint">
              <el-icon><InfoFilled /></el-icon>
              <span>至少8位，包含字母和数字</span>
            </div>

            <!-- Password Strength Indicator -->
            <div v-if="form.newPassword && form.newPassword.length > 0" class="password-strength">
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
          </el-form-item>

          <el-form-item label="确认新密码" prop="confirmPassword">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              autocomplete="new-password"
              placeholder="请再次输入新密码"
              size="large"
              show-password
              clearable
              prefix-icon="Lock"
            />
            <div class="field-hint">
              <el-icon><InfoFilled /></el-icon>
              <span>请再次输入新密码以确认</span>
            </div>
          </el-form-item>

          <!-- Security Tips -->
          <div class="security-tips">
            <h4 class="tips-title">
              <el-icon><Warning /></el-icon>
              密码安全提示
            </h4>
            <ul class="tips-list">
              <li>密码长度至少8位，建议12位以上</li>
              <li>包含大小写字母、数字和特殊字符</li>
              <li>不要使用生日、姓名等容易被猜到的密码</li>
              <li>定期更换密码，建议每3-6个月更换一次</li>
              <li>不要与其他账户使用相同的密码</li>
            </ul>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <el-button size="large" @click="resetForm">重置</el-button>
            <el-button type="primary" size="large" :loading="submitting" class="submit-btn" @click="updatePassword">
              <span v-if="!submitting">更新密码</span>
              <span v-else>更新中...</span>
            </el-button>
          </div>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts" name="UpdatePassword">
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Lock, InfoFilled, Warning } from '@element-plus/icons-vue'
import http from '@/utils/http'
import storage from '@/utils/storage'
import { validateInput, containsSqlInjection, containsXss } from '@/utils/validator'

interface PasswordStrength {
  level: 'weak' | 'medium' | 'strong'
  percentage: number
  text: string
}

const router = useRouter()
const formRef = ref<FormInstance>()
const tableName = storage.get('sessionTable') || 'users'
const loading = ref(false)
const submitting = ref(false)
const user = ref<Record<string, any> | null>(null)
const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// Password strength calculation
const passwordStrength = computed<PasswordStrength>(() => {
  const password = form.newPassword || ''
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

// Form validation rules
const formRules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (!value) {
          callback()
          return
        }
        if (containsSqlInjection(value) || containsXss(value)) {
          callback(new Error('密码包含非法字符'))
          return
        }
        callback()
      },
      trigger: 'blur',
    },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    {
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
        if (value === form.oldPassword) {
          callback(new Error('新密码不能与原密码相同'))
          return
        }
        callback()
      },
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (_rule: any, value: any, callback: any) => {
        if (!value) {
          callback()
          return
        }
        if (value !== form.newPassword) {
          callback(new Error('两次输入的新密码不一致'))
          return
        }
        callback()
      },
      trigger: 'blur',
    },
  ],
}

onMounted(() => {
  fetchUser()
})

async function fetchUser() {
  loading.value = true
  try {
    const response = await http.get(`/${tableName}/session`)
    if (response.data.code === 0) {
      user.value = response.data.data
    } else {
      ElMessage.error(response.data.msg || '获取用户信息失败')
    }
  } catch (error: any) {
    console.error(error)
    const errorMsg = error?.response?.data?.msg || error?.message || '获取用户信息失败'
    ElMessage.error(errorMsg)
  } finally {
    loading.value = false
  }
}

function checkPasswordStrength() {
  // Trigger validation when password changes
  if (form.newPassword) {
    formRef.value?.validateField('newPassword')
  }
}

function resetForm() {
  form.oldPassword = ''
  form.newPassword = ''
  form.confirmPassword = ''
  formRef.value?.clearValidate()
}

async function updatePassword() {
  if (!user.value) {
    ElMessage.error('用户信息未加载，请刷新页面重试')
    return
  }

  try {
    await formRef.value?.validate()
  } catch {
    ElMessage.error('请检查表单填写是否正确')
    return
  }

  // Additional validation
  if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
    ElMessage.error('请输入完整信息')
    return
  }

  if (form.newPassword !== form.confirmPassword) {
    ElMessage.error('两次输入的新密码不一致')
    return
  }

  // Verify old password
  const current = user.value.mima || user.value.password
  if (form.oldPassword !== current) {
    ElMessage.error('原密码错误')
    return
  }

  // Security validation
  const oldPasswordValidation = validateInput(form.oldPassword)
  const newPasswordValidation = validateInput(form.newPassword)

  if (!oldPasswordValidation.isValid || !newPasswordValidation.isValid) {
    ElMessage.error('密码包含非法字符，请检查后重试')
    return
  }

  // Confirm before update
  try {
    await ElMessageBox.confirm('确定要更新密码吗？更新后需要重新登录。', '确认更新密码', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }

  submitting.value = true
  try {
    const payload = { ...user.value, password: form.newPassword, mima: form.newPassword }
    const response = await http.post(`/${tableName}/update`, payload)

    if (response.data.code === 0) {
      ElMessage.success('密码更新成功，请重新登录')
      // Clear form
      resetForm()
      // Clear storage and redirect to login
      setTimeout(() => {
        storage.clear()
        router.replace({ name: 'login' })
      }, 1500)
    } else {
      ElMessage.error(response.data.msg || '密码更新失败')
    }
  } catch (error: any) {
    console.error(error)
    const errorMsg = error?.response?.data?.msg || error?.message || '密码更新失败'
    ElMessage.error(errorMsg)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/tokens' as *;
@use '@/styles/mixins' as *;

.password-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 0;
}

.page-header {
  background: linear-gradient(135deg, #3a80ff 0%, #4a90ff 100%);
  padding: 48px 32px;
  color: white;
  margin-bottom: 32px;
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
}

.header-info {
  text-align: center;
}

.header-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.9;
}

.page-title {
  margin: 0 0 8px;
  font-size: 32px;
  font-weight: 700;
  color: white;
}

.page-subtitle {
  margin: 0;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  opacity: 0.9;
}

.content-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 32px 32px;
}

.password-card {
  border-radius: 16px;
  overflow: hidden;

  :deep(.el-card__body) {
    padding: 32px;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;

  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #1a202c;
  }
}

.title-icon {
  font-size: 24px;
  color: #3a80ff;
}

// 表单样式已提取到 components/_forms.scss
// 密码强度指示器样式已提取到 components/_password-strength.scss
// 安全提示样式已提取到 components/_security.scss
// 使用 .password-form, .field-hint, .password-strength, .security-tips 等类名即可应用统一样式

.tips-list {
  margin: 0;
  padding-left: 24px;
  list-style: none;

  li {
    position: relative;
    margin-bottom: 8px;
    font-size: 14px;
    color: #4a5568;
    line-height: 1.6;

    &::before {
      content: '•';
      position: absolute;
      left: -16px;
      color: #e6a23c;
      font-weight: bold;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}

// Form Actions
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.submit-btn {
  min-width: 140px;
  border-radius: 8px;
  font-weight: 500;
}

// Responsive Design
@media (width <= 992px) {
  .content-wrapper {
    padding: 0 24px 24px;
  }

  .page-header {
    padding: 32px 24px;
  }

  .page-title {
    font-size: 28px;
  }
}

@media (width <= 768px) {
  .password-card {
    :deep(.el-card__body) {
      padding: 24px;
    }
  }

  .form-actions {
    flex-direction: column-reverse;

    .el-button {
      width: 100%;
    }
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

@media (width <= 480px) {
  .page-header {
    padding: 24px 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .header-icon {
    font-size: 40px;
  }

  .content-wrapper {
    padding: 0 16px 16px;
  }

  .password-card {
    :deep(.el-card__body) {
      padding: 20px;
    }
  }
}
</style>
