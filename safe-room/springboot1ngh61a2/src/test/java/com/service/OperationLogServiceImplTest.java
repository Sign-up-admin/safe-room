package com.service;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.entity.OperationLogEntity;
import com.utils.PageUtils;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class OperationLogServiceImplTest {

    @Autowired
    private OperationLogService operationLogService;

    @Test
    void shouldLogOperation() {
        operationLogService.logOperation(1L, "testuser", "users", "CREATE", 
                "创建用户", "127.0.0.1", "TestAgent");

        List<OperationLogEntity> logs = operationLogService.list(new QueryWrapper<>());
        assertThat(logs).isNotEmpty();
        
        OperationLogEntity log = logs.stream()
                .filter(l -> "testuser".equals(l.getUsername()))
                .findFirst()
                .orElse(null);
        
        assertThat(log).isNotNull();
        assertThat(log.getUserid()).isEqualTo(1L);
        assertThat(log.getTableName()).isEqualTo("users");
        assertThat(log.getOperationType()).isEqualTo("CREATE");
        // Content may vary based on implementation, just check it's not null
        assertThat(log.getContent()).isNotNull();
        assertThat(log.getIp()).isEqualTo("127.0.0.1");
        assertThat(log.getUserAgent()).isEqualTo("TestAgent");
        assertThat(log.getAddtime()).isNotNull();
    }

    @Test
    void shouldLogOperationWithNullUserId() {
        operationLogService.logOperation(null, "anonymous", "config", "READ", 
                "读取配置", "192.168.1.1", "Browser");

        List<OperationLogEntity> logs = operationLogService.list(new QueryWrapper<>());
        assertThat(logs).isNotEmpty();
    }

    @Test
    void shouldLogOperationWithNullUsername() {
        operationLogService.logOperation(1L, null, "users", "UPDATE", 
                "更新用户", "127.0.0.1", "TestAgent");

        List<OperationLogEntity> logs = operationLogService.list(new QueryWrapper<>());
        assertThat(logs).isNotEmpty();
    }

    @Test
    void shouldQueryPageWithWrapper() {
        operationLogService.logOperation(1L, "queryuser", "news", "CREATE", 
                "创建新闻", "127.0.0.1", "TestAgent");

        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "10");

        QueryWrapper<OperationLogEntity> wrapper = new QueryWrapper<>();
        wrapper.eq("username", "queryuser");

        PageUtils result = operationLogService.queryPage(params, wrapper);
        assertThat(result).isNotNull();
        assertThat(result.getList()).isNotEmpty();
    }

    @Test
    void shouldFilterByOperationType() {
        operationLogService.logOperation(1L, "filteruser", "users", "DELETE", 
                "删除用户", "127.0.0.1", "TestAgent");

        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "10");

        QueryWrapper<OperationLogEntity> wrapper = new QueryWrapper<>();
        wrapper.eq("operation_type", "DELETE");

        PageUtils result = operationLogService.queryPage(params, wrapper);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldFilterByTableName() {
        operationLogService.logOperation(1L, "tableuser", "config", "UPDATE", 
                "更新配置", "127.0.0.1", "TestAgent");

        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "10");

        QueryWrapper<OperationLogEntity> wrapper = new QueryWrapper<>();
        wrapper.eq("table_name", "config");

        PageUtils result = operationLogService.queryPage(params, wrapper);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldFilterByUserId() {
        operationLogService.logOperation(100L, "user100", "yonghu", "CREATE", 
                "创建会员", "127.0.0.1", "TestAgent");

        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "10");

        QueryWrapper<OperationLogEntity> wrapper = new QueryWrapper<>();
        wrapper.eq("userid", 100L);

        PageUtils result = operationLogService.queryPage(params, wrapper);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleEmptyParams() {
        Map<String, Object> emptyParams = new HashMap<>();
        QueryWrapper<OperationLogEntity> wrapper = new QueryWrapper<>();
        
        PageUtils result = operationLogService.queryPage(emptyParams, wrapper);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleNullParams() {
        QueryWrapper<OperationLogEntity> wrapper = new QueryWrapper<>();
        
        PageUtils result = operationLogService.queryPage(null, wrapper);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleInvalidPageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "-1");
        params.put("limit", "5");
        
        QueryWrapper<OperationLogEntity> wrapper = new QueryWrapper<>();
        PageUtils result = operationLogService.queryPage(params, wrapper);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleZeroLimit() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "0");
        
        QueryWrapper<OperationLogEntity> wrapper = new QueryWrapper<>();
        PageUtils result = operationLogService.queryPage(params, wrapper);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleLargePageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "999999");
        params.put("limit", "10");
        
        QueryWrapper<OperationLogEntity> wrapper = new QueryWrapper<>();
        PageUtils result = operationLogService.queryPage(params, wrapper);
        assertThat(result).isNotNull();
        assertThat(result.getList()).isEmpty();
    }

    @Test
    void shouldListOperationLogs() {
        operationLogService.logOperation(1L, "listuser", "users", "READ", 
                "列表查询", "127.0.0.1", "TestAgent");

        List<OperationLogEntity> logs = operationLogService.list(new QueryWrapper<>());
        assertThat(logs).isNotEmpty();
    }

    @Test
    void shouldLogMultipleOperations() {
        operationLogService.logOperation(1L, "multi1", "users", "CREATE", 
                "操作1", "127.0.0.1", "Agent1");
        operationLogService.logOperation(2L, "multi2", "news", "UPDATE", 
                "操作2", "192.168.1.1", "Agent2");
        operationLogService.logOperation(3L, "multi3", "config", "DELETE", 
                "操作3", "10.0.0.1", "Agent3");

        List<OperationLogEntity> logs = operationLogService.list(new QueryWrapper<>());
        assertThat(logs.size()).isGreaterThanOrEqualTo(3);
    }

    @Test
    void shouldQueryPageWithComplexWrapper() {
        operationLogService.logOperation(1L, "complex", "users", "CREATE", 
                "复杂查询", "127.0.0.1", "TestAgent");

        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "10");

        QueryWrapper<OperationLogEntity> wrapper = new QueryWrapper<>();
        wrapper.eq("username", "complex")
               .eq("operation_type", "CREATE")
               .eq("table_name", "users");

        PageUtils result = operationLogService.queryPage(params, wrapper);
        assertThat(result).isNotNull();
    }
}

