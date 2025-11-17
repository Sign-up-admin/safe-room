package com.dao;

import com.entity.DaoqitixingEntity;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import java.util.List;
import java.util.Map;
import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;

import org.apache.ibatis.annotations.Param;
import com.entity.vo.DaoqitixingVO;
import com.entity.view.DaoqitixingView;


/**
 * Expiration Reminder
 * 
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
public interface DaoqitixingDao extends BaseMapper<DaoqitixingEntity> {
	
	List<DaoqitixingVO> selectListVO(@Param("ew") Wrapper<DaoqitixingEntity> wrapper);
	
	DaoqitixingVO selectVO(@Param("ew") Wrapper<DaoqitixingEntity> wrapper);
	
	List<DaoqitixingView> selectListView(@Param("ew") Wrapper<DaoqitixingEntity> wrapper);

	List<DaoqitixingView> selectListView(Page page,@Param("ew") Wrapper<DaoqitixingEntity> wrapper);

	
	DaoqitixingView selectView(@Param("ew") Wrapper<DaoqitixingEntity> wrapper);
	

}
