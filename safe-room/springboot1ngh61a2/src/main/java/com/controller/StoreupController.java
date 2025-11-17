package com.controller;

import java.util.Arrays;
import java.util.Map;
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

import com.entity.StoreupEntity;
import com.entity.view.StoreupView;

import com.service.StoreupService;
import com.utils.PageUtils;
import com.utils.R;
import com.utils.MPUtil;

/**
 * 收藏表
 * 后端接口
 * @author 
 * @email 
 * @date 2024-06-20 10:35:10
 */
@RestController
@RequestMapping("/storeup")
public class StoreupController {
    @Autowired
    private StoreupService storeupService;




    



    /**
     * 后台列表
     */
    @RequestMapping("/page")
    public R page(@RequestParam Map<String, Object> params,StoreupEntity storeup,
		HttpServletRequest request){
        Object role = request.getSession().getAttribute("role");
        if(role == null || !role.toString().equals("管理员")) {
            Object userId = request.getSession().getAttribute("userId");
            if(userId != null) {
                storeup.setUserid((Long)userId);
            }
        }
        QueryWrapper<StoreupEntity> ew = new QueryWrapper<StoreupEntity>();

		PageUtils page = storeupService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, storeup), params), params));

        return R.ok().put("data", page);
    }
    
    /**
     * 前台列表（用户只能看到自己的收藏）
     */
    @RequestMapping("/list")
    public R list(@RequestParam Map<String, Object> params,StoreupEntity storeup, 
		HttpServletRequest request){
        QueryWrapper<StoreupEntity> ew = new QueryWrapper<StoreupEntity>();
        
        // 普通用户只能看到自己的收藏
        Object role = request.getSession().getAttribute("role");
        if(role == null || !role.toString().equals("管理员")) {
            Object userId = request.getSession().getAttribute("userId");
            if(userId != null) {
                storeup.setUserid((Long)userId);
            }
        }

		PageUtils page = storeupService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, storeup), params), params));
        return R.ok().put("data", page);
    }



	/**
     * 列表
     */
    @RequestMapping("/lists")
    public R list( StoreupEntity storeup){
       	QueryWrapper<StoreupEntity> ew = new QueryWrapper<StoreupEntity>();
      	ew.allEq(MPUtil.allEQMapPre( storeup, "storeup")); 
        return R.ok().put("data", storeupService.selectListView(ew));
    }

	 /**
     * 查询
     */
    @RequestMapping("/query")
    public R query(StoreupEntity storeup){
        QueryWrapper< StoreupEntity> ew = new QueryWrapper< StoreupEntity>();
 		ew.allEq(MPUtil.allEQMapPre( storeup, "storeup")); 
		StoreupView storeupView =  storeupService.selectView(ew);
		return R.ok("查询收藏表成功").put("data", storeupView);
    }
	
    /**
     * 后台详情
     */
    @RequestMapping("/info/{id}")
    public R info(@PathVariable("id") Long id){
        StoreupEntity storeup = storeupService.getById(id);
        return R.ok().put("data", storeup);
    }

    /**
     * 前台详情
     */
	@IgnoreAuth
    @RequestMapping("/detail/{id}")
    public R detail(@PathVariable("id") Long id){
        StoreupEntity storeup = storeupService.getById(id);
        return R.ok().put("data", storeup);
    }
    



    /**
     * 后台保存
     */
    @RequestMapping("/save")
    public R save(@RequestBody StoreupEntity storeup, HttpServletRequest request){
    	//ValidatorUtils.validateEntity(storeup);
    	Object userId = request.getSession().getAttribute("userId");
    	if(userId != null) {
    		storeup.setUserid((Long)userId);
    	}
        storeupService.save(storeup);
        return R.ok();
    }
    
    /**
     * 前台保存
     */
    @RequestMapping("/add")
    public R add(@RequestBody StoreupEntity storeup, HttpServletRequest request){
    	//ValidatorUtils.validateEntity(storeup);
    	// 自动注入用户ID
    	Object userId = request.getSession().getAttribute("userId");
    	if(userId != null) {
    		storeup.setUserid((Long)userId);
    	}
        storeupService.save(storeup);
        return R.ok();
    }

    /**
     * 修改
     */
    @RequestMapping("/update")
    @Transactional
    @IgnoreAuth
    public R update(@RequestBody StoreupEntity storeup, HttpServletRequest request){
        //ValidatorUtils.validateEntity(storeup);
        storeupService.updateById(storeup);//全部更新
        return R.ok();
    }



    

    /**
     * 删除
     */
    @RequestMapping("/delete")
    public R delete(@RequestBody Long[] ids){
        storeupService.removeByIds(Arrays.asList(ids));
        return R.ok();
    }
    
	
	/**
     * 前台智能排序
     */
	@IgnoreAuth
    @RequestMapping("/autoSort")
    public R autoSort(@RequestParam Map<String, Object> params,StoreupEntity storeup, HttpServletRequest request,String pre){
        QueryWrapper<StoreupEntity> ew = new QueryWrapper<StoreupEntity>();
		// 强制使用 addtime 排序，因为 storeup 表中没有 clicktime 列
		params.remove("sort");
		params.remove("order");
		params.put("sort", "addtime");
        params.put("order", "desc");
		PageUtils page = storeupService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, storeup), params), params));
        return R.ok().put("data", page);
    }





}
