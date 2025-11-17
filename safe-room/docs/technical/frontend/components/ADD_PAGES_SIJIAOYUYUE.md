---
title: ADD_PAGES_SIJIAOYUYUE
version: v1.0.0
last_updated: 2025-11-17
status: active
category: technical
tags: [vue, component, frontend, page, form, sijiaoyuyue]
---

# ADD_PAGES_SIJIAOYUYUE

> **版本**：v1.0.0
> **更新日期**：2025-11-17
> **组件类型**：页面组件
> **适用框架**：Vue 3 + TypeScript + Element Plus
> **依赖组件**：ModuleFormPage, ModuleForm

---

## 📋 目录

- [概述](#概述)
- [功能特性](#功能特性)
- [API接口](#api接口)
- [使用示例](#使用示例)
- [实现细节](#实现细节)
- [测试说明](#测试说明)
- [相关文档](#相关文档)

---

## 📖 概述

### 组件描述

私教预约添加页面用于创建新的私教预约记录或编辑现有的预约信息。该组件基于共享的模块表单组件构建，提供了统一的表单填写和数据提交体验，支持创建和编辑两种模式。

### 适用场景

- 创建新的私教预约记录
- 编辑现有的预约信息
- 管理员后台管理预约数据
- 用户修改预约详情

### 依赖关系

```json
{
  "vue": "^3.3.0",
  "vue-router": "^4.2.0",
  "element-plus": "^2.4.0"
}
```

---

## ✨ 功能特性

### 核心功能

- [x] **动态表单模式**：支持创建和编辑两种模式
- [x] **数据初始化**：编辑模式下自动加载现有数据
- [x] **表单验证**：完整的前端验证和后端提交处理
- [x] **成功反馈**：操作成功后的消息提示和页面跳转
- [x] **加载状态**：表单加载和提交过程中的状态展示
- [x] **错误处理**：数据加载失败和提交失败的处理

### 扩展功能

- [x] **路由参数解析**：自动识别创建/编辑模式
- [x] **导航集成**：成功后自动跳转到列表页面
- [x] **取消操作**：支持取消操作并返回列表

---

## 🔧 API接口

### Props 属性

该组件不直接接受props，通过路由参数控制：

#### 路由参数

| 参数 | 类型 | 必需 | 默认值 | 说明 |
|------|------|-------|--------|------|
| `id` | `string` | 否 | `undefined` | 编辑模式下的记录ID，不提供则为创建模式 |

### Events 事件

该组件不触发外部事件。

### Slots 插槽

该组件不提供插槽。

### Expose 方法

该组件不暴露公共方法。

---

## 💡 使用示例

### 基本用法

```vue
<!-- 路由配置 -->
<template>
  <router-view />
</template>

<script setup lang="ts">
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/sijiaoyuyue/add',
    name: 'PrivateBookingAdd',
    component: () => import('@/pages/sijiaoyuyue/add.vue'),
    meta: { title: '添加私教预约' }
  },
  {
    path: '/sijiaoyuyue/edit',
    name: 'PrivateBookingEdit',
    component: () => import('@/pages/sijiaoyuyue/add.vue'),
    meta: { title: '编辑私教预约' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})
</script>
```

### 路由导航

```typescript
// 创建新预约
router.push('/sijiaoyuyue/add')

// 编辑现有预约
router.push({
  path: '/sijiaoyuyue/add',
  query: { id: '123' }
})
```

### 列表页面操作

```vue
<template>
  <div class="booking-list">
    <div class="list-header">
      <el-button type="primary" @click="addNew">
        添加预约
      </el-button>
    </div>

    <div
      v-for="booking in bookings"
      :key="booking.id"
      class="booking-item"
    >
      <span>{{ booking.jiaolianxingming }}</span>
      <el-button size="small" @click="editBooking(booking)">
        编辑
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function addNew() {
  router.push('/sijiaoyuyue/add')
}

function editBooking(booking: any) {
  router.push({
    path: '/sijiaoyuyue/add',
    query: { id: booking.id }
  })
}
</script>
```

---

## 🔍 实现细节

### 组件结构

```
src/pages/sijiaoyuyue/add.vue
└── ModuleFormPage (共享表单页面容器)
    ├── 加载状态 (骨架屏)
    └── ModuleForm (核心表单组件)
        ├── 表单字段区域
        ├── 验证提示区域
        └── 操作按钮区域
```

### 核心逻辑

#### 模式识别

```typescript
// 根据路由参数判断是创建还是编辑模式
const isEdit = computed(() => Boolean(route.query.id))
```

#### 数据初始化

```typescript
// 编辑模式下的数据加载
watchEffect(() => {
  const id = route.query.id as string | undefined

  if (!id) {
    // 创建模式：重置状态
    loading.value = false
    initialData.value = undefined
    return
  }

  // 编辑模式：加载现有数据
  loading.value = true
  service
    .detail(id)
    .then((data) => {
      initialData.value = data
    })
    .finally(() => {
      loading.value = false
    })
})
```

#### 成功处理

```typescript
function handleSuccess() {
  // 显示成功消息
  ElMessage.success(isEdit.value ? '更新成功' : '创建成功')

  // 跳转到列表页面
  router.push(props.listRoute)
}

function goBack() {
  // 取消操作，返回列表
  router.push(props.listRoute)
}
```

### 数据流

#### 组件通信

```vue
<!-- ModuleFormPage 传递数据给 ModuleForm -->
<ModuleForm
  :module-key="moduleKey"
  :mode="isEdit ? 'edit' : 'create'"
  :initial-data="initialData"
  @success="handleSuccess"
  @cancel="goBack"
/>
```

#### 状态管理

```typescript
// 响应式状态
const loading = ref(false)           // 加载状态
const initialData = ref<Record<string, any> | undefined>() // 初始数据

// 计算属性
const isEdit = computed(() => Boolean(route.query.id)) // 是否为编辑模式
```

### 表单处理

#### 创建模式

```typescript
// 创建模式：表单为空，用户填写完整信息
const initialData = undefined // 没有初始数据
```

#### 编辑模式

```typescript
// 编辑模式：加载现有数据填充表单
const initialData = await service.detail(id) // 从服务器获取数据
```

### 错误处理

#### 数据加载失败

```typescript
// 静默处理数据加载失败
service
  .detail(id)
  .then((data) => {
    initialData.value = data
  })
  .catch((error) => {
    console.error('加载数据失败', error)
    // 可以选择显示错误提示或重定向
  })
  .finally(() => {
    loading.value = false
  })
```

#### 表单提交失败

```typescript
// 由ModuleForm组件处理，显示相应的错误提示
```

### 性能优化

#### 条件渲染

```vue
<!-- 根据加载状态决定渲染内容 -->
<el-skeleton v-if="loading" :rows="6" animated />
<ModuleForm v-else ... />
```

#### 懒加载

```typescript
// 路由级别的组件懒加载
const routes = [
  {
    path: '/sijiaoyuyue/add',
    component: () => import('@/pages/sijiaoyuyue/add.vue')
  }
]
```

#### 响应式监听优化

```typescript
// 使用 watchEffect 自动清理监听器
watchEffect(() => {
  const id = route.query.id as string | undefined
  // 处理路由参数变化
})
```

---

## 🧪 测试说明

### 单元测试

```typescript
// PrivateBookingAdd.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import PrivateBookingAdd from '../add.vue'

describe('PrivateBookingAdd', () => {
  it('should render ModuleFormPage with correct props', () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: []
    })

    const wrapper = mount(PrivateBookingAdd, {
      global: { plugins: [router] },
      props: {
        moduleKey: 'sijiaoyuyue',
        listRoute: '/sijiaoyuyue'
      }
    })

    const moduleFormPage = wrapper.findComponent({ name: 'ModuleFormPage' })
    expect(moduleFormPage.exists()).toBe(true)
    expect(moduleFormPage.props('moduleKey')).toBe('sijiaoyuyue')
  })

  it('should show skeleton loading initially in edit mode', async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: []
    })

    // 模拟编辑模式
    await router.push('/sijiaoyuyue/add?id=123')

    const wrapper = mount(PrivateBookingAdd, {
      global: { plugins: [router] }
    })

    // 应该显示骨架屏
    expect(wrapper.find('.el-skeleton').exists()).toBe(true)
  })
})
```

### 集成测试

```typescript
// PrivateBookingAdd.integration.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import PrivateBookingAdd from '../add.vue'

describe('PrivateBookingAdd Integration', () => {
  it('should handle create mode correctly', async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [{
        path: '/sijiaoyuyue/add',
        component: PrivateBookingAdd
      }]
    })

    await router.push('/sijiaoyuyue/add')

    const wrapper = mount(PrivateBookingAdd, {
      global: { plugins: [router] }
    })

    // 验证ModuleForm接收到正确的mode
    const moduleForm = wrapper.findComponent({ name: 'ModuleForm' })
    expect(moduleForm.props('mode')).toBe('create')
    expect(moduleForm.props('initialData')).toBeUndefined()
  })

  it('should handle edit mode with data loading', async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: []
    })

    await router.push('/sijiaoyuyue/add?id=123')

    const wrapper = mount(PrivateBookingAdd, {
      global: { plugins: [router] }
    })

    // 等待数据加载
    await new Promise(resolve => setTimeout(resolve, 100))

    const moduleForm = wrapper.findComponent({ name: 'ModuleForm' })
    expect(moduleForm.props('mode')).toBe('edit')
    // initialData 应该被设置（具体值取决于mock数据）
  })

  it('should navigate back on success', async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: []
    })

    const wrapper = mount(PrivateBookingAdd, {
      global: { plugins: [router] }
    })

    const moduleForm = wrapper.findComponent({ name: 'ModuleForm' })

    // 模拟成功事件
    await moduleForm.vm.$emit('success')

    // 应该跳转到列表页面
    expect(router.currentRoute.value.path).toBe('/sijiaoyuyue')
  })
})
```

### E2E测试

```typescript
// private-booking-add.e2e.spec.ts
import { test, expect } from '@playwright/test'

test('create new private booking', async ({ page }) => {
  await page.goto('/sijiaoyuyue/add')

  // 验证页面标题
  await expect(page.locator('h1')).toContainText('添加私教预约')

  // 填写表单
  await page.fill('input[name="jiaolianxingming"]', '测试教练')
  await page.fill('input[name="yonghuxingming"]', '测试用户')
  await page.fill('input[name="shoujihaoma"]', '13800138000')

  // 提交表单
  await page.click('button:has-text("提交")')

  // 验证成功消息和跳转
  await expect(page.locator('.el-message')).toContainText('创建成功')
  await expect(page).toHaveURL('/sijiaoyuyue')
})

test('edit existing private booking', async ({ page }) => {
  await page.goto('/sijiaoyuyue/add?id=123')

  // 验证数据已加载
  await expect(page.locator('input[name="jiaolianxingming"]')).not.toBeEmpty()

  // 修改数据
  await page.fill('input[name="beizhu"]', '修改备注信息')

  // 提交表单
  await page.click('button:has-text("更新")')

  // 验证成功消息
  await expect(page.locator('.el-message')).toContainText('更新成功')
})
```

---

## 📚 相关文档

### 内部文档

- [ModuleFormPage组件](../technical/frontend/components/MODULEFORMPAGE.md)
- [ModuleForm组件](../technical/frontend/components/MODULEFORM.md)
- [私教预约列表页面](../technical/frontend/components/LIST_PAGES_SIJIAOYUYUE.md)
- [私教预约详情页面](../technical/frontend/components/DETAIL_PAGES_SIJIAOYUYUE.md)

### 外部资源

- [Vue Router 编程式导航](https://router.vuejs.org/guide/essentials/navigation.html)
- [Element Plus Message 消息提示](https://element-plus.org/zh-CN/component/message.html)
- [Vue 3 watchEffect](https://cn.vuejs.org/api/reactivity-core.html#watcheffect)

---

## 🔄 更新记录

| 日期 | 版本 | 更新内容 | 更新人 |
|------|------|----------|--------|
| 2025-11-17 | v1.0.0 | 初始版本，记录私教预约添加页面技术文档 | 文档工程团队 |
