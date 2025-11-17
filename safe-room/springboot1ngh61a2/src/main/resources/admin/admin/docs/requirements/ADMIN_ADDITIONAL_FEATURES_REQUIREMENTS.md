# 附加功能需求文档（Admin Additional Features v1.0）

> 版本：v1.0
> 更新日期：2025-11-16（基于现有代码实现补充）
> 适用项目：`springboot1ngh61a2/src/main/resources/admin/admin`
> 说明：补充现有需求文档中未涵盖的已实现功能

---

## 目录

- [1. 富文本编辑器组件](#1-富文本编辑器组件)
- [2. 文件上传组件](#2-文件上传组件)
- [3. 数据导出功能](#3-数据导出功能)
- [4. 批量操作扩展](#4-批量操作扩展)
- [5. 高级筛选功能](#5-高级筛选功能)
- [6. 实时通知系统](#6-实时通知系统)
- [7. 响应式图片组件](#7-响应式图片组件)
- [8. 安全审计日志](#8-安全审计日志)

---

## 1. 富文本编辑器组件

### 1.1 功能概述

**组件位置**：`src/components/common/RichTextEditor.vue`

富文本编辑器提供所见即所得的文本编辑功能，支持格式化文本、插入图片、链接等。

### 1.2 技术实现

**依赖库**：`@vueup/vue-quill` (Quill.js)

**核心功能**：
- 文本格式化（粗体、斜体、下划线）
- 字体大小和颜色设置
- 列表和引用块
- 链接和图片插入
- 撤销/重做操作

### 1.3 配置选项

```typescript
interface RichTextEditorProps {
  modelValue: string          // v-model绑定值
  placeholder?: string        // 占位符文本
  readonly?: boolean          // 只读模式
  height?: string            // 编辑器高度，默认300px
  toolbar?: string[]         // 自定义工具栏
}
```

### 1.4 使用示例

```vue
<template>
  <RichTextEditor
    v-model="content"
    placeholder="请输入公告内容"
    height="400px"
  />
</template>

<script setup lang="ts">
import RichTextEditor from '@/components/common/RichTextEditor.vue'

const content = ref('')
</script>
```

### 1.5 安全考虑

- HTML内容通过DOMPurify进行清理
- 移除潜在的XSS攻击向量
- 支持的标签：`p`, `br`, `strong`, `em`, `u`

---

## 2. 文件上传组件

### 2.1 功能概述

**组件位置**：`src/components/common/FileUpload.vue`

统一的文件上传组件，支持图片和普通文件上传。

### 2.2 支持的文件类型

| 文件类型 | 格式限制 | 大小限制 | 用途 |
| --- | --- | --- | --- |
| **图片** | `jpg`, `png`, `webp` | ≤5MB | 头像、轮播图、内容图片 |
| **文档** | `pdf`, `doc`, `docx`, `xls`, `xlsx` | ≤10MB | 附件上传 |

### 2.3 组件接口

```typescript
interface FileUploadProps {
  modelValue: string         // v-model绑定值（文件URL）
  type: 1 | 2               // 1=图片，2=文件
  limit?: number            // 文件数量限制，默认1
  tip?: string             // 提示文本
  fileUrls?: string        // 初始文件URL（逗号分隔）
}
```

### 2.4 上传流程

1. **文件选择**：支持点击选择和拖拽上传
2. **格式验证**：前端文件类型和大小检查
3. **上传请求**：`POST /upload/file` 接口
4. **进度显示**：上传进度条和状态提示
5. **结果处理**：成功返回文件URL，失败显示错误信息

### 2.5 安全特性

- 文件类型严格验证
- 文件大小限制
- 服务端二次验证
- 文件存储路径保护

---

## 3. 数据导出功能

### 3.1 功能概述

支持各业务模块数据的Excel导出功能。

### 3.2 已实现模块

| 模块 | 导出字段 | 权限控制 | 备注 |
| --- | --- | --- | --- |
| 用户管理 | ID、用户名、手机号、注册时间等 | `yonghu/Export` | 包含会员状态 |
| 健身课程 | 课程名称、教练、价格、预约人数等 | `jianshenkecheng/Export` | 包含课程状态 |
| 预约记录 | 预约人、课程、时间、状态等 | `kechengyuyue/Export` | 包含支付信息 |

### 3.3 导出流程

1. **权限检查**：验证用户是否有导出权限
2. **数据获取**：调用后端导出接口
3. **文件生成**：后端生成Excel文件
4. **文件下载**：自动触发浏览器下载

### 3.4 待扩展功能

- [ ] **自定义字段选择**：允许用户选择要导出的字段
- [ ] **数据筛选导出**：支持按条件筛选后导出
- [ ] **多种格式支持**：支持CSV、PDF等格式
- [ ] **定时导出任务**：后台定时生成导出文件

---

## 4. 批量操作扩展

### 4.1 已实现功能

**批量删除**：支持多选记录后批量删除

**实现细节**：
- UI：表头选择列 + 顶部批量操作按钮
- 权限：基于 `isAuth(moduleKey, 'Delete')` 控制显示
- 确认：二次确认对话框显示选中数量
- 接口：`POST /{module}/delete` 参数 `{ids: number[]}`

### 4.2 待扩展功能

#### 4.2.1 批量状态变更

```typescript
// 需求：批量启用/禁用用户
interface BatchStatusUpdate {
  ids: number[]
  status: 0 | 1  // 0=禁用，1=启用
}
```

#### 4.2.2 批量审核操作

```typescript
// 需求：批量审核预约申请
interface BatchReview {
  ids: number[]
  action: 'approve' | 'reject'
  remark?: string
}
```

#### 4.2.3 批量数据导入

- Excel模板下载
- 数据验证和预览
- 批量插入/更新
- 错误报告生成

---

## 5. 高级筛选功能

### 5.1 当前实现

**基础搜索**：
- 关键词搜索：支持模糊匹配多个字段
- 重置功能：清除所有筛选条件

### 5.2 扩展需求

#### 5.2.1 多字段组合筛选

```typescript
interface AdvancedFilter {
  keyword?: string              // 关键词
  dateRange?: [string, string]  // 日期范围
  status?: number[]             // 状态多选
  category?: string[]           // 分类多选
  priceRange?: [number, number] // 价格区间
}
```

#### 5.2.2 动态筛选器

**支持的筛选类型**：
- 文本输入：模糊/精确匹配
- 数字区间：最小值-最大值
- 日期范围：开始日期-结束日期
- 下拉选择：单选/多选
- 状态开关：启用/禁用

#### 5.2.3 筛选条件持久化

- 路由参数保存筛选状态
- 页面刷新后恢复筛选条件
- 筛选模板保存和加载

---

## 6. 实时通知系统

### 6.1 功能概述

提供系统通知和消息提醒功能。

### 6.2 通知类型

| 类型 | 触发条件 | 显示方式 | 持久化 |
| --- | --- | --- | --- |
| **系统公告** | 管理员发布 | 顶部横幅 | 数据库存储 |
| **到期提醒** | 会员卡即将到期 | 弹窗提醒 | 会话存储 |
| **操作结果** | CRUD操作完成 | 消息提示 | 不持久化 |
| **错误警告** | 操作失败/异常 | 错误提示 | 日志记录 |

### 6.3 实现组件

#### 6.3.1 Element Plus Message

```typescript
import { ElMessage } from 'element-plus'

// 成功提示
ElMessage.success('操作成功')

// 错误提示
ElMessage.error('操作失败')

// 警告提示
ElMessage.warning('请检查输入')
```

#### 6.3.2 自定义通知组件

```vue
<template>
  <div class="notification-center">
    <div
      v-for="notification in notifications"
      :key="notification.id"
      class="notification-item"
    >
      <component :is="notification.icon" />
      <span>{{ notification.message }}</span>
      <el-button @click="dismiss(notification.id)">关闭</el-button>
    </div>
  </div>
</template>
```

---

## 7. 响应式图片组件

### 7.1 功能概述

**位置**：`src/components/common/ResponsiveImage.vue`

提供自适应图片显示，支持懒加载和错误处理。

### 7.2 核心特性

- **响应式显示**：根据容器大小自动调整
- **懒加载**：Intersection Observer实现懒加载
- **错误处理**：图片加载失败时显示默认图片
- **性能优化**：图片压缩和WebP格式支持

### 7.3 组件接口

```typescript
interface ResponsiveImageProps {
  src: string                // 图片URL
  alt?: string              // 替代文本
  width?: string | number   // 宽度
  height?: string | number  // 高度
  lazy?: boolean           // 是否懒加载，默认true
  placeholder?: string     // 加载中占位图
  errorImage?: string      // 错误时显示图片
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
}
```

### 7.4 图片处理流程

1. **URL处理**：支持相对路径和绝对路径
2. **懒加载判断**：元素进入视口才开始加载
3. **加载状态**：显示加载动画或占位图
4. **错误处理**：加载失败时显示错误图片
5. **性能监控**：记录加载时间和失败率

---

## 8. 安全审计日志

### 8.1 功能概述

记录所有敏感操作，支持安全审计和追溯。

### 8.2 审计范围

#### 8.2.1 用户认证操作

- 登录成功/失败
- 密码修改
- 账号锁定/解锁

#### 8.2.2 数据操作

- 记录新增/编辑/删除
- 敏感数据查看
- 批量操作执行

#### 8.2.3 权限操作

- 角色权限变更
- 菜单权限调整
- 用户角色分配

#### 8.2.4 系统操作

- 配置参数修改
- 文件上传记录
- 导出操作记录

### 8.3 日志数据结构

```typescript
interface AuditLog {
  id: number
  timestamp: string
  userId: number
  username: string
  operation: string          // 操作类型
  module: string            // 操作模块
  action: string            // 具体动作
  resourceId?: number       // 资源ID
  oldValue?: string         // 修改前的值
  newValue?: string         // 修改后的值
  ipAddress: string         // IP地址
  userAgent: string         // 用户代理
  status: 'success' | 'failure'
  errorMessage?: string     // 失败时的错误信息
}
```

### 8.4 日志管理

#### 8.4.1 日志存储

- 数据库表：`operation_log`
- 索引优化：按时间、用户、模块建立索引
- 数据保留：默认保留1年，可配置

#### 8.4.2 日志查询

- 时间范围筛选
- 用户筛选
- 操作类型筛选
- 模块筛选
- 关键词搜索

#### 8.4.3 日志导出

- Excel格式导出
- 支持筛选条件导出
- 压缩打包大文件

### 8.5 安全监控

#### 8.5.1 异常检测

- 频繁登录失败
- 异常操作模式
- 大量数据导出

#### 8.5.2 告警机制

- 邮件通知管理员
- 系统内消息提醒
- 日志级别升级

---

## 9. 总结与规划

### 9.1 已实现功能

- ✅ 富文本编辑器组件
- ✅ 文件上传组件
- ✅ 批量删除操作
- ✅ 基础筛选功能
- ✅ 实时通知系统
- ✅ 响应式图片组件
- ✅ 安全审计日志

### 9.2 待实现功能

- 🔄 数据导出功能扩展
- 🔄 高级筛选功能
- 🔄 批量审核操作
- 🔄 批量数据导入
- 🔄 实时WebSocket通知
- 🔄 图表交互增强

### 9.3 技术债务

- 完善TypeScript类型定义
- 提升测试覆盖率
- 优化大数据量场景性能
- 加强安全防护措施

---
