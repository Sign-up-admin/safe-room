package com.entity.vo;

import com.entity.DaoqitixingEntity;

import com.baomidou.mybatisplus.annotation.TableName;
import java.util.Date;
import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.io.Serializable;
 

/**
 * Expiration Reminder
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
public class DaoqitixingVO  implements Serializable {
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
	 * Reminder time
	 */
		
	@JsonFormat(locale="zh", timezone="GMT+8", pattern="yyyy-MM-dd HH:mm:ss")
	@DateTimeFormat 
	private Date tixingshijian;
		
	/**
	 * Remarks
	 */
	
	private String beizhu;
				
	
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
	 * Set: Reminder time
	 */
	 
	public void setTixingshijian(Date tixingshijian) {
		this.tixingshijian = tixingshijian;
	}
	
	/**
	 * Get: Reminder time
	 */
	public Date getTixingshijian() {
		return tixingshijian;
	}
				
	
	/**
	 * Set: Remarks
	 */
	 
	public void setBeizhu(String beizhu) {
		this.beizhu = beizhu;
	}
	
	/**
	 * Get: Remarks
	 */
	public String getBeizhu() {
		return beizhu;
	}
			
}
