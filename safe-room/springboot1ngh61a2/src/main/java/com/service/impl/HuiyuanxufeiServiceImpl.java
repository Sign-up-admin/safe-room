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


import com.dao.HuiyuanxufeiDao;
import com.entity.HuiyuanxufeiEntity;
import com.service.HuiyuanxufeiService;
import com.entity.vo.HuiyuanxufeiVO;
import com.entity.view.HuiyuanxufeiView;

@Service("huiyuanxufeiService")
public class HuiyuanxufeiServiceImpl extends ServiceImpl<HuiyuanxufeiDao, HuiyuanxufeiEntity> implements HuiyuanxufeiService {
	
	
    @Override
    public PageUtils queryPage(Map<String, Object> params) {
        Page<HuiyuanxufeiEntity> page = this.page(
                new Query<HuiyuanxufeiEntity>(params).getPage(),
                new QueryWrapper<HuiyuanxufeiEntity>()
        );
        return new PageUtils(page);
    }
    
    @Override
	public PageUtils queryPage(Map<String, Object> params, Wrapper<HuiyuanxufeiEntity> wrapper) {
		  Page<HuiyuanxufeiView> page =new Query<HuiyuanxufeiView>(params).getPage();
	        page.setRecords(baseMapper.selectListView(page,wrapper));
	    	PageUtils pageUtil = new PageUtils(page);
	    	return pageUtil;
 	}

    
    @Override
	public List<HuiyuanxufeiVO> selectListVO(Wrapper<HuiyuanxufeiEntity> wrapper) {
 		return baseMapper.selectListVO(wrapper);
	}
	
	@Override
	public HuiyuanxufeiVO selectVO(Wrapper<HuiyuanxufeiEntity> wrapper) {
 		return baseMapper.selectVO(wrapper);
	}
	
	@Override
	public List<HuiyuanxufeiView> selectListView(Wrapper<HuiyuanxufeiEntity> wrapper) {
		return baseMapper.selectListView(wrapper);
	}

	@Override
	public HuiyuanxufeiView selectView(Wrapper<HuiyuanxufeiEntity> wrapper) {
		return baseMapper.selectView(wrapper);
	}

    @Override
    public List<Map<String, Object>> selectValue(Map<String, Object> params, Wrapper<HuiyuanxufeiEntity> wrapper) {
        if(params == null || params.get("xColumn") == null || params.get("yColumn") == null) {
            return java.util.Collections.emptyList();
        }
        return baseMapper.selectValue(params, wrapper);
    }

    @Override
    public List<Map<String, Object>> selectTimeStatValue(Map<String, Object> params, Wrapper<HuiyuanxufeiEntity> wrapper) {
        if(params == null || params.get("xColumn") == null || params.get("yColumn") == null || params.get("timeStatType") == null) {
            return java.util.Collections.emptyList();
        }
        return baseMapper.selectTimeStatValue(params, wrapper);
    }

    @Override
    public List<Map<String, Object>> selectGroup(Map<String, Object> params, Wrapper<HuiyuanxufeiEntity> wrapper) {
        if(params == null || params.get("column") == null) {
            return java.util.Collections.emptyList();
        }
        return baseMapper.selectGroup(params, wrapper);
    }




}
