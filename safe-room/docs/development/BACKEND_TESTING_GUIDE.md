---
title: BACKEND TESTING GUIDE
version: v1.0.0
last_updated: 2025-11-16
status: active
category: development
---# 后端测试指南

## 📋 目录

- [测试框架概述](#测试框架概述)
- [Controller测试实现](#controller测试实现)
- [Service层测试实现](#service层测试实现)
- [DAO层测试实现](#dao层测试实现)
- [测试工具类使用](#测试工具类使用)
- [测试数据管理](#测试数据管理)
- [集成测试实现](#集成测试实现)
- [测试配置和执行](#测试配置和执行)
- [覆盖率报告和分析](#覆盖率报告和分析)

## 🏗️ 测试框架概述

### 测试技术栈

本项目采用以下测试技术栈：

| 组件 | 技术 | 版本 | 用途 |
|------|------|------|------|
| **测试框架** | JUnit 5 | 5.10+ | 单元测试和集成测试 |
| **断言库** | AssertJ | 3.24+ | 流畅断言API |
| **Mock框架** | Mockito | 5.7+ | 创建测试替身 |
| **Web测试** | Spring MockMvc | - | Controller层测试 |
| **覆盖率** | JaCoCo | 0.8.11 | 代码覆盖率分析 |
| **数据库** | H2/TestContainers | - | 测试数据库 |

### 测试分类

#### 1. 单元测试 (Unit Tests)
- **范围**: 单个类或方法
- **依赖**: 使用Mockito Mock所有外部依赖
- **数据库**: 不涉及真实数据库操作
- **执行**: 快速，< 100ms/测试

#### 2. 集成测试 (Integration Tests)
- **范围**: 组件间协作
- **依赖**: 使用真实的依赖实现
- **数据库**: 使用H2内存数据库或TestContainers
- **执行**: 中等速度，100ms-2s/测试

#### 3. 端到端测试 (E2E Tests)
- **范围**: 完整业务流程
- **依赖**: 完整应用栈
- **数据库**: 独立测试数据库实例
- **执行**: 较慢，> 2s/测试

## 🎯 Controller测试实现

### 基础Controller测试结构

#### 1. 抽象基类设计

```java
// src/test/java/com/AbstractControllerTest.java
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public abstract class AbstractControllerTest {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    protected TestUtils testUtils;

    protected String performGet(String url) throws Exception {
        return mockMvc.perform(get(url))
                     .andExpect(status().isOk())
                     .andReturn()
                     .getResponse()
                     .getContentAsString();
    }

    protected String performPost(String url, Object body) throws Exception {
        return mockMvc.perform(post(url)
                     .contentType(MediaType.APPLICATION_JSON)
                     .content(objectMapper.writeValueAsString(body)))
                     .andExpect(status().isOk())
                     .andReturn()
                     .getResponse()
                     .getContentAsString();
    }

    protected String performPut(String url, Object body) throws Exception {
        return mockMvc.perform(put(url)
                     .contentType(MediaType.APPLICATION_JSON)
                     .content(objectMapper.writeValueAsString(body)))
                     .andExpect(status().isOk())
                     .andReturn()
                     .getResponse()
                     .getContentAsString();
    }

    protected void performDelete(String url) throws Exception {
        mockMvc.perform(delete(url))
               .andExpect(status().isOk());
    }
}
```

#### 2. 具体Controller测试实现

```java
// src/test/java/com/controller/UserControllerTest.java
@WebMvcTest(UserController.class)
@WithMockUser
public class UserControllerTest extends AbstractControllerTest {

    @Autowired
    private UserController userController;

    @MockBean
    private UserService userService;

    @Test
    void shouldReturnUser_WhenValidIdProvided() throws Exception {
        // Given
        Long userId = 1L;
        UserDTO expectedUser = testUtils.createTestUserDTO();
        when(userService.getUserById(userId)).thenReturn(expectedUser);

        // When & Then
        mockMvc.perform(get("/api/users/{id}", userId))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.id").value(userId))
               .andExpect(jsonPath("$.username").value(expectedUser.getUsername()))
               .andExpect(jsonPath("$.email").value(expectedUser.getEmail()));
    }

    @Test
    void shouldReturnNotFound_WhenUserDoesNotExist() throws Exception {
        // Given
        Long nonExistentId = 999L;
        when(userService.getUserById(nonExistentId))
            .thenThrow(new UserNotFoundException("用户不存在"));

        // When & Then
        mockMvc.perform(get("/api/users/{id}", nonExistentId))
               .andExpect(status().isNotFound())
               .andExpect(jsonPath("$.code").value(404))
               .andExpect(jsonPath("$.msg").value("用户不存在"));
    }

    @Test
    void shouldCreateUser_WhenValidDataProvided() throws Exception {
        // Given
        UserCreateRequest request = testUtils.createUserCreateRequest();
        UserDTO expectedResponse = testUtils.createTestUserDTO();
        when(userService.createUser(request)).thenReturn(expectedResponse);

        // When & Then
        mockMvc.perform(post("/api/users")
                       .contentType(MediaType.APPLICATION_JSON)
                       .content(objectMapper.writeValueAsString(request)))
               .andExpect(status().isCreated())
               .andExpect(jsonPath("$.id").exists())
               .andExpect(jsonPath("$.username").value(request.getUsername()));
    }

    @Test
    void shouldReturnBadRequest_WhenValidationFails() throws Exception {
        // Given
        UserCreateRequest invalidRequest = UserCreateRequest.builder()
            .username("") // 无效的用户名
            .email("invalid-email") // 无效的邮箱
            .build();

        // When & Then
        mockMvc.perform(post("/api/users")
                       .contentType(MediaType.APPLICATION_JSON)
                       .content(objectMapper.writeValueAsString(invalidRequest)))
               .andExpect(status().isBadRequest())
               .andExpect(jsonPath("$.code").value(400));
    }
}
```

### 分页测试实现

```java
// src/test/java/com/controller/CourseControllerTest.java
@WebMvcTest(CourseController.class)
@WithMockUser
public class CourseControllerTest extends AbstractControllerTest {

    @MockBean
    private CourseService courseService;

    @Test
    void shouldReturnPaginatedCourses_WhenValidParamsProvided() throws Exception {
        // Given
        PageRequest pageRequest = PageRequest.of(0, 10);
        List<CourseDTO> courses = testUtils.createTestCourses(5);
        Page<CourseDTO> coursePage = new PageImpl<>(courses, pageRequest, 25);

        when(courseService.getCourses(any(PageRequest.class), any(CourseQuery.class)))
            .thenReturn(coursePage);

        // When & Then
        mockMvc.perform(get("/api/courses")
                       .param("page", "0")
                       .param("limit", "10")
                       .param("name", "瑜伽"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.list").isArray())
               .andExpect(jsonPath("$.list.length()").value(5))
               .andExpect(jsonPath("$.total").value(25))
               .andExpect(jsonPath("$.page").value(0))
               .andExpect(jsonPath("$.limit").value(10));
    }
}
```

### 文件上传测试

```java
// src/test/java/com/controller/FileControllerTest.java
@WebMvcTest(FileController.class)
@WithMockUser
public class FileControllerTest extends AbstractControllerTest {

    @MockBean
    private FileService fileService;

    @Test
    void shouldUploadFileSuccessfully() throws Exception {
        // Given
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "test.jpg",
            "image/jpeg",
            "test image content".getBytes()
        );

        FileUploadResponse expectedResponse = FileUploadResponse.builder()
            .fileId("file_123")
            .filename("test.jpg")
            .url("/uploads/test.jpg")
            .build();

        when(fileService.uploadFile(any(MultipartFile.class), anyString()))
            .thenReturn(expectedResponse);

        // When & Then
        mockMvc.perform(multipart("/api/files/upload")
                       .file(file)
                       .param("category", "avatar"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.fileId").value("file_123"))
               .andExpect(jsonPath("$.filename").value("test.jpg"))
               .andExpect(jsonPath("$.url").value("/uploads/test.jpg"));
    }
}
```

## 🔧 Service层测试实现

### 单元测试模式

#### 1. 基础Service测试

```java
// src/test/java/com/service/UserServiceImplTest.java
@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @InjectMocks
    private UserServiceImpl userService;

    @Mock
    private UserDao userDao;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private NotificationService notificationService;

    @Test
    void shouldCreateUserSuccessfully() {
        // Given
        UserCreateRequest request = UserCreateRequest.builder()
            .username("testuser")
            .email("test@example.com")
            .password("password123")
            .build();

        UserEntity savedEntity = UserEntity.builder()
            .id(1L)
            .username("testuser")
            .email("test@example.com")
            .password("encoded_password")
            .build();

        when(passwordEncoder.encode("password123")).thenReturn("encoded_password");
        when(userDao.insert(any(UserEntity.class))).thenReturn(1);
        when(userDao.selectById(1L)).thenReturn(savedEntity);

        // When
        UserDTO result = userService.createUser(request);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getUsername()).isEqualTo("testuser");
        assertThat(result.getEmail()).isEqualTo("test@example.com");

        verify(userDao).insert(any(UserEntity.class));
        verify(notificationService).sendWelcomeNotification(anyString(), anyString());
    }

    @Test
    void shouldThrowException_WhenUsernameAlreadyExists() {
        // Given
        UserCreateRequest request = UserCreateRequest.builder()
            .username("existinguser")
            .email("test@example.com")
            .password("password123")
            .build();

        when(userDao.selectByUsername("existinguser"))
            .thenReturn(new UserEntity()); // 用户已存在

        // When & Then
        assertThatThrownBy(() -> userService.createUser(request))
            .isInstanceOf(UserAlreadyExistsException.class)
            .hasMessage("用户名已存在");

        verify(userDao, never()).insert(any(UserEntity.class));
        verify(notificationService, never()).sendWelcomeNotification(anyString(), anyString());
    }
}
```

#### 2. 复杂业务逻辑测试

```java
// src/test/java/com/service/CourseBookingServiceTest.java
@ExtendWith(MockitoExtension.class)
class CourseBookingServiceTest {

    @InjectMocks
    private CourseBookingService courseBookingService;

    @Mock
    private CourseDao courseDao;

    @Mock
    private BookingDao bookingDao;

    @Mock
    private UserDao userDao;

    @Mock
    private PaymentService paymentService;

    @Test
    void shouldCreateBookingSuccessfully_WhenAllConditionsMet() {
        // Given
        Long userId = 1L;
        Long courseId = 1L;
        BookingRequest request = new BookingRequest(courseId, LocalDateTime.now().plusDays(1));

        CourseEntity course = CourseEntity.builder()
            .id(courseId)
            .name("瑜伽课程")
            .price(BigDecimal.valueOf(99.00))
            .maxParticipants(20)
            .currentParticipants(15)
            .build();

        UserEntity user = UserEntity.builder()
            .id(userId)
            .balance(BigDecimal.valueOf(200.00))
            .build();

        when(courseDao.selectById(courseId)).thenReturn(course);
        when(userDao.selectById(userId)).thenReturn(user);
        when(bookingDao.countByCourseIdAndDateTime(courseId, request.getBookingTime()))
            .thenReturn(5); // 当前时段已有5人预约
        when(bookingDao.insert(any(BookingEntity.class))).thenReturn(1);
        when(paymentService.processPayment(any(), any())).thenReturn(PaymentResult.success());

        // When
        BookingDTO result = courseBookingService.createBooking(userId, request);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo(BookingStatus.CONFIRMED);

        verify(bookingDao).insert(any(BookingEntity.class));
        verify(paymentService).processPayment(any(), any());
    }

    @Test
    void shouldThrowException_WhenCourseFullyBooked() {
        // Given
        Long courseId = 1L;
        BookingRequest request = new BookingRequest(courseId, LocalDateTime.now().plusDays(1));

        CourseEntity course = CourseEntity.builder()
            .id(courseId)
            .maxParticipants(20)
            .currentParticipants(20) // 已满
            .build();

        when(courseDao.selectById(courseId)).thenReturn(course);

        // When & Then
        assertThatThrownBy(() -> courseBookingService.createBooking(1L, request))
            .isInstanceOf(CourseFullyBookedException.class)
            .hasMessage("课程已满员");

        verify(bookingDao, never()).insert(any(BookingEntity.class));
        verify(paymentService, never()).processPayment(any(), any());
    }
}
```

### 数据驱动测试

```java
// src/test/java/com/service/MembershipDiscountServiceTest.java
@ExtendWith(MockitoExtension.class)
class MembershipDiscountServiceTest {

    @InjectMocks
    private MembershipDiscountService discountService;

    @ParameterizedTest
    @CsvSource({
        "BRONZE, 100.00, 5.00",   // 青铜会员 5% 折扣
        "SILVER, 100.00, 10.00",  // 白银会员 10% 折扣
        "GOLD, 100.00, 15.00",    // 黄金会员 15% 折扣
        "PLATINUM, 100.00, 20.00" // 铂金会员 20% 折扣
    })
    void shouldCalculateDiscountCorrectly(MembershipLevel level, BigDecimal price, BigDecimal expectedDiscount) {
        // When
        BigDecimal discount = discountService.calculateDiscount(level, price);

        // Then
        assertThat(discount).isEqualByComparingTo(expectedDiscount);
    }

    @ParameterizedTest
    @MethodSource("provideInvalidMembershipLevels")
    void shouldThrowException_WhenInvalidMembershipLevel(MembershipLevel level) {
        // When & Then
        assertThatThrownBy(() -> discountService.calculateDiscount(level, BigDecimal.valueOf(100)))
            .isInstanceOf(IllegalArgumentException.class);
    }

    static Stream<Arguments> provideInvalidMembershipLevels() {
        return Stream.of(
            arguments(null),
            arguments(MembershipLevel.UNKNOWN)
        );
    }
}
```

## 💾 DAO层测试实现

### MyBatis集成测试

#### 1. 基础DAO测试

```java
// src/test/java/com/dao/UserDaoTest.java
@SpringBootTest
@Sql(scripts = "/test-data.sql", executionPhase = BEFORE_TEST_METHOD)
@Sql(scripts = "/cleanup.sql", executionPhase = AFTER_TEST_METHOD)
class UserDaoTest extends AbstractDaoTest {

    @Autowired
    private UserDao userDao;

    @Test
    void shouldInsertUser() {
        // Given
        UserEntity user = UserEntity.builder()
            .username("newuser")
            .email("new@example.com")
            .password("password")
            .phone("13800138000")
            .build();

        // When
        int result = userDao.insert(user);

        // Then
        assertThat(result).isEqualTo(1);
        assertThat(user.getId()).isNotNull();

        UserEntity inserted = userDao.selectById(user.getId());
        assertThat(inserted).isNotNull();
        assertThat(inserted.getUsername()).isEqualTo("newuser");
    }

    @Test
    void shouldFindUserByUsername() {
        // Given - test-data.sql中已存在测试数据

        // When
        UserEntity user = userDao.selectByUsername("testuser");

        // Then
        assertThat(user).isNotNull();
        assertThat(user.getEmail()).isEqualTo("test@example.com");
        assertThat(user.getPhone()).isEqualTo("13800138000");
    }

    @Test
    void shouldReturnNull_WhenUserNotFound() {
        // When
        UserEntity user = userDao.selectByUsername("nonexistent");

        // Then
        assertThat(user).isNull();
    }
}
```

#### 2. 复杂查询测试

```java
// src/test/java/com/dao/CourseDaoTest.java
@SpringBootTest
@Sql(scripts = "/course-test-data.sql", executionPhase = BEFORE_TEST_METHOD)
@Sql(scripts = "/cleanup.sql", executionPhase = AFTER_TEST_METHOD)
class CourseDaoTest extends AbstractDaoTest {

    @Autowired
    private CourseDao courseDao;

    @Test
    void shouldFindCoursesByCriteria() {
        // Given
        CourseQuery query = CourseQuery.builder()
            .name("瑜伽")
            .minPrice(BigDecimal.valueOf(50))
            .maxPrice(BigDecimal.valueOf(150))
            .instructorId(1L)
            .build();

        PageRequest pageRequest = PageRequest.of(0, 10);

        // When
        Page<CourseEntity> result = courseDao.selectByCriteria(query, pageRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).isNotEmpty();
        assertThat(result.getContent()).allMatch(course ->
            course.getName().contains("瑜伽") &&
            course.getPrice().compareTo(BigDecimal.valueOf(50)) >= 0 &&
            course.getPrice().compareTo(BigDecimal.valueOf(150)) <= 0
        );
    }

    @Test
    void shouldUpdateCourseParticipants() {
        // Given
        Long courseId = 1L;
        CourseEntity original = courseDao.selectById(courseId);
        int originalParticipants = original.getCurrentParticipants();

        // When
        int updateResult = courseDao.updateParticipants(courseId, originalParticipants + 1);

        // Then
        assertThat(updateResult).isEqualTo(1);

        CourseEntity updated = courseDao.selectById(courseId);
        assertThat(updated.getCurrentParticipants()).isEqualTo(originalParticipants + 1);
    }
}
```

### 自定义SQL测试

```java
// src/test/java/com/dao/StatisticsDaoTest.java
@SpringBootTest
@Sql(scripts = "/statistics-test-data.sql", executionPhase = BEFORE_TEST_METHOD)
class StatisticsDaoTest extends AbstractDaoTest {

    @Autowired
    private StatisticsDao statisticsDao;

    @Test
    void shouldCalculateRevenueByMonth() {
        // Given
        YearMonth period = YearMonth.of(2024, 11);

        // When
        List<RevenueStatistics> stats = statisticsDao.calculateRevenueByMonth(period);

        // Then
        assertThat(stats).isNotNull();
        assertThat(stats).isNotEmpty();

        // 验证统计数据正确性
        BigDecimal totalRevenue = stats.stream()
            .map(RevenueStatistics::getRevenue)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        assertThat(totalRevenue).isGreaterThan(BigDecimal.ZERO);
    }

    @Test
    void shouldFindTopCoursesByBookings() {
        // Given
        int limit = 5;

        // When
        List<CourseBookingStats> topCourses = statisticsDao.findTopCoursesByBookings(limit);

        // Then
        assertThat(topCourses).isNotNull();
        assertThat(topCourses.size()).isLessThanOrEqualTo(limit);

        // 验证排序正确性
        for (int i = 1; i < topCourses.size(); i++) {
            assertThat(topCourses.get(i - 1).getBookingCount())
                .isGreaterThanOrEqualTo(topCourses.get(i).getBookingCount());
        }
    }
}
```

## 🛠️ 测试工具类使用

### TestUtils - 通用测试数据构建

```java
// src/test/java/com/utils/TestUtils.java
@Component
public class TestUtils {

    public UserDTO createTestUserDTO() {
        return UserDTO.builder()
            .id(1L)
            .username("testuser")
            .email("test@example.com")
            .phone("13800138000")
            .role("USER")
            .createdAt(LocalDateTime.now())
            .build();
    }

    public UserEntity createTestUserEntity() {
        return UserEntity.builder()
            .username("testuser")
            .email("test@example.com")
            .password("password123")
            .phone("13800138000")
            .role("USER")
            .createdAt(LocalDateTime.now())
            .build();
    }

    public UserCreateRequest createUserCreateRequest() {
        return UserCreateRequest.builder()
            .username("testuser")
            .email("test@example.com")
            .password("password123")
            .phone("13800138000")
            .build();
    }

    public CourseDTO createTestCourseDTO() {
        return CourseDTO.builder()
            .id(1L)
            .name("瑜伽入门")
            .description("基础瑜伽课程")
            .price(BigDecimal.valueOf(99.00))
            .duration(60)
            .maxParticipants(20)
            .instructorId(1L)
            .instructorName("张教练")
            .build();
    }

    public List<CourseDTO> createTestCourses(int count) {
        return IntStream.range(0, count)
            .mapToObj(i -> CourseDTO.builder()
                .id((long) i + 1)
                .name("课程" + (i + 1))
                .description("课程" + (i + 1) + "描述")
                .price(BigDecimal.valueOf(100.00 + i * 10))
                .duration(60)
                .maxParticipants(20)
                .instructorId(1L)
                .instructorName("张教练")
                .build())
            .collect(Collectors.toList());
    }

    public BookingRequest createBookingRequest() {
        return new BookingRequest(1L, LocalDateTime.now().plusDays(1));
    }

    public LoginRequest createLoginRequest() {
        return new LoginRequest("testuser", "password123");
    }

    public PageRequest createPageRequest() {
        return PageRequest.of(0, 10);
    }

    public PageRequest createPageRequest(int page, int size) {
        return PageRequest.of(page, size);
    }
}
```

### ExceptionTestHelper - 异常测试辅助

```java
// src/test/java/com/utils/ExceptionTestHelper.java
@Component
public class ExceptionTestHelper {

    public void assertThrowsException(Executable executable, Class<? extends Exception> exceptionClass) {
        assertThatThrownBy(executable)
            .isInstanceOf(exceptionClass);
    }

    public void assertThrowsExceptionWithMessage(Executable executable,
                                                Class<? extends Exception> exceptionClass,
                                                String expectedMessage) {
        assertThatThrownBy(executable)
            .isInstanceOf(exceptionClass)
            .hasMessage(expectedMessage);
    }

    public void assertNoExceptionOrHandledGracefully(Executable executable) {
        assertThatCode(executable).doesNotThrowAnyException();
    }

    public void assertReturnsNullOrThrowsException(Executable executable,
                                                  Class<? extends Exception> exceptionClass) {
        try {
            Object result = executable.execute();
            assertThat(result).isNull();
        } catch (Exception e) {
            assertThat(e).isInstanceOf(exceptionClass);
        }
    }
}
```

### TestDataFactory - 动态测试数据生成

```java
// src/test/java/com/utils/TestDataFactory.java
@Component
public class TestDataFactory {

    private static final Faker faker = new Faker(new Locale("zh_CN"));

    public UserEntity createRandomUser() {
        return UserEntity.builder()
            .username(faker.name().username())
            .email(faker.internet().emailAddress())
            .password("password123")
            .phone(faker.phoneNumber().phoneNumber())
            .realName(faker.name().fullName())
            .gender(faker.random().nextBoolean() ? "男" : "女")
            .birthday(faker.date().birthday().toLocalDateTime().toLocalDate())
            .address(faker.address().fullAddress())
            .createdAt(LocalDateTime.now())
            .build();
    }

    public CourseEntity createRandomCourse() {
        return CourseEntity.builder()
            .name(faker.book().title())
            .description(faker.lorem().paragraph())
            .price(BigDecimal.valueOf(faker.number().randomDouble(2, 50, 500)))
            .duration(faker.number().numberBetween(30, 120))
            .maxParticipants(faker.number().numberBetween(5, 20))
            .currentParticipants(0)
            .difficulty(faker.options().option("初级", "中级", "高级"))
            .category(faker.options().option("瑜伽", "健身", "舞蹈", "武术"))
            .build();
    }

    public List<UserEntity> createRandomUsers(int count) {
        return IntStream.range(0, count)
            .mapToObj(i -> createRandomUser())
            .collect(Collectors.toList());
    }

    public List<CourseEntity> createRandomCourses(int count) {
        return IntStream.range(0, count)
            .mapToObj(i -> createRandomCourse())
            .collect(Collectors.toList());
    }
}
```

## 📊 测试数据管理

### 测试数据文件结构

```
src/test/resources/
├── data/
│   ├── users.sql
│   ├── courses.sql
│   ├── bookings.sql
│   └── memberships.sql
├── schema/
│   ├── test-schema.sql
│   └── test-indexes.sql
└── cleanup.sql
```

### 测试数据脚本示例

```sql
-- src/test/resources/data/users.sql
INSERT INTO users (id, username, password, email, phone, role, created_at) VALUES
(1, 'admin', '$2a$10$encryptedpassword', 'admin@example.com', '13800138000', 'ADMIN', NOW()),
(2, 'testuser', '$2a$10$encryptedpassword', 'user@example.com', '13800138001', 'USER', NOW()),
(3, 'coach', '$2a$10$encryptedpassword', 'coach@example.com', '13800138002', 'COACH', NOW());

-- src/test/resources/data/courses.sql
INSERT INTO courses (id, name, description, price, duration, max_participants, instructor_id, created_at) VALUES
(1, '瑜伽入门', '基础瑜伽课程', 99.00, 60, 20, 3, NOW()),
(2, '力量训练', '肌肉力量训练课程', 129.00, 90, 15, 3, NOW()),
(3, '普拉提', '普拉提核心训练', 109.00, 75, 18, 3, NOW());

-- src/test/resources/cleanup.sql
TRUNCATE TABLE bookings, courses, users RESTART IDENTITY CASCADE;
```

### 数据加载策略

```java
// src/test/java/com/config/TestDataLoader.java
@Component
@Profile("test")
public class TestDataLoader {

    @Autowired
    private ResourceLoader resourceLoader;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void loadTestData() {
        try {
            loadSqlFile("classpath:data/users.sql");
            loadSqlFile("classpath:data/courses.sql");
            loadSqlFile("classpath:data/bookings.sql");
        } catch (Exception e) {
            throw new RuntimeException("Failed to load test data", e);
        }
    }

    private void loadSqlFile(String location) throws IOException {
        Resource resource = resourceLoader.getResource(location);
        String sql = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);

        jdbcTemplate.execute(sql);
    }
}
```

## 🔗 集成测试实现

### 完整业务流程测试

```java
// src/test/java/com/integration/UserRegistrationFlowTest.java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Sql(scripts = "/integration-test-setup.sql")
public class UserRegistrationFlowTest extends AbstractIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @LocalServerPort
    private int port;

    private String baseUrl;

    @BeforeEach
    void setUp() {
        this.baseUrl = "http://localhost:" + port + "/springboot1ngh61a2";
    }

    @Test
    void shouldCompleteFullRegistrationAndLoginFlow() {
        // 1. 用户注册
        UserRegistrationRequest registrationRequest = UserRegistrationRequest.builder()
            .username("newuser")
            .email("newuser@example.com")
            .password("password123")
            .phone("13800138000")
            .build();

        ResponseEntity<ApiResponse<UserDTO>> registrationResponse = restTemplate.postForEntity(
            baseUrl + "/yonghu/register",
            registrationRequest,
            new ParameterizedTypeReference<ApiResponse<UserDTO>>() {}
        );

        assertThat(registrationResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(registrationResponse.getBody().getData()).isNotNull();

        Long userId = registrationResponse.getBody().getData().getId();

        // 2. 用户登录
        LoginRequest loginRequest = new LoginRequest("newuser", "password123");

        ResponseEntity<ApiResponse<LoginResponse>> loginResponse = restTemplate.postForEntity(
            baseUrl + "/yonghu/login",
            loginRequest,
            new ParameterizedTypeReference<ApiResponse<LoginResponse>>() {}
        );

        assertThat(loginResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        String token = loginResponse.getBody().getData().getToken();
        assertThat(token).isNotNull();

        // 3. 获取用户信息
        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", token);
        HttpEntity<?> entity = new HttpEntity<>(headers);

        ResponseEntity<ApiResponse<UserDTO>> userInfoResponse = restTemplate.exchange(
            baseUrl + "/yonghu/info/" + userId,
            HttpMethod.GET,
            entity,
            new ParameterizedTypeReference<ApiResponse<UserDTO>>() {}
        );

        assertThat(userInfoResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(userInfoResponse.getBody().getData().getUsername()).isEqualTo("newuser");

        // 4. 更新用户信息
        UserUpdateRequest updateRequest = UserUpdateRequest.builder()
            .realName("张三")
            .phone("13800138999")
            .build();

        HttpEntity<UserUpdateRequest> updateEntity = new HttpEntity<>(updateRequest, headers);

        ResponseEntity<ApiResponse<UserDTO>> updateResponse = restTemplate.exchange(
            baseUrl + "/yonghu/update/" + userId,
            HttpMethod.PUT,
            updateEntity,
            new ParameterizedTypeReference<ApiResponse<UserDTO>>() {}
        );

        assertThat(updateResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(updateResponse.getBody().getData().getRealName()).isEqualTo("张三");
    }
}
```

### 微服务集成测试

```java
// src/test/java/com/integration/PaymentIntegrationTest.java
@SpringBootTest
@AutoConfigureWireMock(port = 0)
public class PaymentIntegrationTest {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private CourseBookingService bookingService;

    @Test
    void shouldCompletePaymentAndBookingFlow() {
        // Given - WireMock设置模拟支付服务
        stubFor(post(urlEqualTo("/api/payment/create-order"))
            .willReturn(aResponse()
                .withStatus(200)
                .withHeader("Content-Type", "application/json")
                .withBody("""
                    {
                        "orderId": "order_123456",
                        "amount": 99.00,
                        "status": "pending"
                    }
                """)));

        stubFor(post(urlEqualTo("/api/payment/confirm"))
            .willReturn(aResponse()
                .withStatus(200)
                .withHeader("Content-Type", "application/json")
                .withBody("""
                    {
                        "orderId": "order_123456",
                        "status": "paid",
                        "transactionId": "txn_789012"
                    }
                """)));

        // When - 执行完整支付流程
        PaymentOrder order = paymentService.createPaymentOrder(99.00, "course_123");
        PaymentResult result = paymentService.confirmPayment("order_123456");

        // Then
        assertThat(order.getOrderId()).isEqualTo("order_123456");
        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getTransactionId()).isEqualTo("txn_789012");

        // 验证业务逻辑 - 创建预约
        BookingDTO booking = bookingService.createBookingWithPayment(1L, 1L, "order_123456");
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
    }
}
```

## ⚙️ 测试配置和执行

### Maven配置

```xml
<!-- pom.xml -->
<properties>
    <maven.compiler.source>21</maven.compiler.source>
    <maven.compiler.target>21</maven.compiler.target>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>

    <!-- 测试相关版本 -->
    <junit.version>5.10.1</junit.version>
    <mockito.version>5.7.0</mockito.version>
    <assertj.version>3.24.2</assertj.version>
    <jacoco.version>0.8.11</jacoco.version>
    <testcontainers.version>1.19.3</testcontainers.version>
</properties>

<dependencies>
    <!-- 测试依赖 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>

    <dependency>
        <groupId>org.junit.jupiter</groupId>
        <artifactId>junit-jupiter</artifactId>
        <version>${junit.version}</version>
        <scope>test</scope>
    </dependency>

    <dependency>
        <groupId>org.mockito</groupId>
        <artifactId>mockito-core</artifactId>
        <version>${mockito.version}</version>
        <scope>test</scope>
    </dependency>

    <dependency>
        <groupId>org.assertj</groupId>
        <artifactId>assertj-core</artifactId>
        <version>${assertj.version}</version>
        <scope>test</scope>
    </dependency>

    <dependency>
        <groupId>org.testcontainers</groupId>
        <artifactId>junit-jupiter</artifactId>
        <version>${testcontainers.version}</version>
        <scope>test</scope>
    </dependency>

    <dependency>
        <groupId>org.testcontainers</groupId>
        <artifactId>postgresql</artifactId>
        <version>${testcontainers.version}</version>
        <scope>test</scope>
    </dependency>
</dependencies>

<build>
    <plugins>
        <!-- JaCoCo插件 -->
        <plugin>
            <groupId>org.jacoco</groupId>
            <artifactId>jacoco-maven-plugin</artifactId>
            <version>${jacoco.version}</version>
            <executions>
                <execution>
                    <goals>
                        <goal>prepare-agent</goal>
                    </goals>
                </execution>
                <execution>
                    <id>report</id>
                    <phase>test</phase>
                    <goals>
                        <goal>report</goal>
                    </goals>
                </execution>
                <execution>
                    <id>check</id>
                    <phase>test</phase>
                    <goals>
                        <goal>check</goal>
                    </goals>
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
                                    <limit>
                                        <counter>BRANCH</counter>
                                        <value>COVEREDRATIO</value>
                                        <minimum>50%</minimum>
                                    </limit>
                                </limits>
                            </rule>
                        </rules>
                    </configuration>
                </execution>
            </executions>
        </plugin>

        <!-- Surefire插件配置 -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-surefire-plugin</artifactId>
            <version>3.2.5</version>
            <configuration>
                <includes>
                    <include>**/*Test.java</include>
                    <include>**/*IT.java</include>
                </includes>
                <excludes>
                    <exclude>**/*Abstract*.java</exclude>
                </excludes>
                <systemPropertyVariables>
                    <jacoco-agent.destfile>${project.build.directory}/jacoco.exec</jacoco-agent.destfile>
                </systemPropertyVariables>
            </configuration>
        </plugin>
    </plugins>
</build>
```

### 测试执行命令

```bash
# 运行所有测试
mvn test

# 运行特定测试类
mvn test -Dtest=UserControllerTest

# 运行特定测试方法
mvn test -Dtest=UserControllerTest#shouldReturnUser_WhenValidIdProvided

# 运行带标签的测试
mvn test -Dgroups=unit

# 生成覆盖率报告
mvn jacoco:report

# 跳过测试
mvn clean package -DskipTests

# 只运行集成测试
mvn test -Dtest="*IT"
```

## 📈 覆盖率报告和分析

### 查看覆盖率报告

```bash
# 生成HTML覆盖率报告
mvn jacoco:report

# 报告位置：target/site/jacoco/index.html
start target/site/jacoco/index.html
```

### 覆盖率报告分析

#### 1. 包级覆盖率

| 包名 | 类覆盖率 | 方法覆盖率 | 行覆盖率 | 分支覆盖率 |
|------|---------|-----------|---------|-----------|
| `com.controller` | 85% | 80% | 75% | 70% |
| `com.service` | 90% | 85% | 80% | 75% |
| `com.dao` | 80% | 75% | 70% | 65% |
| `com.utils` | 95% | 90% | 85% | 80% |

#### 2. 未覆盖代码分析

```java
// 这些代码行未被测试覆盖
public class UserService {
    public UserDTO getUserById(Long id) {
        UserEntity entity = userDao.selectById(id);
        if (entity == null) {
            throw new UserNotFoundException("用户不存在"); // 未覆盖的分支
        }
        return convertToDTO(entity);
    }

    public void updateUser(UserUpdateRequest request) {
        // 验证逻辑
        validateUpdateRequest(request); // 未覆盖的异常情况

        UserEntity entity = userDao.selectById(request.getId());
        // 更新逻辑
        userDao.update(entity);
    }
}
```

#### 3. 覆盖率改进建议

```java
// 添加测试用例以提高覆盖率
@Test
void shouldThrowException_WhenUserNotFound() {
    when(userDao.selectById(999L)).thenReturn(null);

    assertThatThrownBy(() -> userService.getUserById(999L))
        .isInstanceOf(UserNotFoundException.class)
        .hasMessage("用户不存在");
}

@Test
void shouldThrowException_WhenUpdateRequestInvalid() {
    UserUpdateRequest invalidRequest = new UserUpdateRequest(); // 无效请求

    assertThatThrownBy(() -> userService.updateUser(invalidRequest))
        .isInstanceOf(ValidationException.class);
}
```

### CI/CD集成

#### GitHub Actions配置

```yaml
# .github/workflows/backend-test.yml
name: Backend Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: testdb
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'

      - name: Cache Maven packages
        uses: actions/cache@v3
        with:
          path: ~/.m2
          key: ${{ runner.os }}-m2-${{ hashFiles('**/pom.xml') }}
          restore-keys: ${{ runner.os }}-m2

      - name: Run tests
        run: mvn test

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./target/site/jacoco/jacoco.xml
```

---

## 📚 相关文档

- [测试策略总览](TESTING_STRATEGY.md) - 测试策略和目标
- [测试实现指南](TESTING_IMPLEMENTATION.md) - 具体测试编写方法
- [测试最佳实践](TESTING_BEST_PRACTICES.md) - 测试编写规范
- [测试代码示例](TESTING_EXAMPLES.md) - 实用测试代码示例
