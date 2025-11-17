package com.controller;

import com.controller.support.AbstractControllerIntegrationTest;
import com.entity.UsersEntity;
import com.service.UsersService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class UsersControllerTest extends AbstractControllerIntegrationTest {

    @Autowired
    private UsersService usersService;

    @Autowired
    private ObjectMapper objectMapper;

    @AfterEach
    void cleanupTestData() {
        // Clean up test user entries to prevent conflicts between test runs
        usersService.list().stream()
                .filter(user -> user.getUsername() != null &&
                        (user.getUsername().contains("adminUser") ||
                         user.getUsername().contains("adminNew") ||
                         user.getUsername().contains("dupAdmin") ||
                         user.getUsername().contains("resetUser") ||
                         user.getUsername().contains("failedLoginUser") ||
                         user.getUsername().contains("lockUser") ||
                         user.getUsername().contains("savedUser") ||
                         user.getUsername().contains("duplicate") ||
                         user.getUsername().contains("superAdmin") ||
                         user.getUsername().contains("regularAdmin") ||
                         user.getUsername().contains("newUser") ||
                         user.getUsername().contains("deniedUser")))
                .forEach(user -> usersService.removeById(user.getId()));
    }

    @Test
    void shouldLoginAdminSuccessfully() throws Exception {
        persistAdmin("adminUser", "adminPass");

        mockMvc.perform(post("/users/login")
                        .param("username", "adminUser")
                        .param("password", "adminPass"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void shouldRejectAdminLoginWithBadCredentials() throws Exception {
        mockMvc.perform(post("/users/login")
                        .param("username", "adminUser")
                        .param("password", "bad"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.msg").value("账号或密码不正确"));
    }

    @Test
    void shouldRegisterAdminUser() throws Exception {
        mockMvc.perform(post("/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"adminNew\",\"password\":\"123456\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        UsersEntity saved = usersService.getOne(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<UsersEntity>()
                        .eq("username", "adminNew"));
        assertThat(saved).isNotNull();
    }

    @Test
    void shouldRejectDuplicateAdminRegistration() throws Exception {
        persistAdmin("dupAdmin", "secret");

        mockMvc.perform(post("/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"dupAdmin\",\"password\":\"123456\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.msg").value("用户已存在"));
    }

    @Test
    void shouldAllowAdministratorToAccessUserManagement() throws Exception {
        // Create an administrator user
        persistAdmin("superAdmin", "adminPass", "Administrator");

        // Login as administrator
        String adminToken = loginForToken("superAdmin", "adminPass");

        // Should be able to access user list
        mockMvc.perform(get("/users/page")
                        .header("Token", adminToken)
                        .param("page", "1")
                        .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldDenyNonAdministratorAccessToUserManagement() throws Exception {
        // Create a regular admin user (not Administrator)
        persistAdmin("regularAdmin", "adminPass", "管理员");

        // Login as regular admin
        String adminToken = loginForToken("regularAdmin", "adminPass");

        // Should be denied access to user management
        mockMvc.perform(get("/users/page")
                        .header("Token", adminToken)
                        .param("page", "1")
                        .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(401))
                .andExpect(jsonPath("$.msg").value("权限不足"));
    }

    @Test
    void shouldAllowAdministratorToCreateUsers() throws Exception {
        // Create an administrator user
        persistAdmin("superAdmin2", "adminPass", "Administrator");

        // Login as administrator
        String adminToken = loginForToken("superAdmin2", "adminPass");

        // Should be able to create new users
        mockMvc.perform(post("/users/save")
                        .header("Token", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"newUser\",\"password\":\"123456\",\"role\":\"管理员\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldDenyNonAdministratorToCreateUsers() throws Exception {
        // Create a regular admin user
        persistAdmin("regularAdmin2", "adminPass", "管理员");

        // Login as regular admin
        String adminToken = loginForToken("regularAdmin2", "adminPass");

        // Should be denied creating new users
        mockMvc.perform(post("/users/save")
                        .header("Token", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"deniedUser\",\"password\":\"123456\",\"role\":\"管理员\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(401))
                .andExpect(jsonPath("$.msg").value("权限不足"));
    }

    private void persistAdmin(String username, String password) {
        persistAdmin(username, password, "ADMIN");
    }

    private void persistAdmin(String username, String password, String role) {
        UsersEntity entity = new UsersEntity();
        entity.setId(new Date().getTime());
        entity.setUsername(username);
        entity.setPassword(password);
        entity.setRole(role);
        entity.setAddtime(new Date());
        usersService.save(entity);
    }

    private String loginForToken(String username, String password) throws Exception {
        String response = mockMvc.perform(post("/users/login")
                        .param("username", username)
                        .param("password", password))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readTree(response).path("token").asText();
    }
}

