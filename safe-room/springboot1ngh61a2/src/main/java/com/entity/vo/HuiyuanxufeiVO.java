package com.entity.vo;

import com.entity.HuiyuanxufeiEntity;

import com.baomidou.mybatisplus.annotation.TableName;
import java.util.Date;
import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.io.Serializable;
 

/**
 * Membership Renewal
 * @author 
 * @email 
 * @date 2024-06-20 10:35:10
 */
public class HuiyuanxufeiVO  implements Serializable {
	private static final long serialVersionUID = 1L;

	 			
	/**
	 * Full name
	 */
	
	private String yonghuxingming;
		
	/**
	 * Avatar
	 */
	
	private String touxiang;
		
	/**
	 * Payment number
	 */
	
	private String jiaofeibianhao;
		
	/**
	 * Membership card name
	 */
	
	private String huiyuankamingcheng;
		
	/**
	 * Validity period
	 */
	
	private String youxiaoqi;
		
	/**
	 * Price
	 */
	
	private Double jiage;
		
	/**
	 * Renewal time
	 */
		
	@JsonFormat(locale="zh", timezone="GMT+8", pattern="yyyy-MM-dd HH:mm:ss")
	@DateTimeFormat 
	private Date xufeishijian;
		
	/**
	 * Is it paid
	 */
	
	private String ispay;
				
	
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
	 * Set: Payment number
	 */
	 
	public void setJiaofeibianhao(String jiaofeibianhao) {
		this.jiaofeibianhao = jiaofeibianhao;
	}
	
	/**
	 * Get: Payment number
	 */
	public String getJiaofeibianhao() {
		return jiaofeibianhao;
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
	 
	public void setJiage(Double jiage) {
		this.jiage = jiage;
	}
	
	/**
	 * Get: Price
	 */
	public Double getJiage() {
		return jiage;
	}
				
	
	/**
	 * Set: Renewal time
	 */
	 
	public void setXufeishijian(Date xufeishijian) {
		this.xufeishijian = xufeishijian;
	}
	
	/**
	 * Get: Renewal time
	 */
	public Date getXufeishijian() {
		return xufeishijian;
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
