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


import com.dao.KechengyuyueDao;
import com.entity.KechengyuyueEntity;
import com.service.KechengyuyueService;
import com.entity.vo.KechengyuyueVO;
import com.entity.view.KechengyuyueView;

@Service("kechengyuyueService")
public class KechengyuyueServiceImpl extends ServiceImpl<KechengyuyueDao, KechengyuyueEntity> implements KechengyuyueService {
	
	
    @Override
    public PageUtils queryPage(Map<String, Object> params) {
        Page<KechengyuyueEntity> page = this.page(
                new Query<KechengyuyueEntity>(params).getPage(),
                new QueryWrapper<KechengyuyueEntity>()
        );
        return new PageUtils(page);
    }
    
    @Override
	public PageUtils queryPage(Map<String, Object> params, Wrapper<KechengyuyueEntity> wrapper) {
		  Page<KechengyuyueView> page =new Query<KechengyuyueView>(params).getPage();
	        page.setRecords(baseMapper.selectListView(page,wrapper));
	    	PageUtils pageUtil = new PageUtils(page);
	    	return pageUtil;
 	}

    
    @Override
	public List<KechengyuyueVO> selectListVO(Wrapper<KechengyuyueEntity> wrapper) {
 		return baseMapper.selectListVO(wrapper);
	}
	
	@Override
	public KechengyuyueVO selectVO(Wrapper<KechengyuyueEntity> wrapper) {
 		return baseMapper.selectVO(wrapper);
	}
	
	@Override
	public List<KechengyuyueView> selectListView(Wrapper<KechengyuyueEntity> wrapper) {
		return baseMapper.selectListView(wrapper);
	}

	@Override
	public KechengyuyueView selectView(Wrapper<KechengyuyueEntity> wrapper) {
		if(wrapper == null) {
			return null;
		}
		return baseMapper.selectView(wrapper);
	}

    @Override
    public List<Map<String, Object>> selectValue(Map<String, Object> params, Wrapper<KechengyuyueEntity> wrapper) {
        if(params == null || params.get("xColumn") == null || params.get("yColumn") == null) {
            return java.util.Collections.emptyList();
        }
        return baseMapper.selectValue(params, wrapper);
    }

    @Override
    public List<Map<String, Object>> selectTimeStatValue(Map<String, Object> params, Wrapper<KechengyuyueEntity> wrapper) {
        if(params == null || params.get("xColumn") == null || params.get("yColumn") == null || params.get("timeStatType") == null) {
            return java.util.Collections.emptyList();
        }
        return baseMapper.selectTimeStatValue(params, wrapper);
    }

    @Override
    public List<Map<String, Object>> selectGroup(Map<String, Object> params, Wrapper<KechengyuyueEntity> wrapper) {
        if(params == null || params.get("column") == null) {
            return java.util.Collections.emptyList();
        }
        return baseMapper.selectGroup(params, wrapper);
    }




}
