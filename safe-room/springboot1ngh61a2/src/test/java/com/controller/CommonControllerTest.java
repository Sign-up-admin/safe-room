package com.controller;

import com.controller.support.AbstractControllerIntegrationTest;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Tags({
    @Tag("integration"),
    @Tag("controller"),
    @Tag("common")
})
class CommonControllerTest extends AbstractControllerIntegrationTest {

    @Test
    void shouldReturnServiceStatus() throws Exception {
        performAdmin(get("/service-status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.server").exists())
                .andExpect(jsonPath("$.data.database").exists());
    }

    @Test
    void shouldHandleOptionRequest() throws Exception {
        performAdmin(get("/option/yonghu/yonghuzhanghao"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void shouldHandleFollowByOptionRequest() throws Exception {
        performAdmin(get("/follow/yonghu/yonghuzhanghao")
                .param("columnValue", "test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleGroupRequest() throws Exception {
        performAdmin(get("/group/yonghu/yonghuzhanghao"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }
}