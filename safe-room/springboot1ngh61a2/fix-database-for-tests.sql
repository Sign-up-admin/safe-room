-- 数据库修复脚本：为前端测试准备数据 (PostgreSQL版本)
-- 执行时间：2025-11-XX
-- 说明：确保数据库有正确的表结构和测试数据

-- 为测试用户设置哈希密码（如果没有的话）
UPDATE yonghu SET password_hash = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lbdxp7O.7C0XJ8Eo' WHERE yonghuzhanghao = '用户账号1' AND (password_hash IS NULL OR password_hash = '');
UPDATE jianshenjiaolian SET password_hash = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lbdxp7O.7C0XJ8Eo' WHERE jiaoliangonghao = '教练账号1' AND (password_hash IS NULL OR password_hash = '');

-- 重置所有用户的登录失败状态
UPDATE yonghu SET failed_login_attempts = 0, lock_until = NULL WHERE failed_login_attempts > 0;
UPDATE jianshenjiaolian SET failed_login_attempts = 0, lock_until = NULL WHERE failed_login_attempts > 0;

-- 确保有足够的测试数据
INSERT INTO yonghu (yonghuzhanghao, mima, password_hash, yonghuxingming, touxiang, xingbie, shoujihaoma, status)
VALUES ('testuser', '123456', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lbdxp7O.7C0XJ8Eo', '测试用户', 'upload/test.jpg', '男', '13800138000', 0)
ON CONFLICT (yonghuzhanghao) DO NOTHING;

INSERT INTO jianshenjiaolian (jiaoliangonghao, mima, password_hash, jiaolianxingming, zhaopian, xingbie, lianxidianhua, status)
VALUES ('testcoach', '123456', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lbdxp7O.7C0XJ8Eo', '测试教练', 'upload/coach.jpg', '男', '13800138001', 0)
ON CONFLICT (jiaoliangonghao) DO NOTHING;

-- 确保课程数据存在
INSERT INTO jianshenkecheng (name, category, duration, difficulty, price, coach_name, status)
VALUES ('测试课程', '健身', 45, '中级', 299, '测试教练', 'active')
ON CONFLICT (id) DO NOTHING;

-- 确保会员卡数据存在
INSERT INTO huiyuanka (name, price, duration, benefits, status)
VALUES ('金卡会员', 1999, 365, '["无限次课程","优先预约","专属教练"]', 'active'),
       ('银卡会员', 999, 180, '["20次课程","普通预约"]', 'active')
ON CONFLICT (id) DO NOTHING;

-- 确保新闻数据存在
INSERT INTO news (title, content, addtime)
VALUES ('测试新闻', '这是测试新闻内容', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 确保聊天数据存在
INSERT INTO chat (userid, adminid, ask, reply, isreply)
VALUES (1, 1, '测试问题', '测试回复', 1)
ON CONFLICT (id) DO NOTHING;

-- 创建必要的索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_yonghu_yonghuzhanghao ON yonghu(yonghuzhanghao);
CREATE INDEX IF NOT EXISTS idx_yonghu_password_hash ON yonghu(password_hash);
CREATE INDEX IF NOT EXISTS idx_jianshenjiaolian_jiaoliangonghao ON jianshenjiaolian(jiaoliangonghao);
CREATE INDEX IF NOT EXISTS idx_jianshenjiaolian_password_hash ON jianshenjiaolian(password_hash);
