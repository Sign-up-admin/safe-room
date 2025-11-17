package com.entity.vo;

import com.entity.MessageEntity;

import com.baomidou.mybatisplus.annotation.TableName;
import java.util.Date;
import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.io.Serializable;

/**
 * 站内消息
 * @author
 * @email
 * @date 2025-11-15 11:00:00
 */
public class MessageVO  implements Serializable {
	private static final long serialVersionUID = 1L;

	/**
	 * 用户id
	 */
	private Long userid;

	/**
	 * 消息标题
	 */
	private String title;

	/**
	 * 消息内容
	 */
	private String content;

	/**
	 * 消息类型 (system:系统消息, reminder:提醒消息, promotion:促销消息)
	 */
	private String type;

	/**
	 * 是否已读 (0:未读, 1:已读)
	 */
	private Integer isread;

	/**
	 * 关联对象类型 (daoqitixing, huiyuanxufei等)
	 */
	private String relatedType;

	/**
	 * 关联对象ID
	 */
	private Long relatedId;

	/**
	 * 发送时间
	 */
	@JsonFormat(locale="zh", timezone="GMT+8", pattern="yyyy-MM-dd HH:mm:ss")
	@DateTimeFormat
	private Date addtime;

	public void setUserid(Long userid) {
		this.userid = userid;
	}

	public Long getUserid() {
		return userid;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getTitle() {
		return title;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public String getContent() {
		return content;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getType() {
		return type;
	}

	public void setIsread(Integer isread) {
		this.isread = isread;
	}

	public Integer getIsread() {
		return isread;
	}

	public void setRelatedType(String relatedType) {
		this.relatedType = relatedType;
	}

	public String getRelatedType() {
		return relatedType;
	}

	public void setRelatedId(Long relatedId) {
		this.relatedId = relatedId;
	}

	public Long getRelatedId() {
		return relatedId;
	}

	public void setAddtime(Date addtime) {
		this.addtime = addtime;
	}

	public Date getAddtime() {
		return addtime;
	}
}
