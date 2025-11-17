package com.aspect;

import com.annotation.AuditLog;
import com.service.OperationLogService;
import com.utils.RequestUtils;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.commons.lang3.StringUtils;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;

/**
 * 审计日志AOP切面
 * 自动记录标记了@AuditLog的方法的操作日志
 */
@Aspect
@Component
public class AuditLogAspect {
    
    @Autowired
    private OperationLogService operationLogService;
    
    @Pointcut("@annotation(com.annotation.AuditLog)")
    public void auditLogPointcut() {
    }
    
    @AfterReturning(pointcut = "auditLogPointcut()", returning = "result")
    public void doAfterReturning(JoinPoint joinPoint, Object result) {
        try {
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Method method = signature.getMethod();
            AuditLog auditLog = method.getAnnotation(AuditLog.class);
            
            if (auditLog == null) {
                return;
            }
            
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes == null) {
                return;
            }
            
            HttpServletRequest request = attributes.getRequest();
            String ip = RequestUtils.getClientIp(request);
            String userAgent = RequestUtils.getUserAgent(request);
            // Ensure userAgent is not null for consistency
            if (userAgent == null) {
                userAgent = "";
            }
            
            // 从Session中获取用户信息
            Long userId = (Long) request.getSession().getAttribute("userId");
            String username = (String) request.getSession().getAttribute("username");
            
            // 如果Session中没有用户信息，尝试从方法参数中获取
            if (userId == null || username == null) {
                Object[] args = joinPoint.getArgs();
                // 这里可以根据实际情况从参数中提取用户信息
                // 例如：如果第一个参数是HttpServletRequest，可以从Session中获取
                for (Object arg : args) {
                    if (arg instanceof HttpServletRequest) {
                        HttpServletRequest req = (HttpServletRequest) arg;
                        Long paramUserId = (Long) req.getSession().getAttribute("userId");
                        String paramUsername = (String) req.getSession().getAttribute("username");
                        if (paramUserId != null) {
                            userId = paramUserId;
                        }
                        if (paramUsername != null) {
                            username = paramUsername;
                        }
                        break;
                    }
                }
            }
            
            // 如果userId为null，username也应该为null（保持一致性）
            if (userId == null) {
                username = null;
            }
            
            String operationType = auditLog.operationType();
            String tableName = auditLog.tableName();
            String content = auditLog.content();
            
            // 如果注解中没有指定，使用默认值
            if (StringUtils.isBlank(operationType)) {
                operationType = method.getName();
            }
            if (StringUtils.isBlank(tableName)) {
                tableName = joinPoint.getTarget().getClass().getSimpleName().replace("Controller", "");
            }
            if (StringUtils.isBlank(content)) {
                content = "执行操作: " + method.getName();
            }
            
            // 记录日志
            operationLogService.logOperation(userId, username, tableName, operationType, content, ip, userAgent);
        } catch (Exception e) {
            // 记录日志失败不应影响业务逻辑
            // 可以记录到日志系统
        }
    }
}

