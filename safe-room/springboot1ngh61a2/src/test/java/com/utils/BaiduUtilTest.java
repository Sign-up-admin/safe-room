package com.utils;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatCode;

class BaiduUtilTest {

    @Test
    void initClientShouldNotThrow() {
        assertThatCode(BaiduUtil::initClient).doesNotThrowAnyException();
    }
}


