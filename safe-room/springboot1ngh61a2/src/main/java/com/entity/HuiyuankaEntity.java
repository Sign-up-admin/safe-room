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
 * Membership Card
 * Database universal operation entity class (common add, delete, modify, query)
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
@TableName("huiyuanka")
public class HuiyuankaEntity<T> implements Serializable {
	private static final long serialVersionUID = 1L;


	public HuiyuankaEntity() {
		
	}
	
	public HuiyuankaEntity(T t) {
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
	 * Membership card name
	 */
					
	private String huiyuankamingcheng;
	
	/**
	 * Image
	 */
					
	private String tupian;
	
	/**
	 * Validity period
	 */
					
	private String youxiaoqi;
	
	/**
	 * Price
	 */
					
	private Integer jiage;
	
	/**
	 * Instructions for use
	 */
					
	private String shiyongshuoming;
	
	/**
	 * Membership card details
	 */
					
	private String huiyuankaxiangqing;
	
	
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
	 * Set: Membership card name
	 */
	public void setHuiyuankamingcheng(String huiyuankamingcheng) {
		this.huiyuankamingcheng = huiyuankamingcheng;
	}
	/**
	 * Get: Membership card name
	 */
	public String getHuiyuankamingcheng() {
		return huiyuankamingcheng;
	}
	/**
	 * Set: Image
	 */
	public void setTupian(String tupian) {
		this.tupian = tupian;
	}
	/**
	 * Get: Image
	 */
	public String getTupian() {
		return tupian;
	}
	/**
	 * Set: Validity period
	 */
	public void setYouxiaoqi(String youxiaoqi) {
		this.youxiaoqi = youxiaoqi;
	}
	/**
	 * Get: Validity period
	 */
	public String getYouxiaoqi() {
		return youxiaoqi;
	}
	/**
	 * Set: Price
	 */
	public void setJiage(Integer jiage) {
		this.jiage = jiage;
	}
	/**
	 * Get: Price
	 */
	public Integer getJiage() {
		return jiage;
	}
	/**
	 * Set: Instructions for use
	 */
	public void setShiyongshuoming(String shiyongshuoming) {
		this.shiyongshuoming = shiyongshuoming;
	}
	/**
	 * Get: Instructions for use
	 */
	public String getShiyongshuoming() {
		return shiyongshuoming;
	}
	/**
	 * Set: Membership card details
	 */
	public void setHuiyuankaxiangqing(String huiyuankaxiangqing) {
		this.huiyuankaxiangqing = huiyuankaxiangqing;
	}
	/**
	 * Get: Membership card details
	 */
	public String getHuiyuankaxiangqing() {
		return huiyuankaxiangqing;
	}

}
