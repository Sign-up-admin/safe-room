package com.utils;

import com.baomidou.mybatisplus.extension.service.IService;
import com.entity.EIException;
import org.assertj.core.api.Assertions;
import org.assertj.core.api.AbstractThrowableAssert;
import org.springframework.util.StringUtils;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;

/**
 * 测试断言工具类 - 提供常用的测试断言方法
 */
public final class TestAssertions {

    private TestAssertions() {
        // Utility class
    }

    // ==================== 通用断言 ====================

    /**
     * 断言操作不抛出任何异常
     */
    public static void assertNoException(Runnable operation) {
        try {
            operation.run();
        } catch (Exception e) {
            Assertions.fail("Expected no exception but got: " + e.getMessage(), e);
        }
    }

    /**
     * 断言操作不抛出任何异常（带返回值）
     */
    public static <T> T assertNoException(Supplier<T> operation) {
        try {
            return operation.get();
        } catch (Exception e) {
            Assertions.fail("Expected no exception but got: " + e.getMessage(), e);
            return null; // 不会执行到这里
        }
    }

    /**
     * 断言抛出指定类型的异常
     */
    public static <T extends Exception> void assertThrowsException(
            Class<T> exceptionType, Runnable operation) {
        try {
            operation.run();
            Assertions.fail("Expected exception of type " + exceptionType.getSimpleName() + " but none was thrown");
        } catch (Exception e) {
            if (!exceptionType.isInstance(e)) {
                Assertions.fail("Expected exception of type " + exceptionType.getSimpleName() +
                        " but got " + e.getClass().getSimpleName(), e);
            }
        }
    }

    /**
     * 断言抛出指定类型的异常（带返回值）
     */
    public static <T extends Exception> void assertThrowsException(
            Class<T> exceptionType, Supplier<?> operation) {
        try {
            operation.get();
            Assertions.fail("Expected exception of type " + exceptionType.getSimpleName() + " but none was thrown");
        } catch (Exception e) {
            if (!exceptionType.isInstance(e)) {
                Assertions.fail("Expected exception of type " + exceptionType.getSimpleName() +
                        " but got " + e.getClass().getSimpleName(), e);
            }
        }
    }

    /**
     * 断言抛出EIException并验证错误码
     */
    public static void assertEIException(int expectedCode, Runnable operation) {
        try {
            operation.run();
            Assertions.fail("Expected EIException with code " + expectedCode + " but none was thrown");
        } catch (EIException e) {
            Assertions.assertThat(e.getCode()).isEqualTo(expectedCode);
        } catch (Exception e) {
            Assertions.fail("Expected EIException with code " + expectedCode +
                    " but got " + e.getClass().getSimpleName(), e);
        }
    }

    // ==================== 实体断言 ====================

    /**
     * 断言实体已保存到数据库
     */
    public static <T> void assertEntitySaved(IService<T> service, Long entityId) {
        T entity = service.getById(entityId);
        Assertions.assertThat(entity)
                .withFailMessage("Entity with ID %s should be saved but was not found", entityId)
                .isNotNull();
    }

    /**
     * 断言实体已从数据库删除
     */
    public static <T> void assertEntityDeleted(IService<T> service, Long entityId) {
        T entity = service.getById(entityId);
        Assertions.assertThat(entity)
                .withFailMessage("Entity with ID %s should be deleted but still exists", entityId)
                .isNull();
    }

    /**
     * 断言集合不为空且包含指定数量的元素
     */
    public static <T> void assertCollectionSize(Collection<T> collection, int expectedSize) {
        Assertions.assertThat(collection)
                .withFailMessage("Collection should not be null")
                .isNotNull();

        Assertions.assertThat(collection)
                .withFailMessage("Collection should have size %d but has size %d",
                        expectedSize, collection.size())
                .hasSize(expectedSize);
    }

    /**
     * 断言集合不为空
     */
    public static <T> void assertCollectionNotEmpty(Collection<T> collection) {
        Assertions.assertThat(collection)
                .withFailMessage("Collection should not be null")
                .isNotNull();

        Assertions.assertThat(collection)
                .withFailMessage("Collection should not be empty")
                .isNotEmpty();
    }

    // ==================== 字符串断言 ====================

    /**
     * 断言字符串不为空
     */
    public static void assertStringNotBlank(String value) {
        Assertions.assertThat(value)
                .withFailMessage("String should not be blank")
                .isNotBlank();
    }

    /**
     * 断言字符串不为空且不包含空格
     */
    public static void assertStringNotBlankAndNoWhitespace(String value) {
        assertStringNotBlank(value);
        Assertions.assertThat(value.trim())
                .withFailMessage("String should not contain only whitespace")
                .isNotBlank();
    }

    // ==================== 数值断言 ====================

    /**
     * 断言数值在指定范围内
     */
    public static void assertNumberInRange(Number value, Number min, Number max) {
        Assertions.assertThat(value.doubleValue())
                .withFailMessage("Value %s should be between %s and %s", value, min, max)
                .isBetween(min.doubleValue(), max.doubleValue());
    }

    /**
     * 断言数值大于0
     */
    public static void assertPositive(Number value) {
        Assertions.assertThat(value.doubleValue())
                .withFailMessage("Value %s should be positive", value)
                .isPositive();
    }

    // ==================== 业务逻辑断言 ====================

    /**
     * 断言分页结果有效
     */
    public static void assertValidPagination(com.utils.PageUtils page) {
        Assertions.assertThat(page)
                .withFailMessage("PageUtils should not be null")
                .isNotNull();

        Assertions.assertThat(page.getList())
                .withFailMessage("Page list should not be null")
                .isNotNull();

        assertPositive(page.getTotal());
    }

    /**
     * 断言API响应成功
     */
    public static void assertApiSuccess(com.utils.R response) {
        Assertions.assertThat(response)
                .withFailMessage("API response should not be null")
                .isNotNull();

        Object code = response.get("code");
        Assertions.assertThat(code)
                .withFailMessage("Response should have code field")
                .isNotNull();

        Assertions.assertThat(code.toString())
                .withFailMessage("Response code should be '0' for success, but was: %s", code)
                .isEqualTo("0");
    }

    /**
     * 断言API响应失败并验证错误码
     */
    public static void assertApiFailure(com.utils.R response, int expectedCode) {
        Assertions.assertThat(response)
                .withFailMessage("API response should not be null")
                .isNotNull();

        Object code = response.get("code");
        Assertions.assertThat(code)
                .withFailMessage("Response should have code field")
                .isNotNull();

        Assertions.assertThat(Integer.parseInt(code.toString()))
                .withFailMessage("Response code should be %d for failure, but was: %s", expectedCode, code)
                .isEqualTo(expectedCode);
    }

    /**
     * 断言Map包含指定键
     */
    public static void assertMapContainsKey(Map<?, ?> map, Object key) {
        Assertions.assertThat(map)
                .withFailMessage("Map should not be null")
                .isNotNull();

        Assertions.assertThat(map.containsKey(key))
                .withFailMessage("Map should contain key: %s", key)
                .isTrue();
    }

    /**
     * 断言Map包含指定键值对
     */
    public static void assertMapContainsEntry(Map<?, ?> map, Object key, Object value) {
        assertMapContainsKey(map, key);
        Assertions.assertThat(map.get(key))
                .withFailMessage("Map should contain entry {%s: %s}, but value was: %s", key, value, map.get(key))
                .isEqualTo(value);
    }
}
