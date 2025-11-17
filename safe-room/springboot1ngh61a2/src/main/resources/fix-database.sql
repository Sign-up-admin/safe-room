-- 数据库修复脚本
-- 为 yonghu 表添加缺失的 huiyuankamingcheng 列
-- 适用于 PostgreSQL 数据库

-- 修复 yonghu 表：添加缺失的 huiyuankamingcheng 列
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'yonghu' 
        AND column_name = 'huiyuankamingcheng'
    ) THEN
        ALTER TABLE yonghu ADD COLUMN huiyuankamingcheng VARCHAR(200);
        RAISE NOTICE '已添加列 huiyuankamingcheng 到 yonghu 表';
    ELSE
        RAISE NOTICE '列 huiyuankamingcheng 已存在，跳过';
    END IF;
END $$;

-- 验证修复结果
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'yonghu' 
AND column_name = 'huiyuankamingcheng';

