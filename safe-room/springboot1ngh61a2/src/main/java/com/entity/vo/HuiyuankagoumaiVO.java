package com.entity.vo;

import com.entity.HuiyuankagoumaiEntity;

import com.baomidou.mybatisplus.annotation.TableName;
import java.util.Date;
import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.io.Serializable;
 

/**
 * Membership Card Purchase
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
public class HuiyuankagoumaiVO  implements Serializable {
	private static final long serialVersionUID = 1L;

	 			
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
		
	@JsonFormat(locale="zh", timezone="GMT+8", pattern="yyyy-MM-dd HH:mm:ss")
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
