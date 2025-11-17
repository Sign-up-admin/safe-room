
package com.utils;

import java.util.LinkedHashMap;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;

/**
 * Query Parameters
 */
public class Query<T> extends LinkedHashMap<String, Object> {
	private static final long serialVersionUID = 1L;
    /**
     * mybatis-plus pagination parameters
     */
    private Page<T> page;
    /**
     * current page number
     */
    private int currPage = 1;
    /**
     * number of items per page
     */
    private int limit = 10;

    public Query(JQPageInfo pageInfo) {
    	// Handle null pageInfo
        if(pageInfo != null){
            //pagination parameters
            if(pageInfo.getPage() != null){
                currPage = pageInfo.getPage();
            }
            if(pageInfo.getLimit() != null){
                limit = pageInfo.getLimit();
            }
        }

        //Prevent SQL injection (because sidx and order are sorted by concatenating SQL, there is a risk of SQL injection)
        String sidx = pageInfo != null ? SQLFilter.sqlInject(pageInfo.getSidx()) : null;
        String order = pageInfo != null ? SQLFilter.sqlInject(pageInfo.getOrder()) : null;

        //mybatis-plus pagination
        this.page = new Page<>(currPage, limit);

        //sort
        if(StringUtils.isNotBlank(sidx) && StringUtils.isNotBlank(order)){
            if("ASC".equalsIgnoreCase(order)){
                this.page.addOrder(com.baomidou.mybatisplus.core.metadata.OrderItem.asc(sidx));
            } else {
                this.page.addOrder(com.baomidou.mybatisplus.core.metadata.OrderItem.desc(sidx));
            }
        }
    }
    
    
    public Query(Map<String, Object> params){
        // Handle null params
        if(params != null){
            this.putAll(params);
        }

        //pagination parameters
        if(params != null && params.get("page") != null){
            try {
                String pageStr = params.get("page").toString();
                int parsedPage = Integer.parseInt(pageStr);
                if(parsedPage > 0) {
                    currPage = parsedPage;
                }
            } catch (NumberFormatException e) {
                // Use default value if parsing fails
            }
        }
        if(params != null && params.get("limit") != null){
            try {
                String limitStr = params.get("limit").toString();
                int parsedLimit = Integer.parseInt(limitStr);
                if(parsedLimit > 0) {
                    limit = parsedLimit;
                }
            } catch (NumberFormatException e) {
                // Use default value if parsing fails
            }
        }

        this.put("offset", (currPage - 1) * limit);
        this.put("page", currPage);
        this.put("limit", limit);

        //Prevent SQL injection (because sidx and order are sorted by concatenating SQL, there is a risk of SQL injection)
        String sidx = params != null ? SQLFilter.sqlInject((String)params.get("sidx")) : null;
        String order = params != null ? SQLFilter.sqlInject((String)params.get("order")) : null;
        this.put("sidx", sidx);
        this.put("order", order);

        //mybatis-plus pagination
        this.page = new Page<>(currPage, limit);

        //sort
        if(StringUtils.isNotBlank(sidx) && StringUtils.isNotBlank(order)){
            if("ASC".equalsIgnoreCase(order)){
                this.page.addOrder(com.baomidou.mybatisplus.core.metadata.OrderItem.asc(sidx));
            } else {
                this.page.addOrder(com.baomidou.mybatisplus.core.metadata.OrderItem.desc(sidx));
            }
        }

    }

    public Page<T> getPage() {
        return page;
    }

    public int getCurrPage() {
        return currPage;
    }

    public int getLimit() {
        return limit;
    }
}
