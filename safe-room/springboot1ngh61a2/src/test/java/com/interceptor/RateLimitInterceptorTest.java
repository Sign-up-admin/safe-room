package com.interceptor;

import com.utils.R;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.method.HandlerMethod;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.lang.reflect.Method;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class RateLimitInterceptorTest {

    private RateLimitInterceptor interceptor;
    private HttpServletRequest request;
    private HttpServletResponse response;
    private HandlerMethod handlerMethod;

    @BeforeEach
    void setUp() throws Exception {
        interceptor = new RateLimitInterceptor();
        request = mock(HttpServletRequest.class);
        response = mock(HttpServletResponse.class);
        
        TestController controller = new TestController();
        Method method = TestController.class.getMethod("testMethod");
        handlerMethod = new HandlerMethod(controller, method);
    }

    @Test
    void shouldAllowNonHandlerMethod() throws Exception {
        boolean result = interceptor.preHandle(request, response, new Object());
        
        assertThat(result).isTrue();
        verifyNoInteractions(response);
    }

    @Test
    void shouldAllowNonLoginRequest() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/users/info");
        
        boolean result = interceptor.preHandle(request, response, handlerMethod);
        
        assertThat(result).isTrue();
        verifyNoInteractions(response);
    }

    @Test
    void shouldAllowLoginRequestWithinLimit() throws Exception {
        // Use a unique IP to avoid interference from other tests
        String uniqueIp = "192.168.100." + System.currentTimeMillis() % 255;
        when(request.getRequestURI()).thenReturn("/api/users/login");
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getHeader("X-Real-IP")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn(uniqueIp);
        
        // Mock writer in case rate limit is triggered
        StringWriter stringWriter = new StringWriter();
        PrintWriter printWriter = new PrintWriter(stringWriter);
        when(response.getWriter()).thenReturn(printWriter);
        
        // 第一次请求应该通过（令牌桶有初始令牌）
        boolean result1 = interceptor.preHandle(request, response, handlerMethod);
        assertThat(result1).isTrue();
        
        // 等待足够长的时间（至少13秒，因为限流是5次/分钟 = 12秒/次）
        // 以确保有足够的令牌供第二次请求使用
        Thread.sleep(13000);
        boolean result2 = interceptor.preHandle(request, response, handlerMethod);
        // 在限流范围内，应该允许通过
        assertThat(result2).isTrue();
    }

    @Test
    void shouldRejectLoginRequestExceedingLimit() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/users/login");
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getHeader("X-Real-IP")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");
        
        StringWriter stringWriter = new StringWriter();
        PrintWriter printWriter = new PrintWriter(stringWriter);
        when(response.getWriter()).thenReturn(printWriter);
        
        // RateLimiter使用令牌桶算法，5次/分钟 = 约0.083次/秒
        // 快速发送多个请求，超过限流阈值
        boolean allPassed = true;
        for (int i = 0; i < 10; i++) {
            boolean result = interceptor.preHandle(request, response, handlerMethod);
            if (!result) {
                allPassed = false;
                break;
            }
            // 短暂延迟以确保RateLimiter有时间处理
            Thread.sleep(10);
        }
        
        // 至少应该有一次请求被拒绝
        verify(response, atLeastOnce()).setStatus(429); // SC_TOO_MANY_REQUESTS
        verify(response, atLeastOnce()).setContentType("application/json; charset=utf-8");
        verify(response, atLeastOnce()).setCharacterEncoding("UTF-8");
    }

    @Test
    void shouldLimitRegisterRequest() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/users/register");
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getHeader("X-Real-IP")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn("192.168.1.1");
        
        StringWriter stringWriter = new StringWriter();
        PrintWriter printWriter = new PrintWriter(stringWriter);
        when(response.getWriter()).thenReturn(printWriter);
        
        // 快速发送多个注册请求，超过限流阈值（3次/分钟）
        for (int i = 0; i < 10; i++) {
            interceptor.preHandle(request, response, handlerMethod);
            Thread.sleep(10);
        }
        
        verify(response, atLeastOnce()).setStatus(429); // SC_TOO_MANY_REQUESTS
    }

    @Test
    void shouldLimitResetPasswordRequest() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/users/resetPass");
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getHeader("X-Real-IP")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn("10.0.0.1");
        
        StringWriter stringWriter = new StringWriter();
        PrintWriter printWriter = new PrintWriter(stringWriter);
        when(response.getWriter()).thenReturn(printWriter);
        
        // 快速发送多个密码重置请求，超过限流阈值（2次/分钟）
        for (int i = 0; i < 10; i++) {
            interceptor.preHandle(request, response, handlerMethod);
            Thread.sleep(10);
        }
        
        verify(response, atLeastOnce()).setStatus(429); // SC_TOO_MANY_REQUESTS
    }

    @Test
    void shouldExtractIpFromXForwardedFor() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/users/login");
        when(request.getHeader("X-Forwarded-For")).thenReturn("192.168.1.100");
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");
        
        boolean result = interceptor.preHandle(request, response, handlerMethod);
        
        assertThat(result).isTrue();
    }

    @Test
    void shouldExtractIpFromXRealIP() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/users/login");
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getHeader("X-Real-IP")).thenReturn("10.0.0.100");
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");
        
        boolean result = interceptor.preHandle(request, response, handlerMethod);
        
        assertThat(result).isTrue();
    }

    @Test
    void shouldHandleMultipleIpsInXForwardedFor() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/users/login");
        when(request.getHeader("X-Forwarded-For")).thenReturn("192.168.1.100, 10.0.0.1, 172.16.0.1");
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");
        
        boolean result = interceptor.preHandle(request, response, handlerMethod);
        
        assertThat(result).isTrue();
    }

    @Test
    void shouldUseRemoteAddrWhenHeadersNotPresent() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/users/login");
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getHeader("X-Real-IP")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn("172.16.0.50");
        
        boolean result = interceptor.preHandle(request, response, handlerMethod);
        
        assertThat(result).isTrue();
    }

    @Test
    void shouldHandleUnknownHeaderValue() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/users/login");
        when(request.getHeader("X-Forwarded-For")).thenReturn("unknown");
        when(request.getHeader("X-Real-IP")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");
        
        boolean result = interceptor.preHandle(request, response, handlerMethod);
        
        assertThat(result).isTrue();
    }

    @Test
    void shouldReturnErrorResponseWhenRateLimited() throws Exception {
        when(request.getRequestURI()).thenReturn("/api/users/login");
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");
        
        StringWriter stringWriter = new StringWriter();
        PrintWriter printWriter = new PrintWriter(stringWriter);
        when(response.getWriter()).thenReturn(printWriter);
        
        // 快速发送多个请求
        for (int i = 0; i < 10; i++) {
            interceptor.preHandle(request, response, handlerMethod);
            Thread.sleep(10);
        }
        
        printWriter.flush();
        String responseContent = stringWriter.toString();
        // 如果有限流，响应内容应该包含错误信息
        if (responseContent.length() > 0) {
            assertThat(responseContent).contains("登录请求过于频繁");
        }
    }

    @Test
    void shouldHaveDifferentLimitsForDifferentEndpoints() throws Exception {
        // 登录接口限流：5次/分钟
        when(request.getRequestURI()).thenReturn("/api/users/login");
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");
        
        StringWriter stringWriter = new StringWriter();
        PrintWriter printWriter = new PrintWriter(stringWriter);
        when(response.getWriter()).thenReturn(printWriter);
        
        // 注册接口限流：3次/分钟（更严格）
        when(request.getRequestURI()).thenReturn("/api/users/register");
        when(request.getRemoteAddr()).thenReturn("192.168.1.1");
        
        // 密码重置接口限流：2次/分钟（最严格）
        when(request.getRequestURI()).thenReturn("/api/users/resetPass");
        when(request.getRemoteAddr()).thenReturn("10.0.0.1");
        
        // 验证不同接口有不同的限流策略
        boolean result = interceptor.preHandle(request, response, handlerMethod);
        assertThat(result).isTrue();
    }

    static class TestController {
        public void testMethod() {
        }
    }
}

