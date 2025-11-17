package com.service;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.extension.service.IService;
import com.utils.PageUtils;
import com.entity.JianshenqicaiEntity;
import java.util.List;
import java.util.Map;
import com.entity.vo.JianshenqicaiVO;
import org.apache.ibatis.annotations.Param;
import com.entity.view.JianshenqicaiView;


/**
 * 健身器材
 *
 * @author 
 * @email 
 * @date 2024-06-20 10:35:10
 */
public interface JianshenqicaiService extends IService<JianshenqicaiEntity> {

    PageUtils queryPage(Map<String, Object> params);
    
   	List<JianshenqicaiVO> selectListVO(Wrapper<JianshenqicaiEntity> wrapper);
   	
   	JianshenqicaiVO selectVO(@Param("ew") Wrapper<JianshenqicaiEntity> wrapper);
   	
   	List<JianshenqicaiView> selectListView(Wrapper<JianshenqicaiEntity> wrapper);
   	
   	JianshenqicaiView selectView(@Param("ew") Wrapper<JianshenqicaiEntity> wrapper);
   	
   	PageUtils queryPage(Map<String, Object> params,Wrapper<JianshenqicaiEntity> wrapper);

   	

}

