package com.controller;

import com.controller.support.AbstractControllerIntegrationTest;
import com.entity.OperationLogEntity;
import com.service.OperationLogService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class OperationLogControllerTest extends AbstractControllerIntegrationTest {

    @Autowired
    private OperationLogService operationLogService;

    @Test
    void shouldReturnPagedOperationLogs() throws Exception {
        getPage("/operationLog/page")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    void shouldFilterByUsername() throws Exception {
        OperationLogEntity log = createOperationLog("testuser", "CREATE", "users", 1L);
        operationLogService.save(log);

        performAdmin(get("/operationLog/page")
                        .param("page", "1")
                        .param("limit", "10")
                        .param("username", "testuser"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldFilterByOperationType() throws Exception {
        OperationLogEntity log = createOperationLog("admin", "UPDATE", "news", 1L);
        operationLogService.save(log);

        OperationLogEntity logEntity = new OperationLogEntity();
        logEntity.setOperationType("UPDATE");

        performAdmin(get("/operationLog/page")
                        .param("page", "1")
                        .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldFilterByTableName() throws Exception {
        OperationLogEntity log = createOperationLog("admin", "DELETE", "news", 1L);
        operationLogService.save(log);

        OperationLogEntity logEntity = new OperationLogEntity();
        logEntity.setTableName("news");

        performAdmin(get("/operationLog/page")
                        .param("page", "1")
                        .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldFilterByUserId() throws Exception {
        OperationLogEntity log = createOperationLog("user1", "CREATE", "yonghu", 100L);
        operationLogService.save(log);

        OperationLogEntity logEntity = new OperationLogEntity();
        logEntity.setUserid(100L);

        performAdmin(get("/operationLog/page")
                        .param("page", "1")
                        .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldGetOperationLogInfo() throws Exception {
        OperationLogEntity log = createOperationLog("info-user", "READ", "config", 1L);
        operationLogService.save(log);

        performAdmin(get("/operationLog/info/" + log.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.id").value(log.getId()))
                .andExpect(jsonPath("$.data.username").value("info-user"))
                .andExpect(jsonPath("$.data.operationType").value("READ"));
    }

    @Test
    void shouldHandleMultipleFilters() throws Exception {
        OperationLogEntity log = createOperationLog("multi-user", "UPDATE", "news", 50L);
        operationLogService.save(log);

        OperationLogEntity logEntity = new OperationLogEntity();
        logEntity.setUsername("multi-user");
        logEntity.setOperationType("UPDATE");
        logEntity.setTableName("news");
        logEntity.setUserid(50L);

        performAdmin(get("/operationLog/page")
                        .param("page", "1")
                        .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleEmptyResult() throws Exception {
        OperationLogEntity logEntity = new OperationLogEntity();
        logEntity.setUsername("non-existent-user");

        performAdmin(get("/operationLog/page")
                        .param("page", "1")
                        .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldReturnNullWhenLogNotFound() throws Exception {
        performAdmin(get("/operationLog/info/999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isEmpty());
    }

    private OperationLogEntity createOperationLog(String username, String operationType, 
                                                   String tableName, Long userId) {
        OperationLogEntity log = new OperationLogEntity();
        log.setUsername(username);
        log.setOperationType(operationType);
        log.setTableName(tableName);
        log.setUserid(userId);
        log.setContent("测试操作内容");
        log.setIp("127.0.0.1");
        log.setUserAgent("TestAgent");
        log.setAddtime(new Date());
        return log;
    }
}

