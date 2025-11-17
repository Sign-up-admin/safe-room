---
title: API文档Git Hooks使用指南
version: v1.0.0
last_updated: 2025-01-XX
status: active
category: development
tags: [git-hooks, api-docs, automation]
---

# API文档Git Hooks使用指南

> **版本**：v1.0.0
> **更新日期**：2025-01-XX
> **适用范围**：API文档自动化更新
> **关键词**：Git Hooks, API文档, 自动化

---

## 📋 目录

- [概述](#概述)
- [Hook文件说明](#hook文件说明)
- [使用方法](#使用方法)
- [配置选项](#配置选项)
- [故障排除](#故障排除)
- [最佳实践](#最佳实践)

---

## 📖 概述

### 目的

Git Hooks是Git提供的钩子机制，可以在特定的Git操作（如提交、推送）时自动执行脚本。通过Git Hooks，我们可以实现API文档的自动检查和更新，确保文档与代码保持同步。

### 实现的功能

1. **pre-commit**: 在提交前检测Controller变更，提示更新文档
2. **post-commit**: 在提交后可选地自动生成文档
3. **pre-push**: 在推送前检查文档同步状态

### 文件位置

```
.git/hooks/
├── pre-commit          # Linux/Mac
├── pre-commit.cmd      # Windows
├── post-commit         # Linux/Mac
├── post-commit.cmd     # Windows
├── pre-push           # Linux/Mac
└── pre-push.cmd       # Windows
```

---

## 🔧 Hook文件说明

### pre-commit Hook

#### 功能
- 检测暂存区中的Controller文件变更
- 提示用户更新API文档
- 可选择自动更新文档

#### 工作流程
1. 扫描`git diff --cached --name-only`的结果
2. 检查是否有Controller文件变更
3. 如果有变更，提示用户更新文档
4. 可选择自动运行文档生成工具
5. 将更新的文档添加到暂存区

### post-commit Hook

#### 功能
- 在提交成功后自动更新文档（可选）
- 通过环境变量或配置文件控制

#### 触发条件
- 当前提交包含Controller文件变更
- 启用了自动更新功能

### pre-push Hook

#### 功能
- 检查推送的提交中是否有Controller变更
- 验证API文档是否已同步更新
- 防止文档不同步的推送

#### 工作流程
1. 比较本地分支和远程分支的差异
2. 检查Controller文件变更
3. 验证API文档是否也已更新
4. 如果文档未更新，阻止推送或提示更新

---

## 🚀 使用方法

### 基本使用

#### 1. 启用Hooks
Git Hooks默认是启用的，放在`.git/hooks/`目录下的文件会自动执行。

#### 2. 正常提交
```bash
# 修改Controller文件
git add .
git commit -m "更新Controller"
# pre-commit hook会检测变更并提示更新文档
```

#### 3. 跳过检查
如果需要跳过hook检查：
```bash
git commit --no-verify -m "紧急修复"
git push --no-verify
```

### 高级配置

#### 启用自动更新
```bash
# 方法1：设置环境变量
export DOC_AUTO_UPDATE=true

# 方法2：创建标记文件
touch .doc-autoupdate-enabled
```

#### 自定义文档路径
编辑hook文件中的输出路径：
```bash
# 在hook文件中修改
node docs/scripts/generate-api-docs.js --output your/custom/path.md
```

---

## ⚙️ 配置选项

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `DOC_AUTO_UPDATE` | 启用自动文档更新 | `false` |
| `NODE_PATH` | Node.js可执行文件路径 | 自动查找 |

### 配置文件

#### .doc-autoupdate-enabled
创建此文件启用自动更新功能。

#### .doc-config.json
```json
{
  "autoUpdate": true,
  "outputPath": "docs/api/generated.md",
  "verbose": false
}
```

### Hook配置

#### 超时设置
```bash
# 在pre-commit中设置询问超时
read -t 10 answer  # 10秒超时
```

#### 自定义检测规则
```bash
# 修改检测的文件模式
CONTROLLER_PATTERN="springboot1ngh61a2/src/main/java/**/*.java"
```

---

## 🔧 故障排除

### 常见问题

#### 1. Hook不执行
**问题**：Git hook没有执行
**解决**：
- 检查文件权限：`ls -la .git/hooks/`
- 确保文件有执行权限：`chmod +x .git/hooks/*`
- Windows下使用`.cmd`文件

#### 2. Node.js未找到
**问题**：`node: command not found`
**解决**：
- 检查Node.js是否安装：`node --version`
- 添加Node.js到PATH
- 或在hook中指定完整路径

#### 3. 文档生成失败
**问题**：API文档生成失败
**解决**：
- 检查依赖：`npm install`
- 运行手动生成：`node docs/scripts/generate-api-docs.js`
- 检查错误日志

#### 4. 权限问题（Windows）
**问题**：无法执行`.cmd`文件
**解决**：
- 检查文件是否被安全软件拦截
- 尝试以管理员身份运行Git

### 调试方法

#### 启用详细输出
```bash
# 修改hook文件，添加调试信息
set -x  # Bash
@echo on  # CMD
```

#### 手动测试
```bash
# 直接运行hook
./.git/hooks/pre-commit

# 测试文档生成
node docs/scripts/generate-api-docs.js --verbose
```

---

## 💡 最佳实践

### 开发建议

#### 1. 定期更新
- 每次修改Controller后及时更新文档
- 利用pre-commit hook的自动提示

#### 2. 批量更新
```bash
# 批量更新多个Controller后的提交
node docs/scripts/generate-api-docs.js
git add docs/technical/api/
git commit -m "更新API文档"
```

#### 3. 分支策略
- 在feature分支上开发
- 合并到主分支前确保文档同步
- 使用pre-push hook防止不同步推送

### 团队协作

#### 1. 标准化流程
- 建立统一的提交规范
- 培训团队成员使用hooks
- 定期review hook的有效性

#### 2. 冲突解决
- 当多个开发者同时修改Controller时
- 先pull最新代码和文档
- 重新生成文档解决冲突

#### 3. CI/CD集成
- 在CI流水线中集成文档检查
- 自动构建和部署文档
- 文档变更触发相关测试

### 性能优化

#### 1. 条件执行
- 只在Controller变更时生成文档
- 使用缓存避免重复生成
- 支持增量更新

#### 2. 异步处理
```bash
# 后台生成文档
node docs/scripts/generate-api-docs.js &
```

#### 3. 错误处理
- 完善的错误处理和回滚机制
- 失败时不阻止提交，但发出警告

---

## 📊 监控和统计

### 使用统计
```bash
# 查看hook执行日志
tail -f .git/hooks/hook.log

# 统计文档更新频率
git log --oneline --grep="API文档"
```

### 效果评估
- 文档同步率提升
- 开发效率改善
- 用户反馈改善

---

## 🔄 更新记录

| 日期 | 版本 | 更新内容 | 更新人 |
|------|------|----------|--------|
| 2025-01-XX | v1.0.0 | 初始版本，创建Git Hooks使用指南 | 项目工程师 |


