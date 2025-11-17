package com.entity.vo;

import com.entity.MembershipCardEntity;

import com.baomidou.mybatisplus.annotation.TableName;
import java.util.Date;
import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.io.Serializable;
 

/**
 * 会员卡
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
public class MembershipCardVO  implements Serializable {
	private static final long serialVersionUID = 1L;

	 			
	/**
	 * 会员卡名称
	 */
	
	private String membershipCardName;
		
	/**
	 * 图片
	 */
	
	private String image;
		
	/**
	 * 有效期
	 */
	
	private String validityPeriod;
		
	/**
	 * 价格
	 */
	
	private Integer price;
		
	/**
	 * 使用说明
	 */
	
	private String usageInstructions;
		
	/**
	 * 会员卡详情
	 */
	
	private String membershipCardDetails;
				
	
	/**
	 * 设置：会员卡名称
	 */
	 
	public void setMembershipCardName(String membershipCardName) {
		this.membershipCardName = membershipCardName;
	}
	
	/**
	 * 获取：会员卡名称
	 */
	public String getMembershipCardName() {
		return membershipCardName;
	}
				
	
	/**
	 * 设置：图片
	 */
	 
	public void setImage(String image) {
		this.image = image;
	}
	
	/**
	 * 获取：图片
	 */
	public String getImage() {
		return image;
	}
				
	
	/**
	 * 设置：有效期
	 */
	 
	public void setValidityPeriod(String validityPeriod) {
		this.validityPeriod = validityPeriod;
	}
	
	/**
	 * 获取：有效期
	 */
	public String getValidityPeriod() {
		return validityPeriod;
	}
				
	
	/**
	 * 设置：价格
	 */
	 
	public void setPrice(Integer price) {
		this.price = price;
	}
	
	/**
	 * 获取：价格
	 */
	public Integer getPrice() {
		return price;
	}
				
	
	/**
	 * 设置：使用说明
	 */
	 
	public void setUsageInstructions(String usageInstructions) {
		this.usageInstructions = usageInstructions;
	}
	
	/**
	 * 获取：使用说明
	 */
	public String getUsageInstructions() {
		return usageInstructions;
	}
				
	
	/**
	 * 设置：会员卡详情
	 */
	 
	public void setMembershipCardDetails(String membershipCardDetails) {
		this.membershipCardDetails = membershipCardDetails;
	}
	
	/**
	 * 获取：会员卡详情
	 */
	public String getMembershipCardDetails() {
		return membershipCardDetails;
	}
			
}

