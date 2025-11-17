package com.utils;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CommonUtilTest {

    @Test
    void generateUUIDShouldProduce32CharString() {
        String uuid = CommonUtil.generateUUID();

        assertThat(uuid).hasSize(32);
        assertThat(uuid).matches("[0-9a-fA-F]{32}");
    }

    @Test
    void isEmptyShouldDetectNullAndWhitespace() {
        assertThat(CommonUtil.isEmpty(null)).isTrue();
        assertThat(CommonUtil.isEmpty("   ")).isTrue();
        assertThat(CommonUtil.isEmpty("value")).isFalse();
    }

    @Test
    void isNotEmptyShouldNegateIsEmpty() {
        assertThat(CommonUtil.isNotEmpty("data")).isTrue();
        assertThat(CommonUtil.isNotEmpty("")).isFalse();
    }

    @Test
    void getRandomStringShouldRespectRequestedLength() {
        String random = CommonUtil.getRandomString(16);

        assertThat(random).hasSize(16);
        assertThat(random).matches("[A-Za-z0-9]+");
    }
}


