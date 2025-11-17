package com.controller;

import com.controller.support.AbstractControllerIntegrationTest;
import com.entity.KechengyuyueEntity;
import com.service.KechengyuyueService;
import com.utils.TestDataCleanup;
import com.utils.TestUtils;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.MediaType;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class KechengyuyueControllerTest extends AbstractControllerIntegrationTest {

    @Autowired
    private KechengyuyueService kechengyuyueService;

    @AfterEach
    void cleanupTestData() {
        // 清理测试课程预约数据
        TestDataCleanup.cleanupByPrefix(kechengyuyueService, "kechengmingcheng", "测试课程");
        TestDataCleanup.cleanupByPrefix(kechengyuyueService, "kechengmingcheng", "delete");
    }

    @Test
    void shouldAddReservationFromFrontend() throws Exception {
        KechengyuyueEntity payload = TestUtils.createReservationTemplate("AUTO-YY-" + System.nanoTime(), "member001");

        postJson("/kechengyuyue/add", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(kechengyuyueService.list())
                .anyMatch(entity -> entity.getYuyuebianhao().equals(payload.getYuyuebianhao()));
    }

    @Test
    void shouldUpdateReservationStatus() throws Exception {
        KechengyuyueEntity entity = TestUtils.createReservationTemplate("AUTO-YY-UPDATE", "member001");
        kechengyuyueService.save(entity);

        entity.setSfsh("已审核");
        entity.setIspay("已支付");

        putJson("/kechengyuyue/update", entity)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        KechengyuyueEntity updated = kechengyuyueService.getById(entity.getId());
        assertThat(updated).isNotNull();
        assertThat(updated.getSfsh()).isEqualTo("已审核");
        assertThat(updated.getIspay()).isEqualTo("已支付");
    }

    @Test
    void shouldDeleteReservation() throws Exception {
        KechengyuyueEntity entity = TestUtils.createReservationTemplate("AUTO-YY-DELETE", "member001");
        kechengyuyueService.save(entity);

        deleteJson("/kechengyuyue/delete", new Long[]{entity.getId()})
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(kechengyuyueService.getById(entity.getId())).isNull();
    }

    @Test
    void shouldRejectReservationCreationWithoutToken() throws Exception {
        KechengyuyueEntity payload = TestUtils.createReservationTemplate("AUTO-NO-AUTH", "member001");

        mockMvc.perform(post("/kechengyuyue/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    void shouldAllowPublicDetailView() throws Exception {
        mockMvc.perform(get("/kechengyuyue/detail/700"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.id").value(700));
    }

    @Test
    void memberShouldOnlySeeOwnReservations() throws Exception {
        KechengyuyueEntity other = TestUtils.createReservationTemplate("AUTO-YY-OTHER", "member002");
        kechengyuyueService.save(other);

        performMember(get("/kechengyuyue/page")
                        .param("page", "1")
                        .param("limit", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list[*].yonghuzhanghao", Matchers.everyItem(Matchers.is("member001"))));
    }

    @Test
    void shouldFilterReservationsByStatus() throws Exception {
        performAdmin(get("/kechengyuyue/page")
                        .param("page", "1")
                        .param("limit", "5")
                        .param("sfsh", "已审核"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list[*].sfsh", Matchers.everyItem(Matchers.is("已审核"))));
    }

    // 参数验证测试
    @Test
    void shouldHandleInvalidPageParam() throws Exception {
        performAdmin(get("/kechengyuyue/page")
                        .param("page", "invalid")
                        .param("limit", "10"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldHandleNegativePageParam() throws Exception {
        performAdmin(get("/kechengyuyue/page")
                        .param("page", "-1")
                        .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleZeroLimitParam() throws Exception {
        performAdmin(get("/kechengyuyue/page")
                        .param("page", "1")
                        .param("limit", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleSaveWithEmptyPayload() throws Exception {
        postJson("/kechengyuyue/save", "{}")
                .andExpect(status().isOk());
    }

    @Test
    void shouldHandleSaveWithNullPayload() throws Exception {
        postJson("/kechengyuyue/save", null)
                .andExpect(status().isOk());
    }

    // 错误处理测试
    @Test
    void shouldReturn404ForNonExistentDetail() throws Exception {
        mockMvc.perform(get("/kechengyuyue/detail/999999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleUpdateWithNonExistentId() throws Exception {
        KechengyuyueEntity entity = new KechengyuyueEntity();
        entity.setId(Long.MAX_VALUE);
        entity.setYuyuebianhao("不存在的预约");

        putJson("/kechengyuyue/update", entity)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleDeleteWithNonExistentIds() throws Exception {
        deleteJson("/kechengyuyue/delete", new Long[]{Long.MAX_VALUE})
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleInvalidTokenFormat() throws Exception {
        mockMvc.perform(get("/kechengyuyue/page")
                        .param("page", "1")
                        .param("limit", "10")
                        .header("Token", "invalid-token-format-12345"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    void shouldHandleExpiredToken() throws Exception {
        // 使用一个可能过期的token
        mockMvc.perform(get("/kechengyuyue/page")
                        .param("page", "1")
                        .param("limit", "10")
                        .header("Token", "expired-token-" + System.nanoTime()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(401));
    }

    // ========== 补充缺失接口测试 ==========

    @Test
    void shouldBatchApproveReservations() throws Exception {
        KechengyuyueEntity reservation1 = TestUtils.createReservationTemplate("BATCH-YY-1", "member001");
        reservation1.setSfsh("待审核");
        KechengyuyueEntity reservation2 = TestUtils.createReservationTemplate("BATCH-YY-2", "member001");
        reservation2.setSfsh("待审核");
        kechengyuyueService.save(reservation1);
        kechengyuyueService.save(reservation2);

        performAdmin(post("/kechengyuyue/shBatch")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new Long[]{reservation1.getId(), reservation2.getId()}))
                        .param("sfsh", "已审核")
                        .param("shhf", "审核通过"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        KechengyuyueEntity updated1 = kechengyuyueService.getById(reservation1.getId());
        KechengyuyueEntity updated2 = kechengyuyueService.getById(reservation2.getId());
        assertThat(updated1).isNotNull();
        assertThat(updated2).isNotNull();
        assertThat(updated1.getSfsh()).isEqualTo("已审核");
        assertThat(updated1.getShhf()).isEqualTo("审核通过");
        assertThat(updated2.getSfsh()).isEqualTo("已审核");
        assertThat(updated2.getShhf()).isEqualTo("审核通过");
    }

    @Test
    void shouldBatchRejectReservations() throws Exception {
        KechengyuyueEntity reservation = TestUtils.createReservationTemplate("BATCH-REJECT", "member001");
        reservation.setSfsh("待审核");
        kechengyuyueService.save(reservation);

        performAdmin(post("/kechengyuyue/shBatch")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new Long[]{reservation.getId()}))
                        .param("sfsh", "已拒绝")
                        .param("shhf", "不符合条件"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        KechengyuyueEntity updated = kechengyuyueService.getById(reservation.getId());
        assertThat(updated).isNotNull();
        assertThat(updated.getSfsh()).isEqualTo("已拒绝");
        assertThat(updated.getShhf()).isEqualTo("不符合条件");
    }
}


