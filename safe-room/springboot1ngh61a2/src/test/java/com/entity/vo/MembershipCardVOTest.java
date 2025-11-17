package com.entity.vo;

import com.entity.support.BeanTestSupport;
import org.junit.jupiter.api.Test;

class MembershipCardVOTest {

    @Test
    void shouldHoldAssignedValues() throws Exception {
        BeanTestSupport.assertBeanContract(MembershipCardVO.class);
    }
}








