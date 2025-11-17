package com.entity;

import java.io.Serializable;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.IdType;

/**
* Class description:
*/
@TableName("config")
public class ConfigEntity implements Serializable{
private static final long serialVersionUID = 1L;

	@TableId(type = IdType.AUTO)
	private Long id;

	/**
	 * key
	 */
	private String name;

	/**
	 * value
	 */
	@TableField("config_value")
	private String configValue;

    /**
     * url
     */
    private String url;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getConfigValue() {
		return configValue;
	}

	public void setConfigValue(String configValue) {
		this.configValue = configValue;
	}

	// Backward compatibility getter/setter for 'value' field
	public String getValue() {
		return configValue;
	}

	public void setValue(String value) {
		this.configValue = value;
	}

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }
	
}
