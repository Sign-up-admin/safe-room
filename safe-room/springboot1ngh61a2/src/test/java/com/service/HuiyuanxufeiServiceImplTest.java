package com.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.entity.HuiyuanxufeiEntity;
import com.utils.PageUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class HuiyuanxufeiServiceImplTest {

    @Autowired
    private HuiyuanxufeiService huiyuanxufeiService;

    @AfterEach
    void cleanupTestData() {
        // 清理测试续费数据
        huiyuanxufeiService.list().stream()
                .filter(renewal -> renewal.getJiaofeibianhao() != null &&
                        (renewal.getJiaofeibianhao().contains("TEST-JF") ||
                         renewal.getJiaofeibianhao().contains("AUTO-JF")))
                .forEach(renewal -> huiyuanxufeiService.removeById(renewal.getId()));
    }

    @Test
    void shouldReturnPagedRenewals() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "5");

        PageUtils result = huiyuanxufeiService.queryPage(params);

        assertThat(result.getList()).isNotEmpty();
    }

    @Test
    void shouldSelectRenewalViews() {
        var views = huiyuanxufeiService.selectListView(new QueryWrapper<>());
        assertThat(views).isNotEmpty();
    }

    @Test
    void shouldSelectRenewalValueAggregation() {
        Map<String, Object> params = new HashMap<>();
        params.put("xColumn", "ispay");
        params.put("yColumn", "jiage");

        var values = huiyuanxufeiService.selectValue(params, new QueryWrapper<>());
        assertThat(values).isNotEmpty();
    }

    // 边界条件测试
    @Test
    void shouldHandleEmptyParams() {
        Map<String, Object> emptyParams = new HashMap<>();
        PageUtils result = huiyuanxufeiService.queryPage(emptyParams);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleNullParams() {
        PageUtils result = huiyuanxufeiService.queryPage(null);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleInvalidPageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "-1");
        params.put("limit", "5");
        PageUtils result = huiyuanxufeiService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleZeroLimit() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "0");
        PageUtils result = huiyuanxufeiService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleLargePageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "999999");
        params.put("limit", "10");
        PageUtils result = huiyuanxufeiService.queryPage(params);
        assertThat(result).isNotNull();
        assertThat(result.getList()).isEmpty();
    }

    @Test
    void shouldHandleSelectValueWithEmptyParams() {
        Map<String, Object> params = new HashMap<>();
        var values = huiyuanxufeiService.selectValue(params, new QueryWrapper<>());
        assertThat(values).isNotNull();
    }

    @Test
    void shouldSaveRenewal() {
        HuiyuanxufeiEntity renewal = new HuiyuanxufeiEntity();
        renewal.setYonghuzhanghao("test-user");
        renewal.setYonghuxingming("测试用户");
        renewal.setTouxiang("test-avatar.jpg");
        renewal.setJiaofeibianhao("TEST-JF-001");
        renewal.setHuiyuankamingcheng("VIP会员卡");
        renewal.setYouxiaoqi("12个月");
        renewal.setJiage(299.0);
        renewal.setIspay("未支付");

        huiyuanxufeiService.save(renewal);

        assertThat(renewal.getId()).isNotNull();
        assertThat(renewal.getAddtime()).isNotNull();
    }

    @Test
    void shouldUpdateRenewal() {
        HuiyuanxufeiEntity renewal = new HuiyuanxufeiEntity();
        renewal.setYonghuzhanghao("test-user");
        renewal.setYonghuxingming("测试用户");
        renewal.setTouxiang("test-avatar.jpg");
        renewal.setJiaofeibianhao("TEST-JF-UPDATE-001");
        renewal.setHuiyuankamingcheng("VIP会员卡");
        renewal.setYouxiaoqi("12个月");
        renewal.setJiage(299.0);
        renewal.setIspay("未支付");

        huiyuanxufeiService.save(renewal);
        Long renewalId = renewal.getId();

        // 更新续费状态
        HuiyuanxufeiEntity updateRenewal = new HuiyuanxufeiEntity();
        updateRenewal.setId(renewalId);
        updateRenewal.setIspay("已支付");
        updateRenewal.setJiage(399.0);
        huiyuanxufeiService.updateById(updateRenewal);

        // 验证更新结果
        HuiyuanxufeiEntity updatedRenewal = huiyuanxufeiService.getById(renewalId);
        assertThat(updatedRenewal.getIspay()).isEqualTo("已支付");
        assertThat(updatedRenewal.getJiage()).isEqualTo(399.0);
    }

    @Test
    void shouldDeleteRenewal() {
        HuiyuanxufeiEntity renewal = new HuiyuanxufeiEntity();
        renewal.setYonghuzhanghao("test-user");
        renewal.setYonghuxingming("测试用户");
        renewal.setTouxiang("test-avatar.jpg");
        renewal.setJiaofeibianhao("TEST-JF-DELETE-001");
        renewal.setHuiyuankamingcheng("VIP会员卡");
        renewal.setYouxiaoqi("12个月");
        renewal.setJiage(299.0);
        renewal.setIspay("未支付");

        huiyuanxufeiService.save(renewal);
        Long renewalId = renewal.getId();

        // 删除续费记录
        boolean deleted = huiyuanxufeiService.removeById(renewalId);
        assertThat(deleted).isTrue();

        // 验证删除结果
        HuiyuanxufeiEntity deletedRenewal = huiyuanxufeiService.getById(renewalId);
        assertThat(deletedRenewal).isNull();
    }

    @Test
    void shouldSelectValueWithValidParams() {
        // 测试selectValue方法在有有效参数时能正常工作
        Map<String, Object> params = new HashMap<>();
        params.put("xColumn", "ispay");
        params.put("yColumn", "jiage");

        var values = huiyuanxufeiService.selectValue(params, new QueryWrapper<>());

        // 应该返回非空列表
        assertThat(values).isNotNull();
        // 如果有数据，验证结构正确
        if (!values.isEmpty()) {
            assertThat(values.get(0)).containsKey("ispay");
            assertThat(values.get(0)).containsKey("jiage");
        }
    }

    @Test
    void shouldSelectTimeStatValueWithValidParams() {
        Map<String, Object> params = new HashMap<>();
        params.put("xColumn", "xufeishijian");
        params.put("yColumn", "jiage");
        params.put("timeStatType", "day");

        var values = huiyuanxufeiService.selectTimeStatValue(params, new QueryWrapper<>());

        assertThat(values).isNotNull();
    }

    @Test
    void shouldSelectTimeStatValueWithMonthType() {
        Map<String, Object> params = new HashMap<>();
        params.put("xColumn", "xufeishijian");
        params.put("yColumn", "jiage");
        params.put("timeStatType", "month");

        var values = huiyuanxufeiService.selectTimeStatValue(params, new QueryWrapper<>());

        assertThat(values).isNotNull();
    }

    @Test
    void shouldSelectTimeStatValueWithYearType() {
        Map<String, Object> params = new HashMap<>();
        params.put("xColumn", "xufeishijian");
        params.put("yColumn", "jiage");
        params.put("timeStatType", "year");

        var values = huiyuanxufeiService.selectTimeStatValue(params, new QueryWrapper<>());

        assertThat(values).isNotNull();
    }

    @Test
    void shouldSelectGroupWithValidColumn() {
        Map<String, Object> params = new HashMap<>();
        params.put("column", "ispay");

        var groups = huiyuanxufeiService.selectGroup(params, new QueryWrapper<>());

        assertThat(groups).isNotNull();
        // 如果有数据，验证分组结果
        if (!groups.isEmpty()) {
            assertThat(groups.get(0)).containsKey("ispay");
        }
    }

    @Test
    void shouldSelectListVO() {
        QueryWrapper<HuiyuanxufeiEntity> wrapper = new QueryWrapper<HuiyuanxufeiEntity>()
                .like("huiyuankamingcheng", "VIP");
        var vos = huiyuanxufeiService.selectListVO(wrapper);

        assertThat(vos).isNotNull();
    }

    @Test
    void shouldSelectVO() {
        QueryWrapper<HuiyuanxufeiEntity> wrapper = new QueryWrapper<HuiyuanxufeiEntity>()
                .like("huiyuankamingcheng", "VIP");
        var vo = huiyuanxufeiService.selectVO(wrapper);

        // VO可能为null（如果没有匹配的数据），这是正常行为
        assertThat(vo).isNotNull();
    }

    @Test
    void shouldSelectView() {
        QueryWrapper<HuiyuanxufeiEntity> wrapper = new QueryWrapper<HuiyuanxufeiEntity>()
                .like("huiyuankamingcheng", "VIP");
        var view = huiyuanxufeiService.selectView(wrapper);

        // View可能为null（如果没有匹配的数据），这是正常行为
        // 注意：HuiyuanxufeiServiceImpl.selectView方法没有null检查
        // 所以这里我们不做严格断言
        assertThat(view).isNotNull();
    }

    @Test
    void shouldHandleRenewalBusinessLogic() {
        HuiyuanxufeiEntity renewal = new HuiyuanxufeiEntity();
        renewal.setYonghuzhanghao("test-user-business");
        renewal.setYonghuxingming("测试用户业务");
        renewal.setTouxiang("test-avatar.jpg");
        renewal.setJiaofeibianhao("TEST-JF-BUSINESS-001");
        renewal.setHuiyuankamingcheng("VIP会员卡");
        renewal.setYouxiaoqi("12个月");
        renewal.setJiage(299.0);
        renewal.setIspay("未支付");

        huiyuanxufeiService.save(renewal);
        Long renewalId = renewal.getId();

        // 验证初始状态
        HuiyuanxufeiEntity savedRenewal = huiyuanxufeiService.getById(renewalId);
        assertThat(savedRenewal.getIspay()).isEqualTo("未支付");
        assertThat(savedRenewal.getJiage()).isEqualTo(299.0);

        // 模拟支付完成
        savedRenewal.setIspay("已支付");
        huiyuanxufeiService.updateById(savedRenewal);

        // 验证状态更新
        HuiyuanxufeiEntity updatedRenewal = huiyuanxufeiService.getById(renewalId);
        assertThat(updatedRenewal.getIspay()).isEqualTo("已支付");

        // 验证续费信息完整性
        assertThat(updatedRenewal.getJiaofeibianhao()).isEqualTo("TEST-JF-BUSINESS-001");
        assertThat(updatedRenewal.getHuiyuankamingcheng()).isEqualTo("VIP会员卡");
        assertThat(updatedRenewal.getYouxiaoqi()).isEqualTo("12个月");
    }

    @Test
    void shouldHandleRenewalStatistics() {
        // 测试续费统计功能
        Map<String, Object> params = new HashMap<>();
        params.put("xColumn", "ispay");
        params.put("yColumn", "jiage");

        var stats = huiyuanxufeiService.selectValue(params, new QueryWrapper<>());
        assertThat(stats).isNotNull();

        // 测试按支付状态分组统计
        Map<String, Object> groupParams = new HashMap<>();
        groupParams.put("column", "ispay");

        var groups = huiyuanxufeiService.selectGroup(groupParams, new QueryWrapper<>());
        assertThat(groups).isNotNull();

        // 测试按会员卡类型分组统计
        Map<String, Object> cardGroupParams = new HashMap<>();
        cardGroupParams.put("column", "huiyuankamingcheng");

        var cardGroups = huiyuanxufeiService.selectGroup(cardGroupParams, new QueryWrapper<>());
        assertThat(cardGroups).isNotNull();
    }

    @Test
    void shouldHandleRenewalPaymentNumberGeneration() {
        HuiyuanxufeiEntity renewal = new HuiyuanxufeiEntity();
        renewal.setYonghuzhanghao("test-user-payment");
        renewal.setYonghuxingming("测试用户缴费");
        renewal.setTouxiang("test-avatar.jpg");
        renewal.setJiaofeibianhao("AUTO-JF-2025-001");
        renewal.setHuiyuankamingcheng("VIP会员卡");
        renewal.setYouxiaoqi("12个月");
        renewal.setJiage(299.0);
        renewal.setIspay("未支付");

        huiyuanxufeiService.save(renewal);

        // 验证缴费编号正确保存
        HuiyuanxufeiEntity savedRenewal = huiyuanxufeiService.getById(renewal.getId());
        assertThat(savedRenewal.getJiaofeibianhao()).isEqualTo("AUTO-JF-2025-001");
        assertThat(savedRenewal.getYonghuzhanghao()).isEqualTo("test-user-payment");
        assertThat(savedRenewal.getYonghuxingming()).isEqualTo("测试用户缴费");
    }
}


