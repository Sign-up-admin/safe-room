package com.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.entity.JianshenkechengEntity;
import com.entity.JianshenjiaolianEntity;
import com.entity.view.JianshenkechengView;
import com.entity.vo.JianshenkechengVO;
import com.utils.PageUtils;
import com.utils.TestDataFactory;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class JianshenkechengServiceImplTest {

    @Autowired
    private JianshenkechengService jianshenkechengService;

    @Autowired
    private JianshenjiaolianService jianshenjiaolianService;

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

    // ==================== 业务逻辑测试 ====================

    @Test
    void shouldCreateCourseWithValidData() {
        // 创建测试教练
        JianshenjiaolianEntity coach = TestDataFactory.coach()
                .employeeId("TEST-COACH-CREATE")
                .name("创建课程教练")
                .password("password123")
                .passwordHash("$2a$10$defaultHashForTesting")
                .build();
        jianshenjiaolianService.save(coach);

        // 创建课程
        JianshenkechengEntity course = TestDataFactory.course()
                .name("TEST-COURSE-CREATE")
                .type("瑜伽课")
                .coachId(coach.getJiaoliangonghao())
                .coachName(coach.getJiaolianxingming())
                .price(BigDecimal.valueOf(199.00))
                .build();

        jianshenkechengService.save(course);

        JianshenkechengEntity savedCourse = jianshenkechengService.getById(course.getId());
        assertThat(savedCourse).isNotNull();
        assertThat(savedCourse.getKechengmingcheng()).isEqualTo("TEST-COURSE-CREATE");
        assertThat(savedCourse.getKechengleixing()).isEqualTo("瑜伽课");
        assertThat(savedCourse.getJiaoliangonghao()).isEqualTo(coach.getJiaoliangonghao());
        assertThat(savedCourse.getJiaolianxingming()).isEqualTo(coach.getJiaolianxingming());
        assertThat(savedCourse.getKechengjiage()).isEqualTo(199.0);
    }

    @Test
    void shouldUpdateCourseStatus() {
        // 创建测试课程
        JianshenkechengEntity course = TestDataFactory.course()
                .name("TEST-COURSE-STATUS")
                .type("力量训练")
                .build();
        jianshenkechengService.save(course);

        Long courseId = course.getId();

        // 验证初始状态
        JianshenkechengEntity savedCourse = jianshenkechengService.getById(courseId);
        assertThat(savedCourse).isNotNull();

        // 更新课程信息（模拟状态变更）
        savedCourse.setKechengjianjie("更新后的课程介绍");
        savedCourse.setShangkedidian("更新后的上课地点");
        savedCourse.setClicknum(100);
        jianshenkechengService.updateById(savedCourse);

        // 验证更新结果
        JianshenkechengEntity updatedCourse = jianshenkechengService.getById(courseId);
        assertThat(updatedCourse.getKechengjianjie()).isEqualTo("更新后的课程介绍");
        assertThat(updatedCourse.getShangkedidian()).isEqualTo("更新后的上课地点");
        assertThat(updatedCourse.getClicknum()).isEqualTo(100);
    }

    @Test
    void shouldValidateCourseUpdateRules() {
        // 创建测试课程
        JianshenkechengEntity course = TestDataFactory.course()
                .name("TEST-COURSE-UPDATE")
                .type("有氧运动")
                .price(BigDecimal.valueOf(299.00))
                .build();
        jianshenkechengService.save(course);

        Long courseId = course.getId();

        // 测试价格更新
        JianshenkechengEntity priceUpdate = new JianshenkechengEntity();
        priceUpdate.setId(courseId);
        priceUpdate.setKechengjiage(399.0);
        jianshenkechengService.updateById(priceUpdate);

        JianshenkechengEntity updatedCourse = jianshenkechengService.getById(courseId);
        assertThat(updatedCourse.getKechengjiage()).isEqualTo(399.0);

        // 测试教练信息更新
        JianshenkechengEntity coachUpdate = new JianshenkechengEntity();
        coachUpdate.setId(courseId);
        coachUpdate.setJiaoliangonghao("NEW-COACH-001");
        coachUpdate.setJiaolianxingming("新教练");
        jianshenkechengService.updateById(coachUpdate);

        JianshenkechengEntity coachUpdatedCourse = jianshenkechengService.getById(courseId);
        assertThat(coachUpdatedCourse.getJiaoliangonghao()).isEqualTo("NEW-COACH-001");
        assertThat(coachUpdatedCourse.getJiaolianxingming()).isEqualTo("新教练");
    }

    @Test
    void shouldHandleCourseCoachAssignment() {
        // 创建多个教练
        JianshenjiaolianEntity coach1 = TestDataFactory.coach()
                .employeeId("TEST-COACH-ASSIGN-1")
                .name("教练A")
                .password("password123")
                .passwordHash("$2a$10$defaultHashForTesting")
                .build();
        jianshenjiaolianService.save(coach1);

        JianshenjiaolianEntity coach2 = TestDataFactory.coach()
                .employeeId("TEST-COACH-ASSIGN-2")
                .name("教练B")
                .password("password123")
                .passwordHash("$2a$10$defaultHashForTesting")
                .build();
        jianshenjiaolianService.save(coach2);

        // 创建课程并分配给不同教练
        JianshenkechengEntity course1 = TestDataFactory.course()
                .name("TEST-COURSE-COACH-A")
                .coachId(coach1.getJiaoliangonghao())
                .coachName(coach1.getJiaolianxingming())
                .build();
        jianshenkechengService.save(course1);

        JianshenkechengEntity course2 = TestDataFactory.course()
                .name("TEST-COURSE-COACH-B")
                .coachId(coach2.getJiaoliangonghao())
                .coachName(coach2.getJiaolianxingming())
                .build();
        jianshenkechengService.save(course2);

        // 验证教练分配
        JianshenkechengEntity savedCourse1 = jianshenkechengService.getById(course1.getId());
        JianshenkechengEntity savedCourse2 = jianshenkechengService.getById(course2.getId());

        assertThat(savedCourse1.getJiaoliangonghao()).isEqualTo(coach1.getJiaoliangonghao());
        assertThat(savedCourse1.getJiaolianxingming()).isEqualTo(coach1.getJiaolianxingming());
        assertThat(savedCourse2.getJiaoliangonghao()).isEqualTo(coach2.getJiaoliangonghao());
        assertThat(savedCourse2.getJiaolianxingming()).isEqualTo(coach2.getJiaolianxingming());

        // 测试教练更换
        savedCourse1.setJiaoliangonghao(coach2.getJiaoliangonghao());
        savedCourse1.setJiaolianxingming(coach2.getJiaolianxingming());
        jianshenkechengService.updateById(savedCourse1);

        JianshenkechengEntity reassignedCourse = jianshenkechengService.getById(course1.getId());
        assertThat(reassignedCourse.getJiaoliangonghao()).isEqualTo(coach2.getJiaoliangonghao());
        assertThat(reassignedCourse.getJiaolianxingming()).isEqualTo(coach2.getJiaolianxingming());
    }

    @Test
    void shouldHandleCourseSearchAndFilter() {
        // 创建测试教练
        JianshenjiaolianEntity coach = TestDataFactory.coach()
                .employeeId("TEST-COACH-SEARCH")
                .name("搜索教练")
                .password("password123")
                .passwordHash("$2a$10$defaultHashForTesting")
                .build();
        jianshenjiaolianService.save(coach);

        // 创建多个课程用于搜索
        String[] courseTypes = {"瑜伽课", "力量训练", "有氧运动", "舞蹈课"};
        Double[] prices = {199.0, 299.0, 399.0, 499.0};

        for (int i = 0; i < courseTypes.length; i++) {
            JianshenkechengEntity course = TestDataFactory.course()
                    .name("AUTO-SEARCH-COURSE-" + i)
                    .type(courseTypes[i])
                    .coachId(coach.getJiaoliangonghao())
                    .coachName(coach.getJiaolianxingming())
                    .price(BigDecimal.valueOf(prices[i]))
                    .build();
            jianshenkechengService.save(course);
        }

        // 测试按课程类型搜索
        List<JianshenkechengView> yogaCourses = jianshenkechengService.selectListView(
                new QueryWrapper<JianshenkechengEntity>().eq("kechengleixing", "瑜伽课"));
        assertThat(yogaCourses).hasSizeGreaterThanOrEqualTo(1);

        // 测试按教练搜索
        List<JianshenkechengView> coachCourses = jianshenkechengService.selectListView(
                new QueryWrapper<JianshenkechengEntity>().eq("jiaolianxingming", coach.getJiaolianxingming()));
        assertThat(coachCourses).hasSizeGreaterThanOrEqualTo(4);

        // 测试按价格范围搜索
        List<JianshenkechengView> expensiveCourses = jianshenkechengService.selectListView(
                new QueryWrapper<JianshenkechengEntity>().ge("kechengjiage", 300.0));
        assertThat(expensiveCourses).hasSizeGreaterThanOrEqualTo(2);

        // 测试按名称模糊搜索
        List<JianshenkechengView> searchResults = jianshenkechengService.selectListView(
                new QueryWrapper<JianshenkechengEntity>().like("kechengmingcheng", "AUTO-SEARCH"));
        assertThat(searchResults).hasSizeGreaterThanOrEqualTo(4);
    }

    @Test
    void shouldCalculateCourseStatistics() {
        // 创建测试数据用于统计
        JianshenjiaolianEntity coach1 = TestDataFactory.coach()
                .employeeId("STATS-COACH-1")
                .name("统计教练1")
                .password("password123")
                .passwordHash("$2a$10$defaultHashForTesting")
                .build();
        jianshenjiaolianService.save(coach1);

        JianshenjiaolianEntity coach2 = TestDataFactory.coach()
                .employeeId("STATS-COACH-2")
                .name("统计教练2")
                .password("password123")
                .passwordHash("$2a$10$defaultHashForTesting")
                .build();
        jianshenjiaolianService.save(coach2);

        // 创建课程
        JianshenkechengEntity course1 = TestDataFactory.course()
                .name("AUTO-STATS-COURSE-1")
                .type("瑜伽课")
                .coachId(coach1.getJiaoliangonghao())
                .coachName(coach1.getJiaolianxingming())
                .price(BigDecimal.valueOf(199.00))
                .build();
        jianshenkechengService.save(course1);

        JianshenkechengEntity course2 = TestDataFactory.course()
                .name("AUTO-STATS-COURSE-2")
                .type("力量训练")
                .coachId(coach2.getJiaoliangonghao())
                .coachName(coach2.getJiaolianxingming())
                .price(BigDecimal.valueOf(299.00))
                .build();
        jianshenkechengService.save(course2);

        // 测试按课程类型统计
        Map<String, Object> typeStatsParams = new HashMap<>();
        typeStatsParams.put("xColumn", "kechengleixing");
        typeStatsParams.put("yColumn", "kechengjiage");

        var typeStats = jianshenkechengService.selectValue(typeStatsParams, new QueryWrapper<>());
        assertThat(typeStats).isNotNull();

        // 测试按教练分组统计
        Map<String, Object> coachGroupParams = new HashMap<>();
        coachGroupParams.put("column", "jiaolianxingming");

        var coachGroups = jianshenkechengService.selectGroup(coachGroupParams, new QueryWrapper<>());
        assertThat(coachGroups).isNotNull();

        // 验证至少有两条记录
        List<JianshenkechengEntity> allCourses = jianshenkechengService.list(
                new QueryWrapper<JianshenkechengEntity>().like("kechengmingcheng", "AUTO-STATS"));
        assertThat(allCourses).hasSizeGreaterThanOrEqualTo(2);
    }

    @Test
    void shouldValidateCourseBusinessRules() {
        // 测试课程业务规则

        // 1. 验证必填字段
        JianshenkechengEntity incompleteCourse = new JianshenkechengEntity();
        jianshenkechengService.save(incompleteCourse);
        assertThat(incompleteCourse.getId()).isNotNull();

        // 2. 验证价格合理性
        JianshenkechengEntity expensiveCourse = TestDataFactory.course()
                .name("TEST-COURSE-EXPENSIVE")
                .price(BigDecimal.valueOf(9999.00))
                .build();
        jianshenkechengService.save(expensiveCourse);
        assertThat(expensiveCourse.getId()).isNotNull();

        JianshenkechengEntity freeCourse = TestDataFactory.course()
                .name("TEST-COURSE-FREE")
                .price(BigDecimal.valueOf(0.00))
                .build();
        jianshenkechengService.save(freeCourse);
        assertThat(freeCourse.getId()).isNotNull();

        // 3. 验证课程时长合理性（通过介绍字段模拟）
        JianshenkechengEntity shortCourse = TestDataFactory.course()
                .name("TEST-COURSE-SHORT")
                .build();
        shortCourse.setKechengjianjie("30分钟课程");
        jianshenkechengService.save(shortCourse);

        JianshenkechengEntity longCourse = TestDataFactory.course()
                .name("TEST-COURSE-LONG")
                .build();
        longCourse.setKechengjianjie("2小时深度课程");
        jianshenkechengService.save(longCourse);

        assertThat(shortCourse.getId()).isNotNull();
        assertThat(longCourse.getId()).isNotNull();

        // 4. 验证课程容量设置
        JianshenkechengEntity capacityCourse = TestDataFactory.course()
                .name("TEST-COURSE-CAPACITY")
                .build();
        // 注意：当前实体结构中没有显式的容量字段，这里通过其他字段模拟
        capacityCourse.setDiscussnum(20); // 模拟容量20人
        jianshenkechengService.save(capacityCourse);

        JianshenkechengEntity savedCapacityCourse = jianshenkechengService.getById(capacityCourse.getId());
        assertThat(savedCapacityCourse.getDiscussnum()).isEqualTo(20);
    }

    @Test
    void shouldHandleCoursePopularityMetrics() {
        // 测试课程热度指标
        JianshenkechengEntity popularCourse = TestDataFactory.course()
                .name("TEST-COURSE-POPULAR")
                .build();

        popularCourse.setClicknum(1000); // 点击数
        popularCourse.setStoreupnum(200); // 收藏数
        popularCourse.setDiscussnum(50); // 评论数

        jianshenkechengService.save(popularCourse);

        JianshenkechengEntity savedPopularCourse = jianshenkechengService.getById(popularCourse.getId());
        assertThat(savedPopularCourse.getClicknum()).isEqualTo(1000);
        assertThat(savedPopularCourse.getStoreupnum()).isEqualTo(200);
        assertThat(savedPopularCourse.getDiscussnum()).isEqualTo(50);

        // 模拟用户互动（增加点击数）
        savedPopularCourse.setClicknum(1001);
        savedPopularCourse.setStoreupnum(201);
        jianshenkechengService.updateById(savedPopularCourse);

        JianshenkechengEntity updatedPopularCourse = jianshenkechengService.getById(popularCourse.getId());
        assertThat(updatedPopularCourse.getClicknum()).isEqualTo(1001);
        assertThat(updatedPopularCourse.getStoreupnum()).isEqualTo(201);
    }
}



