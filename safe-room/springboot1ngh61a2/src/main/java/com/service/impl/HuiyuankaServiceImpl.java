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


import com.dao.HuiyuankaDao;
import com.entity.HuiyuankaEntity;
import com.service.HuiyuankaService;
import com.entity.vo.HuiyuankaVO;
import com.entity.view.HuiyuankaView;

@Service("huiyuankaService")
public class HuiyuankaServiceImpl extends ServiceImpl<HuiyuankaDao, HuiyuankaEntity> implements HuiyuankaService {
	
	
    @Override
    public PageUtils queryPage(Map<String, Object> params) {
        Page<HuiyuankaEntity> page = this.page(
                new Query<HuiyuankaEntity>(params).getPage(),
                new QueryWrapper<HuiyuankaEntity>()
        );
        return new PageUtils(page);
    }
    
    @Override
	public PageUtils queryPage(Map<String, Object> params, Wrapper<HuiyuankaEntity> wrapper) {
		  Page<HuiyuankaView> page =new Query<HuiyuankaView>(params).getPage();
	        page.setRecords(baseMapper.selectListView(page,wrapper));
	    	PageUtils pageUtil = new PageUtils(page);
	    	return pageUtil;
 	}

    
    @Override
	public List<HuiyuankaVO> selectListVO(Wrapper<HuiyuankaEntity> wrapper) {
 		return baseMapper.selectListVO(wrapper);
	}
	
	@Override
	public HuiyuankaVO selectVO(Wrapper<HuiyuankaEntity> wrapper) {
 		return baseMapper.selectVO(wrapper);
	}
	
	@Override
	public List<HuiyuankaView> selectListView(Wrapper<HuiyuankaEntity> wrapper) {
		return baseMapper.selectListView(wrapper);
	}

	@Override
	public HuiyuankaView selectView(Wrapper<HuiyuankaEntity> wrapper) {
		if(wrapper == null) {
			return null;
		}
		return baseMapper.selectView(wrapper);
	}


}
