package com.utils;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class SQLFilterTest {

    @Test
    void sqlInjectShouldNormalizeAndLowercase() {
        String sanitized = SQLFilter.sqlInject("UserName");

        assertThat(sanitized).isEqualTo("username");
    }

    @Test
    void sqlInjectShouldThrowWhenIllegalKeywordDetected() {
        assertThatThrownBy(() -> SQLFilter.sqlInject("SELECT * FROM users"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("illegal");
    }
}


