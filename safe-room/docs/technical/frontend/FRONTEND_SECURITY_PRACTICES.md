---
title: FRONTEND SECURITY PRACTICES
version: v1.0.0
last_updated: 2025-11-16
status: active
category: technical
---
# 前端安全工程实践文档

> 本文档说明前端项目中实施的安全工程实践，包括XSS防护、CSRF防护、输入验证、路由守卫等安全措施。

## 目录

1. [概述](#概述)
2. [安全工具库](#安全工具库)
3. [路由守卫](#路由守卫)
4. [HTTP拦截器增强](#http拦截器增强)
5. [XSS防护](#xss防护)
6. [文件上传安全](#文件上传安全)
7. [使用示例](#使用示例)
8. [最佳实践](#最佳实践)

---

## 概述

前端安全工程实践包括以下核心安全措施：

- **XSS防护**：使用DOMPurify清理HTML内容，防止跨站脚本攻击
- **CSRF防护**：自动添加CSRF Token到请求头
- **路由守卫**：验证用户身份和权限，防止未授权访问
- **输入验证**：统一验证用户输入，防止SQL注入和XSS攻击
- **敏感数据脱敏**：在显示敏感信息时进行脱敏处理
- **文件上传校验**：前端文件类型、大小、MIME类型校验

---

## 安全工具库

### 1. XSS防护工具 (`utils/security.ts`)

提供HTML清理和转义功能：

```typescript
import { sanitizeHtml, escapeHtml, stripHtml } from '@/utils/security'

// 清理HTML内容，移除潜在的XSS代码
const safeHtml = sanitizeHtml(userInput)

// 转义HTML特殊字符
const safeText = escapeHtml(userInput)

// 移除HTML标签，只保留纯文本
const plainText = stripHtml(htmlContent)
```

### 2. 输入验证工具 (`utils/validator.ts`)

提供各种格式验证函数：

```typescript
import { 
  validateEmail, 
  validatePhone, 
  validateIdCard,
  validateInput,
  containsSqlInjection,
  containsXss
} from '@/utils/validator'

// 验证邮箱
if (validateEmail(email)) {
  // 邮箱格式正确
}

// 综合验证用户输入
const result = validateInput(userInput)
if (!result.isValid) {
  console.error(result.errors)
}
```

### 3. 敏感数据脱敏工具 (`utils/mask.ts`)

用于脱敏显示敏感信息：

```typescript
import { maskPhone, maskIdCard, maskEmail, maskName } from '@/utils/mask'

// 手机号脱敏：138****8888
const maskedPhone = maskPhone('13812348888')

// 身份证脱敏：110***********1234
const maskedIdCard = maskIdCard('110101199001011234')

// 邮箱脱敏：abc***@example.com
const maskedEmail = maskEmail('abc@example.com')

// 姓名脱敏：张*
const maskedName = maskName('张三')
```

### 4. CSRF Token工具 (`utils/csrf.ts`)

自动管理CSRF Token：

```typescript
import { getOrCreateCsrfToken, CSRF_TOKEN_HEADER } from '@/utils/csrf'

// 获取或创建CSRF Token（HTTP拦截器已自动处理）
const token = getOrCreateCsrfToken()
```

### 5. 安全存储工具 (`utils/secureStorage.ts`)

使用sessionStorage存储敏感数据（相比localStorage更安全）：

```typescript
import { secureStorage, tokenStorage } from '@/utils/secureStorage'

// 存储Token（带过期时间）
tokenStorage.setToken(token, expiryTime)

// 获取Token（自动检查过期）
const token = tokenStorage.getToken()

// 检查Token是否有效
if (tokenStorage.hasValidToken()) {
  // Token有效
}
```

---

## 路由守卫

路由守卫自动验证用户身份，防止未授权访问：

### 管理后台 (`admin/admin/src/router/index.ts`)

```typescript
router.beforeEach((to, from, next) => {
  // 公开路由
  const publicRoutes = ['/login', '/register']
  
  if (publicRoutes.includes(to.path)) {
    next()
    return
  }
  
  // 检查Token
  const token = localStorage.getItem('Token')
  if (!token) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }
  
  next()
})
```

### 前台 (`front/front/src/router/index.ts`)

```typescript
router.beforeEach((to, from, next) => {
  // 公开路由
  const publicRoutes = ['/login', '/register', '/index/home', '/index/news']
  
  if (publicRoutes.some(route => to.path.startsWith(route))) {
    next()
    return
  }
  
  // 检查Token
  const token = localStorage.getItem('frontToken')
  if (!token) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }
  
  next()
})
```

---

## HTTP拦截器增强

HTTP拦截器自动添加CSRF Token和改进错误处理：

### 功能特性

1. **自动添加CSRF Token**：所有非GET请求自动添加CSRF Token头
2. **请求ID追踪**：每个请求自动生成唯一ID，便于追踪和调试
3. **统一错误处理**：避免泄露敏感信息，返回友好的错误消息
4. **自动重定向**：401/403错误自动清除Token并跳转登录页

### 使用示例

```typescript
import http from '@/utils/http'

// 所有请求自动添加CSRF Token和请求ID
const response = await http.post('/api/data', { name: 'test' })
```

---

## XSS防护

### SafeHtml组件

使用SafeHtml组件安全渲染HTML内容：

```vue
<template>
  <!-- 替换 v-html -->
  <SafeHtml :html="content" className="content" />
</template>

<script setup>
import SafeHtml from '@/components/common/SafeHtml.vue'
</script>
```

### 已修复的组件

- `front/front/src/pages/news/news-detail.vue`：使用SafeHtml组件渲染公告内容
- `front/front/src/components/modules/ModuleDetail.vue`：使用SafeHtml组件渲染富文本字段

---

## 文件上传安全

### 文件上传校验工具 (`utils/fileUpload.ts`)

提供文件类型、大小、MIME类型校验：

```typescript
import { validateFile, createBeforeUpload } from '@/utils/fileUpload'

// 校验单个文件
const result = validateFile(file, {
  allowedExtensions: ['jpg', 'png', 'pdf'],
  allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
  maxSize: 5 * 1024 * 1024 // 5MB
})

if (!result.valid) {
  console.error(result.error)
}

// 用于Element Plus的el-upload组件
const beforeUpload = createBeforeUpload({
  allowedExtensions: ['jpg', 'png'],
  maxSize: 3 * 1024 * 1024 // 3MB
})
```

### 使用示例

```vue
<template>
  <el-upload
    :before-upload="beforeUpload"
    action="/api/upload"
  >
    <el-button>上传文件</el-button>
  </el-upload>
</template>

<script setup>
import { createBeforeUpload } from '@/utils/fileUpload'

const beforeUpload = createBeforeUpload({
  allowedExtensions: ['jpg', 'png', 'pdf'],
  maxSize: 5 * 1024 * 1024
})
</script>
```

---

## 使用示例

### 完整的表单验证示例

```vue
<template>
  <el-form @submit.prevent="handleSubmit">
    <el-form-item label="邮箱">
      <el-input v-model="form.email" />
      <span v-if="!validateEmail(form.email)" class="error">邮箱格式不正确</span>
    </el-form-item>
    
    <el-form-item label="手机号">
      <el-input v-model="form.phone" />
      <span v-if="!validatePhone(form.phone)" class="error">手机号格式不正确</span>
    </el-form-item>
    
    <el-form-item label="内容">
      <el-input v-model="form.content" type="textarea" />
      <SafeHtml :html="form.content" v-if="form.content" />
    </el-form-item>
    
    <el-button type="primary" @click="handleSubmit">提交</el-button>
  </el-form>
</template>

<script setup>
import { ref } from 'vue'
import { validateEmail, validatePhone, validateInput } from '@/utils/validator'
import { sanitizeInput } from '@/utils/security'
import SafeHtml from '@/components/common/SafeHtml.vue'

const form = ref({
  email: '',
  phone: '',
  content: ''
})

function handleSubmit() {
  // 综合验证
  const emailResult = validateInput(form.value.email)
  const phoneResult = validateInput(form.value.phone)
  
  if (!emailResult.isValid || !phoneResult.isValid) {
    // 显示错误
    return
  }
  
  // 清理输入
  const cleanData = {
    email: sanitizeInput(form.value.email),
    phone: sanitizeInput(form.value.phone),
    content: sanitizeInput(form.value.content, true) // 允许HTML
  }
  
  // 提交数据
}
</script>
```

### 敏感数据脱敏显示示例

```vue
<template>
  <div>
    <p>手机号：{{ maskedPhone }}</p>
    <p>身份证：{{ maskedIdCard }}</p>
    <p>邮箱：{{ maskedEmail }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { maskPhone, maskIdCard, maskEmail } from '@/utils/mask'

const userInfo = {
  phone: '13812348888',
  idCard: '110101199001011234',
  email: 'user@example.com'
}

const maskedPhone = computed(() => maskPhone(userInfo.phone))
const maskedIdCard = computed(() => maskIdCard(userInfo.idCard))
const maskedEmail = computed(() => maskEmail(userInfo.email))
</script>
```

---

## 最佳实践

### 1. 始终使用SafeHtml组件渲染HTML内容

❌ **错误做法**：
```vue
<div v-html="content"></div>
```

✅ **正确做法**：
```vue
<SafeHtml :html="content" />
```

### 2. 验证所有用户输入

```typescript
// 在提交前验证
const result = validateInput(userInput)
if (!result.isValid) {
  // 处理错误
  return
}

// 清理输入
const cleanInput = sanitizeInput(userInput)
```

### 3. 对敏感数据进行脱敏显示

```typescript
// 在列表中显示脱敏数据
const displayPhone = maskPhone(user.phone)
```

### 4. 使用文件上传校验

```typescript
// 在文件上传前校验
const beforeUpload = createBeforeUpload({
  allowedExtensions: ['jpg', 'png'],
  maxSize: 3 * 1024 * 1024
})
```

### 5. 不要在前端存储敏感信息

- 使用sessionStorage而非localStorage存储Token
- 不要在代码中硬编码敏感信息
- 使用环境变量管理配置

### 6. 错误处理

- 不要向用户显示详细的错误信息
- 记录错误日志用于调试
- 返回友好的错误提示

---

## 注意事项

1. **前端安全不能替代后端安全**：所有安全措施应与后端配合使用
2. **保持更新**：定期更新依赖包，修复安全漏洞
3. **代码审查**：在代码审查时检查安全措施是否正确实施
4. **安全测试**：定期进行安全测试，发现潜在漏洞

---

## 相关文档

- [安全最佳实践](./SECURITY.md)
- [API安全文档](./API_SECURITY.md)
- [架构文档](./ARCHITECTURE.md)

---

> 最后更新：2025-01-XX
> 
> 如有问题或建议，请联系开发团队。

