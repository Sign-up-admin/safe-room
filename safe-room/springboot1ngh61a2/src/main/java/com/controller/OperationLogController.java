package com.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.entity.OperationLogEntity;
import com.service.OperationLogService;
import com.utils.MPUtil;
import com.utils.PageUtils;
import com.utils.R;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 操作日志控制器
 */
@RestController
@RequestMapping("/operationLog")
public class OperationLogController {
    
    @Autowired
    private OperationLogService operationLogService;
    
    /**
     * 列表查询
     */
    @RequestMapping("/page")
    public R page(@RequestParam Map<String, Object> params, OperationLogEntity operationLog) {
        QueryWrapper<OperationLogEntity> ew = new QueryWrapper<>();
        
        // 按用户名筛选
        if (StringUtils.isNotBlank(operationLog.getUsername())) {
            ew.like("username", operationLog.getUsername());
        }
        
        // 按操作类型筛选
        if (StringUtils.isNotBlank(operationLog.getOperationType())) {
            ew.eq("operation_type", operationLog.getOperationType());
        }
        
        // 按表名筛选
        if (StringUtils.isNotBlank(operationLog.getTableName())) {
            ew.eq("table_name", operationLog.getTableName());
        }
        
        // 按用户ID筛选
        if (operationLog.getUserid() != null) {
            ew.eq("userid", operationLog.getUserid());
        }
        
        PageUtils page = operationLogService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, operationLog), params), params));
        return R.ok().put("data", page);
    }
    
    /**
     * 详情
     */
    @RequestMapping("/info/{id}")
    public R info(@PathVariable("id") Long id) {
        OperationLogEntity operationLog = operationLogService.getById(id);
        return R.ok().put("data", operationLog);
    }
}

