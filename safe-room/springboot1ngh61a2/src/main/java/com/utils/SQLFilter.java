package com.utils;

import org.apache.commons.lang3.StringUtils;

/**
 * SQL Injection Filter
 */
public class SQLFilter {
    
    /**
     * SQL Injection Filter
     * @param str  String to be verified
     */
    public static String sqlInject(String str){
        if(StringUtils.isBlank(str)){
            return null;
        }
        //Remove '|"|;|\ characters
        str = StringUtils.replace(str, "'", "");
        str = StringUtils.replace(str, "\"", "");
        str = StringUtils.replace(str, ";", "");
        str = StringUtils.replace(str, "\\", "");

        //Convert to lowercase
        str = str.toLowerCase();

        //Illegal characters
        String[] keywords = {"master", "truncate", "insert", "select", "delete", "update", "declare", "alter", "drop", "exec", "execute"};

        //Check if it contains illegal characters
        for(String keyword : keywords){
            if(str.indexOf(keyword) != -1){
                throw new RuntimeException("Contains illegal characters");
            }
        }

        return str;
    }
}

