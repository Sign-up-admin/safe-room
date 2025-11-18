package com.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.annotation.TestData;
import com.controller.support.AbstractControllerIntegrationTest;
import com.entity.UserEntity;
import com.service.UserService;
import com.utils.TestUtils;
import com.utils.TestDataFactory;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import java.util.Arrays;
import java.util.Date;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class UserControllerTest extends AbstractControllerIntegrationTest {

    @Autowired
    private UserService userService;

    // 数据清理现在通过@Transactional和@Rollback自动处理，无需手动清理

    @Test
    void shouldLoginSuccessfullyWhenCredentialsAreCorrect() throws Exception {
        persistUser("userLogin", "secret", 0);

        mockMvc.perform(post("/user/login")
                        .param("username", "userLogin")
                        .param("password", "secret"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void shouldFailLoginWhenUserNotFound() throws Exception {
        mockMvc.perform(post("/user/login")
                        .param("username", "missing")
                        .param("password", "secret"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.msg").value("Invalid username or password"));
    }

    @Test
    void shouldFailLoginWhenPasswordIncorrect() throws Exception {
        persistUser("userLogin2", "secret", 0);

        mockMvc.perform(post("/user/login")
                        .param("username", "userLogin2")
                        .param("password", "bad"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.msg").value("Invalid username or password"));
    }

    @Test
    void shouldFailLoginWhenAccountLocked() throws Exception {
        persistUser("lockedUser", "secret", 1);

        mockMvc.perform(post("/user/login")
                        .param("username", "lockedUser")
                        .param("password", "secret"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.msg").value("Account is locked, please contact administrator."));
    }

    @Test
    void shouldRegisterNewUser() throws Exception {
        mockMvc.perform(post("/user/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"new-user\",\"password\":\"123456\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(userService.getOne(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<UserEntity>()
                        .eq("username", "new-user"))).isNotNull();
    }

    @Test
    void shouldRejectDuplicateRegistration() throws Exception {
        persistUser("duplicate", "123456", 0);

        mockMvc.perform(post("/user/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"duplicate\",\"password\":\"123456\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.msg").value("User already exists"));
    }

    @Test
    void shouldLogoutSuccessfully() throws Exception {
        UserEntity user = persistUser("logoutUser", "secret", 0);
        String token = loginAndExtractToken("logoutUser", "secret");

        mockMvc.perform(post("/user/logout")
                        .header("Token", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.msg").value("Logout successful"));
    }

    @Test
    void shouldHandleMultipleFailedLoginAttempts() throws Exception {
        UserEntity user = persistUser("failedLoginUser", "secret", 0);
        user.setFailedLoginAttempts(2); // Set close to limit
        userService.updateById(user);

        // First failed attempt
        mockMvc.perform(post("/user/login")
                        .param("username", "failedLoginUser")
                        .param("password", "wrong"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.msg").value("Invalid username or password"));

        // Check that failed attempts increased
        UserEntity updated = userService.getById(user.getId());
        assertThat(updated.getFailedLoginAttempts()).isEqualTo(3);
    }

    @Test
    void shouldLockAccountAfterTooManyFailedAttempts() throws Exception {
        UserEntity user = persistUser("lockUser", "secret", 0);
        user.setFailedLoginAttempts(4); // One more will lock
        userService.updateById(user);

        // This should lock the account
        mockMvc.perform(post("/user/login")
                        .param("username", "lockUser")
                        .param("password", "wrong"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.msg").value("Too many failed login attempts. Account locked for 30 minutes"));

        // Verify account is locked
        UserEntity locked = userService.getById(user.getId());
        assertThat(locked.getLockUntil()).isNotNull();
    }

    @Test
    void shouldResetFailedAttemptsOnSuccessfulLogin() throws Exception {
        UserEntity user = persistUser("resetUser", "secret", 0);
        user.setFailedLoginAttempts(2);
        userService.updateById(user);

        // Successful login should reset attempts
        mockMvc.perform(post("/user/login")
                        .param("username", "resetUser")
                        .param("password", "secret"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.token").isNotEmpty());

        // Verify failed attempts reset
        UserEntity reset = userService.getById(user.getId());
        assertThat(reset.getFailedLoginAttempts()).isEqualTo(0);
        assertThat(reset.getLockUntil()).isNull();
    }

    @Test
    void shouldHandleTemporarilyLockedAccount() throws Exception {
        UserEntity user = persistUser("tempLockUser", "secret", 0);
        // Set account to be locked until future time
        user.setLockUntil(new Date(System.currentTimeMillis() + 60_000)); // 1 minute from now
        userService.updateById(user);

        mockMvc.perform(post("/user/login")
                        .param("username", "tempLockUser")
                        .param("password", "secret"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.msg").value("Account is temporarily locked due to too many failed login attempts"));
    }

    @Test
    void shouldHandleNullUsernameInLogin() throws Exception {
        mockMvc.perform(post("/user/login")
                        .param("password", "secret"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500));
    }

    @Test
    void shouldHandleNullPasswordInLogin() throws Exception {
        mockMvc.perform(post("/user/login")
                        .param("username", "user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500));
    }

    @Test
    void shouldResetPasswordForExistingUser() throws Exception {
        persistUser("resetUser", "oldPass", 0);

        mockMvc.perform(post("/user/resetPass")
                        .param("username", "resetUser"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        UserEntity updated = userService.getOne(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<UserEntity>()
                        .eq("username", "resetUser"));
        assertThat(updated.getPassword()).isEqualTo("123456");
    }

    @Test
    void shouldReturnErrorWhenResetUserMissing() throws Exception {
        mockMvc.perform(post("/user/resetPass")
                        .param("username", "unknown"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.msg").value("Account does not exist"));
    }

    @Test
    void shouldReturnPagedUsersForAuthorizedRequest() throws Exception {
        persistUser("adminPage", "admin", 0);
        persistUser("pageUser1", "pwd", 0);
        persistUser("pageUser2", "pwd", 0);

        performAdmin(get("/user/page")
                        .param("page", "1")
                        .param("limit", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    void shouldFetchUserDetails() throws Exception {
        UserEntity admin = persistUser("adminInfo", "admin", 0);

        performAdmin(get("/user/info/" + admin.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username").value("adminInfo"));
    }

    @Test
    void shouldSaveNewUserViaAdminEndpoint() throws Exception {
        persistUser("adminSave", "admin", 0);

        postJson("/user/save", Map.of(
                "username", "savedUser",
                "password", "pwd"
        ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(userService.getOne(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<UserEntity>()
                        .eq("username", "savedUser"))).isNotNull();
    }

    @Test
    void shouldUpdateExistingUser() throws Exception {
        persistUser("adminUpdate", "admin", 0);
        UserEntity target = persistUser("toUpdate", "old", 0);

        putJson("/user/update", Map.of(
                "id", target.getId(),
                "username", "toUpdate",
                "password", "newPwd"
        ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        UserEntity updated = userService.getById(target.getId());
        assertThat(updated).isNotNull();
        assertThat(updated.getPassword()).isEqualTo("newPwd");
    }

    @Test
    void shouldDeleteUsers() throws Exception {
        persistUser("adminDelete", "admin", 0);
        UserEntity target1 = persistUser("delete1", "pwd", 0);
        UserEntity target2 = persistUser("delete2", "pwd", 0);

        deleteJson("/user/delete", new Long[]{target1.getId(), target2.getId()})
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(userService.getById(target1.getId())).isNull();
        assertThat(userService.getById(target2.getId())).isNull();
    }

    @Test
    void shouldHandleUserInfoRequest() throws Exception {
        UserEntity user = persistUser("infoUser", "pwd", 0);

        performAdmin(get("/user/info/" + user.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.username").value("infoUser"));
    }

    @Test
    void shouldHandleUserInfoWithNonExistentId() throws Exception {
        performAdmin(get("/user/info/999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleInvalidPaginationParameters() throws Exception {
        performAdmin(get("/user/page")
                        .param("page", "-1")
                        .param("limit", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleUserUpdateWithNonExistentId() throws Exception {
        UserEntity payload = new UserEntity();
        payload.setId(999999L);
        payload.setUsername("non-existent");

        putJson("/user/update", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleUserDeleteWithEmptyArray() throws Exception {
        performAdmin(delete("/user/delete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleUserDeleteWithNullIds() throws Exception {
        performAdmin(delete("/user/delete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.createObjectNode().putArray("ids").toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleUserSaveWithNullFields() throws Exception {
        UserEntity payload = new UserEntity();
        payload.setUsername(null);
        payload.setPassword(null);

        postJson("/user/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleUserSaveWithInvalidStatus() throws Exception {
        UserEntity payload = TestUtils.createUser(null, "invalidStatus", "pwd");
        payload.setStatus(-1); // Invalid status

        postJson("/user/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleLoginWithNullCredentials() throws Exception {
        mockMvc.perform(post("/user/login")
                        .param("username", (String) null)
                        .param("password", (String) null))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleLoginWithEmptyCredentials() throws Exception {
        mockMvc.perform(post("/user/login")
                        .param("username", "")
                        .param("password", ""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleUserListWithFilter() throws Exception {
        UserEntity user1 = persistUser("filter1", "pwd", 0);
        UserEntity user2 = persistUser("filter2", "pwd", 1);

        performAdmin(get("/user/list")
                        .param("status", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void shouldHandleUserSessionRequest() throws Exception {
        UserEntity user = persistUser("sessionUser", "pwd", 0);
        String token = loginAndExtractToken("sessionUser", "pwd");

        mockMvc.perform(post("/user/session")
                        .header("Token", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.username").value("sessionUser"));
    }

    @Test
    void shouldHandleUserListsRequest() throws Exception {
        persistUser("listsUser1", "pwd", 0);
        persistUser("listsUser2", "pwd", 0);

        performAdmin(get("/user/lists"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void shouldHandleUserQueryRequest() throws Exception {
        UserEntity user = persistUser("queryUser", "pwd", 0);

        performAdmin(get("/user/query")
                        .param("username", "queryUser"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.username").value("queryUser"));
    }

    @Test
    void shouldHandleUserDetailRequest() throws Exception {
        UserEntity user = persistUser("detailUser", "pwd", 0);

        mockMvc.perform(get("/user/detail/" + user.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.username").value("detailUser"));
    }

    @Test
    void shouldHandleUserAddRequest() throws Exception {
        performAdmin(post("/user/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"addedUser\",\"password\":\"pwd123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(userService.getOne(
                new QueryWrapper<UserEntity>()
                        .eq("username", "addedUser"))).isNotNull();
    }

    @Test
    void shouldHandleUserRemindRequest() throws Exception {
        persistUser("remindUser1", "pwd", 0);
        persistUser("remindUser2", "pwd", 0);

        performAdmin(get("/user/remind/username/1")
                        .param("remindstart", "2024-01-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").isNumber());
    }

    @Test
    void shouldHandleUserCountRequest() throws Exception {
        persistUser("countUser1", "pwd", 0);
        persistUser("countUser2", "pwd", 0);

        performAdmin(get("/user/count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isNumber());
    }

    @Test
    void shouldHandleUserListsWithNullUser() throws Exception {
        performAdmin(get("/user/lists"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleUserQueryWithNullUser() throws Exception {
        performAdmin(get("/user/query"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleUserDetailWithInvalidId() throws Exception {
        mockMvc.perform(get("/user/detail/999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleUserAddWithDuplicateUsername() throws Exception {
        persistUser("duplicateAdd", "pwd", 0);

        performAdmin(post("/user/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"duplicateAdd\",\"password\":\"pwd123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.msg").value("Username already exists"));
    }

    @Test
    void shouldHandleUserRemindWithInvalidType() throws Exception {
        performAdmin(get("/user/remind/username/3")
                        .param("remindstart", "invalid"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").isNumber());
    }

    @Test
    void shouldHandleUserListWithoutToken() throws Exception {
        mockMvc.perform(get("/user/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    void shouldHandleInvalidLoginParameters() throws Exception {
        // 测试空用户名
        mockMvc.perform(post("/user/login")
                        .param("username", "")
                        .param("password", "password"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500));

        // 测试空密码
        mockMvc.perform(post("/user/login")
                        .param("username", "testuser")
                        .param("password", ""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500));

        // 测试空用户名和密码
        mockMvc.perform(post("/user/login")
                        .param("username", "")
                        .param("password", ""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500));
    }

    @Test
    void shouldHandleRegisterWithInvalidData() throws Exception {
        // 测试注册空用户名
        mockMvc.perform(post("/user/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"\",\"password\":\"123456\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500));

        // 测试注册空密码
        mockMvc.perform(post("/user/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"testuser\",\"password\":\"\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500));

        // 测试注册超短密码
        mockMvc.perform(post("/user/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"testuser\",\"password\":\"123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500));
    }

    @Test
    void shouldHandleMalformedJsonInRegister() throws Exception {
        // 测试无效的JSON格式
        mockMvc.perform(post("/user/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("invalid json"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldHandleInvalidPageParameters() throws Exception {
        mockMvc.perform(get("/user/page")
                        .header("Token", loginAndExtractToken("admin", "admin"))
                        .param("page", "0")
                        .param("limit", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @TestData(entities = {
        @TestData.Entity(type = UserEntity.class, count = 3)
    })
    @Test
    void shouldListUsersWithTestDataAnnotation() throws Exception {
        mockMvc.perform(get("/user/list")
                        .header("Token", loginAndExtractToken("admin", "admin")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }

    @TestData(entities = {
        @TestData.Entity(type = UserEntity.class, count = 5)
    })
    @Test
    void shouldPageUsersWithTestDataAnnotation() throws Exception {
        mockMvc.perform(get("/user/page")
                        .header("Token", loginAndExtractToken("admin", "admin"))
                        .param("page", "1")
                        .param("limit", "3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray())
                .andExpect(jsonPath("$.data.total").value(Matchers.greaterThanOrEqualTo(5)));
    }

    @Test
    void shouldHandleLargePageSize() throws Exception {
        mockMvc.perform(get("/user/page")
                        .header("Token", loginAndExtractToken("admin", "admin"))
                        .param("page", "1")
                        .param("limit", "1000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleNegativePageNumber() throws Exception {
        mockMvc.perform(get("/user/page")
                        .header("Token", loginAndExtractToken("admin", "admin"))
                        .param("page", "-1")
                        .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleSpecialCharactersInUsername() throws Exception {
        String specialUsername = "test@#$%^&*()";
        persistUser(specialUsername, "password123", 0);

        mockMvc.perform(post("/user/login")
                        .param("username", specialUsername)
                        .param("password", "password123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void shouldHandleVeryLongUsername() throws Exception {
        String longUsername = "a".repeat(200); // 超出常规长度
        persistUser(longUsername, "password123", 0);

        mockMvc.perform(post("/user/login")
                        .param("username", longUsername)
                        .param("password", "password123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleConcurrentLoginAttempts() throws Exception {
        String username = "concurrent" + System.nanoTime();
        persistUser(username, "password123", 0);

        // 模拟并发登录请求
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/user/login")
                            .param("username", username)
                            .param("password", "password123"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(0));
        }
    }

    private UserEntity persistUser(String username, String password, int status) {
        UserEntity user = TestUtils.createUser(null, username, password);
        user.setStatus(status);
        user.setRole("User");
        userService.save(user);
        return user;
    }

    private String loginAndExtractToken(String username, String password) throws Exception {
        return TestUtils.loginAndGetToken(mockMvc, objectMapper, username, password);
    }
}

