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
 * Fitness Course Review
 * Database universal operation entity class (common add, delete, modify, query)
 * @author 
 * @email 
 * @date 2024-06-20 10:35:10
 */
@TableName("fitness_course_discussion")
public class FitnessCourseDiscussionEntity<T> implements Serializable {
	private static final long serialVersionUID = 1L;


	public FitnessCourseDiscussionEntity() {
		
	}
	
	public FitnessCourseDiscussionEntity(T t) {
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
	 * Related table id
	 */
					
	private Long refId;
	
	/**
	 * User id
	 */
					
	private Long userId;
	
	/**
	 * Avatar
	 */
					
	private String avatarUrl;
	
	/**
	 * Username
	 */
					
	private String nickname;
	
	/**
	 * Comment content
	 */
					
	private String content;
	
	/**
	 * Reply content
	 */
					
	private String reply;
	
	
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
	 * Set: Related table id
	 */
	public void setRefId(Long refId) {
		this.refId = refId;
	}
	/**
	 * Get: Related table id
	 */
	public Long getRefId() {
		return refId;
	}
	/**
	 * Set: User id
	 */
	public void setUserId(Long userId) {
		this.userId = userId;
	}
	/**
	 * Get: User id
	 */
	public Long getUserId() {
		return userId;
	}
	/**
	 * Set: Avatar
	 */
	public void setAvatarUrl(String avatarUrl) {
		this.avatarUrl = avatarUrl;
	}
	/**
	 * Get: Avatar
	 */
	public String getAvatarUrl() {
		return avatarUrl;
	}
	/**
	 * Set: Username
	 */
	public void setNickname(String nickname) {
		this.nickname = nickname;
	}
	/**
	 * Get: Username
	 */
	public String getNickname() {
		return nickname;
	}
	/**
	 * Set: Comment content
	 */
	public void setContent(String content) {
		this.content = content;
	}
	/**
	 * Get: Comment content
	 */
	public String getContent() {
		return content;
	}
	/**
	 * Set: Reply content
	 */
	public void setReply(String reply) {
		this.reply = reply;
	}
	/**
	 * Get: Reply content
	 */
	public String getReply() {
		return reply;
	}

}
