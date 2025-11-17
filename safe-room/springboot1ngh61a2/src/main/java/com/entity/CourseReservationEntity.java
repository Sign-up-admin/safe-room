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
 * Course Reservation
 * Database universal operation entity class (common add, delete, modify, query)
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
@TableName("course_reservation")
public class CourseReservationEntity<T> implements Serializable {
	private static final long serialVersionUID = 1L;


	public CourseReservationEntity() {
		
	}
	
	public CourseReservationEntity(T t) {
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
	 * Reservation number
	 */
					
	private String reservationNumber;
	
	/**
	 * Course name
	 */
					
	private String courseName;
	
	/**
	 * Image
	 */
					
	private String image;
	
	/**
	 * Course type
	 */
					
	private String courseType;
	
	/**
	 * Class time
	 */
					
	private String classTime;
	
	/**
	 * Class location
	 */
					
	private String classLocation;
	
	/**
	 * Course price
	 */
					
	private Double coursePrice;
	
	/**
	 * Coach ID
	 */
					
	private String coachId;
	
	/**
	 * Coach name
	 */
					
	private String coachName;
	
	/**
	 * Reservation time
	 */
				
	@JsonFormat(locale="zh", timezone="GMT+8", pattern="yyyy-MM-dd HH:mm:ss")
	@DateTimeFormat 		
	private Date reservationTime;
	
	/**
	 * Membership card number
	 */
					
	private String membershipCardNumber;
	
	/**
	 * User account
	 */
					
	private String username;
	
	/**
	 * Full name
	 */
					
	private String fullName;
	
	/**
	 * Phone number
	 */
					
	private String phoneNumber;
	
	/**
	 * Cross-table user id
	 */
					
	private Long crossUserId;
	
	/**
	 * Cross-table primary key id
	 */
					
	private Long crossRefId;
	
	/**
	 * Audit status
	 */
					
	private String auditStatus;
	
	/**
	 * Audit reply
	 */
					
	private String auditContent;
	
	/**
	 * Payment status
	 */
					
	private String paymentStatus;
	
	
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
	 * Set: Reservation number
	 */
	public void setReservationNumber(String reservationNumber) {
		this.reservationNumber = reservationNumber;
	}
	/**
	 * Get: Reservation number
	 */
	public String getReservationNumber() {
		return reservationNumber;
	}
	/**
	 * Set: Course name
	 */
	public void setCourseName(String courseName) {
		this.courseName = courseName;
	}
	/**
	 * Get: Course name
	 */
	public String getCourseName() {
		return courseName;
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
	 * Set: Course type
	 */
	public void setCourseType(String courseType) {
		this.courseType = courseType;
	}
	/**
	 * Get: Course type
	 */
	public String getCourseType() {
		return courseType;
	}
	/**
	 * Set: Class time
	 */
	public void setClassTime(String classTime) {
		this.classTime = classTime;
	}
	/**
	 * Get: Class time
	 */
	public String getClassTime() {
		return classTime;
	}
	/**
	 * Set: Class location
	 */
	public void setClassLocation(String classLocation) {
		this.classLocation = classLocation;
	}
	/**
	 * Get: Class location
	 */
	public String getClassLocation() {
		return classLocation;
	}
	/**
	 * Set: Course price
	 */
	public void setCoursePrice(Double coursePrice) {
		this.coursePrice = coursePrice;
	}
	/**
	 * Get: Course price
	 */
	public Double getCoursePrice() {
		return coursePrice;
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
	 * Set: Reservation time
	 */
	public void setReservationTime(Date reservationTime) {
		this.reservationTime = reservationTime;
	}
	/**
	 * Get: Reservation time
	 */
	public Date getReservationTime() {
		return reservationTime;
	}
	/**
	 * Set: Membership card number
	 */
	public void setMembershipCardNumber(String membershipCardNumber) {
		this.membershipCardNumber = membershipCardNumber;
	}
	/**
	 * Get: Membership card number
	 */
	public String getMembershipCardNumber() {
		return membershipCardNumber;
	}
	/**
	 * Set: User account
	 */
	public void setUsername(String username) {
		this.username = username;
	}
	/**
	 * Get: User account
	 */
	public String getUsername() {
		return username;
	}
	/**
	 * Set: Full name
	 */
	public void setFullName(String fullName) {
		this.fullName = fullName;
	}
	/**
	 * Get: Full name
	 */
	public String getFullName() {
		return fullName;
	}
	/**
	 * Set: Phone number
	 */
	public void setPhoneNumber(String phoneNumber) {
		this.phoneNumber = phoneNumber;
	}
	/**
	 * Get: Phone number
	 */
	public String getPhoneNumber() {
		return phoneNumber;
	}
	/**
	 * Set: Cross-table user id
	 */
	public void setCrossUserId(Long crossUserId) {
		this.crossUserId = crossUserId;
	}
	/**
	 * Get: Cross-table user id
	 */
	public Long getCrossUserId() {
		return crossUserId;
	}
	/**
	 * Set: Cross-table primary key id
	 */
	public void setCrossRefId(Long crossRefId) {
		this.crossRefId = crossRefId;
	}
	/**
	 * Get: Cross-table primary key id
	 */
	public Long getCrossRefId() {
		return crossRefId;
	}
	/**
	 * Set: Audit status
	 */
	public void setAuditStatus(String auditStatus) {
		this.auditStatus = auditStatus;
	}
	/**
	 * Get: Audit status
	 */
	public String getAuditStatus() {
		return auditStatus;
	}
	/**
	 * Set: Audit reply
	 */
	public void setAuditContent(String auditContent) {
		this.auditContent = auditContent;
	}
	/**
	 * Get: Audit reply
	 */
	public String getAuditContent() {
		return auditContent;
	}
	/**
	 * Set: Payment status
	 */
	public void setPaymentStatus(String paymentStatus) {
		this.paymentStatus = paymentStatus;
	}
	/**
	 * Get: Payment status
	 */
	public String getPaymentStatus() {
		return paymentStatus;
	}

}
