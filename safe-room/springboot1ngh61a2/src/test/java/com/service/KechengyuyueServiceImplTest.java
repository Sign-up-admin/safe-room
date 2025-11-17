package com.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.entity.KechengyuyueEntity;
import com.entity.view.KechengyuyueView;
import com.utils.PageUtils;
import com.utils.TestUtils;
import org.junit.jupiter.api.AfterEach;
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
class KechengyuyueServiceImplTest {

    @Autowired
    private KechengyuyueService kechengyuyueService;

    @AfterEach
    void cleanupTestData() {
        // Clean up test data to prevent conflicts between test runs
        kechengyuyueService.remove(new QueryWrapper<KechengyuyueEntity>()
                .like("yuyuebianhao", "AUTO-YY")
                .or()
                .like("yuyuebianhao", "TEST-YY")
                .or()
                .eq("yonghuzhanghao", "test-member"));
    }

    @Test
    void shouldPageReservations() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "5");

        PageUtils pageUtils = kechengyuyueService.queryPage(params);

        assertThat(pageUtils.getList()).isNotEmpty();
    }

    @Test
    void shouldReturnReservationViews() {
        List<KechengyuyueView> views = kechengyuyueService.selectListView(new QueryWrapper<>());

        assertThat(views)
                .isNotEmpty()
                .anyMatch(view -> "基础瑜伽".equals(view.getKechengmingcheng()));
    }

    @Test
    void shouldGroupReservationsByApprovalStatus() {
        String uniqueYuyuebianhao = "AUTO-YY-GROUP-" + System.nanoTime();
        KechengyuyueEntity pending = TestUtils.createReservationWithStatus(uniqueYuyuebianhao, "test-member", "待审核", "未支付");
        kechengyuyueService.save(pending);

        Map<String, Object> params = new HashMap<>();
        params.put("column", "sfsh");

        var grouped = kechengyuyueService.selectGroup(params, new QueryWrapper<>());

        assertThat(grouped)
                .isNotEmpty()
                .anyMatch(entry -> "待审核".equals(entry.get("sfsh")));
    }

    @Test
    void shouldSummarizeReservationValueByCourseType() {
        Map<String, Object> params = new HashMap<>();
        params.put("xColumn", "kechengleixing");
        params.put("yColumn", "kechengjiage");

        var totals = kechengyuyueService.selectValue(params, new QueryWrapper<>());

        assertThat(totals)
                .isNotEmpty()
                .anyMatch(result -> "瑜伽".equals(result.get("kechengleixing")));
    }

    // 边界条件测试
    @Test
    void shouldHandleEmptyParams() {
        Map<String, Object> emptyParams = new HashMap<>();
        PageUtils result = kechengyuyueService.queryPage(emptyParams);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleNullParams() {
        PageUtils result = kechengyuyueService.queryPage(null);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleInvalidPageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "-1");
        params.put("limit", "5");
        PageUtils result = kechengyuyueService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleZeroLimit() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "0");
        PageUtils result = kechengyuyueService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleLargePageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "999999");
        params.put("limit", "10");
        PageUtils result = kechengyuyueService.queryPage(params);
        assertThat(result).isNotNull();
        assertThat(result.getList()).isEmpty();
    }

    @Test
    void shouldHandleEmptyResultSet() {
        QueryWrapper<KechengyuyueEntity> wrapper = new QueryWrapper<KechengyuyueEntity>()
                .eq("yuyuebianhao", "不存在的预约-" + System.nanoTime());
        List<KechengyuyueView> views = kechengyuyueService.selectListView(wrapper);
        assertThat(views).isEmpty();
    }

    @Test
    void shouldHandleSelectValueWithEmptyParams() {
        Map<String, Object> params = new HashMap<>();
        List<Map<String, Object>> values = kechengyuyueService.selectValue(params, new QueryWrapper<>());
        assertThat(values).isNotNull();
    }

    @Test
    void shouldHandleSelectTimeStatValueWithEmptyParams() {
        Map<String, Object> params = new HashMap<>();
        List<Map<String, Object>> values = kechengyuyueService.selectTimeStatValue(params, new QueryWrapper<>());
        assertThat(values).isNotNull();
    }

    @Test
    void shouldHandleSelectGroupWithEmptyParams() {
        Map<String, Object> params = new HashMap<>();
        List<Map<String, Object>> groups = kechengyuyueService.selectGroup(params, new QueryWrapper<>());
        assertThat(groups).isNotNull();
    }

    // 异常场景测试
    @Test
    void shouldHandleSaveWithNullEntity() {
        KechengyuyueEntity entity = null;
        try {
            kechengyuyueService.save(entity);
        } catch (Exception e) {
            assertThat(e).isNotNull();
        }
    }

    @Test
    void shouldHandleUpdateNonExistentEntity() {
        KechengyuyueEntity entity = new KechengyuyueEntity();
        entity.setId(Long.MAX_VALUE);
        entity.setYuyuebianhao("不存在的预约");
        boolean result = kechengyuyueService.updateById(entity);
        assertThat(result).isFalse();
    }

    @Test
    void shouldHandleDeleteNonExistentEntity() {
        boolean result = kechengyuyueService.removeById(Long.MAX_VALUE);
        assertThat(result).isFalse();
    }

    @Test
    void shouldHandleGetByIdWithNonExistentId() {
        KechengyuyueEntity entity = kechengyuyueService.getById(Long.MAX_VALUE);
        assertThat(entity).isNull();
    }

    @Test
    void shouldHandleSelectValueWithInvalidColumnNames() {
        Map<String, Object> params = new HashMap<>();
        params.put("xColumn", "不存在的列名");
        params.put("yColumn", "另一个不存在的列名");
        List<Map<String, Object>> values = kechengyuyueService.selectValue(params, new QueryWrapper<>());
        assertThat(values).isNotNull();
    }

    @Test
    void shouldHandleSelectViewWithNullWrapper() {
        KechengyuyueView view = kechengyuyueService.selectView(null);
        assertThat(view).isNull();
    }

    @Test
    void shouldHandleSelectValueWithNullParams() {
        List<Map<String, Object>> values = kechengyuyueService.selectValue(null, new QueryWrapper<>());
        assertThat(values).isEmpty();
    }

    @Test
    void shouldHandleSelectValueWithMissingXColumn() {
        Map<String, Object> params = new HashMap<>();
        params.put("yColumn", "kechengjiage");
        List<Map<String, Object>> values = kechengyuyueService.selectValue(params, new QueryWrapper<>());
        assertThat(values).isEmpty();
    }

    @Test
    void shouldHandleSelectValueWithMissingYColumn() {
        Map<String, Object> params = new HashMap<>();
        params.put("xColumn", "kechengleixing");
        List<Map<String, Object>> values = kechengyuyueService.selectValue(params, new QueryWrapper<>());
        assertThat(values).isEmpty();
    }

    @Test
    void shouldHandleSelectTimeStatValueWithNullParams() {
        List<Map<String, Object>> values = kechengyuyueService.selectTimeStatValue(null, new QueryWrapper<>());
        assertThat(values).isEmpty();
    }

    @Test
    void shouldHandleSelectTimeStatValueWithMissingXColumn() {
        Map<String, Object> params = new HashMap<>();
        params.put("yColumn", "kechengjiage");
        params.put("timeStatType", "day");
        List<Map<String, Object>> values = kechengyuyueService.selectTimeStatValue(params, new QueryWrapper<>());
        assertThat(values).isEmpty();
    }

    @Test
    void shouldHandleSelectTimeStatValueWithMissingYColumn() {
        Map<String, Object> params = new HashMap<>();
        params.put("xColumn", "addtime");
        params.put("timeStatType", "day");
        List<Map<String, Object>> values = kechengyuyueService.selectTimeStatValue(params, new QueryWrapper<>());
        assertThat(values).isEmpty();
    }

    @Test
    void shouldHandleSelectTimeStatValueWithMissingTimeStatType() {
        Map<String, Object> params = new HashMap<>();
        params.put("xColumn", "addtime");
        params.put("yColumn", "kechengjiage");
        List<Map<String, Object>> values = kechengyuyueService.selectTimeStatValue(params, new QueryWrapper<>());
        assertThat(values).isEmpty();
    }

    @Test
    void shouldHandleSelectGroupWithNullParams() {
        List<Map<String, Object>> groups = kechengyuyueService.selectGroup(null, new QueryWrapper<>());
        assertThat(groups).isEmpty();
    }

    @Test
    void shouldHandleSelectGroupWithMissingColumn() {
        Map<String, Object> params = new HashMap<>();
        List<Map<String, Object>> groups = kechengyuyueService.selectGroup(params, new QueryWrapper<>());
        assertThat(groups).isEmpty();
    }

    @Test
    void shouldHandleQueryPageWithNullWrapper() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "10");
        PageUtils result = kechengyuyueService.queryPage(params, null);
        assertThat(result).isNotNull();
    }
}



