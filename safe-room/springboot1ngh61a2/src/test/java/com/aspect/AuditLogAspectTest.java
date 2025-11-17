package com.aspect;

import com.annotation.AuditLog;
import com.entity.OperationLogEntity;
import com.service.OperationLogService;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.reflect.MethodSignature;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.lang.reflect.Method;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditLogAspectTest {

    @Mock
    private OperationLogService operationLogService;

    @Mock
    private JoinPoint joinPoint;

    @Mock
    private MethodSignature methodSignature;

    @InjectMocks
    private AuditLogAspect auditLogAspect;

    private TestController testController;
    private Method auditMethod;
    private Method nonAuditMethod;

    @BeforeEach
    void setUp() throws Exception {
        testController = new TestController();
        auditMethod = TestController.class.getMethod("auditedMethod", String.class);
        nonAuditMethod = TestController.class.getMethod("nonAuditedMethod", String.class);
    }

    @Test
    void shouldLogOperationWhenAuditLogAnnotationPresent() throws Exception {
        // 设置RequestContext
        MockHttpServletRequest request = new MockHttpServletRequest();
        HttpSession session = request.getSession(true);
        session.setAttribute("userId", 1L);
        session.setAttribute("username", "testuser");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        // 设置JoinPoint
        lenient().when(joinPoint.getSignature()).thenReturn(methodSignature);
        lenient().when(methodSignature.getMethod()).thenReturn(auditMethod);
        lenient().when(joinPoint.getTarget()).thenReturn(testController);
        lenient().when(joinPoint.getArgs()).thenReturn(new Object[]{"test"});

        // 执行切面方法
        auditLogAspect.doAfterReturning(joinPoint, "result");

        // 验证日志被记录
        verify(operationLogService, times(1)).logOperation(
                eq(1L),
                eq("testuser"),
                anyString(),
                anyString(),
                anyString(),
                anyString(),
                anyString()
        );
    }

    @Test
    void shouldUseDefaultValuesWhenAnnotationValuesNotSpecified() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        HttpSession session = request.getSession(true);
        session.setAttribute("userId", 2L);
        session.setAttribute("username", "defaultuser");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        lenient().when(joinPoint.getSignature()).thenReturn(methodSignature);
        lenient().when(methodSignature.getMethod()).thenReturn(auditMethod);
        lenient().when(joinPoint.getTarget()).thenReturn(testController);
        lenient().when(joinPoint.getArgs()).thenReturn(new Object[]{"test"});

        auditLogAspect.doAfterReturning(joinPoint, "result");

        verify(operationLogService).logOperation(
                eq(2L),
                eq("defaultuser"),
                anyString(), // tableName - 使用默认值（类名去掉Controller）
                anyString(), // operationType - 使用默认值（方法名）
                anyString(), // content - 使用默认值
                anyString(), // ip
                anyString()  // userAgent
        );
    }

    @Test
    void shouldExtractUserInfoFromRequestParameter() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        HttpSession session = request.getSession(true);
        // Session中没有用户信息
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        lenient().when(joinPoint.getSignature()).thenReturn(methodSignature);
        lenient().when(methodSignature.getMethod()).thenReturn(auditMethod);
        lenient().when(joinPoint.getTarget()).thenReturn(testController);
        // 参数中包含HttpServletRequest
        lenient().when(joinPoint.getArgs()).thenReturn(new Object[]{request});

        // 在request的session中设置用户信息
        session.setAttribute("userId", 3L);
        session.setAttribute("username", "paramuser");

        auditLogAspect.doAfterReturning(joinPoint, "result");

        verify(operationLogService).logOperation(
                eq(3L),
                eq("paramuser"),
                anyString(),
                anyString(),
                anyString(),
                anyString(),
                anyString()
        );
    }

    @Test
    void shouldHandleNullRequestAttributes() throws Exception {
        RequestContextHolder.resetRequestAttributes();

        lenient().when(joinPoint.getSignature()).thenReturn(methodSignature);
        lenient().when(methodSignature.getMethod()).thenReturn(auditMethod);
        lenient().when(joinPoint.getTarget()).thenReturn(testController);
        lenient().when(joinPoint.getArgs()).thenReturn(new Object[]{"test"});

        // 不应该抛出异常
        auditLogAspect.doAfterReturning(joinPoint, "result");

        // 由于没有RequestAttributes，不应该记录日志
        verify(operationLogService, never()).logOperation(
                anyLong(),
                anyString(),
                anyString(),
                anyString(),
                anyString(),
                anyString(),
                anyString()
        );
    }

    @Test
    void shouldHandleNullUserId() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        HttpSession session = request.getSession(true);
        // 不设置userId和username（根据实现，如果userId为null，username也会被设置为null）
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        lenient().when(joinPoint.getSignature()).thenReturn(methodSignature);
        lenient().when(methodSignature.getMethod()).thenReturn(auditMethod);
        lenient().when(joinPoint.getTarget()).thenReturn(testController);
        lenient().when(joinPoint.getArgs()).thenReturn(new Object[]{"test"});

        auditLogAspect.doAfterReturning(joinPoint, "result");

        // 即使userId为null，也应该尝试记录日志
        verify(operationLogService).logOperation(
                isNull(),
                isNull(),
                anyString(),
                anyString(),
                anyString(),
                anyString(),
                anyString()
        );
    }

    @Test
    void shouldHandleExceptionGracefully() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        when(joinPoint.getSignature()).thenThrow(new RuntimeException("Test exception"));

        // 不应该抛出异常，应该优雅处理
        auditLogAspect.doAfterReturning(joinPoint, "result");

        // 由于异常，不应该记录日志
        verify(operationLogService, never()).logOperation(
                anyLong(),
                anyString(),
                anyString(),
                anyString(),
                anyString(),
                anyString(),
                anyString()
        );
    }

    @Test
    void shouldHandleNullAnnotation() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        lenient().when(joinPoint.getSignature()).thenReturn(methodSignature);
        lenient().when(methodSignature.getMethod()).thenReturn(nonAuditMethod);
        lenient().when(joinPoint.getTarget()).thenReturn(testController);
        lenient().when(joinPoint.getArgs()).thenReturn(new Object[]{"test"});

        auditLogAspect.doAfterReturning(joinPoint, "result");

        // 没有@AuditLog注解，不应该记录日志
        verify(operationLogService, never()).logOperation(
                anyLong(),
                anyString(),
                anyString(),
                anyString(),
                anyString(),
                anyString(),
                anyString()
        );
    }

    @Test
    void shouldUseAnnotationValuesWhenSpecified() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        HttpSession session = request.getSession(true);
        session.setAttribute("userId", 4L);
        session.setAttribute("username", "annotationuser");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        Method customAuditMethod = TestController.class.getMethod("customAuditedMethod", String.class);

        lenient().when(joinPoint.getSignature()).thenReturn(methodSignature);
        lenient().when(methodSignature.getMethod()).thenReturn(customAuditMethod);
        lenient().when(joinPoint.getTarget()).thenReturn(testController);
        lenient().when(joinPoint.getArgs()).thenReturn(new Object[]{"test"});

        auditLogAspect.doAfterReturning(joinPoint, "result");

        verify(operationLogService).logOperation(
                eq(4L),
                eq("annotationuser"),
                eq("custom_table"), // 使用注解指定的tableName
                eq("CUSTOM_OPERATION"), // 使用注解指定的operationType
                eq("自定义操作内容"), // 使用注解指定的content
                anyString(),
                anyString()
        );
    }

    static class TestController {
        @AuditLog
        public String auditedMethod(String param) {
            return "result";
        }

        public String nonAuditedMethod(String param) {
            return "result";
        }

        @AuditLog(
                tableName = "custom_table",
                operationType = "CUSTOM_OPERATION",
                content = "自定义操作内容"
        )
        public String customAuditedMethod(String param) {
            return "result";
        }
    }
}

