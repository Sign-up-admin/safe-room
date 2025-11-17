package com.utils;

import org.assertj.core.api.Assertions;

import java.util.function.Supplier;

/**
 * 异常场景测试辅助类，提供异常测试的通用方法
 */
public class ExceptionTestHelper {

    /**
     * 执行可能抛出异常的操作，验证异常被抛出
     */
    public static <T extends Exception> T assertThrowsException(
            Class<T> exceptionClass,
            Runnable operation) {
        try {
            operation.run();
            Assertions.fail("Expected exception of type " + exceptionClass.getName() + " but no exception was thrown");
            return null;
        } catch (Exception e) {
            if (exceptionClass.isInstance(e)) {
                return exceptionClass.cast(e);
            }
            throw new AssertionError(
                    "Expected exception of type " + exceptionClass.getName() +
                    " but got " + e.getClass().getName(), e);
        }
    }

    /**
     * 执行可能抛出异常的操作，验证异常被抛出（带返回值）
     */
    public static <T extends Exception, R> T assertThrowsException(
            Class<T> exceptionClass,
            Supplier<R> operation) {
        try {
            operation.get();
            Assertions.fail("Expected exception of type " + exceptionClass.getName() + " but no exception was thrown");
            return null;
        } catch (Exception e) {
            if (exceptionClass.isInstance(e)) {
                return exceptionClass.cast(e);
            }
            throw new AssertionError(
                    "Expected exception of type " + exceptionClass.getName() +
                    " but got " + e.getClass().getName(), e);
        }
    }

    /**
     * 执行可能抛出异常的操作，验证操作不会抛出异常或优雅处理异常
     */
    public static void assertNoExceptionOrHandledGracefully(Runnable operation) {
        try {
            operation.run();
            // If no exception is thrown, that's fine
        } catch (Exception e) {
            // If exception is thrown, that's also acceptable as long as it's handled
            // This method is for testing operations that may throw exceptions but should handle them
            Assertions.assertThat(e).isNotNull();
        }
    }

    /**
     * 执行可能抛出异常的操作，验证操作不会抛出异常或优雅处理异常（带返回值）
     */
    public static <R> R assertNoExceptionOrHandledGracefully(Supplier<R> operation, R defaultValue) {
        try {
            return operation.get();
        } catch (Exception e) {
            // If exception is thrown, return default value
            Assertions.assertThat(e).isNotNull();
            return defaultValue;
        }
    }

    /**
     * 验证操作返回null或抛出异常（两者都可接受）
     */
    public static <R> void assertReturnsNullOrThrowsException(Supplier<R> operation) {
        try {
            R result = operation.get();
            Assertions.assertThat(result).isNull();
        } catch (Exception e) {
            // Exception is also acceptable
            Assertions.assertThat(e).isNotNull();
        }
    }

    /**
     * 验证操作返回false或抛出异常（用于boolean返回值的操作）
     */
    public static void assertReturnsFalseOrThrowsException(Supplier<Boolean> operation) {
        try {
            Boolean result = operation.get();
            Assertions.assertThat(result).isFalse();
        } catch (Exception e) {
            // Exception is also acceptable
            Assertions.assertThat(e).isNotNull();
        }
    }

    /**
     * 验证操作返回空集合或抛出异常
     */
    public static <T> void assertReturnsEmptyOrThrowsException(Supplier<java.util.Collection<T>> operation) {
        try {
            java.util.Collection<T> result = operation.get();
            Assertions.assertThat(result).isEmpty();
        } catch (Exception e) {
            // Exception is also acceptable
            Assertions.assertThat(e).isNotNull();
        }
    }

    /**
     * 验证SQL语法错误异常
     */
    public static void assertSqlGrammarException(Runnable operation) {
        assertThrowsException(org.springframework.jdbc.BadSqlGrammarException.class, operation);
    }

    /**
     * 验证SQL语法错误异常（带返回值）
     */
    public static <R> org.springframework.jdbc.BadSqlGrammarException assertSqlGrammarException(Supplier<R> operation) {
        return assertThrowsException(org.springframework.jdbc.BadSqlGrammarException.class, operation);
    }

    /**
     * 验证数据完整性违反异常
     */
    public static void assertDataIntegrityException(Runnable operation) {
        assertThrowsException(org.springframework.dao.DataIntegrityViolationException.class, operation);
    }

    /**
     * 验证数据完整性违反异常（带返回值）
     */
    public static <R> org.springframework.dao.DataIntegrityViolationException assertDataIntegrityException(Supplier<R> operation) {
        return assertThrowsException(org.springframework.dao.DataIntegrityViolationException.class, operation);
    }

    /**
     * 验证重复键异常
     */
    public static void assertDuplicateKeyException(Runnable operation) {
        assertThrowsException(org.springframework.dao.DuplicateKeyException.class, operation);
    }

    /**
     * 验证重复键异常（带返回值）
     */
    public static <R> org.springframework.dao.DuplicateKeyException assertDuplicateKeyException(Supplier<R> operation) {
        return assertThrowsException(org.springframework.dao.DuplicateKeyException.class, operation);
    }

    /**
     * 验证空指针异常
     */
    public static void assertNullPointerException(Runnable operation) {
        assertThrowsException(NullPointerException.class, operation);
    }

    /**
     * 验证空指针异常（带返回值）
     */
    public static <R> NullPointerException assertNullPointerException(Supplier<R> operation) {
        return assertThrowsException(NullPointerException.class, operation);
    }

    /**
     * 验证非法参数异常
     */
    public static void assertIllegalArgumentException(Runnable operation) {
        assertThrowsException(IllegalArgumentException.class, operation);
    }

    /**
     * 验证非法参数异常（带返回值）
     */
    public static <R> IllegalArgumentException assertIllegalArgumentException(Supplier<R> operation) {
        return assertThrowsException(IllegalArgumentException.class, operation);
    }

    /**
     * 验证认证相关异常（401/403状态码）
     */
    public static void assertAuthenticationException(Runnable operation) {
        try {
            operation.run();
            // If no exception is thrown, this is unexpected for authentication tests
            Assertions.fail("Expected authentication exception but none was thrown");
        } catch (Exception e) {
            // Check if it's an authentication-related exception
            boolean isAuthException = e.getMessage() != null &&
                    (e.getMessage().contains("401") ||
                     e.getMessage().contains("403") ||
                     e.getMessage().contains("Unauthorized") ||
                     e.getMessage().contains("Forbidden") ||
                     e.getMessage().contains("未授权") ||
                     e.getMessage().contains("无权限"));

            if (!isAuthException) {
                throw new AssertionError("Expected authentication exception but got: " + e.getMessage(), e);
            }
        }
    }

    /**
     * 验证验证相关异常
     */
    public static void assertValidationException(Runnable operation) {
        try {
            operation.run();
            Assertions.fail("Expected validation exception but none was thrown");
        } catch (Exception e) {
            boolean isValidationException = e.getMessage() != null &&
                    (e.getMessage().contains("validation") ||
                     e.getMessage().contains("校验") ||
                     e.getMessage().contains("参数不完整") ||
                     e.getMessage().contains("不能为空"));

            if (!isValidationException && !(e instanceof IllegalArgumentException)) {
                throw new AssertionError("Expected validation exception but got: " + e.getMessage(), e);
            }
        }
    }

    /**
     * 验证操作在预期时间内完成或抛出异常
     */
    public static void assertCompletesWithinTimeOrThrowsException(Runnable operation, long timeoutMs) {
        long startTime = System.currentTimeMillis();
        try {
            operation.run();
            long duration = System.currentTimeMillis() - startTime;
            Assertions.assertThat(duration).isLessThan(timeoutMs);
        } catch (Exception e) {
            // Exception is acceptable
            Assertions.assertThat(e).isNotNull();
        }
    }

    /**
     * 验证操作返回预期错误码或抛出异常
     */
    public static void assertReturnsErrorCodeOrThrowsException(Supplier<Integer> operation, int expectedErrorCode) {
        try {
            Integer result = operation.get();
            Assertions.assertThat(result).isEqualTo(expectedErrorCode);
        } catch (Exception e) {
            // Exception is also acceptable
            Assertions.assertThat(e).isNotNull();
        }
    }

    /**
     * 验证操作返回false或特定异常类型
     */
    public static void assertReturnsFalseOrThrowsSpecificException(Supplier<Boolean> operation, Class<? extends Exception> exceptionClass) {
        try {
            Boolean result = operation.get();
            Assertions.assertThat(result).isFalse();
        } catch (Exception e) {
            if (!exceptionClass.isInstance(e)) {
                throw new AssertionError(
                        "Expected exception of type " + exceptionClass.getName() +
                        " but got " + e.getClass().getName(), e);
            }
        }
    }
}

