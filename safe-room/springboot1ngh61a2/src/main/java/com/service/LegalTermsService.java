package com.service;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.extension.service.IService;
import com.utils.PageUtils;
import com.entity.LegalTermsEntity;
import java.util.List;
import java.util.Map;

/**
 * Legal Terms
 *
 * @author 
 * @email 
 * @date 2025-11-15
 */
public interface LegalTermsService extends IService<LegalTermsEntity> {

    PageUtils queryPage(Map<String, Object> params);
    
   	PageUtils queryPage(Map<String, Object> params, Wrapper<LegalTermsEntity> wrapper);
}

