package com.dao;

import com.entity.JianshenqicaiEntity;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import java.util.List;
import java.util.Map;
import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;

import org.apache.ibatis.annotations.Param;
import com.entity.vo.JianshenqicaiVO;
import com.entity.view.JianshenqicaiView;


/**
 * Fitness Equipment
 * 
 * @author 
 * @email 
 * @date 2024-06-20 10:35:10
 */
public interface JianshenqicaiDao extends BaseMapper<JianshenqicaiEntity> {
	
	List<JianshenqicaiVO> selectListVO(@Param("ew") Wrapper<JianshenqicaiEntity> wrapper);
	
	JianshenqicaiVO selectVO(@Param("ew") Wrapper<JianshenqicaiEntity> wrapper);
	
	List<JianshenqicaiView> selectListView(@Param("ew") Wrapper<JianshenqicaiEntity> wrapper);

	List<JianshenqicaiView> selectListView(Page page,@Param("ew") Wrapper<JianshenqicaiEntity> wrapper);

	
	JianshenqicaiView selectView(@Param("ew") Wrapper<JianshenqicaiEntity> wrapper);
	

}
