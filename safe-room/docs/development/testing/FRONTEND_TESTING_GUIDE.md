---
title: FRONTEND TESTING GUIDE
version: v1.0.0
last_updated: 2025-11-16
status: active
category: development
tags: [testing, frontend, vitest, playwright, automation]
---

# 前端自动化测试指南

本文档介绍如何运行和管理前端项目的自动化测试。

## 📋 目录

- [测试框架](#测试框架)
- [快速开始](#快速开始)
- [运行测试](#运行测试)
- [测试类型](#测试类型)
- [测试覆盖率](#测试覆盖率)
- [CI/CD 集成](#cicd-集成)
- [故障排查](#故障排查)

## 🧪 测试框架

项目使用以下测试框架：

- **单元测试**: [Vitest](https://vitest.dev/) 4.0.9
  - 测试环境: happy-dom
  - 测试库: @vue/test-utils, @testing-library/vue
  
- **E2E 测试**: [Playwright](https://playwright.dev/) 1.49.0
  - 支持 Chromium, Firefox, WebKit

## 🚀 快速开始

### 1. 安装依赖

确保已安装所有依赖：

```bash
# 根目录
npm install

# 前端项目
cd springboot1ngh61a2/src/main/resources/front/front
npm install

# 后台项目
cd springboot1ngh61a2/src/main/resources/admin/admin
npm install
```

### 2. 安装 Playwright 浏览器（首次运行 E2E 测试需要）

```bash
# 在前端或后台项目目录下
npx playwright install
```

### 3. 运行测试

#### 使用 PowerShell 脚本（推荐）

```powershell
# 运行所有测试（单元测试 + E2E 测试）
.\run-frontend-tests.ps1

# 只运行单元测试
.\run-frontend-tests.ps1 -Type unit

# 只运行 E2E 测试
.\run-frontend-tests.ps1 -Type e2e

# 只运行前端应用的测试
.\run-frontend-tests.ps1 -App front

# 只运行后台应用的测试
.\run-frontend-tests.ps1 -App admin

# Watch 模式（自动重新运行测试）
.\run-frontend-tests.ps1 -Type unit -Watch

# UI 模式（可视化界面）
.\run-frontend-tests.ps1 -Type unit -UI
.\run-frontend-tests.ps1 -Type e2e -UI

# Debug 模式（E2E 测试）
.\run-frontend-tests.ps1 -Type e2e -Debug
```

#### 使用 npm 脚本

```bash
# 根目录运行所有测试
npm test

# 运行所有单元测试
npm run test:unit

# 运行所有 E2E 测试
npm run test:e2e

# 运行前端单元测试
npm run test:unit:front

# 运行后台单元测试
npm run test:unit:admin

# Watch 模式
npm run test:unit:watch

# UI 模式
npm run test:unit:ui
npm run test:e2e:ui
```

## 📝 测试类型

### 单元测试

单元测试位于 `tests/unit/` 目录，测试单个组件、函数或模块的功能。

#### 运行单元测试

```bash
# 前端项目
cd springboot1ngh61a2/src/main/resources/front/front
npm run test:unit          # 运行一次
npm run test:unit:watch    # Watch 模式
npm run test:unit:ui       # UI 模式
```

```bash
# 后台项目
cd springboot1ngh61a2/src/main/resources/admin/admin
npm run test:unit
npm run test:unit:watch
npm run test:unit:ui
```

#### 测试覆盖范围

**前端应用 (Front)**:
- ✅ 组件测试 (17个组件)
- ✅ Composables 测试 (9个)
- ✅ Services 测试 (3个)
- ✅ Stores 测试 (2个)
- ✅ Utils 测试 (4个)
- ✅ Common 测试 (7个)

**后台应用 (Admin)**:
- ✅ 组件测试 (6个组件)
- ✅ Stores 测试 (1个)
- ✅ Utils 测试 (9个)

### E2E 测试

E2E 测试位于 `tests/e2e/` 目录，测试完整的用户流程。

#### 运行 E2E 测试

```bash
# 前端项目
cd springboot1ngh61a2/src/main/resources/front/front
npm run test:e2e          # 无头模式
npm run test:e2e:ui       # 可视化模式
npm run test:e2e:debug    # 调试模式
npm run test:e2e:report   # 查看报告
```

```bash
# 后台项目
cd springboot1ngh61a2/src/main/resources/admin/admin
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:debug
npm run test:e2e:report
```

#### E2E 测试场景

**前端应用**:
- ✅ 认证流程 (auth.spec.ts)
- ✅ 登录流程 (login.spec.ts)
- ✅ 首页测试 (homepage.spec.ts)
- ✅ 预约流程 (booking-flow.spec.ts)
- ✅ CRUD 操作 (crud.spec.ts)
- ✅ 页面导航 (pages.spec.ts)
- ✅ 边界情况 (edge-cases.spec.ts)

**后台应用**:
- ✅ 认证流程 (auth.spec.ts)
- ✅ 登录流程 (login.spec.ts)
- ✅ 导航测试 (navigation.spec.ts)
- ✅ CRUD 操作 (crud.spec.ts)
- ✅ 页面测试 (pages.spec.ts)
- ✅ 边界情况 (edge-cases.spec.ts)

## 📊 测试覆盖率

> 📖 **详细指南**: 有关前端测试覆盖率的完整方法，请参考 [`FRONTEND_COVERAGE_METHODS.md`](FRONTEND_COVERAGE_METHODS.md)

### 运行覆盖率测试

```bash
# 根目录运行所有覆盖率测试
npm run coverage

# 前端覆盖率
npm run coverage:front

# 后台覆盖率
npm run coverage:admin

# 生成覆盖率报告
npm run coverage:report
```

### 覆盖率要求

当前阈值设置（在 `vitest.config.ts` 中）：
- **Lines**: 30%
- **Functions**: 30%
- **Branches**: 25%
- **Statements**: 30%

目标阈值（长期目标）：
- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 75%
- **Statements**: 80%

### 查看覆盖率报告

覆盖率报告生成在 `coverage/` 目录下：

```bash
# 打开 HTML 报告
# Windows
start coverage/index.html

# 或在浏览器中打开
# coverage/index.html
```

## 🔧 测试配置

### Vitest 配置

配置文件: `vitest.config.ts`

主要配置项：
- 测试环境: `happy-dom`
- 测试文件: `tests/unit/**/*.test.ts`
- 覆盖率提供者: `v8`
- 覆盖率报告格式: `text`, `lcov`, `html`, `json`, `json-summary`

### Playwright 配置

配置文件: `playwright.config.ts`

主要配置项：
- 测试目录: `tests/e2e`
- 超时时间: 30秒
- 浏览器: Chromium, Firefox, WebKit
- 自动启动开发服务器（非 CI 环境）

## 🚦 CI/CD 集成

### GitHub Actions

项目已配置 GitHub Actions 工作流，在每次推送时自动运行测试。

工作流文件: `.github/workflows/frontend-test-coverage.yml`

### 本地 CI 检查

```bash
# 运行完整的 CI 检查（包括测试）
npm run check:all
npm test
npm run coverage:check
```

## 🐛 故障排查

### 常见问题

#### 1. 依赖未安装

**错误**: `Cannot find module 'vitest'`

**解决**:
```bash
cd springboot1ngh61a2/src/main/resources/front/front
npm install
```

#### 2. Playwright 浏览器未安装

**错误**: `Executable doesn't exist`

**解决**:
```bash
npx playwright install
```

#### 3. 端口被占用

**错误**: `Port 8082 is already in use`

**解决**:
- 修改 `playwright.config.ts` 中的端口配置
- 或设置环境变量 `E2E_PORT=8083`

#### 4. 测试超时

**错误**: `Test timeout exceeded`

**解决**:
- 检查网络连接
- 增加超时时间（在 `playwright.config.ts` 中）
- 检查测试服务器是否正常启动

#### 5. 覆盖率报告未生成

**解决**:
```bash
# 确保安装了覆盖率依赖
npm install --save-dev @vitest/coverage-v8

# 重新运行覆盖率测试
npm run test:coverage
```

### 调试技巧

#### 单元测试调试

```bash
# 使用 UI 模式查看详细输出
npm run test:unit:ui

# 运行单个测试文件
npx vitest run tests/unit/components/Button.test.ts

# 运行匹配的测试
npx vitest run -t "Button"
```

#### E2E 测试调试

```bash
# 使用调试模式
npm run test:e2e:debug

# 使用 UI 模式
npm run test:e2e:ui

# 运行单个测试文件
npx playwright test tests/e2e/login.spec.ts

# 运行匹配的测试
npx playwright test -g "login"
```

## 📚 编写测试

### 测试文件组织结构

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.vue
│   │   ├── Button.test.ts              # 组件单元测试
│   │   └── __tests__/                  # 备选结构
│   │       └── Button.test.ts
│   └── Form/
│       ├── Form.vue
│       ├── Form.test.ts                # 组件测试
│       └── Form.spec.ts                # 备选命名
├── composables/
│   ├── useAuth.ts
│   ├── useAuth.test.ts                 # 组合式函数测试
│   └── __tests__/
│       └── useAuth.test.ts
├── utils/
│   ├── dateUtils.ts
│   └── dateUtils.test.ts               # 工具函数测试
├── pages/
│   └── Login/
│       ├── Login.vue
│       └── Login.test.ts               # 页面测试
tests/
├── unit/                               # 单元测试
│   ├── components/
│   ├── composables/
│   └── utils/
├── integration/                        # 集成测试
│   ├── pages/
│   └── workflows/
├── e2e/                                # 端到端测试
│   ├── auth/
│   │   └── login.spec.ts
│   ├── pages/
│   └── workflows/
├── setup/                              # 测试配置
│   ├── vitest.setup.ts
│   └── test-utils.ts
└── fixtures/                           # 测试数据
    ├── users.json
    └── courses.json
```

### 单元测试实现

#### 1. 基础组件测试

```typescript
// src/components/Button/__tests__/Button.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '../Button.vue'

describe('Button', () => {
  it('renders correctly', () => {
    const wrapper = mount(Button, {
      props: {
        text: 'Click me'
      }
    })

    expect(wrapper.text()).toBe('Click me')
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(Button)
    const button = wrapper.find('button')

    await button.trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('applies correct CSS classes', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'primary',
        size: 'large'
      }
    })

    expect(wrapper.classes()).toContain('button--primary')
    expect(wrapper.classes()).toContain('button--large')
  })

  it('is disabled when loading', () => {
    const wrapper = mount(Button, {
      props: {
        loading: true
      }
    })

    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('button--loading')
  })
})
```

#### 2. 表单组件测试

```typescript
// src/components/LoginForm/__tests__/LoginForm.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import LoginForm from '../LoginForm.vue'

describe('LoginForm', () => {
  const createWrapper = () => {
    return mount(LoginForm, {
      global: {
        plugins: [createTestingPinia()]
      }
    })
  }

  it('validates required fields', async () => {
    const wrapper = createWrapper()

    const submitButton = wrapper.find('[data-test="submit"]')
    await submitButton.trigger('click')

    expect(wrapper.text()).toContain('用户名不能为空')
    expect(wrapper.text()).toContain('密码不能为空')
  })

  it('submits form with valid data', async () => {
    const wrapper = createWrapper()

    await wrapper.find('[data-test="username"]').setValue('testuser')
    await wrapper.find('[data-test="password"]').setValue('password123')

    const submitButton = wrapper.find('[data-test="submit"]')
    await submitButton.trigger('click')

    // 验证提交事件
    expect(wrapper.emitted('submit')).toBeTruthy()
    expect(wrapper.emitted('submit')[0][0]).toEqual({
      username: 'testuser',
      password: 'password123'
    })
  })

  it('shows loading state during submission', async () => {
    const wrapper = createWrapper()

    // 填写表单
    await wrapper.find('[data-test="username"]').setValue('testuser')
    await wrapper.find('[data-test="password"]').setValue('password123')

    // Mock 异步提交
    wrapper.vm.handleSubmit = vi.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    )

    const submitButton = wrapper.find('[data-test="submit"]')
    await submitButton.trigger('click')

    expect(wrapper.text()).toContain('登录中...')
    expect(submitButton.attributes('disabled')).toBeDefined()
  })
})
```

#### 3. 组合式函数测试

```typescript
// src/composables/__tests__/useAuth.test.ts
import { describe, it, expect, vi } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import { useAuth } from '../useAuth'

// Mock API
vi.mock('../api/auth', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: vi.fn()
}))

import { login, logout, getCurrentUser } from '../api/auth'

describe('useAuth', () => {
  const createComposable = () => {
    const pinia = createTestingPinia()
    return useAuth()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should return default values', () => {
      const { isAuthenticated, user, loading, error } = createComposable()

      expect(isAuthenticated.value).toBe(false)
      expect(user.value).toBeNull()
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })
  })

  describe('login', () => {
    it('should login successfully', async () => {
      const { login, isAuthenticated, user, loading, error } = createComposable()

      const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' }
      vi.mocked(login).mockResolvedValue({
        success: true,
        data: mockUser
      })

      await login('testuser', 'password')

      expect(isAuthenticated.value).toBe(true)
      expect(user.value).toEqual(mockUser)
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('should handle login failure', async () => {
      const { login, isAuthenticated, user, loading, error } = createComposable()

      vi.mocked(login).mockRejectedValue(new Error('Invalid credentials'))

      await login('testuser', 'wrongpassword')

      expect(isAuthenticated.value).toBe(false)
      expect(user.value).toBeNull()
      expect(loading.value).toBe(false)
      expect(error.value).toContain('Invalid credentials')
    })

    it('should handle network errors', async () => {
      const { login, loading, error } = createComposable()

      vi.mocked(login).mockRejectedValue(new Error('Network Error'))

      await login('testuser', 'password')

      expect(loading.value).toBe(false)
      expect(error.value).toBe('Network Error')
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      const { login, logout, isAuthenticated, user } = createComposable()

      // 先登录
      vi.mocked(login).mockResolvedValue({
        success: true,
        data: { id: 1, username: 'testuser' }
      })
      await login('testuser', 'password')

      // 再登出
      vi.mocked(logout).mockResolvedValue({ success: true })

      await logout()

      expect(isAuthenticated.value).toBe(false)
      expect(user.value).toBeNull()
    })
  })
})
```

#### 4. 工具函数测试

```typescript
// src/utils/__tests__/validation.test.ts
import { describe, it, expect } from 'vitest'
import { validateEmail, validatePassword, validatePhone } from '../validation'

describe('validation utils', () => {
  describe('validateEmail', () => {
    it('should return true for valid email', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name+tag@example.co.uk')).toBe(true)
    })

    it('should return false for invalid email', () => {
      expect(validateEmail('')).toBe(false)
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(validateEmail('a@b.c')).toBe(true)  // 最短有效邮箱
      expect(validateEmail('test@example')).toBe(false)  // 无TLD
    })
  })

  describe('validatePassword', () => {
    it('should return true for valid password', () => {
      expect(validatePassword('Password123')).toBe(true)
      expect(validatePassword('MySecurePass!2024')).toBe(true)
    })

    it('should return false for invalid password', () => {
      expect(validatePassword('')).toBe(false)
      expect(validatePassword('123')).toBe(false)  // 太短
      expect(validatePassword('password')).toBe(false)  // 无大写字母
      expect(validatePassword('PASSWORD')).toBe(false)  // 无小写字母
      expect(validatePassword('Password')).toBe(false)  // 无数字
    })
  })

  describe('validatePhone', () => {
    it('should return true for valid phone number', () => {
      expect(validatePhone('13800138000')).toBe(true)
      expect(validatePhone('+8613800138000')).toBe(true)
      expect(validatePhone('138 0013 8000')).toBe(true)
    })

    it('should return false for invalid phone number', () => {
      expect(validatePhone('')).toBe(false)
      expect(validatePhone('123')).toBe(false)
      expect(validatePhone('138001380001')).toBe(false)  // 太长
      expect(validatePhone('abcdefghijk')).toBe(false)  // 非数字
    })
  })
})
```

### E2E测试实现

#### 1. 页面对象模式

```typescript
// tests/e2e/pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login')
  }

  async login(username: string, password: string) {
    await this.page.fill('[data-test="username"]', username)
    await this.page.fill('[data-test="password"]', password)
    await this.page.click('[data-test="submit"]')
  }

  async getErrorMessage() {
    return this.page.textContent('[data-test="error-message"]')
  }

  async isLoggedIn() {
    return this.page.url().includes('/dashboard')
  }
}
```

#### 2. 完整的E2E测试用例

```typescript
// tests/e2e/auth/login.spec.ts
import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'

test.describe('用户登录', () => {
  test('成功登录', async ({ page }) => {
    const loginPage = new LoginPage(page)

    await loginPage.goto()
    await loginPage.login('admin', 'admin')

    await expect(page).toHaveURL('/admin/dashboard')
    await expect(page.locator('h1')).toContainText('仪表板')
  })

  test('登录失败显示错误信息', async ({ page }) => {
    const loginPage = new LoginPage(page)

    await loginPage.goto()
    await loginPage.login('invalid', 'invalid')

    const errorMessage = await loginPage.getErrorMessage()
    expect(errorMessage).toContain('用户名或密码错误')
  })

  test('必填字段验证', async ({ page }) => {
    const loginPage = new LoginPage(page)

    await loginPage.goto()

    // 直接点击提交，不填写任何字段
    await page.click('[data-test="submit"]')

    // 验证错误信息
    await expect(page.locator('[data-test="username-error"]'))
      .toContainText('请输入用户名')
    await expect(page.locator('[data-test="password-error"]'))
      .toContainText('请输入密码')
  })

  test('密码可见性切换', async ({ page }) => {
    const loginPage = new LoginPage(page)

    await loginPage.goto()

    // 填写密码
    await page.fill('[data-test="password"]', 'mypassword')

    // 检查初始状态为密码类型
    await expect(page.locator('[data-test="password"]')).toHaveAttribute('type', 'password')

    // 点击切换按钮
    await page.click('[data-test="toggle-password"]')

    // 检查变为文本类型
    await expect(page.locator('[data-test="password"]')).toHaveAttribute('type', 'text')
  })
})
```

#### 3. 复杂业务流程测试

```typescript
// tests/e2e/course/course-booking.spec.ts
import { test, expect } from '@playwright/test'

test.describe('课程预约流程', () => {
  test.beforeEach(async ({ page }) => {
    // 登录用户
    await page.goto('/login')
    await page.fill('[data-test="username"]', 'testuser')
    await page.fill('[data-test="password"]', 'password')
    await page.click('[data-test="submit"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('完整预约流程', async ({ page }) => {
    // 1. 浏览课程列表
    await page.goto('/courses')
    await expect(page.locator('h1')).toContainText('课程列表')

    // 2. 选择课程
    await page.click('[data-test="course-card"]:first-child [data-test="view-details"]')
    await expect(page).toHaveURL(/\/courses\/\d+/)

    // 3. 查看课程详情
    const courseTitle = await page.textContent('[data-test="course-title"]')
    expect(courseTitle).toBeTruthy()

    // 4. 预约课程
    await page.click('[data-test="book-course"]')

    // 5. 选择预约时间
    await page.click('[data-test="time-slot"]:first-child')

    // 6. 确认预约
    await page.click('[data-test="confirm-booking"]')

    // 7. 验证预约成功
    await expect(page.locator('[data-test="success-message"]'))
      .toContainText('预约成功')

    // 8. 检查个人中心
    await page.goto('/profile')
    await expect(page.locator('[data-test="my-bookings"]'))
      .toContainText(courseTitle)
  })

  test('预约冲突处理', async ({ page }) => {
    // 1. 预约一个已有课程
    await page.goto('/courses')
    await page.click('[data-test="course-card"]:first-child [data-test="book-course"]')
    await page.click('[data-test="time-slot"]:first-child')
    await page.click('[data-test="confirm-booking"]')

    // 2. 尝试再次预约相同时间
    await page.goto('/courses')
    await page.click('[data-test="course-card"]:nth-child(2) [data-test="book-course"]')
    await page.click('[data-test="time-slot"]:first-child')  // 相同时间
    await page.click('[data-test="confirm-booking"]')

    // 3. 验证冲突提示
    await expect(page.locator('[data-test="error-message"]'))
      .toContainText('时间冲突')
  })
})
```

### 测试配置和Mock

#### 1. Vitest配置

```typescript
// vitest.config.ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup/vitest.setup.ts'],
    include: [
      'tests/unit/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html', 'json', 'json-summary'],
      include: ['src/**/*.{ts,tsx,vue,js,jsx}'],
      exclude: [
        'src/main.ts',
        'src/main.js',
        'src/router/**',
        'src/**/__tests__/**',
        'src/**/*.d.ts',
        'src/**/types/**',
        'src/**/env.d.ts',
        '**/*.config.{js,ts}',
        '**/*.spec.{ts,js}',
        '**/*.test.{ts,js}',
        '**/tests/**',
        '**/*.config.{js,ts}'
      ],
      thresholds: {
        lines: 30,
        functions: 30,
        branches: 25,
        statements: 30
      }
    }
  },
  optimizeDeps: {
    exclude: ['vue-demi']
  }
})
```

#### 2. 测试环境设置

```typescript
// tests/setup/vitest.setup.ts
import { beforeAll, afterAll, afterEach } from 'vitest'
import { cleanup } from '@testing-library/vue'

// 全局测试设置
beforeAll(() => {
  // 设置全局变量
  global.HTMLElement.prototype.scrollIntoView = vi.fn()
  global.HTMLElement.prototype.getBoundingClientRect = vi.fn(() => ({
    width: 100,
    height: 100,
    top: 0,
    left: 0,
    bottom: 100,
    right: 100
  }))
})

// 每个测试后清理
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(cb: ResizeObserverCallback) {}
  observe() {}
  unobserve() {}
  disconnect() {}
}
```

#### 3. API Mock设置

```typescript
// tests/setup/api-mocks.ts
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

const mock = new MockAdapter(axios)

// 用户API Mock
mock.onGet('/api/users').reply(200, [
  { id: 1, name: '张三', email: 'zhangsan@example.com' },
  { id: 2, name: '李四', email: 'lisi@example.com' }
])

mock.onGet('/api/users/1').reply(200, {
  id: 1,
  name: '张三',
  email: 'zhangsan@example.com'
})

mock.onPost('/api/users').reply(201, {
  id: 3,
  name: '王五',
  email: 'wangwu@example.com'
})

// 课程API Mock
mock.onGet('/api/courses').reply(200, [
  { id: 1, name: '瑜伽入门', price: 99, instructor: '张教练' },
  { id: 2, name: '力量训练', price: 129, instructor: '李教练' }
])

mock.onPost('/api/courses').reply(201, {
  id: 3,
  name: '新课程',
  price: 149,
  instructor: '王教练'
})

// 模拟网络延迟
mock.onAny().reply((config) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([200, { message: 'Success' }])
    }, 100)
  })
})

export { mock }
```

#### 4. 自定义测试工具

```typescript
// tests/utils/test-helpers.ts
import { mount, VueWrapper } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import { routes } from '@/router'

// 创建测试路由
export const createTestRouter = () => {
  return createRouter({
    history: createMemoryHistory(),
    routes
  })
}

// 创建测试Pinia
export const createTestPinia = () => {
  return createTestingPinia({
    createSpy: vi.fn
  })
}

// 通用组件挂载函数
export const mountComponent = (
  component: any,
  options: {
    props?: Record<string, any>
    slots?: Record<string, any>
    stubs?: Record<string, any>
  } = {}
) => {
  return mount(component, {
    props: options.props || {},
    slots: options.slots || {},
    stubs: options.stubs || {},
    global: {
      plugins: [createTestRouter(), createTestPinia()],
      mocks: {
        $t: (key: string) => key, // i18n mock
        $message: {
          success: vi.fn(),
          error: vi.fn(),
          warning: vi.fn()
        }
      }
    }
  })
}

// 等待异步操作完成
export const flushPromises = () => new Promise(setImmediate)

// 生成测试数据
export const generateTestUser = (overrides = {}) => ({
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  ...overrides
})

export const generateTestCourse = (overrides = {}) => ({
  id: 1,
  name: 'Test Course',
  description: 'Test course description',
  price: 99,
  instructor: 'Test Instructor',
  ...overrides
})
```

## 📖 更多资源

- [Vitest 文档](https://vitest.dev/)
- [Playwright 文档](https://playwright.dev/)
- [Vue Test Utils 文档](https://test-utils.vuejs.org/)
- [Testing Library 文档](https://testing-library.com/)

## 📝 测试最佳实践

1. **测试命名**: 使用描述性的测试名称
2. **测试隔离**: 每个测试应该独立运行
3. **Mock 外部依赖**: 使用 mock 避免依赖外部服务
4. **测试覆盖率**: 保持合理的覆盖率（目标 80%）
5. **E2E 测试**: 专注于关键用户流程
6. **持续集成**: 在 CI/CD 中自动运行测试

## 🎯 下一步

- [ ] 提高测试覆盖率到 80%
- [ ] 添加更多 E2E 测试场景
- [ ] 集成性能测试
- [ ] 添加视觉回归测试
- [ ] 设置测试报告通知

---

**最后更新**: 2025-11-15

