package com.dao;

import com.entity.KechengleixingEntity;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import java.util.List;
import java.util.Map;
import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;

import org.apache.ibatis.annotations.Param;
import com.entity.vo.KechengleixingVO;
import com.entity.view.KechengleixingView;


/**
 * Course Type
 * 
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
public interface KechengleixingDao extends BaseMapper<KechengleixingEntity> {
	
	List<KechengleixingVO> selectListVO(@Param("ew") Wrapper<KechengleixingEntity> wrapper);
	
	KechengleixingVO selectVO(@Param("ew") Wrapper<KechengleixingEntity> wrapper);
	
	List<KechengleixingView> selectListView(@Param("ew") Wrapper<KechengleixingEntity> wrapper);

	List<KechengleixingView> selectListView(Page page,@Param("ew") Wrapper<KechengleixingEntity> wrapper);

	
	KechengleixingView selectView(@Param("ew") Wrapper<KechengleixingEntity> wrapper);
	

}
