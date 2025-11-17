package com.controller;

import java.util.Arrays;
import java.util.Date;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.annotation.IgnoreAuth;
import com.entity.LegalTermsEntity;
import com.service.LegalTermsService;
import com.utils.PageUtils;
import com.utils.R;
import com.utils.MPUtil;

/**
 * Legal Terms
 * Backend API
 * @author 
 * @email 
 * @date 2025-11-15
 */
@RestController
@RequestMapping("/legalterms")
public class LegalTermsController {
    @Autowired
    private LegalTermsService legalTermsService;

    /**
     * Backend list
     */
    @RequestMapping("/page")
    public R page(@RequestParam Map<String, Object> params, LegalTermsEntity legalTerms,
		HttpServletRequest request){
        com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<LegalTermsEntity> ew = new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<LegalTermsEntity>();

		PageUtils page = legalTermsService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, legalTerms), params), params));

        return R.ok().put("data", page);
    }
    
    /**
     * Frontend list
     */
	@IgnoreAuth
    @RequestMapping("/list")
    public R list(@RequestParam Map<String, Object> params, LegalTermsEntity legalTerms, 
		HttpServletRequest request){
        com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<LegalTermsEntity> ew = new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<LegalTermsEntity>();

		PageUtils page = legalTermsService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, legalTerms), params), params));
        return R.ok().put("data", page);
    }

	/**
     * Backend detail
     */
    @RequestMapping("/info/{id}")
    public R info(@PathVariable("id") Long id){
        LegalTermsEntity legalTerms = legalTermsService.getById(id);
        return R.ok().put("data", legalTerms);
    }

    /**
     * Frontend detail
     */
	@IgnoreAuth
    @RequestMapping("/detail/{id}")
    public R detail(@PathVariable("id") Long id){
        LegalTermsEntity legalTerms = legalTermsService.getById(id);
        return R.ok().put("data", legalTerms);
    }
    
    /**
     * Backend save
     */
    @RequestMapping("/save")
    public R save(@RequestBody LegalTermsEntity legalTerms, HttpServletRequest request){
    	if (legalTerms.getCreateTime() == null) {
    		legalTerms.setCreateTime(new Date());
    	}
    	if (legalTerms.getUpdateTime() == null) {
    		legalTerms.setUpdateTime(new Date());
    	}
        legalTermsService.save(legalTerms);
        return R.ok();
    }
    
    /**
     * Frontend save
     */
    @RequestMapping("/add")
    public R add(@RequestBody LegalTermsEntity legalTerms, HttpServletRequest request){
    	if (legalTerms.getCreateTime() == null) {
    		legalTerms.setCreateTime(new Date());
    	}
    	if (legalTerms.getUpdateTime() == null) {
    		legalTerms.setUpdateTime(new Date());
    	}
        legalTermsService.save(legalTerms);
        return R.ok();
    }

    /**
     * Update
     */
    @RequestMapping("/update")
    @Transactional
    public R update(@RequestBody LegalTermsEntity legalTerms, HttpServletRequest request){
    	legalTerms.setUpdateTime(new Date());
        legalTermsService.updateById(legalTerms);
        return R.ok();
    }

    /**
     * Delete
     */
    @RequestMapping("/delete")
    public R delete(@RequestBody Long[] ids){
        legalTermsService.removeByIds(Arrays.asList(ids));
        return R.ok();
    }
}

