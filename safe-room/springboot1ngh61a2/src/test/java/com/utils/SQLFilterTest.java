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

    @Test
    void sqlInjectShouldReturnNullWhenInputIsNull() {
        String result = SQLFilter.sqlInject(null);
        assertThat(result).isNull();
    }

    @Test
    void sqlInjectShouldReturnNullWhenInputIsEmptyString() {
        String result = SQLFilter.sqlInject("");
        assertThat(result).isNull();
    }

    @Test
    void sqlInjectShouldReturnNullWhenInputIsBlankString() {
        String result = SQLFilter.sqlInject("   ");
        assertThat(result).isNull();
    }

    @Test
    void sqlInjectShouldReturnNullWhenInputIsWhitespaceOnly() {
        String result = SQLFilter.sqlInject("\t\n\r");
        assertThat(result).isNull();
    }

    @Test
    void sqlInjectShouldRemoveSingleQuotes() {
        String result = SQLFilter.sqlInject("user'name");
        assertThat(result).isEqualTo("username");
    }

    @Test
    void sqlInjectShouldRemoveDoubleQuotes() {
        String result = SQLFilter.sqlInject("user\"name");
        assertThat(result).isEqualTo("username");
    }

    @Test
    void sqlInjectShouldRemoveSemicolons() {
        String result = SQLFilter.sqlInject("user;name");
        assertThat(result).isEqualTo("username");
    }

    @Test
    void sqlInjectShouldRemoveBackslashes() {
        String result = SQLFilter.sqlInject("user\\name");
        assertThat(result).isEqualTo("username");
    }

    @Test
    void sqlInjectShouldRemoveMultipleSpecialCharacters() {
        String result = SQLFilter.sqlInject("'user\"\\;name'");
        assertThat(result).isEqualTo("username");
    }

    @Test
    void sqlInjectShouldThrowWhenMasterKeywordDetected() {
        assertThatThrownBy(() -> SQLFilter.sqlInject("master"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("illegal");

        assertThatThrownBy(() -> SQLFilter.sqlInject("MASTER"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("illegal");

        assertThatThrownBy(() -> SQLFilter.sqlInject("Master"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("illegal");
    }

    @Test
    void sqlInjectShouldThrowWhenTruncateKeywordDetected() {
        assertThatThrownBy(() -> SQLFilter.sqlInject("truncate"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("illegal");

        assertThatThrownBy(() -> SQLFilter.sqlInject("TRUNCATE"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("illegal");
    }

    @Test
    void sqlInjectShouldThrowWhenInsertKeywordDetected() {
        assertThatThrownBy(() -> SQLFilter.sqlInject("insert"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("illegal");

        assertThatThrownBy(() -> SQLFilter.sqlInject("INSERT"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("illegal");
    }

    @Test
    void sqlInjectShouldThrowWhenSelectKeywordDetected() {
        assertThatThrownBy(() -> SQLFilter.sqlInject("select"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("illegal");

        assertThatThrownBy(() -> SQLFilter.sqlInject("SELECT"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("illegal");
    }

    @Test
    void sqlInjectShouldThrowWhenDeleteKeywordDetected() {
        assertThatThrownBy(() -> SQLFilter.sqlInject("delete"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("illegal");

        assertThatThrownBy(() -> SQLFilter.sqlInject("DELETE"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("illegal");
    }

    @Test
    void sqlInjectShouldThrowWhenUpdateKeywordDetected() {
        assertThatThrownBy(() -> SQLFilter.sqlInject("update"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("illegal");

        assertThatThrownBy(() -> SQLFilter.sqlInject("UPDATE"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("illegal");
    }

    @Test
    void sqlInjectShouldThrowWhenDeclareKeywordDetected() {
        assertThatThrownBy(() -> SQLFilter.sqlInject("declare"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("illegal");

        assertThatThrownBy(() -> SQLFilter.sqlInject("DECLARE"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("illegal");
    }

    @Test
    void sqlInjectShouldThrowWhenAlterKeywordDetected() {
        assertThatThrownBy(() -> SQLFilter.sqlInject("alter"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("illegal");

        assertThatThrownBy(() -> SQLFilter.sqlInject("ALTER"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("illegal");
    }

    @Test
    void sqlInjectShouldThrowWhenDropKeywordDetected() {
        assertThatThrownBy(() -> SQLFilter.sqlInject("drop"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("illegal");

        assertThatThrownBy(() -> SQLFilter.sqlInject("DROP"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("illegal");
    }

    @Test
    void sqlInjectShouldThrowWhenExecKeywordDetected() {
        assertThatThrownBy(() -> SQLFilter.sqlInject("exec"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("illegal");

        assertThatThrownBy(() -> SQLFilter.sqlInject("EXEC"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("illegal");
    }

    @Test
    void sqlInjectShouldThrowWhenExecuteKeywordDetected() {
        assertThatThrownBy(() -> SQLFilter.sqlInject("execute"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("illegal");

        assertThatThrownBy(() -> SQLFilter.sqlInject("EXECUTE"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("illegal");
    }

    @Test
    void sqlInjectShouldThrowWhenKeywordInMiddleOfString() {
        assertThatThrownBy(() -> SQLFilter.sqlInject("userselectpassword"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("illegal");

        assertThatThrownBy(() -> SQLFilter.sqlInject("mydeletetable"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("illegal");
    }

    @Test
    void sqlInjectShouldThrowWhenMultipleKeywordsDetected() {
        assertThatThrownBy(() -> SQLFilter.sqlInject("select * from users; drop table admin"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("illegal");
    }

    @Test
    void sqlInjectShouldReturnValidStringWhenNoIllegalKeywords() {
        String result = SQLFilter.sqlInject("validUserName123");
        assertThat(result).isEqualTo("validusername123");

        result = SQLFilter.sqlInject("user_name");
        assertThat(result).isEqualTo("user_name");

        result = SQLFilter.sqlInject("email@domain.com");
        assertThat(result).isEqualTo("email@domain.com");
    }

    @Test
    void sqlInjectShouldHandleMixedCaseKeywords() {
        assertThatThrownBy(() -> SQLFilter.sqlInject("SeLeCt"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("illegal");

        assertThatThrownBy(() -> SQLFilter.sqlInject("DeLeTe"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("illegal");
    }

    @Test
    void sqlInjectShouldProcessSpecialCharsBeforeKeywordCheck() {
        // 移除引号后变成select，应该抛出异常
        assertThatThrownBy(() -> SQLFilter.sqlInject("'sel'ect"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("illegal");

        // 移除反斜杠后变成select，应该抛出异常
        assertThatThrownBy(() -> SQLFilter.sqlInject("sel\\ect"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("illegal");
    }
}


