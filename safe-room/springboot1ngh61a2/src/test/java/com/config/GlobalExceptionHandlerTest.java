package com.config;

import com.entity.EIException;
import com.utils.R;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletResponse;

import java.sql.SQLException;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleEIExceptionShouldSurfaceCustomCodeAndMessage() {
        R response = handler.handleEIException(new EIException("boom", 418));

        assertThat(response.get("code")).isEqualTo(418);
        assertThat(response.get("msg")).isEqualTo("boom");
    }

    @Test
    void handleSQLExceptionShouldReturnFriendlyMessage() {
        R response = handler.handleSQLException(new SQLException("syntax error"));

        assertThat(response.get("code")).isEqualTo(500);
        assertThat(response.get("msg")).asString().contains("syntax error");
    }

    @Test
    void handleIllegalArgumentShouldUse400Code() {
        R response = handler.handleIllegalArgumentException(new IllegalArgumentException("bad input"));

        assertThat(response.get("code")).isEqualTo(400);
        assertThat(response.get("msg")).isEqualTo("Invalid parameter: bad input");
    }

    @Test
    void handleUnexpectedExceptionShouldWrapMessage() {
        MockHttpServletResponse mockResponse = new MockHttpServletResponse();
        R response = handler.handleException(new RuntimeException("something unexpected"), mockResponse);

        assertThat(response.get("code")).isEqualTo(500);
        assertThat(response.get("msg")).isEqualTo("An unexpected error occurred: something unexpected");
    }

    @Test
    void handleNullPointerExceptionShouldReturn500Code() {
        MockHttpServletResponse mockResponse = new MockHttpServletResponse();
        R response = handler.handleException(new NullPointerException("null reference"), mockResponse);

        assertThat(response.get("code")).isEqualTo(500);
        assertThat(response.get("msg")).isEqualTo("An unexpected error occurred: null reference");
    }

    @Test
    void handleNumberFormatExceptionShouldReturn500Code() {
        MockHttpServletResponse mockResponse = new MockHttpServletResponse();
        R response = handler.handleException(new NumberFormatException("invalid number"), mockResponse);

        assertThat(response.get("code")).isEqualTo(500);
        assertThat(response.get("msg")).isEqualTo("An unexpected error occurred: invalid number");
    }

    @Test
    void handleExceptionWithNullMessageShouldHandleGracefully() {
        MockHttpServletResponse mockResponse = new MockHttpServletResponse();
        RuntimeException exception = new RuntimeException((String) null);
        R response = handler.handleException(exception, mockResponse);

        assertThat(response.get("code")).isEqualTo(500);
        assertThat(response.get("msg")).isEqualTo("An unexpected error occurred");
    }

    @Test
    void handleSQLExceptionWithNullCauseShouldHandleGracefully() {
        SQLException sqlException = new SQLException("database error", (String) null, 0, null);
        R response = handler.handleSQLException(sqlException);

        assertThat(response.get("code")).isEqualTo(500);
        assertThat(response.get("msg")).asString().contains("database error");
    }

    @Test
    void handleEIExceptionWithNullMessageShouldHandleGracefully() {
        EIException eiException = new EIException(null, 404);
        R response = handler.handleEIException(eiException);

        assertThat(response.get("code")).isEqualTo(404);
        assertThat(response.get("msg")).isNull();
    }
}


