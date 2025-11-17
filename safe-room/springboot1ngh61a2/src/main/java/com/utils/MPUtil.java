package com.utils;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;

/**
 * Mybatis-Plus Utility Class
 */
public class MPUtil {
	
	/**
	 * mybatis plus allEQ expression conversion
	 */
	public static Map<String, Object> allEQMapPre(Object bean, String pre) {
		Map<String, Object> map = new HashMap<>();
		Field[] fields = bean.getClass().getDeclaredFields();
		try {
			for (Field field : fields) {
                if (Modifier.isStatic(field.getModifiers())) {
                    continue;
                }
				field.setAccessible(true);
				Object val = field.get(bean);
				if (val != null) {
					if (pre.endsWith(".")) {
						map.put(pre + field.getName(), val);
					} else if (StringUtils.isEmpty(pre)) {
						map.put(field.getName(), val);
					} else {
						map.put(pre + "." + field.getName(), val);
					}
				}
			}
		} catch (Exception e) {
			return null;
		}
		return map;
	}

	/**
	 * Fuzzy query or equal
	 */
	public static <T> QueryWrapper<T> likeOrEq(QueryWrapper<T> wrapper, Object bean) {
		Field[] fields = bean.getClass().getDeclaredFields();
		try {
			for (Field field : fields) {
                if (Modifier.isStatic(field.getModifiers())) {
                    continue;
                }
				field.setAccessible(true);
				Object val = field.get(bean);
				if (val != null) {
					String column = camelToUnderline(field.getName());
					if (val instanceof String) {
						wrapper.like(column, val);
					} else {
						wrapper.eq(column, val);
					}
				}
			}
		} catch (Exception e) {
			// ignore
		}
		return wrapper;
	}

	/**
	 * Range query
	 */
	public static <T> QueryWrapper<T> between(QueryWrapper<T> wrapper, Map<String, Object> params) {
		for (Map.Entry<String, Object> entry : params.entrySet()) {
			String key = entry.getKey();
			Object value = entry.getValue();
			if (value != null && key.endsWith("Start")) {
				String column = camelToUnderline(key.substring(0, key.length() - 5));
				wrapper.ge(column, value);
			} else if (value != null && key.endsWith("End")) {
				String column = camelToUnderline(key.substring(0, key.length() - 3));
				wrapper.le(column, value);
			}
		}
		return wrapper;
	}

	/**
	 * Sort
	 */
	public static <T> QueryWrapper<T> sort(QueryWrapper<T> wrapper, Map<String, Object> params) {
		String sort = (String) params.get("sort");
		String order = (String) params.get("order");
		if (StringUtils.isNotBlank(sort) && StringUtils.isNotBlank(order)) {
			String column = camelToUnderline(sort);
			if ("ASC".equalsIgnoreCase(order)) {
				wrapper.orderByAsc(column);
			} else {
				wrapper.orderByDesc(column);
			}
		}
		return wrapper;
	}

	/**
	 * Camel case to underscore
	 */
	private static String camelToUnderline(String camel) {
		if (StringUtils.isBlank(camel)) {
			return camel;
		}
		StringBuilder sb = new StringBuilder();
		for (int i = 0; i < camel.length(); i++) {
			char c = camel.charAt(i);
			if (Character.isUpperCase(c)) {
				if (i > 0) {
					sb.append("_");
				}
				sb.append(Character.toLowerCase(c));
			} else {
				sb.append(c);
			}
		}
		return sb.toString();
	}
}

