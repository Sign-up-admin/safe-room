package com.utils;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JQPageInfoTest {

    @Test
    void gettersAndSettersShouldPersistValues() {
        JQPageInfo pageInfo = new JQPageInfo();
        pageInfo.setPage(3);
        pageInfo.setLimit(25);
        pageInfo.setSidx("createdAt");
        pageInfo.setOrder("DESC");
        pageInfo.setOffset(50);

        assertThat(pageInfo.getPage()).isEqualTo(3);
        assertThat(pageInfo.getLimit()).isEqualTo(25);
        assertThat(pageInfo.getSidx()).isEqualTo("createdAt");
        assertThat(pageInfo.getOrder()).isEqualTo("DESC");
        assertThat(pageInfo.getOffset()).isEqualTo(50);
    }
}


