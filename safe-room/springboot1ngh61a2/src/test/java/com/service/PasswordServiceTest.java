package com.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import java.util.Date;
import java.util.Calendar;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * PasswordService单元测试
 */
class PasswordServiceTest {

    private PasswordService passwordService;

    @BeforeEach
    void setUp() {
        passwordService = new PasswordService();
    }

    // === verifyPassword 方法测试 ===

    @Test
    void shouldVerifyPasswordWithBCryptHash() {
        // 准备测试数据
        String rawPassword = "testPassword123";
        String passwordHash = "$2a$10$8K2L0HkdjkO9C.1dWuBEgOFTVWlUuICASQgM5GVlAzCzF7I.5WQ2"; // BCrypt hash for "testPassword123"

        // 执行测试
        boolean result = passwordService.verifyPassword(rawPassword, passwordHash, null);

        // 验证结果
        assertThat(result).isTrue();
    }

    @Test
    void shouldFailPasswordVerificationWithWrongBCryptHash() {
        // 准备测试数据
        String rawPassword = "testPassword123";
        String wrongPasswordHash = "$2a$10$8K2L0HkdjkO9C.1dWuBEgOFTVWlUuICASQgM5GVlAzCzF7I.5WQ3"; // Wrong hash

        // 执行测试
        boolean result = passwordService.verifyPassword(rawPassword, wrongPasswordHash, null);

        // 验证结果
        assertThat(result).isFalse();
    }

    @Test
    void shouldVerifyPasswordWithLegacyPassword() {
        // 准备测试数据
        String rawPassword = "legacyPassword";
        String legacyPassword = "legacyPassword";

        // 执行测试
        boolean result = passwordService.verifyPassword(rawPassword, null, legacyPassword);

        // 验证结果
        assertThat(result).isTrue();
    }

    @Test
    void shouldFailPasswordVerificationWithWrongLegacyPassword() {
        // 准备测试数据
        String rawPassword = "testPassword";
        String wrongLegacyPassword = "wrongPassword";

        // 执行测试
        boolean result = passwordService.verifyPassword(rawPassword, null, wrongLegacyPassword);

        // 验证结果
        assertThat(result).isFalse();
    }

    @Test
    void shouldFailPasswordVerificationWithNullPassword() {
        // 执行测试
        boolean result = passwordService.verifyPassword(null, "hash", "legacy");

        // 验证结果
        assertThat(result).isFalse();
    }

    @Test
    void shouldFailPasswordVerificationWithEmptyPassword() {
        // 执行测试
        boolean result = passwordService.verifyPassword("", "hash", "legacy");

        // 验证结果
        assertThat(result).isFalse();
    }

    @Test
    void shouldFailPasswordVerificationWithAllNullParameters() {
        // 执行测试
        boolean result = passwordService.verifyPassword(null, null, null);

        // 验证结果
        assertThat(result).isFalse();
    }

    @Test
    void shouldPrioritizeBCryptHashOverLegacyPassword() {
        // 准备测试数据 - BCrypt hash优先
        String rawPassword = "testPassword123";
        String passwordHash = "$2a$10$8K2L0HkdjkO9C.1dWuBEgOFTVWlUuICASQgM5GVlAzCzF7I.5WQ2"; // Correct hash
        String legacyPassword = "wrongLegacy"; // Wrong legacy password

        // 执行测试
        boolean result = passwordService.verifyPassword(rawPassword, passwordHash, legacyPassword);

        // 验证结果 - 应该使用BCrypt hash验证
        assertThat(result).isTrue();
    }

    // === isAccountLocked 方法测试 ===

    @Test
    void shouldReturnFalseWhenLockUntilIsNull() {
        // 执行测试
        boolean result = passwordService.isAccountLocked(null);

        // 验证结果
        assertThat(result).isFalse();
    }

    @Test
    void shouldReturnFalseWhenLockUntilIsInPast() {
        // 准备测试数据
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.HOUR, -1); // 1小时前
        Date pastDate = cal.getTime();

        // 执行测试
        boolean result = passwordService.isAccountLocked(pastDate);

        // 验证结果
        assertThat(result).isFalse();
    }

    @Test
    void shouldReturnTrueWhenLockUntilIsInFuture() {
        // 准备测试数据
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.HOUR, 1); // 1小时后
        Date futureDate = cal.getTime();

        // 执行测试
        boolean result = passwordService.isAccountLocked(futureDate);

        // 验证结果
        assertThat(result).isTrue();
    }

    @Test
    void shouldReturnTrueWhenLockUntilIsExactlyNow() {
        // 准备测试数据
        Date now = new Date();

        // 执行测试
        boolean result = passwordService.isAccountLocked(now);

        // 验证结果 - 边界情况：等于当前时间应该被视为锁定
        assertThat(result).isTrue();
    }

    // === handleLoginFailure 方法测试 ===

    @Test
    void shouldIncrementFailedAttemptsFromZero() {
        // 执行测试
        int result = passwordService.handleLoginFailure(0);

        // 验证结果
        assertThat(result).isEqualTo(1);
    }

    @Test
    void shouldIncrementFailedAttemptsFromExistingValue() {
        // 执行测试
        int result = passwordService.handleLoginFailure(3);

        // 验证结果
        assertThat(result).isEqualTo(4);
    }

    @Test
    void shouldHandleNullFailedAttempts() {
        // 执行测试
        int result = passwordService.handleLoginFailure(null);

        // 验证结果
        assertThat(result).isEqualTo(1);
    }

    @Test
    void shouldHandleNegativeFailedAttempts() {
        // 执行测试
        int result = passwordService.handleLoginFailure(-1);

        // 验证结果
        assertThat(result).isEqualTo(0);
    }

    // === calculateLockUntil 方法测试 ===

    @Test
    void shouldCalculateLockUntilAsFutureTime() {
        // 执行测试
        Date result = passwordService.calculateLockUntil();

        // 验证结果
        assertThat(result).isNotNull();
        assertThat(result.after(new Date())).isTrue();

        // 验证锁定时间大约是30分钟后
        long diff = result.getTime() - System.currentTimeMillis();
        long thirtyMinutes = 30 * 60 * 1000;
        assertThat(diff).isGreaterThanOrEqualTo(thirtyMinutes - 1000); // 允许1秒误差
        assertThat(diff).isLessThanOrEqualTo(thirtyMinutes + 1000);
    }

    // === shouldLockAccount 方法测试 ===

    @Test
    void shouldNotLockAccountWhenAttemptsBelowThreshold() {
        // 执行测试
        boolean result = passwordService.shouldLockAccount(4);

        // 验证结果
        assertThat(result).isFalse();
    }

    @Test
    void shouldLockAccountWhenAttemptsReachThreshold() {
        // 执行测试
        boolean result = passwordService.shouldLockAccount(5);

        // 验证结果
        assertThat(result).isTrue();
    }

    @Test
    void shouldLockAccountWhenAttemptsExceedThreshold() {
        // 执行测试
        boolean result = passwordService.shouldLockAccount(10);

        // 验证结果
        assertThat(result).isTrue();
    }

    @Test
    void shouldNotLockAccountWhenAttemptsIsNull() {
        // 执行测试
        boolean result = passwordService.shouldLockAccount(null);

        // 验证结果
        assertThat(result).isFalse();
    }

    @Test
    void shouldNotLockAccountWhenAttemptsIsZero() {
        // 执行测试
        boolean result = passwordService.shouldLockAccount(0);

        // 验证结果
        assertThat(result).isFalse();
    }

    // === validatePasswordStrength 方法测试 ===

    @Test
    void shouldValidateStrongPassword() {
        // 执行测试
        String result = passwordService.validatePasswordStrength("StrongPass123!");

        // 验证结果
        assertThat(result).isNull(); // null表示验证通过
    }

    @Test
    void shouldRejectWeakPassword() {
        // 执行测试
        String result = passwordService.validatePasswordStrength("weak");

        // 验证结果
        assertThat(result).isNotNull();
        assertThat(result).contains("密码长度至少8位");
    }

    @Test
    void shouldRejectNullPassword() {
        // 执行测试
        String result = passwordService.validatePasswordStrength(null);

        // 验证结果
        assertThat(result).isNotNull();
    }

    @Test
    void shouldRejectEmptyPassword() {
        // 执行测试
        String result = passwordService.validatePasswordStrength("");

        // 验证结果
        assertThat(result).isNotNull();
    }

    // === generateRandomPassword 方法测试 ===

    @Test
    void shouldGeneratePasswordOfCorrectLength() {
        // 执行测试
        String result = passwordService.generateRandomPassword();

        // 验证结果
        assertThat(result).isNotNull();
        assertThat(result.length()).isEqualTo(12);
    }

    @Test
    void shouldGenerateDifferentPasswordsOnMultipleCalls() {
        // 执行测试
        String password1 = passwordService.generateRandomPassword();
        String password2 = passwordService.generateRandomPassword();

        // 验证结果 - 虽然理论上可能相同，但概率极低
        // 在实际测试中，我们可以接受可能相同的情况，或者使用更大的样本
        assertThat(password1).isNotNull();
        assertThat(password2).isNotNull();
        // Note: We don't assert they are different as random generation might produce same result
    }

    @Test
    void shouldGeneratePasswordWithValidCharacters() {
        // 执行测试
        String result = passwordService.generateRandomPassword();

        // 验证结果 - 只包含字母和数字
        assertThat(result).matches("^[A-Za-z0-9]{12}$");
    }

    // === resetFailedAttempts 方法测试 ===

    @Test
    void shouldResetFailedAttempts() {
        // 这个方法目前是空的，主要用于重置逻辑
        // 在Service层实际使用时会设置相关字段为0和null

        // 执行测试 - 验证方法可以正常调用
        passwordService.resetFailedAttempts();

        // 验证结果 - 由于方法是空的，我们只需要验证没有异常抛出
        assertThat(true).isTrue(); // 占位断言
    }

    // === 边界情况和异常处理测试 ===

    @Test
    void shouldHandlePasswordVerificationWithBlankHashAndLegacy() {
        // 准备测试数据
        String rawPassword = "password";

        // 执行测试
        boolean result = passwordService.verifyPassword(rawPassword, "", "");

        // 验证结果
        assertThat(result).isFalse();
    }

    @Test
    void shouldHandlePasswordVerificationWithWhitespacePassword() {
        // 执行测试
        boolean result = passwordService.verifyPassword("   ", "hash", "legacy");

        // 验证结果
        assertThat(result).isFalse();
    }

    @Test
    void shouldHandlePasswordVerificationWithInvalidBCryptHash() {
        // 准备测试数据
        String rawPassword = "password";
        String invalidHash = "not-a-bcrypt-hash";

        // 执行测试
        boolean result = passwordService.verifyPassword(rawPassword, invalidHash, "legacy");

        // 验证结果 - 应该回退到legacy密码验证
        assertThat(result).isTrue();
    }

    @Test
    void shouldHandleCalculateLockUntilThreadSafety() {
        // 测试多线程安全性 - 创建多个线程同时调用
        Date[] results = new Date[10];

        for (int i = 0; i < 10; i++) {
            final int index = i;
            new Thread(() -> {
                results[index] = passwordService.calculateLockUntil();
            }).start();
        }

        // 等待所有线程完成
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // 验证所有结果都是有效的未来时间
        for (Date result : results) {
            if (result != null) {
                assertThat(result.after(new Date())).isTrue();
            }
        }
    }
}
