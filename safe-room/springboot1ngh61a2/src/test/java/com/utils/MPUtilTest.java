package com.utils;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class MPUtilTest {

    @Test
    void allEQMapPreShouldPrefixFieldNames() {
        SampleFilter bean = new SampleFilter();
        bean.setFirstName("Alice");
        bean.setAge(28);

        Map<String, Object> result = MPUtil.allEQMapPre(bean, "user");

        assertThat(result).containsEntry("user.firstName", "Alice");
        assertThat(result).containsEntry("user.age", 28);
        assertThat(result).doesNotContainKey("user.nullable");
        assertThat(result).doesNotContainKey("user.staticField");
    }

    @Test
    void likeOrEqShouldGenerateLikeAndEqClauses() {
        SampleFilter filter = new SampleFilter();
        filter.setFirstName("Alice");
        filter.setAge(30);

        QueryWrapper<SampleFilter> wrapper = new QueryWrapper<>();
        MPUtil.likeOrEq(wrapper, filter);

        String sql = wrapper.getSqlSegment();
        assertThat(sql).contains("first_name LIKE");
        assertThat(sql).contains("age =");
    }

    @Test
    void betweenShouldAddRangeClauses() {
        QueryWrapper<SampleFilter> wrapper = new QueryWrapper<>();
        Map<String, Object> params = new HashMap<>();
        params.put("createdAtStart", "2024-01-01");
        params.put("createdAtEnd", "2024-12-31");

        MPUtil.between(wrapper, params);

        String sql = wrapper.getSqlSegment();
        assertThat(sql).contains("created_at");
        assertThat(sql).contains(">=");
        assertThat(sql).contains("<=");
    }

    @Test
    void sortShouldAppendOrderByClause() {
        QueryWrapper<SampleFilter> wrapper = new QueryWrapper<>();
        Map<String, Object> params = new HashMap<>();
        params.put("sort", "createdAt");
        params.put("order", "DESC");

        MPUtil.sort(wrapper, params);

        String orderSql = wrapper.getExpression().getOrderBy().getSqlSegment();
        assertThat(orderSql).contains("created_at").contains("DESC");
    }

    static class SampleFilter {
        private static final String STATIC_FIELD = "ignored";

        private String firstName;
        private Integer age;
        private String nullable;

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public void setAge(Integer age) {
            this.age = age;
        }
    }
}


