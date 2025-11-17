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


import com.dao.JianshenkechengDao;
import com.entity.JianshenkechengEntity;
import com.service.JianshenkechengService;
import com.entity.vo.JianshenkechengVO;
import com.entity.view.JianshenkechengView;

@Service("jianshenkechengService")
public class JianshenkechengServiceImpl extends ServiceImpl<JianshenkechengDao, JianshenkechengEntity> implements JianshenkechengService {
	
	
    @Override
    public PageUtils queryPage(Map<String, Object> params) {
        Page<JianshenkechengEntity> page = this.page(
                new Query<JianshenkechengEntity>(params).getPage(),
                new QueryWrapper<JianshenkechengEntity>()
        );
        return new PageUtils(page);
    }
    
    @Override
	public PageUtils queryPage(Map<String, Object> params, Wrapper<JianshenkechengEntity> wrapper) {
		  Page<JianshenkechengView> page =new Query<JianshenkechengView>(params).getPage();
	        page.setRecords(baseMapper.selectListView(page,wrapper));
	    	PageUtils pageUtil = new PageUtils(page);
	    	return pageUtil;
 	}

    
    @Override
	public List<JianshenkechengVO> selectListVO(Wrapper<JianshenkechengEntity> wrapper) {
 		return baseMapper.selectListVO(wrapper);
	}
	
	@Override
	public JianshenkechengVO selectVO(Wrapper<JianshenkechengEntity> wrapper) {
 		return baseMapper.selectVO(wrapper);
	}
	
	@Override
	public List<JianshenkechengView> selectListView(Wrapper<JianshenkechengEntity> wrapper) {
		return baseMapper.selectListView(wrapper);
	}

	@Override
	public JianshenkechengView selectView(Wrapper<JianshenkechengEntity> wrapper) {
		if(wrapper == null) {
			return null;
		}
		return baseMapper.selectView(wrapper);
	}

    @Override
    public List<Map<String, Object>> selectValue(Map<String, Object> params, Wrapper<JianshenkechengEntity> wrapper) {
        if(params == null || params.get("xColumn") == null || params.get("yColumn") == null) {
            return java.util.Collections.emptyList();
        }
        return baseMapper.selectValue(params, wrapper);
    }

    @Override
    public List<Map<String, Object>> selectTimeStatValue(Map<String, Object> params, Wrapper<JianshenkechengEntity> wrapper) {
        if(params == null || params.get("xColumn") == null || params.get("yColumn") == null || params.get("timeStatType") == null) {
            return java.util.Collections.emptyList();
        }
        return baseMapper.selectTimeStatValue(params, wrapper);
    }

    @Override
    public List<Map<String, Object>> selectGroup(Map<String, Object> params, Wrapper<JianshenkechengEntity> wrapper) {
        if(params == null || params.get("column") == null) {
            return java.util.Collections.emptyList();
        }
        return baseMapper.selectGroup(params, wrapper);
    }




}
