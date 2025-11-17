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
 * Membership Card Purchase
 * Database universal operation entity class (common add, delete, modify, query)
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
@TableName("huiyuankagoumai")
public class HuiyuankagoumaiEntity<T> implements Serializable {
	private static final long serialVersionUID = 1L;


	public HuiyuankagoumaiEntity() {
		
	}
	
	public HuiyuankagoumaiEntity(T t) {
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
	 * Membership card number
	 */
					
	private String huiyuankahao;
	
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
	 * Purchase date
	 */
				
	@JsonFormat(locale="zh", timezone="GMT+8", pattern="yyyy-MM-dd")
	@DateTimeFormat 		
	private Date goumairiqi;
	
	/**
	 * User account
	 */
					
	private String yonghuzhanghao;
	
	/**
	 * User name
	 */
					
	private String yonghuxingming;
	
	/**
	 * Phone number
	 */
					
	private String shoujihaoma;
	
	/**
	 * Is it paid
	 */
					
	private String ispay;
	
	
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
	 * Set: Membership card number
	 */
	public void setHuiyuankahao(String huiyuankahao) {
		this.huiyuankahao = huiyuankahao;
	}
	/**
	 * Get: Membership card number
	 */
	public String getHuiyuankahao() {
		return huiyuankahao;
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
	 * Set: Purchase date
	 */
	public void setGoumairiqi(Date goumairiqi) {
		this.goumairiqi = goumairiqi;
	}
	/**
	 * Get: Purchase date
	 */
	public Date getGoumairiqi() {
		return goumairiqi;
	}
	/**
	 * Set: User account
	 */
	public void setYonghuzhanghao(String yonghuzhanghao) {
		this.yonghuzhanghao = yonghuzhanghao;
	}
	/**
	 * Get: User account
	 */
	public String getYonghuzhanghao() {
		return yonghuzhanghao;
	}
	/**
	 * Set: User name
	 */
	public void setYonghuxingming(String yonghuxingming) {
		this.yonghuxingming = yonghuxingming;
	}
	/**
	 * Get: User name
	 */
	public String getYonghuxingming() {
		return yonghuxingming;
	}
	/**
	 * Set: Phone number
	 */
	public void setShoujihaoma(String shoujihaoma) {
		this.shoujihaoma = shoujihaoma;
	}
	/**
	 * Get: Phone number
	 */
	public String getShoujihaoma() {
		return shoujihaoma;
	}
	/**
	 * Set: Is it paid
	 */
	public void setIspay(String ispay) {
		this.ispay = ispay;
	}
	/**
	 * Get: Is it paid
	 */
	public String getIspay() {
		return ispay;
	}

}
