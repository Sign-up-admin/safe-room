package com.service;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.extension.service.IService;
import com.utils.PageUtils;
import com.entity.HuiyuanxufeiEntity;
import java.util.List;
import java.util.Map;
import com.entity.vo.HuiyuanxufeiVO;
import org.apache.ibatis.annotations.Param;
import com.entity.view.HuiyuanxufeiView;


/**
 * 会员续费
 *
 * @author 
 * @email 
 * @date 2024-06-20 10:35:10
 */
public interface HuiyuanxufeiService extends IService<HuiyuanxufeiEntity> {

    PageUtils queryPage(Map<String, Object> params);
    
   	List<HuiyuanxufeiVO> selectListVO(Wrapper<HuiyuanxufeiEntity> wrapper);
   	
   	HuiyuanxufeiVO selectVO(@Param("ew") Wrapper<HuiyuanxufeiEntity> wrapper);
   	
   	List<HuiyuanxufeiView> selectListView(Wrapper<HuiyuanxufeiEntity> wrapper);
   	
   	HuiyuanxufeiView selectView(@Param("ew") Wrapper<HuiyuanxufeiEntity> wrapper);
   	
   	PageUtils queryPage(Map<String, Object> params,Wrapper<HuiyuanxufeiEntity> wrapper);

   	

    List<Map<String, Object>> selectValue(Map<String, Object> params,Wrapper<HuiyuanxufeiEntity> wrapper);

    List<Map<String, Object>> selectTimeStatValue(Map<String, Object> params,Wrapper<HuiyuanxufeiEntity> wrapper);

    List<Map<String, Object>> selectGroup(Map<String, Object> params,Wrapper<HuiyuanxufeiEntity> wrapper);



}

