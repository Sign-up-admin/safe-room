# 贡献指南 (Contributing Guide)

> 项目：Admin 前端
> 适用范围：所有贡献者
> 更新日期：2025-11-16

感谢您对 Admin 前端项目的兴趣！我们欢迎各种形式的贡献，包括但不限于：

- 🐛 报告 bug
- ✨ 提出新功能建议
- 📝 改进文档
- 💻 提交代码
- 🎨 设计改进
- 🧪 添加测试

请在使用本项目前仔细阅读本指南。

---

## 📋 目录

- [快速开始](#快速开始)
- [开发环境](#开发环境)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [分支管理](#分支管理)
- [PR 流程](#pr-流程)
- [测试要求](#测试要求)
- [文档要求](#文档要求)
- [问题报告](#问题报告)
- [行为准则](#行为准则)

---

## 🚀 快速开始

### 1. Fork 项目

```bash
# Fork 本项目到你的 GitHub 账户
# 然后克隆到本地
git clone https://github.com/YOUR_USERNAME/admin-frontend.git
cd admin-frontend
```

### 2. 安装依赖

```bash
# 安装项目依赖
npm install

# 如果安装缓慢，使用国内镜像
npm config set registry https://registry.npmmirror.com
```

### 3. 启动开发服务器

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:8081 查看应用
```

### 4. 创建功能分支

```bash
# 创建功能分支
git checkout -b feature/your-feature-name

# 开始开发你的功能
```

---

## 🛠️ 开发环境

### 必需环境

- **Node.js**: >= 16.0.0 (推荐 18.x LTS)
- **npm**: >= 8.0.0
- **Git**: >= 2.0.0
- **VS Code**: 推荐使用 (已配置工作区设置)

### 推荐配置

```bash
# 配置 Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 配置 npm
npm config set init-author-name "Your Name"
npm config set init-author-email "your.email@example.com"
```

### 开发工具

- **代码编辑器**: VS Code (推荐)
- **浏览器**: Chrome/Firefox (开发调试)
- **终端**: Windows Terminal / iTerm2
- **API 工具**: Postman / Insomnia

---

## 📝 代码规范

### TypeScript 规范

```typescript
// ✅ 推荐写法
interface User {
  id: number
  name: string
  email: string
}

const getUser = (id: number): Promise<User> => {
  return http.get(`/users/${id}`)
}

// ❌ 避免写法
const getUser = (id) => {
  return http.get('/users/' + id)
}
```

### Vue 组件规范

```vue
<!-- ✅ 推荐写法 -->
<template>
  <div class="user-card">
    <h3>{{ user.name }}</h3>
    <p>{{ user.email }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  user: User
}

const props = defineProps<Props>()

const displayName = computed(() => {
  return props.user.name || 'Unknown'
})
</script>

<style scoped lang="scss">
.user-card {
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}
</style>
```

### 文件命名规范

```
components/
├── common/           # 通用组件
│   ├── FileUpload.vue       # PascalCase
│   └── BreadCrumbs.vue
├── business/         # 业务组件
│   └── UserManagement/
│       ├── UserList.vue     # PascalCase
│       ├── UserForm.vue
│       └── index.ts
utils/
├── http.ts           # camelCase
├── validate.ts
└── format.ts
```

### 导入顺序

```typescript
// 1. Vue 相关
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

// 2. 第三方库
import axios from 'axios'
import { ElMessage } from 'element-plus'

// 3. 项目内部模块
import { api } from '@/utils/api'
import UserCard from '@/components/common/UserCard.vue'

// 4. 类型定义
import type { User } from '@/types/user'
```

---

## 🎯 提交规范

### 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(auth): add login with phone number` |
| `fix` | 修复 bug | `fix(login): resolve password validation error` |
| `docs` | 文档更新 | `docs(api): update authentication guide` |
| `style` | 代码格式 | `style(components): format user card styles` |
| `refactor` | 重构代码 | `refactor(utils): simplify date formatting logic` |
| `test` | 测试相关 | `test(utils): add unit tests for date utils` |
| `chore` | 构建工具 | `chore(deps): update axios to v1.6.0` |
| `perf` | 性能优化 | `perf(images): optimize image loading` |
| `ci` | CI 配置 | `ci(github): add automated testing workflow` |
| `revert` | 回滚提交 | `revert: revert login form validation` |

### Scope 范围

- `auth` - 认证相关
- `user` - 用户管理
- `admin` - 管理员功能
- `api` - API 接口
- `ui` - 界面组件
- `utils` - 工具函数
- `config` - 配置相关
- `docs` - 文档
- `test` - 测试

### Subject 主题

- 使用祈使句语气：`add` 而不是 `added` 或 `adding`
- 首字母小写
- 不以句号结尾
- 长度不超过 50 个字符

### Body 正文 (可选)

- 详细说明变更内容
- 解释变更原因
- 提供相关链接

### Footer 页脚 (可选)

- 关联 Issue: `Closes #123`
- 破坏性变更: `BREAKING CHANGE: ...`

### 示例

```
feat(auth): add phone number login

- Add phone number input field to login form
- Implement SMS verification code sending
- Add phone number validation

Closes #123
```

---

## 🌿 分支管理

### 分支命名

```
main          # 主分支，生产环境代码
develop       # 开发分支，集成新功能
feature/xxx   # 功能分支
bugfix/xxx    # 修复分支
hotfix/xxx    # 紧急修复分支
release/xxx   # 发布分支
```

### 分支工作流

```bash
# 1. 从 develop 创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/new-login

# 2. 开发功能
# ... 编写代码

# 3. 提交代码
git add .
git commit -m "feat(auth): add phone login feature"

# 4. 推送分支
git push origin feature/new-login

# 5. 创建 Pull Request
# 在 GitHub 上创建 PR，目标分支为 develop
```

### 合并策略

- **Feature 分支**: 合并到 `develop`
- **Hotfix 分支**: 可以直接合并到 `main` 和 `develop`
- **Release 分支**: 从 `develop` 创建，合并到 `main`

---

## 🔄 PR 流程

### 创建 PR

1. **Fork 项目** 到你的 GitHub 账户
2. **创建功能分支** 并完成开发
3. **推送分支** 到你的 Fork
4. **创建 Pull Request**:
   - 目标分支: `develop`
   - 标题: 遵循提交规范
   - 描述: 详细说明变更内容

### PR 模板

```markdown
## 描述

简要描述这个 PR 的目的和内容。

## 变更类型

- [ ] 新功能 (feat)
- [ ] 修复 (fix)
- [ ] 文档更新 (docs)
- [ ] 代码格式 (style)
- [ ] 重构 (refactor)
- [ ] 测试 (test)
- [ ] 构建工具 (chore)

## 检查清单

- [ ] 代码遵循项目规范
- [ ] 添加了相应的测试
- [ ] 更新了相关文档
- [ ] 通过了所有测试
- [ ] 在多个浏览器中测试过

## 相关 Issue

Closes #123
```

### PR 审查

**审查者检查内容**:

1. **代码质量**
   - 遵循代码规范
   - 有意义的变量和函数名
   - 适当的错误处理

2. **测试覆盖**
   - 有相应的单元测试
   - 测试覆盖率不下降
   - 端到端测试通过

3. **文档更新**
   - API 文档已更新
   - 组件文档已更新
   - 变更日志已更新

4. **性能影响**
   - 不会显著影响性能
   - 合理的包大小增长

5. **安全考虑**
   - 没有安全漏洞
   - 适当的输入验证

---

## 🧪 测试要求

### 单元测试

```typescript
// 为新功能添加单元测试
describe('UserService', () => {
  it('should create user successfully', async () => {
    const userData = { name: 'John', email: 'john@example.com' }
    const result = await userService.create(userData)

    expect(result.success).toBe(true)
    expect(result.data.name).toBe('John')
  })
})
```

### 组件测试

```typescript
// 为 Vue 组件添加测试
import { mount } from '@vue/test-utils'
import UserCard from '@/components/UserCard.vue'

describe('UserCard', () => {
  it('renders user name correctly', () => {
    const user = { name: 'John Doe', email: 'john@example.com' }
    const wrapper = mount(UserCard, {
      props: { user }
    })

    expect(wrapper.text()).toContain('John Doe')
  })
})
```

### 测试覆盖率

- **目标覆盖率**: 单元测试 ≥ 80%
- **关键路径**: 所有用户交互流程
- **错误场景**: 边界条件和异常情况

### 运行测试

```bash
# 运行所有测试
npm run test:unit

# 运行覆盖率测试
npm run test:coverage

# 运行端到端测试
npm run test:e2e
```

---

## 📚 文档要求

### 何时更新文档

- **新增功能**: 添加相应的使用说明
- **修改 API**: 更新接口文档
- **组件变更**: 更新组件文档
- **配置变更**: 更新配置文档

### 文档规范

```markdown
# 功能名称

## 概述

简要描述功能目的。

## 功能特性

- 特性 1
- 特性 2
- 特性 3

## 使用方法

### 基本用法

```javascript
// 示例代码
```

### 高级用法

```javascript
// 高级示例
```

## API 参考

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `prop1` | `string` | `''` | 参数说明 |

### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `change` | `(value: string)` | 值变化时触发 |

### 方法

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| `method1` | `(param: string)` | `void` | 方法说明 |
```

---

## 🐛 问题报告

### Bug 报告

**标题格式**: `[Bug] 简要描述问题`

**内容模板**:

```markdown
## 环境信息

- OS: Windows 10 / macOS 12.0 / Ubuntu 20.04
- Browser: Chrome 91.0 / Firefox 89.0
- Node.js: 16.14.0
- npm: 8.3.0

## 问题描述

清晰简洁地描述问题。

## 重现步骤

1. 进入页面 '...'
2. 点击按钮 '...'
3. 滚动到 '...'
4. 看到错误

## 预期行为

描述应该发生什么。

## 实际行为

描述实际发生了什么。

## 截图

如果适用，添加截图帮助解释问题。

## 控制台错误

```
复制粘贴浏览器控制台的错误信息。
```

## 其他信息

任何其他相关信息。
```

### 功能请求

**标题格式**: `[Feature] 功能名称`

**内容模板**:

```markdown
## 功能描述

简要描述你想要的功能。

## 使用场景

描述这个功能将在什么情况下使用。

## 建议实现

如果你有具体的实现建议，请描述。

## 替代方案

描述你考虑过的替代方案。

## 其他信息

任何其他相关信息。
```

---

## 🤝 行为准则

### 我们的承诺

我们致力于为所有人提供一个无骚扰的贡献环境，无论年龄、体型、身体状况、民族、性别认同、经验水平、教育背景、社会经济地位、民族、国籍、个人外貌、种族、宗教或性取向如何。

### 我们的标准

**鼓励的行为**:
- 使用友好和包容性的语言
- 尊重不同的观点和经验
- 优雅地接受建设性的批评
- 关注对社区最有利的事情
- 对其他社区成员表示同情

**不鼓励的行为**:
- 使用性暗示、侮辱性或贬低性语言
-  trolling、侮辱性/贬低性评论
- 公开或私下骚扰
- 未经明确许可发布他人私人信息
- 其他在专业环境中不适当的行为

### 责任和后果

社区维护者有责任解释和执行我们的行为准则标准，并对任何他们认为不适当、威胁、冒犯或有害的行为采取适当的纠正措施。

### 适用范围

此行为准则适用于所有社区空间，以及当个人代表项目或其社区在公共空间中时。

---

## 📞 获取帮助

### 联系方式

- **Issues**: [GitHub Issues](https://github.com/your-org/admin-frontend/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/admin-frontend/discussions)
- **Email**: dev-team@yourcompany.com

### 响应时间

- **Bug 修复**: 24-48 小时内响应
- **功能请求**: 1 周内响应
- **一般问题**: 48 小时内响应

### 优先级定义

- **🔴 P0 (紧急)**: 生产环境宕机、安全漏洞
- **🟠 P1 (高)**: 主要功能无法使用、数据错误
- **🟡 P2 (中)**: 次要功能问题、体验优化
- **🟢 P3 (低)**: 建议、文档完善

---

## 🙏 致谢

感谢所有为这个项目做出贡献的人！

**Contributors**: [查看贡献者列表](../../CONTRIBUTORS.md)

---

**最后更新**: 2025-11-16
**维护者**: 开发团队
