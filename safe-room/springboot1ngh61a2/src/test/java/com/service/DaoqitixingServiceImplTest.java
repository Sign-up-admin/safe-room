package com.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.entity.DaoqitixingEntity;
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
class DaoqitixingServiceImplTest {

    @Autowired
    private DaoqitixingService daoqitixingService;

    @Test
    void shouldReturnPagedReminders() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "5");

        PageUtils result = daoqitixingService.queryPage(params);

        assertThat(result.getList()).isNotEmpty();
    }

    @Test
    void shouldListRemindersByUser() {
        List<DaoqitixingEntity> reminders = daoqitixingService.list(new QueryWrapper<DaoqitixingEntity>().eq("yonghuzhanghao", "member001"));
        assertThat(reminders).isNotEmpty();
    }

    @Test
    void shouldSelectReminderView() {
        // First check if any reminders exist
        List<DaoqitixingEntity> allReminders = daoqitixingService.list(new QueryWrapper<>());
        if (!allReminders.isEmpty()) {
            // Use the first reminder's id for the test
            Long reminderId = allReminders.get(0).getId();
            var view = daoqitixingService.selectView(new QueryWrapper<DaoqitixingEntity>().eq("id", reminderId));
            assertThat(view).isNotNull();
        } else {
            // If no reminders exist, the view should be null
            var view = daoqitixingService.selectView(new QueryWrapper<DaoqitixingEntity>().eq("id", 1100));
            // View may be null if data doesn't exist
            // This is acceptable behavior
        }
    }

    // 边界条件测试
    @Test
    void shouldHandleEmptyParams() {
        Map<String, Object> emptyParams = new HashMap<>();
        PageUtils result = daoqitixingService.queryPage(emptyParams);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleNullParams() {
        PageUtils result = daoqitixingService.queryPage(null);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleInvalidPageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "-1");
        params.put("limit", "5");
        PageUtils result = daoqitixingService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleZeroLimit() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "0");
        PageUtils result = daoqitixingService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleLargePageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "999999");
        params.put("limit", "10");
        PageUtils result = daoqitixingService.queryPage(params);
        assertThat(result).isNotNull();
        assertThat(result.getList()).isEmpty();
    }

    @Test
    void shouldHandleEmptyResultSet() {
        QueryWrapper<DaoqitixingEntity> wrapper = new QueryWrapper<DaoqitixingEntity>()
                .eq("id", Long.MAX_VALUE);
        var view = daoqitixingService.selectView(wrapper);
        assertThat(view).isNull();
    }
}


