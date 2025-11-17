package com.entity.model;

import com.entity.ChatEntity;

import com.baomidou.mybatisplus.annotation.TableName;
import java.util.Date;
import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.io.Serializable;
 

/**
 * 留言反馈
 * 接收传参的实体类  
 *（实际开发中配合移动端接口开发手动去掉些没用的字段， 后端一般用entity就够用了）
 * 取自ModelAndView 的model名称
 * @author 
 * @email 
 * @date 2024-06-20 10:35:10
 */
public class ChatModel  implements Serializable {
	private static final long serialVersionUID = 1L;

	 			
	/**
	 * 管理员id
	 */
	
	private Long adminid;
		
	/**
	 * 提回复问回复问
	 */
	
	private String ask;
		
	/**
	 * 复
	 */
	
	private String reply;
		
	/**
	 * 是否复
	 */
	
	private Integer isreply;
				
	
	/**
	 * 设置：管理员id
	 */
	 
	public void setAdminid(Long adminid) {
		this.adminid = adminid;
	}
	
	/**
	 * 获取：管理员id
	 */
	public Long getAdminid() {
		return adminid;
	}
				
	
	/**
	 * 设置：提回复问回复问
	 */
	 
	public void setAsk(String ask) {
		this.ask = ask;
	}
	
	/**
	 * 获取：提回复问回复问
	 */
	public String getAsk() {
		return ask;
	}
				
	
	/**
	 * 设置：复
	 */
	 
	public void setReply(String reply) {
		this.reply = reply;
	}
	
	/**
	 * 获取：复
	 */
	public String getReply() {
		return reply;
	}
				
	
	/**
	 * 设置：是否复
	 */
	 
	public void setIsreply(Integer isreply) {
		this.isreply = isreply;
	}
	
	/**
	 * 获取：是否复
	 */
	public Integer getIsreply() {
		return isreply;
	}
			
}
