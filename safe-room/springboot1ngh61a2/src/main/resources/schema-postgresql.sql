-- PostgreSQL Schema for Fitness Gym Management System (H2 Compatible)

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
  id BIGSERIAL PRIMARY KEY,
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
  id BIGSERIAL PRIMARY KEY,
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
  id BIGSERIAL PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  huiyuankamingcheng VARCHAR(200) NOT NULL,
  tupian TEXT,
  youxiaoqi VARCHAR(200) NOT NULL,
  jiage INT,
  shiyongshuoming TEXT,
  huiyuankaxiangqing TEXT
);

DROP TABLE IF EXISTS huiyuankagoumai CASCADE;
CREATE TABLE huiyuankagoumai (
  id BIGSERIAL PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  huiyuankahao VARCHAR(200),
  huiyuankamingcheng VARCHAR(200),
  tupian TEXT,
  youxiaoqi VARCHAR(200),
  jiage INT,
  goumairiqi DATE,
  yonghuzhanghao VARCHAR(200),
  yonghuxingming VARCHAR(200),
  shoujihaoma VARCHAR(200),
  ispay VARCHAR(200) DEFAULT '未支付',
  UNIQUE (huiyuankahao)
);

DROP TABLE IF EXISTS huiyuanxufei CASCADE;
CREATE TABLE huiyuanxufei (
  id BIGSERIAL PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  yonghuzhanghao VARCHAR(200),
  yonghuxingming VARCHAR(200),
  touxiang TEXT,
  jiaofeibianhao VARCHAR(200),
  huiyuankamingcheng VARCHAR(200) NOT NULL,
  youxiaoqi VARCHAR(200),
  jiage DOUBLE PRECISION,
  xufeishijian TIMESTAMP,
  ispay VARCHAR(200) DEFAULT '未支付',
  UNIQUE (jiaofeibianhao)
);

DROP TABLE IF EXISTS jianshenjiaolian CASCADE;
CREATE TABLE jianshenjiaolian (
  id BIGSERIAL PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  jiaoliangonghao VARCHAR(200) NOT NULL,
  mima VARCHAR(200) NOT NULL,
  password_hash VARCHAR(255),
  failed_login_attempts INT DEFAULT 0,
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
  UNIQUE (jiaoliangonghao)
);

DROP TABLE IF EXISTS jianshenkecheng CASCADE;
CREATE TABLE jianshenkecheng (
  id BIGSERIAL PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  kechengmingcheng VARCHAR(200) NOT NULL,
  kechengleixing VARCHAR(200) NOT NULL,
  tupian TEXT,
  shangkeshijian TIMESTAMP NOT NULL,
  shangkedidian VARCHAR(200) NOT NULL,
  kechengjiage DOUBLE PRECISION,
  kechengjianjie TEXT,
  kechengshipin TEXT,
  jiaoliangonghao VARCHAR(200) NOT NULL,
  jiaolianxingming VARCHAR(200),
  clicktime TIMESTAMP,
  clicknum INT DEFAULT 0,
  discussnum INT DEFAULT 0,
  storeupnum INT DEFAULT 0
);

DROP TABLE IF EXISTS jianshenqicai CASCADE;
CREATE TABLE jianshenqicai (
  id BIGSERIAL PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  qicaimingcheng VARCHAR(200) NOT NULL,
  tupian TEXT,
  pinpai VARCHAR(200),
  shiyongfangfa TEXT,
  shoushenxiaoguo TEXT,
  qicaijieshao TEXT,
  jiaoxueshipin TEXT
);

DROP TABLE IF EXISTS kechengleixing CASCADE;
CREATE TABLE kechengleixing (
  id BIGSERIAL PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  kechengleixing VARCHAR(200)
);

DROP TABLE IF EXISTS kechengtuike CASCADE;
CREATE TABLE kechengtuike (
  id BIGSERIAL PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  yuyuebianhao VARCHAR(200),
  kechengmingcheng VARCHAR(200),
  tupian TEXT,
  kechengleixing VARCHAR(200),
  shangkeshijian VARCHAR(200),
  shangkedidian VARCHAR(200),
  kechengjiage DOUBLE PRECISION,
  jiaoliangonghao VARCHAR(200),
  jiaolianxingming VARCHAR(200),
  shenqingshijian TIMESTAMP,
  huiyuankahao VARCHAR(200) NOT NULL,
  yonghuzhanghao VARCHAR(200),
  yonghuxingming VARCHAR(200),
  shoujihaoma VARCHAR(200),
  tuikeyuanyin VARCHAR(200) NOT NULL,
  crossuserid BIGINT,
  crossrefid BIGINT,
  sfsh VARCHAR(200) DEFAULT '待审核',
  shhf TEXT,
  ispay VARCHAR(200) DEFAULT '未支付'
);

DROP TABLE IF EXISTS kechengyuyue CASCADE;
CREATE TABLE kechengyuyue (
  id BIGSERIAL PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  yuyuebianhao VARCHAR(200),
  kechengmingcheng VARCHAR(200),
  tupian TEXT,
  kechengleixing VARCHAR(200),
  shangkeshijian VARCHAR(200),
  shangkedidian VARCHAR(200),
  kechengjiage DOUBLE PRECISION,
  jiaoliangonghao VARCHAR(200),
  jiaolianxingming VARCHAR(200),
  yuyueshijian TIMESTAMP,
  huiyuankahao VARCHAR(200) NOT NULL,
  yonghuzhanghao VARCHAR(200),
  yonghuxingming VARCHAR(200),
  shoujihaoma VARCHAR(200),
  crossuserid BIGINT,
  crossrefid BIGINT,
  sfsh VARCHAR(200) DEFAULT '待审核',
  shhf TEXT,
  ispay VARCHAR(200) DEFAULT '未支付',
  UNIQUE (yuyuebianhao)
);

DROP TABLE IF EXISTS news CASCADE;
CREATE TABLE news (
  id BIGSERIAL PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  title VARCHAR(200) NOT NULL,
  introduction TEXT,
  typename VARCHAR(200),
  name VARCHAR(200),
  headportrait TEXT,
  clicknum INT DEFAULT 0,
  clicktime TIMESTAMP,
  thumbsupnum INT DEFAULT 0,
  crazilynum INT DEFAULT 0,
  storeupnum INT DEFAULT 0,
  picture TEXT NOT NULL,
  content TEXT NOT NULL
);

DROP TABLE IF EXISTS newstype CASCADE;
CREATE TABLE newstype (
  id BIGSERIAL PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  typename VARCHAR(200) NOT NULL
);

DROP TABLE IF EXISTS sijiaoyuyue CASCADE;
CREATE TABLE sijiaoyuyue (
  id BIGSERIAL PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  yuyuebianhao VARCHAR(200),
  jiaoliangonghao VARCHAR(200),
  jiaolianxingming VARCHAR(200),
  zhaopian TEXT,
  sijiaojiage DOUBLE PRECISION,
  yuyueshijian TIMESTAMP NOT NULL,
  yonghuzhanghao VARCHAR(200),
  yonghuxingming VARCHAR(200),
  shoujihaoma VARCHAR(200),
  huiyuankahao VARCHAR(200) NOT NULL,
  beizhu VARCHAR(200),
  sfsh VARCHAR(200) DEFAULT '待审核',
  shhf TEXT,
  ispay VARCHAR(200) DEFAULT '未支付',
  UNIQUE (yuyuebianhao)
);

DROP TABLE IF EXISTS storeup CASCADE;
CREATE TABLE storeup (
  id BIGSERIAL PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  userid BIGINT NOT NULL,
  refid BIGINT,
  tablename VARCHAR(200),
  name VARCHAR(200) NOT NULL,
  picture TEXT,
  type VARCHAR(200) DEFAULT '1',
  inteltype VARCHAR(200),
  remark VARCHAR(200)
);

DROP TABLE IF EXISTS token CASCADE;
CREATE TABLE token (
  id BIGSERIAL PRIMARY KEY,
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
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  password VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255),
  failed_login_attempts INT DEFAULT 0,
  lock_until TIMESTAMP,
  image VARCHAR(200),
  role VARCHAR(100) DEFAULT '管理员',
  status INT DEFAULT 0,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS yonghu CASCADE;
CREATE TABLE yonghu (
  id BIGSERIAL PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  yonghuzhanghao VARCHAR(200) NOT NULL,
  mima VARCHAR(200) NOT NULL,
  password_hash VARCHAR(255),
  failed_login_attempts INT DEFAULT 0,
  lock_until TIMESTAMP,
  yonghuxingming VARCHAR(200) NOT NULL,
  touxiang TEXT,
  xingbie VARCHAR(200),
  shengao VARCHAR(200),
  tizhong VARCHAR(200),
  shoujihaoma VARCHAR(200),
  huiyuankahao VARCHAR(200),
  huiyuankamingcheng VARCHAR(200),
  youxiaoqizhi DATE,
  status INT DEFAULT 0,
  UNIQUE (yonghuzhanghao)
);

DROP TABLE IF EXISTS assets CASCADE;
CREATE TABLE assets (
  id BIGSERIAL PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatetime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  asset_name VARCHAR(200) NOT NULL,
  asset_type VARCHAR(50) NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  file_format VARCHAR(50),
  module VARCHAR(100),
  usage VARCHAR(100),
  dimensions VARCHAR(50),
  width INT,
  height INT,
  version VARCHAR(50),
  description TEXT,
  tags TEXT,
  category VARCHAR(50) DEFAULT 'static',
  status VARCHAR(50) DEFAULT 'active',
  upload_user VARCHAR(100)
);

CREATE INDEX idx_assets_type ON assets(asset_type);
CREATE INDEX idx_assets_module ON assets(module);
CREATE INDEX idx_assets_usage ON assets(usage);
