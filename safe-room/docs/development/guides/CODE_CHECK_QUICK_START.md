---
title: CODE CHECK QUICK START
version: v1.0.0
last_updated: 2025-11-17
status: active
category: development
tags: [code-check, quick-start, eslint, prettier, guide]
---

# 代码检查快速开始

## 🚀 快速开始

### 1. 安装依赖

```bash
# Admin 项目
cd springboot1ngh61a2/src/main/resources/admin/admin
npm install

# Front 项目
cd springboot1ngh61a2/src/main/resources/front/front
npm install
```

### 2. 运行检查

```bash
# 检查代码（不修复）
npm run check

# 检查并自动修复
npm run check:fix

# 全面检查（包括样式）
npm run check:all

# 全面检查并修复
npm run check:all:fix
```

## 📋 常用命令

| 命令 | 说明 |
|------|------|
| `npm run lint` | ESLint 检查并修复 |
| `npm run lint:check` | ESLint 仅检查（不修复） |
| `npm run format` | Prettier 格式化代码 |
| `npm run format:check` | Prettier 仅检查（不修复） |
| `npm run type-check` | TypeScript 类型检查 |
| `npm run stylelint` | Stylelint 检查并修复样式 |
| `npm run stylelint:check` | Stylelint 仅检查（不修复） |
| `npm run check` | 运行所有检查（ESLint + Prettier + TypeScript） |
| `npm run check:fix` | 运行所有检查并修复 |
| `npm run check:all` | 运行所有检查（包括样式） |
| `npm run check:all:fix` | 运行所有检查并修复（包括样式） |

## 🔧 配置说明

### ESLint
- **配置文件**: `.eslintrc.cjs`
- **检查**: JavaScript, TypeScript, Vue 文件
- **规则**: Vue 3 + TypeScript 最佳实践

### Prettier
- **配置文件**: `.prettierrc`
- **格式化**: 所有代码文件
- **风格**: 单引号、无分号、2 空格缩进

### TypeScript
- **配置文件**: `tsconfig.json`
- **检查**: 类型安全、严格模式
- **增强**: 索引访问、隐式返回等检查

### Stylelint
- **配置文件**: `.stylelintrc.cjs`
- **检查**: CSS, SCSS, Vue 样式块
- **规则**: 标准样式规范

## 🎯 Git Hooks

配置了 `pre-commit` hook，提交代码前会自动：
1. ✅ ESLint 检查并修复
2. ✅ Prettier 格式化
3. ✅ Stylelint 检查并修复

如果检查失败，提交将被阻止。

## 💡 使用建议

1. **开发时**: 使用 `npm run check:fix` 快速修复
2. **提交前**: Git hooks 会自动运行（无需手动）
3. **CI/CD**: 使用 `npm run check:all` 进行全面检查
4. **VS Code**: 安装推荐扩展，享受自动格式化

## ⚠️ 注意事项

- 首次运行可能需要较长时间
- 某些规则可能需要手动修复
- TypeScript 类型检查可能较慢
- 确保已安装所有依赖

## 📚 详细文档

查看 `CODE_CHECK_CONFIG.md` 获取完整配置说明。










