package com.controller.support;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.service.*;
import com.utils.TestDataCleanup;
import com.utils.TestUtils;
import com.utils.TestDataFactory;
import com.utils.PasswordEncoderUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Map;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
// Note: Transactional support removed to allow token persistence for authentication tests
// @Transactional
// @Rollback
@Testcontainers
public abstract class AbstractControllerIntegrationTest {

    @Value("${test.containers.enabled:false}")
    private boolean testContainersEnabled;

    private static final Logger log = LoggerFactory.getLogger(AbstractControllerIntegrationTest.class);

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:13")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test123");

    @DynamicPropertySource
    static void configureDatabase(DynamicPropertyRegistry registry) {
        // 只有在启用Testcontainers时才覆盖数据源配置
        if (Boolean.parseBoolean(System.getProperty("test.containers.enabled", "false"))) {
            registry.add("spring.datasource.url", postgres::getJdbcUrl);
            registry.add("spring.datasource.username", postgres::getUsername);
            registry.add("spring.datasource.password", postgres::getPassword);
        }
    }

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    /**
     * 确保测试用户数据存在，如果不存在则创建
     */
    protected void ensureTestUsersExist() {
        try {
            // 确保admin用户存在
            if (usersService != null) {
                var adminUser = usersService.getOne(new QueryWrapper<com.entity.UsersEntity>()
                        .eq("username", "admin"));
                if (adminUser == null) {
                    log.info("Creating admin user for testing");
                    var newAdmin = new com.entity.UsersEntity();
                    newAdmin.setId(TestDataFactory.nextId());
                    newAdmin.setUsername("admin");
                    newAdmin.setPassword("admin"); // 明文密码，系统会自动哈希
                    newAdmin.setPasswordHash(PasswordEncoderUtil.encode("admin")); // BCrypt哈希
                    newAdmin.setRole("管理员");
                    newAdmin.setAddtime(new java.util.Date());
                    usersService.save(newAdmin);
                    log.info("Admin user created successfully");
                } else {
                    log.debug("Admin user already exists");
                }
            }

            // 确保user01用户存在
            if (yonghuService != null) {
                var memberUser = yonghuService.getOne(new QueryWrapper<com.entity.YonghuEntity>()
                        .eq("yonghuzhanghao", "user01"));
                if (memberUser == null) {
                    log.info("Creating member user 'user01' for testing");
                    var newMember = new com.entity.YonghuEntity();
                    newMember.setId(TestDataFactory.nextId());
                    newMember.setYonghuzhanghao("user01");
                    newMember.setMima("123456"); // 明文密码，系统会自动哈希
                    newMember.setPasswordHash(PasswordEncoderUtil.encode("123456")); // BCrypt哈希
                    newMember.setYonghuxingming("测试用户");
                    newMember.setTouxiang("/img/test.jpg");
                    newMember.setXingbie("男");
                    newMember.setShoujihaoma("13800138000");
                    newMember.setAddtime(new java.util.Date());
                    yonghuService.save(newMember);
                    log.info("Member user 'user01' created successfully");
                } else {
                    log.debug("Member user 'user01' already exists");
                }
            }
        } catch (Exception e) {
            log.error("Error ensuring test users exist: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to ensure test users exist", e);
        }
    }

    // Common services for test data cleanup
    @Autowired(required = false) protected UserService userService;
    @Autowired(required = false) protected UsersService usersService;
    @Autowired(required = false) protected YonghuService yonghuService;
    @Autowired(required = false) protected JianshenjiaolianService jianshenjiaolianService;
    @Autowired(required = false) protected JianshenkechengService jianshenkechengService;
    @Autowired(required = false) protected HuiyuankaService huiyuankaService;
    @Autowired(required = false) protected HuiyuankagoumaiService huiyuankagoumaiService;
    @Autowired(required = false) protected HuiyuanxufeiService huiyuanxufeiService;
    @Autowired(required = false) protected NewsService newsService;
    @Autowired(required = false) protected NewstypeService newstypeService;
    @Autowired(required = false) protected MessageService messageService;
    @Autowired(required = false) protected StoreupService storeupService;
    @Autowired(required = false) protected KechengyuyueService kechengyuyueService;
    @Autowired(required = false) protected KechengleixingService kechengleixingService;
    @Autowired(required = false) protected KechengtuikeService kechengtuikeService;
    @Autowired(required = false) protected SijiaoyuyueService sijiaoyuyueService;
    @Autowired(required = false) protected JianshenqicaiService jianshenqicaiService;
    @Autowired(required = false) protected DaoqitixingService daoqitixingService;
    @Autowired(required = false) protected DiscussjianshenkechengService discussjianshenkechengService;
    @Autowired(required = false) protected AssetsService assetsService;
    @Autowired(required = false) protected ChatService chatService;
    @Autowired(required = false) protected ConfigService configService;
    @Autowired(required = false) protected LegalTermsService legalTermsService;
    @Autowired(required = false) protected OperationLogService operationLogService;
    @Autowired(required = false) protected MembershipCardService membershipCardService;

    @Value("${test.authentication.skip:false}")
    private boolean skipAuthentication;

    private String adminTokenCache;
    private long adminTokenExpiry = 0;
    private String memberTokenCache;
    private long memberTokenExpiry = 0;

    // Token有效期：30分钟，平衡测试速度和稳定性
    private static final long TOKEN_VALIDITY_MS = TimeUnit.MINUTES.toMillis(30);
    // Token刷新提前时间：提前5分钟刷新，避免边界情况
    private static final long TOKEN_REFRESH_BUFFER_MS = TimeUnit.MINUTES.toMillis(5);

    protected ResultActions getPage(String basePath) throws Exception {
        return performAdmin(
                get(basePath)
                        .param("page", "1")
                        .param("limit", "10")
        );
    }

    protected ResultActions performAdmin(MockHttpServletRequestBuilder builder) throws Exception {
        if (skipAuthentication) {
            return mockMvc.perform(builder);
        }
        String token = adminToken();
        log.debug("Using admin token for request: token length={}", token != null ? token.length() : 0);
        return mockMvc.perform(builder.header("Token", token));
    }

    protected ResultActions performMember(MockHttpServletRequestBuilder builder) throws Exception {
        if (skipAuthentication) {
            return mockMvc.perform(builder);
        }
        String token = memberToken();
        log.debug("Using member token for request: token length={}", token != null ? token.length() : 0);
        return mockMvc.perform(builder.header("Token", token));
    }

    protected ResultActions postJson(String uri, Object payload) throws Exception {
        return performAdmin(
                post(uri)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(payload))
        );
    }

    protected ResultActions postJsonAsMember(String uri, Object payload) throws Exception {
        return performMember(
                post(uri)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(payload))
        );
    }

    protected ResultActions putJson(String uri, Object payload) throws Exception {
        return performAdmin(
                put(uri)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(payload))
        );
    }

    protected ResultActions putJsonAsMember(String uri, Object payload) throws Exception {
        return performMember(
                put(uri)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(payload))
        );
    }

    protected ResultActions deleteJson(String uri, Object payload) throws Exception {
        return performAdmin(
                delete(uri)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(payload))
        );
    }

    protected String json(Object payload) throws JsonProcessingException {
        return objectMapper.writeValueAsString(payload);
    }

    private String adminToken() throws Exception {
        if (adminTokenCache == null || isTokenExpired(adminTokenExpiry)) {
            log.debug("Generating new admin token");
            adminTokenCache = loginForToken("/users/login", Map.of(
                    "username", "admin",
                    "password", "admin"
            ));
            adminTokenExpiry = System.currentTimeMillis() + TOKEN_VALIDITY_MS;
        }
        return adminTokenCache;
    }

    private String memberToken() throws Exception {
        if (memberTokenCache == null || isTokenExpired(memberTokenExpiry)) {
            log.debug("Generating new member token");
            memberTokenCache = loginForToken("/yonghu/login", Map.of(
                    "username", "user01",
                    "password", "123456"
            ));
            memberTokenExpiry = System.currentTimeMillis() + TOKEN_VALIDITY_MS;
        }
        return memberTokenCache;
    }

    private boolean isTokenExpired(long expiryTime) {
        // 提前TOKEN_REFRESH_BUFFER_MS分钟刷新token，避免边界情况
        return System.currentTimeMillis() > (expiryTime - TOKEN_REFRESH_BUFFER_MS);
    }

    private String loginForToken(String uri, Map<String, String> params) throws Exception {
        int maxRetries = 3;
        Exception lastException = null;

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                var requestBuilder = post(uri);
                params.forEach(requestBuilder::param);
                // Add empty captcha for test environment (captcha validation may be skipped in tests)
                requestBuilder.param("captcha", "");

                String response = mockMvc.perform(requestBuilder)
                        .andExpect(status().isOk())
                        .andReturn()
                        .getResponse()
                        .getContentAsString();

                JsonNode responseJson = objectMapper.readTree(response);

                // 验证响应结构
                if (responseJson.has("code") && responseJson.get("code").asInt() != 0) {
                    String msg = responseJson.has("msg") ? responseJson.get("msg").asText() : "Unknown error";
                    log.warn("Login attempt {} failed for {}: code={}, msg={}", attempt, uri,
                            responseJson.get("code").asInt(), msg);

                    // 如果是最后一次尝试，抛出异常
                    if (attempt == maxRetries) {
                        throw new RuntimeException("Login failed after " + maxRetries + " attempts: " + msg);
                    }

                    // 等待更长时间后重试，避免数据库锁或临时问题
                    Thread.sleep(500 * attempt);
                    continue;
                }

                String token = responseJson.path("token").asText();
                if (token == null || token.trim().isEmpty()) {
                    log.warn("Token not found in response for {} on attempt {}: {}", uri, attempt, response);

                    // 如果是最后一次尝试，抛出异常
                    if (attempt == maxRetries) {
                        throw new RuntimeException("Token not found in response after " + maxRetries + " attempts: " + response);
                    }

                    Thread.sleep(100 * attempt);
                    continue;
                }

                // 验证token格式（基本检查）
                if (token.length() < 10) {
                    log.warn("Token too short for {} on attempt {}: length={}, token={}",
                            uri, attempt, token.length(),
                            token.length() > 0 ? token.substring(0, Math.min(10, token.length())) + "..." : "empty");

                    if (attempt == maxRetries) {
                        throw new RuntimeException("Token too short after " + maxRetries + " attempts: " + token);
                    }

                    Thread.sleep(100 * attempt);
                    continue;
                }

                log.debug("Successfully obtained token for {} on attempt {}: length={}, token={}",
                        uri, attempt, token.length(),
                        token.length() > 10 ? token.substring(0, 10) + "..." : token);
                return token;

            } catch (Exception e) {
                lastException = e;
                log.warn("Login attempt {} failed for {}: {} - Full context: {}",
                        attempt, uri, e.getMessage(),
                        attempt == maxRetries ? "Check application logs for details" : "Will retry");

                // 如果不是最后一次尝试，等待后重试
                if (attempt < maxRetries) {
                    try {
                        Thread.sleep(200 * attempt);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException("Login interrupted", ie);
                    }
                }
            }
        }

        // 所有重试都失败了
        log.error("All login attempts failed for {} after {} attempts", uri, maxRetries);
        throw new RuntimeException("Authentication failed for " + uri + " after " + maxRetries + " attempts: " +
                (lastException != null ? lastException.getMessage() : "Unknown error"), lastException);
    }

    /**
     * 获取当前使用的认证token（用于调试）
     */
    protected String getCurrentAdminToken() {
        return adminTokenCache;
    }

    protected String getCurrentMemberToken() {
        return memberTokenCache;
    }

    /**
     * 强制刷新token（用于测试token过期场景）
     */
    protected void refreshAdminToken() throws Exception {
        adminTokenCache = null;
        adminTokenExpiry = 0;
        adminToken(); // 重新生成
    }

    protected void refreshMemberToken() throws Exception {
        memberTokenCache = null;
        memberTokenExpiry = 0;
        memberToken(); // 重新生成
    }

    /**
     * 统一的测试数据清理钩子
     * 在每个测试方法执行后自动调用，执行通用的测试数据清理
     */
    @AfterEach
    protected void performGlobalTestDataCleanup() {
        String testClassName = this.getClass().getSimpleName();

        try {
            log.debug("Performing global test data cleanup for test class: {}", testClassName);

            // 确保测试用户数据存在
            ensureTestUsersExist();

            // 执行通用的测试数据清理
            performCommonCleanup();

            // 执行子类特定的清理任务（如果有的话）
            executeSubclassCleanupTasks(testClassName);

            log.debug("Global test data cleanup completed for test class: {}", testClassName);

        } catch (Exception e) {
            log.error("Error during global test data cleanup for test class '{}': {}",
                    testClassName, e.getMessage(), e);
            // 不抛出异常，避免影响测试结果
        }
    }

    /**
     * 执行通用的测试数据清理
     * 清理常见的测试数据前缀，支持级联删除以处理外键依赖
     */
    protected void performCommonCleanup() {
        log.debug("Performing common test data cleanup with cascade support");

        // 定义常见的测试前缀
        String[] testPrefixes = {"test-", "auto-", "temp-", "cleanup-", "mock-"};

        // 定义常见的字段名
        String[] commonFields = {
            "username", "yonghuzhanghao", "jiaoliangonghao",
            "title", "name", "huiyuankamingcheng",
            "content", "miaoshu", "jianjie"
        };

        // 重要：按外键依赖关系的倒序清理数据，先清理子表再清理父表
        // 1. 清理依赖于其他表的数据（子表）
        performCascadeCleanup(testPrefixes, commonFields);

        // 2. 清理基础数据（父表）
        performBasicCleanup(testPrefixes, commonFields);

        log.debug("Common test data cleanup completed");
    }

    /**
     * 执行级联清理：先清理依赖于其他表的数据
     */
    private void performCascadeCleanup(String[] testPrefixes, String[] commonFields) {
        log.debug("Performing cascade cleanup for dependent tables");

        // 清理课程预约（依赖课程和用户）
        if (kechengyuyueService != null) {
            cleanupByPrefixes(kechengyuyueService, commonFields, testPrefixes);
        }
        // 清理课程退课（依赖预约）
        if (kechengtuikeService != null) {
            cleanupByPrefixes(kechengtuikeService, commonFields, testPrefixes);
        }
        // 清理会员卡购买（依赖会员卡和用户）
        if (huiyuankagoumaiService != null) {
            cleanupByPrefixes(huiyuankagoumaiService, commonFields, testPrefixes);
        }
        // 清理会员续费（依赖用户）
        if (huiyuanxufeiService != null) {
            cleanupByPrefixes(huiyuanxufeiService, commonFields, testPrefixes);
        }
        // 清理私教预约（依赖教练和用户）
        if (sijiaoyuyueService != null) {
            cleanupByPrefixes(sijiaoyuyueService, commonFields, testPrefixes);
        }
        // 清理到期提醒（依赖用户）
        if (daoqitixingService != null) {
            cleanupByPrefixes(daoqitixingService, commonFields, testPrefixes);
        }
        // 清理课程讨论（依赖课程和用户）
        if (discussjianshenkechengService != null) {
            cleanupByPrefixes(discussjianshenkechengService, commonFields, testPrefixes);
        }
        // 清理收藏（依赖用户）
        if (storeupService != null) {
            cleanupByPrefixes(storeupService, commonFields, testPrefixes);
        }
        // 清理聊天记录（依赖用户）
        if (chatService != null) {
            cleanupByPrefixes(chatService, commonFields, testPrefixes);
        }
        // 清理消息（依赖用户）
        if (messageService != null) {
            cleanupByPrefixes(messageService, commonFields, testPrefixes);
        }
        // 清理资产记录
        if (assetsService != null) {
            cleanupByPrefixes(assetsService, commonFields, testPrefixes);
        }
        // 清理操作日志
        if (operationLogService != null) {
            cleanupByPrefixes(operationLogService, commonFields, testPrefixes);
        }
    }

    /**
     * 执行基础数据清理：清理不依赖其他表的数据
     */
    private void performBasicCleanup(String[] testPrefixes, String[] commonFields) {
        log.debug("Performing basic cleanup for independent tables");

        // 清理用户相关数据
        if (userService != null) {
            cleanupByPrefixes(userService, commonFields, testPrefixes);
        }
        if (usersService != null) {
            cleanupByPrefixes(usersService, commonFields, testPrefixes);
        }
        if (yonghuService != null) {
            cleanupByPrefixes(yonghuService, commonFields, testPrefixes);
        }

        // 清理教练相关数据
        if (jianshenjiaolianService != null) {
            cleanupByPrefixes(jianshenjiaolianService, commonFields, testPrefixes);
        }

        // 清理课程相关数据
        if (jianshenkechengService != null) {
            cleanupByPrefixes(jianshenkechengService, commonFields, testPrefixes);
        }
        if (kechengleixingService != null) {
            cleanupByPrefixes(kechengleixingService, commonFields, testPrefixes);
        }

        // 清理健身器材
        if (jianshenqicaiService != null) {
            cleanupByPrefixes(jianshenqicaiService, commonFields, testPrefixes);
        }

        // 清理会员卡相关数据
        if (huiyuankaService != null) {
            cleanupByPrefixes(huiyuankaService, commonFields, testPrefixes);
        }
        if (membershipCardService != null) {
            cleanupByPrefixes(membershipCardService, commonFields, testPrefixes);
        }

        // 清理新闻和消息数据
        if (newsService != null) {
            cleanupByPrefixes(newsService, commonFields, testPrefixes);
        }
        if (newstypeService != null) {
            cleanupByPrefixes(newstypeService, commonFields, testPrefixes);
        }

        // 清理配置和法律条款
        if (configService != null) {
            cleanupByPrefixes(configService, commonFields, testPrefixes);
        }
        if (legalTermsService != null) {
            cleanupByPrefixes(legalTermsService, commonFields, testPrefixes);
        }
    }

    /**
     * 按多个前缀清理数据
     */
    private <T> void cleanupByPrefixes(com.baomidou.mybatisplus.extension.service.IService<T> service,
                                       String[] fields, String[] prefixes) {
        for (String field : fields) {
            for (String prefix : prefixes) {
                try {
                    TestDataCleanup.cleanupByPrefix(service, field, prefix);
                } catch (Exception e) {
                    // 忽略字段不存在的异常，继续下一个字段
                    log.debug("Field '{}' not found in service '{}', continuing...",
                             field, service.getClass().getSimpleName());
                }
            }
        }
    }

    /**
     * 执行子类特定的清理任务
     *
     * @param testClassName 测试类名
     */
    protected void executeSubclassCleanupTasks(String testClassName) {
        // 执行TestDataCleanup中注册的清理任务
        TestDataCleanup.executeCleanupTasks(testClassName);

        // 执行TestDataFactory中记录的实体清理
        TestDataFactory.cleanupAllCreatedEntities(testClassName);
    }

    /**
     * 注册清理任务（供子类使用）
     *
     * @param cleanupTask 清理任务
     */
    protected void registerCleanupTask(Runnable cleanupTask) {
        String testClassName = this.getClass().getSimpleName();
        TestDataCleanup.registerCleanupTask(testClassName, cleanupTask);
    }

    /**
     * 便捷方法：注册基于服务和前缀的清理任务
     *
     * @param service 服务实例
     * @param fieldName 字段名
     * @param prefix 前缀
     */
    protected <T> void registerCleanupByPrefix(com.baomidou.mybatisplus.extension.service.IService<T> service,
                                               String fieldName, String prefix) {
        registerCleanupTask(() -> TestDataCleanup.cleanupByPrefix(service, fieldName, prefix));
    }

    /**
     * 便捷方法：注册基于服务和条件的清理任务
     *
     * @param service 服务实例
     * @param condition 清理条件谓词
     */
    protected <T> void registerCleanupByCondition(com.baomidou.mybatisplus.extension.service.IService<T> service,
                                                  java.util.function.Predicate<T> condition) {
        registerCleanupTask(() -> TestDataCleanup.cleanupByCondition(service, condition));
    }

    /**
     * 测试认证跳过功能（用于验证test-noauth profile）
     * 当skipAuthentication=true时，Controller方法应该可以直接访问而不返回401
     */
    @Test
    void shouldSkipAuthenticationWhenConfigured() throws Exception {
        if (!skipAuthentication) {
            log.info("Skipping authentication skip test because skipAuthentication is false");
            return;
        }

        // 测试一个需要认证的端点，但由于skipAuthentication=true，应该成功
        getPage("/users/page")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }
}


