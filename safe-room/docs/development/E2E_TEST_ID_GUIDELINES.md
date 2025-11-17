---
title: E2E TEST ID GUIDELINES
version: v1.0.0
last_updated: 2025-11-17
status: active
category: development
---

# E2E测试ID使用规范

本文档定义了前端项目中`data-testid`属性的使用规范和最佳实践，用于提升E2E测试的稳定性和可维护性。

## 📋 目录

- [为什么需要data-testid](#为什么需要data-testid)
- [命名规范](#命名规范)
- [使用场景](#使用场景)
- [最佳实践](#最佳实践)
- [元素优先级](#元素优先级)
- [示例](#示例)
- [工具和验证](#工具和验证)

## 🎯 为什么需要data-testid

### 问题分析

传统的E2E测试通常依赖以下选择器：
- CSS类名：`.btn-primary`、`.form-input`
- 文本内容：`text="登录"`
- 元素属性：`[placeholder="请输入用户名"]`

这些选择器的缺点：
- **不稳定性**：样式重构时类名可能改变
- **模糊性**：文本可能重复或本地化
- **维护成本高**：每次UI改动都需要更新测试

### data-testid的优势

- **稳定性**：专为测试设计的属性，不受样式和内容变化影响
- **唯一性**：可以确保选择器的唯一性
- **语义化**：通过命名体现元素的业务含义
- **性能**：比复杂的CSS选择器更高效

## 📝 命名规范

### 基本格式

```
data-testid="[page]-[component]-[element]-[variant]"
```

### 组成部分

1. **page**: 页面标识符（小写）
   - `login`: 登录页面
   - `home`: 首页
   - `booking`: 预约页面
   - `profile`: 个人资料页面

2. **component**: 组件标识符（小写）
   - `form`: 表单
   - `card`: 卡片
   - `modal`: 模态框
   - `list`: 列表

3. **element**: 元素类型（小写）
   - `input`: 输入框
   - `button`: 按钮
   - `select`: 选择器
   - `checkbox`: 复选框
   - `radio`: 单选框
   - `link`: 链接
   - `text`: 文本
   - `icon`: 图标

4. **variant**: 可选的变体标识符（小写）
   - `primary`: 主要
   - `secondary`: 次要
   - `submit`: 提交
   - `cancel`: 取消

### 命名规则

- 使用小写字母和连字符 `-`
- 使用英文单词，避免中文
- 保持简洁明了，长度不超过50字符
- 同一页面内保持命名一致性
- 避免使用数字（除非表示列表项）

### 特殊情况

#### 列表项和重复元素

```html
<!-- 好的做法 -->
<div data-testid="course-card-1" v-for="course in courses" :key="course.id">
<div data-testid="time-slot-09-00" v-for="slot in timeSlots" :key="slot.time">

<!-- 不好的做法 -->
<div data-testid="course-card" v-for="course in courses">
```

#### 动态内容

```html
<!-- 好的做法 -->
<button data-testid="booking-submit-button" :disabled="isSubmitting">

<!-- 不好的做法 -->
<button data-testid="submit" :disabled="isSubmitting">
```

## 🎭 使用场景

### 必须添加data-testid的元素

#### 1. 用户交互元素
- 按钮（提交、取消、编辑等）
- 表单输入框（文本、密码、选择器等）
- 链接和导航元素
- 复选框和单选框

#### 2. 状态显示元素
- 错误消息和提示信息
- 加载状态指示器
- 成功/失败状态显示

#### 3. 数据展示元素
- 列表项和卡片
- 表格行和单元格
- 分页控件

#### 4. 导航和菜单
- 菜单项
- 面包屑导航
- 标签页

### 可选添加data-testid的元素

#### 1. 容器元素
- 主要布局区域
- 模态框和弹窗
- 表单区域

#### 2. 静态内容
- 标题和副标题
- 描述文本
- 图标

## ✅ 最佳实践

### 1. 语义化命名

```html
<!-- ✅ 推荐 -->
<button data-testid="login-submit-button">登录</button>
<input data-testid="user-email-input" placeholder="请输入邮箱">

<!-- ❌ 避免 -->
<button data-testid="btn1">登录</button>
<input data-testid="input1" placeholder="请输入邮箱">
```

### 2. 避免过度抽象

```html
<!-- ✅ 推荐 -->
<div data-testid="user-profile-card">
  <h3 data-testid="user-name-display">张三</h3>
</div>

<!-- ❌ 避免 -->
<div data-testid="card">
  <h3 data-testid="text">张三</h3>
</div>
```

### 3. 保持一致性

```html
<!-- ✅ 推荐 - 统一使用button后缀 -->
<button data-testid="form-submit-button">提交</button>
<button data-testid="form-cancel-button">取消</button>

<!-- ❌ 避免 - 混用命名方式 -->
<button data-testid="submit-btn">提交</button>
<button data-testid="cancel">取消</button>
```

### 4. 优先级原则

1. **功能优先**：基于元素功能命名，而非样式
2. **用户视角**：从用户角度描述元素
3. **唯一性**：确保在页面范围内唯一
4. **可维护性**：命名应便于理解和维护

### 5. 与现有选择器结合

```typescript
// 测试中使用data-testid作为主要选择器
await page.getByTestId('login-submit-button').click()

// 在data-testid不存在时，作为备选方案
await page.getByRole('button', { name: '登录' }).click()
```

## 📊 元素优先级

### 高优先级（必须添加）

| 元素类型 | 示例 | 优先级 |
|---------|------|--------|
| 登录/注册表单 | 用户名、密码输入框，登录按钮 | 🔴 高 |
| 数据提交表单 | 提交、取消按钮，表单字段 | 🔴 高 |
| 导航元素 | 菜单项，面包屑，标签页 | 🔴 高 |
| 错误提示 | 错误消息显示区域 | 🔴 高 |

### 中优先级（推荐添加）

| 元素类型 | 示例 | 优先级 |
|---------|------|--------|
| 数据展示卡片 | 课程卡片，用户卡片 | 🟡 中 |
| 列表项 | 搜索结果，选项列表 | 🟡 中 |
| 状态指示器 | 加载状态，进度条 | 🟡 中 |
| 模态框 | 确认对话框，详情弹窗 | 🟡 中 |

### 低优先级（可选添加）

| 元素类型 | 示例 | 优先级 |
|---------|------|--------|
| 装饰元素 | 图标，分割线 | 🟢 低 |
| 静态文本 | 标题，描述 | 🟢 低 |
| 布局容器 | 侧边栏，主要内容区 | 🟢 低 |

## 💡 示例

### 登录页面

```html
<template>
  <div class="login-container">
    <h1 data-testid="login-page-title">会员登录</h1>

    <form data-testid="login-form">
      <div class="form-group">
        <label for="username">用户名</label>
        <input
          id="username"
          data-testid="login-username-input"
          type="text"
          placeholder="请输入用户名"
        >
      </div>

      <div class="form-group">
        <label for="password">密码</label>
        <input
          id="password"
          data-testid="login-password-input"
          type="password"
          placeholder="请输入密码"
        >
      </div>

      <div data-testid="login-error-message" class="error-message" v-if="error">
        {{ error }}
      </div>

      <button data-testid="login-submit-button" type="submit">
        登录
      </button>

      <button data-testid="login-cancel-button" type="button">
        取消
      </button>
    </form>
  </div>
</template>
```

### 课程预约页面

```html
<template>
  <div class="booking-page">
    <div class="course-list">
      <div
        v-for="course in courses"
        :key="course.id"
        :data-testid="`course-card-${course.id}`"
        class="course-card"
      >
        <h3 :data-testid="`course-title-${course.id}`">{{ course.title }}</h3>
        <p :data-testid="`course-description-${course.id}`">{{ course.description }}</p>

        <div class="time-slots">
          <button
            v-for="slot in course.slots"
            :key="slot.time"
            :data-testid="`time-slot-${course.id}-${slot.time.replace(':', '-')}`"
            class="time-slot"
            :disabled="!slot.available"
          >
            {{ slot.time }}
          </button>
        </div>

        <button :data-testid="`course-book-button-${course.id}`" class="book-btn">
          预约
        </button>
      </div>
    </div>

    <div data-testid="booking-summary" class="summary" v-if="selectedCourse">
      <h4>预约信息</h4>
      <p data-testid="summary-course-name">{{ selectedCourse.title }}</p>
      <p data-testid="summary-time">{{ selectedTime }}</p>
      <button data-testid="booking-confirm-button">确认预约</button>
    </div>
  </div>
</template>
```

## 🛠️ 工具和验证

### 测试选择器工具库

创建`tests/utils/selectors.ts`来集中管理所有testid：

```typescript
// tests/utils/selectors.ts
export const TEST_IDS = {
  // Login page
  LOGIN: {
    FORM: 'login-form',
    USERNAME_INPUT: 'login-username-input',
    PASSWORD_INPUT: 'login-password-input',
    SUBMIT_BUTTON: 'login-submit-button',
    CANCEL_BUTTON: 'login-cancel-button',
    ERROR_MESSAGE: 'login-error-message',
  },

  // Booking page
  BOOKING: {
    COURSE_CARD: (id: string | number) => `course-card-${id}`,
    TIME_SLOT: (courseId: string | number, time: string) => `time-slot-${courseId}-${time.replace(':', '-')}`,
    CONFIRM_BUTTON: 'booking-confirm-button',
  },
} as const

export type TestIds = typeof TEST_IDS
```

### 使用示例

```typescript
// tests/e2e/login.spec.ts
import { TEST_IDS } from '../utils/selectors'

test('login test', async ({ page }) => {
  await page.getByTestId(TEST_IDS.LOGIN.USERNAME_INPUT).fill('username')
  await page.getByTestId(TEST_IDS.LOGIN.PASSWORD_INPUT).fill('password')
  await page.getByTestId(TEST_IDS.LOGIN.SUBMIT_BUTTON).click()
})
```

### 验证脚本

创建验证脚本确保testid的唯一性和正确性：

```bash
# 验证testid唯一性
npm run test:e2e:validate-ids

# 检查缺失的testid
npm run test:e2e:check-missing-ids
```

## 📚 相关资源

- [Playwright Testing Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Library Priority Guide](https://testing-library.com/docs/queries/about/#priority)
- [Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**最后更新**: 2025-11-17

**维护者**: 前端开发团队
