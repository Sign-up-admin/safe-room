package com.entity.model;

import com.entity.support.BeanTestSupport;
import org.junit.jupiter.api.Test;

class ChatModelTest {

    @Test
    void shouldHoldAssignedValues() throws Exception {
        BeanTestSupport.assertBeanContract(ChatModel.class);
    }
}








