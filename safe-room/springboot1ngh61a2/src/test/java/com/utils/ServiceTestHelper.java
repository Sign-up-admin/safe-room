package com.utils;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import java.util.HashMap;
import java.util.Map;

/**
 * Service测试辅助类，提供通用的测试数据构建方法
 */
public class ServiceTestHelper {

    /**
     * 创建基本的分页参数Map
     */
    public static Map<String, Object> createPageParams(int page, int limit) {
        Map<String, Object> params = new HashMap<>();
        params.put("page", String.valueOf(page));
        params.put("limit", String.valueOf(limit));
        return params;
    }

    /**
     * 创建空的分页参数Map
     */
    public static Map<String, Object> createEmptyPageParams() {
        return new HashMap<>();
    }

    /**
     * 创建包含查询条件的分页参数Map
     */
    public static Map<String, Object> createPageParamsWithFilter(int page, int limit, String filterKey, Object filterValue) {
        Map<String, Object> params = createPageParams(page, limit);
        params.put(filterKey, filterValue);
        return params;
    }

    /**
     * 创建包含多个查询条件的分页参数Map
     */
    public static Map<String, Object> createPageParamsWithFilters(int page, int limit, Map<String, Object> filters) {
        Map<String, Object> params = createPageParams(page, limit);
        if (filters != null) {
            params.putAll(filters);
        }
        return params;
    }

    /**
     * 创建无效的分页参数（负数页码）
     */
    public static Map<String, Object> createInvalidPageParams() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "-1");
        params.put("limit", "10");
        return params;
    }

    /**
     * 创建零限制的分页参数
     */
    public static Map<String, Object> createZeroLimitPageParams() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "0");
        return params;
    }

    /**
     * 创建超大页码的分页参数
     */
    public static Map<String, Object> createLargePageParams() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "999999");
        params.put("limit", "10");
        return params;
    }

    /**
     * 创建包含空白字符串参数的分页参数Map
     */
    public static Map<String, Object> createPageParamsWithBlankStrings(int page, int limit) {
        Map<String, Object> params = createPageParams(page, limit);
        params.put("keyword", "   ");
        params.put("filter", "");
        return params;
    }

    /**
     * 创建统计查询参数Map（selectValue）
     */
    public static Map<String, Object> createValueStatParams(String xColumn, String yColumn) {
        Map<String, Object> params = new HashMap<>();
        params.put("xColumn", xColumn);
        params.put("yColumn", yColumn);
        return params;
    }

    /**
     * 创建时间统计查询参数Map（selectTimeStatValue）
     */
    public static Map<String, Object> createTimeStatParams(String xColumn, String yColumn, String timeStatType) {
        Map<String, Object> params = createValueStatParams(xColumn, yColumn);
        params.put("timeStatType", timeStatType);
        return params;
    }

    /**
     * 创建分组查询参数Map（selectGroup）
     */
    public static Map<String, Object> createGroupParams(String column) {
        Map<String, Object> params = new HashMap<>();
        params.put("column", column);
        return params;
    }

    /**
     * 创建不存在的查询条件Wrapper
     */
    public static <T> QueryWrapper<T> createNonExistentWrapper(String column, Object value) {
        QueryWrapper<T> wrapper = new QueryWrapper<>();
        wrapper.eq(column, value);
        return wrapper;
    }

    /**
     * 创建空查询条件Wrapper
     */
    public static <T> QueryWrapper<T> createEmptyWrapper() {
        return new QueryWrapper<>();
    }

    /**
     * 创建无效的统计查询参数（缺失必需字段）
     */
    public static Map<String, Object> createInvalidValueStatParams() {
        Map<String, Object> params = new HashMap<>();
        params.put("xColumn", null);
        params.put("yColumn", "someColumn");
        return params;
    }

    /**
     * 创建部分有效的统计查询参数（只有xColumn）
     */
    public static Map<String, Object> createPartialValueStatParams(String xColumn) {
        Map<String, Object> params = new HashMap<>();
        params.put("xColumn", xColumn);
        // yColumn is missing
        return params;
    }

    /**
     * 创建无效的时间统计查询参数（缺失timeStatType）
     */
    public static Map<String, Object> createInvalidTimeStatParams(String xColumn, String yColumn) {
        Map<String, Object> params = createValueStatParams(xColumn, yColumn);
        // timeStatType is missing
        return params;
    }

    /**
     * 创建包含特殊字符的查询参数
     */
    public static Map<String, Object> createPageParamsWithSpecialChars(int page, int limit) {
        Map<String, Object> params = createPageParams(page, limit);
        params.put("keyword", "测试%_数据");
        params.put("filter", "<script>alert('xss')</script>");
        return params;
    }

    /**
     * 创建超长字符串的查询参数
     */
    public static Map<String, Object> createPageParamsWithLongStrings(int page, int limit) {
        Map<String, Object> params = createPageParams(page, limit);
        String longString = "a".repeat(10000);
        params.put("keyword", longString);
        return params;
    }

    /**
     * 创建包含null值的查询参数
     */
    public static Map<String, Object> createPageParamsWithNulls(int page, int limit) {
        Map<String, Object> params = createPageParams(page, limit);
        params.put("keyword", null);
        params.put("status", null);
        return params;
    }

    /**
     * 创建范围查询参数（用于between查询）
     */
    public static Map<String, Object> createRangeParams(String fieldName, Object minValue, Object maxValue) {
        Map<String, Object> params = new HashMap<>();
        params.put(fieldName + "_start", minValue);
        params.put(fieldName + "_end", maxValue);
        return params;
    }

    /**
     * 创建排序参数
     */
    public static Map<String, Object> createSortParams(String sortField, String sortOrder) {
        Map<String, Object> params = new HashMap<>();
        params.put("sort", sortField);
        params.put("order", sortOrder);
        return params;
    }

    /**
     * 创建组合的分页和排序参数
     */
    public static Map<String, Object> createPageSortParams(int page, int limit, String sortField, String sortOrder) {
        Map<String, Object> params = createPageParams(page, limit);
        params.putAll(createSortParams(sortField, sortOrder));
        return params;
    }

    /**
     * 创建模糊查询参数
     */
    public static Map<String, Object> createLikeParams(String fieldName, String keyword) {
        Map<String, Object> params = new HashMap<>();
        params.put(fieldName + "_like", keyword);
        return params;
    }

    /**
     * 创建精确匹配查询参数
     */
    public static Map<String, Object> createEqParams(String fieldName, Object value) {
        Map<String, Object> params = new HashMap<>();
        params.put(fieldName + "_eq", value);
        return params;
    }

    /**
     * 创建多字段组合查询参数
     */
    public static Map<String, Object> createMultiFieldParams(Map<String, Object> fieldValues, String operator) {
        Map<String, Object> params = new HashMap<>();
        fieldValues.forEach((field, value) -> {
            params.put(field + "_" + operator, value);
        });
        return params;
    }
}

