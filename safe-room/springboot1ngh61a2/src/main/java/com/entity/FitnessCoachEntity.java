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
 * Fitness Coach
 * Database universal operation entity class (common add, delete, modify, query)
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
@TableName("fitness_coach")
public class FitnessCoachEntity<T> implements Serializable {
	private static final long serialVersionUID = 1L;


	public FitnessCoachEntity() {
		
	}
	
	public FitnessCoachEntity(T t) {
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
    @TableId
    private Long id;
	/**
	 * Coach ID
	 */
					
	private String coachId;
	
	/**
	 * Password
	 */
					
	private String password;
	
	/**
	 * Coach name
	 */
					
	private String coachName;
	
	/**
	 * Photo
	 */
					
	private String photo;
	
	/**
	 * Gender
	 */
					
	private String gender;
	
	/**
	 * Age
	 */
					
	private String age;
	
	/**
	 * Height
	 */
					
	private String height;
	
	/**
	 * Weight
	 */
					
	private String weight;
	
	/**
	 * Contact phone
	 */
					
	private String contactPhone;
	
	/**
	 * Private coaching price/hour
	 */
					
	private Double privateCoachingPrice;
	
	/**
	 * Personal introduction
	 */
					
	private String personalIntroduction;
	
	
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
	 * Set: Coach ID
	 */
	public void setCoachId(String coachId) {
		this.coachId = coachId;
	}
	/**
	 * Get: Coach ID
	 */
	public String getCoachId() {
		return coachId;
	}
	/**
	 * Set: Password
	 */
	public void setPassword(String password) {
		this.password = password;
	}
	/**
	 * Get: Password
	 */
	public String getPassword() {
		return password;
	}
	/**
	 * Set: Coach name
	 */
	public void setCoachName(String coachName) {
		this.coachName = coachName;
	}
	/**
	 * Get: Coach name
	 */
	public String getCoachName() {
		return coachName;
	}
	/**
	 * Set: Photo
	 */
	public void setPhoto(String photo) {
		this.photo = photo;
	}
	/**
	 * Get: Photo
	 */
	public String getPhoto() {
		return photo;
	}
	/**
	 * Set: Gender
	 */
	public void setGender(String gender) {
		this.gender = gender;
	}
	/**
	 * Get: Gender
	 */
	public String getGender() {
		return gender;
	}
	/**
	 * Set: Age
	 */
	public void setAge(String age) {
		this.age = age;
	}
	/**
	 * Get: Age
	 */
	public String getAge() {
		return age;
	}
	/**
	 * Set: Height
	 */
	public void setHeight(String height) {
		this.height = height;
	}
	/**
	 * Get: Height
	 */
	public String getHeight() {
		return height;
	}
	/**
	 * Set: Weight
	 */
	public void setWeight(String weight) {
		this.weight = weight;
	}
	/**
	 * Get: Weight
	 */
	public String getWeight() {
		return weight;
	}
	/**
	 * Set: Contact phone
	 */
	public void setContactPhone(String contactPhone) {
		this.contactPhone = contactPhone;
	}
	/**
	 * Get: Contact phone
	 */
	public String getContactPhone() {
		return contactPhone;
	}
	/**
	 * Set: Private coaching price/hour
	 */
	public void setPrivateCoachingPrice(Double privateCoachingPrice) {
		this.privateCoachingPrice = privateCoachingPrice;
	}
	/**
	 * Get: Private coaching price/hour
	 */
	public Double getPrivateCoachingPrice() {
		return privateCoachingPrice;
	}
	/**
	 * Set: Personal introduction
	 */
	public void setPersonalIntroduction(String personalIntroduction) {
		this.personalIntroduction = personalIntroduction;
	}
	/**
	 * Get: Personal introduction
	 */
	public String getPersonalIntroduction() {
		return personalIntroduction;
	}

}
