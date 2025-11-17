package com.utils;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PasswordValidatorTest {

    @Test
    void shouldValidateValidPassword() {
        String validPassword = "ValidPass123";

        String result = PasswordValidator.validate(validPassword);
        boolean isValid = PasswordValidator.isValid(validPassword);

        assertThat(result).isNull();
        assertThat(isValid).isTrue();
    }

    @Test
    void shouldRejectNullPassword() {
        String result = PasswordValidator.validate(null);
        boolean isValid = PasswordValidator.isValid(null);

        assertThat(result).isEqualTo("密码不能为空");
        assertThat(isValid).isFalse();
    }

    @Test
    void shouldRejectEmptyPassword() {
        String result = PasswordValidator.validate("");
        boolean isValid = PasswordValidator.isValid("");

        assertThat(result).isEqualTo("密码不能为空");
        assertThat(isValid).isFalse();
    }

    @Test
    void shouldRejectBlankPassword() {
        String result = PasswordValidator.validate("   ");
        boolean isValid = PasswordValidator.isValid("   ");

        assertThat(result).isEqualTo("密码不能为空");
        assertThat(isValid).isFalse();
    }

    @Test
    void shouldRejectPasswordTooShort() {
        String shortPassword = "Short1";

        String result = PasswordValidator.validate(shortPassword);
        boolean isValid = PasswordValidator.isValid(shortPassword);

        assertThat(result).isEqualTo("密码长度至少8位");
        assertThat(isValid).isFalse();
    }

    @Test
    void shouldAcceptMinimumLengthPassword() {
        String minLengthPassword = "ValidPa1";

        String result = PasswordValidator.validate(minLengthPassword);
        boolean isValid = PasswordValidator.isValid(minLengthPassword);

        assertThat(result).isNull();
        assertThat(isValid).isTrue();
    }

    @Test
    void shouldRejectPasswordWithoutUpperCase() {
        String noUpperCase = "validpass123";

        String result = PasswordValidator.validate(noUpperCase);
        boolean isValid = PasswordValidator.isValid(noUpperCase);

        assertThat(result).isEqualTo("密码必须包含至少一个大写字母");
        assertThat(isValid).isFalse();
    }

    @Test
    void shouldRejectPasswordWithoutLowerCase() {
        String noLowerCase = "VALIDPASS123";

        String result = PasswordValidator.validate(noLowerCase);
        boolean isValid = PasswordValidator.isValid(noLowerCase);

        assertThat(result).isEqualTo("密码必须包含至少一个小写字母");
        assertThat(isValid).isFalse();
    }

    @Test
    void shouldRejectPasswordWithoutDigit() {
        String noDigit = "ValidPassword";

        String result = PasswordValidator.validate(noDigit);
        boolean isValid = PasswordValidator.isValid(noDigit);

        assertThat(result).isEqualTo("密码必须包含至少一个数字");
        assertThat(isValid).isFalse();
    }

    @Test
    void shouldAcceptPasswordWithSpecialCharacters() {
        String passwordWithSpecial = "ValidPass123!@#";

        String result = PasswordValidator.validate(passwordWithSpecial);
        boolean isValid = PasswordValidator.isValid(passwordWithSpecial);

        assertThat(result).isNull();
        assertThat(isValid).isTrue();
    }

    @Test
    void shouldAcceptPasswordWithOnlyRequiredCharacters() {
        String minimalValid = "Abc12345";

        String result = PasswordValidator.validate(minimalValid);
        boolean isValid = PasswordValidator.isValid(minimalValid);

        assertThat(result).isNull();
        assertThat(isValid).isTrue();
    }

    @Test
    void shouldHandlePasswordWithOnlyDigits() {
        String onlyDigits = "12345678";

        String result = PasswordValidator.validate(onlyDigits);
        boolean isValid = PasswordValidator.isValid(onlyDigits);

        assertThat(result).isEqualTo("密码必须包含至少一个大写字母");
        assertThat(isValid).isFalse();
    }

    @Test
    void shouldHandlePasswordWithOnlyLetters() {
        String onlyLetters = "Password";

        String result = PasswordValidator.validate(onlyLetters);
        boolean isValid = PasswordValidator.isValid(onlyLetters);

        assertThat(result).isEqualTo("密码必须包含至少一个数字");
        assertThat(isValid).isFalse();
    }

    @Test
    void shouldHandlePasswordWithMixedCaseLetters() {
        String mixedCase = "PASSWORD";

        String result = PasswordValidator.validate(mixedCase);
        boolean isValid = PasswordValidator.isValid(mixedCase);

        assertThat(result).isEqualTo("密码必须包含至少一个小写字母");
        assertThat(isValid).isFalse();
    }

    @Test
    void shouldValidateLongPassword() {
        String longPassword = "VeryLongValidPassword123456789!@#$%^&*()";

        String result = PasswordValidator.validate(longPassword);
        boolean isValid = PasswordValidator.isValid(longPassword);

        assertThat(result).isNull();
        assertThat(isValid).isTrue();
    }

    @Test
    void shouldHandleUnicodeCharacters() {
        String unicodePassword = "Pässword123";

        String result = PasswordValidator.validate(unicodePassword);
        boolean isValid = PasswordValidator.isValid(unicodePassword);

        // Unicode characters that are not letters or digits should not affect validation
        assertThat(result).isNull();
        assertThat(isValid).isTrue();
    }

    @Test
    void shouldValidateEdgeCasePasswords() {
        // Test various edge cases
        assertThat(PasswordValidator.isValid("A1b2C3D4")).isTrue();  // Valid
        assertThat(PasswordValidator.isValid("ABCDEFGH")).isFalse(); // No lowercase, no digit
        assertThat(PasswordValidator.isValid("abcdefgh")).isFalse(); // No uppercase, no digit
        assertThat(PasswordValidator.isValid("12345678")).isFalse(); // No letters
        assertThat(PasswordValidator.isValid("Abcdefgh")).isFalse(); // No digit
    }
}
