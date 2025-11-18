package com.config;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * CacheConfig单元测试
 */
@ExtendWith(MockitoExtension.class)
class CacheConfigTest {

    @Test
    void shouldCreateCacheManagerBean() {
        // 创建配置上下文
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
        context.register(CacheConfig.class);
        context.refresh();

        // 验证CacheManager bean存在
        CacheManager cacheManager = context.getBean(CacheManager.class);
        assertThat(cacheManager).isNotNull();

        // 验证缓存管理器类型
        assertThat(cacheManager).isInstanceOf(org.springframework.cache.CacheManager.class);

        context.close();
    }

    @Test
    void shouldCreateStatisticsCacheManager() {
        // 创建配置上下文
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
        context.register(CacheConfig.class);
        context.refresh();

        // 验证statisticsCacheManager bean存在
        CacheManager statisticsCacheManager = (CacheManager) context.getBean("statisticsCacheManager");
        assertThat(statisticsCacheManager).isNotNull();

        context.close();
    }

    @Test
    void shouldCreateApplicationCacheManager() {
        // 创建配置上下文
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
        context.register(CacheConfig.class);
        context.refresh();

        // 验证applicationCacheManager bean存在
        CacheManager applicationCacheManager = (CacheManager) context.getBean("applicationCacheManager");
        assertThat(applicationCacheManager).isNotNull();

        context.close();
    }

    @Test
    void shouldEnableCachingAnnotation() {
        // 验证配置类有@EnableCaching注解
        EnableCaching enableCaching = CacheConfig.class.getAnnotation(EnableCaching.class);
        assertThat(enableCaching).isNotNull();
    }
}
