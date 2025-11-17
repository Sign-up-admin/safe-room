package com.config;

import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class WebMvcConfigTest {

    private final WebMvcConfig config = new WebMvcConfig();

    @Test
    void addResourceHandlersShouldConfigureAllResourceMappings() {
        ResourceHandlerRegistry registry = mock(ResourceHandlerRegistry.class);
        ResourceHandlerRegistration registration = mock(ResourceHandlerRegistration.class);
        when(registry.addResourceHandler(any(String[].class))).thenReturn(registration);
        when(registration.addResourceLocations(any(String[].class))).thenReturn(registration);

        config.addResourceHandlers(registry);

        verify(registry).addResourceHandler("/static/**");
        verify(registry).addResourceHandler("/admin/**");
        verify(registry).addResourceHandler("/front/**");
        verify(registry).addResourceHandler("/admin");
        verify(registry).addResourceHandler("/");
    }
}


