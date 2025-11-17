package com.dao;

import com.entity.JianshenjiaolianEntity;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import java.util.List;
import java.util.Map;
import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;

import org.apache.ibatis.annotations.Param;
import com.entity.vo.JianshenjiaolianVO;
import com.entity.view.JianshenjiaolianView;


/**
 * Fitness Coach
 * 
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
public interface JianshenjiaolianDao extends BaseMapper<JianshenjiaolianEntity> {
	
	List<JianshenjiaolianVO> selectListVO(@Param("ew") Wrapper<JianshenjiaolianEntity> wrapper);
	
	JianshenjiaolianVO selectVO(@Param("ew") Wrapper<JianshenjiaolianEntity> wrapper);
	
	List<JianshenjiaolianView> selectListView(@Param("ew") Wrapper<JianshenjiaolianEntity> wrapper);

	List<JianshenjiaolianView> selectListView(Page page,@Param("ew") Wrapper<JianshenjiaolianEntity> wrapper);

	
	JianshenjiaolianView selectView(@Param("ew") Wrapper<JianshenjiaolianEntity> wrapper);
	

}
