package com.dao;

import com.entity.HuiyuanxufeiEntity;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import java.util.List;
import java.util.Map;
import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;

import org.apache.ibatis.annotations.Param;
import com.entity.vo.HuiyuanxufeiVO;
import com.entity.view.HuiyuanxufeiView;


/**
 * Membership Renewal
 * 
 * @author 
 * @email 
 * @date 2024-06-20 10:35:10
 */
public interface HuiyuanxufeiDao extends BaseMapper<HuiyuanxufeiEntity> {
	
	List<HuiyuanxufeiVO> selectListVO(@Param("ew") Wrapper<HuiyuanxufeiEntity> wrapper);
	
	HuiyuanxufeiVO selectVO(@Param("ew") Wrapper<HuiyuanxufeiEntity> wrapper);
	
	List<HuiyuanxufeiView> selectListView(@Param("ew") Wrapper<HuiyuanxufeiEntity> wrapper);

	List<HuiyuanxufeiView> selectListView(Page page,@Param("ew") Wrapper<HuiyuanxufeiEntity> wrapper);

	
	HuiyuanxufeiView selectView(@Param("ew") Wrapper<HuiyuanxufeiEntity> wrapper);
	

    List<Map<String, Object>> selectValue(@Param("params") Map<String, Object> params,@Param("ew") Wrapper<HuiyuanxufeiEntity> wrapper);

    List<Map<String, Object>> selectTimeStatValue(@Param("params") Map<String, Object> params,@Param("ew") Wrapper<HuiyuanxufeiEntity> wrapper);

    List<Map<String, Object>> selectGroup(@Param("params") Map<String, Object> params,@Param("ew") Wrapper<HuiyuanxufeiEntity> wrapper);



}
