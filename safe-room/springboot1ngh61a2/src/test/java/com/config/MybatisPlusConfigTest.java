package com.config;

import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class MybatisPlusConfigTest {

    private final MybatisPlusConfig config = new MybatisPlusConfig();

    @Test
    void shouldConfigurePaginationInterceptorForPostgres() {
        MybatisPlusInterceptor interceptor = config.mybatisPlusInterceptor();

        assertThat(interceptor.getInterceptors()).hasSize(1);
        assertThat(interceptor.getInterceptors().get(0))
                .isInstanceOf(PaginationInnerInterceptor.class);
        PaginationInnerInterceptor inner = (PaginationInnerInterceptor) interceptor.getInterceptors().get(0);
        assertThat(inner.getDbType()).isEqualTo(DbType.POSTGRE_SQL);
    }
}


