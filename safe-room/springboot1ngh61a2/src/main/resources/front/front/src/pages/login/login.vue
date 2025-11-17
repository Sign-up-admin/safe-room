<template>
  <div class="login-page app-dark-bg">
    <div class="login-grid glass-card">
      <section class="login-hero">
        <p class="eyebrow">WELCOME BACK</p>
        <h1>登录后即可预约课程、管理会员卡</h1>
        <p class="subline">科技助力训练 · 数据驱动进步 · 智能掌控全程</p>
        <ul>
          <li>在线预约私教 / 团课</li>
          <li>查看公告与课程动态</li>
          <li>续费会员卡、查看消费记录</li>
        </ul>
      </section>

      <section class="login-form">
        <div class="form-header">
          <h2 data-testid="login-page-title">会员登录</h2>
          <p>输入账号密码，开启高效训练体验</p>
        </div>

        <el-alert
          v-if="errorMessage"
          :title="errorMessage"
          type="error"
          show-icon
          class="mb-16"
          data-testid="login-error-message"
          @close="errorMessage = ''"
        />

        <el-form
          ref="formRef"
          :model="loginForm"
          :rules="rules"
          label-position="top"
          data-testid="login-form"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="username">
            <template #label>
              <span class="form-label"
                ><span class="required-asterisk">*</span>账号<span class="required-asterisk">*</span></span
              >
            </template>
            <el-input
              v-model="loginForm.username"
              placeholder="请输入会员账号"
              autocomplete="username"
              clearable
              data-testid="login-username-input"
            />
          </el-form-item>
          <el-form-item prop="password">
            <template #label>
              <span class="form-label"
                ><span class="required-asterisk">*</span>密码<span class="required-asterisk">*</span></span
              >
            </template>
            <el-input
              v-model="loginForm.password"
              placeholder="请输入密码"
              show-password
              autocomplete="current-password"
              data-testid="login-password-input"
            />
          </el-form-item>
          <el-form-item v-if="roleOptions.length > 1" label="登录身份" prop="tableName">
            <el-radio-group v-model="loginForm.tableName" data-testid="login-role-radio-group">
              <el-radio v-for="role in roleOptions" :key="role.value" :value="role.value">
                {{ role.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <div class="form-actions">
            <el-checkbox v-model="rememberMe" data-testid="login-remember-checkbox">记住账号</el-checkbox>
            <el-link type="primary" data-testid="login-register-link" @click="goToRegister">没有账号？立即注册</el-link>
          </div>

          <button
            class="yellow-button submit-btn"
            :disabled="submitting"
            data-testid="login-submit-button"
            @click="handleLogin"
          >
            {{ submitting ? '登录中...' : '登录' }}
          </button>
        </el-form>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import http from '@/common/http'
import storage from '@/common/storage'
import menu from '@/config/menu'
import type { ApiResponse } from '@/types/api'

interface LoginResponse extends ApiResponse {
  token?: string
}

const router = useRouter()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const rememberMe = ref(true)
const errorMessage = ref('')

const roleOptions = computed(() =>
  menu
    .list()
    .filter(role => role.hasFrontLogin === '是')
    .map(role => ({ label: role.roleName, value: role.tableName })),
)

const loginForm = reactive({
  username: '',
  password: '',
  tableName: roleOptions.value[0]?.value ?? 'yonghu',
})

const rules: FormRules<typeof loginForm> = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, message: '账号至少 3 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 个字符', trigger: 'blur' },
  ],
  tableName: [{ required: true, message: '请选择登录身份', trigger: 'change' }],
}

onMounted(() => {
  const remembered = localStorage.getItem('front_username')
  if (remembered) {
    loginForm.username = remembered
  }
  const savedRole = localStorage.getItem('UserTableName')
  if (savedRole && roleOptions.value.some(role => role.value === savedRole)) {
    loginForm.tableName = savedRole
  }
})

async function handleLogin() {
  if (submitting.value) return
  errorMessage.value = ''
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    const response = await http.post<LoginResponse>(`/${loginForm.tableName}/login`, null, {
      params: {
        username: loginForm.username,
        password: loginForm.password,
      },
    })
    if (response.data.code !== 0 || !response.data.token) {
      throw new Error(response.data.msg || '登录失败')
    }
    storage.set('frontToken', response.data.token)
    localStorage.setItem('UserTableName', loginForm.tableName)
    if (rememberMe.value) {
      localStorage.setItem('front_username', loginForm.username)
    } else {
      localStorage.removeItem('front_username')
    }
    await fetchProfile()
    ElMessage.success('登录成功' as any)
    router.replace('/index/home')
  } catch (error: any) {
    console.error('登录失败:', error)
    // 优先使用拦截器处理后的错误消息，其次使用响应数据中的消息
    errorMessage.value = error?.message || error?.response?.data?.msg || '登录失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}

async function fetchProfile() {
  try {
    const response = await http.get<ApiResponse<Record<string, any>>>(`/${loginForm.tableName}/session`)
    if (response.data.data) {
      localStorage.setItem('userInfo', JSON.stringify(response.data.data))
      if (response.data.data['id']) {
        localStorage.setItem('userid', String(response.data.data['id']))
      }
    }
  } catch (error) {
    console.warn('获取用户信息失败', error)
  }
}

function goToRegister() {
  router.push('/register')
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 18px;
  background:
    radial-gradient(circle at 10% 20%, rgba(253, 216, 53, 0.2), transparent 45%),
    radial-gradient(circle at 80% 0%, rgba(253, 216, 53, 0.15), transparent 40%), #020202;
}

.login-grid {
  width: min(980px, 100%);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 0;
  padding: 0;
  overflow: hidden;
  // 确保 glass-card 样式正确应用
  @include glass-card();
}

.login-hero {
  padding: 56px 48px;
  background: linear-gradient(160deg, rgba(253, 216, 53, 0.2), rgba(5, 5, 5, 0.7));
  border-right: 1px solid rgba(253, 216, 53, 0.08);

  .eyebrow {
    @include section-eyebrow;
    margin-bottom: 18px;
  }

  h1 {
    margin: 0 0 12px;
    font-size: 2.2rem;
    color: var(--color-text-primary);
    font-weight: 600;
    line-height: 1.3;
  }

  .subline {
    margin: 0 0 24px;
    color: var(--color-text-secondary);
    font-size: 0.95rem;
    line-height: 1.6;
  }

  ul {
    margin: 0;
    padding-left: 18px;
    color: var(--color-text-secondary);
    line-height: 1.8;
    font-size: 0.9rem;

    li {
      margin-bottom: 8px;
    }
  }
}

.login-form {
  padding: 48px;
  background: #000000;

  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  :deep(.el-form-item__label) {
    color: var(--color-text-secondary);
    font-weight: 500;
    margin-bottom: 8px;
    font-size: 0.9rem;
  }

  // 标签样式
  .form-label {
    color: var(--color-text-secondary);
    font-weight: 500;
    font-size: 0.9rem;
  }

  // 必填星号样式 - 红色
  .required-asterisk {
    color: #ff4444;
    margin-right: 2px;
  }

  // 输入框样式 - 白色背景，pill形状
  :deep(.el-input) {
    width: 100%;
  }

  :deep(.el-input__wrapper) {
    background: #ffffff !important;
    border-radius: 999px !important; // pill形状
    border: none !important;
    box-shadow: none;
    padding: 0 16px;
    min-height: 44px;
    overflow: hidden; // 确保圆角处背景色一致
  }

  // 确保输入框内部元素背景色一致
  :deep(.el-input__wrapper::before) {
    display: none;
  }

  :deep(.el-input__inner) {
    color: #1a1a1a !important;
    background: transparent;
    font-size: 0.95rem;
  }

  :deep(.el-input__placeholder) {
    color: #9ea1a6 !important;
  }

  :deep(.el-input.is-focus .el-input__wrapper) {
    border: 2px solid var(--color-yellow) !important;
    box-shadow: none;
  }

  // 密码输入框图标颜色 - 灰色
  :deep(.el-input__password) {
    color: #9ea1a6;

    &:hover {
      color: var(--color-yellow);
    }
  }

  // 清除按钮颜色
  :deep(.el-input__clear) {
    color: #9ea1a6;

    &:hover {
      color: var(--color-yellow);
    }
  }

  :deep(.el-radio-group) {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  :deep(.el-radio) {
    margin-right: 0;
    color: var(--color-text-secondary);

    .el-radio__label {
      color: var(--color-text-secondary);
    }

    &.is-checked .el-radio__label {
      color: var(--color-yellow);
    }
  }

  // 复选框样式 - 黄色主题
  :deep(.el-checkbox) {
    .el-checkbox__input.is-checked .el-checkbox__inner {
      background-color: var(--color-yellow);
      border-color: var(--color-yellow);
    }

    .el-checkbox__input.is-checked + .el-checkbox__label {
      color: var(--color-text-secondary);
    }

    .el-checkbox__inner {
      border-color: rgba(255, 255, 255, 0.3);
      background-color: transparent;
    }

    .el-checkbox__inner:hover {
      border-color: var(--color-yellow);
    }
  }
}

.form-header {
  margin-bottom: 24px;

  h2 {
    margin: 0 0 8px;
    color: var(--color-text-primary);
    font-size: 1.75rem;
    font-weight: 600;
  }

  p {
    margin: 0 0 24px;
    color: var(--color-text-secondary);
    font-size: 0.9rem;
  }
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;

  :deep(.el-checkbox__label) {
    color: var(--color-text-secondary);
    font-size: 0.9rem;
  }

  :deep(.el-link--inner) {
    color: var(--color-text-secondary);
    font-size: 0.9rem;
  }

  :deep(.el-link--primary) {
    color: var(--color-yellow);
  }
}

.submit-btn {
  width: 100%;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 8px;
  @include yellow-button(false, 52px);

  &[disabled] {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
}

.mb-16 {
  margin-bottom: 16px;
}

@media (max-width: 1024px) {
  .login-page {
    padding: 24px 16px;
  }

  .login-grid {
    width: 100%;
    grid-template-columns: 1fr;
  }

  .login-hero {
    border-right: none;
    border-bottom: 1px solid rgba(253, 216, 53, 0.08);
    padding: 32px 28px;

    h1 {
      font-size: 1.75rem;
    }
  }

  .login-form {
    padding: 32px 28px 40px;
  }

  .form-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}

@media (max-width: 640px) {
  .login-page {
    padding: 16px 12px;
  }

  .login-hero {
    padding: 24px 20px;

    h1 {
      font-size: 1.5rem;
    }

    .subline {
      font-size: 0.85rem;
    }

    ul {
      font-size: 0.85rem;
    }
  }

  .login-form {
    padding: 24px 20px 32px;
  }

  .form-header h2 {
    font-size: 1.5rem;
  }
}
</style>
