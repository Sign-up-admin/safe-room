package com.entity.vo;

import com.entity.ChatEntity;

import com.baomidou.mybatisplus.annotation.TableName;
import java.util.Date;
import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.io.Serializable;
 

/**
 * Message Feedback
 * @author 
 * @email 
 * @date 2024-06-20 10:35:10
 */
public class ChatVO  implements Serializable {
	private static final long serialVersionUID = 1L;

	 			
	/**
	 * Admin ID
	 */
	
	private Long adminid;
		
	/**
	 * Question
	 */
	
	private String ask;
		
	/**
	 * Reply
	 */
	
	private String reply;
		
	/**
	 * Is replied
	 */
	
	private Integer isreply;
				
	
	/**
	 * Set: Admin ID
	 */
	 
	public void setAdminid(Long adminid) {
		this.adminid = adminid;
	}
	
	/**
	 * Get: Admin ID
	 */
	public Long getAdminid() {
		return adminid;
	}
				
	
	/**
	 * Set: Question
	 */
	 
	public void setAsk(String ask) {
		this.ask = ask;
	}
	
	/**
	 * Get: Question
	 */
	public String getAsk() {
		return ask;
	}
				
	
	/**
	 * Set: Reply
	 */
	 
	public void setReply(String reply) {
		this.reply = reply;
	}
	
	/**
	 * Get: Reply
	 */
	public String getReply() {
		return reply;
	}
				
	
	/**
	 * Set: Is replied
	 */
	 
	public void setIsreply(Integer isreply) {
		this.isreply = isreply;
	}
	
	/**
	 * Get: Is replied
	 */
	public Integer getIsreply() {
		return isreply;
	}
			
}
