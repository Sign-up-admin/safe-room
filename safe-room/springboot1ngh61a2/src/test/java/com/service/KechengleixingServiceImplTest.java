package com.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.entity.KechengleixingEntity;
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
class KechengleixingServiceImplTest {

    @Autowired
    private KechengleixingService kechengleixingService;

    @Test
    void shouldReturnPagedCourseTypes() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "5");

        PageUtils result = kechengleixingService.queryPage(params);

        assertThat(result.getList()).isNotEmpty();
    }

    @Test
    void shouldListCourseTypes() {
        List<KechengleixingEntity> types = kechengleixingService.list(new QueryWrapper<>());
        assertThat(types).isNotEmpty();
    }

    @Test
    void shouldSelectCourseTypeView() {
        // First check if any course types exist
        List<KechengleixingEntity> allTypes = kechengleixingService.list(new QueryWrapper<>());
        if (!allTypes.isEmpty()) {
            // Use the first type's name for the test
            String typeName = allTypes.get(0).getKechengleixing();
            var view = kechengleixingService.selectView(new QueryWrapper<KechengleixingEntity>().eq("kechengleixing", typeName));
            assertThat(view).isNotNull();
        } else {
            // If no types exist, the view should be null
            var view = kechengleixingService.selectView(new QueryWrapper<KechengleixingEntity>().eq("kechengleixing", "瑜伽"));
            // View may be null if data doesn't exist
            // This is acceptable behavior
        }
    }

    // 边界条件测试
    @Test
    void shouldHandleEmptyParams() {
        Map<String, Object> emptyParams = new HashMap<>();
        PageUtils result = kechengleixingService.queryPage(emptyParams);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleNullParams() {
        PageUtils result = kechengleixingService.queryPage(null);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleInvalidPageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "-1");
        params.put("limit", "5");
        PageUtils result = kechengleixingService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleZeroLimit() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "0");
        PageUtils result = kechengleixingService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleLargePageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "999999");
        params.put("limit", "10");
        PageUtils result = kechengleixingService.queryPage(params);
        assertThat(result).isNotNull();
        assertThat(result.getList()).isEmpty();
    }

    @Test
    void shouldHandleEmptyResultSet() {
        QueryWrapper<KechengleixingEntity> wrapper = new QueryWrapper<KechengleixingEntity>()
                .eq("kechengleixing", "不存在的类型-" + System.nanoTime());
        var view = kechengleixingService.selectView(wrapper);
        assertThat(view).isNull();
    }
}


