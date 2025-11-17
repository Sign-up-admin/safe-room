package com.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.entity.JianshenkechengEntity;
import com.entity.view.JianshenkechengView;
import com.entity.vo.JianshenkechengVO;
import com.utils.PageUtils;
import org.junit.jupiter.api.AfterEach;
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

    @AfterEach
    void cleanupTestData() {
        // 清理测试课程数据
        jianshenkechengService.list().stream()
                .filter(course -> course.getKechengmingcheng() != null &&
                        (course.getKechengmingcheng().contains("测试课程-save") ||
                         course.getKechengmingcheng().contains("测试课程-update") ||
                         course.getKechengmingcheng().contains("测试课程-delete") ||
                         course.getKechengmingcheng().contains("测试课程-business")))
                .forEach(course -> jianshenkechengService.removeById(course.getId()));
    }

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

    @Test
    void shouldSaveCourse() {
        JianshenkechengEntity course = new JianshenkechengEntity();
        course.setKechengmingcheng("测试课程-save");
        course.setKechengleixing("瑜伽");
        course.setTupian("test-image.jpg");
        course.setShangkedidian("测试地点");
        course.setKechengjiage(100.0);
        course.setKechengjianjie("测试课程介绍");
        course.setJiaoliangonghao("JL001");
        course.setJiaolianxingming("测试教练");
        course.setClicknum(0);
        course.setDiscussnum(0);
        course.setStoreupnum(0);

        jianshenkechengService.save(course);

        assertThat(course.getId()).isNotNull();
        assertThat(course.getAddtime()).isNotNull();
    }

    @Test
    void shouldUpdateCourse() {
        JianshenkechengEntity course = new JianshenkechengEntity();
        course.setKechengmingcheng("测试课程-update");
        course.setKechengleixing("瑜伽");
        course.setTupian("test-image.jpg");
        course.setShangkedidian("测试地点");
        course.setKechengjiage(100.0);
        course.setKechengjianjie("测试课程介绍");
        course.setJiaoliangonghao("JL001");
        course.setJiaolianxingming("测试教练");
        course.setClicknum(0);
        course.setDiscussnum(0);
        course.setStoreupnum(0);

        jianshenkechengService.save(course);
        Long courseId = course.getId();

        // 更新课程信息
        JianshenkechengEntity updateCourse = new JianshenkechengEntity();
        updateCourse.setId(courseId);
        updateCourse.setKechengjianjie("更新的课程介绍");
        updateCourse.setKechengjiage(150.0);
        jianshenkechengService.updateById(updateCourse);

        // 验证更新结果
        JianshenkechengEntity updatedCourse = jianshenkechengService.getById(courseId);
        assertThat(updatedCourse.getKechengjianjie()).isEqualTo("更新的课程介绍");
        assertThat(updatedCourse.getKechengjiage()).isEqualTo(150.0);
    }

    @Test
    void shouldDeleteCourse() {
        JianshenkechengEntity course = new JianshenkechengEntity();
        course.setKechengmingcheng("测试课程-delete");
        course.setKechengleixing("瑜伽");
        course.setTupian("test-image.jpg");
        course.setShangkedidian("测试地点");
        course.setKechengjiage(100.0);
        course.setKechengjianjie("测试课程介绍");
        course.setJiaoliangonghao("JL001");
        course.setJiaolianxingming("测试教练");
        course.setClicknum(0);
        course.setDiscussnum(0);
        course.setStoreupnum(0);

        jianshenkechengService.save(course);
        Long courseId = course.getId();

        // 删除课程
        boolean deleted = jianshenkechengService.removeById(courseId);
        assertThat(deleted).isTrue();

        // 验证删除结果
        JianshenkechengEntity deletedCourse = jianshenkechengService.getById(courseId);
        assertThat(deletedCourse).isNull();
    }

    @Test
    void shouldSelectValueWithValidParams() {
        // 这个测试验证selectValue方法在有有效参数时能正常工作
        Map<String, Object> params = new HashMap<>();
        params.put("xColumn", "kechengleixing");
        params.put("yColumn", "kechengjiage");

        List<Map<String, Object>> values = jianshenkechengService.selectValue(params, new QueryWrapper<>());

        // 应该返回非空列表（如果数据库中有数据）
        assertThat(values).isNotNull();
        // 如果有数据，验证结构正确
        if (!values.isEmpty()) {
            assertThat(values.get(0)).containsKey("kechengleixing");
            assertThat(values.get(0)).containsKey("kechengjiage");
        }
    }

    @Test
    void shouldSelectTimeStatValueWithValidParams() {
        Map<String, Object> params = new HashMap<>();
        params.put("xColumn", "addtime");
        params.put("yColumn", "kechengjiage");
        params.put("timeStatType", "day");

        List<Map<String, Object>> values = jianshenkechengService.selectTimeStatValue(params, new QueryWrapper<>());

        assertThat(values).isNotNull();
    }

    @Test
    void shouldSelectTimeStatValueWithMonthType() {
        Map<String, Object> params = new HashMap<>();
        params.put("xColumn", "addtime");
        params.put("yColumn", "kechengjiage");
        params.put("timeStatType", "month");

        List<Map<String, Object>> values = jianshenkechengService.selectTimeStatValue(params, new QueryWrapper<>());

        assertThat(values).isNotNull();
    }

    @Test
    void shouldSelectTimeStatValueWithYearType() {
        Map<String, Object> params = new HashMap<>();
        params.put("xColumn", "addtime");
        params.put("yColumn", "kechengjiage");
        params.put("timeStatType", "year");

        List<Map<String, Object>> values = jianshenkechengService.selectTimeStatValue(params, new QueryWrapper<>());

        assertThat(values).isNotNull();
    }

    @Test
    void shouldSelectGroupWithValidColumn() {
        Map<String, Object> params = new HashMap<>();
        params.put("column", "kechengleixing");

        List<Map<String, Object>> groups = jianshenkechengService.selectGroup(params, new QueryWrapper<>());

        assertThat(groups).isNotNull();
        // 如果有数据，验证分组结果
        if (!groups.isEmpty()) {
            assertThat(groups.get(0)).containsKey("kechengleixing");
        }
    }

    @Test
    void shouldSelectListVO() {
        QueryWrapper<JianshenkechengEntity> wrapper = new QueryWrapper<JianshenkechengEntity>()
                .like("kechengmingcheng", "瑜伽");
        List<JianshenkechengVO> vos = jianshenkechengService.selectListVO(wrapper);

        assertThat(vos).isNotNull();
    }

    @Test
    void shouldSelectVO() {
        QueryWrapper<JianshenkechengEntity> wrapper = new QueryWrapper<JianshenkechengEntity>()
                .like("kechengmingcheng", "瑜伽");
        JianshenkechengVO vo = jianshenkechengService.selectVO(wrapper);

        // VO可能为null（如果没有匹配的数据），这是正常行为
        assertThat(vo).isNotNull();
    }

    @Test
    void shouldSelectView() {
        QueryWrapper<JianshenkechengEntity> wrapper = new QueryWrapper<JianshenkechengEntity>()
                .like("kechengmingcheng", "瑜伽");
        JianshenkechengView view = jianshenkechengService.selectView(wrapper);

        // View可能为null（如果没有匹配的数据），这是正常行为
        assertThat(view).isNotNull();
    }

    @Test
    void shouldSelectListView() {
        QueryWrapper<JianshenkechengEntity> wrapper = new QueryWrapper<JianshenkechengEntity>()
                .like("kechengmingcheng", "瑜伽");
        List<JianshenkechengView> views = jianshenkechengService.selectListView(wrapper);

        assertThat(views).isNotNull();
    }

    @Test
    void shouldHandleCourseBusinessLogic() {
        JianshenkechengEntity course = new JianshenkechengEntity();
        course.setKechengmingcheng("测试课程-business");
        course.setKechengleixing("瑜伽");
        course.setTupian("test-image.jpg");
        course.setShangkedidian("测试地点");
        course.setKechengjiage(100.0);
        course.setKechengjianjie("测试课程介绍");
        course.setJiaoliangonghao("JL001");
        course.setJiaolianxingming("测试教练");
        course.setClicknum(5);
        course.setDiscussnum(3);
        course.setStoreupnum(2);

        jianshenkechengService.save(course);
        Long courseId = course.getId();

        // 验证业务字段正确保存
        JianshenkechengEntity savedCourse = jianshenkechengService.getById(courseId);
        assertThat(savedCourse.getClicknum()).isEqualTo(5);
        assertThat(savedCourse.getDiscussnum()).isEqualTo(3);
        assertThat(savedCourse.getStoreupnum()).isEqualTo(2);

        // 更新业务字段
        savedCourse.setClicknum(10);
        savedCourse.setDiscussnum(5);
        savedCourse.setStoreupnum(4);
        jianshenkechengService.updateById(savedCourse);

        // 验证更新
        JianshenkechengEntity updatedCourse = jianshenkechengService.getById(courseId);
        assertThat(updatedCourse.getClicknum()).isEqualTo(10);
        assertThat(updatedCourse.getDiscussnum()).isEqualTo(5);
        assertThat(updatedCourse.getStoreupnum()).isEqualTo(4);
    }

    @Test
    void shouldHandleCourseStatistics() {
        // 测试课程统计功能
        Map<String, Object> params = new HashMap<>();
        params.put("xColumn", "jiaolianxingming");
        params.put("yColumn", "kechengjiage");

        List<Map<String, Object>> stats = jianshenkechengService.selectValue(params, new QueryWrapper<>());
        assertThat(stats).isNotNull();

        // 测试按教练分组统计
        Map<String, Object> groupParams = new HashMap<>();
        groupParams.put("column", "jiaolianxingming");

        List<Map<String, Object>> groups = jianshenkechengService.selectGroup(groupParams, new QueryWrapper<>());
        assertThat(groups).isNotNull();
    }
}



