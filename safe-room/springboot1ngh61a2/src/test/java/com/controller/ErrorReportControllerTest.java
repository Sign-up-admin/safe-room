package com.controller;

import com.controller.support.AbstractControllerIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.List;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ErrorReportControllerTest extends AbstractControllerIntegrationTest {

    @Test
    void shouldAcceptSingleErrorReport() throws Exception {
        Map<String, Object> payload = Map.of(
                "type", "TestError",
                "message", "Something went wrong",
                "url", "/test",
                "timestamp", "2025-01-01T00:00:00Z",
                "userAgent", "JUnit"
        );

        postJson("/api/error/report", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("Error report received"));
    }

    @Test
    void shouldAcceptBatchErrorReport() throws Exception {
        List<Map<String, Object>> payload = List.of(
                Map.of("type", "BatchError1", "message", "First", "url", "/first"),
                Map.of("type", "BatchError2", "message", "Second", "url", "/second")
        );

        mockMvc.perform(post("/api/error/report/batch")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsBytes(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.processed").value(2));
    }
}


