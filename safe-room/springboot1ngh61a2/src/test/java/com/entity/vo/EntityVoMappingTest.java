package com.entity.vo;

import com.entity.ChatEntity;
import com.entity.DaoqitixingEntity;
import com.entity.DiscussjianshenkechengEntity;
import com.entity.HuiyuankaEntity;
import com.entity.HuiyuankagoumaiEntity;
import com.entity.HuiyuanxufeiEntity;
import com.entity.JianshenjiaolianEntity;
import com.entity.JianshenkechengEntity;
import com.entity.JianshenqicaiEntity;
import com.entity.KechengleixingEntity;
import com.entity.KechengtuikeEntity;
import com.entity.KechengyuyueEntity;
import com.entity.MembershipCardEntity;
import com.entity.NewsEntity;
import com.entity.NewstypeEntity;
import com.entity.SijiaoyuyueEntity;
import com.entity.StoreupEntity;
import com.entity.UserEntity;
import com.entity.YonghuEntity;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.BeanUtils;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.math.BigDecimal;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.function.Supplier;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

class EntityVoMappingTest {

    @ParameterizedTest(name = "copy {0}")
    @MethodSource("voMappings")
    void shouldCopySelectedProperties(VoMapping mapping) {
        Object entity = mapping.entitySupplier().get();
        Object vo = mapping.voSupplier().get();

        String fieldName = findSharedFieldOrNull(entity.getClass(), vo.getClass());
        Object sampleValue = null;
        if (fieldName != null) {
            sampleValue = sampleValueFor(entity.getClass(), fieldName);
            setField(entity, fieldName, sampleValue);
        }
        BeanUtils.copyProperties(entity, vo);

        if (fieldName != null) {
            Object copiedValue = getFieldValue(vo, fieldName);
            assertThat(copiedValue).isEqualTo(sampleValue);
        } else {
            assertThat(vo).isNotNull();
        }
    }

    private static Object sampleValueFor(Class<?> typeHolder, String fieldName) {
        Field field = findField(typeHolder, fieldName);
        Class<?> type = field.getType();
        if (type == String.class) {
            return fieldName + "-value";
        }
        if (type == Integer.class || type == int.class) {
            return 42;
        }
        if (type == Long.class || type == long.class) {
            return 4242L;
        }
        if (type == Double.class || type == double.class) {
            return 123.45D;
        }
        if (type == BigDecimal.class) {
            return BigDecimal.valueOf(678.9);
        }
        if (type == Boolean.class || type == boolean.class) {
            return Boolean.TRUE;
        }
        if (type == Date.class) {
            return new Date(0);
        }
        throw new IllegalArgumentException("Unsupported type " + type + " for field " + fieldName);
    }

    private static void setField(Object target, String fieldName, Object value) {
        Field field = findField(target.getClass(), fieldName);
        field.setAccessible(true);
        try {
            field.set(target, value);
        } catch (IllegalAccessException e) {
            throw new IllegalStateException("Unable to set field " + fieldName, e);
        }
    }

    private static Object getFieldValue(Object target, String fieldName) {
        Field field = findField(target.getClass(), fieldName);
        field.setAccessible(true);
        try {
            return field.get(target);
        } catch (IllegalAccessException e) {
            throw new IllegalStateException("Unable to read field " + fieldName, e);
        }
    }

    private static Field findField(Class<?> clazz, String fieldName) {
        Class<?> current = clazz;
        while (current != null && current != Object.class) {
            try {
                return current.getDeclaredField(fieldName);
            } catch (NoSuchFieldException ignored) {
            }
            current = current.getSuperclass();
        }
        throw new IllegalArgumentException("Field " + fieldName + " not found in " + clazz.getName());
    }

    private static String findSharedFieldOrNull(Class<?> entityClass, Class<?> voClass) {
        Map<String, Field> entityFields = fieldMap(entityClass);
        Map<String, Field> voFields = fieldMap(voClass);
        for (Map.Entry<String, Field> entry : entityFields.entrySet()) {
            Field voField = voFields.get(entry.getKey());
            if (voField != null && voField.getType().equals(entry.getValue().getType())) {
                return entry.getKey();
            }
        }
        return null;
    }

    private static Map<String, Field> fieldMap(Class<?> clazz) {
        Map<String, Field> fields = new LinkedHashMap<>();
        Class<?> current = clazz;
        while (current != null && current != Object.class) {
            for (Field field : current.getDeclaredFields()) {
                if (Modifier.isStatic(field.getModifiers())) {
                    continue;
                }
                if ("serialVersionUID".equals(field.getName())) {
                    continue;
                }
                fields.putIfAbsent(field.getName(), field);
            }
            current = current.getSuperclass();
        }
        return fields;
    }

    private static Stream<VoMapping> voMappings() {
        return Stream.of(
                mapping(ChatEntity::new, ChatVO::new),
                mapping(DaoqitixingEntity::new, DaoqitixingVO::new),
                mapping(DiscussjianshenkechengEntity::new, DiscussjianshenkechengVO::new),
                mapping(HuiyuankagoumaiEntity::new, HuiyuankagoumaiVO::new),
                mapping(HuiyuankaEntity::new, HuiyuankaVO::new),
                mapping(HuiyuanxufeiEntity::new, HuiyuanxufeiVO::new),
                mapping(JianshenjiaolianEntity::new, JianshenjiaolianVO::new),
                mapping(JianshenkechengEntity::new, JianshenkechengVO::new),
                mapping(JianshenqicaiEntity::new, JianshenqicaiVO::new),
                mapping(KechengleixingEntity::new, KechengleixingVO::new),
                mapping(KechengtuikeEntity::new, KechengtuikeVO::new),
                mapping(KechengyuyueEntity::new, KechengyuyueVO::new),
                mapping(MembershipCardEntity::new, MembershipCardVO::new),
                mapping(NewstypeEntity::new, NewstypeVO::new),
                mapping(NewsEntity::new, NewsVO::new),
                mapping(SijiaoyuyueEntity::new, SijiaoyuyueVO::new),
                mapping(StoreupEntity::new, StoreupVO::new),
                mapping(UserEntity::new, UserVO::new),
                mapping(YonghuEntity::new, YonghuVO::new)
        );
    }

    private static VoMapping mapping(Supplier<Object> entitySupplier,
                                     Supplier<Object> voSupplier) {
        return new VoMapping(entitySupplier, voSupplier);
    }

    private record VoMapping(Supplier<Object> entitySupplier,
                             Supplier<Object> voSupplier) {
        @Override
        public String toString() {
            return voSupplier.get().getClass().getSimpleName();
        }
    }
}


