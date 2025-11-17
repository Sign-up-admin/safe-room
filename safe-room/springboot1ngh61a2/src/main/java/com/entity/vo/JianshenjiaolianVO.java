package com.entity.vo;

import com.entity.JianshenjiaolianEntity;

import com.baomidou.mybatisplus.annotation.TableName;
import java.util.Date;
import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.io.Serializable;
 

/**
 * 健身教练
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
public class JianshenjiaolianVO  implements Serializable {
	private static final long serialVersionUID = 1L;

	 			
	/**
	 * 密码
	 */
	
	private String mima;
		
	/**
	 * 教练姓名
	 */
	
	private String jiaolianxingming;
		
	/**
	 * 照片
	 */
	
	private String zhaopian;
		
	/**
	 * 性别
	 */
	
	private String xingbie;
		
	/**
	 * 年龄
	 */
	
	private String nianling;
		
	/**
	 * 身高
	 */
	
	private String shengao;
		
	/**
	 * 体重
	 */
	
	private String tizhong;
		
	/**
	 * 联系电话
	 */
	
	private String lianxidianhua;
		
	/**
	 * 私教价格/�?
	 */
	
	private Double sijiaojiage;
		
	/**
	 * 个人简�?
	 */
	
	private String gerenjianjie;
				
	
	/**
	 * 设置：密�?
	 */
	 
	public void setMima(String mima) {
		this.mima = mima;
	}
	
	/**
	 * 获取：密�?
	 */
	public String getMima() {
		return mima;
	}
				
	
	/**
	 * 设置：教练姓�?
	 */
	 
	public void setJiaolianxingming(String jiaolianxingming) {
		this.jiaolianxingming = jiaolianxingming;
	}
	
	/**
	 * 获取：教练姓�?
	 */
	public String getJiaolianxingming() {
		return jiaolianxingming;
	}
				
	
	/**
	 * 设置：照�?
	 */
	 
	public void setZhaopian(String zhaopian) {
		this.zhaopian = zhaopian;
	}
	
	/**
	 * 获取：照�?
	 */
	public String getZhaopian() {
		return zhaopian;
	}
				
	
	/**
	 * 设置：性别
	 */
	 
	public void setXingbie(String xingbie) {
		this.xingbie = xingbie;
	}
	
	/**
	 * 获取：性别
	 */
	public String getXingbie() {
		return xingbie;
	}
				
	
	/**
	 * 设置：年�?
	 */
	 
	public void setNianling(String nianling) {
		this.nianling = nianling;
	}
	
	/**
	 * 获取：年�?
	 */
	public String getNianling() {
		return nianling;
	}
				
	
	/**
	 * 设置：身�?
	 */
	 
	public void setShengao(String shengao) {
		this.shengao = shengao;
	}
	
	/**
	 * 获取：身�?
	 */
	public String getShengao() {
		return shengao;
	}
				
	
	/**
	 * 设置：体�?
	 */
	 
	public void setTizhong(String tizhong) {
		this.tizhong = tizhong;
	}
	
	/**
	 * 获取：体�?
	 */
	public String getTizhong() {
		return tizhong;
	}
				
	
	/**
	 * 设置：联系电�?
	 */
	 
	public void setLianxidianhua(String lianxidianhua) {
		this.lianxidianhua = lianxidianhua;
	}
	
	/**
	 * 获取：联系电�?
	 */
	public String getLianxidianhua() {
		return lianxidianhua;
	}
				
	
	/**
	 * 设置：私教价�?�?
	 */
	 
	public void setSijiaojiage(Double sijiaojiage) {
		this.sijiaojiage = sijiaojiage;
	}
	
	/**
	 * 获取：私教价�?�?
	 */
	public Double getSijiaojiage() {
		return sijiaojiage;
	}
				
	
	/**
	 * 设置：个人简�?
	 */
	 
	public void setGerenjianjie(String gerenjianjie) {
		this.gerenjianjie = gerenjianjie;
	}
	
	/**
	 * 获取：个人简�?
	 */
	public String getGerenjianjie() {
		return gerenjianjie;
	}
			
}
