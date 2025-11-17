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

import com.entity.MessageEntity;
import com.entity.view.MessageView;

import com.service.MessageService;
import com.service.TokenService;
import com.utils.PageUtils;
import com.utils.R;
import com.utils.MPUtil;
import com.utils.MapUtils;
import com.utils.CommonUtil;
import java.io.IOException;

/**
 * 站内消息
 * 后端接口
 * @author
 * @email
 * @date 2025-11-15 11:00:00
 */
@RestController
@RequestMapping("/messages")
public class MessageController {
    @Autowired
    private MessageService messageService;

    /**
     * 后台列表
     */
    @RequestMapping("/page")
    public R page(@RequestParam Map<String, Object> params,MessageEntity message,
		HttpServletRequest request){
        QueryWrapper<MessageEntity> ew = new QueryWrapper<MessageEntity>();

		PageUtils page = messageService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, message), params), params));

        return R.ok().put("data", page);
    }

    /**
     * 前台列表
     */
	@IgnoreAuth
    @RequestMapping("/list")
    public R list(@RequestParam Map<String, Object> params,MessageEntity message,
		HttpServletRequest request){
        QueryWrapper<MessageEntity> ew = new QueryWrapper<MessageEntity>();

		PageUtils page = messageService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, message), params), params));
        return R.ok().put("data", page);
    }

	/**
     * 列表
     */
    @RequestMapping("/lists")
    public R list( MessageEntity message){
       	QueryWrapper<MessageEntity> ew = new QueryWrapper<MessageEntity>();
      	ew.allEq(MPUtil.allEQMapPre( message, "message"));
        return R.ok().put("data", messageService.selectListView(ew));
    }

	 /**
     * 查询
     */
    @RequestMapping("/query")
    public R query(MessageEntity message){
        QueryWrapper< MessageEntity> ew = new QueryWrapper< MessageEntity>();
 		ew.allEq(MPUtil.allEQMapPre( message, null));
		MessageView messageView =  messageService.selectView(ew);
		return R.ok("查询站内消息成功").put("data", messageView);
    }

    /**
     * 后台详情
     */
    @RequestMapping("/info/{id}")
    public R info(@PathVariable("id") Long id){
        MessageEntity message = messageService.getById(id);
        return R.ok().put("data", message);
    }

    /**
     * 前台详情
     */
	@IgnoreAuth
    @RequestMapping("/detail/{id}")
    public R detail(@PathVariable("id") Long id){
        MessageEntity message = messageService.getById(id);
        return R.ok().put("data", message);
    }

    /**
     * 后台保存
     */
    @RequestMapping("/save")
    public R save(@RequestBody MessageEntity message, HttpServletRequest request){
        if(message.getIsread() == null) {
            message.setIsread(0);
        }
        if(message.getAddtime() == null) {
            message.setAddtime(new Date());
        }
        messageService.save(message);
        return R.ok();
    }

    /**
     * 前台保存
     */
    @RequestMapping("/add")
    public R add(@RequestBody MessageEntity message, HttpServletRequest request){
        if(message.getIsread() == null) {
            message.setIsread(0);
        }
        if(message.getAddtime() == null) {
            message.setAddtime(new Date());
        }
        messageService.save(message);
        return R.ok();
    }

    /**
     * 修改
     */
    @RequestMapping("/update")
    @Transactional
    @IgnoreAuth
    public R update(@RequestBody MessageEntity message, HttpServletRequest request){
        messageService.updateById(message);//全部更新
        return R.ok();
    }

    /**
     * 删除
     */
    @RequestMapping("/delete")
    public R delete(@RequestBody Long[] ids){
        messageService.removeByIds(Arrays.asList(ids));
        return R.ok();
    }

    /**
     * 获取用户未读消息数量
     */
    @RequestMapping("/unreadCount")
    public R unreadCount(HttpServletRequest request){
        Long userId = (Long) request.getSession().getAttribute("userId");
        if(userId == null) {
            return R.error("请先登录");
        }

        QueryWrapper<MessageEntity> ew = new QueryWrapper<MessageEntity>();
        ew.eq("userid", userId);
        ew.eq("isread", 0);

        long count = messageService.count(ew);
        return R.ok().put("count", count);
    }

    /**
     * 标记消息为已读
     */
    @RequestMapping("/markRead")
    public R markRead(@RequestBody Long[] ids, HttpServletRequest request){
        if(ids == null || ids.length == 0) {
            return R.error("消息ID不能为空");
        }

        Long userId = (Long) request.getSession().getAttribute("userId");
        QueryWrapper<MessageEntity> ew = new QueryWrapper<MessageEntity>();
        ew.in("id", Arrays.asList(ids));
        ew.eq("userid", userId);

        MessageEntity updateEntity = new MessageEntity();
        updateEntity.setIsread(1);

        messageService.update(updateEntity, ew);
        return R.ok();
    }

    /**
     * 发送提醒消息 (用于到期提醒联动)
     */
    @RequestMapping("/sendReminder")
    public R sendReminder(@RequestBody Map<String, Object> params, HttpServletRequest request){
        Long userId = params.get("userId") != null ? Long.valueOf(params.get("userId").toString()) : null;
        String title = (String) params.get("title");
        String content = (String) params.get("content");
        String relatedType = (String) params.get("relatedType");
        Long relatedId = params.get("relatedId") != null ? Long.valueOf(params.get("relatedId").toString()) : null;

        if(userId == null || StringUtils.isBlank(title) || StringUtils.isBlank(content)) {
            return R.error("参数不完整");
        }

        MessageEntity message = new MessageEntity();
        message.setUserid(userId);
        message.setTitle(title);
        message.setContent(content);
        message.setType("reminder");
        message.setIsread(0);
        message.setRelatedType(relatedType);
        message.setRelatedId(relatedId);
        message.setAddtime(new Date());

        messageService.save(message);
        return R.ok();
    }

    /**
     * 前台智能排序
     */
	@IgnoreAuth
    @RequestMapping("/autoSort")
    public R autoSort(@RequestParam Map<String, Object> params,MessageEntity message, HttpServletRequest request,String pre){
        QueryWrapper<MessageEntity> ew = new QueryWrapper<MessageEntity>();
        ew.orderByDesc("addtime");
		PageUtils page = messageService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, message), params), params));
        return R.ok().put("data", page);
    }
}
