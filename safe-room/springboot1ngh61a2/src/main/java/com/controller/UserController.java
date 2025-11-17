package com.controller;

import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Map;
import java.util.Date;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.annotation.IgnoreAuth;

import com.entity.UserEntity;
import com.entity.view.UserView;

import com.service.UserService;
import com.service.TokenService;
import com.service.PasswordService;
import com.utils.PageUtils;
import com.utils.PasswordEncoderUtil;
import com.utils.R;
import com.utils.MPUtil;
import org.apache.commons.lang3.StringUtils;

/**
 * 用户
 * 后端接口
 */
@RestController
@RequestMapping("/user")
public class UserController {
    private final UserService userService;
    private final TokenService tokenService;
    
    @Autowired
    private PasswordService passwordService;

    @Autowired
    public UserController(UserService userService, TokenService tokenService) {
        this.userService = userService;
        this.tokenService = tokenService;
    }
	
	/**
	 * 登录
	 */
	@IgnoreAuth
	@RequestMapping(value = "/login")
	public R login(String username, String password) {
		UserEntity u = userService.getOne(new QueryWrapper<UserEntity>().eq("username", username));
		if(u == null) {
			return R.error("Invalid username or password");
		}
		
		// 检查账号状态锁定
		if(u.getStatus() != null && u.getStatus().intValue()==1) {
            return R.error("Account is locked, please contact administrator.");
        }
		
		// 检查账号是否被锁定（登录失败锁定）
		if (passwordService.isAccountLocked(u.getLockUntil())) {
			return R.error("Account is temporarily locked due to too many failed login attempts");
		}
		
		// 验证密码（支持旧密码迁移）
		boolean passwordValid = passwordService.verifyPassword(
			password, 
			u.getPasswordHash(), 
			u.getPassword()
		);
		
		if (!passwordValid) {
			// 登录失败，增加失败次数
			int newFailedAttempts = passwordService.handleLoginFailure(u.getFailedLoginAttempts());
			u.setFailedLoginAttempts(newFailedAttempts);
			
			// 如果失败次数达到上限，锁定账号
			if (passwordService.shouldLockAccount(newFailedAttempts)) {
				u.setLockUntil(passwordService.calculateLockUntil());
				userService.updateById(u);
				return R.error("Too many failed login attempts. Account locked for 30 minutes");
			}
			
			userService.updateById(u);
			return R.error("Invalid username or password");
		}
		
		// 登录成功，重置失败次数
		u.setFailedLoginAttempts(0);
		u.setLockUntil(null);
		
		// 如果使用旧密码登录，自动迁移到BCrypt
		if (StringUtils.isBlank(u.getPasswordHash()) || !PasswordEncoderUtil.isBCryptHash(u.getPasswordHash())) {
			u.setPasswordHash(PasswordEncoderUtil.encode(password));
		}
		
		userService.updateById(u);
		
		String token = tokenService.generateToken(u.getId(), username,"user",  "User" );
		return R.ok("登录成功").put("token", token).put("role", "user");
	}

	/**
     * 注册
     */
	@IgnoreAuth
    @RequestMapping("/register")
    public R register(@RequestBody UserEntity user){
    	//ValidatorUtils.validateEntity(user);
    	UserEntity u = userService.getOne(new QueryWrapper<UserEntity>().eq("username", user.getUsername()));
		if(u!=null) {
			return R.error("User already exists");
		}
		
		// 验证密码复杂度
    	if (StringUtils.isNotBlank(user.getPassword())) {
    		String validationError = passwordService.validatePasswordStrength(user.getPassword());
    		if (validationError != null) {
    			return R.error(validationError);
    		}
    		// 使用BCrypt加密密码
    		user.setPasswordHash(PasswordEncoderUtil.encode(user.getPassword()));
    	}
		
		Long uId = new Date().getTime();
		user.setId(uId);
        userService.save(user);
        return R.ok();
    }

	/**
	 * 退出
	 */
	@RequestMapping("/logout")
	public R logout(HttpServletRequest request) {
		request.getSession().invalidate();
		return R.ok("Logout successful");
	}
	
	/**
     * 获取用户的session用户信息
     */
    @RequestMapping("/session")
    public R getCurrUser(HttpServletRequest request){
    	Long id = (Long)request.getSession().getAttribute("userId");
        UserEntity u = userService.getById(id);
        return R.ok().put("data", u);
    }
    
    /**
     * 密码重置
     */
    @IgnoreAuth
	@RequestMapping(value = "/resetPass")
    public R resetPass(String username){
    	UserEntity u = userService.getOne(new QueryWrapper<UserEntity>().eq("username", username));
    	if(u==null) {
    		return R.error("Account does not exist");
    	}
    	
    	// 生成随机密码
    	String newPassword = passwordService.generateRandomPassword();
    	u.setPasswordHash(PasswordEncoderUtil.encode(newPassword));
    	u.setPassword(newPassword);
    	
    	// 重置锁定状态
    	u.setFailedLoginAttempts(0);
    	u.setLockUntil(null);
    	
        userService.updateById(u);
        return R.ok("Password has been reset. New password: " + newPassword);
    }

    /**
     * 后台列表
     */
    @RequestMapping("/page")
    public R page(@RequestParam Map<String, Object> params,UserEntity user){
        QueryWrapper<UserEntity> ew = new QueryWrapper<>();

		PageUtils page = userService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, user), params), params));

        return R.ok().put("data", page);
    }
    
    /**
     * 前台列表
     */
	@IgnoreAuth
    @RequestMapping("/list")
    public R list(@RequestParam Map<String, Object> params,UserEntity user){
        QueryWrapper<UserEntity> ew = new QueryWrapper<>();

		PageUtils page = userService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, user), params), params));
        return R.ok().put("data", page);
    }

	/**
     * 列表
     */
    @RequestMapping("/lists")
    public R list( UserEntity user){
       	QueryWrapper<UserEntity> ew = new QueryWrapper<>();
      	ew.allEq(MPUtil.allEQMapPre( user, "user")); 
        return R.ok().put("data", userService.selectListView(ew));
    }

	 /**
     * 查询
     */
    @RequestMapping("/query")
    public R query(UserEntity user){
        QueryWrapper< UserEntity> ew = new QueryWrapper<>();
 		ew.allEq(MPUtil.allEQMapPre( user, "user")); 
		UserView userView =  userService.selectView(ew);
		return R.ok("Query user successful").put("data", userView);
    }
	
    /**
     * 后台详情
     */
    @RequestMapping("/info/{id}")
    public R info(@PathVariable("id") Long id){
        UserEntity user = userService.getById(id);
        return R.ok().put("data", user);
    }

    /**
     * 前台详情
     */
	@IgnoreAuth
    @RequestMapping("/detail/{id}")
    public R detail(@PathVariable("id") Long id){
        UserEntity user = userService.getById(id);
        return R.ok().put("data", user);
    }
    
    /**
     * 后台保存
     */
    @RequestMapping("/save")
    public R save(@RequestBody UserEntity user){
        if(userService.count(new QueryWrapper<UserEntity>().eq("username", user.getUsername()))>0) {
            return R.error("Username already exists");
        }
    	user.setId(new Date().getTime()+Double.valueOf(Math.floor(Math.random()*1000)).longValue());
    	//ValidatorUtils.validateEntity(user);
    	UserEntity u = userService.getOne(new QueryWrapper<UserEntity>().eq("username", user.getUsername()));
		if(u!=null) {
			return R.error("User already exists");
		}
		user.setId(new Date().getTime());
        userService.save(user);
        return R.ok();
    }
    
    /**
     * 前台保存
     */
    @RequestMapping("/add")
    public R add(@RequestBody UserEntity user){
        if(userService.count(new QueryWrapper<UserEntity>().eq("username", user.getUsername()))>0) {
            return R.error("Username already exists");
        }
    	user.setId(new Date().getTime()+Double.valueOf(Math.floor(Math.random()*1000)).longValue());
    	//ValidatorUtils.validateEntity(user);
    	UserEntity u = userService.getOne(new QueryWrapper<UserEntity>().eq("username", user.getUsername()));
		if(u!=null) {
			return R.error("User already exists");
		}
		user.setId(new Date().getTime());
        userService.save(user);
        return R.ok();
    }

    /**
     * 修改
     */
    @RequestMapping("/update")
    @Transactional
    public R update(@RequestBody UserEntity user){
        //ValidatorUtils.validateEntity(user);
        if(userService.count(new QueryWrapper<UserEntity>().ne("id", user.getId()).eq("username", user.getUsername()))>0) {
            return R.error("Username already exists");
        }
        userService.updateById(user);//全部更新
        return R.ok();
    }
    
    /**
     * 删除
     */
    @RequestMapping("/delete")
    public R delete(@RequestBody Long[] ids){
        userService.removeByIds(Arrays.asList(ids));
        return R.ok();
    }
    
    /**
     * 提醒接口
     */
	@RequestMapping("/remind/{columnName}/{type}")
	public R remindCount(@PathVariable("columnName") String columnName, 
						 @PathVariable("type") String type,@RequestParam Map<String, Object> map) {
		map.put("column", columnName);
		map.put("type", type);
		
		if(type.equals("2")) {
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			Calendar c = Calendar.getInstance();
			Date remindStartDate;
			Date remindEndDate;
			if(map.get("remindstart")!=null) {
				int remindStart = Integer.parseInt(map.get("remindstart").toString());
				c.setTime(new Date()); 
				c.add(Calendar.DAY_OF_MONTH,remindStart);
				remindStartDate = c.getTime();
				map.put("remindstart", sdf.format(remindStartDate));
			}
			if(map.get("remindend")!=null) {
				int remindEnd = Integer.parseInt(map.get("remindend").toString());
				c.setTime(new Date());
				c.add(Calendar.DAY_OF_MONTH,remindEnd);
				remindEndDate = c.getTime();
				map.put("remindend", sdf.format(remindEndDate));
			}
		}
		
		QueryWrapper<UserEntity> wrapper = new QueryWrapper<>();
		if(map.get("remindstart")!=null) {
			wrapper.ge(columnName, map.get("remindstart"));
		}
		if(map.get("remindend")!=null) {
			wrapper.le(columnName, map.get("remindend"));
		}

		long count = userService.count(wrapper);
		return R.ok().put("count", count);
	}
	
    /**
     * 总数统计
     */
    @RequestMapping("/count")
    public R count(@RequestParam Map<String, Object> params,UserEntity user){
        QueryWrapper<UserEntity> ew = new QueryWrapper<>();
        long count = userService.count(MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, user), params), params));
        return R.ok().put("data", count);
    }
}
