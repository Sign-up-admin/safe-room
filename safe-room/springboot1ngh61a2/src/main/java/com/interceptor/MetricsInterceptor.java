package com.interceptor;

import com.config.MetricsConfig;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Metrics Interceptor for collecting API performance metrics
 * Records response times and request counts for all API endpoints
 */
@Component
public class MetricsInterceptor implements HandlerInterceptor {

    @Autowired
    private MeterRegistry meterRegistry;

    @Autowired
    private MetricsConfig metricsConfig;

    private final ThreadLocal<Long> startTime = new ThreadLocal<>();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        startTime.set(System.currentTimeMillis());
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        Long start = startTime.get();
        if (start != null) {
            long duration = System.currentTimeMillis() - start;

            String method = request.getMethod();
            String uri = request.getRequestURI();
            String status = String.valueOf(response.getStatus());

            // Record API response time using the metrics config
            metricsConfig.recordApiResponseTime(meterRegistry, method, uri, status, duration);

            // Record general HTTP request metrics
            Timer.builder("fitness_gym_http_request_duration")
                    .description("HTTP request duration")
                    .tags("method", method, "uri", uri, "status", status)
                    .register(meterRegistry)
                    .record(java.time.Duration.ofMillis(duration));

            // Clean up thread local
            startTime.remove();
        }
    }
}
