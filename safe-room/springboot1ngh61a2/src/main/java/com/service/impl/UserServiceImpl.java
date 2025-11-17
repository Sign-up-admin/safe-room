package com.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dao.UserDao;
import com.entity.UserEntity;
import com.entity.view.UserView;
import com.entity.vo.UserVO;
import com.service.UserService;
import com.utils.PageUtils;
import com.utils.Query;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * 用户
 */
@Service("userService")
public class UserServiceImpl extends ServiceImpl<UserDao, UserEntity> implements UserService {

    @Override
    public PageUtils queryPage(Map<String, Object> params) {
        Page<UserEntity> page = this.page(
                new Query<UserEntity>(params).getPage(),
                new QueryWrapper<UserEntity>()
        );
        return new PageUtils(page);
    }

    @Override
    public List<UserVO> selectListVO(Wrapper<UserEntity> wrapper) {
        return baseMapper.selectListVO(wrapper);
    }

    @Override
    public UserVO selectVO(Wrapper<UserEntity> wrapper) {
        return baseMapper.selectVO(wrapper);
    }

    @Override
    public List<UserView> selectListView(Wrapper<UserEntity> wrapper) {
        return baseMapper.selectListView(wrapper);
    }

    @Override
    public UserView selectView(Wrapper<UserEntity> wrapper) {
        return baseMapper.selectView(wrapper);
    }

    @Override
    public PageUtils queryPage(Map<String, Object> params, Wrapper<UserEntity> wrapper) {
        Page<UserEntity> page = new Query<UserEntity>(params).getPage();
        page.setRecords(baseMapper.selectListView(page, wrapper));
        PageUtils pageUtil = new PageUtils(page);
        return pageUtil;
    }
}
