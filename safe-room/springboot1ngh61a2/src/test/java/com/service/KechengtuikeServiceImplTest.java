package com.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.entity.KechengtuikeEntity;
import com.utils.PageUtils;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class KechengtuikeServiceImplTest {

    @Autowired
    private KechengtuikeService kechengtuikeService;

    @Test
    void shouldReturnPagedRefunds() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "5");

        PageUtils result = kechengtuikeService.queryPage(params);

        assertThat(result.getList()).isNotEmpty();
    }

    @Test
    void shouldListRefundViews() {
        List<KechengtuikeEntity> list = kechengtuikeService.list(new QueryWrapper<>());
        assertThat(list).isNotEmpty();
    }

    @Test
    void shouldFilterRefundsByStatus() {
        List<KechengtuikeEntity> pending = kechengtuikeService.list(new QueryWrapper<KechengtuikeEntity>().eq("sfsh", "待审核"));
        assertThat(pending).isNotEmpty();
    }

    // 边界条件测试
    @Test
    void shouldHandleEmptyParams() {
        Map<String, Object> emptyParams = new HashMap<>();
        PageUtils result = kechengtuikeService.queryPage(emptyParams);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleNullParams() {
        PageUtils result = kechengtuikeService.queryPage(null);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleInvalidPageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "-1");
        params.put("limit", "5");
        PageUtils result = kechengtuikeService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleZeroLimit() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "0");
        PageUtils result = kechengtuikeService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleLargePageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "999999");
        params.put("limit", "10");
        PageUtils result = kechengtuikeService.queryPage(params);
        assertThat(result).isNotNull();
        assertThat(result.getList()).isEmpty();
    }

    @Test
    void shouldHandleEmptyResultSet() {
        QueryWrapper<KechengtuikeEntity> wrapper = new QueryWrapper<KechengtuikeEntity>()
                .eq("yuyuebianhao", "不存在的退款-" + System.nanoTime());
        List<KechengtuikeEntity> refunds = kechengtuikeService.list(wrapper);
        assertThat(refunds).isEmpty();
    }
}


