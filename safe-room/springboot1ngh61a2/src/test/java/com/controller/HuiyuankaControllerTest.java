package com.controller;

import com.controller.support.AbstractControllerIntegrationTest;
import com.entity.HuiyuankaEntity;
import com.service.HuiyuankaService;
import com.utils.TestUtils;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class HuiyuankaControllerTest extends AbstractControllerIntegrationTest {

    @Autowired
    private HuiyuankaService huiyuankaService;

    @Test
    void shouldReturnPagedMembershipCards() throws Exception {
        getPage("/huiyuanka/page")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    void shouldFilterMembershipCardsByName() throws Exception {
        HuiyuankaEntity card = TestUtils.createMembershipCard("精准过滤会员卡");
        huiyuankaService.save(card);

        performAdmin(get("/huiyuanka/page")
                        .param("page", "1")
                        .param("limit", "5")
                        .param("huiyuankamingcheng", card.getHuiyuankamingcheng()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list[*].huiyuankamingcheng", Matchers.hasItem(card.getHuiyuankamingcheng())));
    }

    @Test
    void shouldAllowPublicListAccess() throws Exception {
        mockMvc.perform(get("/huiyuanka/list")
                        .param("page", "1")
                        .param("limit", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    void shouldCreateMembershipCard() throws Exception {
        HuiyuankaEntity payload = TestUtils.createMembershipCard("测试会员卡");

        postJson("/huiyuanka/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(huiyuankaService.list())
                .anyMatch(card -> card.getHuiyuankamingcheng().equals(payload.getHuiyuankamingcheng()));
    }

    @Test
    void shouldUpdateMembershipCard() throws Exception {
        HuiyuankaEntity existing = TestUtils.createMembershipCard("更新会员卡");
        huiyuankaService.save(existing);

        existing.setJiage(2599);

        putJson("/huiyuanka/update", existing)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        HuiyuankaEntity updated = huiyuankaService.getById(existing.getId());
        assertThat(updated.getJiage()).isEqualTo(2599);
    }

    @Test
    void shouldDeleteMembershipCards() throws Exception {
        HuiyuankaEntity first = TestUtils.createMembershipCard("删除会员卡1");
        HuiyuankaEntity second = TestUtils.createMembershipCard("删除会员卡2");
        huiyuankaService.save(first);
        huiyuankaService.save(second);

        deleteJson("/huiyuanka/delete", new Long[]{first.getId(), second.getId()})
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(huiyuankaService.listByIds(Arrays.asList(first.getId(), second.getId())))
                .isEmpty();
    }
}


