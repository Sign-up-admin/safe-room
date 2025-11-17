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
 * Private Tutoring Appointment
 * Database universal operation entity class (common add, delete, modify, query)
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
@TableName("sijiaoyuyue")
public class SijiaoyuyueEntity<T> implements Serializable {
	private static final long serialVersionUID = 1L;


	public SijiaoyuyueEntity() {
		
	}
	
	public SijiaoyuyueEntity(T t) {
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
	 * Appointment number
	 */
					
	private String yuyuebianhao;
	
	/**
	 * Coach ID
	 */
					
	private String jiaoliangonghao;
	
	/**
	 * Coach name
	 */
					
	private String jiaolianxingming;
	
	/**
	 * Photo
	 */
					
	private String zhaopian;
	
	/**
	 * Private tutoring price/hour
	 */
					
	private Double sijiaojiage;
	
	/**
	 * Appointment time
	 */
				
	@JsonFormat(locale="zh", timezone="GMT+8", pattern="yyyy-MM-dd HH:mm:ss")
	@DateTimeFormat 		
	private Date yuyueshijian;
	
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
	 * Membership card number
	 */
					
	private String huiyuankahao;
	
	/**
	 * Remarks
	 */
					
	private String beizhu;
	
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
	 * Set: Appointment number
	 */
	public void setYuyuebianhao(String yuyuebianhao) {
		this.yuyuebianhao = yuyuebianhao;
	}
	/**
	 * Get: Appointment number
	 */
	public String getYuyuebianhao() {
		return yuyuebianhao;
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
	 * Set: Private tutoring price/hour
	 */
	public void setSijiaojiage(Double sijiaojiage) {
		this.sijiaojiage = sijiaojiage;
	}
	/**
	 * Get: Private tutoring price/hour
	 */
	public Double getSijiaojiage() {
		return sijiaojiage;
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
