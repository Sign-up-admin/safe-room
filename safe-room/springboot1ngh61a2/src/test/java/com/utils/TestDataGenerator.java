package com.utils;

import org.apache.commons.lang3.RandomStringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

/**
 * 测试数据生成器 - 提供各种随机数据的生成和唯一性保证
 *
 * 特性：
 * - 生成各种类型的随机数据（字符串、数字、日期等）
 * - 支持唯一性约束字段的自动生成
 * - 提供领域相关的生成器（用户名、邮箱、手机号等）
 * - 支持自定义生成规则
 */
public final class TestDataGenerator {

    private static final Logger log = LoggerFactory.getLogger(TestDataGenerator.class);

    // 用于保证唯一性的集合
    private static final Map<String, Set<String>> UNIQUENESS_SETS = new ConcurrentHashMap<>();

    private TestDataGenerator() {
        // Utility class
    }

    // ==================== 基础随机数据生成 ====================

    /**
     * 生成随机字符串
     */
    public static String randomString(int length) {
        return RandomStringUtils.randomAlphabetic(length);
    }

    /**
     * 生成随机字母数字字符串
     */
    public static String randomAlphanumeric(int length) {
        return RandomStringUtils.randomAlphanumeric(length);
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
        return ThreadLocalRandom.current().nextInt(min, max + 1);
    }

    /**
     * 生成随机Long
     */
    public static long randomLong(long min, long max) {
        return ThreadLocalRandom.current().nextLong(min, max + 1);
    }

    /**
     * 生成随机BigDecimal
     */
    public static BigDecimal randomBigDecimal(BigDecimal min, BigDecimal max, int scale) {
        BigDecimal range = max.subtract(min);
        BigDecimal randomValue = range.multiply(BigDecimal.valueOf(Math.random()));
        return min.add(randomValue).setScale(scale, RoundingMode.HALF_UP);
    }

    /**
     * 生成随机布尔值
     */
    public static boolean randomBoolean() {
        return ThreadLocalRandom.current().nextBoolean();
    }

    /**
     * 从数组中随机选择一个元素
     */
    @SafeVarargs
    public static <T> T randomFrom(T... items) {
        if (items == null || items.length == 0) {
            throw new IllegalArgumentException("Items array cannot be null or empty");
        }
        return items[ThreadLocalRandom.current().nextInt(items.length)];
    }

    /**
     * 从列表中随机选择一个元素
     */
    public static <T> T randomFrom(List<T> items) {
        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("Items list cannot be null or empty");
        }
        return items.get(ThreadLocalRandom.current().nextInt(items.size()));
    }

    // ==================== 日期时间生成 ====================

    /**
     * 生成随机日期（过去或未来）
     */
    public static Date randomDate(int daysOffsetMin, int daysOffsetMax) {
        long currentTime = System.currentTimeMillis();
        long offsetMillis = TimeUnit.DAYS.toMillis(randomInt(daysOffsetMin, daysOffsetMax));
        return new Date(currentTime + offsetMillis);
    }

    /**
     * 生成未来的随机日期
     */
    public static Date randomFutureDate(int daysFromNow, int daysRange) {
        return randomDate(daysFromNow, daysFromNow + daysRange);
    }

    /**
     * 生成过去的随机日期
     */
    public static Date randomPastDate(int daysAgo, int daysRange) {
        return randomDate(-daysAgo - daysRange, -daysAgo);
    }

    // ==================== 领域相关生成器 ====================

    /**
     * 生成唯一的用户名
     */
    public static String generateUniqueUsername(String prefix) {
        return generateUniqueValue(prefix, () -> {
            String base = prefix + randomString(8).toLowerCase();
            return base.replaceAll("[^a-z0-9]", "");
        });
    }

    /**
     * 生成唯一的邮箱地址
     */
    public static String generateUniqueEmail(String domain) {
        return generateUniqueValue("email:" + domain, () -> {
            String username = randomString(8).toLowerCase() + randomInt(10, 99);
            return username + "@" + domain;
        });
    }

    /**
     * 生成唯一的手机号码
     */
    public static String generateUniquePhoneNumber() {
        return generateUniqueValue("phone", () -> {
            String[] prefixes = {"130", "131", "132", "133", "134", "135", "136", "137", "138", "139",
                               "150", "151", "152", "153", "155", "156", "157", "158", "159",
                               "180", "181", "182", "183", "184", "185", "186", "187", "188", "189"};
            String prefix = randomFrom(prefixes);
            String suffix = randomNumericString(8);
            return prefix + suffix;
        });
    }

    /**
     * 生成唯一的会员卡号
     */
    public static String generateUniqueMembershipCardNumber(String prefix) {
        return generateUniqueValue("card:" + prefix, () -> {
            return prefix + randomNumericString(10);
        });
    }

    /**
     * 生成唯一的预约编号
     */
    public static String generateUniqueReservationNumber(String prefix) {
        return generateUniqueValue("reservation:" + prefix, () -> {
            return prefix + System.currentTimeMillis() + randomInt(100, 999);
        });
    }

    /**
     * 生成唯一的教练工号
     */
    public static String generateUniqueCoachId(String prefix) {
        return generateUniqueValue("coach:" + prefix, () -> {
            return prefix + randomString(6).toUpperCase() + randomInt(100, 999);
        });
    }

    // ==================== 健身相关数据生成 ====================

    /**
     * 生成随机的健身课程类型
     */
    public static String randomCourseType() {
        return randomFrom("瑜伽", "普拉提", "力量训练", "有氧健身", "舞蹈", "搏击", "游泳", "跑步", "骑行", "综合训练");
    }

    /**
     * 生成随机的健身难度等级
     */
    public static String randomDifficulty() {
        return randomFrom("初级", "中级", "高级", "专业级");
    }

    /**
     * 生成随机的课程时长（分钟）
     */
    public static int randomCourseDuration() {
        return randomFrom(30, 45, 60, 75, 90, 120);
    }

    /**
     * 生成随机的课程价格
     */
    public static BigDecimal randomCoursePrice() {
        return BigDecimal.valueOf(randomInt(99, 999));
    }

    /**
     * 生成随机的教练资费
     */
    public static BigDecimal randomCoachingPrice() {
        return BigDecimal.valueOf(randomInt(150, 800));
    }

    /**
     * 生成随机的会员卡价格
     */
    public static BigDecimal randomMembershipPrice() {
        return BigDecimal.valueOf(randomInt(999, 9999));
    }

    /**
     * 生成随机的人名
     */
    public static String randomName() {
        String[] surnames = {"张", "王", "李", "赵", "陈", "刘", "杨", "黄", "周", "吴", "徐", "孙", "朱", "马", "胡", "郭", "林", "何", "高", "梁"};
        String[] names = {"明", "华", "志", "伟", "强", "军", "建", "国", "庆", "祥", "东", "海", "山", "石", "林", "森", "青", "春", "夏", "秋", "冬"};
        String surname = randomFrom(surnames);
        String name = randomFrom(names) + randomFrom(names);
        return surname + name;
    }

    /**
     * 生成随机的性别
     */
    public static String randomGender() {
        return randomFrom("男", "女");
    }

    /**
     * 生成随机的年龄
     */
    public static int randomAge(int minAge, int maxAge) {
        return randomInt(minAge, maxAge);
    }

    /**
     * 生成随机的高度
     */
    public static String randomHeight() {
        int height = randomInt(150, 200);
        return height + "cm";
    }

    /**
     * 生成随机的体重
     */
    public static String randomWeight() {
        int weight = randomInt(45, 120);
        return weight + "kg";
    }

    /**
     * 生成随机的上课时间
     */
    public static String randomClassTime() {
        String[] days = {"周一", "周二", "周三", "周四", "周五", "周六", "周日"};
        String[] times = {"09:00", "10:00", "14:00", "15:00", "18:00", "19:00", "20:00"};
        return randomFrom(days) + " " + randomFrom(times);
    }

    /**
     * 生成随机的上课地点
     */
    public static String randomClassLocation() {
        String[] locations = {"一号健身房", "二号健身房", "瑜伽教室", "力量训练室", "有氧教室", "舞蹈教室", "游泳馆", "户外场地"};
        return randomFrom(locations);
    }

    // ==================== 唯一性保证机制 ====================

    /**
     * 生成唯一值
     */
    private static String generateUniqueValue(String key, Supplier<String> generator) {
        Set<String> uniquenessSet = UNIQUENESS_SETS.computeIfAbsent(key, k -> ConcurrentHashMap.newKeySet());

        int maxAttempts = 1000; // 避免无限循环
        for (int attempt = 0; attempt < maxAttempts; attempt++) {
            String value = generator.get();
            if (uniquenessSet.add(value)) {
                return value;
            }
        }

        throw new RuntimeException("Failed to generate unique value for key: " + key + " after " + maxAttempts + " attempts");
    }

    /**
     * 清理指定键的唯一性记录
     */
    public static void clearUniquenessSet(String key) {
        UNIQUENESS_SETS.remove(key);
        log.debug("Cleared uniqueness set for key: {}", key);
    }

    /**
     * 清理所有唯一性记录
     */
    public static void clearAllUniquenessSets() {
        UNIQUENESS_SETS.clear();
        log.debug("Cleared all uniqueness sets");
    }

    /**
     * 获取唯一性集合的大小（用于调试）
     */
    public static int getUniquenessSetSize(String key) {
        Set<String> set = UNIQUENESS_SETS.get(key);
        return set != null ? set.size() : 0;
    }

    // ==================== 复合数据生成器 ====================

    /**
     * 生成完整的用户资料
     */
    public static class UserProfile {
        public final String username;
        public final String password;
        public final String fullName;
        public final String email;
        public final String phoneNumber;
        public final String gender;
        public final int age;
        public final String height;
        public final String weight;

        public UserProfile(String username, String password, String fullName, String email,
                          String phoneNumber, String gender, int age, String height, String weight) {
            this.username = username;
            this.password = password;
            this.fullName = fullName;
            this.email = email;
            this.phoneNumber = phoneNumber;
            this.gender = gender;
            this.age = age;
            this.height = height;
            this.weight = weight;
        }
    }

    /**
     * 生成随机用户资料
     */
    public static UserProfile generateRandomUserProfile(String usernamePrefix) {
        String username = generateUniqueUsername(usernamePrefix);
        String password = "password" + randomInt(100, 999);
        String fullName = randomName();
        String email = generateUniqueEmail("test.com");
        String phoneNumber = generateUniquePhoneNumber();
        String gender = randomGender();
        int age = randomAge(18, 65);
        String height = randomHeight();
        String weight = randomWeight();

        return new UserProfile(username, password, fullName, email, phoneNumber, gender, age, height, weight);
    }

    /**
     * 生成完整的教练资料
     */
    public static class CoachProfile {
        public final String employeeId;
        public final String name;
        public final String password;
        public final String gender;
        public final int age;
        public final String height;
        public final String weight;
        public final String phoneNumber;
        public final BigDecimal coachingPrice;
        public final String specialty;

        public CoachProfile(String employeeId, String name, String password, String gender, int age,
                           String height, String weight, String phoneNumber, BigDecimal coachingPrice, String specialty) {
            this.employeeId = employeeId;
            this.name = name;
            this.password = password;
            this.gender = gender;
            this.age = age;
            this.height = height;
            this.weight = weight;
            this.phoneNumber = phoneNumber;
            this.coachingPrice = coachingPrice;
            this.specialty = specialty;
        }
    }

    /**
     * 生成随机教练资料
     */
    public static CoachProfile generateRandomCoachProfile() {
        String employeeId = generateUniqueCoachId("COACH");
        String name = randomName();
        String password = "coach" + randomInt(100, 999);
        String gender = randomGender();
        int age = randomAge(25, 50);
        String height = randomHeight();
        String weight = randomWeight();
        String phoneNumber = generateUniquePhoneNumber();
        BigDecimal coachingPrice = randomCoachingPrice();
        String specialty = randomCourseType();

        return new CoachProfile(employeeId, name, password, gender, age, height, weight, phoneNumber, coachingPrice, specialty);
    }

    /**
     * 生成完整的课程资料
     */
    public static class CourseProfile {
        public final String name;
        public final String type;
        public final String difficulty;
        public final int duration;
        public final BigDecimal price;
        public final String classTime;
        public final String classLocation;
        public final String description;

        public CourseProfile(String name, String type, String difficulty, int duration, BigDecimal price,
                            String classTime, String classLocation, String description) {
            this.name = name;
            this.type = type;
            this.difficulty = difficulty;
            this.duration = duration;
            this.price = price;
            this.classTime = classTime;
            this.classLocation = classLocation;
            this.description = description;
        }
    }

    /**
     * 生成随机课程资料
     */
    public static CourseProfile generateRandomCourseProfile(String namePrefix) {
        String name = namePrefix + " - " + randomCourseType() + "课程";
        String type = randomCourseType();
        String difficulty = randomDifficulty();
        int duration = randomCourseDuration();
        BigDecimal price = randomCoursePrice();
        String classTime = randomClassTime();
        String classLocation = randomClassLocation();
        String description = "这是一门" + difficulty + "的" + type + "课程，适合想要提升健康的学员。";

        return new CourseProfile(name, type, difficulty, duration, price, classTime, classLocation, description);
    }
}
