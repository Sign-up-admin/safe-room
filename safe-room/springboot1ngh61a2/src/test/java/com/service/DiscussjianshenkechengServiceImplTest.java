package com.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.entity.DiscussjianshenkechengEntity;
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
class DiscussjianshenkechengServiceImplTest {

    @Autowired
    private DiscussjianshenkechengService discussService;

    @Test
    void shouldReturnPagedDiscussions() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "5");

        PageUtils result = discussService.queryPage(params);

        assertThat(result.getList()).isNotEmpty();
    }

    @Test
    void shouldListDiscussionsByCourse() {
        List<DiscussjianshenkechengEntity> discussions = discussService.list(new QueryWrapper<DiscussjianshenkechengEntity>().eq("refid", 600));
        assertThat(discussions).isNotEmpty();
    }

    @Test
    void shouldSelectDiscussionView() {
        var view = discussService.selectView(new QueryWrapper<DiscussjianshenkechengEntity>().eq("refid", 600));
        assertThat(view).isNotNull();
    }

    // 边界条件测试
    @Test
    void shouldHandleEmptyParams() {
        Map<String, Object> emptyParams = new HashMap<>();
        PageUtils result = discussService.queryPage(emptyParams);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleNullParams() {
        PageUtils result = discussService.queryPage(null);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleInvalidPageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "-1");
        params.put("limit", "5");
        PageUtils result = discussService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleZeroLimit() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "0");
        PageUtils result = discussService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleLargePageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "999999");
        params.put("limit", "10");
        PageUtils result = discussService.queryPage(params);
        assertThat(result).isNotNull();
        assertThat(result.getList()).isEmpty();
    }

    @Test
    void shouldHandleEmptyResultSet() {
        QueryWrapper<DiscussjianshenkechengEntity> wrapper = new QueryWrapper<DiscussjianshenkechengEntity>()
                .eq("refid", Long.MAX_VALUE);
        var view = discussService.selectView(wrapper);
        assertThat(view).isNull();
    }
}


