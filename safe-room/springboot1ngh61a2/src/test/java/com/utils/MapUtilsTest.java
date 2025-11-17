package com.utils;

import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class MapUtilsTest {

    @Test
    void mapToObjectShouldPopulateMatchingFields() throws Exception {
        Map<String, Object> map = new HashMap<>();
        map.put("name", "Alice");
        map.put("age", 30);
        map.put("ignored", "value");

        SampleBean bean = MapUtils.mapToObject(map, SampleBean.class);

        assertThat(bean).isNotNull();
        assertThat(bean.getName()).isEqualTo("Alice");
        assertThat(bean.getAge()).isEqualTo(30);
        assertThat(bean.getMissing()).isNull();
    }

    static class SampleBean {
        private static final String CONSTANT = "CONST";

        private String name;
        private int age;
        private String missing;

        public String getName() {
            return name;
        }

        public int getAge() {
            return age;
        }

        public String getMissing() {
            return missing;
        }
    }
}


