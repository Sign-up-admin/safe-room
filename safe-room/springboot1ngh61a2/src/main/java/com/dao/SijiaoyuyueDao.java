package com.dao;

import com.entity.SijiaoyuyueEntity;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import java.util.List;
import java.util.Map;
import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;

import org.apache.ibatis.annotations.Param;
import com.entity.vo.SijiaoyuyueVO;
import com.entity.view.SijiaoyuyueView;


/**
 * Private Tutoring Appointment
 * 
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
public interface SijiaoyuyueDao extends BaseMapper<SijiaoyuyueEntity> {
	
	List<SijiaoyuyueVO> selectListVO(@Param("ew") Wrapper<SijiaoyuyueEntity> wrapper);
	
	SijiaoyuyueVO selectVO(@Param("ew") Wrapper<SijiaoyuyueEntity> wrapper);
	
	List<SijiaoyuyueView> selectListView(@Param("ew") Wrapper<SijiaoyuyueEntity> wrapper);

	List<SijiaoyuyueView> selectListView(Page page,@Param("ew") Wrapper<SijiaoyuyueEntity> wrapper);

	
	SijiaoyuyueView selectView(@Param("ew") Wrapper<SijiaoyuyueEntity> wrapper);
	
    List<Map<String, Object>> selectValue(@Param("params") Map<String, Object> params,@Param("ew") Wrapper<SijiaoyuyueEntity> wrapper);

    List<Map<String, Object>> selectTimeStatValue(@Param("params") Map<String, Object> params,@Param("ew") Wrapper<SijiaoyuyueEntity> wrapper);

    List<Map<String, Object>> selectGroup(@Param("params") Map<String, Object> params,@Param("ew") Wrapper<SijiaoyuyueEntity> wrapper);


}
