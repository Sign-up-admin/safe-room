package com.utils;

import java.lang.reflect.Field;
import java.util.Map;

/**
 * Map工具类
 */
public class MapUtils {
    
    /**
     * 将Map转换为对象
     * @param map Map数据
     * @param clazz 目标类
     * @return 对象实例
     */
    public static <T> T mapToObject(Map<String, Object> map, Class<T> clazz) 
            throws IllegalAccessException, InstantiationException, NoSuchMethodException, java.lang.reflect.InvocationTargetException {
        if (map == null || clazz == null) {
            return null;
        }
        
        T obj = clazz.getDeclaredConstructor().newInstance();
        Field[] fields = clazz.getDeclaredFields();
        
        for (Field field : fields) {
            field.setAccessible(true);
            String fieldName = field.getName();
            
            if (map.containsKey(fieldName)) {
                Object value = map.get(fieldName);
                if (value != null) {
                    try {
                        field.set(obj, value);
                    } catch (IllegalArgumentException e) {
                        // 类型不匹配时忽略
                    }
                }
            }
        }
        
        return obj;
    }
}

