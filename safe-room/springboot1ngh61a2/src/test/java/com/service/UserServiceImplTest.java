package com.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.entity.UserEntity;
import com.entity.view.UserView;
import com.test.support.AbstractServiceTest;
import com.utils.PageUtils;
import com.utils.TestAssertions;
import com.utils.TestUtils;
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

    private UserEntity saveUser(Long id, String username, String password, String role, int status) {
        UserEntity user = TestUtils.createUser(id, username, password);
        user.setRole(role);
        user.setStatus(status);
        userService.save(user);
        return user;
    }
}

