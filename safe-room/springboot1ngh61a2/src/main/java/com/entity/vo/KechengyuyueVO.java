package com.entity.vo;

import com.entity.KechengyuyueEntity;

import com.baomidou.mybatisplus.annotation.TableName;
import java.util.Date;
import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.io.Serializable;
 

/**
 * Course Appointment
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
public class KechengyuyueVO  implements Serializable {
	private static final long serialVersionUID = 1L;

	 			
	/**
	 * Course name
	 */
	
	private String kechengmingcheng;
		
	/**
	 * Image
	 */
	
	private String tupian;
		
	/**
	 * Course type
	 */
	
	private String kechengleixing;
		
	/**
	 * Class time
	 */
	
	private String shangkeshijian;
		
	/**
	 * Class location
	 */
	
	private String shangkedidian;
		
	/**
	 * Course price
	 */
	
	private Double kechengjiage;
		
	/**
	 * Coach ID
	 */
	
	private String jiaoliangonghao;
		
	/**
	 * Coach name
	 */
	
	private String jiaolianxingming;
		
	/**
	 * Appointment time
	 */
		
	@JsonFormat(locale="zh", timezone="GMT+8", pattern="yyyy-MM-dd HH:mm:ss")
	@DateTimeFormat 
	private Date yuyueshijian;
		
	/**
	 * Membership card number
	 */
	
	private String huiyuankahao;
		
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
	 * Cross-table user id
	 */
	
	private Long crossuserid;
		
	/**
	 * Cross-table primary key id
	 */
	
	private Long crossrefid;
		
	/**
	 * Is it reviewed
	 */
	
	private String sfsh;
		
	/**
	 * Review reply
	 */
	
	private String shhf;
		
	/**
	 * Is it paid
	 */
	
	private String ispay;
				
	
	/**
	 * Set: Course name
	 */
	 
	public void setKechengmingcheng(String kechengmingcheng) {
		this.kechengmingcheng = kechengmingcheng;
	}
	
	/**
	 * Get: Course name
	 */
	public String getKechengmingcheng() {
		return kechengmingcheng;
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
	 * Set: Course type
	 */
	 
	public void setKechengleixing(String kechengleixing) {
		this.kechengleixing = kechengleixing;
	}
	
	/**
	 * Get: Course type
	 */
	public String getKechengleixing() {
		return kechengleixing;
	}
				
	
	/**
	 * Set: Class time
	 */
	 
	public void setShangkeshijian(String shangkeshijian) {
		this.shangkeshijian = shangkeshijian;
	}
	
	/**
	 * Get: Class time
	 */
	public String getShangkeshijian() {
		return shangkeshijian;
	}
				
	
	/**
	 * Set: Class location
	 */
	 
	public void setShangkedidian(String shangkedidian) {
		this.shangkedidian = shangkedidian;
	}
	
	/**
	 * Get: Class location
	 */
	public String getShangkedidian() {
		return shangkedidian;
	}
				
	
	/**
	 * Set: Course price
	 */
	 
	public void setKechengjiage(Double kechengjiage) {
		this.kechengjiage = kechengjiage;
	}
	
	/**
	 * Get: Course price
	 */
	public Double getKechengjiage() {
		return kechengjiage;
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
	 * Set: Appointment time
	 */
	 
	public void setYuyueshijian(Date yuyueshijian) {
		this.yuyueshijian = yuyueshijian;
	}
	
	/**
	 * Get: Appointment time
	 */
	public Date getYuyueshijian() {
		return yuyueshijian;
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
	 * Set: Cross-table user id
	 */
	 
	public void setCrossuserid(Long crossuserid) {
		this.crossuserid = crossuserid;
	}
	
	/**
	 * Get: Cross-table user id
	 */
	public Long getCrossuserid() {
		return crossuserid;
	}
				
	
	/**
	 * Set: Cross-table primary key id
	 */
	 
	public void setCrossrefid(Long crossrefid) {
		this.crossrefid = crossrefid;
	}
	
	/**
	 * Get: Cross-table primary key id
	 */
	public Long getCrossrefid() {
		return crossrefid;
	}
				
	
	/**
	 * Set: Is it reviewed
	 */
	 
	public void setSfsh(String sfsh) {
		this.sfsh = sfsh;
	}
	
	/**
	 * Get: Is it reviewed
	 */
	public String getSfsh() {
		return sfsh;
	}
				
	
	/**
	 * Set: Review reply
	 */
	 
	public void setShhf(String shhf) {
		this.shhf = shhf;
	}
	
	/**
	 * Get: Review reply
	 */
	public String getShhf() {
		return shhf;
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
