package com.entity.model;

import com.entity.ChatEntity;
import com.entity.DaoqitixingEntity;
import com.entity.DiscussjianshenkechengEntity;
import com.entity.KechengyuyueEntity;
import com.entity.NewsEntity;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;

import java.util.function.Supplier;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

class EntityModelBindingTest {

    @ParameterizedTest(name = "bind {0}")
    @MethodSource("modelMappings")
    void shouldCopyModelValuesIntoEntities(ModelMapping mapping) {
        Object model = mapping.modelSupplier().get();
        setProperty(model, mapping.property(), mapping.value());

        Object entity = mapping.entitySupplier().get();
        BeanUtils.copyProperties(model, entity);

        assertThat(getProperty(entity, mapping.property())).isEqualTo(mapping.value());
    }

    private static void setProperty(Object target, String property, Object value) {
        BeanWrapper wrapper = new BeanWrapperImpl(target);
        wrapper.setPropertyValue(property, value);
    }

    private static Object getProperty(Object target, String property) {
        BeanWrapper wrapper = new BeanWrapperImpl(target);
        return wrapper.getPropertyValue(property);
    }

    private static Stream<ModelMapping> modelMappings() {
        return Stream.of(
                mapping(ChatModel::new, ChatEntity::new, "ask", "模型提问"),
                mapping(DaoqitixingModel::new, DaoqitixingEntity::new, "beizhu", "模型备注"),
                mapping(DiscussjianshenkechengModel::new, DiscussjianshenkechengEntity::new, "content", "模型评论"),
                mapping(KechengyuyueModel::new, KechengyuyueEntity::new, "kechengmingcheng", "模型课程"),
                mapping(NewsModel::new, NewsEntity::new, "introduction", "模型新闻简介")
        );
    }

    private static ModelMapping mapping(Supplier<Object> modelSupplier,
                                        Supplier<Object> entitySupplier,
                                        String property,
                                        Object value) {
        return new ModelMapping(modelSupplier, entitySupplier, property, value);
    }

    private record ModelMapping(Supplier<Object> modelSupplier,
                                Supplier<Object> entitySupplier,
                                String property,
                                Object value) {
        @Override
        public String toString() {
            return modelSupplier.get().getClass().getSimpleName();
        }
    }
}


