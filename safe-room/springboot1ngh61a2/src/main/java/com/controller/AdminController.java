package com.controller;

import com.annotation.IgnoreAuth;
// import com.interceptor.RateLimitInterceptor; // 已禁用限流功能
import com.utils.R;
import com.utils.RequestUtils;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 系统管理控制器
 * 提供系统管理相关的接口
 */
@RestController
@RequestMapping("/admin")
public class AdminController {
    
    // @Autowired(required = false)
    // private RateLimitInterceptor rateLimitInterceptor; // 已禁用限流功能
    
    /**
     * 紧急清除限流记录接口（已禁用）
     * 限流功能已被移除，此接口不再需要
     */
    // @IgnoreAuth
    // @RequestMapping("/clearRateLimit")
    // public R clearRateLimit(
    //         @RequestParam(required = false) String ip,
    //         @RequestParam(required = false) String key,
    //         HttpServletRequest request) {
    //     return R.error("限流功能已禁用");
    // }
    
    /**
     * 清除所有限流记录接口（已禁用）
     * 限流功能已被移除，此接口不再需要
     */
    // @IgnoreAuth
    // @RequestMapping("/clearAllRateLimits")
    // public R clearAllRateLimits(@RequestParam(required = false) String key) {
    //     return R.error("限流功能已禁用");
    // }
}

