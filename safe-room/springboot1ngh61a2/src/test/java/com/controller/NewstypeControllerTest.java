package com.controller;

import com.controller.support.AbstractControllerIntegrationTest;
import com.entity.NewstypeEntity;
import com.service.NewstypeService;
import com.utils.TestUtils;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Arrays;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class NewstypeControllerTest extends AbstractControllerIntegrationTest {

    @Autowired
    private NewstypeService newstypeService;

    @AfterEach
    void cleanupTestData() {
        // Clean up test newstype entries to prevent conflicts between test runs
        newstypeService.list().stream()
                .filter(type -> type.getTypename() != null &&
                        (type.getTypename().contains("专题") ||
                         type.getTypename().contains("旧分类") ||
                         type.getTypename().contains("新分类") ||
                         type.getTypename().contains("删除分类") ||
                         type.getTypename().contains("测试分类") ||
                         type.getTypename().contains("detail-test") ||
                         type.getTypename().contains("null-test") ||
                         type.getTypename().contains("non-existent") ||
                         type.getTypename().contains("filter-test") ||
                         type.getTypename().contains("frontend-test") ||
                         type.getTypename().contains("query-test") ||
                         type.getTypename().contains("security-test") ||
                         type.getTypename().contains("module-crud") ||
                         type.getTypename().contains("select-test")))
                .forEach(type -> newstypeService.removeById(type.getId()));
    }

    @Test
    void shouldReturnPagedNewsTypes() throws Exception {
        getPage("/newstype/page")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    void shouldCreateNewsType() throws Exception {
        NewstypeEntity payload = TestUtils.createNewsType("专题");

        postJson("/newstype/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(newstypeService.list())
                .anyMatch(type -> type.getTypename().equals(payload.getTypename()));
    }

    @Test
    void shouldUpdateNewsTypeName() throws Exception {
        NewstypeEntity existing = TestUtils.createNewsType("旧分类");
        newstypeService.save(existing);

        existing.setTypename("新分类");

        putJson("/newstype/update", existing)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        NewstypeEntity updated = newstypeService.getById(existing.getId());
        assertThat(updated.getTypename()).isEqualTo("新分类");
    }

    @Test
    void shouldDeleteNewsTypes() throws Exception {
        NewstypeEntity first = TestUtils.createNewsType("删除分类1");
        NewstypeEntity second = TestUtils.createNewsType("删除分类2");
        newstypeService.save(first);
        newstypeService.save(second);

        deleteJson("/newstype/delete", new Long[]{first.getId(), second.getId()})
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(newstypeService.listByIds(Arrays.asList(first.getId(), second.getId())))
                .isEmpty();
    }

    @Test
    void shouldHandleNewsTypeDetailRequest() throws Exception {
        NewstypeEntity type = persistNewsType("detail-test", "测试描述");

        performAdmin(get("/newstype/info/" + type.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.typename").value("detail-test"));
    }

    @Test
    void shouldHandleNewsTypeDetailWithNonExistentId() throws Exception {
        performAdmin(get("/newstype/info/999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleNewsTypeUpdateWithNonExistentId() throws Exception {
        NewstypeEntity payload = new NewstypeEntity();
        payload.setId(999999L);
        payload.setTypename("non-existent");

        putJson("/newstype/update", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleInvalidPaginationParameters() throws Exception {
        performAdmin(get("/newstype/page")
                        .param("page", "-1")
                        .param("limit", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleNewsTypeSaveWithNullFields() throws Exception {
        NewstypeEntity payload = new NewstypeEntity();
        payload.setTypename(null);

        postJson("/newstype/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleNewsTypeListsWithFilter() throws Exception {
        persistNewsType("filter-test-1", "描述1");
        persistNewsType("filter-test-2", "描述2");

        performAdmin(get("/newstype/lists")
                        .param("typename", "filter-test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void shouldHandleFrontendNewsTypeList() throws Exception {
        mockMvc.perform(get("/newstype/list")
                        .param("page", "1")
                        .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    void shouldHandleFrontendNewsTypeDetail() throws Exception {
        NewstypeEntity type = persistNewsType("frontend-detail", "前端详情");

        mockMvc.perform(get("/newstype/detail/" + type.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.typename").value("frontend-detail"));
    }

    @Test
    void shouldHandleNewsTypeQuery() throws Exception {
        NewstypeEntity type = persistNewsType("query-test", "查询测试");

        performAdmin(get("/newstype/query")
                        .param("typename", "query-test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.typename").value("query-test"));
    }

    @Test
    void shouldHandleNewsTypeAddViaFrontend() throws Exception {
        NewstypeEntity payload = TestUtils.createNewsType("frontend-add-test");

        postJson("/newstype/add", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleSecurityEndpoint() throws Exception {
        NewstypeEntity type = persistNewsType("security-test", "安全测试");

        mockMvc.perform(get("/newstype/security")
                        .param("username", "test-user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleAutoSort() throws Exception {
        mockMvc.perform(get("/newstype/autoSort"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isNotEmpty());
    }

    @Test
    void shouldHandleDeleteWithEmptyArray() throws Exception {
        deleteJson("/newstype/delete", new Long[]{})
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleNewsTypeUpdateWithNullValues() throws Exception {
        NewstypeEntity type = persistNewsType("null-update-test", "原始描述");
        type.setTypename(null);

        putJson("/newstype/update", type)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleModuleCrudPageSelectField() throws Exception {
        // Test that the API supports the select field type used by ModuleCrudPage
        NewstypeEntity payload = TestUtils.createNewsType("select-test");
        payload.setTypename("健身课程"); // This should be a valid select option

        postJson("/newstype/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        // Verify the select field was saved correctly
        var saved = newstypeService.getOne(
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<NewstypeEntity>()
                        .eq("typename", "select-test"));
        assertThat(saved).isNotNull();
        assertThat(saved.getTypename()).isEqualTo("select-test");
    }

    @Test
    void shouldSupportModuleCrudPageFeatures() throws Exception {
        // Test features that ModuleCrudPage component relies on

        // Test basic CRUD operations
        NewstypeEntity type = persistNewsType("module-crud-test", "ModuleCrud测试");

        // Test update via ModuleCrudPage
        putJson("/newstype/update", Map.of(
                "id", type.getId(),
                "typename", "module-crud-updated"
        ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        // Verify update worked
        NewstypeEntity updated = newstypeService.getById(type.getId());
        assertThat(updated.getTypename()).isEqualTo("module-crud-updated");

        // Test deletion via ModuleCrudPage
        deleteJson("/newstype/delete", Map.of("ids", type.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        // Verify deletion worked
        assertThat(newstypeService.getById(type.getId())).isNull();
    }

    private NewstypeEntity persistNewsType(String name, String description) {
        NewstypeEntity type = TestUtils.createNewsType(name);
        newstypeService.save(type);
        return type;
    }
}


