-- 清理测试数据以避免主键冲突
-- 删除测试中使用的特定ID数据

-- 清理users表中的测试数据
DELETE FROM users WHERE id IN (100, 101, 102);

-- 重置序列（如果需要）
-- 注意：PostgreSQL的BIGSERIAL会自动管理序列，但我们可以确保序列值正确
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1), true);

-- 清理yonghu表中的测试数据（如果存在）
-- DELETE FROM yonghu WHERE id IN (测试ID);

-- 显示当前users表的最大ID
SELECT 'Current max users.id:' as info, COALESCE(MAX(id), 0) as max_id FROM users;

