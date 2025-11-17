# ModuleCrudPage 组件文档

## 概述

`ModuleCrudPage` 是一个通用的CRUD页面组件，基于配置驱动的方式提供完整的增删改查功能。通过简单的配置即可实现复杂的管理页面，大大减少代码重复。

## 功能特性

- ✅ **配置化驱动**: 通过配置对象控制所有功能
- ✅ **权限控制**: 自动集成权限检查
- ✅ **响应式设计**: 支持移动端适配
- ✅ **国际化支持**: 支持多语言
- ✅ **主题适配**: 支持明暗主题切换
- ✅ **类型安全**: 完整的TypeScript类型定义
- ✅ **插槽系统**: 灵活的自定义能力
- ✅ **错误处理**: 统一的错误提示和重试机制

## 快速开始

### 基础用法

```vue
<template>
  <ModuleCrudPage :config="crudConfig" />
</template>

<script setup lang="ts">
import ModuleCrudPage from '@/components/common/ModuleCrudPage.vue'
import type { CrudPageConfig } from '@/types/crud'

const crudConfig: CrudPageConfig = {
  moduleKey: 'user',
  title: '用户管理',
  apiEndpoints: {
    page: 'user/page',
    save: 'user/save',
    update: 'user/update',
    delete: 'user/delete',
  },
  columns: [
    { prop: 'username', label: '用户名', width: 120 },
    { prop: 'email', label: '邮箱', minWidth: 200 },
    { prop: 'status', label: '状态', width: 80 },
  ],
  searchFields: [
    { key: 'username', label: '用户名', type: 'text' },
    { key: 'email', label: '邮箱', type: 'text' },
  ],
  formFields: [
    { key: 'username', label: '用户名', type: 'text', required: true },
    { key: 'email', label: '邮箱', type: 'text', required: true },
    { key: 'status', label: '状态', type: 'boolean' },
  ],
}
</script>
```

## 配置选项

### CrudPageConfig

完整的配置接口定义：

```typescript
interface CrudPageConfig {
  // 基础配置
  moduleKey: string                    // 模块标识
  title: string                       // 页面标题
  apiEndpoints: ApiEndpoints         // API端点配置

  // 数据配置
  columns: TableColumnConfig[]        // 表格列配置
  searchFields?: SearchFieldConfig[]  // 搜索字段配置
  formFields?: FormFieldConfig[]      // 表单字段配置

  // 功能开关
  defaultSort?: { prop: string; order: 'asc' | 'desc' }
  defaultPageSize?: number
  enableSelection?: boolean
  enablePagination?: boolean
  enableSearch?: boolean
  enableCreate?: boolean
  enableUpdate?: boolean
  enableDelete?: boolean
  enableBatchDelete?: boolean
  enableExport?: boolean
  enableImport?: boolean
  enableDetail?: boolean

  // 界面配置
  formDialogWidth?: string | number
  detailDialogWidth?: string | number
  tableHeight?: number | string

  // 自定义操作
  customActions?: Array<{
    key: string
    label: string
    type?: 'primary' | 'success' | 'info' | 'warning' | 'danger'
    icon?: string
    handler?: (row?: any, selectedRows?: any[]) => void
  }>
}
```

### TableColumnConfig

表格列配置：

```typescript
interface TableColumnConfig {
  prop: string
  label: string
  width?: number | string
  minWidth?: number | string
  sortable?: boolean | string
  fixed?: boolean | 'left' | 'right'
  align?: 'left' | 'center' | 'right'
  showOverflowTooltip?: boolean
  formatter?: (row: any, column: any, cellValue: any, index: number) => string
  slot?: string    // 自定义插槽名称
  hidden?: boolean
}
```

### SearchFieldConfig

搜索字段配置：

```typescript
interface SearchFieldConfig {
  key: string
  label: string
  type: FieldType
  placeholder?: string
  width?: number | string
  options?: Array<{ label: string; value: unknown }>
  clearable?: boolean
  filterable?: boolean
  multiple?: boolean
  dateType?: 'date' | 'datetime' | 'daterange' | 'datetimerange'
}
```

### FormFieldConfig

表单字段配置：

```typescript
interface FormFieldConfig extends FieldConfig {
  rules?: Array<{
    required?: boolean
    message?: string
    trigger?: string | string[]
    min?: number
    max?: number
    pattern?: RegExp
    validator?: (rule: any, value: any, callback: Function) => void
  }>
  component?: string
  componentProps?: Record<string, any>
  span?: number
  offset?: number
}
```

## 插槽系统

### 命名插槽

#### 头部操作插槽

```vue
<template #header-actions>
  <el-button type="primary" @click="customAction">自定义操作</el-button>
</template>
```

#### 过滤区域插槽

```vue
<template #filter-extra>
  <div class="custom-filters">
    <!-- 自定义过滤条件 -->
  </div>
</template>
```

#### 表格工具栏插槽

```vue
<template #table-toolbar="{ selectedRows }">
  <el-button
    v-if="selectedRows.length > 0"
    type="danger"
    @click="batchCustomAction(selectedRows)"
  >
    批量自定义操作
  </el-button>
</template>
```

#### 表格列插槽

```vue
<template #table-column-{prop}="{ row, $index }">
  <!-- 自定义列渲染逻辑 -->
  <span>{{ customFormat(row[prop]) }}</span>
</template>
```

#### 操作列插槽

```vue
<template #table-actions="{ row }">
  <el-button text @click="customAction(row)">自定义操作</el-button>
  <el-button text type="primary" @click="crud.viewDetail(row)">查看</el-button>
  <el-button text @click="crud.openForm(row)">编辑</el-button>
  <el-button text type="danger" @click="crud.removeRow(row)">删除</el-button>
</template>
```

#### 表单插槽

```vue
<template #form-field-{key}="{ formModel, isEditing }">
  <!-- 自定义表单字段 -->
  <el-select v-model="formModel[key]" placeholder="请选择">
    <el-option
      v-for="option in customOptions"
      :key="option.value"
      :label="option.label"
      :value="option.value"
    />
  </el-select>
</template>

<template #form-footer>
  <el-button @click="crud.closeForm">取消</el-button>
  <el-button type="primary" :loading="crud.submitting" @click="customSubmit">
    自定义保存
  </el-button>
</template>
```

#### 详情插槽

```vue
<template #detail-content="{ record }">
  <!-- 自定义详情内容 -->
  <CustomDetailComponent :record="record" />
</template>

<template #detail-field-{key}="{ value }">
  <!-- 自定义详情字段渲染 -->
  <span>{{ customFormat(value) }}</span>
</template>
```

## 事件系统

组件通过`emit`暴露以下事件：

```vue
<ModuleCrudPage
  :config="crudConfig"
  @create="handleCreate"
  @update="handleUpdate"
  @delete="handleDelete"
  @view="handleView"
  @export="handleExport"
  @import="handleImport"
/>
```

```typescript
const handleCreate = () => {
  console.log('创建操作')
}

const handleUpdate = (record: any) => {
  console.log('更新操作', record)
}

const handleDelete = (record: any) => {
  console.log('删除操作', record)
}

const handleView = (record: any) => {
  console.log('查看操作', record)
}

const handleExport = () => {
  console.log('导出操作')
}

const handleImport = (file: File) => {
  console.log('导入操作', file)
}
```

## 高级用法

### 自定义组件集成

```vue
<template>
  <ModuleCrudPage :config="crudConfig">
    <template #form-field-image="{ formModel }">
      <ImageUpload
        v-model="formModel.image"
        :limit="1"
        :multiple="false"
        list-type="picture-card"
        tip="支持jpg/png格式，大小不超过2MB"
      />
    </template>

    <template #form-field-content="{ formModel }">
      <RichTextEditor
        v-model="formModel.content"
        placeholder="请输入内容..."
        min-height="300px"
      />
    </template>
  </ModuleCrudPage>
</template>
```

### 复杂业务逻辑

```vue
<template>
  <ModuleCrudPage ref="crudRef" :config="crudConfig">
    <template #table-column-status="{ row }">
      <el-tag :type="getStatusType(row.status)">
        {{ getStatusText(row.status) }}
      </el-tag>
    </template>

    <template #table-actions="{ row }">
      <el-button
        v-if="row.status === 'pending'"
        text
        type="success"
        @click="approveItem(row)"
      >
        审核通过
      </el-button>
      <el-button text @click="crud.viewDetail(row)">查看</el-button>
    </template>
  </ModuleCrudPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const crudRef = ref()

const approveItem = async (row: any) => {
  // 自定义审核逻辑
  await api.approve(row.id)
  crudRef.value?.refresh()
}

const getStatusType = (status: string) => {
  const types = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝',
  }
  return texts[status] || status
}
</script>
```

### 权限控制

组件自动根据配置的`moduleKey`进行权限检查：

```typescript
const crudConfig: CrudPageConfig = {
  moduleKey: 'news',  // 用于权限检查: news:Add, news:Edit, news:Delete, news:View
  // ... 其他配置
}
```

### 自定义API端点

```typescript
const crudConfig: CrudPageConfig = {
  apiEndpoints: {
    page: 'news/customPage',           // 自定义分页接口
    save: 'news/customSave',           // 自定义保存接口
    update: (id) => `news/customUpdate/${id}`, // 动态端点
    delete: 'news/customDelete',
    info: (id) => `news/customInfo/${id}`,
  },
  // ... 其他配置
}
```

## 样式定制

组件支持通过CSS变量进行样式定制：

```css
.module-crud-page {
  --crud-primary-color: #409eff;
  --crud-border-radius: 6px;
  --crud-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

## 最佳实践

### 1. 配置组织

将配置提取到单独的文件中：

```typescript
// configs/news.ts
export const newsConfig: CrudPageConfig = {
  // 配置内容
}

// views/news/list.vue
import { newsConfig } from '@/configs/news'
```

### 2. 插槽命名规范

使用统一的插槽命名：

```vue
<!-- 推荐 -->
<template #table-column-status="{ row }">
<template #form-field-category="{ formModel }">

<!-- 避免 -->
<template #status-column="{ row }">
<template #category-form="{ formModel }">
```

### 3. 错误处理

利用组件的事件系统进行错误处理：

```vue
<ModuleCrudPage
  :config="crudConfig"
  @update="handleUpdateResult"
/>
```

### 4. 性能优化

- 大数据量时使用虚拟滚动
- 复杂计算使用计算属性缓存
- 避免在模板中进行复杂逻辑

## 常见问题

### Q: 如何实现级联选择？

A: 使用插槽自定义表单字段：

```vue
<template #form-field-city="{ formModel }">
  <el-select v-model="formModel.city" @change="handleCityChange">
    <el-option
      v-for="city in cities"
      :key="city.value"
      :label="city.label"
      :value="city.value"
    />
  </el-select>
</template>
```

### Q: 如何自定义表格排序？

A: 配置`defaultSort`和`sortable`属性：

```typescript
const crudConfig: CrudPageConfig = {
  defaultSort: { prop: 'createTime', order: 'desc' },
  columns: [
    { prop: 'createTime', label: '创建时间', sortable: true },
  ],
}
```

### Q: 如何实现批量操作？

A: 使用`table-toolbar`插槽：

```vue
<template #table-toolbar="{ selectedRows }">
  <el-button
    v-if="selectedRows.length > 0"
    type="danger"
    @click="batchDelete(selectedRows)"
  >
    批量删除
  </el-button>
</template>
```

## 更新日志

### v1.0.0

- 初始版本发布
- 支持基础CRUD操作
- 配置化驱动
- 插槽系统
- 权限控制
- 响应式设计

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证。
