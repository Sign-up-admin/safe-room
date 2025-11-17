package com.utils;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.IService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.StringUtils;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;

/**
 * 统一的测试数据清理框架
 *
 * 提供测试数据清理的统一接口和工具方法，
 * 支持按前缀、模式、条件等多种清理方式。
 */
public final class TestDataCleanup {

    private static final Logger log = LoggerFactory.getLogger(TestDataCleanup.class);

    private static final Map<String, List<Runnable>> CLEANUP_TASKS = new ConcurrentHashMap<>();

    private TestDataCleanup() {
        // Utility class
    }

    /**
     * 按前缀清理数据
     *
     * @param service 服务类
     * @param fieldName 字段名（如 "username", "title", "name" 等）
     * @param prefix 前缀（如 "test-", "auto-", "temp-"）
     * @param <T> 实体类型
     */
    public static <T> void cleanupByPrefix(IService<T> service, String fieldName, String prefix) {
        if (service == null || !StringUtils.hasText(fieldName) || !StringUtils.hasText(prefix)) {
            log.warn("Invalid parameters for cleanupByPrefix: service={}, fieldName={}, prefix={}",
                    service, fieldName, prefix);
            return;
        }

        try {
            QueryWrapper<T> wrapper = new QueryWrapper<>();
            wrapper.like(fieldName, prefix);

            List<T> entitiesToDelete = service.list(wrapper);
            if (!entitiesToDelete.isEmpty()) {
                log.debug("Found {} entities to cleanup with prefix '{}' in field '{}'",
                        entitiesToDelete.size(), prefix, fieldName);

                // 批量删除
                for (T entity : entitiesToDelete) {
                    try {
                        Object idValue = getIdValue(entity);
                        if (idValue instanceof Long) {
                            service.removeById((Long) idValue);
                        } else if (idValue instanceof Integer) {
                            service.removeById((Integer) idValue);
                        } else if (idValue instanceof String) {
                            service.removeById((String) idValue);
                        } else {
                            log.warn("Unsupported ID type for entity {}: {}", entity.getClass().getSimpleName(), idValue.getClass());
                        }
                    } catch (Exception e) {
                        log.warn("Failed to delete entity with id {}: {}", getIdValue(entity), e.getMessage());
                    }
                }

                log.info("Cleaned up {} entities with prefix '{}' in field '{}'",
                        entitiesToDelete.size(), prefix, fieldName);
            }
        } catch (Exception e) {
            log.error("Error during cleanup by prefix: service={}, fieldName={}, prefix={}",
                    service.getClass().getSimpleName(), fieldName, prefix, e);
        }
    }

    /**
     * 按条件清理数据
     *
     * @param service 服务类
     * @param predicate 条件谓词
     * @param <T> 实体类型
     */
    public static <T> void cleanupByCondition(IService<T> service, Predicate<T> predicate) {
        if (service == null || predicate == null) {
            log.warn("Invalid parameters for cleanupByCondition: service={}, predicate={}",
                    service, predicate);
            return;
        }

        try {
            List<T> allEntities = service.list();
            List<T> entitiesToDelete = allEntities.stream()
                    .filter(predicate)
                    .toList();

            if (!entitiesToDelete.isEmpty()) {
                log.debug("Found {} entities to cleanup by condition", entitiesToDelete.size());

                for (T entity : entitiesToDelete) {
                    try {
                        Object idValue = getIdValue(entity);
                        if (idValue instanceof Long) {
                            service.removeById((Long) idValue);
                        } else if (idValue instanceof Integer) {
                            service.removeById((Integer) idValue);
                        } else if (idValue instanceof String) {
                            service.removeById((String) idValue);
                        } else {
                            log.warn("Unsupported ID type for entity {}: {}", entity.getClass().getSimpleName(), idValue.getClass());
                        }
                    } catch (Exception e) {
                        log.warn("Failed to delete entity with id {}: {}", getIdValue(entity), e.getMessage());
                    }
                }

                log.info("Cleaned up {} entities by condition", entitiesToDelete.size());
            }
        } catch (Exception e) {
            log.error("Error during cleanup by condition: service={}",
                    service.getClass().getSimpleName(), e);
        }
    }

    /**
     * 清理所有测试数据（按常见测试前缀）
     * 支持的清理前缀：test-, auto-, temp-, cleanup-
     *
     * @param serviceMap 服务映射表，key为服务名，value为服务实例
     */
    public static void cleanupAllTestData(Map<String, IService<?>> serviceMap) {
        if (serviceMap == null || serviceMap.isEmpty()) {
            log.warn("No services provided for cleanupAllTestData");
            return;
        }

        String[] prefixes = {"test-", "auto-", "temp-", "cleanup-"};
        String[] commonFields = {"title", "name", "username", "yonghuzhanghao", "huiyuankamingcheng"};

        log.info("Starting cleanup of all test data across {} services", serviceMap.size());

        for (Map.Entry<String, IService<?>> entry : serviceMap.entrySet()) {
            String serviceName = entry.getKey();
            IService<?> service = entry.getValue();

            try {
                for (String prefix : prefixes) {
                    for (String field : commonFields) {
                        try {
                            cleanupByPrefix(service, field, prefix);
                        } catch (Exception e) {
                            // 忽略字段不存在的异常，继续下一个字段
                            log.debug("Field '{}' not found in service '{}', continuing...", field, serviceName);
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Error cleaning up service '{}': {}", serviceName, e.getMessage());
            }
        }

        log.info("Completed cleanup of all test data");
    }

    /**
     * 注册清理任务
     *
     * @param testClassName 测试类名
     * @param cleanupTask 清理任务
     */
    public static void registerCleanupTask(String testClassName, Runnable cleanupTask) {
        if (!StringUtils.hasText(testClassName) || cleanupTask == null) {
            log.warn("Invalid parameters for registerCleanupTask: testClassName={}, cleanupTask={}",
                    testClassName, cleanupTask);
            return;
        }

        CLEANUP_TASKS.computeIfAbsent(testClassName, k -> new ArrayList<>()).add(cleanupTask);
        log.debug("Registered cleanup task for test class: {}", testClassName);
    }

    /**
     * 执行指定测试类的所有清理任务
     *
     * @param testClassName 测试类名
     */
    public static void executeCleanupTasks(String testClassName) {
        if (!StringUtils.hasText(testClassName)) {
            log.warn("Invalid test class name for executeCleanupTasks: {}", testClassName);
            return;
        }

        List<Runnable> tasks = CLEANUP_TASKS.get(testClassName);
        if (tasks != null && !tasks.isEmpty()) {
            log.debug("Executing {} cleanup tasks for test class: {}", tasks.size(), testClassName);

            for (Runnable task : tasks) {
                try {
                    task.run();
                } catch (Exception e) {
                    log.error("Error executing cleanup task for test class '{}': {}", testClassName, e.getMessage());
                }
            }

            // 执行完后清除任务
            CLEANUP_TASKS.remove(testClassName);
        }
    }

    /**
     * 清理文件系统中的测试文件
     *
     * @param filePaths 文件路径列表
     */
    public static void cleanupTestFiles(List<String> filePaths) {
        if (filePaths == null || filePaths.isEmpty()) {
            return;
        }

        for (String filePath : filePaths) {
            try {
                java.io.File file = new java.io.File(filePath);
                if (file.exists() && file.delete()) {
                    log.debug("Deleted test file: {}", filePath);
                }
            } catch (Exception e) {
                log.warn("Failed to delete test file '{}': {}", filePath, e.getMessage());
            }
        }
    }

    /**
     * 获取实体的ID值（通过反射）
     *
     * @param entity 实体对象
     * @return ID值
     */
    private static Object getIdValue(Object entity) {
        if (entity == null) {
            return null;
        }

        try {
            // 尝试常见的ID字段名
            String[] idFieldNames = {"id", "Id", "ID"};

            for (String fieldName : idFieldNames) {
                try {
                    Field field = entity.getClass().getDeclaredField(fieldName);
                    field.setAccessible(true);
                    Object value = field.get(entity);
                    if (value != null) {
                        return value;
                    }
                } catch (NoSuchFieldException e) {
                    // 继续尝试下一个字段名
                }
            }

            // 如果没找到ID字段，返回null
            log.warn("Could not find ID field in entity: {}", entity.getClass().getSimpleName());
            return null;

        } catch (Exception e) {
            log.error("Error getting ID value from entity: {}", entity.getClass().getSimpleName(), e);
            return null;
        }
    }

    /**
     * 批量清理工具方法
     *
     * @param <T> 实体类型
     */
    public static class BatchCleanup<T> {
        private final IService<T> service;
        private final List<Predicate<T>> conditions = new ArrayList<>();

        public BatchCleanup(IService<T> service) {
            this.service = service;
        }

        public BatchCleanup<T> addCondition(Predicate<T> condition) {
            this.conditions.add(condition);
            return this;
        }

        public void execute() {
            Predicate<T> combinedCondition = conditions.stream()
                    .reduce(Predicate::and)
                    .orElse(t -> false);

            cleanupByCondition(service, combinedCondition);
        }
    }

    /**
     * 创建批量清理器
     *
     * @param service 服务类
     * @param <T> 实体类型
     * @return 批量清理器
     */
    public static <T> BatchCleanup<T> batchCleanup(IService<T> service) {
        return new BatchCleanup<>(service);
    }
}
