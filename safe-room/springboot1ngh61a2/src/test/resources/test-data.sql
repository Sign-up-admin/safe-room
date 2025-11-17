-- PostgreSQL Test Data for Fitness Gym Management System

-- 配置数据
INSERT INTO config (id, name, config_value, url) VALUES
  (1, 'picture1', 'upload/picture1.jpg', NULL),
  (2, 'picture2', 'upload/picture2.jpg', NULL),
  (3, 'systemName', '健身房综合管理系统', NULL);

-- 管理员账户
INSERT INTO users (id, username, password, password_hash, failed_login_attempts, lock_until, image, role, status, addtime) VALUES
  (1, 'admin', 'admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lbdxp7O.7C0XJ8Eo', 0, NULL, 'upload/image1.jpg', '管理员', 0, CURRENT_TIMESTAMP),
  (2, 'manager', '123456', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lbdxp7O.7C0XJ8Eo', 0, NULL, 'upload/image2.jpg', '管理员', 0, CURRENT_TIMESTAMP),
  (3, 'operator', '123456', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lbdxp7O.7C0XJ8Eo', 0, NULL, 'upload/image3.jpg', '管理员', 0, CURRENT_TIMESTAMP);

-- 用户账户
INSERT INTO yonghu (id, addtime, yonghuzhanghao, mima, password_hash, failed_login_attempts, lock_until, yonghuxingming, touxiang, xingbie, shengao, tizhong, shoujihaoma, huiyuankahao, huiyuankamingcheng, youxiaoqizhi, status) VALUES
  (1, CURRENT_TIMESTAMP, 'user01', '123456', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lbdxp7O.7C0XJ8Eo', 0, NULL, '李四', 'upload/yonghu1.jpg', '男', '175cm', '70kg', '13900000001', 'HY0001', '年卡', DATE '2025-12-31', 0),
  (2, CURRENT_TIMESTAMP, 'user02', '123456', NULL, 0, NULL, '王芳', 'upload/yonghu2.jpg', '女', '162cm', '55kg', '13900000002', 'HY0002', '年卡', DATE '2025-12-31', 0),
  (3, CURRENT_TIMESTAMP, 'user03', '123456', NULL, 0, NULL, '张伟', 'upload/yonghu3.jpg', '男', '180cm', '78kg', '13900000003', 'HY0003', '季卡', DATE '2025-11-30', 0),
  (4, CURRENT_TIMESTAMP, 'user04', '123456', NULL, 0, NULL, '陈静', 'upload/yonghu4.jpg', '女', '168cm', '60kg', '13900000004', 'HY0004', 'VIP年卡', DATE '2025-12-31', 0),
  (5, CURRENT_TIMESTAMP, 'user05', '123456', NULL, 0, NULL, '刘明', 'upload/yonghu5.jpg', '男', '172cm', '68kg', '13900000005', NULL, NULL, NULL, 0),
  (6, CURRENT_TIMESTAMP, 'user06', '123456', NULL, 0, NULL, '杨丽', 'upload/yonghu6.jpg', '女', '165cm', '58kg', '13900000006', NULL, NULL, NULL, 0),
  (7, CURRENT_TIMESTAMP, 'user07', '123456', NULL, 0, NULL, '周杰', 'upload/yonghu7.jpg', '男', '178cm', '75kg', '13900000007', 'HY0007', '年卡', DATE '2025-12-31', 0),
  (8, CURRENT_TIMESTAMP, 'user08', '123456', NULL, 0, NULL, '吴敏', 'upload/yonghu8.jpg', '女', '160cm', '52kg', '13900000008', NULL, NULL, NULL, 0),
  (9, CURRENT_TIMESTAMP, 'user09', '123456', NULL, 0, NULL, '郑强', 'upload/yonghu9.jpg', '男', '182cm', '80kg', '13900000009', 'HY0009', 'VIP年卡', DATE '2025-12-31', 0),
  (10, CURRENT_TIMESTAMP, 'user10', '123456', NULL, 0, NULL, '孙丽', 'upload/yonghu10.jpg', '女', '170cm', '62kg', '13900000010', 'HY0010', '季卡', DATE '2025-12-31', 0);

-- 课程类型
INSERT INTO kechengleixing (id, addtime, kechengleixing, clicktime, clicknum, discussnum, storeupnum) VALUES
  (1, CURRENT_TIMESTAMP, '综合课程', NULL, 0, 0, 0),
  (2, CURRENT_TIMESTAMP, '力量训练', NULL, 0, 0, 0),
  (3, CURRENT_TIMESTAMP, '有氧运动', NULL, 0, 0, 0),
  (4, CURRENT_TIMESTAMP, '瑜伽课程', NULL, 0, 0, 0),
  (5, CURRENT_TIMESTAMP, '普拉提', NULL, 0, 0, 0),
  (6, CURRENT_TIMESTAMP, '动感单车', NULL, 0, 0, 0),
  (7, CURRENT_TIMESTAMP, '拳击训练', NULL, 0, 0, 0),
  (8, CURRENT_TIMESTAMP, '游泳课程', NULL, 0, 0, 0);

-- 健身教练
INSERT INTO jianshenjiaolian (id, addtime, jiaoliangonghao, mima, password_hash, failed_login_attempts, lock_until, jiaolianxingming, zhaopian, xingbie, nianling, shengao, tizhong, lianxidianhua, sijiaojiage, gerenjianjie, clicktime, clicknum, discussnum, storeupnum) VALUES
  (1, CURRENT_TIMESTAMP, 'coach001', '123456', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lbdxp7O.7C0XJ8Eo', 0, NULL, '张三', 'upload/jiaolian1.jpg', '男', '30', '180cm', '75kg', '13800000001', 199.0, '多年健身经验，擅长力量及有氧训练，国家一级健身教练', NULL, 0, 0, 0),
  (2, CURRENT_TIMESTAMP, 'coach002', '123456', NULL, 0, NULL, '李娜', 'upload/jiaolian2.jpg', '女', '28', '165cm', '55kg', '13800000002', 299.0, '专业瑜伽教练，拥有国际瑜伽认证，擅长哈他瑜伽和流瑜伽', NULL, 0, 0, 0),
  (3, CURRENT_TIMESTAMP, 'coach003', '123456', NULL, 0, NULL, '王强', 'upload/jiaolian3.jpg', '男', '32', '185cm', '85kg', '13800000003', 249.0, '资深拳击教练，前职业拳击手，擅长拳击技巧和体能训练', NULL, 0, 0, 0),
  (4, CURRENT_TIMESTAMP, 'coach004', '123456', NULL, 0, NULL, '赵敏', 'upload/jiaolian4.jpg', '女', '26', '170cm', '58kg', '13800000004', 179.0, '普拉提专业教练，拥有普拉提国际认证，擅长核心力量训练', NULL, 0, 0, 0),
  (5, CURRENT_TIMESTAMP, 'coach005', '123456', NULL, 0, NULL, '刘伟', 'upload/jiaolian5.jpg', '男', '29', '178cm', '72kg', '13800000005', 219.0, '游泳教练，前省队游泳运动员，擅长自由泳和蛙泳教学', NULL, 0, 0, 0);

-- 健身课程
INSERT INTO jianshenkecheng (id, addtime, kechengmingcheng, kechengleixing, tupian, shangkeshijian, shangkedidian, kechengjiage, kechengjianjie, kechengshipin, shangkejihua, shangkeshichang, baomingrenshu, yuyuerenshu, status, jiaoliangonghao, jiaolianxingming, clicktime, clicknum, discussnum, storeupnum) VALUES
  (1, CURRENT_TIMESTAMP, '燃脂训练营', '综合课程', 'upload/kecheng1.jpg', DATEADD(DAY, 1, CURRENT_TIMESTAMP), '一号健身房', 199.0, '适合初学者的燃脂课程，结合有氧和力量训练', NULL, '热身+力量训练+有氧燃脂', 60, 0, 0, 0, 'coach001', '张三', CURRENT_TIMESTAMP, 15, 3, 5),
  (2, CURRENT_TIMESTAMP, '瑜伽入门', '瑜伽课程', 'upload/kecheng2.jpg', DATEADD(DAY, 2, CURRENT_TIMESTAMP), '瑜伽室', 149.0, '适合初学者的瑜伽课程，帮助放松身心', NULL, '基础呼吸+简单体式', 60, 0, 0, 0, 'coach002', '李娜', CURRENT_TIMESTAMP, 20, 5, 8),
  (3, CURRENT_TIMESTAMP, '拳击基础', '拳击训练', 'upload/kecheng3.jpg', DATEADD(DAY, 3, CURRENT_TIMESTAMP), '拳击室', 249.0, '学习基本拳击技巧，提升反应速度和协调性', NULL, '热身+基本拳法+沙袋练习', 90, 0, 0, 0, 'coach003', '王强', CURRENT_TIMESTAMP, 12, 2, 4),
  (4, CURRENT_TIMESTAMP, '普拉提核心', '普拉提', 'upload/kecheng4.jpg', DATEADD(DAY, 1, CURRENT_TIMESTAMP), '普拉提室', 179.0, '专注于核心力量训练，改善体态', NULL, '核心激活+基础体式', 45, 0, 0, 0, 'coach004', '赵敏', CURRENT_TIMESTAMP, 18, 4, 6),
  (5, CURRENT_TIMESTAMP, '游泳基础', '游泳课程', 'upload/kecheng5.jpg', DATEADD(DAY, 4, CURRENT_TIMESTAMP), '游泳池', 219.0, '学习自由泳和蛙泳基础动作', NULL, '水上热身+泳姿教学', 60, 0, 0, 0, 'coach005', '刘伟', CURRENT_TIMESTAMP, 10, 1, 3),
  (6, CURRENT_TIMESTAMP, '力量训练', '力量训练', 'upload/kecheng6.jpg', DATEADD(DAY, 2, CURRENT_TIMESTAMP), '力量训练区', 199.0, '系统性的力量训练，提升肌肉力量', NULL, '热身+杠铃练习+器械训练', 90, 0, 0, 0, 'coach001', '张三', CURRENT_TIMESTAMP, 14, 3, 5),
  (7, CURRENT_TIMESTAMP, '动感单车', '动感单车', 'upload/kecheng7.jpg', DATEADD(DAY, 1, CURRENT_TIMESTAMP), '单车室', 129.0, '高强度的有氧运动，快速燃脂', NULL, '热身+间歇训练+冲刺', 45, 0, 0, 0, 'coach001', '张三', CURRENT_TIMESTAMP, 16, 4, 7),
  (8, CURRENT_TIMESTAMP, '流瑜伽', '瑜伽课程', 'upload/kecheng8.jpg', DATEADD(DAY, 3, CURRENT_TIMESTAMP), '瑜伽室', 179.0, '动态的瑜伽练习，提升柔韧性和力量', NULL, '流畅体式连接+冥想', 75, 0, 0, 0, 'coach002', '李娜', CURRENT_TIMESTAMP, 22, 6, 9);
