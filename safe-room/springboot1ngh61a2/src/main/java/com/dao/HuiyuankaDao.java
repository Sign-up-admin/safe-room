package com.dao;


import com.entity.HuiyuankaEntity;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import java.util.List;
import java.util.Map;
import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;

import org.apache.ibatis.annotations.Param;

import com.entity.vo.HuiyuankaVO;

import com.entity.view.HuiyuankaView;


/**
 * Membership Card
 *
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
public interface HuiyuankaDao extends BaseMapper<HuiyuankaEntity> {
	
	List<HuiyuankaVO> selectListVO(@Param("ew") Wrapper<HuiyuankaEntity> wrapper);
	
	HuiyuankaVO selectVO(@Param("ew") Wrapper<HuiyuankaEntity> wrapper);
	
	List<HuiyuankaView> selectListView(@Param("ew") Wrapper<HuiyuankaEntity> wrapper);

	List<HuiyuankaView> selectListView(Page<?> page, @Param("ew") Wrapper<HuiyuankaEntity> wrapper);
	
	HuiyuankaView selectView(@Param("ew") Wrapper<HuiyuankaEntity> wrapper);
	
}
