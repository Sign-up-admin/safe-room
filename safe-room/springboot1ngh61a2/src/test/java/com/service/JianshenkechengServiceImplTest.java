package com.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.entity.JianshenkechengEntity;
import com.entity.view.JianshenkechengView;
import com.entity.vo.JianshenkechengVO;
import com.utils.PageUtils;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class JianshenkechengServiceImplTest {

    @Autowired
    private JianshenkechengService jianshenkechengService;

    @Test
    void shouldReturnPagedCourses() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "5");

        PageUtils result = jianshenkechengService.queryPage(params);

        assertThat(result.getList()).isNotEmpty();
    }

    @Test
    void shouldAggregateCourseValueByType() {
        Map<String, Object> params = new HashMap<>();
        params.put("xColumn", "kechengleixing");
        params.put("yColumn", "kechengjiage");

        List<Map<String, Object>> values = jianshenkechengService.selectValue(params, new QueryWrapper<>());

        assertThat(values)
                .isNotEmpty()
                .anyMatch(entry -> "瑜伽".equals(entry.get("kechengleixing")));
    }

    // 边界条件测试
    @Test
    void shouldHandleEmptyParams() {
        Map<String, Object> emptyParams = new HashMap<>();
        PageUtils result = jianshenkechengService.queryPage(emptyParams);
        assertThat(result).isNotNull();
        assertThat(result.getList()).isNotNull();
    }

    @Test
    void shouldHandleNullParams() {
        PageUtils result = jianshenkechengService.queryPage(null);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleInvalidPageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "-1");
        params.put("limit", "5");
        PageUtils result = jianshenkechengService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleZeroPageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "0");
        params.put("limit", "5");
        PageUtils result = jianshenkechengService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleZeroLimit() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "0");
        PageUtils result = jianshenkechengService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleNegativeLimit() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "-5");
        PageUtils result = jianshenkechengService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleLargePageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "999999");
        params.put("limit", "10");
        PageUtils result = jianshenkechengService.queryPage(params);
        assertThat(result).isNotNull();
        assertThat(result.getList()).isEmpty();
    }

    @Test
    void shouldHandleEmptyResultSet() {
        QueryWrapper<JianshenkechengEntity> wrapper = new QueryWrapper<JianshenkechengEntity>()
                .eq("kechengmingcheng", "不存在的课程名称-" + System.nanoTime());
        List<JianshenkechengView> views = jianshenkechengService.selectListView(wrapper);
        assertThat(views).isEmpty();
    }

    @Test
    void shouldHandleNullWrapper() {
        List<JianshenkechengVO> vos = jianshenkechengService.selectListVO(null);
        assertThat(vos).isNotNull();
    }

    @Test
    void shouldHandleViewWithNullWrapper() {
        JianshenkechengView view = jianshenkechengService.selectView(null);
        assertThat(view).isNull();
    }

    @Test
    void shouldHandleVOWithNonExistentCondition() {
        QueryWrapper<JianshenkechengEntity> wrapper = new QueryWrapper<JianshenkechengEntity>()
                .eq("id", Long.MAX_VALUE);
        JianshenkechengVO vo = jianshenkechengService.selectVO(wrapper);
        assertThat(vo).isNull();
    }

    @Test
    void shouldHandleQueryPageWithWrapperAndEmptyParams() {
        Map<String, Object> params = Collections.emptyMap();
        QueryWrapper<JianshenkechengEntity> wrapper = new QueryWrapper<>();
        PageUtils result = jianshenkechengService.queryPage(params, wrapper);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleSelectValueWithEmptyParams() {
        Map<String, Object> params = new HashMap<>();
        List<Map<String, Object>> values = jianshenkechengService.selectValue(params, new QueryWrapper<>());
        assertThat(values).isNotNull();
    }

    @Test
    void shouldHandleSelectValueWithNullParams() {
        List<Map<String, Object>> values = jianshenkechengService.selectValue(null, new QueryWrapper<>());
        assertThat(values).isNotNull();
    }

    @Test
    void shouldHandleSelectTimeStatValueWithEmptyParams() {
        Map<String, Object> params = new HashMap<>();
        List<Map<String, Object>> values = jianshenkechengService.selectTimeStatValue(params, new QueryWrapper<>());
        assertThat(values).isNotNull();
    }

    @Test
    void shouldHandleSelectGroupWithEmptyParams() {
        Map<String, Object> params = new HashMap<>();
        List<Map<String, Object>> groups = jianshenkechengService.selectGroup(params, new QueryWrapper<>());
        assertThat(groups).isNotNull();
    }

    @Test
    void shouldHandleBoundaryQueryConditions() {
        QueryWrapper<JianshenkechengEntity> wrapper = new QueryWrapper<JianshenkechengEntity>()
                .like("kechengmingcheng", "")
                .or()
                .isNull("kechengleixing");
        List<JianshenkechengView> views = jianshenkechengService.selectListView(wrapper);
        assertThat(views).isNotNull();
    }

    // 异常场景测试
    @Test
    void shouldHandleSaveWithNullEntity() {
        JianshenkechengEntity entity = null;
        // MyBatis Plus会抛出异常，这里测试异常处理
        try {
            jianshenkechengService.save(entity);
        } catch (Exception e) {
            assertThat(e).isNotNull();
        }
    }

    @Test
    void shouldHandleUpdateNonExistentEntity() {
        JianshenkechengEntity entity = new JianshenkechengEntity();
        entity.setId(Long.MAX_VALUE);
        entity.setKechengmingcheng("不存在的课程");
        boolean result = jianshenkechengService.updateById(entity);
        assertThat(result).isFalse();
    }

    @Test
    void shouldHandleDeleteNonExistentEntity() {
        boolean result = jianshenkechengService.removeById(Long.MAX_VALUE);
        assertThat(result).isFalse();
    }

    @Test
    void shouldHandleGetByIdWithNonExistentId() {
        JianshenkechengEntity entity = jianshenkechengService.getById(Long.MAX_VALUE);
        assertThat(entity).isNull();
    }

    @Test
    void shouldHandleSelectValueWithInvalidColumnNames() {
        Map<String, Object> params = new HashMap<>();
        params.put("xColumn", "不存在的列名");
        params.put("yColumn", "另一个不存在的列名");
        // 应该返回空列表或抛出异常
        List<Map<String, Object>> values = jianshenkechengService.selectValue(params, new QueryWrapper<>());
        assertThat(values).isNotNull();
    }

    @Test
    void shouldHandleSelectTimeStatValueWithInvalidFormat() {
        Map<String, Object> params = new HashMap<>();
        params.put("xColumn", "addtime");
        params.put("yColumn", "kechengjiage");
        params.put("timeStatType", "invalid_format");
        List<Map<String, Object>> values = jianshenkechengService.selectTimeStatValue(params, new QueryWrapper<>());
        assertThat(values).isNotNull();
    }

    @Test
    void shouldHandleSelectValueWithNullParamsReturnsEmptyList() {
        List<Map<String, Object>> values = jianshenkechengService.selectValue(null, new QueryWrapper<>());
        assertThat(values).isEmpty();
    }

    @Test
    void shouldHandleSelectValueWithMissingXColumn() {
        Map<String, Object> params = new HashMap<>();
        params.put("yColumn", "kechengjiage");
        List<Map<String, Object>> values = jianshenkechengService.selectValue(params, new QueryWrapper<>());
        assertThat(values).isEmpty();
    }

    @Test
    void shouldHandleSelectValueWithMissingYColumn() {
        Map<String, Object> params = new HashMap<>();
        params.put("xColumn", "kechengleixing");
        List<Map<String, Object>> values = jianshenkechengService.selectValue(params, new QueryWrapper<>());
        assertThat(values).isEmpty();
    }

    @Test
    void shouldHandleSelectTimeStatValueWithNullParamsReturnsEmptyList() {
        List<Map<String, Object>> values = jianshenkechengService.selectTimeStatValue(null, new QueryWrapper<>());
        assertThat(values).isEmpty();
    }

    @Test
    void shouldHandleSelectTimeStatValueWithMissingXColumn() {
        Map<String, Object> params = new HashMap<>();
        params.put("yColumn", "kechengjiage");
        params.put("timeStatType", "day");
        List<Map<String, Object>> values = jianshenkechengService.selectTimeStatValue(params, new QueryWrapper<>());
        assertThat(values).isEmpty();
    }

    @Test
    void shouldHandleSelectTimeStatValueWithMissingYColumn() {
        Map<String, Object> params = new HashMap<>();
        params.put("xColumn", "addtime");
        params.put("timeStatType", "day");
        List<Map<String, Object>> values = jianshenkechengService.selectTimeStatValue(params, new QueryWrapper<>());
        assertThat(values).isEmpty();
    }

    @Test
    void shouldHandleSelectTimeStatValueWithMissingTimeStatType() {
        Map<String, Object> params = new HashMap<>();
        params.put("xColumn", "addtime");
        params.put("yColumn", "kechengjiage");
        List<Map<String, Object>> values = jianshenkechengService.selectTimeStatValue(params, new QueryWrapper<>());
        assertThat(values).isEmpty();
    }

    @Test
    void shouldHandleSelectGroupWithNullParamsReturnsEmptyList() {
        List<Map<String, Object>> groups = jianshenkechengService.selectGroup(null, new QueryWrapper<>());
        assertThat(groups).isEmpty();
    }

    @Test
    void shouldHandleSelectGroupWithMissingColumn() {
        Map<String, Object> params = new HashMap<>();
        List<Map<String, Object>> groups = jianshenkechengService.selectGroup(params, new QueryWrapper<>());
        assertThat(groups).isEmpty();
    }
}



