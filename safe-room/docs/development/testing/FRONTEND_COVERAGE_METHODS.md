---
title: FRONTEND COVERAGE METHODS
version: v1.0.0
last_updated: 2025-11-16
status: active
category: development
tags: [testing, coverage, frontend, methods, guide]
---

# 前端工程测试覆盖率方法指南

## 📋 目录

- [覆盖率基础概念](#覆盖率基础概念)
- [运行覆盖率测试](#运行覆盖率测试)
- [查看覆盖率报告](#查看覆盖率报告)
- [提高测试覆盖率](#提高测试覆盖率)
- [最佳实践](#最佳实践)
- [故障排查](#故障排查)

## 📊 覆盖率基础概念

### 覆盖率指标类型

测试覆盖率通过四个主要指标来衡量代码的测试完整性：

#### 1. **行覆盖率 (Lines Coverage)**
- **定义**: 已执行代码行占总代码行的百分比
- **计算**: `(已执行行数 / 总行数) × 100%`
- **重要性**: 反映代码是否被测试执行过

#### 2. **函数覆盖率 (Functions Coverage)**
- **定义**: 已调用函数占总函数的百分比
- **计算**: `(已调用函数数 / 总函数数) × 100%`
- **重要性**: 确保函数功能得到测试

#### 3. **分支覆盖率 (Branches Coverage)**
- **定义**: 已执行分支占总分支的百分比
- **计算**: `(已执行分支数 / 总分支数) × 100%`
- **重要性**: 测试条件语句的不同路径

#### 4. **语句覆盖率 (Statements Coverage)**
- **定义**: 已执行语句占总语句的百分比
- **计算**: `(已执行语句数 / 总语句数) × 100%`
- **重要性**: 最基础的覆盖率指标

### 项目覆盖率阈值

#### Front 项目 (前端应用)
```typescript
// vitest.config.ts 中的配置
coverage: {
  thresholds: {
    lines: 30,      // 当前最低阈值: 30%
    functions: 30,  // 当前最低阈值: 30%
    branches: 25,   // 当前最低阈值: 25%
    statements: 30  // 当前最低阈值: 30%
    // 长期目标: 所有指标达到 80%
  }
}
```

#### Admin 项目 (后台管理)
```typescript
// vitest.config.ts 中的配置
coverage: {
  thresholds: {
    lines: 80,      // 当前最低阈值: 80%
    functions: 80,  // 当前最低阈值: 80%
    branches: 70,   // 当前最低阈值: 70%
    statements: 80  // 当前最低阈值: 80%
  }
}
```

### 覆盖率报告格式

项目支持多种报告格式：

- **`text`**: 终端文本输出（快速查看）
- **`lcov`**: LCOV 格式（CI/CD 工具集成）
- **`html`**: HTML 网页报告（详细查看）
- **`json`**: JSON 格式（程序化处理）
- **`json-summary`**: JSON 摘要（快速检查）

## 🚀 运行覆盖率测试

### 方法一：使用 npm 脚本

#### Front 项目覆盖率测试

```bash
# 进入前端项目目录
cd springboot1ngh61a2/src/main/resources/front/front

# 运行覆盖率测试
npm run test:coverage

# 详细检查模式（verbose 输出）
npm run test:coverage:check

# 生成报告并显示路径
npm run test:coverage:report

# CI 模式（生成 JSON 报告用于自动化检查）
npm run test:coverage:ci
```

#### Admin 项目覆盖率测试

```bash
# 进入后台项目目录
cd springboot1ngh61a2/src/main/resources/admin/admin

# 运行覆盖率测试
npm run test:coverage

# 详细检查模式
npm run test:coverage:check

# 生成报告
npm run test:coverage:report

# CI 模式
npm run test:coverage:ci
```

#### 根目录批量运行

```bash
# 根目录运行所有项目的覆盖率测试
npm run coverage

# 只运行前端覆盖率
npm run coverage:front

# 只运行后台覆盖率
npm run coverage:admin

# 生成所有覆盖率报告
npm run coverage:report
```

### 方法二：使用 PowerShell 脚本

#### 前端覆盖率监控脚本

```powershell
# 监控前端项目覆盖率
.\frontend-coverage-monitor.ps1 -Project front

# 监控后台项目覆盖率
.\frontend-coverage-monitor.ps1 -Project admin

# 自定义阈值
.\frontend-coverage-monitor.ps1 -Project front -ThresholdLine 40 -ThresholdFunction 35

# 详细输出模式
.\frontend-coverage-monitor.ps1 -Project front -Verbose
```

#### 通用测试运行脚本

```powershell
# 运行所有前端测试（包括覆盖率）
.\run-frontend-tests.ps1

# 只运行覆盖率测试
.\run-frontend-tests.ps1 -Type coverage

# 只运行前端项目的覆盖率
.\run-frontend-tests.ps1 -Type coverage -App front

# 只运行后台项目的覆盖率
.\run-frontend-tests.ps1 -Type coverage -App admin
```

### 方法三：CI/CD 集成

#### GitHub Actions 自动运行

项目已配置 GitHub Actions 工作流，在以下情况自动运行覆盖率测试：

- **推送** 到 main/master/develop 分支
- **创建 Pull Request**
- **手动触发** (workflow_dispatch)

工作流会：
- 运行单元测试和覆盖率测试
- 检查覆盖率阈值
- 生成覆盖率报告
- 在 PR 中显示覆盖率变化
- 上传详细报告作为工件

#### 本地 CI 检查

```bash
# 模拟 CI 环境检查
npm run check:all
npm test
npm run coverage:check
```

## 📈 查看覆盖率报告

### HTML 报告查看

#### 1. 浏览器直接打开

```bash
# Windows 系统
start springboot1ngh61a2/src/main/resources/front/front/coverage/index.html
start springboot1ngh61a2/src/main/resources/admin/admin/coverage/index.html

# macOS 系统
open springboot1ngh61a2/src/main/resources/front/front/coverage/index.html

# Linux 系统
xdg-open springboot1ngh61a2/src/main/resources/front/front/coverage/index.html
```

#### 2. HTML 报告内容解读

HTML 报告包含：

- **总览页面**: 整体覆盖率统计
- **文件列表**: 按文件查看详细覆盖率
- **代码高亮**: 未覆盖行标红，已覆盖行标绿
- **分支信息**: 显示条件分支的执行情况

### JSON 报告解析

#### 覆盖率数据结构

```json
{
  "total": {
    "lines": {
      "total": 1250,
      "covered": 938,
      "skipped": 0,
      "pct": 75.04
    },
    "functions": {
      "total": 180,
      "covered": 145,
      "skipped": 0,
      "pct": 80.56
    },
    "branches": {
      "total": 320,
      "covered": 240,
      "skipped": 0,
      "pct": 75.00
    },
    "statements": {
      "total": 1350,
      "covered": 1013,
      "skipped": 0,
      "pct": 75.04
    }
  }
}
```

#### 程序化处理示例

```javascript
// 读取覆盖率报告
const coverage = require('./coverage/coverage-summary.json');

// 检查是否达到阈值
const thresholds = {
  lines: 80,
  functions: 80,
  branches: 70,
  statements: 80
};

const total = coverage.total;
const passed = Object.keys(thresholds).every(key =>
  total[key].pct >= thresholds[key]
);

console.log(`覆盖率检查: ${passed ? '✅ 通过' : '❌ 未通过'}`);
```

### 终端文本输出

#### 直接查看覆盖率统计

运行 `npm run test:coverage` 后，会在终端显示：

```
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
All files          |   75.04 |    75.00 |   80.56 |   75.04 |
 src               |   85.23 |    82.14 |   88.46 |   85.23 |
  App.vue          |     100 |      100 |     100 |     100 |
  main.ts          |       0 |        0 |       0 |       0 | 1-25
  router.ts        |   71.43 |       50 |   66.67 |   71.43 | 15,22
 src/components    |   78.95 |    76.19 |   84.21 |   78.95 |
  Button.vue       |     100 |      100 |     100 |     100 |
  Input.vue        |   85.71 |       75 |   83.33 |   85.71 | 45
```

#### 输出解读

- **`% Stmts`**: 语句覆盖率
- **`% Branch`**: 分支覆盖率
- **`% Funcs`**: 函数覆盖率
- **`% Lines`**: 行覆盖率
- **`Uncovered Line #s`**: 未覆盖的行号

## 📈 提高测试覆盖率

### 识别未覆盖代码

#### 1. 查看 HTML 报告

在 HTML 报告中：
- 🔴 **红色行**: 未覆盖代码
- 🟢 **绿色行**: 已覆盖代码
- 🟡 **黄色行**: 部分覆盖代码

#### 2. 分析覆盖率报告

```javascript
// 读取覆盖率摘要
const coverage = require('./coverage/coverage-summary.json');

// 找出覆盖率最低的文件
const files = Object.entries(coverage)
  .filter(([key]) => key !== 'total')
  .map(([file, data]) => ({
    file,
    linesPct: data.lines.pct,
    functionsPct: data.functions.pct,
    branchesPct: data.branches.pct
  }))
  .sort((a, b) => a.linesPct - b.linesPct);

console.log('覆盖率最低的文件:');
files.slice(0, 5).forEach(f => {
  console.log(`${f.file}: ${f.linesPct}% 行覆盖率`);
});
```

#### 3. 使用覆盖率工具

```bash
# 查看具体未覆盖的行
npx nyc report --reporter=text-details

# 生成详细的未覆盖代码列表
npx nyc report --reporter=text-lcov | grep "LF:" -A 5
```

### 编写测试用例策略

#### 1. 组件测试方法

**基础组件测试模板**:

```typescript
// src/components/Button/__tests__/Button.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '../Button.vue'

describe('Button', () => {
  // 测试渲染
  it('renders correctly', () => {
    const wrapper = mount(Button, {
      props: { text: 'Click me' }
    })
    expect(wrapper.text()).toBe('Click me')
  })

  // 测试事件
  it('emits click event when clicked', async () => {
    const wrapper = mount(Button)
    const button = wrapper.find('button')

    await button.trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
  })

  // 测试属性变化
  it('applies correct CSS classes', () => {
    const wrapper = mount(Button, {
      props: { variant: 'primary', size: 'large' }
    })

    expect(wrapper.classes()).toContain('button--primary')
    expect(wrapper.classes()).toContain('button--large')
  })

  // 测试边界条件
  it('is disabled when loading', () => {
    const wrapper = mount(Button, {
      props: { loading: true }
    })

    const button = wrapper.find('button')
    expect(button.attributes('disabled')).toBeDefined()
  })
})
```

**表单组件测试**:

```typescript
// src/components/LoginForm/__tests__/LoginForm.test.ts
describe('LoginForm', () => {
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

    expect(wrapper.emitted('submit')).toBeTruthy()
  })
})
```

#### 2. Composables 测试方法

```typescript
// src/composables/__tests__/useAuth.test.ts
import { describe, it, expect, vi } from 'vitest'
import { createTestingPinia } from '@pinia/testing'
import { useAuth } from '../useAuth'

describe('useAuth', () => {
  const createComposable = () => {
    const pinia = createTestingPinia()
    return useAuth()
  }

  it('returns default values', () => {
    const { isAuthenticated, user, loading, error } = createComposable()

    expect(isAuthenticated.value).toBe(false)
    expect(user.value).toBeNull()
    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
  })

  it('handles successful login', async () => {
    const { login, isAuthenticated, user, loading } = createComposable()

    const mockUser = { id: 1, username: 'testuser' }
    // Mock API response
    vi.mocked(login).mockResolvedValue({
      success: true,
      data: mockUser
    })

    await login('testuser', 'password')

    expect(isAuthenticated.value).toBe(true)
    expect(user.value).toEqual(mockUser)
    expect(loading.value).toBe(false)
  })

  it('handles login failure', async () => {
    const { login, error } = createComposable()

    vi.mocked(login).mockRejectedValue(new Error('Invalid credentials'))

    await login('testuser', 'wrongpassword')

    expect(error.value).toContain('Invalid credentials')
  })
})
```

#### 3. 工具函数测试方法

```typescript
// src/utils/__tests__/validation.test.ts
import { describe, it, expect } from 'vitest'
import { validateEmail, validatePassword, validatePhone } from '../validation'

describe('validation utils', () => {
  describe('validateEmail', () => {
    it('returns true for valid email', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name+tag@example.co.uk')).toBe(true)
    })

    it('returns false for invalid email', () => {
      expect(validateEmail('')).toBe(false)
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
    })

    it('handles edge cases', () => {
      expect(validateEmail('a@b.c')).toBe(true)  // 最短有效邮箱
      expect(validateEmail('test@example')).toBe(false)  // 无TLD
    })
  })

  describe('validatePassword', () => {
    it('returns true for valid password', () => {
      expect(validatePassword('Password123')).toBe(true)
      expect(validatePassword('MySecurePass!2024')).toBe(true)
    })

    it('returns false for invalid password', () => {
      expect(validatePassword('')).toBe(false)
      expect(validatePassword('123')).toBe(false)  // 太短
      expect(validatePassword('password')).toBe(false)  // 无大写字母
      expect(validatePassword('PASSWORD')).toBe(false)  // 无小写字母
      expect(validatePassword('Password')).toBe(false)  // 无数字
    })
  })
})
```

### 边界条件和异常场景测试

#### 1. 错误处理测试

```typescript
describe('API Error Handling', () => {
  it('handles network errors', async () => {
    // Mock network failure
    vi.mocked(axios.get).mockRejectedValue(new Error('Network Error'))

    const { fetchData } = useApi()
    await fetchData('/api/data')

    expect(error.value).toContain('Network Error')
  })

  it('handles 404 errors', async () => {
    vi.mocked(axios.get).mockRejectedValue({
      response: { status: 404, data: { message: 'Not found' } }
    })

    const { fetchData } = useApi()
    await fetchData('/api/nonexistent')

    expect(error.value).toContain('Not found')
  })

  it('handles timeout errors', async () => {
    vi.mocked(axios.get).mockRejectedValue({
      code: 'ECONNABORTED',
      message: 'Timeout'
    })

    const { fetchData } = useApi()
    await fetchData('/api/slow-endpoint')

    expect(error.value).toContain('请求超时')
  })
})
```

#### 2. 边界值测试

```typescript
describe('Pagination Component', () => {
  it('handles empty data', () => {
    const wrapper = mount(Pagination, {
      props: { total: 0, pageSize: 10 }
    })

    expect(wrapper.find('.pagination-info').text()).toBe('暂无数据')
  })

  it('handles single page', () => {
    const wrapper = mount(Pagination, {
      props: { total: 5, pageSize: 10 }
    })

    expect(wrapper.findAll('.page-item')).toHaveLength(1)
  })

  it('handles large page numbers', () => {
    const wrapper = mount(Pagination, {
      props: { total: 10000, pageSize: 10, currentPage: 999 }
    })

    expect(wrapper.vm.currentPage).toBe(1000) // 最大页码
  })

  it('handles invalid page numbers', () => {
    const wrapper = mount(Pagination, {
      props: { total: 100, pageSize: 10, currentPage: -1 }
    })

    expect(wrapper.vm.currentPage).toBe(1) // 自动修正为第一页
  })
})
```

### 覆盖率阈值设置和提升策略

#### 渐进式阈值提升

```typescript
// 第一阶段：建立基础覆盖率（当前状态）
coverage: {
  thresholds: {
    lines: 30,
    functions: 30,
    branches: 25,
    statements: 30
  }
}

// 第二阶段：提升到 50%
coverage: {
  thresholds: {
    lines: 50,
    functions: 50,
    branches: 40,
    statements: 50
  }
}

// 第三阶段：达到 70%
coverage: {
  thresholds: {
    lines: 70,
    functions: 70,
    branches: 60,
    statements: 70
  }
}

// 最终目标：达到 80%
coverage: {
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 75,
    statements: 80
  }
}
```

#### 覆盖率提升计划

1. **第一周**: 识别并测试所有组件的基础功能
2. **第二周**: 增加边界条件和错误处理测试
3. **第三周**: 测试所有 composables 和工具函数
4. **第四周**: 完善 E2E 测试场景
5. **持续**: 代码审查时要求新功能有对应测试

## 🎯 最佳实践

### 测试编写原则

1. **单一职责**: 每个测试只验证一个功能点
2. **独立性**: 测试间互不依赖，可任意顺序执行
3. **可读性**: 测试代码应该清晰表达测试意图
4. **维护性**: 测试代码应易于理解和修改

### 测试命名规范

```typescript
// ✅ 好的命名
describe('UserProfile Component', () => {
  describe('when user is logged in', () => {
    it('displays user avatar and name', () => {
      // 测试内容
    })

    it('allows editing profile information', () => {
      // 测试内容
    })
  })

  describe('when user is not logged in', () => {
    it('redirects to login page', () => {
      // 测试内容
    })
  })
})

// ❌ 不好的命名
describe('test component', () => {
  it('test1', () => {
    // 测试内容
  })

  it('test2', () => {
    // 测试内容
  })
})
```

### Mock 策略

```typescript
// 外部依赖 Mock
vi.mock('@/api/user', () => ({
  getUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn()
}))

// 浏览器 API Mock
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
})

// IntersectionObserver Mock
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}
```

### 测试文件组织

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.vue
│   │   └── Button.test.ts          # 组件测试
│   └── LoginForm/
│       ├── LoginForm.vue
│       ├── LoginForm.test.ts       # 组件测试
│       └── __tests__/
│           └── LoginForm.spec.ts   # 备选结构
├── composables/
│   ├── useAuth.ts
│   └── useAuth.test.ts             # composable 测试
├── utils/
│   ├── validation.ts
│   └── validation.test.ts          # 工具函数测试
└── stores/
    ├── user.ts
    └── user.test.ts                # store 测试

tests/
├── unit/                          # 单元测试
│   ├── components/
│   ├── composables/
│   └── utils/
├── integration/                   # 集成测试
└── e2e/                          # 端到端测试
    ├── auth/
    └── pages/
```

### CI/CD 集成最佳实践

1. **并行执行**: 利用多核 CPU 并行运行测试
2. **缓存依赖**: 缓存 node_modules 加速安装
3. **分层测试**: 单元测试 → 集成测试 → E2E 测试
4. **失败快照**: 测试失败时保存浏览器截图和 HTML
5. **覆盖率徽章**: 在 README 中显示覆盖率状态

## 🐛 故障排查

### 常见问题

#### 1. 覆盖率报告为空

**问题**: 运行覆盖率测试后报告为空或显示 0%

**解决**:
```bash
# 确保依赖正确安装
npm install

# 检查 Vitest 配置
cat vitest.config.ts

# 重新运行测试
npm run test:coverage
```

#### 2. 测试执行失败

**问题**: 测试运行时出现错误

**解决**:
```bash
# 检查测试文件语法
npx vitest run --reporter=verbose

# 运行单个测试文件调试
npx vitest run tests/unit/components/Button.test.ts

# 检查环境配置
npm run test:unit:ui  # 使用 UI 模式调试
```

#### 3. 覆盖率低于阈值

**问题**: 覆盖率检查失败

**解决**:
```bash
# 查看详细覆盖率报告
npm run test:coverage:report

# 打开 HTML 报告分析未覆盖代码
start coverage/index.html

# 临时调整阈值进行调试
npx vitest run --coverage --coverage.thresholds.lines=0
```

#### 4. Mock 不工作

**问题**: Mock 函数没有生效

**解决**:
```typescript
// 确保在测试开始前设置 Mock
beforeEach(() => {
  vi.clearAllMocks()
  vi.resetAllMocks()
})

// 使用正确的 Mock 语法
const mockFn = vi.fn()
vi.mocked(api.getUser).mockResolvedValue(mockUser)
```

#### 5. 异步测试超时

**问题**: 异步测试经常超时

**解决**:
```typescript
// 设置更长的超时时间
it('async operation', async () => {
  // 测试内容
}, 10000) // 10秒超时

// 等待所有异步操作完成
await flushPromises()
await nextTick()
```

#### 6. DOM 操作测试失败

**问题**: DOM 相关测试在 happy-dom 环境下失败

**解决**:
```typescript
// 确保正确等待 DOM 更新
await nextTick()

// 使用 data-test 属性选择元素
const button = wrapper.find('[data-test="submit-button"]')

// 检查元素是否存在
expect(wrapper.find('.error-message').exists()).toBe(true)
```

### 调试技巧

#### 使用 Vitest UI

```bash
# 启动 Vitest UI 进行调试
npm run test:unit:ui

# 在浏览器中查看测试结果和覆盖率
# 访问 http://localhost:51204
```

#### 单步调试测试

```typescript
// 在测试中添加 debugger 语句
it('debug test', () => {
  const result = someFunction(input)
  debugger  // 浏览器会在这里暂停
  expect(result).toBe(expected)
})
```

#### 覆盖率详细分析

```bash
# 生成详细的 LCOV 报告
npx nyc report --reporter=lcov

# 查看哪些行没有被覆盖
npx nyc report --reporter=text-details | grep "uncovered"
```

### 性能优化

#### 测试执行优化

```typescript
// 使用 describe.concurrent 并发执行测试组
describe.concurrent('API Tests', () => {
  it('test 1', async () => { /* ... */ })
  it('test 2', async () => { /* ... */ })
})

// 合理使用测试钩子
beforeAll(() => {
  // 全局设置，只执行一次
})

beforeEach(() => {
  // 每个测试前重置状态
})
```

#### 覆盖率收集优化

```typescript
// 在 vitest.config.ts 中优化覆盖率配置
coverage: {
  // 排除不需要覆盖的文件
  exclude: [
    'src/main.ts',
    'src/router/**',
    '**/*.d.ts',
    '**/*.config.*'
  ],

  // 只收集必要的报告格式
  reporter: process.env.CI ? ['lcov', 'json-summary'] : ['text', 'html']
}
```

## 📚 相关资源

- [Vitest 官方文档](https://vitest.dev/)
- [Vue Test Utils 文档](https://test-utils.vuejs.org/)
- [Testing Library 文档](https://testing-library.com/)
- [Playwright 文档](https://playwright.dev/)
- [代码覆盖率最佳实践](https://testing.googleblog.com/2020/08/code-coverage-best-practices.html)

---

**最后更新**: 2025-11-16
