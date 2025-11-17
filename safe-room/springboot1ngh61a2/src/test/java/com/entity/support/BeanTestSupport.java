package com.entity.support;

import org.assertj.core.api.Assertions;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.math.BigDecimal;
import java.util.Date;

public final class BeanTestSupport {

    private BeanTestSupport() {
    }

    public static void assertBeanContract(Class<?> beanClass) throws Exception {
        Object instance = beanClass.getDeclaredConstructor().newInstance();
        for (Field field : beanClass.getDeclaredFields()) {
            if (Modifier.isStatic(field.getModifiers())) {
                continue;
            }
            Method setter = findSetter(beanClass, field);
            Method getter = findGetter(beanClass, field);
            Object sampleValue = sampleValue(field.getType(), field.getName());
            setter.invoke(instance, sampleValue);
            Object actual = getter.invoke(instance);
            Assertions.assertThat(actual)
                    .as("Field %s of %s should retain value", field.getName(), beanClass.getSimpleName())
                    .isEqualTo(sampleValue);
        }
    }

    private static Method findSetter(Class<?> beanClass, Field field) throws NoSuchMethodException {
        String setterName = "set" + capitalize(field.getName());
        return beanClass.getMethod(setterName, field.getType());
    }

    private static Method findGetter(Class<?> beanClass, Field field) throws NoSuchMethodException {
        String getterName = "get" + capitalize(field.getName());
        try {
            return beanClass.getMethod(getterName);
        } catch (NoSuchMethodException ex) {
            if (field.getType().equals(boolean.class) || field.getType().equals(Boolean.class)) {
                String booleanGetter = "is" + capitalize(field.getName());
                return beanClass.getMethod(booleanGetter);
            }
            throw ex;
        }
    }

    private static Object sampleValue(Class<?> type, String fieldName) {
        int hash = Math.abs(fieldName.hashCode());
        if (type.equals(String.class)) {
            return fieldName + "-value";
        }
        if (type.equals(Integer.class) || type.equals(int.class)) {
            return (hash % 1000) + 1;
        }
        if (type.equals(Long.class) || type.equals(long.class)) {
            return (long) ((hash % 1000) + 1);
        }
        if (type.equals(Double.class) || type.equals(double.class)) {
            return (hash % 500) / 10.0;
        }
        if (type.equals(Float.class) || type.equals(float.class)) {
            return (hash % 500) / 10.0f;
        }
        if (type.equals(Boolean.class) || type.equals(boolean.class)) {
            return hash % 2 == 0;
        }
        if (type.equals(Date.class)) {
            return new Date(1_700_000_000_000L + hash);
        }
        if (type.equals(BigDecimal.class)) {
            return BigDecimal.valueOf((hash % 1000) / 10.0);
        }
        throw new IllegalArgumentException("Unsupported field type: " + type);
    }

    private static String capitalize(String name) {
        if (name == null || name.isEmpty()) {
            return name;
        }
        return Character.toUpperCase(name.charAt(0)) + name.substring(1);
    }
}








