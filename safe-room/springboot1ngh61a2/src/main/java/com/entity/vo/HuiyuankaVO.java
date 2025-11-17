package com.entity.vo;

import com.entity.HuiyuankaEntity;

import com.baomidou.mybatisplus.annotation.TableName;
import java.util.Date;
import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.io.Serializable;
 

/**
 * Membership Card
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
public class HuiyuankaVO  implements Serializable {
	private static final long serialVersionUID = 1L;

	 			
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
