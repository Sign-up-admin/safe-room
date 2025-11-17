
package com.service.impl;


import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.dao.TokenDao;
import com.entity.TokenEntity;
import com.entity.TokenEntity;
import com.service.TokenService;
import com.utils.CommonUtil;
import com.utils.PageUtils;
import com.utils.Query;


/**
 * token
 */
@Service("tokenService")
public class TokenServiceImpl extends ServiceImpl<TokenDao, TokenEntity> implements TokenService {

    @Value("${test.authentication.token-expiry-check:false}")
    private boolean tokenExpiryCheckEnabled;
    
    @Value("${spring.profiles.active:}")
    private String activeProfile;

	@Override
	public PageUtils queryPage(Map<String, Object> params) {
		Page<TokenEntity> page = this.page(
                new Query<TokenEntity>(params).getPage(),
                new QueryWrapper<TokenEntity>()
        );
        return new PageUtils(page);
	}

	@Override
	public List<TokenEntity> selectListView(Wrapper<TokenEntity> wrapper) {
		return baseMapper.selectListView(wrapper);
	}

	@Override
	public PageUtils queryPage(Map<String, Object> params,
			Wrapper<TokenEntity> wrapper) {
		 Page<TokenEntity> page =new Query<TokenEntity>(params).getPage();
	        page.setRecords(baseMapper.selectListView(page,wrapper));
	    	PageUtils pageUtil = new PageUtils(page);
	    	return pageUtil;
	}

	@Override
	public String generateToken(Long userid,String username, String tableName, String role) {
		// 获取最新的token记录，如果有多个则取最新的
		List<TokenEntity> tokenEntities = this.list(new QueryWrapper<TokenEntity>()
				.eq("userid", userid)
				.eq("role", role)
				.orderByDesc("id"));
		TokenEntity tokenEntity = tokenEntities.isEmpty() ? null : tokenEntities.get(0);

		// 删除其他重复的token记录
		if(tokenEntities.size() > 1) {
			List<Long> idsToDelete = tokenEntities.subList(1, tokenEntities.size())
					.stream().map(TokenEntity::getId).collect(Collectors.toList());
			this.removeByIds(idsToDelete);
		}

		String token = CommonUtil.getRandomString(32);
		Calendar cal = Calendar.getInstance();
    	cal.setTime(new Date());
    	cal.add(Calendar.HOUR_OF_DAY, 1);
		if(tokenEntity!=null) {
			tokenEntity.setToken(token);
			tokenEntity.setExpiratedtime(cal.getTime());
			this.updateById(tokenEntity);
		} else {
			this.save(new TokenEntity(userid,username, tableName, role, token, cal.getTime()));
		}
		return token;
	}

	@Override
	public TokenEntity getTokenEntity(String token) {
		if (token == null || token.trim().isEmpty()) {
			return null;
		}
		
		// 查询所有匹配的token记录，如果有多个则取最新的
		List<TokenEntity> tokenEntities = this.list(new QueryWrapper<TokenEntity>()
				.eq("token", token)
				.orderByDesc("id"));
		
		if (tokenEntities.isEmpty()) {
			return null;
		}
		
		// 如果有多个token，取最新的一个，并删除其他重复的
		TokenEntity tokenEntity = tokenEntities.get(0);
		if (tokenEntities.size() > 1) {
			List<Long> idsToDelete = tokenEntities.subList(1, tokenEntities.size())
					.stream().map(TokenEntity::getId).collect(Collectors.toList());
			this.removeByIds(idsToDelete);
		}
		
		// 如果启用了过期检查，则验证token是否过期
		if (tokenExpiryCheckEnabled && tokenEntity.getExpiratedtime() != null 
				&& tokenEntity.getExpiratedtime().getTime() < new Date().getTime()) {
			return null;
		}
		return tokenEntity;
	}
}
