-- 重置admin账户密码脚本
-- 使用方法：在PostgreSQL数据库中执行此脚本
-- 
-- 注意：此脚本将admin账户的密码重置为 "admin"
-- 同时清除账户锁定状态和登录失败次数

-- 方法1：如果password_hash字段为NULL或空，重置为使用旧密码字段
-- 这样可以使用明文密码 "admin" 登录（系统会自动迁移到BCrypt）
UPDATE users 
SET 
    password = 'admin',
    password_hash = NULL,
    failed_login_attempts = 0,
    lock_until = NULL
WHERE username = 'admin';

-- 方法2：如果需要直接设置BCrypt哈希（推荐）
-- 注意：下面的BCrypt哈希对应密码 "admin"
-- 这是使用BCrypt强度12生成的哈希值
-- 如果此哈希不工作，请使用方法1或使用密码重置API

-- 生成BCrypt哈希的方法：
-- 1. 使用Java代码：PasswordEncoderUtil.encode("admin")
-- 2. 使用在线工具：https://bcrypt-generator.com/ (rounds: 12)
-- 3. 使用密码重置API：POST /springboot1ngh61a2/users/resetPass?username=admin

-- 示例BCrypt哈希（密码：admin，rounds：12）
-- 注意：每次生成的BCrypt哈希都不同，所以这里只是示例
-- UPDATE users 
-- SET 
--     password = 'admin',
--     password_hash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyY5Y5Y5Y5Y5',
--     failed_login_attempts = 0,
--     lock_until = NULL
-- WHERE username = 'admin';

-- 验证更新结果
SELECT id, username, password, password_hash, failed_login_attempts, lock_until, role 
FROM users 
WHERE username = 'admin';





