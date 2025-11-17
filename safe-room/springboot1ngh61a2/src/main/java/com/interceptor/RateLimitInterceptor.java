package com.interceptor;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.common.util.concurrent.RateLimiter;
import com.utils.R;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.PrintWriter;
import java.util.concurrent.TimeUnit;

/**
 * 速率限制拦截器（已禁用）
 * 基于IP的速率限制，防止暴力破解和DDoS攻击
 * 
 * 注意：此功能已被禁用，如需重新启用，请：
 * 1. 取消注释 @Component 注解
 * 2. 在 InterceptorConfig 中重新注册此拦截器
 */
// @Component // 已禁用限流功能
public class RateLimitInterceptor implements HandlerInterceptor {
    
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    
    // 登录接口限流：5次/分钟
    private static final double LOGIN_RATE = 5.0;
    private static final long LOGIN_WINDOW_MINUTES = 1;
    
    // 注册接口限流：3次/分钟
    private static final double REGISTER_RATE = 3.0;
    private static final long REGISTER_WINDOW_MINUTES = 1;
    
    // 密码重置接口限流：2次/分钟
    private static final double RESET_PASSWORD_RATE = 2.0;
    private static final long RESET_PASSWORD_WINDOW_MINUTES = 1;
    
    // 使用Guava Cache存储每个IP的RateLimiter
    private final Cache<String, RateLimiter> loginLimiters = CacheBuilder.newBuilder()
            .expireAfterAccess(LOGIN_WINDOW_MINUTES + 1, TimeUnit.MINUTES)
            .build();
    
    private final Cache<String, RateLimiter> registerLimiters = CacheBuilder.newBuilder()
            .expireAfterAccess(REGISTER_WINDOW_MINUTES + 1, TimeUnit.MINUTES)
            .build();
    
    private final Cache<String, RateLimiter> resetPasswordLimiters = CacheBuilder.newBuilder()
            .expireAfterAccess(RESET_PASSWORD_WINDOW_MINUTES + 1, TimeUnit.MINUTES)
            .build();
    
    /**
     * 获取客户端IP地址
     */
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (StringUtils.isBlank(ip) || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (StringUtils.isBlank(ip) || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // 处理多个IP的情况，取第一个
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
    
    /**
     * 清除指定IP的登录限流记录
     * @param ip IP地址
     */
    public void clearLoginRateLimit(String ip) {
        if (StringUtils.isNotBlank(ip)) {
            loginLimiters.invalidate(ip);
        }
    }
    
    /**
     * 清除指定IP的所有限流记录
     * @param ip IP地址
     */
    public void clearAllRateLimit(String ip) {
        if (StringUtils.isNotBlank(ip)) {
            loginLimiters.invalidate(ip);
            registerLimiters.invalidate(ip);
            resetPasswordLimiters.invalidate(ip);
        }
    }
    
    /**
     * 清除所有限流记录（谨慎使用）
     */
    public void clearAllRateLimits() {
        loginLimiters.invalidateAll();
        registerLimiters.invalidateAll();
        resetPasswordLimiters.invalidateAll();
    }
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }
        
        HandlerMethod handlerMethod = (HandlerMethod) handler;
        String methodName = handlerMethod.getMethod().getName();
        String requestURI = request.getRequestURI();
        
        String clientIp = getClientIp(request);
        RateLimiter limiter = null;
        String errorMessage = null;
        
        // 根据接口类型选择对应的限流器
        // RateLimiter.create()参数是每秒的速率，所以需要将每分钟的速率除以60
        if (requestURI.contains("/login")) {
            limiter = loginLimiters.get(clientIp, () -> RateLimiter.create(LOGIN_RATE / 60.0));
            errorMessage = "登录请求过于频繁，请稍后再试";
        } else if (requestURI.contains("/register")) {
            limiter = registerLimiters.get(clientIp, () -> RateLimiter.create(REGISTER_RATE / 60.0));
            errorMessage = "注册请求过于频繁，请稍后再试";
        } else if (requestURI.contains("/resetPass")) {
            limiter = resetPasswordLimiters.get(clientIp, () -> RateLimiter.create(RESET_PASSWORD_RATE / 60.0));
            errorMessage = "密码重置请求过于频繁，请稍后再试";
        }
        
        // 如果有限流器且无法获取许可，则拒绝请求
        if (limiter != null && !limiter.tryAcquire()) {
            response.setCharacterEncoding("UTF-8");
            response.setContentType("application/json; charset=utf-8");
            response.setStatus(429); // SC_TOO_MANY_REQUESTS
            
            PrintWriter writer = null;
            try {
                writer = response.getWriter();
                writer.print(OBJECT_MAPPER.writeValueAsString(R.error(429, errorMessage)));
            } finally {
                if (writer != null) {
                    writer.close();
                }
            }
            return false;
        }
        
        return true;
    }
}

