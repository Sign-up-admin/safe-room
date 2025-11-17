# AI工具使用指南

## 概述

本文档详细介绍如何在文档工程中使用AI工具，包括Claude、ChatGPT和GitHub Copilot的使用方法、最佳实践和集成方案。

## 目录

1. [快速开始](#快速开始)
2. [Claude使用指南](#claude使用指南)
3. [ChatGPT使用指南](#chatgpt使用指南)
4. [GitHub Copilot使用指南](#github-copilot使用指南)
5. [自动化集成](#自动化集成)
6. [最佳实践](#最佳实践)
7. [故障排除](#故障排除)

## 快速开始

### 环境准备

1. **安装依赖**
```bash
npm install @anthropic-ai/sdk openai
```

2. **配置API密钥**
```bash
export CLAUDE_API_KEY="your-claude-api-key"
export OPENAI_API_KEY="your-openai-api-key"
```

3. **验证配置**
```bash
node docs/scripts/ai-doc-generator.js
```

### 基本使用

```bash
# 生成API文档
npm run docs:ai-api src/api/userService.js

# 生成组件文档
npm run docs:ai-component src/components/UserProfile.vue

# 优化现有文档
npm run docs:ai-enhance docs/api/user.md review

# 批量生成文档
npm run docs:ai-batch src/components
```

## Claude使用指南

### API文档生成

```bash
# 单个API文件
node docs/scripts/ai-doc-generator.js api-doc springboot1ngh61a2/src/main/java/com/example/controller/UserController.java

# 指定输出文件
node docs/scripts/ai-doc-generator.js api-doc src/api/auth.js docs/technical/api/auth-service.md
```

**生成的API文档示例：**

```javascript
/**
 * 用户认证服务
 * @param {Object} credentials 用户凭据
 * @param {string} credentials.username 用户名
 * @param {string} credentials.password 密码
 * @returns {Promise<Object>} 认证结果
 * @throws {AuthenticationError} 认证失败
 *
 * @example
 * const result = await authenticate({
 *   username: 'user@example.com',
 *   password: 'password123'
 * });
 */
```

### 组件文档生成

```bash
# Vue组件文档生成
node docs/scripts/ai-doc-generator.js component-doc src/components/LoginForm.vue

# 批量组件文档生成
node docs/scripts/ai-doc-generator.js batch src/components docs/technical/frontend/components
```

**生成的组件文档结构：**

```markdown
# LoginForm 组件

## 概述
用户登录表单组件，提供用户名密码登录功能。

## Props
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| username | string | '' | 用户名 |
| password | string | '' | 密码 |
| loading | boolean | false | 加载状态 |

## Events
| 事件名 | 参数 | 说明 |
|--------|------|------|
| submit | {username, password} | 表单提交 |
| cancel | - | 取消登录 |

## 使用示例
```vue
<LoginForm
  v-model:username="username"
  v-model:password="password"
  :loading="isLoading"
  @submit="handleLogin"
  @cancel="handleCancel"
/>
```
```

## ChatGPT使用指南

### 文档优化

```bash
# 简化文档
node docs/scripts/ai-doc-generator.js enhance docs/architecture.md simplify

# 扩展文档
node docs/scripts/ai-doc-generator.js enhance docs/api/overview.md expand

# 翻译文档
node docs/scripts/ai-doc-generator.js enhance docs/README.md translate
```

### 质量改进

```bash
# 文档审查
node docs/scripts/ai-doc-generator.js enhance docs/technical/database.md review

# 标准化格式
node docs/scripts/ai-doc-generator.js enhance docs/development/setup.md standardize
```

## GitHub Copilot使用指南

### IDE集成

1. **安装GitHub Copilot插件**
   - VS Code: 搜索"GitHub Copilot"
   - JetBrains: 搜索"GitHub Copilot"

2. **工作区配置**
   - Copilot会自动读取`.github/copilot-instructions.md`
   - 遵循项目特定的文档规范

### 代码注释生成

```javascript
// 在函数前输入 /** 然后回车
function authenticateUser(credentials) {
  // Copilot会自动生成完整的JSDoc注释
}
```

### 文档草稿生成

```markdown
<!-- 输入文档标题和基本结构 -->
# 用户管理模块

## 功能概述
<!-- Copilot会建议内容 -->

## API接口
<!-- Copilot会生成API文档结构 -->
```

## 自动化集成

### CI/CD集成

```yaml
# .github/workflows/ai-doc-generation.yml
name: AI Documentation Generation

on:
  push:
    branches: [ main, develop ]
  pull_request:
    types: [ opened, synchronize ]

jobs:
  generate-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Generate API docs with AI
        run: npm run docs:ai-generate batch springboot1ngh61a2/src/main/java docs/technical/api
        env:
          CLAUDE_API_KEY: ${{ secrets.CLAUDE_API_KEY }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}

      - name: Generate component docs
        run: npm run docs:ai-batch src/components docs/technical/frontend/components

      - name: Validate documentation
        run: npm run docs:check

      - name: Commit generated docs
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add docs/
          git commit -m "docs: AI generated documentation updates" || echo "No changes to commit"
```

### 预提交钩子

```bash
# .husky/pre-commit
#!/bin/sh

# 生成变更文件的文档
npm run docs:ai-generate batch --changed-only

# 质量检查
npm run docs:check
```

### 定时任务

```bash
# 每日文档更新
crontab -e
0 2 * * * cd /path/to/project && npm run docs:ai-batch src docs/generated && npm run docs:check
```

## 最佳实践

### 提示词优化

1. **明确指令**
```javascript
// ✅ 好的提示
"生成完整的API文档，包含参数说明、返回值、异常处理和使用示例"

// ❌ 模糊的提示
"写个文档"
```

2. **提供上下文**
```javascript
// ✅ 包含上下文
"这是用户认证服务的login方法，请生成详细的API文档"

// ❌ 缺少上下文
"生成API文档"
```

3. **指定格式**
```javascript
// ✅ 指定输出格式
"使用Markdown格式生成组件文档，包含Props、Events和使用示例"

// ❌ 格式不明确
"写组件文档"
```

### 质量控制

1. **人工审查**
   - AI生成的内容需要人工审核
   - 重点检查技术准确性和业务逻辑

2. **迭代优化**
   - 根据反馈改进提示词
   - 建立文档模板库

3. **版本控制**
   - AI生成的内容纳入版本控制
   - 保留生成记录和参数

### 成本管理

1. **选择合适的模型**
   - 简单任务使用GPT-3.5
   - 复杂任务使用Claude或GPT-4

2. **缓存机制**
   - 避免重复生成相同内容
   - 使用缓存减少API调用

3. **批量处理**
   - 合并小任务为批量处理
   - 优化API调用频率

## 故障排除

### 常见问题

1. **API密钥错误**
```bash
# 检查环境变量
echo $CLAUDE_API_KEY
echo $OPENAI_API_KEY

# 重新设置
export CLAUDE_API_KEY="your-key-here"
```

2. **网络超时**
```javascript
// 在配置文件中调整超时时间
module.exports = {
  claude: {
    timeout: 60000 // 增加到60秒
  }
};
```

3. **生成质量不佳**
```bash
# 使用更详细的提示词
node docs/scripts/ai-doc-generator.js enhance file.md review --detailed

# 提供更多上下文
node docs/scripts/ai-doc-generator.js api-doc file.js --context project-overview.md
```

4. **依赖安装失败**
```bash
# 清理缓存重新安装
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 日志分析

```bash
# 查看详细日志
DEBUG=ai:* npm run docs:ai-generate api-doc file.js

# 检查生成历史
cat docs/logs/ai-generation.log
```

### 性能优化

1. **并发控制**
```javascript
// 限制并发请求数量
const MAX_CONCURRENT = 3;
const semaphore = new Semaphore(MAX_CONCURRENT);
```

2. **智能重试**
```javascript
// 实现指数退避重试
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2 ** i * 1000));
    }
  }
}
```

## 集成案例

### 项目A：微服务API文档

```javascript
// 使用Claude生成微服务文档
const aiManager = new AIToolManager();

const doc = await aiManager.generateApiDoc(feignClientCode, {
  serviceName: 'user-service',
  framework: 'spring-cloud',
  patterns: ['circuit-breaker', 'service-discovery']
});

fs.writeFileSync('docs/api/user-service.md', doc);
```

### 项目B：前端组件库

```javascript
// 批量生成组件文档
const components = glob.sync('src/components/**/*.vue');

for (const component of components) {
  const doc = await aiManager.generateComponentDoc(
    fs.readFileSync(component, 'utf-8'),
    {
      framework: 'vue3',
      typescript: true,
      testing: 'vitest'
    }
  );

  const outputPath = component.replace('.vue', '.md');
  fs.writeFileSync(outputPath, doc);
}
```

### 项目C：架构文档

```javascript
// 生成架构说明文档
const architecture = await aiManager.enhanceDocumentation(
  fs.readFileSync('docs/architecture/overview.md', 'utf-8'),
  'expand'
);

// 添加图表和详细说明
const enhanced = await aiManager.enhanceDocumentation(architecture, 'review');
```

---

*版本：1.0.0 | 更新时间：2025-11-17 | 作者：AI工具集成团队*
