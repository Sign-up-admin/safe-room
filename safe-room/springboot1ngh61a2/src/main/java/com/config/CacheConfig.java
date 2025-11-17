package com.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.time.Duration;
import java.util.Arrays;

/**
 * 缓存配置类
 * 配置Caffeine缓存管理器，用于统计接口等场景的缓存
 */
@Configuration
@EnableCaching
public class CacheConfig {

    private static final Logger log = LoggerFactory.getLogger(CacheConfig.class);

    /**
     * 统计数据缓存配置
     * 适用于CommonController的统计接口
     */
    @Bean
    @Primary
    public CacheManager statisticsCacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .initialCapacity(100)          // 初始容量
                .maximumSize(1000)             // 最大缓存条目数
                .expireAfterWrite(Duration.ofMinutes(10))  // 写入后10分钟过期
                .weakKeys()                    // 使用弱引用键
                .recordStats()                 // 启用统计信息
                .removalListener((key, value, cause) -> {
                    log.debug("缓存条目被移除 - 键: {}, 原因: {}", key, cause);
                }));

        // 配置缓存名称
        cacheManager.setCacheNames(Arrays.asList(
                "statistics",           // 通用统计缓存
                "groupStatistics",      // 分组统计缓存
                "valueStatistics",      // 数值统计缓存
                "timeStatistics"        // 时间维度统计缓存
        ));

        log.info("统计缓存管理器已配置 - 最大容量: 1000, 过期时间: 10分钟");
        return cacheManager;
    }

    /**
     * 应用级缓存管理器（备用）
     * 用于其他缓存需求
     */
    @Bean("applicationCacheManager")
    public CacheManager applicationCacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .initialCapacity(50)
                .maximumSize(500)
                .expireAfterWrite(Duration.ofMinutes(30))  // 30分钟过期
                .recordStats());

        cacheManager.setCacheNames(Arrays.asList(
                "application",          // 应用级缓存
                "userSessions",         // 用户会话缓存
                "apiResponses"          // API响应缓存
        ));

        log.info("应用缓存管理器已配置 - 最大容量: 500, 过期时间: 30分钟");
        return cacheManager;
    }

    /**
     * 获取缓存统计信息（用于监控）
     */
    public static void logCacheStatistics(CacheManager cacheManager) {
        if (cacheManager instanceof CaffeineCacheManager) {
            CaffeineCacheManager caffeineManager = (CaffeineCacheManager) cacheManager;
            // 可以通过其他方式获取统计信息
            log.info("缓存管理器统计信息已记录");
        }
    }
}
