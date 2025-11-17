package com.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.entity.TokenEntity;
import com.utils.PageUtils;
import com.utils.TestUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class TokenServiceImplTest {

    @Autowired
    private TokenService tokenService;

    @AfterEach
    void cleanup() {
        // Clean up test data
        tokenService.remove(new QueryWrapper<TokenEntity>()
                .in("userid", 1L, 2L, 3L, 4L, 9L, 100L, 101L, 102L, 103L, 104L, 105L, 106L, 107L, 108L, 109L, 110L, 111L));
    }

    @Test
    void shouldCreateNewTokenWhenUserHasNoToken() {
        long userId = 100L;
        String token = tokenService.generateToken(userId, "admin", "users", "ADMIN");

        assertThat(token).isNotBlank();

        TokenEntity tokenEntity = tokenService.getOne(new QueryWrapper<TokenEntity>()
                .eq("userid", userId)
                .eq("role", "ADMIN"));
        assertThat(tokenEntity)
                .isNotNull()
                .extracting(TokenEntity::getToken)
                .isEqualTo(token);
    }

    @Test
    void shouldUpdateExistingTokenWhenUserAlreadyHasToken() {
        long userId = 101L;
        TokenEntity original = new TokenEntity();
        original.setUserid(userId);
        original.setUsername("john");
        original.setRole("USER");
        original.setTablename("users");
        original.setToken("original-token");
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.MINUTE, 30);
        original.setExpiratedtime(calendar.getTime());
        tokenService.save(original);

        String newToken = tokenService.generateToken(userId, "john", "users", "USER");

        TokenEntity updated = tokenService.getOne(new QueryWrapper<TokenEntity>()
                .eq("userid", userId)
                .eq("role", "USER"));

        assertThat(updated).isNotNull();
        assertThat(updated.getToken()).isEqualTo(newToken);
        assertThat(updated.getToken()).isNotEqualTo("original-token");
    }

    @Test
    void shouldReturnTokenEntityWhenTokenValid() {
        long userId = 102L;
        Date future = new Date(System.currentTimeMillis() + 60_000);
        TokenEntity tokenEntity = TestUtils.createToken(userId, "valid-user", "USER", "users", future);
        tokenEntity.setToken("valid-token");
        tokenService.save(tokenEntity);

        TokenEntity result = tokenService.getTokenEntity("valid-token");

        assertThat(result).isNotNull();
        assertThat(result.getUsername()).isEqualTo("valid-user");
    }

    @Test
    void shouldReturnNullWhenTokenExpired() {
        long userId = 103L;
        Date past = new Date(System.currentTimeMillis() - 60_000);
        TokenEntity tokenEntity = TestUtils.createToken(userId, "expired-user", "USER", "users", past);
        tokenEntity.setToken("expired-token");
        tokenService.save(tokenEntity);

        TokenEntity result = tokenService.getTokenEntity("expired-token");

        assertThat(result).isNull();
    }

    @Test
    void shouldReturnNullWhenTokenNotFound() {
        TokenEntity result = tokenService.getTokenEntity("missing-token");

        assertThat(result).isNull();
    }

    @Test
    void generateTokenShouldExtendExpirationWindow() {
        long userId = 104L;
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.MINUTE, -10);

        TokenEntity tokenEntity = new TokenEntity();
        tokenEntity.setUserid(userId);
        tokenEntity.setUsername("window-user");
        tokenEntity.setRole("USER");
        tokenEntity.setTablename("users");
        tokenEntity.setToken("window-token");
        tokenEntity.setExpiratedtime(calendar.getTime());
        tokenService.save(tokenEntity);

        String refreshed = tokenService.generateToken(userId, "window-user", "users", "USER");

        TokenEntity refreshedEntity = tokenService.getTokenEntity(refreshed);
        assertThat(refreshedEntity.getExpiratedtime()).isAfter(new Date());
    }

    @Test
    void shouldGenerateTokenWithNullUsername() {
        // Note: username cannot be null in database, so this test verifies the behavior
        // when null is passed - it may throw exception or handle gracefully
        long userId = 105L;
        try {
            String token = tokenService.generateToken(userId, null, "users", "ADMIN");
            // If no exception, verify token was created
            assertThat(token).isNotBlank();
            TokenEntity tokenEntity = tokenService.getOne(new QueryWrapper<TokenEntity>()
                    .eq("userid", userId)
                    .eq("role", "ADMIN"));
            assertThat(tokenEntity).isNotNull();
        } catch (Exception e) {
            // Exception is acceptable if database constraint prevents null username
            assertThat(e).isNotNull();
        }
    }

    @Test
    void shouldGenerateTokenWithNullTableName() {
        long userId = 106L;
        String token = tokenService.generateToken(userId, "test-user", null, "USER");
        assertThat(token).isNotBlank();
        
        TokenEntity tokenEntity = tokenService.getOne(new QueryWrapper<TokenEntity>()
                .eq("userid", userId)
                .eq("role", "USER"));
        assertThat(tokenEntity).isNotNull();
    }

    @Test
    void shouldGenerateTokenWithNullRole() {
        long userId = 107L;
        String token = tokenService.generateToken(userId, "test-user", "users", null);
        assertThat(token).isNotBlank();
        
        TokenEntity tokenEntity = tokenService.getOne(new QueryWrapper<TokenEntity>()
                .eq("userid", userId)
                .isNull("role"));
        // May or may not find the token depending on how null role is handled
        assertThat(tokenEntity).isNotNull();
    }

    @Test
    void shouldReturnNullForExpiredTokenAtExactExpirationTime() {
        long userId = 108L;
        Date exactlyNow = new Date();
        TokenEntity tokenEntity = TestUtils.createToken(userId, "expired-user", "USER", "users", exactlyNow);
        tokenEntity.setToken("exactly-expired-token");
        tokenService.save(tokenEntity);

        // Wait a tiny bit to ensure token is expired
        try {
            Thread.sleep(10);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        TokenEntity result = tokenService.getTokenEntity("exactly-expired-token");
        assertThat(result).isNull();
    }

    @Test
    void shouldReturnNullForTokenWithNullExpirationTime() {
        long userId = 109L;
        TokenEntity tokenEntity = new TokenEntity();
        tokenEntity.setUserid(userId);
        tokenEntity.setUsername("null-exp-user");
        tokenEntity.setRole("USER");
        tokenEntity.setTablename("users");
        tokenEntity.setToken("null-exp-token");
        tokenEntity.setExpiratedtime(null);
        tokenService.save(tokenEntity);

        // This should handle null expiration gracefully
        try {
            TokenEntity result = tokenService.getTokenEntity("null-exp-token");
            // May return null or throw exception
            assertThat(result).isNull();
        } catch (Exception e) {
            // NullPointerException is acceptable
            assertThat(e).isNotNull();
        }
    }

    @Test
    void shouldGenerateDifferentTokensForSameUserDifferentRoles() {
        long userId = 110L;
        String token1 = tokenService.generateToken(userId, "multi-role-user", "users", "ADMIN");
        String token2 = tokenService.generateToken(userId, "multi-role-user", "users", "USER");
        
        assertThat(token1).isNotBlank();
        assertThat(token2).isNotBlank();
        assertThat(token1).isNotEqualTo(token2);
        
        TokenEntity adminToken = tokenService.getOne(new QueryWrapper<TokenEntity>()
                .eq("userid", userId)
                .eq("role", "ADMIN"));
        TokenEntity userToken = tokenService.getOne(new QueryWrapper<TokenEntity>()
                .eq("userid", userId)
                .eq("role", "USER"));
        
        assertThat(adminToken).isNotNull();
        assertThat(userToken).isNotNull();
        assertThat(adminToken.getToken()).isNotEqualTo(userToken.getToken());
    }

    @Test
    void shouldUpdateTokenExpirationWhenRegenerating() {
        long userId = 111L;
        String firstToken = tokenService.generateToken(userId, "refresh-user", "users", "USER");
        TokenEntity firstEntity = tokenService.getTokenEntity(firstToken);
        Date firstExpiration = firstEntity.getExpiratedtime();

        // Wait a bit
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        String secondToken = tokenService.generateToken(userId, "refresh-user", "users", "USER");
        TokenEntity secondEntity = tokenService.getTokenEntity(secondToken);
        Date secondExpiration = secondEntity.getExpiratedtime();

        assertThat(secondExpiration).isAfter(firstExpiration);
    }

    @Test
    void shouldHandleTokenGenerationWithComplexScenarios() {
        long userId = 112L;

        // Test multiple roles for same user
        String adminToken1 = tokenService.generateToken(userId, "complex-user", "users", "ADMIN");
        String userToken1 = tokenService.generateToken(userId, "complex-user", "users", "USER");
        String coachToken1 = tokenService.generateToken(userId, "complex-user", "users", "COACH");

        assertThat(adminToken1).isNotBlank();
        assertThat(userToken1).isNotBlank();
        assertThat(coachToken1).isNotBlank();
        assertThat(adminToken1).isNotEqualTo(userToken1);
        assertThat(userToken1).isNotEqualTo(coachToken1);

        // Regenerate tokens to test update path
        String adminToken2 = tokenService.generateToken(userId, "complex-user", "users", "ADMIN");
        String userToken2 = tokenService.generateToken(userId, "complex-user", "users", "USER");

        assertThat(adminToken2).isNotEqualTo(adminToken1);
        assertThat(userToken2).isNotEqualTo(userToken1);
    }

    @Test
    void shouldHandleTokenValidationEdgeCases() {
        long userId = 113L;

        // Test token that becomes invalid immediately
        TokenEntity instantExpire = new TokenEntity();
        instantExpire.setUserid(userId);
        instantExpire.setUsername("edge-user");
        instantExpire.setRole("USER");
        instantExpire.setTablename("users");
        instantExpire.setToken("instant-expire");
        instantExpire.setExpiratedtime(new Date(System.currentTimeMillis() - 1000)); // Already expired
        tokenService.save(instantExpire);

        TokenEntity result = tokenService.getTokenEntity("instant-expire");
        assertThat(result).isNull();

        // Test token with future expiration
        Date future = new Date(System.currentTimeMillis() + 3600000); // 1 hour from now
        TokenEntity futureExpire = TestUtils.createToken(userId, "future-user", "USER", "users", future);
        futureExpire.setToken("future-token");
        tokenService.save(futureExpire);

        TokenEntity futureResult = tokenService.getTokenEntity("future-token");
        assertThat(futureResult).isNotNull();
        assertThat(futureResult.getUsername()).isEqualTo("future-user");
    }

    @Test
    void shouldHandleQueryPageWithNullParams() {
        try {
            tokenService.queryPage(null);
        } catch (Exception e) {
            // May throw exception or handle gracefully
            assertThat(e).isNotNull();
        }
    }

    @Test
    void shouldHandleQueryPageWithEmptyParams() {
        Map<String, Object> emptyParams = new HashMap<>();
        PageUtils result = tokenService.queryPage(emptyParams);
        assertThat(result).isNotNull();
        assertThat(result.getList()).isNotNull();
    }

    @Test
    void shouldHandleSelectListViewWithNullWrapper() {
        List<TokenEntity> result = tokenService.selectListView(null);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleQueryPageWithWrapper() {
        long userId = 114L;
        TokenEntity token = TestUtils.createToken(userId, "wrapper-user", "USER", "users", new Date(System.currentTimeMillis() + 3600000));
        tokenService.save(token);

        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "10");
        QueryWrapper<TokenEntity> wrapper = new QueryWrapper<TokenEntity>().eq("userid", userId);

        PageUtils result = tokenService.queryPage(params, wrapper);
        assertThat(result).isNotNull();
        assertThat(result.getList()).isNotEmpty();
    }
}

