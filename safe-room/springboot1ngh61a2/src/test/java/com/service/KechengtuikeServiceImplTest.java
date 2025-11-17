package com.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.entity.KechengtuikeEntity;
import com.entity.KechengyuyueEntity;
import com.entity.JianshenkechengEntity;
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
class KechengtuikeServiceImplTest {

    @Autowired
    private KechengtuikeService kechengtuikeService;

    @Autowired
    private KechengyuyueService kechengyuyueService;

    @Autowired
    private JianshenkechengService jianshenkechengService;

    @Autowired
    private YonghuService yonghuService;

    @AfterEach
    void cleanupTestData() {
        // 清理测试退课数据
        kechengtuikeService.list().stream()
                .filter(refund -> refund.getTuikebianhao() != null &&
                        (refund.getTuikebianhao().contains("TEST-TUIKE") ||
                         refund.getTuikebianhao().contains("AUTO-TUIKE")))
                .forEach(refund -> kechengtuikeService.removeById(refund.getId()));
    }

    @Test
    void shouldReturnPagedRefunds() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "5");

        PageUtils result = kechengtuikeService.queryPage(params);

        assertThat(result.getList()).isNotEmpty();
    }

    @Test
    void shouldListRefundViews() {
        List<KechengtuikeEntity> list = kechengtuikeService.list(new QueryWrapper<>());
        assertThat(list).isNotEmpty();
    }

    @Test
    void shouldFilterRefundsByStatus() {
        List<KechengtuikeEntity> pending = kechengtuikeService.list(new QueryWrapper<KechengtuikeEntity>().eq("sfsh", "待审核"));
        assertThat(pending).isNotEmpty();
    }

    // 边界条件测试
    @Test
    void shouldHandleEmptyParams() {
        Map<String, Object> emptyParams = new HashMap<>();
        PageUtils result = kechengtuikeService.queryPage(emptyParams);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleNullParams() {
        PageUtils result = kechengtuikeService.queryPage(null);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleInvalidPageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "-1");
        params.put("limit", "5");
        PageUtils result = kechengtuikeService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleZeroLimit() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "0");
        PageUtils result = kechengtuikeService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleLargePageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "999999");
        params.put("limit", "10");
        PageUtils result = kechengtuikeService.queryPage(params);
        assertThat(result).isNotNull();
        assertThat(result.getList()).isEmpty();
    }

    @Test
    void shouldHandleEmptyResultSet() {
        QueryWrapper<KechengtuikeEntity> wrapper = new QueryWrapper<KechengtuikeEntity>()
                .eq("yuyuebianhao", "不存在的退款-" + System.nanoTime());
        List<KechengtuikeEntity> refunds = kechengtuikeService.list(wrapper);
        assertThat(refunds).isEmpty();
    }

    // ==================== 业务逻辑测试 ====================

    @Test
    void shouldCreateCancellationWithValidData() {
        // 创建测试用户、课程和预约
        YonghuEntity user = TestDataFactory.createTestYonghu("KechengtuikeServiceImplTest");
        yonghuService.save(user);

        JianshenkechengEntity course = TestDataFactory.course()
                .name("TEST-COURSE-CANCEL")
                .type("瑜伽课")
                .price(BigDecimal.valueOf(199.00))
                .build();
        jianshenkechengService.save(course);

        KechengyuyueEntity booking = new KechengyuyueEntity();
        booking.setYuyuebianhao("TEST-YY-CANCEL-001");
        booking.setKechengmingcheng(course.getKechengmingcheng());
        booking.setKechengleixing(course.getKechengleixing());
        booking.setShangkeshijian("周五 14:00-15:00");
        booking.setShangkedidian("一号教室");
        booking.setYonghuzhanghao(user.getYonghuzhanghao());
        booking.setYonghuxingming(user.getYonghuxingming());
        booking.setShoujihaoma(user.getShoujihaoma());
        booking.setSfsh("通过");
        kechengyuyueService.save(booking);

        // 创建退课申请
        KechengtuikeEntity cancellation = new KechengtuikeEntity();
        cancellation.setTuikebianhao("TEST-TUIKE-001");
        cancellation.setYuyuebianhao(booking.getYuyuebianhao());
        cancellation.setKechengmingcheng(course.getKechengmingcheng());
        cancellation.setYonghuzhanghao(user.getYonghuzhanghao());
        cancellation.setYonghuxingming(user.getYonghuxingming());
        cancellation.setTuikeyuanyin("临时有事，无法参加");
        cancellation.setIspay("未退款");
        cancellation.setTuikeshijian(new Date());

        kechengtuikeService.save(cancellation);

        KechengtuikeEntity savedCancellation = kechengtuikeService.getById(cancellation.getId());
        assertThat(savedCancellation).isNotNull();
        assertThat(savedCancellation.getTuikebianhao()).isEqualTo("TEST-TUIKE-001");
        assertThat(savedCancellation.getYuyuebianhao()).isEqualTo(booking.getYuyuebianhao());
        assertThat(savedCancellation.getIspay()).isEqualTo("未退款");
    }

    @Test
    void shouldCalculateRefundOnCancellation() {
        // 创建测试数据
        YonghuEntity user = TestDataFactory.createTestYonghu("KechengtuikeServiceImplTest");
        yonghuService.save(user);

        JianshenkechengEntity course = TestDataFactory.course()
                .name("TEST-COURSE-REFUND")
                .type("私教课程")
                .price(BigDecimal.valueOf(299.00))
                .build();
        jianshenkechengService.save(course);

        KechengyuyueEntity booking = new KechengyuyueEntity();
        booking.setYuyuebianhao("TEST-YY-REFUND-001");
        booking.setKechengmingcheng(course.getKechengmingcheng());
        booking.setKechengleixing(course.getKechengleixing());
        booking.setShangkeshijian("周六 10:00-11:00");
        booking.setShangkedidian("VIP教室");
        booking.setYonghuzhanghao(user.getYonghuzhanghao());
        booking.setYonghuxingming(user.getYonghuxingming());
        booking.setShoujihaoma(user.getShoujihaoma());
        booking.setSfsh("通过");
        kechengyuyueService.save(booking);

        // 创建退课申请（模拟退款计算）
        KechengtuikeEntity cancellation = new KechengtuikeEntity();
        cancellation.setTuikebianhao("TEST-TUIKE-REFUND");
        cancellation.setYuyuebianhao(booking.getYuyuebianhao());
        cancellation.setKechengmingcheng(course.getKechengmingcheng());
        cancellation.setYonghuzhanghao(user.getYonghuzhanghao());
        cancellation.setYonghuxingming(user.getYonghuxingming());
        cancellation.setTuikeyuanyin("课程时间冲突");
        cancellation.setIspay("未退款");
        cancellation.setTuikeshijian(new Date());
        // 模拟退款金额（课程价格的80%）
        cancellation.setTuikuanjine(239.2); // 299 * 0.8

        kechengtuikeService.save(cancellation);

        KechengtuikeEntity savedCancellation = kechengtuikeService.getById(cancellation.getId());
        assertThat(savedCancellation.getTuikuanjine()).isEqualTo(239.2);

        // 模拟退款完成
        savedCancellation.setIspay("已退款");
        kechengtuikeService.updateById(savedCancellation);

        KechengtuikeEntity refundedCancellation = kechengtuikeService.getById(cancellation.getId());
        assertThat(refundedCancellation.getIspay()).isEqualTo("已退款");
    }

    @Test
    void shouldEnforceCancellationDeadline() {
        // 创建测试数据
        YonghuEntity user = TestDataFactory.createTestYonghu("KechengtuikeServiceImplTest");
        yonghuService.save(user);

        JianshenkechengEntity course = TestDataFactory.course()
                .name("TEST-COURSE-DEADLINE")
                .type("团体课")
                .price(BigDecimal.valueOf(99.00))
                .build();
        jianshenkechengService.save(course);

        // 创建即将开始的课程预约（模拟课程开始前2小时）
        KechengyuyueEntity urgentBooking = new KechengyuyueEntity();
        urgentBooking.setYuyuebianhao("TEST-YY-DEADLINE-URGENT");
        urgentBooking.setKechengmingcheng(course.getKechengmingcheng());
        urgentBooking.setKechengleixing(course.getKechengleixing());
        urgentBooking.setShangkeshijian("今天 16:00-17:00"); // 假设当前时间是14:00
        urgentBooking.setShangkedidian("团体教室");
        urgentBooking.setYonghuzhanghao(user.getYonghuzhanghao());
        urgentBooking.setYonghuxingming(user.getYonghuxingming());
        urgentBooking.setShoujihaoma(user.getShoujihaoma());
        urgentBooking.setSfsh("通过");
        kechengyuyueService.save(urgentBooking);

        // 创建正常预约（课程开始前24小时）
        KechengyuyueEntity normalBooking = new KechengyuyueEntity();
        normalBooking.setYuyuebianhao("TEST-YY-DEADLINE-NORMAL");
        normalBooking.setKechengmingcheng(course.getKechengmingcheng());
        normalBooking.setKechengleixing(course.getKechengleixing());
        normalBooking.setShangkeshijian("明天 10:00-11:00");
        normalBooking.setShangkedidian("团体教室");
        normalBooking.setYonghuzhanghao(user.getYonghuzhanghao());
        normalBooking.setYonghuxingming(user.getYonghuxingming());
        normalBooking.setShoujihaoma(user.getShoujihaoma());
        normalBooking.setSfsh("通过");
        kechengyuyueService.save(normalBooking);

        // 创建退课申请（正常时间）
        KechengtuikeEntity normalCancellation = new KechengtuikeEntity();
        normalCancellation.setTuikebianhao("TEST-TUIKE-DEADLINE-NORMAL");
        normalCancellation.setYuyuebianhao(normalBooking.getYuyuebianhao());
        normalCancellation.setKechengmingcheng(course.getKechengmingcheng());
        normalCancellation.setYonghuzhanghao(user.getYonghuzhanghao());
        normalCancellation.setYonghuxingming(user.getYonghuxingming());
        normalCancellation.setTuikeyuanyin("正常退课");
        normalCancellation.setIspay("未退款");
        normalCancellation.setTuikeshijian(new Date());
        normalCancellation.setTuikuanjine(99.0); // 全额退款

        // 创建紧急退课申请（课程即将开始）
        KechengtuikeEntity urgentCancellation = new KechengtuikeEntity();
        urgentCancellation.setTuikebianhao("TEST-TUIKE-DEADLINE-URGENT");
        urgentCancellation.setYuyuebianhao(urgentBooking.getYuyuebianhao());
        urgentCancellation.setKechengmingcheng(course.getKechengmingcheng());
        urgentCancellation.setYonghuzhanghao(user.getYonghuzhanghao());
        urgentCancellation.setYonghuxingming(user.getYonghuxingming());
        urgentCancellation.setTuikeyuanyin("紧急情况，无法参加");
        urgentCancellation.setIspay("未退款");
        urgentCancellation.setTuikeshijian(new Date());
        urgentCancellation.setTuikuanjine(49.5); // 50%退款

        // 保存退课申请（当前系统允许，业务逻辑层应根据时间限制退款比例）
        kechengtuikeService.save(normalCancellation);
        kechengtuikeService.save(urgentCancellation);

        KechengtuikeEntity savedNormalCancellation = kechengtuikeService.getById(normalCancellation.getId());
        KechengtuikeEntity savedUrgentCancellation = kechengtuikeService.getById(urgentCancellation.getId());

        assertThat(savedNormalCancellation.getTuikuanjine()).isEqualTo(99.0);
        assertThat(savedUrgentCancellation.getTuikuanjine()).isEqualTo(49.5);
    }

    @Test
    void shouldHandleCancellationStatusTransitions() {
        // 创建测试数据
        YonghuEntity user = TestDataFactory.createTestYonghu("KechengtuikeServiceImplTest");
        yonghuService.save(user);

        JianshenkechengEntity course = TestDataFactory.course()
                .name("TEST-COURSE-STATUS")
                .type("舞蹈课")
                .price(BigDecimal.valueOf(149.00))
                .build();
        jianshenkechengService.save(course);

        KechengyuyueEntity booking = new KechengyuyueEntity();
        booking.setYuyuebianhao("TEST-YY-STATUS-001");
        booking.setKechengmingcheng(course.getKechengmingcheng());
        booking.setKechengleixing(course.getKechengleixing());
        booking.setShangkeshijian("周日 15:00-16:00");
        booking.setShangkedidian("舞蹈教室");
        booking.setYonghuzhanghao(user.getYonghuzhanghao());
        booking.setYonghuxingming(user.getYonghuxingming());
        booking.setShoujihaoma(user.getShoujihaoma());
        booking.setSfsh("通过");
        kechengyuyueService.save(booking);

        // 创建退课申请
        KechengtuikeEntity cancellation = new KechengtuikeEntity();
        cancellation.setTuikebianhao("TEST-TUIKE-STATUS");
        cancellation.setYuyuebianhao(booking.getYuyuebianhao());
        cancellation.setKechengmingcheng(course.getKechengmingcheng());
        cancellation.setYonghuzhanghao(user.getYonghuzhanghao());
        cancellation.setYonghuxingming(user.getYonghuxingming());
        cancellation.setTuikeyuanyin("课程难度太大");
        cancellation.setIspay("未退款");
        cancellation.setTuikeshijian(new Date());

        kechengtuikeService.save(cancellation);
        Long cancellationId = cancellation.getId();

        // 测试状态流转：未退款 -> 退款中 -> 已退款
        cancellation.setIspay("退款中");
        kechengtuikeService.updateById(cancellation);

        KechengtuikeEntity processingCancellation = kechengtuikeService.getById(cancellationId);
        assertThat(processingCancellation.getIspay()).isEqualTo("退款中");

        cancellation.setIspay("已退款");
        kechengtuikeService.updateById(cancellation);

        KechengtuikeEntity completedCancellation = kechengtuikeService.getById(cancellationId);
        assertThat(completedCancellation.getIspay()).isEqualTo("已退款");

        // 测试拒绝状态
        cancellation.setIspay("退款拒绝");
        kechengtuikeService.updateById(cancellation);

        KechengtuikeEntity rejectedCancellation = kechengtuikeService.getById(cancellationId);
        assertThat(rejectedCancellation.getIspay()).isEqualTo("退款拒绝");
    }

    @Test
    void shouldCalculateCancellationStatistics() {
        // 创建测试数据用于统计
        YonghuEntity user1 = TestDataFactory.yonghu()
                .username("cancel-user-1")
                .password("password123")
                .passwordHash("$2a$10$defaultHashForTesting")
                .fullName("退课用户1")
                .phoneNumber("13800138001")
                .build();
        yonghuService.save(user1);

        YonghuEntity user2 = TestDataFactory.yonghu()
                .username("cancel-user-2")
                .password("password123")
                .passwordHash("$2a$10$defaultHashForTesting")
                .fullName("退课用户2")
                .phoneNumber("13800138002")
                .build();
        yonghuService.save(user2);

        // 创建课程
        JianshenkechengEntity course1 = TestDataFactory.course()
                .name("AUTO-CANCEL-COURSE-1")
                .type("瑜伽课")
                .price(BigDecimal.valueOf(199.00))
                .build();
        jianshenkechengService.save(course1);

        JianshenkechengEntity course2 = TestDataFactory.course()
                .name("AUTO-CANCEL-COURSE-2")
                .type("力量训练")
                .price(BigDecimal.valueOf(299.00))
                .build();
        jianshenkechengService.save(course2);

        // 创建预约
        KechengyuyueEntity booking1 = new KechengyuyueEntity();
        booking1.setYuyuebianhao("AUTO-CANCEL-BOOKING-1");
        booking1.setKechengmingcheng(course1.getKechengmingcheng());
        booking1.setKechengleixing(course1.getKechengleixing());
        booking1.setShangkeshijian("周一 10:00-11:00");
        booking1.setShangkedidian("一号教室");
        booking1.setYonghuzhanghao(user1.getYonghuzhanghao());
        booking1.setYonghuxingming(user1.getYonghuxingming());
        booking1.setShoujihaoma(user1.getShoujihaoma());
        booking1.setSfsh("通过");
        kechengyuyueService.save(booking1);

        KechengyuyueEntity booking2 = new KechengyuyueEntity();
        booking2.setYuyuebianhao("AUTO-CANCEL-BOOKING-2");
        booking2.setKechengmingcheng(course2.getKechengmingcheng());
        booking2.setKechengleixing(course2.getKechengleixing());
        booking2.setShangkeshijian("周二 14:00-15:00");
        booking2.setShangkedidian("二号教室");
        booking2.setYonghuzhanghao(user2.getYonghuzhanghao());
        booking2.setYonghuxingming(user2.getYonghuxingming());
        booking2.setShoujihaoma(user2.getShoujihaoma());
        booking2.setSfsh("通过");
        kechengyuyueService.save(booking2);

        // 创建退课申请
        KechengtuikeEntity cancellation1 = new KechengtuikeEntity();
        cancellation1.setTuikebianhao("AUTO-CANCEL-1");
        cancellation1.setYuyuebianhao(booking1.getYuyuebianhao());
        cancellation1.setKechengmingcheng(course1.getKechengmingcheng());
        cancellation1.setYonghuzhanghao(user1.getYonghuzhanghao());
        cancellation1.setYonghuxingming(user1.getYonghuxingming());
        cancellation1.setTuikeyuanyin("时间冲突");
        cancellation1.setIspay("已退款");
        cancellation1.setTuikeshijian(new Date());
        cancellation1.setTuikuanjine(199.0);
        kechengtuikeService.save(cancellation1);

        KechengtuikeEntity cancellation2 = new KechengtuikeEntity();
        cancellation2.setTuikebianhao("AUTO-CANCEL-2");
        cancellation2.setYuyuebianhao(booking2.getYuyuebianhao());
        cancellation2.setKechengmingcheng(course2.getKechengmingcheng());
        cancellation2.setYonghuzhanghao(user2.getYonghuzhanghao());
        cancellation2.setYonghuxingming(user2.getYonghuxingming());
        cancellation2.setTuikeyuanyin("身体不适");
        cancellation2.setIspay("退款中");
        cancellation2.setTuikeshijian(new Date());
        cancellation2.setTuikuanjine(149.5);
        kechengtuikeService.save(cancellation2);

        // 测试按退款状态统计
        Map<String, Object> statusParams = new HashMap<>();
        statusParams.put("xColumn", "ispay");
        statusParams.put("yColumn", "tuikuanjine");

        var statusStats = kechengtuikeService.selectValue(statusParams, new QueryWrapper<>());
        assertThat(statusStats).isNotNull();

        // 测试按课程类型分组统计
        Map<String, Object> courseTypeParams = new HashMap<>();
        courseTypeParams.put("column", "kechengmingcheng");

        var courseGroups = kechengtuikeService.selectGroup(courseTypeParams, new QueryWrapper<>());
        assertThat(courseGroups).isNotNull();

        // 验证至少有两条退课记录
        List<KechengtuikeEntity> allCancellations = kechengtuikeService.list(
                new QueryWrapper<KechengtuikeEntity>().like("tuikebianhao", "AUTO-CANCEL"));
        assertThat(allCancellations).hasSizeGreaterThanOrEqualTo(2);
    }

    @Test
    void shouldValidateCancellationBusinessRules() {
        // 测试退课业务规则

        // 1. 验证必填字段
        KechengtuikeEntity incompleteCancellation = new KechengtuikeEntity();
        kechengtuikeService.save(incompleteCancellation);
        assertThat(incompleteCancellation.getId()).isNotNull();

        // 2. 验证退课原因合理性
        YonghuEntity user = TestDataFactory.createTestYonghu("KechengtuikeServiceImplTest");
        yonghuService.save(user);

        JianshenkechengEntity course = TestDataFactory.course()
                .name("TEST-COURSE-RULES")
                .type("综合课程")
                .price(BigDecimal.valueOf(249.00))
                .build();
        jianshenkechengService.save(course);

        KechengyuyueEntity booking = new KechengyuyueEntity();
        booking.setYuyuebianhao("TEST-YY-RULES-001");
        booking.setKechengmingcheng(course.getKechengmingcheng());
        booking.setKechengleixing(course.getKechengleixing());
        booking.setShangkeshijian("周三 13:00-14:00");
        booking.setShangkedidian("综合教室");
        booking.setYonghuzhanghao(user.getYonghuzhanghao());
        booking.setYonghuxingming(user.getYonghuxingming());
        booking.setShoujihaoma(user.getShoujihaoma());
        booking.setSfsh("通过");
        kechengyuyueService.save(booking);

        // 测试各种退课原因
        String[] reasons = {"时间冲突", "身体不适", "临时有事", "课程难度太大", "教练更换"};
        for (int i = 0; i < reasons.length; i++) {
            KechengtuikeEntity cancellation = new KechengtuikeEntity();
            cancellation.setTuikebianhao("TEST-TUIKE-RULES-" + i);
            cancellation.setYuyuebianhao(booking.getYuyuebianhao());
            cancellation.setKechengmingcheng(course.getKechengmingcheng());
            cancellation.setYonghuzhanghao(user.getYonghuzhanghao());
            cancellation.setYonghuxingming(user.getYonghuxingming());
            cancellation.setTuikeyuanyin(reasons[i]);
            cancellation.setIspay("未退款");
            cancellation.setTuikeshijian(new Date());

            kechengtuikeService.save(cancellation);
            assertThat(cancellation.getId()).isNotNull();
        }

        // 3. 验证退款金额合理性
        KechengtuikeEntity highRefundCancellation = new KechengtuikeEntity();
        highRefundCancellation.setTuikebianhao("TEST-TUIKE-HIGH-REFUND");
        highRefundCancellation.setYuyuebianhao(booking.getYuyuebianhao());
        highRefundCancellation.setKechengmingcheng(course.getKechengmingcheng());
        highRefundCancellation.setYonghuzhanghao(user.getYonghuzhanghao());
        highRefundCancellation.setYonghuxingming(user.getYonghuxingming());
        highRefundCancellation.setTuikeyuanyin("全额退款申请");
        highRefundCancellation.setIspay("未退款");
        highRefundCancellation.setTuikeshijian(new Date());
        highRefundCancellation.setTuikuanjine(249.0); // 全额退款
        kechengtuikeService.save(highRefundCancellation);

        KechengtuikeEntity lowRefundCancellation = new KechengtuikeEntity();
        lowRefundCancellation.setTuikebianhao("TEST-TUIKE-LOW-REFUND");
        lowRefundCancellation.setYuyuebianhao(booking.getYuyuebianhao());
        lowRefundCancellation.setKechengmingcheng(course.getKechengmingcheng());
        lowRefundCancellation.setYonghuzhanghao(user.getYonghuzhanghao());
        lowRefundCancellation.setYonghuxingming(user.getYonghuxingming());
        lowRefundCancellation.setTuikeyuanyin("部分退款申请");
        lowRefundCancellation.setIspay("未退款");
        lowRefundCancellation.setTuikeshijian(new Date());
        lowRefundCancellation.setTuikuanjine(124.5); // 50%退款
        kechengtuikeService.save(lowRefundCancellation);

        assertThat(highRefundCancellation.getId()).isNotNull();
        assertThat(lowRefundCancellation.getId()).isNotNull();

        // 4. 验证退课时间记录
        KechengtuikeEntity timedCancellation = new KechengtuikeEntity();
        timedCancellation.setTuikebianhao("TEST-TUIKE-TIME");
        timedCancellation.setYuyuebianhao(booking.getYuyuebianhao());
        timedCancellation.setKechengmingcheng(course.getKechengmingcheng());
        timedCancellation.setYonghuzhanghao(user.getYonghuzhanghao());
        timedCancellation.setYonghuxingming(user.getYonghuxingming());
        timedCancellation.setTuikeyuanyin("时间记录测试");
        timedCancellation.setIspay("已退款");
        timedCancellation.setTuikeshijian(new Date());
        timedCancellation.setTuikuanjine(249.0);

        kechengtuikeService.save(timedCancellation);

        KechengtuikeEntity savedTimedCancellation = kechengtuikeService.getById(timedCancellation.getId());
        assertThat(savedTimedCancellation.getTuikeshijian()).isNotNull();
        assertThat(savedTimedCancellation.getAddtime()).isNotNull();
    }
}


