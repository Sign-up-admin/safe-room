-- 创建操作日志表
CREATE TABLE IF NOT EXISTS operation_log (
    id BIGSERIAL PRIMARY KEY,
    userid BIGINT,
    username VARCHAR(255),
    table_name VARCHAR(255),
    operation_type VARCHAR(50),
    content TEXT,
    ip VARCHAR(50),
    user_agent TEXT,
    addtime TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_operation_log_userid ON operation_log(userid);
CREATE INDEX IF NOT EXISTS idx_operation_log_operation_type ON operation_log(operation_type);
CREATE INDEX IF NOT EXISTS idx_operation_log_table_name ON operation_log(table_name);
CREATE INDEX IF NOT EXISTS idx_operation_log_addtime ON operation_log(addtime);

