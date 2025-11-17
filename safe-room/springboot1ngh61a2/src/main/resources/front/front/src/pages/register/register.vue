<template>
  <div class="register-page app-dark-bg">
    <div class="register-card glass-card">
      <div class="header">
        <div>
          <p class="eyebrow">JOIN THE FUTURE</p>
          <h1>创建会员账号</h1>
          <p>完善基本信息，加入智能健身房</p>
        </div>
        <el-button type="primary" link @click="goLogin">已有账号？前往登录</el-button>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" class="register-form">
        <el-row :gutter="24">
          <el-col :md="12" :span="24">
            <el-form-item label="账号" prop="yonghuzhanghao">
              <el-input v-model="form.yonghuzhanghao" placeholder="请输入会员账号" />
            </el-form-item>
          </el-col>
          <el-col :md="12" :span="24">
            <el-form-item label="密码" prop="mima">
              <el-input v-model="form.mima" type="password" placeholder="请输入密码" show-password />
            </el-form-item>
          </el-col>
          <el-col :md="12" :span="24">
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入密码" show-password />
            </el-form-item>
          </el-col>
          <el-col :md="12" :span="24">
            <el-form-item label="姓名" prop="yonghuxingming">
              <el-input v-model="form.yonghuxingming" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :md="12" :span="24">
            <el-form-item label="性别" prop="xingbie">
              <el-select v-model="form.xingbie" placeholder="请选择性别">
                <el-option v-for="item in genderOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :md="12" :span="24">
            <el-form-item label="手机号" prop="shoujihaoma">
              <el-input v-model="form.shoujihaoma" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :md="12" :span="24">
            <el-form-item label="身高 (cm)" prop="shengao">
              <el-input v-model="form.shengao" placeholder="可选填" />
            </el-form-item>
          </el-col>
          <el-col :md="12" :span="24">
            <el-form-item label="体重 (kg)" prop="tizhong">
              <el-input v-model="form.tizhong" placeholder="可选填" />
            </el-form-item>
          </el-col>
          <el-col :md="12" :span="24">
            <el-form-item label="会员卡号" prop="huiyuankahao">
              <el-input v-model="form.huiyuankahao" placeholder="可选填，用于绑定会员卡" />
            </el-form-item>
          </el-col>
          <el-col :md="12" :span="24">
            <el-form-item label="头像" prop="touxiang">
              <file-upload
                action="file/upload"
                tip="点击上传头像"
                :limit="1"
                :file-urls="form.touxiang"
                @change="handleAvatarChange"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item>
          <el-checkbox v-model="agreedToTerms" :required="true">
            我已阅读并同意
            <router-link to="/terms" target="_blank" class="legal-link">《使用条款》</router-link>
            和
            <router-link to="/privacy" target="_blank" class="legal-link">《隐私政策》</router-link>
          </el-checkbox>
        </el-form-item>

        <div class="actions">
          <button class="yellow-outline-button" type="button" @click="resetForm">重置</button>
          <button class="yellow-button" type="button" :disabled="submitting || !agreedToTerms" @click="handleRegister">
            {{ submitting ? '提交中...' : '提交注册' }}
          </button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import http from '@/common/http'
import type { ApiResponse } from '@/types/api'

interface RegisterPayload {
  yonghuzhanghao: string
  mima: string
  yonghuxingming: string
  xingbie: string
  shoujihaoma: string
  touxiang?: string
  shengao?: string
  tizhong?: string
  huiyuankahao?: string
}

const router = useRouter()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const genderOptions = ['男', '女']

const form = reactive({
  yonghuzhanghao: '',
  mima: '',
  confirmPassword: '',
  yonghuxingming: '',
  xingbie: genderOptions[0],
  shoujihaoma: '',
  shengao: '',
  tizhong: '',
  huiyuankahao: '',
  touxiang: '',
})

const agreedToTerms = ref(false)

const rules: FormRules<typeof form> = {
  yonghuzhanghao: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, message: '账号至少 3 个字符', trigger: 'blur' },
  ],
  mima: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value !== form.mima) {
          callback(new Error('两次密码输入不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  yonghuxingming: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  xingbie: [{ required: true, message: '请选择性别', trigger: 'change' }],
  shoujihaoma: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '手机号格式不正确',
      trigger: 'blur',
    },
  ],
}

function handleAvatarChange(value: string) {
  form.touxiang = value
}

function resetForm() {
  formRef.value?.resetFields()
  form.touxiang = ''
  agreedToTerms.value = false
}

async function handleRegister() {
  if (submitting.value) return
  if (!agreedToTerms.value) {
    ElMessage.warning('请先阅读并同意《使用条款》和《隐私政策》')
    return
  }
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    const payload: RegisterPayload = {
      yonghuzhanghao: form.yonghuzhanghao,
      mima: form.mima,
      yonghuxingming: form.yonghuxingming,
      xingbie: form.xingbie,
      shoujihaoma: form.shoujihaoma,
      shengao: form.shengao || undefined,
      tizhong: form.tizhong || undefined,
      huiyuankahao: form.huiyuankahao || undefined,
      touxiang: form.touxiang || undefined,
    }
    const response = await http.post<ApiResponse>('/yonghu/register', payload)
    if (response.data.code !== 0) {
      throw new Error(response.data.msg || '注册失败')
    }
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (error: any) {
    console.error(error)
    ElMessage.error(error?.response?.data?.msg || error?.message || '注册失败，请稍后再试')
  } finally {
    submitting.value = false
  }
}

function goLogin() {
  router.push('/login')
}
</script>

<style scoped lang="scss">
@use '@/styles/design-tokens.scss' as *;

.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  background: radial-gradient(circle at 15% 15%, rgba(253, 216, 53, 0.28), transparent 45%),
    radial-gradient(circle at 80% 10%, rgba(253, 216, 53, 0.18), transparent 45%), #020202;
}

.register-card {
  width: min(1100px, 100%);
  padding: 48px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 32px;
  color: var(--color-text-secondary);

  .eyebrow {
    margin: 0 0 12px;
    @include section-eyebrow;
  }

  h1 {
    margin: 0 0 8px;
    color: var(--color-text-primary);
  }

  p {
    margin: 0;
  }
}

.register-form {
  margin-top: 16px;
  @include form-field-dark;

  :deep(.el-form-item__label) {
    color: var(--color-text-secondary);
  }
}

.legal-link {
  color: rgba(253, 216, 53, 0.9);
  text-decoration: none;
  margin: 0 2px;

  &:hover {
    text-decoration: underline;
  }
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;

  button {
    min-width: 180px;
    border: none;
    cursor: pointer;

    &[disabled] {
      opacity: 0.8;
      cursor: not-allowed;
    }
  }
}

@media (max-width: 900px) {
  .register-card {
    padding: 32px 24px;
  }

  .header {
    flex-direction: column;
  }

  .actions {
    flex-direction: column;

    button {
      width: 100%;
    }
  }
}
</style>

