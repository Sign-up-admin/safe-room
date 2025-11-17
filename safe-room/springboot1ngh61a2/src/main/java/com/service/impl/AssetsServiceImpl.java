package com.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dao.AssetsDao;
import com.entity.AssetsEntity;
import com.service.AssetsService;
import com.utils.PageUtils;
import com.utils.Query;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service("assetsService")
public class AssetsServiceImpl extends ServiceImpl<AssetsDao, AssetsEntity> implements AssetsService {

    @Override
    public PageUtils queryPage(Map<String, Object> params) {
        Page<AssetsEntity> page = this.page(
                new Query<AssetsEntity>(params).getPage(),
                buildWrapper(params)
        );
        return new PageUtils(page);
    }

    @Override
    public PageUtils queryPage(Map<String, Object> params, Wrapper<AssetsEntity> wrapper) {
        Page<AssetsEntity> page = this.page(
                new Query<AssetsEntity>(params).getPage(),
                wrapper
        );
        return new PageUtils(page);
    }

    /**
     * Build default filtering wrapper that supports common query params.
     */
    private Wrapper<AssetsEntity> buildWrapper(Map<String, Object> params) {
        QueryWrapper<AssetsEntity> wrapper = new QueryWrapper<>();
        if (params == null) {
            wrapper.orderByDesc("updatetime").orderByDesc("addtime");
            return wrapper;
        }
        Object type = params.get("assetType");
        if (type != null && StringUtils.isNotBlank(type.toString())) {
            wrapper.eq("asset_type", type);
        }
        Object module = params.get("module");
        if (module != null && StringUtils.isNotBlank(module.toString())) {
            wrapper.eq("module", module);
        }
        Object usage = params.get("usage");
        if (usage != null && StringUtils.isNotBlank(usage.toString())) {
            wrapper.eq("usage", usage);
        }
        Object status = params.get("status");
        if (status != null && StringUtils.isNotBlank(status.toString())) {
            wrapper.eq("status", status);
        }
        Object keyword = params.get("keyword");
        if (keyword != null && StringUtils.isNotBlank(keyword.toString())) {
            String like = "%" + keyword.toString().trim() + "%";
            wrapper.and(w -> w.like("asset_name", like).or().like("tags", like));
        }
        Object startDate = params.get("startDate");
        if (startDate != null && StringUtils.isNotBlank(startDate.toString())) {
            String startDateStr = startDate.toString().trim();
            if (!startDateStr.contains(" ")) {
                startDateStr = startDateStr + " 00:00:00";
            }
            // Use CAST to ensure proper type conversion for PostgreSQL
            wrapper.apply("addtime >= CAST({0} AS TIMESTAMP)", startDateStr);
        }
        Object endDate = params.get("endDate");
        if (endDate != null && StringUtils.isNotBlank(endDate.toString())) {
            String endDateStr = endDate.toString().trim();
            if (!endDateStr.contains(" ")) {
                endDateStr = endDateStr + " 23:59:59";
            }
            // Use CAST to ensure proper type conversion for PostgreSQL
            wrapper.apply("addtime <= CAST({0} AS TIMESTAMP)", endDateStr);
        }
        wrapper.orderByDesc("updatetime").orderByDesc("addtime");
        return wrapper;
    }
}

