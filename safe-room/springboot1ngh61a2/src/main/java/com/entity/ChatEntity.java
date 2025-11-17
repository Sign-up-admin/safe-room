package com.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.lang.reflect.InvocationTargetException;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import com.fasterxml.jackson.annotation.JsonFormat;
import org.apache.commons.beanutils.BeanUtils;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;


/**
 * Message Feedback
 * Database universal operation entity class (common add, delete, modify, query)
 * @author 
 * @email 
 * @date 2024-06-20 10:35:10
 */
@TableName("chat")
public class ChatEntity<T> implements Serializable {
	private static final long serialVersionUID = 1L;


	public ChatEntity() {
		
	}
	
	public ChatEntity(T t) {
		try {
			BeanUtils.copyProperties(this, t);
		} catch (IllegalAccessException | InvocationTargetException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}
	
	/**
	 * Primary key id
	 */
    @TableId(type = IdType.AUTO)
    private Long id;
	/**
	 * user id
	 */
					
	private Long userid;
	
	/**
	 * admin id
	 */
					
	private Long adminid;
	
	/**
	 * question
	 */
					
	private String ask;
	
	/**
	 * reply
	 */
					
	private String reply;
	
	/**
	 * is it replied
	 */
					
	private Integer isreply;
	
	
	@JsonFormat(locale="zh", timezone="GMT+8", pattern="yyyy-MM-dd HH:mm:ss")
	@DateTimeFormat
	private Date addtime;

	public Date getAddtime() {
		return addtime;
	}
	public void setAddtime(Date addtime) {
		this.addtime = addtime;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}
	/**
	 * Set: user id
	 */
	public void setUserid(Long userid) {
		this.userid = userid;
	}
	/**
	 * Get: user id
	 */
	public Long getUserid() {
		return userid;
	}
	/**
	 * Set: admin id
	 */
	public void setAdminid(Long adminid) {
		this.adminid = adminid;
	}
	/**
	 * Get: admin id
	 */
	public Long getAdminid() {
		return adminid;
	}
	/**
	 * Set: question
	 */
	public void setAsk(String ask) {
		this.ask = ask;
	}
	/**
	 * Get: question
	 */
	public String getAsk() {
		return ask;
	}
	/**
	 * Set: reply
	 */
	public void setReply(String reply) {
		this.reply = reply;
	}
	/**
	 * Get: reply
	 */
	public String getReply() {
		return reply;
	}
	/**
	 * Set: is it replied
	 */
	public void setIsreply(Integer isreply) {
		this.isreply = isreply;
	}
	/**
	 * Get: is it replied
	 */
	public Integer getIsreply() {
		return isreply;
	}

}
