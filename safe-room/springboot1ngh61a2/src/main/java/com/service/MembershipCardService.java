package com.service;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.extension.service.IService;
import com.utils.PageUtils;
import com.entity.MembershipCardEntity;
import java.util.List;
import java.util.Map;
import com.entity.vo.MembershipCardVO;
import org.apache.ibatis.annotations.Param;
import com.entity.view.MembershipCardView;


/**
 * 会员�?
 *
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
public interface MembershipCardService extends IService<MembershipCardEntity> {

    PageUtils queryPage(Map<String, Object> params);
    
   	List<MembershipCardVO> selectListVO(Wrapper<MembershipCardEntity> wrapper);
   	
   	MembershipCardVO selectVO(@Param("ew") Wrapper<MembershipCardEntity> wrapper);
   	
   	List<MembershipCardView> selectListView(Wrapper<MembershipCardEntity> wrapper);
   	
   	MembershipCardView selectView(@Param("ew") Wrapper<MembershipCardEntity> wrapper);
   	
   	PageUtils queryPage(Map<String, Object> params,Wrapper<MembershipCardEntity> wrapper);

   	

}

