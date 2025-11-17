package com.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.entity.UserEntity;
import com.entity.view.UserView;
import com.utils.PageUtils;
import com.utils.TestUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class UserServiceImplTest {

    @Autowired
    private UserService userService;

    @BeforeEach
    void setupData() {
        // Clean up test data first to avoid duplicate key errors
        userService.removeById(100L);
        userService.removeById(101L);
        userService.removeById(102L);
        
        saveUser(100L, "alpha", "pass-alpha", "ADMIN", 0);
        saveUser(101L, "beta", "pass-beta", "USER", 0);
        saveUser(102L, "gamma", "pass-gamma", "USER", 1);
    }

    @Test
    void shouldReturnPagedUsersWhenQueryPageInvoked() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "2");
        // Filter by test usernames to ensure we only count our test data
        QueryWrapper<UserEntity> wrapper = new QueryWrapper<UserEntity>()
                .in("username", "alpha", "beta", "gamma");
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
        List<UserView> result = userService.selectListView(new QueryWrapper<UserEntity>()
                .eq("username", "alpha"));

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUsername()).isEqualTo("alpha");
    }

    @Test
    void shouldReturnSingleViewForQuery() {
        UserView view = userService.selectView(new QueryWrapper<UserEntity>()
                .eq("username", "beta"));

        assertThat(view).isNotNull();
        assertThat(view.getUsername()).isEqualTo("beta");
    }

    @Test
    void shouldReturnEmptyListWhenNoUsersMatch() {
        List<UserView> result = userService.selectListView(new QueryWrapper<UserEntity>()
                .eq("username", "missing-user"));

        assertThat(result).isEmpty();
    }

    private void saveUser(Long id, String username, String password, String role, int status) {
        UserEntity user = TestUtils.createUser(id, username, password);
        user.setRole(role);
        user.setStatus(status);
        userService.save(user);
    }
}

