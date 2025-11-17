package com.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 测试数据注解 - 用于自动生成和清理测试数据
 *
 * 使用示例:
 * <pre>
 * {@code
 * @Test
 * @TestData(entities = {
 *     @TestData.Entity(type = UserEntity.class, count = 3),
 *     @TestData.Entity(type = NewsEntity.class, count = 1)
 * })
 * void shouldHandleMultipleEntities() {
 *     // 测试数据会自动创建和清理
 * }
 * }
 * </pre>
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface TestData {

    /**
     * 要创建的实体列表
     */
    Entity[] entities() default {};

    /**
     * 是否在测试前清理现有数据
     */
    boolean cleanupBefore() default true;

    /**
     * 是否在测试后清理创建的数据
     */
    boolean cleanupAfter() default true;

    /**
     * 实体配置
     */
    @interface Entity {
        /**
         * 实体类型
         */
        Class<?> type();

        /**
         * 创建数量
         */
        int count() default 1;

        /**
         * 自定义配置（JSON格式）
         */
        String config() default "";
    }
}
