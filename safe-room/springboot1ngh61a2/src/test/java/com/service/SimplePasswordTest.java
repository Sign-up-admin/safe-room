package com.service;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

/**
 * Simple test to verify PasswordService basic functionality
 */
class SimplePasswordTest {

    @Test
    void testPasswordServiceExists() {
        PasswordService service = new PasswordService();
        assertThat(service).isNotNull();
    }

    @Test
    void testVerifyPasswordWithNull() {
        PasswordService service = new PasswordService();
        boolean result = service.verifyPassword(null, "hash", "legacy");
        assertThat(result).isFalse();
    }
}
