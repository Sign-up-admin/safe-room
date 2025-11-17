-- 数据库迁移脚本：为 discussjianshenkecheng 表添加缺失的列
-- 执行时间：2025-11-15
-- 说明：添加 sfsh 和 clicktime 列以匹配实体类定义

-- 为 discussjianshenkecheng 表添加 sfsh 列
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'discussjianshenkecheng' 
        AND column_name = 'sfsh'
    ) THEN
        ALTER TABLE discussjianshenkecheng ADD COLUMN sfsh VARCHAR(200) DEFAULT '待审核';
        RAISE NOTICE '已添加列 sfsh 到 discussjianshenkecheng 表';
    ELSE
        RAISE NOTICE '列 sfsh 已存在，跳过';
    END IF;
END $$;

-- 为 discussjianshenkecheng 表添加 clicktime 列
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'discussjianshenkecheng' 
        AND column_name = 'clicktime'
    ) THEN
        ALTER TABLE discussjianshenkecheng ADD COLUMN clicktime TIMESTAMP;
        RAISE NOTICE '已添加列 clicktime 到 discussjianshenkecheng 表';
    ELSE
        RAISE NOTICE '列 clicktime 已存在，跳过';
    END IF;
END $$;

-- 验证修复结果
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'discussjianshenkecheng' 
AND column_name IN ('sfsh', 'clicktime')
ORDER BY column_name;

