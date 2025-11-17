package com.controller;

import com.controller.support.AbstractControllerIntegrationTest;
import com.entity.HuiyuanxufeiEntity;
import com.service.HuiyuanxufeiService;
import com.utils.TestUtils;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class HuiyuanxufeiControllerTest extends AbstractControllerIntegrationTest {

    @Autowired
    private HuiyuanxufeiService huiyuanxufeiService;

    @Test
    void shouldReturnPagedRenewals() throws Exception {
        getPage("/huiyuanxufei/page")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    void shouldCreateRenewalRecord() throws Exception {
        HuiyuanxufeiEntity payload = TestUtils.createMembershipRenewal("member001");

        postJson("/huiyuanxufei/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(huiyuanxufeiService.list())
                .anyMatch(record -> record.getJiaofeibianhao().equals(payload.getJiaofeibianhao()));
    }

    @Test
    void shouldUpdateRenewalPaymentStatus() throws Exception {
        HuiyuanxufeiEntity existing = TestUtils.createMembershipRenewal("member002");
        huiyuanxufeiService.save(existing);

        existing.setIspay("已退款");

        putJson("/huiyuanxufei/update", existing)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        HuiyuanxufeiEntity updated = huiyuanxufeiService.getById(existing.getId());
        assertThat(updated.getIspay()).isEqualTo("已退款");
    }

    @Test
    void shouldDeleteRenewalRecords() throws Exception {
        HuiyuanxufeiEntity first = TestUtils.createMembershipRenewal("member003");
        HuiyuanxufeiEntity second = TestUtils.createMembershipRenewal("member004");
        huiyuanxufeiService.save(first);
        huiyuanxufeiService.save(second);

        deleteJson("/huiyuanxufei/delete", new Long[]{first.getId(), second.getId()})
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(huiyuanxufeiService.listByIds(Arrays.asList(first.getId(), second.getId())))
                .isEmpty();
    }
}


