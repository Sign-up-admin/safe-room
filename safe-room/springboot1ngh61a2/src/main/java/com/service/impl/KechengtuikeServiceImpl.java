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


import com.dao.KechengtuikeDao;
import com.entity.KechengtuikeEntity;
import com.service.KechengtuikeService;
import com.entity.vo.KechengtuikeVO;
import com.entity.view.KechengtuikeView;

@Service("kechengtuikeService")
public class KechengtuikeServiceImpl extends ServiceImpl<KechengtuikeDao, KechengtuikeEntity> implements KechengtuikeService {
	
	
    @Override
    public PageUtils queryPage(Map<String, Object> params) {
        Page<KechengtuikeEntity> page = this.page(
                new Query<KechengtuikeEntity>(params).getPage(),
                new QueryWrapper<KechengtuikeEntity>()
        );
        return new PageUtils(page);
    }
    
    @Override
	public PageUtils queryPage(Map<String, Object> params, Wrapper<KechengtuikeEntity> wrapper) {
		  Page<KechengtuikeView> page =new Query<KechengtuikeView>(params).getPage();
	        page.setRecords(baseMapper.selectListView(page,wrapper));
	    	PageUtils pageUtil = new PageUtils(page);
	    	return pageUtil;
 	}

    
    @Override
	public List<KechengtuikeVO> selectListVO(Wrapper<KechengtuikeEntity> wrapper) {
 		return baseMapper.selectListVO(wrapper);
	}
	
	@Override
	public KechengtuikeVO selectVO(Wrapper<KechengtuikeEntity> wrapper) {
 		return baseMapper.selectVO(wrapper);
	}
	
	@Override
	public List<KechengtuikeView> selectListView(Wrapper<KechengtuikeEntity> wrapper) {
		return baseMapper.selectListView(wrapper);
	}

	@Override
	public KechengtuikeView selectView(Wrapper<KechengtuikeEntity> wrapper) {
		return baseMapper.selectView(wrapper);
	}

    @Override
    public List<Map<String, Object>> selectValue(Map<String, Object> params, Wrapper<KechengtuikeEntity> wrapper) {
        return baseMapper.selectValue(params, wrapper);
    }

    @Override
    public List<Map<String, Object>> selectTimeStatValue(Map<String, Object> params, Wrapper<KechengtuikeEntity> wrapper) {
        return baseMapper.selectTimeStatValue(params, wrapper);
    }

    @Override
    public List<Map<String, Object>> selectGroup(Map<String, Object> params, Wrapper<KechengtuikeEntity> wrapper) {
        return baseMapper.selectGroup(params, wrapper);
    }




}
