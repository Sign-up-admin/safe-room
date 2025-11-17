package com.dao;

import com.entity.DiscussjianshenkechengEntity;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import java.util.List;
import java.util.Map;
import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;

import org.apache.ibatis.annotations.Param;

import com.entity.vo.DiscussjianshenkechengVO;

import com.entity.view.DiscussjianshenkechengView;


/**
 * Fitness Course Review
 *
 * @author 
 * @email 
 * @date 2024-06-20 10:35:10
 */
public interface DiscussjianshenkechengDao extends BaseMapper<DiscussjianshenkechengEntity> {
	
	List<DiscussjianshenkechengVO> selectListVO(@Param("ew") Wrapper<DiscussjianshenkechengEntity> wrapper);
	
	DiscussjianshenkechengVO selectVO(@Param("ew") Wrapper<DiscussjianshenkechengEntity> wrapper);
	
	List<DiscussjianshenkechengView> selectListView(@Param("ew") Wrapper<DiscussjianshenkechengEntity> wrapper);

	List<DiscussjianshenkechengView> selectListView(Page<?> page, @Param("ew") Wrapper<DiscussjianshenkechengEntity> wrapper);
	
	DiscussjianshenkechengView selectView(@Param("ew") Wrapper<DiscussjianshenkechengEntity> wrapper);
	
}
