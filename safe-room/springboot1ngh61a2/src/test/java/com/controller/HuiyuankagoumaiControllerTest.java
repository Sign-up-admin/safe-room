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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.anyOf;
import static org.hamcrest.Matchers.is;

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

    @Test
    void shouldAllowPublicListAccess() throws Exception {
        HuiyuankagoumaiEntity purchase = TestUtils.createMembershipPurchase("public001");
        huiyuankagoumaiService.save(purchase);

        mockMvc.perform(get("/huiyuankagoumai/list")
                        .param("page", "1")
                        .param("limit", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    void shouldGetPurchaseLists() throws Exception {
        HuiyuankagoumaiEntity purchase = TestUtils.createMembershipPurchase("lists001");
        huiyuankagoumaiService.save(purchase);

        performAdmin(get("/huiyuankagoumai/lists"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void shouldQueryPurchase() throws Exception {
        HuiyuankagoumaiEntity purchase = TestUtils.createMembershipPurchase("query001");
        huiyuankagoumaiService.save(purchase);

        performAdmin(get("/huiyuankagoumai/query")
                        .param("huiyuankahao", purchase.getHuiyuankahao()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.huiyuankahao").value(purchase.getHuiyuankahao()));
    }

    @Test
    void shouldGetPurchaseInfo() throws Exception {
        HuiyuankagoumaiEntity purchase = TestUtils.createMembershipPurchase("info001");
        huiyuankagoumaiService.save(purchase);

        performAdmin(get("/huiyuankagoumai/info/" + purchase.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.huiyuankahao").value(purchase.getHuiyuankahao()));
    }

    @Test
    void shouldGetPurchaseDetail() throws Exception {
        HuiyuankagoumaiEntity purchase = TestUtils.createMembershipPurchase("detail001");
        huiyuankagoumaiService.save(purchase);

        mockMvc.perform(get("/huiyuankagoumai/detail/" + purchase.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.huiyuankahao").value(purchase.getHuiyuankahao()));
    }

    @Test
    void shouldAddPurchaseViaPublicEndpoint() throws Exception {
        HuiyuankagoumaiEntity payload = TestUtils.createMembershipPurchase("add001");

        postJson("/huiyuankagoumai/add", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(huiyuankagoumaiService.list())
                .anyMatch(record -> record.getHuiyuankahao().equals(payload.getHuiyuankahao()));
    }

    @Test
    void shouldGetValueStatistics() throws Exception {
        HuiyuankagoumaiEntity purchase = TestUtils.createMembershipPurchase("stats001");
        huiyuankagoumaiService.save(purchase);

        performAdmin(get("/huiyuankagoumai/value/ispay/huiyuankahao"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void shouldGetValueMulStatistics() throws Exception {
        HuiyuankagoumaiEntity purchase = TestUtils.createMembershipPurchase("mulstats001");
        huiyuankagoumaiService.save(purchase);

        performAdmin(get("/huiyuankagoumai/valueMul/huiyuankahao")
                        .param("yColumnNameMul", "ispay,jiage"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void shouldGetTimeStatistics() throws Exception {
        HuiyuankagoumaiEntity purchase = TestUtils.createMembershipPurchase("timestats001");
        huiyuankagoumaiService.save(purchase);

        performAdmin(get("/huiyuankagoumai/value/huiyuankahao/ispay/day"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void shouldGetGroupStatistics() throws Exception {
        HuiyuankagoumaiEntity purchase = TestUtils.createMembershipPurchase("groupstats001");
        huiyuankagoumaiService.save(purchase);

        performAdmin(get("/huiyuankagoumai/group/ispay"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void shouldGetPurchaseCount() throws Exception {
        HuiyuankagoumaiEntity purchase1 = TestUtils.createMembershipPurchase("count001");
        HuiyuankagoumaiEntity purchase2 = TestUtils.createMembershipPurchase("count002");
        huiyuankagoumaiService.save(purchase1);
        huiyuankagoumaiService.save(purchase2);

        performAdmin(get("/huiyuankagoumai/count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isNumber());
    }

    @Test
    void shouldHandleInvalidIdInInfo() throws Exception {
        performAdmin(get("/huiyuankagoumai/info/999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(anyOf(is(0), is(500))));
    }

    @Test
    void shouldHandleInvalidIdInDetail() throws Exception {
        mockMvc.perform(get("/huiyuankagoumai/detail/999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(anyOf(is(0), is(500))));
    }
}


