package com.entity.view;

import com.entity.ChatEntity;

import com.baomidou.mybatisplus.annotation.TableName;
import org.apache.commons.beanutils.BeanUtils;
import java.lang.reflect.InvocationTargetException;
import java.math.BigDecimal;

import java.io.Serializable;
import com.utils.EncryptUtil;
 

/**
 * 留言反馈
 * 后端返视图实体辅助类  
 * （通常后端关联的表或者自定义的字段需要返使用）
 * @author 
 * @email 
 * @date 2024-06-20 10:35:10
 */
@TableName("chat")
public class ChatView  extends ChatEntity implements Serializable {
	private static final long serialVersionUID = 1L;

	public ChatView(){
	}
 
 	public ChatView(ChatEntity chatEntity){
 	try {
			BeanUtils.copyProperties(this, chatEntity);
		} catch (IllegalAccessException | InvocationTargetException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
 		
	}


}
