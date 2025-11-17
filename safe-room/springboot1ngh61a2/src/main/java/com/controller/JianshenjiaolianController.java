package com.controller;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Map;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Date;
import java.util.List;
import jakarta.servlet.http.HttpServletRequest;

import com.utils.ValidatorUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.annotation.IgnoreAuth;

import com.entity.JianshenjiaolianEntity;
import com.entity.view.JianshenjiaolianView;

import com.service.JianshenjiaolianService;
import com.service.TokenService;
import com.service.PasswordService;
import com.utils.PageUtils;
import com.utils.PasswordEncoderUtil;
import com.utils.R;
import com.utils.MPUtil;
import com.utils.MapUtils;
import com.utils.CommonUtil;
import org.apache.commons.lang3.StringUtils;
import java.io.IOException;

/**
 * 健身教练
 * 后端接口
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
@RestController
@RequestMapping("/jianshenjiaolian")
public class JianshenjiaolianController {
    @Autowired
    private JianshenjiaolianService jianshenjiaolianService;

	@Autowired
	private TokenService tokenService;
	
	@Autowired
	private PasswordService passwordService;
	
	/**
	 * 登录
	 */
	@IgnoreAuth
	@RequestMapping(value = "/login")
	public R login(String username, String password, String captcha, HttpServletRequest request) {
		JianshenjiaolianEntity u = jianshenjiaolianService.getOne(new QueryWrapper<JianshenjiaolianEntity>().eq("jiaoliangonghao", username));
		if(u == null) {
			return R.error("账号或密码不正确");
		}
		
		// 检查账号是否被锁定（登录失败锁定）
		if (passwordService.isAccountLocked(u.getLockUntil())) {
			return R.error("账号已被锁定，请稍后再试");
		}
		
		// 验证密码（支持旧密码迁移）
		boolean passwordValid = passwordService.verifyPassword(
			password, 
			u.getPasswordHash(), 
			u.getMima()
		);
		
		if (!passwordValid) {
			// 登录失败，增加失败次数
			int newFailedAttempts = passwordService.handleLoginFailure(u.getFailedLoginAttempts());
			u.setFailedLoginAttempts(newFailedAttempts);
			
			// 如果失败次数达到上限，锁定账号
			if (passwordService.shouldLockAccount(newFailedAttempts)) {
				u.setLockUntil(passwordService.calculateLockUntil());
				jianshenjiaolianService.updateById(u);
				return R.error("登录失败次数过多，账号已被锁定30分钟");
			}
			
			jianshenjiaolianService.updateById(u);
			return R.error("账号或密码不正确");
		}
		
		// 登录成功，重置失败次数
		u.setFailedLoginAttempts(0);
		u.setLockUntil(null);
		
		// 如果使用旧密码登录，自动迁移到BCrypt
		if (StringUtils.isBlank(u.getPasswordHash()) || !PasswordEncoderUtil.isBCryptHash(u.getPasswordHash())) {
			u.setPasswordHash(PasswordEncoderUtil.encode(password));
		}
		
		jianshenjiaolianService.updateById(u);
		
		String token = tokenService.generateToken(u.getId(), username,"jianshenjiaolian",  "健身教练" );
		return R.ok("登录成功").put("token", token).put("role", "jianshenjiaolian");
	}


	
	/**
     * 注册
     */
	@IgnoreAuth
    @RequestMapping("/register")
    public R register(@RequestBody JianshenjiaolianEntity jianshenjiaolian){
    	//ValidatorUtils.validateEntity(jianshenjiaolian);
    	JianshenjiaolianEntity u = jianshenjiaolianService.getOne(new QueryWrapper<JianshenjiaolianEntity>().eq("jiaoliangonghao", jianshenjiaolian.getJiaoliangonghao()));
		if(u!=null) {
			return R.error("注册用户已存在");
		}
		
		// 验证密码复杂度
    	if (StringUtils.isNotBlank(jianshenjiaolian.getMima())) {
    		String validationError = passwordService.validatePasswordStrength(jianshenjiaolian.getMima());
    		if (validationError != null) {
    			return R.error(validationError);
    		}
    		// 使用BCrypt加密密码
    		jianshenjiaolian.setPasswordHash(PasswordEncoderUtil.encode(jianshenjiaolian.getMima()));
    	}
		
		Long uId = new Date().getTime();
		jianshenjiaolian.setId(uId);
        jianshenjiaolianService.save(jianshenjiaolian);
        return R.ok();
    }

	
	/**
	 * 退出
	 */
	@RequestMapping("/logout")
	public R logout(HttpServletRequest request) {
		request.getSession().invalidate();
		return R.ok("退出成功");
	}
	
	/**
     * 获取用户的session用户信息
     */
    @RequestMapping("/session")
    public R getCurrUser(HttpServletRequest request){
    	Long id = (Long)request.getSession().getAttribute("userId");
        JianshenjiaolianEntity u = jianshenjiaolianService.getById(id);
        return R.ok().put("data", u);
    }
    
    /**
     * 密码重置
     */
    @IgnoreAuth
	@RequestMapping(value = "/resetPass")
    public R resetPass(String username, HttpServletRequest request){
    	JianshenjiaolianEntity u = jianshenjiaolianService.getOne(new QueryWrapper<JianshenjiaolianEntity>().eq("jiaoliangonghao", username));
    	if(u==null) {
    		return R.error("账号不存在");
    	}
    	
    	// 生成随机密码
    	String newPassword = passwordService.generateRandomPassword();
    	u.setPasswordHash(PasswordEncoderUtil.encode(newPassword));
    	u.setMima(newPassword);
    	
    	// 重置锁定状态
    	u.setFailedLoginAttempts(0);
    	u.setLockUntil(null);
    	
        jianshenjiaolianService.updateById(u);
        return R.ok("密码已重置，新密码为：" + newPassword);
    }



    /**
     * 后台列表
     */
    @RequestMapping("/page")
    public R page(@RequestParam Map<String, Object> params,JianshenjiaolianEntity jianshenjiaolian,
		HttpServletRequest request){
        QueryWrapper<JianshenjiaolianEntity> ew = new QueryWrapper<JianshenjiaolianEntity>();

		PageUtils page = jianshenjiaolianService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, jianshenjiaolian), params), params));

        return R.ok().put("data", page);
    }
    
    /**
     * 前台列表
     */
	@IgnoreAuth
    @RequestMapping("/list")
    public R list(@RequestParam Map<String, Object> params,JianshenjiaolianEntity jianshenjiaolian, 
		HttpServletRequest request){
        QueryWrapper<JianshenjiaolianEntity> ew = new QueryWrapper<JianshenjiaolianEntity>();

		PageUtils page = jianshenjiaolianService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, jianshenjiaolian), params), params));
        return R.ok().put("data", page);
    }



	/**
     * 列表
     */
    @RequestMapping("/lists")
    public R list( JianshenjiaolianEntity jianshenjiaolian){
       	QueryWrapper<JianshenjiaolianEntity> ew = new QueryWrapper<JianshenjiaolianEntity>();
      	ew.allEq(MPUtil.allEQMapPre( jianshenjiaolian, "jianshenjiaolian")); 
        return R.ok().put("data", jianshenjiaolianService.selectListView(ew));
    }

	 /**
     * 查询
     */
    @RequestMapping("/query")
    public R query(JianshenjiaolianEntity jianshenjiaolian){
        QueryWrapper< JianshenjiaolianEntity> ew = new QueryWrapper< JianshenjiaolianEntity>();
 		ew.allEq(MPUtil.allEQMapPre( jianshenjiaolian, "jianshenjiaolian")); 
		JianshenjiaolianView jianshenjiaolianView =  jianshenjiaolianService.selectView(ew);
		return R.ok("查询健身教练成功").put("data", jianshenjiaolianView);
    }
	
    /**
     * 后台详情
     */
    @RequestMapping("/info/{id}")
    public R info(@PathVariable("id") Long id){
        JianshenjiaolianEntity jianshenjiaolian = jianshenjiaolianService.getById(id);
        return R.ok().put("data", jianshenjiaolian);
    }

    /**
     * 前台详情
     */
	@IgnoreAuth
    @RequestMapping("/detail/{id}")
    public R detail(@PathVariable("id") Long id){
        JianshenjiaolianEntity jianshenjiaolian = jianshenjiaolianService.getById(id);
        return R.ok().put("data", jianshenjiaolian);
    }
    



    /**
     * 后台保存
     */
    @RequestMapping("/save")
    public R save(@RequestBody JianshenjiaolianEntity jianshenjiaolian, HttpServletRequest request){
        if(jianshenjiaolianService.count(new QueryWrapper<JianshenjiaolianEntity>().eq("jiaoliangonghao", jianshenjiaolian.getJiaoliangonghao()))>0) {
            return R.error("教练工号已存在");
        }
        long randomSuffix = (long) Math.floor(Math.random() * 1000);
    	jianshenjiaolian.setId(new Date().getTime() + randomSuffix);
    	//ValidatorUtils.validateEntity(jianshenjiaolian);
    	JianshenjiaolianEntity u = jianshenjiaolianService.getOne(new QueryWrapper<JianshenjiaolianEntity>().eq("jiaoliangonghao", jianshenjiaolian.getJiaoliangonghao()));
		if(u!=null) {
			return R.error("用户已存在");
		}
		jianshenjiaolian.setId(new Date().getTime());
        jianshenjiaolianService.save(jianshenjiaolian);
        return R.ok();
    }
    
    /**
     * 前台保存
     */
    @RequestMapping("/add")
    public R add(@RequestBody JianshenjiaolianEntity jianshenjiaolian, HttpServletRequest request){
        if(jianshenjiaolianService.count(new QueryWrapper<JianshenjiaolianEntity>().eq("jiaoliangonghao", jianshenjiaolian.getJiaoliangonghao()))>0) {
            return R.error("教练工号已存在");
        }
        long randomSuffix = (long) Math.floor(Math.random() * 1000);
    	jianshenjiaolian.setId(new Date().getTime() + randomSuffix);
    	//ValidatorUtils.validateEntity(jianshenjiaolian);
    	JianshenjiaolianEntity u = jianshenjiaolianService.getOne(new QueryWrapper<JianshenjiaolianEntity>().eq("jiaoliangonghao", jianshenjiaolian.getJiaoliangonghao()));
		if(u!=null) {
			return R.error("用户已存在");
		}
		jianshenjiaolian.setId(new Date().getTime());
        jianshenjiaolianService.save(jianshenjiaolian);
        return R.ok();
    }




    /**
     * 修改
     */
    @RequestMapping("/update")
    @Transactional
    public R update(@RequestBody JianshenjiaolianEntity jianshenjiaolian, HttpServletRequest request){
        //ValidatorUtils.validateEntity(jianshenjiaolian);
        if(jianshenjiaolianService.count(new QueryWrapper<JianshenjiaolianEntity>().ne("id", jianshenjiaolian.getId()).eq("jiaoliangonghao", jianshenjiaolian.getJiaoliangonghao()))>0) {
            return R.error("教练工号已存在");
        }
        jianshenjiaolianService.updateById(jianshenjiaolian);//全部更新
        return R.ok();
    }



    

    /**
     * 删除
     */
    @RequestMapping("/delete")
    public R delete(@RequestBody Long[] ids){
        jianshenjiaolianService.removeByIds(Arrays.asList(ids));
        return R.ok();
    }
    


}
