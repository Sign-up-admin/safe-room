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

import com.entity.KechengyuyueEntity;
import com.entity.view.KechengyuyueView;

import com.service.KechengyuyueService;
import com.service.TokenService;
import com.utils.PageUtils;
import com.utils.R;
import com.utils.MPUtil;
import com.utils.MapUtils;
import com.utils.CommonUtil;
import java.io.IOException;

/**
 * 课程预约
 * 后端接口
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
@RestController
@RequestMapping("/kechengyuyue")
public class KechengyuyueController {
    @Autowired
    private KechengyuyueService kechengyuyueService;




    



    /**
     * 后台列表
     */
    @RequestMapping("/page")
    public R page(@RequestParam Map<String, Object> params,KechengyuyueEntity kechengyuyue,
		HttpServletRequest request){
		String tableName = request.getSession().getAttribute("tableName").toString();
		if(tableName.equals("jianshenjiaolian")) {
			kechengyuyue.setJiaoliangonghao((String)request.getSession().getAttribute("username"));
		}
		if(tableName.equals("yonghu")) {
			kechengyuyue.setYonghuzhanghao((String)request.getSession().getAttribute("username"));
		}
        QueryWrapper<KechengyuyueEntity> ew = new QueryWrapper<KechengyuyueEntity>();

		PageUtils page = kechengyuyueService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, kechengyuyue), params), params));

        return R.ok().put("data", page);
    }
    
    /**
     * 前台列表（会员端自动过滤）
     */
    @RequestMapping("/list")
    public R list(@RequestParam Map<String, Object> params,KechengyuyueEntity kechengyuyue, 
		HttpServletRequest request){
        QueryWrapper<KechengyuyueEntity> ew = new QueryWrapper<KechengyuyueEntity>();
        
        // 会员端自动注入yonghuzhanghao过滤
        String tableName = (String)request.getSession().getAttribute("tableName");
        if(tableName != null && tableName.equals("yonghu")) {
            kechengyuyue.setYonghuzhanghao((String)request.getSession().getAttribute("username"));
        }

		PageUtils page = kechengyuyueService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, kechengyuyue), params), params));
        return R.ok().put("data", page);
    }



	/**
     * 列表
     */
    @RequestMapping("/lists")
    public R list( KechengyuyueEntity kechengyuyue){
       	QueryWrapper<KechengyuyueEntity> ew = new QueryWrapper<KechengyuyueEntity>();
      	ew.allEq(MPUtil.allEQMapPre( kechengyuyue, "kechengyuyue")); 
        return R.ok().put("data", kechengyuyueService.selectListView(ew));
    }

	 /**
     * 查询
     */
    @RequestMapping("/query")
    public R query(KechengyuyueEntity kechengyuyue){
        QueryWrapper< KechengyuyueEntity> ew = new QueryWrapper< KechengyuyueEntity>();
 		ew.allEq(MPUtil.allEQMapPre( kechengyuyue, "kechengyuyue")); 
		KechengyuyueView kechengyuyueView =  kechengyuyueService.selectView(ew);
		return R.ok("查询课程预约成功").put("data", kechengyuyueView);
    }
	
    /**
     * 后台详情
     */
    @RequestMapping("/info/{id}")
    public R info(@PathVariable("id") Long id){
        KechengyuyueEntity kechengyuyue = kechengyuyueService.getById(id);
        return R.ok().put("data", kechengyuyue);
    }

    /**
     * 前台详情
     */
	@IgnoreAuth
    @RequestMapping("/detail/{id}")
    public R detail(@PathVariable("id") Long id){
        KechengyuyueEntity kechengyuyue = kechengyuyueService.getById(id);
        return R.ok().put("data", kechengyuyue);
    }
    



    /**
     * 后台保存
     */
    @RequestMapping("/save")
    public R save(@RequestBody KechengyuyueEntity kechengyuyue, HttpServletRequest request){
    	//ValidatorUtils.validateEntity(kechengyuyue);
        kechengyuyueService.save(kechengyuyue);
        return R.ok();
    }
    
    /**
     * 前台保存
     */
    @RequestMapping("/add")
    public R add(@RequestBody KechengyuyueEntity kechengyuyue, HttpServletRequest request){
    	//ValidatorUtils.validateEntity(kechengyuyue);
        kechengyuyueService.save(kechengyuyue);
        return R.ok();
    }





    /**
     * 修改
     */
    @RequestMapping("/update")
    @Transactional
    public R update(@RequestBody KechengyuyueEntity kechengyuyue, HttpServletRequest request){
        //ValidatorUtils.validateEntity(kechengyuyue);
        kechengyuyueService.updateById(kechengyuyue);//全部更新
        return R.ok();
    }

    /**
     * 审核
     */
    @RequestMapping("/shBatch")
    @Transactional
    public R update(@RequestBody Long[] ids, @RequestParam String sfsh, @RequestParam String shhf){
        List<KechengyuyueEntity> list = new ArrayList<KechengyuyueEntity>();
        for(Long id : ids) {
            KechengyuyueEntity kechengyuyue = kechengyuyueService.getById(id);
            kechengyuyue.setSfsh(sfsh);
            kechengyuyue.setShhf(shhf);
            list.add(kechengyuyue);
        }
        kechengyuyueService.updateBatchById(list);
        return R.ok();
    }


    

    /**
     * 删除
     */
    @RequestMapping("/delete")
    public R delete(@RequestBody Long[] ids){
        kechengyuyueService.removeByIds(Arrays.asList(ids));
        return R.ok();
    }
    
	






    /**
     * （按值统计）
     */
    @RequestMapping("/value/{xColumnName}/{yColumnName}")
    public R value(@PathVariable("yColumnName") String yColumnName, @PathVariable("xColumnName") String xColumnName,HttpServletRequest request) {
        Map<String, Object> params = new HashMap<String, Object>();
        params.put("xColumn", xColumnName);
        params.put("yColumn", yColumnName);
        QueryWrapper<KechengyuyueEntity> ew = new QueryWrapper<KechengyuyueEntity>();
		String tableName = request.getSession().getAttribute("tableName").toString();
		if(tableName.equals("jianshenjiaolian")) {
            ew.eq("jiaoliangonghao", (String)request.getSession().getAttribute("username"));
		}
		if(tableName.equals("yonghu")) {
            ew.eq("yonghuzhanghao", (String)request.getSession().getAttribute("username"));
		}
        List<Map<String, Object>> result = kechengyuyueService.selectValue(params, ew);
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
     * （按值统�?�?�?
     */
    @RequestMapping("/valueMul/{xColumnName}")
    public R valueMul(@PathVariable("xColumnName") String xColumnName,@RequestParam String yColumnNameMul, HttpServletRequest request) {
        String[] yColumnNames = yColumnNameMul.split(",");
        Map<String, Object> params = new HashMap<String, Object>();
        params.put("xColumn", xColumnName);
        List<List<Map<String, Object>>> result2 = new ArrayList<List<Map<String,Object>>>();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        QueryWrapper<KechengyuyueEntity> ew = new QueryWrapper<KechengyuyueEntity>();
        String tableName = request.getSession().getAttribute("tableName").toString();
        if(tableName.equals("jianshenjiaolian")) {
            ew.eq("jiaoliangonghao", (String)request.getSession().getAttribute("username"));
        }
        if(tableName.equals("yonghu")) {
            ew.eq("yonghuzhanghao", (String)request.getSession().getAttribute("username"));
        }
        for(int i=0;i<yColumnNames.length;i++) {
            params.put("yColumn", yColumnNames[i]);
            List<Map<String, Object>> result = kechengyuyueService.selectValue(params, ew);
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
        QueryWrapper<KechengyuyueEntity> ew = new QueryWrapper<KechengyuyueEntity>();
        String tableName = request.getSession().getAttribute("tableName").toString();
        if(tableName.equals("jianshenjiaolian")) {
            ew.eq("jiaoliangonghao", (String)request.getSession().getAttribute("username"));
        }
        if(tableName.equals("yonghu")) {
            ew.eq("yonghuzhanghao", (String)request.getSession().getAttribute("username"));
        }
        List<Map<String, Object>> result = kechengyuyueService.selectTimeStatValue(params, ew);
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
     * （按值统计）时间统计类型(�?
     */
    @RequestMapping("/valueMul/{xColumnName}/{timeStatType}")
    public R valueMulDay(@PathVariable("xColumnName") String xColumnName, @PathVariable("timeStatType") String timeStatType,@RequestParam String yColumnNameMul,HttpServletRequest request) {
        String[] yColumnNames = yColumnNameMul.split(",");
        Map<String, Object> params = new HashMap<String, Object>();
        params.put("xColumn", xColumnName);
        params.put("timeStatType", timeStatType);
        List<List<Map<String, Object>>> result2 = new ArrayList<List<Map<String,Object>>>();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        QueryWrapper<KechengyuyueEntity> ew = new QueryWrapper<KechengyuyueEntity>();
        String tableName = request.getSession().getAttribute("tableName").toString();
        if(tableName.equals("jianshenjiaolian")) {
            ew.eq("jiaoliangonghao", (String)request.getSession().getAttribute("username"));
        }
        if(tableName.equals("yonghu")) {
            ew.eq("yonghuzhanghao", (String)request.getSession().getAttribute("username"));
        }
        for(int i=0;i<yColumnNames.length;i++) {
            params.put("yColumn", yColumnNames[i]);
            List<Map<String, Object>> result = kechengyuyueService.selectTimeStatValue(params, ew);
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
        QueryWrapper<KechengyuyueEntity> ew = new QueryWrapper<KechengyuyueEntity>();
        String tableName = request.getSession().getAttribute("tableName").toString();
        if(tableName.equals("jianshenjiaolian")) {
            ew.eq("jiaoliangonghao", (String)request.getSession().getAttribute("username"));
        }
        if(tableName.equals("yonghu")) {
            ew.eq("yonghuzhanghao", (String)request.getSession().getAttribute("username"));
        }
        List<Map<String, Object>> result = kechengyuyueService.selectGroup(params, ew);
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
     * 总数�?
     */
    @RequestMapping("/count")
    public R count(@RequestParam Map<String, Object> params,KechengyuyueEntity kechengyuyue, HttpServletRequest request){
        String tableName = request.getSession().getAttribute("tableName").toString();
        if(tableName.equals("jianshenjiaolian")) {
            kechengyuyue.setJiaoliangonghao((String)request.getSession().getAttribute("username"));
        }
        if(tableName.equals("yonghu")) {
            kechengyuyue.setYonghuzhanghao((String)request.getSession().getAttribute("username"));
        }
        QueryWrapper<KechengyuyueEntity> ew = new QueryWrapper<KechengyuyueEntity>();
        int count = (int) kechengyuyueService.count(MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, kechengyuyue), params), params));
        return R.ok().put("data", count);
    }



}
