package com.service;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.extension.service.IService;
import com.utils.PageUtils;
import com.entity.JianshenkechengEntity;
import java.util.List;
import java.util.Map;
import com.entity.vo.JianshenkechengVO;
import org.apache.ibatis.annotations.Param;
import com.entity.view.JianshenkechengView;


/**
 * 健身课程
 *
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
public interface JianshenkechengService extends IService<JianshenkechengEntity> {

    PageUtils queryPage(Map<String, Object> params);
    
   	List<JianshenkechengVO> selectListVO(Wrapper<JianshenkechengEntity> wrapper);
   	
   	JianshenkechengVO selectVO(@Param("ew") Wrapper<JianshenkechengEntity> wrapper);
   	
   	List<JianshenkechengView> selectListView(Wrapper<JianshenkechengEntity> wrapper);
   	
   	JianshenkechengView selectView(@Param("ew") Wrapper<JianshenkechengEntity> wrapper);
   	
   	PageUtils queryPage(Map<String, Object> params,Wrapper<JianshenkechengEntity> wrapper);

   	

    List<Map<String, Object>> selectValue(Map<String, Object> params,Wrapper<JianshenkechengEntity> wrapper);

    List<Map<String, Object>> selectTimeStatValue(Map<String, Object> params,Wrapper<JianshenkechengEntity> wrapper);

    List<Map<String, Object>> selectGroup(Map<String, Object> params,Wrapper<JianshenkechengEntity> wrapper);



}

