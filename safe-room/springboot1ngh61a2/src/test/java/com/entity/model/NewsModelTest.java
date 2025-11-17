package com.entity.model;

import com.entity.support.BeanTestSupport;
import org.junit.jupiter.api.Test;

class NewsModelTest {

    @Test
    void shouldHoldAssignedValues() throws Exception {
        BeanTestSupport.assertBeanContract(NewsModel.class);
    }
}








