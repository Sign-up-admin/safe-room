package com.entity.view;

import com.entity.HuiyuanxufeiEntity;

import com.baomidou.mybatisplus.annotation.TableName;
import org.apache.commons.beanutils.BeanUtils;
import java.lang.reflect.InvocationTargetException;
import java.math.BigDecimal;

import java.io.Serializable;
import com.utils.EncryptUtil;
 

/**
 * 会员续费
 * 后端返回视图实体辅助类  
 * （通常后端关联的表或者自定义的字段需要返回使用）
 * @author 
 * @email 
 * @date 2024-06-20 10:35:10
 */
@TableName("huiyuanxufei")
public class HuiyuanxufeiView  extends HuiyuanxufeiEntity implements Serializable {
	private static final long serialVersionUID = 1L;

	public HuiyuanxufeiView(){
	}
 
 	public HuiyuanxufeiView(HuiyuanxufeiEntity huiyuanxufeiEntity){
 	try {
			BeanUtils.copyProperties(this, huiyuanxufeiEntity);
		} catch (IllegalAccessException | InvocationTargetException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
	}


}
