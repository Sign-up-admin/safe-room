package com.test.support;

import com.baomidou.mybatisplus.extension.service.IService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service层测试基类 - 为Service层测试提供通用的设置和工具方法
 *
 * 特点:
 * - 支持事务回滚，确保测试隔离
 * - 自动清理测试数据
 * - 提供通用的Service测试工具方法
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@Rollback
public abstract class AbstractServiceTest extends AbstractUnitTest {

    @BeforeEach
    void setUpServiceTest() {
        log.debug("Setting up service test: {}", getClass().getSimpleName());

        // 确保测试数据就绪
        prepareTestData();
    }

    @AfterEach
    void tearDownServiceTest() {
        log.debug("Tearing down service test: {}", getClass().getSimpleName());

        // 清理测试数据
        cleanupTestData();
    }

    /**
     * 准备测试数据（子类实现）
     */
    protected abstract void prepareTestData();

    /**
     * 清理测试数据（子类实现）
     */
    protected abstract void cleanupTestData();

    /**
     * 验证实体是否正确保存
     */
    protected <T> void assertEntitySaved(IService<T> service, T entity, Long expectedId) {
        T savedEntity = service.getById(expectedId);
        assert savedEntity != null : "Entity should be saved with ID: " + expectedId;
        log.debug("Entity successfully saved: {} - {}", entity.getClass().getSimpleName(), expectedId);
    }

    /**
     * 验证实体是否正确删除
     */
    protected <T> void assertEntityDeleted(IService<T> service, Long entityId) {
        T deletedEntity = service.getById(entityId);
        assert deletedEntity == null : "Entity should be deleted with ID: " + entityId;
        log.debug("Entity successfully deleted: {}", entityId);
    }

    /**
     * 验证服务操作不抛出异常
     */
    protected void assertServiceOperationSucceeds(Runnable operation) {
        try {
            operation.run();
            log.debug("Service operation completed successfully");
        } catch (Exception e) {
            throw new AssertionError("Service operation should not throw exception", e);
        }
    }

    /**
     * 验证服务操作抛出指定类型的异常
     */
    protected <T extends Exception> void assertServiceOperationThrows(Class<T> exceptionType, Runnable operation) {
        try {
            operation.run();
            throw new AssertionError("Expected exception of type " + exceptionType.getSimpleName() + " but none was thrown");
        } catch (Exception e) {
            if (!exceptionType.isInstance(e)) {
                throw new AssertionError("Expected exception of type " + exceptionType.getSimpleName() +
                                       " but got " + e.getClass().getSimpleName(), e);
            }
            log.debug("Service operation correctly threw expected exception: {}", exceptionType.getSimpleName());
        }
    }
}
