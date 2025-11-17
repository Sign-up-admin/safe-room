package com.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport;

import com.interceptor.AuthorizationInterceptor;
import com.interceptor.MetricsInterceptor;
// import com.interceptor.RateLimitInterceptor; // 已禁用限流功能
import org.springframework.beans.factory.annotation.Autowired;

@Configuration
public class InterceptorConfig extends WebMvcConfigurationSupport{
	
	@Bean
    public AuthorizationInterceptor getAuthorizationInterceptor() {
        return new AuthorizationInterceptor();
    }

	@Bean
    public MetricsInterceptor getMetricsInterceptor() {
        return new MetricsInterceptor();
    }
	
	// @Autowired(required = false)
	// private RateLimitInterceptor rateLimitInterceptor; // 已禁用限流功能
	
	@Autowired(required = false)
	private Environment environment;
	
	@Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 速率限制拦截器（已禁用）
        // if (rateLimitInterceptor != null && !isTestProfile()) {
        //     registry.addInterceptor(rateLimitInterceptor)
        //             .addPathPatterns("/**")
        //             .excludePathPatterns("/static/**");
        // }

        // 认证拦截器
        registry.addInterceptor(getAuthorizationInterceptor())
                .addPathPatterns("/**")
                .excludePathPatterns("/static/**");

        // 指标收集拦截器
        registry.addInterceptor(getMetricsInterceptor())
                .addPathPatterns("/**")
                .excludePathPatterns("/static/**", "/actuator/**", "/favicon.ico");

        super.addInterceptors(registry);
	}
	
	private boolean isTestProfile() {
        if (environment == null) {
            return false;
        }
        String[] activeProfiles = environment.getActiveProfiles();
        if (activeProfiles == null || activeProfiles.length == 0) {
            return false;
        }
        for (String profile : activeProfiles) {
            if ("test".equals(profile)) {
                return true;
            }
        }
        return false;
    }
	
	/**
	 * After configuring WebMvcConfigurationSupport in springboot 2.0, the default configuration will be overwritten. To access static resources, you need to override the addResourceHandlers method
	 */
	@Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
		registry.addResourceHandler("/**")
        .addResourceLocations("classpath:/resources/")
        .addResourceLocations("classpath:/static/")
        .addResourceLocations("classpath:/admin/")
        .addResourceLocations("classpath:/front/")
        .addResourceLocations("classpath:/public/");
		super.addResourceHandlers(registry);
    }
}
