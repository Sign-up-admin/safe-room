-- 完整的数据库修复脚本
-- 修复数据库结构以符合后端代码要求

-- ============================================
-- 1. 创建缺失的表
-- ============================================

-- 1.1 创建 legal_terms 表
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

-- 1.2 创建 membership_card 表
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

-- 1.3 创建 operation_log 表
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

-- ============================================
-- 2. 创建索引以提高查询性能
-- ============================================

CREATE INDEX IF NOT EXISTS idx_operation_log_userid ON operation_log(userid);
CREATE INDEX IF NOT EXISTS idx_operation_log_operation_type ON operation_log(operation_type);
CREATE INDEX IF NOT EXISTS idx_operation_log_table_name ON operation_log(table_name);
CREATE INDEX IF NOT EXISTS idx_operation_log_addtime ON operation_log(addtime);

-- ============================================
-- 3. 添加缺失的字段（如果表已存在）
-- ============================================

DO $$
BEGIN
    -- legal_terms 表添加缺失字段
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'legal_terms' AND column_name = 'type') THEN
        ALTER TABLE legal_terms ADD COLUMN type VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'legal_terms' AND column_name = 'version') THEN
        ALTER TABLE legal_terms ADD COLUMN version VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'legal_terms' AND column_name = 'status') THEN
        ALTER TABLE legal_terms ADD COLUMN status VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'legal_terms' AND column_name = 'effective_date') THEN
        ALTER TABLE legal_terms ADD COLUMN effective_date TIMESTAMP;
    END IF;
END $$;

-- ============================================
-- 4. 创建PostgreSQL兼容函数
-- ============================================

-- 4.1 创建ROUND函数重载以支持DOUBLE PRECISION类型
CREATE OR REPLACE FUNCTION round(val DOUBLE PRECISION, digits INT DEFAULT 0)
RETURNS NUMERIC AS $$
BEGIN
    RETURN ROUND(val::NUMERIC, digits);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4.2 创建DATE_FORMAT函数兼容（MySQL -> PostgreSQL）
CREATE OR REPLACE FUNCTION date_format(timestamp_val TIMESTAMP, format_str TEXT)
RETURNS TEXT AS $$
BEGIN
    -- 将MySQL的DATE_FORMAT格式转换为PostgreSQL的TO_CHAR格式
    format_str := REPLACE(format_str, '%Y-%m-%d', 'YYYY-MM-DD');
    format_str := REPLACE(format_str, '%Y-%m', 'YYYY-MM');
    format_str := REPLACE(format_str, '%Y', 'YYYY');
    RETURN TO_CHAR(timestamp_val, format_str);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- 5. 验证修复
-- ============================================

-- 检查表是否存在
SELECT 'Tables created:' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('legal_terms', 'membership_card', 'operation_log')
ORDER BY table_name;

-- 检查函数是否存在
SELECT 'Functions created:' as status;
SELECT proname, pronargs 
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace 
AND proname IN ('round', 'date_format')
ORDER BY proname;

