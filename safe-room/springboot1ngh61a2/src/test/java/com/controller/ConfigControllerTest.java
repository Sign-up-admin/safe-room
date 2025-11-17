package com.controller;

import com.controller.support.AbstractControllerIntegrationTest;
import com.entity.ConfigEntity;
import com.service.ConfigService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Tags({
    @Tag("integration"),
    @Tag("controller"),
    @Tag("config")
})
class ConfigControllerTest extends AbstractControllerIntegrationTest {

    @Autowired
    private ConfigService configService;

    @AfterEach
    void cleanupTestData() {
        // 清理所有测试配置数据
        try {
            configService.list().stream()
                    .filter(config -> config.getName() != null &&
                            (config.getName().startsWith("test-config") ||
                             config.getName().startsWith("update-config") ||
                             config.getName().startsWith("delete-config") ||
                             config.getName().contains("测试配置")))
                    .forEach(config -> {
                        try {
                            configService.removeById(config.getId());
                        } catch (Exception e) {
                            // 忽略删除失败的情况（可能已经被其他测试删除）
                        }
                    });
        } catch (Exception e) {
            // 忽略清理过程中的异常
        }
    }

    @Test
    void shouldReturnPagedConfigs() throws Exception {
        performAdmin(get("/config/page"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    void shouldReturnConfigList() throws Exception {
        getPage("/config/list")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    void shouldGetConfigInfo() throws Exception {
        // 使用已存在的配置进行测试 (id=1)
        performAdmin(get("/config/info/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldCreateConfig() throws Exception {
        // 使用唯一的名称避免冲突
        String uniqueName = "test-config-" + System.currentTimeMillis();
        ConfigEntity newConfig = createTestConfig(uniqueName, "测试配置值");
        // 确保ID为null，让数据库自动生成
        newConfig.setId(null);

        postJson("/config/save", newConfig)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldUpdateConfig() throws Exception {
        // 使用唯一名称避免冲突
        String uniqueName = "update-config-" + System.currentTimeMillis();
        // 先创建一个配置用于更新测试
        ConfigEntity config = persistConfig(uniqueName, "更新测试配置");

        config.setValue("更新后的值");

        postJson("/config/update", config)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    private ConfigEntity createTestConfig(String name, String value) {
        ConfigEntity config = new ConfigEntity();
        config.setId(null); // 确保ID为null，让数据库自动生成
        config.setName(name);
        config.setValue(value);
        return config;
    }

    private ConfigEntity persistConfig(String name, String value) {
        ConfigEntity config = createTestConfig(name, value);
        // 使用固定的测试ID范围，避免与预设数据（ID 1-3）冲突
        long testId = 1000 + System.nanoTime() % 9000; // ID范围：1000-9999
        config.setId(testId);
        configService.save(config);
        return config;
    }
}