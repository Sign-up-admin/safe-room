package com.controller;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.annotation.IgnoreAuth;
import com.service.CommonService;
import com.utils.MapUtils;
import com.utils.R;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.RuntimeMXBean;
import com.sun.management.OperatingSystemMXBean;
import com.entity.EIException;

/**
 * 通用接口（增强安全：表名和列名白名单）
 */
@RestController
public class CommonController{

    private static final Logger logger = LoggerFactory.getLogger(CommonController.class);
    
    // 允许访问的表名白名单
    private static final Set<String> ALLOWED_TABLES = new HashSet<>(Arrays.asList(
        "yonghu", "jianshenjiaolian", "jianshenkecheng", "kechengyuyue", 
        "kechengtuike", "huiyuanka", "huiyuankagoumai", "huiyuanxufei",
        "jianshenqicai", "news", "newstype", "discussjianshenkecheng",
        "daoqitixing", "chat", "storeup", "config", "users", "token"
    ));
    
    // 允许访问的列名白名单（通用列名）
    private static final Set<String> ALLOWED_COLUMNS = new HashSet<>(Arrays.asList(
        "id", "name", "title", "type", "status", "addtime", "updatetime",
        "username", "yonghuzhanghao", "jiaoliangonghao", "kechengmingcheng",
        "kechengleixing", "jiage", "shoujihaoma", "youxiaoqizhi"
    ));

	private final CommonService commonService;

	@Autowired(required = false)
	private DataSource dataSource;

    public CommonController(CommonService commonService) {
        this.commonService = commonService;
    }
    
	/**
	 * 验证表名和列名是否在白名单中
	 */
	private void validateTableAndColumn(String tableName, String columnName) {
		if (!ALLOWED_TABLES.contains(tableName.toLowerCase())) {
			throw new EIException("不允许访问表: " + tableName);
		}
		if (columnName != null && !ALLOWED_COLUMNS.contains(columnName.toLowerCase()) && 
		    !columnName.toLowerCase().startsWith(tableName.toLowerCase())) {
			// 允许表名前缀的列名，如 yonghuzhanghao 对于 yonghu 表
			throw new EIException("不允许访问列: " + columnName);
		}
	}
	
	/**
	 * 获取table表中的column列表(联动接口)
	 * @param tableName 表名
	 * @param columnName 列名
	 * @param conditionColumn 条件列名
	 * @param conditionValue 条件值
	 * @param level 级别
	 * @param parent 父级
	 * @return 结果
	 */
	@IgnoreAuth
	@RequestMapping("/option/{tableName}/{columnName}")
	public R getOption(@PathVariable("tableName") String tableName, @PathVariable("columnName") String columnName,@RequestParam(required = false) String conditionColumn,@RequestParam(required = false) String conditionValue,String level,String parent) {
		// 验证表名和列名
		validateTableAndColumn(tableName, columnName);
		if (conditionColumn != null) {
			validateTableAndColumn(tableName, conditionColumn);
		}
		
		Map<String, Object> params = new HashMap<>();
		params.put("table", tableName);
		params.put("column", columnName);
		if(StringUtils.isNotBlank(level)) {
			params.put("level", level);
		}
		if(StringUtils.isNotBlank(parent)) {
			params.put("parent", parent);
		}
        if(StringUtils.isNotBlank(conditionColumn)) {
            params.put("conditionColumn", conditionColumn);
        }
        if(StringUtils.isNotBlank(conditionValue)) {
            params.put("conditionValue", conditionValue);
        }
		List<String> data = commonService.getOption(params);
		return R.ok().put("data", data);
	}
	
	/**
	 * 根据table中的column获取单条记录
	 * @param tableName 表名
	 * @param columnName 列名
	 * @param columnValue 列值
	 * @return 结果
	 */
	@IgnoreAuth
	@RequestMapping("/follow/{tableName}/{columnName}")
	public R getFollowByOption(@PathVariable("tableName") String tableName, @PathVariable("columnName") String columnName, @RequestParam String columnValue) {
		// 验证表名和列名
		validateTableAndColumn(tableName, columnName);
		
		Map<String, Object> params = new HashMap<>();
		params.put("table", tableName);
		params.put("column", columnName);
		params.put("columnValue", columnValue);
		Map<String, Object> result = commonService.getFollowByOption(params);
        Object o = null;
        try {
            Class<?> c1 = Class.forName("com.entity."+tableName.substring(0, 1).toUpperCase()+tableName.substring(1)+"Entity");
            o = MapUtils.mapToObject(result, c1);
        } catch (ClassNotFoundException | IllegalAccessException | InstantiationException | NoSuchMethodException | java.lang.reflect.InvocationTargetException e) {
            logger.error("Error converting map to object", e);
        }
        return R.ok().put("data", o);
	}
	
	/**
	 * 修改table表的sfsh状态
	 * @param tableName 表名
	 * @param map 参数
	 * @return 结果
	 */
	@RequestMapping("/sh/{tableName}")
	public R sh(@PathVariable("tableName") String tableName, @RequestBody Map<String, Object> map) {
		// 验证表名
		if (!ALLOWED_TABLES.contains(tableName.toLowerCase())) {
			throw new EIException("不允许访问表: " + tableName);
		}
		
		map.put("table", tableName);
		commonService.sh(map);
		return R.ok();
	}
	
	/**
	 * 获取需要提醒的记录数
	 * @param tableName 表名
	 * @param columnName 列名
	 * @param type 1:数字 2:日期
	 * @param map 参数
	 * @return 结果
	 */
	@IgnoreAuth
	@RequestMapping("/remind/{tableName}/{columnName}/{type}")
	public R remindCount(@PathVariable("tableName") String tableName, @PathVariable("columnName") String columnName, 
						 @PathVariable("type") String type,@RequestParam Map<String, Object> map) {
		// 验证表名和列名
		validateTableAndColumn(tableName, columnName);
		
		map.put("table", tableName);
		map.put("column", columnName);
		map.put("type", type);
		
		if(type.equals("2")) {
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			Calendar c = Calendar.getInstance();
			Date remindStartDate;
			Date remindEndDate;
			if(map.get("remindstart")!=null) {
				int remindStart = Integer.parseInt(map.get("remindstart").toString());
				c.setTime(new Date()); 
				c.add(Calendar.DAY_OF_MONTH,remindStart);
				remindStartDate = c.getTime();
				map.put("remindstart", sdf.format(remindStartDate));
			}
			if(map.get("remindend")!=null) {
				int remindEnd = Integer.parseInt(map.get("remindend").toString());
				c.setTime(new Date());
				c.add(Calendar.DAY_OF_MONTH,remindEnd);
				remindEndDate = c.getTime();
				map.put("remindend", sdf.format(remindEndDate));
			}
		}
		
		int count = commonService.remindCount(map);
		return R.ok().put("count", count);
	}
	
	/**
	 * 单列求和
	 * @param tableName 表名
	 * @param columnName 列名
	 * @return 结果
	 */
	@IgnoreAuth
	@RequestMapping("/cal/{tableName}/{columnName}")
	public R cal(@PathVariable("tableName") String tableName, @PathVariable("columnName") String columnName) {
		// 验证表名和列名
		validateTableAndColumn(tableName, columnName);
		
		Map<String, Object> params = new HashMap<>();
		params.put("table", tableName);
		params.put("column", columnName);
		Map<String, Object> result = commonService.selectCal(params);
		return R.ok().put("data", result);
	}
	
	/**
	 * 分组统计
	 * @param tableName 表名
	 * @param columnName 列名
	 * @return 结果
	 */
	@IgnoreAuth
	@Cacheable(value = "groupStatistics", key = "#tableName + '_' + #columnName")
	@RequestMapping("/group/{tableName}/{columnName}")
	public R group(@PathVariable("tableName") String tableName, @PathVariable("columnName") String columnName) {
		// 验证表名和列名
		validateTableAndColumn(tableName, columnName);
		
		Map<String, Object> params = new HashMap<>();
		params.put("table", tableName);
		params.put("column", columnName);
		List<Map<String, Object>> result = commonService.selectGroup(params);
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
	 * （按值统计）
	 * @param tableName 表名
	 * @param yColumnName Y轴列名
	 * @param xColumnName X轴列名
	 * @return 结果
	 */
	@IgnoreAuth
	@Cacheable(value = "valueStatistics", key = "#tableName + '_' + #xColumnName + '_' + #yColumnName")
	@RequestMapping("/value/{tableName}/{xColumnName}/{yColumnName}")
	public R value(@PathVariable("tableName") String tableName, @PathVariable("yColumnName") String yColumnName, @PathVariable("xColumnName") String xColumnName) {
		// 验证表名和列名
		validateTableAndColumn(tableName, xColumnName);
		validateTableAndColumn(tableName, yColumnName);
		
		Map<String, Object> params = new HashMap<>();
		params.put("table", tableName);
		params.put("xColumn", xColumnName);
		params.put("yColumn", yColumnName);
		List<Map<String, Object>> result = commonService.selectValue(params);
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
 	 * （按值统计）时间统计类型
	 * @param tableName 表名
	 * @param yColumnName Y轴列名
	 * @param xColumnName X轴列名
	 * @param timeStatType 时间统计类型
	 * @return 结果
	 */
	@IgnoreAuth
	@Cacheable(value = "timeStatistics", key = "#tableName + '_' + #xColumnName + '_' + #yColumnName + '_' + #timeStatType")
	@RequestMapping("/value/{tableName}/{xColumnName}/{yColumnName}/{timeStatType}")
	public R valueDay(@PathVariable("tableName") String tableName, @PathVariable("yColumnName") String yColumnName, @PathVariable("xColumnName") String xColumnName, @PathVariable("timeStatType") String timeStatType) {
		// 验证表名和列名
		validateTableAndColumn(tableName, xColumnName);
		validateTableAndColumn(tableName, yColumnName);
		
		Map<String, Object> params = new HashMap<>();
		params.put("table", tableName);
		params.put("xColumn", xColumnName);
		params.put("yColumn", yColumnName);
		params.put("timeStatType", timeStatType);
		List<Map<String, Object>> result = commonService.selectTimeStatValue(params);
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
	 * 服务状态健康检查
	 * @return 服务状态信息
	 */
	@RequestMapping("/service-status")
	public R serviceStatus() {
		Map<String, Object> result = new HashMap<>();
		
		// 服务器状态
		Map<String, Object> server = new HashMap<>();
		try {
			RuntimeMXBean runtimeBean = ManagementFactory.getRuntimeMXBean();
			long uptime = runtimeBean.getUptime();
			long hours = uptime / (1000 * 60 * 60);
			long minutes = (uptime % (1000 * 60 * 60)) / (1000 * 60);
			server.put("uptime", hours + "小时" + minutes + "分钟");
			server.put("status", "healthy");
			
			// CPU使用率
			OperatingSystemMXBean osBean = (OperatingSystemMXBean) ManagementFactory.getOperatingSystemMXBean();
			double cpuUsage = osBean.getProcessCpuLoad() * 100;
			server.put("cpu", Math.round(cpuUsage * 100.0) / 100.0);
			
			// 内存使用率
			MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
			long usedMemory = memoryBean.getHeapMemoryUsage().getUsed();
			long maxMemory = memoryBean.getHeapMemoryUsage().getMax();
			double memoryUsage = (usedMemory * 100.0) / maxMemory;
			server.put("memory", Math.round(memoryUsage * 100.0) / 100.0);
			
			// 磁盘使用率（简化处理）
			server.put("disk", 0);
		} catch (Exception e) {
			logger.error("获取服务器状态失败", e);
			server.put("status", "error");
		}
		result.put("server", server);
		
		// 数据库状态
		Map<String, Object> database = new HashMap<>();
		try {
			if (dataSource != null) {
				try (Connection conn = dataSource.getConnection()) {
					database.put("connected", !conn.isClosed());
					DatabaseMetaData metaData = conn.getMetaData();
					database.put("version", metaData.getDatabaseProductVersion());
					database.put("responseTime", 0); // 简化处理
					database.put("activeConnections", 0); // 简化处理
				}
			} else {
				database.put("connected", false);
			}
		} catch (Exception e) {
			logger.error("获取数据库状态失败", e);
			database.put("connected", false);
		}
		result.put("database", database);
		
		// API状态（简化处理）
		Map<String, Object> api = new HashMap<>();
		api.put("availability", 100);
		api.put("avgResponseTime", 0);
		api.put("todayRequests", 0);
		api.put("errorRate", 0);
		result.put("api", api);
		
		// 缓存状态（简化处理）
		Map<String, Object> cache = new HashMap<>();
		cache.put("connected", true);
		cache.put("hitRate", 0);
		cache.put("size", "0MB");
		cache.put("keys", 0);
		result.put("cache", cache);
		
		// 错误列表（简化处理）
		result.put("errors", new ArrayList<>());
		
		return R.ok().put("data", result);
	}
}
