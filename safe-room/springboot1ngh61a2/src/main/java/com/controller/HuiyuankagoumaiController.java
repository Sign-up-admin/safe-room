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
import org.apache.commons.lang3.StringUtils;

import com.entity.HuiyuankagoumaiEntity;
import com.entity.view.HuiyuankagoumaiView;

import com.service.HuiyuankagoumaiService;
import com.service.HuiyuankaService;
import com.service.YonghuService;
import com.service.TokenService;
import com.entity.HuiyuankaEntity;
import com.entity.YonghuEntity;
import com.utils.PageUtils;
import com.utils.R;
import com.utils.MPUtil;
import com.utils.MapUtils;
import com.utils.CommonUtil;
import java.io.IOException;

/**
 * 会员卡购买
 * 后端接口
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
@RestController
@RequestMapping("/huiyuankagoumai")
public class HuiyuankagoumaiController {
    @Autowired
    private HuiyuankagoumaiService huiyuankagoumaiService;
    
    @Autowired
    private HuiyuankaService huiyuankaService;
    
    @Autowired
    private YonghuService yonghuService;




    



    /**
     * 后台列表
     */
    @RequestMapping("/page")
    public R page(@RequestParam Map<String, Object> params,HuiyuankagoumaiEntity huiyuankagoumai,
		HttpServletRequest request){
		String tableName = request.getSession().getAttribute("tableName").toString();
		if(tableName.equals("yonghu")) {
			huiyuankagoumai.setYonghuzhanghao((String)request.getSession().getAttribute("username"));
		}
        QueryWrapper<HuiyuankagoumaiEntity> ew = new QueryWrapper<HuiyuankagoumaiEntity>();

		PageUtils page = huiyuankagoumaiService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, huiyuankagoumai), params), params));

        return R.ok().put("data", page);
    }
    
    /**
     * 前台列表
     */
	@IgnoreAuth
    @RequestMapping("/list")
    public R list(@RequestParam Map<String, Object> params,HuiyuankagoumaiEntity huiyuankagoumai, 
		HttpServletRequest request){
        QueryWrapper<HuiyuankagoumaiEntity> ew = new QueryWrapper<HuiyuankagoumaiEntity>();

		PageUtils page = huiyuankagoumaiService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, huiyuankagoumai), params), params));
        return R.ok().put("data", page);
    }



	/**
     * 列表
     */
    @RequestMapping("/lists")
    public R list( HuiyuankagoumaiEntity huiyuankagoumai){
       	QueryWrapper<HuiyuankagoumaiEntity> ew = new QueryWrapper<HuiyuankagoumaiEntity>();
      	ew.allEq(MPUtil.allEQMapPre( huiyuankagoumai, "huiyuankagoumai")); 
        return R.ok().put("data", huiyuankagoumaiService.selectListView(ew));
    }

	 /**
     * 查询
     */
    @RequestMapping("/query")
    public R query(HuiyuankagoumaiEntity huiyuankagoumai){
        QueryWrapper< HuiyuankagoumaiEntity> ew = new QueryWrapper< HuiyuankagoumaiEntity>();
 		ew.allEq(MPUtil.allEQMapPre( huiyuankagoumai, "huiyuankagoumai")); 
		HuiyuankagoumaiView huiyuankagoumaiView =  huiyuankagoumaiService.selectView(ew);
		return R.ok("查询会员卡购买成功").put("data", huiyuankagoumaiView);
    }
	
    /**
     * 后台详情
     */
    @RequestMapping("/info/{id}")
    public R info(@PathVariable("id") Long id){
        HuiyuankagoumaiEntity huiyuankagoumai = huiyuankagoumaiService.getById(id);
        return R.ok().put("data", huiyuankagoumai);
    }

    /**
     * 前台详情
     */
	@IgnoreAuth
    @RequestMapping("/detail/{id}")
    public R detail(@PathVariable("id") Long id){
        HuiyuankagoumaiEntity huiyuankagoumai = huiyuankagoumaiService.getById(id);
        return R.ok().put("data", huiyuankagoumai);
    }
    



    /**
     * 后台保存
     */
    @RequestMapping("/save")
    public R save(@RequestBody HuiyuankagoumaiEntity huiyuankagoumai, HttpServletRequest request){
    	//ValidatorUtils.validateEntity(huiyuankagoumai);
        huiyuankagoumaiService.save(huiyuankagoumai);
        return R.ok();
    }
    
    /**
     * 前台保存
     */
    @RequestMapping("/add")
    @Transactional
    public R add(@RequestBody HuiyuankagoumaiEntity huiyuankagoumai, HttpServletRequest request){
    	//ValidatorUtils.validateEntity(huiyuankagoumai);
        huiyuankagoumaiService.save(huiyuankagoumai);
        
        // 如果支付状态为已支付，自动更新会员信息
        if("已支付".equals(huiyuankagoumai.getIspay()) && StringUtils.isNotBlank(huiyuankagoumai.getYonghuzhanghao())) {
            // 查询会员卡信息
            HuiyuankaEntity huiyuanka = huiyuankaService.getOne(
                new QueryWrapper<HuiyuankaEntity>().eq("huiyuankamingcheng", huiyuankagoumai.getHuiyuankamingcheng())
            );
            
            if(huiyuanka != null) {
                // 查询会员信息
                YonghuEntity yonghu = yonghuService.getOne(
                    new QueryWrapper<YonghuEntity>().eq("yonghuzhanghao", huiyuankagoumai.getYonghuzhanghao())
                );
                
                if(yonghu != null) {
                    // 更新会员卡号和有效期
                    yonghu.setHuiyuankahao(huiyuankagoumai.getHuiyuankahao());
                    yonghu.setHuiyuankamingcheng(huiyuankagoumai.getHuiyuankamingcheng());
                    
                    // 计算有效期（根据会员卡的youxiaoqi字段）
                    if(StringUtils.isNotBlank(huiyuanka.getYouxiaoqi())) {
                        try {
                            // 解析有效期（如"12个月"、"365天"等）
                            String youxiaoqi = huiyuanka.getYouxiaoqi();
                            Calendar cal = Calendar.getInstance();
                            cal.setTime(new Date());
                            
                            if(youxiaoqi.contains("月")) {
                                int months = Integer.parseInt(youxiaoqi.replaceAll("[^0-9]", ""));
                                cal.add(Calendar.MONTH, months);
                            } else if(youxiaoqi.contains("天")) {
                                int days = Integer.parseInt(youxiaoqi.replaceAll("[^0-9]", ""));
                                cal.add(Calendar.DAY_OF_MONTH, days);
                            } else if(youxiaoqi.contains("年")) {
                                int years = Integer.parseInt(youxiaoqi.replaceAll("[^0-9]", ""));
                                cal.add(Calendar.YEAR, years);
                            }
                            
                            yonghu.setYouxiaoqizhi(cal.getTime());
                        } catch (Exception e) {
                            // 如果解析失败，使用默认值（当前日期+1年）
                            Calendar cal = Calendar.getInstance();
                            cal.setTime(new Date());
                            cal.add(Calendar.YEAR, 1);
                            yonghu.setYouxiaoqizhi(cal.getTime());
                        }
                    }
                    
                    yonghuService.updateById(yonghu);
                }
            }
        }
        
        return R.ok();
    }




    /**
     * 修改
     */
    @RequestMapping("/update")
    @Transactional
    public R update(@RequestBody HuiyuankagoumaiEntity huiyuankagoumai, HttpServletRequest request){
        //ValidatorUtils.validateEntity(huiyuankagoumai);
        
        // 获取更新前的支付状态
        HuiyuankagoumaiEntity oldEntity = huiyuankagoumaiService.getById(huiyuankagoumai.getId());
        String oldIspay = oldEntity != null ? oldEntity.getIspay() : null;
        
        huiyuankagoumaiService.updateById(huiyuankagoumai);//全部更新
        
        // 如果支付状态从未支付变为已支付，自动更新会员信息
        if(!"已支付".equals(oldIspay) && "已支付".equals(huiyuankagoumai.getIspay()) 
           && StringUtils.isNotBlank(huiyuankagoumai.getYonghuzhanghao())) {
            // 查询会员卡信息
            HuiyuankaEntity huiyuanka = huiyuankaService.getOne(
                new QueryWrapper<HuiyuankaEntity>().eq("huiyuankamingcheng", huiyuankagoumai.getHuiyuankamingcheng())
            );
            
            if(huiyuanka != null) {
                // 查询会员信息
                YonghuEntity yonghu = yonghuService.getOne(
                    new QueryWrapper<YonghuEntity>().eq("yonghuzhanghao", huiyuankagoumai.getYonghuzhanghao())
                );
                
                if(yonghu != null) {
                    // 更新会员卡号和有效期
                    yonghu.setHuiyuankahao(huiyuankagoumai.getHuiyuankahao());
                    yonghu.setHuiyuankamingcheng(huiyuankagoumai.getHuiyuankamingcheng());
                    
                    // 计算有效期
                    if(StringUtils.isNotBlank(huiyuanka.getYouxiaoqi())) {
                        try {
                            String youxiaoqi = huiyuanka.getYouxiaoqi();
                            Calendar cal = Calendar.getInstance();
                            cal.setTime(new Date());
                            
                            if(youxiaoqi.contains("月")) {
                                int months = Integer.parseInt(youxiaoqi.replaceAll("[^0-9]", ""));
                                cal.add(Calendar.MONTH, months);
                            } else if(youxiaoqi.contains("天")) {
                                int days = Integer.parseInt(youxiaoqi.replaceAll("[^0-9]", ""));
                                cal.add(Calendar.DAY_OF_MONTH, days);
                            } else if(youxiaoqi.contains("年")) {
                                int years = Integer.parseInt(youxiaoqi.replaceAll("[^0-9]", ""));
                                cal.add(Calendar.YEAR, years);
                            }
                            
                            yonghu.setYouxiaoqizhi(cal.getTime());
                        } catch (Exception e) {
                            Calendar cal = Calendar.getInstance();
                            cal.setTime(new Date());
                            cal.add(Calendar.YEAR, 1);
                            yonghu.setYouxiaoqizhi(cal.getTime());
                        }
                    }
                    
                    yonghuService.updateById(yonghu);
                }
            }
        }
        
        return R.ok();
    }



    

    /**
     * 删除
     */
    @RequestMapping("/delete")
    public R delete(@RequestBody Long[] ids){
        huiyuankagoumaiService.removeByIds(Arrays.asList(ids));
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
        QueryWrapper<HuiyuankagoumaiEntity> ew = new QueryWrapper<HuiyuankagoumaiEntity>();
		String tableName = request.getSession().getAttribute("tableName").toString();
		if(tableName.equals("yonghu")) {
            ew.eq("yonghuzhanghao", (String)request.getSession().getAttribute("username"));
		}
        List<Map<String, Object>> result = huiyuankagoumaiService.selectValue(params, ew);
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
        QueryWrapper<HuiyuankagoumaiEntity> ew = new QueryWrapper<HuiyuankagoumaiEntity>();
        String tableName = request.getSession().getAttribute("tableName").toString();
        if(tableName.equals("yonghu")) {
            ew.eq("yonghuzhanghao", (String)request.getSession().getAttribute("username"));
        }
        for(int i=0;i<yColumnNames.length;i++) {
            params.put("yColumn", yColumnNames[i]);
            List<Map<String, Object>> result = huiyuankagoumaiService.selectValue(params, ew);
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
        QueryWrapper<HuiyuankagoumaiEntity> ew = new QueryWrapper<HuiyuankagoumaiEntity>();
        String tableName = request.getSession().getAttribute("tableName").toString();
        if(tableName.equals("yonghu")) {
            ew.eq("yonghuzhanghao", (String)request.getSession().getAttribute("username"));
        }
        List<Map<String, Object>> result = huiyuankagoumaiService.selectTimeStatValue(params, ew);
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
        QueryWrapper<HuiyuankagoumaiEntity> ew = new QueryWrapper<HuiyuankagoumaiEntity>();
        String tableName = request.getSession().getAttribute("tableName").toString();
        if(tableName.equals("yonghu")) {
            ew.eq("yonghuzhanghao", (String)request.getSession().getAttribute("username"));
        }
        for(int i=0;i<yColumnNames.length;i++) {
            params.put("yColumn", yColumnNames[i]);
            List<Map<String, Object>> result = huiyuankagoumaiService.selectTimeStatValue(params, ew);
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
        QueryWrapper<HuiyuankagoumaiEntity> ew = new QueryWrapper<HuiyuankagoumaiEntity>();
        String tableName = request.getSession().getAttribute("tableName").toString();
        if(tableName.equals("yonghu")) {
            ew.eq("yonghuzhanghao", (String)request.getSession().getAttribute("username"));
        }
        List<Map<String, Object>> result = huiyuankagoumaiService.selectGroup(params, ew);
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
    public R count(@RequestParam Map<String, Object> params,HuiyuankagoumaiEntity huiyuankagoumai, HttpServletRequest request){
        String tableName = request.getSession().getAttribute("tableName").toString();
        if(tableName.equals("yonghu")) {
            huiyuankagoumai.setYonghuzhanghao((String)request.getSession().getAttribute("username"));
        }
        QueryWrapper<HuiyuankagoumaiEntity> ew = new QueryWrapper<HuiyuankagoumaiEntity>();
        int count = (int) huiyuankagoumaiService.count(MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, huiyuankagoumai), params), params));
        return R.ok().put("data", count);
    }



}
