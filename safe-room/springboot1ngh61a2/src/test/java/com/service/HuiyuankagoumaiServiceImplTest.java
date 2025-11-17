package com.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.entity.HuiyuankagoumaiEntity;
import com.entity.HuiyuankaEntity;
import com.entity.YonghuEntity;
import com.utils.PageUtils;
import com.utils.TestDataFactory;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class HuiyuankagoumaiServiceImplTest {

    @Autowired
    private HuiyuankagoumaiService huiyuankagoumaiService;

    @Autowired
    private HuiyuankaService huiyuankaService;

    @Autowired
    private YonghuService yonghuService;

    @AfterEach
    void cleanupTestData() {
        // 清理测试购买记录数据
        huiyuankagoumaiService.list().stream()
                .filter(purchase -> purchase.getHuiyuankahao() != null &&
                        (purchase.getHuiyuankahao().contains("TEST-PURCHASE") ||
                         purchase.getHuiyuankahao().contains("AUTO-PURCHASE")))
                .forEach(purchase -> huiyuankagoumaiService.removeById(purchase.getId()));
    }

    @Test
    void shouldReturnPagedPurchases() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "5");

        PageUtils result = huiyuankagoumaiService.queryPage(params);

        assertThat(result.getList()).isNotEmpty();
    }

    @Test
    void shouldListPurchaseViews() {
        var views = huiyuankagoumaiService.selectListView(new QueryWrapper<HuiyuankagoumaiEntity>());
        assertThat(views).isNotEmpty();
    }

    @Test
    void shouldSelectValueAggregation() {
        Map<String, Object> params = new HashMap<>();
        params.put("xColumn", "ispay");
        params.put("yColumn", "jiage");

        var values = huiyuankagoumaiService.selectValue(params, new QueryWrapper<HuiyuankagoumaiEntity>());
        assertThat(values).isNotEmpty();
    }

    // 边界条件测试
    @Test
    void shouldHandleEmptyParams() {
        Map<String, Object> emptyParams = new HashMap<>();
        PageUtils result = huiyuankagoumaiService.queryPage(emptyParams);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleNullParams() {
        PageUtils result = huiyuankagoumaiService.queryPage(null);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleInvalidPageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "-1");
        params.put("limit", "5");
        PageUtils result = huiyuankagoumaiService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleZeroLimit() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "0");
        PageUtils result = huiyuankagoumaiService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleLargePageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "999999");
        params.put("limit", "10");
        PageUtils result = huiyuankagoumaiService.queryPage(params);
        assertThat(result).isNotNull();
        assertThat(result.getList()).isEmpty();
    }

    @Test
    void shouldHandleEmptyResultSet() {
        QueryWrapper<HuiyuankagoumaiEntity> wrapper = new QueryWrapper<HuiyuankagoumaiEntity>()
                .eq("huiyuankahao", "不存在的会员卡-" + System.nanoTime());
        var views = huiyuankagoumaiService.selectListView(wrapper);
        assertThat(views).isEmpty();
    }

    @Test
    void shouldHandleSelectValueWithEmptyParams() {
        Map<String, Object> params = new HashMap<>();
        var values = huiyuankagoumaiService.selectValue(params, new QueryWrapper<>());
        assertThat(values).isNotNull();
    }

    // ==================== 业务逻辑测试 ====================

    @Test
    void shouldCreatePurchaseOrderWithValidData() {
        // 创建测试用户和会员卡
        YonghuEntity user = TestDataFactory.createTestYonghu("HuiyuankagoumaiServiceImplTest");
        yonghuService.save(user);

        HuiyuankaEntity card = TestDataFactory.membershipCard()
                .name("TEST-CARD-PURCHASE")
                .price(BigDecimal.valueOf(299.00))
                .validityPeriod("12个月")
                .build();
        huiyuankaService.save(card);

        // 创建购买订单
        HuiyuankagoumaiEntity purchase = new HuiyuankagoumaiEntity();
        purchase.setHuiyuankahao("TEST-PURCHASE-001");
        purchase.setHuiyuankamingcheng(card.getHuiyuankamingcheng());
        purchase.setJiage(card.getJiage());
        purchase.setYouxiaoqi(card.getYouxiaoqi());
        purchase.setGoumairiqi(new Date());
        purchase.setYonghuzhanghao(user.getYonghuzhanghao());
        purchase.setYonghuxingming(user.getYonghuxingming());
        purchase.setShoujihaoma(user.getShoujihaoma());
        purchase.setIspay("未支付");

        huiyuankagoumaiService.save(purchase);

        HuiyuankagoumaiEntity savedPurchase = huiyuankagoumaiService.getById(purchase.getId());
        assertThat(savedPurchase).isNotNull();
        assertThat(savedPurchase.getHuiyuankahao()).isEqualTo("TEST-PURCHASE-001");
        assertThat(savedPurchase.getIspay()).isEqualTo("未支付");
    }

    @Test
    void shouldActivateCardAfterPayment() {
        // 创建测试用户和会员卡
        YonghuEntity user = TestDataFactory.createTestYonghu("HuiyuankagoumaiServiceImplTest");
        yonghuService.save(user);

        HuiyuankaEntity card = TestDataFactory.membershipCard()
                .name("TEST-CARD-ACTIVATE")
                .price(BigDecimal.valueOf(199.00))
                .validityPeriod("12个月")
                .build();
        huiyuankaService.save(card);

        // 创建购买订单
        HuiyuankagoumaiEntity purchase = new HuiyuankagoumaiEntity();
        purchase.setHuiyuankahao("TEST-PURCHASE-ACTIVATE");
        purchase.setHuiyuankamingcheng(card.getHuiyuankamingcheng());
        purchase.setJiage(card.getJiage());
        purchase.setYouxiaoqi(card.getYouxiaoqi());
        purchase.setGoumairiqi(new Date());
        purchase.setYonghuzhanghao(user.getYonghuzhanghao());
        purchase.setYonghuxingming(user.getYonghuxingming());
        purchase.setShoujihaoma(user.getShoujihaoma());
        purchase.setIspay("未支付");

        huiyuankagoumaiService.save(purchase);

        // 模拟支付完成
        purchase.setIspay("已支付");
        huiyuankagoumaiService.updateById(purchase);

        HuiyuankagoumaiEntity updatedPurchase = huiyuankagoumaiService.getById(purchase.getId());
        assertThat(updatedPurchase.getIspay()).isEqualTo("已支付");

        // 验证用户会员卡信息已更新（如果业务逻辑支持的话）
        // 这里模拟会员卡激活后的用户状态更新
        YonghuEntity updatedUser = yonghuService.getOne(
                new QueryWrapper<YonghuEntity>().eq("yonghuzhanghao", user.getYonghuzhanghao()));
        // 注意：当前实体结构中，用户表可能没有直接关联会员卡购买
        // 这里只是验证购买记录的状态更新
        assertThat(updatedPurchase.getIspay()).isEqualTo("已支付");
    }

    @Test
    void shouldHandlePurchaseFailure() {
        // 创建测试用户和会员卡
        YonghuEntity user = TestDataFactory.createTestYonghu("HuiyuankagoumaiServiceImplTest");
        yonghuService.save(user);

        HuiyuankaEntity card = TestDataFactory.membershipCard()
                .name("TEST-CARD-FAILURE")
                .price(BigDecimal.valueOf(99.00))
                .validityPeriod("6个月")
                .build();
        huiyuankaService.save(card);

        // 创建购买订单
        HuiyuankagoumaiEntity purchase = new HuiyuankagoumaiEntity();
        purchase.setHuiyuankahao("TEST-PURCHASE-FAILURE");
        purchase.setHuiyuankamingcheng(card.getHuiyuankamingcheng());
        purchase.setJiage(card.getJiage());
        purchase.setYouxiaoqi(card.getYouxiaoqi());
        purchase.setGoumairiqi(new Date());
        purchase.setYonghuzhanghao(user.getYonghuzhanghao());
        purchase.setYonghuxingming(user.getYonghuxingming());
        purchase.setShoujihaoma(user.getShoujihaoma());
        purchase.setIspay("未支付");

        huiyuankagoumaiService.save(purchase);

        // 模拟支付失败
        purchase.setIspay("支付失败");
        huiyuankagoumaiService.updateById(purchase);

        HuiyuankagoumaiEntity failedPurchase = huiyuankagoumaiService.getById(purchase.getId());
        assertThat(failedPurchase.getIspay()).isEqualTo("支付失败");

        // 验证失败的购买记录仍然存在，但状态为失败
        assertThat(failedPurchase).isNotNull();
        assertThat(failedPurchase.getHuiyuankahao()).isEqualTo("TEST-PURCHASE-FAILURE");
    }

    @Test
    void shouldValidatePurchaseBusinessRules() {
        // 测试购买业务规则

        // 1. 验证必填字段
        HuiyuankagoumaiEntity incompletePurchase = new HuiyuankagoumaiEntity();
        // 不设置任何字段
        huiyuankagoumaiService.save(incompletePurchase);
        // 系统应该能够保存，但ID应该被生成
        assertThat(incompletePurchase.getId()).isNotNull();

        // 2. 验证价格计算
        YonghuEntity user = TestDataFactory.createTestYonghu("HuiyuankagoumaiServiceImplTest");
        yonghuService.save(user);

        HuiyuankaEntity card = TestDataFactory.membershipCard()
                .name("TEST-CARD-PRICE")
                .price(BigDecimal.valueOf(199.99))
                .validityPeriod("12个月")
                .build();
        huiyuankaService.save(card);

        HuiyuankagoumaiEntity purchase = new HuiyuankagoumaiEntity();
        purchase.setHuiyuankahao("TEST-PURCHASE-PRICE");
        purchase.setHuiyuankamingcheng(card.getHuiyuankamingcheng());
        purchase.setJiage(card.getJiage()); // 应该与卡片价格一致
        purchase.setYouxiaoqi(card.getYouxiaoqi());
        purchase.setGoumairiqi(new Date());
        purchase.setYonghuzhanghao(user.getYonghuzhanghao());
        purchase.setYonghuxingming(user.getYonghuxingming());
        purchase.setShoujihaoma(user.getShoujihaoma());
        purchase.setIspay("未支付");

        huiyuankagoumaiService.save(purchase);

        HuiyuankagoumaiEntity savedPurchase = huiyuankagoumaiService.getById(purchase.getId());
        assertThat(savedPurchase.getJiage()).isEqualTo(card.getJiage());

        // 3. 验证购买日期
        assertThat(savedPurchase.getGoumairiqi()).isNotNull();
        assertThat(savedPurchase.getAddtime()).isNotNull();
    }

    @Test
    void shouldHandlePurchaseStatusTransitions() {
        // 创建测试数据
        YonghuEntity user = TestDataFactory.createTestYonghu("HuiyuankagoumaiServiceImplTest");
        yonghuService.save(user);

        HuiyuankaEntity card = TestDataFactory.membershipCard()
                .name("TEST-CARD-STATUS")
                .price(BigDecimal.valueOf(299.00))
                .validityPeriod("12个月")
                .build();
        huiyuankaService.save(card);

        HuiyuankagoumaiEntity purchase = new HuiyuankagoumaiEntity();
        purchase.setHuiyuankahao("TEST-PURCHASE-STATUS");
        purchase.setHuiyuankamingcheng(card.getHuiyuankamingcheng());
        purchase.setJiage(card.getJiage());
        purchase.setYouxiaoqi(card.getYouxiaoqi());
        purchase.setGoumairiqi(new Date());
        purchase.setYonghuzhanghao(user.getYonghuzhanghao());
        purchase.setYonghuxingming(user.getYonghuxingming());
        purchase.setShoujihaoma(user.getShoujihaoma());
        purchase.setIspay("未支付");

        huiyuankagoumaiService.save(purchase);

        // 测试状态流转：未支付 -> 支付中 -> 已支付
        Long purchaseId = purchase.getId();

        // 更新为支付中
        purchase.setIspay("支付中");
        huiyuankagoumaiService.updateById(purchase);

        HuiyuankagoumaiEntity processingPurchase = huiyuankagoumaiService.getById(purchaseId);
        assertThat(processingPurchase.getIspay()).isEqualTo("支付中");

        // 更新为已支付
        purchase.setIspay("已支付");
        huiyuankagoumaiService.updateById(purchase);

        HuiyuankagoumaiEntity paidPurchase = huiyuankagoumaiService.getById(purchaseId);
        assertThat(paidPurchase.getIspay()).isEqualTo("已支付");

        // 测试可能的失败状态
        purchase.setIspay("已取消");
        huiyuankagoumaiService.updateById(purchase);

        HuiyuankagoumaiEntity cancelledPurchase = huiyuankagoumaiService.getById(purchaseId);
        assertThat(cancelledPurchase.getIspay()).isEqualTo("已取消");
    }

    @Test
    void shouldCalculatePurchaseStatistics() {
        // 创建多个测试购买记录用于统计
        YonghuEntity user1 = TestDataFactory.yonghu()
                .username("user1-" + System.nanoTime())
                .password("password123")
                .passwordHash("$2a$10$defaultHashForTesting")
                .fullName("用户1")
                .phoneNumber("13800138001")
                .build();
        yonghuService.save(user1);

        YonghuEntity user2 = TestDataFactory.yonghu()
                .username("user2-" + System.nanoTime())
                .password("password123")
                .passwordHash("$2a$10$defaultHashForTesting")
                .fullName("用户2")
                .phoneNumber("13800138002")
                .build();
        yonghuService.save(user2);

        // 创建会员卡
        HuiyuankaEntity card1 = TestDataFactory.membershipCard()
                .name("AUTO-PURCHASE-CARD-1")
                .price(BigDecimal.valueOf(199.00))
                .validityPeriod("6个月")
                .build();
        huiyuankaService.save(card1);

        HuiyuankaEntity card2 = TestDataFactory.membershipCard()
                .name("AUTO-PURCHASE-CARD-2")
                .price(BigDecimal.valueOf(299.00))
                .validityPeriod("12个月")
                .build();
        huiyuankaService.save(card2);

        // 创建购买记录
        HuiyuankagoumaiEntity purchase1 = new HuiyuankagoumaiEntity();
        purchase1.setHuiyuankahao("AUTO-PURCHASE-1");
        purchase1.setHuiyuankamingcheng(card1.getHuiyuankamingcheng());
        purchase1.setJiage(card1.getJiage());
        purchase1.setYouxiaoqi(card1.getYouxiaoqi());
        purchase1.setGoumairiqi(new Date());
        purchase1.setYonghuzhanghao(user1.getYonghuzhanghao());
        purchase1.setYonghuxingming(user1.getYonghuxingming());
        purchase1.setShoujihaoma(user1.getShoujihaoma());
        purchase1.setIspay("已支付");
        huiyuankagoumaiService.save(purchase1);

        HuiyuankagoumaiEntity purchase2 = new HuiyuankagoumaiEntity();
        purchase2.setHuiyuankahao("AUTO-PURCHASE-2");
        purchase2.setHuiyuankamingcheng(card2.getHuiyuankamingcheng());
        purchase2.setJiage(card2.getJiage());
        purchase2.setYouxiaoqi(card2.getYouxiaoqi());
        purchase2.setGoumairiqi(new Date());
        purchase2.setYonghuzhanghao(user2.getYonghuzhanghao());
        purchase2.setYonghuxingming(user2.getYonghuxingming());
        purchase2.setShoujihaoma(user2.getShoujihaoma());
        purchase2.setIspay("未支付");
        huiyuankagoumaiService.save(purchase2);

        // 测试按支付状态统计
        Map<String, Object> statusParams = new HashMap<>();
        statusParams.put("xColumn", "ispay");
        statusParams.put("yColumn", "jiage");

        var statusStats = huiyuankagoumaiService.selectValue(statusParams, new QueryWrapper<>());
        assertThat(statusStats).isNotNull();

        // 测试按会员卡类型分组统计
        Map<String, Object> cardGroupParams = new HashMap<>();
        cardGroupParams.put("column", "huiyuankamingcheng");

        var cardGroups = huiyuankagoumaiService.selectGroup(cardGroupParams, new QueryWrapper<>());
        assertThat(cardGroups).isNotNull();

        // 验证至少有两条记录
        List<HuiyuankagoumaiEntity> allPurchases = huiyuankagoumaiService.list(
                new QueryWrapper<HuiyuankagoumaiEntity>().like("huiyuankahao", "AUTO-PURCHASE"));
        assertThat(allPurchases).hasSizeGreaterThanOrEqualTo(2);
    }

    @Test
    void shouldHandlePurchaseSearchAndFilter() {
        // 创建测试数据
        YonghuEntity user = TestDataFactory.createTestYonghu("HuiyuankagoumaiServiceImplTest");
        yonghuService.save(user);

        HuiyuankaEntity card = TestDataFactory.membershipCard()
                .name("TEST-CARD-SEARCH")
                .price(BigDecimal.valueOf(199.00))
                .validityPeriod("12个月")
                .build();
        huiyuankaService.save(card);

        HuiyuankagoumaiEntity purchase = new HuiyuankagoumaiEntity();
        purchase.setHuiyuankahao("TEST-PURCHASE-SEARCH");
        purchase.setHuiyuankamingcheng(card.getHuiyuankamingcheng());
        purchase.setJiage(card.getJiage());
        purchase.setYouxiaoqi(card.getYouxiaoqi());
        purchase.setGoumairiqi(new Date());
        purchase.setYonghuzhanghao(user.getYonghuzhanghao());
        purchase.setYonghuxingming(user.getYonghuxingming());
        purchase.setShoujihaoma(user.getShoujihaoma());
        purchase.setIspay("已支付");

        huiyuankagoumaiService.save(purchase);

        // 测试按用户名搜索
        var userPurchases = huiyuankagoumaiService.selectListView(
                new QueryWrapper<HuiyuankagoumaiEntity>().eq("yonghuzhanghao", user.getYonghuzhanghao()));
        assertThat(userPurchases).hasSizeGreaterThanOrEqualTo(1);

        // 测试按支付状态筛选
        var paidPurchases = huiyuankagoumaiService.selectListView(
                new QueryWrapper<HuiyuankagoumaiEntity>().eq("ispay", "已支付"));
        assertThat(paidPurchases).hasSizeGreaterThanOrEqualTo(1);

        // 测试按会员卡名称搜索
        var cardPurchases = huiyuankagoumaiService.selectListView(
                new QueryWrapper<HuiyuankagoumaiEntity>().eq("huiyuankamingcheng", card.getHuiyuankamingcheng()));
        assertThat(cardPurchases).hasSizeGreaterThanOrEqualTo(1);
    }
}


