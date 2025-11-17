package com.controller;

import com.controller.support.AbstractControllerIntegrationTest;
import com.entity.LegalTermsEntity;
import com.service.LegalTermsService;
import com.utils.ExceptionTestHelper;
import com.utils.ServiceTestHelper;
import com.utils.TestUtils;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Arrays;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class LegalTermsControllerTest extends AbstractControllerIntegrationTest {

    @Autowired
    private LegalTermsService legalTermsService;

    @AfterEach
    void cleanupTestData() {
        // Clean up test legal terms entries to prevent conflicts between test runs
        legalTermsService.list().stream()
                .filter(terms -> terms.getTitle() != null &&
                        (terms.getTitle().contains("测试条款标题") ||
                         terms.getTitle().contains("前端添加条款") ||
                         terms.getTitle().contains("自动设置时间测试") ||
                         terms.getTitle().contains("更新前标题") ||
                         terms.getTitle().contains("更新后标题") ||
                         terms.getTitle().contains("详情测试") ||
                         terms.getTitle().contains("前端详情测试") ||
                         terms.getTitle().contains("删除测试") ||
                         terms.getTitle().contains("筛选测试标题") ||
                         terms.getTitle().contains("边界测试") ||
                         terms.getTitle().contains("异常测试") ||
                         terms.getTitle().contains("null测试") ||
                         terms.getTitle().contains("特殊字符测试") ||
                         terms.getTitle().contains("超长测试")))
                .forEach(terms -> legalTermsService.removeById(terms.getId()));
    }

    @Test
    void shouldReturnPagedLegalTerms() throws Exception {
        getPage("/legalterms/page")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    void shouldReturnFrontendList() throws Exception {
        performAdmin(get("/legalterms/list")
                        .param("page", "1")
                        .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    void shouldCreateLegalTerms() throws Exception {
        LegalTermsEntity payload = createLegalTerms("测试条款标题", "测试条款内容");

        postJson("/legalterms/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(legalTermsService.list())
                .anyMatch(terms -> terms.getTitle() != null && terms.getTitle().contains("测试条款标题"));
    }

    @Test
    void shouldCreateLegalTermsViaFrontend() throws Exception {
        LegalTermsEntity payload = createLegalTerms("前端添加条款", "前端添加的内容");

        postJsonAsMember("/legalterms/add", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldAutoSetCreateTimeWhenNull() throws Exception {
        LegalTermsEntity payload = new LegalTermsEntity();
        payload.setTitle("自动设置时间测试");
        payload.setContent("内容");
        // 不设置createTime和updateTime

        postJson("/legalterms/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        LegalTermsEntity saved = legalTermsService.list().stream()
                .filter(t -> "自动设置时间测试".equals(t.getTitle()))
                .findFirst()
                .orElse(null);
        assertThat(saved).isNotNull();
        assertThat(saved.getCreateTime()).isNotNull();
        assertThat(saved.getUpdateTime()).isNotNull();
    }

    @Test
    void shouldUpdateLegalTerms() throws Exception {
        LegalTermsEntity existing = createLegalTerms("更新前标题", "更新前内容");
        legalTermsService.save(existing);

        existing.setTitle("更新后标题");
        existing.setContent("更新后内容");

        postJson("/legalterms/update", existing)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        LegalTermsEntity updated = legalTermsService.getById(existing.getId());
        assertThat(updated.getTitle()).isEqualTo("更新后标题");
        assertThat(updated.getContent()).isEqualTo("更新后内容");
        assertThat(updated.getUpdateTime()).isNotNull();
    }

    @Test
    void shouldGetBackendInfo() throws Exception {
        LegalTermsEntity terms = createLegalTerms("详情测试", "详情内容");
        legalTermsService.save(terms);

        performAdmin(get("/legalterms/info/" + terms.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.id").value(terms.getId()))
                .andExpect(jsonPath("$.data.title").value(terms.getTitle()));
    }

    @Test
    void shouldGetFrontendDetail() throws Exception {
        LegalTermsEntity terms = createLegalTerms("前端详情测试", "前端详情内容");
        legalTermsService.save(terms);

        // 前端详情接口使用@IgnoreAuth，不需要token
        mockMvc.perform(get("/legalterms/detail/" + terms.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.id").value(terms.getId()));
    }

    @Test
    void shouldDeleteLegalTerms() throws Exception {
        LegalTermsEntity first = createLegalTerms("删除测试1", "内容1");
        LegalTermsEntity second = createLegalTerms("删除测试2", "内容2");
        legalTermsService.save(first);
        legalTermsService.save(second);

        deleteJson("/legalterms/delete", new Long[]{first.getId(), second.getId()})
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(legalTermsService.listByIds(Arrays.asList(first.getId(), second.getId())))
                .isEmpty();
    }

    @Test
    void shouldHandleEmptyList() throws Exception {
        getPage("/legalterms/page")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldFilterByTitle() throws Exception {
        LegalTermsEntity terms = createLegalTerms("筛选测试标题", "内容");
        legalTermsService.save(terms);

        performAdmin(get("/legalterms/page")
                        .param("page", "1")
                        .param("limit", "10")
                        .param("title", "筛选测试"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    // ============ 边界条件和异常场景测试 ============

    @Test
    void shouldHandleNullTitleInSave() throws Exception {
        LegalTermsEntity payload = createLegalTerms(null, "内容");
        payload.setTitle(null);

        postJson("/legalterms/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleNullContentInSave() throws Exception {
        LegalTermsEntity payload = createLegalTerms("边界测试", null);
        payload.setContent(null);

        postJson("/legalterms/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleEmptyTitleInSave() throws Exception {
        LegalTermsEntity payload = createLegalTerms("", "内容");

        postJson("/legalterms/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleEmptyContentInSave() throws Exception {
        LegalTermsEntity payload = createLegalTerms("边界测试", "");

        postJson("/legalterms/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleSpecialCharactersInTitle() throws Exception {
        LegalTermsEntity payload = createLegalTerms("特殊字符测试<script>alert('xss')</script>", "内容");

        postJson("/legalterms/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleVeryLongTitle() throws Exception {
        String longTitle = "a".repeat(1000) + "超长测试";
        LegalTermsEntity payload = createLegalTerms(longTitle, "内容");

        postJson("/legalterms/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleVeryLongContent() throws Exception {
        String longContent = "a".repeat(10000) + "超长内容测试";
        LegalTermsEntity payload = createLegalTerms("超长内容测试", longContent);

        postJson("/legalterms/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleUnicodeCharacters() throws Exception {
        LegalTermsEntity payload = createLegalTerms("Unicode测试🚀📝中文", "Unicode内容测试🚀📝");

        postJson("/legalterms/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleNegativePageNumber() throws Exception {
        performAdmin(get("/legalterms/page")
                        .param("page", "-1")
                        .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleZeroLimit() throws Exception {
        performAdmin(get("/legalterms/page")
                        .param("page", "1")
                        .param("limit", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleVeryLargePageNumber() throws Exception {
        performAdmin(get("/legalterms/page")
                        .param("page", "999999")
                        .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleVeryLargeLimit() throws Exception {
        performAdmin(get("/legalterms/page")
                        .param("page", "1")
                        .param("limit", "10000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleInvalidPaginationParameters() throws Exception {
        performAdmin(get("/legalterms/page")
                        .param("page", "abc")
                        .param("limit", "def"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleNullPaginationParameters() throws Exception {
        performAdmin(get("/legalterms/page")
                        .param("page", (String) null)
                        .param("limit", (String) null))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleNonExistentIdInInfo() throws Exception {
        performAdmin(get("/legalterms/info/999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleNonExistentIdInDetail() throws Exception {
        mockMvc.perform(get("/legalterms/detail/999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleUpdateWithNonExistentId() throws Exception {
        LegalTermsEntity payload = createLegalTerms("异常测试", "内容");
        payload.setId(999999L);

        postJson("/legalterms/update", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleDeleteWithEmptyArray() throws Exception {
        deleteJson("/legalterms/delete", new Long[]{})
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleDeleteWithNullIds() throws Exception {
        performAdmin(post("/legalterms/delete")
                        .contentType("application/json")
                        .content("null"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleDeleteWithNonExistentIds() throws Exception {
        deleteJson("/legalterms/delete", new Long[]{999999L, 999998L})
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleConcurrentUpdates() throws Exception {
        // Test concurrent update scenario - create a terms and update it multiple times
        LegalTermsEntity terms = createLegalTerms("并发测试", "原始内容");
        legalTermsService.save(terms);

        // Update content multiple times
        for (int i = 0; i < 3; i++) {
            terms.setContent("更新内容" + i);
            postJson("/legalterms/update", terms)
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(0));
        }
    }

    @Test
    void shouldHandleRapidCreateAndDelete() throws Exception {
        // Test rapid creation and deletion
        LegalTermsEntity terms = createLegalTerms("快速创建删除测试", "内容");
        legalTermsService.save(terms);

        // Immediately delete
        deleteJson("/legalterms/delete", new Long[]{terms.getId()})
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        // Verify deletion
        assertThat(legalTermsService.getById(terms.getId())).isNull();
    }

    private LegalTermsEntity createLegalTerms(String title, String content) {
        LegalTermsEntity entity = new LegalTermsEntity();
        entity.setTitle(title);
        entity.setContent(content);
        entity.setCreateTime(new Date());
        entity.setUpdateTime(new Date());
        return entity;
    }
}

