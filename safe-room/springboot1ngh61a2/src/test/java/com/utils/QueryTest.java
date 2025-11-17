package com.utils;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class QueryTest {

    @Test
    void mapConstructorShouldPopulatePagingAndSanitizeSort() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "2");
        params.put("limit", "5");
        params.put("sidx", "nameField");
        params.put("order", "ASC");

        Query<Object> query = new Query<>(params);

        assertThat(query.getCurrPage()).isEqualTo(2);
        assertThat(query.getLimit()).isEqualTo(5);
        assertThat(query.get("offset")).isEqualTo(5);
        assertThat(query.get("sidx")).isEqualTo("namefield");
        assertThat(query.get("order")).isEqualTo("asc");

        Page<Object> page = query.getPage();
        assertThat(page.getCurrent()).isEqualTo(2);
        assertThat(page.getSize()).isEqualTo(5);
        assertThat(page.orders().get(0).getColumn()).isEqualTo("namefield");
    }

    @Test
    void jqPageInfoConstructorShouldCarrySorter() {
        JQPageInfo pageInfo = new JQPageInfo();
        pageInfo.setPage(3);
        pageInfo.setLimit(20);
        pageInfo.setSidx("nameField");
        pageInfo.setOrder("DESC");

        Query<Object> query = new Query<>(pageInfo);

        assertThat(query.getCurrPage()).isEqualTo(3);
        assertThat(query.getLimit()).isEqualTo(20);
        assertThat(query.getPage().orders().get(0).isAsc()).isFalse();
    }

    @Test
    void shouldHandleNullParams() {
        Map<String, Object> nullParams = null;
        Query<Object> query = new Query<>(nullParams);
        assertThat(query.getCurrPage()).isEqualTo(1);
        assertThat(query.getLimit()).isEqualTo(10);
    }

    @Test
    void shouldHandleEmptyParams() {
        Query<Object> query = new Query<>(new HashMap<>());
        assertThat(query.getCurrPage()).isEqualTo(1);
        assertThat(query.getLimit()).isEqualTo(10);
    }

    @Test
    void shouldHandleInvalidPageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "invalid");
        params.put("limit", "5");

        Query<Object> query = new Query<>(params);
        assertThat(query.getCurrPage()).isEqualTo(1);
        assertThat(query.getLimit()).isEqualTo(5);
    }

    @Test
    void shouldHandleInvalidLimit() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "2");
        params.put("limit", "invalid");

        Query<Object> query = new Query<>(params);
        assertThat(query.getCurrPage()).isEqualTo(2);
        assertThat(query.getLimit()).isEqualTo(10);
    }

    @Test
    void shouldHandleNegativePageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "-1");
        params.put("limit", "5");

        Query<Object> query = new Query<>(params);
        assertThat(query.getCurrPage()).isEqualTo(1);
        assertThat(query.getLimit()).isEqualTo(5);
    }

    @Test
    void shouldHandleZeroLimit() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "0");

        Query<Object> query = new Query<>(params);
        assertThat(query.getCurrPage()).isEqualTo(1);
        assertThat(query.getLimit()).isEqualTo(10);
    }

    @Test
    void shouldHandleLargeLimit() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "1000");

        Query<Object> query = new Query<>(params);
        assertThat(query.getCurrPage()).isEqualTo(1);
        assertThat(query.getLimit()).isEqualTo(1000);
    }

    @Test
    void shouldSanitizeSortFieldWithSpecialCharacters() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "10");
        // SQLFilter will remove special characters and check for illegal keywords
        // "DROP" will be detected and throw RuntimeException
        params.put("sidx", "nameField");
        params.put("order", "ASC");

        Query<Object> query = new Query<>(params);
        assertThat(query.get("sidx")).isEqualTo("namefield");
    }

    @Test
    void shouldHandleNullJQPageInfo() {
        JQPageInfo nullPageInfo = null;
        Query<Object> query = new Query<>(nullPageInfo);
        assertThat(query.getCurrPage()).isEqualTo(1);
        assertThat(query.getLimit()).isEqualTo(10);
    }

    @Test
    void shouldHandleJQPageInfoWithNullValues() {
        JQPageInfo pageInfo = new JQPageInfo();
        // Leave all fields null

        Query<Object> query = new Query<>(pageInfo);
        assertThat(query.getCurrPage()).isEqualTo(1);
        assertThat(query.getLimit()).isEqualTo(10);
    }
}


