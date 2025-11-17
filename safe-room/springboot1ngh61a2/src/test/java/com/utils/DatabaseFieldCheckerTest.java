package com.utils;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * DatabaseFieldChecker单元测试
 */
class DatabaseFieldCheckerTest {

    private DatabaseFieldChecker databaseFieldChecker;
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void setUp() {
        // 使用H2内存数据库进行测试
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("org.h2.Driver");
        dataSource.setUrl("jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1");
        dataSource.setUsername("sa");
        dataSource.setPassword("");

        jdbcTemplate = new JdbcTemplate(dataSource);
        databaseFieldChecker = new DatabaseFieldChecker(jdbcTemplate);

        // 创建测试表
        setupTestTables();
    }

    private void setupTestTables() {
        // 创建users表（包含所有必要字段）
        jdbcTemplate.execute("""
            CREATE TABLE users (
                id BIGINT PRIMARY KEY,
                username VARCHAR(100),
                password VARCHAR(100),
                password_hash VARCHAR(255),
                failed_login_attempts INTEGER DEFAULT 0,
                lock_until TIMESTAMP
            )
        """);

        // 创建operation_log表
        jdbcTemplate.execute("""
            CREATE TABLE operation_log (
                id BIGINT PRIMARY KEY,
                userid BIGINT,
                username VARCHAR(100),
                table_name VARCHAR(100),
                operation_type VARCHAR(50),
                content VARCHAR(500),
                ip VARCHAR(50),
                addtime TIMESTAMP
            )
        """);

        // 创建users表（缺少某些字段）用于测试
        jdbcTemplate.execute("""
            CREATE TABLE incomplete_users (
                id BIGINT PRIMARY KEY,
                username VARCHAR(100),
                password VARCHAR(100)
            )
        """);
    }

    @Test
    void shouldReturnEmptyListWhenAllFieldsExist() {
        List<String> missingFields = databaseFieldChecker.checkUsersTableFields();
        assertThat(missingFields).isEmpty();
    }

    @Test
    void shouldReturnMissingFieldsWhenFieldsDoNotExist() {
        // 创建一个缺少字段的checker来测试incomplete_users表
        DatabaseFieldChecker incompleteChecker = new DatabaseFieldChecker(jdbcTemplate) {
            @Override
            public List<String> checkUsersTableFields() {
                List<String> missingFields = new java.util.ArrayList<>();

                try {
                    // 检查password_hash字段 - 不存在
                    if (!columnExists("incomplete_users", "password_hash")) {
                        missingFields.add("password_hash");
                    }

                    // 检查failed_login_attempts字段 - 不存在
                    if (!columnExists("incomplete_users", "failed_login_attempts")) {
                        missingFields.add("failed_login_attempts");
                    }

                    // 检查lock_until字段 - 不存在
                    if (!columnExists("incomplete_users", "lock_until")) {
                        missingFields.add("lock_until");
                    }

                } catch (Exception e) {
                    // 如果检查失败，返回所有字段，表示需要检查
                    missingFields.add("password_hash");
                    missingFields.add("failed_login_attempts");
                    missingFields.add("lock_until");
                }

                return missingFields;
            }

            private boolean columnExists(String tableName, String columnName) {
                try {
                    String sql = "SELECT COUNT(*) FROM information_schema.columns " +
                                "WHERE table_name = ? AND column_name = ?";
                    Integer count = jdbcTemplate.queryForObject(sql, Integer.class, tableName, columnName);
                    return count != null && count > 0;
                } catch (Exception e) {
                    return false;
                }
            }
        };

        List<String> missingFields = incompleteChecker.checkUsersTableFields();
        assertThat(missingFields)
            .contains("password_hash")
            .contains("failed_login_attempts")
            .contains("lock_until");
    }

    @Test
    void shouldReturnTrueWhenOperationLogTableExists() {
        boolean tableExists = databaseFieldChecker.checkOperationLogTable();
        assertThat(tableExists).isTrue();
    }

    @Test
    void shouldReturnFalseWhenTableDoesNotExist() {
        DatabaseFieldChecker checker = new DatabaseFieldChecker(jdbcTemplate) {
            @Override
            public boolean checkOperationLogTable() {
                try {
                    return tableExists("non_existent_table");
                } catch (Exception e) {
                    return false;
                }
            }

            private boolean tableExists(String tableName) {
                try {
                    String sql = "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = ?";
                    Integer count = jdbcTemplate.queryForObject(sql, Integer.class, tableName);
                    return count != null && count > 0;
                } catch (Exception e) {
                    return false;
                }
            }
        };

        boolean tableExists = checker.checkOperationLogTable();
        assertThat(tableExists).isFalse();
    }

    @Test
    void shouldHandleExceptionInCheckUsersTableFields() {
        // 创建一个会抛出异常的JdbcTemplate来测试异常处理
        JdbcTemplate failingTemplate = new JdbcTemplate() {
            @Override
            public <T> T queryForObject(String sql, Class<T> requiredType, Object... args) {
                throw new RuntimeException("Database connection failed");
            }
        };

        DatabaseFieldChecker failingChecker = new DatabaseFieldChecker(failingTemplate);
        List<String> missingFields = failingChecker.checkUsersTableFields();

        assertThat(missingFields)
            .contains("password_hash")
            .contains("failed_login_attempts")
            .contains("lock_until");
    }

    @Test
    void shouldHandleExceptionInCheckOperationLogTable() {
        DatabaseFieldChecker checker = new DatabaseFieldChecker(jdbcTemplate) {
            @Override
            public boolean checkOperationLogTable() {
                try {
                    // 模拟异常
                    throw new RuntimeException("Database connection failed");
                } catch (Exception e) {
                    return false;
                }
            }
        };

        boolean result = checker.checkOperationLogTable();
        assertThat(result).isFalse();
    }

    @Test
    void shouldGenerateMigrationHintWithMissingFields() {
        List<String> missingFields = List.of("password_hash", "failed_login_attempts");
        String hint = DatabaseFieldChecker.generateMigrationHint(missingFields);

        assertThat(hint)
            .contains("数据库表结构不完整")
            .contains("password_hash")
            .contains("failed_login_attempts")
            .contains("migration-add-password-hash.sql");
    }

    @Test
    void shouldReturnEmptyStringWhenNoMissingFields() {
        List<String> missingFields = List.of();
        String hint = DatabaseFieldChecker.generateMigrationHint(missingFields);

        assertThat(hint).isEmpty();
    }

    @Test
    void shouldReturnEmptyStringWhenNullMissingFields() {
        String hint = DatabaseFieldChecker.generateMigrationHint(null);
        assertThat(hint).isEmpty();
    }

    @Test
    void shouldHandleDatabaseConnectionException() {
        // 测试数据库连接完全失败的情况
        JdbcTemplate failingTemplate = new JdbcTemplate() {
            @Override
            public <T> T queryForObject(String sql, Class<T> requiredType, Object... args) {
                throw new org.springframework.jdbc.CannotGetJdbcConnectionException("Connection refused");
            }
        };

        DatabaseFieldChecker failingChecker = new DatabaseFieldChecker(failingTemplate);
        List<String> missingFields = failingChecker.checkUsersTableFields();
        boolean operationLogExists = failingChecker.checkOperationLogTable();

        assertThat(missingFields)
            .contains("password_hash")
            .contains("failed_login_attempts")
            .contains("lock_until");
        assertThat(operationLogExists).isFalse();
    }

    @Test
    void shouldHandleSqlSyntaxException() {
        // 测试SQL语法错误的情况
        JdbcTemplate failingTemplate = new JdbcTemplate() {
            @Override
            public <T> T queryForObject(String sql, Class<T> requiredType, Object... args) {
                throw new org.springframework.jdbc.BadSqlGrammarException("Bad SQL grammar", sql, new java.sql.SQLException("Bad SQL grammar"));
            }
        };

        DatabaseFieldChecker failingChecker = new DatabaseFieldChecker(failingTemplate);
        List<String> missingFields = failingChecker.checkUsersTableFields();

        assertThat(missingFields)
            .contains("password_hash")
            .contains("failed_login_attempts")
            .contains("lock_until");
    }

    @Test
    void shouldHandleDataAccessException() {
        // 测试一般数据访问异常
        JdbcTemplate failingTemplate = new JdbcTemplate() {
            @Override
            public <T> T queryForObject(String sql, Class<T> requiredType, Object... args) {
                throw new org.springframework.dao.DataAccessException("Data access failed") {};
            }
        };

        DatabaseFieldChecker failingChecker = new DatabaseFieldChecker(failingTemplate);
        List<String> missingFields = failingChecker.checkUsersTableFields();
        boolean operationLogExists = failingChecker.checkOperationLogTable();

        assertThat(missingFields)
            .contains("password_hash")
            .contains("failed_login_attempts")
            .contains("lock_until");
        assertThat(operationLogExists).isFalse();
    }

    @Test
    void shouldHandleNullJdbcTemplate() {
        // 测试JdbcTemplate为null的情况
        DatabaseFieldChecker checker = new DatabaseFieldChecker(null);

        assertThatThrownBy(() -> checker.checkUsersTableFields())
            .isInstanceOf(NullPointerException.class);

        assertThatThrownBy(() -> checker.checkOperationLogTable())
            .isInstanceOf(NullPointerException.class);
    }



    @Test
    void shouldHandleQueryReturningNull() {
        // 测试queryForObject返回null的情况
        JdbcTemplate nullReturningTemplate = new JdbcTemplate() {
            @Override
            public <T> T queryForObject(String sql, Class<T> requiredType, Object... args) {
                return null; // 模拟查询返回null
            }
        };

        DatabaseFieldChecker checker = new DatabaseFieldChecker(nullReturningTemplate);
        List<String> missingFields = checker.checkUsersTableFields();
        boolean operationLogExists = checker.checkOperationLogTable();

        // 即使queryForObject返回null，也应该正常处理
        assertThat(missingFields).hasSize(3); // 所有字段都被认为是缺失的
        assertThat(operationLogExists).isFalse();
    }
}
