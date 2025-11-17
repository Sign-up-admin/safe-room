package com.entity.view;

import com.entity.MessageEntity;

import com.baomidou.mybatisplus.annotation.TableName;
import org.apache.commons.beanutils.BeanUtils;
import java.lang.reflect.InvocationTargetException;
import java.math.BigDecimal;

import java.io.Serializable;
import com.utils.EncryptUtil;

/**
 * 站内消息
 * 后端返回视图实体辅助类
 * （通常后端关联的表或者自定义的字段需要返回使用）
 * @author
 * @email
 * @date 2025-11-15 11:00:00
 */
@TableName("messages")
public class MessageView  extends MessageEntity implements Serializable {
	private static final long serialVersionUID = 1L;

	public MessageView(){
	}

	public MessageView(MessageEntity messageEntity){
		try {
			BeanUtils.copyProperties(this, messageEntity);
		} catch (IllegalAccessException | InvocationTargetException e) {
			e.printStackTrace();
		}
	}
}
