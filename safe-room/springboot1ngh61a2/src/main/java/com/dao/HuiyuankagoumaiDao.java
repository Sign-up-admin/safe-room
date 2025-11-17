package com.dao;


import com.entity.HuiyuankagoumaiEntity;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import java.util.List;
import java.util.Map;
import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;

import org.apache.ibatis.annotations.Param;

import com.entity.vo.HuiyuankagoumaiVO;

import com.entity.view.HuiyuankagoumaiView;


/**
 * Membership Card Purchase
 *
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
public interface HuiyuankagoumaiDao extends BaseMapper<HuiyuankagoumaiEntity> {
	
	List<HuiyuankagoumaiVO> selectListVO(@Param("ew") Wrapper<HuiyuankagoumaiEntity> wrapper);
	
	HuiyuankagoumaiVO selectVO(@Param("ew") Wrapper<HuiyuankagoumaiEntity> wrapper);
	
	List<HuiyuankagoumaiView> selectListView(@Param("ew") Wrapper<HuiyuankagoumaiEntity> wrapper);

	List<HuiyuankagoumaiView> selectListView(Page<?> page, @Param("ew") Wrapper<HuiyuankagoumaiEntity> wrapper);
	
	HuiyuankagoumaiView selectView(@Param("ew") Wrapper<HuiyuankagoumaiEntity> wrapper);
	
	List<Map<String, Object>> selectValue(@Param("params") Map<String, Object> params, @Param("ew") Wrapper<HuiyuankagoumaiEntity> wrapper);

	List<Map<String, Object>> selectTimeStatValue(@Param("params") Map<String, Object> params, @Param("ew") Wrapper<HuiyuankagoumaiEntity> wrapper);

	List<Map<String, Object>> selectGroup(@Param("params") Map<String, Object> params, @Param("ew") Wrapper<HuiyuankagoumaiEntity> wrapper);
	
}
