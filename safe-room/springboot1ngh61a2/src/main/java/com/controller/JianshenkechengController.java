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
import org.springframework.cache.annotation.CacheEvict;
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
import com.utils.UserBasedCollaborativeFiltering;
import com.service.KechengyuyueService;
import com.entity.KechengyuyueEntity;

import com.entity.JianshenkechengEntity;
import com.entity.view.JianshenkechengView;

import com.service.JianshenkechengService;
import com.service.TokenService;
import com.utils.PageUtils;
import com.utils.R;
import com.utils.MPUtil;
import com.utils.MapUtils;
import com.utils.CommonUtil;
import java.io.IOException;
import com.service.StoreupService;
import com.entity.StoreupEntity;
import com.service.DiscussjianshenkechengService;
import com.entity.DiscussjianshenkechengEntity;
import com.service.CommonService;

/**
 * 健身课程
 * 后端接口
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
@RestController
@RequestMapping("/jianshenkecheng")
public class JianshenkechengController {
    @Autowired
    private JianshenkechengService jianshenkechengService;

    @Autowired
    private StoreupService storeupService;


    @Autowired
    private KechengyuyueService kechengyuyueService;

    @Autowired
    private DiscussjianshenkechengService discussjianshenkechengService;
    
    @Autowired(required = false)
    private CommonService commonService;
    



    /**
     * 后台列表
     */
    @RequestMapping("/page")
    public R page(@RequestParam Map<String, Object> params,JianshenkechengEntity jianshenkecheng,
		HttpServletRequest request){
		String tableName = request.getSession().getAttribute("tableName").toString();
		if(tableName.equals("jianshenjiaolian")) {
			jianshenkecheng.setJiaoliangonghao((String)request.getSession().getAttribute("username"));
		}
        QueryWrapper<JianshenkechengEntity> ew = new QueryWrapper<JianshenkechengEntity>();

		PageUtils page = jianshenkechengService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, jianshenkecheng), params), params));

        return R.ok().put("data", page);
    }
    
    /**
     * 前台列表
     */
	@IgnoreAuth
    @RequestMapping("/list")
    public R list(@RequestParam Map<String, Object> params,JianshenkechengEntity jianshenkecheng, 
		HttpServletRequest request){
        QueryWrapper<JianshenkechengEntity> ew = new QueryWrapper<JianshenkechengEntity>();

		PageUtils page = jianshenkechengService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, jianshenkecheng), params), params));
        return R.ok().put("data", page);
    }



	/**
     * 列表
     */
    @RequestMapping("/lists")
    public R list( JianshenkechengEntity jianshenkecheng){
       	QueryWrapper<JianshenkechengEntity> ew = new QueryWrapper<JianshenkechengEntity>();
      	ew.allEq(MPUtil.allEQMapPre( jianshenkecheng, "jianshenkecheng")); 
        return R.ok().put("data", jianshenkechengService.selectListView(ew));
    }

	 /**
     * 查询
     */
    @RequestMapping("/query")
    public R query(JianshenkechengEntity jianshenkecheng){
        QueryWrapper< JianshenkechengEntity> ew = new QueryWrapper< JianshenkechengEntity>();
 		ew.allEq(MPUtil.allEQMapPre( jianshenkecheng, "jianshenkecheng")); 
		JianshenkechengView jianshenkechengView =  jianshenkechengService.selectView(ew);
		return R.ok("查询健身课程成功").put("data", jianshenkechengView);
    }
	
    /**
     * 后台详情
     */
    @RequestMapping("/info/{id}")
    public R info(@PathVariable("id") Long id){
        JianshenkechengEntity jianshenkecheng = jianshenkechengService.getById(id);
		jianshenkecheng.setClicknum(jianshenkecheng.getClicknum()+1);
		jianshenkechengService.updateById(jianshenkecheng);
        jianshenkecheng = jianshenkechengService.selectView(new QueryWrapper<JianshenkechengEntity>().eq("id", id));
        return R.ok().put("data", jianshenkecheng);
    }

    /**
     * 前台详情
     */
	@IgnoreAuth
    @RequestMapping("/detail/{id}")
    public R detail(@PathVariable("id") Long id){
        JianshenkechengEntity jianshenkecheng = jianshenkechengService.getById(id);
		jianshenkecheng.setClicknum(jianshenkecheng.getClicknum()+1);
		jianshenkechengService.updateById(jianshenkecheng);
        jianshenkecheng = jianshenkechengService.selectView(new QueryWrapper<JianshenkechengEntity>().eq("id", id));
        return R.ok().put("data", jianshenkecheng);
    }
    



    /**
     * 后台保存
     */
    @CacheEvict(value = {"groupStatistics", "valueStatistics", "timeStatistics"}, allEntries = true)
    @RequestMapping("/save")
    public R save(@RequestBody JianshenkechengEntity jianshenkecheng, HttpServletRequest request){
    	//ValidatorUtils.validateEntity(jianshenkecheng);
        jianshenkechengService.save(jianshenkecheng);
        return R.ok();
    }
    
    /**
     * 前台保存
     */
    @CacheEvict(value = {"groupStatistics", "valueStatistics", "timeStatistics"}, allEntries = true)
    @RequestMapping("/add")
    public R add(@RequestBody JianshenkechengEntity jianshenkecheng, HttpServletRequest request){
    	//ValidatorUtils.validateEntity(jianshenkecheng);
        jianshenkechengService.save(jianshenkecheng);
        return R.ok();
    }





    /**
     * 修改
     */
    @CacheEvict(value = {"groupStatistics", "valueStatistics", "timeStatistics"}, allEntries = true)
    @RequestMapping("/update")
    @Transactional
    public R update(@RequestBody JianshenkechengEntity jianshenkecheng, HttpServletRequest request){
        //ValidatorUtils.validateEntity(jianshenkecheng);
        jianshenkechengService.updateById(jianshenkecheng);//全部更新
        return R.ok();
    }



    

    /**
     * 删除
     */
    @CacheEvict(value = {"groupStatistics", "valueStatistics", "timeStatistics"}, allEntries = true)
    @RequestMapping("/delete")
    public R delete(@RequestBody Long[] ids){
        jianshenkechengService.removeByIds(Arrays.asList(ids));
        return R.ok();
    }
    
	
	/**
     * 前台智能排序
     */
	@IgnoreAuth
    @RequestMapping("/autoSort")
    public R autoSort(@RequestParam Map<String, Object> params,JianshenkechengEntity jianshenkecheng, HttpServletRequest request,String pre){
        QueryWrapper<JianshenkechengEntity> ew = new QueryWrapper<JianshenkechengEntity>();
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
		params.put("sort", "clicknum");
        params.put("order", "desc");
		PageUtils page = jianshenkechengService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, jianshenkecheng), params), params));
        return R.ok().put("data", page);
    }


    /**
     * 协同算法（基于用户收藏的协同算法�?
     */
    @RequestMapping("/autoSort2")
    public R autoSort2(@RequestParam Map<String, Object> params,JianshenkechengEntity jianshenkecheng, HttpServletRequest request){
        Object userIdObj = request.getSession().getAttribute("userId");
        if (userIdObj == null) {
            return R.error(401, "请先登录");
        }
        String userId = userIdObj.toString();
        Integer limit = params.get("limit")==null?10:Integer.parseInt(params.get("limit").toString());
        List<StoreupEntity> storeups = storeupService.list(new QueryWrapper<StoreupEntity>().eq("type", "1").eq("tablename", "jianshenkecheng"));
        Map<String, Map<String, Double>> ratings = new HashMap<>();
        if(storeups!=null && storeups.size()>0) {
            for(StoreupEntity storeup : storeups) {
                Map<String, Double> userRatings = null;
                if(ratings.containsKey(storeup.getUserid().toString())) {
                    userRatings = ratings.get(storeup.getUserid().toString());
                } else {
                    userRatings = new HashMap<>();
                    ratings.put(storeup.getUserid().toString(), userRatings);
                }

                if(userRatings.containsKey(storeup.getRefid().toString())) {
                    userRatings.put(storeup.getRefid().toString(), userRatings.get(storeup.getRefid().toString())+1.0);
                } else {
                    userRatings.put(storeup.getRefid().toString(), 1.0);
                }
            }
        }
        // 创建协同过滤对象
        UserBasedCollaborativeFiltering filter = new UserBasedCollaborativeFiltering(ratings);

        // 为指定用户推荐物�?
        String targetUser = userId;
        int numRecommendations = limit;
        List<String> recommendations = filter.recommendItems(targetUser, numRecommendations);

        // 输出推荐结果
        System.out.println("Recommendations for " + targetUser + ":");
        for (String item : recommendations) {
            System.out.println(item);
        }

        QueryWrapper<JianshenkechengEntity> ew = new QueryWrapper<JianshenkechengEntity>();
        // 将字符串列表转换为 Long 列表以匹配数据库的 bigint 类型
        List<Long> recommendationIds = new ArrayList<>();
        if(recommendations!=null && recommendations.size()>0) {
            for(String recId : recommendations) {
                try {
                    recommendationIds.add(Long.parseLong(recId));
                } catch(NumberFormatException e) {
                    // 忽略无法解析的 ID
                    System.out.println("无法解析推荐ID: " + recId);
                }
            }
        }

        // 添加调试日志
        System.out.println("协同过滤推荐结果数量: " + recommendations.size());
        System.out.println("转换后的推荐ID列表: " + recommendationIds);
        
        if(recommendationIds.size() > 0) {
            // 确保所有 ID 都是有效的 Long 类型
            List<Long> validIds = recommendationIds.stream()
                .filter(id -> id != null && id > 0)
                .distinct()
                .collect(java.util.stream.Collectors.toList());

            if(validIds.size() > 0) {
                ew.in("id", validIds);
                // PostgreSQL 使用 CASE WHEN 来保持推荐顺序，而不是 MySQL 的 FIELD 函数
                StringBuilder orderBy = new StringBuilder("ORDER BY CASE id ");
                for(int i = 0; i < validIds.size(); i++) {
                    orderBy.append("WHEN ").append(validIds.get(i)).append(" THEN ").append(i).append(" ");
                }
                orderBy.append("ELSE ").append(validIds.size()).append(" END");
                ew.last(orderBy.toString());
            } else {
                // 如果没有有效的推荐结果，返回空列表
                ew.apply("1 = 0");
            }
        } else {
            // 如果没有推荐结果，返回空列表
            ew.apply("1 = 0"); // 添加一个永远为 false 的条件
        }

        PageUtils page = jianshenkechengService.queryPage(params, ew);
        // 创建一个新的可修改的列表，避免 UnsupportedOperationException
        @SuppressWarnings("unchecked")
        List<JianshenkechengEntity> pageList = new ArrayList<>((List<JianshenkechengEntity>)page.getList());
        if(pageList.size()<limit) {
            int toAddNum = limit-pageList.size();
            ew = new QueryWrapper<JianshenkechengEntity>();
            // 使用过滤后的有效 ID 列表
            List<Long> validIds = recommendationIds.stream()
                .filter(id -> id != null && id > 0)
                .distinct()
                .collect(java.util.stream.Collectors.toList());
            if(validIds.size() > 0) {
                ew.notIn("id", validIds);
            }
            ew.orderByDesc("id");
            ew.last("limit "+toAddNum);
            pageList.addAll(jianshenkechengService.list(ew));
        } else if(pageList.size()>limit) {
            pageList = pageList.subList(0, limit);
        }
        page.setList(pageList);

        return R.ok().put("data", page);
    }




    /**
     * （按值统计）
     */
    @RequestMapping("/value/{xColumnName}/{yColumnName}")
    public R value(@PathVariable("yColumnName") String yColumnName, @PathVariable("xColumnName") String xColumnName,HttpServletRequest request) {
        Map<String, Object> params = new HashMap<String, Object>();
        params.put("xColumn", xColumnName);
        params.put("yColumn", yColumnName);
        QueryWrapper<JianshenkechengEntity> ew = new QueryWrapper<JianshenkechengEntity>();
		String tableName = request.getSession().getAttribute("tableName").toString();
		if(tableName.equals("jianshenjiaolian")) {
            ew.eq("jiaoliangonghao", (String)request.getSession().getAttribute("username"));
		}
        List<Map<String, Object>> result = jianshenkechengService.selectValue(params, ew);
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
        QueryWrapper<JianshenkechengEntity> ew = new QueryWrapper<JianshenkechengEntity>();
        String tableName = request.getSession().getAttribute("tableName").toString();
        if(tableName.equals("jianshenjiaolian")) {
            ew.eq("jiaoliangonghao", (String)request.getSession().getAttribute("username"));
        }
        for(int i=0;i<yColumnNames.length;i++) {
            params.put("yColumn", yColumnNames[i]);
            List<Map<String, Object>> result = jianshenkechengService.selectValue(params, ew);
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
        QueryWrapper<JianshenkechengEntity> ew = new QueryWrapper<JianshenkechengEntity>();
        String tableName = request.getSession().getAttribute("tableName").toString();
        if(tableName.equals("jianshenjiaolian")) {
            ew.eq("jiaoliangonghao", (String)request.getSession().getAttribute("username"));
        }
        List<Map<String, Object>> result = jianshenkechengService.selectTimeStatValue(params, ew);
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
        QueryWrapper<JianshenkechengEntity> ew = new QueryWrapper<JianshenkechengEntity>();
        String tableName = request.getSession().getAttribute("tableName").toString();
        if(tableName.equals("jianshenjiaolian")) {
            ew.eq("jiaoliangonghao", (String)request.getSession().getAttribute("username"));
        }
        for(int i=0;i<yColumnNames.length;i++) {
            params.put("yColumn", yColumnNames[i]);
            List<Map<String, Object>> result = jianshenkechengService.selectTimeStatValue(params, ew);
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
        QueryWrapper<JianshenkechengEntity> ew = new QueryWrapper<JianshenkechengEntity>();
        String tableName = request.getSession().getAttribute("tableName").toString();
        if(tableName.equals("jianshenjiaolian")) {
            ew.eq("jiaoliangonghao", (String)request.getSession().getAttribute("username"));
        }
        List<Map<String, Object>> result = jianshenkechengService.selectGroup(params, ew);
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
    public R count(@RequestParam Map<String, Object> params,JianshenkechengEntity jianshenkecheng, HttpServletRequest request){
        String tableName = request.getSession().getAttribute("tableName").toString();
        if(tableName.equals("jianshenjiaolian")) {
            jianshenkecheng.setJiaoliangonghao((String)request.getSession().getAttribute("username"));
        }
        QueryWrapper<JianshenkechengEntity> ew = new QueryWrapper<JianshenkechengEntity>();
        int count = (int) jianshenkechengService.count(MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, jianshenkecheng), params), params));
        return R.ok().put("data", count);
    }

    /**
     * 统计查询
     */
    @RequestMapping("/statistics")
    public R statistics(@RequestParam(required = false) String startDate, 
                       @RequestParam(required = false) String endDate,
                       HttpServletRequest request) {
        Map<String, Object> result = new HashMap<>();
        
        QueryWrapper<JianshenkechengEntity> ew = new QueryWrapper<>();
        String tableName = request.getSession().getAttribute("tableName").toString();
        if(tableName.equals("jianshenjiaolian")) {
            ew.eq("jiaoliangonghao", (String)request.getSession().getAttribute("username"));
        }
        
        // 日期范围过滤
        if (StringUtils.isNotBlank(startDate) && StringUtils.isNotBlank(endDate)) {
            try {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                Date start = sdf.parse(startDate);
                Date end = sdf.parse(endDate);
                ew.between("addtime", start, end);
            } catch (ParseException e) {
                return R.error(400, "日期格式错误，请使用yyyy-MM-dd格式");
            }
        }
        
        // 总课程数
        long totalCount = jianshenkechengService.count(ew);
        result.put("totalCount", totalCount);
        
        // 按类型分组统计
        Map<String, Object> groupParams = new HashMap<>();
        groupParams.put("column", "kechengleixing");
        List<Map<String, Object>> typeStats = jianshenkechengService.selectGroup(groupParams, ew);
        result.put("typeStatistics", typeStats);
        
        return R.ok().put("data", result);
    }

    /**
     * 查询课程评分
     */
    @RequestMapping("/ratings/{id}")
    public R ratings(@PathVariable("id") Long id) {
        QueryWrapper<DiscussjianshenkechengEntity> ew = new QueryWrapper<>();
        ew.eq("refid", id);
        ew.orderByDesc("addtime");
        List<DiscussjianshenkechengEntity> ratings = discussjianshenkechengService.list(ew);
        return R.ok().put("data", ratings);
    }

    /**
     * 查询教练提醒
     */
    @RequestMapping("/remind/jiaolianid/{id}")
    public R remindByJiaolianId(@PathVariable("id") Long jiaolianid,
                                @RequestParam(required = false) Integer page,
                                @RequestParam(required = false) Integer limit,
                                HttpServletRequest request) {
        QueryWrapper<JianshenkechengEntity> ew = new QueryWrapper<>();
        ew.eq("jiaoliangonghao", jiaolianid.toString());
        
        // 查询即将开始的课程（未来7天内）
        Calendar cal = Calendar.getInstance();
        Date now = new Date();
        cal.setTime(now);
        cal.add(Calendar.DAY_OF_MONTH, 7);
        Date futureDate = cal.getTime();
        ew.ge("shangkeshijian", now);
        ew.le("shangkeshijian", futureDate);
        ew.orderByAsc("shangkeshijian");
        
        if (page != null && limit != null) {
            Map<String, Object> params = new HashMap<>();
            params.put("page", page.toString());
            params.put("limit", limit.toString());
            PageUtils pageResult = jianshenkechengService.queryPage(params, ew);
            return R.ok().put("data", pageResult.getList());
        } else {
            List<JianshenkechengEntity> list = jianshenkechengService.list(ew);
            return R.ok().put("data", list);
        }
    }

    /**
     * 取消收藏
     */
    @RequestMapping("/cancelCollect")
    public R cancelCollect(@RequestBody Map<String, Object> data, HttpServletRequest request) {
        Object userIdObj = request.getSession().getAttribute("userId");
        if (userIdObj == null) {
            return R.error(401, "请先登录");
        }
        
        Long userid = Long.parseLong(userIdObj.toString());
        Long kechengid = null;
        if (data.get("kechengid") != null) {
            kechengid = Long.parseLong(data.get("kechengid").toString());
        } else if (data.get("userid") != null) {
            userid = Long.parseLong(data.get("userid").toString());
        }
        
        if (kechengid == null) {
            return R.error(400, "课程ID不能为空");
        }
        
        QueryWrapper<StoreupEntity> ew = new QueryWrapper<>();
        ew.eq("userid", userid);
        ew.eq("refid", kechengid);
        ew.eq("tablename", "jianshenkecheng");
        ew.eq("type", "1");
        
        boolean removed = storeupService.remove(ew);
        if (removed) {
            return R.ok("取消收藏成功");
        } else {
            return R.error(404, "未找到收藏记录");
        }
    }

    /**
     * 取消预约
     */
    @RequestMapping("/cancelReservation")
    public R cancelReservation(@RequestBody Map<String, Object> data, HttpServletRequest request) {
        Object userIdObj = request.getSession().getAttribute("userId");
        if (userIdObj == null) {
            return R.error(401, "请先登录");
        }
        
        Long userid = Long.parseLong(userIdObj.toString());
        Long kechengid = null;
        if (data.get("kechengid") != null) {
            kechengid = Long.parseLong(data.get("kechengid").toString());
        } else if (data.get("userid") != null) {
            userid = Long.parseLong(data.get("userid").toString());
        }
        
        if (kechengid == null) {
            return R.error(400, "课程ID不能为空");
        }
        
        QueryWrapper<KechengyuyueEntity> ew = new QueryWrapper<>();
        ew.eq("crossuserid", userid);
        ew.eq("crossrefid", kechengid);
        ew.eq("ispay", "已支付");
        
        KechengyuyueEntity reservation = kechengyuyueService.getOne(ew);
        if (reservation == null) {
            return R.error(404, "未找到预约记录");
        }
        
        // 更新预约状态为已取消
        reservation.setIspay("已取消");
        kechengyuyueService.updateById(reservation);
        
        return R.ok("取消预约成功");
    }

}
