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


import com.dao.MembershipCardDao;
import com.entity.MembershipCardEntity;
import com.service.MembershipCardService;
import com.entity.vo.MembershipCardVO;
import com.entity.view.MembershipCardView;

@Service("membershipCardService")
public class MembershipCardServiceImpl extends ServiceImpl<MembershipCardDao, MembershipCardEntity> implements MembershipCardService {
	
	
    @Override
    public PageUtils queryPage(Map<String, Object> params) {
        Page<MembershipCardEntity> page = this.page(
                new Query<MembershipCardEntity>(params).getPage(),
                new QueryWrapper<MembershipCardEntity>()
        );
        return new PageUtils(page);
    }
    
    @Override
	public PageUtils queryPage(Map<String, Object> params, Wrapper<MembershipCardEntity> wrapper) {
		  Page<MembershipCardView> page =new Query<MembershipCardView>(params).getPage();
	        page.setRecords(baseMapper.selectListView(page,wrapper));
	    	PageUtils pageUtil = new PageUtils(page);
	    	return pageUtil;
	}

    
    @Override
	public List<MembershipCardVO> selectListVO(Wrapper<MembershipCardEntity> wrapper) {
		return baseMapper.selectListVO(wrapper);
	}
	
	@Override
	public MembershipCardVO selectVO(Wrapper<MembershipCardEntity> wrapper) {
		return baseMapper.selectVO(wrapper);
	}
	
	@Override
	public List<MembershipCardView> selectListView(Wrapper<MembershipCardEntity> wrapper) {
		return baseMapper.selectListView(wrapper);
	}

	@Override
	public MembershipCardView selectView(Wrapper<MembershipCardEntity> wrapper) {
		return baseMapper.selectView(wrapper);
	}


}

