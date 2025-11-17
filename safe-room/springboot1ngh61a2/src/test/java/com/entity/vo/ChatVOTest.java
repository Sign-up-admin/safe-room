package com.entity.vo;

import com.entity.support.BeanTestSupport;
import org.junit.jupiter.api.Test;

class ChatVOTest {

    @Test
    void shouldHoldAssignedValues() throws Exception {
        BeanTestSupport.assertBeanContract(ChatVO.class);
    }
}








