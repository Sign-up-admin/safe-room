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
 * Fitness Equipment
 * Database universal operation entity class (common add, delete, modify, query)
 * @author 
 * @email 
 * @date 2024-06-20 10:35:10
 */
@TableName("jianshenqicai")
public class JianshenqicaiEntity<T> implements Serializable {
	private static final long serialVersionUID = 1L;


	public JianshenqicaiEntity() {
		
	}
	
	public JianshenqicaiEntity(T t) {
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
	 * Equipment name
	 */
					
	private String qicaimingcheng;
	
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
	 * Set: Equipment name
	 */
	public void setQicaimingcheng(String qicaimingcheng) {
		this.qicaimingcheng = qicaimingcheng;
	}
	/**
	 * Get: Equipment name
	 */
	public String getQicaimingcheng() {
		return qicaimingcheng;
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
