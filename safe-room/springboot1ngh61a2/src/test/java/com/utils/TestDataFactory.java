package com.utils;

import com.entity.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 测试数据工厂 - 提供统一的测试数据创建和管理功能
 * 支持Builder模式，链式调用和默认值生成
 */
public final class TestDataFactory {

    private static final Logger log = LoggerFactory.getLogger(TestDataFactory.class);
    private static final ConcurrentHashMap<String, List<Long>> CREATED_ENTITY_IDS = new ConcurrentHashMap<>();
    // 使用更高的起始值避免与其他ID生成器的冲突，确保线程安全
    private static final AtomicLong ID_GENERATOR = new AtomicLong(100_000);

    private TestDataFactory() {
        // Utility class
    }

    /**
     * 生成唯一ID
     */
    public static Long nextId() {
        return ID_GENERATOR.incrementAndGet();
    }

    /**
     * 记录创建的实体ID用于后续清理
     */
    private static void recordCreatedEntity(String testClassName, String entityType, Long entityId) {
        String key = testClassName + ":" + entityType;
        CREATED_ENTITY_IDS.computeIfAbsent(key, k -> new ArrayList<>()).add(entityId);
        log.debug("Recorded entity creation: {} - {} - {}", testClassName, entityType, entityId);
    }

    /**
     * 清理指定测试类的所有创建实体
     */
    public static void cleanupAllCreatedEntities(String testClassName) {
        List<String> keysToRemove = new ArrayList<>();
        for (String key : CREATED_ENTITY_IDS.keySet()) {
            if (key.startsWith(testClassName + ":")) {
                keysToRemove.add(key);
            }
        }

        for (String key : keysToRemove) {
            CREATED_ENTITY_IDS.remove(key);
        }

        log.info("Cleaned up all entity tracking records for test class: {}", testClassName);
    }

    // ==================== Builder Classes ====================

    /**
     * 用户实体Builder
     */
    public static class UserEntityBuilder {
        private Long id;
        private String username;
        private String password;
        private String passwordHash;
        private String role = "用户";
        private Integer status = 0;
        private String testClassName;

        public UserEntityBuilder testClass(String testClassName) {
            this.testClassName = testClassName;
            return this;
        }

        public UserEntityBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public UserEntityBuilder username(String username) {
            this.username = username;
            return this;
        }

        public UserEntityBuilder password(String password) {
            this.password = password;
            return this;
        }

        public UserEntityBuilder passwordHash(String passwordHash) {
            this.passwordHash = passwordHash;
            return this;
        }

        public UserEntityBuilder role(String role) {
            this.role = role;
            return this;
        }

        public UserEntityBuilder status(Integer status) {
            this.status = status;
            return this;
        }

        public UserEntity build() {
            if (!StringUtils.hasText(username)) {
                throw new IllegalArgumentException("Username is required");
            }
            if (!StringUtils.hasText(password) && !StringUtils.hasText(passwordHash)) {
                throw new IllegalArgumentException("Either password or passwordHash is required");
            }

            UserEntity user = new UserEntity();
            user.setId(id != null ? id : nextId());
            user.setUsername(username);
            user.setPassword(password);
            user.setPasswordHash(passwordHash);
            user.setRole(role);
            user.setStatus(status);
            user.setAddtime(new Date());

            if (testClassName != null) {
                recordCreatedEntity(testClassName, "UserEntity", user.getId());
            }

            return user;
        }

        public UserEntity buildAndSave() {
            UserEntity user = build();
            // 这里可以添加自动保存逻辑，如果需要的话
            return user;
        }
    }

    /**
     * 会员卡实体Builder
     */
    public static class HuiyuankaEntityBuilder {
        private Long id;
        private String huiyuankamingcheng;
        private BigDecimal jiage = BigDecimal.valueOf(199.00);
        private String youxiaoqi;
        private String testClassName;

        public HuiyuankaEntityBuilder testClass(String testClassName) {
            this.testClassName = testClassName;
            return this;
        }

        public HuiyuankaEntityBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public HuiyuankaEntityBuilder name(String name) {
            this.huiyuankamingcheng = name;
            return this;
        }

        public HuiyuankaEntityBuilder price(BigDecimal price) {
            this.jiage = price;
            return this;
        }

        public HuiyuankaEntityBuilder validityPeriod(String validityPeriod) {
            this.youxiaoqi = validityPeriod;
            return this;
        }

        public HuiyuankaEntity build() {
            if (!StringUtils.hasText(huiyuankamingcheng)) {
                throw new IllegalArgumentException("Membership card name is required");
            }

            HuiyuankaEntity card = new HuiyuankaEntity();
            card.setId(id != null ? id : nextId());
            card.setHuiyuankamingcheng(huiyuankamingcheng);
            card.setJiage(jiage.intValue());
            card.setYouxiaoqi(youxiaoqi != null ? youxiaoqi : "1年");
            card.setAddtime(new Date());

            if (testClassName != null) {
                recordCreatedEntity(testClassName, "HuiyuankaEntity", card.getId());
            }

            return card;
        }
    }

    /**
     * 健身教练实体Builder
     */
    public static class JianshenjiaolianEntityBuilder {
        private Long id;
        private String jiaoliangonghao;
        private String jiaolianxingming;
        private String mima;
        private String passwordHash;
        private BigDecimal sijiaojiage = BigDecimal.valueOf(199.00);
        private String testClassName;

        public JianshenjiaolianEntityBuilder testClass(String testClassName) {
            this.testClassName = testClassName;
            return this;
        }

        public JianshenjiaolianEntityBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public JianshenjiaolianEntityBuilder employeeId(String employeeId) {
            this.jiaoliangonghao = employeeId;
            return this;
        }

        public JianshenjiaolianEntityBuilder name(String name) {
            this.jiaolianxingming = name;
            return this;
        }

        public JianshenjiaolianEntityBuilder password(String password) {
            this.mima = password;
            return this;
        }

        public JianshenjiaolianEntityBuilder passwordHash(String passwordHash) {
            this.passwordHash = passwordHash;
            return this;
        }

        public JianshenjiaolianEntityBuilder coachingPrice(BigDecimal price) {
            this.sijiaojiage = price;
            return this;
        }

        public JianshenjiaolianEntity build() {
            if (!StringUtils.hasText(jiaoliangonghao)) {
                throw new IllegalArgumentException("Employee ID is required");
            }
            if (!StringUtils.hasText(jiaolianxingming)) {
                throw new IllegalArgumentException("Coach name is required");
            }

            JianshenjiaolianEntity coach = new JianshenjiaolianEntity();
            coach.setId(id != null ? id : nextId());
            coach.setJiaoliangonghao(jiaoliangonghao);
            coach.setJiaolianxingming(jiaolianxingming);
            coach.setMima(mima);
            coach.setPasswordHash(passwordHash);
            coach.setSijiaojiage(sijiaojiage.doubleValue());
            coach.setXingbie("男");
            coach.setNianling("30");
            coach.setShengao("180cm");
            coach.setTizhong("75kg");
            coach.setLianxidianhua("13800138000");
            coach.setGerenjianjie("专业健身教练");
            coach.setAddtime(new Date());

            if (testClassName != null) {
                recordCreatedEntity(testClassName, "JianshenjiaolianEntity", coach.getId());
            }

            return coach;
        }
    }

    /**
     * 健身课程实体Builder
     */
    public static class JianshenkechengEntityBuilder {
        private Long id;
        private String kechengmingcheng;
        private String kechengleixing;
        private String jiaoliangonghao;
        private String jiaolianxingming;
        private BigDecimal kechengjiage = BigDecimal.valueOf(199.00);
        private String testClassName;

        public JianshenkechengEntityBuilder testClass(String testClassName) {
            this.testClassName = testClassName;
            return this;
        }

        public JianshenkechengEntityBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public JianshenkechengEntityBuilder name(String name) {
            this.kechengmingcheng = name;
            return this;
        }

        public JianshenkechengEntityBuilder type(String type) {
            this.kechengleixing = type;
            return this;
        }

        public JianshenkechengEntityBuilder coachId(String coachId) {
            this.jiaoliangonghao = coachId;
            return this;
        }

        public JianshenkechengEntityBuilder coachName(String coachName) {
            this.jiaolianxingming = coachName;
            return this;
        }

        public JianshenkechengEntityBuilder price(BigDecimal price) {
            this.kechengjiage = price;
            return this;
        }

        public JianshenkechengEntity build() {
            if (!StringUtils.hasText(kechengmingcheng)) {
                throw new IllegalArgumentException("Course name is required");
            }

            JianshenkechengEntity course = new JianshenkechengEntity();
            course.setId(id != null ? id : nextId());
            course.setKechengmingcheng(kechengmingcheng);
            course.setKechengleixing(kechengleixing != null ? kechengleixing : "综合课程");
            course.setJiaoliangonghao(jiaoliangonghao != null ? jiaoliangonghao : "coach001");
            course.setJiaolianxingming(jiaolianxingming != null ? jiaolianxingming : "张三");
            course.setKechengjiage(kechengjiage.doubleValue());
            course.setKechengjianjie("专业健身课程");
            course.setShangkeshijian(new Date());
            course.setShangkedidian("一号健身房");
            course.setAddtime(new Date());

            if (testClassName != null) {
                recordCreatedEntity(testClassName, "JianshenkechengEntity", course.getId());
            }

            return course;
        }
    }

    /**
     * 用户实体Builder (Yonghu)
     */
    public static class YonghuEntityBuilder {
        private Long id;
        private String yonghuzhanghao;
        private String mima;
        private String passwordHash;
        private String yonghuxingming;
        private String touxiang = "/img/default-avatar.png";
        private String xingbie = "男";
        private String shengao = "175cm";
        private String tizhong = "70kg";
        private String shoujihaoma;
        private String huiyuankahao;
        private String huiyuankamingcheng;
        private Date youxiaoqizhi;
        private Integer status = 0;
        private String testClassName;

        public YonghuEntityBuilder testClass(String testClassName) {
            this.testClassName = testClassName;
            return this;
        }

        public YonghuEntityBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public YonghuEntityBuilder username(String username) {
            this.yonghuzhanghao = username;
            return this;
        }

        public YonghuEntityBuilder password(String password) {
            this.mima = password;
            return this;
        }

        public YonghuEntityBuilder passwordHash(String passwordHash) {
            this.passwordHash = passwordHash;
            return this;
        }

        public YonghuEntityBuilder fullName(String fullName) {
            this.yonghuxingming = fullName;
            return this;
        }

        public YonghuEntityBuilder avatar(String avatar) {
            this.touxiang = avatar;
            return this;
        }

        public YonghuEntityBuilder gender(String gender) {
            this.xingbie = gender;
            return this;
        }

        public YonghuEntityBuilder height(String height) {
            this.shengao = height;
            return this;
        }

        public YonghuEntityBuilder weight(String weight) {
            this.tizhong = weight;
            return this;
        }

        public YonghuEntityBuilder phoneNumber(String phoneNumber) {
            this.shoujihaoma = phoneNumber;
            return this;
        }

        public YonghuEntityBuilder membershipCardNumber(String cardNumber) {
            this.huiyuankahao = cardNumber;
            return this;
        }

        public YonghuEntityBuilder membershipCardName(String cardName) {
            this.huiyuankamingcheng = cardName;
            return this;
        }

        public YonghuEntityBuilder expirationDate(Date expirationDate) {
            this.youxiaoqizhi = expirationDate;
            return this;
        }

        public YonghuEntityBuilder status(Integer status) {
            this.status = status;
            return this;
        }

        public YonghuEntity build() {
            if (!StringUtils.hasText(yonghuzhanghao)) {
                throw new IllegalArgumentException("Username is required");
            }
            if (!StringUtils.hasText(yonghuxingming)) {
                throw new IllegalArgumentException("Full name is required");
            }

            YonghuEntity user = new YonghuEntity();
            user.setId(id != null ? id : nextId());
            user.setYonghuzhanghao(yonghuzhanghao);
            user.setMima(mima);
            user.setPasswordHash(passwordHash);
            user.setYonghuxingming(yonghuxingming);
            user.setTouxiang(touxiang);
            user.setXingbie(xingbie);
            user.setShengao(shengao);
            user.setTizhong(tizhong);
            user.setShoujihaoma(shoujihaoma);
            user.setHuiyuankahao(huiyuankahao);
            user.setHuiyuankamingcheng(huiyuankamingcheng);
            user.setYouxiaoqizhi(youxiaoqizhi);
            user.setStatus(status);
            user.setAddtime(new Date());

            if (testClassName != null) {
                recordCreatedEntity(testClassName, "YonghuEntity", user.getId());
            }

            return user;
        }
    }

    /**
     * 管理员用户实体Builder (Users)
     */
    public static class UsersEntityBuilder {
        private Long id;
        private String username;
        private String password;
        private String role = "管理员";
        private String image = "/img/admin.png";
        private String testClassName;

        public UsersEntityBuilder testClass(String testClassName) {
            this.testClassName = testClassName;
            return this;
        }

        public UsersEntityBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public UsersEntityBuilder username(String username) {
            this.username = username;
            return this;
        }

        public UsersEntityBuilder password(String password) {
            this.password = password;
            return this;
        }

        public UsersEntityBuilder role(String role) {
            this.role = role;
            return this;
        }

        public UsersEntityBuilder image(String image) {
            this.image = image;
            return this;
        }

        public UsersEntity build() {
            if (!StringUtils.hasText(username)) {
                throw new IllegalArgumentException("Username is required");
            }

            UsersEntity user = new UsersEntity();
            user.setId(id != null ? id : nextId());
            user.setUsername(username);
            user.setPassword(password);
            user.setRole(role);
            user.setImage(image);
            user.setAddtime(new Date());

            if (testClassName != null) {
                recordCreatedEntity(testClassName, "UsersEntity", user.getId());
            }

            return user;
        }
    }

    /**
     * 课程预约实体Builder
     */
    public static class KechengyuyueEntityBuilder {
        private Long id;
        private String yuyuebianhao;
        private String kechengmingcheng;
        private String kechengleixing;
        private String shangkeshijian;
        private String shangkedidian;
        private Long kechengjiage;
        private String yonghuzhanghao;
        private String yonghuxingming;
        private String shoujihaoma;
        private String beizhu;
        private String sfsh = "待审核";
        private String shhf;
        private String testClassName;

        public KechengyuyueEntityBuilder testClass(String testClassName) {
            this.testClassName = testClassName;
            return this;
        }

        public KechengyuyueEntityBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public KechengyuyueEntityBuilder reservationNumber(String reservationNumber) {
            this.yuyuebianhao = reservationNumber;
            return this;
        }

        public KechengyuyueEntityBuilder courseName(String courseName) {
            this.kechengmingcheng = courseName;
            return this;
        }

        public KechengyuyueEntityBuilder courseType(String courseType) {
            this.kechengleixing = courseType;
            return this;
        }

        public KechengyuyueEntityBuilder classTime(String classTime) {
            this.shangkeshijian = classTime;
            return this;
        }

        public KechengyuyueEntityBuilder classLocation(String classLocation) {
            this.shangkedidian = classLocation;
            return this;
        }

        public KechengyuyueEntityBuilder price(Long price) {
            this.kechengjiage = price;
            return this;
        }

        public KechengyuyueEntityBuilder username(String username) {
            this.yonghuzhanghao = username;
            return this;
        }

        public KechengyuyueEntityBuilder fullName(String fullName) {
            this.yonghuxingming = fullName;
            return this;
        }

        public KechengyuyueEntityBuilder phoneNumber(String phoneNumber) {
            this.shoujihaoma = phoneNumber;
            return this;
        }

        public KechengyuyueEntityBuilder remarks(String remarks) {
            this.beizhu = remarks;
            return this;
        }

        public KechengyuyueEntityBuilder reviewStatus(String reviewStatus) {
            this.sfsh = reviewStatus;
            return this;
        }

        public KechengyuyueEntityBuilder reviewReply(String reviewReply) {
            this.shhf = reviewReply;
            return this;
        }

        public KechengyuyueEntity build() {
            if (!StringUtils.hasText(yuyuebianhao)) {
                throw new IllegalArgumentException("Reservation number is required");
            }
            if (!StringUtils.hasText(yonghuzhanghao)) {
                throw new IllegalArgumentException("Username is required");
            }

            KechengyuyueEntity reservation = new KechengyuyueEntity();
            reservation.setId(id != null ? id : nextId());
            reservation.setYuyuebianhao(yuyuebianhao);
            reservation.setKechengmingcheng(kechengmingcheng != null ? kechengmingcheng : "测试课程");
            reservation.setKechengleixing(kechengleixing != null ? kechengleixing : "综合课程");
            reservation.setShangkeshijian(shangkeshijian != null ? shangkeshijian : "周三 18:00");
            reservation.setShangkedidian(shangkedidian != null ? shangkedidian : "一号教室");
            reservation.setKechengjiage(kechengjiage != null ? kechengjiage.doubleValue() : 199.0);
            reservation.setYonghuzhanghao(yonghuzhanghao);
            reservation.setYonghuxingming(yonghuxingming != null ? yonghuxingming : "测试用户");
            reservation.setShoujihaoma(shoujihaoma != null ? shoujihaoma : "13800138000");
            reservation.setSfsh(sfsh);
            reservation.setShhf(shhf);
            reservation.setAddtime(new Date());

            if (testClassName != null) {
                recordCreatedEntity(testClassName, "KechengyuyueEntity", reservation.getId());
            }

            return reservation;
        }
    }

    /**
     * 新闻实体Builder
     */
    public static class NewsEntityBuilder {
        private Long id;
        private String title;
        private String content = "新闻内容";
        private String testClassName;

        public NewsEntityBuilder testClass(String testClassName) {
            this.testClassName = testClassName;
            return this;
        }

        public NewsEntityBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public NewsEntityBuilder title(String title) {
            this.title = title;
            return this;
        }

        public NewsEntityBuilder content(String content) {
            this.content = content;
            return this;
        }

        public NewsEntity build() {
            if (!StringUtils.hasText(title)) {
                throw new IllegalArgumentException("News title is required");
            }

            NewsEntity news = new NewsEntity();
            news.setId(id != null ? id : nextId());
            news.setTitle(title);
            news.setContent(content);
            news.setAddtime(new Date());

            if (testClassName != null) {
                recordCreatedEntity(testClassName, "NewsEntity", news.getId());
            }

            return news;
        }
    }

    // ==================== Factory Methods ====================

    public static UserEntityBuilder user() {
        return new UserEntityBuilder();
    }

    public static YonghuEntityBuilder yonghu() {
        return new YonghuEntityBuilder();
    }

    public static UsersEntityBuilder users() {
        return new UsersEntityBuilder();
    }

    public static HuiyuankaEntityBuilder membershipCard() {
        return new HuiyuankaEntityBuilder();
    }

    public static JianshenjiaolianEntityBuilder coach() {
        return new JianshenjiaolianEntityBuilder();
    }

    public static JianshenkechengEntityBuilder course() {
        return new JianshenkechengEntityBuilder();
    }

    public static KechengyuyueEntityBuilder courseReservation() {
        return new KechengyuyueEntityBuilder();
    }

    public static NewsEntityBuilder news() {
        return new NewsEntityBuilder();
    }

    // ==================== Convenience Methods ====================

    /**
     * 创建一个标准的测试用户
     */
    public static UserEntity createTestUser(String testClassName) {
        return user()
                .testClass(testClassName)
                .username(TestUtils.generateUniqueTestUsername(testClassName, "testuser"))
                .password("password123")
                .passwordHash("$2a$10$defaultHashForTesting")
                .build();
    }

    /**
     * 创建一个标准的测试用户（Yonghu）
     */
    public static YonghuEntity createTestYonghu(String testClassName) {
        return yonghu()
                .testClass(testClassName)
                .username(TestUtils.generateUniqueTestUsername(testClassName, "yonghu"))
                .password("password123")
                .passwordHash("$2a$10$defaultHashForTesting")
                .fullName("测试用户")
                .phoneNumber("13800138000")
                .build();
    }

    /**
     * 创建一个标准的测试管理员用户
     */
    public static UsersEntity createTestAdmin(String testClassName) {
        return users()
                .testClass(testClassName)
                .username(TestUtils.generateUniqueTestUsername(testClassName, "admin"))
                .password("admin123")
                .role("管理员")
                .build();
    }

    /**
     * 创建一个标准的测试会员卡
     */
    public static HuiyuankaEntity createTestMembershipCard(String testClassName) {
        return membershipCard()
                .testClass(testClassName)
                .name(TestUtils.generateUniqueTestTitle(testClassName, "测试会员卡"))
                .build();
    }

    /**
     * 创建一个标准的测试教练
     */
    public static JianshenjiaolianEntity createTestCoach(String testClassName) {
        return coach()
                .testClass(testClassName)
                .employeeId(TestUtils.generateUniqueTestUsername(testClassName, "coach"))
                .name("测试教练")
                .password("password123")
                .passwordHash("$2a$10$defaultHashForTesting")
                .build();
    }

    /**
     * 创建一个标准的测试课程
     */
    public static JianshenkechengEntity createTestCourse(String testClassName) {
        return course()
                .testClass(testClassName)
                .name(TestUtils.generateUniqueTestTitle(testClassName, "测试课程"))
                .build();
    }

    /**
     * 创建一个标准的课程预约
     */
    public static KechengyuyueEntity createTestCourseReservation(String testClassName) {
        return courseReservation()
                .testClass(testClassName)
                .reservationNumber(TestUtils.generateUniqueTestPrefix(testClassName, "YY") + System.nanoTime())
                .username(TestUtils.generateUniqueTestUsername(testClassName, "user"))
                .fullName("预约用户")
                .build();
    }

    /**
     * 创建一个标准的测试新闻
     */
    public static NewsEntity createTestNews(String testClassName) {
        return news()
                .testClass(testClassName)
                .title(TestUtils.generateUniqueTestTitle(testClassName, "测试新闻"))
                .build();
    }

    // ==================== Complex Relationship Builders ====================

    /**
     * 创建用户及其关联的会员卡
     */
    public static class UserWithMembershipCard {
        public final YonghuEntity user;
        public final HuiyuankaEntity membershipCard;

        public UserWithMembershipCard(YonghuEntity user, HuiyuankaEntity membershipCard) {
            this.user = user;
            this.membershipCard = membershipCard;
        }
    }

    /**
     * 创建一个用户及其会员卡的完整组合
     */
    public static UserWithMembershipCard createUserWithMembershipCard(String testClassName) {
        String uniqueId = String.valueOf(System.nanoTime());

        // 创建会员卡
        HuiyuankaEntity card = membershipCard()
                .testClass(testClassName)
                .name("黄金会员卡-" + uniqueId)
                .price(BigDecimal.valueOf(1999.00))
                .validityPeriod("12个月")
                .build();

        // 创建用户并关联会员卡
        YonghuEntity user = yonghu()
                .testClass(testClassName)
                .username("member-" + uniqueId)
                .password("password123")
                .passwordHash("$2a$10$defaultHashForTesting")
                .fullName("会员用户")
                .phoneNumber("13800138000")
                .membershipCardNumber("VIP-" + uniqueId)
                .membershipCardName(card.getHuiyuankamingcheng())
                .expirationDate(new Date(System.currentTimeMillis() + 365 * 24 * 60 * 60 * 1000L)) // 一年后过期
                .build();

        return new UserWithMembershipCard(user, card);
    }

    /**
     * 创建教练及其课程的完整组合
     */
    public static class CoachWithCourse {
        public final JianshenjiaolianEntity coach;
        public final JianshenkechengEntity course;

        public CoachWithCourse(JianshenjiaolianEntity coach, JianshenkechengEntity course) {
            this.coach = coach;
            this.course = course;
        }
    }

    /**
     * 创建一个教练及其课程的完整组合
     */
    public static CoachWithCourse createCoachWithCourse(String testClassName) {
        String uniqueId = String.valueOf(System.nanoTime());

        // 创建教练
        JianshenjiaolianEntity coach = coach()
                .testClass(testClassName)
                .employeeId("coach-" + uniqueId)
                .name("专业教练")
                .password("password123")
                .passwordHash("$2a$10$defaultHashForTesting")
                .coachingPrice(BigDecimal.valueOf(299.00))
                .build();

        // 创建该教练的课程
        JianshenkechengEntity course = course()
                .testClass(testClassName)
                .name("专业训练课程-" + uniqueId)
                .type("力量训练")
                .coachId(coach.getJiaoliangonghao())
                .coachName(coach.getJiaolianxingming())
                .price(BigDecimal.valueOf(399.00))
                .build();

        return new CoachWithCourse(coach, course);
    }

    /**
     * 创建完整的预约场景（用户预约教练的课程）
     */
    public static class CompleteReservation {
        public final YonghuEntity user;
        public final JianshenjiaolianEntity coach;
        public final JianshenkechengEntity course;
        public final KechengyuyueEntity reservation;

        public CompleteReservation(YonghuEntity user, JianshenjiaolianEntity coach,
                                 JianshenkechengEntity course, KechengyuyueEntity reservation) {
            this.user = user;
            this.coach = coach;
            this.course = course;
            this.reservation = reservation;
        }
    }

    /**
     * 创建一个完整的预约场景
     */
    public static CompleteReservation createCompleteReservation(String testClassName) {
        String uniqueId = String.valueOf(System.nanoTime());

        // 创建用户
        YonghuEntity user = yonghu()
                .testClass(testClassName)
                .username("user-" + uniqueId)
                .password("password123")
                .passwordHash("$2a$10$defaultHashForTesting")
                .fullName("预约用户")
                .phoneNumber("13800138000")
                .build();

        // 创建教练
        JianshenjiaolianEntity coach = coach()
                .testClass(testClassName)
                .employeeId("coach-" + uniqueId)
                .name("预约教练")
                .password("password123")
                .passwordHash("$2a$10$defaultHashForTesting")
                .build();

        // 创建课程
        JianshenkechengEntity course = course()
                .testClass(testClassName)
                .name("预约课程-" + uniqueId)
                .coachId(coach.getJiaoliangonghao())
                .coachName(coach.getJiaolianxingming())
                .build();

        // 创建预约
        KechengyuyueEntity reservation = courseReservation()
                .testClass(testClassName)
                .reservationNumber("YY-" + uniqueId)
                .courseName(course.getKechengmingcheng())
                .courseType(course.getKechengleixing())
                .username(user.getYonghuzhanghao())
                .fullName(user.getYonghuxingming())
                .phoneNumber(user.getShoujihaoma())
                .build();

        return new CompleteReservation(user, coach, course, reservation);
    }
}
