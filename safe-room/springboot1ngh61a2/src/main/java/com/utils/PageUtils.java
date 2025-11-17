
package com.utils;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;

/**
 * Pagination Utility Class
 */
public class PageUtils implements Serializable {
	private static final long serialVersionUID = 1L;
	//Total records
	private long total;
	//Records per page
	private int pageSize;
	//Total pages
	private long totalPage;
	//Current page number
	private int currPage;
	//List data
	private List<?> list;
	
	/**
	 * Pagination
	 * @param list        List data
	 * @param totalCount  Total records
	 * @param pageSize    Records per page
	 * @param currPage    Current page number
	 */
	public PageUtils(List<?> list, int totalCount, int pageSize, int currPage) {
		this.list = list;
		this.total = totalCount;
		this.pageSize = pageSize;
		this.currPage = currPage;
		this.totalPage = (int)Math.ceil((double)totalCount/pageSize);
	}

	/**
	 * Pagination
	 */
	public PageUtils(Page<?> page) {
		this.list = page.getRecords();
		this.total = page.getTotal();
		this.pageSize = (int)page.getSize();
		this.currPage = (int)page.getCurrent();
		this.totalPage = page.getPages();
	}
	
	/*
	 * Pagination for empty data
	 */
	public PageUtils(Map<String, Object> params) {
 		Page page =new Query(params).getPage();
		new PageUtils(page);
	}

	 
	public int getPageSize() {
		return pageSize;
	}

	public void setPageSize(int pageSize) {
		this.pageSize = pageSize;
	}

	public int getCurrPage() {
		return currPage;
	}

	public void setCurrPage(int currPage) {
		this.currPage = currPage;
	}

	public List<?> getList() {
		return list;
	}

	public void setList(List<?> list) {
		this.list = list;
	}

	public long getTotalPage() {
		return totalPage;
	}

	public void setTotalPage(long totalPage) {
		this.totalPage = totalPage;
	}

	public long getTotal() {
		return total;
	}

	public void setTotal(long total) {
		this.total = total;
	}
	
}
