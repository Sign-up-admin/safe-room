package com.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.entity.HuiyuanxufeiEntity;
import com.utils.PageUtils;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class HuiyuanxufeiServiceImplTest {

    @Autowired
    private HuiyuanxufeiService huiyuanxufeiService;

    @Test
    void shouldReturnPagedRenewals() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "5");

        PageUtils result = huiyuanxufeiService.queryPage(params);

        assertThat(result.getList()).isNotEmpty();
    }

    @Test
    void shouldSelectRenewalViews() {
        var views = huiyuanxufeiService.selectListView(new QueryWrapper<>());
        assertThat(views).isNotEmpty();
    }

    @Test
    void shouldSelectRenewalValueAggregation() {
        Map<String, Object> params = new HashMap<>();
        params.put("xColumn", "ispay");
        params.put("yColumn", "jiage");

        var values = huiyuanxufeiService.selectValue(params, new QueryWrapper<>());
        assertThat(values).isNotEmpty();
    }

    // 边界条件测试
    @Test
    void shouldHandleEmptyParams() {
        Map<String, Object> emptyParams = new HashMap<>();
        PageUtils result = huiyuanxufeiService.queryPage(emptyParams);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleNullParams() {
        PageUtils result = huiyuanxufeiService.queryPage(null);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleInvalidPageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "-1");
        params.put("limit", "5");
        PageUtils result = huiyuanxufeiService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleZeroLimit() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "0");
        PageUtils result = huiyuanxufeiService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleLargePageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "999999");
        params.put("limit", "10");
        PageUtils result = huiyuanxufeiService.queryPage(params);
        assertThat(result).isNotNull();
        assertThat(result.getList()).isEmpty();
    }

    @Test
    void shouldHandleSelectValueWithEmptyParams() {
        Map<String, Object> params = new HashMap<>();
        var values = huiyuanxufeiService.selectValue(params, new QueryWrapper<>());
        assertThat(values).isNotNull();
    }
}


