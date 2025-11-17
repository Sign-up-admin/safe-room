package com.dao;

import com.entity.JianshenkechengEntity;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import java.util.List;
import java.util.Map;
import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;

import org.apache.ibatis.annotations.Param;
import com.entity.vo.JianshenkechengVO;
import com.entity.view.JianshenkechengView;


/**
 * Fitness Course
 * 
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
public interface JianshenkechengDao extends BaseMapper<JianshenkechengEntity> {
	
	List<JianshenkechengVO> selectListVO(@Param("ew") Wrapper<JianshenkechengEntity> wrapper);
	
	JianshenkechengVO selectVO(@Param("ew") Wrapper<JianshenkechengEntity> wrapper);
	
	List<JianshenkechengView> selectListView(@Param("ew") Wrapper<JianshenkechengEntity> wrapper);

	List<JianshenkechengView> selectListView(Page page,@Param("ew") Wrapper<JianshenkechengEntity> wrapper);

	
	JianshenkechengView selectView(@Param("ew") Wrapper<JianshenkechengEntity> wrapper);
	

    List<Map<String, Object>> selectValue(@Param("params") Map<String, Object> params,@Param("ew") Wrapper<JianshenkechengEntity> wrapper);

    List<Map<String, Object>> selectTimeStatValue(@Param("params") Map<String, Object> params,@Param("ew") Wrapper<JianshenkechengEntity> wrapper);

    List<Map<String, Object>> selectGroup(@Param("params") Map<String, Object> params,@Param("ew") Wrapper<JianshenkechengEntity> wrapper);



}
