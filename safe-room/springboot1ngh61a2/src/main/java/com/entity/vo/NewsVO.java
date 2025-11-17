package com.entity.vo;

import com.entity.NewsEntity;

import com.baomidou.mybatisplus.annotation.TableName;
import java.util.Date;
import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.io.Serializable;
 

/**
 * Announcement
 * @author 
 * @email 
 * @date 2024-06-20 10:35:10
 */
public class NewsVO  implements Serializable {
	private static final long serialVersionUID = 1L;

	 			
	/**
	 * Introduction
	 */
	
	private String introduction;
		
	/**
	 * Category Name
	 */
	
	private String typename;
		
	/**
	 * Publisher
	 */
	
	private String name;
		
	/**
	 * Avatar
	 */
	
	private String headportrait;
		
	/**
	 * Clicks
	 */
	
	private Integer clicknum;
		
	/**
	 * Last click time
	 */
		
	@JsonFormat(locale="zh", timezone="GMT+8", pattern="yyyy-MM-dd HH:mm:ss")
	@DateTimeFormat 
	private Date clicktime;
		
	/**
	 * Likes
	 */
	
	private Integer thumbsupnum;
		
	/**
	 * Dislikes
	 */
	
	private Integer crazilynum;
		
	/**
	 * Favorites
	 */
	
	private Integer storeupnum;
		
	/**
	 * Image
	 */
	
	private String picture;
		
	/**
	 * Content
	 */
	
	private String content;
				
	
	/**
	 * Set: Introduction
	 */
	 
	public void setIntroduction(String introduction) {
		this.introduction = introduction;
	}
	
	/**
	 * Get: Introduction
	 */
	public String getIntroduction() {
		return introduction;
	}
				
	
	/**
	 * Set: Category Name
	 */
	 
	public void setTypename(String typename) {
		this.typename = typename;
	}
	
	/**
	 * Get: Category Name
	 */
	public String getTypename() {
		return typename;
	}
				
	
	/**
	 * Set: Publisher
	 */
	 
	public void setName(String name) {
		this.name = name;
	}
	
	/**
	 * Get: Publisher
	 */
	public String getName() {
		return name;
	}
				
	
	/**
	 * Set: Avatar
	 */
	 
	public void setHeadportrait(String headportrait) {
		this.headportrait = headportrait;
	}
	
	/**
	 * Get: Avatar
	 */
	public String getHeadportrait() {
		return headportrait;
	}
				
	
	/**
	 * Set: Clicks
	 */
	 
	public void setClicknum(Integer clicknum) {
		this.clicknum = clicknum;
	}
	
	/**
	 * Get: Clicks
	 */
	public Integer getClicknum() {
		return clicknum;
	}
				
	
	/**
	 * Set: Last click time
	 */
	 
	public void setClicktime(Date clicktime) {
		this.clicktime = clicktime;
	}
	
	/**
	 * Get: Last click time
	 */
	public Date getClicktime() {
		return clicktime;
	}
				
	
	/**
	 * Set: Likes
	 */
	 
	public void setThumbsupnum(Integer thumbsupnum) {
		this.thumbsupnum = thumbsupnum;
	}
	
	/**
	 * Get: Likes
	 */
	public Integer getThumbsupnum() {
		return thumbsupnum;
	}
				
	
	/**
	 * Set: Dislikes
	 */
	 
	public void setCrazilynum(Integer crazilynum) {
		this.crazilynum = crazilynum;
	}
	
	/**
	 * Get: Dislikes
	 */
	public Integer getCrazilynum() {
		return crazilynum;
	}
				
	
	/**
	 * Set: Favorites
	 */
	 
	public void setStoreupnum(Integer storeupnum) {
		this.storeupnum = storeupnum;
	}
	
	/**
	 * Get: Favorites
	 */
	public Integer getStoreupnum() {
		return storeupnum;
	}
				
	
	/**
	 * Set: Image
	 */
	 
	public void setPicture(String picture) {
		this.picture = picture;
	}
	
	/**
	 * Get: Image
	 */
	public String getPicture() {
		return picture;
	}
				
	
	/**
	 * Set: Content
	 */
	 
	public void setContent(String content) {
		this.content = content;
	}
	
	/**
	 * Get: Content
	 */
	public String getContent() {
		return content;
	}
			
}
