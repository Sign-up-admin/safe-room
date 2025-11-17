-- PostgreSQL Schema for Fitness Gym Management System (Test Environment)

-- Drop tables if they exist
DROP TABLE IF EXISTS chat CASCADE;
DROP TABLE IF EXISTS config CASCADE;
DROP TABLE IF EXISTS daoqitixing CASCADE;
DROP TABLE IF EXISTS discussjianshenkecheng CASCADE;
DROP TABLE IF EXISTS huiyuanka CASCADE;
DROP TABLE IF EXISTS huiyuankagoumai CASCADE;
DROP TABLE IF EXISTS huiyuanxufei CASCADE;
DROP TABLE IF EXISTS jianshenjiaolian CASCADE;
DROP TABLE IF EXISTS jianshenkecheng CASCADE;
DROP TABLE IF EXISTS jianshenqicai CASCADE;
DROP TABLE IF EXISTS kechengleixing CASCADE;
DROP TABLE IF EXISTS kechengtuike CASCADE;
DROP TABLE IF EXISTS kechengyuyue CASCADE;
DROP TABLE IF EXISTS legal_terms CASCADE;
DROP TABLE IF EXISTS membership_card CASCADE;
DROP TABLE IF EXISTS message CASCADE;
DROP TABLE IF EXISTS news CASCADE;
DROP TABLE IF EXISTS newstype CASCADE;
DROP TABLE IF EXISTS operation_log CASCADE;
DROP TABLE IF EXISTS sijiaoyuyue CASCADE;
DROP TABLE IF EXISTS storeup CASCADE;
DROP TABLE IF EXISTS token CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS yonghu CASCADE;

-- Create tables with PostgreSQL syntax

CREATE TABLE chat (
  id BIGSERIAL PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  userid BIGINT NOT NULL,
  adminid BIGINT,
  ask TEXT,
  reply TEXT,
  isreply INTEGER
);

CREATE TABLE config (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  config_value VARCHAR(100),
  url VARCHAR(500)
);

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

CREATE TABLE huiyuanka (
  id BIGSERIAL PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  huiyuankamingcheng VARCHAR(200),
  jiage DECIMAL(10,2),
  youxiaoqizhi VARCHAR(200)
);

CREATE TABLE huiyuankagoumai (
  id BIGSERIAL PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  huiyuankamingcheng VARCHAR(200),
  jiage DECIMAL(10,2),
  goumairiqi DATE,
  yonghuzhanghao VARCHAR(200),
  yonghuxingming VARCHAR(200),
  touxiang TEXT,
  sfsh VARCHAR(200) DEFAULT '待审核',
  shhf TEXT
);

CREATE TABLE huiyuanxufei (
  id BIGSERIAL PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  huiyuankamingcheng VARCHAR(200),
  jiage DECIMAL(10,2),
  xufeiriqi DATE,
  yonghuzhanghao VARCHAR(200),
  yonghuxingming VARCHAR(200),
  touxiang TEXT,
  sfsh VARCHAR(200) DEFAULT '待审核',
  shhf TEXT
);

CREATE TABLE jianshenjiaolian (
  id BIGSERIAL PRIMARY KEY,
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

CREATE TABLE jianshenkecheng (
  id BIGSERIAL PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  kechengmingcheng VARCHAR(200),
  kechengleixing VARCHAR(200),
  jiaoliangonghao VARCHAR(200),
  jiaolianxingming VARCHAR(200),
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
  clicktime TIMESTAMP,
  clicknum INTEGER DEFAULT 0,
  discussnum INTEGER DEFAULT 0,
  storeupnum INTEGER DEFAULT 0
);

CREATE TABLE jianshenqicai (
  id BIGSERIAL PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  qicaimingcheng VARCHAR(200),
  qicaileixing VARCHAR(200),
  tupian TEXT,
  shuliang INTEGER,
  qicaijieshao TEXT,
  clicktime TIMESTAMP,
  clicknum INTEGER DEFAULT 0,
  discussnum INTEGER DEFAULT 0,
  storeupnum INTEGER DEFAULT 0
);

CREATE TABLE kechengleixing (
  id BIGSERIAL PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  kechengleixing VARCHAR(200),
  clicktime TIMESTAMP,
  clicknum INTEGER DEFAULT 0,
  discussnum INTEGER DEFAULT 0,
  storeupnum INTEGER DEFAULT 0
);

CREATE TABLE kechengtuike (
  id BIGSERIAL PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  kechengmingcheng VARCHAR(200),
  kechengleixing VARCHAR(200),
  jiaoliangonghao VARCHAR(200),
  jiaolianxingming VARCHAR(200),
  yonghuzhanghao VARCHAR(200),
  yonghuxingming VARCHAR(200),
  tuikeshijian TIMESTAMP,
  tuikeyuanyin TEXT,
  sfsh VARCHAR(200) DEFAULT '待审核',
  shhf TEXT
);

CREATE TABLE kechengyuyue (
  id BIGSERIAL PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  kechengmingcheng VARCHAR(200),
  kechengleixing VARCHAR(200),
  jiaoliangonghao VARCHAR(200),
  jiaolianxingming VARCHAR(200),
  yonghuzhanghao VARCHAR(200),
  yonghuxingming VARCHAR(200),
  yuyueshijian TIMESTAMP,
  lianxidianhua VARCHAR(200),
  sfsh VARCHAR(200) DEFAULT '待审核',
  shhf TEXT
);

CREATE TABLE legal_terms (
  id BIGSERIAL PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  title VARCHAR(200),
  content TEXT,
  status INTEGER DEFAULT 0
);

CREATE TABLE membership_card (
  id BIGSERIAL PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  name VARCHAR(200),
  price DECIMAL(10,2),
  validity_period VARCHAR(200),
  description TEXT
);

CREATE TABLE message (
  id BIGSERIAL PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  userid BIGINT NOT NULL,
  username VARCHAR(200),
  avatarurl TEXT,
  content TEXT NOT NULL,
  images TEXT,
  createtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatetime TIMESTAMP,
  status INTEGER DEFAULT 0
);

CREATE TABLE news (
  id BIGSERIAL PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  title VARCHAR(200),
  introduction VARCHAR(200),
  picture TEXT,
  content TEXT,
  clicktime TIMESTAMP,
  clicknum INTEGER DEFAULT 0
);

CREATE TABLE newstype (
  id BIGSERIAL PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  newstype VARCHAR(200),
  clicktime TIMESTAMP,
  clicknum INTEGER DEFAULT 0,
  discussnum INTEGER DEFAULT 0,
  storeupnum INTEGER DEFAULT 0
);

CREATE TABLE operation_log (
  id BIGSERIAL PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  userid BIGINT,
  username VARCHAR(200),
  operation VARCHAR(200),
  ip VARCHAR(100),
  status INTEGER DEFAULT 0
);

CREATE TABLE sijiaoyuyue (
  id BIGSERIAL PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  jiaoliangonghao VARCHAR(200),
  jiaolianxingming VARCHAR(200),
  yonghuzhanghao VARCHAR(200),
  yonghuxingming VARCHAR(200),
  yuyueshijian TIMESTAMP,
  lianxidianhua VARCHAR(200),
  beizhu TEXT,
  sfsh VARCHAR(200) DEFAULT '待审核',
  shhf TEXT
);

CREATE TABLE storeup (
  id BIGSERIAL PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  userid BIGINT NOT NULL,
  refid BIGINT NOT NULL,
  tablename VARCHAR(200),
  name VARCHAR(200),
  picture TEXT,
  type VARCHAR(200) DEFAULT '1',
  inteltype VARCHAR(200)
);

CREATE TABLE token (
  id BIGSERIAL PRIMARY KEY,
  userid BIGINT,
  username VARCHAR(200),
  tablename VARCHAR(200),
  role VARCHAR(200),
  token VARCHAR(200),
  expiratedtime TIMESTAMP,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(200),
  password VARCHAR(200),
  password_hash VARCHAR(200),
  failed_login_attempts INTEGER DEFAULT 0,
  lock_until TIMESTAMP,
  role VARCHAR(200),
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  image TEXT,
  status INTEGER DEFAULT 0
);

CREATE TABLE yonghu (
  id BIGSERIAL PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  yonghuzhanghao VARCHAR(200),
  yonghuxingming VARCHAR(200),
  mima VARCHAR(200),
  password_hash VARCHAR(200),
  failed_login_attempts INTEGER DEFAULT 0,
  lock_until TIMESTAMP,
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