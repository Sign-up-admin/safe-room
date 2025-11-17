package com.service;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.extension.service.IService;
import com.utils.PageUtils;
import com.entity.KechengyuyueEntity;
import java.util.List;
import java.util.Map;
import com.entity.vo.KechengyuyueVO;
import org.apache.ibatis.annotations.Param;
import com.entity.view.KechengyuyueView;


/**
 * 课程预约
 *
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
public interface KechengyuyueService extends IService<KechengyuyueEntity> {

    PageUtils queryPage(Map<String, Object> params);
    
   	List<KechengyuyueVO> selectListVO(Wrapper<KechengyuyueEntity> wrapper);
   	
   	KechengyuyueVO selectVO(@Param("ew") Wrapper<KechengyuyueEntity> wrapper);
   	
   	List<KechengyuyueView> selectListView(Wrapper<KechengyuyueEntity> wrapper);
   	
   	KechengyuyueView selectView(@Param("ew") Wrapper<KechengyuyueEntity> wrapper);
   	
   	PageUtils queryPage(Map<String, Object> params,Wrapper<KechengyuyueEntity> wrapper);

   	

    List<Map<String, Object>> selectValue(Map<String, Object> params,Wrapper<KechengyuyueEntity> wrapper);

    List<Map<String, Object>> selectTimeStatValue(Map<String, Object> params,Wrapper<KechengyuyueEntity> wrapper);

    List<Map<String, Object>> selectGroup(Map<String, Object> params,Wrapper<KechengyuyueEntity> wrapper);



}

