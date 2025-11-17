-- 数据库迁移脚本：添加密码哈希字段和登录失败锁定字段
-- 执行时间：2025-01-XX
-- 说明：为所有用户表添加password_hash、failed_login_attempts、lock_until字段

-- 为users表添加字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lock_until TIMESTAMP;

-- 为yonghu表添加字段
ALTER TABLE yonghu ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE yonghu ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE yonghu ADD COLUMN IF NOT EXISTS lock_until TIMESTAMP;

-- 为jianshenjiaolian表添加字段
ALTER TABLE jianshenjiaolian ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE jianshenjiaolian ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE jianshenjiaolian ADD COLUMN IF NOT EXISTS lock_until TIMESTAMP;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_password_hash ON users(password_hash);
CREATE INDEX IF NOT EXISTS idx_yonghu_password_hash ON yonghu(password_hash);
CREATE INDEX IF NOT EXISTS idx_jianshenjiaolian_password_hash ON jianshenjiaolian(password_hash);

