package com.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.entity.NewstypeEntity;
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
class NewstypeServiceImplTest {

    @Autowired
    private NewstypeService newstypeService;

    @Test
    void shouldReturnPagedNewsTypes() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "5");

        PageUtils result = newstypeService.queryPage(params);

        assertThat(result.getList()).isNotEmpty();
    }

    @Test
    void shouldListAllNewsTypes() {
        List<NewstypeEntity> types = newstypeService.list(new QueryWrapper<>());
        assertThat(types).isNotEmpty();
    }

    @Test
    void shouldSelectSingleTypeView() {
        var view = newstypeService.selectView(new QueryWrapper<NewstypeEntity>().eq("typename", "公告"));
        assertThat(view).isNotNull();
    }

    // 边界条件测试
    @Test
    void shouldHandleEmptyParams() {
        Map<String, Object> emptyParams = new HashMap<>();
        PageUtils result = newstypeService.queryPage(emptyParams);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleNullParams() {
        PageUtils result = newstypeService.queryPage(null);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleInvalidPageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "-1");
        params.put("limit", "5");
        PageUtils result = newstypeService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleZeroLimit() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "0");
        PageUtils result = newstypeService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleLargePageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "999999");
        params.put("limit", "10");
        PageUtils result = newstypeService.queryPage(params);
        assertThat(result).isNotNull();
        assertThat(result.getList()).isEmpty();
    }

    @Test
    void shouldHandleEmptyResultSet() {
        QueryWrapper<NewstypeEntity> wrapper = new QueryWrapper<NewstypeEntity>()
                .eq("typename", "不存在的类型-" + System.nanoTime());
        var view = newstypeService.selectView(wrapper);
        assertThat(view).isNull();
    }
}


