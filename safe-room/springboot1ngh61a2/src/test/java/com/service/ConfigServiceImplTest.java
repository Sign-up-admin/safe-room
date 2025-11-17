package com.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.entity.ConfigEntity;
import com.utils.PageUtils;
import com.utils.TestUtils;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class ConfigServiceImplTest {

    @Autowired
    private ConfigService configService;

    @Test
    void shouldReturnPagedConfigs() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "5");

        PageUtils result = configService.queryPage(params, new QueryWrapper<>());

        assertThat(result.getList()).isNotEmpty();
    }

    @Test
    void shouldSaveAndFetchConfig() {
        ConfigEntity entity = TestUtils.createConfigEntry("test-key", "value");
        String actualName = entity.getName();
        configService.save(entity);

        ConfigEntity stored = configService.getOne(new QueryWrapper<ConfigEntity>().eq("name", actualName));
        assertThat(stored).isNotNull();
    }
}


