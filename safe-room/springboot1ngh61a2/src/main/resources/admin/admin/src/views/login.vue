<template>
  <div class="login-page">
    <div class="login-background">
      <div class="background-pattern"></div>
      <div class="background-gradient"></div>
    </div>

    <div class="login-container">
      <el-card class="login-card" shadow="always">
        <div class="login-card__header">
          <div class="logo-section">
            <div class="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <p class="eyebrow">GYM ADMIN</p>
            <h1>管理后台登录</h1>
            <p class="subtitle">使用管理员或教练账号登录后台系统</p>
          </div>
        </div>

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="login-form">
          <el-form-item label="账号" prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入账号"
              autocomplete="username"
              clearable
              size="large"
              prefix-icon="User"
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              placeholder="请输入密码"
              type="password"
              show-password
              autocomplete="current-password"
              size="large"
              prefix-icon="Lock"
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          <el-form-item>
            <div class="form-options">
              <el-checkbox v-model="rememberAccount">记住账号</el-checkbox>
              <span class="security-tip">建议在个人设备上使用</span>
            </div>
          </el-form-item>
          <el-form-item v-if="roleOptions.length > 1" label="登录身份" prop="roleName">
            <el-radio-group v-model="form.roleName" class="role-radio-group">
              <el-radio-button v-for="role in roleOptions" :key="role.roleName" :value="role.roleName">
                {{ role.roleName }}
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-button type="primary" class="submit-btn" size="large" :loading="submitting" @click="handleLogin">
            <span v-if="!submitting">立即登录</span>
            <span v-else>登录中...</span>
          </el-button>
        </el-form>

        <div class="login-footer">
          <div class="footer-links">
            <a href="#" class="footer-link" @click.prevent="handleForgotPassword">找回密码</a>
            <span class="divider">|</span>
            <a href="/front" class="footer-link">前往门户</a>
            <span class="divider">|</span>
            <a href="#" class="footer-link" @click.prevent="handleSupport">技术支持</a>
          </div>
          <p class="security-tip-footer">建议使用企业网络，请勿在公共设备保存密码</p>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts" name="Login">
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import http from '@/utils/http'
import menu from '@/utils/menu'
import storage from '@/utils/storage'
import { tokenStorage } from '@/utils/secureStorage'
import { validateInput, containsSqlInjection, containsXss } from '@/utils/validator'

interface RoleOption {
  roleName: string
  tableName: string
}

const router = useRouter()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const roleOptions = ref<RoleOption[]>([])

const rememberAccount = ref(storage.get('rememberAccountFlag') === 'true')
const form = reactive({
  username: '',
  password: '',
  roleName: '',
})

const rules: FormRules<typeof form> = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        // 规范化值类型，确保是字符串
        const normalizedValue = normalizeFormValue(value)
        if (!normalizedValue) {
          callback()
          return
        }
        // 验证输入安全性
        if (containsSqlInjection(normalizedValue) || containsXss(normalizedValue)) {
          callback(new Error('账号包含非法字符'))
          return
        }
        // 验证用户名格式
        if (normalizedValue.length < 3 || normalizedValue.length > 20) {
          callback(new Error('账号长度应在3-20个字符之间'))
          return
        }
        callback()
      },
      trigger: 'blur',
    },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        // 规范化值类型，确保是字符串
        const normalizedValue = normalizeFormValue(value)
        if (!normalizedValue) {
          callback()
          return
        }
        // 验证输入安全性
        if (containsSqlInjection(normalizedValue) || containsXss(normalizedValue)) {
          callback(new Error('密码包含非法字符'))
          return
        }
        callback()
      },
      trigger: 'blur',
    },
  ],
  roleName: [{ required: roleOptions.value.length > 1, message: '请选择登录身份', trigger: 'change' }],
}

// 规范化表单值的辅助函数
function normalizeFormValue(value: any): string {
  if (value === null || value === undefined) {
    return ''
  }
  if (Array.isArray(value)) {
    return String(value[0] ?? '')
  }
  return String(value)
}

onMounted(() => {
  if (rememberAccount.value) {
    const savedUsername = storage.get('rememberAccountUsername')
    const savedRole = storage.get('rememberAccountRole')
    // 规范化从存储中读取的值
    form.username = normalizeFormValue(savedUsername)
    form.roleName = normalizeFormValue(savedRole)
  }

  // 确保初始值为字符串类型
  form.username = normalizeFormValue(form.username)
  form.password = normalizeFormValue(form.password)
  form.roleName = normalizeFormValue(form.roleName)

  const roles = menu.list().filter(item => {
    const normalized = (item.hasBackLogin || '').toString().toLowerCase()
    return item.hasBackLogin === '是' || normalized === 'yes' || normalized === 'true'
  })
  roleOptions.value = roles.map(role => ({ roleName: role.roleName, tableName: role.tableName }))
  if (roleOptions.value.length === 0) {
    ElMessage.warning('无可登录角色，请联系管理员')
  } else if (roleOptions.value.length === 1) {
    form.roleName = roleOptions.value[0].roleName
  }

  // 检查是否从错误页面跳转而来
  const redirect = router.currentRoute.value.query['redirect'] as string
  if (redirect && router.currentRoute.value.query['from'] === 'error') {
    ElMessage.warning('您的登录已过期，请重新登录')
  }
})

// 监听表单值变化，确保 username 和 password 始终为字符串类型
watch(
  () => form.username,
  newValue => {
    if (newValue !== null && newValue !== undefined && !Array.isArray(newValue) && typeof newValue === 'string') {
      return // 已经是正确的类型，无需处理
    }
    // 如果值被意外转换为数组或其他类型，立即修正
    form.username = normalizeFormValue(newValue)
  },
  { immediate: false },
)

watch(
  () => form.password,
  newValue => {
    if (newValue !== null && newValue !== undefined && !Array.isArray(newValue) && typeof newValue === 'string') {
      return // 已经是正确的类型，无需处理
    }
    // 如果值被意外转换为数组或其他类型，立即修正
    form.password = normalizeFormValue(newValue)
  },
  { immediate: false },
)

function isValidInternalPath(path: string): boolean {
  // 验证路径是否为系统内路径，防止开放重定向漏洞
  return path.startsWith('/') && !path.startsWith('//') && !path.includes('http')
}

/**
 * 验证路由是否存在且有效
 * @param path 要验证的路由路径
 * @returns 如果路由存在且有效返回true，否则返回false
 */
function isValidRoute(path: string): boolean {
  if (!isValidInternalPath(path)) {
    return false
  }

  // 检查是否是公开路由（登录后不应该跳转到登录页等公开路由）
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password']
  if (publicRoutes.includes(path)) {
    return false
  }

  try {
    // 检查路由是否存在
    const matched = router.resolve(path)
    
    // 如果匹配到NotFound路由，说明路由不存在
    if (matched.name === 'NotFound') {
      return false
    }
    
    // 如果没有任何匹配的路由，说明路由不存在
    if (!matched.matched || matched.matched.length === 0) {
      return false
    }
    
    // 路由存在且有效
    return true
  } catch (error) {
    // 如果解析路由时出错，说明路由无效
    // console.warn('路由验证失败:', path, error)
    return false
  }
}

async function handleLogin() {
  if (submitting.value) return

  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  // 确保 username 和 password 是字符串类型（防止数组或其他类型）
  const username = normalizeFormValue(form.username).trim()
  const password = normalizeFormValue(form.password)

  // 输入验证
  const usernameValidation = validateInput(username)
  const passwordValidation = validateInput(password)

  if (!usernameValidation.isValid || !passwordValidation.isValid) {
    ElMessage.error('输入包含非法字符，请检查后重试')
    return
  }

  const selectedRole = roleOptions.value.find(role => role.roleName === form.roleName) ?? roleOptions.value[0]
  if (!selectedRole) {
    ElMessage.error('未匹配到可用角色')
    return
  }

  submitting.value = true
  try {
    const response = await http.post(`/` + selectedRole.tableName + `/login`, null, {
      params: {
        username: username,
        password: password,
      },
    })
    const data = response.data as { code: number; msg: string; token?: string }
    if (data.code !== 0 || !data.token) {
      ElMessage.error(data.msg || '登录失败')
      throw new Error(data.msg || '登录失败')
    }

    // 使用secureStorage存储Token（带过期时间，1小时）
    const expiryTime = Date.now() + 60 * 60 * 1000 // 1小时后过期
    tokenStorage.setToken(data.token, expiryTime)

    // 向后兼容，同时存储到localStorage
    storage.set('Token', data.token)
    storage.set('role', selectedRole.roleName)
    storage.set('sessionTable', selectedRole.tableName)
    storage.set('adminName', username)
    if (rememberAccount.value) {
      storage.set('rememberAccountFlag', 'true')
      storage.set('rememberAccountUsername', username)
      storage.set('rememberAccountRole', selectedRole.roleName)
    } else {
      storage.remove('rememberAccountFlag')
      storage.remove('rememberAccountUsername')
      storage.remove('rememberAccountRole')
    }
    ElMessage.success('登录成功')
    
    // 处理登录后的重定向，验证路径安全性和有效性
    const redirect = router.currentRoute.value.query['redirect'] as string
    let targetPath = '/'
    
    if (redirect && isValidInternalPath(redirect)) {
      // 验证路由是否存在且有效
      if (isValidRoute(redirect)) {
        targetPath = redirect
      } else {
        // 路由无效，记录警告但继续跳转到首页
        // console.warn('登录后重定向路径无效，已回退到首页:', redirect)
      }
    }
    
    // 使用nextTick确保token已完全设置到storage，避免路由守卫拦截
    await nextTick()
    
    // 再次确认token已设置（双重检查）
    const verifyToken = tokenStorage.getToken() || storage.get('Token')
    if (!verifyToken) {
      // console.error('Token设置失败，无法跳转')
      ElMessage.error('登录状态保存失败，请重新登录')
      return
    }
    
    // 执行路由跳转
    try {
      await router.replace(targetPath)
    } catch (error: any) {
      // 如果跳转失败，回退到首页
      // console.error('路由跳转失败:', error)
      try {
        await router.replace('/')
      } catch (fallbackError) {
        // 如果首页也跳转失败，强制刷新页面
        // console.error('首页跳转也失败，强制刷新:', fallbackError)
        window.location.href = '/'
      }
    }
  } catch (error: any) {
    // 记录错误日志
    // console.error('登录失败:', error)
  } finally {
    submitting.value = false
  }
}

function handleForgotPassword() {
  router.push('/forgot-password')
}

function handleSupport() {
  ElMessage.info('技术支持：请联系系统管理员')
}
</script>

<style scoped lang="scss">
// 登录页面容器 - 修复布局问题
.login-page {
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

// 背景层
.login-background {
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

// 登录容器 - 修复定位和宽度问题
.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 520px;
  box-sizing: border-box;
  margin: 0 auto;
}

// 登录卡片 - 修复样式冲突
.login-card {
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

// 登录卡片头部
.login-card__header {
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

  svg {
    width: 32px;
    height: 32px;
    display: block;
  }
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

// 登录表单样式已提取到 components/_forms.scss
// 使用 .login-form 类名即可应用统一样式

// 提交按钮
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

// 登录页脚
.login-footer {
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
}

// 响应式设计
@media (width <= 992px) {
  .login-card {
    padding: 32px 24px;
  }

  h1 {
    font-size: 22px;
  }
}

@media (width <= 768px) {
  .login-page {
    padding: 20px;
  }

  .login-card {
    padding: 32px 24px;
    border-radius: 16px;
  }

  h1 {
    font-size: 20px;
  }

  .logo-icon {
    width: 56px;
    height: 56px;

    svg {
      width: 28px;
      height: 28px;
    }
  }

  .login-form {
    :deep(.el-input__wrapper) {
      min-height: 44px;
    }
  }
}

@media (width <= 480px) {
  .login-page {
    padding: 16px;
  }

  .login-card {
    padding: 24px 20px;
    border-radius: 12px;
  }

  .login-card__header {
    margin-bottom: 24px;
  }

  h1 {
    font-size: 18px;
  }

  .subtitle {
    font-size: 13px;
  }

  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .security-tip {
    white-space: normal;
    text-align: left;
  }

  .role-radio-group {
    :deep(.el-radio-button) {
      .el-radio-button__inner {
        padding: 8px 12px;
        font-size: 13px;
      }
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
