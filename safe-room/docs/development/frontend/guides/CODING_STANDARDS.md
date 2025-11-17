---
title: CODING STANDARDS
version: v1.0.0
last_updated: 2025-11-16
status: active
category: development
tags: [frontend, coding, standards, guidelines]
---

# Front前端代码规范

> **版本**：v1.0.0
> **更新日期**：2025-11-16
> **适用范围**：Front前端项目代码编写规范
> **关键词**：代码规范, 前端, 编码标准, 最佳实践

---

## 📋 目录

- [概述](#概述)
- [命名规范](#命名规范)
- [文件组织](#文件组织)
- [Vue组件规范](#vue组件规范)
- [TypeScript规范](#typescript规范)
- [样式规范](#样式规范)
- [注释规范](#注释规范)
- [提交规范](#提交规范)

---

## 📖 概述

### 规范目的

建立统一的代码编写规范，提高代码质量、可维护性和团队协作效率。

### 适用范围

- 所有Vue组件文件（.vue）
- TypeScript文件（.ts）
- JavaScript文件（.js）
- 样式文件（.scss）
- 配置文件

### 工具支持

项目配置了以下工具自动检查代码规范：

- **ESLint**：代码质量检查
- **Prettier**：代码格式化
- **Stylelint**：样式检查
- **TypeScript**：类型检查

---

## 📝 命名规范

### 文件命名

#### Vue组件文件

```bash
# 正确示例
UserProfile.vue
CourseCard.vue
BookingForm.vue

# 错误示例
user-profile.vue    # 应使用PascalCase
userProfile.vue     # 文件名应使用PascalCase
```

#### 组合式函数文件

```bash
# 正确示例
useUserAuth.ts
useCourseBooking.ts
useNotification.ts

# 错误示例
UseUserAuth.ts     # 应使用camelCase
userAuth.ts        # 缺少use前缀
```

#### 类型定义文件

```bash
# 正确示例
user.ts
course.ts
api.ts

# 错误示例
UserTypes.ts       # 应使用小写
user-types.ts      # 应使用kebab-case
```

### 变量命名

#### camelCase（驼峰命名）

```typescript
// 正确
const userName = 'john'
const isLoading = false
const handleSubmit = () => {}

// 错误
const user_name = 'john'    // 下划线命名
const isloading = false     // 缺少驼峰
const handlesubmit = () => {} // 缺少驼峰
```

#### PascalCase（帕斯卡命名）

```typescript
// 组件名
const UserProfile = defineComponent({})
const CourseCard = () => {}

// 类型名
interface UserProfile {}
type CourseStatus = 'active' | 'inactive'

// 枚举
enum PaymentMethod {
  CreditCard = 'credit_card',
  BankTransfer = 'bank_transfer'
}
```

#### kebab-case（短横线命名）

```scss
// CSS类名
.user-profile {
  /* ... */
}

.course-card {
  /* ... */
}
```

### 常量命名

```typescript
// 正确
const MAX_RETRY_COUNT = 3
const API_BASE_URL = '/api/v1'
const DEFAULT_TIMEOUT = 5000

// 错误
const maxRetryCount = 3     // 应使用大写
const apiBaseUrl = '/api/v1' // 应使用大写
```

---

## 📁 文件组织

### Vue组件结构

```vue
<template>
  <!-- 模板内容 -->
</template>

<script setup lang="ts">
  // 组合式API
</script>

<style scoped lang="scss">
  // 样式定义
</style>
```

### 组合式函数结构

```typescript
// 导入语句
import { ref, computed } from 'vue'
import type { User } from '@/types/user'

// 类型定义
interface UseUserOptions {
  autoFetch?: boolean
}

// 主函数
export function useUser(options: UseUserOptions = {}) {
  // 响应式数据
  const user = ref<User | null>(null)
  const loading = ref(false)

  // 计算属性
  const isLoggedIn = computed(() => !!user.value)

  // 方法
  const fetchUser = async () => {
    // ...
  }

  // 返回值
  return {
    user,
    loading,
    isLoggedIn,
    fetchUser
  }
}
```

### 目录结构

```
src/
├── components/          # 通用组件
│   ├── common/         # 基础组件
│   ├── business/       # 业务组件
│   └── ui/             # UI组件
├── composables/        # 组合式函数
├── views/              # 页面组件
├── types/              # 类型定义
├── utils/              # 工具函数
├── styles/             # 样式文件
└── constants/          # 常量定义
```

---

## 🧩 Vue组件规范

### 组件定义

#### 组合式API（推荐）

```vue
<script setup lang="ts">
// 导入
import { ref, computed } from 'vue'

// Props定义
interface Props {
  title?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '默认标题',
  disabled: false
})

// Emits定义
const emit = defineEmits<{
  change: [value: string]
  submit: [data: object]
}>()

// 响应式数据
const count = ref(0)

// 计算属性
const doubleCount = computed(() => count.value * 2)

// 方法
const increment = () => {
  count.value++
  emit('change', count.value.toString())
}
</script>
```

#### 选项式API（不推荐）

```vue
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MyComponent',
  props: {
    title: {
      type: String,
      default: '默认标题'
    }
  },
  emits: ['change', 'submit'],
  data() {
    return {
      count: 0
    }
  },
  computed: {
    doubleCount() {
      return this.count * 2
    }
  },
  methods: {
    increment() {
      this.count++
      this.$emit('change', this.count.toString())
    }
  }
})
</script>
```

### Props规范

```typescript
// 推荐：使用接口定义
interface ButtonProps {
  type?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<ButtonProps>(), {
  type: 'primary',
  size: 'medium',
  disabled: false,
  loading: false
})
```

### 模板规范

```vue
<template>
  <!-- 1. 使用语义化的标签 -->
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <!-- 2. 条件渲染 -->
    <LoadingSpinner v-if="loading" />
    <span v-else>{{ label }}</span>
  </button>
</template>
```

### 样式规范

```vue
<style scoped lang="scss">
// 1. 使用BEM命名规范
.button {
  // 基础样式

  &--primary {
    // 主要按钮样式
  }

  &--disabled {
    // 禁用状态样式
  }

  &__icon {
    // 图标样式
  }
}

// 2. 使用CSS变量
.button {
  background-color: var(--color-primary);
  border-radius: var(--border-radius);
}

// 3. 响应式设计
@media (max-width: 768px) {
  .button {
    width: 100%;
  }
}
</style>
```

---

## 📘 TypeScript规范

### 类型定义

```typescript
// 1. 接口定义
interface User {
  readonly id: number        // 只读属性
  name: string
  email: string
  role: UserRole            // 使用枚举类型
  createdAt: Date
  updatedAt?: Date          // 可选属性
}

// 2. 类型别名
type UserRole = 'admin' | 'user' | 'coach'
type ApiResponse<T> = {
  code: number
  message: string
  data: T
}

// 3. 泛型
interface ListResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
}

// 4. 联合类型和交叉类型
type ComponentSize = 'small' | 'medium' | 'large'
type ButtonProps = BaseProps & {
  variant?: 'solid' | 'outline'
}
```

### 类型守卫

```typescript
// 类型谓词
function isUser(obj: any): obj is User {
  return obj && typeof obj.id === 'number' && typeof obj.name === 'string'
}

// 使用示例
function processUser(input: unknown) {
  if (isUser(input)) {
    console.log(input.name) // TypeScript知道这是User类型
  }
}
```

### 工具类型

```typescript
// 常用工具类型
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// 使用示例
type PartialUser = Partial<User>
type UserWithEmail = RequiredFields<User, 'email'>
```

---

## 🎨 样式规范

### CSS命名规范

使用BEM（Block Element Modifier）命名规范：

```scss
// Block
.button {
  // 基础样式
}

// Element
.button__icon {
  // 图标样式
}

// Modifier
.button--primary {
  // 主要按钮样式
}

.button--disabled {
  // 禁用状态样式
}

// 组合使用
.button.button--primary.button--disabled {
  // 组合样式
}
```

### CSS变量

```scss
// 变量定义
:root {
  --color-primary: #007bff;
  --color-secondary: #6c757d;
  --spacing-small: 0.5rem;
  --spacing-medium: 1rem;
  --border-radius: 0.25rem;
}

// 使用变量
.button {
  background-color: var(--color-primary);
  padding: var(--spacing-medium);
  border-radius: var(--border-radius);
}
```

### 响应式设计

```scss
// 移动优先
.button {
  width: 100%; // 移动端默认全宽
}

// 平板
@media (min-width: 768px) {
  .button {
    width: auto;
  }
}

// 桌面
@media (min-width: 1024px) {
  .button {
    min-width: 120px;
  }
}
```

---

## 💬 注释规范

### JSDoc注释

```typescript
/**
 * 用户数据获取函数
 * @param {string} userId - 用户唯一标识
 * @param {FetchOptions} options - 获取选项
 * @returns {Promise<User>} 用户信息
 * @throws {ApiError} 当API调用失败时
 * @example
 * ```typescript
 * const user = await getUser('123', { includeProfile: true })
 * ```
 */
export async function getUser(
  userId: string,
  options: FetchOptions = {}
): Promise<User> {
  // 实现代码
}
```

### 行内注释

```typescript
// 好的注释
const isValid = validateEmail(email) // 检查邮箱格式是否正确

// 不好的注释（显而易见）
// const isValid = validateEmail(email) // 验证邮箱

// 解释复杂的业务逻辑
if (user.role === 'admin' || user.permissions.includes('manage_users')) {
  // 管理员或具有用户管理权限的用户可以访问
  showAdminPanel()
}
```

### Vue组件注释

```vue
<template>
  <!-- 用户头像组件 -->
  <div class="user-avatar">
    <!-- 头像图片 -->
    <img :src="avatarUrl" :alt="userName" />

    <!-- 在线状态指示器，仅在在线时显示 -->
    <div v-if="isOnline" class="status-indicator" />
  </div>
</template>
```

---

## 📋 提交规范

### 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Type类型

| 类型 | 说明 | 示例 |
|------|------|------|
| feat | 新功能 | feat(user): add login functionality |
| fix | 修复bug | fix(auth): resolve login timeout issue |
| docs | 文档更新 | docs(readme): update installation guide |
| style | 代码样式 | style(button): format button component |
| refactor | 重构 | refactor(user): simplify user validation |
| test | 测试 | test(auth): add login unit tests |
| chore | 构建工具 | chore(deps): update dependencies |

#### Scope范围

- **component**：组件相关
- **composable**：组合式函数
- **api**：API相关
- **style**：样式相关
- **test**：测试相关
- **docs**：文档相关

#### Subject主题

- 使用祈使句、动词开头
- 不要超过50个字符
- 首字母小写、不以句号结尾

### 示例

```
feat(user): implement user profile page

- Add user avatar upload functionality
- Display user statistics and achievements
- Integrate with user preferences API

Closes #123
```

---

## 🔧 工具配置

### ESLint配置

项目已配置ESLint规则，位于`.eslintrc.js`：

```javascript
module.exports = {
  extends: [
    '@vue/typescript/recommended',
    'plugin:vue/vue3-essential',
    '@vue/eslint-config-prettier'
  ],
  rules: {
    // 自定义规则
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-unused-vars': 'error'
  }
}
```

### Prettier配置

项目已配置Prettier，位于`.prettierrc`：

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "none",
  "printWidth": 100
}
```

### VS Code配置

推荐的VS Code设置：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

---

## 📚 相关链接

- [开发环境搭建](DEVELOPMENT_SETUP.md)
- [文档编写规范](FRONTEND_DOCUMENTATION_STANDARDS.md)
- [测试策略](../testing/TESTING_STRATEGY.md)

---

**最后更新**：2025-11-16
**维护责任人**：前端开发团队
**联系方式**：dev-team@company.com

