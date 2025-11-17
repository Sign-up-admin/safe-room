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
 * Membership Card
 * Database universal operation entity class (common add, delete, modify, query)
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
@TableName("membership_card")
public class MembershipCardEntity<T> implements Serializable {
	private static final long serialVersionUID = 1L;


	public MembershipCardEntity() {
		
	}
	
	public MembershipCardEntity(T t) {
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
	 * Membership card name
	 */
					
	private String membershipCardName;
	
	/**
	 * Image
	 */
					
	private String image;
	
	/**
	 * Validity period
	 */
					
	private String validityPeriod;
	
	/**
	 * Price
	 */
					
	private Integer price;
	
	/**
	 * Usage instructions
	 */
					
	private String usageInstructions;
	
	/**
	 * Membership card details
	 */
					
	private String membershipCardDetails;
	
	
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
	 * Set: Membership card name
	 */
	public void setMembershipCardName(String membershipCardName) {
		this.membershipCardName = membershipCardName;
	}
	/**
	 * Get: Membership card name
	 */
	public String getMembershipCardName() {
		return membershipCardName;
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
	 * Set: Validity period
	 */
	public void setValidityPeriod(String validityPeriod) {
		this.validityPeriod = validityPeriod;
	}
	/**
	 * Get: Validity period
	 */
	public String getValidityPeriod() {
		return validityPeriod;
	}
	/**
	 * Set: Price
	 */
	public void setPrice(Integer price) {
		this.price = price;
	}
	/**
	 * Get: Price
	 */
	public Integer getPrice() {
		return price;
	}
	/**
	 * Set: Usage instructions
	 */
	public void setUsageInstructions(String usageInstructions) {
		this.usageInstructions = usageInstructions;
	}
	/**
	 * Get: Usage instructions
	 */
	public String getUsageInstructions() {
		return usageInstructions;
	}
	/**
	 * Set: Membership card details
	 */
	public void setMembershipCardDetails(String membershipCardDetails) {
		this.membershipCardDetails = membershipCardDetails;
	}
	/**
	 * Get: Membership card details
	 */
	public String getMembershipCardDetails() {
		return membershipCardDetails;
	}

}
