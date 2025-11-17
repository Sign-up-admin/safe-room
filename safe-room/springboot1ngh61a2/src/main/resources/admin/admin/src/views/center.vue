<template>
  <div class="center-page">
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h1 class="page-title">个人中心</h1>
          <p class="page-subtitle">管理您的个人信息和账户设置</p>
        </div>
      </div>
    </div>

    <div class="content-wrapper">
      <!-- Avatar Section -->
      <el-card class="avatar-card" shadow="hover">
        <div class="avatar-section">
          <el-avatar :src="avatarUrl" :size="120" class="user-avatar">
            {{ userInitial }}
          </el-avatar>
          <div class="avatar-info">
            <h3 class="user-name">{{ formModel.yonghuxingming || formModel.jiaolianxingming || adminName }}</h3>
            <p class="user-role">{{ roleName }}</p>
            <p class="user-table">数据表：{{ tableName }}</p>
          </div>
          <div class="avatar-upload-wrapper">
            <ImageUpload
              v-model="avatarModel"
              :limit="1"
              :multiple="false"
              list-type="picture-card"
              :max-size="2"
              tip="支持jpg/png/webp格式，大小不超过2MB"
              @change="handleAvatarChange"
            />
          </div>
        </div>
      </el-card>

      <!-- Profile Form -->
      <el-card v-loading="loading" class="profile-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <div class="header-title">
              <el-icon class="title-icon"><UserFilled /></el-icon>
              <h2>基本信息</h2>
            </div>
            <el-button type="primary" icon="Check" :loading="saving" class="save-btn" @click="saveProfile">
              保存修改
            </el-button>
          </div>
        </template>

        <el-form ref="formRef" :model="formModel" :rules="formRules" label-width="140px" class="profile-form">
          <el-row :gutter="24">
            <el-col v-for="field in displayFields" :key="field.key" :xs="24" :sm="24" :md="12" :lg="12">
              <el-form-item :label="field.label" :prop="field.key" :required="field.required">
                <component
                  :is="getFieldComponent(field)"
                  v-model="formModel[field.key]"
                  :placeholder="`请输入${field.label}`"
                  :type="field.type"
                  :options="field.options"
                  :rows="field.rows"
                  clearable
                  v-bind="getFieldProps(field)"
                />
                <div v-if="field.hint" class="field-hint">
                  <el-icon><InfoFilled /></el-icon>
                  <span>{{ field.hint }}</span>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>

      <!-- Account Security -->
      <el-card class="security-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <div class="header-title">
              <el-icon class="title-icon"><Lock /></el-icon>
              <h2>账户安全</h2>
            </div>
          </div>
        </template>

        <div class="security-actions">
          <div class="security-item">
            <div class="security-info">
              <el-icon class="security-icon"><Lock /></el-icon>
              <div>
                <h4>登录密码</h4>
                <p>定期更换密码可提高账户安全性</p>
              </div>
            </div>
            <el-button type="primary" plain icon="Edit" @click="gotoUpdatePassword"> 修改密码 </el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts" name="Center">
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { UserFilled, InfoFilled, Lock, Upload, Check, Edit } from '@element-plus/icons-vue'
import http from '@/utils/http'
import storage from '@/utils/storage'
import base from '@/utils/base'
import { validateInput, containsSqlInjection, containsXss } from '@/utils/validator'
import ImageUpload from '@/components/common/ImageUpload.vue'

interface FieldConfig {
  key: string
  label: string
  type?: 'text' | 'textarea' | 'number' | 'email' | 'tel' | 'date'
  required?: boolean
  hint?: string
  options?: Array<{ label: string; value: any }>
  rows?: number
  component?: string
}

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const saving = ref(false)
const tableName = storage.get('sessionTable') || 'users'
const formModel = reactive<Record<string, any>>({})
const fields = ref<string[]>([])

// Computed properties
const adminName = computed(() => storage.get('adminName') || '')
const role = computed(() => storage.get('role') || 'User')
const roleName = computed(() => {
  const roleMap: Record<string, string> = {
    Administrator: '管理员',
    教练: '健身教练',
    用户: '会员用户',
  }
  return roleMap[role.value] || role.value
})

const avatarUrl = computed(() => {
  const avatar = storage.get('headportrait') || formModel.touxiang || formModel.zhaopian || formModel.image
  return avatar ? base.get().url + avatar : ''
})

const userInitial = computed(() => {
  const name = formModel.yonghuxingming || formModel.jiaolianxingming || adminName.value
  return name?.charAt(0)?.toUpperCase() || 'U'
})

const defaultAvatar = new URL('@/assets/img/avator.png', import.meta.url).href
const avatarModel = ref<string>('')
const avatarUploadVisible = ref(false)
const avatarUploadUrl = ref<string>('')

// Field configurations
const fieldConfigs: Record<string, FieldConfig> = {
  yonghuzhanghao: { key: 'yonghuzhanghao', label: '用户账号', type: 'text', required: true },
  jiaoliangonghao: { key: 'jiaoliangonghao', label: '教练工号', type: 'text', required: true },
  yonghuxingming: { key: 'yonghuxingming', label: '姓名', type: 'text', required: true },
  jiaolianxingming: { key: 'jiaolianxingming', label: '教练姓名', type: 'text', required: true },
  shoujihaoma: {
    key: 'shoujihaoma',
    label: '手机号',
    type: 'tel',
    hint: '11位手机号码',
  },
  lianxidianhua: {
    key: 'lianxidianhua',
    label: '联系电话',
    type: 'tel',
    hint: '11位手机号码',
  },
  youxiang: { key: 'youxiang', label: '邮箱', type: 'email' },
  xingbie: {
    key: 'xingbie',
    label: '性别',
    type: 'text',
    options: [
      { label: '男', value: '男' },
      { label: '女', value: '女' },
    ],
  },
  nianling: { key: 'nianling', label: '年龄', type: 'number' },
  shenfenzheng: { key: 'shenfenzheng', label: '身份证', type: 'text' },
  dizhi: { key: 'dizhi', label: '地址', type: 'textarea', rows: 3 },
  beizhu: { key: 'beizhu', label: '备注', type: 'textarea', rows: 4 },
}

const displayFields = computed<FieldConfig[]>(() => fields.value
    .filter(key => key !== 'id' && key !== 'mima' && key !== 'password')
    .map(key => {
      const config = fieldConfigs[key]
      if (config) {
        return config
      }
      // Default config for unknown fields
      return {
        key,
        label: key,
        type: 'text' as const,
      }
    }))

// Form validation rules
const formRules = computed<FormRules>(() => {
  const rules: FormRules = {}
  displayFields.value.forEach(field => {
    if (field.required) {
      rules[field.key] = [{ required: true, message: `请输入${field.label}`, trigger: 'blur' }]
    }

    // Add specific validation
    if (field.type === 'tel' || field.key === 'shoujihaoma' || field.key === 'lianxidianhua') {
      rules[field.key] = [
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

    if (field.type === 'email' || field.key === 'youxiang') {
      rules[field.key] = [
        {
          type: 'email',
          message: '请输入正确的邮箱地址',
          trigger: 'blur',
        },
      ]
    }
  })
  return rules
})

onMounted(() => {
  fetchProfile()
})

async function fetchProfile() {
  loading.value = true
  try {
    const response = await http.get(`/${tableName}/session`)
    if (response.data.code === 0) {
      const data = response.data.data || {}
      Object.assign(formModel, data)
      fields.value = Object.keys(data).filter(key => key !== 'id')

      // Update avatar in storage and model
      if (tableName === 'yonghu' && data.touxiang) {
        storage.set('headportrait', data.touxiang)
        avatarModel.value = data.touxiang
      } else if (tableName === 'jianshenjiaolian' && data.zhaopian) {
        storage.set('headportrait', data.zhaopian)
        avatarModel.value = data.zhaopian
      } else if (tableName === 'users' && data.image) {
        storage.set('headportrait', data.image)
        avatarModel.value = data.image
      } else {
        avatarModel.value = ''
      }
    } else {
      ElMessage.error(response.data.msg || '加载个人信息失败')
    }
  } catch (error: any) {
    console.error(error)
    const errorMsg = error?.response?.data?.msg || error?.message || '加载个人信息失败'
    ElMessage.error(errorMsg)
  } finally {
    loading.value = false
  }
}

async function saveProfile() {
  try {
    await formRef.value?.validate()
  } catch {
    ElMessage.error('请检查表单填写是否正确')
    return
  }

  // Security validation
  for (const field of displayFields.value) {
    const value = formModel[field.key]
    if (value && typeof value === 'string') {
      const validation = validateInput(value)
      if (!validation.isValid) {
        ElMessage.error(`${field.label}包含非法字符`)
        return
      }
    }
  }

  saving.value = true
  try {
    const response = await http.post(`/${tableName}/update`, formModel)
    if (response.data.code === 0) {
      ElMessage.success('保存成功')
      // Refresh profile data
      await fetchProfile()
    } else {
      ElMessage.error(response.data.msg || '保存失败')
    }
  } catch (error: any) {
    console.error(error)
    const errorMsg = error?.response?.data?.msg || error?.message || '保存失败'
    ElMessage.error(errorMsg)
  } finally {
    saving.value = false
  }
}

function getFieldComponent(field: FieldConfig) {
  if (field.component) {
    return field.component
  }
  if (field.type === 'textarea') {
    return 'el-input'
  }
  if (field.options && field.options.length > 0) {
    return 'el-select'
  }
  return 'el-input'
}

function getFieldProps(field: FieldConfig) {
  const props: Record<string, any> = {}
  if (field.type === 'textarea') {
    props.type = 'textarea'
    props.rows = field.rows || 3
  }
  if (field.options && field.options.length > 0) {
    props.options = field.options
  }
  return props
}

function handleAvatarChange(url: string | string[]) {
  if (Array.isArray(url)) {
    avatarModel.value = url[0] || ''
  } else {
    avatarModel.value = url || ''
  }

  // 根据当前表名确定头像字段名
  const avatarField =
    tableName === 'yonghu'
      ? 'touxiang'
      : tableName === 'jianshenjiaolian'
        ? 'zhaopian'
        : tableName === 'users'
          ? 'image'
          : 'touxiang'

  // 更新表单模型
  formModel[avatarField] = avatarModel.value

  // 自动保存头像
  if (avatarModel.value) {
    saveAvatar()
  }
}

async function saveAvatar() {
  if (!avatarModel.value) return

  // 根据当前表名确定头像字段名
  const avatarField =
    tableName === 'yonghu'
      ? 'touxiang'
      : tableName === 'jianshenjiaolian'
        ? 'zhaopian'
        : tableName === 'users'
          ? 'image'
          : 'touxiang'

  // 更新表单模型
  formModel[avatarField] = avatarModel.value

  // 保存到后端
  saving.value = true
  try {
    const response = await http.post(`/${tableName}/update`, {
      ...formModel,
      [avatarField]: avatarModel.value,
    })

    if (response.data.code === 0) {
      ElMessage.success('头像更新成功')
      // 更新本地存储
      storage.set('headportrait', avatarModel.value)
      // 刷新个人信息
      await fetchProfile()
    } else {
      ElMessage.error(response.data.msg || '头像更新失败')
    }
  } catch (error: any) {
    console.error(error)
    const errorMsg = error?.response?.data?.msg || error?.message || '头像更新失败'
    ElMessage.error(errorMsg)
  } finally {
    saving.value = false
  }
}

async function confirmAvatarUpload() {
  if (!avatarUploadUrl.value) {
    ElMessage.warning('请先上传头像')
    return
  }

  avatarModel.value = avatarUploadUrl.value
  avatarUploadVisible.value = false
  await saveAvatar()
}

function gotoUpdatePassword() {
  router.push('/updatePassword')
}
</script>

<style scoped lang="scss">
@use '@/styles/tokens' as *;
@use '@/styles/mixins' as *;

.center-page {
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
  max-width: 1200px;
  margin: 0 auto;
}

.header-info {
  text-align: center;
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

// Avatar Card
.avatar-card {
  border-radius: 16px;
  overflow: hidden;

  :deep(.el-card__body) {
    padding: 32px;
  }
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.user-avatar {
  border: 4px solid #3a80ff;
  box-shadow: 0 8px 24px rgba(58, 128, 255, 0.3);
  flex-shrink: 0;
}

.avatar-info {
  flex: 1;
  min-width: 200px;
}

.user-name {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 600;
  color: #1a202c;
}

.user-role {
  margin: 0 0 4px;
  font-size: 14px;
  color: #3a80ff;
  font-weight: 500;
}

.user-table {
  margin: 0;
  font-size: 13px;
  color: #718096;
}

.avatar-upload-wrapper {
  flex-shrink: 0;
  :deep(.el-upload--picture-card) {
    width: 120px;
    height: 120px;
    line-height: 120px;
  }
  :deep(.el-upload-list--picture-card) {
    .el-upload-list__item {
      width: 120px;
      height: 120px;
    }
  }
}

// Profile Card
.profile-card {
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

.save-btn {
  border-radius: 8px;
  padding: 10px 24px;
  font-weight: 500;
}

// 表单样式已提取到 components/_forms.scss
// 安全卡片样式已提取到 components/_security.scss
// 使用 .profile-form, .field-hint, .security-card 等类名即可应用统一样式

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
  .avatar-section {
    flex-direction: column;
    text-align: center;
  }

  .avatar-info {
    width: 100%;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .save-btn {
    width: 100%;
  }

  .security-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .security-info {
    width: 100%;
  }
}

.avatar-upload-dialog {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

@media (width <= 480px) {
  .page-header {
    padding: 24px 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .content-wrapper {
    padding: 0 16px 16px;
    gap: 16px;
  }

  .avatar-card,
  .profile-card,
  .security-card {
    :deep(.el-card__body) {
      padding: 24px 16px;
    }
  }
}
</style>
