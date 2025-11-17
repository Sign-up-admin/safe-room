package com.controller;

import com.controller.support.AbstractControllerIntegrationTest;
import com.entity.DaoqitixingEntity;
import com.service.DaoqitixingService;
import com.utils.TestUtils;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class DaoqitixingControllerTest extends AbstractControllerIntegrationTest {

    @Autowired
    private DaoqitixingService daoqitixingService;

    @Test
    void shouldReturnPagedReminders() throws Exception {
        getPage("/daoqitixing/page")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    void shouldCreateReminder() throws Exception {
        DaoqitixingEntity payload = TestUtils.createExpirationReminder("member001");

        postJson("/daoqitixing/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(daoqitixingService.list())
                .anyMatch(record -> payload.getYonghuzhanghao().equals(record.getYonghuzhanghao())
                        && record.getBeizhu() != null
                        && record.getBeizhu().equals(payload.getBeizhu()));
    }

    @Test
    void shouldUpdateReminderNote() throws Exception {
        DaoqitixingEntity existing = TestUtils.createExpirationReminder("member002");
        daoqitixingService.save(existing);

        existing.setBeizhu("请尽快续费");

        putJson("/daoqitixing/update", existing)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        DaoqitixingEntity updated = daoqitixingService.getById(existing.getId());
        assertThat(updated.getBeizhu()).isEqualTo("请尽快续费");
    }

    @Test
    void shouldDeleteReminders() throws Exception {
        DaoqitixingEntity first = TestUtils.createExpirationReminder("member003");
        DaoqitixingEntity second = TestUtils.createExpirationReminder("member004");
        daoqitixingService.save(first);
        daoqitixingService.save(second);

        deleteJson("/daoqitixing/delete", new Long[]{first.getId(), second.getId()})
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(daoqitixingService.listByIds(Arrays.asList(first.getId(), second.getId())))
                .isEmpty();
    }
}


