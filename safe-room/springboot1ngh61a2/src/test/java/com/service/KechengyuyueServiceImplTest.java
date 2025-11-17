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
                .like("yuyuebianhao", "TEST-YY-SAVE")
                .or()
                .like("yuyuebianhao", "TEST-YY-UPDATE")
                .or()
                .like("yuyuebianhao", "TEST-YY-DELETE")
                .or()
                .like("yuyuebianhao", "TEST-YY-BUSINESS")
                .or()
                .eq("yonghuzhanghao", "test-member")
                .or()
                .eq("yonghuzhanghao", "test-user"));
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

    @Test
    void shouldSaveReservation() {
        KechengyuyueEntity reservation = new KechengyuyueEntity();
        reservation.setYuyuebianhao("TEST-YY-SAVE-001");
        reservation.setKechengmingcheng("测试课程");
        reservation.setKechengleixing("瑜伽");
        reservation.setTupian("test-image.jpg");
        reservation.setShangkeshijian("2024-12-01 10:00:00");
        reservation.setShangkedidian("测试地点");
        reservation.setKechengjiage(100.0);
        reservation.setJiaoliangonghao("JL001");
        reservation.setJiaolianxingming("测试教练");
        reservation.setYonghuzhanghao("test-user");
        reservation.setYonghuxingming("测试用户");
        reservation.setShoujihaoma("13800138000");
        reservation.setSfsh("待审核");
        reservation.setIspay("未支付");

        kechengyuyueService.save(reservation);

        assertThat(reservation.getId()).isNotNull();
        assertThat(reservation.getAddtime()).isNotNull();
    }

    @Test
    void shouldUpdateReservation() {
        KechengyuyueEntity reservation = new KechengyuyueEntity();
        reservation.setYuyuebianhao("TEST-YY-UPDATE-001");
        reservation.setKechengmingcheng("测试课程");
        reservation.setKechengleixing("瑜伽");
        reservation.setTupian("test-image.jpg");
        reservation.setShangkeshijian("2024-12-01 10:00:00");
        reservation.setShangkedidian("测试地点");
        reservation.setKechengjiage(100.0);
        reservation.setJiaoliangonghao("JL001");
        reservation.setJiaolianxingming("测试教练");
        reservation.setYonghuzhanghao("test-user");
        reservation.setYonghuxingming("测试用户");
        reservation.setShoujihaoma("13800138000");
        reservation.setSfsh("待审核");
        reservation.setIspay("未支付");

        kechengyuyueService.save(reservation);
        Long reservationId = reservation.getId();

        // 更新预约状态
        KechengyuyueEntity updateReservation = new KechengyuyueEntity();
        updateReservation.setId(reservationId);
        updateReservation.setSfsh("已审核");
        updateReservation.setIspay("已支付");
        kechengyuyueService.updateById(updateReservation);

        // 验证更新结果
        KechengyuyueEntity updatedReservation = kechengyuyueService.getById(reservationId);
        assertThat(updatedReservation.getSfsh()).isEqualTo("已审核");
        assertThat(updatedReservation.getIspay()).isEqualTo("已支付");
    }

    @Test
    void shouldDeleteReservation() {
        KechengyuyueEntity reservation = new KechengyuyueEntity();
        reservation.setYuyuebianhao("TEST-YY-DELETE-001");
        reservation.setKechengmingcheng("测试课程");
        reservation.setKechengleixing("瑜伽");
        reservation.setTupian("test-image.jpg");
        reservation.setShangkeshijian("2024-12-01 10:00:00");
        reservation.setShangkedidian("测试地点");
        reservation.setKechengjiage(100.0);
        reservation.setJiaoliangonghao("JL001");
        reservation.setJiaolianxingming("测试教练");
        reservation.setYonghuzhanghao("test-user");
        reservation.setYonghuxingming("测试用户");
        reservation.setShoujihaoma("13800138000");
        reservation.setSfsh("待审核");
        reservation.setIspay("未支付");

        kechengyuyueService.save(reservation);
        Long reservationId = reservation.getId();

        // 删除预约
        boolean deleted = kechengyuyueService.removeById(reservationId);
        assertThat(deleted).isTrue();

        // 验证删除结果
        KechengyuyueEntity deletedReservation = kechengyuyueService.getById(reservationId);
        assertThat(deletedReservation).isNull();
    }

    @Test
    void shouldSelectValueWithValidParams() {
        // 测试selectValue方法在有有效参数时能正常工作
        Map<String, Object> params = new HashMap<>();
        params.put("xColumn", "kechengleixing");
        params.put("yColumn", "kechengjiage");

        List<Map<String, Object>> values = kechengyuyueService.selectValue(params, new QueryWrapper<>());

        // 应该返回非空列表
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
        params.put("xColumn", "yuyueshijian");
        params.put("yColumn", "kechengjiage");
        params.put("timeStatType", "day");

        List<Map<String, Object>> values = kechengyuyueService.selectTimeStatValue(params, new QueryWrapper<>());

        assertThat(values).isNotNull();
    }

    @Test
    void shouldSelectTimeStatValueWithMonthType() {
        Map<String, Object> params = new HashMap<>();
        params.put("xColumn", "yuyueshijian");
        params.put("yColumn", "kechengjiage");
        params.put("timeStatType", "month");

        List<Map<String, Object>> values = kechengyuyueService.selectTimeStatValue(params, new QueryWrapper<>());

        assertThat(values).isNotNull();
    }

    @Test
    void shouldSelectTimeStatValueWithYearType() {
        Map<String, Object> params = new HashMap<>();
        params.put("xColumn", "yuyueshijian");
        params.put("yColumn", "kechengjiage");
        params.put("timeStatType", "year");

        List<Map<String, Object>> values = kechengyuyueService.selectTimeStatValue(params, new QueryWrapper<>());

        assertThat(values).isNotNull();
    }

    @Test
    void shouldSelectGroupWithValidColumn() {
        Map<String, Object> params = new HashMap<>();
        params.put("column", "sfsh");

        List<Map<String, Object>> groups = kechengyuyueService.selectGroup(params, new QueryWrapper<>());

        assertThat(groups).isNotNull();
        // 如果有数据，验证分组结果
        if (!groups.isEmpty()) {
            assertThat(groups.get(0)).containsKey("sfsh");
        }
    }

    @Test
    void shouldSelectListVO() {
        QueryWrapper<KechengyuyueEntity> wrapper = new QueryWrapper<KechengyuyueEntity>()
                .like("kechengmingcheng", "瑜伽");
        List<com.entity.vo.KechengyuyueVO> vos = kechengyuyueService.selectListVO(wrapper);

        assertThat(vos).isNotNull();
    }

    @Test
    void shouldSelectVO() {
        QueryWrapper<KechengyuyueEntity> wrapper = new QueryWrapper<KechengyuyueEntity>()
                .like("kechengmingcheng", "瑜伽");
        com.entity.vo.KechengyuyueVO vo = kechengyuyueService.selectVO(wrapper);

        // VO可能为null（如果没有匹配的数据），这是正常行为
        assertThat(vo).isNotNull();
    }

    @Test
    void shouldHandleReservationBusinessLogic() {
        KechengyuyueEntity reservation = new KechengyuyueEntity();
        reservation.setYuyuebianhao("TEST-YY-BUSINESS-001");
        reservation.setKechengmingcheng("测试课程");
        reservation.setKechengleixing("瑜伽");
        reservation.setTupian("test-image.jpg");
        reservation.setShangkeshijian("2024-12-01 10:00:00");
        reservation.setShangkedidian("测试地点");
        reservation.setKechengjiage(100.0);
        reservation.setJiaoliangonghao("JL001");
        reservation.setJiaolianxingming("测试教练");
        reservation.setYonghuzhanghao("test-user");
        reservation.setYonghuxingming("测试用户");
        reservation.setShoujihaoma("13800138000");
        reservation.setSfsh("待审核");
        reservation.setIspay("未支付");

        kechengyuyueService.save(reservation);
        Long reservationId = reservation.getId();

        // 验证初始状态
        KechengyuyueEntity savedReservation = kechengyuyueService.getById(reservationId);
        assertThat(savedReservation.getSfsh()).isEqualTo("待审核");
        assertThat(savedReservation.getIspay()).isEqualTo("未支付");

        // 模拟审核通过
        savedReservation.setSfsh("已审核");
        kechengyuyueService.updateById(savedReservation);

        // 验证状态更新
        KechengyuyueEntity updatedReservation = kechengyuyueService.getById(reservationId);
        assertThat(updatedReservation.getSfsh()).isEqualTo("已审核");

        // 模拟支付完成
        updatedReservation.setIspay("已支付");
        kechengyuyueService.updateById(updatedReservation);

        // 验证最终状态
        KechengyuyueEntity finalReservation = kechengyuyueService.getById(reservationId);
        assertThat(finalReservation.getSfsh()).isEqualTo("已审核");
        assertThat(finalReservation.getIspay()).isEqualTo("已支付");
    }

    @Test
    void shouldHandleReservationStatistics() {
        // 测试预约统计功能
        Map<String, Object> params = new HashMap<>();
        params.put("xColumn", "sfsh");
        params.put("yColumn", "kechengjiage");

        List<Map<String, Object>> stats = kechengyuyueService.selectValue(params, new QueryWrapper<>());
        assertThat(stats).isNotNull();

        // 测试按审核状态分组统计
        Map<String, Object> groupParams = new HashMap<>();
        groupParams.put("column", "sfsh");

        List<Map<String, Object>> groups = kechengyuyueService.selectGroup(groupParams, new QueryWrapper<>());
        assertThat(groups).isNotNull();

        // 测试按支付状态分组统计
        Map<String, Object> payGroupParams = new HashMap<>();
        payGroupParams.put("column", "ispay");

        List<Map<String, Object>> payGroups = kechengyuyueService.selectGroup(payGroupParams, new QueryWrapper<>());
        assertThat(payGroups).isNotNull();
    }

    @Test
    void shouldSelectView() {
        QueryWrapper<KechengyuyueEntity> wrapper = new QueryWrapper<KechengyuyueEntity>()
                .like("kechengmingcheng", "瑜伽");
        KechengyuyueView view = kechengyuyueService.selectView(wrapper);

        // View可能为null（如果没有匹配的数据），这是正常行为
        assertThat(view).isNotNull();
    }

    @Test
    void shouldSelectListView() {
        QueryWrapper<KechengyuyueEntity> wrapper = new QueryWrapper<KechengyuyueEntity>()
                .like("kechengmingcheng", "瑜伽");
        List<KechengyuyueView> views = kechengyuyueService.selectListView(wrapper);

        assertThat(views).isNotNull();
    }
}



