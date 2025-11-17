package com.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Configure static resource mapping
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");
        
        // Configure upload directory mapping (for uploaded files)
        registry.addResourceHandler("/upload/**")
                .addResourceLocations("classpath:/static/upload/",
                                      "file:src/main/resources/static/upload/");
        
        // Configure admin-side front-end resource mapping
        registry.addResourceHandler("/admin/**")
                .addResourceLocations("classpath:/admin/admin/public/",
                                      "file:src/main/resources/admin/admin/public/");
        
        // Configure front-end resource mapping
        registry.addResourceHandler("/front/**")
                .addResourceLocations("classpath:/front/front/dist/",
                                      "file:src/main/resources/front/front/dist/");
        
        // Configure root path to access admin login page
        registry.addResourceHandler("/admin")
                .addResourceLocations("classpath:/admin/admin/public/index.html",
                                      "file:src/main/resources/admin/admin/public/index.html");
        
        // Configure root path to access front-end login page
        registry.addResourceHandler("/")
                .addResourceLocations("classpath:/front/front/dist/index.html",
                                      "file:src/main/resources/front/front/dist/index.html");
    }
}
