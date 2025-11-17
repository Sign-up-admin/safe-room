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
}


