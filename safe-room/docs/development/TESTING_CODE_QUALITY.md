---
title: TESTING CODE QUALITY
version: v1.0.0
last_updated: 2025-11-17
status: active
category: development
---

# 测试代码质量规范

本文档定义了前端测试代码的质量标准和最佳实践，旨在提升测试代码的可维护性、可读性和稳定性。

## 📋 目录

- [DRY原则在测试中的应用](#dry原则在测试中的应用)
- [测试数据工厂使用指南](#测试数据工厂使用指南)
- [选择器使用最佳实践](#选择器使用最佳实践)
- [测试代码重构示例](#测试代码重构示例)
- [代码质量检查清单](#代码质量检查清单)

## 🎯 DRY原则在测试中的应用

### 什么是DRY原则？

DRY (Don't Repeat Yourself) 原则要求我们避免代码重复，通过抽象和重用减少冗余。

### 测试中的DRY实践

#### 1. 提取重复的测试设置

**❌ 反例：重复的beforeEach代码**
```typescript
// 多个测试文件中的重复代码
test.describe('Some feature', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestEnvironment(page)
    await applyCommonMock(page, SCENARIO_NAMES.SOME_SCENARIO)
    await seedFrontSession(page)
    logTestStep('设置测试环境完成')
  })

  // 测试用例...
})
```

**✅ 正例：使用共享设置函数**
```typescript
// 使用预定义的场景设置
test.describe('Some feature', () => {
  test.beforeEach(async ({ page }) => {
    await setupSomeFeatureScenario(page)
  })

  // 测试用例...
})
```

#### 2. 提取重复的组件挂载配置

**❌ 反例：重复的mount配置**
```typescript
const wrapper = mount(Component, {
  props: { course },
  global: {
    stubs: {
      TechCard: { template: '<div><slot /></div>' },
      TechButton: { template: '<button><slot /></button>' }
    },
    components: { TechButton }
  }
})
```

**✅ 正例：使用共享配置**
```typescript
const mountComponent = createStandardComponentWrapper(Component, {
  TechCard: { template: '<div><slot /></div>' },
  TechButton: { template: '<button><slot /></button>' }
})

const wrapper = mountComponent({ props: { course } })
```

#### 3. 提取重复的测试数据创建

**❌ 反例：硬编码测试数据**
```typescript
const course = {
  id: 1,
  name: 'Test Course',
  price: 100,
  instructor: 'Test Instructor'
}
```

**✅ 正例：使用测试数据工厂**
```typescript
const course = createCourse({
  id: 1,
  kechengmingcheng: 'Test Course',
  jiage: '100'
})
```

## 🏭 测试数据工厂使用指南

### 基本用法

#### 1. 创建单个测试数据
```typescript
import { createUser, createCourse, createBooking } from '../utils/test-data-factory'

// 创建用户
const user = createUser({
  yonghuzhanghao: 'testuser',
  yonghuxingming: '测试用户'
})

// 创建课程
const course = createCourse({
  kechengmingcheng: '瑜伽课程',
  jiage: '99'
})

// 创建预约
const booking = createBooking({
  yonghu_id: user.id,
  kecheng_id: course.id
})
```

#### 2. 使用预设数据
```typescript
import { PRESET_USERS, PRESET_COURSES, PRESET_BOOKINGS } from '../utils/test-data-factory'

const user = PRESET_USERS.testUser
const course = PRESET_COURSES.yogaCourse
const booking = PRESET_BOOKINGS.confirmedBooking
```

#### 3. 使用Builder模式（高级用法）
```typescript
import { UserBuilder, CourseBuilder } from '../utils/test-data-factory'

const customUser = new UserBuilder()
  .withUsername('customuser')
  .withName('自定义用户')
  .withEmail('custom@example.com')
  .build()

const customCourse = new CourseBuilder()
  .withName('高级瑜伽课程')
  .withPrice('199')
  .withType('瑜伽')
  .build()
```

#### 4. 批量创建测试数据
```typescript
import { createUsers, createCourses } from '../utils/test-data-factory'

const users = createUsers(5, { role: 'user' })
const courses = createCourses(10, { kechengleixing: '瑜伽' })
```

### 数据一致性保证

#### 1. 字段类型一致性
确保测试数据与实际API接口字段一致：

```typescript
// ✅ 正例：使用正确的字段名
const user = createUser({
  yonghuzhanghao: 'username',    // 正确的字段名
  yonghuxingming: 'display name', // 正确的字段名
  shoujihaoma: '13800138000'      // 正确的字段名
})

// ❌ 反例：使用错误的字段名
const user = {
  username: 'username',     // 错误：应该是 yonghuzhanghao
  name: 'display name',     // 错误：应该是 yonghuxingming
  phone: '13800138000'      // 错误：应该是 shoujihaoma
}
```

#### 2. 数据格式一致性
```typescript
// ✅ 正例：正确的价格格式
const course = createCourse({
  jiage: '99.00'  // 字符串格式，与API一致
})

// ❌ 反例：错误的价格格式
const course = {
  price: 99  // 错误：应该是字符串格式
}
```

### 测试数据管理最佳实践

#### 1. 按测试场景组织数据
```typescript
// 为特定测试场景创建专用数据
describe('用户登录场景', () => {
  const loginUser = createUser({
    yonghuzhanghao: 'loginuser',
    // ... 其他登录相关字段
  })

  // 使用 loginUser 进行登录测试
})
```

#### 2. 避免测试间数据耦合
```typescript
// ✅ 正例：每个测试使用独立数据
describe('用户管理', () => {
  it('创建用户', () => {
    const user = createUser({ yonghuzhanghao: 'user1' })
    // 测试用户创建逻辑
  })

  it('更新用户', () => {
    const user = createUser({ yonghuzhanghao: 'user2' })
    // 测试用户更新逻辑
  })
})

// ❌ 反例：测试间共享数据可能导致耦合
let sharedUser
describe('用户管理', () => {
  beforeAll(() => {
    sharedUser = createUser()
  })

  it('创建用户', () => { /* 使用 sharedUser */ })
  it('更新用户', () => { /* 修改 sharedUser */ })
})
```

## 🎯 选择器使用最佳实践

### 选择器优先级

#### 1. 最高优先级：data-testid属性
```typescript
// ✅ 推荐：使用data-testid
await page.getByTestId('login-submit-button').click()
await page.getByTestId(selectors.login.submitButton()).click()

// HTML中对应的元素
<button data-testid="login-submit-button">登录</button>
```

#### 2. 中等优先级：语义化选择器
```typescript
// ✅ 推荐：使用角色和标签
await page.getByRole('button', { name: '登录' }).click()
await page.getByLabel('用户名').fill('testuser')
await page.getByPlaceholder('请输入密码').fill('password')
```

#### 3. 低优先级：稳定的CSS属性选择器
```typescript
// ⚠️ 谨慎使用：稳定的CSS属性
await page.locator('input[type="email"]').fill('test@example.com')
await page.locator('button[type="submit"]').click()
```

#### 4. 最低优先级：不稳定的选择器（避免使用）
```typescript
// ❌ 避免：不稳定的类名
await page.locator('.btn-primary').click()
await page.locator('.login-form input').fill('test')

// ❌ 避免：基于文本的选择器
await page.locator('text=登录').click()

// ❌ 避免：基于位置的选择器
await page.locator('nth=0').click()
```

### 选择器稳定性评估

#### 稳定的选择器特征：
- 使用`data-testid`属性
- 使用语义化的`role`、`aria-label`等属性
- 使用稳定的HTML属性（如`type`、`placeholder`）

#### 不稳定的选择器特征：
- 使用CSS类名（样式变更时会改变）
- 使用文本内容（国际化时会改变）
- 使用DOM结构位置（布局变更时会改变）

### 选择器迁移策略

#### 1. 识别现有问题选择器
```typescript
// 扫描测试代码中的问题选择器
const problematicSelectors = [
  page.locator('.course-card'),      // CSS类选择器
  page.locator('text=预约'),         // 文本选择器
  page.locator('.btn').first(),      // 位置选择器
]
```

#### 2. 替换为稳定的选择器
```typescript
// 替换为稳定的data-testid选择器
await page.getByTestId(selectors.courses.courseCard(courseId)).click()
await page.getByTestId(selectors.booking.confirmButton()).click()
```

#### 3. 渐进式迁移
```typescript
// 第一阶段：保持兼容，优先使用稳定选择器
const bookButton = page.getByTestId(selectors.courses.bookButton(id))
  .or(page.locator('.course-card .book-btn'))
await bookButton.click()

// 第二阶段：完全迁移到稳定选择器
await page.getByTestId(selectors.courses.bookButton(id)).click()
```

## 🔄 测试代码重构示例

### 示例1：重构重复的单元测试

**重构前：**
```typescript
describe('CourseCard', () => {
  it('renders course info', () => {
    const course = {
      id: 1,
      kechengmingcheng: 'Test Course',
      jiage: '100'
    }

    const wrapper = mount(CourseCard, {
      props: { course },
      global: {
        stubs: {
          TechCard: { template: '<div><slot /></div>' },
          TechButton: { template: '<button><slot /></button>' }
        }
      }
    })

    expect(wrapper.text()).toContain('Test Course')
  })

  it('handles empty data', () => {
    const course = {
      id: 2,
      kechengmingcheng: ''
    }

    const wrapper = mount(CourseCard, {
      props: { course },
      global: {
        stubs: {
          TechCard: { template: '<div><slot /></div>' },
          TechButton: { template: '<button><slot /></button>' }
        }
      }
    })

    expect(wrapper.exists()).toBe(true)
  })
})
```

**重构后：**
```typescript
import { createStandardComponentWrapper } from '../utils/unit-test-config'
import { createCourse } from '../utils/test-data-factory'

const mountCourseCard = createStandardComponentWrapper(CourseCard, {
  TechCard: { template: '<div><slot /></div>' },
  TechButton: { template: '<button><slot /></button>' }
})

describe('CourseCard', () => {
  it('renders course info', () => {
    const course = createCourse({
      kechengmingcheng: 'Test Course',
      jiage: '100'
    })

    const wrapper = mountCourseCard({ props: { course } })

    expect(wrapper.text()).toContain('Test Course')
  })

  it('handles empty data', () => {
    const course = createCourse({
      kechengmingcheng: ''
    })

    const wrapper = mountCourseCard({ props: { course } })

    expect(wrapper.exists()).toBe(true)
  })
})
```

### 示例2：重构重复的E2E测试设置

**重构前：**
```typescript
test.describe('预约流程', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestEnvironment(page)
    await applyCommonMock(page, SCENARIO_NAMES.COMPLETE_BOOKING_JOURNEY)
    await seedFrontSession(page)
    logTestStep('设置预约流程测试环境完成')
  })

  // 测试用例...
})

test.describe('课程管理', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestEnvironment(page)
    await applyCommonMock(page, SCENARIO_NAMES.COURSE_DETAIL_SUCCESS)
    await seedFrontSession(page)
    logTestStep('设置课程管理测试环境完成')
  })

  // 测试用例...
})
```

**重构后：**
```typescript
import { setupBookingScenario, setupCourseManagementScenario } from '../utils/e2e-test-setup'

test.describe('预约流程', () => {
  test.beforeEach(async ({ page }) => {
    await setupBookingScenario(page)
  })

  // 测试用例...
})

test.describe('课程管理', () => {
  test.beforeEach(async ({ page }) => {
    await setupCourseManagementScenario(page)
  })

  // 测试用例...
})
```

### 示例3：选择器稳定性改进

**重构前：**
```typescript
// 不稳定的CSS选择器
await page.locator('.course-card').first().click()
await page.locator('.avatar, .user-avatar, .profile-pic').click()
await page.locator('.booking-item, .reservation-item').count()
```

**重构后：**
```typescript
// 稳定的data-testid选择器
await page.getByTestId(selectors.courses.courseCard(courseId)).click()
await page.getByTestId(selectors.profile.avatar()).click()
const bookingCount = await page.getByTestId(/^booking-item-/).count()
```

## ✅ 代码质量检查清单

### 单元测试质量检查

- [ ] 是否使用了共享的mount配置函数？
- [ ] 是否使用了测试数据工厂创建测试数据？
- [ ] 是否避免了硬编码的测试对象？
- [ ] 是否添加了适当的测试文件头部注释？
- [ ] 是否使用了beforeEach/afterEach进行适当的清理？

### E2E测试质量检查

- [ ] 是否使用了场景化的测试设置函数？
- [ ] 是否优先使用了data-testid选择器？
- [ ] 是否避免了不稳定的CSS类选择器？
- [ ] 是否添加了适当的测试步骤日志？
- [ ] 是否使用了稳定的等待策略？

### 代码结构质量检查

- [ ] 是否遵循了DRY原则，避免重复代码？
- [ ] 是否正确分离了测试数据、配置和逻辑？
- [ ] 是否提供了清晰的错误消息和断言？
- [ ] 是否使用了类型安全的测试工具？

### 可维护性检查

- [ ] 测试代码是否易于理解和修改？
- [ ] 是否提供了足够的文档和注释？
- [ ] 是否使用了一致的命名约定？
- [ ] 是否便于其他开发者贡献？

## 📚 相关文档

- [测试策略总览](../TESTING_STRATEGY.md)
- [测试最佳实践](../TESTING_BEST_PRACTICES.md)
- [E2E测试ID使用规范](../E2E_TEST_ID_GUIDELINES.md)
- [测试数据工厂](../utils/test-data-factory.ts)
- [测试选择器](../utils/selectors.ts)

---

*最后更新：2025-11-17*
