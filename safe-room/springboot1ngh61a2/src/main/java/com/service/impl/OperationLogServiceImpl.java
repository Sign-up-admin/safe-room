package com.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dao.OperationLogDao;
import com.entity.OperationLogEntity;
import com.service.OperationLogService;
import com.utils.PageUtils;
import com.utils.Query;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Map;

/**
 * 操作日志服务实现
 */
@Service("operationLogService")
public class OperationLogServiceImpl extends ServiceImpl<OperationLogDao, OperationLogEntity> implements OperationLogService {
    
    private static final Logger logger = LoggerFactory.getLogger(OperationLogServiceImpl.class);
    
    @Override
    public void logOperation(Long userId, String username, String tableName, String operationType, 
                            String content, String ip, String userAgent) {
        try {
            OperationLogEntity log = new OperationLogEntity();
            log.setUserid(userId);
            log.setUsername(username);
            log.setTableName(tableName);
            log.setOperationType(operationType);
            log.setContent(content);
            log.setIp(ip);
            log.setUserAgent(userAgent);
            log.setAddtime(new Date());
            this.save(log);
        } catch (Exception e) {
            // 日志记录失败不应影响业务逻辑
            // 记录错误日志以便排查问题
            logger.warn("记录操作日志失败，不影响业务: userId={}, username={}, operationType={}, error={}", 
                userId, username, operationType, e.getMessage(), e);
        }
    }
    
    @Override
    public PageUtils queryPage(Map<String, Object> params, Wrapper<OperationLogEntity> wrapper) {
        Page<OperationLogEntity> page = this.page(
                new Query<OperationLogEntity>(params).getPage(),
                wrapper
        );
        return new PageUtils(page);
    }
}

