-- PostgreSQL Test Data for Fitness Gym Management System

-- 配置数据
INSERT INTO config (id, name, value, url) VALUES
  (1, 'picture1', 'upload/picture1.jpg', NULL),
  (2, 'picture2', 'upload/picture2.jpg', NULL),
  (3, 'systemName', '健身房综合管理系统', NULL)
ON CONFLICT (id) DO NOTHING;

-- 管理员账户
-- 注意：password_hash 字段将在首次登录时自动生成，这里先使用 NULL
INSERT INTO users (id, username, password, password_hash, failed_login_attempts, lock_until, image, role, status, addtime) VALUES
  (1, 'admin', 'admin', NULL, 0, NULL, 'upload/image1.jpg', '管理员', 0, '2024-06-20 02:35:34'),
  (2, 'manager', '123456', NULL, 0, NULL, 'upload/image2.jpg', '管理员', 0, CURRENT_TIMESTAMP),
  (3, 'operator', '123456', NULL, 0, NULL, 'upload/image3.jpg', '管理员', 0, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 课程类型
INSERT INTO kechengleixing (id, addtime, kechengleixing) VALUES
  (1, CURRENT_TIMESTAMP, '综合课程'),
  (2, CURRENT_TIMESTAMP, '力量训练'),
  (3, CURRENT_TIMESTAMP, '有氧运动'),
  (4, CURRENT_TIMESTAMP, '瑜伽课程'),
  (5, CURRENT_TIMESTAMP, '普拉提'),
  (6, CURRENT_TIMESTAMP, '动感单车'),
  (7, CURRENT_TIMESTAMP, '拳击训练'),
  (8, CURRENT_TIMESTAMP, '游泳课程')
ON CONFLICT (id) DO NOTHING;

-- 健身教练
-- 注意：password_hash 字段将在首次登录时自动生成，这里先使用 NULL
INSERT INTO jianshenjiaolian (id, addtime, jiaoliangonghao, mima, password_hash, failed_login_attempts, lock_until, jiaolianxingming, zhaopian, xingbie, nianling, shengao, tizhong, lianxidianhua, sijiaojiage, gerenjianjie) VALUES
  (1, CURRENT_TIMESTAMP, 'coach001', '123456', NULL, 0, NULL, '张三', 'upload/jiaolian1.jpg', '男', '30', '180cm', '75kg', '13800000001', 199.0, '多年健身经验，擅长力量及有氧训练，国家一级健身教练'),
  (2, CURRENT_TIMESTAMP, 'coach002', '123456', NULL, 0, NULL, '李娜', 'upload/jiaolian2.jpg', '女', '28', '165cm', '55kg', '13800000002', 299.0, '专业瑜伽教练，拥有国际瑜伽认证，擅长哈他瑜伽和流瑜伽'),
  (3, CURRENT_TIMESTAMP, 'coach003', '123456', NULL, 0, NULL, '王强', 'upload/jiaolian3.jpg', '男', '32', '185cm', '85kg', '13800000003', 249.0, '资深拳击教练，前职业拳击手，擅长拳击技巧和体能训练'),
  (4, CURRENT_TIMESTAMP, 'coach004', '123456', NULL, 0, NULL, '赵敏', 'upload/jiaolian4.jpg', '女', '26', '170cm', '58kg', '13800000004', 179.0, '普拉提专业教练，拥有普拉提国际认证，擅长核心力量训练'),
  (5, CURRENT_TIMESTAMP, 'coach005', '123456', NULL, 0, NULL, '刘伟', 'upload/jiaolian5.jpg', '男', '29', '178cm', '72kg', '13800000005', 219.0, '游泳教练，前省队游泳运动员，擅长自由泳和蛙泳教学')
ON CONFLICT (id) DO NOTHING;

-- 用户账户
-- 注意：password_hash 字段将在首次登录时自动生成，这里先使用 NULL
INSERT INTO yonghu (id, addtime, yonghuzhanghao, mima, password_hash, failed_login_attempts, lock_until, yonghuxingming, touxiang, xingbie, shengao, tizhong, shoujihaoma, huiyuankahao, huiyuankamingcheng, youxiaoqizhi, status) VALUES
  (1, CURRENT_TIMESTAMP, 'user01', '123456', NULL, 0, NULL, '李四', 'upload/yonghu1.jpg', '男', '175cm', '70kg', '13900000001', 'HY0001', '年卡', DATE '2025-12-31', 0),
  (2, CURRENT_TIMESTAMP, 'user02', '123456', NULL, 0, NULL, '王芳', 'upload/yonghu2.jpg', '女', '162cm', '55kg', '13900000002', 'HY0002', '年卡', DATE '2025-12-31', 0),
  (3, CURRENT_TIMESTAMP, 'user03', '123456', NULL, 0, NULL, '张伟', 'upload/yonghu3.jpg', '男', '180cm', '78kg', '13900000003', 'HY0003', '季卡', DATE '2025-11-30', 0),
  (4, CURRENT_TIMESTAMP, 'user04', '123456', NULL, 0, NULL, '陈静', 'upload/yonghu4.jpg', '女', '168cm', '60kg', '13900000004', 'HY0004', 'VIP年卡', DATE '2025-12-31', 0),
  (5, CURRENT_TIMESTAMP, 'user05', '123456', NULL, 0, NULL, '刘明', 'upload/yonghu5.jpg', '男', '172cm', '68kg', '13900000005', 'HY0005', '月卡', DATE '2025-10-31', 0),
  (6, CURRENT_TIMESTAMP, 'user06', '123456', NULL, 0, NULL, '杨丽', 'upload/yonghu6.jpg', '女', '165cm', '58kg', '13900000006', NULL, NULL, NULL, 0),
  (7, CURRENT_TIMESTAMP, 'user07', '123456', NULL, 0, NULL, '周杰', 'upload/yonghu7.jpg', '男', '178cm', '75kg', '13900000007', 'HY0007', '年卡', DATE '2025-12-31', 0),
  (8, CURRENT_TIMESTAMP, 'user08', '123456', NULL, 0, NULL, '吴敏', 'upload/yonghu8.jpg', '女', '160cm', '52kg', '13900000008', NULL, NULL, NULL, 0),
  (9, CURRENT_TIMESTAMP, 'user09', '123456', NULL, 0, NULL, '郑强', 'upload/yonghu9.jpg', '男', '182cm', '80kg', '13900000009', 'HY0009', 'VIP年卡', DATE '2025-12-31', 0),
  (10, CURRENT_TIMESTAMP, 'user10', '123456', NULL, 0, NULL, '孙丽', 'upload/yonghu10.jpg', '女', '170cm', '62kg', '13900000010', 'HY0010', '季卡', DATE '2025-12-31', 0)
ON CONFLICT (id) DO NOTHING;

-- 会员卡
INSERT INTO huiyuanka (id, addtime, huiyuankamingcheng, tupian, youxiaoqi, jiage, shiyongshuoming, huiyuankaxiangqing) VALUES
  (1, CURRENT_TIMESTAMP, '月卡', 'upload/huiyuanka1.jpg', '1个月', 299, '有效期30天，可享受所有基础课程', '月卡会员可享受健身房所有基础设施和课程，适合短期体验用户'),
  (2, CURRENT_TIMESTAMP, '季卡', 'upload/huiyuanka2.jpg', '3个月', 799, '有效期90天，可享受所有基础课程和部分高级课程', '季卡会员可享受健身房所有基础设施、基础课程和部分高级课程，性价比高'),
  (3, CURRENT_TIMESTAMP, '年卡', 'upload/huiyuanka3.jpg', '12个月', 2599, '有效期365天，可享受所有课程和私教折扣', '年卡会员可享受健身房所有设施、所有课程，私教课程享受8折优惠'),
  (4, CURRENT_TIMESTAMP, 'VIP年卡', 'upload/huiyuanka4.jpg', '12个月', 3999, '有效期365天，可享受所有课程和私教7折优惠', 'VIP年卡会员可享受健身房所有设施、所有课程，私教课程享受7折优惠，优先预约权'),
  (5, CURRENT_TIMESTAMP, '次卡', 'upload/huiyuanka5.jpg', '10次', 199, '10次有效，不限制使用时间', '次卡适合不经常来健身房的用户，10次有效，使用灵活')
ON CONFLICT (id) DO NOTHING;

-- 会员卡购买记录
INSERT INTO huiyuankagoumai (id, addtime, huiyuankahao, huiyuankamingcheng, tupian, youxiaoqi, jiage, goumairiqi, yonghuzhanghao, yonghuxingming, shoujihaoma, ispay) VALUES
  (1, CURRENT_TIMESTAMP, 'HY0001', '年卡', 'upload/huiyuanka3.jpg', '12个月', 2599, DATE '2024-01-15', 'user01', '李四', '13900000001', '已支付'),
  (2, CURRENT_TIMESTAMP, 'HY0002', '年卡', 'upload/huiyuanka3.jpg', '12个月', 2599, DATE '2024-02-01', 'user02', '王芳', '13900000002', '已支付'),
  (3, CURRENT_TIMESTAMP, 'HY0003', '季卡', 'upload/huiyuanka2.jpg', '3个月', 799, DATE '2024-03-01', 'user03', '张伟', '13900000003', '已支付'),
  (4, CURRENT_TIMESTAMP, 'HY0004', 'VIP年卡', 'upload/huiyuanka4.jpg', '12个月', 3999, DATE '2024-01-20', 'user04', '陈静', '13900000004', '已支付'),
  (5, CURRENT_TIMESTAMP, 'HY0005', '月卡', 'upload/huiyuanka1.jpg', '1个月', 299, DATE '2024-06-01', 'user05', '刘明', '13900000005', '已支付'),
  (6, CURRENT_TIMESTAMP, 'HY0007', '年卡', 'upload/huiyuanka3.jpg', '12个月', 2599, DATE '2024-02-15', 'user07', '周杰', '13900000007', '已支付'),
  (7, CURRENT_TIMESTAMP, 'HY0009', 'VIP年卡', 'upload/huiyuanka4.jpg', '12个月', 3999, DATE '2024-01-10', 'user09', '郑强', '13900000009', '已支付'),
  (8, CURRENT_TIMESTAMP, 'HY0010', '季卡', 'upload/huiyuanka2.jpg', '3个月', 799, DATE '2024-04-01', 'user10', '孙丽', '13900000010', '已支付')
ON CONFLICT (id) DO NOTHING;

-- 健身课程
INSERT INTO jianshenkecheng (id, addtime, kechengmingcheng, kechengleixing, tupian, shangkeshijian, shangkedidian, kechengjiage, kechengjianjie, kechengshipin, jiaoliangonghao, jiaolianxingming, clicktime, clicknum, discussnum, storeupnum) VALUES
  (1, CURRENT_TIMESTAMP, '燃脂训练营', '综合课程', 'upload/kecheng1.jpg', CURRENT_TIMESTAMP + INTERVAL '1 day', '一号健身房', 199.0, '适合初学者的燃脂课程，结合有氧和力量训练', NULL, 'coach001', '张三', CURRENT_TIMESTAMP, 15, 3, 5),
  (2, CURRENT_TIMESTAMP, '瑜伽入门', '瑜伽课程', 'upload/kecheng2.jpg', CURRENT_TIMESTAMP + INTERVAL '2 days', '瑜伽室', 149.0, '适合初学者的瑜伽课程，帮助放松身心', NULL, 'coach002', '李娜', CURRENT_TIMESTAMP, 20, 5, 8),
  (3, CURRENT_TIMESTAMP, '拳击基础', '拳击训练', 'upload/kecheng3.jpg', CURRENT_TIMESTAMP + INTERVAL '3 days', '拳击室', 249.0, '学习基本拳击技巧，提升反应速度和协调性', NULL, 'coach003', '王强', CURRENT_TIMESTAMP, 12, 2, 4),
  (4, CURRENT_TIMESTAMP, '普拉提核心', '普拉提', 'upload/kecheng4.jpg', CURRENT_TIMESTAMP + INTERVAL '1 day', '普拉提室', 179.0, '专注于核心力量训练，改善体态', NULL, 'coach004', '赵敏', CURRENT_TIMESTAMP, 18, 4, 6),
  (5, CURRENT_TIMESTAMP, '游泳基础', '游泳课程', 'upload/kecheng5.jpg', CURRENT_TIMESTAMP + INTERVAL '4 days', '游泳池', 219.0, '学习自由泳和蛙泳基础动作', NULL, 'coach005', '刘伟', CURRENT_TIMESTAMP, 10, 1, 3),
  (6, CURRENT_TIMESTAMP, '力量训练', '力量训练', 'upload/kecheng6.jpg', CURRENT_TIMESTAMP + INTERVAL '2 days', '力量训练区', 199.0, '系统性的力量训练，提升肌肉力量', NULL, 'coach001', '张三', CURRENT_TIMESTAMP, 14, 3, 5),
  (7, CURRENT_TIMESTAMP, '动感单车', '动感单车', 'upload/kecheng7.jpg', CURRENT_TIMESTAMP + INTERVAL '1 day', '单车室', 129.0, '高强度的有氧运动，快速燃脂', NULL, 'coach001', '张三', CURRENT_TIMESTAMP, 16, 4, 7),
  (8, CURRENT_TIMESTAMP, '流瑜伽', '瑜伽课程', 'upload/kecheng8.jpg', CURRENT_TIMESTAMP + INTERVAL '3 days', '瑜伽室', 179.0, '动态的瑜伽练习，提升柔韧性和力量', NULL, 'coach002', '李娜', CURRENT_TIMESTAMP, 22, 6, 9)
ON CONFLICT (id) DO NOTHING;

-- 课程预约
INSERT INTO kechengyuyue (id, addtime, yuyuebianhao, kechengmingcheng, tupian, kechengleixing, shangkeshijian, shangkedidian, kechengjiage, jiaoliangonghao, jiaolianxingming, yuyueshijian, huiyuankahao, yonghuzhanghao, yonghuxingming, shoujihaoma, crossuserid, crossrefid, sfsh, shhf, ispay) VALUES
  (1, CURRENT_TIMESTAMP, 'YY202401001', '燃脂训练营', 'upload/kecheng1.jpg', '综合课程', '2024-07-01 10:00:00', '一号健身房', 199.0, 'coach001', '张三', CURRENT_TIMESTAMP, 'HY0001', 'user01', '李四', '13900000001', 1, 1, '已通过', '审核通过', '已支付'),
  (2, CURRENT_TIMESTAMP, 'YY202401002', '瑜伽入门', 'upload/kecheng2.jpg', '瑜伽课程', '2024-07-02 14:00:00', '瑜伽室', 149.0, 'coach002', '李娜', CURRENT_TIMESTAMP, 'HY0002', 'user02', '王芳', '13900000002', 2, 2, '已通过', '审核通过', '已支付'),
  (3, CURRENT_TIMESTAMP, 'YY202401003', '拳击基础', 'upload/kecheng3.jpg', '拳击训练', '2024-07-03 16:00:00', '拳击室', 249.0, 'coach003', '王强', CURRENT_TIMESTAMP, 'HY0003', 'user03', '张伟', '13900000003', 3, 3, '已通过', '审核通过', '已支付'),
  (4, CURRENT_TIMESTAMP, 'YY202401004', '普拉提核心', 'upload/kecheng4.jpg', '普拉提', '2024-07-01 18:00:00', '普拉提室', 179.0, 'coach004', '赵敏', CURRENT_TIMESTAMP, 'HY0004', 'user04', '陈静', '13900000004', 4, 4, '已通过', '审核通过', '已支付'),
  (5, CURRENT_TIMESTAMP, 'YY202401005', '力量训练', 'upload/kecheng6.jpg', '力量训练', '2024-07-02 10:00:00', '力量训练区', 199.0, 'coach001', '张三', CURRENT_TIMESTAMP, 'HY0005', 'user05', '刘明', '13900000005', 5, 6, '待审核', NULL, '未支付'),
  (6, CURRENT_TIMESTAMP, 'YY202401006', '流瑜伽', 'upload/kecheng8.jpg', '瑜伽课程', '2024-07-03 14:00:00', '瑜伽室', 179.0, 'coach002', '李娜', CURRENT_TIMESTAMP, 'HY0007', 'user07', '周杰', '13900000007', 7, 8, '已通过', '审核通过', '已支付'),
  (7, CURRENT_TIMESTAMP, 'YY202401007', '动感单车', 'upload/kecheng7.jpg', '动感单车', '2024-07-01 19:00:00', '单车室', 129.0, 'coach001', '张三', CURRENT_TIMESTAMP, 'HY0009', 'user09', '郑强', '13900000009', 9, 7, '已通过', '审核通过', '已支付'),
  (8, CURRENT_TIMESTAMP, 'YY202401008', '游泳基础', 'upload/kecheng5.jpg', '游泳课程', '2024-07-04 15:00:00', '游泳池', 219.0, 'coach005', '刘伟', CURRENT_TIMESTAMP, 'HY0010', 'user10', '孙丽', '13900000010', 10, 5, '待审核', NULL, '未支付')
ON CONFLICT (id) DO NOTHING;

-- 私教预约
INSERT INTO sijiaoyuyue (id, addtime, yuyuebianhao, jiaoliangonghao, jiaolianxingming, zhaopian, sijiaojiage, yuyueshijian, yonghuzhanghao, yonghuxingming, shoujihaoma, huiyuankahao, beizhu, sfsh, shhf, ispay) VALUES
  (1, CURRENT_TIMESTAMP, 'SJ202401001', 'coach001', '张三', 'upload/jiaolian1.jpg', 199.0, CURRENT_TIMESTAMP + INTERVAL '1 day', 'user01', '李四', '13900000001', 'HY0001', '希望重点训练胸肌和腹肌', '已通过', '审核通过，请准时到达', '已支付'),
  (2, CURRENT_TIMESTAMP, 'SJ202401002', 'coach002', '李娜', 'upload/jiaolian2.jpg', 299.0, CURRENT_TIMESTAMP + INTERVAL '2 days', 'user02', '王芳', '13900000002', 'HY0002', '第一次体验瑜伽私教', '已通过', '审核通过', '已支付'),
  (3, CURRENT_TIMESTAMP, 'SJ202401003', 'coach003', '王强', 'upload/jiaolian3.jpg', 249.0, CURRENT_TIMESTAMP + INTERVAL '3 days', 'user03', '张伟', '13900000003', 'HY0003', '学习拳击基础动作', '已通过', '审核通过', '已支付'),
  (4, CURRENT_TIMESTAMP, 'SJ202401004', 'coach004', '赵敏', 'upload/jiaolian4.jpg', 179.0, CURRENT_TIMESTAMP + INTERVAL '1 day', 'user04', '陈静', '13900000004', 'HY0004', '改善体态，加强核心', '已通过', '审核通过', '已支付'),
  (5, CURRENT_TIMESTAMP, 'SJ202401005', 'coach005', '刘伟', 'upload/jiaolian5.jpg', 219.0, CURRENT_TIMESTAMP + INTERVAL '4 days', 'user10', '孙丽', '13900000010', 'HY0010', '学习自由泳', '待审核', NULL, '未支付'),
  (6, CURRENT_TIMESTAMP, 'SJ202401006', 'coach001', '张三', 'upload/jiaolian1.jpg', 199.0, CURRENT_TIMESTAMP + INTERVAL '2 days', 'user07', '周杰', '13900000007', 'HY0007', '增肌训练', '已通过', '审核通过', '已支付'),
  (7, CURRENT_TIMESTAMP, 'SJ202401007', 'coach002', '李娜', 'upload/jiaolian2.jpg', 299.0, CURRENT_TIMESTAMP + INTERVAL '3 days', 'user09', '郑强', '13900000009', 'HY0009', '提升柔韧性', '已通过', '审核通过', '已支付')
ON CONFLICT (id) DO NOTHING;

-- 公告信息分类
INSERT INTO newstype (id, addtime, typename) VALUES
  (1, CURRENT_TIMESTAMP, '公告'),
  (2, CURRENT_TIMESTAMP, '活动'),
  (3, CURRENT_TIMESTAMP, '优惠'),
  (4, CURRENT_TIMESTAMP, '课程'),
  (5, CURRENT_TIMESTAMP, '通知')
ON CONFLICT (id) DO NOTHING;

-- 公告信息
INSERT INTO news (id, addtime, title, introduction, typename, name, headportrait, clicknum, clicktime, thumbsupnum, crazilynum, storeupnum, picture, content) VALUES
  (1, CURRENT_TIMESTAMP, '健身房开业优惠', '限时办理会员享折扣', '公告', '管理员', NULL, 25, CURRENT_TIMESTAMP, 10, 0, 5, 'upload/news1.jpg', '欢迎体验全新的健身课程，更多优惠详询前台。开业期间办理年卡享受8折优惠，季卡享受9折优惠。'),
  (2, CURRENT_TIMESTAMP, '夏季燃脂挑战赛', '参与挑战赢取丰厚奖品', '活动', '管理员', NULL, 18, CURRENT_TIMESTAMP, 8, 0, 3, 'upload/news2.jpg', '夏季燃脂挑战赛正式开始！30天内完成指定训练目标，即可获得精美礼品和会员卡续费优惠。'),
  (3, CURRENT_TIMESTAMP, '新课程上线', '普拉提和拳击课程正式开课', '课程', '管理员', NULL, 15, CURRENT_TIMESTAMP, 6, 0, 4, 'upload/news3.jpg', '我们很高兴地宣布，普拉提和拳击课程正式上线！专业教练指导，小班教学，欢迎预约体验。'),
  (4, CURRENT_TIMESTAMP, '会员续费优惠', '续费年卡享受额外优惠', '优惠', '管理员', NULL, 12, CURRENT_TIMESTAMP, 5, 0, 2, 'upload/news4.jpg', '即日起，会员续费年卡可享受额外9折优惠，并赠送2节私教课程。优惠名额有限，先到先得。'),
  (5, CURRENT_TIMESTAMP, '设备维护通知', '部分设备将于本周进行维护', '通知', '管理员', NULL, 8, CURRENT_TIMESTAMP, 2, 0, 1, 'upload/news5.jpg', '为了提供更好的服务，部分健身设备将于本周三至周五进行维护，期间可能影响使用，敬请谅解。')
ON CONFLICT (id) DO NOTHING;

-- 会员续费记录
INSERT INTO huiyuanxufei (id, addtime, yonghuzhanghao, yonghuxingming, touxiang, jiaofeibianhao, huiyuankamingcheng, youxiaoqi, jiage, xufeishijian, ispay) VALUES
  (1, CURRENT_TIMESTAMP, 'user01', '李四', 'upload/yonghu1.jpg', 'XF202401001', '年卡', '12个月', 2599, CURRENT_TIMESTAMP, '已支付'),
  (2, CURRENT_TIMESTAMP, 'user02', '王芳', 'upload/yonghu2.jpg', 'XF202401002', '年卡', '12个月', 2599, CURRENT_TIMESTAMP, '已支付'),
  (3, CURRENT_TIMESTAMP, 'user03', '张伟', 'upload/yonghu3.jpg', 'XF202401003', '季卡', '3个月', 799, CURRENT_TIMESTAMP, '已支付')
ON CONFLICT (id) DO NOTHING;

-- 到期提醒
INSERT INTO daoqitixing (id, addtime, yonghuzhanghao, yonghuxingming, touxiang, huiyuankahao, youxiaoqizhi, tixingshijian, beizhu) VALUES
  (1, CURRENT_TIMESTAMP, 'user05', '刘明', 'upload/yonghu5.jpg', 'HY0005', DATE '2024-10-31', CURRENT_TIMESTAMP + INTERVAL '7 days', '会员卡即将到期，请及时续费'),
  (2, CURRENT_TIMESTAMP, 'user03', '张伟', 'upload/yonghu3.jpg', 'HY0003', DATE '2024-11-30', CURRENT_TIMESTAMP + INTERVAL '15 days', '会员卡即将到期，请及时续费')
ON CONFLICT (id) DO NOTHING;

