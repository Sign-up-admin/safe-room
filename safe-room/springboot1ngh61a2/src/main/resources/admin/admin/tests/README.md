# Admin 前端自动化测试文档

本目录包含针对 admin 前端应用的完整测试套件，包括单元测试、集成测试和端到端测试。通过统一的测试工具库，提供高效、可复用的测试环境。

## 📁 目录结构

```
tests/
├── setup/
│   ├── vitest.setup.ts          # 全局测试配置和 mocks
│   └── global-setup.ts          # 全局测试环境初始化
├── utils/
│   ├── index.ts                 # 统一导出入口 (推荐使用)
│   ├── test-helpers.ts          # Admin 专用测试辅助函数
│   ├── unit-test-helpers.ts     # 通用组件测试辅助函数
│   ├── data-factory.ts          # 测试数据工厂
│   ├── component-test-helpers.ts # 组件测试专用工具
│   ├── lifecycle-test-helpers.ts # 生命周期测试工具
│   ├── shared-helpers.ts        # 共享辅助函数
│   └── mocks/                   # Mock 工具库
│       ├── jquery.mock.ts       # jQuery 相关 mocks
│       ├── element-plus.mock.ts # Element Plus 组件 mocks
│       └── dom.mock.ts          # DOM API mocks
├── unit/                        # 单元测试
│   ├── components/              # 组件测试
│   ├── utils/                   # 工具函数测试
│   ├── stores/                  # 状态管理测试
│   ├── constants/               # 常量配置测试
│   ├── views/                   # 页面组件测试
│   └── integration/             # 集成相关单元测试
├── integration/                 # 集成测试
│   ├── script-loading.test.ts
│   ├── component-interaction.test.ts
│   ├── data-flow.test.ts
│   └── navigation-flow.test.ts
├── e2e/                         # 端到端测试
│   ├── app-initialization.test.ts
│   └── admin-journey/           # Admin 用户操作流程测试
└── shared/                      # 共享测试资源
    ├── factories/               # 数据工厂
    └── mocks/                   # 共享 mocks
```

## 🧪 测试类型

### 单元测试 (Unit Tests)
测试单个组件、函数或模块的功能，位于 `unit/` 目录下。

### 集成测试 (Integration Tests)
测试组件间交互、数据流和脚本加载等集成场景，位于 `integration/` 目录下。

### 端到端测试 (E2E Tests)
测试完整用户流程和应用初始化，位于 `e2e/` 目录下。

## 🛠️ 测试工具库

### 统一导入

```typescript
// 推荐：从统一入口导入所有工具
import {
  ComponentWrappers,
  MockCreators,
  DataGenerators,
  TestScenarios,
  mountComponent,
  createMockUser
} from '@/tests/utils'
```

### 组件测试

#### 基础组件挂载

```typescript
import { mountComponent, ComponentWrappers } from '@/tests/utils'

// 基础挂载
const wrapper = mountComponent(MyComponent, {
  props: { /* props */ },
  global: { /* global options */ }
})

// 智能挂载（自动配置环境）
const adminWrapper = ComponentWrappers.admin(MyAdminComponent)
const formWrapper = ComponentWrappers.form(MyFormComponent, formData)
const tableWrapper = ComponentWrappers.table(MyTableComponent, tableData)
```

#### 高级组件Wrapper

```typescript
import { createComponentWrapper } from '@/tests/utils'

const wrapper = createComponentWrapper(MyComponent, {
  useRouter: true,      // 启用路由
  usePinia: true,       // 启用状态管理
  isAdmin: true,        // Admin组件模式
  authenticated: true,  // 需要认证
  mocks: { /* 自定义mocks */ },
  stubs: { /* 自定义stubs */ }
})
```

### Mock创建

#### 统一Mock创建器

```typescript
import { MockCreators, createUnifiedMocks } from '@/tests/utils'

// 快速创建不同类型的mock
const basicMocks = MockCreators.basic()
const adminMocks = MockCreators.admin()
const authMocks = MockCreators.authenticated()

// 自定义mock
const customMocks = createUnifiedMocks({
  elementPlus: true,
  admin: true,
  authenticated: false,
  customMocks: { $customApi: vi.fn() }
})
```

#### API和数据Mock

```typescript
import { createApiMocks, createDataMocks } from '@/tests/utils'

const apiMocks = createApiMocks('/api/v1')
const dataMocks = createDataMocks()

// 使用mock数据
const users = dataMocks.users(5)
const tableData = dataMocks.tableData(10)
```

### 测试数据生成

#### 数据工厂

```typescript
import { DataGenerators, UserFactory, TestScenarios } from '@/tests/utils'

// 使用预定义工厂
const user = UserFactory.create({ name: 'John' })
const users = UserFactory.createMany(5)

// 使用数据生成器
const testUsers = DataGenerators.users(10)
const randomUsers = DataGenerators.randomUsers(5)
const validForm = DataGenerators.validUserForm({ email: 'test@example.com' })

// 使用测试场景
const emptyData = TestScenarios.empty.users()
const edgeCase = TestScenarios.edge.unicode.user()
const adminUser = TestScenarios.permissions.admin()
```

#### 自定义数据工厂

```typescript
import { DataFactory } from '@/tests/utils'

const CustomFactory = new DataFactory((index = 0) => ({
  id: index + 1,
  name: `Custom ${index + 1}`,
  value: Math.random()
}))

const item = CustomFactory.create({ name: 'Special Item' })
const items = CustomFactory.createMany(10)
```

### 断言辅助

```typescript
import { testAssertions } from '@/tests/utils'

describe('MyComponent', () => {
  it('renders correctly', () => {
    const wrapper = mountComponent(MyComponent)

    testAssertions.assertComponentRendered(wrapper)
    testAssertions.assertComponentContainsText(wrapper, 'Hello World')
    testAssertions.assertEventEmitted(wrapper, 'click')
    testAssertions.assertProps(wrapper, { disabled: false })
  })
})
```

### 测试环境设置

#### Admin认证环境

```typescript
import { setupAdminAuth, createHappyDOMWrapper } from '@/tests/utils'

describe('Admin Components', () => {
  beforeEach(() => {
    createHappyDOMWrapper()
    setupAdminAuth()
  })

  it('works with authentication', () => {
    // 测试已认证的Admin组件
  })
})
```

## 📋 使用指南

### 编写单元测试

```typescript
import { describe, it, expect } from 'vitest'
import { ComponentWrappers, DataGenerators } from '@/tests/utils'
import MyComponent from '@/components/MyComponent.vue'

describe('MyComponent', () => {
  it('renders user data', () => {
    const user = DataGenerators.user.create({ name: 'John' })
    const wrapper = ComponentWrappers.basic(MyComponent, {
      props: { user }
    })

    expect(wrapper.text()).toContain('John')
  })

  it('handles admin interactions', () => {
    const wrapper = ComponentWrappers.authenticated(MyComponent)
    const button = wrapper.find('button')

    await button.trigger('click')
    expect(wrapper.emitted('action')).toBeTruthy()
  })
})
```

### 编写集成测试

```typescript
import { describe, it, expect } from 'vitest'
import { MockCreators, createCombinedMocks } from '@/tests/utils'

describe('User Management Flow', () => {
  it('creates and displays user', async () => {
    const { mocks, data } = createCombinedMocks({
      api: true,
      data: true,
      admin: true,
      authenticated: true
    })

    // 设置mock响应
    mocks.$http.post.mockResolvedValue(data.api.success({ id: 1 }))

    // 执行集成测试逻辑
    // ...
  })
})
```

### 编写E2E测试

```typescript
import { test } from '@playwright/test'
import { setupAdminAuth, loginAsAdmin } from '@/tests/utils'

test('admin user journey', async ({ page }) => {
  await setupAdminAuth(page)
  await loginAsAdmin(page)

  // 执行E2E测试流程
  // ...
})
```

## 🔧 配置和扩展

### 自定义Mock

```typescript
// tests/utils/custom-mocks.ts
export const customMocks = {
  $customService: vi.fn(),
  $externalApi: vi.fn()
}

// tests/utils/index.ts
export { customMocks } from './custom-mocks'
```

### 自定义数据工厂

```typescript
// tests/utils/custom-factory.ts
import { DataFactory } from './data-factory'

export const CustomEntityFactory = new DataFactory((index = 0) => ({
  id: index + 1,
  title: `Entity ${index + 1}`,
  description: `Description ${index + 1}`
}))
```

## 📊 测试覆盖率

运行测试时自动生成覆盖率报告：

```bash
npm run test:coverage
```

覆盖率报告位于 `coverage/index.html`。

## 🚀 运行测试

### 使用 npm 脚本

```bash
# 安装依赖
npm install

# 运行所有测试
npm run test:all

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 运行端到端测试
npm run test:e2e

# 运行覆盖率测试
npm run test:coverage

# 开发模式 (Watch)
npm run test:watch

# UI 模式
npm run test:ui
```

### 使用 PowerShell 脚本

根目录下的 `test-admin-automation.ps1` 提供了更丰富的测试运行选项：

```powershell
# 运行所有测试
.\test-admin-automation.ps1

# 运行特定类型的测试
.\test-admin-automation.ps1 -Type unit
.\test-admin-automation.ps1 -Type integration
.\test-admin-automation.ps1 -Type e2e

# 生成详细报告
.\test-admin-automation.ps1 -Report

# Verbose 输出模式
.\test-admin-automation.ps1 -Verbose

# UI 模式运行 E2E 测试
.\test-admin-automation.ps1 -Type e2e -UI
```

### 运行特定测试文件

```bash
# 运行单个测试文件
npx vitest run tests/unit/utils/http.test.ts
npx vitest run tests/integration/script-loading.test.ts

# 运行目录下所有测试
npx vitest run tests/unit/components/
```

## 🛠️ 测试工具库

### 通用测试工具 (`test-helpers.ts`)

```typescript
import { createTestApp, TestDataFactory, AssertionUtils } from './utils/test-helpers'

// 创建测试用的 Vue 应用
const { app, router, pinia } = createTestApp()

// 生成测试数据
const user = TestDataFactory.createUser({ name: 'Test User' })
const news = TestDataFactory.createNews({ title: 'Test News' })

// 断言工具
AssertionUtils.assertHasProperties(user, ['id', 'name', 'email'])
```

### Mock 工具

```typescript
import { createJQueryMock } from './utils/mocks/jquery.mock'
import { createElementPlusMock } from './utils/mocks/element-plus.mock'

// 使用 jQuery mock
const jQueryMock = createJQueryMock()
global.jQuery = jQueryMock

// 使用 Element Plus mock
const elementPlusMock = createElementPlusMock()
app.use(elementPlusMock)
```

## ⚙️ 测试配置

### Vitest 配置 (`vitest.config.ts`)

```typescript
export default defineConfig({
  plugins: [
    vue(),
    createSvgIconsPlugin({
      iconDirs: [resolve(__dirname, 'src/icons/svg')],
      symbolId: 'icon-[name]',
      inject: 'body-last',
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['tests/setup/vitest.setup.ts'],
    include: [
      'tests/unit/**/*.test.ts',
      'tests/integration/**/*.test.ts',
      'tests/e2e/**/*.test.ts'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html', 'json'],
      include: ['src/**/*.{ts,tsx,js,jsx,vue}'],
      exclude: ['src/**/*.config.{ts,js}', 'src/**/*.d.ts'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80
      }
    }
  }
})
```

### 全局测试设置 (`tests/setup/vitest.setup.ts`)

- 自动 mock 浏览器 APIs (localStorage, sessionStorage, matchMedia 等)
- 配置 jQuery 和 Element Plus mocks
- 设置 DOM 模拟环境
- 清理测试状态

### 覆盖率配置

- **目标阈值**: 语句覆盖率 ≥80%, 函数覆盖率 ≥80%, 分支覆盖率 ≥70%
- **报告格式**: HTML, LCOV, JSON
- **排除文件**: 配置文件、类型定义文件、测试文件本身

## 📋 测试覆盖范围

### 单元测试覆盖
- ✅ **组件测试**: App.vue, IndexHeader.vue 等主要组件
- ✅ **工具函数**: HTTP 客户端、安全工具、验证函数等
- ✅ **状态管理**: Pinia stores 测试
- ✅ **常量配置**: 菜单配置、API 端点等
- ✅ **页面组件**: 各模块页面组件

### 集成测试覆盖
- ✅ **脚本加载**: jQuery 和依赖脚本的加载顺序
- ✅ **组件交互**: 组件间数据流转和事件传递
- ✅ **数据流**: API 调用和数据处理流程
- ✅ **导航流**: 路由跳转和页面导航

### 端到端测试覆盖
- ✅ **应用初始化**: 完整应用启动流程
- ✅ **用户认证**: 登录/登出流程
- ✅ **CRUD 操作**: 数据增删改查
- ✅ **权限验证**: 角色和权限检查

## 🐛 故障排除

### 常见测试失败原因

1. **Mock 配置问题**
   ```typescript
   // 错误：mock 返回值类型不匹配
   vi.mocked(apiService).getUser.mockResolvedValue({ id: 1 })

   // 正确：确保类型匹配
   vi.mocked(apiService).getUser.mockResolvedValue({
     id: 1,
     name: 'User',
     email: 'user@example.com'
   } as User)
   ```

2. **异步操作处理**
   ```typescript
   // 错误：忘记等待异步操作
   it('should handle async operation', () => {
     const result = asyncFunction()
     expect(result).toBeDefined() // result 是 Promise
   })

   // 正确：使用 async/await
   it('should handle async operation', async () => {
     const result = await asyncFunction()
     expect(result).toBeDefined()
   })
   ```

3. **DOM 元素查找**
   ```typescript
   // 错误：在组件挂载前查找元素
   const wrapper = shallowMount(Component)
   expect(wrapper.find('.element').exists()).toBe(true)

   // 正确：等待组件挂载完成
   const wrapper = mount(Component)
   await wrapper.vm.$nextTick()
   expect(wrapper.find('.element').exists()).toBe(true)
   ```

### 调试技巧

1. **使用测试工具库**
   ```typescript
   import { testHelpers } from '../utils/test-helpers'

   it('should render correctly', () => {
     const { app } = testHelpers.createTestApp()
     testHelpers.assertComponentRenders(wrapper, '<div>Hello</div>')
   })
   ```

2. **启用详细日志**
   ```bash
   # Verbose 模式
   .\test-admin-automation.ps1 -Verbose

   # 在测试中使用 console.log
   it('should debug', () => {
     console.log('Debug info:', data)
     expect(data).toBeDefined()
   })
   ```

3. **使用 Vitest UI**
   ```bash
   npm run test:ui
   # 在浏览器中查看测试结果和调试
   ```

## 🚀 持续集成

### GitHub Actions 配置

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint:check

      - name: Run type checking
        run: npm run type-check

      - name: Run unit tests
        run: npm run test:unit

      - name: Run integration tests
        run: npm run test:integration

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Generate coverage report
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          file: ./coverage/lcov.info
```

### 本地 CI 模拟

```powershell
# 使用 PowerShell 脚本进行完整测试
.\test-admin-automation.ps1 -Type all -Report -Verbose
```

## 📝 编写测试

### 添加新测试

1. **确定测试类型和位置**
   ```bash
   # 单元测试 -> tests/unit/
   # 集成测试 -> tests/integration/
   # E2E 测试 -> tests/e2e/
   ```

2. **创建测试文件**
   ```typescript
   // tests/unit/components/NewComponent.test.ts
   import { describe, it, expect } from 'vitest'
   import { mount } from '@vue/test-utils'
   import NewComponent from '../../../src/components/NewComponent.vue'

   describe('NewComponent', () => {
     it('should render correctly', () => {
       const wrapper = mount(NewComponent, {
         props: { message: 'Hello' }
       })
       expect(wrapper.text()).toContain('Hello')
     })
   })
   ```

3. **使用测试工具**
   ```typescript
   import { testHelpers } from '../../utils/test-helpers'

   it('should handle user data', () => {
     const user = testHelpers.createUser({ name: 'Test' })
     testHelpers.assertHasProperties(user, ['id', 'name', 'email'])
   })
   ```

### 测试命名约定

- **文件命名**: `ComponentName.test.ts`
- **测试描述**: 使用描述性语言，说明期望的行为
- **测试函数**: 使用 `it('should do something', () => {})`

### Mock 最佳实践

```typescript
// 使用专用 mock 工具
import { createJQueryMock, createElementPlusMock } from '../utils/mocks'

describe('Component with jQuery', () => {
  let jQueryMock: any

  beforeEach(() => {
    jQueryMock = createJQueryMock()
    global.jQuery = jQueryMock
  })

  afterEach(() => {
    delete global.jQuery
  })
})
```

## 🔧 维护指南

### 定期维护任务

1. **更新依赖**: 定期更新 Vitest、Vue Test Utils 等测试依赖
2. **审查覆盖率**: 确保覆盖率不低于阈值
3. **清理废弃测试**: 移除不再相关的测试用例
4. **更新 mocks**: 随着代码变更更新相应的 mocks

### 性能优化

1. **并行运行**: Vitest 默认支持并行测试执行
2. **选择性运行**: 只运行相关的测试文件
3. **Mock 优化**: 使用高效的 mock 实现
4. **缓存策略**: 利用 Vitest 的缓存机制

### 团队协作

1. **代码审查**: 为测试代码设置专门的审查流程
2. **文档同步**: 保持测试文档与实际代码同步
3. **培训**: 确保团队成员了解测试规范和工具使用
4. **反馈循环**: 定期收集测试相关的改进建议
