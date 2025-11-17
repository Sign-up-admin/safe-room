---
title: TESTING BEST PRACTICES
version: v1.0.0
last_updated: 2025-11-16
status: active
category: development
---# 测试最佳实践

## 📋 目录

- [测试命名规范](#测试命名规范)
- [测试组织结构](#测试组织结构)
- [测试数据管理](#测试数据管理)
- [测试隔离原则](#测试隔离原则)
- [性能测试指南](#性能测试指南)
- [测试维护策略](#测试维护策略)
- [代码审查清单](#代码审查清单)

## 📝 测试命名规范

### 命名原则

#### 1. 描述性命名
```typescript
// ✅ 好的命名
describe('UserProfile', () => {
  it('should display user name and email', () => {
    // 测试逻辑
  })

  it('should update profile when form is submitted', () => {
    // 测试逻辑
  })
})

// ❌ 不好的命名
describe('UserProfile test', () => {
  it('test1', () => {
    // 测试逻辑
  })

  it('should work', () => {
    // 测试逻辑
  })
})
```

#### 2. 行为导向命名
```java
// ✅ 好的命名 - 描述行为
@Test
void shouldReturnUserWhenValidIdProvided() {
    // 测试逻辑
}

@Test
void shouldThrowExceptionWhenUserNotFound() {
    // 测试逻辑
}

@Test
void shouldCalculateTotalPriceIncludingTax() {
    // 测试逻辑
}

// ❌ 不好的命名 - 描述实现
@Test
void testGetUser() {
    // 测试逻辑
}

@Test
void userServiceTest() {
    // 测试逻辑
}
```

### 命名模式

#### 前端测试命名
```typescript
// 组件测试
describe('ComponentName', () => {
  describe('when prop is provided', () => {
    it('should render correctly', () => {
      // 测试逻辑
    })
  })

  describe('when user interacts', () => {
    it('should emit event', () => {
      // 测试逻辑
    })
  })
})

// 页面测试
describe('PageName Page', () => {
  describe('navigation', () => {
    it('should navigate to correct route', () => {
      // 测试逻辑
    })
  })

  describe('data loading', () => {
    it('should display loading state', () => {
      // 测试逻辑
    })
  })
})

// 组合式函数测试
describe('useComposableName', () => {
  describe('initialization', () => {
    it('should return default values', () => {
      // 测试逻辑
    })
  })

  describe('data fetching', () => {
    it('should handle success response', () => {
      // 测试逻辑
    })

    it('should handle error response', () => {
      // 测试逻辑
    })
  })
})
```

#### 后端测试命名
```java
// Controller测试
class UserControllerTest {

    @Test
    void shouldReturnUser_WhenValidIdProvided() {
        // 测试逻辑
    }

    @Test
    void shouldReturnNotFound_WhenUserDoesNotExist() {
        // 测试逻辑
    }

    @Test
    void shouldCreateUser_WhenValidDataProvided() {
        // 测试逻辑
    }
}

// Service测试
class UserServiceTest {

    @Test
    void shouldCreateUserSuccessfully() {
        // 测试逻辑
    }

    @Test
    void shouldThrowException_WhenUsernameAlreadyExists() {
        // 测试逻辑
    }

    @Test
    void shouldUpdateUser_WhenUserExists() {
        // 测试逻辑
    }
}

// Repository测试
class UserRepositoryTest {

    @Test
    void shouldFindUserByUsername() {
        // 测试逻辑
    }

    @Test
    void shouldReturnEmptyOptional_WhenUserNotFound() {
        // 测试逻辑
    }
}
```

## 📁 测试组织结构

### 文件结构规范

#### 前端测试结构
```
src/
├── components/
│   ├── Button/
│   │   ├── Button.vue
│   │   ├── Button.test.ts          # 组件测试
│   │   └── __tests__/              # 备选结构
│   │       └── Button.test.ts
│   └── Form/
│       ├── Form.vue
│       ├── Form.test.ts
│       └── Form.spec.ts            # 备选命名
├── composables/
│   ├── useAuth.ts
│   ├── useAuth.test.ts             # 组合式函数测试
│   └── __tests__/
│       └── useAuth.test.ts
├── utils/
│   ├── dateUtils.ts
│   └── dateUtils.test.ts           # 工具函数测试
└── pages/
    ├── Login/
    │   ├── Login.vue
    │   └── Login.test.ts           # 页面测试
    └── Dashboard/
        ├── Dashboard.vue
        └── Dashboard.test.ts

tests/
├── unit/                           # 单元测试
│   ├── components/
│   ├── composables/
│   └── utils/
├── integration/                    # 集成测试
│   ├── pages/
│   └── workflows/
├── e2e/                            # 端到端测试
│   ├── auth/
│   │   └── login.spec.ts
│   ├── pages/
│   └── workflows/
├── setup/                          # 测试配置
│   ├── vitest.setup.ts
│   └── test-utils.ts
└── fixtures/                       # 测试数据
    ├── users.json
    └── courses.json
```

#### 后端测试结构
```
src/test/java/com/
├── AbstractTestBase.java           # 基础测试类
├── controller/                     # Controller测试
│   ├── UserControllerTest.java
│   ├── CourseControllerTest.java
│   └── AbstractControllerTest.java
├── service/                        # Service测试
│   ├── UserServiceTest.java
│   ├── CourseServiceTest.java
│   └── AbstractServiceTest.java
├── dao/                           # DAO测试
│   ├── UserDaoTest.java
│   ├── CourseDaoTest.java
│   └── AbstractDaoTest.java
├── integration/                   # 集成测试
│   ├── UserRegistrationFlowTest.java
│   └── CourseBookingFlowTest.java
├── utils/                         # 测试工具类
│   ├── TestUtils.java
│   ├── TestDataFactory.java
│   └── TestDataCleanup.java
└── resources/                     # 测试资源
    ├── application-test.yml
    ├── test-data.sql
    ├── test-schema.sql
    └── cleanup.sql
```

### 测试分组和标签

#### JUnit 5标签使用
```java
// 按测试类型分组
@Tag("unit")
class UserServiceTest {
    // 单元测试
}

@Tag("integration")
@SpringBootTest
class UserIntegrationTest {
    // 集成测试
}

@Tag("slow")
class PerformanceTest {
    // 性能测试
}

// 按业务模块分组
@Tag("user-management")
class UserTests {
    // 用户相关测试
}

@Tag("course-management")
class CourseTests {
    // 课程相关测试
}
```

#### Maven配置文件
```xml
<!-- pom.xml -->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <configuration>
        <groups>unit</groups>  <!-- 默认运行单元测试 -->
        <excludedGroups>slow</excludedGroups>  <!-- 排除慢速测试 -->
    </configuration>
</plugin>
```

## 🗂️ 测试数据管理

### 测试数据原则

#### 1. 数据隔离
```java
// 使用独立的测试数据库
@SpringBootTest
@ActiveProfiles("test")
@Sql(scripts = "/test-data.sql", executionPhase = BEFORE_TEST_METHOD)
@Sql(scripts = "/cleanup.sql", executionPhase = AFTER_TEST_METHOD)
class UserServiceTest {
    // 每个测试都有干净的数据环境
}
```

#### 2. 最小化测试数据
```sql
-- test-data.sql - 只包含必要数据
INSERT INTO users (id, username, email, password) VALUES
(1, 'testuser', 'test@example.com', 'hashedpassword'),
(2, 'admin', 'admin@example.com', 'hashedpassword');

INSERT INTO roles (id, name) VALUES
(1, 'USER'),
(2, 'ADMIN');
```

#### 3. 使用Builder模式创建测试数据
```java
// TestDataBuilder.java
public class TestDataBuilder {
    public static UserEntity.UserEntityBuilder aUser() {
        return UserEntity.builder()
            .username("testuser")
            .email("test@example.com")
            .password("password123")
            .createdAt(LocalDateTime.now());
    }

    public static CourseEntity.CourseEntityBuilder aCourse() {
        return CourseEntity.builder()
            .name("测试课程")
            .description("课程描述")
            .price(BigDecimal.valueOf(99.00))
            .instructorId(1L);
    }
}

// 使用示例
@Test
void shouldCreateUser() {
    UserEntity user = TestDataBuilder.aUser()
        .username("johndoe")
        .build();

    // 测试逻辑
}
```

### 数据清理策略

#### 1. 自动清理
```java
@Component
public class TestDataCleanup {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @AfterEach
    void cleanup() {
        // 清理测试数据
        jdbcTemplate.execute("""
            TRUNCATE TABLE bookings, courses, users
            RESTART IDENTITY CASCADE
        """);
    }
}
```

#### 2. 条件化清理
```java
@Test
@Sql(scripts = "/cleanup-specific-tables.sql",
      executionPhase = AFTER_TEST_METHOD)
void shouldTestComplexBusinessLogic() {
    // 测试逻辑 - 只清理相关表
}
```

## 🔒 测试隔离原则

### 依赖隔离

#### 1. Mock外部依赖
```java
@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @InjectMocks
    private EmailService emailService;

    @Mock
    private JavaMailSender mailSender;

    @Test
    void shouldSendEmailSuccessfully() {
        // Given
        doNothing().when(mailSender).send(any(SimpleMailMessage.class));

        // When
        emailService.sendWelcomeEmail("user@example.com", "John");

        // Then
        verify(mailSender).send(any(SimpleMailMessage.class));
    }
}
```

#### 2. 使用TestContainers
```java
@SpringBootTest
@Testcontainers
class DatabaseIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    // 测试使用真实的数据库容器
}
```

### 时间相关测试

#### 1. 固定时间测试
```java
@Test
void shouldCalculateExpiryDate() {
    // Given
    LocalDateTime fixedTime = LocalDateTime.of(2024, 1, 1, 10, 0);
    Clock fixedClock = Clock.fixed(fixedTime.toInstant(ZoneOffset.UTC), ZoneId.systemDefault());

    MembershipService service = new MembershipService(fixedClock);

    // When
    LocalDateTime expiryDate = service.calculateExpiryDate(30);

    // Then
    assertThat(expiryDate).isEqualTo(LocalDateTime.of(2024, 1, 31, 10, 0));
}
```

#### 2. 时间Mock
```typescript
import { vi } from 'vitest'

describe('Time-dependent logic', () => {
  beforeEach(() => {
    // Mock Date
    const mockDate = new Date('2024-01-01T10:00:00Z')
    vi.useFakeTimers()
    vi.setSystemTime(mockDate)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should calculate expiry date correctly', () => {
    const result = calculateExpiryDate(30)
    expect(result).toEqual(new Date('2024-01-31T10:00:00Z'))
  })
})
```

### 随机性控制

#### 1. 固定随机种子
```java
@Test
void shouldGenerateConsistentRandomValues() {
    // Given
    Random random = new Random(42); // 固定种子
    RandomService service = new RandomService(random);

    // When
    int value1 = service.generateRandomNumber();
    int value2 = service.generateRandomNumber();

    // Then
    // 每次运行结果都相同
    assertThat(value1).isEqualTo(expectedValue1);
    assertThat(value2).isEqualTo(expectedValue2);
}
```

#### 2. 可预测的ID生成
```java
@Component
@Profile("test")
public class TestIdGenerator implements IdGenerator {

    private AtomicLong counter = new AtomicLong(1000);

    @Override
    public Long generateId() {
        return counter.incrementAndGet();
    }
}
```

## ⚡ 性能测试指南

### 单元测试性能优化

#### 1. 避免慢操作
```java
// ❌ 慢速测试
@Test
void shouldWaitForTimeout() throws InterruptedException {
    Thread.sleep(5000); // 不要在单元测试中这样做
    // 测试逻辑
}

// ✅ 快速测试
@Test
void shouldHandleTimeout() {
    // 使用Mockito模拟超时
    when(asyncService.callWithTimeout()).thenThrow(new TimeoutException());

    assertThrows(TimeoutException.class, () -> {
        service.processWithTimeout();
    });
}
```

#### 2. 批量数据测试
```java
@Test
void shouldHandleLargeDataset() {
    // Given - 使用内存数据而非数据库
    List<User> users = TestDataFactory.createUsers(1000);

    // When
    List<String> emails = userService.extractEmails(users);

    // Then
    assertThat(emails).hasSize(1000);
}
```

### 集成测试性能

#### 1. 并行测试执行
```xml
<!-- pom.xml -->
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <configuration>
        <parallel>classes</parallel>
        <threadCount>4</threadCount>
        <perCoreThreadCount>false</perCoreThreadCount>
    </configuration>
</plugin>
```

#### 2. 选择性测试执行
```java
@Tag("fast")
@SpringBootTest
class FastIntegrationTest {
    // 快速集成测试
}

@Tag("slow")
@SpringBootTest
class SlowIntegrationTest {
    // 慢速集成测试，只在需要时运行
}
```

### E2E测试性能

#### 1. 页面对象模式
```typescript
// pages/LoginPage.ts
export class LoginPage {
  private page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goto() {
    await this.page.goto('/login', { waitUntil: 'networkidle' })
  }

  async login(username: string, password: string) {
    await this.page.fill('[data-test="username"]', username)
    await this.page.fill('[data-test="password"]', password)
    await Promise.all([
      this.page.click('[data-test="submit"]'),
      this.page.waitForNavigation({ waitUntil: 'networkidle' })
    ])
  }
}
```

#### 2. 共享浏览器上下文
```typescript
// global-setup.ts
import { chromium, Browser, BrowserContext } from 'playwright'

let browser: Browser
let context: BrowserContext

export async function setup() {
  browser = await chromium.launch()
  context = await browser.newContext({
    // 共享认证状态
    storageState: 'auth-storage.json'
  })
}

export async function teardown() {
  await context.close()
  await browser.close()
}
```

## 🔧 测试维护策略

### 测试代码质量保证

#### 1. 测试代码审查
```typescript
// ✅ 好的测试结构
describe('UserService', () => {
  let service: UserService
  let mockRepo: jest.Mocked<UserRepository>

  beforeEach(() => {
    mockRepo = createMock<UserRepository>()
    service = new UserService(mockRepo)
  })

  describe('createUser', () => {
    it('should create user successfully', async () => {
      // Given
      const userData = { name: 'John', email: 'john@example.com' }
      mockRepo.save.mockResolvedValue({ id: 1, ...userData })

      // When
      const result = await service.createUser(userData)

      // Then
      expect(result.id).toBe(1)
      expect(mockRepo.save).toHaveBeenCalledWith(userData)
    })

    it('should throw error when email exists', async () => {
      // Given
      mockRepo.findByEmail.mockResolvedValue({ id: 1, email: 'john@example.com' })

      // When & Then
      await expect(service.createUser({ email: 'john@example.com' }))
        .rejects.toThrow('Email already exists')
    })
  })
})
```

#### 2. 测试重构时机
- 当生产代码重构时，同时重构测试
- 当发现测试难以理解时，进行重构
- 当添加新功能时，检查是否需要新的测试模式
- 当测试运行缓慢时，优化测试实现

### 测试债务管理

#### 1. 识别测试债务
```typescript
// ❌ 测试债务示例 - 脆弱的测试
it('should work', () => {
  const wrapper = mount(Component)
  expect(wrapper.html()).toContain('some text')
})

// ✅ 重构后的测试
it('should display welcome message', () => {
  const wrapper = mount(Component, {
    props: { showWelcome: true }
  })
  expect(wrapper.get('[data-test="welcome-message"]').text())
    .toBe('Welcome!')
})
```

#### 2. 测试债务优先级
1. **高优先级**: 经常失败的测试、阻塞CI的测试
2. **中优先级**: 运行缓慢的测试、覆盖率不足的测试
3. **低优先级**: 代码重复的测试、命名不规范的测试

### 测试演进策略

#### 1. 渐进式改进
```typescript
// 第1阶段：基本功能测试
it('should create user', () => {
  const user = service.createUser(validData)
  expect(user).toBeDefined()
})

// 第2阶段：添加边界条件
it('should create user with valid data', () => {
  const user = service.createUser(validData)
  expect(user.name).toBe(validData.name)
  expect(user.email).toBe(validData.email)
})

it('should reject invalid email', () => {
  expect(() => service.createUser(invalidEmailData))
    .toThrow(ValidationError)
})

// 第3阶段：完整的测试覆盖
it('should create user successfully', () => {
  // Given
  mockRepo.save.mockResolvedValue(expectedUser)

  // When
  const result = service.createUser(validData)

  // Then
  expect(result).toEqual(expectedUser)
  expect(mockRepo.save).toHaveBeenCalledWith(validData)
})
```

#### 2. 测试现代化
- 从简单断言迁移到描述性断言
- 使用页面对象模式改进E2E测试
- 引入测试数据工厂减少重复
- 使用TypeScript增强测试类型安全

## ✅ 代码审查清单

### 前端测试审查要点

#### 结构和组织
- [ ] 测试文件是否放在正确的位置？
- [ ] 是否使用了describe/it的正确嵌套结构？
- [ ] 测试命名是否清晰描述了测试内容？
- [ ] 是否有适当的测试分组和标签？

#### 测试质量
- [ ] 是否测试了所有重要的用户交互？
- [ ] 是否包含了边界条件和错误情况？
- [ ] 是否使用了适当的断言库特性？
- [ ] 是否避免了脆弱的选择器？

#### 最佳实践
- [ ] 是否正确Mock了外部依赖？
- [ ] 是否清理了测试后的副作用？
- [ ] 是否使用了data-test属性进行选择？
- [ ] 是否考虑了异步操作的测试？

### 后端测试审查要点

#### 测试设计
- [ ] 是否正确区分了单元测试和集成测试？
- [ ] 是否使用了适当的测试替身(Mock/Stub)？
- [ ] 是否测试了异常情况和边界条件？
- [ ] 是否避免了测试之间的耦合？

#### 代码质量
- [ ] 测试代码是否易于理解和维护？
- [ ] 是否使用了流畅的断言API？
- [ ] 是否正确处理了异步操作？
- [ ] 是否有适当的测试数据管理？

#### 性能考虑
- [ ] 测试是否运行足够快？
- [ ] 是否避免了不必要的数据库操作？
- [ ] 是否使用了内存数据库进行单元测试？
- [ ] 是否并行化了独立的测试？

### 通用审查要点

#### 文档和维护
- [ ] 测试是否都有清晰的注释？
- [ ] 是否记录了测试的意图和范围？
- [ ] 是否有TODO注释标记需要改进的地方？
- [ ] 是否定期review和更新测试？

#### CI/CD集成
- [ ] 测试是否集成到CI/CD流水线？
- [ ] 是否设置了适当的质量门禁？
- [ ] 是否监控了测试执行时间和失败率？
- [ ] 是否有适当的测试报告生成？

---

## 📚 相关文档

- [测试策略总览](TESTING_STRATEGY.md) - 测试策略和目标
- [测试实现指南](TESTING_IMPLEMENTATION.md) - 具体测试编写方法
- [前端测试指南](../FRONTEND_TESTING_GUIDE.md) - 前端测试详细说明
- [后端测试指南](BACKEND_TESTING_GUIDE.md) - 后端测试详细说明
- [测试代码示例](TESTING_EXAMPLES.md) - 实用测试代码示例
