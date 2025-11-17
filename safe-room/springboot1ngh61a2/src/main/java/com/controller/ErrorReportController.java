package com.controller;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.annotation.IgnoreAuth;
import com.utils.R;

/**
 * 前端错误报告接口
 * 接收前端发送的错误信息并记录到日志
 */
@RestController
@RequestMapping("/api/error")
public class ErrorReportController {

    private static final Logger logger = LoggerFactory.getLogger(ErrorReportController.class);
    private static final Logger errorLogger = LoggerFactory.getLogger("errorReport");

    /**
     * 接收单个错误报告
     * @param errorInfo 错误信息
     * @return 响应结果
     */
    @IgnoreAuth
    @RequestMapping("/report")
    public R reportError(@RequestBody Map<String, Object> errorInfo) {
        try {
            // 记录错误到日志文件
            String errorType = (String) errorInfo.getOrDefault("type", "unknown");
            String message = (String) errorInfo.getOrDefault("message", "No message");
            String url = (String) errorInfo.getOrDefault("url", "Unknown URL");
            String timestamp = (String) errorInfo.getOrDefault("timestamp", "");
            String userAgent = (String) errorInfo.getOrDefault("userAgent", "");
            String stack = (String) errorInfo.getOrDefault("stack", "");
            
            // 使用专门的错误日志记录器
            errorLogger.error("=== Frontend Error Report ===");
            errorLogger.error("Type: {}", errorType);
            errorLogger.error("Message: {}", message);
            errorLogger.error("URL: {}", url);
            errorLogger.error("Timestamp: {}", timestamp);
            errorLogger.error("UserAgent: {}", userAgent);
            if (stack != null && !stack.isEmpty()) {
                errorLogger.error("Stack: {}", stack);
            }
            errorLogger.error("Full Error Info: {}", errorInfo);
            errorLogger.error("=== End Error Report ===");
            
            // 在开发环境中也输出到控制台
            if (logger.isDebugEnabled()) {
                logger.debug("Received error report: type={}, message={}, url={}", 
                    errorType, message, url);
            }
            
            return R.ok("Error report received");
        } catch (Exception e) {
            logger.error("Error processing error report", e);
            return R.error("Failed to process error report");
        }
    }

    /**
     * 批量接收错误报告
     * @param errorList 错误信息列表
     * @return 响应结果
     */
    @IgnoreAuth
    @RequestMapping("/report/batch")
    public R reportErrorsBatch(@RequestBody List<Map<String, Object>> errorList) {
        try {
            int count = 0;
            for (Map<String, Object> errorInfo : errorList) {
                try {
                    String errorType = (String) errorInfo.getOrDefault("type", "unknown");
                    String message = (String) errorInfo.getOrDefault("message", "No message");
                    String url = (String) errorInfo.getOrDefault("url", "Unknown URL");
                    String timestamp = (String) errorInfo.getOrDefault("timestamp", "");
                    
                    errorLogger.error("=== Batch Error Report #{} ===", count + 1);
                    errorLogger.error("Type: {}, Message: {}, URL: {}, Timestamp: {}", 
                        errorType, message, url, timestamp);
                    errorLogger.error("Full Error Info: {}", errorInfo);
                    errorLogger.error("=== End Batch Error Report #{} ===", count + 1);
                    
                    count++;
                } catch (Exception e) {
                    logger.error("Error processing batch error report item", e);
                }
            }
            
            if (logger.isDebugEnabled()) {
                logger.debug("Received batch error report: {} errors", count);
            }
            
            return R.ok().put("processed", count);
        } catch (Exception e) {
            logger.error("Error processing batch error report", e);
            return R.error("Failed to process batch error report");
        }
    }
}

