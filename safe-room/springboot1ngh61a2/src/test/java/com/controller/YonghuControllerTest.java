package com.controller;

import com.controller.support.AbstractControllerIntegrationTest;
import com.entity.YonghuEntity;
import com.service.YonghuService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Tags({
    @Tag("integration"),
    @Tag("controller"),
    @Tag("yonghu")
})
class YonghuControllerTest extends AbstractControllerIntegrationTest {

    @Autowired
    private YonghuService yonghuService;

    @AfterEach
    void cleanupTestData() {
        // 清理测试用户数据
        yonghuService.list().stream()
                .filter(yonghu -> yonghu.getYonghuzhanghao() != null &&
                        (yonghu.getYonghuzhanghao().contains("test-user") ||
                         yonghu.getYonghuzhanghao().contains("login-test") ||
                         yonghu.getYonghuzhanghao().contains("register-test") ||
                         yonghu.getYonghuzhanghao().contains("update-test") ||
                         yonghu.getYonghuzhanghao().contains("delete-test")))
                .forEach(yonghu -> yonghuService.removeById(yonghu.getId()));
    }

    @Test
    void shouldReturnPagedUsers() throws Exception {
        performAdmin(get("/yonghu/page"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    void shouldReturnUserList() throws Exception {
        performAdmin(get("/yonghu/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    void shouldHandleLoginWithInvalidUsername() throws Exception {
        mockMvc.perform(post("/yonghu/login")
                .param("username", "nonexistent")
                .param("password", "password"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.msg").value("账号或密码不正确"));
    }

    @Test
    void shouldCreateUser() throws Exception {
        YonghuEntity newUser = createTestUser("test-user-create", "创建测试用户");

        postJson("/yonghu/add", newUser)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldGetUserInfo() throws Exception {
        // 使用已存在的用户进行测试
        performAdmin(get("/yonghu/info/999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleLogout() throws Exception {
        performAdmin(post("/yonghu/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldGetSessionInfo() throws Exception {
        performAdmin(get("/yonghu/session"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    private YonghuEntity createTestUser(String username, String name) {
        YonghuEntity user = new YonghuEntity();
        user.setId(System.currentTimeMillis()); // 设置ID
        user.setYonghuzhanghao(username);
        user.setYonghuxingming(name);
        user.setMima("12345678"); // 密码至少8位
        user.setXingbie("男");
        user.setShoujihaoma("13800138000");
        user.setAddtime(new Date());
        user.setStatus(0);
        user.setFailedLoginAttempts(0);
        return user;
    }

    private YonghuEntity persistUser(String username, String name) {
        YonghuEntity user = createTestUser(username, name);
        yonghuService.save(user);
        return user;
    }
}