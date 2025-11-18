<template>
  <div class="password-login-page">
    <!-- 背景层 -->
    <div class="login-background">
      <div class="absolute size-full bg-none bg-background-150"></div>
      <div class="absolute size-full bg-gradient-authentication-light dark:bg-gradient-authentication-dark" style="opacity: 1;"></div>
    </div>

    <!-- 关闭按钮 -->
    <div class="dismiss-button-wrapper">
      <button
        type="button"
        class="dismiss-button"
        title="关闭"
        @click="handleClose"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="dismiss-icon">
          <path d="M4.39705 4.55379L4.46967 4.46967C4.73594 4.2034 5.1526 4.1792 5.44621 4.39705L5.53033 4.46967L12 10.939L18.4697 4.46967C18.7626 4.17678 19.2374 4.17678 19.5303 4.46967C19.8232 4.76256 19.8232 5.23744 19.5303 5.53033L13.061 12L19.5303 18.4697C19.7966 18.7359 19.8208 19.1526 19.6029 19.4462L19.5303 19.5303C19.2641 19.7966 18.8474 19.8208 18.5538 19.6029L18.4697 19.5303L12 13.061L5.53033 19.5303C5.23744 19.8232 4.76256 19.8232 4.46967 19.5303C4.17678 19.2374 4.17678 18.7626 4.46967 18.4697L10.939 12L4.46967 5.53033C4.2034 5.26406 4.1792 4.8474 4.39705 4.55379L4.46967 4.46967L4.39705 4.55379Z"></path>
        </svg>
      </button>
    </div>

    <!-- 主要内容区域 -->
    <div class="login-content">
      <div class="login-container">
        <h1 class="login-title">账号密码登录</h1>
        <p class="login-subtitle">
          请输入您的账号和密码以继续
        </p>

        <!-- 错误提示 -->
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <!-- 登录表单 -->
        <form @submit.prevent="handleLogin" class="login-form">
          <!-- 账号输入 -->
          <div class="input-group">
            <label for="username" class="input-label">账号</label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              class="form-input"
              placeholder="请输入账号"
              autocomplete="username"
              required
            />
          </div>

          <!-- 密码输入 -->
          <div class="input-group">
            <label for="password" class="input-label">密码</label>
            <div class="password-input-wrapper">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="请输入密码"
                autocomplete="current-password"
                required
              />
              <button
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? '隐藏密码' : '显示密码'"
              >
                <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="password-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="password-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- 操作按钮区域 -->
          <div class="form-actions">
            <router-link to="/login" class="back-link">
              ← 返回
            </router-link>
            <a href="#" class="forgot-link" @click.prevent="handleForgotPassword">
              忘记密码？
            </a>
          </div>

          <!-- 登录按钮 -->
          <button
            type="submit"
            class="login-button"
            :disabled="loading"
          >
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>

        <!-- 注册链接 -->
        <div class="register-link">
          <p>
            还没有账号？
            <router-link to="/register" class="link">立即注册</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { request } from '@/utils/api'
import { STORAGE_KEYS } from '@/utils/constants'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)

const form = reactive({
  username: '',
  password: ''
})

// 表单数据监听已移除，避免控制台噪音

const handleLogin = async () => {
  console.log('登录表单数据:', { username: form.username, password: form.password, passwordLength: form.password.length })

  if (!form.username || !form.password) {
    const missing = []
    if (!form.username) missing.push('账号')
    if (!form.password) missing.push('密码')
    errorMessage.value = `请输入${missing.join('和')}`
    console.error('验证失败:', { missing, formData: { username: form.username, passwordLength: form.password.length } })
    return
  }

  errorMessage.value = ''
  loading.value = true

  try {
    console.log('开始API调用...')
    const response = await request.post<{ token?: string; role?: string }>('/users/login', {
      username: form.username,
      password: form.password
    })
    console.log('API响应:', response)

    if (response.code === 0) {
      const token = (response as any).token
      console.log('获取到token:', token ? '成功' : '失败')

      if (token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token)
        await userStore.initUser()
        console.log('用户状态初始化完成')
      }

      ElMessage.success('登录成功')
      console.log('准备跳转到主页...')

      const redirect = router.currentRoute.value.query.redirect as string
      console.log('跳转目标:', redirect || '/home')
      router.push(redirect || '/home')
    } else {
      console.error('登录失败:', response.msg)
      errorMessage.value = response.msg || '登录失败'
    }
  } catch (error: any) {
    errorMessage.value = error.message || '登录失败，请检查账号密码'
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  router.push('/login')
}

const handleForgotPassword = () => {
  ElMessage.info('忘记密码功能开发中')
}
</script>

<style>
@import '@/styles/copilot-reference.css';
</style>

<style scoped lang="scss">
@import '@/styles/variables';

.password-login-page {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-background {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.dismiss-button-wrapper {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 30;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.dismiss-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.7);
  border: none;
  color: #111827;
  fill: #111827;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  outline: 2px solid transparent;
  outline-offset: 1px;

  &:hover {
    background: rgba(255, 255, 255, 1);
  }

  &:active {
    background: rgba(255, 255, 255, 0.6);
    color: #4b5563;
    fill: #4b5563;
  }

  &:focus-visible {
    outline: 2px solid #111827;
    z-index: 1;
  }
}

.dismiss-icon {
  width: 1.5rem;
  height: 1.5rem;
  fill: currentColor;
}

.login-content {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 10;
}

.login-container {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem;
  max-width: 23.375rem;
  margin: 0 auto;
}

.login-title {
  margin-bottom: 1rem;
  text-align: center;
  font-weight: 600;
  font-size: clamp(1.5rem, 4vw, 2.25rem);
  line-height: 1.2;
  color: #111827;

  @media (min-width: 640px) {
    font-size: 2.25rem;
  }
}

.login-subtitle {
  margin-bottom: 1.5rem;
  text-align: center;
  color: #374151;
  font-size: 1rem;
  line-height: 1.5;

  @media (min-width: 640px) {
    margin-bottom: 2rem;
  }
}

.error-message {
  width: 100%;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.5rem;
  color: #dc2626;
  font-size: 0.875rem;
  text-align: center;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  min-width: 21.5625rem;

  @media (min-width: 640px) {
    min-width: 23.375rem;
  }
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-input {
  position: relative;
  width: 100%;
  min-height: 3.5rem;
  padding: 1rem 1.25rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #111827;
  font-size: 1rem;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  outline: 2px solid transparent;
  outline-offset: 1px;

  &::placeholder {
    color: #9ca3af;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.85);
    border-color: rgba(0, 0, 0, 0.15);
  }

  &:focus {
    background: rgba(255, 255, 255, 1);
    border-color: #111827;
    outline: 2px solid #111827;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-wrapper .form-input {
  padding-right: 3.5rem;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #111827;
  }

  &:active {
    background: rgba(0, 0, 0, 0.1);
  }
}

.password-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.back-link,
.forgot-link {
  font-size: 0.875rem;
  color: #111827;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: #374151;
    text-decoration: underline;
  }
}

.login-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 3.5rem;
  padding: 1rem 1.25rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.7);
  border: none;
  color: #111827;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  width: 100%;
  outline: 2px solid transparent;
  outline-offset: 1px;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  &:active:not(:disabled) {
    background: rgba(255, 255, 255, 0.6);
    color: #4b5563;
  }

  &:focus-visible {
    outline: 2px solid #111827;
    z-index: 1;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.register-link {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: #374151;

  p {
    margin: 0;
  }

  .link {
    color: #111827;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s ease;

    &:hover {
      color: #374151;
      text-decoration: underline;
    }
  }
}

@media (prefers-color-scheme: dark) {
  .login-title {
    color: #f9fafb;
  }

  .login-subtitle {
    color: #d1d5db;
  }

  .input-label {
    color: #d1d5db;
  }

  .dismiss-button {
    background: rgba(55, 65, 81, 0.3);
    color: #f9fafb;
    fill: #f9fafb;

    &:hover {
      background: rgba(55, 65, 81, 0.4);
    }

    &:active {
      background: rgba(55, 65, 81, 0.2);
      color: #9ca3af;
      fill: #9ca3af;
    }
  }

  .form-input {
    background: rgba(55, 65, 81, 0.3);
    border-color: rgba(255, 255, 255, 0.1);
    color: #f9fafb;

    &::placeholder {
      color: #9ca3af;
    }

    &:hover {
      background: rgba(55, 65, 81, 0.4);
      border-color: rgba(255, 255, 255, 0.15);
    }

    &:focus {
      background: rgba(55, 65, 81, 0.5);
      border-color: #f9fafb;
      outline-color: #f9fafb;
    }
  }

  .password-toggle {
    color: #9ca3af;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #f9fafb;
    }
  }

  .back-link,
  .forgot-link {
    color: #d1d5db;

    &:hover {
      color: #f9fafb;
    }
  }

  .login-button {
    background: rgba(55, 65, 81, 0.3);
    color: #f9fafb;

    &:hover:not(:disabled) {
      background: rgba(55, 65, 81, 0.4);
    }

    &:active:not(:disabled) {
      background: rgba(55, 65, 81, 0.2);
      color: #9ca3af;
    }
  }

  .register-link {
    color: #d1d5db;

    .link {
      color: #f9fafb;

      &:hover {
        color: #d1d5db;
      }
    }
  }

  .error-message {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.4);
    color: #fca5a5;
  }
}
</style>
