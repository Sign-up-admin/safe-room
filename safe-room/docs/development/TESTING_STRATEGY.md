---
title: TESTING STRATEGY
version: v1.0.0
last_updated: 2025-11-16
status: active
category: development
---# 测试策略总览

## 📋 目录

- [测试金字塔模型](#测试金字塔模型)
- [测试类型定义](#测试类型定义)
- [覆盖率目标](#覆盖率目标)
- [测试工具链](#测试工具链)
- [CI/CD集成策略](#cicd集成策略)
- [测试环境管理](#测试环境管理)
- [质量门禁](#质量门禁)

## 🏗️ 测试金字塔模型

本项目采用经典的测试金字塔模型，确保不同层次的测试覆盖：

```
     E2E测试 (少量)
    ↗️    ↖️
集成测试 (中等)
    ↗️    ↖️
单元测试 (大量)
```

### 金字塔各层说明

#### 🧩 单元测试 (Unit Tests)
- **位置**: 测试金字塔底部，大量存在
- **目标**: 验证单个函数、组件或类的行为
- **范围**: 函数逻辑、算法、数据转换等
- **工具**: Vitest (前端), JUnit (后端)
- **执行频率**: 每次代码变更
- **执行时间**: < 1秒/测试

#### 🔗 集成测试 (Integration Tests)
- **位置**: 测试金字塔中部，中等数量
- **目标**: 验证组件间的协作和数据流
- **范围**: API调用、数据库操作、服务间通信
- **工具**: MockMvc (后端), Vitest集成测试 (前端)
- **执行频率**: 功能完成后
- **执行时间**: 1-10秒/测试

#### 🌐 端到端测试 (E2E Tests)
- **位置**: 测试金字塔顶部，少量存在
- **目标**: 验证完整用户旅程和业务流程
- **范围**: 完整功能流程、用户交互、跨系统集成
- **工具**: Playwright
- **执行频率**: 发布前
- **执行时间**: 10-60秒/测试

## 📝 测试类型定义

### 前端测试类型

#### 组件单元测试
- **文件位置**: `src/components/**/__tests__/**/*.test.ts`
- **测试内容**: 组件渲染、事件处理、状态管理
- **示例**: 按钮点击、表单验证、状态更新

#### 页面集成测试
- **文件位置**: `src/pages/**/__tests__/**/*.test.ts`
- **测试内容**: 页面完整流程、路由跳转、数据加载
- **示例**: 登录流程、表单提交、页面导航

#### 工具函数测试
- **文件位置**: `src/utils/**/__tests__/**/*.test.ts`
- **测试内容**: 工具函数逻辑、数据处理、辅助方法
- **示例**: 日期格式化、数据验证、API封装

#### E2E测试
- **文件位置**: `tests/e2e/**/*.spec.ts`
- **测试内容**: 完整用户场景、跨页面流程
- **示例**: 用户注册、课程预约、支付流程

### 后端测试类型

#### Controller集成测试
- **文件位置**: `src/test/java/com/controller/**/*ControllerTest.java`
- **测试内容**: API端点、请求响应、异常处理
- **示例**: RESTful API、参数验证、错误响应

#### Service单元测试
- **文件位置**: `src/test/java/com/service/**/*ServiceImplTest.java`
- **测试内容**: 业务逻辑、数据处理、规则验证
- **示例**: 用户注册、课程管理、权限检查

#### DAO集成测试
- **文件位置**: `src/test/java/com/dao/**/*DaoTest.java`
- **测试内容**: 数据库操作、SQL执行、数据映射
- **示例**: CRUD操作、复杂查询、事务处理

#### 工具类测试
- **文件位置**: `src/test/java/com/utils/**/*Test.java`
- **测试内容**: 工具方法、数据转换、辅助功能
- **示例**: JWT处理、密码加密、数据格式化

## 🎯 覆盖率目标

### 当前覆盖率目标 (2025-11-15)

| 测试类型 | 行覆盖率 | 函数覆盖率 | 分支覆盖率 | 指令覆盖率 |
|---------|---------|-----------|-----------|-----------|
| 前端单元测试 | ≥30% | ≥30% | ≥25% | ≥30% |
| 后端单元测试 | ≥60% | ≥60% | ≥50% | ≥60% |
| 整体目标 | ≥45% | ≥45% | ≥40% | ≥45% |

### 长期覆盖率目标 (2026-06-01)

| 测试类型 | 行覆盖率 | 函数覆盖率 | 分支覆盖率 | 指令覆盖率 |
|---------|---------|-----------|-----------|-----------|
| 前端单元测试 | ≥80% | ≥80% | ≥75% | ≥80% |
| 后端单元测试 | ≥80% | ≥80% | ≥70% | ≥80% |
| 集成测试 | ≥70% | ≥70% | ≥60% | ≥70% |
| E2E测试 | ≥50% | ≥50% | ≥40% | ≥50% |
| 整体目标 | ≥75% | ≥75% | ≥70% | ≥75% |

### 覆盖率计算规则

#### 前端覆盖率
- **包含文件**: `src/**/*.{ts,tsx,vue,js,jsx}`
- **排除文件**: 配置文件、类型定义、测试文件、第三方库
- **计算方式**: V8覆盖率引擎，基于AST分析

#### 后端覆盖率
- **包含文件**: `src/main/java/**/*.java`
- **排除文件**: 配置类、实体类、异常类、第三方代码
- **计算方式**: JaCoCo插件，基于字节码插桩

## 🛠️ 测试工具链

### 前端测试工具

#### Vitest - 单元测试框架
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['tests/setup/vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    }
  }
})
```

#### Playwright - E2E测试框架
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:8080',
    browserName: 'chromium',
    headless: true
  }
})
```

#### Vue Test Utils - Vue组件测试
```typescript
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

test('组件渲染测试', () => {
  const wrapper = mount(Component)
  expect(wrapper.text()).toContain('期望文本')
})
```

### 后端测试工具

#### JUnit 5 - 单元测试框架
```java
@SpringBootTest
@ActiveProfiles("test")
class UserServiceTest {

    @Autowired
    private UserService userService;

    @Test
    void shouldCreateUser() {
        // 测试逻辑
    }
}
```

#### MockMvc - Web层集成测试
```java
@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldReturnUser() throws Exception {
        mockMvc.perform(get("/api/users/1"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.name").value("张三"));
    }
}
```

#### JaCoCo - 覆盖率工具
```xml
<!-- pom.xml -->
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.11</version>
    <configuration>
        <rules>
            <rule>
                <element>BUNDLE</element>
                <limits>
                    <limit>
                        <counter>LINE</counter>
                        <value>COVEREDRATIO</value>
                        <minimum>60%</minimum>
                    </limit>
                </limits>
            </rule>
        </rules>
    </configuration>
</plugin>
```

### 测试辅助工具

#### TestUtils - 后端测试数据构建
```java
public class TestUtils {
    public static UserEntity createTestUser() {
        UserEntity user = new UserEntity();
        user.setUsername("testuser");
        user.setPassword("password123");
        return user;
    }
}
```

#### axios-mock-adapter - 前端API Mock
```typescript
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

const mock = new MockAdapter(axios);
mock.onGet('/api/users').reply(200, mockUsers);
```

## 🔄 CI/CD集成策略

### GitHub Actions工作流

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'

      - name: Run Backend Tests
        run: |
          cd springboot1ngh61a2
          mvn test

      - name: Run Frontend Tests
        run: |
          npm run test:unit
          npm run test:e2e

      - name: Upload Coverage
        uses: codecov/codecov-action@v3
```

### 分层测试执行策略

#### 提交时 (Pre-commit)
```bash
# 只运行相关模块的单元测试
npm run test:unit -- --run --reporter=verbose
mvn test -Dtest=UserServiceTest
```

#### 合并前 (Pre-merge)
```bash
# 运行所有单元测试和集成测试
npm run test:unit
npm run test:e2e
mvn test
```

#### 发布前 (Pre-release)
```bash
# 全量测试，包括性能测试
npm run test:all
mvn verify
# 性能测试
npm run test:performance
```

## 🌍 测试环境管理

### 环境分类

#### 单元测试环境
- **数据库**: H2内存数据库
- **外部服务**: WireMock/MockServer
- **配置**: `application-test.yml`

#### 集成测试环境
- **数据库**: PostgreSQL测试实例
- **外部服务**: Docker容器化
- **配置**: `application-integration.yml`

#### E2E测试环境
- **数据库**: 独立PostgreSQL实例
- **应用**: 完整部署栈
- **配置**: `application-e2e.yml`

### 环境隔离策略

#### 数据隔离
```sql
-- 测试数据库使用独立schema
CREATE SCHEMA test AUTHORIZATION test_user;

-- 每个测试方法前清理数据
@Sql(scripts = "/cleanup.sql", executionPhase = BEFORE_TEST_METHOD)
```

#### 配置隔离
```yaml
# application-test.yml
spring:
  profiles:
    active: test
  datasource:
    url: jdbc:h2:mem:testdb
    username: sa
    password:
```

## 🚪 质量门禁

### 代码质量检查

#### 前端质量门禁
```json
// package.json
{
  "scripts": {
    "lint": "eslint src --ext .ts,.tsx,.vue",
    "lint:fix": "eslint src --ext .ts,.tsx,.vue --fix",
    "type-check": "vue-tsc --noEmit",
    "test:coverage:check": "vitest run --coverage --coverage.reporter=json-summary --coverage.thresholds.lines=80"
  }
}
```

#### 后端质量门禁
```xml
<!-- pom.xml -->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-checkstyle-plugin</artifactId>
    <configuration>
        <configLocation>checkstyle.xml</configLocation>
        <failsOnError>true</failsOnError>
    </configuration>
</plugin>
```

### 门禁规则

#### 必须通过的检查
- [ ] 所有单元测试通过
- [ ] 覆盖率达到最低阈值
- [ ] ESLint/Checkstyle无错误
- [ ] TypeScript类型检查通过
- [ ] 安全漏洞扫描通过

#### 可选检查 (警告级别)
- [ ] 性能测试基准
- [ ] 代码复杂度检查
- [ ] 重复代码检测
- [ ] 文档覆盖率

### 质量报告

#### 每日质量报告
- 测试覆盖率趋势
- 代码质量指标
- 性能基准对比
- 失败测试统计

#### 发布质量报告
- 全量测试结果
- 覆盖率详细报告
- 性能测试报告
- 安全扫描报告

---

## 📚 相关文档

- [测试实现指南](TESTING_IMPLEMENTATION.md) - 具体测试编写方法
- [测试最佳实践](TESTING_BEST_PRACTICES.md) - 测试编写规范
- [前端测试指南](../FRONTEND_TESTING_GUIDE.md) - 前端测试详细说明
- [后端测试指南](BACKEND_TESTING_GUIDE.md) - 后端测试详细说明
- [测试代码示例](TESTING_EXAMPLES.md) - 实用测试代码示例
