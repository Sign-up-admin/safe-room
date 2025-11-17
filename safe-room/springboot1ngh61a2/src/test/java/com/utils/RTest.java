package com.utils;

import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class RTest {

    @Test
    void defaultConstructorShouldSetSuccessValues() {
        R r = new R();

        assertThat(r.get("code")).isEqualTo(0);
        assertThat(r.get("msg")).isEqualTo("success");
    }

    @Test
    void errorFactoryShouldOverrideCodeAndMessage() {
        R error = R.error(404, "Not found");

        assertThat(error.get("code")).isEqualTo(404);
        assertThat(error.get("msg")).isEqualTo("Not found");
    }

    @Test
    void okFactoryShouldMergeProvidedMap() {
        R ok = R.ok(Map.of("data", "value")).put("extra", 123);

        assertThat(ok.get("code")).isEqualTo(0);
        assertThat(ok.get("data")).isEqualTo("value");
        assertThat(ok.get("extra")).isEqualTo(123);
    }
}


