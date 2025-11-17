package com.utils;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.IService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Predicate;

/**
 * 数据库测试辅助工具 - 提供数据库操作的测试辅助方法
 */
@Component
public class TestDatabaseHelper {

    private static final Logger log = LoggerFactory.getLogger(TestDatabaseHelper.class);

    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;

    public TestDatabaseHelper(JdbcTemplate jdbcTemplate, DataSource dataSource) {
        this.jdbcTemplate = jdbcTemplate;
        this.dataSource = dataSource;
    }

    // ==================== 表和列操作 ====================

    /**
     * 检查表是否存在
     */
    public boolean tableExists(String tableName) {
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            try (ResultSet tables = metaData.getTables(null, null, tableName.toUpperCase(), new String[]{"TABLE"})) {
                return tables.next();
            }
        } catch (Exception e) {
            log.warn("Error checking if table exists: {}", tableName, e);
            return false;
        }
    }

    /**
     * 检查列是否存在
     */
    public boolean columnExists(String tableName, String columnName) {
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            try (ResultSet columns = metaData.getColumns(null, null, tableName.toUpperCase(), columnName.toUpperCase())) {
                return columns.next();
            }
        } catch (Exception e) {
            log.warn("Error checking if column exists: {}.{}", tableName, columnName, e);
            return false;
        }
    }

    /**
     * 获取表的行数
     */
    public int getTableRowCount(String tableName) {
        try {
            String sql = "SELECT COUNT(*) FROM " + tableName;
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
            return count != null ? count : 0;
        } catch (Exception e) {
            log.warn("Error getting row count for table: {}", tableName, e);
            return 0;
        }
    }

    // ==================== 数据清理 ====================

    /**
     * 清空指定表
     */
    public void truncateTable(String tableName) {
        try {
            String sql = "TRUNCATE TABLE " + tableName;
            jdbcTemplate.execute(sql);
            log.debug("Truncated table: {}", tableName);
        } catch (Exception e) {
            log.warn("Error truncating table: {}", tableName, e);
        }
    }

    /**
     * 删除表中匹配条件的数据
     */
    public void deleteFromTableWhere(String tableName, String whereClause) {
        try {
            String sql = "DELETE FROM " + tableName + " WHERE " + whereClause;
            int deletedRows = jdbcTemplate.update(sql);
            log.debug("Deleted {} rows from table {} with condition: {}", deletedRows, tableName, whereClause);
        } catch (Exception e) {
            log.warn("Error deleting from table {} with condition: {}", tableName, whereClause, e);
        }
    }

    /**
     * 批量清理测试数据
     */
    public void cleanupTestData(String... prefixes) {
        Map<String, IService<?>> serviceMap = getServiceMap();
        TestDataCleanup.cleanupAllTestData(serviceMap);
    }

    // ==================== 数据验证 ====================

    /**
     * 验证表中是否存在指定条件的数据
     */
    public boolean existsInTable(String tableName, String whereClause) {
        try {
            String sql = "SELECT COUNT(*) FROM " + tableName + " WHERE " + whereClause;
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
            return count != null && count > 0;
        } catch (Exception e) {
            log.warn("Error checking existence in table {} with condition: {}", tableName, whereClause, e);
            return false;
        }
    }

    /**
     * 获取表中的记录数（带条件）
     */
    public int getRowCountWithCondition(String tableName, String whereClause) {
        try {
            String sql = "SELECT COUNT(*) FROM " + tableName + " WHERE " + whereClause;
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
            return count != null ? count : 0;
        } catch (Exception e) {
            log.warn("Error getting row count for table {} with condition: {}", tableName, whereClause, e);
            return 0;
        }
    }

    // ==================== 高级操作 ====================

    /**
     * 执行自定义SQL查询并返回结果
     */
    public <T> List<T> executeQuery(String sql, Class<T> resultType, Object... params) {
        try {
            if (resultType == Integer.class || resultType == Long.class || resultType == String.class) {
                return jdbcTemplate.queryForList(sql, resultType, params);
            } else {
                // 对于复杂对象，需要自定义RowMapper
                return jdbcTemplate.query(sql, (rs, rowNum) -> {
                    // 这里可以实现自定义的映射逻辑
                    // 暂时返回null，实际使用时需要根据具体需求实现
                    log.warn("Complex object mapping not implemented for type: {}", resultType.getSimpleName());
                    return null;
                }, params);
            }
        } catch (Exception e) {
            log.warn("Error executing query: {}", sql, e);
            return new ArrayList<>();
        }
    }

    /**
     * 执行自定义SQL更新操作
     */
    public int executeUpdate(String sql, Object... params) {
        try {
            return jdbcTemplate.update(sql, params);
        } catch (Exception e) {
            log.warn("Error executing update: {}", sql, e);
            return 0;
        }
    }

    /**
     * 批量执行SQL语句
     */
    public void executeBatch(List<String> sqlStatements) {
        try {
            for (String sql : sqlStatements) {
                jdbcTemplate.execute(sql);
            }
            log.debug("Executed {} SQL statements in batch", sqlStatements.size());
        } catch (Exception e) {
            log.warn("Error executing SQL batch", e);
        }
    }

    // ==================== 工具方法 ====================

    /**
     * 转义SQL字符串（防止SQL注入）
     */
    public String escapeSqlString(String value) {
        if (value == null) {
            return "NULL";
        }
        return "'" + value.replace("'", "''") + "'";
    }

    /**
     * 构建IN子句
     */
    public String buildInClause(List<?> values) {
        if (values == null || values.isEmpty()) {
            return "()";
        }

        StringBuilder sb = new StringBuilder("(");
        for (int i = 0; i < values.size(); i++) {
            if (i > 0) {
                sb.append(",");
            }
            if (values.get(i) instanceof String) {
                sb.append(escapeSqlString(values.get(i).toString()));
            } else {
                sb.append(values.get(i));
            }
        }
        sb.append(")");
        return sb.toString();
    }

    // ==================== 私有方法 ====================

    /**
     * 获取服务映射表（这里需要根据实际的服务注入情况调整）
     */
    private Map<String, IService<?>> getServiceMap() {
        // 这里应该注入所有需要的服务
        // 由于依赖注入的限制，这里返回空映射，实际使用时应该从Spring上下文中获取
        log.debug("Service map should be injected from Spring context");
        return Map.of();
    }
}
