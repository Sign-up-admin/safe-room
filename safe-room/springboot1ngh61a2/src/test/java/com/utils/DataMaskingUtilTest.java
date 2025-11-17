package com.utils;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * DataMaskingUtil单元测试
 */
class DataMaskingUtilTest {

    @Test
    void shouldMaskPhoneNumberCorrectly() {
        // 正常11位手机号
        assertThat(DataMaskingUtil.maskPhone("13800138000")).isEqualTo("138****8000");

        // 13位手机号
        assertThat(DataMaskingUtil.maskPhone("13012345678")).isEqualTo("130****5678");

        // 其他长度手机号
        assertThat(DataMaskingUtil.maskPhone("13987654321")).isEqualTo("139****4321");
    }

    @Test
    void shouldReturnOriginalPhoneWhenTooShort() {
        assertThat(DataMaskingUtil.maskPhone("123456")).isEqualTo("123456");
        assertThat(DataMaskingUtil.maskPhone("1234567")).isEqualTo("1234567");
        assertThat(DataMaskingUtil.maskPhone("")).isEqualTo("");
        assertThat(DataMaskingUtil.maskPhone(null)).isNull();
    }

    @Test
    void shouldMaskIdCardCorrectly() {
        // 18位身份证号
        assertThat(DataMaskingUtil.maskIdCard("110101199001011234")).isEqualTo("110101********1234");

        // 其他身份证号
        assertThat(DataMaskingUtil.maskIdCard("440101200001012345")).isEqualTo("440101********2345");
    }

    @Test
    void shouldReturnOriginalIdCardWhenTooShort() {
        assertThat(DataMaskingUtil.maskIdCard("1234567")).isEqualTo("1234567");
        assertThat(DataMaskingUtil.maskIdCard("")).isEqualTo("");
        assertThat(DataMaskingUtil.maskIdCard(null)).isNull();
    }

    @Test
    void shouldMaskEmailCorrectly() {
        assertThat(DataMaskingUtil.maskEmail("test@example.com")).isEqualTo("te****@example.com");
        assertThat(DataMaskingUtil.maskEmail("user123@gmail.com")).isEqualTo("us****@gmail.com");
        assertThat(DataMaskingUtil.maskEmail("a@b.com")).isEqualTo("a@b.com");
        assertThat(DataMaskingUtil.maskEmail("ab@c.com")).isEqualTo("ab@c.com");
    }

    @Test
    void shouldReturnOriginalEmailWhenInvalid() {
        assertThat(DataMaskingUtil.maskEmail("invalidemail")).isEqualTo("invalidemail");
        assertThat(DataMaskingUtil.maskEmail("a")).isEqualTo("a");
        assertThat(DataMaskingUtil.maskEmail("")).isEqualTo("");
        assertThat(DataMaskingUtil.maskEmail(null)).isNull();
    }

    @Test
    void shouldMaskBankCardCorrectly() {
        assertThat(DataMaskingUtil.maskBankCard("6222123456789012")).isEqualTo("6222********9012");
        assertThat(DataMaskingUtil.maskBankCard("621012345678901234")).isEqualTo("6210********01234");
    }

    @Test
    void shouldReturnOriginalBankCardWhenTooShort() {
        assertThat(DataMaskingUtil.maskBankCard("1234567")).isEqualTo("1234567");
        assertThat(DataMaskingUtil.maskBankCard("")).isEqualTo("");
        assertThat(DataMaskingUtil.maskBankCard(null)).isNull();
    }

    @Test
    void shouldMaskPasswordCompletely() {
        assertThat(DataMaskingUtil.maskPassword("password123")).isEqualTo("******");
        assertThat(DataMaskingUtil.maskPassword("123")).isEqualTo("******");
        assertThat(DataMaskingUtil.maskPassword("")).isEqualTo("");
        assertThat(DataMaskingUtil.maskPassword(null)).isNull();
    }

    @Test
    void shouldMaskNameCorrectly() {
        // 1个字符
        assertThat(DataMaskingUtil.maskName("张")).isEqualTo("张");

        // 2个字符
        assertThat(DataMaskingUtil.maskName("张三")).isEqualTo("张*");

        // 3个字符
        assertThat(DataMaskingUtil.maskName("张三丰")).isEqualTo("张*丰");

        // 更多字符
        assertThat(DataMaskingUtil.maskName("欧阳修")).isEqualTo("欧*修");
        assertThat(DataMaskingUtil.maskName("爱新觉罗")).isEqualTo("爱*罗");
    }

    @Test
    void shouldReturnOriginalNameWhenBlank() {
        assertThat(DataMaskingUtil.maskName("")).isEqualTo("");
        assertThat(DataMaskingUtil.maskName("   ")).isEqualTo("   ");
        assertThat(DataMaskingUtil.maskName(null)).isNull();
    }

    @Test
    void shouldHandleEdgeCases() {
        // 空白字符串
        assertThat(DataMaskingUtil.maskPhone("   ")).isEqualTo("   ");
        assertThat(DataMaskingUtil.maskIdCard("   ")).isEqualTo("   ");
        assertThat(DataMaskingUtil.maskEmail("   ")).isEqualTo("   ");
        assertThat(DataMaskingUtil.maskBankCard("   ")).isEqualTo("   ");
        assertThat(DataMaskingUtil.maskPassword("   ")).isEqualTo("   ");
        assertThat(DataMaskingUtil.maskName("   ")).isEqualTo("   ");

        // 只有@的邮箱
        assertThat(DataMaskingUtil.maskEmail("@domain.com")).isEqualTo("@domain.com");
        assertThat(DataMaskingUtil.maskEmail("user@")).isEqualTo("us****@");

        // 特殊字符
        assertThat(DataMaskingUtil.maskName("李@")).isEqualTo("李*");
        assertThat(DataMaskingUtil.maskName("王#")).isEqualTo("王*#");
    }

    @Test
    void shouldHandleLongInputs() {
        // 很长的手机号
        String longPhone = "138001380001234567890";
        assertThat(DataMaskingUtil.maskPhone(longPhone))
            .isEqualTo("138****7890");

        // 很长的身份证号
        String longIdCard = "110101199001011234567890";
        assertThat(DataMaskingUtil.maskIdCard(longIdCard))
            .isEqualTo("110101********7890");

        // 很长的银行卡号
        String longCard = "622212345678901234567890";
        assertThat(DataMaskingUtil.maskBankCard(longCard))
            .isEqualTo("6222********567890");
    }

    @Test
    void shouldPreserveEmailDomain() {
        assertThat(DataMaskingUtil.maskEmail("test@very-long-domain.co.uk"))
            .isEqualTo("te****@very-long-domain.co.uk");

        assertThat(DataMaskingUtil.maskEmail("user@sub.domain.com"))
            .isEqualTo("us****@sub.domain.com");
    }
}
