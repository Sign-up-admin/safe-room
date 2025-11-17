package com.utils;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SpringContextUtilsTest {

    @AfterEach
    void resetContext() {
        SpringContextUtils.applicationContext = null;
    }

    @Test
    void shouldDelegateCallsToApplicationContext() {
        ApplicationContext context = mock(ApplicationContext.class);
        when(context.getBean("bean")).thenReturn("value");
        when(context.containsBean("bean")).thenReturn(true);
        when(context.isSingleton("bean")).thenReturn(true);
        when(context.getType("bean")).thenAnswer(invocation -> String.class);

        SpringContextUtils springContextUtils = new SpringContextUtils();
        springContextUtils.setApplicationContext(context);

        assertThat(SpringContextUtils.getBean("bean")).isEqualTo("value");
        assertThat(SpringContextUtils.containsBean("bean")).isTrue();
        assertThat(SpringContextUtils.isSingleton("bean")).isTrue();
        assertThat(SpringContextUtils.getType("bean")).isEqualTo(String.class);
    }
}


