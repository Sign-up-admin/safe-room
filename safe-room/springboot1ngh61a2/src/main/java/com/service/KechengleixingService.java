package com.service;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.extension.service.IService;
import com.utils.PageUtils;
import com.entity.KechengleixingEntity;
import java.util.List;
import java.util.Map;
import com.entity.vo.KechengleixingVO;
import org.apache.ibatis.annotations.Param;
import com.entity.view.KechengleixingView;


/**
 * 课程类型
 *
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
public interface KechengleixingService extends IService<KechengleixingEntity> {

    PageUtils queryPage(Map<String, Object> params);
    
   	List<KechengleixingVO> selectListVO(Wrapper<KechengleixingEntity> wrapper);
   	
   	KechengleixingVO selectVO(@Param("ew") Wrapper<KechengleixingEntity> wrapper);
   	
   	List<KechengleixingView> selectListView(Wrapper<KechengleixingEntity> wrapper);
   	
   	KechengleixingView selectView(@Param("ew") Wrapper<KechengleixingEntity> wrapper);
   	
   	PageUtils queryPage(Map<String, Object> params,Wrapper<KechengleixingEntity> wrapper);

   	

}

