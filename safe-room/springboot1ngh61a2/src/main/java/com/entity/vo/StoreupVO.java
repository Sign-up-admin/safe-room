package com.entity.vo;

import com.entity.StoreupEntity;

import com.baomidou.mybatisplus.annotation.TableName;
import java.util.Date;
import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.io.Serializable;
 

/**
 * Collection
 * @author 
 * @email 
 * @date 2024-06-20 10:35:10
 */
public class StoreupVO  implements Serializable {
	private static final long serialVersionUID = 1L;

	 			
	/**
	 * Product ID
	 */
	
	private Long refid;
		
	/**
	 * Table name
	 */
	
	private String tablename;
		
	/**
	 * Name
	 */
	
	private String name;
		
	/**
	 * Image
	 */
	
	private String picture;
		
	/**
	 * Type
	 */
	
	private String type;
		
	/**
	 * Recommendation type
	 */
	
	private String inteltype;
		
	/**
	 * Remarks
	 */
	
	private String remark;
				
	
	/**
	 * Set: Product ID
	 */
	 
	public void setRefid(Long refid) {
		this.refid = refid;
	}
	
	/**
	 * Get: Product ID
	 */
	public Long getRefid() {
		return refid;
	}
				
	
	/**
	 * Set: Table name
	 */
	 
	public void setTablename(String tablename) {
		this.tablename = tablename;
	}
	
	/**
	 * Get: Table name
	 */
	public String getTablename() {
		return tablename;
	}
				
	
	/**
	 * Set: Name
	 */
	 
	public void setName(String name) {
		this.name = name;
	}
	
	/**
	 * Get: Name
	 */
	public String getName() {
		return name;
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
	 * Set: Type
	 */
	 
	public void setType(String type) {
		this.type = type;
	}
	
	/**
	 * Get: Type
	 */
	public String getType() {
		return type;
	}
				
	
	/**
	 * Set: Recommendation type
	 */
	 
	public void setInteltype(String inteltype) {
		this.inteltype = inteltype;
	}
	
	/**
	 * Get: Recommendation type
	 */
	public String getInteltype() {
		return inteltype;
	}
				
	
	/**
	 * Set: Remarks
	 */
	 
	public void setRemark(String remark) {
		this.remark = remark;
	}
	
	/**
	 * Get: Remarks
	 */
	public String getRemark() {
		return remark;
	}
			
}
