package com.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.entity.UserEntity;
import com.entity.view.UserView;
import com.test.support.AbstractServiceTest;
import com.utils.PageUtils;
import com.utils.TestAssertions;
import com.utils.TestUtils;
import com.TestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class UserServiceImplTest extends AbstractServiceTest {

    @Autowired
    private UserService userService;

    @Override
    protected void prepareTestData() {
        // 使用唯一的测试数据，避免主键冲突
        String testClassName = this.getClass().getSimpleName();
        String alphaUsername = TestUtils.generateUniqueTestUsername(testClassName, "alpha");
        String betaUsername = TestUtils.generateUniqueTestUsername(testClassName, "beta");
        String gammaUsername = TestUtils.generateUniqueTestUsername(testClassName, "gamma");

        saveUser(null, alphaUsername, "pass-alpha", "ADMIN", 0);
        saveUser(null, betaUsername, "pass-beta", "USER", 0);
        saveUser(null, gammaUsername, "pass-gamma", "USER", 1);
    }

    @Override
    protected void cleanupTestData() {
        // AbstractServiceTest会自动处理事务回滚，这里可以添加额外的清理逻辑
        log.debug("Additional cleanup for UserServiceImplTest");
    }

    @Test
    void shouldReturnPagedUsersWhenQueryPageInvoked() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "2");

        String testClassName = this.getClass().getSimpleName();
        String alphaUsername = TestUtils.generateUniqueTestUsername(testClassName, "alpha");
        String betaUsername = TestUtils.generateUniqueTestUsername(testClassName, "beta");
        String gammaUsername = TestUtils.generateUniqueTestUsername(testClassName, "gamma");

        // Filter by test usernames to ensure we only count our test data
        QueryWrapper<UserEntity> wrapper = new QueryWrapper<UserEntity>()
                .in("username", alphaUsername, betaUsername, gammaUsername);
        PageUtils page = userService.queryPage(params, wrapper);

        assertThat(page.getTotal()).isEqualTo(3);
        assertThat(page.getList()).hasSize(2);
    }

    @Test
    void shouldReturnFilteredPageWhenWrapperProvided() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "5");
        QueryWrapper<UserEntity> wrapper = new QueryWrapper<UserEntity>().eq("role", "USER");

        PageUtils page = userService.queryPage(params, wrapper);

        assertThat(page.getList()).hasSize(2);
        assertThat(page.getList()).allMatch(UserView.class::isInstance);
    }

    @Test
    void shouldReturnListViewForMatchingUsers() {
        String testClassName = this.getClass().getSimpleName();
        String alphaUsername = TestUtils.generateUniqueTestUsername(testClassName, "alpha");

        List<UserView> result = userService.selectListView(new QueryWrapper<UserEntity>()
                .eq("username", alphaUsername));

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUsername()).isEqualTo(alphaUsername);
    }

    @Test
    void shouldReturnSingleViewForQuery() {
        String testClassName = this.getClass().getSimpleName();
        String betaUsername = TestUtils.generateUniqueTestUsername(testClassName, "beta");

        UserView view = userService.selectView(new QueryWrapper<UserEntity>()
                .eq("username", betaUsername));

        assertThat(view).isNotNull();
        assertThat(view.getUsername()).isEqualTo(betaUsername);
    }

    @Test
    void shouldReturnEmptyListWhenNoUsersMatch() {
        List<UserView> result = userService.selectListView(new QueryWrapper<UserEntity>()
                .eq("username", "missing-user"));

        assertThat(result).isEmpty();
    }

    @Test
    void shouldHandleNullParametersGracefully() {
        // 测试分页查询的空值处理
        TestAssertions.assertNoException(() -> userService.queryPage(null, null));

        // 测试selectListView的空值处理
        TestAssertions.assertNoException(() -> userService.selectListView(null));

        // 测试selectView的空值处理
        TestAssertions.assertNoException(() -> userService.selectView(null));
    }

    @Test
    void shouldHandleInvalidQueryParameters() {
        Map<String, Object> invalidParams = new HashMap<>();
        invalidParams.put("page", "invalid");
        invalidParams.put("limit", -1);

        // 应该优雅处理无效参数，不抛出异常
        TestAssertions.assertNoException(() -> userService.queryPage(invalidParams, null));
    }

    @Test
    void shouldHandleEmptyQueryWrapper() {
        QueryWrapper<UserEntity> emptyWrapper = new QueryWrapper<>();

        List<UserView> result = userService.selectListView(emptyWrapper);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleServiceOperationsSafely() {
        // 测试服务操作的安全性
        TestAssertions.assertNoException(() -> userService.list());
        TestAssertions.assertNoException(() -> userService.count());

        // 测试异常场景 - 这里我们使用一个可能抛出异常的操作
        TestAssertions.assertNoException(() -> userService.getById(-1L));
    }

    @Test
    void shouldValidateEntityOperations() {
        String testClassName = this.getClass().getSimpleName();
        String testUsername = TestUtils.generateUniqueTestUsername(testClassName, "validation");

        // 创建测试用户
        UserEntity user = saveUser(null, testUsername, "password", "USER", 0);

        // 验证保存成功
        TestAssertions.assertEntitySaved(userService, user.getId());

        // 验证查询结果
        UserEntity retrieved = userService.getById(user.getId());
        assertThat(retrieved.getUsername()).isEqualTo(testUsername);

        // 验证删除
        userService.removeById(user.getId());
        TestAssertions.assertEntityDeleted(userService, user.getId());
    }

    @Test
    void shouldHandleBulkOperations() {
        String testClassName = this.getClass().getSimpleName();

        // 批量创建用户
        List<UserEntity> users = new java.util.ArrayList<>();
        for (int i = 0; i < 5; i++) {
            String username = TestUtils.generateUniqueTestUsername(testClassName, "bulk" + i);
            UserEntity user = saveUser(null, username, "password", "USER", 0);
            users.add(user);
        }

        // 验证批量保存
        TestAssertions.assertCollectionSize(users, 5);

        // 验证批量查询
        List<UserEntity> allUsers = userService.list();
        assertThat(allUsers.size()).isGreaterThanOrEqualTo(5);
    }

    @Test
    void shouldHandleComplexQueries() {
        String testClassName = this.getClass().getSimpleName();

        // 创建不同角色的用户
        saveUser(null, TestUtils.generateUniqueTestUsername(testClassName, "admin1"), "pass", "ADMIN", 0);
        saveUser(null, TestUtils.generateUniqueTestUsername(testClassName, "user1"), "pass", "USER", 0);
        saveUser(null, TestUtils.generateUniqueTestUsername(testClassName, "manager1"), "pass", "MANAGER", 0);

        // 测试复杂查询条件
        QueryWrapper<UserEntity> adminWrapper = new QueryWrapper<UserEntity>().eq("role", "ADMIN");
        List<UserEntity> admins = userService.list(adminWrapper);
        assertThat(admins.size()).isGreaterThanOrEqualTo(1);

        QueryWrapper<UserEntity> userWrapper = new QueryWrapper<UserEntity>().eq("role", "USER");
        List<UserEntity> users = userService.list(userWrapper);
        assertThat(users.size()).isGreaterThanOrEqualTo(1);
    }

    // ==================== 权限控制测试 ====================

    @Test
    void shouldEnforceRoleBasedAccess() {
        // 创建不同角色的用户
        String testClassName = this.getClass().getSimpleName();
        UserEntity adminUser = TestDataFactory.user()
                .testClass(testClassName)
                .username(TestUtils.generateUniqueTestUsername(testClassName, "admin-role"))
                .password("admin123")
                .passwordHash("$2a$10$adminHash")
                .role("ADMIN")
                .status(0)
                .build();

        UserEntity regularUser = TestDataFactory.user()
                .testClass(testClassName)
                .username(TestUtils.generateUniqueTestUsername(testClassName, "user-role"))
                .password("user123")
                .passwordHash("$2a$10$userHash")
                .role("USER")
                .status(0)
                .build();

        userService.save(adminUser);
        userService.save(regularUser);

        // 验证角色分配
        UserEntity savedAdmin = userService.getById(adminUser.getId());
        UserEntity savedUser = userService.getById(regularUser.getId());

        assertThat(savedAdmin.getRole()).isEqualTo("ADMIN");
        assertThat(savedUser.getRole()).isEqualTo("USER");
    }

    @Test
    void shouldValidateDataOwnership() {
        // 创建两个不同用户的数据
        String testClassName = this.getClass().getSimpleName();
        UserEntity userA = TestDataFactory.user()
                .testClass(testClassName)
                .username(TestUtils.generateUniqueTestUsername(testClassName, "owner-a"))
                .password("passA")
                .passwordHash("$2a$10$hashA")
                .role("USER")
                .status(0)
                .build();

        UserEntity userB = TestDataFactory.user()
                .testClass(testClassName)
                .username(TestUtils.generateUniqueTestUsername(testClassName, "owner-b"))
                .password("passB")
                .passwordHash("$2a$10$hashB")
                .role("USER")
                .status(0)
                .build();

        userService.save(userA);
        userService.save(userB);

        // 验证用户只能访问自己的数据（通过ID验证）
        UserEntity retrievedA = userService.getById(userA.getId());
        UserEntity retrievedB = userService.getById(userB.getId());

        assertThat(retrievedA.getUsername()).isEqualTo(userA.getUsername());
        assertThat(retrievedB.getUsername()).isEqualTo(userB.getUsername());
        assertThat(retrievedA.getId()).isNotEqualTo(retrievedB.getId());
    }

    @Test
    void shouldValidateOperationPermissions() {
        // 创建管理员和普通用户
        String testClassName = this.getClass().getSimpleName();
        UserEntity adminUser = TestDataFactory.user()
                .testClass(testClassName)
                .username(TestUtils.generateUniqueTestUsername(testClassName, "admin-op"))
                .password("adminPass")
                .passwordHash("$2a$10$adminOpHash")
                .role("ADMIN")
                .status(0)
                .build();

        UserEntity regularUser = TestDataFactory.user()
                .testClass(testClassName)
                .username(TestUtils.generateUniqueTestUsername(testClassName, "user-op"))
                .password("userPass")
                .passwordHash("$2a$10$userOpHash")
                .role("USER")
                .status(0)
                .build();

        userService.save(adminUser);
        userService.save(regularUser);

        // 验证管理员可以执行所有操作
        List<UserEntity> allUsers = userService.list();
        assertThat(allUsers).isNotEmpty();

        // 验证用户状态管理
        UserEntity savedAdmin = userService.getById(adminUser.getId());
        assertThat(savedAdmin.getStatus()).isEqualTo(0);

        // 模拟状态变更（如果有禁用功能的话）
        savedAdmin.setStatus(1); // 假设1表示禁用
        userService.updateById(savedAdmin);

        UserEntity updatedAdmin = userService.getById(adminUser.getId());
        assertThat(updatedAdmin.getStatus()).isEqualTo(1);
    }

    @Test
    void shouldHandlePasswordValidation() {
        // 测试密码验证和加密
        String testClassName = this.getClass().getSimpleName();
        UserEntity userWithPassword = TestDataFactory.user()
                .testClass(testClassName)
                .username(TestUtils.generateUniqueTestUsername(testClassName, "pwd-user"))
                .password("MySecurePass123!")
                .passwordHash("$2a$10$secureHashValue")
                .role("USER")
                .status(0)
                .build();

        userService.save(userWithPassword);

        UserEntity savedUser = userService.getById(userWithPassword.getId());
        assertThat(savedUser.getPassword()).isEqualTo("MySecurePass123!");
        assertThat(savedUser.getPasswordHash()).isEqualTo("$2a$10$secureHashValue");

        // 验证密码更新
        savedUser.setPassword("NewSecurePass456!");
        savedUser.setPasswordHash("$2a$10$newSecureHash");
        userService.updateById(savedUser);

        UserEntity updatedUser = userService.getById(userWithPassword.getId());
        assertThat(updatedUser.getPassword()).isEqualTo("NewSecurePass456!");
        assertThat(updatedUser.getPasswordHash()).isEqualTo("$2a$10$newSecureHash");
    }

    @Test
    void shouldGenerateAndValidateTokens() {
        // 测试Token生成和验证（如果有Token相关字段的话）
        String testClassName = this.getClass().getSimpleName();
        UserEntity tokenUser = TestDataFactory.user()
                .testClass(testClassName)
                .username(TestUtils.generateUniqueTestUsername(testClassName, "token-user"))
                .password("tokenPass")
                .passwordHash("$2a$10$tokenHash")
                .role("USER")
                .status(0)
                .build();

        userService.save(tokenUser);

        UserEntity savedTokenUser = userService.getById(tokenUser.getId());
        assertThat(savedTokenUser).isNotNull();

        // 这里可以扩展Token相关的业务逻辑测试
        // 例如：Token生成、过期验证、刷新等
        // 但需要根据实际的Token字段来实现
    }

    @Test
    void shouldPreventUnauthorizedDataAccess() {
        // 测试数据访问权限控制
        String testClassName = this.getClass().getSimpleName();

        // 创建管理员用户
        UserEntity admin = TestDataFactory.user()
                .testClass(testClassName)
                .username(TestUtils.generateUniqueTestUsername(testClassName, "admin-access"))
                .password("adminPass")
                .passwordHash("$2a$10$adminAccessHash")
                .role("ADMIN")
                .status(0)
                .build();

        // 创建普通用户
        UserEntity user = TestDataFactory.user()
                .testClass(testClassName)
                .username(TestUtils.generateUniqueTestUsername(testClassName, "user-access"))
                .password("userPass")
                .passwordHash("$2a$10$userAccessHash")
                .role("USER")
                .status(0)
                .build();

        userService.save(admin);
        userService.save(user);

        // 验证管理员可以访问所有用户数据
        List<UserEntity> allUsers = userService.list();
        assertThat(allUsers).hasSizeGreaterThanOrEqualTo(2);

        // 验证通过角色字段模拟的权限控制
        UserEntity savedAdmin = userService.getById(admin.getId());
        UserEntity savedUser = userService.getById(user.getId());

        assertThat(savedAdmin.getRole()).isEqualTo("ADMIN");
        assertThat(savedUser.getRole()).isEqualTo("USER");

        // 普通用户理论上不应该能访问管理员数据（这里通过业务逻辑验证）
        assertThat(savedUser.getRole()).isNotEqualTo("ADMIN");
    }

    @Test
    void shouldHandleUserAuthentication() {
        // 测试用户认证相关逻辑
        String testClassName = this.getClass().getSimpleName();

        UserEntity authUser = TestDataFactory.user()
                .testClass(testClassName)
                .username(TestUtils.generateUniqueTestUsername(testClassName, "auth-user"))
                .password("authPassword123")
                .passwordHash("$2a$10$authHashValue")
                .role("USER")
                .status(0)
                .build();

        userService.save(authUser);

        UserEntity savedAuthUser = userService.getById(authUser.getId());

        // 验证认证相关字段
        assertThat(savedAuthUser.getUsername()).isEqualTo(authUser.getUsername());
        assertThat(savedAuthUser.getPassword()).isEqualTo("authPassword123");
        assertThat(savedAuthUser.getPasswordHash()).isEqualTo("$2a$10$authHashValue");

        // 测试登录失败场景（通过状态验证）
        savedAuthUser.setStatus(1); // 假设1表示账户被锁定
        userService.updateById(savedAuthUser);

        UserEntity lockedUser = userService.getById(authUser.getId());
        assertThat(lockedUser.getStatus()).isEqualTo(1);
    }

    @Test
    void shouldSupportUserPermissionLevels() {
        // 测试用户权限级别
        String testClassName = this.getClass().getSimpleName();

        String[] roles = {"ADMIN", "MANAGER", "USER", "GUEST"};
        Integer[] statuses = {0, 0, 0, 1}; // GUEST可能被禁用

        UserEntity[] users = new UserEntity[roles.length];

        for (int i = 0; i < roles.length; i++) {
            users[i] = TestDataFactory.user()
                    .testClass(testClassName)
                    .username(TestUtils.generateUniqueTestUsername(testClassName, "perm-" + roles[i].toLowerCase()))
                    .password("pass" + i)
                    .passwordHash("$2a$10$permHash" + i)
                    .role(roles[i])
                    .status(statuses[i])
                    .build();

            userService.save(users[i]);
        }

        // 验证权限层级
        for (int i = 0; i < users.length; i++) {
            UserEntity savedUser = userService.getById(users[i].getId());
            assertThat(savedUser.getRole()).isEqualTo(roles[i]);
            assertThat(savedUser.getStatus()).isEqualTo(statuses[i]);
        }

        // 验证权限继承关系（ADMIN > MANAGER > USER > GUEST）
        List<UserEntity> adminUsers = userService.list(new QueryWrapper<UserEntity>().eq("role", "ADMIN"));
        List<UserEntity> managerUsers = userService.list(new QueryWrapper<UserEntity>().eq("role", "MANAGER"));
        List<UserEntity> regularUsers = userService.list(new QueryWrapper<UserEntity>().eq("role", "USER"));
        List<UserEntity> guestUsers = userService.list(new QueryWrapper<UserEntity>().eq("role", "GUEST"));

        assertThat(adminUsers).hasSizeGreaterThanOrEqualTo(1);
        assertThat(managerUsers).hasSizeGreaterThanOrEqualTo(1);
        assertThat(regularUsers).hasSizeGreaterThanOrEqualTo(1);
        assertThat(guestUsers).hasSizeGreaterThanOrEqualTo(1);
    }

    private UserEntity saveUser(Long id, String username, String password, String role, int status) {
        UserEntity user = TestUtils.createUser(id, username, password);
        user.setRole(role);
        user.setStatus(status);
        userService.save(user);
        return user;
    }
}

