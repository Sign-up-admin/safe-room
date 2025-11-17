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
 * User
 * Database universal operation entity class (common add, delete, modify, query)
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
@TableName("yonghu")
public class YonghuEntity<T> implements Serializable {
	private static final long serialVersionUID = 1L;


	public YonghuEntity() {
		
	}
	
	public YonghuEntity(T t) {
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
	 * User account
	 */
					
	private String yonghuzhanghao;
	
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
	 * Full name
	 */
					
	private String yonghuxingming;
	
	/**
	 * Avatar
	 */
					
	private String touxiang;
	
	/**
	 * Gender
	 */
					
	private String xingbie;
	
	/**
	 * Height
	 */
					
	private String shengao;
	
	/**
	 * Weight
	 */
					
	private String tizhong;
	
	/**
	 * Phone number
	 */
					
	private String shoujihaoma;
	
	/**
	 * Membership card number
	 */
					
	private String huiyuankahao;
	
	/**
	 * Membership card name
	 */
	private String huiyuankamingcheng;
	
	/**
	 * Expiration date
	 */
				
	@JsonFormat(locale="zh", timezone="GMT+8", pattern="yyyy-MM-dd")
	@DateTimeFormat 		
	private Date youxiaoqizhi;
	
	/**
	 * Status
	 */
					
	private Integer status;
	
	
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
	 * Set: Full name
	 */
	public void setYonghuxingming(String yonghuxingming) {
		this.yonghuxingming = yonghuxingming;
	}
	/**
	 * Get: Full name
	 */
	public String getYonghuxingming() {
		return yonghuxingming;
	}
	/**
	 * Set: Avatar
	 */
	public void setTouxiang(String touxiang) {
		this.touxiang = touxiang;
	}
	/**
	 * Get: Avatar
	 */
	public String getTouxiang() {
		return touxiang;
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
	 * Set: Expiration date
	 */
	public void setYouxiaoqizhi(Date youxiaoqizhi) {
		this.youxiaoqizhi = youxiaoqizhi;
	}
	/**
	 * Get: Expiration date
	 */
	public Date getYouxiaoqizhi() {
		return youxiaoqizhi;
	}
	/**
	 * Set: Status
	 */
	public void setStatus(Integer status) {
		this.status = status;
	}
	/**
	 * Get: Status
	 */
	public Integer getStatus() {
		return status;
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
