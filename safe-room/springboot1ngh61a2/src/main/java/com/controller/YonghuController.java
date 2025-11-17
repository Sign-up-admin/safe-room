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

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

import com.entity.YonghuEntity;
import com.entity.view.YonghuView;

import com.service.YonghuService;
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
 * 用户
 * 后端接口
 * @author
 * @email
 * @date 2024-06-20 10:35:09
 */
@RestController
@RequestMapping("/yonghu")
@Tag(name = "用户管理", description = "用户相关接口，包括登录、注册、信息管理等")
public class YonghuController {
    @Autowired
    private YonghuService yonghuService;

	@Autowired
	private TokenService tokenService;
	
	@Autowired
	private PasswordService passwordService;
	
	/**
	 * 登录
	 */
	@IgnoreAuth
	@Operation(summary = "用户登录", description = "用户账号密码登录，支持验证码验证和安全锁定机制")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "0", description = "登录成功", content = @Content(schema = @Schema(implementation = R.class))),
		@ApiResponse(responseCode = "1", description = "登录失败", content = @Content(schema = @Schema(implementation = R.class)))
	})
	@RequestMapping(value = "/login")
	public R login(
		@Parameter(description = "用户名/账号", required = true) String username,
		@Parameter(description = "密码", required = true) String password,
		@Parameter(description = "验证码", required = false) String captcha,
		HttpServletRequest request) {
		YonghuEntity u = yonghuService.getOne(new QueryWrapper<YonghuEntity>().eq("yonghuzhanghao", username));
		if(u == null) {
			return R.error("账号或密码不正确");
		}
		
		// 检查账号状态锁定
        if(u.getStatus() != null && u.getStatus().intValue()==1) {
            return R.error("账号已锁定，请联系管理员");
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
				yonghuService.updateById(u);
				return R.error("登录失败次数过多，账号已被锁定30分钟");
			}
			
			yonghuService.updateById(u);
			return R.error("账号或密码不正确");
		}
		
		// 登录成功，重置失败次数
		u.setFailedLoginAttempts(0);
		u.setLockUntil(null);
		
		// 如果使用旧密码登录，自动迁移到BCrypt
		if (StringUtils.isBlank(u.getPasswordHash()) || !PasswordEncoderUtil.isBCryptHash(u.getPasswordHash())) {
			u.setPasswordHash(PasswordEncoderUtil.encode(password));
		}
		
		yonghuService.updateById(u);
		
		String token = tokenService.generateToken(u.getId(), username,"yonghu",  "用户" );
		return R.ok("登录成功").put("token", token).put("role", "yonghu");
	}


	
	/**
     * 注册
     */
	@IgnoreAuth
	@Operation(summary = "用户注册", description = "新用户注册账号，支持密码强度验证和自动加密")
	@ApiResponses(value = {
		@ApiResponse(responseCode = "0", description = "注册成功", content = @Content(schema = @Schema(implementation = R.class))),
		@ApiResponse(responseCode = "1", description = "注册失败", content = @Content(schema = @Schema(implementation = R.class)))
	})
    @RequestMapping("/register")
    public R register(
    	@Parameter(description = "用户注册信息", required = true) @RequestBody YonghuEntity yonghu){
    	//ValidatorUtils.validateEntity(yonghu);
    	YonghuEntity u = yonghuService.getOne(new QueryWrapper<YonghuEntity>().eq("yonghuzhanghao", yonghu.getYonghuzhanghao()));
		if(u!=null) {
			return R.error("注册用户已存在");
		}
		
		// 验证密码复杂度
    	if (StringUtils.isNotBlank(yonghu.getMima())) {
    		String validationError = passwordService.validatePasswordStrength(yonghu.getMima());
    		if (validationError != null) {
    			return R.error(validationError);
    		}
    		// 使用BCrypt加密密码
    		yonghu.setPasswordHash(PasswordEncoderUtil.encode(yonghu.getMima()));
    	}
		
		Long uId = new Date().getTime();
		yonghu.setId(uId);
        yonghuService.save(yonghu);
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
        YonghuEntity u = yonghuService.getById(id);
        return R.ok().put("data", u);
    }
    
    /**
     * 密码重置
     */
    @IgnoreAuth
	@RequestMapping(value = "/resetPass")
    public R resetPass(String username, HttpServletRequest request){
    	YonghuEntity u = yonghuService.getOne(new QueryWrapper<YonghuEntity>().eq("yonghuzhanghao", username));
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
    	
        yonghuService.updateById(u);
        return R.ok("密码已重置，新密码为：" + newPassword);
    }



    /**
     * 后台列表
     */
    @RequestMapping("/page")
    public R page(@RequestParam Map<String, Object> params,YonghuEntity yonghu,
		HttpServletRequest request){
        QueryWrapper<YonghuEntity> ew = new QueryWrapper<YonghuEntity>();

		PageUtils page = yonghuService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, yonghu), params), params));

        return R.ok().put("data", page);
    }
    
    /**
     * 前台列表
     */
	@IgnoreAuth
    @RequestMapping("/list")
    public R list(@RequestParam Map<String, Object> params,YonghuEntity yonghu, 
		HttpServletRequest request){
        QueryWrapper<YonghuEntity> ew = new QueryWrapper<YonghuEntity>();

		PageUtils page = yonghuService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, yonghu), params), params));
        return R.ok().put("data", page);
    }



	/**
     * 列表
     */
    @RequestMapping("/lists")
    public R list( YonghuEntity yonghu){
       	QueryWrapper<YonghuEntity> ew = new QueryWrapper<YonghuEntity>();
      	ew.allEq(MPUtil.allEQMapPre( yonghu, "yonghu")); 
        return R.ok().put("data", yonghuService.selectListView(ew));
    }

	 /**
     * 查询
     */
    @RequestMapping("/query")
    public R query(YonghuEntity yonghu){
        QueryWrapper< YonghuEntity> ew = new QueryWrapper< YonghuEntity>();
 		ew.allEq(MPUtil.allEQMapPre( yonghu, "yonghu")); 
		YonghuView yonghuView =  yonghuService.selectView(ew);
		return R.ok("查询用户成功").put("data", yonghuView);
    }
	
    /**
     * 后台详情
     */
    @RequestMapping("/info/{id}")
    public R info(@PathVariable("id") Long id){
        YonghuEntity yonghu = yonghuService.getById(id);
        return R.ok().put("data", yonghu);
    }

    /**
     * 前台详情
     */
	@IgnoreAuth
    @RequestMapping("/detail/{id}")
    public R detail(@PathVariable("id") Long id){
        YonghuEntity yonghu = yonghuService.getById(id);
        return R.ok().put("data", yonghu);
    }
    



    /**
     * 后台保存
     */
    @RequestMapping("/save")
    public R save(@RequestBody YonghuEntity yonghu, HttpServletRequest request){
        if(yonghuService.count(new QueryWrapper<YonghuEntity>().eq("yonghuzhanghao", yonghu.getYonghuzhanghao()))>0) {
            return R.error("用户账号已存在");
        }
        long randomSuffix = (long) Math.floor(Math.random() * 1000);
    	yonghu.setId(new Date().getTime() + randomSuffix);
    	//ValidatorUtils.validateEntity(yonghu);
    	YonghuEntity u = yonghuService.getOne(new QueryWrapper<YonghuEntity>().eq("yonghuzhanghao", yonghu.getYonghuzhanghao()));
		if(u!=null) {
			return R.error("用户已存在");
		}
		yonghu.setId(new Date().getTime());
        yonghuService.save(yonghu);
        return R.ok();
    }
    
    /**
     * 前台保存
     */
    @RequestMapping("/add")
    public R add(@RequestBody YonghuEntity yonghu, HttpServletRequest request){
        if(yonghuService.count(new QueryWrapper<YonghuEntity>().eq("yonghuzhanghao", yonghu.getYonghuzhanghao()))>0) {
            return R.error("用户账号已存在");
        }
        long randomSuffix = (long) Math.floor(Math.random() * 1000);
    	yonghu.setId(new Date().getTime() + randomSuffix);
    	//ValidatorUtils.validateEntity(yonghu);
    	YonghuEntity u = yonghuService.getOne(new QueryWrapper<YonghuEntity>().eq("yonghuzhanghao", yonghu.getYonghuzhanghao()));
		if(u!=null) {
			return R.error("用户已存在");
		}
		yonghu.setId(new Date().getTime());
        yonghuService.save(yonghu);
        return R.ok();
    }




    /**
     * 修改
     */
    @RequestMapping("/update")
    @Transactional
    public R update(@RequestBody YonghuEntity yonghu, HttpServletRequest request){
        //ValidatorUtils.validateEntity(yonghu);
        if(yonghuService.count(new QueryWrapper<YonghuEntity>().ne("id", yonghu.getId()).eq("yonghuzhanghao", yonghu.getYonghuzhanghao()))>0) {
            return R.error("用户账号已存在");
        }
        yonghuService.updateById(yonghu);//全部更新
        return R.ok();
    }



    

    /**
     * 删除
     */
    @RequestMapping("/delete")
    public R delete(@RequestBody Long[] ids){
        yonghuService.removeByIds(Arrays.asList(ids));
        return R.ok();
    }
    
    /**
     * 提醒接口
     */
	@RequestMapping("/remind/{columnName}/{type}")
	public R remindCount(@PathVariable("columnName") String columnName, HttpServletRequest request, 
						 @PathVariable("type") String type,@RequestParam Map<String, Object> map) {
		map.put("column", columnName);
		map.put("type", type);
		
		if(type.equals("2")) {
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			Calendar c = Calendar.getInstance();
			Date remindStartDate = null;
			Date remindEndDate = null;
			if(map.get("remindstart")!=null) {
				try {
					Integer remindStart = Integer.parseInt(map.get("remindstart").toString());
					c.setTime(new Date()); 
					c.add(Calendar.DAY_OF_MONTH,remindStart);
					remindStartDate = c.getTime();
					map.put("remindstart", sdf.format(remindStartDate));
				} catch (NumberFormatException e) {
					// 如果remindstart不是数字，忽略该参数
					map.remove("remindstart");
				}
			}
			if(map.get("remindend")!=null) {
				try {
					Integer remindEnd = Integer.parseInt(map.get("remindend").toString());
					c.setTime(new Date());
					c.add(Calendar.DAY_OF_MONTH,remindEnd);
					remindEndDate = c.getTime();
					map.put("remindend", sdf.format(remindEndDate));
				} catch (NumberFormatException e) {
					// 如果remindend不是数字，忽略该参数
					map.remove("remindend");
				}
			}
		}
		
		QueryWrapper<YonghuEntity> wrapper = new QueryWrapper<YonghuEntity>();
		if(map.get("remindstart")!=null) {
			// PostgreSQL需要显式类型转换，将字符串转换为date类型
			if(type.equals("2")) {
				// 获取日期字符串值，确保是有效的日期格式
				Object remindStartValue = map.get("remindstart");
				if(remindStartValue != null) {
					String dateStr = remindStartValue.toString();
					// 验证日期格式，确保是 yyyy-MM-dd 格式
					if(!dateStr.isEmpty() && !dateStr.equals(columnName) && dateStr.matches("\\d{4}-\\d{2}-\\d{2}")) {
						// 使用apply方法进行类型转换，{0}是MyBatis-Plus的参数占位符
						wrapper.apply("CAST(" + columnName + " AS DATE) >= CAST({0} AS DATE)", dateStr);
					}
				}
			} else {
				wrapper.ge(columnName, map.get("remindstart"));
			}
		}
		if(map.get("remindend")!=null) {
			// PostgreSQL需要显式类型转换，将字符串转换为date类型
			if(type.equals("2")) {
				// 获取日期字符串值，确保是有效的日期格式
				Object remindEndValue = map.get("remindend");
				if(remindEndValue != null) {
					String dateStr = remindEndValue.toString();
					// 验证日期格式，确保是 yyyy-MM-dd 格式
					if(!dateStr.isEmpty() && !dateStr.equals(columnName) && dateStr.matches("\\d{4}-\\d{2}-\\d{2}")) {
						// 使用apply方法进行类型转换，{0}是MyBatis-Plus的参数占位符
						wrapper.apply("CAST(" + columnName + " AS DATE) <= CAST({0} AS DATE)", dateStr);
					}
				}
			} else {
				wrapper.le(columnName, map.get("remindend"));
			}
		}


		int count = (int) yonghuService.count(wrapper);
		return R.ok().put("count", count);
	}
	



    /**
     * （按值统计）
     */
    @RequestMapping("/value/{xColumnName}/{yColumnName}")
    public R value(@PathVariable("yColumnName") String yColumnName, @PathVariable("xColumnName") String xColumnName,HttpServletRequest request) {
        Map<String, Object> params = new HashMap<String, Object>();
        params.put("xColumn", xColumnName);
        params.put("yColumn", yColumnName);
        QueryWrapper<YonghuEntity> ew = new QueryWrapper<YonghuEntity>();
        List<Map<String, Object>> result = yonghuService.selectValue(params, ew);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        for(Map<String, Object> m : result) {
            for(String k : m.keySet()) {
                if(m.get(k) instanceof Date) {
                    m.put(k, sdf.format((Date)m.get(k)));
                }
            }
        }
        return R.ok().put("data", result);
    }

    /**
     * （按值统计）多列
     */
    @RequestMapping("/valueMul/{xColumnName}")
    public R valueMul(@PathVariable("xColumnName") String xColumnName,@RequestParam String yColumnNameMul, HttpServletRequest request) {
        String[] yColumnNames = yColumnNameMul.split(",");
        Map<String, Object> params = new HashMap<String, Object>();
        params.put("xColumn", xColumnName);
        List<List<Map<String, Object>>> result2 = new ArrayList<List<Map<String,Object>>>();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        QueryWrapper<YonghuEntity> ew = new QueryWrapper<YonghuEntity>();
        for(int i=0;i<yColumnNames.length;i++) {
            params.put("yColumn", yColumnNames[i]);
            List<Map<String, Object>> result = yonghuService.selectValue(params, ew);
            for(Map<String, Object> m : result) {
                for(String k : m.keySet()) {
                    if(m.get(k) instanceof Date) {
                        m.put(k, sdf.format((Date)m.get(k)));
                    }
                }
            }
            result2.add(result);
        }
        return R.ok().put("data", result2);
    }

    /**
     * （按值统计）时间统计类型
     */
    @RequestMapping("/value/{xColumnName}/{yColumnName}/{timeStatType}")
    public R valueDay(@PathVariable("yColumnName") String yColumnName, @PathVariable("xColumnName") String xColumnName, @PathVariable("timeStatType") String timeStatType,HttpServletRequest request) {
        Map<String, Object> params = new HashMap<String, Object>();
        params.put("xColumn", xColumnName);
        params.put("yColumn", yColumnName);
        params.put("timeStatType", timeStatType);
        QueryWrapper<YonghuEntity> ew = new QueryWrapper<YonghuEntity>();
        List<Map<String, Object>> result = yonghuService.selectTimeStatValue(params, ew);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        for(Map<String, Object> m : result) {
            for(String k : m.keySet()) {
                if(m.get(k) instanceof Date) {
                    m.put(k, sdf.format((Date)m.get(k)));
                }
            }
        }
        return R.ok().put("data", result);
    }

    /**
     * （按值统计）时间统计类型(多列)
     */
    @RequestMapping("/valueMul/{xColumnName}/{timeStatType}")
    public R valueMulDay(@PathVariable("xColumnName") String xColumnName, @PathVariable("timeStatType") String timeStatType,@RequestParam String yColumnNameMul,HttpServletRequest request) {
        String[] yColumnNames = yColumnNameMul.split(",");
        Map<String, Object> params = new HashMap<String, Object>();
        params.put("xColumn", xColumnName);
        params.put("timeStatType", timeStatType);
        List<List<Map<String, Object>>> result2 = new ArrayList<List<Map<String,Object>>>();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        QueryWrapper<YonghuEntity> ew = new QueryWrapper<YonghuEntity>();
        for(int i=0;i<yColumnNames.length;i++) {
            params.put("yColumn", yColumnNames[i]);
            List<Map<String, Object>> result = yonghuService.selectTimeStatValue(params, ew);
            for(Map<String, Object> m : result) {
                for(String k : m.keySet()) {
                    if(m.get(k) instanceof Date) {
                        m.put(k, sdf.format((Date)m.get(k)));
                    }
                }
            }
            result2.add(result);
        }
        return R.ok().put("data", result2);
    }

    /**
     * 分组统计
     */
    @RequestMapping("/group/{columnName}")
    public R group(@PathVariable("columnName") String columnName,HttpServletRequest request) {
        Map<String, Object> params = new HashMap<String, Object>();
        params.put("column", columnName);
        QueryWrapper<YonghuEntity> ew = new QueryWrapper<YonghuEntity>();
        List<Map<String, Object>> result = yonghuService.selectGroup(params, ew);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        for(Map<String, Object> m : result) {
            for(String k : m.keySet()) {
                if(m.get(k) instanceof Date) {
                    m.put(k, sdf.format((Date)m.get(k)));
                }
            }
        }
        return R.ok().put("data", result);
    }

    /**
     * 总数统计
     */
    @RequestMapping("/count")
    public R count(@RequestParam Map<String, Object> params,YonghuEntity yonghu, HttpServletRequest request){
        QueryWrapper<YonghuEntity> ew = new QueryWrapper<YonghuEntity>();
        int count = (int) yonghuService.count(MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, yonghu), params), params));
        return R.ok().put("data", count);
    }



}
