package com.config;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * MetricsConfig单元测试
 */
@ExtendWith(MockitoExtension.class)
class MetricsConfigTest {

    @Test
    void shouldCreateMeterRegistryBean() {
        // 创建配置上下文
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
        context.register(MetricsConfig.class);
        context.refresh();

        // 验证MeterRegistry bean存在
        MeterRegistry meterRegistry = context.getBean(MeterRegistry.class);
        assertThat(meterRegistry).isNotNull();

        context.close();
    }

    @Test
    void shouldCreateFitnessGymMetricsBinder() {
        // 创建配置上下文
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
        context.register(MetricsConfig.class);
        context.refresh();

        // 验证健身房指标绑定器bean存在
        Object fitnessMetricsBinder = context.getBean("fitnessGymMetricsBinder");
        assertThat(fitnessMetricsBinder).isNotNull();

        context.close();
    }

    @Test
    void shouldCreateHealthMetricsBinder() {
        // 创建配置上下文
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
        context.register(MetricsConfig.class);
        context.refresh();

        // 验证健康指标绑定器bean存在
        Object healthMetricsBinder = context.getBean("healthMetricsBinder");
        assertThat(healthMetricsBinder).isNotNull();

        context.close();
    }

    @Test
    void shouldCreateDatabaseMetricsBinder() {
        // 创建配置上下文
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
        context.register(MetricsConfig.class);
        context.refresh();

        // 验证数据库指标绑定器bean存在
        Object databaseMetricsBinder = context.getBean("databaseMetricsBinder");
        assertThat(databaseMetricsBinder).isNotNull();

        context.close();
    }

    @Test
    void shouldCreateCacheMetricsBinder() {
        // 创建配置上下文
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
        context.register(MetricsConfig.class);
        context.refresh();

        // 验证缓存指标绑定器bean存在
        Object cacheMetricsBinder = context.getBean("cacheMetricsBinder");
        assertThat(cacheMetricsBinder).isNotNull();

        context.close();
    }
}
