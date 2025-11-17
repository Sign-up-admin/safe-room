package com.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.entity.UsersEntity;
import com.utils.PageUtils;
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
class UsersServiceImplTest {

    @Autowired
    private UsersService usersService;

    @Test
    void shouldReturnPagedUsers() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "5");

        PageUtils result = usersService.queryPage(params);

        assertThat(result.getList()).isNotEmpty();
    }

    @Test
    void shouldSelectUserListView() {
        List<UsersEntity> users = usersService.selectListView(new QueryWrapper<>());
        assertThat(users).isNotEmpty();
    }
}


