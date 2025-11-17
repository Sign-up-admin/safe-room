package com.dao;

import com.entity.MembershipCardEntity;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import java.util.List;
import java.util.Map;
import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;

import org.apache.ibatis.annotations.Param;
import com.entity.vo.MembershipCardVO;
import com.entity.view.MembershipCardView;


/**
 * Membership Card
 * 
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
public interface MembershipCardDao extends BaseMapper<MembershipCardEntity> {
	
	List<MembershipCardVO> selectListVO(@Param("ew") Wrapper<MembershipCardEntity> wrapper);
	
	MembershipCardVO selectVO(@Param("ew") Wrapper<MembershipCardEntity> wrapper);
	
	List<MembershipCardView> selectListView(@Param("ew") Wrapper<MembershipCardEntity> wrapper);

	List<MembershipCardView> selectListView(Page page,@Param("ew") Wrapper<MembershipCardEntity> wrapper);

	
	MembershipCardView selectView(@Param("ew") Wrapper<MembershipCardEntity> wrapper);
	

}
