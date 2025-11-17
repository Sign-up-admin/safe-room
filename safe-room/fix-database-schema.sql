-- 修复数据库结构以符合后端代码要求
-- 连接到 fitness_gym 数据库执行此脚本

-- 1. 创建 legal_terms 表（如果不存在）
CREATE TABLE IF NOT EXISTS legal_terms (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(100),
    title VARCHAR(200) NOT NULL,
    version VARCHAR(50),
    content TEXT NOT NULL,
    status VARCHAR(50),
    effective_date TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. 创建 membership_card 表（如果不存在）
CREATE TABLE IF NOT EXISTS membership_card (
    id BIGSERIAL PRIMARY KEY,
    membership_card_name VARCHAR(200) NOT NULL,
    image TEXT,
    validity_period VARCHAR(200),
    price INT,
    usage_instructions TEXT,
    membership_card_details TEXT,
    addtime TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. 创建 operation_log 表（如果不存在）
CREATE TABLE IF NOT EXISTS operation_log (
    id BIGSERIAL PRIMARY KEY,
    userid BIGINT,
    username VARCHAR(100),
    table_name VARCHAR(100),
    operation_type VARCHAR(50),
    content TEXT,
    ip VARCHAR(50),
    user_agent TEXT,
    addtime TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. 为 operation_log 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_operation_log_userid ON operation_log(userid);
CREATE INDEX IF NOT EXISTS idx_operation_log_operation_type ON operation_log(operation_type);
CREATE INDEX IF NOT EXISTS idx_operation_log_table_name ON operation_log(table_name);
CREATE INDEX IF NOT EXISTS idx_operation_log_addtime ON operation_log(addtime);

-- 5. 如果表已存在但缺少字段，添加缺失的字段
-- legal_terms 表添加缺失字段
DO $$
BEGIN
    -- 添加 type 字段（如果不存在）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'legal_terms' AND column_name = 'type') THEN
        ALTER TABLE legal_terms ADD COLUMN type VARCHAR(100);
    END IF;
    
    -- 添加 version 字段（如果不存在）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'legal_terms' AND column_name = 'version') THEN
        ALTER TABLE legal_terms ADD COLUMN version VARCHAR(50);
    END IF;
    
    -- 添加 status 字段（如果不存在）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'legal_terms' AND column_name = 'status') THEN
        ALTER TABLE legal_terms ADD COLUMN status VARCHAR(50);
    END IF;
    
    -- 添加 effective_date 字段（如果不存在）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'legal_terms' AND column_name = 'effective_date') THEN
        ALTER TABLE legal_terms ADD COLUMN effective_date TIMESTAMP;
    END IF;
END $$;

