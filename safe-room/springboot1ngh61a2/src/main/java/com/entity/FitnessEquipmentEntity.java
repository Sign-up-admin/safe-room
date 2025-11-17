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
@TableName("fitness_equipment")
public class FitnessEquipmentEntity<T> implements Serializable {
	private static final long serialVersionUID = 1L;


	public FitnessEquipmentEntity() {
		
	}
	
	public FitnessEquipmentEntity(T t) {
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
					
	private String equipmentName;
	
	/**
	 * Image
	 */
					
	private String image;
	
	/**
	 * Brand
	 */
					
	private String brand;
	
	/**
	 * Usage method
	 */
					
	private String usageMethod;
	
	/**
	 * Weight loss effect
	 */
					
	private String weightLossEffect;
	
	/**
	 * Equipment introduction
	 */
					
	private String equipmentIntroduction;
	
	/**
	 * Teaching video
	 */
					
	private String teachingVideo;
	
	
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
	public void setEquipmentName(String equipmentName) {
		this.equipmentName = equipmentName;
	}
	/**
	 * Get: Equipment name
	 */
	public String getEquipmentName() {
		return equipmentName;
	}
	/**
	 * Set: Image
	 */
	public void setImage(String image) {
		this.image = image;
	}
	/**
	 * Get: Image
	 */
	public String getImage() {
		return image;
	}
	/**
	 * Set: Brand
	 */
	public void setBrand(String brand) {
		this.brand = brand;
	}
	/**
	 * Get: Brand
	 */
	public String getBrand() {
		return brand;
	}
	/**
	 * Set: Usage method
	 */
	public void setUsageMethod(String usageMethod) {
		this.usageMethod = usageMethod;
	}
	/**
	 * Get: Usage method
	 */
	public String getUsageMethod() {
		return usageMethod;
	}
	/**
	 * Set: Weight loss effect
	 */
	public void setWeightLossEffect(String weightLossEffect) {
		this.weightLossEffect = weightLossEffect;
	}
	/**
	 * Get: Weight loss effect
	 */
	public String getWeightLossEffect() {
		return weightLossEffect;
	}
	/**
	 * Set: Equipment introduction
	 */
	public void setEquipmentIntroduction(String equipmentIntroduction) {
		this.equipmentIntroduction = equipmentIntroduction;
	}
	/**
	 * Get: Equipment introduction
	 */
	public String getEquipmentIntroduction() {
		return equipmentIntroduction;
	}
	/**
	 * Set: Teaching video
	 */
	public void setTeachingVideo(String teachingVideo) {
		this.teachingVideo = teachingVideo;
	}
	/**
	 * Get: Teaching video
	 */
	public String getTeachingVideo() {
		return teachingVideo;
	}

}
