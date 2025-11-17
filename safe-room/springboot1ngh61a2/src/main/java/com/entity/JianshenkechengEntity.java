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
 * Fitness Course
 * Database universal operation entity class (common add, delete, modify, query)
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
@TableName("jianshenkecheng")
public class JianshenkechengEntity<T> implements Serializable {
	private static final long serialVersionUID = 1L;


	public JianshenkechengEntity() {
		
	}
	
	public JianshenkechengEntity(T t) {
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
	 * Course name
	 */
					
	private String kechengmingcheng;
	
	/**
	 * Course type
	 */
					
	private String kechengleixing;
	
	/**
	 * Image
	 */
					
	private String tupian;
	
	/**
	 * Class time
	 */
				
	@JsonFormat(locale="zh", timezone="GMT+8", pattern="yyyy-MM-dd HH:mm:ss")
	@DateTimeFormat 		
	private Date shangkeshijian;
	
	/**
	 * Class location
	 */
					
	private String shangkedidian;
	
	/**
	 * Course price
	 */
					
	private Double kechengjiage;
	
	/**
	 * Course introduction
	 */
					
	private String kechengjianjie;
	
	/**
	 * Course video
	 */
					
	private String kechengshipin;
	
	/**
	 * Coach ID
	 */
					
	private String jiaoliangonghao;
	
	/**
	 * Coach name
	 */
					
	private String jiaolianxingming;
	
	/**
	 * Last click time
	 */
				
	@JsonFormat(locale="zh", timezone="GMT+8", pattern="yyyy-MM-dd HH:mm:ss")
	@DateTimeFormat 		
	private Date clicktime;
	
	/**
	 * Clicks
	 */
					
	private Integer clicknum;
	
	/**
	 * Comments
	 */
					
	private Integer discussnum;
	
	/**
	 * Favorites
	 */
					
	private Integer storeupnum;
	
	
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
	 * Set: Class time
	 */
	public void setShangkeshijian(Date shangkeshijian) {
		this.shangkeshijian = shangkeshijian;
	}
	/**
	 * Get: Class time
	 */
	public Date getShangkeshijian() {
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
	 * Set: Course introduction
	 */
	public void setKechengjianjie(String kechengjianjie) {
		this.kechengjianjie = kechengjianjie;
	}
	/**
	 * Get: Course introduction
	 */
	public String getKechengjianjie() {
		return kechengjianjie;
	}
	/**
	 * Set: Course video
	 */
	public void setKechengshipin(String kechengshipin) {
		this.kechengshipin = kechengshipin;
	}
	/**
	 * Get: Course video
	 */
	public String getKechengshipin() {
		return kechengshipin;
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
	 * Set: Last click time
	 */
	public void setClicktime(Date clicktime) {
		this.clicktime = clicktime;
	}
	/**
	 * Get: Last click time
	 */
	public Date getClicktime() {
		return clicktime;
	}
	/**
	 * Set: Clicks
	 */
	public void setClicknum(Integer clicknum) {
		this.clicknum = clicknum;
	}
	/**
	 * Get: Clicks
	 */
	public Integer getClicknum() {
		return clicknum;
	}
	/**
	 * Set: Comments
	 */
	public void setDiscussnum(Integer discussnum) {
		this.discussnum = discussnum;
	}
	/**
	 * Get: Comments
	 */
	public Integer getDiscussnum() {
		return discussnum;
	}
	/**
	 * Set: Favorites
	 */
	public void setStoreupnum(Integer storeupnum) {
		this.storeupnum = storeupnum;
	}
	/**
	 * Get: Favorites
	 */
	public Integer getStoreupnum() {
		return storeupnum;
	}

}
