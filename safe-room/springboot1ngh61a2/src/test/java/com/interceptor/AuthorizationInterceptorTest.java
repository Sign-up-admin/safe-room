package com.interceptor;

import com.annotation.IgnoreAuth;
import com.entity.TokenEntity;
import com.service.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.method.HandlerMethod;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.lang.reflect.Field;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthorizationInterceptorTest {

    private AuthorizationInterceptor interceptor;
    private TokenService tokenService;

    @BeforeEach
    void setUp() throws Exception {
        interceptor = new AuthorizationInterceptor();
        tokenService = mock(TokenService.class);
        Field field = AuthorizationInterceptor.class.getDeclaredField("tokenService");
        field.setAccessible(true);
        field.set(interceptor, tokenService);
    }

    @Test
    void shouldShortCircuitOptionsRequests() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        when(request.getMethod()).thenReturn("OPTIONS");

        boolean result = interceptor.preHandle(request, response, new Object());

        assertThat(result).isFalse();
        verify(response).setStatus(200);
    }

    @Test
    void shouldBypassWhenHandlerIsNotMethod() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        when(request.getMethod()).thenReturn("GET");

        boolean result = interceptor.preHandle(request, response, new Object());

        assertThat(result).isTrue();
    }

    @Test
    void shouldSkipAuthWhenIgnoreAuthAnnotationPresent() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        when(request.getMethod()).thenReturn("GET");

        HandlerMethod handlerMethod = new HandlerMethod(new TestController(), TestController.class.getMethod("ignored"));

        boolean result = interceptor.preHandle(request, response, handlerMethod);

        assertThat(result).isTrue();
        verifyNoInteractions(tokenService);
    }

    @Test
    void shouldPopulateSessionWhenTokenValid() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        HttpSession session = mock(HttpSession.class);
        when(request.getMethod()).thenReturn("GET");
        when(request.getHeader(AuthorizationInterceptor.LOGIN_TOKEN_KEY)).thenReturn("valid");
        when(request.getSession()).thenReturn(session);

        TokenEntity tokenEntity = new TokenEntity();
        tokenEntity.setUserid(10L);
        tokenEntity.setRole("ADMIN");
        tokenEntity.setTablename("users");
        tokenEntity.setUsername("admin");
        when(tokenService.getTokenEntity("valid")).thenReturn(tokenEntity);

        HandlerMethod handlerMethod = new HandlerMethod(new TestController(), TestController.class.getMethod("secured"));

        boolean result = interceptor.preHandle(request, response, handlerMethod);

        assertThat(result).isTrue();
        verify(session).setAttribute("userId", 10L);
        verify(session).setAttribute("role", "ADMIN");
        verify(session).setAttribute("tableName", "users");
        verify(session).setAttribute("username", "admin");
    }

    @Test
    void shouldWriteErrorResponseWhenTokenMissing() throws Exception {
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        when(request.getMethod()).thenReturn("GET");
        when(request.getHeader(any())).thenReturn(null);
        StringWriter buffer = new StringWriter();
        when(response.getWriter()).thenReturn(new PrintWriter(buffer));

        HandlerMethod handlerMethod = new HandlerMethod(new TestController(), TestController.class.getMethod("secured"));

        boolean result = interceptor.preHandle(request, response, handlerMethod);

        assertThat(result).isFalse();
        assertThat(buffer.toString()).contains("请先登录");
    }

    static class TestController {
        @IgnoreAuth
        public void ignored() {
        }

        public void secured() {
        }
    }
}


