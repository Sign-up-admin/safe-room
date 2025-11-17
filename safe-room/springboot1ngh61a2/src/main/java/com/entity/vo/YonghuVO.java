package com.entity.vo;

import com.entity.YonghuEntity;

import com.baomidou.mybatisplus.annotation.TableName;
import java.util.Date;
import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.io.Serializable;
 

/**
 * User
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
public class YonghuVO  implements Serializable {
	private static final long serialVersionUID = 1L;

	 			
	/**
	 * Password
	 */
	
	private String mima;
		
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
	 * Expiration date
	 */
		
	@JsonFormat(locale="zh", timezone="GMT+8", pattern="yyyy-MM-dd HH:mm:ss")
	@DateTimeFormat 
	private Date youxiaoqizhi;
		
	/**
	 * Status
	 */
	
	private Integer status;
				
	
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
			
}
