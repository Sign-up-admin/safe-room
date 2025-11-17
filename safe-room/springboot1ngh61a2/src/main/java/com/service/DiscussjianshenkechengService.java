package com.service;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.extension.service.IService;
import com.utils.PageUtils;
import com.entity.DiscussjianshenkechengEntity;
import java.util.List;
import java.util.Map;
import com.entity.vo.DiscussjianshenkechengVO;
import org.apache.ibatis.annotations.Param;
import com.entity.view.DiscussjianshenkechengView;


/**
 * 健身课程评论�?
 *
 * @author 
 * @email 
 * @date 2024-06-20 10:35:10
 */
public interface DiscussjianshenkechengService extends IService<DiscussjianshenkechengEntity> {

    PageUtils queryPage(Map<String, Object> params);
    
   	List<DiscussjianshenkechengVO> selectListVO(Wrapper<DiscussjianshenkechengEntity> wrapper);
   	
   	DiscussjianshenkechengVO selectVO(@Param("ew") Wrapper<DiscussjianshenkechengEntity> wrapper);
   	
   	List<DiscussjianshenkechengView> selectListView(Wrapper<DiscussjianshenkechengEntity> wrapper);
   	
   	DiscussjianshenkechengView selectView(@Param("ew") Wrapper<DiscussjianshenkechengEntity> wrapper);
   	
   	PageUtils queryPage(Map<String, Object> params,Wrapper<DiscussjianshenkechengEntity> wrapper);

   	

}

