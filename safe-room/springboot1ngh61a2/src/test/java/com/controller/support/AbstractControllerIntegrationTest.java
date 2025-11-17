package com.controller.support;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
// TODO: Enable Testcontainers for integration testing
// @Testcontainers
public abstract class AbstractControllerIntegrationTest {

    private static final Logger log = LoggerFactory.getLogger(AbstractControllerIntegrationTest.class);

    // TODO: Add PostgreSQL container for integration testing
    // @Container
    // static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:13")
    //         .withDatabaseName("testdb")
    //         .withUsername("test")
    //         .withPassword("test123");

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @Value("${test.authentication.skip:false}")
    private boolean skipAuthentication;

    private String adminTokenCache;
    private long adminTokenExpiry = 0;
    private String memberTokenCache;
    private long memberTokenExpiry = 0;

    // Token有效期：30分钟
    private static final long TOKEN_VALIDITY_MS = TimeUnit.MINUTES.toMillis(30);

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
        return System.currentTimeMillis() > expiryTime;
    }

    private String loginForToken(String uri, Map<String, String> params) throws Exception {
        var requestBuilder = post(uri);
        params.forEach(requestBuilder::param);

        try {
            String response = mockMvc.perform(requestBuilder)
                    .andExpect(status().isOk())
                    .andReturn()
                    .getResponse()
                    .getContentAsString();

            JsonNode responseJson = objectMapper.readTree(response);

            // 验证响应结构
            if (responseJson.has("code") && responseJson.get("code").asInt() != 0) {
                String msg = responseJson.has("msg") ? responseJson.get("msg").asText() : "Unknown error";
                log.error("Login failed for {}: code={}, msg={}", uri, 
                        responseJson.get("code").asInt(), msg);
                throw new RuntimeException("Login failed: " + msg);
            }

            String token = responseJson.path("token").asText();
            if (token == null || token.trim().isEmpty()) {
                log.error("Token not found in response for {}: {}", uri, response);
                throw new RuntimeException("Token not found in response: " + response);
            }

            // 验证token格式（基本检查）- 移除JWT格式检查，因为我们的token是32位随机字符串
            if (token.length() < 10) {
                log.warn("Token seems too short: length={}", token.length());
            }

            log.debug("Successfully obtained token for {}: token length={}", uri, token.length());
            return token;

        } catch (Exception e) {
            log.error("Failed to login for token at {}: {}", uri, e.getMessage(), e);
            throw new RuntimeException("Authentication failed for " + uri + ": " + e.getMessage(), e);
        }
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
}


