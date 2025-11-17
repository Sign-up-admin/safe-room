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

import com.entity.JianshenqicaiEntity;
import com.entity.view.JianshenqicaiView;

import com.service.JianshenqicaiService;
import com.service.TokenService;
import com.utils.PageUtils;
import com.utils.R;
import com.utils.MPUtil;
import com.utils.MapUtils;
import com.utils.CommonUtil;
import java.io.IOException;

/**
 * 健身器材
 * 后端接口
 * @author 
 * @email 
 * @date 2024-06-20 10:35:10
 */
@RestController
@RequestMapping("/jianshenqicai")
public class JianshenqicaiController {
    @Autowired
    private JianshenqicaiService jianshenqicaiService;




    



    /**
     * 后台列表
     */
    @RequestMapping("/page")
    public R page(@RequestParam Map<String, Object> params,JianshenqicaiEntity jianshenqicai,
		HttpServletRequest request){
        QueryWrapper<JianshenqicaiEntity> ew = new QueryWrapper<JianshenqicaiEntity>();

		PageUtils page = jianshenqicaiService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, jianshenqicai), params), params));

        return R.ok().put("data", page);
    }
    
    /**
     * 前台列表
     */
	@IgnoreAuth
    @RequestMapping("/list")
    public R list(@RequestParam Map<String, Object> params,JianshenqicaiEntity jianshenqicai, 
		HttpServletRequest request){
        QueryWrapper<JianshenqicaiEntity> ew = new QueryWrapper<JianshenqicaiEntity>();

		PageUtils page = jianshenqicaiService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, jianshenqicai), params), params));
        return R.ok().put("data", page);
    }



	/**
     * 列表
     */
    @RequestMapping("/lists")
    public R list( JianshenqicaiEntity jianshenqicai){
       	QueryWrapper<JianshenqicaiEntity> ew = new QueryWrapper<JianshenqicaiEntity>();
      	ew.allEq(MPUtil.allEQMapPre( jianshenqicai, "jianshenqicai")); 
        return R.ok().put("data", jianshenqicaiService.selectListView(ew));
    }

	 /**
     * 查询
     */
    @RequestMapping("/query")
    public R query(JianshenqicaiEntity jianshenqicai){
        QueryWrapper< JianshenqicaiEntity> ew = new QueryWrapper< JianshenqicaiEntity>();
 		ew.allEq(MPUtil.allEQMapPre( jianshenqicai, "jianshenqicai")); 
		JianshenqicaiView jianshenqicaiView =  jianshenqicaiService.selectView(ew);
		return R.ok("查询健身器材成功").put("data", jianshenqicaiView);
    }
	
    /**
     * 后台详情
     */
    @RequestMapping("/info/{id}")
    public R info(@PathVariable("id") Long id){
        JianshenqicaiEntity jianshenqicai = jianshenqicaiService.getById(id);
        return R.ok().put("data", jianshenqicai);
    }

    /**
     * 前台详情
     */
	@IgnoreAuth
    @RequestMapping("/detail/{id}")
    public R detail(@PathVariable("id") Long id){
        JianshenqicaiEntity jianshenqicai = jianshenqicaiService.getById(id);
        return R.ok().put("data", jianshenqicai);
    }
    



    /**
     * 后台保存
     */
    @RequestMapping("/save")
    public R save(@RequestBody JianshenqicaiEntity jianshenqicai, HttpServletRequest request){
    	//ValidatorUtils.validateEntity(jianshenqicai);
        jianshenqicaiService.save(jianshenqicai);
        return R.ok();
    }
    
    /**
     * 前台保存
     */
    @RequestMapping("/add")
    public R add(@RequestBody JianshenqicaiEntity jianshenqicai, HttpServletRequest request){
    	//ValidatorUtils.validateEntity(jianshenqicai);
        jianshenqicaiService.save(jianshenqicai);
        return R.ok();
    }





    /**
     * 修改
     */
    @RequestMapping("/update")
    @Transactional
    public R update(@RequestBody JianshenqicaiEntity jianshenqicai, HttpServletRequest request){
        //ValidatorUtils.validateEntity(jianshenqicai);
        jianshenqicaiService.updateById(jianshenqicai);//全部更新
        return R.ok();
    }



    

    /**
     * 删除
     */
    @RequestMapping("/delete")
    public R delete(@RequestBody Long[] ids){
        jianshenqicaiService.removeByIds(Arrays.asList(ids));
        return R.ok();
    }
    
	










}
