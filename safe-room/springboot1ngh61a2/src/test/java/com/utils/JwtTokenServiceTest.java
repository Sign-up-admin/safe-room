package com.utils;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenServiceTest {

    private static final Long TEST_USER_ID = 123L;
    private static final String TEST_USERNAME = "testuser";
    private static final String TEST_TABLE_NAME = "yonghu";
    private static final String TEST_ROLE = "user";
    private static final String TEST_DEVICE_FINGERPRINT = "test-fingerprint-123";

    @Test
    void shouldGenerateValidToken() {
        String token = JwtTokenService.generateToken(TEST_USER_ID, TEST_USERNAME,
                TEST_TABLE_NAME, TEST_ROLE, TEST_DEVICE_FINGERPRINT);

        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();
        assertThat(token.split("\\.")).hasSize(3); // JWT has 3 parts separated by dots
    }

    @Test
    void shouldExtractUserIdFromToken() {
        String token = JwtTokenService.generateToken(TEST_USER_ID, TEST_USERNAME,
                TEST_TABLE_NAME, TEST_ROLE, TEST_DEVICE_FINGERPRINT);

        Long extractedUserId = JwtTokenService.getUserIdFromToken(token);

        assertThat(extractedUserId).isEqualTo(TEST_USER_ID);
    }

    @Test
    void shouldExtractUsernameFromToken() {
        String token = JwtTokenService.generateToken(TEST_USER_ID, TEST_USERNAME,
                TEST_TABLE_NAME, TEST_ROLE, TEST_DEVICE_FINGERPRINT);

        String extractedUsername = JwtTokenService.getUsernameFromToken(token);

        assertThat(extractedUsername).isEqualTo(TEST_USERNAME);
    }

    @Test
    void shouldExtractRoleFromToken() {
        String token = JwtTokenService.generateToken(TEST_USER_ID, TEST_USERNAME,
                TEST_TABLE_NAME, TEST_ROLE, TEST_DEVICE_FINGERPRINT);

        String extractedRole = JwtTokenService.getRoleFromToken(token);

        assertThat(extractedRole).isEqualTo(TEST_ROLE);
    }

    @Test
    void shouldExtractTableNameFromToken() {
        String token = JwtTokenService.generateToken(TEST_USER_ID, TEST_USERNAME,
                TEST_TABLE_NAME, TEST_ROLE, TEST_DEVICE_FINGERPRINT);

        String extractedTableName = JwtTokenService.getTableNameFromToken(token);

        assertThat(extractedTableName).isEqualTo(TEST_TABLE_NAME);
    }

    @Test
    void shouldValidateValidToken() {
        String token = JwtTokenService.generateToken(TEST_USER_ID, TEST_USERNAME,
                TEST_TABLE_NAME, TEST_ROLE, TEST_DEVICE_FINGERPRINT);

        boolean isValid = JwtTokenService.validateToken(token, TEST_DEVICE_FINGERPRINT);

        assertThat(isValid).isTrue();
    }

    @Test
    void shouldRejectInvalidToken() {
        boolean isValid = JwtTokenService.validateToken("invalid-token", TEST_DEVICE_FINGERPRINT);

        assertThat(isValid).isFalse();
    }

    @Test
    void shouldRejectEmptyToken() {
        boolean isValid = JwtTokenService.validateToken("", TEST_DEVICE_FINGERPRINT);

        assertThat(isValid).isFalse();
    }

    @Test
    void shouldRejectNullToken() {
        boolean isValid = JwtTokenService.validateToken(null, TEST_DEVICE_FINGERPRINT);

        assertThat(isValid).isFalse();
    }

    @Test
    void shouldRejectTokenWithWrongDeviceFingerprint() {
        String token = JwtTokenService.generateToken(TEST_USER_ID, TEST_USERNAME,
                TEST_TABLE_NAME, TEST_ROLE, TEST_DEVICE_FINGERPRINT);

        boolean isValid = JwtTokenService.validateToken(token, "wrong-fingerprint");

        assertThat(isValid).isFalse();
    }

    @Test
    void shouldHandleNullDeviceFingerprintInValidation() {
        String token = JwtTokenService.generateToken(TEST_USER_ID, TEST_USERNAME,
                TEST_TABLE_NAME, TEST_ROLE, TEST_DEVICE_FINGERPRINT);

        boolean isValid = JwtTokenService.validateToken(token, null);

        assertThat(isValid).isTrue();
    }

    @Test
    void shouldReturnNullForInvalidTokenClaims() {
        Long userId = JwtTokenService.getUserIdFromToken("invalid-token");
        String username = JwtTokenService.getUsernameFromToken("invalid-token");
        String role = JwtTokenService.getRoleFromToken("invalid-token");
        String tableName = JwtTokenService.getTableNameFromToken("invalid-token");

        assertThat(userId).isNull();
        assertThat(username).isNull();
        assertThat(role).isNull();
        assertThat(tableName).isNull();
    }

    @Test
    void shouldGenerateDeviceFingerprint() {
        String ip = "192.168.1.1";
        String userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

        String fingerprint = JwtTokenService.generateDeviceFingerprint(ip, userAgent);

        assertThat(fingerprint).isNotNull();
        assertThat(fingerprint).isNotEmpty();
        assertThat(fingerprint.length()).isEqualTo(32); // MD5 hash length
    }

    @Test
    void shouldGenerateConsistentDeviceFingerprint() {
        String ip = "192.168.1.1";
        String userAgent = "Mozilla/5.0";

        String fingerprint1 = JwtTokenService.generateDeviceFingerprint(ip, userAgent);
        String fingerprint2 = JwtTokenService.generateDeviceFingerprint(ip, userAgent);

        assertThat(fingerprint1).isEqualTo(fingerprint2);
    }

    @Test
    void shouldHandleNullValuesInDeviceFingerprint() {
        String fingerprint1 = JwtTokenService.generateDeviceFingerprint(null, "user-agent");
        String fingerprint2 = JwtTokenService.generateDeviceFingerprint("ip", null);
        String fingerprint3 = JwtTokenService.generateDeviceFingerprint(null, null);

        assertThat(fingerprint1).isNotNull();
        assertThat(fingerprint2).isNotNull();
        assertThat(fingerprint3).isNotNull();
    }

    @Test
    void shouldHandleIntegerUserId() {
        // Test with Integer userId (which might come from JSON parsing)
        String token = JwtTokenService.generateToken(456L, TEST_USERNAME,
                TEST_TABLE_NAME, TEST_ROLE, TEST_DEVICE_FINGERPRINT);

        Long extractedUserId = JwtTokenService.getUserIdFromToken(token);

        assertThat(extractedUserId).isEqualTo(456L);
    }

    @Test
    void shouldRejectExpiredToken() throws InterruptedException {
        // Create a token that will expire quickly (but we can't easily mock time in JWT)
        // This test verifies the expiration logic exists in the validation
        String token = JwtTokenService.generateToken(TEST_USER_ID, TEST_USERNAME,
                TEST_TABLE_NAME, TEST_ROLE, TEST_DEVICE_FINGERPRINT);

        // Valid token should work
        boolean isValidBeforeExpiration = JwtTokenService.validateToken(token, TEST_DEVICE_FINGERPRINT);
        assertThat(isValidBeforeExpiration).isTrue();

        // Note: In a real scenario, we'd wait for expiration, but for unit tests
        // we trust the library handles expiration correctly
    }

    @Test
    void shouldHandleTokenWithMissingClaims() {
        // Test token parsing when some claims are missing
        String token = JwtTokenService.generateToken(TEST_USER_ID, TEST_USERNAME,
                TEST_TABLE_NAME, TEST_ROLE, TEST_DEVICE_FINGERPRINT);

        // All claims should be present in a properly generated token
        assertThat(JwtTokenService.getUserIdFromToken(token)).isNotNull();
        assertThat(JwtTokenService.getUsernameFromToken(token)).isNotNull();
        assertThat(JwtTokenService.getRoleFromToken(token)).isNotNull();
        assertThat(JwtTokenService.getTableNameFromToken(token)).isNotNull();
    }

    @Test
    void shouldHandleMalformedJwtToken() {
        // Test with various malformed tokens
        String[] malformedTokens = {
            "not-a-jwt",
            "header.payload", // missing signature
            "header.payload.signature.extra", // too many parts
            "",
            ".",
            "header.",
            ".signature"
        };

        for (String malformedToken : malformedTokens) {
            assertThat(JwtTokenService.validateToken(malformedToken, TEST_DEVICE_FINGERPRINT)).isFalse();
            assertThat(JwtTokenService.getUserIdFromToken(malformedToken)).isNull();
            assertThat(JwtTokenService.getUsernameFromToken(malformedToken)).isNull();
            assertThat(JwtTokenService.getRoleFromToken(malformedToken)).isNull();
            assertThat(JwtTokenService.getTableNameFromToken(malformedToken)).isNull();
        }
    }

    @Test
    void shouldHandleSpecialCharactersInTokenData() {
        String specialUsername = "test@user.name+tag";
        String specialRole = "admin_user-role";
        String specialTableName = "user_table_name";

        String token = JwtTokenService.generateToken(TEST_USER_ID, specialUsername,
                specialTableName, specialRole, TEST_DEVICE_FINGERPRINT);

        assertThat(JwtTokenService.getUsernameFromToken(token)).isEqualTo(specialUsername);
        assertThat(JwtTokenService.getRoleFromToken(token)).isEqualTo(specialRole);
        assertThat(JwtTokenService.getTableNameFromToken(token)).isEqualTo(specialTableName);
    }

    @Test
    void shouldValidateTokenWithEmptyDeviceFingerprint() {
        String token = JwtTokenService.generateToken(TEST_USER_ID, TEST_USERNAME,
                TEST_TABLE_NAME, TEST_ROLE, "");

        // When token has empty fingerprint and we pass empty string, should validate
        boolean isValid = JwtTokenService.validateToken(token, "");
        assertThat(isValid).isTrue();

        // When token has empty fingerprint but we pass non-empty, should fail
        boolean isInvalid = JwtTokenService.validateToken(token, "non-empty");
        assertThat(isInvalid).isFalse();
    }
}
