package com.entity.view;

import com.entity.HuiyuankaEntity;

import com.baomidou.mybatisplus.annotation.TableName;
import org.apache.commons.beanutils.BeanUtils;
import java.lang.reflect.InvocationTargetException;
import java.math.BigDecimal;

import java.io.Serializable;
import com.utils.EncryptUtil;
 

/**
 * 会员卡
 * 后端返回视图实体辅助类  
 * （通常后端关联的表或者自定义的字段需要返回使用）
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
@TableName("huiyuanka")
public class HuiyuankaView  extends HuiyuankaEntity implements Serializable {
	private static final long serialVersionUID = 1L;

	public HuiyuankaView(){
	}
 
 	public HuiyuankaView(HuiyuankaEntity huiyuankaEntity){
 	try {
			BeanUtils.copyProperties(this, huiyuankaEntity);
		} catch (IllegalAccessException | InvocationTargetException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
	}


}
