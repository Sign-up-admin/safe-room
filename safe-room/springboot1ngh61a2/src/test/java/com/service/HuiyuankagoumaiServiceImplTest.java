package com.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.entity.HuiyuankagoumaiEntity;
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
class HuiyuankagoumaiServiceImplTest {

    @Autowired
    private HuiyuankagoumaiService huiyuankagoumaiService;

    @Test
    void shouldReturnPagedPurchases() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "5");

        PageUtils result = huiyuankagoumaiService.queryPage(params);

        assertThat(result.getList()).isNotEmpty();
    }

    @Test
    void shouldListPurchaseViews() {
        var views = huiyuankagoumaiService.selectListView(new QueryWrapper<HuiyuankagoumaiEntity>());
        assertThat(views).isNotEmpty();
    }

    @Test
    void shouldSelectValueAggregation() {
        Map<String, Object> params = new HashMap<>();
        params.put("xColumn", "ispay");
        params.put("yColumn", "jiage");

        var values = huiyuankagoumaiService.selectValue(params, new QueryWrapper<HuiyuankagoumaiEntity>());
        assertThat(values).isNotEmpty();
    }

    // 边界条件测试
    @Test
    void shouldHandleEmptyParams() {
        Map<String, Object> emptyParams = new HashMap<>();
        PageUtils result = huiyuankagoumaiService.queryPage(emptyParams);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleNullParams() {
        PageUtils result = huiyuankagoumaiService.queryPage(null);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleInvalidPageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "-1");
        params.put("limit", "5");
        PageUtils result = huiyuankagoumaiService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleZeroLimit() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "0");
        PageUtils result = huiyuankagoumaiService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleLargePageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "999999");
        params.put("limit", "10");
        PageUtils result = huiyuankagoumaiService.queryPage(params);
        assertThat(result).isNotNull();
        assertThat(result.getList()).isEmpty();
    }

    @Test
    void shouldHandleEmptyResultSet() {
        QueryWrapper<HuiyuankagoumaiEntity> wrapper = new QueryWrapper<HuiyuankagoumaiEntity>()
                .eq("huiyuankahao", "不存在的会员卡-" + System.nanoTime());
        var views = huiyuankagoumaiService.selectListView(wrapper);
        assertThat(views).isEmpty();
    }

    @Test
    void shouldHandleSelectValueWithEmptyParams() {
        Map<String, Object> params = new HashMap<>();
        var values = huiyuankagoumaiService.selectValue(params, new QueryWrapper<>());
        assertThat(values).isNotNull();
    }
}


