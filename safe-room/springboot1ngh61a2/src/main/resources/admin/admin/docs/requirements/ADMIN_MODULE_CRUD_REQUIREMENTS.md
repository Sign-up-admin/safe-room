# 通用模块 CRUD 页面需求文档（Module CRUD v1.0）

> 版本：v1.0
> 更新日期：2025-11-16
> 适用组件：`src/views/modules/components/ModuleCrudPage.vue`
> 覆盖路由：`/jianshenkecheng`, `/jianshenjiaolian`, `/yonghu` 等后台业务模块

---

## 0. 设计关键词

统一规范 · 动态字段 · 批量高效 · 安全可控 · 可扩展 · 类型智能

---

## 1. 页面逻辑结构

| 顺序 | 区块 | 目的 |
| --- | --- | --- |
| ① | 页头（模块标识 + 操作按钮） | 显示模块Key与中文标题，提供新增/刷新/批量删除功能 |
| ② | 搜索栏 | 关键词搜索功能，支持快速定位数据 |
| ③ | 数据表格 | 展示列表数据，支持排序/分页/批量选择/字段格式化 |
| ④ | 分页组件 | 控制页码、每页条数显示 |
| ⑤ | 详情弹窗 | 查看完整记录的JSON格式详情 |
| ⑥ | 表单弹窗 | 新增/编辑数据的动态表单，支持多种字段类型 |

---

## 2. 功能规范

### 2.1 表格

| 功能 | 说明 |
| --- | --- |
| 列渲染 | 动态展示前8个字段，自动排除`addtime`、`password`等敏感字段 |
| 字段格式化 | 日期时间自动格式化，布尔值显示"是/否"，状态字段显示"启用/禁用" |
| 操作列 | 查看、编辑、删除按钮；基于`isAuth`权限动态显示 |
| Loading状态 | 全局loading + 空数据状态展示 |
| Tooltip提示 | 长文本自动截断并显示完整内容 |
| 排序支持 | 默认按ID倒序，可扩展其他字段排序 |
| 批量选择 | 支持多选，用于批量删除等操作 |
| 图片预览 | 图片字段显示"[图片]"标识，点击可预览 |

### 2.2 分页

- 同步 `page`, `limit`, `total`，分页切换后刷新列表  
- `page-size` 选项：10 / 20 / 30 / 50  
- 新增/删除后若列表为空需自动翻页

### 2.3 查看详情

- 使用 `ElDialog` + `<pre>` JSON 格式化显示  
- 标题：`{title}详情`  
- 支持一键复制 JSON

### 2.4 新增/编辑

| 项 | 规范 |
| --- | --- |
| 触发 | `新增` 按钮或编辑按钮 |
| 表单字段 | 根据 `displayColumns` 动态生成，支持多种字段类型 |
| 字段类型 | text/textarea/number/date/datetime/boolean/image/file/richtext |
| 校验 | 字段默认必填（除时间戳字段），支持自定义校验规则 |
| 接口 | 新增：`POST /{moduleKey}/save`；编辑：`POST /{moduleKey}/update` |
| 文件上传 | 图片字段使用 `FileUpload` 组件，支持单/多文件上传 |
| 富文本 | `content` 字段使用 `RichTextEditor` 组件 |
| Loading | 提交时按钮 loading，防止重复提交 |
| 关闭逻辑 | 成功后关闭弹窗并刷新列表；失败保持表单并提示 |

### 2.5 删除

- `ElMessageBox.confirm` 二次确认，文案包含记录主键或关键字段
- 接口：`POST /{moduleKey}/delete`（参数：`ids` 数组）或 `DELETE /{moduleKey}/delete/{id}`
- 成功后刷新当前页，若当前页无数据自动回退一页

### 2.6 字段类型自动识别

**核心机制**：根据字段名和数据类型自动匹配最合适的表单组件

| 字段类型 | 识别规则 | 组件 | 配置 |
| --- | --- | --- | --- |
| **文本输入** | 默认类型 | `el-input` text | 单行/多行自动判断 |
| **数字输入** | 字段名包含 `price`, `sort`, `id` 或类型为number | `el-input-number` | 整数/小数自动识别 |
| **日期时间** | 字段名包含 `time`, `date` | `el-date-picker` | date/datetime 自动选择 |
| **开关状态** | 字段名 `status` 或值为 0/1 | `el-switch` | 1=启用，0=禁用 |
| **图片上传** | 字段名包含 `image`, `url`, `photo`, `zhaopian` | `FileUpload` | 单图模式，5MB限制 |
| **文件上传** | 字段名包含 `file`, `attachment` | `FileUpload` | 单文件模式，10MB限制 |
| **富文本** | 字段名 `content`, `description` | `RichTextEditor` | 完整富文本编辑器 |

**字段标签映射**：内置60+常用字段的中文标签映射

```typescript
const columnLabelMap: Record<string, string> = {
  id: 'ID', name: '名称', title: '标题', content: '内容',
  price: '价格', status: '状态', addtime: '添加时间',
  // ... 更多映射
}
```

### 2.7 批量操作

**已实现功能**：
- 批量删除：支持多选记录后批量删除
- UI设计：表头选择列 + 顶部操作按钮组
- 权限控制：基于 `isAuth(moduleKey, 'Delete')` 控制显示
- 确认机制：二次确认对话框显示选中数量

**实现代码**：
```vue
<el-button
  v-if="permissions.remove && selectedRows.length > 0"
  type="danger"
  @click="batchRemove"
>
  批量删除 ({{ selectedRows.length }})
</el-button>
```

**待扩展功能**：
- [ ] 批量审核/状态变更
- [ ] 批量导出Excel
- [ ] 批量导入数据  
- 接口需支持 ID 数组，前端使用 `ids.join(',')`

---

## 3. 配置化要求

### 3.1 模块配置

| 配置项 | 说明 | 示例 |
| --- | --- | --- |
| **module-key** | 模块标识，对应API路径和权限检查 | `jianshenkecheng` |
| **title** | 模块中文标题 | `健身课程` |
| **baseEndpoint** | 自定义API基础路径（可选） | `/api/custom` |

### 3.2 权限控制实现

**权限检查函数**：`isAuth(tableName: string, key: string): boolean`

- **位置**：`src/utils/utils.ts`
- **逻辑**：从 `menu.ts` 中查找当前角色对应的按钮权限
- **权限键映射**：
  - `Add` → 新增权限
  - `Edit` → 编辑权限
  - `Delete` → 删除权限
  - `View` → 查看权限

**权限状态计算**：
```typescript
const permissions = computed(() => ({
  create: isAuth(props.moduleKey, 'Add'),
  update: isAuth(props.moduleKey, 'Edit'),
  remove: isAuth(props.moduleKey, 'Delete'),
  view: isAuth(props.moduleKey, 'View'),
}))
```

### 3.3 API接口规范

| 操作 | HTTP方法 | 路径 | 请求体 | 响应格式 |
| --- | --- | --- | --- | --- |
| **列表查询** | GET | `/{moduleKey}/list` | Query参数（分页+筛选） | `{code:0, data:{list:[], total:0}}` |
| **新增** | POST | `/{moduleKey}/save` | JSON对象 | `{code:0, msg:'成功'}` |
| **编辑** | POST | `/{moduleKey}/update` | JSON对象（含id） | `{code:0, msg:'成功'}` |
| **删除** | POST | `/{moduleKey}/delete` | `{ids: number[]}` | `{code:0, msg:'成功'}` |

### 3.4 字段配置（预留扩展）

当前通过代码实现自动识别，后续可扩展为配置驱动：

```typescript
interface ColumnConfig {
  key: string
  label: string
  type: 'text' | 'number' | 'date' | 'image' | 'richtext'
  required?: boolean
  readonly?: boolean
  hidden?: boolean
}
```

---

## 4. 交互与用户体验

| 场景 | 行为 |
| --- | --- |
| 刷新按钮 | 重新调用列表接口，保留当前页码 |
| 新增成功 | `ElMessage.success('新增成功')`；可选择自动打开详情 |
| 编辑 | 打开弹窗时需深拷贝数据，防止联动影响 |
| 删除 | 提示“删除后不可恢复”，支持撤销提示（可选） |
| 键盘支持 | `Esc` 关闭弹窗，`Enter` 提交表单（非多行输入） |
| 空态 | 显示插画 + `去新增` 按钮 |

---

## 5. 数据与安全

### 5.1 认证与授权

- **Token认证**：所有API请求自动携带Token，401响应触发全局退出
- **权限双重验证**：
  - 前端：`isAuth()` 函数控制UI显示
  - 后端：接口层面权限验证
- **数据隔离**：教练角色仅能访问自己相关的课程和预约数据

### 5.2 数据安全

- **表单验证**：Element Plus + 自定义规则，防止恶意输入
- **数据脱敏**：敏感字段（如密码）在列表中隐藏
- **文件上传安全**：
  - 类型限制：图片(jpg/png/webp)、文件常见格式
  - 大小限制：图片≤5MB，文件≤10MB
  - 路径验证：统一走 `/upload/file` 接口

### 5.3 操作审计

**自动日志记录**：
- 新增/编辑/删除操作成功后自动写入操作日志
- 日志接口：`POST /operationLog/save`
- 日志内容：操作类型、模块、用户、时间戳、操作数据

**日志数据结构**：
```typescript
interface OperationLog {
  username: string
  operation: string  // ADD/UPDATE/DELETE
  tableName: string  // 模块名
  time: string
  params: string     // 操作参数JSON
}
```

---

## 6. 性能

- 列表加载使用分页 + 服务端排序；默认每页 10 条  
- 可加入查询条件缓存（切换路由返回时保留）  
- 大量字段时懒加载详情，避免一次渲染过多组件  
- 表单弹窗使用 `destroy-on-close`，防内存泄露

---

## 7. 响应式策略

| 终端 | 处理 |
| --- | --- |
| ≥1200px | 表格全宽，操作列固定右侧 |
| 992-1199px | 表格可水平滚动，操作列改为图标按钮 |
| <992px | 建议切换至移动专用页面；默认显示空态提示 |

---

## 8. 验收标准

| 维度 | 标准 |
| --- | --- |
| 一致性 | 所有业务模块使用同一组件，样式一致 |
| 完整性 | 新增/编辑/删除/查看/分页功能可用 |
| 权限 | 不同角色仅看到允许的操作 |
| 体验 | 无阻塞操作，错误提示可理解 |

---

## 9. 后续增强

- [ ] 高级筛选（多字段、区间、标签）  
- [ ] 字段类型驱动（日期选择器、富文本、上传）  
- [ ] 导出 Excel / 导入模板  
- [ ] 与 Workflow / 审批流打通

---***

