package com.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.entity.JianshenjiaolianEntity;
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
class JianshenjiaolianServiceImplTest {

    @Autowired
    private JianshenjiaolianService jianshenjiaolianService;

    @Test
    void shouldReturnPagedCoaches() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "5");

        PageUtils result = jianshenjiaolianService.queryPage(params);

        assertThat(result.getList()).isNotEmpty();
    }

    @Test
    void shouldSelectCoachViews() {
        var views = jianshenjiaolianService.selectListView(new QueryWrapper<JianshenjiaolianEntity>());
        assertThat(views).isNotEmpty();
    }

    // 边界条件测试
    @Test
    void shouldHandleEmptyParams() {
        Map<String, Object> emptyParams = new HashMap<>();
        PageUtils result = jianshenjiaolianService.queryPage(emptyParams);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleNullParams() {
        PageUtils result = jianshenjiaolianService.queryPage(null);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleInvalidPageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "-1");
        params.put("limit", "5");
        PageUtils result = jianshenjiaolianService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleZeroLimit() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "0");
        PageUtils result = jianshenjiaolianService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleLargePageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "999999");
        params.put("limit", "10");
        PageUtils result = jianshenjiaolianService.queryPage(params);
        assertThat(result).isNotNull();
        assertThat(result.getList()).isEmpty();
    }

    @Test
    void shouldHandleEmptyResultSet() {
        QueryWrapper<JianshenjiaolianEntity> wrapper = new QueryWrapper<JianshenjiaolianEntity>()
                .eq("jiaoliangonghao", "不存在的教练-" + System.nanoTime());
        var views = jianshenjiaolianService.selectListView(wrapper);
        assertThat(views).isEmpty();
    }
}


