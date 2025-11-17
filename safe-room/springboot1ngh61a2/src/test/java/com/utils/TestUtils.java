package com.utils;

import com.entity.AssetsEntity;
import com.entity.ChatEntity;
import com.entity.ConfigEntity;
import com.entity.CourseReservationEntity;
import com.entity.DaoqitixingEntity;
import com.entity.DiscussjianshenkechengEntity;
import com.entity.HuiyuankaEntity;
import com.entity.HuiyuankagoumaiEntity;
import com.entity.HuiyuanxufeiEntity;
import com.entity.JianshenjiaolianEntity;
import com.entity.JianshenkechengEntity;
import com.entity.JianshenqicaiEntity;
import com.entity.KechengleixingEntity;
import com.entity.KechengtuikeEntity;
import com.entity.KechengyuyueEntity;
import com.entity.MembershipCardEntity;
import com.entity.MembershipCardPurchaseEntity;
import com.entity.NewsEntity;
import com.entity.NewstypeEntity;
import com.entity.SijiaoyuyueEntity;
import com.entity.StoreupEntity;
import com.entity.TokenEntity;
import com.entity.UserEntity;
import com.entity.UsersEntity;
import com.entity.YonghuEntity;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicLong;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

/**
 * Utility helpers for backend automated tests.
 */
public final class TestUtils {

    private static final AtomicLong UNIQUE = new AtomicLong(1_000);

    private TestUtils() {
    }

    public static UserEntity createUser(Long id, String username, String password) {
        UserEntity user = new UserEntity();
        user.setId(id != null ? id : nextId());
        user.setUsername(username);
        user.setPassword(password);
        user.setAddtime(new Date());
        return user;
    }

    public static TokenEntity createToken(Long userId, String username, String role, String tableName, Date expiredAt) {
        TokenEntity token = new TokenEntity();
        token.setId(nextId());
        token.setUserid(userId);
        token.setUsername(username);
        token.setRole(role);
        token.setTablename(tableName);
        token.setToken("token-" + username + "-" + System.nanoTime());
        token.setExpiratedtime(expiredAt);
        token.setAddtime(new Date());
        return token;
    }

    public static ChatEntity createChat(Long userId, Long adminId) {
        ChatEntity entity = new ChatEntity();
        entity.setId(nextId());
        entity.setUserid(userId);
        entity.setAdminid(adminId);
        entity.setAsk("问题-" + uniqueSuffix());
        entity.setReply("回复内容-" + uniqueSuffix());
        entity.setIsreply(1);
        entity.setAddtime(new Date());
        return entity;
    }

    public static HuiyuankaEntity createMembershipCard(String namePrefix) {
        HuiyuankaEntity entity = new HuiyuankaEntity();
        entity.setId(nextId());
        entity.setHuiyuankamingcheng(namePrefix + "-" + uniqueSuffix());
        entity.setTupian("/img/member-" + uniqueSuffix() + ".png");
        entity.setYouxiaoqi("12个月");
        entity.setJiage(1999);
        entity.setShiyongshuoming("无限次使用");
        entity.setHuiyuankaxiangqing("由自动化测试创建");
        entity.setAddtime(new Date());
        return entity;
    }

    public static HuiyuankagoumaiEntity createMembershipPurchase(String username) {
        HuiyuankagoumaiEntity entity = new HuiyuankagoumaiEntity();
        entity.setId(nextId());
        entity.setHuiyuankahao("VIP-" + uniqueSuffix());
        entity.setHuiyuankamingcheng("测试会员卡");
        entity.setTupian("/img/card.png");
        entity.setYouxiaoqi("6个月");
        entity.setJiage(1299);
        entity.setGoumairiqi(new Date());
        entity.setYonghuzhanghao(username);
        entity.setYonghuxingming("自动化会员");
        entity.setShoujihaoma(randomPhone());
        entity.setIspay("已支付");
        entity.setAddtime(new Date());
        return entity;
    }

    public static HuiyuanxufeiEntity createMembershipRenewal(String username) {
        HuiyuanxufeiEntity entity = new HuiyuanxufeiEntity();
        entity.setId(nextId());
        entity.setYonghuzhanghao(username);
        entity.setYonghuxingming("自动化会员");
        entity.setTouxiang("/img/member.png");
        entity.setJiaofeibianhao("XF-" + uniqueSuffix());
        entity.setHuiyuankamingcheng("黄金会员");
        entity.setYouxiaoqi("12个月");
        entity.setJiage(999D);
        entity.setXufeishijian(new Date());
        entity.setIspay("已支付");
        entity.setAddtime(new Date());
        return entity;
    }

    public static JianshenjiaolianEntity createCoachTemplate(String namePrefix) {
        JianshenjiaolianEntity entity = new JianshenjiaolianEntity();
        entity.setId(nextId());
        entity.setJiaoliangonghao("coach-" + uniqueSuffix());
        entity.setMima("secret");
        entity.setJiaolianxingming(namePrefix + "-教练");
        entity.setZhaopian("/img/coach.png");
        entity.setXingbie("男");
        entity.setNianling("30");
        entity.setShengao("180cm");
        entity.setTizhong("75kg");
        entity.setLianxidianhua(randomPhone());
        entity.setSijiaojiage(399D);
        entity.setGerenjianjie("自动化测试生成的教练简介");
        entity.setAddtime(new Date());
        return entity;
    }

    public static JianshenqicaiEntity createEquipmentTemplate(String namePrefix) {
        JianshenqicaiEntity entity = new JianshenqicaiEntity();
        entity.setId(nextId());
        entity.setQicaimingcheng(namePrefix + "-" + uniqueSuffix());
        entity.setTupian("/img/equipment.png");
        entity.setPinpai("TestBrand");
        entity.setShiyongfangfa("跟随说明使用");
        entity.setShoushenxiaoguo("核心力量");
        entity.setQicaijieshao("自动化测试器材");
        entity.setJiaoxueshipin("/video/tutorial.mp4");
        entity.setAddtime(new Date());
        return entity;
    }

    public static KechengleixingEntity createCourseTypeTemplate(String typeName) {
        KechengleixingEntity entity = new KechengleixingEntity();
        entity.setId(nextId());
        entity.setKechengleixing(typeName + "-" + uniqueSuffix());
        entity.setAddtime(new Date());
        return entity;
    }

    public static KechengtuikeEntity createCourseRefundTemplate(String username) {
        KechengtuikeEntity entity = new KechengtuikeEntity();
        entity.setId(nextId());
        entity.setYuyuebianhao("YY-" + uniqueSuffix());
        entity.setKechengmingcheng("测试课程");
        entity.setTupian("/img/course.png");
        entity.setKechengleixing("体验课");
        entity.setShangkeshijian("周三 18:00");
        entity.setShangkedidian("一号教室");
        entity.setKechengjiage(259D);
        entity.setJiaoliangonghao("coach-" + uniqueSuffix());
        entity.setJiaolianxingming("退款教练");
        entity.setShenqingshijian(new Date());
        entity.setHuiyuankahao("VIP-REFUND");
        entity.setYonghuzhanghao(username);
        entity.setYonghuxingming("退款会员");
        entity.setShoujihaoma(randomPhone());
        entity.setTuikeyuanyin("临时有事");
        entity.setSfsh("待审核");
        entity.setIspay("未支付");
        entity.setAddtime(new Date());
        return entity;
    }

    public static SijiaoyuyueEntity createPrivateReservation(String username) {
        SijiaoyuyueEntity entity = new SijiaoyuyueEntity();
        entity.setId(nextId());
        entity.setYuyuebianhao("SJ-" + uniqueSuffix());
        entity.setJiaoliangonghao("coach-" + uniqueSuffix());
        entity.setJiaolianxingming("私教教练");
        entity.setZhaopian("/img/coach-private.png");
        entity.setSijiaojiage(499D);
        entity.setYuyueshijian(Date.from(Instant.now().plus(2, ChronoUnit.DAYS)));
        entity.setYonghuzhanghao(username);
        entity.setYonghuxingming("私教会员");
        entity.setShoujihaoma(randomPhone());
        entity.setHuiyuankahao("VIP-PRIVATE");
        entity.setBeizhu("自动化预约");
        entity.setSfsh("待审核");
        entity.setIspay("未支付");
        entity.setAddtime(new Date());
        return entity;
    }

    public static NewsEntity createNewsItem(String titlePrefix) {
        NewsEntity entity = new NewsEntity();
        entity.setId(nextId());
        entity.setTitle(titlePrefix + "-" + uniqueSuffix());
        entity.setIntroduction("自动化测试新闻简介");
        entity.setTypename("资讯");
        entity.setName("测试发布者");
        entity.setHeadportrait("/img/publisher.png");
        entity.setClicknum(0);
        entity.setThumbsupnum(0);
        entity.setCrazilynum(0);
        entity.setStoreupnum(0);
        entity.setPicture("/img/news.png");
        entity.setContent("自动化测试新闻内容");
        entity.setAddtime(new Date());
        return entity;
    }

    public static NewstypeEntity createNewsType(String typeName) {
        NewstypeEntity entity = new NewstypeEntity();
        entity.setId(nextId());
        entity.setTypename(typeName + "-" + uniqueSuffix());
        entity.setAddtime(new Date());
        return entity;
    }

    public static DiscussjianshenkechengEntity createCourseDiscussion(Long refCourseId, Long userId) {
        DiscussjianshenkechengEntity entity = new DiscussjianshenkechengEntity();
        entity.setId(nextId());
        entity.setRefid(refCourseId);
        entity.setUserid(userId);
        entity.setAvatarurl("/img/member-discussion.png");
        entity.setNickname("会员-" + uniqueSuffix());
        entity.setContent("课程非常棒 - " + uniqueSuffix());
        entity.setReply("感谢反馈");
        entity.setAddtime(new Date());
        return entity;
    }

    public static DaoqitixingEntity createExpirationReminder(String username) {
        DaoqitixingEntity entity = new DaoqitixingEntity();
        entity.setId(nextId());
        entity.setYonghuzhanghao(username);
        entity.setYonghuxingming("提醒会员");
        entity.setTouxiang("/img/member-reminder.png");
        entity.setHuiyuankahao("VIP-REMINDER");
        entity.setYouxiaoqizhi(Date.from(Instant.now().plus(5, ChronoUnit.DAYS)));
        entity.setTixingshijian(new Date());
        entity.setBeizhu("到期提醒");
        entity.setAddtime(new Date());
        return entity;
    }

    public static ConfigEntity createConfigEntry(String name, String value) {
        ConfigEntity entity = new ConfigEntity();
        entity.setId(nextId());
        entity.setName(name + "-" + uniqueSuffix());
        entity.setValue(value);
        entity.setUrl("/config/" + name);
        return entity;
    }

    public static UsersEntity createAdminUser(String username) {
        UsersEntity entity = new UsersEntity();
        entity.setId(nextId());
        entity.setUsername(username);
        entity.setPassword("password");
        entity.setRole("管理员");
        entity.setImage("/img/admin.png");
        entity.setAddtime(new Date());
        return entity;
    }

    public static YonghuEntity createMemberEntity(String username) {
        YonghuEntity entity = new YonghuEntity();
        entity.setId(nextId());
        entity.setYonghuzhanghao(username);
        entity.setMima("secret");
        entity.setYonghuxingming("会员-" + uniqueSuffix());
        entity.setTouxiang("/img/member.png");
        entity.setXingbie("女");
        entity.setShoujihaoma(randomPhone());
        entity.setHuiyuankahao("VIP-" + uniqueSuffix());
        entity.setYouxiaoqizhi(Date.from(Instant.now().plus(30, ChronoUnit.DAYS)));
        entity.setStatus(0);
        entity.setAddtime(new Date());
        return entity;
    }

    public static HttpServletRequest mockRequestWithSessionAttribute(String key, Object value) {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.getSession(true).setAttribute(key, value);
        return request;
    }

    public static JianshenkechengEntity createCourseTemplate(String namePrefix) {
        JianshenkechengEntity entity = new JianshenkechengEntity();
        entity.setId(nextId());
        entity.setKechengmingcheng(namePrefix + "-" + System.nanoTime());
        entity.setKechengleixing("瑜伽");
        entity.setShangkeshijian(Date.from(Instant.now().plus(1, ChronoUnit.DAYS)));
        entity.setShangkedidian("测试教室");
        entity.setKechengjiage(199D);
        entity.setKechengjianjie("自动化测试创建的课程");
        entity.setJiaoliangonghao("coach001");
        entity.setJiaolianxingming("王教练");
        entity.setClicknum(0);
        entity.setDiscussnum(0);
        entity.setStoreupnum(0);
        return entity;
    }

    public static KechengyuyueEntity createReservationTemplate(String yuyuebianhao, String username) {
        KechengyuyueEntity entity = new KechengyuyueEntity();
        entity.setId(nextId());
        entity.setYuyuebianhao(yuyuebianhao);
        entity.setKechengmingcheng("基础瑜伽");
        entity.setKechengleixing("瑜伽");
        entity.setShangkeshijian("周五 19:00");
        entity.setShangkedidian("一号教室");
        entity.setKechengjiage(199D);
        entity.setJiaoliangonghao("coach001");
        entity.setJiaolianxingming("王教练");
        entity.setYuyueshijian(new Date());
        entity.setHuiyuankahao("VIP001");
        entity.setYonghuzhanghao(username);
        entity.setYonghuxingming("测试会员");
        entity.setShoujihaoma("1880000" + ThreadLocalRandom.current().nextInt(1000, 9999));
        entity.setSfsh("待审核");
        entity.setIspay("未支付");
        return entity;
    }

    public static KechengyuyueEntity createReservationWithStatus(String yuyuebianhao,
                                                                 String username,
                                                                 String approvalStatus,
                                                                 String payStatus) {
        KechengyuyueEntity entity = createReservationTemplate(yuyuebianhao, username);
        entity.setSfsh(approvalStatus);
        entity.setIspay(payStatus);
        return entity;
    }

    public static AssetsEntity createAssetRecord(String module, String assetType) {
        AssetsEntity asset = new AssetsEntity<>();
        asset.setId(nextId());
        asset.setAssetName(module + "-asset-" + uniqueSuffix());
        asset.setAssetType(assetType);
        asset.setFilePath("/upload/assets/" + module + "/" + assetType + "/" + uniqueSuffix() + ".png");
        asset.setFileSize(4096L);
        asset.setFileFormat("png");
        asset.setModule(module);
        asset.setUsage("automation");
        asset.setDimensions("128x128");
        asset.setWidth(128);
        asset.setHeight(128);
        asset.setVersion("v1");
        asset.setDescription("自动化测试构造的素材");
        asset.setTags("auto,test");
        asset.setCategory("static");
        asset.setStatus("active");
        asset.setUploadUser("tester");
        asset.setAddtime(new Date());
        asset.setUpdatetime(new Date());
        return asset;
    }

    public static MembershipCardPurchaseEntity createMembershipCardPurchaseRecord(String username,
                                                                                  String paymentStatus) {
        MembershipCardPurchaseEntity entity = new MembershipCardPurchaseEntity<>();
        entity.setId(nextId());
        entity.setMembershipCardNumber("MC-" + uniqueSuffix());
        entity.setMembershipCardName("旗舰会员卡");
        entity.setImage("/img/card-" + uniqueSuffix() + ".png");
        entity.setValidityPeriod("24个月");
        entity.setPrice(2999);
        entity.setPurchaseDate(new Date());
        entity.setUsername(username);
        entity.setFullName("购卡会员-" + uniqueSuffix());
        entity.setPhoneNumber(randomPhone());
        entity.setPaymentStatus(paymentStatus);
        entity.setAddtime(new Date());
        return entity;
    }

    public static CourseReservationEntity createCourseReservationRecord(String username,
                                                                        String auditStatus,
                                                                        String paymentStatus) {
        CourseReservationEntity entity = new CourseReservationEntity<>();
        entity.setId(nextId());
        entity.setReservationNumber("CR-" + uniqueSuffix());
        entity.setCourseName("功能性训练");
        entity.setImage("/img/reservation.png");
        entity.setCourseType("功能训练");
        entity.setClassTime("周日 09:00");
        entity.setClassLocation("功能教室");
        entity.setCoursePrice(329D);
        entity.setCoachId("coach-" + uniqueSuffix());
        entity.setCoachName("预约教练");
        entity.setReservationTime(new Date());
        entity.setMembershipCardNumber("VIP-" + uniqueSuffix());
        entity.setUsername(username);
        entity.setFullName("预约会员");
        entity.setPhoneNumber(randomPhone());
        entity.setAuditStatus(auditStatus);
        entity.setPaymentStatus(paymentStatus);
        entity.setAddtime(new Date());
        return entity;
    }

    public static MembershipCardEntity createMembershipCardEntity(String name,
                                                                  int price,
                                                                  String validity,
                                                                  String instructions) {
        MembershipCardEntity entity = new MembershipCardEntity();
        entity.setId(nextId());
        entity.setMembershipCardName(name);
        entity.setPrice(price);
        entity.setValidityPeriod(validity);
        entity.setUsageInstructions(instructions);
        entity.setMembershipCardDetails("自动生成的权益说明");
        entity.setImage("/img/membership-" + uniqueSuffix() + ".png");
        entity.setAddtime(new Date());
        return entity;
    }

    public static StoreupEntity createFavorite(Long userId, Long refId, String tableName, String name) {
        StoreupEntity entity = new StoreupEntity();
        entity.setId(nextId());
        entity.setUserid(userId);
        entity.setRefid(refId);
        entity.setTablename(tableName);
        entity.setName(name);
        entity.setPicture("/img/favorite-" + uniqueSuffix() + ".png");
        entity.setType("课程");
        entity.setInteltype("自动推荐");
        entity.setRemark("由自动化测试创建");
        entity.setAddtime(new Date());
        return entity;
    }

    private static String uniqueSuffix() {
        return String.valueOf(UNIQUE.incrementAndGet());
    }

    private static String randomPhone() {
        return "188" + ThreadLocalRandom.current().nextInt(10000000, 99999999);
    }

    private static long nextId() {
        return UNIQUE.incrementAndGet() + 1_000L;
    }

    public static String loginAndGetToken(MockMvc mockMvc, ObjectMapper mapper, String username, String password) throws Exception {
        String response = mockMvc.perform(post("/user/login")
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .param("username", username)
                        .param("password", password))
                .andReturn()
                .getResponse()
                .getContentAsString();
        return mapper.readTree(response).path("token").asText();
    }

    // 异常场景数据构建方法
    public static JianshenkechengEntity createCourseWithNullFields() {
        JianshenkechengEntity entity = new JianshenkechengEntity();
        entity.setId(nextId());
        // 故意不设置必填字段
        return entity;
    }

    public static KechengyuyueEntity createReservationWithInvalidData() {
        KechengyuyueEntity entity = new KechengyuyueEntity();
        entity.setId(nextId());
        entity.setYuyuebianhao("");
        entity.setKechengmingcheng(null);
        entity.setKechengjiage(-100D); // 负数价格
        return entity;
    }

    public static YonghuEntity createMemberWithBoundaryValues() {
        YonghuEntity entity = new YonghuEntity();
        entity.setId(nextId());
        entity.setYonghuzhanghao("a".repeat(255)); // 最大长度
        entity.setMima(""); // 空密码
        entity.setYonghuxingming("边界值测试用户");
        entity.setShoujihaoma("1".repeat(20)); // 超长手机号
        entity.setStatus(Integer.MAX_VALUE); // 边界状态值
        entity.setAddtime(new Date(Long.MAX_VALUE)); // 边界日期
        return entity;
    }

    public static Map<String, Object> createInvalidPaginationParams() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "-1");
        params.put("limit", "0");
        return params;
    }

    public static Map<String, Object> createLargePaginationParams() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "999999");
        params.put("limit", "999999");
        return params;
    }

    public static Map<String, Object> createInvalidQueryParams() {
        Map<String, Object> params = new HashMap<>();
        params.put("xColumn", "'; DROP TABLE users; --");
        params.put("yColumn", "<script>alert('xss')</script>");
        return params;
    }

    public static TokenEntity createExpiredToken(Long userId, String username) {
        TokenEntity token = createToken(userId, username, "管理员", "users", 
                Date.from(Instant.now().minus(1, ChronoUnit.DAYS))); // 已过期
        return token;
    }

    public static TokenEntity createInvalidToken(Long userId, String username) {
        TokenEntity token = createToken(userId, username, "管理员", "users", 
                Date.from(Instant.now().plus(1, ChronoUnit.DAYS)));
        token.setToken(""); // 空token
        return token;
    }
}

