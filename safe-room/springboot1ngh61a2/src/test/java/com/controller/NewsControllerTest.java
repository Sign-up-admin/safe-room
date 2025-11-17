package com.controller;

import com.controller.support.AbstractControllerIntegrationTest;
import com.entity.NewsEntity;
import com.service.NewsService;
import com.utils.TestUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class NewsControllerTest extends AbstractControllerIntegrationTest {

    @Autowired
    private NewsService newsService;

    @AfterEach
    void cleanupTestData() {
        // Clean up test news entries to prevent conflicts between test runs
        newsService.list().stream()
                .filter(news -> news.getTitle() != null &&
                        (news.getTitle().contains("测试新闻") ||
                         news.getTitle().contains("更新新闻") ||
                         news.getTitle().contains("删除新闻") ||
                         news.getTitle().contains("点赞新闻") ||
                         news.getTitle().contains("点踩新闻") ||
                         news.getTitle().contains("自动排序新闻") ||
                         news.getTitle().contains("detail-test") ||
                         news.getTitle().contains("null-test") ||
                         news.getTitle().contains("filter-test") ||
                         news.getTitle().contains("query-test")))
                .forEach(news -> newsService.removeById(news.getId()));
    }

    @Test
    void shouldReturnPagedNews() throws Exception {
        getPage("/news/page")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    void shouldCreateNewsItem() throws Exception {
        NewsEntity payload = TestUtils.createNewsItem("测试新闻");

        postJson("/news/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(newsService.list())
                .anyMatch(news -> news.getTitle().equals(payload.getTitle()));
    }

    @Test
    void shouldUpdateNewsTitle() throws Exception {
        NewsEntity existing = TestUtils.createNewsItem("更新新闻");
        newsService.save(existing);

        existing.setTitle("标题已更新");

        putJson("/news/update", existing)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        NewsEntity updated = newsService.getById(existing.getId());
        assertThat(updated.getTitle()).isEqualTo("标题已更新");
    }

    @Test
    void shouldDeleteNewsItems() throws Exception {
        NewsEntity first = TestUtils.createNewsItem("删除新闻1");
        NewsEntity second = TestUtils.createNewsItem("删除新闻2");
        newsService.save(first);
        newsService.save(second);

        deleteJson("/news/delete", new Long[]{first.getId(), second.getId()})
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(newsService.listByIds(Arrays.asList(first.getId(), second.getId())))
                .isEmpty();
    }

    // ========== 补充缺失接口测试 ==========

    @Test
    void shouldReturnLists() throws Exception {
        NewsEntity news = TestUtils.createNewsItem("列表新闻");
        newsService.save(news);

        mockMvc.perform(get("/news/lists")
                        .param("typename", news.getTypename()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void shouldQueryNews() throws Exception {
        NewsEntity news = TestUtils.createNewsItem("查询新闻");
        newsService.save(news);

        mockMvc.perform(get("/news/query")
                        .param("id", String.valueOf(news.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("查询公告信息成功"))
                .andExpect(jsonPath("$.data").exists());
    }

    @Test
    void shouldThumbsupNews() throws Exception {
        NewsEntity news = TestUtils.createNewsItem("点赞新闻");
        news.setThumbsupnum(0);
        newsService.save(news);

        mockMvc.perform(get("/news/thumbsup/" + news.getId())
                        .param("type", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("投票成功"));

        NewsEntity updated = newsService.getById(news.getId());
        assertThat(updated).isNotNull();
        assertThat(updated.getThumbsupnum()).isEqualTo(1);
    }

    @Test
    void shouldCrazilyNews() throws Exception {
        NewsEntity news = TestUtils.createNewsItem("点踩新闻");
        news.setCrazilynum(0);
        newsService.save(news);

        mockMvc.perform(get("/news/thumbsup/" + news.getId())
                        .param("type", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("投票成功"));

        NewsEntity updated = newsService.getById(news.getId());
        assertThat(updated).isNotNull();
        assertThat(updated.getCrazilynum()).isEqualTo(1);
    }

    @Test
    void shouldAutoSortNews() throws Exception {
        NewsEntity news1 = TestUtils.createNewsItem("排序新闻1");
        news1.setClicknum(10);
        NewsEntity news2 = TestUtils.createNewsItem("排序新闻2");
        news2.setClicknum(20);
        newsService.save(news1);
        newsService.save(news2);

        mockMvc.perform(get("/news/autoSort")
                        .param("page", "1")
                        .param("limit", "10")
                        .param("pre", ""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    void shouldAutoSort2WithCollaborativeFiltering() throws Exception {
        NewsEntity news = TestUtils.createNewsItem("协同过滤新闻");
        newsService.save(news);

        performMember(get("/news/autoSort2")
                        .param("page", "1")
                        .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }
}


