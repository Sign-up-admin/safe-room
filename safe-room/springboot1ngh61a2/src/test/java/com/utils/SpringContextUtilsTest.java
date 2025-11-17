package com.utils;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.NoSuchBeanDefinitionException;
import org.springframework.context.ApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
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

    @Test
    void shouldReturnBeanWhenGetBeanWithClass() {
        ApplicationContext context = mock(ApplicationContext.class);
        String expectedBean = "stringBean";
        when(context.getBean(String.class)).thenReturn(expectedBean);

        SpringContextUtils springContextUtils = new SpringContextUtils();
        springContextUtils.setApplicationContext(context);

        String result = SpringContextUtils.getBean(String.class);
        assertThat(result).isEqualTo(expectedBean);
    }

    @Test
    void shouldThrowExceptionWhenGetBeanWithClassAndBeanNotFound() {
        ApplicationContext context = mock(ApplicationContext.class);
        when(context.getBean(String.class)).thenThrow(NoSuchBeanDefinitionException.class);

        SpringContextUtils springContextUtils = new SpringContextUtils();
        springContextUtils.setApplicationContext(context);

        assertThatThrownBy(() -> SpringContextUtils.getBean(String.class))
            .isInstanceOf(NoSuchBeanDefinitionException.class);
    }

    @Test
    void shouldReturnBeanWhenGetBeanWithNameAndClass() {
        ApplicationContext context = mock(ApplicationContext.class);
        Integer expectedBean = 42;
        when(context.getBean("numberBean", Integer.class)).thenReturn(expectedBean);

        SpringContextUtils springContextUtils = new SpringContextUtils();
        springContextUtils.setApplicationContext(context);

        Integer result = SpringContextUtils.getBean("numberBean", Integer.class);
        assertThat(result).isEqualTo(expectedBean);
    }

    @Test
    void shouldThrowExceptionWhenGetBeanWithNameAndClassAndBeanNotFound() {
        ApplicationContext context = mock(ApplicationContext.class);
        when(context.getBean("nonExistentBean", String.class)).thenThrow(NoSuchBeanDefinitionException.class);

        SpringContextUtils springContextUtils = new SpringContextUtils();
        springContextUtils.setApplicationContext(context);

        assertThatThrownBy(() -> SpringContextUtils.getBean("nonExistentBean", String.class))
            .isInstanceOf(NoSuchBeanDefinitionException.class);
    }

    @Test
    void shouldThrowNullPointerExceptionWhenApplicationContextIsNull() {
        SpringContextUtils.applicationContext = null;

        assertThatThrownBy(() -> SpringContextUtils.getBean("anyBean"))
            .isInstanceOf(NullPointerException.class);

        assertThatThrownBy(() -> SpringContextUtils.getBean(String.class))
            .isInstanceOf(NullPointerException.class);

        assertThatThrownBy(() -> SpringContextUtils.getBean("bean", String.class))
            .isInstanceOf(NullPointerException.class);

        assertThatThrownBy(() -> SpringContextUtils.containsBean("anyBean"))
            .isInstanceOf(NullPointerException.class);

        assertThatThrownBy(() -> SpringContextUtils.isSingleton("anyBean"))
            .isInstanceOf(NullPointerException.class);

        assertThatThrownBy(() -> SpringContextUtils.getType("anyBean"))
            .isInstanceOf(NullPointerException.class);
    }

    @Test
    void shouldThrowExceptionWhenGetBeanWithNameAndBeanNotFound() {
        ApplicationContext context = mock(ApplicationContext.class);
        when(context.getBean("nonExistentBean")).thenThrow(NoSuchBeanDefinitionException.class);

        SpringContextUtils springContextUtils = new SpringContextUtils();
        springContextUtils.setApplicationContext(context);

        assertThatThrownBy(() -> SpringContextUtils.getBean("nonExistentBean"))
            .isInstanceOf(NoSuchBeanDefinitionException.class);
    }
}


