package com.utils;

import com.entity.EIException;
import jakarta.validation.constraints.NotBlank;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ValidatorUtilsTest {

    @Test
    void validateEntityShouldPassWhenConstraintsSatisfied() {
        ValidatedBean bean = new ValidatedBean();
        bean.setName("valid");

        assertThatCode(() -> ValidatorUtils.validateEntity(bean)).doesNotThrowAnyException();
    }

    @Test
    void validateEntityShouldThrowWhenConstraintViolated() {
        ValidatedBean bean = new ValidatedBean();

        assertThatThrownBy(() -> ValidatorUtils.validateEntity(bean))
                .isInstanceOf(EIException.class);
    }

    @Test
    void validateEntityShouldHandleNullObject() {
        assertThatThrownBy(() -> ValidatorUtils.validateEntity(null))
                .isInstanceOf(EIException.class);
    }

    @Test
    void validateEntityShouldHandleObjectWithMultipleViolations() {
        ComplexValidatedBean bean = new ComplexValidatedBean();

        assertThatThrownBy(() -> ValidatorUtils.validateEntity(bean))
                .isInstanceOf(EIException.class);
    }

    @Test
    void validateEntityShouldPassWhenMultipleConstraintsSatisfied() {
        ComplexValidatedBean bean = new ComplexValidatedBean();
        bean.setName("valid");
        bean.setEmail("test@example.com");
        bean.setAge(25);

        assertThatCode(() -> ValidatorUtils.validateEntity(bean)).doesNotThrowAnyException();
    }

    @Test
    void validateEntityShouldHandleEmptyStringAsInvalid() {
        ValidatedBean bean = new ValidatedBean();
        bean.setName("");

        assertThatThrownBy(() -> ValidatorUtils.validateEntity(bean))
                .isInstanceOf(EIException.class);
    }

    @Test
    void validateEntityShouldHandleBlankStringAsInvalid() {
        ValidatedBean bean = new ValidatedBean();
        bean.setName("   ");

        assertThatThrownBy(() -> ValidatorUtils.validateEntity(bean))
                .isInstanceOf(EIException.class);
    }

    static class ValidatedBean {
        @NotBlank
        private String name;

        public void setName(String name) {
            this.name = name;
        }
    }

    static class ComplexValidatedBean {
        @NotBlank
        private String name;

        @jakarta.validation.constraints.Email
        private String email;

        @jakarta.validation.constraints.Min(18)
        @jakarta.validation.constraints.Max(120)
        private Integer age;

        public void setName(String name) {
            this.name = name;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public void setAge(Integer age) {
            this.age = age;
        }
    }
}


