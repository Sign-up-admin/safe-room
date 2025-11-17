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


import com.dao.SijiaoyuyueDao;
import com.entity.SijiaoyuyueEntity;
import com.service.SijiaoyuyueService;
import com.entity.vo.SijiaoyuyueVO;
import com.entity.view.SijiaoyuyueView;

@Service("sijiaoyuyueService")
public class SijiaoyuyueServiceImpl extends ServiceImpl<SijiaoyuyueDao, SijiaoyuyueEntity> implements SijiaoyuyueService {
	
	
    @Override
    public PageUtils queryPage(Map<String, Object> params) {
        Page<SijiaoyuyueEntity> page = this.page(
                new Query<SijiaoyuyueEntity>(params).getPage(),
                new QueryWrapper<SijiaoyuyueEntity>()
        );
        return new PageUtils(page);
    }
    
    @Override
	public PageUtils queryPage(Map<String, Object> params, Wrapper<SijiaoyuyueEntity> wrapper) {
		  Page<SijiaoyuyueView> page =new Query<SijiaoyuyueView>(params).getPage();
	        page.setRecords(baseMapper.selectListView(page,wrapper));
	    	PageUtils pageUtil = new PageUtils(page);
	    	return pageUtil;
 	}

    
    @Override
	public List<SijiaoyuyueVO> selectListVO(Wrapper<SijiaoyuyueEntity> wrapper) {
 		return baseMapper.selectListVO(wrapper);
	}
	
	@Override
	public SijiaoyuyueVO selectVO(Wrapper<SijiaoyuyueEntity> wrapper) {
 		return baseMapper.selectVO(wrapper);
	}
	
	@Override
	public List<SijiaoyuyueView> selectListView(Wrapper<SijiaoyuyueEntity> wrapper) {
		return baseMapper.selectListView(wrapper);
	}

	@Override
	public SijiaoyuyueView selectView(Wrapper<SijiaoyuyueEntity> wrapper) {
		return baseMapper.selectView(wrapper);
	}

    @Override
    public List<Map<String, Object>> selectValue(Map<String, Object> params, Wrapper<SijiaoyuyueEntity> wrapper) {
        return baseMapper.selectValue(params, wrapper);
    }

    @Override
    public List<Map<String, Object>> selectTimeStatValue(Map<String, Object> params, Wrapper<SijiaoyuyueEntity> wrapper) {
        return baseMapper.selectTimeStatValue(params, wrapper);
    }

    @Override
    public List<Map<String, Object>> selectGroup(Map<String, Object> params, Wrapper<SijiaoyuyueEntity> wrapper) {
        return baseMapper.selectGroup(params, wrapper);
    }



}
