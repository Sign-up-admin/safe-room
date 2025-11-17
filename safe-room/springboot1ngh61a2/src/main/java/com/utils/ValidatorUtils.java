package com.utils;

import java.util.Set;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;

import com.entity.EIException;

/**
 * hibernate-validator validation utility class
 */
public class ValidatorUtils {
    private static Validator validator;

    static {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    /**
     * Validate object
     * @param object        object to be validated
     * @param groups        groups to be validated
     * @throws EIException  If validation fails, an EIException is thrown
     */
    public static void validateEntity(Object object, Class<?>... groups)
            throws EIException {
        if (object == null) {
            throw new EIException("The object to be validated must not be null");
        }
        Set<ConstraintViolation<Object>> constraintViolations = validator.validate(object, groups);
        if (!constraintViolations.isEmpty()) {
            ConstraintViolation<Object> constraint = (ConstraintViolation<Object>)constraintViolations.iterator().next();
            throw new EIException(constraint.getMessage());
        }
    }
}

