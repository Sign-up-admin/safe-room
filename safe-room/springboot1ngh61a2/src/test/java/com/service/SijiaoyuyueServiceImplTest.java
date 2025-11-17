package com.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.entity.SijiaoyuyueEntity;
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
class SijiaoyuyueServiceImplTest {

    @Autowired
    private SijiaoyuyueService sijiaoyuyueService;

    @Test
    void shouldReturnPagedPrivateReservations() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "5");

        PageUtils result = sijiaoyuyueService.queryPage(params);

        assertThat(result.getList()).isNotEmpty();
    }

    @Test
    void shouldListReservationViews() {
        List<SijiaoyuyueEntity> reservations = sijiaoyuyueService.list(new QueryWrapper<>());
        assertThat(reservations).isNotEmpty();
    }

    @Test
    void shouldFilterByStatus() {
        List<SijiaoyuyueEntity> pending = sijiaoyuyueService.list(new QueryWrapper<SijiaoyuyueEntity>().eq("sfsh", "已审核"));
        assertThat(pending).isNotEmpty();
    }

    // 边界条件测试
    @Test
    void shouldHandleEmptyParams() {
        Map<String, Object> emptyParams = new HashMap<>();
        PageUtils result = sijiaoyuyueService.queryPage(emptyParams);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleNullParams() {
        PageUtils result = sijiaoyuyueService.queryPage(null);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleInvalidPageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "-1");
        params.put("limit", "5");
        PageUtils result = sijiaoyuyueService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleZeroLimit() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "0");
        PageUtils result = sijiaoyuyueService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleLargePageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "999999");
        params.put("limit", "10");
        PageUtils result = sijiaoyuyueService.queryPage(params);
        assertThat(result).isNotNull();
        assertThat(result.getList()).isEmpty();
    }

    @Test
    void shouldHandleEmptyResultSet() {
        QueryWrapper<SijiaoyuyueEntity> wrapper = new QueryWrapper<SijiaoyuyueEntity>()
                .eq("yuyuebianhao", "不存在的预约-" + System.nanoTime());
        List<SijiaoyuyueEntity> reservations = sijiaoyuyueService.list(wrapper);
        assertThat(reservations).isEmpty();
    }
}


