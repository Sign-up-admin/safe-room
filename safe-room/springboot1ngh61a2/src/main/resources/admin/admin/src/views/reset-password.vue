<template>
  <div class="reset-password-page">
    <div class="reset-password-background">
      <div class="background-pattern"></div>
      <div class="background-gradient"></div>
    </div>

    <div class="reset-password-container">
      <el-card class="reset-password-card" shadow="always">
        <div class="reset-password-card__header">
          <div class="logo-section">
            <div class="logo-icon">
              <el-icon size="32"><Lock /></el-icon>
            </div>
            <p class="eyebrow">RESET PASSWORD</p>
            <h1>设置新密码</h1>
            <p class="subtitle">请设置您的新密码</p>
          </div>
        </div>

        <!-- 验证链接状态 -->
        <div v-if="verifyingLink" class="verifying-section">
          <el-icon class="is-loading" size="24">
            <Loading />
          </el-icon>
          <p>正在验证链接有效性...</p>
        </div>

        <!-- 链接无效 -->
        <div v-else-if="!isValidLink" class="invalid-link-section">
          <el-icon size="48" color="#F56C6C">
            <Warning />
          </el-icon>
          <h3>链接无效或已过期</h3>
          <p>此密码重置链接无效、已过期或已被使用。</p>
          <el-button type="primary" @click="$router.push('/forgot-password')"> 重新申请重置 </el-button>
        </div>

        <!-- 重置密码表单 -->
        <el-form v-else ref="formRef" :model="form" :rules="rules" label-position="top" class="reset-password-form">
          <!-- 账号信息显示 -->
          <div class="account-info">
            <el-descriptions :column="1" size="small">
              <el-descriptions-item label="账号">{{ linkData.username }}</el-descriptions-item>
              <el-descriptions-item label="角色">{{ linkData.roleName }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <el-form-item label="新密码" prop="password">
            <el-input
              v-model="form.password"
              placeholder="请输入新密码"
              type="password"
              show-password
              autocomplete="new-password"
              size="large"
              @keyup.enter="handleReset"
            />
            <div class="field-hint">
              <el-icon><InfoFilled /></el-icon>
              <span>密码长度8-20位，必须包含字母和数字</span>
            </div>
          </el-form-item>

          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="form.confirmPassword"
              placeholder="请再次输入新密码"
              type="password"
              show-password
              autocomplete="new-password"
              size="large"
              @keyup.enter="handleReset"
            />
            <div class="field-hint">
              <el-icon><InfoFilled /></el-icon>
              <span>请再次输入相同的新密码</span>
            </div>
          </el-form-item>

          <el-button type="primary" class="submit-btn" size="large" :loading="submitting" @click="handleReset">
            <span v-if="!submitting">设置新密码</span>
            <span v-else>设置中...</span>
          </el-button>
        </el-form>

        <div class="reset-password-footer">
          <div class="footer-links">
            <a href="#" class="footer-link" @click.prevent="gotoLogin">返回登录</a>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts" name="ResetPassword">
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Lock, InfoFilled, Loading, Warning } from '@element-plus/icons-vue'
import http from '@/utils/http'
import { securityAuditor, SecurityEventType } from '@/utils/securityAudit'

interface LinkData {
  username: string
  roleName: string
  roleTable: string
  token: string
  expires: number
}

const router = useRouter()
const route = useRoute()
const formRef = ref<FormInstance>()
const verifyingLink = ref(true)
const isValidLink = ref(false)
const submitting = ref(false)

const linkData = ref<LinkData>({
  username: '',
  roleName: '',
  roleTable: '',
  token: '',
  expires: 0,
})

const form = reactive({
  password: '',
  confirmPassword: '',
})

const rules: FormRules<typeof form> = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (!value) return callback()
        if (value.length < 8 || value.length > 20) {
          callback(new Error('密码长度必须在8-20位之间'))
          return
        }
        if (!/^(?=.*[a-zA-Z])(?=.*\d)/.test(value)) {
          callback(new Error('密码必须包含字母和数字'))
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
      validator: (_rule, value, callback) => {
        if (!value) return callback()
        if (value !== form.password) {
          callback(new Error('两次输入的密码不一致'))
          return
        }
        callback()
      },
      trigger: 'blur',
    },
  ],
}

// 验证重置链接
async function verifyResetLink() {
  const token = route.query.token as string
  const username = route.query.username as string

  if (!token || !username) {
    isValidLink.value = false
    verifyingLink.value = false
    return
  }

  try {
    const response = await http.post('/verifyResetToken', {
      token,
      username,
    })

    const data = response.data
    if (data.code === 0 && data.data) {
      linkData.value = data.data
      isValidLink.value = true

      // 记录链接验证成功事件
      securityAuditor.logEvent(SecurityEventType.RESET_LINK_VERIFIED, {
        username: data.data.username,
        roleName: data.data.roleName,
        token: token.substring(0, 8) + '...', // 只记录部分token
      })
    } else {
      isValidLink.value = false

      // 记录链接验证失败事件
      securityAuditor.logEvent(SecurityEventType.RESET_LINK_INVALID, {
        username,
        token: token.substring(0, 8) + '...',
        reason: data.msg || 'invalid_token',
      })
    }
  } catch (error: any) {
    console.error('验证重置链接失败:', error)
    isValidLink.value = false

    // 记录链接验证失败事件
    securityAuditor.logEvent(SecurityEventType.RESET_LINK_INVALID, {
      username,
      token: token.substring(0, 8) + '...',
      error: error.message,
    })
  } finally {
    verifyingLink.value = false
  }
}

// 设置新密码
async function handleReset() {
  if (submitting.value || !isValidLink.value) return

  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    const response = await http.post('/resetPasswordByToken', {
      token: linkData.value.token,
      username: linkData.value.username,
      newPassword: form.password,
    })

    const data = response.data
    if (data.code === 0) {
      // 记录密码重置成功事件
      securityAuditor.logEvent(SecurityEventType.PASSWORD_RESET_SUCCESS, {
        username: linkData.value.username,
        roleName: linkData.value.roleName,
        method: 'reset_link',
      })

      ElMessage.success('密码设置成功，请使用新密码登录')

      // 延迟跳转到登录页
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      throw new Error(data.msg || '密码设置失败')
    }
  } catch (error: any) {
    console.error('设置密码失败:', error)
    const errorMsg = error?.response?.data?.msg || error?.message || '密码设置失败，请稍后重试'
    ElMessage.error(errorMsg)

    // 记录密码重置失败事件
    securityAuditor.logEvent(SecurityEventType.PASSWORD_RESET_FAILURE, {
      username: linkData.value.username,
      roleName: linkData.value.roleName,
      method: 'reset_link',
      errorMessage: errorMsg,
    })
  } finally {
    submitting.value = false
  }
}

function gotoLogin() {
  router.push('/login')
}

onMounted(() => {
  verifyResetLink()
})
</script>

<style scoped lang="scss">
@use '@/styles/tokens' as *;

.reset-password-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  position: relative;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
}

.reset-password-background {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
}

.background-pattern {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.background-gradient {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #091628, #101f3d);
}

.reset-password-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 520px;
  box-sizing: border-box;
  margin: 0 auto;
}

.reset-password-card {
  width: 100%;
  border-radius: 24px;
  padding: 48px 40px;
  background: #ffffff !important;
  box-shadow: 0 30px 80px rgba(10, 24, 64, 0.45) !important;
  border: none !important;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  box-sizing: border-box;
  position: relative;
  display: block;

  :deep(.el-card__body) {
    padding: 0 !important;
    width: 100%;
    box-sizing: border-box;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 35px 90px rgba(10, 24, 64, 0.5) !important;
  }
}

.reset-password-card__header {
  margin-bottom: 32px;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
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
  flex-shrink: 0;
}

.eyebrow {
  color: #3a80ff;
  letter-spacing: 0.3em;
  font-size: 12px;
  font-weight: 600;
  margin: 0;
  text-transform: uppercase;
  line-height: 1.5;
}

h1 {
  margin: 8px 0;
  color: #1a202c;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
  line-height: 1.3;
}

.subtitle {
  margin: 0;
  color: #718096;
  font-size: 14px;
  line-height: 1.5;
}

.verifying-section {
  text-align: center;
  padding: 40px 20px;

  p {
    margin: 16px 0 0;
    color: #718096;
    font-size: 14px;
  }
}

.invalid-link-section {
  text-align: center;
  padding: 40px 20px;

  h3 {
    margin: 16px 0 8px;
    color: #303133;
    font-size: 18px;
    font-weight: 600;
  }

  p {
    margin: 0 0 24px;
    color: #909399;
    font-size: 14px;
    line-height: 1.5;
  }
}

.account-info {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.reset-password-form {
  width: 100%;
  box-sizing: border-box;
}

.field-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 12px;
  color: #718096;
  line-height: 1.5;

  .el-icon {
    font-size: 14px;
    color: #3a80ff;
  }
}

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
  cursor: pointer;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;

  &:focus {
    box-shadow: 0 0 0 4px rgba(58, 128, 255, 0.2);
    outline: none;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
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

.reset-password-footer {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
}

.footer-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
  width: 100%;
  box-sizing: border-box;

  a {
    white-space: nowrap;
    flex-shrink: 0;
  }
}

.footer-link {
  color: #3a80ff;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
  display: inline-block;
  line-height: 1.5;
  cursor: pointer;

  &:hover {
    color: #4a90ff;
    text-decoration: underline;
  }

  &:focus {
    outline: none;
    text-decoration: underline;
  }
}

.divider {
  color: #cbd5e0;
  font-size: 14px;
  user-select: none;
  white-space: nowrap;
  flex-shrink: 0;
}

// 响应式设计
@media (width <= 992px) {
  .reset-password-card {
    padding: 32px 24px;
  }

  h1 {
    font-size: 22px;
  }
}

@media (width <= 768px) {
  .reset-password-page {
    padding: 20px;
  }

  .reset-password-card {
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
}

@media (width <= 480px) {
  .reset-password-page {
    padding: 16px;
  }

  .reset-password-card {
    padding: 24px 20px;
    border-radius: 12px;
  }

  .reset-password-card__header {
    margin-bottom: 24px;
  }

  h1 {
    font-size: 18px;
  }

  .subtitle {
    font-size: 13px;
  }

  .footer-links {
    flex-direction: column;
    gap: 8px;
    align-items: center;
  }

  .divider {
    display: none;
  }

  .submit-btn {
    height: 44px;
    font-size: 15px;
  }

  .account-info {
    padding: 12px;
    margin-bottom: 20px;
  }
}
</style>
