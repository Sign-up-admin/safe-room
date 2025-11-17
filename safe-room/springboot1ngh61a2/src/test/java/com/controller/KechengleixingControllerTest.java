package com.controller;

import com.controller.support.AbstractControllerIntegrationTest;
import com.entity.KechengleixingEntity;
import com.service.KechengleixingService;
import com.utils.TestUtils;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class KechengleixingControllerTest extends AbstractControllerIntegrationTest {

    @Autowired
    private KechengleixingService kechengleixingService;

    @Test
    void shouldReturnPagedCourseTypes() throws Exception {
        getPage("/kechengleixing/page")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    void shouldCreateCourseType() throws Exception {
        KechengleixingEntity payload = TestUtils.createCourseTypeTemplate("特色课程");

        postJson("/kechengleixing/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(kechengleixingService.list())
                .anyMatch(type -> type.getKechengleixing().equals(payload.getKechengleixing()));
    }

    @Test
    void shouldUpdateCourseTypeName() throws Exception {
        KechengleixingEntity existing = TestUtils.createCourseTypeTemplate("临时类型");
        kechengleixingService.save(existing);

        existing.setKechengleixing("更新后的类型");

        putJson("/kechengleixing/update", existing)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        KechengleixingEntity updated = kechengleixingService.getById(existing.getId());
        assertThat(updated.getKechengleixing()).isEqualTo("更新后的类型");
    }

    @Test
    void shouldDeleteCourseTypes() throws Exception {
        KechengleixingEntity first = TestUtils.createCourseTypeTemplate("删除类型1");
        KechengleixingEntity second = TestUtils.createCourseTypeTemplate("删除类型2");
        kechengleixingService.save(first);
        kechengleixingService.save(second);

        deleteJson("/kechengleixing/delete", new Long[]{first.getId(), second.getId()})
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(kechengleixingService.listByIds(Arrays.asList(first.getId(), second.getId())))
                .isEmpty();
    }
}


