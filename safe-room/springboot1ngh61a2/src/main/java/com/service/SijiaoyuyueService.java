package com.service;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.extension.service.IService;
import com.utils.PageUtils;
import com.entity.SijiaoyuyueEntity;
import java.util.List;
import java.util.Map;
import com.entity.vo.SijiaoyuyueVO;
import org.apache.ibatis.annotations.Param;
import com.entity.view.SijiaoyuyueView;


/**
 * 私教预约
 *
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
public interface SijiaoyuyueService extends IService<SijiaoyuyueEntity> {

    PageUtils queryPage(Map<String, Object> params);
    
   	List<SijiaoyuyueVO> selectListVO(Wrapper<SijiaoyuyueEntity> wrapper);
   	
   	SijiaoyuyueVO selectVO(@Param("ew") Wrapper<SijiaoyuyueEntity> wrapper);
   	
   	List<SijiaoyuyueView> selectListView(Wrapper<SijiaoyuyueEntity> wrapper);
   	
   	SijiaoyuyueView selectView(@Param("ew") Wrapper<SijiaoyuyueEntity> wrapper);
   	
   	PageUtils queryPage(Map<String, Object> params,Wrapper<SijiaoyuyueEntity> wrapper);

   	

    List<Map<String, Object>> selectValue(Map<String, Object> params,Wrapper<SijiaoyuyueEntity> wrapper);

    List<Map<String, Object>> selectTimeStatValue(Map<String, Object> params,Wrapper<SijiaoyuyueEntity> wrapper);

    List<Map<String, Object>> selectGroup(Map<String, Object> params,Wrapper<SijiaoyuyueEntity> wrapper);



}

