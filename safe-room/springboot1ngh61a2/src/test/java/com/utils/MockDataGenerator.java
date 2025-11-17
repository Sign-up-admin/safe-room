package com.utils;

import com.entity.*;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.concurrent.ThreadLocalRandom;

/**
 * 模拟数据生成器 - 为测试提供各种类型的随机数据
 */
public final class MockDataGenerator {

    private static final ThreadLocalRandom RANDOM = ThreadLocalRandom.current();

    private MockDataGenerator() {
        // Utility class
    }

    // ==================== 基本数据类型 ====================

    /**
     * 生成随机字符串
     */
    public static String randomString(int length) {
        return RandomStringUtils.randomAlphabetic(length);
    }

    /**
     * 生成随机数字字符串
     */
    public static String randomNumericString(int length) {
        return RandomStringUtils.randomNumeric(length);
    }

    /**
     * 生成随机整数
     */
    public static int randomInt(int min, int max) {
        return RANDOM.nextInt(min, max + 1);
    }

    /**
     * 生成随机长整数
     */
    public static long randomLong(long min, long max) {
        return RANDOM.nextLong(min, max + 1);
    }

    /**
     * 生成随机BigDecimal
     */
    public static BigDecimal randomBigDecimal(double min, double max) {
        double value = min + (max - min) * RANDOM.nextDouble();
        return BigDecimal.valueOf(value).setScale(2, BigDecimal.ROUND_HALF_UP);
    }

    /**
     * 生成随机布尔值
     */
    public static boolean randomBoolean() {
        return RANDOM.nextBoolean();
    }

    // ==================== 业务数据类型 ====================

    /**
     * 生成随机用户名
     */
    public static String randomUsername() {
        return "user" + randomNumericString(6);
    }

    /**
     * 生成随机密码
     */
    public static String randomPassword() {
        return randomString(8) + randomNumericString(2) + "!@#";
    }

    /**
     * 生成随机邮箱
     */
    public static String randomEmail() {
        return randomString(8).toLowerCase() + "@example.com";
    }

    /**
     * 生成随机手机号
     */
    public static String randomPhoneNumber() {
        return "1" + randomNumericString(10);
    }

    /**
     * 生成随机姓名
     */
    public static String randomName() {
        String[] firstNames = {"张", "李", "王", "赵", "陈", "刘", "杨", "黄", "周", "吴"};
        String[] lastNames = {"三", "四", "五", "明", "华", "强", "磊", "军", "勇", "杰"};

        return firstNames[RANDOM.nextInt(firstNames.length)] +
               lastNames[RANDOM.nextInt(lastNames.length)];
    }

    /**
     * 生成随机课程名称
     */
    public static String randomCourseName() {
        String[] prefixes = {"高级", "初级", "中级", "强化", "精品", "专业"};
        String[] types = {"瑜伽", "健身", "普拉提", "有氧", "力量", "舞蹈"};

        return prefixes[RANDOM.nextInt(prefixes.length)] +
               types[RANDOM.nextInt(types.length)] + "课程";
    }

    /**
     * 生成随机价格
     */
    public static BigDecimal randomPrice() {
        return randomBigDecimal(50.0, 500.0);
    }

    /**
     * 生成随机地址
     */
    public static String randomAddress() {
        String[] locations = {"一号健身房", "二号健身房", "三号健身房", "瑜伽馆", "舞蹈室", "游泳池"};
        return locations[RANDOM.nextInt(locations.length)];
    }

    /**
     * 生成随机描述
     */
    public static String randomDescription() {
        String[] descriptions = {
            "专业的健身课程，适合各个年龄段",
            "科学的训练方法，注重效果和安全",
            "经验丰富的教练团队，提供个性化指导",
            "舒适的训练环境，先进的健身设备",
            "系统的课程体系，从入门到精通"
        };
        return descriptions[RANDOM.nextInt(descriptions.length)];
    }

    // ==================== 实体对象生成 ====================

    /**
     * 创建随机用户实体
     */
    public static UserEntity createRandomUser() {
        return TestUtils.createUser(
            null,
            randomUsername(),
            randomPassword()
        );
    }

    /**
     * 创建随机会员卡实体
     */
    public static HuiyuankaEntity createRandomMembershipCard() {
        HuiyuankaEntity card = new HuiyuankaEntity();
        card.setId(TestUtils.nextId());
        card.setHuiyuankamingcheng(randomCourseName() + "会员卡");
        card.setJiage(randomInt(50, 500));
        card.setYouxiaoqi("1年");
        card.setAddtime(new Date());
        return card;
    }

    /**
     * 创建随机健身教练实体
     */
    public static JianshenjiaolianEntity createRandomCoach() {
        JianshenjiaolianEntity coach = new JianshenjiaolianEntity();
        coach.setId(TestUtils.nextId());
        coach.setJiaoliangonghao("coach" + randomNumericString(4));
        coach.setJiaolianxingming(randomName());
        coach.setMima(randomPassword());
        coach.setSijiaojiage(randomBigDecimal(100.0, 500.0).doubleValue());
        coach.setXingbie(RANDOM.nextBoolean() ? "男" : "女");
        coach.setNianling(String.valueOf(randomInt(25, 50)));
        coach.setShengao(randomInt(160, 190) + "cm");
        coach.setTizhong(randomInt(50, 90) + "kg");
        coach.setLianxidianhua(randomPhoneNumber());
        coach.setGerenjianjie(randomDescription());
        coach.setAddtime(new Date());
        return coach;
    }

    /**
     * 创建随机健身课程实体
     */
    public static JianshenkechengEntity createRandomCourse() {
        JianshenkechengEntity course = new JianshenkechengEntity();
        course.setId(TestUtils.nextId());
        course.setKechengmingcheng(randomCourseName());
        course.setKechengleixing("综合课程");
        course.setKechengjiage(randomBigDecimal(100.0, 500.0).doubleValue());
        course.setKechengjianjie(randomDescription());
        course.setShangkedidian(randomAddress());
        course.setAddtime(new Date());
        return course;
    }

    /**
     * 创建随机新闻实体
     */
    public static NewsEntity createRandomNews() {
        NewsEntity news = new NewsEntity();
        news.setId(TestUtils.nextId());
        news.setTitle(randomCourseName() + "活动通知");
        news.setContent(randomDescription() + "。欢迎大家积极参与！");
        news.setAddtime(new Date());
        return news;
    }

    // ==================== 集合数据生成 ====================

    /**
     * 创建指定数量的随机用户列表
     */
    public static java.util.List<UserEntity> createRandomUsers(int count) {
        java.util.List<UserEntity> users = new java.util.ArrayList<>();
        for (int i = 0; i < count; i++) {
            users.add(createRandomUser());
        }
        return users;
    }

    /**
     * 创建指定数量的随机课程列表
     */
    public static java.util.List<JianshenkechengEntity> createRandomCourses(int count) {
        java.util.List<JianshenkechengEntity> courses = new java.util.ArrayList<>();
        for (int i = 0; i < count; i++) {
            courses.add(createRandomCourse());
        }
        return courses;
    }
}
