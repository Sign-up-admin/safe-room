<!-- 69db20f3-c170-4f89-81b6-78aa2f519168 7aba48b5-fe0d-4323-a106-906e711fb056 -->
# 修复 admin 前端主页错误

## 问题分析

1. **jQuery 初始化错误**：`yz.js` 在 jQuery 完全加载前执行，导致 `Cannot access 'o' before initialization` 错误
2. **Element Plus 组件解析失败**：`el-submenu` 组件无法解析，可能是组件注册问题

## 修复方案

### 1. 修复 jQuery 初始化错误 (`public/index.html`)

问题：`yz.js` 在 jQuery 完全初始化之前执行，导致 `Cannot access 'o' before initialization` 错误。

解决方案：

- 使用 `DOMContentLoaded` 事件确保 DOM 和 jQuery 完全加载后再执行 `yz.js`
- 或者将 jQuery 脚本移到 `<head>` 并使用同步加载，确保在模块脚本之前执行
- 添加错误处理，确保脚本按正确顺序加载

### 2. 修复 Element Plus 组件注册问题 (`src/main.ts`)

问题：`el-submenu` 组件无法解析，即使已经全局注册 Element Plus。

解决方案：

- 检查 Element Plus 的全局注册是否正确工作
- 可能需要使用不同的注册方式或检查组件导出名称
- 验证 `app.use(ElementPlus)` 是否包含所有菜单组件
- 如果全局注册失败，尝试按需导入并显式注册所有菜单相关组件

### 3. 检查组件使用 (`src/components/index/IndexAsideStatic.vue`)

确认组件导入和使用方式：

- 检查模板中 `el-submenu` 的使用是否正确
- 验证是否需要显式导入组件（虽然全局注册应该足够）

## 实施步骤

1. 修改 `public/index.html`：调整脚本加载顺序
2. 检查并修复 `src/main.ts`：确保 Element Plus 正确注册
3. 验证 `IndexAsideStatic.vue`：确认组件使用正确
4. 测试修复效果

### To-dos

- [ ] 修改 public/index.html，将 jQuery 相关脚本移到 body 底部或添加 defer 属性
- [ ] 检查并修复 src/main.ts 中 Element Plus 的注册方式，确保 el-submenu 组件可用
- [ ] 验证 IndexAsideStatic.vue 中 el-submenu 组件的使用方式