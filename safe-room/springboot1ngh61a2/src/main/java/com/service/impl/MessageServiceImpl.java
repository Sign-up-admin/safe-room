package com.service.impl;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.List;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.utils.PageUtils;
import com.utils.Query;

import com.dao.MessageDao;
import com.entity.MessageEntity;
import com.service.MessageService;
import com.entity.vo.MessageVO;
import com.entity.view.MessageView;

@Service("messageService")
public class MessageServiceImpl extends ServiceImpl<MessageDao, MessageEntity> implements MessageService {

    @Override
    public PageUtils queryPage(Map<String, Object> params) {
        Page<MessageEntity> page = this.page(
                new Query<MessageEntity>(params).getPage(),
                new QueryWrapper<MessageEntity>()
        );
        return new PageUtils(page);
    }

    @Override
	public PageUtils queryPage(Map<String, Object> params, Wrapper<MessageEntity> wrapper) {
		  Page<MessageView> page =new Query<MessageView>(params).getPage();
	        page.setRecords(baseMapper.selectListView(page,wrapper));
	    	PageUtils pageUtil = new PageUtils(page);
	    	return pageUtil;
 	}

    @Override
	public List<MessageVO> selectListVO(Wrapper<MessageEntity> wrapper) {
 		return baseMapper.selectListVO(wrapper);
	}

	@Override
	public MessageVO selectVO(Wrapper<MessageEntity> wrapper) {
 		return baseMapper.selectVO(wrapper);
	}

	@Override
	public List<MessageView> selectListView(Wrapper<MessageEntity> wrapper) {
		return baseMapper.selectListView(wrapper);
	}

	@Override
	public MessageView selectView(Wrapper<MessageEntity> wrapper) {
		if(wrapper == null) {
			return null;
		}
		return baseMapper.selectView(wrapper);
	}
}
