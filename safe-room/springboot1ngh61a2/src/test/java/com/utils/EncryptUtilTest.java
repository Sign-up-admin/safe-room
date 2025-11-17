package com.utils;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class EncryptUtilTest {

    @Test
    void md5ShouldReturnKnownDigest() {
        assertThat(EncryptUtil.md5("test"))
                .isEqualTo("098f6bcd4621d373cade4e832627b4f6");
    }

    @Test
    void sha256ShouldReturnKnownDigest() {
        assertThat(EncryptUtil.sha256("test"))
                .isEqualTo("9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08");
    }

    @Test
    void encryptShouldHandleEmptyInputs() {
        assertThat(EncryptUtil.md5(null)).isEmpty();
        assertThat(EncryptUtil.sha256(null)).isEmpty();
        assertThat(EncryptUtil.md5("")).isEmpty();
        assertThat(EncryptUtil.sha256("")).isEmpty();
    }

    @Test
    void md5ShouldProduceConsistentResults() {
        String input = "Hello World";
        String hash1 = EncryptUtil.md5(input);
        String hash2 = EncryptUtil.md5(input);

        assertThat(hash1).isEqualTo(hash2);
        assertThat(hash1).hasSize(32); // MD5 produces 128-bit hash (32 hex chars)
    }

    @Test
    void sha256ShouldProduceConsistentResults() {
        String input = "Hello World";
        String hash1 = EncryptUtil.sha256(input);
        String hash2 = EncryptUtil.sha256(input);

        assertThat(hash1).isEqualTo(hash2);
        assertThat(hash1).hasSize(64); // SHA-256 produces 256-bit hash (64 hex chars)
    }

    @Test
    void md5ShouldProduceDifferentHashesForDifferentInputs() {
        String hash1 = EncryptUtil.md5("input1");
        String hash2 = EncryptUtil.md5("input2");

        assertThat(hash1).isNotEqualTo(hash2);
    }

    @Test
    void sha256ShouldProduceDifferentHashesForDifferentInputs() {
        String hash1 = EncryptUtil.sha256("input1");
        String hash2 = EncryptUtil.sha256("input2");

        assertThat(hash1).isNotEqualTo(hash2);
    }

    @Test
    void md5ShouldHandleSpecialCharacters() {
        String input = "特殊字符！@#$%^&*()";
        String hash = EncryptUtil.md5(input);

        assertThat(hash).isNotNull();
        assertThat(hash).hasSize(32);
        assertThat(hash).matches("[a-f0-9]+");
    }

    @Test
    void sha256ShouldHandleSpecialCharacters() {
        String input = "特殊字符！@#$%^&*()";
        String hash = EncryptUtil.sha256(input);

        assertThat(hash).isNotNull();
        assertThat(hash).hasSize(64);
        assertThat(hash).matches("[a-f0-9]+");
    }

    @Test
    void md5ShouldHandleUnicodeCharacters() {
        String input = "Unicode: 你好世界 🌍";
        String hash = EncryptUtil.md5(input);

        assertThat(hash).isNotNull();
        assertThat(hash).hasSize(32);
    }

    @Test
    void sha256ShouldHandleUnicodeCharacters() {
        String input = "Unicode: 你好世界 🌍";
        String hash = EncryptUtil.sha256(input);

        assertThat(hash).isNotNull();
        assertThat(hash).hasSize(64);
    }

    @Test
    void md5ShouldHandleLongInput() {
        StringBuilder longInput = new StringBuilder();
        for (int i = 0; i < 10000; i++) {
            longInput.append("a");
        }

        String hash = EncryptUtil.md5(longInput.toString());

        assertThat(hash).isNotNull();
        assertThat(hash).hasSize(32);
    }

    @Test
    void sha256ShouldHandleLongInput() {
        StringBuilder longInput = new StringBuilder();
        for (int i = 0; i < 10000; i++) {
            longInput.append("a");
        }

        String hash = EncryptUtil.sha256(longInput.toString());

        assertThat(hash).isNotNull();
        assertThat(hash).hasSize(64);
    }

    @Test
    void md5ShouldReturnLowercaseHex() {
        String hash = EncryptUtil.md5("Test");

        assertThat(hash).matches("[a-f0-9]+");
        assertThat(hash).doesNotContain("A", "B", "C", "D", "E", "F");
    }

    @Test
    void sha256ShouldReturnLowercaseHex() {
        String hash = EncryptUtil.sha256("Test");

        assertThat(hash).matches("[a-f0-9]+");
        assertThat(hash).doesNotContain("A", "B", "C", "D", "E", "F");
    }
}
