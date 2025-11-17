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
 * Membership Renewal
 * Database universal operation entity class (common add, delete, modify, query)
 * @author 
 * @email 
 * @date 2024-06-20 10:35:10
 */
@TableName("huiyuanxufei")
public class HuiyuanxufeiEntity<T> implements Serializable {
	private static final long serialVersionUID = 1L;


	public HuiyuanxufeiEntity() {
		
	}
	
	public HuiyuanxufeiEntity(T t) {
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
	 * User account
	 */
					
	private String yonghuzhanghao;
	
	/**
	 * User name
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
