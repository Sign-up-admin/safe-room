package com.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * 数据库字段检查工具
 * 用于检查必要的数据库字段是否存在
 */
@Component
public class DatabaseFieldChecker {
    
    private static final Logger logger = LoggerFactory.getLogger(DatabaseFieldChecker.class);
    
    private final JdbcTemplate jdbcTemplate;
    
    public DatabaseFieldChecker(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }
    
    /**
     * 检查users表是否包含必要的字段
     * @return 缺失的字段列表，如果所有字段都存在则返回空列表
     */
    public List<String> checkUsersTableFields() {
        List<String> missingFields = new ArrayList<>();
        
        try {
            // 检查password_hash字段
            if (!columnExists("users", "password_hash")) {
                missingFields.add("password_hash");
            }
            
            // 检查failed_login_attempts字段
            if (!columnExists("users", "failed_login_attempts")) {
                missingFields.add("failed_login_attempts");
            }
            
            // 检查lock_until字段
            if (!columnExists("users", "lock_until")) {
                missingFields.add("lock_until");
            }
            
        } catch (Exception e) {
            logger.error("检查users表字段时发生错误", e);
            // 如果检查失败，返回所有字段，表示需要检查
            missingFields.add("password_hash");
            missingFields.add("failed_login_attempts");
            missingFields.add("lock_until");
        }
        
        return missingFields;
    }
    
    /**
     * 检查operation_log表是否存在
     * @return 如果表存在返回true，否则返回false
     */
    public boolean checkOperationLogTable() {
        try {
            return tableExists("operation_log");
        } catch (Exception e) {
            logger.error("检查operation_log表时发生错误", e);
            return false;
        }
    }
    
    /**
     * 检查指定表是否存在
     * @param tableName 表名
     * @return 如果表存在返回true，否则返回false
     */
    private boolean tableExists(String tableName) {
        try {
            String sql = "SELECT COUNT(*) FROM information_schema.tables " +
                        "WHERE table_schema = 'public' AND table_name = ?";
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, tableName);
            return count != null && count > 0;
        } catch (Exception e) {
            logger.warn("检查表是否存在时发生错误: tableName={}", tableName, e);
            return false;
        }
    }
    
    /**
     * 检查指定表的指定列是否存在
     * @param tableName 表名
     * @param columnName 列名
     * @return 如果列存在返回true，否则返回false
     */
    private boolean columnExists(String tableName, String columnName) {
        try {
            String sql = "SELECT COUNT(*) FROM information_schema.columns " +
                        "WHERE table_schema = 'public' AND table_name = ? AND column_name = ?";
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, tableName, columnName);
            return count != null && count > 0;
        } catch (Exception e) {
            logger.warn("检查列是否存在时发生错误: tableName={}, columnName={}", tableName, columnName, e);
            return false;
        }
    }
    
    /**
     * 生成数据库迁移提示信息
     * @param missingFields 缺失的字段列表
     * @return 提示信息
     */
    public static String generateMigrationHint(List<String> missingFields) {
        if (missingFields == null || missingFields.isEmpty()) {
            return "";
        }
        
        StringBuilder hint = new StringBuilder();
        hint.append("数据库表结构不完整，缺少以下字段: ").append(String.join(", ", missingFields));
        hint.append("。请执行数据库迁移脚本: migration-add-password-hash.sql");
        
        return hint.toString();
    }
}

