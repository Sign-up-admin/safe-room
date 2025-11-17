package com.service;

import java.io.InputStream;
import java.util.List;

/**
 * MinIO服务接口
 */
public interface MinioService {

    /**
     * 上传文件到MinIO
     *
     * @param objectName 对象名称（文件路径）
     * @param inputStream 文件输入流
     * @param contentType 文件类型
     * @param size 文件大小
     * @return 文件路径
     * @throws Exception 上传异常
     */
    String uploadFile(String objectName, InputStream inputStream, String contentType, long size) throws Exception;

    /**
     * 获取文件访问URL（预签名URL）
     *
     * @param objectName 对象名称
     * @return 文件访问URL
     * @throws Exception 获取URL异常
     */
    String getFileUrl(String objectName) throws Exception;

    /**
     * 获取预签名URL（带过期时间）
     *
     * @param objectName 对象名称
     * @param expirySeconds 过期时间（秒）
     * @return 预签名URL
     * @throws Exception 生成URL异常
     */
    String getPresignedUrl(String objectName, int expirySeconds) throws Exception;

    /**
     * 删除文件
     *
     * @param objectName 对象名称
     * @throws Exception 删除异常
     */
    void deleteFile(String objectName) throws Exception;

    /**
     * 检查文件是否存在
     *
     * @param objectName 对象名称
     * @return 是否存在
     * @throws Exception 检查异常
     */
    boolean fileExists(String objectName) throws Exception;

    /**
     * 获取文件输入流
     *
     * @param objectName 对象名称
     * @return 文件输入流
     * @throws Exception 获取异常
     */
    InputStream getFileInputStream(String objectName) throws Exception;

    /**
     * 列出指定前缀的文件
     *
     * @param prefix 前缀
     * @return 文件列表
     * @throws Exception 列出异常
     */
    List<String> listFiles(String prefix) throws Exception;

    /**
     * 获取文件大小
     *
     * @param objectName 对象名称
     * @return 文件大小（字节）
     * @throws Exception 获取异常
     */
    long getFileSize(String objectName) throws Exception;

    /**
     * 获取文件类型
     *
     * @param objectName 对象名称
     * @return 文件类型
     * @throws Exception 获取异常
     */
    String getFileContentType(String objectName) throws Exception;
}

