-- 直接修改数据库重置admin账户（开发环境）
-- 适用于PostgreSQL数据库
-- 使用方法：psql -h localhost -U postgres -d fitness_gym -f reset-admin-direct.sql

-- 重置admin账户密码为 "admin"，清除所有锁定状态
UPDATE users 
SET 
    password = 'admin',                    -- 设置明文密码为admin
    password_hash = NULL,                  -- 清除BCrypt哈希，让系统使用旧密码字段
    failed_login_attempts = 0,             -- 清除登录失败次数
    lock_until = NULL,                     -- 清除锁定时间
    status = 0                             -- 确保账户状态为正常（0=正常，1=锁定）
WHERE username = 'admin';

-- 验证更新结果
SELECT 
    id, 
    username, 
    password, 
    CASE 
        WHEN password_hash IS NULL THEN 'NULL (将使用旧密码admin)' 
        ELSE '已设置BCrypt哈希' 
    END as password_status,
    failed_login_attempts, 
    lock_until, 
    status,
    role 
FROM users 
WHERE username = 'admin';

-- 如果还有其他管理员账户需要重置，可以取消下面的注释
-- UPDATE users 
-- SET 
--     password = '123456',
--     password_hash = NULL,
--     failed_login_attempts = 0,
--     lock_until = NULL,
--     status = 0
-- WHERE username IN ('manager', 'operator');





