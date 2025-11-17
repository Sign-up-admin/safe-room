package com.controller;

import com.controller.support.AbstractControllerIntegrationTest;
import com.entity.SijiaoyuyueEntity;
import com.service.SijiaoyuyueService;
import com.utils.TestUtils;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Arrays;

import org.springframework.http.MediaType;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SijiaoyuyueControllerTest extends AbstractControllerIntegrationTest {

    @Autowired
    private SijiaoyuyueService sijiaoyuyueService;

    @Test
    void shouldReturnPagedPrivateReservations() throws Exception {
        getPage("/sijiaoyuyue/page")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    void shouldCreatePrivateReservation() throws Exception {
        SijiaoyuyueEntity payload = TestUtils.createPrivateReservation("member001");

        postJson("/sijiaoyuyue/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(sijiaoyuyueService.list())
                .anyMatch(record -> record.getYuyuebianhao().equals(payload.getYuyuebianhao()));
    }

    @Test
    void shouldUpdateReservationStatus() throws Exception {
        SijiaoyuyueEntity existing = TestUtils.createPrivateReservation("member002");
        sijiaoyuyueService.save(existing);

        existing.setSfsh("已审核");
        existing.setIspay("已支付");

        putJson("/sijiaoyuyue/update", existing)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        SijiaoyuyueEntity updated = sijiaoyuyueService.getById(existing.getId());
        assertThat(updated.getSfsh()).isEqualTo("已审核");
        assertThat(updated.getIspay()).isEqualTo("已支付");
    }

    @Test
    void shouldDeletePrivateReservations() throws Exception {
        SijiaoyuyueEntity first = TestUtils.createPrivateReservation("member003");
        SijiaoyuyueEntity second = TestUtils.createPrivateReservation("member004");
        sijiaoyuyueService.save(first);
        sijiaoyuyueService.save(second);

        deleteJson("/sijiaoyuyue/delete", new Long[]{first.getId(), second.getId()})
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(sijiaoyuyueService.listByIds(Arrays.asList(first.getId(), second.getId())))
                .isEmpty();
    }

    // ========== 补充缺失接口测试 ==========

    @Test
    void shouldBatchApprovePrivateReservations() throws Exception {
        SijiaoyuyueEntity reservation1 = TestUtils.createPrivateReservation("member001");
        reservation1.setSfsh("待审核");
        SijiaoyuyueEntity reservation2 = TestUtils.createPrivateReservation("member001");
        reservation2.setSfsh("待审核");
        sijiaoyuyueService.save(reservation1);
        sijiaoyuyueService.save(reservation2);

        performAdmin(post("/sijiaoyuyue/shBatch")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new Long[]{reservation1.getId(), reservation2.getId()}))
                        .param("sfsh", "已审核")
                        .param("shhf", "审核通过"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        SijiaoyuyueEntity updated1 = sijiaoyuyueService.getById(reservation1.getId());
        SijiaoyuyueEntity updated2 = sijiaoyuyueService.getById(reservation2.getId());
        assertThat(updated1.getSfsh()).isEqualTo("已审核");
        assertThat(updated1.getShhf()).isEqualTo("审核通过");
        assertThat(updated2.getSfsh()).isEqualTo("已审核");
        assertThat(updated2.getShhf()).isEqualTo("审核通过");
    }

    @Test
    void shouldBatchRejectPrivateReservations() throws Exception {
        SijiaoyuyueEntity reservation = TestUtils.createPrivateReservation("member002");
        reservation.setSfsh("待审核");
        sijiaoyuyueService.save(reservation);

        performAdmin(post("/sijiaoyuyue/shBatch")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new Long[]{reservation.getId()}))
                        .param("sfsh", "已拒绝")
                        .param("shhf", "时间冲突"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        SijiaoyuyueEntity updated = sijiaoyuyueService.getById(reservation.getId());
        assertThat(updated.getSfsh()).isEqualTo("已拒绝");
        assertThat(updated.getShhf()).isEqualTo("时间冲突");
    }
}


