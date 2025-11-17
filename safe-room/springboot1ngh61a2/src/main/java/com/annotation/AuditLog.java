package com.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 审计日志注解
 * 用于标记需要记录审计日志的方法
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface AuditLog {
    
    /**
     * 操作类型
     */
    String operationType() default "";
    
    /**
     * 表名/模块名
     */
    String tableName() default "";
    
    /**
     * 操作内容描述
     */
    String content() default "";
}

