package com.controller;

import com.controller.support.AbstractControllerIntegrationTest;
import com.entity.JianshenqicaiEntity;
import com.service.JianshenqicaiService;
import com.utils.TestUtils;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class JianshenqicaiControllerTest extends AbstractControllerIntegrationTest {

    @Autowired
    private JianshenqicaiService jianshenqicaiService;

    @Test
    void shouldReturnPagedEquipments() throws Exception {
        getPage("/jianshenqicai/page")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    void shouldCreateEquipment() throws Exception {
        JianshenqicaiEntity payload = TestUtils.createEquipmentTemplate("测试器材");

        postJson("/jianshenqicai/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(jianshenqicaiService.list())
                .anyMatch(item -> item.getQicaimingcheng().equals(payload.getQicaimingcheng()));
    }

    @Test
    void shouldUpdateEquipmentBrand() throws Exception {
        JianshenqicaiEntity existing = TestUtils.createEquipmentTemplate("更新器材");
        jianshenqicaiService.save(existing);

        existing.setPinpai("UpdatedBrand");

        putJson("/jianshenqicai/update", existing)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        JianshenqicaiEntity updated = jianshenqicaiService.getById(existing.getId());
        assertThat(updated.getPinpai()).isEqualTo("UpdatedBrand");
    }

    @Test
    void shouldDeleteEquipments() throws Exception {
        JianshenqicaiEntity first = TestUtils.createEquipmentTemplate("删除器材1");
        JianshenqicaiEntity second = TestUtils.createEquipmentTemplate("删除器材2");
        jianshenqicaiService.save(first);
        jianshenqicaiService.save(second);

        deleteJson("/jianshenqicai/delete", new Long[]{first.getId(), second.getId()})
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(jianshenqicaiService.listByIds(Arrays.asList(first.getId(), second.getId())))
                .isEmpty();
    }
}


