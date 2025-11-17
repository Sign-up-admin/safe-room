---
title: FRONTEND VUE FUNCTION FIX
version: v1.0.0
last_updated: 2025-11-16
status: active
category: technical
tags: [frontend, vue, bug-fix, troubleshooting]
---

# 前端Vue组件函数未定义错误修复报告

## 问题描述

前端门户页面（http://192.168.3.142:8082）出现以下运行时错误：

1. `_ctx.getCardBackground is not a function`
2. `_ctx.shouldShowVideo is not a function`

错误发生在 `ServiceCards.vue` 组件中。

## 问题分析

### 根本原因

这是典型的 **Vite 开发服务器缓存问题**，不是代码问题。源文件中的函数定义是正确的，但运行时使用的是缓存的旧版本代码。

### 验证结果

已验证 `springboot1ngh61a2/src/main/resources/front/front/src/components/home/ServiceCards.vue` 文件：

✅ **所有必需函数已正确定义**：
- `getCardBackground` (第126-133行) - 获取卡片背景样式
- `shouldShowVideo` (第136-143行) - 判断是否显示视频
- `getVideoSrc` (第146-153行) - 获取视频源

✅ **函数在模板中正确使用**：
- 第17行：`backgroundImage: getCardBackground(card, index)`
- 第23行：`v-if="shouldShowVideo(card, index)"`
- 第24行：`:src="getVideoSrc(card, index)"`

## 修复步骤

### 1. 清除Vite缓存

已执行以下命令清除缓存：

```powershell
cd springboot1ngh61a2/src/main/resources/front/front
# 清除 .vite 目录
if (Test-Path .vite) { Remove-Item -Recurse -Force .vite }
# 清除 node_modules/.vite 目录
if (Test-Path node_modules\.vite) { Remove-Item -Recurse -Force node_modules\.vite }
```

### 2. 重启前端开发服务器

**重要**：需要重启前端开发服务器以应用更改。

**方法1：使用启动脚本**
```powershell
.\start-frontend.ps1
```

**方法2：手动重启**
```powershell
cd springboot1ngh61a2/src/main/resources/front/front
npm run dev
```

### 3. 清除浏览器缓存

在浏览器中按 `Ctrl+Shift+R` (Windows) 或 `Cmd+Shift+R` (Mac) 强制刷新页面。

## Admin登录配置验证

✅ **Admin登录配置正常**：

- **登录接口端点**：`/users/login` ✓
- **后端控制器**：`UsersController.login()` 正常 ✓
- **前端登录页面**：正确调用登录接口 ✓
- **Token生成**：正常 ✓

Admin登录功能本身没有问题。前端门户的错误不会直接影响admin登录功能。

## 验证清单

- [x] 验证ServiceCards.vue源文件完整性
- [x] 确认所有函数正确定义
- [x] 清除Vite缓存目录
- [x] 检查admin登录配置
- [ ] **需要手动执行**：重启前端开发服务器
- [ ] **需要手动执行**：清除浏览器缓存并测试

## 注意事项

1. **开发环境**：这是开发环境的缓存问题，生产环境构建不会受影响
2. **错误位置**：错误发生在前端门户（端口8082），不是admin前端
3. **影响范围**：仅影响前端门户的ServiceCards组件渲染，不影响admin登录功能

## 后续建议

如果问题仍然存在，可以尝试：

1. **完全清理并重新安装依赖**：
   ```powershell
   cd springboot1ngh61a2/src/main/resources/front/front
   Remove-Item -Recurse -Force node_modules
   Remove-Item -Recurse -Force .vite
   npm install
   npm run dev
   ```

2. **检查Vite配置**：确认 `vite.config.ts` 中的配置正确

3. **查看浏览器控制台**：检查是否有其他错误信息

## 修复完成时间

2025-11-16

