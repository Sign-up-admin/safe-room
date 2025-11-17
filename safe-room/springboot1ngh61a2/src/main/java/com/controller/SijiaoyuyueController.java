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

import com.entity.SijiaoyuyueEntity;
import com.entity.view.SijiaoyuyueView;

import com.service.SijiaoyuyueService;
import com.service.TokenService;
import com.utils.PageUtils;
import com.utils.R;
import com.utils.MPUtil;
import com.utils.MapUtils;
import com.utils.CommonUtil;
import java.io.IOException;

/**
 * 私教预约
 * 后端接口
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
@RestController
@RequestMapping("/sijiaoyuyue")
public class SijiaoyuyueController {
    @Autowired
    private SijiaoyuyueService sijiaoyuyueService;






    /**
     * 后台列表
     */
    @RequestMapping("/page")
    public R page(@RequestParam Map<String, Object> params,SijiaoyuyueEntity sijiaoyuyue,
		HttpServletRequest request){
		String tableName = request.getSession().getAttribute("tableName").toString();
		if(tableName.equals("jianshenjiaolian")) {
			sijiaoyuyue.setJiaoliangonghao((String)request.getSession().getAttribute("username"));
		}
		if(tableName.equals("yonghu")) {
			sijiaoyuyue.setYonghuzhanghao((String)request.getSession().getAttribute("username"));
		}
        QueryWrapper<SijiaoyuyueEntity> ew = new QueryWrapper<SijiaoyuyueEntity>();

		PageUtils page = sijiaoyuyueService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, sijiaoyuyue), params), params));

        return R.ok().put("data", page);
    }
    
    /**
     * 前台列表（会员/教练端自动过滤）
     */
    @RequestMapping("/list")
    public R list(@RequestParam Map<String, Object> params,SijiaoyuyueEntity sijiaoyuyue, 
		HttpServletRequest request){
        QueryWrapper<SijiaoyuyueEntity> ew = new QueryWrapper<SijiaoyuyueEntity>();
        
        // 会员/教练端自动注入账号过滤
        String tableName = (String)request.getSession().getAttribute("tableName");
        if(tableName != null) {
            if(tableName.equals("jianshenjiaolian")) {
                sijiaoyuyue.setJiaoliangonghao((String)request.getSession().getAttribute("username"));
            } else if(tableName.equals("yonghu")) {
                sijiaoyuyue.setYonghuzhanghao((String)request.getSession().getAttribute("username"));
            }
        }

		PageUtils page = sijiaoyuyueService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, sijiaoyuyue), params), params));
        return R.ok().put("data", page);
    }



	/**
     * 列表
     */
    @RequestMapping("/lists")
    public R list( SijiaoyuyueEntity sijiaoyuyue){
       	QueryWrapper<SijiaoyuyueEntity> ew = new QueryWrapper<SijiaoyuyueEntity>();
      	ew.allEq(MPUtil.allEQMapPre( sijiaoyuyue, "sijiaoyuyue")); 
        return R.ok().put("data", sijiaoyuyueService.selectListView(ew));
    }

	 /**
     * 查询
     */
    @RequestMapping("/query")
    public R query(SijiaoyuyueEntity sijiaoyuyue){
        QueryWrapper< SijiaoyuyueEntity> ew = new QueryWrapper< SijiaoyuyueEntity>();
 		ew.allEq(MPUtil.allEQMapPre( sijiaoyuyue, "sijiaoyuyue")); 
		SijiaoyuyueView sijiaoyuyueView =  sijiaoyuyueService.selectView(ew);
		return R.ok("查询私教预约成功").put("data", sijiaoyuyueView);
    }
	
    /**
     * 后台详情
     */
    @RequestMapping("/info/{id}")
    public R info(@PathVariable("id") Long id){
        SijiaoyuyueEntity sijiaoyuyue = sijiaoyuyueService.getById(id);
        return R.ok().put("data", sijiaoyuyue);
    }

    /**
     * 前台详情
     */
	@IgnoreAuth
    @RequestMapping("/detail/{id}")
    public R detail(@PathVariable("id") Long id){
        SijiaoyuyueEntity sijiaoyuyue = sijiaoyuyueService.getById(id);
        return R.ok().put("data", sijiaoyuyue);
    }
    



    /**
     * 后台保存
     */
    @RequestMapping("/save")
    public R save(@RequestBody SijiaoyuyueEntity sijiaoyuyue, HttpServletRequest request){
    	//ValidatorUtils.validateEntity(sijiaoyuyue);
        sijiaoyuyueService.save(sijiaoyuyue);
        return R.ok();
    }
    
    /**
     * 前台保存
     */
    @RequestMapping("/add")
    public R add(@RequestBody SijiaoyuyueEntity sijiaoyuyue, HttpServletRequest request){
    	//ValidatorUtils.validateEntity(sijiaoyuyue);
        sijiaoyuyueService.save(sijiaoyuyue);
        return R.ok();
    }




    /**
     * 修改
     */
    @RequestMapping("/update")
    @Transactional
    public R update(@RequestBody SijiaoyuyueEntity sijiaoyuyue, HttpServletRequest request){
        //ValidatorUtils.validateEntity(sijiaoyuyue);
        sijiaoyuyueService.updateById(sijiaoyuyue);//全部更新
        return R.ok();
    }

    /**
     * 审核
     */
    @RequestMapping("/shBatch")
    @Transactional
    public R update(@RequestBody Long[] ids, @RequestParam String sfsh, @RequestParam String shhf){
        List<SijiaoyuyueEntity> list = new ArrayList<SijiaoyuyueEntity>();
        for(Long id : ids) {
            SijiaoyuyueEntity sijiaoyuyue = sijiaoyuyueService.getById(id);
            sijiaoyuyue.setSfsh(sfsh);
            sijiaoyuyue.setShhf(shhf);
            list.add(sijiaoyuyue);
        }
        sijiaoyuyueService.updateBatchById(list);
        return R.ok();
    }


    

    /**
     * 删除
     */
    @RequestMapping("/delete")
    public R delete(@RequestBody Long[] ids){
        sijiaoyuyueService.removeByIds(Arrays.asList(ids));
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
        QueryWrapper<SijiaoyuyueEntity> ew = new QueryWrapper<SijiaoyuyueEntity>();
		String tableName = request.getSession().getAttribute("tableName").toString();
		if(tableName.equals("jianshenjiaolian")) {
            ew.eq("jiaoliangonghao", (String)request.getSession().getAttribute("username"));
		}
		if(tableName.equals("yonghu")) {
            ew.eq("yonghuzhanghao", (String)request.getSession().getAttribute("username"));
		}
        List<Map<String, Object>> result = sijiaoyuyueService.selectValue(params, ew);
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
        QueryWrapper<SijiaoyuyueEntity> ew = new QueryWrapper<SijiaoyuyueEntity>();
        String tableName = request.getSession().getAttribute("tableName").toString();
        if(tableName.equals("jianshenjiaolian")) {
            ew.eq("jiaoliangonghao", (String)request.getSession().getAttribute("username"));
        }
        if(tableName.equals("yonghu")) {
            ew.eq("yonghuzhanghao", (String)request.getSession().getAttribute("username"));
        }
        for(int i=0;i<yColumnNames.length;i++) {
            params.put("yColumn", yColumnNames[i]);
            List<Map<String, Object>> result = sijiaoyuyueService.selectValue(params, ew);
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
        QueryWrapper<SijiaoyuyueEntity> ew = new QueryWrapper<SijiaoyuyueEntity>();
        String tableName = request.getSession().getAttribute("tableName").toString();
        if(tableName.equals("jianshenjiaolian")) {
            ew.eq("jiaoliangonghao", (String)request.getSession().getAttribute("username"));
        }
        if(tableName.equals("yonghu")) {
            ew.eq("yonghuzhanghao", (String)request.getSession().getAttribute("username"));
        }
        List<Map<String, Object>> result = sijiaoyuyueService.selectTimeStatValue(params, ew);
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
        QueryWrapper<SijiaoyuyueEntity> ew = new QueryWrapper<SijiaoyuyueEntity>();
        String tableName = request.getSession().getAttribute("tableName").toString();
        if(tableName.equals("jianshenjiaolian")) {
            ew.eq("jiaoliangonghao", (String)request.getSession().getAttribute("username"));
        }
        if(tableName.equals("yonghu")) {
            ew.eq("yonghuzhanghao", (String)request.getSession().getAttribute("username"));
        }
        for(int i=0;i<yColumnNames.length;i++) {
            params.put("yColumn", yColumnNames[i]);
            List<Map<String, Object>> result = sijiaoyuyueService.selectTimeStatValue(params, ew);
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
        QueryWrapper<SijiaoyuyueEntity> ew = new QueryWrapper<SijiaoyuyueEntity>();
        String tableName = request.getSession().getAttribute("tableName").toString();
        if(tableName.equals("jianshenjiaolian")) {
            ew.eq("jiaoliangonghao", (String)request.getSession().getAttribute("username"));
        }
        if(tableName.equals("yonghu")) {
            ew.eq("yonghuzhanghao", (String)request.getSession().getAttribute("username"));
        }
        List<Map<String, Object>> result = sijiaoyuyueService.selectGroup(params, ew);
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
    public R count(@RequestParam Map<String, Object> params,SijiaoyuyueEntity sijiaoyuyue, HttpServletRequest request){
        String tableName = request.getSession().getAttribute("tableName").toString();
        if(tableName.equals("jianshenjiaolian")) {
            sijiaoyuyue.setJiaoliangonghao((String)request.getSession().getAttribute("username"));
        }
        if(tableName.equals("yonghu")) {
            sijiaoyuyue.setYonghuzhanghao((String)request.getSession().getAttribute("username"));
        }
        QueryWrapper<SijiaoyuyueEntity> ew = new QueryWrapper<SijiaoyuyueEntity>();
        int count = (int) sijiaoyuyueService.count(MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, sijiaoyuyue), params), params));
        return R.ok().put("data", count);
    }

}
