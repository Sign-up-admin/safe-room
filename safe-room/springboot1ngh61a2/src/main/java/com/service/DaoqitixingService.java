package com.service;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.extension.service.IService;
import com.utils.PageUtils;
import com.entity.DaoqitixingEntity;
import java.util.List;
import java.util.Map;
import com.entity.vo.DaoqitixingVO;
import org.apache.ibatis.annotations.Param;
import com.entity.view.DaoqitixingView;


/**
 * 到期提醒
 *
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
public interface DaoqitixingService extends IService<DaoqitixingEntity> {

    PageUtils queryPage(Map<String, Object> params);
    
   	List<DaoqitixingVO> selectListVO(Wrapper<DaoqitixingEntity> wrapper);
   	
   	DaoqitixingVO selectVO(@Param("ew") Wrapper<DaoqitixingEntity> wrapper);
   	
   	List<DaoqitixingView> selectListView(Wrapper<DaoqitixingEntity> wrapper);
   	
   	DaoqitixingView selectView(@Param("ew") Wrapper<DaoqitixingEntity> wrapper);
   	
   	PageUtils queryPage(Map<String, Object> params,Wrapper<DaoqitixingEntity> wrapper);

   	

}

