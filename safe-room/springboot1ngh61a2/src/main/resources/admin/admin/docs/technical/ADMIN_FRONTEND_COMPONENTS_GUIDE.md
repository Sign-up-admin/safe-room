# Admin 前端组件使用指南

> 版本：v1.0
> 更新日期：2025-11-16
> 适用项目：`springboot1ngh61a2/src/main/resources/admin/admin`

---

## 目录

- [1. 概述](#1-概述)
- [2. 通用组件](#2-通用组件)
  - [2.1 FileUpload - 文件上传组件](#21-fileupload---文件上传组件)
  - [2.2 ImageUpload - 图片上传组件](#22-imageupload---图片上传组件)
  - [2.3 Editor - 富文本编辑器](#23-editor---富文本编辑器)
  - [2.4 SafeHtml - 安全HTML渲染](#24-safehtml---安全html渲染)
  - [2.5 BreadCrumbs - 面包屑导航](#25-breadcrumbs---面包屑导航)
- [3. 布局组件](#3-布局组件)
  - [3.1 IndexHeader - 顶部导航栏](#31-indexheader---顶部导航栏)
  - [3.2 IndexAside - 侧边栏菜单](#32-indexaside---侧边栏菜单)
  - [3.3 IndexMain - 主内容区](#33-indexmain---主内容区)
  - [3.4 TagsView - 标签页视图](#34-tagsview---标签页视图)
- [4. 图表组件](#4-图表组件)
- [5. 图标组件](#5-图标组件)
- [6. 组件开发规范](#6-组件开发规范)
- [7. 附录](#7-附录)

---

## 1. 概述

本文档详细介绍了 Admin 前端项目中的所有可复用组件的使用方法、API 接口、示例代码等。

### 1.1 组件分类

- **通用组件**: 业务无关的基础组件，如文件上传、富文本编辑等
- **布局组件**: 页面布局相关的组件，如导航栏、侧边栏等
- **业务组件**: 特定业务场景的组件
- **图表组件**: 数据可视化组件
- **图标组件**: SVG 图标组件

### 1.2 组件命名规范

- 组件文件使用 PascalCase 命名，如 `FileUpload.vue`
- 组件内部使用 kebab-case 作为标签名，如 `<file-upload>`
- Props 和 Events 使用 camelCase

### 1.3 自动导入

项目配置了自动导入，所有组件都可以直接使用，无需手动导入：

```vue
<template>
  <!-- 无需 import，直接使用 -->
  <FileUpload v-model="files" />
  <Editor v-model="content" />
</template>
```

---

## 2. 通用组件

### 2.1 FileUpload - 文件上传组件

支持图片、视频等多种文件类型的上传，基于 Element Plus Upload 组件封装。

#### 基本用法

```vue
<template>
  <FileUpload
    v-model="fileUrls"
    :limit="5"
    :multiple="true"
    tip="支持上传图片、视频文件，大小不超过10MB"
    @change="handleFileChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const fileUrls = ref('')
const handleFileChange = (urls: string) => {
  console.log('文件URL:', urls)
}
</script>
```

#### Props API

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string` | `''` | 双向绑定值，文件URL字符串 |
| `tip` | `string` | `''` | 上传提示文字 |
| `action` | `string` | `'file/upload'` | 上传接口地址 |
| `limit` | `number` | `3` | 最大上传数量 |
| `multiple` | `boolean` | `false` | 是否支持多选 |
| `fileUrls` | `string` | `''` | 已上传文件的URL列表 |
| `type` | `number` | `1` | 显示类型：1-卡片模式，2-拖拽模式 |

#### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `change` | `(value: string)` | 文件URL变化时触发 |
| `update:modelValue` | `(value: string)` | v-model 更新事件 |

#### 文件格式支持

- **图片**: jpg, jpeg, png, gif, bmp, webp
- **视频**: mp4, avi, mov, wmv, flv
- **文档**: pdf, doc, docx, xls, xlsx, ppt, pptx
- **其他**: zip, rar, 7z, txt

#### 上传限制

- 单文件最大: 10MB
- 总文件数量: 由 `limit` 属性控制
- 文件名长度: 最大100字符

### 2.2 ImageUpload - 图片上传组件

专门用于图片上传的组件，基于 FileUpload 封装。

#### 基本用法

```vue
<template>
  <ImageUpload
    v-model="avatar"
    :width="120"
    :height="120"
    circle
    tip="请上传头像图片"
  />
</template>

<script setup lang="ts">
const avatar = ref('')
</script>
```

#### Props API

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string` | `''` | 双向绑定值，图片URL |
| `width` | `number` | `120` | 预览宽度(px) |
| `height` | `number` | `120` | 预览高度(px) |
| `circle` | `boolean` | `false` | 是否圆形显示 |
| `tip` | `string` | `''` | 上传提示文字 |

### 2.3 Editor - 富文本编辑器

基于 Quill 编辑器的富文本编辑组件，支持图片上传。

#### 基本用法

```vue
<template>
  <Editor
    v-model="content"
    :max-size="5000"
    placeholder="请输入内容..."
  />
</template>

<script setup lang="ts">
const content = ref('<p>初始内容</p>')
</script>
```

#### Props API

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string` | `''` | 双向绑定值，HTML内容 |
| `action` | `string` | `'file/upload'` | 图片上传接口 |
| `maxSize` | `number` | `4000` | 图片最大尺寸(KB) |
| `placeholder` | `string` | `''` | 占位符文本 |

#### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `update:modelValue` | `(value: string)` | 内容变化时触发 |

#### 工具栏功能

- **文本格式**: 加粗、斜体、下划线、删除线
- **标题**: 1-6级标题
- **列表**: 有序列表、无序列表
- **对齐**: 左对齐、居中、右对齐
- **颜色**: 文字颜色、背景色
- **媒体**: 链接、图片、视频上传
- **其他**: 引用、代码块、清除格式

### 2.4 SafeHtml - 安全HTML渲染

安全的HTML内容渲染组件，防止XSS攻击。

#### 基本用法

```vue
<template>
  <SafeHtml :html="articleContent" />
</template>

<script setup lang="ts">
const articleContent = ref('<p>安全的HTML内容</p><script>alert("XSS")</script>')
</script>
```

#### Props API

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `html` | `string \| null` | `null` | HTML内容 |
| `className` | `string` | `''` | 自定义CSS类名 |
| `allowTags` | `string[]` | `undefined` | 允许的HTML标签 |
| `allowAttrs` | `string[]` | `undefined` | 允许的HTML属性 |

#### 安全特性

- 使用 DOMPurify 清理HTML内容
- 默认只允许安全标签：`p`, `br`, `strong`, `em`, `u`, `h1-h6`, `ul`, `ol`, `li`, `blockquote`, `code`, `pre`, `a`, `img`
- 默认只允许安全属性：`href`, `src`, `alt`, `title`, `class`

#### 自定义配置

```vue
<SafeHtml
  :html="content"
  :allow-tags="['p', 'span', 'div']"
  :allow-attrs="['class', 'style', 'data-id']"
/>
```

### 2.5 BreadCrumbs - 面包屑导航

页面面包屑导航组件。

#### 基本用法

```vue
<template>
  <BreadCrumbs :items="breadcrumbItems" />
</template>

<script setup lang="ts">
const breadcrumbItems = [
  { title: '首页', path: '/' },
  { title: '用户管理', path: '/users' },
  { title: '用户详情', path: '' }
]
</script>
```

#### Props API

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `items` | `BreadcrumbItem[]` | `[]` | 面包屑项目数组 |

#### BreadcrumbItem 类型

```typescript
interface BreadcrumbItem {
  title: string    // 显示标题
  path?: string    // 路由路径，可选
}
```

---

## 3. 布局组件

### 3.1 IndexHeader - 顶部导航栏

Admin系统顶部导航栏组件。

#### 功能特性

- 用户信息显示
- 快捷操作按钮
- 消息通知
- 主题切换
- 全屏切换
- 退出登录

#### 使用方式

```vue
<template>
  <IndexHeader />
</template>
```

该组件通常在主布局中自动使用，无需单独配置。

### 3.2 IndexAside - 侧边栏菜单

Admin系统侧边栏菜单组件。

#### 功能特性

- 动态菜单生成
- 权限控制
- 菜单折叠/展开
- 菜单搜索
- 活跃状态高亮

#### 使用方式

```vue
<template>
  <IndexAside :collapsed="isCollapsed" />
</template>

<script setup lang="ts">
const isCollapsed = ref(false)
</script>
```

### 3.3 IndexMain - 主内容区

Admin系统主内容区域组件。

#### 功能特性

- 响应式布局
- 内容区域滚动
- 标签页集成

#### 使用方式

```vue
<template>
  <IndexMain>
    <!-- 页面内容 -->
    <router-view />
  </IndexMain>
</template>
```

### 3.4 TagsView - 标签页视图

页面标签页导航组件。

#### 功能特性

- 多标签页管理
- 标签页关闭
- 标签页刷新
- 快捷导航

#### Props API

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `showClose` | `boolean` | `true` | 是否显示关闭按钮 |
| `maxTags` | `number` | `10` | 最大标签页数量 |

---

## 4. 图表组件

### 4.1 ECharts 集成

项目集成了 ECharts 图表库，支持多种图表类型。

#### 基本用法

```vue
<template>
  <div ref="chartRef" :style="{width: '100%', height: '400px'}"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref<HTMLDivElement>()

onMounted(() => {
  const chart = echarts.init(chartRef.value!)
  const option = {
    title: { text: '示例图表' },
    xAxis: { type: 'category', data: ['A', 'B', 'C'] },
    yAxis: { type: 'value' },
    series: [{ data: [10, 20, 30], type: 'bar' }]
  }
  chart.setOption(option)
})
</script>
```

#### 支持的图表类型

- 柱状图 (bar)
- 折线图 (line)
- 饼图 (pie)
- 散点图 (scatter)
- 雷达图 (radar)
- 热力图 (heatmap)
- 树形图 (tree)
- 词云图 (wordcloud)

---

## 5. 图标组件

### 5.1 SvgIcon - SVG图标组件

统一的SVG图标组件，支持159个内置图标。

#### 基本用法

```vue
<template>
  <SvgIcon name="user" />
  <SvgIcon name="edit" :size="24" color="#409eff" />
</template>
```

#### Props API

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `name` | `string` | - | 图标名称 |
| `size` | `number` | `16` | 图标尺寸(px) |
| `color` | `string` | - | 图标颜色 |

#### 常用图标

- `user` - 用户
- `edit` - 编辑
- `delete` - 删除
- `add` - 添加
- `search` - 搜索
- `setting` - 设置
- `home` - 首页
- `menu` - 菜单

#### 自定义图标

将SVG文件放入 `src/icons/svg/` 目录，组件会自动识别。

---

## 6. 组件开发规范

### 6.1 文件结构

```
components/
├── common/           # 通用组件
│   ├── ComponentName.vue
│   └── index.ts      # 导出文件
├── business/         # 业务组件
│   └── ModuleName/
│       ├── ComponentName.vue
│       └── index.ts
└── index.ts         # 主导出文件
```

### 6.2 组件编写规范

#### Template 规范

```vue
<template>
  <div class="component-name">
    <!-- 组件内容 -->
  </div>
</template>
```

#### Script 规范

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

// 类型定义
interface Props {
  title: string
  count?: number
}

interface Emits {
  change: [value: string]
}

// Props 定义
const props = withDefaults(defineProps<Props>(), {
  count: 0
})

// Emits 定义
const emit = defineEmits<Emits>()

// 响应式数据
const count = ref(0)

// 计算属性
const doubleCount = computed(() => count.value * 2)

// 方法
const handleClick = () => {
  emit('change', 'new value')
}
</script>
```

#### Style 规范

```vue
<style scoped lang="scss">
.component-name {
  // 组件样式
  &__header {
    // BEM命名
  }

  &__body {
    // 组件主体
  }
}
</style>
```

### 6.3 Props 设计原则

- 使用具体类型，避免 `any`
- 为可选属性提供默认值
- 使用 `withDefaults` 定义默认值
- Props 命名使用 camelCase

### 6.4 Events 设计原则

- Events 命名使用 camelCase
- 使用 TypeScript 接口定义 Events 类型
- 事件参数要有明确的类型定义

### 6.5 组件测试

每个组件都应该有对应的单元测试：

```typescript
// tests/unit/components/ComponentName.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ComponentName from '@/components/common/ComponentName.vue'

describe('ComponentName', () => {
  it('should render correctly', () => {
    const wrapper = mount(ComponentName, {
      props: { /* props */ }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
```

---

## 7. 附录

### 7.1 组件依赖关系

```
FileUpload
├── Element Plus (Upload)
├── Axios (HTTP请求)
└── Storage (Token管理)

Editor
├── Quill Editor
├── Element Plus (Upload)
└── FileUpload (图片上传)

SafeHtml
├── DOMPurify (XSS防护)
└── Security Utils

IndexHeader
├── Element Plus (Dropdown, Avatar)
├── Router (导航)
└── Storage (用户信息)

IndexAside
├── Element Plus (Menu)
├── Router (路由状态)
└── Menu Utils (权限控制)
```

### 7.2 性能优化建议

1. **懒加载**: 大型组件使用动态导入
2. **缓存**: 图标和静态资源使用缓存
3. **虚拟滚动**: 长列表使用虚拟滚动
4. **防抖**: 搜索和输入使用防抖处理

### 7.3 常见问题

#### Q: 组件样式不生效？
A: 检查组件是否使用了 `scoped` 样式，确认类名正确。

#### Q: 文件上传失败？
A: 检查 Token 是否正确设置，确认后端接口是否正常。

#### Q: 富文本编辑器图片上传失败？
A: 检查图片大小是否超过限制，确认上传接口权限。

### 7.4 更新日志

- **v1.0** (2025-11-16): 初始版本，完成所有组件文档

---

**文档维护者**: 开发团队
**最后更新**: 2025-11-16
**版本**: v1.0
