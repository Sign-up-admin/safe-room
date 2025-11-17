package com.service;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.extension.service.IService;
import com.utils.PageUtils;
import com.entity.MessageEntity;
import java.util.List;
import java.util.Map;
import com.entity.vo.MessageVO;
import org.apache.ibatis.annotations.Param;
import com.entity.view.MessageView;

/**
 * 站内消息
 *
 * @author
 * @email
 * @date 2025-11-15 11:00:00
 */
public interface MessageService extends IService<MessageEntity> {

    PageUtils queryPage(Map<String, Object> params);

   	List<MessageVO> selectListVO(Wrapper<MessageEntity> wrapper);

   	MessageVO selectVO(@Param("ew") Wrapper<MessageEntity> wrapper);

   	List<MessageView> selectListView(Wrapper<MessageEntity> wrapper);

   	MessageView selectView(@Param("ew") Wrapper<MessageEntity> wrapper);

   	PageUtils queryPage(Map<String, Object> params,Wrapper<MessageEntity> wrapper);
}
