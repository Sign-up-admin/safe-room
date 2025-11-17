<template>
  <div class="forgot-password-page">
    <div class="forgot-password-background">
      <div class="background-pattern"></div>
      <div class="background-gradient"></div>
    </div>

    <div class="forgot-password-container">
      <el-card class="forgot-password-card" shadow="always">
        <div class="forgot-password-card__header">
          <div class="logo-section">
            <div class="logo-icon">
              <el-icon size="32"><Lock /></el-icon>
            </div>
            <p class="eyebrow">RESET PASSWORD</p>
            <h1>忘记密码</h1>
            <p class="subtitle">请输入账号，系统将重置密码为默认密码</p>
          </div>
        </div>

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="forgot-password-form">
          <el-form-item v-if="roleOptions.length > 1" label="角色类型" prop="roleName">
            <el-select v-model="form.roleName" placeholder="请选择账号角色" size="large" style="width: 100%" clearable>
              <el-option
                v-for="role in roleOptions"
                :key="role.roleName"
                :label="role.roleName"
                :value="role.roleName"
              />
            </el-select>
            <div class="field-hint">
              <el-icon><InfoFilled /></el-icon>
              <span>选择您要重置密码的账号所属角色</span>
            </div>
          </el-form-item>

          <el-form-item label="账号" prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入需要重置密码的账号"
              autocomplete="username"
              clearable
              size="large"
              prefix-icon="User"
              @keyup.enter="handleReset"
            />
            <div class="field-hint">
              <el-icon><InfoFilled /></el-icon>
              <span>请输入您注册时使用的账号</span>
            </div>
          </el-form-item>

          <!-- 验证方式选择 -->
          <el-form-item label="验证方式" prop="verificationMethod">
            <el-radio-group v-model="form.verificationMethod" size="large">
              <el-radio label="captcha" border>仅图形验证码</el-radio>
              <el-radio label="phone" border>手机号验证</el-radio>
              <el-radio label="email" border>邮箱验证</el-radio>
            </el-radio-group>
            <div class="field-hint">
              <el-icon><InfoFilled /></el-icon>
              <span>选择密码重置的验证方式</span>
            </div>
          </el-form-item>

          <!-- 手机号验证 -->
          <el-form-item v-if="form.verificationMethod === 'phone'" label="手机号" prop="phone">
            <div class="phone-row">
              <el-input
                v-model="form.phone"
                placeholder="请输入注册手机号"
                autocomplete="tel"
                clearable
                size="large"
                maxlength="11"
              />
              <el-button
                type="primary"
                :disabled="!form.phone || sendingSms"
                :loading="sendingSms"
                @click="sendSmsCode"
              >
                {{ smsCountdown > 0 ? `${smsCountdown}s` : '发送验证码' }}
              </el-button>
            </div>
            <div class="field-hint">
              <el-icon><InfoFilled /></el-icon>
              <span>请输入账号绑定的手机号</span>
            </div>
          </el-form-item>

          <!-- 手机验证码 -->
          <el-form-item v-if="form.verificationMethod === 'phone'" label="短信验证码" prop="smsCode">
            <el-input
              v-model="form.smsCode"
              placeholder="请输入短信验证码"
              autocomplete="off"
              clearable
              size="large"
              maxlength="6"
              @keyup.enter="handleReset"
            />
            <div class="field-hint">
              <el-icon><InfoFilled /></el-icon>
              <span>请输入收到的6位短信验证码</span>
            </div>
          </el-form-item>

          <!-- 邮箱验证 -->
          <el-form-item v-if="form.verificationMethod === 'email'" label="邮箱" prop="email">
            <el-input
              v-model="form.email"
              placeholder="请输入注册邮箱"
              autocomplete="email"
              clearable
              size="large"
              type="email"
            />
            <div class="field-hint">
              <el-icon><InfoFilled /></el-icon>
              <span>请输入账号绑定的邮箱地址</span>
            </div>
          </el-form-item>

          <!-- 发送重置链接按钮（邮箱验证） -->
          <el-form-item v-if="form.verificationMethod === 'email'">
            <el-button
              type="primary"
              :disabled="!form.email || sendingEmail"
              :loading="sendingEmail"
              style="width: 100%"
              @click="sendResetLink"
            >
              {{ sendingEmail ? '发送中...' : '发送重置链接' }}
            </el-button>
            <div class="field-hint">
              <el-icon><InfoFilled /></el-icon>
              <span>点击后将向邮箱发送密码重置链接</span>
            </div>
          </el-form-item>

          <el-form-item label="验证码" prop="captcha">
            <div class="captcha-row">
              <el-input
                v-model="form.captcha"
                placeholder="请输入验证码"
                autocomplete="off"
                clearable
                size="large"
                maxlength="4"
                @keyup.enter="handleReset"
              />
              <Captcha ref="captchaRef" />
            </div>
            <div class="field-hint">
              <el-icon><InfoFilled /></el-icon>
              <span>点击验证码图片可刷新</span>
            </div>
          </el-form-item>

          <el-button type="primary" class="submit-btn" size="large" :loading="submitting" @click="handleReset">
            <span v-if="!submitting">重置密码</span>
            <span v-else>重置中...</span>
          </el-button>
        </el-form>

        <div class="forgot-password-footer">
          <div class="footer-links">
            <a href="#" class="footer-link" @click.prevent="gotoLogin">返回登录</a>
            <span class="divider">|</span>
            <a href="/register" class="footer-link">注册账号</a>
          </div>
          <p class="security-tip-footer">重置后的默认密码为：<strong>123456</strong>，请登录后及时修改</p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts" name="ForgotPassword">
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Lock, InfoFilled } from '@element-plus/icons-vue'
import http from '@/utils/http'
import menu from '@/utils/menu'
import { validateInput, containsSqlInjection, containsXss } from '@/utils/validator'
import { isMobile } from '@/utils/validate'
import { rateLimiter } from '@/utils/rateLimiter'
import { securityAuditor, SecurityEventType } from '@/utils/securityAudit'
import Captcha from '@/components/common/Captcha.vue'

interface RoleOption {
  roleName: string
  tableName: string
}

const router = useRouter()
const formRef = ref<FormInstance>()
const captchaRef = ref()
const submitting = ref(false)
const sendingSms = ref(false)
const sendingEmail = ref(false)
const smsCountdown = ref(0)
const roleOptions = ref<RoleOption[]>([])

const form = reactive({
  username: '',
  roleName: '',
  verificationMethod: 'captcha', // 默认使用图形验证码
  phone: '',
  smsCode: '',
  email: '',
  captcha: '',
})

const rules: FormRules<typeof form> = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (!value) {
          callback()
          return
        }
        const normalizedValue = String(value).trim()
        if (containsSqlInjection(normalizedValue) || containsXss(normalizedValue)) {
          callback(new Error('账号包含非法字符'))
          return
        }
        if (normalizedValue.length < 3 || normalizedValue.length > 20) {
          callback(new Error('账号长度应在3-20个字符之间'))
          return
        }
        callback()
      },
      trigger: 'blur',
    },
  ],
  roleName: [
    {
      validator: (_rule, value, callback) => {
        if (roleOptions.value.length > 1 && !value) {
          callback(new Error('请选择角色类型'))
        } else {
          callback()
        }
      },
      trigger: 'change',
    },
  ],
  verificationMethod: [{ required: true, message: '请选择验证方式', trigger: 'change' }],
  phone: [
    {
      validator: (_rule, value, callback) => {
        if (form.verificationMethod === 'phone') {
          if (!value) {
            callback(new Error('请输入手机号'))
            return
          }
          if (!/^1[3-9]\d{9}$/.test(value)) {
            callback(new Error('请输入正确的手机号'))
            return
          }
        }
        callback()
      },
      trigger: 'blur',
    },
  ],
  smsCode: [
    {
      validator: (_rule, value, callback) => {
        if (form.verificationMethod === 'phone') {
          if (!value) {
            callback(new Error('请输入短信验证码'))
            return
          }
          if (!/^\d{6}$/.test(value)) {
            callback(new Error('短信验证码必须为6位数字'))
            return
          }
        }
        callback()
      },
      trigger: 'blur',
    },
  ],
  email: [
    {
      validator: (_rule, value, callback) => {
        if (form.verificationMethod === 'email') {
          if (!value) {
            callback(new Error('请输入邮箱地址'))
            return
          }
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            callback(new Error('请输入正确的邮箱地址'))
            return
          }
        }
        callback()
      },
      trigger: 'blur',
    },
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (!value) {
          callback()
          return
        }
        if (value.length !== 4) {
          callback(new Error('验证码长度必须为4位'))
          return
        }
        if (captchaRef.value && !captchaRef.value.validateCode(value)) {
          callback(new Error('验证码错误'))
          return
        }
        callback()
      },
      trigger: 'blur',
    },
  ],
}

onMounted(() => {
  // 获取可重置密码的角色列表
  const roles = menu.list().filter(item => {
    const normalized = (item.hasBackLogin || '').toString().toLowerCase()
    return item.hasBackLogin === '是' || normalized === 'yes' || normalized === 'true'
  })
  roleOptions.value = roles.map(role => ({ roleName: role.roleName, tableName: role.tableName }))

  if (roleOptions.value.length === 0) {
    ElMessage.warning('无可重置密码的角色，请联系管理员')
  } else if (roleOptions.value.length === 1) {
    form.roleName = roleOptions.value[0].roleName
  }
})

async function handleReset() {
  if (submitting.value) return

  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  const username = String(form.username).trim()

  // 输入验证
  const usernameValidation = validateInput(username)
  if (!usernameValidation.isValid) {
    ElMessage.error('输入包含非法字符，请检查后重试')
    return
  }

  const selectedRole = roleOptions.value.find(role => role.roleName === form.roleName) ?? roleOptions.value[0]
  if (!selectedRole) {
    ElMessage.error('未匹配到可用角色')
    return
  }

  // 记录密码重置尝试
  securityAuditor.logEvent(SecurityEventType.PASSWORD_RESET_ATTEMPT, {
    username: username,
    roleName: form.roleName,
    ip: '', // 可以通过其他方式获取IP
  })

  // 频率限制检查：1小时内最多重置1次
  const rateLimitKey = `forgot_password_${username}`
  if (rateLimiter.isRateLimited(rateLimitKey, 1, 60 * 60 * 1000)) {
    const resetTime = rateLimiter.getResetTime(rateLimitKey)
    if (resetTime) {
      const remainingMinutes = Math.ceil((resetTime - Date.now()) / (60 * 1000))
      ElMessage.error(`重置过于频繁，请${remainingMinutes}分钟后再试`)
    } else {
      ElMessage.error('重置过于频繁，请稍后再试')
    }
    // 记录速率限制事件
    securityAuditor.logEvent(SecurityEventType.RATE_LIMIT_EXCEEDED, {
      action: 'password_reset',
      identifier: username,
      limit: '1 per hour',
    })
    // 刷新验证码
    captchaRef.value?.refreshCode()
    form.captcha = ''
    return
  }

  submitting.value = true
  try {
    let response

    // 根据验证方式调用不同的接口
    if (form.verificationMethod === 'phone') {
      // 手机号验证方式
      response = await http.post(`/${selectedRole.tableName}/resetPassByPhone`, {
        username: username,
        phone: form.phone,
        smsCode: form.smsCode,
      })
    } else if (form.verificationMethod === 'email') {
      // 邮箱验证方式（发送重置链接，不在这里重置）
      ElMessage.info('请使用邮箱中的重置链接来重置密码')
      submitting.value = false
      return
    } else {
      // 仅图形验证码方式
      response = await http.post(`/${selectedRole.tableName}/resetPass`, null, {
        params: {
          username: username,
        },
      })
    }

    const data = response.data as { code: number; msg: string }
    if (data.code === 0) {
      // 记录密码重置成功事件
      securityAuditor.logEvent(SecurityEventType.PASSWORD_RESET_SUCCESS, {
        username: username,
        roleName: form.roleName,
        tableName: selectedRole.tableName,
        method: form.verificationMethod,
      })

      ElMessage.success({
        message: `${data.msg || '密码重置成功，默认密码为：123456'}\n\n请注意：每个账号1小时内只能重置1次密码`,
        duration: 8000,
      })

      // 清空敏感信息
      form.captcha = ''
      form.smsCode = ''
      captchaRef.value?.refreshCode()

      // 延迟跳转到登录页
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      // 记录密码重置失败事件
      securityAuditor.logEvent(SecurityEventType.PASSWORD_RESET_FAILURE, {
        username: username,
        roleName: form.roleName,
        method: form.verificationMethod,
        errorCode: data.code,
        errorMessage: data.msg,
      })

      ElMessage.error(data.msg || '密码重置失败')
      captchaRef.value?.refreshCode()
    }
  } catch (error: any) {
    console.error('密码重置失败:', error)
    const errorMsg = error?.response?.data?.msg || error?.message || '密码重置失败，请稍后重试'
    ElMessage.error(errorMsg)

    // 记录失败事件
    securityAuditor.logEvent(SecurityEventType.PASSWORD_RESET_FAILURE, {
      username: username,
      roleName: form.roleName,
      method: form.verificationMethod,
      error: errorMsg,
    })

    captchaRef.value?.refreshCode()
  } finally {
    submitting.value = false
  }
}

// 发送短信验证码
async function sendSmsCode() {
  if (!form.phone || sendingSms.value) return

  // 验证手机号格式
  if (!/^1[3-9]\d{9}$/.test(form.phone)) {
    ElMessage.error('请输入正确的手机号')
    return
  }

  // 验证账号和角色
  if (!form.username) {
    ElMessage.error('请先输入账号')
    return
  }

  sendingSms.value = true
  try {
    const response = await http.post('/sendSmsCode', {
      phone: form.phone,
      username: form.username,
      type: 'forgot_password',
    })

    const data = response.data
    if (data.code === 0) {
      ElMessage.success('短信验证码已发送')
      startSmsCountdown()

      // 记录安全事件
      securityAuditor.logEvent(SecurityEventType.SMS_CODE_SENT, {
        phone: form.phone,
        username: form.username,
        purpose: 'password_reset',
      })
    } else {
      throw new Error(data.msg || '发送失败')
    }
  } catch (error: any) {
    console.error('发送短信验证码失败:', error)
    ElMessage.error(error.message || '发送失败，请稍后重试')
  } finally {
    sendingSms.value = false
  }
}

// 发送重置链接
async function sendResetLink() {
  if (!form.email || sendingEmail.value) return

  // 验证邮箱格式
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    ElMessage.error('请输入正确的邮箱地址')
    return
  }

  // 验证账号和角色
  if (!form.username) {
    ElMessage.error('请先输入账号')
    return
  }

  const selectedRole = roleOptions.value.find(role => role.roleName === form.roleName) ?? roleOptions.value[0]
  if (!selectedRole) {
    ElMessage.error('未匹配到可用角色')
    return
  }

  sendingEmail.value = true
  try {
    const response = await http.post('/sendResetLink', {
      email: form.email,
      username: form.username,
      roleTable: selectedRole.tableName,
      roleName: form.roleName,
    })

    const data = response.data
    if (data.code === 0) {
      ElMessage.success('密码重置链接已发送到您的邮箱，请查收')

      // 记录安全事件
      securityAuditor.logEvent(SecurityEventType.RESET_LINK_SENT, {
        email: form.email,
        username: form.username,
        roleName: form.roleName,
        purpose: 'password_reset',
      })

      // 清空表单，准备跳转
      form.email = ''
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } else {
      throw new Error(data.msg || '发送失败')
    }
  } catch (error: any) {
    console.error('发送重置链接失败:', error)
    ElMessage.error(error.message || '发送失败，请稍后重试')
  } finally {
    sendingEmail.value = false
  }
}

// 短信验证码倒计时
function startSmsCountdown() {
  smsCountdown.value = 60
  const timer = setInterval(() => {
    smsCountdown.value--
    if (smsCountdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

function gotoLogin() {
  router.push('/login')
}
</script>

<style scoped lang="scss">
@use '@/styles/tokens' as *;

.forgot-password-page {
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

.forgot-password-background {
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

.forgot-password-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 520px;
  box-sizing: border-box;
  margin: 0 auto;
}

.forgot-password-card {
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

.forgot-password-card__header {
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

.forgot-password-form {
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

.phone-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;

  .el-input {
    flex: 1;
  }

  .el-button {
    flex-shrink: 0;
    min-width: 120px;
  }
}

.el-radio-group {
  width: 100%;

  .el-radio {
    margin-right: 24px;
    margin-bottom: 8px;

    &.is-bordered {
      margin-bottom: 12px;
    }
  }
}

.captcha-row {
  display: flex;
  align-items: center;
  gap: 12px;

  .el-input {
    flex: 1;
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

.forgot-password-footer {
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

.security-tip-footer {
  margin: 0;
  padding: 0;
  font-size: 12px;
  color: #a0aec0;
  line-height: 1.5;
  text-align: center;
  width: 100%;
  word-wrap: break-word;
  box-sizing: border-box;

  strong {
    color: #e6a23c;
    font-weight: 600;
  }
}

// 响应式设计
@media (width <= 992px) {
  .forgot-password-card {
    padding: 32px 24px;
  }

  h1 {
    font-size: 22px;
  }
}

@media (width <= 768px) {
  .forgot-password-page {
    padding: 20px;
  }

  .forgot-password-card {
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
  .forgot-password-page {
    padding: 16px;
  }

  .forgot-password-card {
    padding: 24px 20px;
    border-radius: 12px;
  }

  .forgot-password-card__header {
    margin-bottom: 24px;
  }

  h1 {
    font-size: 18px;
  }

  .subtitle {
    font-size: 13px;
  }

  .captcha-row {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;

    .el-input {
      flex: none;
    }
  }

  .footer-links {
    flex-direction: column;
    gap: 8px;
    align-items: center;
  }

  .divider {
    display: none;
  }

  .security-tip-footer {
    font-size: 11px;
    padding: 0 8px;
  }

  .submit-btn {
    height: 44px;
    font-size: 15px;
  }
}
</style>
