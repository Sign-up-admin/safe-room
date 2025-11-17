package com.dao;


import com.entity.KechengtuikeEntity;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import java.util.List;
import java.util.Map;
import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;

import org.apache.ibatis.annotations.Param;

import com.entity.vo.KechengtuikeVO;

import com.entity.view.KechengtuikeView;


/**
 * Course Withdrawal
 *
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
public interface KechengtuikeDao extends BaseMapper<KechengtuikeEntity> {
	
	List<KechengtuikeVO> selectListVO(@Param("ew") Wrapper<KechengtuikeEntity> wrapper);
	
	KechengtuikeVO selectVO(@Param("ew") Wrapper<KechengtuikeEntity> wrapper);
	
	List<KechengtuikeView> selectListView(@Param("ew") Wrapper<KechengtuikeEntity> wrapper);

	List<KechengtuikeView> selectListView(Page<?> page, @Param("ew") Wrapper<KechengtuikeEntity> wrapper);
	
	KechengtuikeView selectView(@Param("ew") Wrapper<KechengtuikeEntity> wrapper);
	
	List<Map<String, Object>> selectValue(@Param("params") Map<String, Object> params, @Param("ew") Wrapper<KechengtuikeEntity> wrapper);

	List<Map<String, Object>> selectTimeStatValue(@Param("params") Map<String, Object> params, @Param("ew") Wrapper<KechengtuikeEntity> wrapper);

	List<Map<String, Object>> selectGroup(@Param("params") Map<String, Object> params, @Param("ew") Wrapper<KechengtuikeEntity> wrapper);
	
}
