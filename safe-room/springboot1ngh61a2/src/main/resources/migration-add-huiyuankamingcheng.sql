-- 为 yonghu 表添加 huiyuankamingcheng 列（如果不存在）
-- 适用于 PostgreSQL 数据库

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'yonghu' 
        AND column_name = 'huiyuankamingcheng'
    ) THEN
        ALTER TABLE yonghu ADD COLUMN huiyuankamingcheng VARCHAR(200);
    END IF;
END $$;

