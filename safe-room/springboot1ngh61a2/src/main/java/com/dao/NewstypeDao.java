package com.dao;

import com.entity.NewstypeEntity;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import java.util.List;
import java.util.Map;
import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;

import org.apache.ibatis.annotations.Param;
import com.entity.vo.NewstypeVO;
import com.entity.view.NewstypeView;


/**
 * Announcement Category
 * 
 * @author 
 * @email 
 * @date 2024-06-20 10:35:10
 */
public interface NewstypeDao extends BaseMapper<NewstypeEntity> {
	
	List<NewstypeVO> selectListVO(@Param("ew") Wrapper<NewstypeEntity> wrapper);
	
	NewstypeVO selectVO(@Param("ew") Wrapper<NewstypeEntity> wrapper);
	
	List<NewstypeView> selectListView(@Param("ew") Wrapper<NewstypeEntity> wrapper);

	List<NewstypeView> selectListView(Page page,@Param("ew") Wrapper<NewstypeEntity> wrapper);

	
	NewstypeView selectView(@Param("ew") Wrapper<NewstypeEntity> wrapper);
	

}
