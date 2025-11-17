package com.test.support;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 单元测试基类 - 为单元测试提供通用的设置和工具方法
 *
 * 特点:
 * - 使用Mockito进行模拟
 * - 提供通用的断言和验证方法
 * - 自动清理模拟对象
 */
@ExtendWith(MockitoExtension.class)
public abstract class AbstractUnitTest {

    protected final Logger log = LoggerFactory.getLogger(getClass());

    @BeforeEach
    void setUpUnitTest() {
        log.debug("Setting up unit test: {}", getClass().getSimpleName());

        // 子类可以重写此方法进行额外的设置
        doSetup();
    }

    /**
     * 子类可以重写此方法进行额外的测试设置
     */
    protected void doSetup() {
        // 默认实现为空，子类可以重写
    }

    /**
     * 获取当前测试类的名称（用于日志记录）
     */
    protected String getTestClassName() {
        return getClass().getSimpleName();
    }

    /**
     * 获取当前测试方法的名称（用于日志记录）
     */
    protected String getTestMethodName() {
        StackTraceElement[] stackTrace = Thread.currentThread().getStackTrace();
        for (StackTraceElement element : stackTrace) {
            if (element.getMethodName().startsWith("test") ||
                element.getMethodName().startsWith("should") ||
                element.getMethodName().startsWith("when")) {
                return element.getMethodName();
            }
        }
        return "unknown";
    }
}
