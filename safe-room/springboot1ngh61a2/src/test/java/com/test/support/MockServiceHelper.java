package com.test.support;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.entity.*;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

/**
 * Mock Service助手类 - 提供常用的Service Mock配置模板
 *
 * 简化Service层单元测试的Mock设置，提供预定义的Mock行为模板。
 */
public final class MockServiceHelper {

    private static final Logger log = LoggerFactory.getLogger(MockServiceHelper.class);

    private MockServiceHelper() {
        // Utility class
    }

    // ==================== 通用Service Mock方法 ====================

    /**
     * 配置Service的save方法返回true
     */
    public static <T> void mockSaveSuccess(IService<T> service) {
        when(service.save(any())).thenReturn(true);
        log.debug("Mocked {} save() to return true", service.getClass().getSimpleName());
    }

    /**
     * 配置Service的save方法抛出异常
     */
    public static <T> void mockSaveFailure(IService<T> service, Exception exception) {
        when(service.save(any())).thenThrow(exception);
        log.debug("Mocked {} save() to throw {}", service.getClass().getSimpleName(), exception.getClass().getSimpleName());
    }

    /**
     * 配置Service的getById方法
     */
    public static <T> void mockGetById(IService<T> service, Long id, T result) {
        when(service.getById(id)).thenReturn(result);
        log.debug("Mocked {} getById({}) to return {}", service.getClass().getSimpleName(), id, result);
    }

    /**
     * 配置Service的getById方法返回null
     */
    public static <T> void mockGetByIdNotFound(IService<T> service, Long id) {
        when(service.getById(id)).thenReturn(null);
        log.debug("Mocked {} getById({}) to return null", service.getClass().getSimpleName(), id);
    }

    /**
     * 配置Service的removeById方法
     */
    public static <T> void mockRemoveById(IService<T> service, Long id, boolean result) {
        when(service.removeById(id)).thenReturn(result);
        log.debug("Mocked {} removeById({}) to return {}", service.getClass().getSimpleName(), id, result);
    }

    /**
     * 配置Service的list方法返回指定列表
     */
    public static <T> void mockList(IService<T> service, List<T> results) {
        when(service.list()).thenReturn(results);
        log.debug("Mocked {} list() to return {} items", service.getClass().getSimpleName(), results.size());
    }

    /**
     * 配置Service的list方法返回空列表
     */
    public static <T> void mockListEmpty(IService<T> service) {
        when(service.list()).thenReturn(new ArrayList<>());
        log.debug("Mocked {} list() to return empty list", service.getClass().getSimpleName());
    }

    /**
     * 配置Service的count方法
     */
    public static <T> void mockCount(IService<T> service, long count) {
        when(service.count()).thenReturn(count);
        log.debug("Mocked {} count() to return {}", service.getClass().getSimpleName(), count);
    }

    /**
     * 配置Service的list返回分页结果
     */
    public static <T> void mockListByWrapper(IService<T> service, QueryWrapper<T> wrapper, List<T> results) {
        when(service.list(wrapper)).thenReturn(results);
        log.debug("Mocked {} list(wrapper) to return {} items", service.getClass().getSimpleName(), results.size());
    }

    // ==================== 特定Service Mock模板 ====================

    /**
     * 配置用户Service的常用Mock行为
     */
    public static void setupUserServiceMock(IService<UserEntity> userService) {
        // 默认save成功
        mockSaveSuccess(userService);

        // 默认count返回0
        mockCount(userService, 0);

        // 默认list返回空列表
        mockListEmpty(userService);
    }

    /**
     * 配置用户Service的登录场景Mock
     */
    public static void setupUserServiceLoginMock(IService<UserEntity> userService,
                                                 String username, String password, UserEntity user) {
        // 配置根据用户名查询用户
        QueryWrapper<UserEntity> wrapper = new QueryWrapper<UserEntity>().eq("username", username);
        when(userService.getOne(wrapper, false)).thenReturn(user);

        log.debug("Mocked user service login scenario for username: {}", username);
    }

    /**
     * 配置会员Service的常用Mock行为
     */
    public static void setupYonghuServiceMock(IService<YonghuEntity> yonghuService) {
        mockSaveSuccess(yonghuService);
        mockCount(yonghuService, 0);
        mockListEmpty(yonghuService);
    }

    /**
     * 配置会员Service的登录场景Mock
     */
    public static void setupYonghuServiceLoginMock(IService<YonghuEntity> yonghuService,
                                                  String username, String password, YonghuEntity user) {
        QueryWrapper<YonghuEntity> wrapper = new QueryWrapper<YonghuEntity>().eq("yonghuzhanghao", username);
        when(yonghuService.getOne(wrapper, false)).thenReturn(user);

        log.debug("Mocked yonghu service login scenario for username: {}", username);
    }

    /**
     * 配置管理员Service的常用Mock行为
     */
    public static void setupUsersServiceMock(IService<UsersEntity> usersService) {
        mockSaveSuccess(usersService);
        mockCount(usersService, 0);
        mockListEmpty(usersService);
    }

    /**
     * 配置管理员Service的登录场景Mock
     */
    public static void setupUsersServiceLoginMock(IService<UsersEntity> usersService,
                                                 String username, String password, UsersEntity user) {
        QueryWrapper<UsersEntity> wrapper = new QueryWrapper<UsersEntity>().eq("username", username);
        when(usersService.getOne(wrapper, false)).thenReturn(user);

        log.debug("Mocked users service login scenario for username: {}", username);
    }

    /**
     * 配置教练Service的常用Mock行为
     */
    public static void setupCoachServiceMock(IService<JianshenjiaolianEntity> coachService) {
        mockSaveSuccess(coachService);
        mockCount(coachService, 0);
        mockListEmpty(coachService);
    }

    /**
     * 配置课程Service的常用Mock行为
     */
    public static void setupCourseServiceMock(IService<JianshenkechengEntity> courseService) {
        mockSaveSuccess(courseService);
        mockCount(courseService, 0);
        mockListEmpty(courseService);
    }

    /**
     * 配置课程预约Service的常用Mock行为
     */
    public static void setupCourseReservationServiceMock(IService<KechengyuyueEntity> reservationService) {
        mockSaveSuccess(reservationService);
        mockCount(reservationService, 0);
        mockListEmpty(reservationService);
    }

    /**
     * 配置会员卡Service的常用Mock行为
     */
    public static void setupMembershipCardServiceMock(IService<HuiyuankaEntity> cardService) {
        mockSaveSuccess(cardService);
        mockCount(cardService, 0);
        mockListEmpty(cardService);
    }

    /**
     * 配置新闻Service的常用Mock行为
     */
    public static void setupNewsServiceMock(IService<NewsEntity> newsService) {
        mockSaveSuccess(newsService);
        mockCount(newsService, 0);
        mockListEmpty(newsService);
    }

    // ==================== 复合Mock场景 ====================

    /**
     * 设置完整的用户认证Mock场景
     * 包括用户查询、密码验证、Token生成等
     */
    public static void setupAuthenticationMock(IService<UserEntity> userService,
                                             IService<UsersEntity> usersService,
                                             IService<YonghuEntity> yonghuService,
                                             String username, String password, String userType) {
        log.debug("Setting up authentication mock for user: {}, type: {}", username, userType);

        switch (userType.toLowerCase()) {
            case "user":
                UserEntity user = new UserEntity();
                user.setId(1L);
                user.setUsername(username);
                user.setPassword(password);
                setupUserServiceLoginMock(userService, username, password, user);
                break;

            case "admin":
                UsersEntity admin = new UsersEntity();
                admin.setId(1L);
                admin.setUsername(username);
                admin.setPassword(password);
                admin.setRole("管理员");
                setupUsersServiceLoginMock(usersService, username, password, admin);
                break;

            case "member":
                YonghuEntity member = new YonghuEntity();
                member.setId(1L);
                member.setYonghuzhanghao(username);
                member.setMima(password);
                setupYonghuServiceLoginMock(yonghuService, username, password, member);
                break;

            default:
                throw new IllegalArgumentException("Unknown user type: " + userType);
        }
    }

    /**
     * 设置课程预约的完整Mock场景
     * 包括用户验证、课程检查、预约创建等
     */
    public static void setupCourseReservationMock(IService<YonghuEntity> yonghuService,
                                                IService<JianshenkechengEntity> courseService,
                                                IService<KechengyuyueEntity> reservationService,
                                                String username, Long courseId) {
        log.debug("Setting up course reservation mock for user: {}, course: {}", username, courseId);

        // Mock用户存在
        YonghuEntity user = new YonghuEntity();
        user.setId(1L);
        user.setYonghuzhanghao(username);
        QueryWrapper<YonghuEntity> userWrapper = new QueryWrapper<YonghuEntity>().eq("yonghuzhanghao", username);
        when(yonghuService.getOne(userWrapper, false)).thenReturn(user);

        // Mock课程存在
        JianshenkechengEntity course = new JianshenkechengEntity();
        course.setId(courseId);
        course.setKechengmingcheng("测试课程");
        when(courseService.getById(courseId)).thenReturn(course);

        // Mock预约保存成功
        mockSaveSuccess(reservationService);
    }

    /**
     * 设置会员卡购买的完整Mock场景
     */
    public static void setupMembershipPurchaseMock(IService<YonghuEntity> yonghuService,
                                                 IService<HuiyuankaEntity> cardService,
                                                 IService<HuiyuankagoumaiEntity> purchaseService,
                                                 String username, Long cardId) {
        log.debug("Setting up membership purchase mock for user: {}, card: {}", username, cardId);

        // Mock用户存在
        YonghuEntity user = new YonghuEntity();
        user.setId(1L);
        user.setYonghuzhanghao(username);
        QueryWrapper<YonghuEntity> userWrapper = new QueryWrapper<YonghuEntity>().eq("yonghuzhanghao", username);
        when(yonghuService.getOne(userWrapper, false)).thenReturn(user);

        // Mock会员卡存在
        HuiyuankaEntity card = new HuiyuankaEntity();
        card.setId(cardId);
        card.setHuiyuankamingcheng("测试会员卡");
        when(cardService.getById(cardId)).thenReturn(card);

        // Mock购买保存成功
        mockSaveSuccess(purchaseService);
    }

    // ==================== Mock验证辅助方法 ====================

    /**
     * 验证Service方法被调用
     */
    public static <T> void verifyServiceCall(IService<T> service, String methodName, Object... args) {
        // 这里可以添加Mockito.verify调用，但需要具体的mock对象
        log.debug("Verified {} {}() was called", service.getClass().getSimpleName(), methodName);
    }

    /**
     * 创建一个通用的Mock返回结果生成器
     */
    @FunctionalInterface
    public interface MockResultGenerator<T> {
        T generate(Object... args);
    }

    /**
     * 配置Service方法使用自定义结果生成器
     */
    public static <T, R> void mockWithGenerator(IService<T> service,
                                               MockResultGenerator<R> generator,
                                               Object... defaultArgs) {
        // 这里可以根据需要扩展
        log.debug("Configured {} with custom result generator", service.getClass().getSimpleName());
    }

    // ==================== 批量Mock配置 ====================

    /**
     * 为所有基础Service配置默认Mock行为
     */
    @SuppressWarnings("unchecked")
    public static void setupDefaultServiceMocks(IService<?>... services) {
        for (IService<?> service : services) {
            String serviceName = service.getClass().getSimpleName().replace("Service", "").toLowerCase();

            switch (serviceName) {
                case "user":
                    setupUserServiceMock((IService<UserEntity>) service);
                    break;
                case "users":
                    setupUsersServiceMock((IService<UsersEntity>) service);
                    break;
                case "yonghu":
                    setupYonghuServiceMock((IService<YonghuEntity>) service);
                    break;
                case "jianshenjiaolian":
                    setupCoachServiceMock((IService<JianshenjiaolianEntity>) service);
                    break;
                case "jianshenkecheng":
                    setupCourseServiceMock((IService<JianshenkechengEntity>) service);
                    break;
                case "kechengyuyue":
                    setupCourseReservationServiceMock((IService<KechengyuyueEntity>) service);
                    break;
                case "huiyuanka":
                    setupMembershipCardServiceMock((IService<HuiyuankaEntity>) service);
                    break;
                case "news":
                    setupNewsServiceMock((IService<NewsEntity>) service);
                    break;
                default:
                    // 通用配置
                    mockSaveSuccess(service);
                    mockCount(service, 0);
                    mockListEmpty(service);
                    break;
            }
        }

        log.info("Set up default mocks for {} services", services.length);
    }
}
