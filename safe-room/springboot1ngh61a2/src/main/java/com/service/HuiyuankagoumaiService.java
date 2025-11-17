package com.service;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.extension.service.IService;
import com.utils.PageUtils;
import com.entity.HuiyuankagoumaiEntity;
import java.util.List;
import java.util.Map;
import com.entity.vo.HuiyuankagoumaiVO;
import org.apache.ibatis.annotations.Param;
import com.entity.view.HuiyuankagoumaiView;


/**
 * 会员卡购�?
 *
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
public interface HuiyuankagoumaiService extends IService<HuiyuankagoumaiEntity> {

    PageUtils queryPage(Map<String, Object> params);
    
   	List<HuiyuankagoumaiVO> selectListVO(Wrapper<HuiyuankagoumaiEntity> wrapper);
   	
   	HuiyuankagoumaiVO selectVO(@Param("ew") Wrapper<HuiyuankagoumaiEntity> wrapper);
   	
   	List<HuiyuankagoumaiView> selectListView(Wrapper<HuiyuankagoumaiEntity> wrapper);
   	
   	HuiyuankagoumaiView selectView(@Param("ew") Wrapper<HuiyuankagoumaiEntity> wrapper);
   	
   	PageUtils queryPage(Map<String, Object> params,Wrapper<HuiyuankagoumaiEntity> wrapper);

   	

    List<Map<String, Object>> selectValue(Map<String, Object> params,Wrapper<HuiyuankagoumaiEntity> wrapper);

    List<Map<String, Object>> selectTimeStatValue(Map<String, Object> params,Wrapper<HuiyuankagoumaiEntity> wrapper);

    List<Map<String, Object>> selectGroup(Map<String, Object> params,Wrapper<HuiyuankagoumaiEntity> wrapper);



}

