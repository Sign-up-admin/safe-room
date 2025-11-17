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
 * Course Withdrawal
 * Database universal operation entity class (common add, delete, modify, query)
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
@TableName("kechengtuike")
public class KechengtuikeEntity<T> implements Serializable {
	private static final long serialVersionUID = 1L;


	public KechengtuikeEntity() {
		
	}
	
	public KechengtuikeEntity(T t) {
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
	 * Application time
	 */
				
	@JsonFormat(locale="zh", timezone="GMT+8", pattern="yyyy-MM-dd HH:mm:ss")
	@DateTimeFormat 		
	private Date shenqingshijian;
	
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
	 * Reason for withdrawal
	 */
					
	private String tuikeyuanyin;
	
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
	 * Withdrawal number
	 */

	private String tuikebianhao;

	/**
	 * Withdrawal time
	 */
	@JsonFormat(locale="zh", timezone="GMT+8", pattern="yyyy-MM-dd HH:mm:ss")
	@DateTimeFormat
	private Date tuikeshijian;

	/**
	 * Refund amount
	 */

	private Double tuikuanjine;


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
	 * Set: Application time
	 */
	public void setShenqingshijian(Date shenqingshijian) {
		this.shenqingshijian = shenqingshijian;
	}
	/**
	 * Get: Application time
	 */
	public Date getShenqingshijian() {
		return shenqingshijian;
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
	 * Set: Reason for withdrawal
	 */
	public void setTuikeyuanyin(String tuikeyuanyin) {
		this.tuikeyuanyin = tuikeyuanyin;
	}
	/**
	 * Get: Reason for withdrawal
	 */
	public String getTuikeyuanyin() {
		return tuikeyuanyin;
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
	/**
	 * Set: Withdrawal number
	 */
	public void setTuikebianhao(String tuikebianhao) {
		this.tuikebianhao = tuikebianhao;
	}
	/**
	 * Get: Withdrawal number
	 */
	public String getTuikebianhao() {
		return tuikebianhao;
	}
	/**
	 * Set: Withdrawal time
	 */
	public void setTuikeshijian(Date tuikeshijian) {
		this.tuikeshijian = tuikeshijian;
	}
	/**
	 * Get: Withdrawal time
	 */
	public Date getTuikeshijian() {
		return tuikeshijian;
	}
	/**
	 * Set: Refund amount
	 */
	public void setTuikuanjine(Double tuikuanjine) {
		this.tuikuanjine = tuikuanjine;
	}
	/**
	 * Get: Refund amount
	 */
	public Double getTuikuanjine() {
		return tuikuanjine;
	}

}
