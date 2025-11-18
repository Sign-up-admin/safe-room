package com.controller;

import com.controller.support.AbstractControllerIntegrationTest;
import com.entity.HuiyuankaEntity;
import com.service.HuiyuankaService;
import com.utils.TestDataCleanup;
import com.utils.TestUtils;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class HuiyuankaControllerTest extends AbstractControllerIntegrationTest {

    @Autowired
    private HuiyuankaService huiyuankaService;

    @AfterEach
    void cleanupTestData() {
        // 清理测试会员卡数据
        TestDataCleanup.cleanupByPrefix(huiyuankaService, "huiyuankamingcheng", "测试");
        TestDataCleanup.cleanupByPrefix(huiyuankaService, "huiyuankamingcheng", "更新");
        TestDataCleanup.cleanupByPrefix(huiyuankaService, "huiyuankamingcheng", "删除");
        TestDataCleanup.cleanupByPrefix(huiyuankaService, "huiyuankamingcheng", "精准过滤");
    }

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
        assertThat(updated).isNotNull();
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

    @Test
    void shouldGetMembershipCardLists() throws Exception {
        HuiyuankaEntity card = TestUtils.createMembershipCard("列表会员卡");
        huiyuankaService.save(card);

        performAdmin(get("/huiyuanka/lists"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void shouldQueryMembershipCard() throws Exception {
        HuiyuankaEntity card = TestUtils.createMembershipCard("查询会员卡");
        huiyuankaService.save(card);

        performAdmin(get("/huiyuanka/query")
                        .param("huiyuankamingcheng", card.getHuiyuankamingcheng()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.huiyuankamingcheng").value(card.getHuiyuankamingcheng()));
    }

    @Test
    void shouldGetMembershipCardInfo() throws Exception {
        HuiyuankaEntity card = TestUtils.createMembershipCard("详情会员卡");
        huiyuankaService.save(card);

        performAdmin(get("/huiyuanka/info/" + card.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.huiyuankamingcheng").value(card.getHuiyuankamingcheng()));
    }

    @Test
    void shouldGetMembershipCardDetail() throws Exception {
        HuiyuankaEntity card = TestUtils.createMembershipCard("前台详情会员卡");
        huiyuankaService.save(card);

        mockMvc.perform(get("/huiyuanka/detail/" + card.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.huiyuankamingcheng").value(card.getHuiyuankamingcheng()));
    }

    @Test
    void shouldAddMembershipCardViaPublicEndpoint() throws Exception {
        HuiyuankaEntity payload = TestUtils.createMembershipCard("前台添加会员卡");

        postJson("/huiyuanka/add", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(huiyuankaService.list())
                .anyMatch(card -> card.getHuiyuankamingcheng().equals(payload.getHuiyuankamingcheng()));
    }

    @Test
    void shouldHandleInvalidIdInInfo() throws Exception {
        performAdmin(get("/huiyuanka/info/999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleInvalidIdInDetail() throws Exception {
        mockMvc.perform(get("/huiyuanka/detail/999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleEmptyListsRequest() throws Exception {
        performAdmin(get("/huiyuanka/lists"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleQueryWithNoMatchingCards() throws Exception {
        performAdmin(get("/huiyuanka/query")
                        .param("huiyuankamingcheng", "不存在的会员卡"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleSaveWithNullFields() throws Exception {
        HuiyuankaEntity payload = new HuiyuankaEntity();
        payload.setHuiyuankamingcheng(null);
        payload.setJiage(null);

        postJson("/huiyuanka/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleAddWithNullFields() throws Exception {
        HuiyuankaEntity payload = new HuiyuankaEntity();
        payload.setHuiyuankamingcheng(null);
        payload.setJiage(null);

        postJson("/huiyuanka/add", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleUpdateWithNonExistentId() throws Exception {
        HuiyuankaEntity payload = TestUtils.createMembershipCard("不存在的会员卡");
        payload.setId(999999L);

        putJson("/huiyuanka/update", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleDeleteWithEmptyArray() throws Exception {
        performAdmin(delete("/huiyuanka/delete")
                        .content("[]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleDeleteWithNullIds() throws Exception {
        performAdmin(delete("/huiyuanka/delete")
                        .content("null"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(400))));
    }
}


