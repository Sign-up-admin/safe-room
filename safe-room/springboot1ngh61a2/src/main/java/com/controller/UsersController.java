package com.controller;


import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.annotation.IgnoreAuth;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.entity.TokenEntity;
import com.entity.UsersEntity;
import com.service.TokenService;
import com.service.UsersService;
import com.service.PasswordService;
import com.service.OperationLogService;
import com.utils.CommonUtil;
import com.utils.MPUtil;
import com.utils.PageUtils;
import com.utils.PasswordEncoderUtil;
import com.utils.RequestUtils;
import com.utils.R;
import com.utils.ValidatorUtils;
import com.utils.DatabaseFieldChecker;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;

/**
 * 登录相关
 */
@RequestMapping("users")
@RestController
public class UsersController{
	
	private static final Logger logger = LoggerFactory.getLogger(UsersController.class);
	
	@Autowired
	private UsersService userService;
	
	@Autowired
	private TokenService tokenService;
	
	@Autowired
	private PasswordService passwordService;
	
	@Autowired
	private OperationLogService operationLogService;
	
	@Autowired(required = false)
	private DatabaseFieldChecker databaseFieldChecker;

	/**
	 * 登录
	 */
	@IgnoreAuth
	@RequestMapping(value = "/login")
	public R login(String username, String password, String captcha, HttpServletRequest request) {
		try {
			// 参数验证
			if (StringUtils.isBlank(username) || StringUtils.isBlank(password)) {
				logger.warn("登录失败: 账号或密码为空, username={}", username);
				return R.error(400, "账号或密码不能为空");
			}
			
			logger.info("开始登录验证: username={}", username);
			
			// 查询用户
			UsersEntity user;
			try {
				user = userService.getOne(new QueryWrapper<UsersEntity>().eq("username", username));
				logger.debug("查询用户结果: username={}, userExists={}", username, user != null);
			} catch (DataAccessException e) {
				logger.error("数据库查询用户失败: username={}, error={}", username, e.getMessage(), e);
				return R.error(500, "数据库查询失败，请检查数据库连接和表结构是否正确");
			} catch (Exception e) {
				logger.error("查询用户时发生未知错误: username={}, error={}", username, e.getMessage(), e);
				return R.error(500, "系统错误，请稍后重试");
			}
			
			if(user == null) {
				logger.warn("登录失败: 用户不存在, username={}", username);
				return R.error(401, "账号或密码不正确");
			}
			
			logger.debug("用户信息: username={}, id={}, passwordHash={}, password={}", 
				username, user.getId(), 
				user.getPasswordHash() != null ? "已设置" : "未设置",
				user.getPassword() != null ? "已设置" : "未设置");
			
			// 检查账号是否被锁定
			try {
				if (passwordService.isAccountLocked(user.getLockUntil())) {
					logger.warn("登录失败: 账号已被锁定, username={}, lockUntil={}", username, user.getLockUntil());
					return R.error(403, "账号已被锁定，请稍后再试");
				}
			} catch (Exception e) {
				logger.warn("检查账号锁定状态时发生错误，继续登录流程: username={}, error={}", username, e.getMessage(), e);
				// 锁定检查失败不影响登录流程，继续执行
			}
			
			// 验证密码（支持旧密码迁移）
			boolean passwordValid;
			try {
				passwordValid = passwordService.verifyPassword(
					password, 
					user.getPasswordHash(), 
					user.getPassword()
				);
				logger.debug("密码验证结果: username={}, passwordValid={}", username, passwordValid);
			} catch (Exception e) {
				logger.error("密码验证时发生错误: username={}, error={}", username, e.getMessage(), e);
				return R.error(500, "密码验证失败，请稍后重试");
			}
			
			if (!passwordValid) {
				logger.warn("登录失败: 密码不正确, username={}", username);
				// 登录失败，增加失败次数
				try {
					int newFailedAttempts = passwordService.handleLoginFailure(user.getFailedLoginAttempts());
					user.setFailedLoginAttempts(newFailedAttempts);
					
					// 如果失败次数达到上限，锁定账号
					if (passwordService.shouldLockAccount(newFailedAttempts)) {
						user.setLockUntil(passwordService.calculateLockUntil());
						try {
							userService.updateById(user);
							logger.warn("账号已被锁定: username={}, failedAttempts={}", username, newFailedAttempts);
						} catch (Exception e) {
							logger.error("更新用户锁定状态失败: username={}, error={}", username, e.getMessage(), e);
							// 更新失败不影响返回错误消息
						}
						return R.error(403, "登录失败次数过多，账号已被锁定30分钟");
					}
					
					try {
						userService.updateById(user);
					} catch (Exception e) {
						logger.error("更新用户失败次数失败: username={}", username, e);
						// 更新失败不影响返回错误消息
					}
				} catch (Exception e) {
					logger.error("处理登录失败时发生错误: username={}, error={}", username, e.getMessage(), e);
					// 处理失败不影响返回错误消息
				}
				return R.error(401, "账号或密码不正确");
			}
			
			// 登录成功，重置失败次数
			user.setFailedLoginAttempts(0);
			user.setLockUntil(null);
			
			// 如果使用旧密码登录，自动迁移到BCrypt
			try {
				if (StringUtils.isBlank(user.getPasswordHash()) || !PasswordEncoderUtil.isBCryptHash(user.getPasswordHash())) {
					user.setPasswordHash(PasswordEncoderUtil.encode(password));
					// 不清空旧密码字段，保持向后兼容
				}
			} catch (Exception e) {
				logger.warn("密码迁移失败，继续登录流程: username={}", username, e);
				// 密码迁移失败不影响登录成功
			}
			
			// 更新用户信息
			try {
				userService.updateById(user);
			} catch (DataAccessException e) {
				logger.error("更新用户信息失败，可能是数据库字段缺失: username={}", username, e);
				// 检查数据库字段
				String errorMsg = "更新用户信息失败，请检查数据库表结构";
				if (databaseFieldChecker != null) {
					List<String> missingFields = databaseFieldChecker.checkUsersTableFields();
					if (!missingFields.isEmpty()) {
						errorMsg = DatabaseFieldChecker.generateMigrationHint(missingFields);
					} else {
						errorMsg = "更新用户信息失败，数据库操作异常: " + e.getMessage();
					}
				} else {
					errorMsg = "更新用户信息失败，请检查数据库表结构是否包含password_hash、failed_login_attempts、lock_until字段";
				}
				return R.error(500, errorMsg);
			} catch (Exception e) {
				logger.error("更新用户信息时发生未知错误: username={}", username, e);
				return R.error(500, "更新用户信息失败，请稍后重试");
			}
			
			// 记录登录审计日志（失败不影响登录成功）
			try {
				String ip = RequestUtils.getClientIp(request);
				String userAgent = RequestUtils.getUserAgent(request);
				operationLogService.logOperation(user.getId(), username, "users", "Login", 
					"用户登录成功", ip, userAgent);
			} catch (Exception e) {
				logger.warn("记录登录日志失败，不影响登录: username={}", username, e);
				// 日志记录失败不影响登录成功
			}
			
			// 生成Token
			String token;
			try {
				token = tokenService.generateToken(user.getId(), username, "users", user.getRole());
			} catch (Exception e) {
				logger.error("生成Token失败: username={}", username, e);
				return R.error(500, "生成登录凭证失败，请稍后重试");
			}
			
			logger.info("登录成功: username={}, role={}", username, user.getRole());
			return R.ok("登录成功").put("token", token).put("role", user.getRole() != null ? user.getRole() : "users");
			
		} catch (Exception e) {
			logger.error("登录过程中发生未预期的错误: username={}, error={}", username, e.getMessage(), e);
			return R.error(500, "登录失败，系统错误: " + e.getMessage());
		}
	}
	
	/**
	 * 注册
	 */
	@IgnoreAuth
	@PostMapping(value = "/register")
	public R register(@RequestBody UsersEntity user, HttpServletRequest request){
//    	ValidatorUtils.validateEntity(user);
    	if(userService.getOne(new QueryWrapper<UsersEntity>().eq("username", user.getUsername())) !=null) {
    		return R.error("用户已存在");
    	}
    	
    	// 验证密码复杂度
    	if (StringUtils.isNotBlank(user.getPassword())) {
    		String validationError = passwordService.validatePasswordStrength(user.getPassword());
    		if (validationError != null) {
    			return R.error(validationError);
    		}
    		// 使用BCrypt加密密码
    		user.setPasswordHash(PasswordEncoderUtil.encode(user.getPassword()));
    		// 保留明文密码用于向后兼容（可选，建议清空）
    	}
    	
        userService.save(user);
        
        // 记录注册审计日志
        String ip = RequestUtils.getClientIp(request);
        String userAgent = RequestUtils.getUserAgent(request);
        operationLogService.logOperation(user.getId(), user.getUsername(), "users", "Register", 
        	"用户注册成功", ip, userAgent);
        
        return R.ok();
    }

	/**
	 * 退出
	 */
	@GetMapping(value = "logout")
	public R logout(HttpServletRequest request) {
		request.getSession().invalidate();
		return R.ok("退出成功");
	}
	
	/**
     * 密码重置
     */
    @IgnoreAuth
	@RequestMapping(value = "/resetPass")
    public R resetPass(String username, HttpServletRequest request){
    	UsersEntity user = userService.getOne(new QueryWrapper<UsersEntity>().eq("username", username));
    	if(user==null) {
    		return R.error("账号不存在");
    	}
    	
    	// 生成随机密码
    	String newPassword = passwordService.generateRandomPassword();
    	user.setPasswordHash(PasswordEncoderUtil.encode(newPassword));
    	// 保留旧密码字段用于向后兼容（可选）
    	user.setPassword(newPassword);
    	
    	// 重置锁定状态
    	user.setFailedLoginAttempts(0);
    	user.setLockUntil(null);
    	
        userService.updateById(user);
        
        // 记录密码重置审计日志
        String ip = RequestUtils.getClientIp(request);
        String userAgent = RequestUtils.getUserAgent(request);
        operationLogService.logOperation(user.getId(), username, "users", "ResetPassword", 
        	"密码重置成功", ip, userAgent);
        
        return R.ok("密码已重置，新密码为：" + newPassword);
    }
	
	/**
     * 列表
     */
    @RequestMapping("/page")
    public R page(@RequestParam Map<String, Object> params,UsersEntity user){
        QueryWrapper<UsersEntity> ew = new QueryWrapper<UsersEntity>();
    	PageUtils page = userService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, user), params), params));
        return R.ok().put("data", page);
    }

	/**
     * 列表
     */
    @RequestMapping("/list")
    public R list( UsersEntity user){
       	QueryWrapper<UsersEntity> ew = new QueryWrapper<UsersEntity>();
      	ew.allEq(MPUtil.allEQMapPre( user, "user")); 
        return R.ok().put("data", userService.selectListView(ew));
    }

    /**
     * 信息
     */
    @RequestMapping("/info/{id}")
    public R info(@PathVariable("id") String id){
        UsersEntity user = userService.getById(id);
        return R.ok().put("data", user);
    }
    
    /**
     * 获取用户的session用户信息
     */
    @RequestMapping("/session")
    public R getCurrUser(HttpServletRequest request){
    	Long id = (Long)request.getSession().getAttribute("userId");
        if (id == null) {
            return R.error("未登录或登录已过期");
        }
        UsersEntity user = userService.getById(id);
        if (user == null) {
            return R.error("用户不存在");
        }
        return R.ok().put("data", user);
    }

    /**
     * 保存
     */
    @PostMapping("/save")
    public R save(@RequestBody UsersEntity user){
//    	ValidatorUtils.validateEntity(user);
    	if(userService.getOne(new QueryWrapper<UsersEntity>().eq("username", user.getUsername())) !=null) {
    		return R.error("用户已存在");
    	}
    	
    	// 如果设置了密码，使用BCrypt加密
    	if (StringUtils.isNotBlank(user.getPassword())) {
    		String validationError = passwordService.validatePasswordStrength(user.getPassword());
    		if (validationError != null) {
    			return R.error(validationError);
    		}
    		user.setPasswordHash(PasswordEncoderUtil.encode(user.getPassword()));
    	}
    	
        userService.save(user);
        return R.ok();
    }

    /**
     * 修改
     */
    @RequestMapping("/update")
    public R update(@RequestBody UsersEntity user){
//        ValidatorUtils.validateEntity(user);
    	UsersEntity u = userService.getOne(new QueryWrapper<UsersEntity>().eq("username", user.getUsername()));
    	if(u!=null && u.getId()!=user.getId() && u.getUsername().equals(user.getUsername())) {
    		return R.error("用户名已存在");
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
}
