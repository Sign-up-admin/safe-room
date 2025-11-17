package com.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.entity.OperationLogEntity;
import org.apache.ibatis.annotations.Mapper;

/**
 * 操作日志DAO
 */
@Mapper
public interface OperationLogDao extends BaseMapper<OperationLogEntity> {
	
}

