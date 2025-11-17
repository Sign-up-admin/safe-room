package com.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.async.AsyncRequestNotUsableException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import com.entity.EIException;
import com.utils.R;
import com.utils.DataMaskingUtil;

import jakarta.servlet.http.HttpServletResponse;
import org.apache.catalina.connector.ClientAbortException;

import java.io.IOException;
import java.sql.SQLException;

/**
 * Global Exception Handler
 * Handles all exceptions thrown by controllers
 * 改进：避免泄露敏感信息，统一错误码格式
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Handle custom EIException
     */
    @ExceptionHandler(EIException.class)
    public R handleEIException(EIException e) {
        // 记录详细日志（包含堆栈）
        logger.error("EIException: code={}, msg={}", e.getCode(), e.getMsg(), e);
        // 对外返回标准错误码和消息
        return R.error(e.getCode(), e.getMsg());
    }

    /**
     * Handle SQL exceptions
     */
    @ExceptionHandler({SQLException.class, DataAccessException.class})
    public R handleSQLException(Exception e) {
        // 记录详细日志
        logger.error("Database exception: {}", e.getMessage(), e);
        // 返回包含错误信息的友好消息
        return R.error(500, "数据库操作失败，请稍后重试: " + e.getMessage());
    }

    /**
     * Handle IllegalArgumentException
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public R handleIllegalArgumentException(IllegalArgumentException e) {
        // 记录详细日志
        logger.error("Illegal argument: {}", e.getMessage(), e);
        // 返回包含错误信息的消息
        return R.error(400, "Invalid parameter: " + e.getMessage());
    }

    /**
     * Handle NullPointerException
     */
    @ExceptionHandler(NullPointerException.class)
    public R handleNullPointerException(NullPointerException e) {
        // 记录详细日志
        logger.error("Null pointer exception", e);
        // 对外返回通用错误消息
        return R.error(500, "系统错误，请稍后重试");
    }

    /**
     * Handle NoResourceFoundException (404 errors for static resources)
     * 将静态资源404错误降级为DEBUG级别，避免日志污染
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public R handleNoResourceFoundException(NoResourceFoundException e) {
        // 只记录DEBUG级别日志，因为404是正常的HTTP状态
        logger.debug("Static resource not found: {}", e.getResourcePath());
        // 返回404错误
        return R.error(404, "资源未找到: " + e.getResourcePath());
    }

    /**
     * Handle client abort exceptions (client disconnected during request)
     * 处理客户端断开连接的异常，这是正常情况，不需要返回错误响应
     */
    @ExceptionHandler({AsyncRequestNotUsableException.class, ClientAbortException.class})
    public ResponseEntity<Void> handleClientAbortException(Exception e, HttpServletResponse response) {
        // 检查响应是否已提交
        if (response.isCommitted()) {
            // 响应已提交，无法返回新的响应，只记录日志
            logger.debug("Client disconnected during request (response already committed): {}", e.getMessage());
            // 返回空的ResponseEntity，Spring会忽略，因为响应已提交
            return ResponseEntity.status(HttpStatus.OK).build();
        }
        
        // 检查是否是客户端断开连接
        String message = e.getMessage();
        if (message != null && (
            message.contains("Connection reset by peer") ||
            message.contains("你的主机中的软件中止了一个已建立的连接") ||
            message.contains("Broken pipe") ||
            e instanceof ClientAbortException ||
            e instanceof AsyncRequestNotUsableException
        )) {
            // 客户端断开连接是正常情况，只记录DEBUG级别日志
            logger.debug("Client disconnected during request: {}", message);
            // 返回204 No Content，表示请求已处理但无内容返回
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }
        
        // 其他情况，记录WARN级别日志
        logger.warn("Request aborted: {}", message);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }

    /**
     * Handle IOException that might be client disconnection
     */
    @ExceptionHandler(IOException.class)
    public ResponseEntity<Void> handleIOException(IOException e, HttpServletResponse response) {
        String message = e.getMessage();
        if (message != null && (
            message.contains("Connection reset by peer") ||
            message.contains("你的主机中的软件中止了一个已建立的连接") ||
            message.contains("Broken pipe")
        )) {
            // 客户端断开连接，只记录DEBUG级别日志
            if (response.isCommitted()) {
                logger.debug("Client disconnected (response committed): {}", message);
                // 响应已提交，返回OK状态（实际上不会发送，因为响应已提交）
                return ResponseEntity.status(HttpStatus.OK).build();
            } else {
                logger.debug("Client disconnected: {}", message);
                // 返回204 No Content
                return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
            }
        }
        
        // 其他IOException，记录错误并返回响应
        logger.error("IO exception: {}", message, e);
        if (!response.isCommitted()) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        // 响应已提交，返回OK状态（实际上不会发送）
        return ResponseEntity.status(HttpStatus.OK).build();
    }

    /**
     * Handle all other exceptions
     */
    @ExceptionHandler(Exception.class)
    public R handleException(Exception e, HttpServletResponse response) {
        // 特殊处理 NoResourceFoundException，即使它可能不会被上面的 @ExceptionHandler 捕获
        if (e instanceof NoResourceFoundException) {
            NoResourceFoundException nrfException = (NoResourceFoundException) e;
            // 只记录DEBUG级别日志，因为404是正常的HTTP状态
            logger.debug("Static resource not found: {}", nrfException.getResourcePath());
            // 返回404错误
            return R.error(404, "资源未找到: " + nrfException.getResourcePath());
        }
        
        // 检查是否是客户端断开连接的异常（可能被包装在其他异常中）
        Throwable cause = e.getCause();
        while (cause != null) {
            if (cause instanceof ClientAbortException || 
                cause instanceof AsyncRequestNotUsableException ||
                (cause instanceof IOException && cause.getMessage() != null && 
                 (cause.getMessage().contains("Connection reset by peer") ||
                  cause.getMessage().contains("你的主机中的软件中止了一个已建立的连接")))) {
                // 客户端断开连接，只记录DEBUG级别日志
                logger.debug("Client disconnected (wrapped exception): {}", cause.getMessage());
                // 如果响应已提交，无法返回JSON响应，只记录日志
                if (response.isCommitted()) {
                    // 响应已提交，可能是视频流等二进制响应，无法返回JSON
                    // 返回一个占位符R对象，但实际上不会发送（响应已提交）
                    return R.error(500, "Client disconnected");
                }
                // 响应未提交，可以返回JSON错误响应
                return R.error(500, "Client disconnected");
            }
            cause = cause.getCause();
        }
        
        // 检查响应是否已提交（可能是视频流等二进制响应）
        if (response.isCommitted()) {
            // 响应已提交，可能是二进制响应（如视频），无法返回JSON
            // 只记录日志，返回一个占位符（实际上不会发送）
            logger.warn("Exception occurred but response already committed (likely binary response): {}", e.getMessage());
            return R.error(500, "Response already committed");
        }
        
        // 记录详细日志（包含堆栈）
        logger.error("Unexpected exception: {}", e.getMessage(), e);
        // 返回包含错误信息的消息
        return R.error(500, "An unexpected error occurred: " + e.getMessage());
    }
}

