package com.service;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.extension.service.IService;
import com.utils.PageUtils;
import com.entity.KechengtuikeEntity;
import java.util.List;
import java.util.Map;
import com.entity.vo.KechengtuikeVO;
import org.apache.ibatis.annotations.Param;
import com.entity.view.KechengtuikeView;


/**
 * 课程退�?
 *
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
public interface KechengtuikeService extends IService<KechengtuikeEntity> {

    PageUtils queryPage(Map<String, Object> params);
    
   	List<KechengtuikeVO> selectListVO(Wrapper<KechengtuikeEntity> wrapper);
   	
   	KechengtuikeVO selectVO(@Param("ew") Wrapper<KechengtuikeEntity> wrapper);
   	
   	List<KechengtuikeView> selectListView(Wrapper<KechengtuikeEntity> wrapper);
   	
   	KechengtuikeView selectView(@Param("ew") Wrapper<KechengtuikeEntity> wrapper);
   	
   	PageUtils queryPage(Map<String, Object> params,Wrapper<KechengtuikeEntity> wrapper);

   	

    List<Map<String, Object>> selectValue(Map<String, Object> params,Wrapper<KechengtuikeEntity> wrapper);

    List<Map<String, Object>> selectTimeStatValue(Map<String, Object> params,Wrapper<KechengtuikeEntity> wrapper);

    List<Map<String, Object>> selectGroup(Map<String, Object> params,Wrapper<KechengtuikeEntity> wrapper);



}

