package com.dao;

import com.entity.MessageEntity;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import java.util.List;
import java.util.Map;
import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;

import org.apache.ibatis.annotations.Param;
import com.entity.vo.MessageVO;
import com.entity.view.MessageView;

/**
 * 站内消息
 * 数据层
 * @author
 * @email
 * @date 2025-11-15 11:00:00
 */
public interface MessageDao extends BaseMapper<MessageEntity> {

	List<MessageVO> selectListVO(@Param("ew") Wrapper<MessageEntity> wrapper);

	MessageVO selectVO(@Param("ew") Wrapper<MessageEntity> wrapper);

	List<MessageView> selectListView(@Param("ew") Wrapper<MessageEntity> wrapper);

	List<MessageView> selectListView(Page<MessageView> page,@Param("ew") Wrapper<MessageEntity> wrapper);

	MessageView selectView(@Param("ew") Wrapper<MessageEntity> wrapper);

}
