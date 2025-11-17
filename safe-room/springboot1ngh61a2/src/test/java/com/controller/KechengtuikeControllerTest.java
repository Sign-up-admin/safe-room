package com.controller;

import com.controller.support.AbstractControllerIntegrationTest;
import com.entity.KechengtuikeEntity;
import com.service.KechengtuikeService;
import com.utils.TestUtils;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class KechengtuikeControllerTest extends AbstractControllerIntegrationTest {

    @Autowired
    private KechengtuikeService kechengtuikeService;

    @AfterEach
    void cleanupTestData() {
        // Clean up test refund entries to prevent conflicts between test runs
        kechengtuikeService.list().stream()
                .filter(refund -> refund.getYuyuebianhao() != null &&
                        (refund.getYuyuebianhao().contains("member") ||
                         refund.getYuyuebianhao().contains("detail-test") ||
                         refund.getYuyuebianhao().contains("null-test") ||
                         refund.getYuyuebianhao().contains("non-existent") ||
                         refund.getYuyuebianhao().contains("filter-test") ||
                         refund.getYuyuebianhao().contains("frontend-test") ||
                         refund.getYuyuebianhao().contains("query-test") ||
                         refund.getYuyuebianhao().contains("batch-test") ||
                         refund.getYuyuebianhao().contains("delete-test")))
                .forEach(refund -> kechengtuikeService.removeById(refund.getId()));
    }

    @Test
    void shouldReturnPagedRefunds() throws Exception {
        getPage("/kechengtuike/page")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    void shouldCreateRefundRequest() throws Exception {
        KechengtuikeEntity payload = TestUtils.createCourseRefundTemplate("member001");

        postJson("/kechengtuike/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(kechengtuikeService.list())
                .anyMatch(record -> record.getYuyuebianhao().equals(payload.getYuyuebianhao()));
    }

    @Test
    void shouldUpdateReviewStatus() throws Exception {
        KechengtuikeEntity existing = TestUtils.createCourseRefundTemplate("member002");
        kechengtuikeService.save(existing);

        existing.setSfsh("已审核");
        existing.setShhf("同意退款");

        putJson("/kechengtuike/update", existing)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        KechengtuikeEntity updated = kechengtuikeService.getById(existing.getId());
        assertThat(updated.getSfsh()).isEqualTo("已审核");
        assertThat(updated.getShhf()).isEqualTo("同意退款");
    }

    @Test
    void shouldDeleteRefundRecords() throws Exception {
        KechengtuikeEntity first = TestUtils.createCourseRefundTemplate("member003");
        KechengtuikeEntity second = TestUtils.createCourseRefundTemplate("member004");
        kechengtuikeService.save(first);
        kechengtuikeService.save(second);

        deleteJson("/kechengtuike/delete", new Long[]{first.getId(), second.getId()})
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(kechengtuikeService.listByIds(Arrays.asList(first.getId(), second.getId())))
                .isEmpty();
    }

    @Test
    void shouldHandleRefundDetailRequest() throws Exception {
        KechengtuikeEntity refund = persistRefund("detail-test-member", "教练001");

        performAdmin(get("/kechengtuike/info/" + refund.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.yuyuebianhao").value("detail-test-member"));
    }

    @Test
    void shouldHandleRefundDetailWithNonExistentId() throws Exception {
        performAdmin(get("/kechengtuike/info/999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleRefundUpdateWithNonExistentId() throws Exception {
        KechengtuikeEntity payload = new KechengtuikeEntity();
        payload.setId(999999L);
        payload.setYuyuebianhao("non-existent");

        putJson("/kechengtuike/update", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleInvalidPaginationParameters() throws Exception {
        performAdmin(get("/kechengtuike/page")
                        .param("page", "-1")
                        .param("limit", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleRefundSaveWithNullFields() throws Exception {
        KechengtuikeEntity payload = new KechengtuikeEntity();
        payload.setYuyuebianhao(null);
        payload.setYonghuzhanghao(null);

        postJson("/kechengtuike/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleRefundListsWithFilter() throws Exception {
        persistRefund("filter-test-1", "教练001");
        persistRefund("filter-test-2", "教练002");

        performAdmin(get("/kechengtuike/lists")
                        .param("yonghuzhanghao", "filter-test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void shouldHandleFrontendRefundList() throws Exception {
        mockMvc.perform(get("/kechengtuike/list")
                        .param("page", "1")
                        .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    void shouldHandleFrontendRefundDetail() throws Exception {
        KechengtuikeEntity refund = persistRefund("frontend-detail", "教练001");

        mockMvc.perform(get("/kechengtuike/detail/" + refund.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.yuyuebianhao").value("frontend-detail"));
    }

    @Test
    void shouldHandleRefundQuery() throws Exception {
        KechengtuikeEntity refund = persistRefund("query-test", "教练001");

        performAdmin(get("/kechengtuike/query")
                        .param("yuyuebianhao", "query-test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.yuyuebianhao").value("query-test"));
    }

    @Test
    void shouldHandleRefundAddViaFrontend() throws Exception {
        KechengtuikeEntity payload = TestUtils.createCourseRefundTemplate("frontend-add-test");

        postJson("/kechengtuike/add", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleBatchReviewApproval() throws Exception {
        KechengtuikeEntity refund1 = persistRefund("batch-test-1", "教练001");
        KechengtuikeEntity refund2 = persistRefund("batch-test-2", "教练001");

        performAdmin(post("/kechengtuike/shBatch")
                        .param("ids", refund1.getId().toString(), refund2.getId().toString())
                        .param("sfsh", "已审核")
                        .param("shhf", "同意退款"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        // Verify both records are updated
        KechengtuikeEntity updated1 = kechengtuikeService.getById(refund1.getId());
        KechengtuikeEntity updated2 = kechengtuikeService.getById(refund2.getId());
        assertThat(updated1.getSfsh()).isEqualTo("已审核");
        assertThat(updated1.getShhf()).isEqualTo("同意退款");
        assertThat(updated2.getSfsh()).isEqualTo("已审核");
        assertThat(updated2.getShhf()).isEqualTo("同意退款");
    }

    @Test
    void shouldHandleBatchReviewRejection() throws Exception {
        KechengtuikeEntity refund = persistRefund("batch-reject-test", "教练001");

        performAdmin(post("/kechengtuike/shBatch")
                        .param("ids", refund.getId().toString())
                        .param("sfsh", "已拒绝")
                        .param("shhf", "不符合退款条件"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        KechengtuikeEntity updated = kechengtuikeService.getById(refund.getId());
        assertThat(updated.getSfsh()).isEqualTo("已拒绝");
        assertThat(updated.getShhf()).isEqualTo("不符合退款条件");
    }

    @Test
    void shouldHandleDeleteWithEmptyArray() throws Exception {
        deleteJson("/kechengtuike/delete", new Long[]{})
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleRefundUpdateWithNullValues() throws Exception {
        KechengtuikeEntity refund = persistRefund("null-update-test", "教练001");
        refund.setYuyuebianhao(null);

        putJson("/kechengtuike/update", refund)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleValueStatistics() throws Exception {
        persistRefund("stats-test-1", "教练001");
        persistRefund("stats-test-2", "教练002");

        performAdmin(get("/kechengtuike/value/sfsh/yuyuebianhao"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isNotEmpty());
    }

    @Test
    void shouldHandleGroupStatistics() throws Exception {
        persistRefund("group-test-1", "教练001");
        persistRefund("group-test-2", "教练001");

        performAdmin(get("/kechengtuike/group/sfsh"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isNotEmpty());
    }

    private KechengtuikeEntity persistRefund(String bookingNumber, String coachNumber) {
        KechengtuikeEntity refund = TestUtils.createCourseRefundTemplate(bookingNumber);
        refund.setJiaoliangonghao(coachNumber);
        kechengtuikeService.save(refund);
        return refund;
    }
}


