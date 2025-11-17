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


import com.dao.HuiyuankagoumaiDao;
import com.entity.HuiyuankagoumaiEntity;
import com.service.HuiyuankagoumaiService;
import com.entity.vo.HuiyuankagoumaiVO;
import com.entity.view.HuiyuankagoumaiView;

@Service("huiyuankagoumaiService")
public class HuiyuankagoumaiServiceImpl extends ServiceImpl<HuiyuankagoumaiDao, HuiyuankagoumaiEntity> implements HuiyuankagoumaiService {
	
	
    @Override
    public PageUtils queryPage(Map<String, Object> params) {
        Page<HuiyuankagoumaiEntity> page = this.page(
                new Query<HuiyuankagoumaiEntity>(params).getPage(),
                new QueryWrapper<HuiyuankagoumaiEntity>()
        );
        return new PageUtils(page);
    }
    
    @Override
	public PageUtils queryPage(Map<String, Object> params, Wrapper<HuiyuankagoumaiEntity> wrapper) {
		  Page<HuiyuankagoumaiView> page =new Query<HuiyuankagoumaiView>(params).getPage();
	        page.setRecords(baseMapper.selectListView(page,wrapper));
	    	PageUtils pageUtil = new PageUtils(page);
	    	return pageUtil;
 	}

    
    @Override
	public List<HuiyuankagoumaiVO> selectListVO(Wrapper<HuiyuankagoumaiEntity> wrapper) {
 		return baseMapper.selectListVO(wrapper);
	}
	
	@Override
	public HuiyuankagoumaiVO selectVO(Wrapper<HuiyuankagoumaiEntity> wrapper) {
 		return baseMapper.selectVO(wrapper);
	}
	
	@Override
	public List<HuiyuankagoumaiView> selectListView(Wrapper<HuiyuankagoumaiEntity> wrapper) {
		return baseMapper.selectListView(wrapper);
	}

	@Override
	public HuiyuankagoumaiView selectView(Wrapper<HuiyuankagoumaiEntity> wrapper) {
		return baseMapper.selectView(wrapper);
	}

    @Override
    public List<Map<String, Object>> selectValue(Map<String, Object> params, Wrapper<HuiyuankagoumaiEntity> wrapper) {
        if(params == null || params.get("xColumn") == null || params.get("yColumn") == null) {
            return java.util.Collections.emptyList();
        }
        return baseMapper.selectValue(params, wrapper);
    }

    @Override
    public List<Map<String, Object>> selectTimeStatValue(Map<String, Object> params, Wrapper<HuiyuankagoumaiEntity> wrapper) {
        if(params == null || params.get("xColumn") == null || params.get("yColumn") == null || params.get("timeStatType") == null) {
            return java.util.Collections.emptyList();
        }
        return baseMapper.selectTimeStatValue(params, wrapper);
    }

    @Override
    public List<Map<String, Object>> selectGroup(Map<String, Object> params, Wrapper<HuiyuankagoumaiEntity> wrapper) {
        if(params == null || params.get("column") == null) {
            return java.util.Collections.emptyList();
        }
        return baseMapper.selectGroup(params, wrapper);
    }




}
