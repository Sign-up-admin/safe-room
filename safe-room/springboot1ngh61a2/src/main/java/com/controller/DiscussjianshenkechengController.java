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

import com.entity.DiscussjianshenkechengEntity;
import com.entity.view.DiscussjianshenkechengView;

import com.service.DiscussjianshenkechengService;
import com.service.TokenService;
import com.utils.PageUtils;
import com.utils.R;
import com.utils.MPUtil;
import com.utils.MapUtils;
import com.utils.CommonUtil;
import java.io.IOException;

/**
 * 健身课程评论表
 * 后端接口
 * @author 
 * @email 
 * @date 2024-06-20 10:35:10
 */
@RestController
@RequestMapping("/discussjianshenkecheng")
public class DiscussjianshenkechengController {
    @Autowired
    private DiscussjianshenkechengService discussjianshenkechengService;




    



    /**
     * 后台列表
     */
    @RequestMapping("/page")
    public R page(@RequestParam Map<String, Object> params,DiscussjianshenkechengEntity discussjianshenkecheng,
		HttpServletRequest request){
        QueryWrapper<DiscussjianshenkechengEntity> ew = new QueryWrapper<DiscussjianshenkechengEntity>();

		PageUtils page = discussjianshenkechengService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, discussjianshenkecheng), params), params));

        return R.ok().put("data", page);
    }
    
    /**
     * 前台列表
     */
	@IgnoreAuth
    @RequestMapping("/list")
    public R list(@RequestParam Map<String, Object> params,DiscussjianshenkechengEntity discussjianshenkecheng, 
		HttpServletRequest request){
        QueryWrapper<DiscussjianshenkechengEntity> ew = new QueryWrapper<DiscussjianshenkechengEntity>();

		PageUtils page = discussjianshenkechengService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, discussjianshenkecheng), params), params));
        return R.ok().put("data", page);
    }



	/**
     * 列表
     */
    @RequestMapping("/lists")
    public R list( DiscussjianshenkechengEntity discussjianshenkecheng){
       	QueryWrapper<DiscussjianshenkechengEntity> ew = new QueryWrapper<DiscussjianshenkechengEntity>();
      	ew.allEq(MPUtil.allEQMapPre( discussjianshenkecheng, "discussjianshenkecheng")); 
        return R.ok().put("data", discussjianshenkechengService.selectListView(ew));
    }

	 /**
     * 查询
     */
    @RequestMapping("/query")
    public R query(DiscussjianshenkechengEntity discussjianshenkecheng){
        QueryWrapper< DiscussjianshenkechengEntity> ew = new QueryWrapper< DiscussjianshenkechengEntity>();
 		ew.allEq(MPUtil.allEQMapPre( discussjianshenkecheng, "discussjianshenkecheng")); 
		DiscussjianshenkechengView discussjianshenkechengView =  discussjianshenkechengService.selectView(ew);
		return R.ok("查询健身课程评论表成功").put("data", discussjianshenkechengView);
    }
	
    /**
     * 后台详情
     */
    @RequestMapping("/info/{id}")
    public R info(@PathVariable("id") Long id){
        DiscussjianshenkechengEntity discussjianshenkecheng = discussjianshenkechengService.getById(id);
        return R.ok().put("data", discussjianshenkecheng);
    }

    /**
     * 前台详情
     */
	@IgnoreAuth
    @RequestMapping("/detail/{id}")
    public R detail(@PathVariable("id") Long id){
        DiscussjianshenkechengEntity discussjianshenkecheng = discussjianshenkechengService.getById(id);
        return R.ok().put("data", discussjianshenkecheng);
    }
    



    /**
     * 后台保存
     */
    @RequestMapping("/save")
    public R save(@RequestBody DiscussjianshenkechengEntity discussjianshenkecheng, HttpServletRequest request){
    	//ValidatorUtils.validateEntity(discussjianshenkecheng);
        discussjianshenkechengService.save(discussjianshenkecheng);
        return R.ok();
    }
    
    /**
     * 前台保存
     */
    @RequestMapping("/add")
    public R add(@RequestBody DiscussjianshenkechengEntity discussjianshenkecheng, HttpServletRequest request){
    	//ValidatorUtils.validateEntity(discussjianshenkecheng);
    	// 如果未设置审核状态，默认为待审核
    	if(StringUtils.isBlank(discussjianshenkecheng.getSfsh())) {
    		discussjianshenkecheng.setSfsh("待审核");
    	}
    	// 设置点击时间
    	if(discussjianshenkecheng.getClicktime() == null) {
    		discussjianshenkecheng.setClicktime(new Date());
    	}
        discussjianshenkechengService.save(discussjianshenkecheng);
        return R.ok();
    }



     /**
     * 获取用户密保
     */
    @RequestMapping("/security")
    @IgnoreAuth
    public R security(@RequestParam String username){
        DiscussjianshenkechengEntity discussjianshenkecheng = discussjianshenkechengService.getOne(new QueryWrapper<DiscussjianshenkechengEntity>().eq("", username));
        return R.ok().put("data", discussjianshenkecheng);
    }


    /**
     * 修改（可用于回复）
     */
    @RequestMapping("/update")
    @Transactional
    public R update(@RequestBody DiscussjianshenkechengEntity discussjianshenkecheng, HttpServletRequest request){
        //ValidatorUtils.validateEntity(discussjianshenkecheng);
        // 如果更新了回复内容，自动更新审核状态为已通过（可选）
        if(StringUtils.isNotBlank(discussjianshenkecheng.getReply()) && StringUtils.isBlank(discussjianshenkecheng.getSfsh())) {
            // 保持原有审核状态，不自动修改
        }
        discussjianshenkechengService.updateById(discussjianshenkecheng);//全部更新
        return R.ok();
    }



    

    /**
     * 删除
     */
    @RequestMapping("/delete")
    public R delete(@RequestBody Long[] ids){
        discussjianshenkechengService.removeByIds(Arrays.asList(ids));
        return R.ok();
    }
    
	/**
     * 前台智能排序
     */
	@IgnoreAuth
    @RequestMapping("/autoSort")
    public R autoSort(@RequestParam Map<String, Object> params,DiscussjianshenkechengEntity discussjianshenkecheng, HttpServletRequest request,String pre){
        QueryWrapper<DiscussjianshenkechengEntity> ew = new QueryWrapper<DiscussjianshenkechengEntity>();
        Map<String, Object> newMap = new HashMap<String, Object>();
        Map<String, Object> param = new HashMap<String, Object>();
		Iterator<Map.Entry<String, Object>> it = param.entrySet().iterator();
		while (it.hasNext()) {
			Map.Entry<String, Object> entry = it.next();
			String key = entry.getKey();
			String newKey = entry.getKey();
			if (pre.endsWith(".")) {
				newMap.put(pre + newKey, entry.getValue());
			} else if (StringUtils.isEmpty(pre)) {
				newMap.put(newKey, entry.getValue());
			} else {
				newMap.put(pre + "." + newKey, entry.getValue());
			}
		}
		params.put("sort", "clicktime");
        params.put("order", "desc");
		PageUtils page = discussjianshenkechengService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, discussjianshenkecheng), params), params));
        return R.ok().put("data", page);
    }





}
