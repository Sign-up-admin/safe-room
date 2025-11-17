package com.service.impl;

import org.springframework.stereotype.Service;
import java.util.Map;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.utils.PageUtils;
import com.utils.Query;

import com.dao.LegalTermsDao;
import com.entity.LegalTermsEntity;
import com.service.LegalTermsService;

@Service("legalTermsService")
public class LegalTermsServiceImpl extends ServiceImpl<LegalTermsDao, LegalTermsEntity> implements LegalTermsService {
	
    @Override
    public PageUtils queryPage(Map<String, Object> params) {
        Page<LegalTermsEntity> page = this.page(
                new Query<LegalTermsEntity>(params).getPage(),
                new QueryWrapper<LegalTermsEntity>()
        );
        return new PageUtils(page);
    }
    
    @Override
	public PageUtils queryPage(Map<String, Object> params, Wrapper<LegalTermsEntity> wrapper) {
		Page<LegalTermsEntity> page = new Query<LegalTermsEntity>(params).getPage();
        page.setRecords(baseMapper.selectList(wrapper));
    	PageUtils pageUtil = new PageUtils(page);
    	return pageUtil;
 	}
}

