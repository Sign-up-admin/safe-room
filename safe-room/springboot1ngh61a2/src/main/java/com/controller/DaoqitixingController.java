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

import com.entity.DaoqitixingEntity;
import com.entity.view.DaoqitixingView;
import com.entity.MessageEntity;

import com.service.DaoqitixingService;
import com.service.MessageService;
import com.service.TokenService;
import com.service.YonghuService;
import com.utils.PageUtils;
import com.utils.R;
import com.utils.MPUtil;
import com.utils.MapUtils;
import com.utils.CommonUtil;
import java.io.IOException;

/**
 * 到期提醒
 * 后端接口
 * @author 
 * @email 
 * @date 2024-06-20 10:35:09
 */
@RestController
@RequestMapping("/daoqitixing")
public class DaoqitixingController {
    @Autowired
    private DaoqitixingService daoqitixingService;
    @Autowired
    private MessageService messageService;
    @Autowired
    private YonghuService yonghuService;




    



    /**
     * 后台列表
     */
    @RequestMapping("/page")
    public R page(@RequestParam Map<String, Object> params,DaoqitixingEntity daoqitixing,
		HttpServletRequest request){
		String tableName = request.getSession().getAttribute("tableName").toString();
		if(tableName.equals("yonghu")) {
			daoqitixing.setYonghuzhanghao((String)request.getSession().getAttribute("username"));
		}
        QueryWrapper<DaoqitixingEntity> ew = new QueryWrapper<DaoqitixingEntity>();

		PageUtils page = daoqitixingService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, daoqitixing), params), params));

        return R.ok().put("data", page);
    }
    
    /**
     * 前台列表
     */
	@IgnoreAuth
    @RequestMapping("/list")
    public R list(@RequestParam Map<String, Object> params,DaoqitixingEntity daoqitixing, 
		HttpServletRequest request){
        QueryWrapper<DaoqitixingEntity> ew = new QueryWrapper<DaoqitixingEntity>();

		PageUtils page = daoqitixingService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, daoqitixing), params), params));
        return R.ok().put("data", page);
    }



	/**
     * 列表
     */
    @RequestMapping("/lists")
    public R list( DaoqitixingEntity daoqitixing){
       	QueryWrapper<DaoqitixingEntity> ew = new QueryWrapper<DaoqitixingEntity>();
      	ew.allEq(MPUtil.allEQMapPre( daoqitixing, "daoqitixing")); 
        return R.ok().put("data", daoqitixingService.selectListView(ew));
    }

	 /**
     * 查询
     */
    @RequestMapping("/query")
    public R query(DaoqitixingEntity daoqitixing){
        QueryWrapper< DaoqitixingEntity> ew = new QueryWrapper< DaoqitixingEntity>();
 		ew.allEq(MPUtil.allEQMapPre( daoqitixing, "daoqitixing")); 
		DaoqitixingView daoqitixingView =  daoqitixingService.selectView(ew);
		return R.ok("查询到期提醒成功").put("data", daoqitixingView);
    }
	
    /**
     * 后台详情
     */
    @RequestMapping("/info/{id}")
    public R info(@PathVariable("id") Long id){
        DaoqitixingEntity daoqitixing = daoqitixingService.getById(id);
        return R.ok().put("data", daoqitixing);
    }

    /**
     * 前台详情
     */
	@IgnoreAuth
    @RequestMapping("/detail/{id}")
    public R detail(@PathVariable("id") Long id){
        DaoqitixingEntity daoqitixing = daoqitixingService.getById(id);
        return R.ok().put("data", daoqitixing);
    }
    



    /**
     * 后台保存
     */
    @RequestMapping("/save")
    public R save(@RequestBody DaoqitixingEntity daoqitixing, HttpServletRequest request){
    	//ValidatorUtils.validateEntity(daoqitixing);
        daoqitixingService.save(daoqitixing);
        return R.ok();
    }
    
    /**
     * 前台保存
     */
    @RequestMapping("/add")
    public R add(@RequestBody DaoqitixingEntity daoqitixing, HttpServletRequest request){
    	//ValidatorUtils.validateEntity(daoqitixing);
        daoqitixingService.save(daoqitixing);

        // 发送站内消息提醒
        try {
            sendReminderMessage(daoqitixing);
        } catch (Exception e) {
            // 消息发送失败不影响主流程
            System.err.println("发送提醒消息失败: " + e.getMessage());
        }

        return R.ok();
    }





    /**
     * 修改
     */
    @RequestMapping("/update")
    @Transactional
    public R update(@RequestBody DaoqitixingEntity daoqitixing, HttpServletRequest request){
        //ValidatorUtils.validateEntity(daoqitixing);
        daoqitixingService.updateById(daoqitixing);//全部更新
        return R.ok();
    }



    

    /**
     * 删除
     */
    @RequestMapping("/delete")
    public R delete(@RequestBody Long[] ids){
        daoqitixingService.removeByIds(Arrays.asList(ids));
        return R.ok();
    }
    
	




	/**
     * 发送提醒消息到站内消息系统
     */
    private void sendReminderMessage(DaoqitixingEntity daoqitixing) {
        // 查找用户ID
        com.entity.YonghuEntity user = findUserByZhanghao(daoqitixing.getYonghuzhanghao());
        if (user == null) {
            return;
        }

        MessageEntity message = new MessageEntity();
        message.setUserid(user.getId());
        message.setTitle("会员到期提醒");
        message.setContent(String.format("您的会员卡（%s）即将到期，有效期至：%s。请及时续费以享受持续服务。",
            daoqitixing.getHuiyuankahao(),
            daoqitixing.getYouxiaoqizhi() != null ? daoqitixing.getYouxiaoqizhi().toString() : "未知"));
        message.setType("reminder");
        message.setIsread(0);
        message.setRelatedType("daoqitixing");
        message.setRelatedId(daoqitixing.getId());

        messageService.save(message);
    }

    /**
     * 根据账号查找用户
     */
    private com.entity.YonghuEntity findUserByZhanghao(String zhanghao) {
        if (StringUtils.isBlank(zhanghao)) {
            return null;
        }
        QueryWrapper<com.entity.YonghuEntity> qw = new QueryWrapper<>();
        qw.eq("zhanghao", zhanghao);
        return yonghuService.getOne(qw);
    }






}
