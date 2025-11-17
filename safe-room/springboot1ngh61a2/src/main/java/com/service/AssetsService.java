package com.service;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.extension.service.IService;
import com.entity.AssetsEntity;
import com.utils.PageUtils;

import java.util.Map;

/**
 * Assets service
 */
public interface AssetsService extends IService<AssetsEntity> {

    /**
     * Query paginated assets with default wrapper.
     */
    PageUtils queryPage(Map<String, Object> params);

    /**
     * Query paginated assets with custom wrapper for advanced filtering.
     */
    PageUtils queryPage(Map<String, Object> params, Wrapper<AssetsEntity> wrapper);
}








