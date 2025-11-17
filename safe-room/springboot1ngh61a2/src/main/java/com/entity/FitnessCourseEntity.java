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
@TableName("fitness_course")
public class FitnessCourseEntity<T> implements Serializable {
	private static final long serialVersionUID = 1L;


	public FitnessCourseEntity() {
		
	}
	
	public FitnessCourseEntity(T t) {
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
					
	private String courseName;
	
	/**
	 * Course type
	 */
					
	private String courseType;
	
	/**
	 * Image
	 */
					
	private String image;
	
	/**
	 * Class time
	 */
				
	@JsonFormat(locale="zh", timezone="GMT+8", pattern="yyyy-MM-dd HH:mm:ss")
	@DateTimeFormat 		
	private Date classTime;
	
	/**
	 * Class location
	 */
					
	private String classLocation;
	
	/**
	 * Course price
	 */
					
	private Double coursePrice;
	
	/**
	 * Course introduction
	 */
					
	private String courseIntroduction;
	
	/**
	 * Course video
	 */
					
	private String courseVideo;
	
	/**
	 * Coach ID
	 */
					
	private String coachId;
	
	/**
	 * Coach name
	 */
					
	private String coachName;
	
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
	 * Set: Class time
	 */
	public void setClassTime(Date classTime) {
		this.classTime = classTime;
	}
	/**
	 * Get: Class time
	 */
	public Date getClassTime() {
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
	 * Set: Course introduction
	 */
	public void setCourseIntroduction(String courseIntroduction) {
		this.courseIntroduction = courseIntroduction;
	}
	/**
	 * Get: Course introduction
	 */
	public String getCourseIntroduction() {
		return courseIntroduction;
	}
	/**
	 * Set: Course video
	 */
	public void setCourseVideo(String courseVideo) {
		this.courseVideo = courseVideo;
	}
	/**
	 * Get: Course video
	 */
	public String getCourseVideo() {
		return courseVideo;
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
