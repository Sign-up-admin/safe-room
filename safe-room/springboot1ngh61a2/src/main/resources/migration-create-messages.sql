-- 创建站内消息表 (PostgreSQL版本)
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  addtime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  userid BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'system',
  isread INTEGER NOT NULL DEFAULT 0,
  related_type VARCHAR(100),
  related_id BIGINT
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_messages_userid ON messages(userid);
CREATE INDEX IF NOT EXISTS idx_messages_isread ON messages(isread);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(type);
CREATE INDEX IF NOT EXISTS idx_messages_related ON messages(related_type, related_id);

-- 添加注释
COMMENT ON TABLE messages IS '站内消息表';
COMMENT ON COLUMN messages.id IS '主键';
COMMENT ON COLUMN messages.addtime IS '创建时间';
COMMENT ON COLUMN messages.userid IS '用户id';
COMMENT ON COLUMN messages.title IS '消息标题';
COMMENT ON COLUMN messages.content IS '消息内容';
COMMENT ON COLUMN messages.type IS '消息类型 (system:系统消息, reminder:提醒消息, promotion:促销消息)';
COMMENT ON COLUMN messages.isread IS '是否已读 (0:未读, 1:已读)';
COMMENT ON COLUMN messages.related_type IS '关联对象类型 (daoqitixing, huiyuanxufei等)';
COMMENT ON COLUMN messages.related_id IS '关联对象ID';
