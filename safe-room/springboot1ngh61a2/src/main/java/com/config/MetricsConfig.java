package com.config;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import io.micrometer.core.instrument.binder.jvm.JvmMemoryMetrics;
import io.micrometer.core.instrument.binder.jvm.JvmGcMetrics;
import io.micrometer.core.instrument.binder.jvm.JvmThreadMetrics;
import io.micrometer.core.instrument.binder.system.ProcessorMetrics;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.autoconfigure.metrics.MeterRegistryCustomizer;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;

import java.util.concurrent.atomic.AtomicInteger;

/**
 * Prometheus Metrics Configuration for Fitness Gym System
 * Provides comprehensive application and business metrics
 */
@Configuration
public class MetricsConfig {

    // Business metrics - can be updated from controllers/services
    private final AtomicInteger activeUsers = new AtomicInteger(0);
    private final AtomicInteger activeWorkouts = new AtomicInteger(0);

    @Bean
    MeterRegistryCustomizer<MeterRegistry> metricsCommonTags() {
        return registry -> registry.config().commonTags("application", "fitness-gym");
    }

    @EventListener(ApplicationReadyEvent.class)
    public void bindMetrics(ApplicationReadyEvent event) {
        MeterRegistry registry = event.getApplicationContext().getBean(MeterRegistry.class);
        // JVM Metrics
        new JvmMemoryMetrics().bindTo(registry);
        new JvmGcMetrics().bindTo(registry);
        new JvmThreadMetrics().bindTo(registry);
        new ProcessorMetrics().bindTo(registry);

        // Business Metrics
        Gauge.builder("fitness_gym_active_users", activeUsers, AtomicInteger::get)
                .description("Number of currently active users")
                .register(registry);

        Gauge.builder("fitness_gym_active_workouts", activeWorkouts, AtomicInteger::get)
                .description("Number of currently active workout sessions")
                .register(registry);

        // HTTP Request Metrics (complementing built-in metrics)
        Counter.builder("fitness_gym_http_requests_total")
                .description("Total number of HTTP requests")
                .tags("method", "all", "status", "all")
                .register(registry);

        // Database Connection Pool Metrics
        Gauge.builder("fitness_gym_db_connections_active", () -> getActiveDbConnections())
                .description("Number of active database connections")
                .register(registry);

        Gauge.builder("fitness_gym_db_connections_idle", () -> getIdleDbConnections())
                .description("Number of idle database connections")
                .register(registry);

        Gauge.builder("fitness_gym_db_connections_max", () -> getMaxDbConnections())
                .description("Maximum database connections")
                .register(registry);

        // Business Operation Counters
        Counter.builder("fitness_gym_workout_bookings_total")
                .description("Total number of workout bookings")
                .register(registry);

        Counter.builder("fitness_gym_membership_purchases_total")
                .description("Total number of membership purchases")
                .register(registry);

        Counter.builder("fitness_gym_failed_logins_total")
                .description("Total number of failed login attempts")
                .register(registry);

        // Cache Metrics
        Gauge.builder("fitness_gym_cache_hit_ratio", () -> getCacheHitRatio())
                .description("Cache hit ratio (0.0 to 1.0)")
                .register(registry);

        // File Storage Metrics
        Gauge.builder("fitness_gym_file_storage_used_bytes", () -> getFileStorageUsedBytes())
                .description("File storage used in bytes")
                .register(registry);

        Gauge.builder("fitness_gym_file_storage_total_bytes", () -> getFileStorageTotalBytes())
                .description("File storage total capacity in bytes")
                .register(registry);
    }

    // Metric update methods - call these from your controllers/services

    /**
     * Update active users count
     */
    public void updateActiveUsers(int count) {
        activeUsers.set(count);
    }

    /**
     * Increment active users
     */
    public void incrementActiveUsers() {
        activeUsers.incrementAndGet();
    }

    /**
     * Decrement active users
     */
    public void decrementActiveUsers() {
        activeUsers.decrementAndGet();
    }

    /**
     * Update active workouts count
     */
    public void updateActiveWorkouts(int count) {
        activeWorkouts.set(count);
    }

    /**
     * Increment workout bookings counter
     */
    public void incrementWorkoutBookings(MeterRegistry registry) {
        Counter.builder("fitness_gym_workout_bookings_total")
                .register(registry)
                .increment();
    }

    /**
     * Increment membership purchases counter
     */
    public void incrementMembershipPurchases(MeterRegistry registry) {
        Counter.builder("fitness_gym_membership_purchases_total")
                .register(registry)
                .increment();
    }

    /**
     * Increment failed logins counter
     */
    public void incrementFailedLogins(MeterRegistry registry) {
        Counter.builder("fitness_gym_failed_logins_total")
                .register(registry)
                .increment();
    }

    /**
     * Record API response time
     */
    public void recordApiResponseTime(MeterRegistry registry, String method, String endpoint, String status, long responseTimeMs) {
        Timer.builder("fitness_gym_api_response_time")
                .description("API response time in milliseconds")
                .tags("method", method, "endpoint", endpoint, "status", status)
                .register(registry)
                .record(java.time.Duration.ofMillis(responseTimeMs));
    }

    // Placeholder methods for metrics that require actual implementation
    // These should be connected to your actual data sources

    private int getActiveDbConnections() {
        // TODO: Implement based on your connection pool (HikariCP, etc.)
        return 0;
    }

    private int getIdleDbConnections() {
        // TODO: Implement based on your connection pool
        return 0;
    }

    private int getMaxDbConnections() {
        // TODO: Implement based on your connection pool configuration
        return 50; // Default max connections
    }

    private double getCacheHitRatio() {
        // TODO: Implement based on your cache implementation (Redis, Caffeine, etc.)
        return 0.0;
    }

    private long getFileStorageUsedBytes() {
        // TODO: Implement based on your file storage (MinIO, local filesystem, etc.)
        return 0L;
    }

    private long getFileStorageTotalBytes() {
        // TODO: Implement based on your file storage capacity
        return 1073741824L; // 1GB default
    }
}
