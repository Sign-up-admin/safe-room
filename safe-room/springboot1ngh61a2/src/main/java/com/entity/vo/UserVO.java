package com.entity.vo;

import com.entity.UserEntity;

import com.baomidou.mybatisplus.annotation.TableName;
import java.util.Date;
import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.io.Serializable;
 

/**
 * 用户
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
public class UserVO  implements Serializable {
	private static final long serialVersionUID = 1L;

	 			
	/**
	 * 密码
	 */
	
	private String password;
		
	/**
	 * 全名
	 */
	
	private String fullName;
		
	/**
	 * 头像
	 */
	
	private String avatar;
		
	/**
	 * 性别
	 */
	
	private String gender;
		
	/**
	 * 身高
	 */
	
	private String height;
		
	/**
	 * 体重
	 */
	
	private String weight;
		
	/**
	 * 电话号码
	 */
	
	private String phoneNumber;
		
	/**
	 * 会员卡号
	 */
	
	private String membershipCardNumber;
		
	/**
	 * 到期日期
	 */
		
	@JsonFormat(locale="zh", timezone="GMT+8", pattern="yyyy-MM-dd HH:mm:ss")
	@DateTimeFormat 
	private Date expirationDate;
		
	/**
	 * 状态
	 */
	
	private Integer status;
				
	
	/**
	 * 设置：密码
	 */
	 
	public void setPassword(String password) {
		this.password = password;
	}
	
	/**
	 * 获取：密码
	 */
	public String getPassword() {
		return password;
	}
				
	
	/**
	 * 设置：全名
	 */
	 
	public void setFullName(String fullName) {
		this.fullName = fullName;
	}
	
	/**
	 * 获取：全名
	 */
	public String getFullName() {
		return fullName;
	}
				
	
	/**
	 * 设置：头像
	 */
	 
	public void setAvatar(String avatar) {
		this.avatar = avatar;
	}
	
	/**
	 * 获取：头像
	 */
	public String getAvatar() {
		return avatar;
	}
				
	
	/**
	 * 设置：性别
	 */
	 
	public void setGender(String gender) {
		this.gender = gender;
	}
	
	/**
	 * 获取：性别
	 */
	public String getGender() {
		return gender;
	}
				
	
	/**
	 * 设置：身高
	 */
	 
	public void setHeight(String height) {
		this.height = height;
	}
	
	/**
	 * 获取：身高
	 */
	public String getHeight() {
		return height;
	}
				
	
	/**
	 * 设置：体重
	 */
	 
	public void setWeight(String weight) {
		this.weight = weight;
	}
	
	/**
	 * 获取：体重
	 */
	public String getWeight() {
		return weight;
	}
				
	
	/**
	 * 设置：电话号码
	 */
	 
	public void setPhoneNumber(String phoneNumber) {
		this.phoneNumber = phoneNumber;
	}
	
	/**
	 * 获取：电话号码
	 */
	public String getPhoneNumber() {
		return phoneNumber;
	}
				
	
	/**
	 * 设置：会员卡号
	 */
	 
	public void setMembershipCardNumber(String membershipCardNumber) {
		this.membershipCardNumber = membershipCardNumber;
	}
	
	/**
	 * 获取：会员卡号
	 */
	public String getMembershipCardNumber() {
		return membershipCardNumber;
	}
				
	
	/**
	 * 设置：到期日期
	 */
	 
	public void setExpirationDate(Date expirationDate) {
		this.expirationDate = expirationDate;
	}
	
	/**
	 * 获取：到期日期
	 */
	public Date getExpirationDate() {
		return expirationDate;
	}
				
	
	/**
	 * 设置：状态
	 */
	 
	public void setStatus(Integer status) {
		this.status = status;
	}
	
	/**
	 * 获取：状态
	 */
	public Integer getStatus() {
		return status;
	}
			
}

