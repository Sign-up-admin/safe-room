package com.service;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.extension.service.IService;
import com.entity.OperationLogEntity;
import com.utils.PageUtils;

import java.util.Map;

/**
 * 操作日志服务接口
 */
public interface OperationLogService extends IService<OperationLogEntity> {
    
    /**
     * 记录操作日志
     * @param userId 用户ID
     * @param username 用户名
     * @param tableName 表名
     * @param operationType 操作类型
     * @param content 操作内容
     * @param ip IP地址
     * @param userAgent User-Agent
     */
    void logOperation(Long userId, String username, String tableName, String operationType, 
                     String content, String ip, String userAgent);
    
    /**
     * 分页查询
     */
    PageUtils queryPage(Map<String, Object> params, Wrapper<OperationLogEntity> wrapper);
}

