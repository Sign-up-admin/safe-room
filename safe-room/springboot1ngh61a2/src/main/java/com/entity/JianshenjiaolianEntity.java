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
 * Fitness Coach
 * Database universal operation entity class (common add, delete, modify, query)
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
@TableName("jianshenjiaolian")
public class JianshenjiaolianEntity<T> implements Serializable {
	private static final long serialVersionUID = 1L;


	public JianshenjiaolianEntity() {
		
	}
	
	public JianshenjiaolianEntity(T t) {
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
    @TableId
    private Long id;
	/**
	 * Coach ID
	 */
					
	private String jiaoliangonghao;
	
	/**
	 * Password (legacy, kept for backward compatibility)
	 */
					
	private String mima;
	
	/**
	 * Password hash (BCrypt)
	 */
	private String passwordHash;
	
	/**
	 * Failed login attempts
	 */
	private Integer failedLoginAttempts;
	
	/**
	 * Account lock until (timestamp)
	 */
	private Date lockUntil;
	
	/**
	 * Coach name
	 */
					
	private String jiaolianxingming;
	
	/**
	 * Photo
	 */
					
	private String zhaopian;
	
	/**
	 * Gender
	 */
					
	private String xingbie;
	
	/**
	 * Age
	 */
					
	private String nianling;
	
	/**
	 * Height
	 */
					
	private String shengao;
	
	/**
	 * Weight
	 */
					
	private String tizhong;
	
	/**
	 * Contact phone
	 */
					
	private String lianxidianhua;
	
	/**
	 * Private coaching price/hour
	 */
					
	private Double sijiaojiage;
	
	/**
	 * Personal introduction
	 */
					
	private String gerenjianjie;
	
	
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
	 * Set: Coach ID
	 */
	public void setJiaoliangonghao(String jiaoliangonghao) {
		this.jiaoliangonghao = jiaoliangonghao;
	}
	/**
	 * Get: Coach ID
	 */
	public String getJiaoliangonghao() {
		return jiaoliangonghao;
	}
	/**
	 * Set: Password
	 */
	public void setMima(String mima) {
		this.mima = mima;
	}
	/**
	 * Get: Password
	 */
	public String getMima() {
		return mima;
	}
	/**
	 * Set: Coach name
	 */
	public void setJiaolianxingming(String jiaolianxingming) {
		this.jiaolianxingming = jiaolianxingming;
	}
	/**
	 * Get: Coach name
	 */
	public String getJiaolianxingming() {
		return jiaolianxingming;
	}
	/**
	 * Set: Photo
	 */
	public void setZhaopian(String zhaopian) {
		this.zhaopian = zhaopian;
	}
	/**
	 * Get: Photo
	 */
	public String getZhaopian() {
		return zhaopian;
	}
	/**
	 * Set: Gender
	 */
	public void setXingbie(String xingbie) {
		this.xingbie = xingbie;
	}
	/**
	 * Get: Gender
	 */
	public String getXingbie() {
		return xingbie;
	}
	/**
	 * Set: Age
	 */
	public void setNianling(String nianling) {
		this.nianling = nianling;
	}
	/**
	 * Get: Age
	 */
	public String getNianling() {
		return nianling;
	}
	/**
	 * Set: Height
	 */
	public void setShengao(String shengao) {
		this.shengao = shengao;
	}
	/**
	 * Get: Height
	 */
	public String getShengao() {
		return shengao;
	}
	/**
	 * Set: Weight
	 */
	public void setTizhong(String tizhong) {
		this.tizhong = tizhong;
	}
	/**
	 * Get: Weight
	 */
	public String getTizhong() {
		return tizhong;
	}
	/**
	 * Set: Contact phone
	 */
	public void setLianxidianhua(String lianxidianhua) {
		this.lianxidianhua = lianxidianhua;
	}
	/**
	 * Get: Contact phone
	 */
	public String getLianxidianhua() {
		return lianxidianhua;
	}
	/**
	 * Set: Private coaching price/hour
	 */
	public void setSijiaojiage(Double sijiaojiage) {
		this.sijiaojiage = sijiaojiage;
	}
	/**
	 * Get: Private coaching price/hour
	 */
	public Double getSijiaojiage() {
		return sijiaojiage;
	}
	/**
	 * Set: Personal introduction
	 */
	public void setGerenjianjie(String gerenjianjie) {
		this.gerenjianjie = gerenjianjie;
	}
	/**
	 * Get: Personal introduction
	 */
	public String getGerenjianjie() {
		return gerenjianjie;
	}

	public String getPasswordHash() {
		return passwordHash;
	}

	public void setPasswordHash(String passwordHash) {
		this.passwordHash = passwordHash;
	}

	public Integer getFailedLoginAttempts() {
		return failedLoginAttempts;
	}

	public void setFailedLoginAttempts(Integer failedLoginAttempts) {
		this.failedLoginAttempts = failedLoginAttempts;
	}

	public Date getLockUntil() {
		return lockUntil;
	}

	public void setLockUntil(Date lockUntil) {
		this.lockUntil = lockUntil;
	}

}
