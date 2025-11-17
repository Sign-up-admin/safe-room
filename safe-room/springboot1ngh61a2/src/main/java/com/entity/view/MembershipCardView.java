package com.entity.view;

import com.entity.MembershipCardEntity;

import com.baomidou.mybatisplus.annotation.TableName;
import org.apache.commons.beanutils.BeanUtils;
import java.lang.reflect.InvocationTargetException;
import java.math.BigDecimal;

import java.io.Serializable;
import com.utils.EncryptUtil;
 

/**
 * Membership Card
 * 后端返回视图实体辅助类  
 * （通常后端关联的表或者自定义的字段需要返回使用）
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
@TableName("membership_card")
public class MembershipCardView  extends MembershipCardEntity implements Serializable {
	private static final long serialVersionUID = 1L;

	public MembershipCardView(){
	}
 
 	public MembershipCardView(MembershipCardEntity membershipCardEntity){
 	try {
			BeanUtils.copyProperties(this, membershipCardEntity);
		} catch (IllegalAccessException | InvocationTargetException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
 		
	}


}

