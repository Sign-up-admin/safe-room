package com.controller;

import com.controller.support.AbstractControllerIntegrationTest;
import com.entity.HuiyuankagoumaiEntity;
import com.service.HuiyuankagoumaiService;
import com.utils.TestDataCleanup;
import com.utils.TestUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class HuiyuankagoumaiControllerTest extends AbstractControllerIntegrationTest {

    @Autowired
    private HuiyuankagoumaiService huiyuankagoumaiService;

    @AfterEach
    void cleanupTestData() {
        // 清理测试会员卡购买记录数据
        TestDataCleanup.cleanupByPrefix(huiyuankagoumaiService, "huiyuankahao", "member");
        TestDataCleanup.cleanupByPrefix(huiyuankagoumaiService, "huiyuankahao", "delete");
    }

    @Test
    void shouldReturnPagedPurchases() throws Exception {
        getPage("/huiyuankagoumai/page")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    void shouldCreateMembershipPurchase() throws Exception {
        HuiyuankagoumaiEntity payload = TestUtils.createMembershipPurchase("member001");

        postJson("/huiyuankagoumai/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(huiyuankagoumaiService.list())
                .anyMatch(record -> record.getHuiyuankahao().equals(payload.getHuiyuankahao()));
    }

    @Test
    void shouldUpdatePaymentStatus() throws Exception {
        HuiyuankagoumaiEntity existing = TestUtils.createMembershipPurchase("member002");
        huiyuankagoumaiService.save(existing);

        existing.setIspay("已退款");

        putJson("/huiyuankagoumai/update", existing)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        HuiyuankagoumaiEntity updated = huiyuankagoumaiService.getById(existing.getId());
        assertThat(updated.getIspay()).isEqualTo("已退款");
    }

    @Test
    void shouldDeletePurchases() throws Exception {
        HuiyuankagoumaiEntity first = TestUtils.createMembershipPurchase("member003");
        HuiyuankagoumaiEntity second = TestUtils.createMembershipPurchase("member004");
        huiyuankagoumaiService.save(first);
        huiyuankagoumaiService.save(second);

        deleteJson("/huiyuankagoumai/delete", new Long[]{first.getId(), second.getId()})
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(huiyuankagoumaiService.listByIds(Arrays.asList(first.getId(), second.getId())))
                .isEmpty();
    }
}


