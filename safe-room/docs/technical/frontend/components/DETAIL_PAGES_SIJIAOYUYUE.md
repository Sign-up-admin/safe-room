---
title: DETAIL_PAGES_SIJIAOYUYUE
version: v1.0.0
last_updated: 2025-11-17
status: active
category: technical
tags: [vue, component, frontend, page, detail, sijiaoyuyue]
---

# DETAIL_PAGES_SIJIAOYUYUE

> **版本**：v1.0.0
> **更新日期**：2025-11-17
> **组件类型**：页面组件
> **适用框架**：Vue 3 + TypeScript + Element Plus
> **依赖组件**：ModuleDetailPage, ModuleDetail

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

私教预约详情页面用于展示单个私教预约记录的详细信息，包括预约状态、教练信息、时间安排、价格明细、联系方式等。该组件基于共享的模块详情组件构建，提供了统一的详情查看体验。

### 适用场景

- 查看私教预约的详细信息
- 预约状态跟踪和确认
- 预约信息修改和取消
- 关联数据的展示（如教练详情、课程信息）

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

- [x] **详情数据展示**：完整的预约信息展示
- [x] **关联数据加载**：支持通过关联字段查询数据
- [x] **导航集成**：返回列表页面的导航功能
- [x] **错误处理**：数据加载失败的友好提示
- [x] **加载状态**：骨架屏加载状态展示

### 扩展功能

- [x] **路由参数解析**：支持ID和关联字段查询
- [x] **数据预获取**：支持预获取的关联数据展示
- [x] **响应式布局**：适配不同屏幕尺寸的展示

---

## 🔧 API接口

### Props 属性

该组件不直接接受props，通过路由参数控制：

#### 路由参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `id` | `string` | 否 | 预约记录ID |
| `followColumn` | `string` | 否* | 关联查询字段名 |
| `followValue` | `string` | 否* | 关联查询字段值 |

*当使用关联查询时，`followColumn` 和 `followValue` 都需要提供

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
    path: '/sijiaoyuyue/detail',
    name: 'PrivateBookingDetail',
    component: () => import('@/pages/sijiaoyuyue/detail.vue'),
    meta: { title: '私教预约详情' }
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
// 直接通过ID查看详情
router.push({
  path: '/sijiaoyuyue/detail',
  query: { id: '123' }
})

// 通过关联字段查询
router.push({
  path: '/sijiaoyuyue/detail',
  query: {
    followColumn: 'jiaoliangonghao',
    followValue: 'JL001'
  }
})
```

### 列表页面跳转

```vue
<template>
  <div class="booking-list">
    <div
      v-for="booking in bookings"
      :key="booking.id"
      class="booking-item"
      @click="viewDetail(booking)"
    >
      {{ booking.jiaolianxingming }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function viewDetail(booking: any) {
  router.push({
    path: '/sijiaoyuyue/detail',
    query: { id: booking.id }
  })
}
</script>
```

---

## 🔍 实现细节

### 组件结构

```
src/pages/sijiaoyuyue/detail.vue
└── ModuleDetailPage (共享详情页面容器)
    ├── 错误提示 (无数据时)
    ├── ModuleDetail (核心详情组件)
    │   ├── 数据展示区域
    │   ├── 操作按钮区域
    │   └── 关联数据展示
    └── 加载状态 (骨架屏)
```

### 核心逻辑

#### 路由参数处理

```typescript
// 解析路由参数
const recordId = computed(() => route.query.id as string | undefined)
const followColumn = computed(() => route.query.followColumn as string | undefined)
const followValue = computed(() => route.query.followValue as string | undefined)

// 判断是否为关联查询
const shouldFollow = computed(() =>
  !recordId.value && !!followColumn.value && !!followValue.value
)
```

#### 关联数据加载

```typescript
// 监听关联查询参数变化
watch(
  () => [shouldFollow.value, followValue.value, followColumn.value],
  async () => {
    if (shouldFollow.value && followColumn.value && followValue.value) {
      await loadFollowRecord(followColumn.value, followValue.value)
    } else {
      followRecordData.value = null
    }
  },
  { immediate: true }
)

async function loadFollowRecord(column: string, value: string) {
  followLoading.value = true
  try {
    // 调用通用关联查询服务
    followRecordData.value = await followRecord(props.moduleKey, column, value)
  } catch (error) {
    console.warn('获取关联数据失败', error)
    followRecordData.value = null
  } finally {
    followLoading.value = false
  }
}
```

#### 导航处理

```typescript
function goBack() {
  // 返回到列表页面
  router.push(props.listRoute)
}
```

### 数据流

#### 组件通信

```vue
<!-- ModuleDetailPage 传递数据给 ModuleDetail -->
<ModuleDetail
  v-if="recordId || followRecordData"
  :module-key="moduleKey"
  :id="recordId"
  :prefetched="followRecordData"
  @back="goBack"
/>
```

#### 状态管理

```typescript
// 关联数据状态
const followRecordData = ref<Record<string, any> | null>(null)
const followLoading = ref(false)

// 计算属性
const recordId = computed(() => route.query.id as string | undefined)
const shouldFollow = computed(() =>
  !recordId.value && !!followColumn.value && !!followValue.value
)
```

### 错误处理

#### 数据加载失败

```vue
<!-- 错误状态展示 -->
<el-alert
  v-if="!recordId && !shouldFollow"
  type="warning"
  title="未指定要查看的数据"
  show-icon
  class="mb-16"
/>
```

#### 关联查询失败

```typescript
// 静默处理关联查询失败
try {
  followRecordData.value = await followRecord(props.moduleKey, column, value)
} catch (error) {
  console.warn('获取关联数据失败', error)
  followRecordData.value = null
}
```

### 性能优化

#### 条件渲染

```vue
<!-- 按条件渲染，避免不必要的组件创建 -->
<el-alert v-if="!recordId && !shouldFollow" ... />
<ModuleDetail v-else-if="recordId || followRecordData" ... />
<el-skeleton v-else-if="followLoading" ... />
```

#### 懒加载

```typescript
// 路由级别的组件懒加载
const routes = [
  {
    path: '/sijiaoyuyue/detail',
    component: () => import('@/pages/sijiaoyuyue/detail.vue')
  }
]
```

---

## 🧪 测试说明

### 单元测试

```typescript
// PrivateBookingDetail.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import PrivateBookingDetail from '../detail.vue'

describe('PrivateBookingDetail', () => {
  it('should render ModuleDetailPage with correct props', () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: []
    })

    const wrapper = mount(PrivateBookingDetail, {
      global: { plugins: [router] },
      props: {
        moduleKey: 'sijiaoyuyue',
        listRoute: '/sijiaoyuyue'
      }
    })

    const moduleDetailPage = wrapper.findComponent({ name: 'ModuleDetailPage' })
    expect(moduleDetailPage.exists()).toBe(true)
    expect(moduleDetailPage.props('moduleKey')).toBe('sijiaoyuyue')
  })

  it('should show warning when no query params', async () => {
    const wrapper = mount(PrivateBookingDetail)

    // 等待组件挂载
    await wrapper.vm.$nextTick()

    // 应该显示警告信息
    const alert = wrapper.find('.el-alert')
    expect(alert.exists()).toBe(true)
    expect(alert.text()).toContain('未指定要查看的数据')
  })
})
```

### 集成测试

```typescript
// PrivateBookingDetail.integration.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import PrivateBookingDetail from '../detail.vue'

describe('PrivateBookingDetail Integration', () => {
  it('should handle route query params correctly', async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [{
        path: '/sijiaoyuyue/detail',
        component: PrivateBookingDetail
      }]
    })

    // 模拟路由跳转
    await router.push('/sijiaoyuyue/detail?id=123')

    const wrapper = mount(PrivateBookingDetail, {
      global: { plugins: [router] }
    })

    // 验证ModuleDetail组件接收到正确的props
    const moduleDetail = wrapper.findComponent({ name: 'ModuleDetail' })
    expect(moduleDetail.props('id')).toBe('123')
  })

  it('should handle follow query correctly', async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: []
    })

    await router.push('/sijiaoyuyue/detail?followColumn=jiaoliangonghao&followValue=JL001')

    const wrapper = mount(PrivateBookingDetail, {
      global: { plugins: [router] }
    })

    // 验证关联查询参数处理
    const vm = wrapper.vm as any
    expect(vm.followColumn).toBe('jiaoliangonghao')
    expect(vm.followValue).toBe('JL001')
  })
})
```

### E2E测试

```typescript
// private-booking-detail.e2e.spec.ts
import { test, expect } from '@playwright/test'

test('view private booking detail', async ({ page }) => {
  // 访问详情页面
  await page.goto('/sijiaoyuyue/detail?id=123')

  // 验证页面标题
  await expect(page.locator('h1')).toContainText('私教预约详情')

  // 验证数据展示
  await expect(page.locator('.detail-section')).toBeVisible()

  // 测试返回功能
  await page.click('button:has-text("返回")')
  await expect(page).toHaveURL('/sijiaoyuyue')
})

test('handle invalid detail access', async ({ page }) => {
  // 访问没有参数的详情页面
  await page.goto('/sijiaoyuyue/detail')

  // 应该显示警告信息
  await expect(page.locator('.el-alert')).toContainText('未指定要查看的数据')
})
```

---

## 📚 相关文档

### 内部文档

- [ModuleDetailPage组件](../technical/frontend/components/MODULEDETAILPAGE.md)
- [ModuleDetail组件](../technical/frontend/components/MODULEDETAIL.md)
- [私教预约列表页面](../technical/frontend/components/LIST_PAGES_SIJIAOYUYUE.md)
- [私教预约添加页面](../technical/frontend/components/ADD_PAGES_SIJIAOYUYUE.md)

### 外部资源

- [Vue Router 编程式导航](https://router.vuejs.org/guide/essentials/navigation.html)
- [Element Plus Alert 组件](https://element-plus.org/zh-CN/component/alert.html)

---

## 🔄 更新记录

| 日期 | 版本 | 更新内容 | 更新人 |
|------|------|----------|--------|
| 2025-11-17 | v1.0.0 | 初始版本，记录私教预约详情页面技术文档 | 文档工程团队 |
