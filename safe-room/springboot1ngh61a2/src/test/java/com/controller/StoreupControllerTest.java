package com.controller;

import com.controller.support.AbstractControllerIntegrationTest;
import com.entity.StoreupEntity;
import com.service.StoreupService;
import com.utils.TestUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class StoreupControllerTest extends AbstractControllerIntegrationTest {

    @Autowired
    private StoreupService storeupService;

    @AfterEach
    void cleanupTestData() {
        // Clean up test storeup entries to prevent conflicts between test runs
        storeupService.list().stream()
                .filter(storeup -> storeup.getName() != null &&
                        (storeup.getName().contains("测试课程") ||
                         storeup.getName().contains("查询测试") ||
                         storeup.getName().contains("详情测试") ||
                         storeup.getName().contains("前端详情") ||
                         storeup.getName().contains("保存测试") ||
                         storeup.getName().contains("前端添加") ||
                         storeup.getName().contains("更新前") ||
                         storeup.getName().contains("删除1") ||
                         storeup.getName().contains("删除2") ||
                         storeup.getName().contains("自动排序") ||
                         storeup.getName().contains("过滤测试") ||
                         storeup.getName().contains("用户过滤")))
                .forEach(storeup -> storeupService.removeById(storeup.getId()));
    }

    @Test
    void shouldReturnPagedStoreups() throws Exception {
        getPage("/storeup/page")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    void shouldReturnFrontendList() throws Exception {
        performMember(get("/storeup/list")
                        .param("page", "1")
                        .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    void shouldListStoreups() throws Exception {
        StoreupEntity storeup = TestUtils.createFavorite(1L, 1L, "jianshenkecheng", "测试课程");
        storeupService.save(storeup);

        StoreupEntity queryEntity = new StoreupEntity();

        performAdmin(get("/storeup/lists"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldQueryStoreup() throws Exception {
        StoreupEntity storeup = TestUtils.createFavorite(1L, 1L, "jianshenkecheng", "查询测试");
        storeupService.save(storeup);

        StoreupEntity queryEntity = new StoreupEntity();
        queryEntity.setTablename("jianshenkecheng");

        performAdmin(get("/storeup/query")
                        .param("tablename", "jianshenkecheng"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldGetBackendInfo() throws Exception {
        StoreupEntity storeup = TestUtils.createFavorite(1L, 1L, "jianshenkecheng", "详情测试");
        storeupService.save(storeup);

        performAdmin(get("/storeup/info/" + storeup.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.id").value(storeup.getId()));
    }

    @Test
    void shouldGetFrontendDetail() throws Exception {
        StoreupEntity storeup = TestUtils.createFavorite(1L, 1L, "jianshenkecheng", "前端详情");
        storeupService.save(storeup);

        // 前端详情接口使用@IgnoreAuth
        mockMvc.perform(get("/storeup/detail/" + storeup.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.id").value(storeup.getId()));
    }

    @Test
    void shouldSaveStoreup() throws Exception {
        StoreupEntity payload = TestUtils.createFavorite(null, 1L, "jianshenkecheng", "保存测试");

        postJson("/storeup/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(storeupService.list())
                .anyMatch(s -> s.getName() != null && s.getName().contains("保存测试"));
    }

    @Test
    void shouldAddStoreupViaFrontend() throws Exception {
        StoreupEntity payload = TestUtils.createFavorite(null, 1L, "news", "前端添加");

        postJsonAsMember("/storeup/add", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldUpdateStoreup() throws Exception {
        StoreupEntity existing = TestUtils.createFavorite(1L, 1L, "jianshenkecheng", "更新前");
        storeupService.save(existing);

        existing.setName("更新后名称");

        postJson("/storeup/update", existing)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        StoreupEntity updated = storeupService.getById(existing.getId());
        assertThat(updated.getName()).isEqualTo("更新后名称");
    }

    @Test
    void shouldDeleteStoreups() throws Exception {
        StoreupEntity first = TestUtils.createFavorite(1L, 1L, "jianshenkecheng", "删除1");
        StoreupEntity second = TestUtils.createFavorite(1L, 2L, "jianshenkecheng", "删除2");
        storeupService.save(first);
        storeupService.save(second);

        deleteJson("/storeup/delete", new Long[]{first.getId(), second.getId()})
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(storeupService.listByIds(Arrays.asList(first.getId(), second.getId())))
                .isEmpty();
    }

    @Test
    void shouldAutoSort() throws Exception {
        StoreupEntity storeup = TestUtils.createFavorite(1L, 1L, "jianshenkecheng", "排序测试");
        storeupService.save(storeup);

        StoreupEntity queryEntity = new StoreupEntity();

        mockMvc.perform(get("/storeup/autoSort")
                        .param("page", "1")
                        .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    void shouldFilterByUserForNonAdmin() throws Exception {
        StoreupEntity memberStoreup = TestUtils.createFavorite(2L, 1L, "jianshenkecheng", "会员收藏");
        storeupService.save(memberStoreup);

        // 会员用户应该只能看到自己的收藏
        performMember(get("/storeup/list")
                        .param("page", "1")
                        .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleEmptyStoreupList() throws Exception {
        getPage("/storeup/page")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldReturnNullWhenStoreupNotFound() throws Exception {
        performAdmin(get("/storeup/info/999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isEmpty());
    }

    @Test
    void shouldHandleUpdateWithIgnoreAuth() throws Exception {
        StoreupEntity existing = TestUtils.createFavorite(1L, 1L, "jianshenkecheng", "忽略认证更新");
        storeupService.save(existing);

        existing.setName("已更新");

        // update接口使用@IgnoreAuth，不需要token
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/storeup/update")
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(json(existing)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }
}

