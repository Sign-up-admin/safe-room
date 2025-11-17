package com.config;

import com.interceptor.AuthorizationInterceptor;
import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.config.annotation.InterceptorRegistration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class InterceptorConfigTest {

    private final InterceptorConfig config = new InterceptorConfig();

    @Test
    void addInterceptorsShouldRegisterAuthorizationInterceptor() {
        InterceptorRegistry registry = mock(InterceptorRegistry.class);
        InterceptorRegistration registration = mock(InterceptorRegistration.class);
        when(registry.addInterceptor(any())).thenReturn(registration);
        when(registration.addPathPatterns(any(String[].class))).thenReturn(registration);
        when(registration.excludePathPatterns(any(String[].class))).thenReturn(registration);

        config.addInterceptors(registry);

        verify(registry).addInterceptor(any(AuthorizationInterceptor.class));
        verify(registration).addPathPatterns("/**");
        verify(registration).excludePathPatterns("/static/**");
    }

    @Test
    void addResourceHandlersShouldRegisterStaticMappings() {
        ResourceHandlerRegistry registry = mock(ResourceHandlerRegistry.class);
        ResourceHandlerRegistration registration = mock(ResourceHandlerRegistration.class);
        when(registry.addResourceHandler(any(String[].class))).thenReturn(registration);
        when(registration.addResourceLocations(any(String[].class))).thenReturn(registration);

        config.addResourceHandlers(registry);

        verify(registry).addResourceHandler("/**");
        verify(registration, atLeastOnce()).addResourceLocations(any(String[].class));
    }

    @Test
    void getAuthorizationInterceptorShouldProduceNewBean() {
        AuthorizationInterceptor interceptor = config.getAuthorizationInterceptor();

        assertThat(interceptor).isNotNull();
    }
}


