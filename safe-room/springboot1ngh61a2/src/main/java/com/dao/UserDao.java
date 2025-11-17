package com.dao;

import java.util.List;

import org.apache.ibatis.annotations.Param;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.entity.UserEntity;
import com.entity.vo.UserVO;
import com.entity.view.UserView;

/**
 * User
 */
public interface UserDao extends BaseMapper<UserEntity> {
	
	List<UserEntity> selectListView(Page page,@Param("ew") Wrapper<UserEntity> wrapper);

	List<UserVO> selectListVO(@Param("ew") Wrapper<UserEntity> wrapper);
   	
   	UserVO selectVO(@Param("ew") Wrapper<UserEntity> wrapper);
   	
   	List<UserView> selectListView(@Param("ew") Wrapper<UserEntity> wrapper);
	
   	UserView selectView(@Param("ew") Wrapper<UserEntity> wrapper);
	
}
