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
 * Collection
 * Database universal operation entity class (common add, delete, modify, query)
 * @author 
 * @email 
 * @date 2024-06-20 10:35:10
 */
@TableName("storeup")
public class StoreupEntity<T> implements Serializable {
	private static final long serialVersionUID = 1L;


	public StoreupEntity() {
		
	}
	
	public StoreupEntity(T t) {
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
	 * product id
	 */
					
	private Long refid;
	
	/**
	 * table name
	 */
					
	private String tablename;
	
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
					
	private String inteltype;
	
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
	 * Set: product id
	 */
	public void setRefid(Long refid) {
		this.refid = refid;
	}
	/**
	 * Get: product id
	 */
	public Long getRefid() {
		return refid;
	}
	/**
	 * Set: table name
	 */
	public void setTablename(String tablename) {
		this.tablename = tablename;
	}
	/**
	 * Get: table name
	 */
	public String getTablename() {
		return tablename;
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
	public void setInteltype(String inteltype) {
		this.inteltype = inteltype;
	}
	/**
	 * Get: recommendation type
	 */
	public String getInteltype() {
		return inteltype;
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
