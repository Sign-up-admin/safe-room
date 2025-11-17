-- 检查用户密码脚本
-- 使用方法：在PostgreSQL数据库中执行此脚本
-- 
-- 功能：
-- 1. 查询指定用户（或所有用户）的密码字段状态
-- 2. 分析密码验证方式（BCrypt哈希 或 明文密码）
-- 3. 检查账号锁定状态
-- 4. 提供重置密码的SQL（注释形式）

-- ============================================
-- 1. 查询指定用户的密码信息
-- ============================================
-- 使用方法：将 'your_username' 替换为要检查的用户名
-- 示例：查询用户名为 'admin' 的用户

SELECT 
    id,
    username,
    -- 密码字段（旧密码，明文）
    CASE 
        WHEN password IS NULL THEN 'NULL (未设置)'
        WHEN password = '' THEN '空字符串'
        ELSE '已设置 (' || LENGTH(password) || ' 字符)'
    END as password_status,
    password as password_value,
    -- BCrypt哈希密码字段
    CASE 
        WHEN password_hash IS NULL THEN 'NULL (未设置，将使用旧密码字段)'
        WHEN password_hash = '' THEN '空字符串'
        WHEN password_hash LIKE '$2a$%' OR password_hash LIKE '$2b$%' OR password_hash LIKE '$2y$%' THEN 
            'BCrypt哈希 (长度: ' || LENGTH(password_hash) || ')'
        ELSE '非标准格式'
    END as password_hash_status,
    password_hash as password_hash_value,
    -- 登录失败次数
    COALESCE(failed_login_attempts, 0) as failed_login_attempts,
    -- 账号锁定状态
    CASE 
        WHEN lock_until IS NULL THEN '未锁定'
        WHEN lock_until > NOW() THEN '已锁定 (锁定至: ' || TO_CHAR(lock_until, 'YYYY-MM-DD HH24:MI:SS') || ')'
        ELSE '锁定已过期'
    END as lock_status,
    lock_until,
    -- 账号状态
    CASE 
        WHEN status IS NULL THEN 'NULL'
        WHEN status = 0 THEN '正常'
        WHEN status = 1 THEN '已锁定'
        ELSE '未知状态: ' || status
    END as account_status,
    status,
    role,
    addtime
FROM users 
WHERE username = 'your_username';  -- 替换为要检查的用户名

-- ============================================
-- 2. 查询所有用户的密码信息摘要
-- ============================================
-- 查看所有用户的密码设置情况

SELECT 
    username,
    CASE 
        WHEN password_hash IS NOT NULL AND password_hash != '' THEN '使用BCrypt'
        WHEN password IS NOT NULL AND password != '' THEN '使用明文密码'
        ELSE '密码未设置'
    END as password_type,
    COALESCE(failed_login_attempts, 0) as failed_attempts,
    CASE 
        WHEN lock_until IS NULL THEN '正常'
        WHEN lock_until > NOW() THEN '已锁定'
        ELSE '锁定已过期'
    END as account_status,
    role
FROM users
ORDER BY username;

-- ============================================
-- 3. 查询密码验证方式分析
-- ============================================
-- 分析指定用户的密码验证方式

SELECT 
    username,
    CASE 
        WHEN password_hash IS NOT NULL 
             AND password_hash != '' 
             AND (password_hash LIKE '$2a$%' OR password_hash LIKE '$2b$%' OR password_hash LIKE '$2y$%')
             AND LENGTH(password_hash) = 60 THEN 
            '将使用BCrypt验证 (password_hash字段)'
        WHEN password_hash IS NULL OR password_hash = '' THEN
            CASE 
                WHEN password IS NOT NULL AND password != '' THEN 
                    '将使用明文密码验证 (password字段) - 首次登录后会自动迁移到BCrypt'
                ELSE 
                    '密码未设置 - 无法登录'
            END
        ELSE 
            '密码格式异常 - 需要检查'
    END as verification_method,
    CASE 
        WHEN password_hash IS NOT NULL AND password_hash != '' THEN '是'
        ELSE '否'
    END as has_bcrypt_hash,
    CASE 
        WHEN password IS NOT NULL AND password != '' THEN '是'
        ELSE '否'
    END as has_legacy_password
FROM users
WHERE username = 'your_username';  -- 替换为要检查的用户名

-- ============================================
-- 4. 检查账号锁定状态
-- ============================================
-- 查看所有被锁定的账号

SELECT 
    username,
    failed_login_attempts,
    lock_until,
    CASE 
        WHEN lock_until IS NULL THEN '未锁定'
        WHEN lock_until > NOW() THEN 
            '已锁定，剩余时间: ' || EXTRACT(EPOCH FROM (lock_until - NOW()))::INTEGER || ' 秒'
        ELSE '锁定已过期'
    END as lock_info
FROM users
WHERE lock_until IS NOT NULL AND lock_until > NOW()
ORDER BY lock_until DESC;

-- ============================================
-- 5. 重置密码SQL（注释形式，需要时取消注释）
-- ============================================

-- 方法1：重置为明文密码（系统会自动迁移到BCrypt）
-- 将 'your_username' 替换为用户名，'new_password' 替换为新密码
/*
UPDATE users 
SET 
    password = 'new_password',           -- 设置新密码
    password_hash = NULL,                -- 清除BCrypt哈希，使用明文密码
    failed_login_attempts = 0,           -- 清除登录失败次数
    lock_until = NULL,                   -- 清除锁定状态
    status = 0                           -- 确保账号状态为正常
WHERE username = 'your_username';

-- 验证更新结果
SELECT id, username, password, password_hash, failed_login_attempts, lock_until, status 
FROM users 
WHERE username = 'your_username';
*/

-- 方法2：直接设置BCrypt哈希（推荐用于生产环境）
-- 注意：需要先使用Java代码生成BCrypt哈希
-- PasswordEncoderUtil.encode("your_password")
-- 或者使用在线工具：https://bcrypt-generator.com/ (rounds: 12)
/*
UPDATE users 
SET 
    password = 'your_password',          -- 保留明文密码用于向后兼容（可选）
    password_hash = '$2a$12$...',        -- 替换为实际的BCrypt哈希值
    failed_login_attempts = 0,
    lock_until = NULL,
    status = 0
WHERE username = 'your_username';

-- 验证更新结果
SELECT id, username, password, password_hash, failed_login_attempts, lock_until, status 
FROM users 
WHERE username = 'your_username';
*/

-- ============================================
-- 6. 清除账号锁定状态（不修改密码）
-- ============================================

-- 清除指定用户的锁定状态和失败次数
/*
UPDATE users 
SET 
    failed_login_attempts = 0,
    lock_until = NULL
WHERE username = 'your_username';  -- 替换为要解锁的用户名

-- 验证更新结果
SELECT username, failed_login_attempts, lock_until 
FROM users 
WHERE username = 'your_username';
*/

-- ============================================
-- 7. 诊断登录失败原因
-- ============================================
-- 综合查询，帮助诊断登录失败的原因

SELECT 
    username,
    -- 用户是否存在
    '用户存在' as user_exists,
    -- 密码状态
    CASE 
        WHEN password_hash IS NOT NULL AND password_hash != '' 
             AND (password_hash LIKE '$2a$%' OR password_hash LIKE '$2b$%' OR password_hash LIKE '$2y$%')
             AND LENGTH(password_hash) = 60 THEN 
            '密码已设置（BCrypt格式正确）'
        WHEN password IS NOT NULL AND password != '' THEN 
            '密码已设置（明文格式，首次登录后会自动迁移）'
        ELSE 
            '密码未设置或格式错误'
    END as password_diagnosis,
    -- 账号状态
    CASE 
        WHEN status = 1 THEN '账号已被管理员锁定'
        WHEN lock_until IS NOT NULL AND lock_until > NOW() THEN 
            '账号因登录失败过多被锁定（锁定至: ' || TO_CHAR(lock_until, 'YYYY-MM-DD HH24:MI:SS') || '）'
        WHEN COALESCE(failed_login_attempts, 0) >= 5 THEN 
            '登录失败次数过多（' || failed_login_attempts || '次），可能已被锁定'
        ELSE '账号状态正常'
    END as account_diagnosis,
    -- 建议操作
    CASE 
        WHEN password_hash IS NULL AND (password IS NULL OR password = '') THEN 
            '需要重置密码'
        WHEN status = 1 THEN 
            '需要管理员解除锁定（设置 status = 0）'
        WHEN lock_until IS NOT NULL AND lock_until > NOW() THEN 
            '需要清除锁定状态（设置 lock_until = NULL）'
        WHEN COALESCE(failed_login_attempts, 0) > 0 THEN 
            '可以清除失败次数（设置 failed_login_attempts = 0）'
        ELSE 
            '账号状态正常，请检查输入的密码是否正确'
    END as recommendation
FROM users
WHERE username = 'your_username';  -- 替换为要诊断的用户名

