package com.utils;

import com.annotation.TestData;
import com.service.*;
import com.baomidou.mybatisplus.extension.service.IService;
import com.entity.*;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * TestData注解处理器 - 自动生成和清理测试数据
 */
@Aspect
@Component
public class TestDataFactoryAspect {

    private static final Logger log = LoggerFactory.getLogger(TestDataFactoryAspect.class);

    // 注入所有需要的服务
    @Autowired(required = false) private UserService userService;
    @Autowired(required = false) private UsersService usersService;
    @Autowired(required = false) private YonghuService yonghuService;
    @Autowired(required = false) private JianshenjiaolianService jianshenjiaolianService;
    @Autowired(required = false) private JianshenkechengService jianshenkechengService;
    @Autowired(required = false) private HuiyuankaService huiyuankaService;
    @Autowired(required = false) private HuiyuankagoumaiService huiyuankagoumaiService;
    @Autowired(required = false) private HuiyuanxufeiService huiyuanxufeiService;
    @Autowired(required = false) private NewsService newsService;
    @Autowired(required = false) private NewstypeService newstypeService;
    @Autowired(required = false) private MessageService messageService;
    @Autowired(required = false) private StoreupService storeupService;
    @Autowired(required = false) private KechengyuyueService kechengyuyueService;
    @Autowired(required = false) private KechengleixingService kechengleixingService;
    @Autowired(required = false) private KechengtuikeService kechengtuikeService;
    @Autowired(required = false) private SijiaoyuyueService sijiaoyuyueService;
    @Autowired(required = false) private JianshenqicaiService jianshenqicaiService;
    @Autowired(required = false) private DaoqitixingService daoqitixingService;
    @Autowired(required = false) private DiscussjianshenkechengService discussjianshenkechengService;
    @Autowired(required = false) private AssetsService assetsService;
    @Autowired(required = false) private ChatService chatService;
    @Autowired(required = false) private ConfigService configService;
    @Autowired(required = false) private LegalTermsService legalTermsService;
    @Autowired(required = false) private OperationLogService operationLogService;
    @Autowired(required = false) private MembershipCardService membershipCardService;

    @Pointcut("@annotation(com.annotation.TestData)")
    public void testDataAnnotated() {}

    @Around("testDataAnnotated()")
    public Object handleTestData(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        TestData testData = method.getAnnotation(TestData.class);

        if (testData == null) {
            // 检查类级别注解
            testData = method.getDeclaringClass().getAnnotation(TestData.class);
        }

        if (testData == null) {
            return joinPoint.proceed();
        }

        String testClassName = method.getDeclaringClass().getSimpleName();
        String testMethodName = method.getName();

        try {
            // 测试前清理
            if (testData.cleanupBefore()) {
                cleanupExistingTestData(testClassName, testMethodName);
            }

            // 创建测试数据
            List<Object> createdEntities = createTestEntities(testData.entities(), testClassName, testMethodName);

            // 执行测试方法
            Object result = joinPoint.proceed();

            return result;

        } finally {
            // 测试后清理
            if (testData.cleanupAfter()) {
                cleanupCreatedTestData(testClassName, testMethodName);
            }
        }
    }

    /**
     * 清理现有的测试数据
     */
    private void cleanupExistingTestData(String testClassName, String testMethodName) {
        log.debug("Cleaning up existing test data for {}.{}", testClassName, testMethodName);

        // 这里可以实现更智能的清理逻辑
        // 目前使用通用的清理方法
        TestDataCleanup.cleanupAllTestData(buildServiceMap());
    }

    /**
     * 创建测试实体
     */
    private List<Object> createTestEntities(TestData.Entity[] entities, String testClassName, String testMethodName) {
        List<Object> createdEntities = new ArrayList<>();

        for (TestData.Entity entityConfig : entities) {
            Class<?> entityType = entityConfig.type();
            int count = entityConfig.count();

            for (int i = 0; i < count; i++) {
                Object entity = createEntity(entityType, testClassName + "." + testMethodName);
                if (entity != null) {
                    createdEntities.add(entity);
                    saveEntity(entity);
                }
            }
        }

        log.debug("Created {} test entities for {}.{}", createdEntities.size(), testClassName, testMethodName);
        return createdEntities;
    }

    /**
     * 创建单个实体
     */
    private Object createEntity(Class<?> entityType, String testIdentifier) {
        if (entityType == UserEntity.class) {
            return TestDataFactory.createTestUser(testIdentifier);
        } else if (entityType == UsersEntity.class) {
            return TestDataFactory.user()
                    .testClass(testIdentifier)
                    .username(TestUtils.generateUniqueTestUsername(testIdentifier, "admin"))
                    .password("admin")
                    .role("管理员")
                    .build();
        } else if (entityType == YonghuEntity.class) {
            return TestDataFactory.user()
                    .testClass(testIdentifier)
                    .username(TestUtils.generateUniqueTestUsername(testIdentifier, "yonghu"))
                    .password("123456")
                    .role("用户")
                    .build();
        } else if (entityType == HuiyuankaEntity.class) {
            return TestDataFactory.createTestMembershipCard(testIdentifier);
        } else if (entityType == JianshenjiaolianEntity.class) {
            return TestDataFactory.createTestCoach(testIdentifier);
        } else if (entityType == JianshenkechengEntity.class) {
            return TestDataFactory.createTestCourse(testIdentifier);
        } else if (entityType == NewsEntity.class) {
            return TestDataFactory.createTestNews(testIdentifier);
        } else if (entityType == NewstypeEntity.class) {
            return TestDataFactory.news()
                    .testClass(testIdentifier)
                    .title(TestUtils.generateUniqueTestTitle(testIdentifier, "新闻类型"))
                    .build();
        } else {
            log.warn("Unsupported entity type for @TestData: {}", entityType.getSimpleName());
            return null;
        }
    }

    /**
     * 保存实体到数据库
     */
    private void saveEntity(Object entity) {
        try {
            if (entity instanceof UserEntity && userService != null) {
                userService.save((UserEntity) entity);
            } else if (entity instanceof UsersEntity && usersService != null) {
                usersService.save((UsersEntity) entity);
            } else if (entity instanceof YonghuEntity && yonghuService != null) {
                yonghuService.save((YonghuEntity) entity);
            } else if (entity instanceof HuiyuankaEntity && huiyuankaService != null) {
                huiyuankaService.save((HuiyuankaEntity) entity);
            } else if (entity instanceof JianshenjiaolianEntity && jianshenjiaolianService != null) {
                jianshenjiaolianService.save((JianshenjiaolianEntity) entity);
            } else if (entity instanceof JianshenkechengEntity && jianshenkechengService != null) {
                jianshenkechengService.save((JianshenkechengEntity) entity);
            } else if (entity instanceof NewsEntity && newsService != null) {
                newsService.save((NewsEntity) entity);
            } else if (entity instanceof NewstypeEntity && newstypeService != null) {
                newstypeService.save((NewstypeEntity) entity);
            } else {
                log.warn("No service available to save entity: {}", entity.getClass().getSimpleName());
            }
        } catch (Exception e) {
            log.error("Failed to save test entity: {}", entity.getClass().getSimpleName(), e);
        }
    }

    /**
     * 清理创建的测试数据
     */
    private void cleanupCreatedTestData(String testClassName, String testMethodName) {
        String testIdentifier = testClassName + "." + testMethodName;
        log.debug("Cleaning up created test data for {}", testIdentifier);

        TestDataFactory.cleanupAllCreatedEntities(testIdentifier);
    }

    /**
     * 构建服务映射表
     */
    private Map<String, IService<?>> buildServiceMap() {
        Map<String, IService<?>> serviceMap = new HashMap<>();

        // 添加所有可用的服务
        if (userService != null) serviceMap.put("userService", userService);
        if (usersService != null) serviceMap.put("usersService", usersService);
        if (yonghuService != null) serviceMap.put("yonghuService", yonghuService);
        if (jianshenjiaolianService != null) serviceMap.put("jianshenjiaolianService", jianshenjiaolianService);
        if (jianshenkechengService != null) serviceMap.put("jianshenkechengService", jianshenkechengService);
        if (huiyuankaService != null) serviceMap.put("huiyuankaService", huiyuankaService);
        if (huiyuankagoumaiService != null) serviceMap.put("huiyuankagoumaiService", huiyuankagoumaiService);
        if (huiyuanxufeiService != null) serviceMap.put("huiyuanxufeiService", huiyuanxufeiService);
        if (newsService != null) serviceMap.put("newsService", newsService);
        if (newstypeService != null) serviceMap.put("newstypeService", newstypeService);
        if (messageService != null) serviceMap.put("messageService", messageService);
        if (storeupService != null) serviceMap.put("storeupService", storeupService);
        if (kechengyuyueService != null) serviceMap.put("kechengyuyueService", kechengyuyueService);
        if (kechengleixingService != null) serviceMap.put("kechengleixingService", kechengleixingService);
        if (kechengtuikeService != null) serviceMap.put("kechengtuikeService", kechengtuikeService);
        if (sijiaoyuyueService != null) serviceMap.put("sijiaoyuyueService", sijiaoyuyueService);
        if (jianshenqicaiService != null) serviceMap.put("jianshenqicaiService", jianshenqicaiService);
        if (daoqitixingService != null) serviceMap.put("daoqitixingService", daoqitixingService);
        if (discussjianshenkechengService != null) serviceMap.put("discussjianshenkechengService", discussjianshenkechengService);
        if (assetsService != null) serviceMap.put("assetsService", assetsService);
        if (chatService != null) serviceMap.put("chatService", chatService);
        if (configService != null) serviceMap.put("configService", configService);
        if (legalTermsService != null) serviceMap.put("legalTermsService", legalTermsService);
        if (operationLogService != null) serviceMap.put("operationLogService", operationLogService);
        if (membershipCardService != null) serviceMap.put("membershipCardService", membershipCardService);

        return serviceMap;
    }
}
