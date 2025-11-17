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
 * Favorite
 * Database universal operation entity class (common add, delete, modify, query)
 * @author 
 * @email 
 * @date 2024-06-20 10:35:10
 */
@TableName("favorite")
public class FavoriteEntity<T> implements Serializable {
	private static final long serialVersionUID = 1L;


	public FavoriteEntity() {
		
	}
	
	public FavoriteEntity(T t) {
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
					
	private Long userId;
	
	/**
	 * product id
	 */
					
	private Long refId;
	
	/**
	 * table name
	 */
					
	private String tableName;
	
	/**
	 * name
	 */
					
	private String name;
	
	/**
	 * image
	 */
					
	private String picture;
	
	/**
	 * type
	 */
					
	private String type;
	
	/**
	 * recommendation type
	 */
					
	private String intelType;
	
	/**
	 * remark
	 */
					
	private String remark;
	
	
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
	public void setUserId(Long userId) {
		this.userId = userId;
	}
	/**
	 * Get: user id
	 */
	public Long getUserId() {
		return userId;
	}
	/**
	 * Set: product id
	 */
	public void setRefId(Long refId) {
		this.refId = refId;
	}
	/**
	 * Get: product id
	 */
	public Long getRefId() {
		return refId;
	}
	/**
	 * Set: table name
	 */
	public void setTableName(String tableName) {
		this.tableName = tableName;
	}
	/**
	 * Get: table name
	 */
	public String getTableName() {
		return tableName;
	}
	/**
	 * Set: name
	 */
	public void setName(String name) {
		this.name = name;
	}
	/**
	 * Get: name
	 */
	public String getName() {
		return name;
	}
	/**
	 * Set: image
	 */
	public void setPicture(String picture) {
		this.picture = picture;
	}
	/**
	 * Get: image
	 */
	public String getPicture() {
		return picture;
	}
	/**
	 * Set: type
	 */
	public void setType(String type) {
		this.type = type;
	}
	/**
	 * Get: type
	 */
	public String getType() {
		return type;
	}
	/**
	 * Set: recommendation type
	 */
	public void setIntelType(String intelType) {
		this.intelType = intelType;
	}
	/**
	 * Get: recommendation type
	 */
	public String getIntelType() {
		return intelType;
	}
	/**
	 * Set: remark
	 */
	public void setRemark(String remark) {
		this.remark = remark;
	}
	/**
	 * Get: remark
	 */
	public String getRemark() {
		return remark;
	}

}

