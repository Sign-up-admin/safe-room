-- 快速初始化admin用户（开发环境）
-- 使用方法：psql -h localhost -U postgres -d fitness_gym -f init-admin-user.sql

-- 检查并插入admin用户
INSERT INTO users (id, username, password, password_hash, failed_login_attempts, lock_until, image, role, status, addtime) 
VALUES 
  (1, 'admin', 'admin', NULL, 0, NULL, 'upload/image1.jpg', '管理员', 0, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE 
SET 
  username = EXCLUDED.username,
  password = EXCLUDED.password,
  password_hash = NULL,
  failed_login_attempts = 0,
  lock_until = NULL,
  status = 0;

-- 验证插入结果
SELECT id, username, password, password_hash, failed_login_attempts, lock_until, role, status 
FROM users 
WHERE username = 'admin';

