-- H2 Schema for Fitness Gym Management System (Test Compatible)

DROP TABLE IF EXISTS chat CASCADE;
CREATE TABLE chat (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  userid BIGINT NOT NULL,
  adminid BIGINT,
  ask CLOB,
  reply CLOB,
  isreply INTEGER
);

DROP TABLE IF EXISTS config CASCADE;
CREATE TABLE config (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  config_value VARCHAR(100),
  url VARCHAR(500)
);

DROP TABLE IF EXISTS daoqitixing CASCADE;
CREATE TABLE daoqitixing (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  yonghuzhanghao VARCHAR(200),
  yonghuxingming VARCHAR(200),
  touxiang TEXT,
  huiyuankahao VARCHAR(200),
  youxiaoqizhi DATE,
  tixingshijian TIMESTAMP,
  beizhu VARCHAR(200)
);

DROP TABLE IF EXISTS discussjianshenkecheng CASCADE;
CREATE TABLE discussjianshenkecheng (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  refid BIGINT NOT NULL,
  userid BIGINT NOT NULL,
  avatarurl TEXT,
  nickname VARCHAR(200),
  content TEXT NOT NULL,
  reply TEXT,
  sfsh VARCHAR(200) DEFAULT '待审核',
  clicktime TIMESTAMP
);

DROP TABLE IF EXISTS huiyuanka CASCADE;
CREATE TABLE huiyuanka (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  huiyuankamingcheng VARCHAR(200),
  tupian TEXT,
  youxiaoqi VARCHAR(200),
  jiage DECIMAL(10,2),
  shiyongshuoming TEXT,
  huiyuankaxiangqing TEXT,
  clicktime TIMESTAMP,
  clicknum INTEGER DEFAULT 0,
  discussnum INTEGER DEFAULT 0,
  storeupnum INTEGER DEFAULT 0
);

DROP TABLE IF EXISTS huiyuankagoumai CASCADE;
CREATE TABLE huiyuankagoumai (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  huiyuankahao VARCHAR(200),
  huiyuankamingcheng VARCHAR(200),
  tupian TEXT,
  youxiaoqi VARCHAR(200),
  jiage DECIMAL(10,2),
  goumairiqi DATE,
  yonghuzhanghao VARCHAR(200),
  yonghuxingming VARCHAR(200),
  shoujihaoma VARCHAR(200),
  ispay VARCHAR(200),
  crossuserid BIGINT,
  crossrefid BIGINT,
  sfsh VARCHAR(200) DEFAULT '待审核',
  shhf TEXT
);

DROP TABLE IF EXISTS huiyuanxufei CASCADE;
CREATE TABLE huiyuanxufei (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  huiyuankahao VARCHAR(200),
  huiyuankamingcheng VARCHAR(200),
  tupian TEXT,
  youxiaoqi VARCHAR(200),
  jiage DECIMAL(10,2),
  xufeiriqi DATE,
  yonghuzhanghao VARCHAR(200),
  yonghuxingming VARCHAR(200),
  shoujihaoma VARCHAR(200),
  ispay VARCHAR(200),
  crossuserid BIGINT,
  crossrefid BIGINT,
  sfsh VARCHAR(200) DEFAULT '待审核',
  shhf TEXT
);

DROP TABLE IF EXISTS jianshenjiaolian CASCADE;
CREATE TABLE jianshenjiaolian (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  jiaoliangonghao VARCHAR(200) NOT NULL,
  mima VARCHAR(200) NOT NULL,
  password_hash VARCHAR(255),
  failed_login_attempts INTEGER DEFAULT 0,
  lock_until TIMESTAMP,
  jiaolianxingming VARCHAR(200) NOT NULL,
  zhaopian TEXT,
  xingbie VARCHAR(200) NOT NULL,
  nianling VARCHAR(200),
  shengao VARCHAR(200),
  tizhong VARCHAR(200),
  lianxidianhua VARCHAR(200),
  sijiaojiage DOUBLE PRECISION,
  gerenjianjie TEXT,
  clicktime TIMESTAMP,
  clicknum INTEGER DEFAULT 0,
  discussnum INTEGER DEFAULT 0,
  storeupnum INTEGER DEFAULT 0,
  UNIQUE (jiaoliangonghao)
);

DROP TABLE IF EXISTS jianshenkecheng CASCADE;
CREATE TABLE jianshenkecheng (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  kechengmingcheng VARCHAR(200),
  kechengleixing VARCHAR(200),
  tupian TEXT,
  shangkeshijian TIMESTAMP,
  shangkedidian VARCHAR(200),
  kechengjiage DECIMAL(10,2),
  kechengjianjie TEXT,
  kechengshipin TEXT,
  shangkejihua TEXT,
  shangkeshichang INTEGER,
  baomingrenshu INTEGER DEFAULT 0,
  yuyuerenshu INTEGER DEFAULT 0,
  status INTEGER DEFAULT 0,
  jiaoliangonghao VARCHAR(200),
  jiaolianxingming VARCHAR(200),
  clicktime TIMESTAMP,
  clicknum INTEGER DEFAULT 0,
  discussnum INTEGER DEFAULT 0,
  storeupnum INTEGER DEFAULT 0
);

DROP TABLE IF EXISTS jianshenqicai CASCADE;
CREATE TABLE jianshenqicai (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  qicaimingcheng VARCHAR(200),
  tupian TEXT,
  qicaileixing VARCHAR(200),
  qicaijiage DECIMAL(10,2),
  qicaishuoming TEXT,
  kucun INTEGER,
  shuliang INTEGER DEFAULT 0,
  clicktime TIMESTAMP,
  clicknum INTEGER DEFAULT 0,
  discussnum INTEGER DEFAULT 0,
  storeupnum INTEGER DEFAULT 0
);

DROP TABLE IF EXISTS kechengleixing CASCADE;
CREATE TABLE kechengleixing (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  kechengleixing VARCHAR(200),
  clicktime TIMESTAMP,
  clicknum INTEGER DEFAULT 0,
  discussnum INTEGER DEFAULT 0,
  storeupnum INTEGER DEFAULT 0
);

DROP TABLE IF EXISTS kechengtuike CASCADE;
CREATE TABLE kechengtuike (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tuikebianhao VARCHAR(200),
  kechengmingcheng VARCHAR(200),
  tupian TEXT,
  kechengleixing VARCHAR(200),
  shangkeshijian TIMESTAMP,
  shangkedidian VARCHAR(200),
  kechengjiage DECIMAL(10,2),
  tuikeyuanyin TEXT,
  tuikeshijian TIMESTAMP,
  huiyuankahao VARCHAR(200),
  yonghuzhanghao VARCHAR(200),
  yonghuxingming VARCHAR(200),
  shoujihaoma VARCHAR(200),
  crossuserid BIGINT,
  crossrefid BIGINT,
  sfsh VARCHAR(200) DEFAULT '待审核',
  shhf TEXT,
  ispay VARCHAR(200)
);

DROP TABLE IF EXISTS kechengyuyue CASCADE;
CREATE TABLE kechengyuyue (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  yuyuebianhao VARCHAR(200),
  kechengmingcheng VARCHAR(200),
  tupian TEXT,
  kechengleixing VARCHAR(200),
  shangkeshijian TIMESTAMP,
  shangkedidian VARCHAR(200),
  kechengjiage DECIMAL(10,2),
  jiaoliangonghao VARCHAR(200),
  jiaolianxingming VARCHAR(200),
  yuyueshijian TIMESTAMP,
  huiyuankahao VARCHAR(200),
  yonghuzhanghao VARCHAR(200),
  yonghuxingming VARCHAR(200),
  shoujihaoma VARCHAR(200),
  crossuserid BIGINT,
  crossrefid BIGINT,
  sfsh VARCHAR(200) DEFAULT '待审核',
  shhf TEXT,
  ispay VARCHAR(200)
);

DROP TABLE IF EXISTS membership_card CASCADE;
CREATE TABLE membership_card (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_days INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS message CASCADE;
CREATE TABLE message (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  userid BIGINT,
  title VARCHAR(200),
  content TEXT,
  type VARCHAR(50),
  isread INTEGER DEFAULT 0,
  related_type VARCHAR(50),
  related_id BIGINT,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS messages CASCADE;
CREATE TABLE messages (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  userid BIGINT,
  title VARCHAR(200),
  content TEXT,
  type VARCHAR(50),
  isread INTEGER DEFAULT 0,
  related_type VARCHAR(50),
  related_id BIGINT,
  addtime_str VARCHAR(50)
);

DROP TABLE IF EXISTS news CASCADE;
CREATE TABLE news (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  title VARCHAR(200),
  introduction TEXT,
  picture TEXT,
  content TEXT,
  clicktime TIMESTAMP,
  clicknum INTEGER DEFAULT 0,
  discussnum INTEGER DEFAULT 0,
  storeupnum INTEGER DEFAULT 0
);

DROP TABLE IF EXISTS newstype CASCADE;
CREATE TABLE newstype (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  newstype VARCHAR(200),
  clicktime TIMESTAMP,
  clicknum INTEGER DEFAULT 0,
  discussnum INTEGER DEFAULT 0,
  storeupnum INTEGER DEFAULT 0
);

DROP TABLE IF EXISTS operation_log CASCADE;
CREATE TABLE operation_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  userid BIGINT NOT NULL,
  username VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  operation_type VARCHAR(50) NOT NULL,
  content TEXT,
  ip VARCHAR(50),
  user_agent TEXT,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS sijiaoyuyue CASCADE;
CREATE TABLE sijiaoyuyue (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  yuyuebianhao VARCHAR(200),
  jiaoliangonghao VARCHAR(200),
  jiaolianxingming VARCHAR(200),
  zhaopian TEXT,
  xingbie VARCHAR(200),
  nianling VARCHAR(200),
  shengao VARCHAR(200),
  tizhong VARCHAR(200),
  sijiaojiage DECIMAL(10,2),
  yuyueshijian TIMESTAMP,
  yuyueshichang INTEGER,
  zongjiage DECIMAL(10,2),
  huiyuankahao VARCHAR(200),
  yonghuzhanghao VARCHAR(200),
  yonghuxingming VARCHAR(200),
  shoujihaoma VARCHAR(200),
  crossuserid BIGINT,
  crossrefid BIGINT,
  sfsh VARCHAR(200) DEFAULT '待审核',
  shhf TEXT,
  ispay VARCHAR(200)
);

DROP TABLE IF EXISTS storeup CASCADE;
CREATE TABLE storeup (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  userid BIGINT NOT NULL,
  refid BIGINT NOT NULL,
  tablename VARCHAR(200),
  name VARCHAR(200),
  picture TEXT,
  type VARCHAR(200) DEFAULT '1',
  inteltype VARCHAR(200)
);

DROP TABLE IF EXISTS token CASCADE;
CREATE TABLE token (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  userid BIGINT NOT NULL,
  username VARCHAR(100) NOT NULL,
  tablename VARCHAR(100),
  role VARCHAR(100),
  token VARCHAR(200) NOT NULL,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expiratedtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(200),
  password VARCHAR(200),
  password_hash VARCHAR(500),
  failed_login_attempts INTEGER DEFAULT 0,
  lock_until TIMESTAMP,
  role VARCHAR(100),
  status INTEGER DEFAULT 0,
  image TEXT,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS yonghu CASCADE;
CREATE TABLE yonghu (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  yonghuzhanghao VARCHAR(200),
  mima VARCHAR(200),
  password_hash VARCHAR(500),
  failed_login_attempts INTEGER DEFAULT 0,
  lock_until TIMESTAMP,
  yonghuxingming VARCHAR(200),
  touxiang TEXT,
  xingbie VARCHAR(200),
  shengao VARCHAR(200),
  tizhong VARCHAR(200),
  shoujihaoma VARCHAR(200),
  huiyuankahao VARCHAR(200),
  huiyuankamingcheng VARCHAR(200),
  youxiaoqizhi DATE,
  status INTEGER DEFAULT 0
);

DROP TABLE IF EXISTS legal_terms CASCADE;
CREATE TABLE legal_terms (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  type VARCHAR(100),
  title VARCHAR(200),
  version VARCHAR(50),
  content TEXT,
  status INTEGER DEFAULT 0,
  effective_date DATE,
  update_time TIMESTAMP,
  create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);