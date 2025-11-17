package com.utils;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * PasswordEncoderUtil单元测试
 */
class PasswordEncoderUtilTest {

    @Test
    void shouldEncodePasswordSuccessfully() {
        String rawPassword = "password123";
        String encodedPassword = PasswordEncoderUtil.encode(rawPassword);

        assertThat(encodedPassword)
            .isNotNull()
            .isNotEqualTo(rawPassword)
            .startsWith("$2a$")
            .hasSize(60);
    }

    @Test
    void shouldThrowExceptionForNullPassword() {
        assertThatThrownBy(() -> PasswordEncoderUtil.encode(null))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("密码不能为空");
    }

    @Test
    void shouldThrowExceptionForEmptyPassword() {
        assertThatThrownBy(() -> PasswordEncoderUtil.encode(""))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("密码不能为空");
    }

    @Test
    void shouldThrowExceptionForBlankPassword() {
        assertThatThrownBy(() -> PasswordEncoderUtil.encode("   "))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessage("密码不能为空");
    }

    @Test
    void shouldMatchPasswordCorrectly() {
        String rawPassword = "testPassword123";
        String encodedPassword = PasswordEncoderUtil.encode(rawPassword);

        boolean matches = PasswordEncoderUtil.matches(rawPassword, encodedPassword);
        assertThat(matches).isTrue();
    }

    @Test
    void shouldNotMatchWrongPassword() {
        String rawPassword = "correctPassword";
        String wrongPassword = "wrongPassword";
        String encodedPassword = PasswordEncoderUtil.encode(rawPassword);

        boolean matches = PasswordEncoderUtil.matches(wrongPassword, encodedPassword);
        assertThat(matches).isFalse();
    }

    @Test
    void shouldReturnFalseForNullRawPassword() {
        String encodedPassword = PasswordEncoderUtil.encode("password");
        boolean matches = PasswordEncoderUtil.matches(null, encodedPassword);
        assertThat(matches).isFalse();
    }

    @Test
    void shouldReturnFalseForNullEncodedPassword() {
        boolean matches = PasswordEncoderUtil.matches("password", null);
        assertThat(matches).isFalse();
    }

    @Test
    void shouldReturnFalseForBothNullPasswords() {
        boolean matches = PasswordEncoderUtil.matches(null, null);
        assertThat(matches).isFalse();
    }

    @Test
    void shouldReturnFalseForEmptyPasswords() {
        boolean matches = PasswordEncoderUtil.matches("", "");
        assertThat(matches).isFalse();
    }

    @Test
    void shouldRecognizeBCryptHashFormat() {
        String encodedPassword = PasswordEncoderUtil.encode("password");
        boolean isBCrypt = PasswordEncoderUtil.isBCryptHash(encodedPassword);
        assertThat(isBCrypt).isTrue();
    }

    @Test
    void shouldReturnFalseForNonBCryptStrings() {
        // 测试普通字符串
        assertThat(PasswordEncoderUtil.isBCryptHash("plainText")).isFalse();

        // 测试null
        assertThat(PasswordEncoderUtil.isBCryptHash(null)).isFalse();

        // 测试空字符串
        assertThat(PasswordEncoderUtil.isBCryptHash("")).isFalse();

        // 测试短字符串
        assertThat(PasswordEncoderUtil.isBCryptHash("short")).isFalse();

        // 测试长字符串但不是BCrypt格式
        assertThat(PasswordEncoderUtil.isBCryptHash("a".repeat(60))).isFalse();

        // 测试以$2开头但不是有效的BCrypt格式
        assertThat(PasswordEncoderUtil.isBCryptHash("$2c$" + "a".repeat(57))).isFalse();
    }

    @Test
    void shouldRecognizeDifferentBCryptVersions() {
        // BCrypt hashes can start with $2a$, $2b$, or $2y$
        String hash2a = "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfBPj6fWdT9OjK";
        String hash2b = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfBPj6fWdT9OjK";
        String hash2y = "$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfBPj6fWdT9OjK";

        assertThat(PasswordEncoderUtil.isBCryptHash(hash2a)).isTrue();
        assertThat(PasswordEncoderUtil.isBCryptHash(hash2b)).isTrue();
        assertThat(PasswordEncoderUtil.isBCryptHash(hash2y)).isTrue();
    }

    @Test
    void shouldHandlePasswordWithSpecialCharacters() {
        String specialPassword = "P@ssw0rd!#$%^&*()";
        String encodedPassword = PasswordEncoderUtil.encode(specialPassword);

        assertThat(PasswordEncoderUtil.matches(specialPassword, encodedPassword)).isTrue();
        assertThat(PasswordEncoderUtil.isBCryptHash(encodedPassword)).isTrue();
    }

    @Test
    void shouldGenerateDifferentHashesForSamePassword() {
        String password = "samePassword";
        String hash1 = PasswordEncoderUtil.encode(password);
        String hash2 = PasswordEncoderUtil.encode(password);

        // 每次加密应该产生不同的哈希值（由于盐值不同）
        assertThat(hash1).isNotEqualTo(hash2);

        // 但都应该匹配原始密码
        assertThat(PasswordEncoderUtil.matches(password, hash1)).isTrue();
        assertThat(PasswordEncoderUtil.matches(password, hash2)).isTrue();
    }

    @Test
    void shouldHandleVeryLongPasswords() {
        String longPassword = "a".repeat(1000);
        String encodedPassword = PasswordEncoderUtil.encode(longPassword);

        assertThat(PasswordEncoderUtil.matches(longPassword, encodedPassword)).isTrue();
        assertThat(PasswordEncoderUtil.isBCryptHash(encodedPassword)).isTrue();
    }

    @Test
    void shouldHandleUnicodePasswords() {
        String unicodePassword = "密码123！@#";
        String encodedPassword = PasswordEncoderUtil.encode(unicodePassword);

        assertThat(PasswordEncoderUtil.matches(unicodePassword, encodedPassword)).isTrue();
        assertThat(PasswordEncoderUtil.isBCryptHash(encodedPassword)).isTrue();
    }

    @Test
    void shouldValidateHashLength() {
        // BCrypt哈希应该是60个字符
        String encodedPassword = PasswordEncoderUtil.encode("password");
        assertThat(encodedPassword).hasSize(60);

        // 测试不是60字符的字符串
        assertThat(PasswordEncoderUtil.isBCryptHash("short")).isFalse();
        assertThat(PasswordEncoderUtil.isBCryptHash("a".repeat(59))).isFalse();
        assertThat(PasswordEncoderUtil.isBCryptHash("a".repeat(61))).isFalse();
    }
}
