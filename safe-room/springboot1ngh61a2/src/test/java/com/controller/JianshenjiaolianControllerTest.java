package com.controller;

import com.controller.support.AbstractControllerIntegrationTest;
import com.entity.JianshenjiaolianEntity;
import com.service.JianshenjiaolianService;
import com.utils.TestDataCleanup;
import com.utils.TestUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class JianshenjiaolianControllerTest extends AbstractControllerIntegrationTest {

    @Autowired
    private JianshenjiaolianService jianshenjiaolianService;

    @AfterEach
    void cleanupTestData() {
        // 清理测试健身教练数据
        TestDataCleanup.cleanupByPrefix(jianshenjiaolianService, "jiaolianmingcheng", "测试教练");
        TestDataCleanup.cleanupByPrefix(jianshenjiaolianService, "jiaolianmingcheng", "delete");
    }

    @Test
    void shouldReturnPagedCoaches() throws Exception {
        getPage("/jianshenjiaolian/page")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    void shouldCreateCoachProfile() throws Exception {
        JianshenjiaolianEntity payload = TestUtils.createCoachTemplate("新增教练");

        postJson("/jianshenjiaolian/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(jianshenjiaolianService.list())
                .anyMatch(coach -> coach.getJiaoliangonghao().equals(payload.getJiaoliangonghao()));
    }

    @Test
    void shouldUpdateCoachPrice() throws Exception {
        JianshenjiaolianEntity existing = TestUtils.createCoachTemplate("调价教练");
        jianshenjiaolianService.save(existing);

        existing.setSijiaojiage(499D);

        putJson("/jianshenjiaolian/update", existing)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        JianshenjiaolianEntity updated = jianshenjiaolianService.getById(existing.getId());
        assertThat(updated).isNotNull();
        assertThat(updated.getSijiaojiage()).isEqualTo(499D);
    }

    @Test
    void shouldDeleteCoaches() throws Exception {
        JianshenjiaolianEntity first = TestUtils.createCoachTemplate("删除教练1");
        JianshenjiaolianEntity second = TestUtils.createCoachTemplate("删除教练2");
        jianshenjiaolianService.save(first);
        jianshenjiaolianService.save(second);

        deleteJson("/jianshenjiaolian/delete", new Long[]{first.getId(), second.getId()})
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(jianshenjiaolianService.listByIds(Arrays.asList(first.getId(), second.getId())))
                .isEmpty();
    }
}


