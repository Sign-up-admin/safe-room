package com.controller;

import com.controller.support.AbstractControllerIntegrationTest;
import com.entity.DiscussjianshenkechengEntity;
import com.service.DiscussjianshenkechengService;
import com.utils.TestUtils;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class DiscussjianshenkechengControllerTest extends AbstractControllerIntegrationTest {

    @Autowired
    private DiscussjianshenkechengService discussService;

    @Test
    void shouldReturnPagedDiscussions() throws Exception {
        getPage("/discussjianshenkecheng/page")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    void shouldCreateDiscussion() throws Exception {
        DiscussjianshenkechengEntity payload = TestUtils.createCourseDiscussion(600L, 200L);

        postJson("/discussjianshenkecheng/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(discussService.list())
                .anyMatch(record -> record.getContent().equals(payload.getContent()));
    }

    @Test
    void shouldUpdateDiscussionReply() throws Exception {
        DiscussjianshenkechengEntity existing = TestUtils.createCourseDiscussion(600L, 200L);
        discussService.save(existing);

        existing.setReply("管理员回复");

        putJson("/discussjianshenkecheng/update", existing)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        DiscussjianshenkechengEntity updated = discussService.getById(existing.getId());
        assertThat(updated.getReply()).isEqualTo("管理员回复");
    }

    @Test
    void shouldDeleteDiscussions() throws Exception {
        DiscussjianshenkechengEntity first = TestUtils.createCourseDiscussion(600L, 200L);
        DiscussjianshenkechengEntity second = TestUtils.createCourseDiscussion(600L, 200L);
        discussService.save(first);
        discussService.save(second);

        deleteJson("/discussjianshenkecheng/delete", new Long[]{first.getId(), second.getId()})
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(discussService.listByIds(Arrays.asList(first.getId(), second.getId())))
                .isEmpty();
    }
}


