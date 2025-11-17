package com.entity.vo;

import com.entity.JianshenqicaiEntity;

import com.baomidou.mybatisplus.annotation.TableName;
import java.util.Date;
import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.io.Serializable;
 

/**
 * Fitness Equipment
 * @author 
 * @email 
 * @date 2024-06-20 10:35:10
 */
public class JianshenqicaiVO  implements Serializable {
	private static final long serialVersionUID = 1L;

	 			
	/**
	 * Image
	 */
	
	private String tupian;
		
	/**
	 * Brand
	 */
	
	private String pinpai;
		
	/**
	 * Usage method
	 */
	
	private String shiyongfangfa;
		
	/**
	 * Slimming effect
	 */
	
	private String shoushenxiaoguo;
		
	/**
	 * Equipment introduction
	 */
	
	private String qicaijieshao;
		
	/**
	 * Tutorial video
	 */
	
	private String jiaoxueshipin;
				
	
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
	 * Set: Brand
	 */
	 
	public void setPinpai(String pinpai) {
		this.pinpai = pinpai;
	}
	
	/**
	 * Get: Brand
	 */
	public String getPinpai() {
		return pinpai;
	}
				
	
	/**
	 * Set: Usage method
	 */
	 
	public void setShiyongfangfa(String shiyongfangfa) {
		this.shiyongfangfa = shiyongfangfa;
	}
	
	/**
	 * Get: Usage method
	 */
	public String getShiyongfangfa() {
		return shiyongfangfa;
	}
				
	
	/**
	 * Set: Slimming effect
	 */
	 
	public void setShoushenxiaoguo(String shoushenxiaoguo) {
		this.shoushenxiaoguo = shoushenxiaoguo;
	}
	
	/**
	 * Get: Slimming effect
	 */
	public String getShoushenxiaoguo() {
		return shoushenxiaoguo;
	}
				
	
	/**
	 * Set: Equipment introduction
	 */
	 
	public void setQicaijieshao(String qicaijieshao) {
		this.qicaijieshao = qicaijieshao;
	}
	
	/**
	 * Get: Equipment introduction
	 */
	public String getQicaijieshao() {
		return qicaijieshao;
	}
				
	
	/**
	 * Set: Tutorial video
	 */
	 
	public void setJiaoxueshipin(String jiaoxueshipin) {
		this.jiaoxueshipin = jiaoxueshipin;
	}
	
	/**
	 * Get: Tutorial video
	 */
	public String getJiaoxueshipin() {
		return jiaoxueshipin;
	}
			
}
