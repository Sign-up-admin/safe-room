---
title: CODE CHECK CONFIG
version: v1.0.0
last_updated: 2025-11-16
status: active
category: development
tags: [code-check, eslint, prettier, configuration, guide]
---

# 代码检查配置说明

## 已配置的工具

### 1. ESLint - JavaScript/TypeScript/Vue 代码检查

**配置文件**: `.eslintrc.cjs`

**功能**:
- ✅ Vue 3 代码规范检查
- ✅ TypeScript 类型检查
- ✅ JavaScript 最佳实践
- ✅ 代码复杂度检查
- ✅ 未使用变量检测
- ✅ 代码风格统一

**主要规则**:
- Vue 组件命名规范
- TypeScript 严格模式
- 禁止使用 `any` 类型（警告）
- 代码复杂度限制（15）
- 函数最大行数（200）
- 最大嵌套深度（4）
- 最大参数数量（5）

### 2. Prettier - 代码格式化

**配置文件**: `.prettierrc`

**功能**:
- ✅ 自动格式化代码
- ✅ 统一代码风格
- ✅ 支持 Vue、TypeScript、JavaScript、JSON、CSS、SCSS、Markdown

**格式化规则**:
- 不使用分号
- 单引号
- 2 空格缩进
- 120 字符行宽
- 尾随逗号

### 3. TypeScript - 类型检查

**配置文件**: `tsconfig.json`

**增强的检查选项**:
- ✅ `strict: true` - 严格模式
- ✅ `noUncheckedIndexedAccess` - 索引访问检查
- ✅ `noImplicitReturns` - 隐式返回检查
- ✅ `noPropertyAccessFromIndexSignature` - 属性访问检查
- ✅ `noImplicitOverride` - 隐式覆盖检查
- ✅ `forceConsistentCasingInFileNames` - 文件名大小写一致性

### 4. Stylelint - CSS/SCSS 代码检查

**配置文件**: `.stylelintrc.js`

**功能**:
- ✅ CSS/SCSS 代码规范检查
- ✅ 属性顺序检查（使用 recess-order）
- ✅ 支持 Vue 单文件组件中的 `<style>` 块
- ✅ SCSS 语法支持
- ✅ Vue 3 深度选择器支持（:deep, :slotted, :global）

**主要规则**:
- 基于 `stylelint-config-standard-scss` 标准配置
- 属性顺序使用 `stylelint-config-recess-order`
- 支持 SCSS 变量、混入、函数
- 允许 Element Plus BEM 选择器（下划线命名）
- 允许 Vue 3 深度选择器语法
- 允许现代和传统颜色函数（兼容性）

**已安装的依赖**:
- `stylelint` - 核心工具
- `stylelint-config-standard-scss` - SCSS 标准配置
- `stylelint-config-recess-order` - 属性顺序规则
- `postcss-html` - 支持 Vue/HTML 文件中的样式检查

### 5. Husky + lint-staged - Git Hooks

**配置文件**: 
- `.husky/pre-commit` - 提交前检查
- `.lintstagedrc.cjs` - 暂存文件检查规则

**功能**:
- ✅ 提交代码前自动运行检查
- ✅ 只检查暂存的文件
- ✅ 自动修复可修复的问题

### 6. EditorConfig - 编辑器配置

**配置文件**: `.editorconfig`

**功能**:
- ✅ 统一编辑器设置
- ✅ 跨编辑器兼容
- ✅ 自动换行符处理

### 7. VS Code 配置

**配置文件**: `.vscode/settings.json`, `.vscode/extensions.json`

**功能**:
- ✅ 保存时自动格式化
- ✅ 保存时自动修复 ESLint 错误
- ✅ 推荐扩展插件

## 可用命令

### Admin 项目

```bash
# 检查代码（不修复）
npm run check

# 检查并修复代码
npm run check:fix

# 全面检查（包括样式）
npm run check:all

# 全面检查并修复
npm run check:all:fix

# 单独运行各项检查
npm run lint:check      # ESLint 检查
npm run lint            # ESLint 检查并修复
npm run format:check    # Prettier 检查
npm run format          # Prettier 格式化
npm run type-check      # TypeScript 类型检查
npm run stylelint:check # Stylelint 检查
npm run stylelint       # Stylelint 检查并修复
```

### Front 项目

命令与 Admin 项目相同。

## 检查范围

### ESLint 检查
- ✅ `.vue` 文件
- ✅ `.js`, `.jsx` 文件
- ✅ `.ts`, `.tsx` 文件
- ✅ `.cjs`, `.mjs` 文件

### Prettier 格式化
- ✅ `.js`, `.ts`, `.jsx`, `.tsx` 文件
- ✅ `.vue` 文件
- ✅ `.json` 文件
- ✅ `.css`, `.scss` 文件
- ✅ `.md` 文件

### TypeScript 类型检查
- ✅ 所有 `.ts`, `.tsx` 文件
- ✅ Vue 单文件组件中的 `<script lang="ts">`

### Stylelint 检查
- ✅ `.css` 文件
- ✅ `.scss` 文件
- ✅ Vue 单文件组件中的 `<style>` 块（包括 `<style scoped>` 和 `<style lang="scss">`）
- ✅ 支持检查 Vue 文件中的多个 `<style>` 块

## Git Hooks

### Pre-commit Hook

在每次 `git commit` 时自动运行：
1. ESLint 检查并修复暂存的文件
2. Prettier 格式化暂存的文件
3. Stylelint 检查并修复暂存的文件

如果检查失败，提交将被阻止。

## 忽略文件

### ESLint 忽略
- `node_modules/`
- `dist/`
- `build/`
- `*.d.ts`
- 配置文件

### Prettier 忽略
- `node_modules/`
- `dist/`
- `build/`
- 锁文件
- 日志文件

### Stylelint 忽略
- `node_modules/`
- `dist/`
- `coverage/`
- `test-results/`
- `playwright-report/`
- `*.js` 和 `*.ts` 文件（仅检查样式文件）

## 最佳实践

1. **开发时**: 使用 `npm run check:fix` 快速修复问题
2. **提交前**: Git hooks 会自动运行检查
3. **CI/CD**: 使用 `npm run check:all` 进行全面检查
4. **VS Code**: 安装推荐扩展，享受自动格式化

## 安装依赖

首次使用前，需要安装所有依赖：

```bash
cd springboot1ngh61a2/src/main/resources/admin/admin
npm install

cd ../front/front
npm install
```

## 初始化 Husky

安装依赖后，Husky 会自动初始化。如果需要手动初始化：

```bash
cd springboot1ngh61a2/src/main/resources/admin/admin
npx husky install

cd ../front/front
npx husky install
```

## 注意事项

1. **首次运行**: 可能需要较长时间，因为要检查所有文件
2. **修复冲突**: 如果 ESLint 和 Prettier 规则冲突，Prettier 优先
3. **类型检查**: TypeScript 类型检查可能较慢，建议在 CI/CD 中运行
4. **样式检查**: Stylelint 只检查 CSS/SCSS，不检查内联样式

## 故障排除

### ESLint 错误过多
运行 `npm run lint` 自动修复大部分问题

### Prettier 格式化不一致
运行 `npm run format` 统一格式化

### TypeScript 类型错误
检查 `tsconfig.json` 配置，可能需要调整严格模式选项

### Stylelint 无法检查 Vue 文件
确保已安装 `postcss-html` 依赖：
```bash
npm install --save-dev postcss-html
```

### Husky 不工作
确保已运行 `npm install`，Husky 会在 `prepare` 脚本中自动安装






